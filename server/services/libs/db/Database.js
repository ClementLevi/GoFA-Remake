const path = require("path");
const singleton = require(path.resolve("./services/libs/shared/Singleton.js"));

/**
 * 数据库连接器
 * @class
 * @description 数据库连接器类，用于处理不同类型的数据库连接。
 */
class Database {
    /**
     *
     * @param {"sqlite"} DB_Type 受支持的数据库类型枚举
     * @param {Object} DB_Config 创建数据库链接所需的其他参数
     * @throws {Error} Not supported database type. 不支持的数据库类型
     * @throws {Error} Database initialization arguments error. 数据库初始化参数错误
     */
    constructor(DB_Type, DB_Config) {
        let DB_Impl = null;
        switch (DB_Type) {
            case "sqlite": {
                DB_Impl = require(path.resolve(__dirname+"/SqliteConnector"));
                break;
            }
            default: {
                throw new Error("Not supported database type.");
            }
        }
        try{
            this.db = new DB_Impl(DB_Config);
        }catch (e) {
            throw new Error("Database initialization arguments error.");
        }
    }
}

module.exports = (DB_Type, DB_Config) => {
    return singleton(new Database(DB_Type, DB_Config));
}; // 需要参数的单例到调用者处实例化传入


if(require.main === module) {
    console.log("Database class definition");
    const db = new Database("sqlite", {});
    console.log("Database instance created:", db);
}