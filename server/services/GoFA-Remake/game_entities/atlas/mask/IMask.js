const path = require("path");
const Image = require(path.resolve("services/libs/image/Image.js"));

const ENUM_MASK_TYPE = require(__dirname + "/ENUM_MASK_TYPE.js");
module.exports = class IMask {
    /**
     * Mask operation is determined by its type,
     * and value is determined by game rules.
     * 遮罩操作由其类型决定，值由游戏规则决定。
     * @typedef {Object} ENUM_MASK_OPERATION
     * @property {String} INCREMENT_MAX - 增加最大值
     * @property {String} INCREMENT_MIN - 增加最小值
     * @property {String} RANDOM_INCREMENT_MAX - 随机增加最大值
     * @property {String} RANDOM_INCREMENT_MIN - 随机增加最小值
     * @property {String} SET_VALUE - 设置值
     * @property {String} RANDOM_VALUE_FROM_RANGE - 随机值范围
     */
    static ENUM_MASK_OPERATION = {
        INCREMENT_MAX: 0, // 增加最大值
        INCREMENT_MIN: 1, // 增加最小值
        RANDOM_INCREMENT_MAX: 2, // 随机增加最大值
        RANDOM_INCREMENT_MIN: 3, // 随机增加最小值
        SET_VALUE: 4, // 设置值
        RANDOM_VALUE_FROM_RANGE: 5, // 随机值范围
    };
    /**
     * @constructor
     * @param {Image|undefined} image
     * @param {ENUM_MASK_TYPE} type
     * @abstract
     */
    constructor(image = undefined, type = ENUM_MASK_TYPE.UNDEFINED) {
        if (new.target === IMask) {
            throw new TypeError("Cannot instantiate interface");
        }
    }
    /**
     * 加载图片
     * Load image
     * @param {String} image_path
     * @returns {Promise<Image>}
     * @abstract
     * @async
     */
    async load_image(image_path) {
        return new Image(image_path);
    }

    /**
     * 生成2D遮罩
     * Generate 2D mask
     * @param {Number} x_width
     * @param {Number} y_height
     * @returns {Array<Array<Number>>}
     * @abstract
     */
    gen_2d_mask(x_width, y_height) {
        return [[]];
    }
    /**
     * 生成3D遮罩
     * Generate 3D mask
     * @param {Number} x_width
     * @param {Number} y_height
     * @param {Number} z_depth
     * @returns {Array<Array<Array<Number>>>}
     * @abstract
     */
    gen_3d_mask(x_width, y_height, z_depth) {
        return [[[]]];
    }
};
