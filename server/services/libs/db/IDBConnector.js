/**
 * @file IDBConnector.js
 * @module IDBConnector
 */

/**
 * 数据库类型枚举
 * @enum {string}
 * @readonly
 */
const ENUM_DB_TYPE = {
    SQLITE: "sqlite3",
    //MYSQL: "mysql",
    //POSTGRESQL: "postgresql",
};

/**
 * @typedef {object} DB_Config
 * @property {string} [filePath] - 数据库文件路径，仅在使用SQLite时需要。
 * @property {string} [dbName] - 数据库名称，仅在使用SQLite时需要。
 * @property {string} [host] - 数据库主机地址，仅在使用MySQL或PostgreSQL时需要。
 * @property {number} [port] - 数据库端口号，仅在使用MySQL或PostgreSQL时需要。
 * @property {string} [user] - 数据库用户名，仅在使用MySQL或PostgreSQL时需要。
 * @property {string} [password] - 数据库密码，仅在使用MySQL或PostgreSQL时需要。
 */


/**
 * @interface
 * @description 数据库连接器基类，用于处理不同类型的数据库连接。
 * @abstract
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
    }
    /**
     * @property {any} db - 被封装的数据库连接对象
     * @description 不建议访问该受封装属性，建议在被调用时展示调用堆栈以便追踪可能的扩展兼容性问题
     */
    get db(){
        throw new Error("Must be implemented by subclass.");
        return this.db;
    }
    /**
     * 测试数据库连接
     * @abstract
     * @returns {Promise<boolean>}
     */
    async test(){
        throw new Error("Must be implemented by subclass.");
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
    async close() {}
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
