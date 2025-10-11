/**
 * Random number generator based on MurmurHash3 and Mulberry32
 * @class RNG
 * @property {readonly number} seed - Seed for the random number generator
 * @property {number} generation - Indicates how many random numbers have been generated with current seed
 * @property {():number} random - Returns a random number between 0 and 1
 * @property {(string):this} set_seed - Sets the seed for the random number generator
 */
class RNG {
    /**
     * @constructor
     * @param {string & {toString: ()=>string}} [seed] - Seed for the random number generator
     */
    constructor(seed) {
        if (!seed || !seed.toString) {
            this.set_seed(new Date().toString());
        } else {
            this.set_seed(seed.toString());
        }
        /** @type {number} _generation */
        this._generation = 0;
    }
    /**
     * Sets the seed for the random number generator
     * ! Note: Once the seed is set, it cannot be recovered as it's a hashed value.
     * @param {string} seed - Seed for the random number generator
     * @returns {this}
     * @public
     */
    set_seed(seed) {
        // MurmurHash3
        let i = 0;
        let hash;
        for (i = i, hash = 1779033703 ^ seed.length; i < seed.length; i++) {
            let bitwise_xor_from_character = hash ^ seed.charCodeAt(i);
            hash = Math.imul(bitwise_xor_from_character, 3432918353);
            hash = (hash << 13) | (hash >>> 19);
        }
        // Return the hash that you can use as a seed
        hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
        hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
        this._seed = (hash ^= hash >>> 16) >>> 0;
        return this;
    }
    /**
     * @private
     * @returns {number} - A random number between 0 and 1
     */
    _random() {
        // Mulberry32
        this._seed = Number.parseInt(this._seed) + 0x6d2b79f5;
        let for_bit32_mul = this._seed;
        let cast32_one = for_bit32_mul ^ (for_bit32_mul >>> 15);
        let cast32_two = for_bit32_mul | 1;
        for_bit32_mul = Math.imul(cast32_one, cast32_two);
        for_bit32_mul ^=
            for_bit32_mul +
            Math.imul(
                for_bit32_mul ^ (for_bit32_mul >>> 7),
                for_bit32_mul | 61
            );
        return ((for_bit32_mul ^ (for_bit32_mul >>> 14)) >>> 0) / 4294967296;
    }
    /**
     * @private
     * @returns {Generator<number, number, number>} - A generator that yields random numbers
     * @yields {ReturnType<this["_random"]>} - A random number between 0 and 1
     * @description This generator method never ends unless it's broken or something.
     */
    *_wrapper() {
        while (true) {
            this._generation++;
            if (this._generation >= Number.MAX_SAFE_INTEGER) {
                this._generation = 0; // 重置计数器
            }
            yield this._random();
        }
    }
    /**
     * @public
     * @returns {number}
     */
    random() {
        return this._wrapper().next().value;
    }
    /**
     * @public
     * @returns {{value: number, seed: string, generation: number}}
     */
    random_verbose() {
        return {
            value: this.random(),
            seed: this.seed,
            generation: this.generation,
        };
    }
    /**
     * @public
     * @returns {number}
     */
    get generation() {
        return this._generation;
    }
    /**
     * @public
     * @param {number} value - The new generation value
     * @returns {this}
     */
    set generation(value) {
        if (
            typeof value === "number" &&
            value >= 0 &&
            Number.isInteger(value)
        ) {
            this._generation = value;
        } else {
            throw new TypeError("Generation must be a non-negative integer.");
        }
    }
    /**
     * @public
     * @readonly
     * @returns {string}
     */
    get seed() {
        return this._seed;
    }
}
module.exports = RNG;

if (require.main === module) {
    let rng = new RNG();
    for (let i = 0; i < 3; i++) {
        rng.set_seed("initial seed");
        rng.generation = 0;
        for (let j = 0; j < 3; j++) {
            console.log(
                `RNG result (${rng.random()}) with seed ${
                    rng.seed
                } generation ${rng.generation} created.`
            );
        }
    }
    console.log("testing if when generations run out, it resets");
    for (let i = 0; i < 30; i++) {
        console.log(
            `RNG result (${rng.random()}) with seed ${rng.seed} generation ${
                rng.generation
            } created.`
        );
    }
}
