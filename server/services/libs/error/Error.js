// Do I really need this to formulate all errors?
/**
 * @description Instantiating an abstract class.
 */

/*
Note:JavaScript has built-in error types:
- EvalError
- InternalError
- RangeError
- ReferenceError
- SyntaxError
- TypeError
- URIError
- AggregateError (ES2021)
*/

/**
 * @package
 */
class CustomBaseError extends Error {
    constructor(message) {
        super(message);
        if ("captureStackTrace" in Error) {
            // Avoid MyError itself in the stack trace
            Error.captureStackTrace(this, CustomBaseError);
        }
        this.name = this.constructor.name;
    }
}

class AbstractClassError extends CustomBaseError {
    constructor(message) {
        super(message);
    }
}

/**
 * @description A/Some value(s) is/are not valid.
 */
class ValueError extends CustomBaseError {
    constructor(message, value) {
        super(message);
        this.value = value;
    }
}

/**
 * @description Configuration is not valid during some initialization processes.
 */
class ConfigError extends CustomBaseError {
    constructor(message) {
        super(message);
    }
}

/**
 * @description Improper use of an object before initialization.
 */
class InitializationViolationError extends CustomBaseError {
    constructor(message) {
        super(message);
    }
}

module.exports = {
    AbstractClassError,
    ValueError,
    ConfigError,
    InitializationViolationError,
};

if (require.main === module) {
    /** @example */
    // AbstractClassError example
    try {
        throw new AbstractClassError("Cannot instantiate abstract class");
    } catch (e) {
        console.error(`${e.name}: ${e.message}`);
    }

    // ValueError example
    try {
        throw new ValueError("Invalid value provided", 42);
    } catch (e) {
        console.error(`${e.name}: ${e.message} (value: ${e.value})`);
    }

    // ConfigError example
    try {
        throw new ConfigError("Missing required configuration");
    } catch (e) {
        console.error(`${e.name}: ${e.message}`);
    }

    // InitializationViolationError example
    try {
        throw new InitializationViolationError("Object used before initialization");
    } catch (e) {
        console.error(`${e.name}: ${e.message}`);
    }
}