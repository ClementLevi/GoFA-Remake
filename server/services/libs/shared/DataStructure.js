const _arrayMethods = Symbol("arrayMethods");
const OVERWRITTEN_METHOD = () => {
    throw new Error(
        `This method is not allowed on ${this.constructor.name} instances`
    );
};
/**
 * @module shared/DataStructure
 * @description 提供队列(Queue)和栈(Stack)数据结构的实现
 * Provides implementations of Queue and Stack data structures
 * @author Clement_Levi
 */

/**
 * 队列(先进先出)数据结构实现
 * Queue (First-In-First-Out) data structure implementation
 * @class
 * @extends {Array}
 * @exports
 */
class Queue extends Array {
    /**
     * 创建新队列
     * Create a new queue
     * @param {...any} args 初始元素
     * Initial elements
     */
    constructor(...args) {
        super(...args);
        this[_arrayMethods] = {
            push: super.push,
            pop: super.pop,
            shift: super.shift,
            unshift: super.unshift,
            sort: super.sort,
            splice: super.splice,
            reverse: super.reverse,
            fill: super.fill,
            copyWithin: super.copyWithin,
            join: super.join,
        };

        // 隐藏不必要的Array方法
        this.push = this.enqueue;
        this.pop = OVERWRITTEN_METHOD;
        this.shift = this.dequeue;
        this.unshift = OVERWRITTEN_METHOD;
        this.sort = OVERWRITTEN_METHOD;
        this.splice = OVERWRITTEN_METHOD;
        this.reverse = OVERWRITTEN_METHOD;
        this.fill = OVERWRITTEN_METHOD;
        this.copyWithin = OVERWRITTEN_METHOD;
        this.join = OVERWRITTEN_METHOD;
    }

    /**
     * 向队列尾部添加元素
     * Add elements to the end of the queue
     * @param {...any} items 要添加的元素
     * Elements to add
     * @returns {number} 队列的新长度
     * The new length of the queue
     */
    enqueue(...items) {
        return this[_arrayMethods].push.apply(this, items);
    }

    /**
     * 从队列头部移除并返回元素
     * Remove and return element from the front of the queue
     * @returns {any|undefined} 移除的元素，队列为空时返回undefined
     * Removed element, or undefined if queue is empty
     */
    dequeue() {
        return this.length > 0
            ? this[_arrayMethods].shift.call(this)
            : undefined;
    }

    /**
     * 查看队列头部元素但不移除
     * Peek at the front element without removing it
     * @returns {any|undefined} 队列头部元素，队列为空时返回undefined
     * Front element, or undefined if queue is empty
     */
    peek() {
        return this[0];
    }

    /**
     * 检查队列是否为空
     * Check if queue is empty
     * @returns {boolean} 队列是否为空
     * Whether queue is empty
     */
    isEmpty() {
        return this.length === 0;
    }

    /**
     * 获取队列长度
     * Get queue size
     * @returns {number} 队列长度
     * Queue size
     */
    size() {
        return this.length;
    }
}

/**
 * 栈(后进先出)数据结构实现
 * Stack (Last-In-First-Out) data structure implementation
 * @class
 * @extends {Array}
 * @exports
 */
class Stack extends Array {
    /**
     * 创建新栈
     * Create a new stack
     * @param {...any} args 初始元素
     * Initial elements
     */
    constructor(...args) {
        super(...args);
        this[_arrayMethods] = {
            push: super.push,
            pop: super.pop,
            shift: super.shift,
            unshift: super.unshift,
            sort: super.sort,
            splice: super.splice,
            reverse: super.reverse,
            fill: super.fill,
            copyWithin: super.copyWithin,
            join: super.join,
        };

        // 隐藏不必要的Array方法
        this.push = this.push;
        this.pop = this.pop;
        this.shift = OVERWRITTEN_METHOD;
        this.unshift = OVERWRITTEN_METHOD;
        this.sort = OVERWRITTEN_METHOD;
        this.splice = OVERWRITTEN_METHOD;
        this.reverse = OVERWRITTEN_METHOD;
        this.fill = OVERWRITTEN_METHOD;
        this.copyWithin = OVERWRITTEN_METHOD;
        this.join = OVERWRITTEN_METHOD;
    }

    /**
     * 向栈顶添加元素
     * Add elements to the top of the stack
     * @param {...any} items 要添加的元素
     * Elements to add
     * @returns {number} 栈的新长度
     * The new length of the stack
     */
    push(...items) {
        return this[_arrayMethods].unshift.apply(this, items);
    }

    /**
     * 从栈顶移除并返回元素
     * Remove and return element from the top of the stack
     * @returns {any|undefined} 移除的元素，栈为空时返回undefined
     * Removed element, or undefined if stack is empty
     */
    pop() {
        return this.length > 0
            ? this[_arrayMethods].shift.call(this)
            : undefined;
    }

    /**
     * 查看栈顶元素但不移除
     * Peek at the top element without removing it
     * @returns {any|undefined} 栈顶元素，栈为空时返回undefined
     * Top element, or undefined if stack is empty
     */
    peek() {
        return this[0];
    }

    /**
     * 检查栈是否为空
     * Check if stack is empty
     * @returns {boolean} 栈是否为空
     * Whether stack is empty
     */
    isEmpty() {
        return this.length === 0;
    }

    /**
     * 获取栈长度
     * Get stack size
     * @returns {number} 栈长度
     * Stack size
     */
    size() {
        return this.length;
    }
}

module.exports = {
    Queue,
    Stack,
};

if (require.main === module) {
    const test = require("node:test");
    const { describe, it, afterEach, beforeEach } = test;
    const assert = require("node:assert");

    describe("Queue class", () => {
        describe("#enqueue()", () => {
            let q = new Queue();
            afterEach(() => (q = new Queue()));

            it("should add element to queue", () => {
                q.enqueue(1);
                assert.strictEqual(q.peek(), 1);
            });
            it("should handle multiple elements", () => {
                q.enqueue(1, 2, 3);
                assert.strictEqual(q.size(), 3);
                assert.strictEqual(q.dequeue(), 1);
                assert.strictEqual(q.dequeue(), 2);
                assert.strictEqual(q.dequeue(), 3);
            });
            it("should handle NaN value", () => {
                q.enqueue(NaN);
            });
            it("should handle empty enqueue", () => {
                q.enqueue();
                assert.strictEqual(q.size(), 0);
            });
            it("should handle undefined value", () => {
                q.enqueue(undefined);
                assert.strictEqual(q.peek(), undefined);
            });
            it("should handle mixed values", () => {
                q.enqueue(1, undefined, NaN, "test");
                assert.strictEqual(q.size(), 4);
                assert.strictEqual(q.dequeue(), 1);
                assert.strictEqual(q.dequeue(), undefined);
                assert(isNaN(q.dequeue()));
                assert.strictEqual(q.dequeue(), "test");
            });
        });

        describe("#dequeue()", () => {
            let q = new Queue();
            afterEach(() => (q = new Queue()));

            it("should remove and return first element", () => {
                q.enqueue(1);
                assert.strictEqual(q.dequeue(), 1);
            });
            it("should return undefined when queue is empty", () => {
                assert.strictEqual(q.dequeue(), undefined);
                assert.strictEqual(q.dequeue(), undefined);
            });
            it("should maintain FIFO order", () => {
                q.enqueue(1);
                q.enqueue(2);
                q.enqueue(3);
                q.enqueue(4);
                assert.strictEqual(q.dequeue(), 1);
                assert.strictEqual(q.dequeue(), 2);
                assert.strictEqual(q.dequeue(), 3);
                assert.strictEqual(q.dequeue(), 4);
                assert.strictEqual(q.dequeue(), undefined);
                assert.strictEqual(q.length, 0);
            });
        });

        describe("#peek()", () => {
            let q = new Queue();
            afterEach(() => (q = new Queue()));

            it("should return first element without removing", () => {
                q.enqueue(1);
                assert.strictEqual(q.peek(), 1);
                assert.strictEqual(q.size(), 1);
            });
            it("should return undefined when queue is empty", () => {
                assert.strictEqual(q.peek(), undefined);
            });
        });

        describe("#isEmpty()", () => {
            let q = new Queue();
            afterEach(() => (q = new Queue()));

            it("should return true for empty queue", () => {
                assert.strictEqual(q.isEmpty(), true);
            });
            it("should return false for non-empty queue", () => {
                q.enqueue(1);
                assert.strictEqual(q.isEmpty(), false);
            });
        });

        describe("#size()", () => {
            let q = new Queue();
            afterEach(() => (q = new Queue()));

            it("should return 0 for empty queue", () => {
                assert.strictEqual(q.size(), 0);
            });
            it("should return correct size", () => {
                q.enqueue(1);
                q.enqueue(2);
                assert.strictEqual(q.size(), 2);
            });
        });

        describe("concurrency simulation", () => {
            let q = new Queue();
            afterEach(() => (q = new Queue()));

            it("should handle multiple enqueue operations", () => {
                const tasks = [];
                for (let i = 0; i < 10; i++) {
                    tasks.push(() => q.enqueue(i));
                }
                tasks.forEach((task) => task());
                assert.strictEqual(q.size(), 10);
            });

            it("should maintain order with multiple dequeue operations", () => {
                for (let i = 0; i < 10; i++) {
                    q.enqueue(i);
                }
                const results = [];
                while (!q.isEmpty()) {
                    results.push(q.dequeue());
                }
                assert.deepStrictEqual(results, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            });
        });

        describe("performance", () => {
            let q = new Queue();
            afterEach(() => (q = new Queue()));

            it("should handle large data", () => {
                const count = 10000;
                for (let i = 0; i < count; i++) {
                    q.enqueue(i);
                }
                assert.strictEqual(q.size(), count);
                for (let i = 0; i < count; i++) {
                    assert.strictEqual(q.dequeue(), i);
                }
                assert.strictEqual(q.isEmpty(), true);
            });
        });

        describe("can enumerate", () => {
            let q = new Queue();
            beforeEach(() => {
                q = new Queue();
                q.enqueue(0, 1, 2, 3);
            });
            it("forEach", () => {
                q.forEach((item, index) => {
                    assert.strictEqual(item, q[index]);
                });
            });
            it("map", () => {
                q.map((item, index) => {
                    assert.strictEqual(item, q[index]);
                    return item;
                });
            });
            it("filter", () => {
                let evens = q.filter((value) => value % 2 === 0);
                assert.deepStrictEqual(evens, new Queue(0, 2));
            });
            it("reduce", () => {
                q.reduce((acc, item, index) => {
                    assert.strictEqual(item, q[index]);
                    return acc;
                }, 0);
            });
        });
    });

    describe("Stack class", () => {
        describe("#push()", () => {
            let s = new Stack();
            afterEach(() => (s = new Stack()));

            it("should add element to stack", () => {
                s.push(1);
                assert.strictEqual(s.peek(), 1);
            });
            it("should handle multiple elements", () => {
                s.push(1, 2, 3);
                assert.strictEqual(s.size(), 3);
                assert.strictEqual(s.pop(), 1);
                assert.strictEqual(s.pop(), 2);
                assert.strictEqual(s.pop(), 3);
            });
            it("should handle empty push", () => {
                s.push();
                assert.strictEqual(s.size(), 0);
            });
            it("should handle NaN value", () => {
                s.push(NaN);
                assert(isNaN(s.peek()));
            });
            it("should handle undefined value", () => {
                s.push(undefined);
                assert.strictEqual(s.peek(), undefined);
            });
            it("should handle mixed values", () => {
                s.push(1, undefined, NaN, "test");
                assert.strictEqual(s.size(), 4);
                assert.strictEqual(s.pop(), 1);
                assert.strictEqual(s.pop(), undefined);
                assert(isNaN(s.pop()));
                assert.strictEqual(s.pop(), "test");
            });
        });

        describe("#pop()", () => {
            let s = new Stack();
            afterEach(() => (s = new Stack()));

            it("should remove and return top element", () => {
                s.push(1);
                assert.strictEqual(s.pop(), 1);
            });
            it("should return undefined when stack is empty", () => {
                assert.strictEqual(s.pop(), undefined);
                assert.strictEqual(s.pop(), undefined);
            });
            it("should handle NaN value", () => {
                s.push(NaN);
                assert(isNaN(s.pop()));
            });
            it("should maintain LIFO order", () => {
                s.push(1);
                s.push(2);
                s.push(3);
                s.push(4);
                assert.strictEqual(s.pop(), 4);
                assert.strictEqual(s.pop(), 3);
                assert.strictEqual(s.pop(), 2);
                assert.strictEqual(s.pop(), 1);
                assert.strictEqual(s.pop(), undefined);
                assert.strictEqual(s.length, 0);
            });
        });

        describe("#peek()", () => {
            let s = new Stack();
            afterEach(() => (s = new Stack()));

            it("should return top element without removing", () => {
                s.push(1);
                assert.strictEqual(s.peek(), 1);
                assert.strictEqual(s.size(), 1);
            });
            it("should return undefined when stack is empty", () => {
                assert.strictEqual(s.peek(), undefined);
            });
        });

        describe("#isEmpty()", () => {
            let s = new Stack();
            afterEach(() => (s = new Stack()));

            it("should return true for empty stack", () => {
                assert.strictEqual(s.isEmpty(), true);
            });
            it("should return false for non-empty stack", () => {
                s.push(1);
                assert.strictEqual(s.isEmpty(), false);
            });
        });

        describe("#size()", () => {
            let s = new Stack();
            afterEach(() => (s = new Stack()));

            it("should return 0 for empty stack", () => {
                assert.strictEqual(s.size(), 0);
            });
            it("should return correct size", () => {
                s.push(1);
                s.push(2);
                assert.strictEqual(s.size(), 2);
            });
        });

        describe("performance", () => {
            let s = new Stack();
            afterEach(() => (s = new Stack()));

            it("should handle large data", () => {
                const count = 10000;
                for (let i = 0; i < count; i++) {
                    s.push(i);
                }
                assert.strictEqual(s.size(), count);
                for (let i = count - 1; i >= 0; i--) {
                    assert.strictEqual(s.pop(), i);
                }
                assert.strictEqual(s.isEmpty(), true);
            });
        });

        describe("can enumerate", () => {
            let s = new Stack();
            beforeEach(() => {
                s = new Stack();
                s.push(0, 1, 2, 3);
            });
            it("forEach", () => {
                s.forEach((item, index) => {
                    assert.strictEqual(item, s[index]);
                });
            });
            it("map", () => {
                s.map((item, index) => {
                    assert.strictEqual(item, s[index]);
                    return item;
                });
            });
            it("filter", () => {
                let evens = s.filter((value) => value % 2 === 0);
                assert.deepStrictEqual(evens, new Stack(0, 2));
            });
            it("reduce", () => {
                s.reduce((acc, item, index) => {
                    assert.strictEqual(item, s[index]);
                    return acc;
                }, 0);
            });
        });
    });
}
