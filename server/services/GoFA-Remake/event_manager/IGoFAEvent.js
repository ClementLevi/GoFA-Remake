//@ts-check

/**
 * @typedef TimeElapse
 * @property {number|null} startTick - 起始 tick；null 表示自发布时刻起算
 * @property {number} length - 持续 tick 数
 */

/**
 * @class Schedule
 * @description 延时调度：由 startTick + length 推导 dueTick，用 tick 计数而非 wall-clock。
 */
class Schedule {
    /**
     * @param {TimeElapse} timeElapse - 调度参数
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
        this.startTick = timeElapse.startTick ?? null;
        this.length = timeElapse.length;
    }

    /**
     * 计算到期 tick  Compute due tick
     * @param {number} nowTick - 当前 tick  Current tick
     * @returns {number} 到期 tick  Due tick
     */
    dueTick(nowTick) {
        return (this.startTick ?? nowTick) + this.length;
    }

    /**
     * 剩余 tick 数  Remaining ticks
     * @param {number} currentTick - 当前 tick
     * @param {number} dueTick - 到期 tick
     * @returns {number} 剩余 tick
     */
    remaining(currentTick, dueTick) {
        return dueTick - currentTick;
    }
}

/**
 * @class IGoFAEvent
 * @description 事件基类：即时/延时事件语义。
 */
class IGoFAEvent {
    /**
     * @param {boolean} [isInstant=true] - 是否即时事件
     * @param {TimeElapse|null} [timeElapse=null] - 延时调度（非即时必填）
     * @param {object|null} [data=null] - 事件载荷（单对象）
     */
    constructor(isInstant = true, timeElapse = null, data = null) {
        if (isInstant && timeElapse) {
            throw new Error("If event is instant, timeElapse must be null");
        }
        if (!isInstant && !timeElapse) {
            throw new Error("If event is not instant, timeElapse must be provided");
        }
        this._isInstantEvent = isInstant;
        if (!isInstant && timeElapse) {
            this.schedule = new Schedule(timeElapse);
        }
        this.data = data;
    }

    /** @returns {boolean} 是否即时事件 */
    isInstantEvent() {
        return this._isInstantEvent;
    }

    /** @returns {boolean} 是否即时事件（getter） */
    get isInstant() {
        return this._isInstantEvent;
    }
}

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
