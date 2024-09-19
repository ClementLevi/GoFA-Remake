const v8 = require("node:v8");

/**
 * 序列化器 / Serializer
 * 基于 Node.js 的 v8 序列化器，用于序列化和反序列化 JavaScript 对象。
 * A serializer and deserializer based on Node.js' v8 serializer, used to serialize and deserialize JavaScript objects.
 * @requires node:v8
 */
class Serializer {
    /**
     * 将函数转换为字符串 / Convert a function to a string
     * @param {*} func - 要转换的函数 / The function to convert
     * @returns {string} 函数定义的源代码 / The source code of the function definition
     */
    static functionToString(func) {
        const source = func.toString();
        return source;
        // 匹配函数名，注意匹配具名函数、匿名函数和箭头函数
        // Match the function name, accounting for named functions, anonymous functions, and arrow functions
        // 具名函数：function funcName() {...} / Named function: function funcName() {...}
        // 匿名函数：function () {...} / Anonymous function: function () {...}
        // 箭头函数：() => {...} / Arrow function: () => {...}
        // let _name = firstLine.match(/^function\s+(\w+)\s*\(/);
        // const functionName = _name ? _name : "Anonymous Function";

        // const functionBody = lines.join("\n");
        // return `function ${functionName}() {${functionBody}}`;
    }

    /**
     * 序列化对象 / Serialize an object
     * @param {Object|number|string|boolean|null} obj - 要序列化的对象 / The object to serialize
     * @returns {Buffer} 序列化后的 Buffer 对象 / The serialized Buffer object
     */
    static serialize(obj) {
        if (obj instanceof Object && !(obj instanceof Array)) {
            return Serializer.safeSerialize(obj);
        }
        return v8.serialize(obj);
    }

    /**
     * 安全序列化函数 / Safely serialize a function
     * @param {Object} obj - 要序列化的对象 / The object to serialize
     * @param {boolean} suppressFunctionDetails - 是否隐藏函数定义的源代码，默认为隐藏 / Whether to suppress function definition details, default is true to suppress
     * @returns {Buffer} 序列化后的 Buffer 对象 / The serialized Buffer object
     */
    static safeSerialize(obj, suppressFunctionDetails = true) {
        // 遍历对象的每个属性，检查是否为函数 / Iterate over each property of the object to check if it's a function
        for (const key in obj) {
            if (typeof obj[key] === "function") {
                // 获取函数定义部分，将函数定义的源代码转换为字符串。 / Get the function definition and convert it to a string.
                if (!suppressFunctionDetails) {
                    obj[key] = Serializer.functionToString(obj[key]);
                } else {
                    obj[key] = "<Function " + key + ">"; // 函数名称 / Function name
                }
            }
        }
        // 将 Buffer 对象返回 / Return the Buffer object
        return v8.serialize(obj);
    }

    /**
     * 反序列化 Buffer 对象 / Deserialize a Buffer object
     * @param {Buffer} str - 要反序列化的 Buffer 对象 / The Buffer object to deserialize
     * @returns {any} 反序列化后的对象 / The deserialized object
     */
    static deserialize(str) {
        return v8.deserialize(str);
    }
}

// 作为模块主入口时执行的代码 / Code executed as the main entry point of the module
if (require.main === module) {
    const obj = {
        a: 1,
        b: "2",
        c: true,
        d: new Date(),
        e: {
            f: 3,
            g: "4",
            h: true,
            i: null,
        },
        j: function (k = "default") {
            return `Hello, ${k}!`; // 向函数传递参数 / Passing arguments to the function
        },
    };

    const serialized = Serializer.serialize(obj);
    console.log(serialized);
    const deserialized = Serializer.deserialize(serialized);

    console.log(deserialized);
}

module.exports = Serializer;
