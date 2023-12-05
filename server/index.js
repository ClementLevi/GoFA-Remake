const path = require("path");

// 加载命令行系统
// Load Command Line System
const {COMMAND_LINE, registerCommand,} = require(path.resolve("services/libs/shared/commandLine"))
const COMMANDS_LIST = require(path.resolve("services/libs/commands"))

// 加载配置读取系统
// Load Config Loader
const CONFIG = require(path.resolve("services/libs/config"));




console.log(CONFIG.serverSettings["server-name"]);