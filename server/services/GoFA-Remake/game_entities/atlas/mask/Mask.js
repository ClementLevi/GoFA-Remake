const path = require("node:path");

/**
 * @typedef {import('../mask/IMask')} IMask
 * @type {IMask}
 */
const IMask = require(path.resolve(__dirname, "./IMask"));
const ENUM_MASK_TYPE = require(path.resolve(__dirname, "./ENUM_MASK_TYPE"));



class ExistenceMask extends IMask {
    constructor(image = undefined, type = ENUM_MASK_TYPE.EXISTENCE) {
        super(image, type);
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
