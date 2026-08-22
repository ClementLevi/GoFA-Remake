//@ts-check

const path = require("node:path");
const PriorityQueue = require(path.resolve(__dirname, "./PriorityQueue"));

/**
 * @typedef {object} Consumer
 * @property {(event: any) => void} onEvent - 消费事件  Consume an event
 */

/**
 * @class EventBus
 * @description 事件总线：发布订阅 + 优先队列调度 + tick 驱动。
 *  即时事件 publish 时同步分发；延时事件入优先队列，由 tick 到期弹出分发。
 * Event bus: pub/sub + priority-queue scheduling + tick driven.
 */
class EventBus {
    constructor() {
        /** @type {Map<string, Consumer[]>} subscribers - topic -> 消费者列表 */
        this.subscribers = new Map();
        /** @type {PriorityQueue} delayed - 延时事件队列 */
        this.delayed = new PriorityQueue();
        /** @type {number} currentTick - 当前 tick */
        this.currentTick = 0;
    }

    /**
     * 发布事件  Publish an event
     * @param {any} event - 事件（GoFAGameEvent）
     * @returns {this}
     */
    publish(event) {
        event.createdAt = this.currentTick;
        if (event.isInstantEvent()) {
            event.dueTick = this.currentTick;
            this.dispatch(event);
        } else {
            event.dueTick = event.schedule.dueTick(this.currentTick);
            if (event.priority == null) {
                event.priority = event.dueTick;
            }
            this.delayed.push(event);
        }
        return this;
    }

    /**
     * 订阅某 topic  Subscribe to a topic
     * @param {string} topic - 事件类型（ENUM key）
     * @param {Consumer} consumer - 消费者
     * @returns {() => void} 退订句柄  Unsubscribe handle
     */
    subscribe(topic, consumer) {
        if (typeof topic !== "string" || typeof consumer?.onEvent !== "function") {
            return () => {};
        }
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, []);
        }
        this.subscribers.get(topic).push(consumer);
        return () => this.unsubscribe(topic, consumer);
    }

    /**
     * 退订  Unsubscribe
     * @param {string} topic - 事件类型
     * @param {Consumer} consumer - 消费者
     * @returns {this}
     */
    unsubscribe(topic, consumer) {
        const list = this.subscribers.get(topic);
        if (list) {
            const idx = list.indexOf(consumer);
            if (idx >= 0) {
                list.splice(idx, 1);
            }
        }
        return this;
    }

    /**
     * 每 tick 驱动：推进时钟并消费到期延时事件  Drive each tick
     * @param {number} currentTick - 当前 tick
     * @returns {this}
     */
    tick(currentTick) {
        this.currentTick = currentTick;
        const due = this.delayed.popDue(currentTick);
        for (const event of due) {
            this.dispatch(event);
        }
        return this;
    }

    /**
     * 分发事件到订阅者  Dispatch an event to subscribers
     * @param {any} event - 事件
     * @returns {this}
     */
    dispatch(event) {
        const consumers = this.subscribers.get(event.type);
        if (!consumers) {
            return this;
        }
        for (const consumer of consumers) {
            try {
                consumer.onEvent(event);
            } catch (err) {
                // 隔离消费者异常，不中断后续  Isolate consumer errors
                console.error(`[EventBus] consumer for ${event.type} threw:`, err);
            }
        }
        return this;
    }
}

module.exports = EventBus;

if (require.main === module) {
    const assert = require("node:assert");
    const GoFAGameEvent = require("./GoFAGameEvent");
    const bus = new EventBus();
    const received = [];
    bus.subscribe("server_shutdown", {
        onEvent: (event) => received.push(event.type),
    });
    bus.publish(
        new GoFAGameEvent({
            type: "server_shutdown",
            timeElapse: { startTick: null, length: 5 },
        })
    );
    assert.strictEqual(received.length, 0, "not yet due");
    bus.tick(4);
    assert.strictEqual(received.length, 0, "still not due");
    bus.tick(5);
    assert.strictEqual(received.length, 1, "due at tick 5");
    console.log("EventBus self-test passed.");
}
