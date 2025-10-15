/**
 * @description  Definitions related to System, Nebula, etc.. 星系和星云有关类型定义
 */

/**
 * @typedef {import ("../pos/Pos2d.js")} Pos2d
 * @typedef {import ("../../../../libs/types/types").RanIntLimitation} RanIntLimitation
 */

/**
 * @typedef SystemOptions
 * @property {Pos2d} Pos
 * @property {string?} name
 * @property {string?} appearance
 * @property {number?} size
 * @property {string & {toString: ()=>string}} seed
 * @property {ENUM_SYSTEM_COLOR[keyof ENUM_SYSTEM_COLOR]} [color]
 * @exports
 */

/**
 * @typedef SystemColor
 * @property {0} PINK
 * @property {1} RED
 * @property {2} ORANGE
 * @property {3} YELLOW
 * @property {4} LIME
 * @property {5} GREEN
 * @property {6} WATER
 * @property {7} BLUE
 * @property {8} PURPLE
 * @property {9} WHITE - Default color
 * @property {10} BLACK_HOLE
 * @exports
 */

/**
 * @type {SystemColor}
 */
const ENUM_SYSTEM_COLOR = {
    /** @memberof SystemColor */
    PINK: 0,
    /** @memberof SystemColor */
    RED: 1,
    /** @memberof SystemColor */
    ORANGE: 2,
    /** @memberof SystemColor */
    YELLOW: 3,
    /** @memberof SystemColor */
    LIME: 4,
    /** @memberof SystemColor */
    GREEN: 5,
    /** @memberof SystemColor */
    WATER: 6,
    /** @memberof SystemColor */
    BLUE: 7,
    /** @memberof SystemColor */
    PURPLE: 8,
    /**
     * @memberof SystemColor
     * @default
     */
    WHITE: 9,
    /** @memberof SystemColor */
    BLACK_HOLE: 10,
};

/**
 * @typedef NameRule
 * @property {string[]} head
 * @property {string[]} neck
 * @property {string[]} body
 * @property {string[]} end
 * @exports
 */

/**
 * @description 星系大小限制，指一个星系内允许生成的星球数量，为{x|x∈[min, max]}
 * @readonly
 * @type {RanIntLimitation}
 */
const SYSTEM_SIZE_LIMITATION = { min: 1, max: 9 };

module.exports = {
    // SystemOptions,
    ENUM_SYSTEM_COLOR,
    SYSTEM_SIZE_LIMITATION,
};
