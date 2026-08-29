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
 * @typedef {bigint} PixelArgsOverload2
 * @typedef {string | number} PixelArgsOverload3
 */

class Pixel {
    /**
     * @see {@link PixelArgsOverload1}
     * @see {@link PixelArgsOverload2}
     * @see {@link PixelArgsOverload3}
     * @type {(new (r:ColorValue<0,255>,g:ColorValue<0,255>,b:ColorValue<0,255>,a:ColorValue<0,255>?)=>void) |
     * (new (color:bigint)=>void) |
     * (new (hex_color: string | number)=>void)}
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
                    if (
                        !/^#([\da-fA-F]{3}|[\da-fA-F]{6}|[\da-fA-F]{8})$/.test(
                            value
                        )
                    )
                        throw new ValueError("Invalid arguments: ", arguments);
                    let hex = value.replace("#", "");
                    if (hex.length === 3) {
                        // #RGB → #RRGGBBAA（每 nibble 翻倍，alpha 取 255）
                        hex =
                            hex
                                .split("")
                                .map((c) => c + c)
                                .join("") + "ff";
                    } else if (hex.length === 6) {
                        // #RRGGBB → #RRGGBBAA（alpha 取 255）
                        hex = hex + "ff";
                    }
                    value = parseInt(hex, 16); // 0xRRGGBBAA
                }
                if (value.constructor.name === "BigInt") {
                    // r, g, b, a 都必然是 0-255 的整数（0xRRGGBBAA 布局）
                    this.r = /** @type {ColorValue<0,255>} */ (Number((value & 0xff000000n) >> 24n));
                    this.g = /** @type {ColorValue<0,255>} */ (Number((value & 0xff0000n) >> 16n));
                    this.b = /** @type {ColorValue<0,255>} */ (Number((value & 0xff00n) >> 8n));
                    this.a = /** @type {ColorValue<0,255>} */ (Number(value & 0xffn));
                    break;
                }
                if (Number.isInteger(value)) {
                    // 0xRRGGBBAA 布局，与 BigInt 分支、valueOf、toString 保持一致。
                    // 使用无符号右移，兼容 >= 2^31 的颜色值（如 0xff0000ff）。
                    this.r = /** @type {ColorValue<0,255>} */ ((value >>> 24) & 0xff);
                    this.g = /** @type {ColorValue<0,255>} */ ((value >>> 16) & 0xff);
                    this.b = /** @type {ColorValue<0,255>} */ ((value >>> 8) & 0xff);
                    this.a = /** @type {ColorValue<0,255>} */ (value & 0xff);
                    break;
                }
                throw new ValueError("Invalid arguments: ", arguments);
            }
            case 0: {
                this.r = 0;
                this.g = 0;
                this.b = 0;
                this.a = 0;
                break;
            }
            default: {
                throw new ValueError("Invalid arguments: ", arguments);
            }
        }
    }

    /**
     * @returns {number} 无符号整数
     */
    valueOf() {
        // 使用无符号的右移操作符
        return ((this.r << 24) | (this.g << 16) | (this.b << 8) | this.a) >>> 0;
    }

    toString() {
        return `0x${this.valueOf().toString(16).padStart(8, "0")}`; // 格式化输出为 0xRRGGBBAA 形式
    }

    toObject() {
        return { r: this.r, g: this.g, b: this.b, a: this.a };
    }
    /**
     * @description 给R、G、B通道都加上指定数值，最终结果不会超过255.
     * @param {number} n
     * @returns {InstanceType<Pixel>}
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
     * @param {number[]} arr
     * @returns {this}
     */
    fromSimpleArray(arr) {
        // 如果数组有 3 个元素，假设为 RGB
        switch (arr.length) {
            case 3: {
                this.r = /** @type {ColorValue<0,255>} */ (arr[0]);
                this.g = /** @type {ColorValue<0,255>} */ (arr[1]);
                this.b = /** @type {ColorValue<0,255>} */ (arr[2]);
                this.a = 255;
                break;
            }
            // 如果数组有 4 个元素，假设为 RGBA
            case 4: {
                this.r = /** @type {ColorValue<0,255>} */ (arr[0]);
                this.g = /** @type {ColorValue<0,255>} */ (arr[1]);
                this.b = /** @type {ColorValue<0,255>} */ (arr[2]);
                this.a = /** @type {ColorValue<0,255>} */ (arr[3]);
                break;
            }
            default: {
                throw new ValueError("Invalid array length: ", arr.length);
            }
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
     * @param {("R"|"G"|"B"|"A"|"RGB")?} [bit='RGB']
     * @returns {this}
     */
    flip(bit = null) {
        if (!bit) return this.flip("RGB");
        if (/R/i.test(bit.toUpperCase())) this.r = /** @type {ColorValue<0,255>} */ (255 - this.r);
        if (/G/i.test(bit.toUpperCase())) this.g = /** @type {ColorValue<0,255>} */ (255 - this.g);
        if (/B/i.test(bit.toUpperCase())) this.b = /** @type {ColorValue<0,255>} */ (255 - this.b);
        if (/A/i.test(bit.toUpperCase())) this.a = /** @type {ColorValue<0,255>} */ (255 - this.a);
        return this;
    }
    /**
     *
     * @returns {this}
     */
    flipAlpha() {
        this.a = /** @type {ColorValue<0,255>} */ (255 - this.a);
        return this;
    }
    /**
     *
     * @returns {this}
     */
    flipAll() {
        this.r = /** @type {ColorValue<0,255>} */ (255 - this.r);
        this.g = /** @type {ColorValue<0,255>} */ (255 - this.g);
        this.b = /** @type {ColorValue<0,255>} */ (255 - this.b);
        this.a = /** @type {ColorValue<0,255>} */ (255 - this.a);
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
     * @param {number} n
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
    const { describe, it, beforeEach, afterEach } = require("node:test");
    const assert = require("node:assert");
    describe("Pixel", () => {
        /** @type {Pixel} */
        let testPixel;
        beforeEach(() => {
            testPixel = new Pixel(0, 0, 0, 255);
        });
        afterEach(() => {
            testPixel = new Pixel(0, 0, 0, 255);
        });
        describe("Pixel.constructor", () => {
            it("create a pixel with 4 arguments", () => {
                assert.strictEqual(testPixel.valueOf(), 255);
            });
            it("create a pixel with 3 arguments", () => {});
            describe("create a pixel with 1 argument", () => {
                it("with number", () => {
                    let numberPixel = new Pixel(0x12345678);
                    assert.strictEqual(numberPixel.r, 0x12);
                    assert.strictEqual(numberPixel.g, 0x34);
                    assert.strictEqual(numberPixel.b, 0x56);
                    assert.strictEqual(numberPixel.a, 0x78);
                });
                it("with string", () => {
                    let stringPixel = new Pixel("#ffffff");
                    assert.strictEqual(stringPixel.r, 255);
                    assert.strictEqual(stringPixel.g, 255);
                    assert.strictEqual(stringPixel.b, 255);
                });
                it("with invalid string", () => {
                    let err = new ValueError("Invalid arguments: ");
                    assert.throws(() => {
                        new Pixel("bad_argument");
                    });
                });
            });
            it("create a pixel with invalid arguments", () => {
                assert.throws(() => {
                    new Pixel("invalid");
                });
            });
            it("with bigint", () => {
                let numberPixel = new Pixel(BigInt(0xff0000ffn));
                assert.strictEqual(numberPixel.r, 255);
                assert.strictEqual(numberPixel.g, 0);
                assert.strictEqual(numberPixel.b, 0);
                assert.strictEqual(numberPixel.a, 255);
            });
            it("number, bigint and string constructors agree on 0xRRGGBBAA", () => {
                // 三种构造方式对同一颜色值必须解析一致（0xRRGGBBAA 布局）
                const pixels = [
                    new Pixel(0x12345678),
                    new Pixel(0x12345678n),
                    new Pixel("#12345678"),
                ];
                for (const p of pixels) {
                    assert.strictEqual(p.r, 0x12);
                    assert.strictEqual(p.g, 0x34);
                    assert.strictEqual(p.b, 0x56);
                    assert.strictEqual(p.a, 0x78);
                }
            });
            it("shorthand hex strings expand to #RRGGBBAA", () => {
                // #RGB → #RRGGBBAA、#RRGGBB → #RRGGBBAA（alpha 取 255）
                const short3 = new Pixel("#f00");
                assert.strictEqual(short3.r, 255);
                assert.strictEqual(short3.g, 0);
                assert.strictEqual(short3.b, 0);
                assert.strictEqual(short3.a, 255);
                const short6 = new Pixel("#00ff00");
                assert.strictEqual(short6.r, 0);
                assert.strictEqual(short6.g, 255);
                assert.strictEqual(short6.b, 0);
                assert.strictEqual(short6.a, 255);
                const full8 = new Pixel("#ff000080");
                assert.strictEqual(full8.r, 255);
                assert.strictEqual(full8.g, 0);
                assert.strictEqual(full8.b, 0);
                assert.strictEqual(full8.a, 0x80);
            });
        });
        describe("Pixel.addNumber", () => {
            it("add 1 to all channels", () => {
                let res = testPixel.addNumber(1);
                assert.strictEqual(res.r, 1);
                assert.strictEqual(res.g, 1);
                assert.strictEqual(res.b, 1);
                assert.strictEqual(res.a, 255);
            });
            it("add 255 to all channels", () => {
                let res = testPixel.addNumber(255);
                assert.strictEqual(res.r, 255);
                assert.strictEqual(res.g, 255);
                assert.strictEqual(res.b, 255);
                assert.strictEqual(res.a, 255);
            });
            it("add 0 to all channels", () => {
                let res = testPixel.addNumber(0);
                assert.strictEqual(res.r, 0);
                assert.strictEqual(res.g, 0);
                assert.strictEqual(res.b, 0);
                assert.strictEqual(res.a, 255);
            });
        });
        describe("Pixel.fromSimpleArray", () => {
            it("create a pixel from an array with 3 elements", () => {
                let arr = [255, 255, 255];
                let pixel = new Pixel(0, 0, 0, 0).fromSimpleArray(arr);
                assert.deepStrictEqual(pixel.toObject(), {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 255,
                });
            });
            it("create a pixel from an array with 4 elements", () => {
                let arr = [255, 255, 255, 255];
                let pixel = new Pixel(0, 0, 0, 0).fromSimpleArray(arr);
                assert.deepStrictEqual(pixel.toObject(), {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 255,
                });
            });
        });
        describe("Pixel.greaterThan", () => {
            let testPixel = new Pixel(0, 0, 0, 255);
            let anotherPixel = new Pixel(255, 128, 0, 255);
            assert.strictEqual(testPixel.greaterThan(anotherPixel), false);
            assert.strictEqual(anotherPixel.greaterThan(testPixel), true);
        });
        describe("Pixel.flip", () => {
            it("flip R channel", () => {
                let testPixel = new Pixel(0, 0, 0, 255);
                let res = testPixel.flip("R");
                assert.strictEqual(res.r, 255);
                assert.strictEqual(res.g, 0);
                assert.strictEqual(res.b, 0);
                assert.strictEqual(res.a, 255);
            });
        });

        describe("Pixel.flipAlpha", () => {
            let testPixel = new Pixel(0, 0, 0, 255);
            let res = testPixel.flipAlpha();
            assert.strictEqual(res.r, 0);
            assert.strictEqual(res.g, 0);
            assert.strictEqual(res.b, 0);
            assert.strictEqual(res.a, 0);
        });

        describe("Pixel.flipAll", () => {
            it("flip all channels", () => {
                let testPixel = new Pixel(0, 0, 0, 255);
                let res = testPixel.flipAll();
                assert.strictEqual(res.r, 255);
                assert.strictEqual(res.g, 255);
                assert.strictEqual(res.b, 255);
                assert.strictEqual(res.a, 0);
            });
        });

        describe("Pixel.mix", () => {
            it("mix two pixels", () => {
                let testPixel = new Pixel(0, 0, 0, 255);
                let anotherPixel = new Pixel(254, 128, 0, 255);
                let res = testPixel.mix(anotherPixel);
                assert.strictEqual(res.r, 127);
                assert.strictEqual(res.g, 64);
                assert.strictEqual(res.b, 0);
                assert.strictEqual(res.a, 255);
            });
        });

        describe("Pixel.multiply", () => {});
        describe("Pixel.subtract", () => {});
        describe("Pixel.add", () => {});
        describe("Pixel.toString", () => {
            it("output as 0xRRGGBBAA", () => {
                assert.strictEqual(testPixel.toString(), "0x000000ff");
            });
            it("output as 0xRRGGBBAA 2", () => {
                let flippedPixel = new Pixel(255, 0, 0, 255);
                assert.strictEqual(flippedPixel.toString(), "0xff0000ff");
            });
            it("can also flip", () => {
                let flippedPixel = new Pixel(255, 0, 0, 255);
                assert.strictEqual(flippedPixel.toString(), "0xff0000ff");
                let res = flippedPixel.flip();
                assert.strictEqual(res.toString(), "0x00ffffff");
            });
        });
        describe("Pixel.toObject", () => {
            it("output as object", () => {
                let numberPixel = new Pixel(0xffffffff);
                assert.deepStrictEqual(numberPixel.toObject(), {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 255,
                });
            });
        });
    });
}
