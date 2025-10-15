const path = require("node:path");

/**
 * @deprecated
 * TODO: Replace with node:crypto.randomUUID()
 */
const uuid = require("uuid");

/** @typedef {import ("../system/System")} System */

/**
 * @typedef {typeof import("../../../../libs/shared/index").linearRemap} linearRemap
 * @type {{linearRemap: linearRemap}}
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
 * @typedef {import("./Planet.d").PlanetType} PlanetType
 * @typedef {typeof import("./Planet.d").PLANET_RSS_LIMITATION} PLANET_RSS_LIMITATION
 * @typedef {typeof import("./Planet.d").PLANET_SIZE_LIMITATION} PLANET_SIZE_LIMITATION
 * @typedef {typeof import("./Planet.d").PLANET_VARIATION_LIMITATION} PLANET_VARIATION_LIMITATION
 * @typedef {typeof import("./Planet.d").PLANET_CIT_CHANCE_LIMITATION} PLANET_CIT_CHANCE_LIMITATION
 * @typedef {typeof import("./Planet.d").PLANET_CIT_VARIATION_LIMITATION} PLANET_CIT_VARIATION_LIMITATION
 */
const {
    /** @type {PlanetType}  */
    ENUM_PLANET_TYPE,
    /** @type {PLANET_RSS_LIMITATION}  */
    PLANET_RSS_LIMITATION,
    /** @type {PLANET_VARIATION_LIMITATION}  */
    PLANET_VARIATION_LIMITATION,
    /** @type {PLANET_SIZE_LIMITATION}  */
    PLANET_SIZE_LIMITATION,
    /** @type {PLANET_CIT_CHANCE_LIMITATION}  */
    PLANET_CIT_CHANCE_LIMITATION,
    /** @type {PLANET_CIT_VARIATION_LIMITATION}  */
    PLANET_CIT_VARIATION_LIMITATION,
} = require("./Planet.d");

/**
 * @class Planet
 * @property {string} id - UUID of planet
 * @property {string} name - Actual name of planet
 * @property {string} display_name - Name of planet to be displayed
 * @property {number} size - Size of planet
 * @property {number} rssMetal - Metal resource stockpile of planet
 * @property {number} rssGas - Gas resource stockpile of planet
 * @property {number} rssCrystal - Crystal resource stockpile of planet
 * @property {number} efficiency - Efficiency of planet
 * @exports
 */
class Planet {
    /**
     * @param {System} parent - Ref for parent object, which is System
     * @param {string & { toString: () => string}} seed - Seed for planet generation
     */
    constructor(parent, seed) {
        /**@type {System} */
        this.parent = parent;
        this.seed = seed;
        /** @type {InstanceType<RNG>} @private */
        this._rng = new RNG(this.seed);
        /**@type {string} */
        this.id = uuid.v4();
        /**@type {string} */
        this.name = parent.name + "-" + this.id.slice(0, 3);
        /**@type {string} */
        this.display_name = parent.display_name + "-" + this.id.slice(0, 3);
        /**@type {number} */
        this.size = Math.round(
            linearRemap(
                this._rng.random(),
                PLANET_SIZE_LIMITATION.min,
                PLANET_SIZE_LIMITATION.max
            )
        );
        this.rssMetal = Math.round(
            linearRemap(
                this._rng.random(),
                PLANET_RSS_LIMITATION.min,
                PLANET_RSS_LIMITATION.max
            )
        );
        this.rssGas = Math.round(
            linearRemap(
                this._rng.random(),
                PLANET_RSS_LIMITATION.min,
                PLANET_RSS_LIMITATION.max
            )
        );
        this.rssCrystal = Math.round(
            linearRemap(
                this._rng.random(),
                PLANET_RSS_LIMITATION.min,
                PLANET_RSS_LIMITATION.max
            )
        );
        this.efficiency = Math.round(
            linearRemap(
                this._rng.random(),
                PLANET_RSS_LIMITATION.min,
                PLANET_RSS_LIMITATION.max
            )
        );
        this.type =
            this._rng.random() > PLANET_CIT_CHANCE_LIMITATION
                ? Math.round(
                      linearRemap(
                          this._rng.random(),
                          PLANET_VARIATION_LIMITATION.min,
                          PLANET_VARIATION_LIMITATION.max
                      )
                  )
                : Math.round(
                      linearRemap(
                          this._rng.random(),
                          PLANET_CIT_VARIATION_LIMITATION.min,
                          PLANET_CIT_VARIATION_LIMITATION.max
                      )
                  );
    }
    /**
     * @description Set the name of the planet
     * @param {string?} new_name
     */
    setName(new_name = null) {
        this.display_name =
            new_name ?? this.parent.display_name + "-" + this.id.slice(0, 3);
        return this;
    }
}
module.exports = Planet;

if (require.main === module) {
    const planet = new Planet(
        { name: "i am a system lol jk ;>", display_name: "Shamaren" },
        "seed"
    );
    console.log(planet);
    planet.setName();
    console.log(planet);
}
