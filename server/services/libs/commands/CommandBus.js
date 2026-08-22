/**
 * @module CommandBus
 * @description 控制台命令总线：命令注册表 + 终端输入 + 命令触发。
 *  与日志解耦（Logger 只负责日志），由 Main 持有本组件；API 通过 Main.executeCommand 触发命令。
 * Console command bus: registry + terminal input + dispatch. Decoupled from the logger,
 * owned by Main; API triggers commands via Main.executeCommand.
 */

const readline = require("node:readline");

/**
 * @class CommandBus
 * @description 命令总线组件  Command bus component
 */
class CommandBus {
    /**
     * @param {object} logger - 日志单例，用于打印命令信息与刷新终端提示符
     *   The logger singleton, used to print command info and refresh the terminal prompt
     */
    constructor(logger) {
        /** @type {object} logger - 日志单例  Logger singleton */
        this.logger = logger;
        /** @type {Record<string, Function[]>} commands - 命令注册表  Command registry */
        this.commands = {};
        /** @type {import("node:readline").Interface|null} rl - readline 接口  readline interface */
        this.rl = null;
        // 内置命令  Built-in commands
        this.register("help", () => this._showHelp());
    }

    /**
     * 注册命令  Register a command
     * @param {string} name - 命令名  Command name
     * @param {Function} handler - 处理函数  Handler
     * @returns {this}
     */
    register(name, handler) {
        if (typeof name !== "string" || typeof handler !== "function") {
            return this;
        }
        this.commands[name]
            ? this.commands[name].push(handler)
            : (this.commands[name] = [handler]);
        return this;
    }

    /**
     * 批量注册命令  Register commands in batch
     * @param {Record<string, Function>} commands - 命令对象  Command map
     * @returns {this}
     */
    registerBatch(commands) {
        Object.entries(commands).forEach(([name, handler]) => {
            this.register(name, handler);
        });
        return this;
    }

    /**
     * 触发命令（供 API 等调用方使用）  Execute a command (for API and other callers)
     * @param {string} name - 命令名  Command name
     * @param {...any} args - 参数  Arguments
     * @returns {boolean} 是否命中命令  Whether a handler was invoked
     */
    execute(name, ...args) {
        if (this.commands[name]) {
            this.commands[name].forEach((cb) => cb(args));
            return true;
        }
        if (this.logger && typeof this.logger.warn === "function") {
            this.logger.warn(`Unknown command: ${name}`);
        }
        return false;
    }

    /**
     * 显示帮助  Show help
     * @private
     */
    _showHelp() {
        if (this.logger && typeof this.logger.info === "function") {
            this.logger.info("Available commands:");
            Object.keys(this.commands).forEach((cmd) => {
                this.logger.info(`- ${cmd}`);
            });
        }
    }

    /**
     * 初始化终端输入  Initialize terminal input
     * @returns {this}
     */
    initTerminal() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "[ GoFA ] > ",
        });
        this.rl.on("line", (input) => {
            const [cmd, ...args] = input.trim().split(" ");
            this.execute(cmd, ...args);
            this.rl?.prompt();
        });
        // 让日志库能刷新终端提示符  Let the logger refresh the terminal prompt
        if (this.logger) {
            this.logger.rl = this.rl;
        }
        return this;
    }
}

module.exports = CommandBus;
