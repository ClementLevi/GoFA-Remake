const readLine = require("readline");
/**
 * 当前使用的命令行对象。该对象由readline模块创建。
 * The 'Command Line' object on use, which is created by 'readline' module.
 */
const COMMAND_LINE = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * 将字符串与某个回调函数绑定，当命令行对象触发于"line"事件时可以根据入参字符串匹配并调用该函数。
 * Bind a string parameter, which triggers a 'line' event of the 'Command Line',
 * to a callback function, which should be called when the string is matched.
 * @param {String} commandName 
 * @param {Function} handlerCall 
 */
function registerCommand(commandName, handlerCall) {
    COMMAND_LINE.on("line", (input) => {
        const [cmd, ...args] = input.trim().split(" ");
        if (cmd === commandName) {
            handlerCall(args);
        }
    });
}

COMMAND_LINE.setPrompt("[ GoFA ] >>> ");
COMMAND_LINE.prompt();

module.exports = {
    COMMAND_LINE,
    registerCommand
};
