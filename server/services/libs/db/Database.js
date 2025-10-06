const path = require("node:path");
const fs = require("node:fs");
const sqlite3 = require("sqlite3").verbose();
const { ConfigError } = require(path.resolve(__dirname, "../error/Error"));
const Log = require(path.resolve(__dirname, "../shared/logger.js"));
const singleton = require(path.resolve(__dirname, "../shared/Singleton.js"));
// Implementations of IDBConnector
/** @typedef {import("./IDBConnector")} IDBConnector*/
// const IDBConnector = require(path.resolve(__dirname, "./IDBConnector"));

/** @typedef {import("./ENUM_DB_TYPE.t")} ENUM_DB_TYPE */
const ENUM_DB_TYPE = require(path.resolve(__dirname, "./ENUM_DB_TYPE.t"));

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
 * 数据库连接器
 * @class
 * @description 数据库连接器类，用于处理不同类型的数据库连接。
 * @method init - 初始化数据库连接
 * @method close - 关闭数据库连接
 * @method execute - 执行SQL语句
 */
class Database {
    /**
     *
     * @param {ENUM_DB_TYPE} DB_Type 受支持的数据库类型枚举
     * @param {DB_Config} DB_Config 创建数据库链接所需的其他参数
     * @throws {TypeError} Not supported database type. 不支持的数据库类型
     * @throws {ConfigError} Database initialization arguments error. 数据库初始化参数错误
     */
    constructor(DB_Type, DB_Config) {
        /** @type {boolean} */
        this.isInitialized = false;
        /** @type {IDBConnector?} */
        let DB_Impl = null;
        /** @type {new DB_Impl() | null} */
        this.db = null;
        switch (DB_Type) {
            case ENUM_DB_TYPE.SQLITE3: {
                DB_Impl = require(__dirname + "/Sqlite3Connector.js");
                break;
            }
            case ENUM_DB_TYPE.NODE_SQLITE: {
                DB_Impl = require(__dirname + "/NodeSqliteConnector.js");
                break;
            }
            default: {
                throw new TypeError(`Not supported database type: ${DB_Type}`);
            }
        }
        try {
            this.db = new DB_Impl(DB_Config);
        } catch (e) {
            throw new ConfigError(
                `Database initialization arguments error: ${e}`
            );
        }
        this.init();
    }
    test() {
        return this.db.test();
    }
    /**
     * @returns {Promise<this>}
     */
    init() {
        if (this.isInitialized) return Promise.resolve(this);
        return this.db.init().then(() => {
            this.isInitialized = true;
            return this;
        });
    }
    /**
     * @returns {Promise<void>}
     */
    close() {
        return this.db.close();
    }

    /**
     *
     * @param {string} sql
     * @param {any[]} params
     * @param {Function} cb
     * @returns {Promise<any>}
     * TODO 不要返回any，需要搞明白这玩意儿
     */
    execute(sql, params, cb) {
        return this.db.execute(sql, params, cb);
    }
}

/**
 * @function __exports
 * @param {ENUM_DB_TYPE} arg_DB_Type
 * @param {DB_Config} arg_DB_Config
 * @returns {Database}
 */
let __exports = (arg_DB_Type, arg_DB_Config) => {
    return singleton(new Database(arg_DB_Type, arg_DB_Config));
};
module.exports = __exports; // 需要参数的单例到调用者处实例化传入

if (require.main === module) {
    Log.info("Database class definition");
    const DB_PATH = path.resolve("./server/db/test_server.db");
    // const DB_PATH = ":memory:";
    const DB_CONFIG = { filePath: DB_PATH };
    const db = new Database("sqlite3", DB_CONFIG);
    db.init()
        .then(() => {
            Log.info("Database instance created:\n", db);
            Log.warn(
                "db.db.db is a protected property, do not access it directly."
            );
            Log.debug(db?.db?.db);
        })
        .then(() => {
            return db.test();
        })
        .then((result) => {
            Log.info(`db.test() result: ${result}`);
        })
        .catch((err) => {
            Log.error(`${err.message} ${err.stack}`);
        })
        .finally(() => {
            if (DB_PATH === ":memory:") return;
            db.close().then(() => {
                fs.unlink(DB_PATH, (err, data) => {
                    if (err) {
                        Log.error(
                            `Failed to remove test database file: ${err.message}`
                        );
                        return;
                    }
                    Log.info("Test database file removed successfully: ", data);
                });
            });
        });
}
