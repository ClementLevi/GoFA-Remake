/**
 * @app entry point of the server.
 */
// Official modules
const path = require("node:path");
const EventEmitter = require("node:events");
const child_process = require("node:child_process");

// 3-rd party modules
///** @deprecated */
//const dotenv = require("dotenv"); // TODO: use --env .env instead
//const jsm = require("javascript-state-machine");

// Engine modules
/**
 * @typedef {InstanceType<import("./services/libs/shared/logger").TypeLogger>} Log
 * @type {Log}
 */
const Log = require(path.resolve(__dirname, "./services/libs/shared/logger"));
// const { ENUM_DB_TYPE } = require(__dirname + "/services/libs/db/db.type");

/**
 * @type {import('./services/libs/commands/Commands')}
 */
const CONSOLE_COMMANDS = require(path.resolve(
    __dirname,
    "./services/libs/commands/Commands"
));

/**
 * @typedef {typeof import('./services/libs/shared/DataStructure').Queue} Queue
 * @typedef {typeof import('./services/libs/shared/DataStructure').Stack} Stack
 * @type {{Queue: Queue,Stack: Stack}}
 */
const { Queue, Stack } = require(path.resolve(
    __dirname,
    "./services/libs/shared/DataStructure"
));

// Game components
/**
 * @typedef {typeof import('./services/GoFA-Remake/game')} GameConstructor
 * @type {GameConstructor}
 */
const GameConstructor = require(path.resolve(
    __dirname,
    "./services/GoFA-Remake/game"
));
/**
 * @typedef {typeof import('./services/GoFA-Remake/deployments/ServerDeployer')} ServerDeployer
 * @type {ServerDeployer}
 */
const ServerDeployer = require(path.resolve(
    __dirname,
    "./services/GoFA-Remake/deployments/ServerDeployer"
));

/**
 * @typedef {ReturnType<GameConstructor>} Game
 * @typedef {import('./services/libs/db/Database')} DatabaseConstructor
 * @typedef {ReturnType<DatabaseConstructor>} Database
 * @typedef {import('./services/libs/commands/Commands')} Commands
 */

/**
 * @typedef {object} Config
 * TODO 补充Config类型定义
 */

/**
 * @typedef Time
 * @property {number} TICK - 自启动以来的tick数，即全局时间
 * @property {number} TICK_RATE - 服务器tick频率, 单位为次/秒
 * @property {number} TICK_INTERVAL - 服务器tick间隔时间，单位为ms
 * @property {number} startTime - 服务器启动时间戳
 * @property {number} last_tick_elapse - 上一次tick耗时
 * @property {number[]} recentTicksElapses - 最近几次tick耗时
 * @property {number} recentTicksSize - 最近几次tick队列长度，用以求平均值
 * @property {number} [LAG_WARN_THRESHOLD=1000/TICK_RATE * 5] - 掉刻警告阈值, 单位为ms
 */

/**
 * @exports
 * @description 主程序接口定义
 * @typedef IMain
 * @property {Config?} config - 配置模块实例
 * @property {InstanceType<Database>?} db - 数据库实例
 * @property {Game?} game - 游戏实例
 * @property {Log?} logger - 日志模块实例
 * @property {ENUM_STAGE[keyof ENUM_STAGE]} stage - 主程序运行阶段枚举
 * @property {ServerDeployer?} server_deployer - 服务器部署器实例
 * @property {Time} time - 时间信息
 * @property {"init"|"running"|"exiting"} ENUM_STAGE - 主程序运行阶段枚举
 * @property {() => Promise<this>} init - 初始化游戏
 * @property {() => void} run - 运行游戏
 * @property {() => void} loadConfig - 加载配置
 * @property {(logger: Log) => void} regCommands - 注册命令行系统
 * @property {() => Promise<void>} exit - 退出游戏
 * @property {() => IMain} getMain - 获取主程序实例
 */

/**
 * @typedef {{INIT: "initializing",RUNNING: "running",EXITING: "exiting"}} EnumStage
 * @readonly
 * @enum {string}
 * TODO: 拆到main.d.js中
 */
const ENUM_STAGE = Object.freeze({
    INIT: "initializing",
    RUNNING: "running",
    EXITING: "exiting",
});

/**
 * @class Main
 * @implements {IMain}
 */
class Main extends EventEmitter {
    static ENUM_STAGE = ENUM_STAGE;
    /**
     * TODO: 补充Main类型定义，应当由.env配置项提供类型定义
     * @param {*} config
     */
    constructor(config) {
        super();
        /** @type {Config} */
        // 1. 加载配置读取系统  Load Config Loader
        this.config = this.loadConfig();
        /** @type {Database?} */
        this.db = null;
        /** @type {ReturnType<setTimeout>?} */
        this.event_loop_handle = null;
        /** @type {Game?} */
        this.game = null;
        /** @type {Log} */
        this.logger = Log.getInstance();
        this.logger.bindParent(this);
        /** @type {EnumStage[keyof EnumStage]} */
        this.stage = Main.ENUM_STAGE.INIT;
        /** @type {InstanceType<ServerDeployer>?} */
        this.server_deployer = null;
        /**
         * @type {Time}
         */
        this.time = {
            TICK: 0,
            TICK_RATE: this.config?.TICK_RATE ?? 5,
            startTime: 0,
            recentTicksElapses: new Queue(),
            recentTicksSize: 5,
            last_tick_elapse: -1,
            get TICK_INTERVAL() {
                return 1000 / (this.TICK_RATE ?? 5);
            },
            get LAG_WARN_THRESHOLD() {
                return this.TICK_INTERVAL * 5;
            },
        };
        /**
         * @description 事件和待更新任务队列
         * @type {{onStart:InstanceType<Queue>,
         * events:Record<string,InstanceType<Queue>>,
         * timedEvents:Record<number,InstanceType<Queue>>,
         * cleanups: InstanceType<Queue>,
         * updatable: InstanceType<Queue>}}
         */
        this.ev_queues = {
            onStart: new Queue(),
            events: {},
            timedEvents: {},
            cleanups: new Queue(), // alias: onExit
            updatable: new Queue(),
        };
    }
    /**
     * @description 加载配置，会过滤掉不需要的env变量
     * @package
     * @returns {Config}
     */
    loadConfig() {
        // TODO: 使用zod库校验配置项，注明哪些项是必填项
        // 定义我们需要的环境变量键名
        const neededKeys = {
            GAME_VERSION: "string",
            SERVER_NAME: "string",
            SERVER_PORT: "number",
            IS_TEST_SERVER: "boolean",
            TICK_RATE: "number",
            DB_TYPE: "string",
            DB_URL: "string",
            DB_PORT: "number",
            DB_USERNAME: "string",
            DB_PASSWORD: "string",
            MAP_SEED: "string",
            MAP_SIZE_W: "number",
            MAP_SIZE_H: "number",
            MAP_MASK_SCRIPT: "string",
        };
        // 创建纯净的配置对象
        const cleanConfig = {};
        // 只提取需要的变量并进行基本类型转换
        for (const key of Object.keys(neededKeys)) {
            if (process.env[key] !== undefined) {
                let r = process.env[key];
                let ret;
                // @ts-ignore
                switch (neededKeys[key]) {
                    case "string":
                        ret = r;
                        break;
                    case "number":
                        ret = Number(r);
                        break;
                    case "boolean":
                        ret = r === "true";
                        break;
                    default:
                        // @ts-ignore
                        throw new Error(`Unsupported type: ${neededKeys[key]}`);
                }
                // @ts-ignore
                cleanConfig[key] = ret;
            }
        }
        return cleanConfig;
    }
    get TICK_INTERVAL() {
        return 1000 / this.time.TICK_RATE;
    }
    get GAME_LIFE() {
        return this.game?._gamelife ?? -1;
    }
    get OPTIONS() {
        return this.config ?? {};
    }
    /**
     * 注册命令行系统
     * @private
     * @param {*} logger - 日志记录器实例
     */
    regCommands(logger) {
        if (!this.logger) this.logger = logger;
        // Log.info("Loading command line system...");
        this.logger.registerCommandsBatch(CONSOLE_COMMANDS);
        Log.info("Command line system loaded.");
    }
    /**
     * 注册事件
     * @param {string | symbol} name
     * @param {(...args: any[]) => void} cb
     */
    regEvent(name, cb) {
        if (typeof name !== "string") return this;
        if (typeof cb !== "function") return this;
        this.on(name, cb);
        return this;
    }
    /**
     * @description 注册定时事件，在delay个tick后执行
     * @param {string} name
     * @param {() => void} cb
     * @param {number} delay
     */
    registerTimedEvent(name, cb, delay) {
        if (typeof name !== "string") return this;
        if (typeof cb !== "function") return this;
        if (typeof delay !== "number") return this;
        let timeout = this.time.TICK + delay;
        if (!this.ev_queues.timedEvents[timeout]) {
            this.ev_queues.timedEvents[timeout] = new Queue();
        }
        this.ev_queues.timedEvents[timeout].push(cb);
        console.log(`Registered Timed Event: ${name} after ${delay} ticks.`);
        return this;
    }
    /**
     * @description 消费定时事件
     * @private
     */
    consumeTimedEvents() {
        if (this.ev_queues.timedEvents[this.time.TICK]) {
            this.ev_queues.timedEvents[this.time.TICK].forEach((task) =>
                task()  // TODO: 会有异步回调吗
            );
            delete this.ev_queues.timedEvents[this.time.TICK];
        }
        return this;
    }
    /**
     * @description 刷新最近几次tick耗时队列
     * @param {number} last_elapse
     */
    refreshRecentTicksElapses(last_elapse) {
        if (this.time.recentTicksElapses.length >= this.time.recentTicksSize) {
            this.time.recentTicksElapses.shift();
        }
        this.time.recentTicksElapses.push(last_elapse);
        return this;
    }
    /**
     * @description 检测掉刻。注意它只是检测，并不做任何事
     * @returns {[boolean, number]} - [是否掉刻，平均掉刻耗时]
     */
    detectLag() {
        if (!this.time.LAG_WARN_THRESHOLD) return [false, -1];
        let average_elapse =
            this.time.recentTicksElapses.reduce((acc, cur) => acc + cur, 0) /
            this.time.recentTicksElapses.length;
        return [average_elapse > this.time.LAG_WARN_THRESHOLD, average_elapse];
    }
    deploy() {}
    // 生命周期阶段 Life Cycle Stages
    /**
     * 初始化程序
     * @package
     * @returns {Promise<this>}
     */
    async init() {
        // 0. 进入启动状态
        this.stage = Main.ENUM_STAGE.INIT;
        // 1. 加载配置  Load Config
        // 2. 加载命令行系统  Load Command Line System
        this.logger.initTerminal();
        this.regCommands(this.logger);
        // 3. 加载数据库系统  Load Database System
        /** @type {DatabaseConstructor} */
        let DBConstructor = require(path.resolve(
            __dirname,
            "./services/libs/db/Database"
        ));
        /**
         * @typedef {import("./services/libs/db/DB_Config.d")} DB_Config
         */
        this.db = DBConstructor(  // new 关键字已经包含在构造工厂函数内部
            // TODO: config参数不仅仅是DB的config，需要全面设计IMain的config参数类型
            this.config?.DB_TYPE ?? "sqlite3",
            /** @type {DB_Config} */
            { filePath: this.config?.DB_URL ?? ":memory:" }
        );
        this.db.bindParent(this);
        await this.db.init();
        // 3.1 数据库内需有合法的数据库和表
        this.server_deployer = new ServerDeployer(this);
        this.server_deployer.init();
        if (!this.server_deployer.validateExistingData()) {
            this.server_deployer.deploy();
        }else{
            this.server_deployer = null;
        }
        // 4. 创建游戏实例  Create Game Instance
        this.game = GameConstructor(this);
        await this.game.init();

        // END 进入事件循环
        this.run();
        return this;
    }
    /**
     * 运行游戏
     * @package
     */
    run() {
        this.stage = Main.ENUM_STAGE.RUNNING;
        this.onStarted();
        // 进入事件循环
        this.tick(0);
    }
    /**
     * @param {number} deltaTime
     */
    tick(deltaTime) {
        // 0x00 start measuring this tick duration
        const T = new Date().getTime();
        this.time.TICK++;
        // 0x01 calculate last tick duration to ensure fixed tick rate
        // if last tick takes shorter than expected, wait for the remaining time.
        // if last tick takes longer than expected, execute the next tick asap to try to catch up.
        let next_tick_after = Math.max(
            this.time.TICK_INTERVAL - this.time.last_tick_elapse,
            0
        );

        // 0x02 consume timed events
        this.consumeTimedEvents();

        // 0x03 update engine logic
        if (this.ev_queues.updatable[this.time.TICK]) {
            this.ev_queues.updatable[this.time.TICK].forEach((task) => task());
        }

        // 0x04 execute game logic
        this.game ? this.game.tick(deltaTime) : null;

        // 0x05 schedule next tick
        if (this.stage === Main.ENUM_STAGE.EXITING) return this.onExit();
        this.event_loop_handle = setTimeout(
            // this.tick.bind(this),
            () => {
                this.tick(next_tick_after);
            },
            deltaTime
        );

        // EOF end of measuring this tick duration
        this.last_tick_elapse = new Date().getTime() - T;
        this.refreshRecentTicksElapses(this.last_tick_elapse);
        // Detect lag
        if (this.detectLag()[0]) this.onLag();
    }
    exit() {
        this.stage = Main.ENUM_STAGE.EXITING;
        this.onExit();
        this.db?.close();
        return this.event_loop_handle
            ? clearTimeout(this.event_loop_handle)
            : -1;
    }
    // 生命周期钩子  Life Cycle Hooks
    /**
     * @description 开始事件
     * @private
     */
    onStarted() {
        Log.info(`Server started at ${new Date().toLocaleString()}`);
        this.ev_queues.onStart.forEach((cb) => cb());
    }
    /**
     * @description 掉刻时执行
     */
    onLag() {
        Log.warn(
            `Lag detected! Avg tick duration: ${
                this.detectLag()[1]
            }ms for recent ${this.time.recentTicksElapses.length} ticks.`
        );
    }
    /**
     * @description 退出事件
     */
    onExit() {
        this.ev_queues.cleanups.forEach((cb) => cb());
    }
}
// ENTRY POINT  程序入口
if (require.main === module) {
    process.on("exit", function ExitHandler() {});
    const MAIN = new Main();
    MAIN.init()
        .then((result) => {
            // result.run();
        })
        .catch((err) => {
            Log.error(err.message);
            Log.error(err.stack);
        });
    (async () => {
        Log.debug(MAIN.OPTIONS);
    })();
}
