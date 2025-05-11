//@ts-check

/** @typedef TimeElapse
 * @property {number|null} startTime
 * @property {number} length
 */

/**
 * @class Schedule
 * @protected
 */
class Schedule {
    /**
     * @param {TimeElapse} timeElapse
     */
    constructor(timeElapse) {
        if (
            typeof timeElapse.startTime !== "number" &&
            timeElapse.startTime !== null
        ) {
            throw new Error(
                "TimeElapse must have property 'startTime' of Number or null type"
            );
        }
        if (typeof timeElapse.length !== "number") {
            throw new Error("TimeElapse must have Number 'length' property");
        }
        this.startTime = timeElapse?.startTime ?? Date.now();
        this.length = timeElapse?.length;
        this.endTime = this.startTime + this.length;
        this.passedTime = 0;
        this.timeLeft = this.length;
    }
}

/**
 * @interface IGoFAEvent
 */
class IGoFAEvent {
    /**
     * @param {boolean} [isInstant=true]
     * @param {TimeElapse|null} [timeElapse=null] Must have Number "startTime" and Number "length" properties
     * @param {...any} data Generally, any data can be passed to the event. But it`s recommended to pass only one single object.
     */
    constructor(isInstant = true, timeElapse = null, ...data) {
        if (isInstant && timeElapse) {
            throw new Error("If event is instant, timeElapse must be null");
        }
        if (!isInstant && !timeElapse) {
            throw new Error(
                "If event is not instant, timeElapse must be provided"
            );
        }
        this._isInstantEvent = isInstant;
        if (!isInstant && timeElapse) {
            this.schedule = new Schedule(timeElapse);
        }
        this.data = data;
    }

    isInstantEvent() {
        return this._isInstantEvent;
    }
}

module.exports = IGoFAEvent;

if (require.main === module) {
    const event = new IGoFAEvent(
        false,
        { startTime: 12, length: 10 },
        "Hello",
        "World"
    );
    console.log(event);
    const event2 = new IGoFAEvent(true, null, "Hello", "World");
    console.log(event2);
    const event3 = new IGoFAEvent(
        false,
        { startTime: null, length: 10 },
        "Hello",
        "World"
    );
    console.log(event3);
}
