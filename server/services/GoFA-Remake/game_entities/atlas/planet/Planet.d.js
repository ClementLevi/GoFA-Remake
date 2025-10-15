/** @typedef {import ("../../../../libs/types/types").RanIntLimitation} RanIntLimitation */

/**
 * @typedef PlanetType
 * @property {0} OCEANIC - 水星
 * @property {1} ICY - 冰冷星球
 * @property {2} VOLCANIC - 火山星球
 * @property {3} ROCKY - 岩石星球
 * @property {4} DESERT - 荒漠星球
 * @property {5} JUNGLE - 森林星球
 * @property {21} RED_CIT - 红要塞
 * @property {22} YELLOW_CIT - 黄要塞
 * @property {23} BLUE_CIT - 蓝要塞
 * @default 0
 */

/** @type {PlanetType} */
const ENUM_PLANET_TYPE = Object.freeze({
    OCEANIC: 0,
    ICY: 1,
    VOLCANIC: 2,
    ROCKY: 3,
    DESERT: 4,
    JUNGLE: 5,
    RED_CIT: 21,
    YELLOW_CIT: 22,
    BLUE_CIT: 23,
});

/**
 * @description 星球资源值限制，适用于M、G、C三种资源和Efficiency，{x|x∈[min, max]}
 * @readonly
 * @type {RanIntLimitation}
 */
const PLANET_RSS_LIMITATION = { min: 1, max: 10 };
/**
 * @description 星球大小值限制，指建筑槽位数量，{x|x∈[min, max]}
 * @readonly
 * @type {RanIntLimitation}
 */
const PLANET_SIZE_LIMITATION = { min: 5, max: 16 };
/**
 * @description 星球种类值限制，默认生成的都是非堡垒类型，{x|x∈[min, max]}
 * @readonly
 * @type {RanIntLimitation}
 */
const PLANET_VARIATION_LIMITATION = { min: 0, max: 5 };
/**
 * @description 星球种类为堡垒时的值限制，，{x|x∈[min, max]}
 * @readonly
 * @type {RanIntLimitation}
 */
const PLANET_CIT_VARIATION_LIMITATION = { min: 21, max: 23 };
/**
 * @description 星球生成为堡垒星球的概率
 * @readonly
 * @type {number}
 */
const PLANET_CIT_CHANCE_LIMITATION = 0.15;

module.exports = {
    ENUM_PLANET_TYPE,
    PLANET_RSS_LIMITATION,
    PLANET_SIZE_LIMITATION,
    PLANET_VARIATION_LIMITATION,
    PLANET_CIT_CHANCE_LIMITATION,
    PLANET_CIT_VARIATION_LIMITATION,
};
