const assert = require("assert");
const path = require('path');
const {
    getRandomNumber,
    createRandom,
    hashCode,
    Noise2D,
    Ground2D,
} = require(path.resolve("services/libs/shared/seed")); // 请将文件名替换为实际文件名

describe("getRandomNumber function", () => {
    it("should return a number within the specified range", () => {
        const result = getRandomNumber(123, 1, 10);
        assert.ok(result >= 1 && result <= 10);
    });

    it("should return an integer when min and max are integers", () => {
        const result = getRandomNumber(456, 3, 7);
        assert.strictEqual(result % 1, 0);
    });

    it("should return a number when salt is provided", () => {
        const result = getRandomNumber(789, 2, 8, "salt");
        assert.strictEqual(typeof result, "number");
    });

    it("should return a number when only seed is provided", () => {
        const result = getRandomNumber(321);
        assert.strictEqual(typeof result, "number");
    });
});

describe("createRandom function", () => {
    it("should return a function", () => {
        const result = createRandom(123);
        assert.strictEqual(typeof result, "function");
    });

    it("should generate random numbers between 0 and 1", () => {
        const randomFunc = createRandom(456);
        const result = randomFunc();
        assert.ok(result >= 0 && result <= 1);
    });

    it("should generate different numbers for different seeds", () => {
        const randomFunc1 = createRandom(789);
        const randomFunc2 = createRandom(678);
        const result1 = randomFunc1();
        const result2 = randomFunc2();
        assert.notStrictEqual(result1, result2);
    });
    it("should generate same numbers for same seeds", () => {
        const randomFunc1 = createRandom(789);
        const randomFunc2 = createRandom(789);
        const result1 = randomFunc1();
        const result2 = randomFunc2();
        assert.strictEqual(result1, result2);
    });

    it("should generate numbers with a specific pattern", () => {
        const randomFunc = createRandom(321);
        const result = randomFunc();
        assert.ok(result >= 0 && result <= 1);
    });
});

describe("hashCode function", () => {
    it("should return a number", () => {
        const result = hashCode("test");
        assert.strictEqual(typeof result, "number");
    });

    it("should return the same hash for the same input string", () => {
        const result1 = hashCode("hello");
        const result2 = hashCode("hello");
        assert.strictEqual(result1, result2);
    });

    it("should handle empty string input", () => {
        const result = hashCode("");
        assert.strictEqual(result, 0);
    });

    it("should handle special characters in the input string", () => {
        const result = hashCode("!@#$%^&*()");
        assert.strictEqual(typeof result, "number");
    });
});

describe("Noise2D class", () => {
    it("should return an array of length 4 for getNoisePosition method", () => {
        const noise = new Noise2D(3, 123, 5);
        const result = noise.getNoisePosition(2, 2);
        assert.strictEqual(result.length, 4);
    });

    it("should return a number for getCoreNoise method", () => {
        const noise = new Noise2D(3, 123, 5);
        const result = noise.getCoreNoise(2, 2);
        assert.strictEqual(typeof result, "number");
    });

    it("should return a number for getBuff method", () => {
        const noise = new Noise2D(3, 123, 5);
        const result = noise.getBuff(2, 2);
        assert.strictEqual(typeof result, "number");
    });

    it("should handle edge cases for getNoisePosition method", () => {
        const noise = new Noise2D(3, 123, 5);
        const result = noise.getNoisePosition(0, 0);
        assert.strictEqual(result.length, 4);
    });
});

describe("Ground2D class", () => {
    it("should return a number for getHeight method", () => {
        const ground = new Ground2D(123, 0, [{ diff: 3, loud: 5 }]);
        const result = ground.getHeight(2, 2);
        assert.strictEqual(typeof result, "number");
    });

    it("should handle multiple noise layers in constructor", () => {
        const ground = new Ground2D(123, 0, [
            { diff: 3, loud: 5 },
            { diff: 2, loud: 5 },
        ]);
        assert.strictEqual(ground.noiseArr.length, 2);
    });

    it("should return a number for getHeight method with baseHeight", () => {
        const ground = new Ground2D(123, 10, [{ diff: 3, loud: 5 }]);
        const result = ground.getHeight(2, 2);
        assert.strictEqual(typeof result, "number");
    });

    it("should handle edge cases for getHeight method", () => {
        const ground = new Ground2D(123, 0, [{ diff: 3, loud: 5 }]);
        const result = ground.getHeight(0, 0);
        assert.strictEqual(typeof result, "number");
    });
});