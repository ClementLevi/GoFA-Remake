//@ts-check

const path = require("node:path");
const PriorityQueue = require(path.resolve(__dirname, "./PriorityQueue"));

/**
 * @module EventBus
 * @description 事件总线：发布订阅 + 优先队列调度 + tick 驱动。
 *  - subscribe(topic, consumer)：订阅某 topic，返回退订句柄；
 *  - publish(event)：发布事件，即时事件同步分发，延时事件入优先队列；
 *  - tick(currentTick)：每 tick 驱动，推进时钟并消费到期延时事件；
 *  - dispatch(event)：将事件派发给 topic 下全部消费者（单个消费者异常被隔离）。
 *  类型约定（TS 级 JSDoc）：可分发事件用 DispatchedEvent 投影类型描述（按需投影，
 *  避免对具体事件类产生运行时依赖）；订阅者用 Consumer 类型（含 onEvent 回调）。
 *  Event bus: pub/sub + priority-queue scheduling + tick driven. subscribe returns an
 *  unsubscribe handle; publish dispatches instant events synchronously and queues
 *  delayed ones; tick advances the clock and drains due events; dispatch fans an event
 *  out to every consumer of its topic with per-consumer error isolation. Type
 *  conventions (TS-grade JSDoc): the dispatchable event shape is the DispatchedEvent
 *  projection type (projected on demand to avoid a runtime dependency on the concrete
 *  event class); subscribers are typed as Consumer (an object with an onEvent callback).
 */

/**
 * 可分发事件的按需投影类型（类型体操：投影 EventBus 实际触碰的字段）
 *  Dispatchable event projection (type gymnastics: project the exact fields EventBus touches)
 * @typedef {object} DispatchedEvent
 * @property {string} type - 事件类型（即订阅 topic）  Event type (the subscription topic)
 * @property {number|null} createdAt - 创建 tick（发布时盖戳）  Creation tick (stamped at publish)
 * @property {number|null} dueTick - 到期 tick（发布时计算）  Due tick (computed at publish)
 * @property {number|null} priority - 调度优先级（默认 = dueTick）  Scheduling priority (defaults to dueTick)
 * @property {() => boolean} isInstantEvent - 是否即时事件  Whether instant
 * @property {ScheduleLike} [schedule] - 延时调度（仅延时事件存在）  Delay schedule (delayed events only)
 */

/**
 * 延时调度器投影（类型体操：行内投影 Schedule 的形状，避免跨模块类引用）
 *  Schedule projection (inline shape to avoid a cross-module class reference)
 * @typedef {object} ScheduleLike
 * @property {(nowTick: number) => number} dueTick - 计算到期 tick  Compute due tick
 * @property {(currentTick: number, dueTick: number) => number} remaining - 剩余 tick 数  Remaining ticks
 */

/**
 * 事件消费者：订阅者对象，通过 onEvent 回调消费事件（callback 语义）
 *  Event consumer: subscriber object that consumes events via an onEvent callback
 * @typedef {{ onEvent(event: DispatchedEvent): void }} Consumer
 */

/**
 * @class EventBus
 * @description 事件总线：发布订阅 + 优先队列调度 + tick 驱动。
 *  即时事件 publish 时同步分发；延时事件入优先队列，由 tick 到期弹出分发。
 *  Event bus: pub/sub + priority-queue scheduling + tick driven.
 */
class EventBus {
    constructor() {
        /** @type {Map<string, Consumer[]>} subscribers - topic -> 消费者列表  Subscribers per topic */
        this.subscribers = new Map();
        /** @type {PriorityQueue<DispatchedEvent>} delayed - 延时事件队列  Delayed event queue */
        this.delayed = new PriorityQueue();
        /** @type {number} currentTick - 当前 tick  Current tick */
        this.currentTick = 0;
    }

    /**
     * 发布事件：即时事件同步分发；延时事件入队等待 tick 到期  Publish an event
     * @param {DispatchedEvent} event - 事件（如 GoFAGameEvent 实例）  Event (e.g. a GoFAGameEvent)
     * @returns {this} 支持链式调用  Chainable
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
     * @param {string} topic - 事件类型（订阅键）  Event type (topic key)
     * @param {Consumer} consumer - 消费者（含 onEvent 回调）  Consumer (with onEvent callback)
     * @returns {() => void} 退订句柄（调用后不再接收该 topic 事件）  Unsubscribe handle
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
     * 退订：从 topic 的消费者列表移除指定消费者  Unsubscribe
     * @param {string} topic - 事件类型  Event type
     * @param {Consumer} consumer - 消费者  Consumer
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
     * @param {number} currentTick - 当前 tick  Current tick
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
     * 分发事件到订阅者（异常隔离：单个消费者抛错不影响其余消费者）  Dispatch an event
     * @param {DispatchedEvent} event - 事件  Event
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
