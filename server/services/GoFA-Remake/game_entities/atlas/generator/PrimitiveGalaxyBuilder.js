const path = require("node:path");

/**
 * @typedef {InstanceType<import("../../../../libs/shared/logger").TypeLogger>} Log
 * @type {Log}
 */
const Log = require(path.resolve(__dirname, "../../../../libs/shared/logger"));
/**
 * @typedef {typeof import('../../../../libs/shared/index').linearRemap} linearRemap
 * @typedef  {import("../../../../libs/shared/index.js").newPositionedGrid} newPositionedGrid
 * @type {{linearRemap:linearRemap, newPositionedGrid:newPositionedGrid}}
 */
const {
    newPositionedGrid,
    linearRemap,
} = require("../../../../libs/shared/index");

const RNG = require("../../../../libs/shared/RNG");

/**
 * @typedef {typeof import("../pos/Pos2d")} Pos2d
 * @type {Pos2d}
 */
const Pos2d = require(path.resolve(__dirname, "../pos/Pos2d"));

/**
 * @typedef {typeof import('../Atlas')} Atlas
 * @type {Atlas}
 */
const Atlas = require(path.resolve(__dirname, "../Atlas"));
/**
 * @typedef {import('../mask/Mask')} Mask
 * @typedef {InstanceType<Masks[keyof Masks]>} MaskInstance
 * @type {Mask}
 */
const Masks = require(path.resolve(__dirname, "../mask/Mask"));

/**
 * @typedef {typeof import('../mask/IMask')} IMask
 * @type {IMask}
 */
const IMask = require(path.resolve(__dirname, "../mask/IMask"));

/**
 * @typedef {typeof import('../system/System')} System
 * @type {System}
 */
const System = require(path.resolve(__dirname, "../system/System"));
/**
 * @typedef {typeof import('./Nebula')} Nebula
 * @type {Nebula}
 */
const Nebula = require(path.resolve(__dirname, "./Nebula"));
/**
 * @typedef {typeof import("../../../../libs/shared/Serializer.js")} Serializer
 * @type {Serializer}
 */
const Serializer = require(path.resolve(
    __dirname,
    "../../../../libs/shared/Serializer"
));
/**
 * @typedef {import("../../../../libs/generators/NoiseGenerator.js")} NoiseGenerator
 * @typedef {import("../../../../libs/generators/NoiseGenerator.js").INoiseGenerator} INoiseGenerator
 * @type {NoiseGenerator}
 */
const NoiseGeneratorModule = require(path.resolve(
    __dirname,
    "../../../../libs/generators/NoiseGenerator"
));

/**
 * @typedef {typeof import("../planet/Planet")} Planet
 * @typedef {import("../system/System.d").SystemOptions} SystemOptions
 */

/**
 * 基本星系生成器
 * @class PrimitiveGalaxyBuilder
 * @property {number} width 地图宽度
 * @property {number} height 地图高度
 * @property {INoiseGenerator} _ng 噪音生成器类
 * @property {Nebula[][]} nebulae 星系图
 * @property {MaskInstance[]} masks 星系遮罩
 * @property {()=>this} generate_base_galaxy 生成基于网格的基本星系
 * @property {(IMask)=>this} add_mask 添加遮罩
 * @property {()=>this} apply_mask 应用遮罩
 * @property {()=>this} apply_all_masks 应用所有遮罩
 * @property {()=>Atlas} finish_galaxy_generation 完成星系生成
 *
 * @example
 * let atlas = new PrimitiveGalaxyBuilder(12, 10)
 *    .generate_base_galaxy()
 *    .finish_galaxy_generation();
 * console.log(atlas);
 */
class PrimitiveGalaxyBuilder {
    /**
     * @param {number} width 地图宽度
     * @param {number} height 地图高度
     * @param {INoiseGenerator} ng 噪音生成器类
     */
    constructor(
        width,
        height,
        ng = new NoiseGeneratorModule.PerlinNoiseGenerator()
    ) {
        /** @type {INoiseGenerator} _ng 噪音生成器类 */
        this._ng = ng;
        /** @type {number} width 地图宽度 */
        this.width = width ?? 800;
        /** @type {number} height 地图高度 */
        this.height = height ?? 800;
        /** @type {InstanceType<Nebula>[][]} nebulae 星系图 */
        this.nebulae = [];
        /** @type {MaskInstance[]} masks 星系遮罩 */
        this.masks = [];
    }

    /**
     * Step 1: 生成基本星系
     * 这将会修改this.nebulae
     * @param {SystemOptions["seed"]} seed
     * @param {INoiseGenerator?} ng
     * @returns {this}
     */
    generate_base_galaxy(seed, ng = null) {
        if (!ng) ng = this._ng;
        if (isNaN(this.width) || isNaN(this.height))
            throw new Error("Invalid map size.");
        let map_grid = newPositionedGrid(this.width, this.height);
        let rng = new RNG(seed);
        this.nebulae = map_grid.map((row) =>
            row.map((grid_point) => {
                let system_seed = rng.random();
                return new Nebula({
                    Pos: new Pos2d(grid_point.x, grid_point.y),
                    seed: system_seed,
                    name: null,
                    appearance: null,
                    size: null,
                });
            })
        );
        return this;
    }

    /**
     * Step Optional 1: 添加遮罩
     * @param {IMask} [mask] 遮罩实例
     * @returns {this}
     */
    add_mask(mask) {
        if (mask === undefined || mask === null) return this;
        if (!(mask instanceof IMask))
            throw TypeError(
                `Invalid mask: ${mask}(${typeof mask}, ${
                    mask.constructor.name
                })`
            );
        this.masks.push(mask);
        return this;
    }
    /**
     * Step Optional 2: 应用遮罩
     * Not recommended, as you will need to know the index of the mask to apply. 不建议使用，因为你需要知道遮罩的索引号才能应用。
     * Note that one mask can be applied multiple times. 注意，一个遮罩可以被多次应用。
     * @param {number} mask_index
     * @returns {this}
     */
    apply_mask(mask_index) {
        if (mask_index >= this.masks.length) {
            Log.warn(`Invalid mask index ${mask_index}, skipped.`);
            return this;
        }
        console.log("Applying mask...");
        let mask_to_apply = this.masks[mask_index];
        this.nebulae.forEach((row) => {
            row.forEach((system) => {
                mask_to_apply
                    ? mask_to_apply.apply_mask(/** @type {any} */ (system))
                    : system;
            });
        });
        return this;
    }
    /**
     * Step Optional 2 Alternative: 应用所有遮罩
     * @see {@link PrimitiveGalaxyBuilder.apply_mask}
     * @returns {this}
     */
    apply_all_masks() {
        for (let i = 0; i < this.masks.length; i++) {
            this.apply_mask(i);
        }
        return this;
    }

    finish_galaxy_generation() {
        let systems = this.nebulae.map((row) =>
            row.map((n) => n.finish_generation())
        );
        var atlas = new Atlas(systems);
        return atlas;
    }
}

module.exports = PrimitiveGalaxyBuilder;
if (require.main === module) {
    console.profile("PrimitiveGalaxyBuilder");
    console.time("PrimitiveGalaxyBuilder");
    let pgb = new PrimitiveGalaxyBuilder(120, 100)
        .generate_base_galaxy("114514")
        .add_mask()
        .apply_all_masks();
    console.log(pgb.nebulae[0].toString());
    console.profileEnd("PrimitiveGalaxyBuilder");
    console.timeEnd("PrimitiveGalaxyBuilder");
    let atlas = pgb.finish_galaxy_generation();
    console.log(atlas.atlas[0].toString());

    let chunkB2 = atlas.chunk(1, 1);
    console.log(`chunkB2: `, chunkB2.length);
    // console.log(chunkB2.flat().map((i) => i.toString()));
}
