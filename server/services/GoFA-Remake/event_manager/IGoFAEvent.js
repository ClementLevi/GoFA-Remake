//@ts-check

/**
 * @module IGoFAEvent
 * @description 事件基类模块：定义事件调度语义（即时/延时）与统一事件接口。
 *  - TimeElapse：延时调度参数（tick 计数，非 wall-clock）；
 *  - Schedule：由 startTick + length 推导 dueTick 的调度器；
 *  - IGoFAEvent：事件基类，提供 isInstantEvent / isInstant 与 data 载荷。
 *  Event base module: defines event scheduling semantics (instant / delayed) and the
 *  unified event interface. TimeElapse is the delay spec (tick-based, not wall-clock);
 *  Schedule derives dueTick from startTick + length; IGoFAEvent is the base class
 *  exposing isInstantEvent / isInstant and the data payload.
 */

/**
 * 延时调度参数（tick 计数，非 wall-clock）  Delay schedule spec (tick-based)
 * @typedef {object} TimeElapse
 * @property {number|null} startTick - 起始 tick；null 表示自发布时刻起算  Start tick; null means from publish time
 * @property {number} length - 持续 tick 数  Duration in ticks
 */

/**
 * @class Schedule
 * @description 延时调度器：由 startTick + length 推导 dueTick，用 tick 计数而非 wall-clock。
 *  若 startTick 为 null，则以「当前 tick（发布时刻）」为基准计算到期时刻。
 *  Delay scheduler: derives dueTick from startTick + length, tick-based rather than
 *  wall-clock. When startTick is null, the current tick (publish time) is the base.
 */
class Schedule {
    /**
     * 构造调度器并校验入参  Construct the scheduler and validate the spec
     * @param {TimeElapse} timeElapse - 调度参数  Schedule spec
     */
    constructor(timeElapse) {
        if (
            typeof timeElapse.startTick !== "number" &&
            timeElapse.startTick !== null
        ) {
            throw new Error(
                "TimeElapse must have property 'startTick' of Number or null type"
            );
        }
        if (typeof timeElapse.length !== "number") {
            throw new Error("TimeElapse must have Number 'length' property");
        }
        /** @type {number|null} startTick - 起始 tick（null 表示自发布时刻起算）  Start tick */
        this.startTick = timeElapse.startTick ?? null;
        /** @type {number} length - 持续 tick 数  Duration in ticks */
        this.length = timeElapse.length;
    }

    /**
     * 计算到期 tick  Compute due tick
     * @param {number} nowTick - 当前 tick  Current tick
     * @returns {number} 到期 tick（(startTick ?? nowTick) + length）  Due tick
     */
    dueTick(nowTick) {
        return (this.startTick ?? nowTick) + this.length;
    }

    /**
     * 剩余 tick 数  Remaining ticks
     * @param {number} currentTick - 当前 tick  Current tick
     * @param {number} dueTick - 到期 tick  Due tick
     * @returns {number} 剩余 tick 数（dueTick - currentTick）  Remaining ticks
     */
    remaining(currentTick, dueTick) {
        return dueTick - currentTick;
    }
}

/**
 * @class IGoFAEvent
 * @description 事件基类：即时/延时事件语义。即时事件发布时立即分发；
 *  延时事件携带 Schedule，由事件总线按 tick 到期分发。
 *  Base event class: instant / delayed semantics. Instant events are dispatched
 *  immediately on publish; delayed events carry a Schedule and are dispatched by
 *  the event bus when due.
 */
class IGoFAEvent {
    /**
     * @param {boolean} [isInstant=true] - 是否即时事件（即时事件不允许携带 timeElapse）  Whether instant
     * @param {TimeElapse|null} [timeElapse=null] - 延时调度参数（非即时事件必填）  Delay spec (required when not instant)
     * @param {object|null} [data=null] - 事件载荷（单对象）  Event payload (single object)
     */
    constructor(isInstant = true, timeElapse = null, data = null) {
        if (isInstant && timeElapse) {
            throw new Error("If event is instant, timeElapse must be null");
        }
        if (!isInstant && !timeElapse) {
            throw new Error("If event is not instant, timeElapse must be provided");
        }
        /** @type {boolean} _isInstantEvent - 是否即时事件  Whether instant */
        this._isInstantEvent = isInstant;
        if (!isInstant && timeElapse) {
            /** @type {Schedule} schedule - 延时调度器（仅延时事件存在）  Delay scheduler */
            this.schedule = new Schedule(timeElapse);
        }
        /** @type {object|null} data - 事件载荷（单对象）  Event payload */
        this.data = data;
    }

    /**
     * 是否即时事件  Whether this is an instant event
     * @returns {boolean}
     */
    isInstantEvent() {
        return this._isInstantEvent;
    }

    /**
     * 是否即时事件（getter）  Whether instant (getter)
     * @returns {boolean}
     */
    get isInstant() {
        return this._isInstantEvent;
    }
}

/**
 * IGoFAEvent 构造器类型（typeof 投影：供跨模块 InstanceType<...> 引用，类名直接当类型会报 value-as-type）
 *  IGoFAEvent constructor type (typeof projection for cross-module InstanceType<...>;
 *  using the bare class name as a type triggers value-as-type errors)
 * @typedef {typeof IGoFAEvent} TypeIGoFAEvent
 */

module.exports = IGoFAEvent;

if (require.main === module) {
    const assert = require("node:assert");
    const instant = new IGoFAEvent(true, null, { a: 1 });
    assert.ok(instant.isInstantEvent());
    const delayed = new IGoFAEvent(false, { startTick: null, length: 10 });
    assert.strictEqual(delayed.schedule.dueTick(5), 15);
    assert.strictEqual(delayed.schedule.remaining(5, 15), 10);
    console.log("IGoFAEvent self-test passed.");
}
