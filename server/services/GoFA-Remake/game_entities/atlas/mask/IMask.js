const path = require("node:path");
/**
 * @typedef {import('../../../../libs/image/Image')} Image
 * @type {Image}
 */
const Image = require(path.resolve(
    __dirname,
    "../../../../libs/image/Image"
));

/**
 * @typedef {import("./ENUM_MASK_TYPE")} ENUM_MASK_TYPE
 * @type {ENUM_MASK_TYPE}
 */
const ENUM_MASK_TYPE = require(path.resolve(__dirname, "./ENUM_MASK_TYPE"));
module.exports = class IMask {
    /**
     * Mask operation is determined by its type,
     * and value is determined by game rules.
     * 遮罩操作由其类型决定，值由游戏规则决定。
     * @typedef  ENUM_MASK_OPERATION
     * @property {0} INCREMENT_MAX - 增加最大值
     * @property {1} INCREMENT_MIN - 增加最小值
     * @property {2} RANDOM_INCREMENT_MAX - 随机增加最大值
     * @property {3} RANDOM_INCREMENT_MIN - 随机增加最小值
     * @property {4} FIXED_VALUE - 设置值
     * @property {5} RANDOM_VALUE_FROM_RANGE - 随机值范围
     */
    static ENUM_MASK_OPERATION = {
        /** @memberof IMask.ENUM_MASK_OPERATION */
        INCREMENT_MAX: 0, // 增加最大值
        /** @memberof IMask.ENUM_MASK_OPERATION */
        INCREMENT_MIN: 1, // 增加最小值
        /** @memberof IMask.ENUM_MASK_OPERATION */
        RANDOM_INCREMENT_MAX: 2, // 随机增加最大值
        /** @memberof IMask.ENUM_MASK_OPERATION */
        RANDOM_INCREMENT_MIN: 3, // 随机增加最小值
        /** @memberof IMask.ENUM_MASK_OPERATION */
        FIXED_VALUE: 4, // 设置值
        /** @memberof IMask.ENUM_MASK_OPERATION */
        RANDOM_VALUE_FROM_RANGE: 5, // 随机值范围
    };
    /**
     * @constructor
     * @param {Image?} image
     * @param {ENUM_MASK_TYPE[keyof ENUM_MASK_TYPE]} [type=ENUM_MASK_TYPE.UNDEFINED]
     * @abstract
     */
    constructor(image = null, type = ENUM_MASK_TYPE.UNDEFINED) {
        if (new.target === IMask) {
            throw new TypeError("Cannot instantiate interface");
        }
        /** @type {number[]} */
        this.factors = [];
    }
    /**
     * 加载图片
     * Load image
     * @param {string} image_path
     * @returns {Image}
     * @abstract
     */
    load_image(image_path) {
        return new Image();
    }

    /**
     * 生成2D遮罩
     * Generate 2D mask
     * @param {number} x_width
     * @param {number} y_height
     * @returns {number[][]}
     * @abstract
     */
    gen_2d_mask(x_width, y_height) {
        return [[]];
    }
    /**
     * 生成3D遮罩
     * Generate 3D mask
     * @param {number} x_width
     * @param {number} y_height
     * @param {number} z_depth
     * @returns {number[][][]}
     * @abstract
     */
    gen_3d_mask(x_width, y_height, z_depth) {
        return [[[]]];
    }
};
