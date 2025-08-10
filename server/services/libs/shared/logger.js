const log4js = require("log4js");
const readline = require("readline");
const chalk = require("chalk");
const ls = require("log-symbols");
const ora = require("ora");
const moment = require("moment");
const singleton = require(__dirname + "/Singleton");

/**
 * @typedef LoggerConfigEntry
 * @property {string} color - The color of the message. 信息消息的颜色。
 * @property {string} symbol - The symbol to display before the message. 信息消息前显示的符号。
 * @property {("console" | string)[]} output - The output destinations for the message. 信息消息的输出目标。
 */


/**
 * @typedef LoggerConfig
 * @property {LoggerConfigEntry} [debug]
 * @property {LoggerConfigEntry} [info]
 * @property {LoggerConfigEntry} [warn]
 * @property {LoggerConfigEntry} [error]
 */



/**
 * @class Logger
 * @description Logger class for logging messages and displaying spinners.
 * Now includes command system functionality for console interaction.
 * 用于记录消息和显示加载动画的Logger类，现在包含控制台交互的命令系统功能。
 * @property {Object} config - The logger configuration. 日志记录器配置。
 * @property {Object} logger - The log4js logger instance. 日志记录器实例。
 * @property {Object} commands - The command system for the logger. 日志记录器的命令系统。
 * @property {Object} [rl] - The readline interface for the logger. Required to be initialized in the initTerminal() method. 日志记录器的readline接口。需要在initTerminal()方法中初始化。
 */
class Logger {
    /**
     * Creates an instance of Logger.
     * @param {Object} [customConfig={}] - Custom configuration object. 自定义配置对象。
     */
    constructor(customConfig = {}) {
        const defaultConfig = {
            debug: {
                color: "gray",
                symbol: "info",
                output: ["console", "file"],
            },
            info: {
                color: "blue",
                symbol: "info",
                output: ["console"],
            },
            warn: {
                color: "yellow",
                symbol: "warning",
                output: ["console"],
            },
            error: {
                color: "red",
                symbol: "error",
                output: ["console", "file"],
            },
        };

        this.config = { ...defaultConfig, ...customConfig };
        this.logger = log4js.getLogger();
        this.commands = {};
        this.spinner = null;
    }
    /**
     * Initialize the readline interface for command input.
     * 初始化readline接口以进行命令输入。
     * @memberof Logger
     * @public
     */
    initTerminal(){
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "[ GoFA ] > ",
        });

        // Register built-in commands
        this.registerCommand("help", () => this._showHelp());
        this.registerCommand("exit", () => process.exit());

        this.rl.on("line", (input) => {
            const [cmd, ...args] = input.trim().split(" ");
            if (this.commands[cmd]) {
                this.commands[cmd](args);
            } else {
                this.error(`Unknown command: ${cmd}`);
            }
            this.rl?.prompt();
        });
    }

    /**
     * Register a new command to the logger's command system.
     * 向logger的命令系统注册一个新命令。
     * @param {string} name - The command name. 命令名称。
     * @param {function} handler - The command handler function. 命令处理函数。
     */
    registerCommand(name, handler) {
        this.commands[name] = handler;
    }

    /**
     * Register multiple commands to the logger's command system.
     * 向logger的命令系统注册多个命令。
     * @param {Object} commands - An object containing command names and their handlers.
     * 包含命令名称和处理函数的对象。
     */
    registerCommandsBatch(commands) {
        Object.entries(commands).forEach(([name, handler]) => {
            this.registerCommand(name, handler);
        });
    }

    /**
     * Display help information for available commands.
     * 显示可用命令的帮助信息。
     * @private
     */
    _showHelp() {
        this.info("Available commands:");
        Object.keys(this.commands).forEach((cmd) => {
            this.info(`- ${cmd}`);
        });
    }

    /**
     * Set the configuration for the logger.
     * 设置Logger的配置。
     * @memberof Logger
     * @public
     * @param {Object} customConfig - Custom configuration object. 自定义配置对象。
     */
    setConfig(customConfig) {
        this.config = { ...this.config, ...customConfig };
    }

    /**
     * Log a debug message.
     * 记录调试消息。
     * @memberof Logger
     * @public
     * @param {string[]} message
     */
    debug(...message) {
        this._log("debug", ...message);
    }

    /**
     * Log an information message.
     * 记录信息消息。
     * @memberof Logger
     * @public
     * @param {string[]} message - The information message to log. 要记录的信息消息。
     */
    info(...message) {
        this._log("info", ...message);
    }

    /**
     * Log a warning message.
     * 记录警告消息。
     * @memberof Logger
     * @public
     * @param {string[]} message - The warning message to log. 要记录的警告消息。
     */
    warn(...message) {
        this._log("warn", ...message);
    }

    /**
     * Log an error message.
     * 记录错误消息。
     * @memberof Logger
     * @public
     * @param {string[]} message - The error message to log. 要记录的错误消息。
     */
    error(...message) {
        this._log("error", ...message);
    }

    /**
     * Log a message with the specified level.
     * 显示带有指定文本的加载动画。
     * @memberof Logger
     * @private
     * @param {string} level - The log level (info, warn, error).
     * @param {string[]} message - The message to log.
     */
    _log(level, ...message) {
        var time = moment().format("YYYY-MM-DD HH:mm:ss:SSS");
        const { color, symbol, output } = this.config[level];

        const logMessage = chalk[color](
            `[${time} ${ls[symbol]} ]: ${message.join(" ")}`
        );
        // ! 有点卡
        // TODO 性能问题
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);

        // Output message without newline
        if (output.includes("console"))  process.stdout.write(logMessage + "\n");
        // @ts-ignore 内部保留方法说是
        this.rl?._refreshLine();
        // TODO 将有关日志记录的内容输出到文件，现在这种写法肯定不对。
        if (output.includes("file")) {
            this.logger[level](message);
        }
    }

    /**
     * Start a spinner with the specified text.
     * 显示带有指定文本的加载动画。
     * @memberof Logger
     * @public
     * @param {string} text - The text to display in the spinner. 要在加载动画中显示的文本。
     */
    startSpinner(text) {
        this.spinner = ora(text).start();
    }

    /**
     * Stop the currently running spinner.
     * 停止当前运行的加载动画。
     * @memberof Logger
     */
    stopSpinner() {
        if (this.spinner) {
            this.spinner.stop();
        }
    }
    getInstance() {
        return this;
    }
}

// Export singleton instance
const LoggerInstance = singleton(new Logger());
module.exports = LoggerInstance;

// 使用示例
if (require.main === module) {
    // console.log(ls.success, chalk.yellow("YEAH!"));
    // console.log(ls.error, chalk.red("SAD"));
    const loggerInstance = new Logger();

    loggerInstance.info("This is an information message");
    loggerInstance.warn("This is a warning message");
    loggerInstance.error("This is an error message");

    loggerInstance.startSpinner("Loading...");
    setTimeout(() => {
        loggerInstance.stopSpinner();
    }, 3000);

    // 修改配置示例
    loggerInstance.setConfig({
        info: {
            color: "green",
            symbol: "success",
            output: ["console"],
        },
    });

    loggerInstance.info("This is a customized information message");
    let loop = setInterval(() => {
        loggerInstance.info("new line to interrupt your typing lol");
    }, 1000);
    setTimeout(() => {
        clearInterval(loop);
    },10000);
}
