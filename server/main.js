/**
 * @app entry point of the server.
 */
// Official modules
const child_process = require("child_process");
const path = require("path");
const dotenv = require("dotenv");
// Engine modules
const Log = require("./services/libs/shared/logger");
// Game components
// const {
//     CMD: COMMAND_LINE_INSTANCE,
//     registerCommand,
// } = require("./services/libs/shared/commandLine");
const CONSOLE_COMMANDS = require("./services/libs/commands/Commands");
const GAME = require("./services/GoFA-Remake/game");
// Main Class
class Main {
    static ENUM_STAGE = {
        INIT: "init",
        RUNNING: "running",
        EXITING: "exiting",
    };
    constructor() {
        this.stage = Main.ENUM_STAGE.INIT;
        this.game = null;
        this.logger = null;
        this.eventLoopHandle = null;
        this.config = null;
    }
    /**
     * 初始化程序
     * @package
     */
    async init() {
        // 1. 加载配置读取系统  Load Config Loader
        this.config = await this.loadConfig();
        // 2. 加载命令行系统  Load Command Line System
        this.logger = Log.getInstance();
        await this.regCommands();
        // 3. 加载数据库系统  Load Database System
        this.db = require(path.resolve(__dirname, "./services/libs/db/Database"))(this.config.DB_TYPE, {})
        // 3.1 数据库内需有合法的
        // 4. 创建游戏实例  Create Game Instance
        this.game = GAME.getInstance();
        await this.game.init();
    }
    /**
     * 加载配置
     * @private
     */
    async loadConfig() {
        
        process.env.DOTENV_CONFIG_PATH = path.resolve(".env");
        const CONFIG = dotenv.config({
            path: process.env.DOTENV_CONFIG_PATH,
        })?.parsed;
        if (CONFIG === undefined || CONFIG?.error) {
            throw dotenv.config({ path: process.env.DOTENV_CONFIG_PATH }).error;
        }
        if (!CONFIG) {
            throw new Error("Failed to load config file. Now exiting...");
        }
        this.config = CONFIG;
        return CONFIG;
        this.stage = Main.ENUM_STAGE.RUNNING;
    }
    /**
     * 注册命令行系统
     * @private
     */
    async regCommands() {
        Log.info("Loading command line system...");
        this.logger.registerCommandsBatch(CONSOLE_COMMANDS);
        Log.info("Command line system loaded.");
    }
    /**
     * 运行游戏
     * @package
     */
    async run() {
        this.eventLoopHandle = setInterval(
            this.game.tick.bind(this.game),
            1000 / Number(this.config?.TICK_RATE || 5)
        );
    }
    getMain() {
        return this;
    }
}
// ENTRY POINT  程序入口
if (require.main === module) {
    (async () => {
        const MAIN = new Main();
        await MAIN.init();
        await MAIN.run();
    })();
}
