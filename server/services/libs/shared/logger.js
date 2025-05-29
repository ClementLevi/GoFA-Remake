const log4js = require("log4js");
const chalk = require("chalk");
const ls = require("log-symbols");
const ora = require("ora");
const moment = require("moment");
const singleton = require(__dirname + "/Singleton");

// console.log(ls.success, chalk.yellow("YEAH!"));
// console.log(ls.error, chalk.red("SAD"));
/**
 * @class Logger
 * @description Logger class for logging messages and displaying spinners. 用于记录消息和显示加载动画的Logger类。
 */
class Logger {
    constructor(customConfig) {
        const defaultConfig = {
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
    }
    /**
     * Set the configuration for the logger.
     * 设置Logger的配置。
     * @memberof Logger
     * @param {Object} customConfig - Custom configuration object. 自定义配置对象。
     */
    setConfig(customConfig) {
        this.config = { ...this.config, ...customConfig };
    }
    /**
     * Log an information message.
     * 记录信息消息。
     * @memberof Logger
     * @param {string} message - The information message to log. 要记录的信息消息。
     */

    info(message) {
        this.log("info", message);
    }
    /**
     * Log a warning message.
     * 记录警告消息。
     * @memberof Logger
     * @param {string} message - The warning message to log. 要记录的警告消息。
     */
    warn(message) {
        this.log("warn", message);
    }
    /**
     * Log an error message.
     * 记录错误消息。
     * @memberof Logger
     * @param {string} message - The error message to log. 要记录的错误消息。
     */
    error(message) {
        this.log("error", message);
    }
    /**
     * Log a message with the specified level.
     * 显示带有指定文本的加载动画。
     * @memberof Logger
     * @param {string} level - The log level (info, warn, error).
     * @param {string} message - The message to log.
     */
    log(level, message) {
        var time = moment().format("YYYY-MM-DD HH:mm:ss:SSS");
        const { color, symbol, output } = this.config[level];

        if (output.includes("console")) {
            console.log(chalk[color](`[${time} ${ls[symbol]} ]: ${message}`));
        }
        if (output.includes("file")) {
            this.logger[level](message);
        }
    }
    /**
     * Start a spinner with the specified text.
     * 显示带有指定文本的加载动画。
     * @memberof Logger
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
}
const LoggerInstance = singleton(new Logger());
module.exports = LoggerInstance;

// 使用示例
if (require.main === module) {
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
}
