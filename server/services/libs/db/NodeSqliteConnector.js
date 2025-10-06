/**
 * @file NodeSqliteConnector.js
 * @module NodeSqliteConnector
 */
const path = require("node:path");
const fs = require("node:fs");
const nodesqlite = require("node:sqlite");
const Log = require(path.resolve(__dirname, "../shared/logger.js"));
const { InitializationViolationError } = require(path.resolve(
    __dirname,
    "../error/Error"
));
const IDBConnector = require(__dirname + "/IDBConnector");

/**
 * @typedef {import("./ENUM_DB_TYPE.t")} ENUM_DB_TYPE
 * @typedef {import("./DB_Config.t")} DB_Config
 */

/**
 * @interface
 * @description 数据库连接器基类，用于处理不同类型的数据库连接。
 * @abstract
 * @member {boolean} isInitialized - 数据库连接是否已初始化
 * @member {any} _db - 被封装的数据库连接对象
 * @member {DB_Config} DB_Config - 创建数据库链接所需的其他参数
 */
class NodeSqliteConnector extends IDBConnector {
    /**
     * @constructor
     * @param {DB_Config} DB_Config 创建数据库链接所需的其他参数
     * @throws {TypeError} Must be implemented by subclass.
     */
    constructor(DB_Config) {
        super(DB_Config);
        this.DB_Config = DB_Config;

        // 同步检查配置是否包含必要的文件路径
        if (
            !DB_Config ||
            !DB_Config.filePath ||
            typeof DB_Config.filePath !== "string"
        ) {
            throw new Error("Database file path is required.");
        }
        if (
            DB_Config.filePath !== ":memory:" &&
            (!fs.existsSync(DB_Config.filePath) ||
                !fs.statSync(DB_Config.filePath).isFile())
        )
            Log.warn(
                `Database file not found: "${DB_Config.filePath}". Creating a new one...`
            );

        // 初始化实例属性
        /** @type {typeof nodesqlite | null} */
        this._db = null;
        /** @type {string?} */
        this._db_path = DB_Config.filePath;
        /** @type {boolean} */
        this.isInitialized = false;
    }
    /**
     * @type {any} db - 被封装的数据库连接对象
     * @description 不建议访问该受封装属性，建议在被调用时展示调用堆栈以便追踪可能的扩展兼容性问题
     */
    get db() {
        return this._db;
    }
    /**
     * 测试数据库连接
     * @abstract
     * @returns {Promise<boolean>}
     */
    async test() {}
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
    async execute(query, params) {}
}

module.exports = NodeSqliteConnector;
