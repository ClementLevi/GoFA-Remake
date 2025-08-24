//@ts-check
const fs = require("node:fs");
const path = require("node:path");

const Atlas = require(path.resolve(__dirname, "../Atlas.js"));
const Masks = require(path.resolve(__dirname, "../mask/Mask.js"));
const Nebula = require(path.resolve(__dirname, "Nebula.js"));
const Serializer = require(path.resolve(
    __dirname,
    "../../../../libs/shared/Serializer.js"
));
const NoiseGeneratorModule = require(path.resolve(
    __dirname,
    "../../../../libs/generators/NoiseGenerator.js"
));

class PrimitiveGalaxyBuilder {
    /**
     * @param {import("../../../../libs/generators/NoiseGenerator.js").INoiseGenerator} ng 噪音生成器类
     */
    constructor(ng = NoiseGeneratorModule.PerlinNoiseGenerator) {
        this._ng = ng;
    }

    generate_base_galaxy() {
        console.log("Generating...");
        return this;
    }

    add_mask(mask) {
        console.log("Adding mask...");
        return this;
    }

    apply_mask(mask) {
        console.log("Applying mask...");
        return this;
    }

    apply_all_masks() {
        return this;
    }

    finish_galaxy_generation() {
        var atlas = new Atlas();
        return atlas;
    }
}

module.exports = PrimitiveGalaxyBuilder;
if (require.main === module) {
    const generator = new PrimitiveGalaxyBuilder();
    generator.generate_base_galaxy();
}
