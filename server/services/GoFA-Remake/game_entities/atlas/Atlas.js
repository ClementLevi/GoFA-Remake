const path = require("node:path");

const {
    /** @type {import("../../../libs/error/Error").ValueError }*/ ValueError,
} = require("../../../libs/error/Error");
/**
 * @typedef {typeof import("../../../libs/shared/logger")} Logger
 * @type {Logger}
 */
const Log = require(path.resolve(__dirname, "../../../libs/shared/logger"));

/**
 * @typedef {import("./system/System")} System
 */

/**
 * @class
 * @property {System[]} atlas
 * @property {(number, number)=>System[][]} chunk
 * @property {()=>Promise<this>} load
 * @property {()=>Promise<this>} save
 */
class Atlas {
    /** @type {number} */
    static CHUNK_SIZE_TEMPLATE = 30;
    /**
     * @param {System[][]} nebulae
     */
    constructor(nebulae = []) {
        /** @type {System[][]} */
        this.atlas = nebulae;
        /** @type {number} */
        this.CHUNK_SIZE = Atlas.CHUNK_SIZE_TEMPLATE;
    }

    async load() {
        return new Promise((resolve, reject) => {
            Log.info("Loading atlas");
            // TODO: Handle loading data
            Log.info(`Atlas loaded`);
            resolve(this);
        });
    }

    async save() {
        Log.info("Saving atlas");
        return new Promise((resolve, reject) => {
            // TODO: Handle serializing data
            Log.info(`Atlas saved`);
            resolve(this);
        });
    }
    /**
     *
     * @param {number} cx
     * @param {number} cy
     * @returns {System[][]}
     */
    chunk(cx, cy) {
        let x_from = cx * this.CHUNK_SIZE;
        let x_to = x_from + this.CHUNK_SIZE;
        let y_from = cy * this.CHUNK_SIZE;
        let y_to = y_from + this.CHUNK_SIZE;
        return this.atlas.slice(y_from, y_to).map((row) =>
            row.slice(x_from, x_to)
        );
    }
    /**
     * @param {number} size
     * @returns {this}
     * @throws {ValueError}
     */
    defineChunkSize(size) {
        if (size <= 0)
            throw new ValueError("Chunk size must be greater than 0");
        if (!Number.isSafeInteger(size))
            throw new ValueError(
                "Chunk size must be a safe integer (recommending: 30)"
            );
        this.CHUNK_SIZE = size;
        return this;
    }
}

module.exports = Atlas;

if (require.main === module) {
    console.log("Atlas class definition");
    const atlas = new Atlas();

    atlas.save().then(() => {
        console.log("Atlas saved by module");
        console.log(atlas);
    });
}
