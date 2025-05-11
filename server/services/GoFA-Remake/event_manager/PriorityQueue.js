//@ts-check

const IGoFAEvent = require(__dirname + "/IGoFAEvent");

class PrioritizedEvent extends IGoFAEvent {
    constructor(priority) {
        super();
        this.priority = this.schedule?.;
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
    const pq = new PriorityQueue();
    pq.push(new PrioritizedEvent(1));
    pq.push(new PrioritizedEvent(3));
}
