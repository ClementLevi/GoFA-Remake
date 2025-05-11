const fs = require("fs");
const path = require("path");

const { Jimp } = require("jimp");

const Pixel = require("./Pixel");

/**
 * Image类用于处理图像的加载、转换和保存。
 * Image class for loading, converting, and saving images.
 * @requires Jimp
 * @class
 * @property {Object|null} bitmap - 图像位图数据。
 * @property {Number[]} bitmap.data - 位图像素。
 * @property {Number} bitmap.width - 图像宽度。
 * @property {Number} bitmap.height - 图像高度。
 * @property {String|null} filePath - 图像文件路径。
 * @property {Number} width - 图像宽度。
 * @property {Number} height - 图像高度。
 * @property {Jimp} handler - 图像处理库。
 * @property {Jimp} data - 图像数据。
 */
class Image {
    /**
     * 创建一个新的Image实例。
     * Creates a new Image instance.
     * @param {Object} param0 - 初始化参数对象。
     * @param {Object} param0.bitmap - 图像位图数据。
     * @param {Number[]} param0.bitmap.data - 位图像素。
     * @param {Number} param0.bitmap.width - 图像宽度。
     * @param {Number} param0.bitmap.height - 图像高度。
     * @param {String|null} [param0.filePath=null] - 图像文件路径，默认为null。
     */
    constructor({ bitmap, filePath = null }) {
        // TODO: 在构造函数中验证传入的 bitmap 是否有效，避免使用空对象。
        this.bitmap = bitmap ?? {};
        this.filePath = filePath;
        this.width = bitmap?.width || 0;
        this.height = bitmap?.height || 0;
        this.handler = Jimp;
        this.data = null;
    }

    /**
     * 读取图像文件并将其加载到内存中。
     * Reads the image file and loads it into memory.
     * @returns {Promise}
     */
    async load() {
        if (this.filePath !== null) {
            this.data = await this.handler.read(this.filePath);
        } else if (this.bitmap?.data) {
            // TODO: 在 load 方法中增加对 this.bitmap.data 的类型检查，确保它是有效的数组。
            await this.fromBitmap(
                this.bitmap.data,
                this.bitmap.width,
                this.bitmap.height
            );
            //@ts-expect-error "delete" 运算符的操作数必须是可选的
            delete this.bitmap; // 释放内存
        } else {
            throw new Error("No image file path nor bitmap provided");
        }
        return this;
    }

    /**
     * 获取指定坐标的像素对象。
     * Gets the pixel object at the specified coordinates.
     * @param {Number} x - 像素的x坐标。
     * @param {Number} y - 像素的y坐标。
     * @returns {Pixel} - 返回Pixel对象。
     */
    getPixel(x, y) {
        // TODO: 在 getPixel 方法中检查 (x, y) 坐标是否在合法范围内，避免越界访问。
        if (!this.data) {
            throw new Error("Image not loaded yet");
        }
        let hex_color = this.data.getPixelColor(x, y);
        return new Pixel(hex_color);
    }

    /**
     * 调整图像的大小。
     * Resizes the image.
     * @param {Number} width - 新的宽度。
     * @param {Number} height - 新的高度。
     * @returns {Image} - 返回当前Image实例。
     */
    resize(width, height) {
        // TODO: 在 resize 方法中，增加对 this.data 的有效性检查。
        this.data = this.data.resize({ w: width, h: height });
        return this;
    }

    /**
     * 将图片转为灰度图。
     * Converts the image to grayscale.
     * @returns {Image} - 返回当前Image实例。
     */
    toGrayscale() {
        this.data = this.data.greyscale();
        return this;
    }

    /**
     * 从位图创建图像数据。
     * Creates image data from bitmap.
     * @param {Array} bitmap - 位图数据数组。
     * @param {Number} width - 图像宽度。
     * @param {Number} height - 图像高度。
     * @returns {Promise<Image>} - 返回当前Image实例。
     */
    async fromBitmap(bitmap, width, height) {
        // TODO: 在 fromBitmap 和 fromBuffer 方法中处理潜在的错误，添加异常捕获。
        this.data = await this.handler.fromBitmap({
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
     * @returns {Promise<Image>} - 返回当前Image实例。
     */
    async fromBuffer(buffer) {
        // TODO: 在 fromBitmap 和 fromBuffer 方法中处理潜在的错误，添加异常捕获。

        this.data = await this.handler.fromBuffer(buffer);
        return this;
    }

    /**
     * 获取当前图像的数据位图。
     * Gets the current image's bitmap data.
     * @returns {Object} - 返回图像的位图对象。
     */
    toBitmap() {
        // TODO: 在 toBitmap 和 toBuffer 方法中，添加对 this.data 的有效性验证。
        return this.data.bitmap;
    }

    /**
     * 获取当前图像的缓冲区。
     * Gets the current image's buffer.
     * @returns {Buffer} - 返回图像的缓冲区。
     */
    toBuffer() {
        // TODO: 在 toBitmap 和 toBuffer 方法中，添加对 this.data 的有效性验证。
        return this.data.getBuffer();
    }

    /**
     * 生成强度图，包含颜色强度信息。
     * Generates a strength map containing color intensity information.
     * @returns {Object} - 返回强度图对象。
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
     * 将图像保存到指定路径。
     * Saves the image to the specified path.
     * @param {String} filePath - 图像保存的文件路径。
     */
    save(filePath) {
        this.data.write(filePath);
        return this;
    }
}

module.exports = Image;

/**
 * 测试 Image 类功能的自执行异步函数。
 * Self-executing asynchronous function to test Image class functionality.
 */
if (require.main === module) {
    (async () => {
        let image = new Image({
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
        });
        image.load().then(() => {
            image.save(
                path.resolve(
                    "server/build/images/libs/ImageClass/test-grayscale-colored.png"
                )
            );
            let image2 = image.toGrayscale();
            image2.save(
                path.resolve(
                    "server/build/images/libs/ImageClass/test-grayscale.png"
                )
            );
            console.log(image2.toStrengthMap());
            console.log(image.toStrengthMap());
        });
    })();
}
