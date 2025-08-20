const fs = require("fs");
const Log = require(__dirname + "/../../../services/libs/shared/logger");
const IDBConnector = require(__dirname +
    "/../../../services/libs/db/IDBConnector");
const path = require("node:path");
// DDL Files
const INSTALLATION_DDL = path.resolve("./server/deployments/testDDL.sql");

/**
 * @typedef {import ("../../libs/db/IDBConnector").DB_Config} DB_Config
 * 从IDBConnector模块导入DB_Config类型定义
 */

/**
 * @class ServerDeployer
 * @description 服务器部署类，负责服务器启动时的存档校验、数据库初始化、地图生成工作。部署完成后就可以销毁。
 */
class ServerDeployer {
    static VALIDATE_DDL = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`;
    constructor(ctx) {
        this.ctx = ctx;
        this.DB = null;
    }
    /**
     *
     * @param {Function | IDBConnector} db 指定将要使用的数据库，如果传入构造器
     * 则自行使用config创建新实例；如果传入实例则直接使用。
     * @param {DB_Config | undefined} [config]
     * @returns {this}
     */
    useDB(db, config = void 0) {
        if (typeof db === "function") {
            this.DB = new db(config);
        } else {
            this.DB = db;
        }
        this.config = config;
        return this;
    }
    /**
     * 校验所用数据库是否包含完整的游戏数据，这指的是数据库已经进行过完整的初始化，表结构完整，符合现版本所需。
     * @private
     * @synchronous
     * @returns {boolean}
     */
    validateExistingData() {
        let ret = false;
        // 1. 数据库存在
        if (this.DB === null) {
            throw new Error("Database not initialized.");
        }
        // 2. 数据库连接正常
        this.DB.test().then((result) => {
            if (result) ret = true;
        });
        // 3. 数据库中存在完整的游戏数据
        this.DB.execute(ServerDeployer.VALIDATE_DDL, []).then((result) => {
            if (result.length === 0) ret = true;
        });
        return ret;
    }
    /**
     * @returns {ServerDeployer}
     */
    deploy() {
        Log.info("Deploying server...");
        // 1. 创建数据库
        let DDL_SCHEMA = fs.readFileSync(INSTALLATION_DDL, "utf8");
        Log.info(DDL_SCHEMA);
        this.DB.execute(DDL_SCHEMA, []);
        // 2. 使用地图生成器创建地图
        // 3. 序列化、持久化地图
        return this;
    }
    /**
     * 完成部署工作，关闭数据库连接。
     */
    finishDeploy() {
        this.DB.close();
    }
}

module.exports = ServerDeployer;

if (require.main === module) {
    const DB_PATH = path.resolve("./server/db/test_server.db");
    const DB_CONFIG = { filePath: DB_PATH };
    let sd = new ServerDeployer();

    /**
     * @typedef  {import ("../../libs/db/Database")} DatabaseConstructor
     */
    const DatabaseSingleton = require(path.normalize(
        __dirname + "/../../../services/libs/db/Database"
    ));
    let db = DatabaseSingleton("sqlite3", DB_CONFIG);
    db.init()
        .then(() => {
            return db.test();
        })
        .then((e) => {
            Log.info(`db.test() result: ${e}`);
            sd.useDB(db).deploy();
        })
        .catch((err) => {
            Log.error(`${err.message}\n${err.stack}`);
        })
        .finally(() => {
            db.close(() => {
                // TODO 这个从未触发，得研究一下
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
