/**
 * @module commands
 * @description 存放控制台命令；由 Main 持有并注册到 CommandBus。
 *  命令处理函数签名：handler(args)，args 为参数数组。
 * Console command storage; registered into CommandBus by Main.
 * Handler signature: handler(args), where args is the argument array.
 */
const Commands = {
    /**
     * @function exit
     * @description 退出程序（硬退出）  Exit the program (hard exit)
     */
    exit: function () {
        process.exit();
    },
};

module.exports = Commands;
