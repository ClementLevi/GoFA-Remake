//@ts-check

/**
 * @module PriorityQueue
 * @description 优先队列（二叉最小堆）：按 dueTick（到期 tick）排序，priority 作次键。
 *  最小堆：dueTick 越小越先到期；同 dueTick 时 priority 越小越先（缺省按 0 计）。
 *  泛型化：元素类型 T 受 ScheduledItem 约束（必须含数字 dueTick，可选数字 priority）。
 *  Min-heap priority queue ordered by dueTick, priority as secondary key: smaller
 *  dueTick pops first; ties are broken by smaller priority (defaulting to 0). Generic:
 *  element type T is constrained to ScheduledItem (numeric dueTick required, numeric
 *  priority optional).
 */

/**
 * 可调度项：优先队列元素形状（类型参数 T 的约束）  Schedulable item: element shape (constraint for T)
 * @typedef {object} ScheduledItem
 * @property {number} dueTick - 到期 tick  Due tick
 * @property {number} [priority] - 调度优先级（次键，缺省按 0 计）  Scheduling priority (secondary key, defaults to 0)
 */

/**
 * @template {ScheduledItem} T
 * @class PriorityQueue
 * @description 优先队列（二叉最小堆）：按 dueTick 排序、priority 作次键。
 *  Min-heap priority queue ordered by dueTick, priority as secondary key.
 */
class PriorityQueue {
    constructor() {
        /** @type {T[]} _heap - 堆数组（完全二叉树数组表示）  Heap array (complete-binary-tree array) */
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
     * @returns {T|null} 堆顶元素（空队列返回 null）  Top element (null when empty)
     */
    peek() {
        return this._heap[0] ?? null;
    }

    /**
     * 入队  Push an element
     * @param {T} event - 待入队元素（必须含 dueTick）  Element to push (must have dueTick)
     * @returns {this} 支持链式调用  Chainable
     */
    push(event) {
        this._heap.push(event);
        this._siftUp(this._heap.length - 1);
        return this;
    }

    /**
     * 弹出堆顶（最小者）  Pop the top (smallest)
     * @returns {T|null} 弹出的元素（空队列返回 null）  Popped element (null when empty)
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
     * 弹出所有 dueTick <= currentTick 的到期元素  Pop all due elements
     * @param {number} currentTick - 当前 tick  Current tick
     * @returns {T[]} 到期元素列表（按堆序弹出）  Due elements (popped in heap order)
     */
    popDue(currentTick) {
        /** @type {T[]} */
        const due = [];
        while (!this.isEmpty() && this.peek().dueTick <= currentTick) {
            due.push(this.pop());
        }
        return due;
    }

    /**
     * 比较两个元素的调度优先级  Compare two elements by schedule priority
     * @param {T} a - 元素 A  Element A
     * @param {T} b - 元素 B  Element B
     * @returns {number} 负值表示 a 排在 b 前  Negative means a comes first
     */
    _compare(a, b) {
        return a.dueTick - b.dueTick || (a.priority ?? 0) - (b.priority ?? 0);
    }

    /**
     * 自底向上调整堆（@private）  Sift up (private)
     * @param {number} index - 起始下标  Start index
     */
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

    /**
     * 自顶向下调整堆（@private）  Sift down (private)
     * @param {number} index - 起始下标  Start index
     */
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
