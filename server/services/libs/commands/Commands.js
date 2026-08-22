/**
 * @module commands
 * @description 存放游戏业务控制台命令；由 Main 注册到 CommandBus。
 *  核心命令（exit/help）由 CommandBus 内置或 Main 绑定，不在此处。
 * Game domain console commands; registered into CommandBus by Main.
 * Core commands (exit/help) are built into CommandBus or bound by Main, not here.
 */
const Commands = {};

module.exports = Commands;
