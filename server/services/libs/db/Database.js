const path = require("node:path");
const sqlite3 = require("sqlite3").verbose();
const { ConfigError } = require(path.resolve(__dirname, "../error/Error"));
const Log = require(path.resolve(__dirname, "../shared/logger.js"));
const singleton = require(path.resolve(__dirname, "../shared/Singleton.js"));
// Implementations of IDBConnector
const IDBConnector = require(__dirname + '/IDBConnector');

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
        let DB_Impl = null;
        switch (DB_Type) {
            case ENUM_DB_TYPE.SQLITE: {
                DB_Impl = require(__dirname + '/SqliteConnector.js');
                break;
            }
            default: {
                throw new TypeError(`Not supported database type: ${DB_Type}`);
            }
        }
        try {
            this.db = new DB_Impl(DB_Config);
        } catch (e) {
            throw new ConfigError("Database initialization arguments error:"+e.message);
        }
    }
    test(){
        return this.db.test();
    }
    init() {
        return this.db.init();
    }
    close(){
        return this.db.close();
    }
    execute(sql, params, cb) {
        return this.db.execute(sql, params, cb);
    }
}

/**
 *
 * @param {ENUM_DB_TYPE} arg_DB_Type
 * @param {DB_Config} arg_DB_Config
 * @returns {Database}
 */
let __exports = (arg_DB_Type, arg_DB_Config) => {
    return singleton(new Database(arg_DB_Type, arg_DB_Config));
};
module.exports = __exports; // 需要参数的单例到调用者处实例化传入

if (require.main === module) {
    console.log("Database class definition");
    const db = new Database("sqlite3", { filePath: __dirname + "/test.db" });
    console.log("Database instance created:", db);
}