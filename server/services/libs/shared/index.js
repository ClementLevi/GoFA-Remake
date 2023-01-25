/**
 * 随机输出数组元素
 * Randomly choose an element from an array
 * @param {Array|String} list
 * @returns {*|Null} an element randomly chosen from given array or string
 */
exports.ranchoice = function ranchoice(list) {
    if ((!(list instanceof Array)) && !(typeof(list) == "string")) {
        throw new TypeError("argument `list` must be an instance of array or string");
    }
    switch (list instanceof Array) {
        case true:
            return list[Math.floor(Math.random() * list.length)];
        case false:
            return list[Math.floor(Math.random() * list.length)];
    }
};

/**
 * 字符串首字母大写（标题化）
 * Uppercase the char after spaces (titlelization)
 * @param {String} str a string requires to uppercase the initial characters
 * @returns {String} titlelized string
 */
exports.titleCase = function titleCase(str) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
};

// console.log(this.ranchoice("What the fuck"));
// console.log(this.titleCase("What the fuck"));
// console.log(this.ranchoice(this.titleCase("What the fuck")));
console.log(">> Module `common-functions-GoFA` loaded.");