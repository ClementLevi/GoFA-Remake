const assert = require('assert');
const path = require("path")
// logger 模块导出的是单例实例（module.exports = singleton(new Logger())），
// 其 Proxy 目标为实例而非类，不能 `new`，直接复用该实例即可。
const Logger = require(path.resolve('services/libs/shared/logger'));

describe('Logger', function() {
    let logger;

    beforeEach(function() {
        logger = Logger;
    });

    it('setConfig should update the configuration correctly', function() {
        const customConfig = {
            info: {
                color: "green",
                symbol: "success",
                output: ["console"]
            }
        };
        logger.setConfig(customConfig);
        assert.deepStrictEqual(logger.config.info, customConfig.info);
    });

    it('info should log an information message to console', function() {
        const consoleLog = console.log;
        console.log = function(message) {
            assert.strictEqual(message.includes("Test information message"), true);
        };
        logger.info("Test information message");
        console.log = consoleLog;
    });

    it('warn should log a warning message to console', function() {
        const consoleLog = console.log;
        console.log = function(message) {
            assert.strictEqual(message.includes("Test warning message"), true);
        };
        logger.warn("Test warning message");
        console.log = consoleLog;
    });

    it('error should log an error message to console', function() {
        const consoleLog = console.log;
        console.log = function(message) {
            assert.strictEqual(message.includes("Test error message"), true);
        };
        logger.error("Test error message");
        console.log = consoleLog;
    });

    it('startSpinner should display the spinner with the correct text', function() {
        const spinnerText = "Loading...";
        logger.startSpinner(spinnerText);
        assert.strictEqual(logger.spinner.text, spinnerText);
        logger.stopSpinner();
    });

    it('stopSpinner should stop the spinner', function() {
        logger.startSpinner("Loading...");
        logger.stopSpinner();
        assert.strictEqual(logger.spinner.isSpinning, false);
    });

    it('info should output to console and file when configured', function() {
        const customConfig = {
            info: {
                color: "green",
                symbol: "success",
                output: ["console", "file"]
            }
        };
        logger.setConfig(customConfig);

        const consoleLog = console.log;
        console.log = function(message) {
            assert.strictEqual(message.includes("Test log message"), true);
        };

        // Mock logger method for file output（_log 以数组形式透传消息参数）
        const originalLoggerInfo = logger.logger.info;
        logger.logger.info = function(message) {
            assert.strictEqual(message[0], "Test log message");
        };

        try {
            logger.info("Test log message");
        } finally {
            console.log = consoleLog;
            logger.logger.info = originalLoggerInfo;
        }
    });
});