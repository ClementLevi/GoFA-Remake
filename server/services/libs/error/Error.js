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

class AbstractClassError extends Error {
    constructor(message) {
        super(message);
    }
}

/**
 * @description A/Some value is/are not valid.
 */
class ValueError extends Error {
    constructor(message, value) {
        super(message);
        this.value = value;
    }
}

/**
 * @description Configuration is not valid during some initialization processes.
 */
class ConfigError extends Error {
    constructor(message) {
        super(message);
    }
}

module.exports = {
    AbstractClassError,
    ValueError,
    ConfigError,
};
