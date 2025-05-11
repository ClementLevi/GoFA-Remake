const uuid = require("uuid");

/**
 * Enum for planet types
 * @typedef
 * @const
 * @readonly
 */
const ENUM_PLANET_TYPE = {
    OCEANIC: 0,
    ICY: 1,
    VOLCANIC: 2,
    ROCKY: 3,
    DESERT: 4,
    JUNGLE: 5,
    RED_CIT: 6,
    YELLOW_CIT: 7,
    BLUE_CIT: 8,
    FRACTURED: 9,
};


class Planet {
    /**
     * @param {string} seed - Seed for planet generation
     */
    constructor(system, seed) {
        this.seed = seed;
        this.id = uuid.v4();
        this.name = null;
        this.size = 0;
        this.rssMetal = 0;
        this.rssGas = 0;
        this.rssCrystal = 0;
        this.efficiency = 0;
        this.type = "";
    }
    initRSS(){

    }
}
module.exports = Planet;

if (require.main === module) {
    const planet = new Planet();
    console.log(planet);
}
