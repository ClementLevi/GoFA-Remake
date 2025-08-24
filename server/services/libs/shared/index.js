/**
 * 随机输出可迭代对象中的一个元素
 * Randomly choose an element from an iterable object
 * @param {Iterable} iterable - 可迭代对象
 * @returns {*} - 随机选择的元素
 */
module.exports.ranchoice = function ranchoice(iterable) {
    if (typeof iterable[Symbol.iterator] !== "function") {
        throw new TypeError("argument `iterable` must be an iterable object");
    }
    const iterableArray = Array.from(iterable);
    if (iterableArray.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * iterableArray.length);
    return iterableArray[randomIndex];
};

/**
 * 随机弹出可迭代对象中的一个值
 * Randomly pop an element from an iterable object
 * @param {Iterable} iterable - 可迭代对象
 * @returns {*} - 随机弹出的值
 */
module.exports.randomPop = function randomPop(iterable) {
    if (typeof iterable[Symbol.iterator] !== "function") {
        throw new TypeError("argument `iterable` must be an iterable object");
    }
    const iterableArray = Array.from(iterable);
    if (iterableArray.length === 0) {
        throw new Error("iterable is empty");
    }
    const randomIndex = Math.floor(Math.random() * iterableArray.length);
    const randomValue = iterableArray[randomIndex];
    if (iterable instanceof Set) {
        iterable.delete(randomValue);
    } else if (Array.isArray(iterable)) {
        iterable.splice(randomIndex, 1);
    }
    return randomValue;
};

/**
 * 字符串首字母大写（标题化）
 * Uppercase the char after spaces (titlelization)
 * @param {String} str a string requires to uppercase the initial characters
 * @returns {String} titlelized string
 */
module.exports.titleCase = function titleCase(str) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
};
/**
 *
 * 将二维字符串数组做笛卡尔积后拼接
 * @param {Array<Array<String>>} arrays 二维字符串数组
 * @return {Array<String>}
 */
function cartesianProduct(arrays) {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0];

    function cartesianProductOfTwo(arr1, arr2) {
        const result = [];
        for (let i = 0; i < arr1.length; i++) {
            for (let j = 0; j < arr2.length; j++) {
                result.push(arr1[i] + arr2[j]);
            }
        }
        return result;
    }

    const firstTwo = cartesianProductOfTwo(arrays[0], arrays[1]);
    const rest = arrays.slice(2);
    const combined = [firstTwo, ...rest];

    return cartesianProduct(combined);
}

module.exports.cartesianProduct = cartesianProduct;
/**
 * 计算多个二维字符串数组之间做笛卡尔积时可能的结果数量
 * @param {Array<Array<String>>} arrays 二维字符串数组
 * @return {Number}
 */
module.exports.cartesianProductCount = function cartesianProductCount(arrays) {
    return cartesianProduct(arrays).length;
};

/**
 * 判断两数是否在同一个数量级
 * @param {Number} a
 * @param {Number} b
 * @returns {Boolean}
 */
module.exports.compareLog10Integers = function compareLog10Integers(a, b) {
    // 将 a 和 b 转换为整数
    let intA = Math.abs(Math.round(a * 1e10));
    let intB = Math.abs(Math.round(b * 1e10));

    return Math.floor(Math.log10(intA)) === Math.floor(Math.log10(intB));
};