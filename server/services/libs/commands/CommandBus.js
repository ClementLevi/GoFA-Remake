/**
 * @module CommandBus
 * @description 控制台命令总线：命令注册表 + 终端输入 + 命令触发。
 *  与日志解耦（Logger 只负责日志），由 Main 持有本组件；API 通过 Main.executeCommand 触发命令。
 *  Console command bus: registry + terminal input + dispatch. Decoupled from the logger,
 *  owned by Main; API triggers commands via Main.executeCommand.
 *
 *  v0.2 增强：
 *   - register 支持 meta（description/usage/category），help 按分类分组展示；
 *   - executeAsync 异步执行并收集 ctx.reply 输出（供 API 远程控制台使用）；
 *   - 命令处理函数签名统一为 (args: string[], ctx: CommandContext) => void | Promise<void>，
 *     ctx.reply 将结果写入当前通道（终端→日志，API→输出收集器）。
 */

const path = require("node:path");
const readline = require("node:readline");

const AppContext = require(path.resolve(__dirname, "../shared/AppContext"));

/**
 * @typedef {object} CommandMeta
 * @property {string} [description] - 一句话说明  One-line description
 * @property {string} [usage] - 用法示例（不含指令名）  Usage hint (without command name)
 * @property {string} [category] - 分类  Category (monitor/management/data/event/...)
 * @property {string} [permission] - 权限级别（预留）  Permission level (reserved)
 */

/**
 * @typedef {object} CommandContext
 * @property {string} name - 指令名  Command name
 * @property {string[]} args - 参数数组  Arguments
 * @property {object|null} main - Main 单例（经 AppContext 解析）  Main singleton
 * @property {(text: string) => void} reply - 输出通道  Output channel
 */

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
        /**
         * @type {Record<string, {handlers: Function[], meta: CommandMeta}>}
         * 命令注册表  Command registry
         */
        this.commands = {};
        /** @type {import("node:readline").Interface|null} rl - readline 接口  readline interface */
        this.rl = null;
        // 内置命令  Built-in commands
        this.register(
            "help",
            (args, ctx) => this._showHelp(args[0], ctx),
            {
                description: "显示可用指令（help <分类> 查看分类）",
                usage: "help [monitor|management|data|event|...]",
                category: "management",
            }
        );
    }

    /**
     * 注册命令  Register a command
     * @param {string} name - 命令名  Command name
     * @param {Function} handler - 处理函数 (args, ctx) => void | Promise<void>  Handler
     * @param {CommandMeta} [meta] - 命令元信息  Command metadata
     * @returns {this}
     */
    register(name, handler, meta = {}) {
        if (typeof name !== "string" || typeof handler !== "function") {
            return this;
        }
        if (!this.commands[name]) {
            this.commands[name] = {
                handlers: [],
                meta: {
                    description: "",
                    usage: name,
                    category: "other",
                    permission: "admin",
                    ...meta,
                },
            };
        }
        this.commands[name].handlers.push(handler);
        return this;
    }

    /**
     * 批量注册命令  Register commands in batch
     * 支持两种条目：{ name: handler } 或 { name: { handler, meta } }。
     * Supports entries as plain handlers or { handler, meta } objects.
     * @param {Record<string, Function | {handler: Function, meta?: CommandMeta}>} commands
     * @returns {this}
     */
    registerBatch(commands) {
        Object.entries(commands ?? {}).forEach(([name, entry]) => {
            if (typeof entry === "function") {
                this.register(name, entry);
            } else if (entry && typeof entry.handler === "function") {
                this.register(name, entry.handler, entry.meta ?? {});
            }
        });
        return this;
    }

    /**
     * 列出已注册命令（元信息），供 help / API 使用  List registered commands with meta
     * @returns {Array<{name: string, usage: string, description: string, category: string}>}
     */
    listCommands() {
        return Object.entries(this.commands).map(([name, entry]) => ({
            name,
            usage: entry.meta.usage ?? name,
            description: entry.meta.description ?? "",
            category: entry.meta.category ?? "other",
        }));
    }

    /**
     * 构建命令执行上下文  Build the command execution context
     * @private
     * @param {string} name - 指令名  Command name
     * @param {string[]} args - 参数  Arguments
     * @param {string[]|null} output - 输出收集器（API 模式）；null 则走日志  Output collector or null
     * @returns {CommandContext}
     */
    _buildContext(name, args, output) {
        return {
            name,
            args,
            main: AppContext.getMain(),
            reply: (text) => {
                const line = String(text);
                if (output) {
                    output.push(line);
                } else if (this.logger && typeof this.logger.info === "function") {
                    this.logger.info(line);
                }
            },
        };
    }

    /**
     * 触发命令（供终端等调用方使用，同步、fire-and-forget）  Execute a command (sync)
     * 同步模式：ctx.reply 输出到日志；异步处理函数的结果不等待（异常捕获后记日志）。
     * Sync mode: reply writes to the logger; async handler results are not awaited (errors are logged).
     * @param {string} name - 命令名  Command name
     * @param {...string} args - 参数  Arguments
     * @returns {boolean} 是否命中命令  Whether a handler was invoked
     */
    execute(name, ...args) {
        const entry = this.commands[name];
        if (!entry || entry.handlers.length === 0) {
            this.logger?.warn?.(`Unknown command: ${name}`);
            return false;
        }
        const ctx = this._buildContext(name, args, null);
        for (const handler of entry.handlers) {
            try {
                const result = handler(args, ctx);
                if (result && typeof result.catch === "function") {
                    result.catch((err) =>
                        this.logger?.error?.(
                            `[${name}] ${err?.message ?? err}`
                        )
                    );
                }
            } catch (err) {
                this.logger?.error?.(`[${name}] ${err?.message ?? err}`);
            }
        }
        return true;
    }

    /**
     * 异步触发命令并收集输出（供 API 远程控制台使用）  Execute a command (async, output collected)
     * @param {string} name - 命令名  Command name
     * @param {...string} args - 参数  Arguments
     * @returns {Promise<{found: boolean, output: string[]}>}
     */
    async executeAsync(name, ...args) {
        const output = [];
        const entry = this.commands[name];
        if (!entry || entry.handlers.length === 0) {
            this.logger?.warn?.(`Unknown command: ${name}`);
            return { found: false, output };
        }
        const ctx = this._buildContext(name, args, output);
        for (const handler of entry.handlers) {
            try {
                await handler(args, ctx);
            } catch (err) {
                output.push(`[${name}] ${err?.message ?? err}`);
            }
        }
        return { found: true, output };
    }

    /**
     * 显示帮助（按分类分组）  Show help grouped by category
     * @private
     * @param {string} [category] - 指定分类  Optional category filter
     * @param {CommandContext} [ctx] - 执行上下文  Context
     */
    _showHelp(category, ctx) {
        const reply = ctx?.reply ?? ((text) => this.logger?.info?.(text));
        const entries = Object.entries(this.commands);
        if (category) {
            const list = entries.filter(
                ([, entry]) => entry.meta.category === category
            );
            reply(`[help] 分类「${category}」指令：`);
            if (list.length === 0) {
                reply("  （该分类暂无指令）");
                return;
            }
            list.forEach(([name, entry]) => {
                const usage = entry.meta.usage ?? name;
                const desc = entry.meta.description ?? "";
                reply(`  ${name}${usage === name ? "" : ` ${usage}`} — ${desc}`);
            });
            return;
        }
        reply("[help] GoFA-Remake 内置指令（help <分类> 查看详情）：");
        /** @type {Record<string, string[]>} */
        const groups = {};
        for (const [name, entry] of entries) {
            const cat = entry.meta.category ?? "other";
            (groups[cat] ??= []).push(name);
        }
        for (const cat of Object.keys(groups)) {
            reply(`  [${cat}] ${groups[cat].join(", ")}`);
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
            if (cmd) {
                this.execute(cmd, ...args);
            }
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
