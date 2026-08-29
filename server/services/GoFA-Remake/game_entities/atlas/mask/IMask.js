const path = require("node:path");

const {
    InitializationViolationError,
} = require("../../../../libs/error/Error");

/**
 * @typedef {typeof import('../../../../libs/shared/index').linearRemap} linearRemap
 * @typedef {typeof import('../../../../libs/shared/index').isArray2D} isArray2D
 * @type {{linearRemap:linearRemap,isArray2D:isArray2D}}
 */
const { linearRemap, isArray2D } = require(path.resolve(
    __dirname,
    "../../../../libs/shared/index"
));

/**
 * @typedef {InstanceType<import('../../../../libs/shared/logger').TypeLogger>} Log
 * @type {Log}
 */
const Log = require(path.resolve(__dirname, "../../../../libs/shared/logger"));

/**
 * @typedef {typeof import("../../../../libs/shared/RNG")} RNG
 * @type {RNG}
 */
const RNG = require(path.resolve(__dirname, "../../../../libs/shared/RNG"));

/**
 * @typedef {typeof import('../../../../libs/image/Image')} Image
 * @type {Image}
 */
const Image = require(path.resolve(__dirname, "../../../../libs/image/Image"));

/**
 * @typedef {typeof import('./Mask.d').ENUM_MASK_OPERATION} MaskOperation
 * @typedef {typeof import("./Mask.d").ENUM_MASK_TYPE} MaskType
 * @typedef {import("./Mask.d").MaskValueConfig} MaskValueConfig
 * @typedef {import("./Mask.d").MaskOptions} MaskDefaultConfig
 * @type {{ENUM_MASK_OPERATION: MaskOperation, ENUM_MASK_TYPE: MaskType, MASK_CONFIG_DEFAULT: MaskDefaultConfig}}
 */
const {
    ENUM_MASK_OPERATION,
    ENUM_MASK_TYPE,
    MASK_CONFIG_DEFAULT,
} = require(path.resolve(__dirname, "./Mask.d"));

/**
 * @template {Record<string, any>} T
 * @typedef {import('./Mask.d').OperationFunction<T>} OperationFunction
 */

/**
 * @class IMask
 */
class IMask {
    /**
     * @description Decide the final value for the mask value to apply
     * @param {MaskValueConfig} value_config
     * @param {MaskOperation[keyof MaskOperation]} [option=ENUM_MASK_OPERATION]
     * @param {InstanceType<RNG>} rng
     */
    static determine_value(
        value_config,
        option = ENUM_MASK_OPERATION.FIXED_VALUE,
        rng = new RNG(this.toString())
    ) {
        let min_ok = Number.isSafeInteger(value_config.min),
            max_ok = Number.isSafeInteger(value_config.max),
            value_ok = value_config.value !== undefined;
        switch (option) {
            case ENUM_MASK_OPERATION.FIXED_VALUE:
                return value_config.value;
            case ENUM_MASK_OPERATION.RANDOM_VALUE_FROM_RANGE:
                if (!min_ok) throw TypeError("'min' must be integers");
                if (!max_ok) throw TypeError("'max' must be integers");
                return Math.round(
                    linearRemap(
                        rng.random(),
                        value_config.min,
                        value_config.max
                    )
                );
            case ENUM_MASK_OPERATION.INCREMENT_MAX:
                if (!value_ok) throw TypeError("'value' must be integers");
                return value_config.max + value_config.value;
            case ENUM_MASK_OPERATION.INCREMENT_MIN:
                if (!value_ok) throw TypeError("'value' must be integers");
                return value_config.min + value_config.value;
            case ENUM_MASK_OPERATION.RANDOM_INCREMENT_MAX:
                if (!min_ok) throw TypeError("'min' must be integers");
                if (!max_ok) throw TypeError("'max' must be integers");
                return value_config.max + rng.random() * 2;
            case ENUM_MASK_OPERATION.RANDOM_INCREMENT_MIN:
                if (!min_ok) throw TypeError("'min' must be integers");
                if (!max_ok) throw TypeError("'max' must be integers");
                return value_config.min - rng.random() * 2;
            default:
                return value_config.value;
        }
    }
    /**
     * @constructor
     * @param {Image?} image
     * @param {MaskDefaultConfig | number} [config=MASK_CONFIG_DEFAULT]
     * @param {InstanceType<RNG>?} rng
     */
    constructor(image = null, config = MASK_CONFIG_DEFAULT, rng = null) {
        if (new.target === IMask) {
            throw new TypeError("Cannot instantiate interface");
        }
        // Config for constructing
        // note: 调用方可能把遮罩类型编号（MaskType 数值）作为 config 传入，这里按 MaskDefaultConfig 断言后使用
        /** @type {MaskOperation[keyof MaskOperation]} */
        this.operation = /** @type {MaskDefaultConfig} */ (config).operation;
        /**@type {string} */
        this.target = /** @type {MaskDefaultConfig} */ (config).target ?? "";
        /** @type {MaskValueConfig} */
        this.value_config =
            /** @type {MaskDefaultConfig} */ (config).mask_value_config ??
            { value: null };
        /**@type {InstanceType<RNG>} */
        this.rng = rng ?? new RNG();

        // These will be modified when loaded an image
        /** @type {(number|bigint)[][]} */
        this._mask_values = [[-1]];
        /**
         * @template {{target_prop:any}} T
         * @type {Record<MaskOperation[keyof MaskOperation],OperationFunction<T>>}
         */
        this._callbacks = {
            [ENUM_MASK_OPERATION.FIXED_VALUE]: (
                system,
                target_prop,
                mask_value
            ) => system,
            [ENUM_MASK_OPERATION.RANDOM_VALUE_FROM_RANGE]: (
                system,
                target_prop,
                mask_value
            ) => system,
            [ENUM_MASK_OPERATION.INCREMENT_MAX]: (
                system,
                target_prop,
                mask_value
            ) => system,
            [ENUM_MASK_OPERATION.INCREMENT_MIN]: (
                system,
                target_prop,
                mask_value
            ) => system,
            [ENUM_MASK_OPERATION.RANDOM_INCREMENT_MAX]: (
                system,
                target_prop,
                mask_value
            ) => system,
            [ENUM_MASK_OPERATION.RANDOM_INCREMENT_MIN]: (
                system,
                target_prop,
                mask_value
            ) => system,
        };
    }
    /**
     * 加载图片
     * Load image
     * @param {string} image_path
     * @returns {Promise<void>}
     * @abstract
     */
    async load_image(image_path) {
        let img = new Image({ filePath: image_path });
        img.load()
            .then(() => {
                this._mask_values = img.to2DRGBAArray(); // ! 默认使用2维RGBA数组
            })
            .catch((err) => {
                Log.error(err);
            });
    }
    /**
     *
     * @param {number[][]} arr
     */
    use_plain_array(arr) {
        if (!isArray2D(arr)) {
            throw new TypeError("Input must be a 2D array.");
        }
        this._mask_values = arr;
        return this;
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
    /**
     * 应用遮罩
     * Apply mask
     * @template {Record<string,any>} T
     * @param {T[]} applicant
     * @returns {T[]}
     * @abstract
     */
    apply_mask(applicant) {
        let ret = applicant.map((item) =>
            this.modify_target(item, this.target)
        );
        return ret;
    }
    /**
     * @template {Record<string,any>} T
     * @param {T} obj
     * @param {keyof T} prop
     * @returns {T}
     */
    modify_target(obj, prop = this.target) {
        if (!obj.hasOwnProperty(prop)) return obj; // 目标属性不存在，不做任何修改
        let cb = this._callbacks[this.operation];
        if (!cb)
            throw new InitializationViolationError(
                `Unimplemented operation callback for code: ${this.operation}`
            ); // 无效的操作
        let value = IMask.determine_value(
            this.value_config,
            this.operation,
            this.rng
        );
        return /** @type {any} */ (cb)(obj, prop, value);
    }
}

module.exports = IMask;

if (require.main === module) {
    class PlainMask extends IMask {
        constructor(image = undefined, type = ENUM_MASK_TYPE.EXISTENCE) {
            super(image, type);
        }
    }
    let a = new PlainMask();
    Log.info(a);
}
