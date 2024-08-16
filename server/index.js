const path = require("path");
const fs = require("fs");

function is_required() {
    return "Application entry point can/should not be included!"
}
async function main() {
    // 加载配置读取系统
    // Load Config Loader
    process.env.DOTENV_CONFIG_PATH = "./server/.env";
    const dotenv = require("dotenv");
    const CONFIG = dotenv.config().error ?
        (() => {
            throw dotenv.config().error;
        })() :
        dotenv.config().parsed;

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
        .option("-h, --help", program.help());

    program.parse(process.argv);
    const OPTS = program.opts();
}

if (require.main === module) {
    main();
} else {
    let ret = is_required();
    module.exports = ret;
}