//@ts-check
const fs = require("fs");
const path = require("path");

const Atlas = require(path.resolve(
    "services/GoFA-Remake/game_entities/atlas/Atlas.js"
));
const Masks = require(path.resolve(
    "services/GoFA-Remake/game_entities/atlas/mask/Mask.js"
));
const Nebula = require(path.resolve(
    "services/GoFA-Remake/game_entities/atlas/Generator/Nebula.js"
));
const Serializer = require(path.resolve("services/libs/shared/Serializer.js"));
const NoiseGenerator = require(path.resolve(
    "services/libs/shared/NoiseGenerator.js"
));

class PrimitiveGalaxyBuilder {
    constructor(ng = NoiseGenerator.PerlinNoiseGenerator) {
        this.name = "Generator";
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
