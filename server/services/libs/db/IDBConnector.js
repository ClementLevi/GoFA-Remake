/**
 * @file IDBConnector.js
 * @module IDBConnector
 */

/**
 * @typedef {import("./ENUM_DB_TYPE.d")} ENUM_DB_TYPE
 * @typedef {import("./DB_Config.d")} DB_Config
 */

/**
 * @interface
 * @description 数据库连接器基类，用于处理不同类型的数据库连接。
 * @abstract
 * @member {boolean} isInitialized - 数据库连接是否已初始化
 * @member {any} _db - 被封装的数据库连接对象
 * @member {DB_Config} DB_Config - 创建数据库链接所需的其他参数
 */
class IDBConnector {
    /**
     * @constructor
     * @param {DB_Config} DB_Config 创建数据库链接所需的其他参数
     * @throws {TypeError} Must be implemented by subclass.
     */
    constructor(DB_Config) {
        if (new.target === IDBConnector) {
            throw new TypeError("Must be implemented by subclass.");
        } else {
            this.DB_Config = DB_Config;
        }
        /** @type {boolean} */
        this.isInitialized = false;
        /**
         * @type {any}
         * @private
         */
        this._db = null;
    }
    /**
     * @type {any} db - 被封装的数据库连接对象
     * @description 不建议访问该受封装属性，建议在被调用时展示调用堆栈以便追踪可能的扩展兼容性问题
     */
    get db() {
        throw new Error("Must be implemented by subclass.");
        return this._db;
    }
    /**
     * 测试数据库连接
     * @abstract
     * @returns {Promise<boolean>}
     */
    async test() {
        throw new Error("Must be implemented by subclass.");
    }
    /**
     * 初始化数据库连接
     * @abstract
     * @returns {Promise<this>}
     */
    async init() {
        return this;
    }
    /**
     * 关闭数据库连接
     * @abstract
     * @returns {Promise<void>}
     */
    async close() {}
    /**
     * 执行SQL语句
     * @abstract
     * @description 必须确保不在非受限条件下调用，即必须编写中间件以确保安全性。
     * @param {string} query SQL语句
     * @param {any[]} params SQL语句参数
     * @returns {Promise<any>} 执行结果
     */
    async execute(query, params) {
        throw new Error("Must be implemented by subclass.");
    }
}

module.exports = IDBConnector;
