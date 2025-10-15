const path = require("node:path");
const { ValueError } = require(path.resolve(__dirname + "/../error/Error"));
/**
 * @template {number} T
 * @template {number} F
 * @typedef {import('../types/types').IntRange<T,F>} IntRange
 * @typedef {IntRange<0,255>} ColorValue
 */

/**
 * @typedef {[ColorValue<0,255>,ColorValue<0,255>,ColorValue<0,255>,ColorValue<0,255>?]} PixelArgsOverload1
 * @typedef {number} PixelArgsOverload2
 * @typedef {string | number} PixelArgsOverload3
 */

class Pixel {
    /**
     * @type {new (arg0: PixelArgsOverload1 | PixelArgsOverload2 | PixelArgsOverload3)=> void}
     */
    constructor() {
        /** @type {ColorValue<0,255>} */
        this.r = 255;
        /** @type {ColorValue<0,255>} */
        this.g = 255;
        /** @type {ColorValue<0,255>} */
        this.b = 255;
        /** @type {ColorValue<0,255>} */
        this.a = 255;
        switch (arguments.length) {
            case 4: {
                this.r = arguments[0] ?? 255;
                this.g = arguments[1] ?? 255;
                this.b = arguments[2] ?? 255;
                this.a = arguments[3] ?? 255;
                break;
            }
            case 3: {
                this.r = arguments[0] ?? 255;
                this.g = arguments[1] ?? 255;
                this.b = arguments[2] ?? 255;
                this.a = 255;
                break;
            }
            case 1: {
                let value = arguments[0];
                if (typeof value === "string") {
                    value = parseInt(value.replace("#", ""), 16);
                }
                if (isNaN(value)) {
                    throw new ValueError("Invalid color value");
                }
                // r, g, b, a 都必然是 0-255 的整数
                // @ts-ignore
                this.r = Math.min(value >> 24, 0xff);
                // @ts-ignore
                this.g = Math.min(value >> 16, 0xff);
                // @ts-ignore
                this.b = Math.min(value >> 8, 0xff);
                // @ts-ignore
                this.a = value & 0xff;
                break;
            }
            default: {
                throw new ValueError("Invalid arguments");
            }
        }
    }

    /**
     *
     * @returns {number} 无符号整数
     */
    valueOf() {
        // 使用无符号的右移操作符
        return ((this.r << 24) | (this.g << 16) | (this.b << 8) | this.a) >>> 0;
    }

    toString() {
        return `0x${this.valueOf().toString(16).padStart(8, "0")}`; // 格式化输出为 0xRRGGBBAA 形式
    }
    /**
     *
     * @param {number} n
     * @returns {Pixel}
     */
    addNumber(n) {
        return new Pixel(
            Math.min(this.r + n, 255),
            Math.min(this.g + n, 255),
            Math.min(this.b + n, 255),
            this.a
        );
    }
    /**
     * @description 从平凡的三元或四元数组转换为像素
     * @template {number[]} T
     * @param {T extends {length: 3|4} ? T : never} arr
     * @returns {this}
     */
    fromSimpleArray(arr) {
        // 如果数组有 3 个元素，假设为 RGB
        if (arr.length === 3) {
            this.r = arr[0];
            this.g = arr[1];
            this.b = arr[2];
            this.a = 255;
        }
        // 如果数组有 4 个元素，假设为 RGBA
        else if (arr.length === 4) {
            this.r = arr[0];
            this.g = arr[1];
            this.b = arr[2];
            this.a = arr[3];
        }
        return this;
    }
    /**
     *
     * @param {Pixel} other
     * @returns {boolean}
     */
    greaterThan(other) {
        return this.valueOf() > other.valueOf();
    }
    /**
     * flip the color of the pixel
     * @param {("R"|"G"|"B"|"A")?} [bit]
     * @returns {Pixel}
     */
    flip(bit = null) {
        switch (bit) {
            // Intentional fall through 故意依次执行
            case "R": {
                this.r = 255 - this.r;
            }
            case "G": {
                this.g = 255 - this.g;
            }
            case "B": {
                this.b = 255 - this.b;
            }
            case "A": {
                this.a = 255 - this.a;
            }
            default: {
                this.r = 255 - this.r;
                this.g = 255 - this.g;
                this.b = 255 - this.b;
                break;
            }
        }
        return this;
    }
    flipAlpha() {
        this.a = 255 - this.a;
        return this;
    }
    flipAll() {
        this.r = 255 - this.r;
        this.g = 255 - this.g;
        this.b = 255 - this.b;
        this.a = 255 - this.a;
        return this;
    }
    /**
     *
     * @param {Pixel} other
     * @returns {Pixel}
     */
    mix(other) {
        return new Pixel(
            Math.floor((this.r + other.r) / 2),
            Math.floor((this.g + other.g) / 2),
            Math.floor((this.b + other.b) / 2),
            Math.floor((this.a + other.a) / 2)
        );
    }
    /**
     *
     * @param {Number} n
     * @returns {Pixel}
     */
    multiply(n) {
        return new Pixel(
            Math.min(Math.floor(this.r * n), 255),
            Math.min(Math.floor(this.g * n), 255),
            Math.min(Math.floor(this.b * n), 255),
            this.a
        );
    }
    /**
     *
     * @param {Pixel} other
     * @returns {Pixel}
     */
    subtract(other) {
        return new Pixel(
            Math.max(this.r - other.r, 0),
            Math.max(this.g - other.g, 0),
            Math.max(this.b - other.b, 0),
            this.a
        );
    }
    /**
     *
     * @param {Pixel} other
     * @returns {Pixel}
     */
    add(other) {
        return new Pixel(
            Math.min(this.r + other.r, 255),
            Math.min(this.g + other.g, 255),
            Math.min(this.b + other.b, 255),
            this.a
        );
    }
}

// Pixel.prototype.valueOf = function () {
//     return this.addNumber.bind(this);
// };

module.exports = Pixel;

if (require.main === module) {
    let testPixel = new Pixel(0, 0, 0, 255);
    console.log(testPixel.valueOf()); // 预期输出:255
    let anotherPixel = new Pixel(255, 128, 0, 255);
    console.log(testPixel > anotherPixel); // 比较两个像素值的大小
    let flippedPixel = new Pixel(255, 0, 0, 255);
    console.log(flippedPixel.toString()); // 预期输出：0xff0000ff
    console.log(flippedPixel.toString()); // 预期输出：0x00ffffff
}
