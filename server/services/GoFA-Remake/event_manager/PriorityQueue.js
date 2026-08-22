//@ts-check

/**
 * @class PriorityQueue
 * @description 优先队列（二叉最小堆）：按 dueTick（到期 tick）排序，priority 作次键。
 *  最小堆：dueTick 越小越先到期。  Min-heap ordered by dueTick, priority as secondary key.
 */
class PriorityQueue {
    constructor() {
        /** @type {Array<any>} _heap - 堆数组  Heap array */
        this._heap = [];
    }

    /** @returns {number} 队列大小  Size */
    get size() {
        return this._heap.length;
    }

    /** @returns {boolean} 是否为空  Whether empty */
    isEmpty() {
        return this._heap.length === 0;
    }

    /**
     * 查看堆顶（最小者）而不弹出  Peek the top (smallest) without popping
     * @returns {any|null} 堆顶事件  Top event
     */
    peek() {
        return this._heap[0] ?? null;
    }

    /**
     * 入队  Push an event
     * @param {any} event - 事件  Event
     * @returns {this}
     */
    push(event) {
        this._heap.push(event);
        this._siftUp(this._heap.length - 1);
        return this;
    }

    /**
     * 弹出堆顶（最小者）  Pop the top (smallest)
     * @returns {any|null} 弹出的事件  Popped event
     */
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        const top = this._heap[0];
        const last = this._heap.pop();
        if (this._heap.length > 0) {
            this._heap[0] = last;
            this._siftDown(0);
        }
        return top;
    }

    /**
     * 弹出所有 dueTick <= currentTick 的到期事件  Pop all due events
     * @param {number} currentTick - 当前 tick  Current tick
     * @returns {any[]} 到期事件列表  Due events
     */
    popDue(currentTick) {
        const due = [];
        while (!this.isEmpty() && this.peek().dueTick <= currentTick) {
            due.push(this.pop());
        }
        return due;
    }

    /**
     * 比较两个事件的调度优先级  Compare two events by schedule priority
     * @param {any} a - 事件 A
     * @param {any} b - 事件 B
     * @returns {number} 负值表示 a 在前  Negative means a comes first
     */
    _compare(a, b) {
        return a.dueTick - b.dueTick || (a.priority ?? 0) - (b.priority ?? 0);
    }

    /** @param {number} index - 起始下标 */
    _siftUp(index) {
        let i = index;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this._compare(this._heap[i], this._heap[parent]) >= 0) {
                break;
            }
            [this._heap[i], this._heap[parent]] = [
                this._heap[parent],
                this._heap[i],
            ];
            i = parent;
        }
    }

    /** @param {number} index - 起始下标 */
    _siftDown(index) {
        let i = index;
        const n = this._heap.length;
        while (true) {
            const left = i * 2 + 1;
            const right = i * 2 + 2;
            let smallest = i;
            if (left < n && this._compare(this._heap[left], this._heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < n && this._compare(this._heap[right], this._heap[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === i) {
                break;
            }
            [this._heap[i], this._heap[smallest]] = [
                this._heap[smallest],
                this._heap[i],
            ];
            i = smallest;
        }
    }
}

module.exports = PriorityQueue;

if (require.main === module) {
    const assert = require("node:assert");
    const pq = new PriorityQueue();
    pq.push({ dueTick: 5, priority: 1 });
    pq.push({ dueTick: 1, priority: 1 });
    pq.push({ dueTick: 3, priority: 1 });
    assert.strictEqual(pq.pop().dueTick, 1);
    assert.strictEqual(pq.pop().dueTick, 3);
    assert.strictEqual(pq.pop().dueTick, 5);
    assert.ok(pq.isEmpty());
    console.log("PriorityQueue self-test passed.");
}
