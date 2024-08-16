const assert = require('assert');
const path = require("path")
const { Logger } = require(path.resolve('services/libs/shared/logger'));

describe('Logger', function() {
    let logger;

    beforeEach(function() {
        logger = new Logger();
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

    it('log should output to console and file when configured', function() {
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

        // Mock logger method for file output
        logger.logger.info = function(message) {
            assert.strictEqual(message, "Test log message");
        };

        logger.log("info", "Test log message");

        console.log = consoleLog;
    });
});