const path = require("node:path");

/**
 * @typedef {typeof import('../../../../libs/shared/index').linearRemap} linearRemap
 * @type {{linearRemap:linearRemap}}
 */
const { linearRemap } = require(path.resolve(
    __dirname,
    "../../../../libs/shared/index"
));

/**
 * @typedef {typeof import("../../../../libs/shared/RNG")} RNG
 * @type {RNG}
 */
const RNG = require(path.resolve(__dirname, "../../../../libs/shared/RNG"));

/**
 * @typedef {typeof import('../mask/IMask')} IMask
 * @type {IMask}
 */
const IMask = require(path.resolve(__dirname, "./IMask"));
/**
 * @typedef {typeof import('./Mask.d').ENUM_MASK_TYPE} MaskType
 * @typedef {typeof import('./Mask.d').ENUM_MASK_OPERATION} MaskOperation
 * @typedef {import('./Mask.d').MaskValueConfig} MaskValueConfig
 * @typedef {import('./Mask.d').OperationFunction<*>} OperationFunction
 * @type {{ENUM_MASK_TYPE:MaskType,ENUM_MASK_OPERATION:MaskOperation}}
 */
const { ENUM_MASK_TYPE, ENUM_MASK_OPERATION } = require(path.resolve(
    __dirname,
    "./Mask.d"
));


/**
 * @type {OperationFunction}
 */
function ExistenceOperation(obj, target_prop, mask_value) {}

class ExistenceMask extends IMask {
    constructor(
        image = undefined,
        type = ENUM_MASK_TYPE.EXISTENCE,
        operation = ENUM_MASK_OPERATION.FIXED_VALUE,
        source = "",
        target = "",
        mask_value = { value: null }
    ) {
        super(...arguments);
    }
}

class ColorMask extends IMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.COLOR) {
        super(image, type);
    }
}

class RssAbundanceMask extends IMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.RSS_ABUNDANCE) {
        super(image, type);
    }
}

class PosOffsetMask extends IMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.POS_OFFSET) {
        super(image, type);
    }
}

class CapacityMask extends IMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.CAPACITY) {
        super(image, type);
    }
}

// Resource abundance mask is various to be classified as below:

class RssMask_EFF extends RssAbundanceMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.RSS_ABUNDANCE) {
        super(image, type);
    }
}

class RssMask_SIZE extends RssAbundanceMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.RSS_ABUNDANCE) {
        super(image, type);
    }
}
class RssMask_METAL extends RssAbundanceMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.RSS_ABUNDANCE) {
        super(image, type);
    }
}

class RssMask_GAS extends RssAbundanceMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.RSS_ABUNDANCE) {
        super(image, type);
    }
}

class RssMask_CRY extends RssAbundanceMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.RSS_ABUNDANCE) {
        super(image, type);
    }
}

class RssMask_CITADEL extends RssAbundanceMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.RSS_ABUNDANCE) {
        super(image, type);
    }
}

module.exports = {
    ExistenceMask,
    ColorMask,
    RssAbundanceMask,
    PosOffsetMask,
    CapacityMask,
    RssMask_EFF,
    RssMask_SIZE,
    RssMask_METAL,
    RssMask_GAS,
    RssMask_CRY,
    RssMask_CITADEL,
};
if (require.main === module) {
    const System = require("../system/System");
    const Pos2d = require("../pos/Pos2d");
    let mock_sys_existence = new System({
        name: "Mock System",
        seed: "mock_seed",
        appearance: "mock_appearance",
        size: 10,
        color: 0,
        Pos: new Pos2d(114, 514),
    });

    let mask = new ExistenceMask();
    mask.use_plain_array([[0]]);
    mask.apply_mask([mock_sys_existence]);
    console.log(mask);
    console.log(mock_sys_existence);
}
