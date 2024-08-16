const assert = require("assert");
const path = require("path");
const {
    ranchoice,
    titleCase,
    cartesianProduct,
    cartesianProductCount,
    compareLog10Integers,
} = require(path.resolve("services/libs/shared/index"));

describe("Testing the util functions", function() {
    it("randomly choose an element from an array", function() {
        const list = [1, 2, 3, 4, 5];
        const result = ranchoice(list);
        assert.strictEqual(list.includes(result), true);
    });

    it("randomly choose an element from a string", function() {
        const str = "hello";
        const result = ranchoice(str);
        assert.strictEqual(str.includes(result), true);
    });

    it("uppercase the initial characters of a string", function() {
        const str = "hello world";
        const result = titleCase(str);
        assert.strictEqual(result, "Hello World");
    });

    it("calculate cartesian product of two arrays", function() {
        const arrays = [
            ["a", "b"],
            ["1", "2"],
        ];
        const result = cartesianProduct(arrays);
        assert.deepStrictEqual(result, ["a1", "a2", "b1", "b2"]);
    });

    it("calculate the number of possible results from cartesian product", function() {
        const arrays = [
            ["a", "b"],
            ["1", "2"],
            ["x", "y"],
        ];
        const result = cartesianProductCount(arrays);
        assert.strictEqual(result, 8); // 2 * 2 * 2 = 8
    });
    it("should return true for numbers in the same order of magnitude", function() {
        assert.strictEqual(compareLog10Integers(100, 200), true);
    });

    it("should return true for negative numbers in the same order of magnitude", function() {
        assert.strictEqual(compareLog10Integers(-0.001, -0.002), true);
        assert.strictEqual(compareLog10Integers(-0.001, -0.02), false);
    });

    it("should return false for numbers in different orders of magnitude", function() {
        assert.strictEqual(compareLog10Integers(1000, 20), false);
    });
});