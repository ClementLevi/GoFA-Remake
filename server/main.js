const child_process = require("child_process");
const path = require("path");
const {CMD:COMMAND_LINE_INSTANCE, registerCommand} = require("./services/libs/shared/commandLine");
const GAME = require("./services/GoFA-Remake/game");
const dotenv = require("dotenv");
const { register } = require("module");
if (require.main === module) {
    // 加载配置读取系统
    // Load Config Loader
    process.env.DOTENV_CONFIG_PATH = path.resolve(".env");

    const CONFIG = dotenv.config({
        path: process.env.DOTENV_CONFIG_PATH,
    })?.parsed;
    if (CONFIG.error) {
        throw dotenv.config({ path: process.env.DOTENV_CONFIG_PATH }).error;
    }
    // TS check cannot tell that 'throw dotenv.config().error;' above has prevented CONFIG from being undefined.
    // TS 检查看不出上面的语句已经可以防止 CONFIG 未定义。
    if (!CONFIG) {
        throw new Error("Failed to load config file. Now exiting...");
    }

    // 加载命令行系统
    // Load Command Line System
    registerCommand("exit", () => {
        process.exit();
    });

    // 创建游戏示例
    const GAME_INSTANCE = GAME.getInstance();

    // 主事件循环入口
    async function MainLoop() {
        GAME_INSTANCE.tick();
    }
    const EventLoopHandle = setInterval(
        MainLoop,
        1000 / Number(CONFIG.TICK_RATE)
    );
}
