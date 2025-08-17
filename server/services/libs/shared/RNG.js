/**
 * Random number generator based on MurmurHash3 and Mulberry32
 * @class RNG
 * @property {number} _seed - Seed for the random number generator
 * @property {number} _generation - Indicates how many random numbers have been generated with current seed
 * @method random - Returns a random number between 0 and 1
 */
class RNG {
    /**
     * @constructor
     * @param {string} [seed] - Seed for the random number generator
     */
    constructor(seed) {
        if (!seed || !seed.toString) {
            this.set_seed(new Date().toString());
        } else {
            this.set_seed(seed.toString());
        }
        this._generation = 0;
    }
    /**
     * Sets the seed for the random number generator
     * @param {string} seed - Seed for the random number generator
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
    }
    /**
     * @public
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
    *_wrapper() {
        while (this._generation < Number.MAX_SAFE_INTEGER) {
            this._generation++;
            yield this._random();
        }
    }
    random() {
        return this._wrapper().next().value;
    }
    get generation() {
        return this._generation;
    }
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
        for(let j = 0; j<3; j++){
            console.log(`RNG result (${rng.random()}) with seed ${rng.seed} generation ${rng.generation} created.`);
        }
    }
}
