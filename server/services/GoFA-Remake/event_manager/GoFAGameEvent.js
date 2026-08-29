//@ts-check

const { randomUUID } = require("node:crypto");
const path = require("node:path");
/** @type {import("./IGoFAEvent").TypeIGoFAEvent} 事件基类构造器（类型体操：require 的 path.resolve 形式 tsc 无法静态解析，显式标注构造器类型使 extends 获得完整基类类型） */
const IGoFAEvent = require(path.resolve(__dirname, "./IGoFAEvent"));

/**
 * @module GoFAGameEvent
 * @description 领域事件实现模块：继承 IGoFAEvent，落地业务字段
 *  type/taskId/payload/id/createdAt/dueTick/priority。
 *  事件请求结构由 GoFAGameEventReq 定义；createdAt/dueTick/priority 由 EventBus
 *  在发布时盖戳/计算，构造时保持 null。
 *  Domain event implementation: extends IGoFAEvent and carries the business fields
 *  type/taskId/payload/id/createdAt/dueTick/priority. The request shape is defined by
 *  GoFAGameEventReq; createdAt/dueTick/priority are stamped/computed by EventBus at
 *  publish time and stay null at construction.
 */

/**
 * 事件请求（构造入参）  Event construction request
 * @typedef {object} GoFAGameEventReq
 * @property {string} type - 事件类型（对应 ENUMGoFAGameEvents 的值）  Event type (one of ENUMGoFAGameEvents values)
 * @property {string} [taskId] - 命令-结果关联 id  Command-result correlation id
 * @property {object} [payload] - 事件载荷（单对象）  Event payload (single object)
 * @property {import("./IGoFAEvent").TimeElapse} [timeElapse] - 延时调度参数（提供则构造为延时事件）  Delay spec (presence makes the event delayed)
 */

/**
 * @class GoFAGameEvent
 * @implements {InstanceType<typeof IGoFAEvent>}
 * @description 领域事件：落地 type/taskId/payload/id/createdAt/dueTick/priority 字段。
 *  带 timeElapse 构造为延时事件，否则为即时事件。
 *  Domain event: carries type/taskId/payload/id/createdAt/dueTick/priority.
 *  Constructed with timeElapse it becomes delayed; otherwise it is instant.
 */
class GoFAGameEvent extends IGoFAEvent {
    /**
     * @param {GoFAGameEventReq} gameEventReq - 事件请求  Event request
     */
    constructor(gameEventReq) {
        const {
            type,
            taskId = null,
            payload = null,
            timeElapse = null,
        } = gameEventReq ?? {};
        if (typeof type !== "string" || type.length === 0) {
            throw new Error("GoFAGameEvent requires a non-empty string 'type'");
        }
        // 有 timeElapse 则为延时事件  delayed if timeElapse provided
        super(timeElapse ? false : true, timeElapse, payload);
        /** @type {string} type - 事件类型（ENUMGoFAGameEvents 的值）  Event type */
        this.type = type;
        /** @type {string|null} taskId - 命令-结果关联 id  Command-result correlation id */
        this.taskId = taskId;
        /** @type {object|null} payload - 事件载荷（单对象）  Event payload */
        this.payload = payload;
        /** @type {string} id - 事件唯一 id（UUID v4）  Unique event id */
        this.id = randomUUID();
        /** @type {number|null} createdAt - 创建 tick（发布时由 EventBus 盖戳）  Creation tick (stamped by EventBus at publish) */
        this.createdAt = null;
        /** @type {number|null} dueTick - 到期 tick（发布时由 EventBus 计算）  Due tick (computed by EventBus at publish) */
        this.dueTick = null;
        /** @type {number|null} priority - 调度优先级（默认 = dueTick）  Scheduling priority (defaults to dueTick) */
        this.priority = null;
    }
}

module.exports = GoFAGameEvent;

if (require.main === module) {
    const assert = require("node:assert");
    const instant = new GoFAGameEvent({ type: "server_ready", taskId: "t1" });
    assert.ok(instant.isInstantEvent());
    assert.strictEqual(instant.type, "server_ready");
    assert.strictEqual(instant.taskId, "t1");
    const delayed = new GoFAGameEvent({
        type: "server_shutdown",
        timeElapse: { startTick: null, length: 10 },
    });
    assert.ok(!delayed.isInstantEvent());
    assert.strictEqual(delayed.schedule.dueTick(5), 15);
    console.log("GoFAGameEvent self-test passed.");
}
