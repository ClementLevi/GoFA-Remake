const Log = require(__dirname + "/../shared/logger");

/**
 * @module commands
 * @description 存放控制台命令，使用迭代器模式注册到Logger的命令系统
 * Console commands storage, using iterator pattern to register with Logger's command system
 */
const Commands = {
    /**
     * @function exit
     * @description 退出程序
     * Exit the program
     */
    exit: function() {
        process.exit();
    },

    /**
     * @function help
     * @description 显示可用命令
     * Show available commands
     */
    help: function() {
        Log.info("Available commands:");
        Object.keys(Log.commands).forEach(cmd => {
            Log.info(`- ${cmd}`);
        });
    }
};

// Register all commands using iterator pattern
Object.entries(Commands).forEach(([name, handler]) => {
    Log.registerCommand(name, handler);
});

module.exports = Commands;

if (require.main === module) {
    Log.info("Commands module initialized with iterator registration");
    Log.rl.prompt();
}
