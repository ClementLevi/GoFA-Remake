/**
 * @typedef MaskType
 * @property {0} UNDEFINED - 未定义
 * @property {1} COLOR - 颜色
 * @property {2} RSS_ABUNDANCE - 资源浓度
 * @property {3} POS_OFFSET - 位置偏移
 * @property {4} CAPACITY - 容量
 * @property {5} EXISTENCE - 存在性
 * @readonly
 * @exports
 */

/** @type {MaskType} */
const ENUM_MASK_TYPE = Object.freeze({
    /** @memberof ENUM_MASK_TYPE */
    UNDEFINED: 0,
    /** @memberof ENUM_MASK_TYPE */
    COLOR: 1,
    /** @memberof ENUM_MASK_TYPE */
    RSS_ABUNDANCE: 2,
    /** @memberof ENUM_MASK_TYPE */
    POS_OFFSET: 3,
    /** @memberof ENUM_MASK_TYPE */
    CAPACITY: 4,
    /** @memberof ENUM_MASK_TYPE */
    EXISTENCE: 5,
});

/**
 * Mask operation is determined by its type,
 * and value is determined by game rules.
 * 遮罩操作由其类型决定，值由游戏规则决定。
 * @typedef MaskOperation
 * @property {0} INCREMENT_MAX - 增加最大值
 * @property {1} INCREMENT_MIN - 增加最小值
 * @property {2} RANDOM_INCREMENT_MAX - 随机增加最大值
 * @property {3} RANDOM_INCREMENT_MIN - 随机增加最小值
 * @property {4} FIXED_VALUE - 设置值，默认
 * @property {5} RANDOM_VALUE_FROM_RANGE - 随机值范围
 * @default 4
 * @exports
 */

/** @type {MaskOperation} */
const ENUM_MASK_OPERATION = Object.freeze({
    /** @memberof ENUM_MASK_OPERATION */
    INCREMENT_MAX: 0, // 增加最大值
    /** @memberof ENUM_MASK_OPERATION */
    INCREMENT_MIN: 1, // 增加最小值
    /** @memberof ENUM_MASK_OPERATION */
    RANDOM_INCREMENT_MAX: 2, // 随机增加最大值
    /** @memberof ENUM_MASK_OPERATION */
    RANDOM_INCREMENT_MIN: 3, // 随机增加最小值
    /**
     * @memberof ENUM_MASK_OPERATION
     * @default
     */
    FIXED_VALUE: 4, // 设置值
    /** @memberof ENUM_MASK_OPERATION */
    RANDOM_VALUE_FROM_RANGE: 5, // 随机值范围
});

module.exports = { ENUM_MASK_TYPE, ENUM_MASK_OPERATION };
