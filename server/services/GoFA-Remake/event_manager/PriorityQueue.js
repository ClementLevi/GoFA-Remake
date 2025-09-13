//@ts-check
const path = require('node:path');
const IGoFAEvent = require(path.resolve(__dirname, "./IGoFAEvent"));

class PrioritizedEvent extends IGoFAEvent {
    constructor(priority) {
        super();
        this.priority = this.schedule?.timeLeft;
    }
}

class PriorityQueue {
    constructor() {
        this.queue = [];
    }
    /**
     * @param {PrioritizedEvent} event
     */
    push(event) {
        this.queue.push(event);
        this.queue.sort((a, b) => a.priority - b.priority);
    }

    pop() {
        return this.queue.shift().item;
    }

    isEmpty() {
        return this.queue.length === 0;
    }
    getTopPriority() {
        return this.queue[0].priority;
    }
}

module.exports = PriorityQueue;

if (require.main === module) {
    const Log = require(path.resolve(__dirname,"../../libs/shared/logger"));
    const pq = new PriorityQueue();
    pq.push(new PrioritizedEvent(3));
    Log.info(pq.getTopPriority());
    Log.info(pq.pop());
    Log.info(pq.isEmpty());
}
