const child_process = require("child_process");

if (require.main === module) {
    // 加载配置读取系统
    // Load Config Loader
    process.env.DOTENV_CONFIG_PATH = "./server/.env";
    const dotenv = require("dotenv");
    const CONFIG = dotenv.config().error
        ? (() => {
              throw dotenv.config().error;
          })()
        : dotenv.config().parsed;
    // TS check cannot tell that 'throw dotenv.config().error;' above has prevented CONFIG from being undefined.
    // TS 检查看不出上面的语句已经可以防止 CONFIG 未定义。
    if (!CONFIG) {
        throw new Error("Failed to load config file. Now exiting...");
    }

    // 加载命令行系统
    // Load Command Line System
    const commander = require("commander");
    const program = new commander.Command();
    program
        .name(CONFIG.SERVER_NAME)
        .version(CONFIG.GAME_VERSION)
        .description("这里需要本地化字符串，讲解服务器是干什么的")
        .option("--test", "run unit tests")
        // .option("-d, --debug", "Enable debugging")
        // .option("-w, --windowed", "Run app in windowed mode")
        .option(
            "-n, --new",
            "Create a new server. This will invoke world generator"
        )
        .option("-h, --help", "display help file", program.help())
        .option("-e,", "test", (v) => {
            console.log("test " + v);
        });

    program.parse(process.argv);
    const OPTS = program.opts();
    
}
