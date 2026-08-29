const fs = require("fs");
const path = require("path");

const { Jimp } = require("jimp");

/**
 * @typedef {typeof import('./Pixel')} Pixel
 * @type {Pixel}
 */
const Pixel = require("./Pixel");

/**
 * @typedef {{bitmap?: BitMap, filePath?: string}} ImageConfig
 */

/**
 * @typedef BitMap
 * @property {number[]} data - 位图像素。
 * @property {number} width - 图像宽度。
 * @property {number} height - 图像高度。
 */

/**
 * @description 强度图数据类型。和位图相同，但是语义上表示强度.
 * 强度通过RGB三通道平均计算后归一化得出，反映单个像素的亮度。强度值越接近1，表示该像素的颜色越亮；越接近0，则表示颜色越暗。
 * "Strength" refers to the degree of lightness or darkness of a color. A strength value of 1 indicates a bright color, while a value of 0 indicates a dark color.
 * @typedef {BitMap} StrengthMap
 */

/**
 * Image类用于处理图像的加载、转换和保存。
 * Image class for loading, converting, and saving images.
 * @requires Jimp
 * @class
 * @property {BitMap?} bitmap - 图像位图数据。
 * @property {number[]} bitmap.data - 位图像素。
 * @property {number} bitmap.width - 图像宽度。
 * @property {number} bitmap.height - 图像高度。
 * @property {string?} filePath - 图像文件路径。
 * @property {number} width - 图像宽度。
 * @property {number} height - 图像高度。
 * @property {Jimp} _handler - 图像处理库。
 * @property {Jimp} _data - 图像数据。
 */
class Image {
    /**
     * @description 验证位图是否有效的bitmap对象。
     * @param {any} bitmap
     * @returns {boolean}
     */
    static isBitmapValid(bitmap) {
        if (!bitmap) return false;
        if (
            bitmap.data == undefined ||
            bitmap.width == undefined ||
            bitmap.height == undefined
        )
            return false;
        if (!Array.isArray(bitmap.data) || bitmap.data.length === 0)
            return false;
        if (bitmap.data.every((i) => !Number.isInteger(i))) return false;
        if (
            !Number.isSafeInteger(bitmap.width) ||
            !Number.isSafeInteger(bitmap.height)
        )
            return false;
        if (bitmap.width <= 0 || bitmap.height <= 0) return false;
        return true;
    }
    /**
     * @description 验证本地图片的 URL 是否有效。
     * @param {string} url 一个本地图片URL
     * @returns {boolean}
     */
    static isURLValid(url) {
        // TODO: 增加访问权限、实际格式、后缀名等校验。
        if (!fs.existsSync(url)) return false;
        return true;
    }

    /**
     * 创建一个新的Image实例。
     * Creates a new Image instance.
     * @param {ImageConfig} config - 初始化参数对象。
     */
    constructor(config) {
        // TODO: 在构造函数中验证传入的 bitmap 是否有效，避免使用空对象。
        this.bitmap = /** @type {BitMap|undefined} */ (config.bitmap ?? {});
        this.filePath = config.filePath ?? "";
        this.width = config.bitmap?.width || 0;
        this.height = config.bitmap?.height || 0;
        /** @private */
        this._handler = Jimp;
        /** @private */
        this._data = null;
    }

    /**
     * 读取图像文件并将其加载到内存中。
     * Reads the image file and loads it into memory.
     * @returns {Promise<this>}
     */
    async load() {
        if (this.filePath !== null && this.filePath !== "") {
            this._data = await this._handler.read(this.filePath);
            this.height = this._data.bitmap.height;
            this.width = this._data.bitmap.width;
        } else if (this.bitmap?.data) {
            // TODO: 在 load 方法中增加对 this.bitmap.data 的类型检查，确保它是有效的数组。
            await this.fromBitmap(
                this.bitmap.data,
                this.bitmap.width,
                this.bitmap.height
            );
            //  no@ts-expect-error "delete" 运算符的操作数必须是可选的
            delete this.bitmap; // 释放内存
            this.height = this._data.bitmap.height;
            this.width = this._data.bitmap.width;
        } else {
            throw new Error("No image file path nor bitmap provided");
        }
        return this;
    }

    /**
     * 获取指定坐标的像素对象。
     * Gets the pixel object at the specified coordinates.
     * @param {number} x - 像素的x坐标。
     * @param {number} y - 像素的y坐标。
     * @returns {InstanceType<Pixel>} - 返回Pixel对象。
     */
    getPixel(x, y) {
        // TODO: 在 getPixel 方法中检查 (x, y) 坐标是否在合法范围内，避免越界访问。
        if (!this._data) {
            throw new Error("Image not loaded yet");
        }
        let hex_color = this._data.getPixelColor(x, y);
        return new Pixel(hex_color);
    }

    /**
     * 调整图像的大小。
     * Resizes the image.
     * @param {number} width - 新的宽度。
     * @param {number} height - 新的高度。
     * @returns {this} - 返回当前Image实例。
     */
    resize(width, height) {
        // TODO: 在 resize 方法中，增加对 this.data 的有效性检查。
        this._data = this._data.resize({ w: width, h: height });
        return this;
    }

    /**
     * 将图片原地转为灰度图。
     * Converts the image to grayscale.
     * @returns {Image} - 返回当前Image实例。
     */
    toGrayscale() {
        this._data = this._data.greyscale();
        return this;
    }

    /**
     * 从位图创建图像数据。
     * Creates image data from bitmap.
     * @param {number[]} bitmap - 位图数据数组。
     * @param {number} width - 图像宽度。
     * @param {number} height - 图像高度。
     * @returns {this} - 返回当前Image实例。
     */
    fromBitmap(bitmap, width, height) {
        // TODO: 在 fromBitmap 和 fromBuffer 方法中处理潜在的错误，添加异常捕获。
        this._data = this._handler.fromBitmap({
            width,
            height,
            data: bitmap,
        });
        return this;
    }

    /**
     * 从缓冲区创建图像数据。
     * Creates image data from buffer.
     * @param {Buffer} buffer - 图像缓冲区。
     * @returns {this} - 返回当前Image实例。
     */
    fromBuffer(buffer) {
        // TODO: 在 fromBitmap 和 fromBuffer 方法中处理潜在的错误，添加异常捕获。
        // TODO: 基于事件回调或者异常+多次请求命中缓存方式消除异步传染性。
        // ? 好像不是非消不可
        this._data = this._handler.fromBuffer(buffer);
        return this;
    }

    /**
     * 获取当前图像的数据位图。
     * Gets the current image's bitmap data.
     * @returns {BitMap} - 返回图像的位图对象。
     */
    toBitmap() {
        // TODO: 在 toBitmap 和 toBuffer 方法中，添加对 this.data 的有效性验证。
        return this._data.bitmap;
    }

    /**
     * 获取当前图像的缓冲区。
     * Gets the current image's buffer.
     * @returns {Buffer} - 返回图像的缓冲区。
     */
    toBuffer() {
        // TODO: 在 toBitmap 和 toBuffer 方法中，添加对 this.data 的有效性验证。
        return this._data.getBuffer();
    }

    /**
     * 生成强度图，包含颜色强度信息。
     * Generates a strength map containing color intensity information.
     * 强度通过RGB三通道平均后归一化得出，反映单个像素的亮度。强度值越接近1，表示该像素的颜色越亮；越接近0，则表示颜色越暗。
     * "Strength" refers to the degree of lightness or darkness of a color. A strength value of 1 indicates a bright color, while a value of 0 indicates a dark color.
     * @returns {StrengthMap} - 返回强度图对象。
     */
    toStrengthMap() {
        let bitmap = this.toBitmap();
        let strengthMap = [];
        // TODO: 在 toStrengthMap 方法中为 bitmap?.data[i] 的访问添加边界检查，避免越界错误。

        for (let i = 0; i < bitmap?.data.length; i += 4) {
            let r = bitmap?.data[i];
            let g = bitmap?.data[i + 1];
            let b = bitmap?.data[i + 2];
            let strength = (r + g + b) / 3 / 255;
            strengthMap.push(strength);
        }
        return {
            data: strengthMap,
            width: bitmap.width,
            height: bitmap.height,
        };
    }

    /**
     * @descrption 将图像转为RGB数组，每个数字都是0xRRGGBB格式
     * @returns {number[]} An array made by numbers in shape of 0xRRGGBB
     */
    toRGBArray() {
        let ret = [];
        let data = this.toBitmap().data;
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            let value = (r << 16) | (g << 8) | b;
            ret.push(value);
        }
        return ret;
    }

    /**
     * @description 将图像转为RGBA数组，每个数字都是0xRRGGBBAA格式。注意常规number类型装不下RBGA，请特别使用bigint类型
     * @returns {bigint[]}
     */
    toRGBAArray() {
        let ret = [];
        let data = this.toBitmap().data;
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            let a = data[i + 3];
            let value =
                (BigInt(r) << 24n) |
                (BigInt(g) << 16n) |
                (BigInt(b) << 8n) |
                BigInt(a);
            ret.push(value);
        }
        return ret;
    }

    /**
     *
     * @returns {number[][]}
     */
    to2DRGBArray() {
        let ret = [];
        let RGB_array = this.toRGBArray();
        for (let i = 0; i < this.height; i += 3) {
            let row = [];
            for (let j = 0; j < this.width; j++) {
                row.push(RGB_array[i + j]);
            }
            ret.push(row);
        }
        return ret;
    }

    /**
     *
     * @returns {bigint[][]}
     */
    to2DRGBAArray() {
        let ret = [];
        let RGBA_array = this.toRGBAArray();
        for (let i = 0; i < this.height; i += 4) {
            let row = [];
            for (let j = 0; j < this.width; j++) {
                row.push(RGBA_array[i + j]);
            }
            ret.push(row);
        }
        return ret;
    }
    /**
     * @param {'r'|'g'|'b'|'a'|'R'|'G'|'B'|'A'} channel
     * @returns {number[]}
     */
    toChannelArray(channel = "r") {
        switch (channel) {
            case "r":
            case "R":
                return this.toRGBAArray().map((value) =>
                    Number(value & 0xff000000n)
                );
            case "g":
            case "G":
                return this.toRGBAArray().map((value) =>
                    Number(value & 0x00ff0000n)
                );
            case "b":
            case "B":
                return this.toRGBAArray().map((value) =>
                    Number(value & 0x0000ff00n)
                );
            case "a":
            case "A":
                return this.toRGBAArray().map((value) =>
                    Number(value & 0x000000ffn)
                );
            default:
                throw new TypeError(
                    `Invalid channel name: ${channel}. Expecting 'r', 'g', 'b', or 'a'.`
                );
        }
    }

    /**
     * @see {@link Image.toStrengthMap}
     */
    toStrengthArray() {
        return this.toStrengthMap().data;
    }
    /**
     * 将图像保存到指定路径。
     * Saves the image to the specified path.
     * @param {string} filePath - 图像保存的文件路径。
     */
    async save(filePath) {
        await this._data.write(filePath);
        return this;
    }
}

module.exports = Image;

if (require.main === module) {
    (async () => {
        let colored = {
            bitmap: {
                data: [
                    0xff0000ff, 0xffff00ff, 0xffffffff, 0x00ff00ff, 0x00ffffff,
                    0x0000ffff, 0xff00ffff, 0x000000ff, 0xff88ffff, 0xff8888ff,
                    0xffff88ff, 0xffffff88, 0xff88ff88, 0xff888888, 0xffcc88ff,
                    0xffcc8888,
                ],
                width: 4,
                height: 4,
            },
        };
        let image = new Image(colored);
        image.load().then(async () => {
            await image.save(
                path.resolve(
                    "server/build/images/libs/ImageClass/new-colored.png"
                )
            );
            console.log(`image with 4x4: ${image.width} x ${image.height}`);
            console.log(
                image.toRGBAArray().map((v) => new Pixel(v).toObject())
            );
            console.log(image.toStrengthArray());
        });
        // let image2 = new Image(colored);
        // image2.load().then(async () => {
        //     image2.toGrayscale();
        //     await image2.save(
        //         path.resolve(
        //             "server/build/images/libs/ImageClass/test-grayscale.png"
        //         )
        //     );
        //     console.log(image2.toStrengthMap());
        // });
        // let readable = new Image({
        //     filePath: path.resolve(
        //         "server/build/images/libs/ImageClass/test_readable.jpg"
        //     ),
        // });
        // readable.load().then(() => {
        //     console.log(readable._data.bitmap.data);
        //     let RGBA_array = readable.toRGBAArray();
        //     console.log(
        //         "readable image loaded: ",
        //         RGBA_array.map((i) => new Pixel(i).toObject())
        //     );
        //     console.log(
        //         "2D array: ",
        //         readable
        //             .to2DRGBAArray()
        //             .map((r) => r.map((v) => new Pixel(v).toObject()))
        //     );
        // });
    })();
}
