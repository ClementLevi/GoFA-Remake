//@ts-check

const PriorityQueue = require(__dirname + "PriorityQueue");
class EventManager {
    constructor() {
        // 一个优先队列，每一个元素的优先级都表示一个任务完成的剩余时间。
        this.pq = new PriorityQueue();
        this.sleptTime = 0;
    }
    update() {
        /**
         * 1. 遍历优先队列，如果队列顶部元素优先级等于当前睡眠时间，则：1.执行任务；2. 将任务弹出优先队列。
         * 2. 遍历优先队列，如果优先级小于当前睡眠时间，则将睡眠时间设置为优先级，并将任务重新加入优先队列。
         */
        if (this.pq.getTopPriority() === this.sleptTime) {
        }
        for (let item of this.pq.queue) {
        }
    }
}
module.exports = EventManager;

if (require.main === module) {
    const em = new EventManager();
    console.log(em);
}
