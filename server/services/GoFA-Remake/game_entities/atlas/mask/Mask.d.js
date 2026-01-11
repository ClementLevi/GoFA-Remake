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
 * Mask operation is used to manipulate the random value generation.
 * 遮罩操作用于操纵随机值生成。
 * This is done by manipulating the random value range, narrowing or expanding it.
 * 这项操作通过操纵随机值范围来完成，可以是扩大或缩小
 * @typedef MaskOperation
 * @property {0} FIXED_VALUE - 设置值。若如此做，MaskValueConfig中的min和max将被忽视。
 * @property {1} RANDOM_VALUE_FROM_RANGE - 设置新的随机值范围，并生成随机数。若如此做，MaskValueConfig中的value将被忽视。
 * @property {2} INCREMENT_MAX - 增加最大值，并生成随机数。若如此做，MaskValueConfig中的value表示增量（为负则是减量）。
 * @property {3} INCREMENT_MIN - 增加最小值，并生成随机数。若如此做，MaskValueConfig中的value表示增量（为负则是减量）。
 * @property {4} RANDOM_INCREMENT_MAX - 随机增加最大值，并生成随机数。若如此做，MaskValueConfig中的value将被忽视。随机增大的范围由min和max决定。
 * @property {5} RANDOM_INCREMENT_MIN - 随机增加最小值，并生成随机数。若如此做，MaskValueConfig中的value将被忽视。随机增大的范围由min和max决定。
 * @default 0
 * @exports
 */

/** @type {MaskOperation} */
const ENUM_MASK_OPERATION = Object.freeze({
    /**
     * @memberof ENUM_MASK_OPERATION
     * @default
     */
    FIXED_VALUE: 0, // 设置值。若如此做，MaskValueConfig中的min和max将被忽视。
    /** @memberof ENUM_MASK_OPERATION */
    RANDOM_VALUE_FROM_RANGE: 1, // 设置新的随机值范围，并生成随机数。若如此做，MaskValueConfig中的value将被忽视。
    /** @memberof ENUM_MASK_OPERATION */
    INCREMENT_MAX: 2, // 增加最大值，并生成随机数。若如此做，MaskValueConfig中的value表示增量（为负则是减量）。
    /** @memberof ENUM_MASK_OPERATION */
    INCREMENT_MIN: 3, // 增加最小值，并生成随机数。若如此做，MaskValueConfig中的value表示增量（为负则是减量）。
    /** @memberof ENUM_MASK_OPERATION */
    RANDOM_INCREMENT_MAX: 4, // 随机增加最大值，并生成随机数。若如此做，MaskValueConfig中的value将被忽视。随机增大的范围由min和max决定。
    /** @memberof ENUM_MASK_OPERATION */
    RANDOM_INCREMENT_MIN: 5, // 随机增加最小值，并生成随机数。若如此做，MaskValueConfig中的value将被忽视。随机增大的范围由min和max决定。
});

/**
 * @typedef {{min?:number,max?:number,value:any}} MaskValueConfig
 * @exports
 */

/**
 * @description Operations functions. What actions should be performed when a mask is applied to a object and its values.
 * @template {Record<string, any>} T
 * @typedef {(obj:T, target_prop:keyof T, mask_value:MaskValueConfig) => T} OperationFunction
 */

/**
 * @typedef MaskValueSources
 * @property {0} STRENGTH
 * @property {1} CHANNEL_R
 * @property {2} CHANNEL_G
 * @property {3} CHANNEL_B
 * @property {4} CHANNEL_A
 */
/** @type {MaskValueSources} */
const MASK_VALUE_SOURCES = Object.freeze({
    STRENGTH: 0,
    CHANNEL_R: 1,
    CHANNEL_G: 2,
    CHANNEL_B: 3,
    CHANNEL_A: 4,
});

/**
 * @description Default mask config.
 * @typedef MaskOptions
 * @property {MaskType[keyof MaskType]} type - Mask type.
 * @property {MaskOperation[keyof MaskOperation]} operation - Mask operation.
 * @property {MaskValueSources[keyof MaskValueSources]} source - Mask value reference source. The value is determined by the image the mask uses to some extent.
 * @property {string} target - Mask target property.
 * @property {MaskValueConfig} mask_value_config - Mask value config.
 * @exports
 */

/** @type {MaskOptions} */
const MASK_CONFIG_DEFAULT = {
    type: ENUM_MASK_TYPE.UNDEFINED,
    operation: ENUM_MASK_OPERATION.FIXED_VALUE,
    source: MASK_VALUE_SOURCES.STRENGTH,
    target: "",
    mask_value_config: { value: null },
};

// TODO: 让同一张图可以操作不同数值部分

module.exports = {
    ENUM_MASK_TYPE,
    ENUM_MASK_OPERATION,
    MASK_CONFIG_DEFAULT,
    MASK_VALUE_SOURCES,
};
