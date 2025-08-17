const { get } = require("node:https");
const path = require("node:path");
const fs = require("node:fs");
const sqlite3 = require("sqlite3").verbose();
const IDBConnector = require(__dirname + "/IDBConnector");
const Log = require(path.resolve(__dirname, "../shared/logger.js"));

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
 * @class
 * @description SQLite数据库连接器类，用于处理SQLite数据库连接。
 * @extends IDBConnector
 */
class SqliteConnector extends IDBConnector {
    /**
     * @constructor
     * @override
     * @param {DB_Config} DB_Config 创建数据库链接所需的其他参数
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
            throw new Error("Database file is unreachable.");

        // 初始化实例属性
        this._db = null;
        this._db_path = DB_Config.filePath;
        this._isInitialized = false;
        this._initializationError = null;
    }
    /**
     * @property {any} db - 被封装的数据库连接对象
     * @description 不建议访问该受封装属性，建议在被调用时展示调用堆栈以便追踪可能的扩展兼容性问题
     */
    get db() {
        Log.warn("Accessing protected attribute 'db':" + new Error().stack);
        return this._db;
    }
    set db(v) {
        this._db = v;
    }
    /**
     * 测试数据库连接
     * @abstract
     * @returns {Promise<boolean>}
     */
    async test() {}
    /**
     *
     */
    async init() {
        if (this._isInitialized) {
            Log.warn("Database already initialized");
            return;
        }

        try {
            // 1. 异步检查数据库文件是否可用
            if (this._db_path !== ":memory:") {
                await this._checkDatabaseFile();
            }
            // 2. 异步建立数据库连接
            await new Promise((resolve, reject) => {
                this._db = new sqlite3.Database(this._db_path, (err) => {
                    if (err) {
                        Log.error(`Database connection error: ${err.message}`);
                        reject(err);
                        return;
                    }
                    Log.info(`Connected to the database '${this._db_path}'`);
                    this._isInitialized = true;
                    resolve();
                });
            });
        } catch (error) {
            this._initializationError = error;
            Log.error(`Database initialization failed: ${error.message}`);
            throw error; // 重新抛出错误让调用者处理
        }
    }
    /**
     *
     * @returns {Promise<void>}
     */
    async close() {
        if (!this._db)
            throw new Error("Database connection is not initialized.");
        return this._db.close();
    }
    /**
     * 基于Sqlite3的all API执行查询。
     * @param {string} query
     * @param {any[]} [params]
     * @param {sqlite3Callback} [cb]
     * @returns sqlite3.Database
     * ---
     * @callback sqlite3Callback
     * @param {Error} err - 错误对象，如果发生错误则不为null。
     * @param {any[]} rows - 查询结果的行数组。
     */
    async execute(query, params, cb = (err, rows) => {}) {
        if (!this._db)
            throw new Error("Database connection is not initialized.");
        return this._db.all(query, params, cb);
    }
    /**
     * 检查数据库文件是否存在且可读写
     * @returns {Promise<void>}
     * @private
     */
    async _checkDatabaseFile() {
        try {
            // 检查文件是否存在且可读写
            await fs.access(
                this._db_path,
                fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
            );
        } catch (err) {
            if (err.code === "ENOENT") {
                throw new Error(`Database file not found: ${this._db_path}`);
            } else if (err.code === "EACCES") {
                throw new Error(
                    `No permission to access database file: ${this._db_path}`
                );
            } else {
                throw new Error(
                    `Error accessing database file: ${err.message}`
                );
            }
        }
    }
}

/**
 * @module SqliteConnector
 */
module.exports = SqliteConnector;

if (require.main === module) {
    const dbPath = ":memory:";
    const dbConfig = { filePath: dbPath };
    const sqliteConnector = new SqliteConnector(dbConfig);

    sqliteConnector
        .init()
        .then(() => {
            Log.info("Database initialized successfully.");
            return sqliteConnector._db.each("SELECT sqlite_version();", info=>{
                Log.info(`${info}`);
            }); // TODO: 查不出版本来
            // ! 使用受保护的属性 _db 仅用于测试目的
        })
        .then((rows) => {
            Log.info(`SQLite version: ${JSON.stringify(rows)}`);
        })
        .catch((err) => {
            Log.error(`Error: ${err.message}`);
            Log.error(err.stack);
        })
        .finally(() => {
            sqliteConnector.close().then(() => {
                Log.info("Database connection closed.");
            });
        });
}
