//@ts-check

const { randomUUID } = require("node:crypto");
const path = require("node:path");
const IGoFAEvent = require(path.resolve(__dirname, "./IGoFAEvent"));

/**
 * @typedef GoFAGameEventReq
 * @property {string} type - 事件类型（ENUMGoFAGameEvents 的 key）
 * @property {string} [taskId] - 命令-结果关联 id
 * @property {object} [payload] - 事件载荷（单对象）
 * @property {import("./IGoFAEvent").TimeElapse} [timeElapse] - 延时调度
 */

/**
 * @class GoFAGameEvent
 * @implements {IGoFAEvent}
 * @description 领域事件：落地 type/taskId/payload/id/createdAt/dueTick/priority 字段。
 */
class GoFAGameEvent extends IGoFAEvent {
    /**
     * @param {GoFAGameEventReq} gameEventReq - 事件请求
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
        this.type = type;
        this.taskId = taskId;
        this.payload = payload;
        this.id = randomUUID();
        /** @type {number|null} 创建 tick（发布时由 EventBus 盖戳） */
        this.createdAt = null;
        /** @type {number|null} 到期 tick（发布时由 EventBus 计算） */
        this.dueTick = null;
        /** @type {number|null} 调度优先级（默认 = dueTick） */
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
