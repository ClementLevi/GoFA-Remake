/**
 * 随机输出可迭代对象中的一个元素
 * Randomly choose an element from an iterable object
 * @param {Iterable<*>} iterable - 可迭代对象
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
 * @param {Iterable<*>} iterable - 可迭代对象
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
 * @param {string} str a string requires to uppercase the initial characters
 * @returns {string} titlelized string
 */
module.exports.titleCase = function titleCase(str) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
};
/**
 *
 * 将二维字符串数组做笛卡尔积后拼接
 * @param {string[][]} arrays 二维字符串数组
 * @return {string[]}
 */
function cartesianProduct(arrays) {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0];

    function cartesianProductOfTwo(
        /** @type {Array<number|string>} */ arr1,
        /** @type {Array<number|string>} */ arr2
    ) {
        const result = [];
        for (let i = 0; i < arr1.length; i++) {
            for (let j = 0; j < arr2.length; j++) {
                // @ts-ignore: 运算符“+”不能应用于类型“string | number”和“string | number”。ts(2365) 让它隐式转换吧
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
 * @param {string[][]} arrays 二维字符串数组
 * @return {number}
 */
module.exports.cartesianProductCount = function cartesianProductCount(arrays) {
    return cartesianProduct(arrays).length;
};

/**
 * 判断两数是否在同一个数量级
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
module.exports.compareLog10Integers = function compareLog10Integers(a, b) {
    // 将 a 和 b 转换为整数
    let intA = Math.abs(Math.round(a * 1e10));
    let intB = Math.abs(Math.round(b * 1e10));

    return Math.floor(Math.log10(intA)) === Math.floor(Math.log10(intB));
};

/**
 * 生成坐标网格
 * @param {number} width
 * @param {number} height
 * @returns {number[][]}
 * @typedef {import('../../GoFA-Remake/game_entities/atlas/pos/Pos2d')} Pos2d
 * @sees {@link Pos2d}
 */
module.exports.newPositionedGrid = function newPositionedGrid(width, height) {
    let ret = Array(height)
        .fill(null)
        .map(() => Array(width).fill(null));
    ret = ret.map((row, y) => row.map((cell, x) => ({ x, y })));
    return ret;
};

/**
 * Remap a value from one range to another range, keeping the ratio.
 * 将一个值从一个区间映射到另一个区间，保持比例不变。
 * In terms of range and ratio, it refers to the relative position of the value in the old range to the new range are equal.
 * 就范围和比例而言，它是指旧范围中值的相对位置与新范围中值的相对位置相同。
 * @param {number} value any number, which {value | value ∈ [old_min, old_max]}
 * @param {number} new_min
 * @param {number} new_max
 * @param {number} [old_min=0]
 * @param {number} [old_max=1]
 * @return {number}
 */
module.exports.linearRemap = function linearRemap(
    value,
    new_min,
    new_max,
    old_min = 0,
    old_max = 1
) {
    return (
        ((value - old_min) * (new_max - new_min)) / (old_max - old_min) +
        new_min
    );
};

/**
 * Construct a 2D array with a given value filled in.
 * @template {any} T
 * @param {number} width
 * @param {number} height
 * @param {T} value
 * @returns {T[][]} value
 */
module.exports.newArray2D = function newArray2D(width, height, value) {
    return Array(height)
        .fill(null)
        .map(() => Array(width).fill(value));
};

/**
 * Transpose a 2D array. 转置二维数组。
 * @template {any} T
 * @param {T[][]} arr
 * @returns {T[][]}
 */
module.exports.transposeArray2D = function transposeArray2D(arr) {
    if (!Array.isArray(arr) || !Array.isArray(arr[0])) {
        throw new TypeError("输入必须是一个二维数组");
    }
    return arr[0].map((_, colIndex) => arr.map((row) => row[colIndex]));
};

/**
 * Flip a 2D array. 翻转二维数组。
 * @template {any} T
 * @param {T[][]} arr
 * @param {'x'|'y'} [axis='y'] Flip along the x-axis or y-axis. 翻转对称轴
 * @returns {T[][]}
 */
module.exports.flipArray2D = function flipArray2D(arr, axis = "y") {
    if (!Array.isArray(arr) || !Array.isArray(arr[0])) {
        throw new TypeError(`arr (${typeof arr}) is not a 2D array.`);
    }
    switch (axis) {
        case "y": {
            // Flip along the y-axis (horizontal flip)
            return arr.map((row) => row.slice().reverse());
        }
        case "x": {
            // Flip along the x-axis (vertical flip)
            return arr.slice().reverse();
        }
        default: {
            throw new TypeError(`axis (${axis}) must be either "x" or "y".`);
        }
    }
};

/**
 * Check if something is an array of arrays.
 * @param {any} arr
 * @returns {boolean}
 */
module.exports.isArray2D = function isArray2D(arr) {
    if (!Array.isArray(arr)) {
        return false;
    }
    return arr.every((subArray) => Array.isArray(subArray));
};
