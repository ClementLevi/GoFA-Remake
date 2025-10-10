/**
 * @typedef ENUM_MASK_TYPE
 * @property {0} UNDEFINED - 未定义
 * @property {1} COLOR - 颜色
 * @property {2} RSS_ABUNDANCE - 资源浓度
 * @property {3} POS_OFFSET - 位置偏移
 * @property {4} CAPACITY - 容量
 * @property {5} EXISTENCE - 存在性
 * @readonly
 */
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

module.exports = ENUM_MASK_TYPE;
