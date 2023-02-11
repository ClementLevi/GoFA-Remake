/**
 * @file Provides a Timer class, which times by second
 * and can emit events with triggering criteria.
 * @author Clement_Levi 1090708360@qq.com
 * @version 1.0.0
 */

const events = require("events");
const chalk = require("chalk");

/**
 * @typedef {Object} Timer
 */

class Timer {
    /**
     * @type {String}
     * @memberof Timer
     * @constant
     */
    WARN_EVENTEMITTER_FAIL =
        chalk.red("[! Timer !] ") +
        chalk.yellow(
            "Timer instance takes one 'EventEmitter' instance as argument, which\n"
        ) +
        chalk.red("[! Timer !] ") +
        chalk.yellow("is missing and causing event emitter failing!");
    /**
     * @class {Timer}
     */
    constructor(EventEmitter) {
        /**
         * @property {Number} second
         */
        this.second = 0;
        /**
         * @property {Object|Null} clock
         */
        this.clock = null; //计时器
        /**
         * @property {EventEmitter} EventEmitter
         */
        this.EventEmitter = EventEmitter
            ? EventEmitter
            : console.warn(this.WARN_EVENTEMITTER_FAIL) ||
              new events.EventEmitter();
        /**
         * @property {Array<String>} eventsQueue
         */
        this.eventsQueue = [];
        this.eventsRules = {};
    }
    /**
     * Reset the timer.
     * 重置计时器。
     */
    reset() {
        //重置
        clearInterval(this.clock);
        this.second = 0;
    }
    /**
     * Start the timer. If the timer is not reset, it will continue timing.
     * 启动计时器。若此前没有归零，则继续计时。
     */
    start() {
        this.clock = setInterval(this.__tick.bind(this), 1000);
        // .bind(this) makes sure the method is called within instance context.
        // .bind(this) 保证了方法处于本实例的上下文当中.
    }
    /**
     * Stop the timer without resetting the timer.
     * 停止计时，但不归零
     * @returns {Number} Current seconds since timer has started.
     */
    stop() {
        clearInterval(this.clock);
        return this.second;
    }
    /**
     * Register an event for the timer to regularly trigger.
     * 将事件注册到计时器上，以便定时触发。
     * @param {String} event_name Name of the event to emit regularly.
     * @param {Function} trigger The event will emit only when the trigger function returns true.
     * The function should accept "this.second" as the only argument.
     * @returns {Number} How many events are currently registered.
     */
    register(event_name, trigger = undefined) {
        this.eventsQueue.push(event_name);
        if (!trigger) {
            trigger = () => {
                return this.second;
            };
        }
        this.eventsRules[event_name] = trigger;
        return this.eventsQueue.length;
    }
    /**
     * Tick one second. Events will try to emit every second.
     * 步进一秒钟。事件们每秒钟都会尝试触发。
     * @private
     */
    __tick() {
        this.second++;
        this.eventsQueue.forEach((event) => {
            if (this.eventsRules[event](this.second)) {
                this.EventEmitter.emit(event);
            }
        });
    }
}

module.exports = { Timer };
