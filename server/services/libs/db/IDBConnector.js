/**
 * @file IDBConnector.js
 */

/**
 * @interface
 * @description 数据库连接器基类，用于处理不同类型的数据库连接。
 * @abstract
 */
class IDBConnector {
    constructor() {
        if (new.target === IDBConnector) {
            throw new TypeError("Must be implemented by subclass.");
        }
    }
    /**
     * 初始化数据库连接
     * @abstract
     * @returns {Promise<void>}
     */
    async init() {}
    /**
     * 关闭数据库连接
     * @abstract
     * @returns {Promise<void>}
     */
    async close(){}
    /**
     * 执行SQL语句
     * @abstract
     * @description 必须确保不在非受限条件下调用，即必须编写中间件以确保安全性。
     * @param {string} query SQL语句
     * @param {Array} params SQL语句参数
     * @returns {Promise<any>} 执行结果
     */
    async execute(query, params) {
        throw new Error("Must be implemented by subclass.");
    }
}

module.exports = IDBConnector;
