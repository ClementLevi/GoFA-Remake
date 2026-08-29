const path = require("node:path");
const uuid = require("node:crypto").randomUUID;

/**
 * @typedef {typeof import('../../../../libs/shared/index').linearRemap} linearRemap
 * @type {{linearRemap:linearRemap,}}
 */
const { linearRemap } = require("../../../../libs/shared/index.js");

/**
 * @typedef {typeof import("../../../../libs/shared/RNG")} RNG
 * @type {RNG}
 */
const RNG = require(path.resolve(__dirname, "../../../../libs/shared/RNG"));

/**
 * @typedef {typeof import("../system/System")} System
 * @type {System}
 */
const System = require(path.resolve(__dirname, "../system/System"));

/**
 * @typedef {typeof import("../planet/Planet")} Planet
 * @typedef {import("../system/System.d").SystemOptions} SystemOptions
 */
const {
    /** @type {SystemColor}*/ ENUM_SYSTEM_COLOR,
    /** @type {SystemSizeLimitation}*/ SYSTEM_SIZE_LIMITATION,
    /** @type {SystemColorLimitation}*/ SYSTEM_COLOR_LIMITATION,
} = require(path.resolve(__dirname, "../system/System.d"));

/**
 * @typedef {import ("../system/SystemNameGenerator")} INameGenerator
 * @typedef {import ("../system/SystemNameGenerator").NameRule} NameRule
 * @typedef {typeof import("../system/SystemNameGenerator")} SystemNameGenerator
 */

/**
 * @class Nebula
 * @property {PrimitivePlanet[]} planets 星系内的行星
 * @property {number} seed 随机种子
 * @property {}
 * @property {():void} apply_mask_value 应用遮罩值
 * @property {():void} generate_primitive_planet 生成原型行星
 * @property {()=>System} finish_generation 完成星系生成
 */
class Nebula {
    /**
     * 星系名称（Python 版遗留字段，仅类型声明，无初始化）
     * @type {string?}
     */
    name;
    /**
     *
     * @param {Omit<Partial<SystemOptions>, "seed"> & {Pos: SystemOptions["Pos"], seed?: (string & {toString: ()=>string}) | number}} options
     * @param {InstanceType<RNG>?} [rng] 随机数生成器实例，用于生成星系名称
     */
    constructor(options, rng) {
        /** @type {SystemOptions["seed"] } */
        this.seed = /** @type {SystemOptions["seed"]} */ (options.seed ?? uuid());
        /** @type {InstanceType<RNG>} */
        this._rng = rng ?? new RNG(this.seed);
        /** @type {SystemOptions["appearance"]} */
        this.appearance = options.appearance ?? ""; // Appearance, for frontend rendering, no logic related to it. But it has to be static to store in db.
        /** @type {number} */
        this.size =
            options.size ??
            Math.round(
                linearRemap(
                    this._rng.random(),
                    SYSTEM_SIZE_LIMITATION.min,
                    SYSTEM_SIZE_LIMITATION.max
                )
            );
        /** @type {InstanceType<Planet>[]} */
        this.planets = [];
        /** @type {ENUM_SYSTEM_COLOR} */
        this.color =
            options.color ??
            Math.round(
                linearRemap(
                    this._rng.random(),
                    SYSTEM_COLOR_LIMITATION.min,
                    SYSTEM_COLOR_LIMITATION.max
                )
            );
        /**@type {Pos2d} */
        this.Pos = options.Pos;
    }
    apply_mask(value) {}
    /**
     * @returns {this}
     */
    generate_primitive_planet() {
        let size = 1 + Math.floor(this._rng.random() * 12);
        return this;
    }
    /**
     * @see {@link Pos2d.offset}
     * @param {number} e
     */
    offset_position(e){
        this.Pos.offset(e);
        return this;
    }
    /**
     * @returns {InstanceType<System>}
     */
    finish_generation() {
        return new System({
            name: this.name,
            Pos: this.Pos,
            seed: this.seed,
            appearance: this.appearance,
            size: this.size,
            color: this.color,
        }, this._rng);
    }
    toString() {
        return `[Nebula(${this.size}) @(${this.Pos.x}, ${this.Pos.y})]`;
    }
}

module.exports = Nebula;

if (require.main === module) {
    const Pos2d = require("../pos/Pos2d");
    let n = new Nebula({Pos: new Pos2d(114, 514)});
    console.log(n);
    let s = n.offset_position(10).finish_generation();
    console.log(s);
}
