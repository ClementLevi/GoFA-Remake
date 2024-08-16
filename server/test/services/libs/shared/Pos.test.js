const assert = require("assert");
const path = require("path");
const { posOffset } = require(path.resolve("services/libs/shared/Pos"));

describe("posOffset function", () => {
    it("should return an array with the same length as the input array", () => {
        const input = [1, 2, 3];
        const output = posOffset(input, 5);
        assert.strictEqual(output.length, input.length);
    });

    it("should ensure that the distance between original and new coordinates does not exceed the specified offset", () => {
        const input = [1, 2, 3];
        const offset = 5;
        const output = posOffset(input, offset);
        const distance = Math.sqrt(
            output.reduce(
                (acc, val, index) => acc + (val - input[index]) ** 2,
                0
            )
        );
        assert.ok(distance <= offset);
    });

    it("should handle negative input values correctly", () => {
        const input = [-1, -2, -3];
        const offset = 5;
        const output = posOffset(input, offset);
        assert.strictEqual(output.length, input.length);
    });

    it("should return an array with numeric values", () => {
        const input = [1, 2, 3];
        const offset = 5;
        const output = posOffset(input, offset);
        assert.ok(output.every((val) => typeof val === "number"));
    });

    it("should handle edge cases such as empty input array", () => {
        const input = [];
        const offset = 5;
        const output = posOffset(input, offset);
        assert.deepStrictEqual(output, []);
    });

    it("should handle large input arrays and offsets", () => {
        const input = Array.from({ length: 100 }, () => Math.random() * 100); // Generate a large input array
        const offset = 1000;
        const output = posOffset(input, offset);
        assert.strictEqual(output.length, input.length);
    });
});