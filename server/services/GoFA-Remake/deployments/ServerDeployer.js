const fs = require("node:fs");
const path = require("node:path");

/**
 * @typedef {import("../../../services/libs/shared/logger")} Log
 * @type {Log}
 */
const Log = require(path.resolve(
    __dirname,
    "../../../services/libs/shared/logger"
));
/**
 * @typedef {import("../../../services/libs/error/Error").ConfigError} ConfigError
 */
const { /** @type {ConfigError}*/ ConfigError } = require(path.resolve(
    __dirname,
    "../../../services/libs/error/Error"
));
/** @typedef {import("../../libs/db/IDBConnector")} IDBConnector */
const IDBConnector = require(path.resolve(
    __dirname,
    "../../../services/libs/db/IDBConnector"
));
/**
 * @typedef {import("../game_entities/atlas/generator/PrimitiveGalaxyBuilder")} PrimitiveGalaxyBuilder
 * @type {PrimitiveGalaxyBuilder}
 */
const PrimitiveGalaxyBuilder = require(path.resolve(
    __dirname,
    "../game_entities/atlas/generator/PrimitiveGalaxyBuilder.js"
));
// DDL Files
const INSTALLATION_DDL = path.resolve(
    path.resolve(__dirname, "../../../deployments/testDDL.sql")
);

/**
 * @typedef {import ("../../libs/db/DB_Config.d")} DB_Config
 * @typedef {import ("../../libs/db/Database")} DatabaseConstructor
 * @typedef {import("../../libs/types/main_types").IMainForDeployer} IMain
 */

/**
 * @class ServerDeployer
 * @description 服务器部署类，负责服务器启动时的存档校验、数据库初始化、地图生成工作。部署完成后就可以销毁。
 */
class ServerDeployer {
    static VALIDATE_DDL = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`;
    /**
     *
     * @param {IMain} ctx
     */
    constructor(ctx) {
        /** @type {IMain}  */
        if (!ctx.db) throw new ConfigError("Database not initialized.");
        this.ctx = ctx;
        /** @type {ReturnType<DatabaseConstructor>} */
        this.DB = this.ctx.db;
        /** @type {boolean} */
        this.isInitialized = false;
    }

    /**
     *
     * @returns {this}
     */
    init() {
        if (this.isInitialized) return this;
        if(this.DB.isInitialized) return this;
        this.DB.init()
            .then(() => {
                this.isInitialized = true;
            })
            .catch((err) => {
                Log.error(err);
                this.isInitialized = false;
            });
        return this;
    }

    /**
     * @param {new (...args: any[]) => IDBConnector | IDBConnector} db 指定将要使用的数据库，
     * 如果传入构造器则自行使用config创建新实例；如果传入实例则直接使用。
     * @param {DB_Config} [config]
     * @returns {this}
     */
    useDB(db, config) {
        if (db instanceof Function) {
            this.DB = new db(config);
        } else {
            this.DB = db;
        }
        return this;
    }

    /**
     * 校验所用数据库是否包含完整的游戏数据，这指的是数据库已经进行过完整的初始化，表结构完整，符合现版本所需。
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
        // 1. 使用地图生成器创建地图
        /**
         * @type {import("../game_entities/atlas/generator/PrimitiveGalaxyBuilder")}
         */
        let map_builder = new PrimitiveGalaxyBuilder(120, 120);
        map_builder.generate_base_galaxy();
        // 2. 创建数据库
        let DDL_SCHEMA = fs.readFileSync(INSTALLATION_DDL, "utf8");
        Log.info(DDL_SCHEMA);
        this.DB.execute(DDL_SCHEMA, []);
        // 3. 序列化、持久化地图
        return this;
    }
    /**
     * 完成部署工作，关闭数据库连接。
     */
    finishDeploy() {
        this.DB?.close();
    }
}

module.exports = ServerDeployer;

if (require.main === module) {
    // 相对 server/ 目录定位，避免依赖 cwd（npm 下 cwd 为 server/，直接 node 运行也一样）
    const DB_PATH = path.resolve(__dirname, "../../../db/test_server.db");
    const DB_CONFIG = { filePath: DB_PATH };
    const DatabaseSingleton = require(path.resolve(
        __dirname,
        "../../libs/db/Database"
    ));
    let db = DatabaseSingleton("sqlite3", DB_CONFIG);
    db.init().then(() => {
        let sd = new ServerDeployer({ db });
        sd.deploy();
    });
}
