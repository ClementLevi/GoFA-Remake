const path = require("path");
const assert = require("chai").assert;
const { describe, it, beforeEach } = require("mocha");
const { expect } = require("chai");
const { SystemNameGenerator } = require(path.resolve(
    "services/GoFA-Remake/game_entities/atlas/system/SystemNameGenerator.js"
));

describe("NameGenerator", function() {
    let nameGenerator;

    beforeEach(function() {
        nameGenerator = new SystemNameGenerator();
    });

    it("should generate system names successfully", function() {
        let result = nameGenerator.generate(40);
        assert.instanceOf(result, Set, "result should be an instance of Set");
        assert.equal(result.size, 40, "should generate 40 system names");
    });

    it("element should be string", () => {
        let result = nameGenerator.generate(2);
        expect([...result][0]).to.be.a("string");
        expect([...result][1]).to.be.a("string");
    });

    //! TEST WILL FAIL
    // Some combinations are exactly the same result even though the building parts are unique:
    // E.g.: Ab+a+ul === A+bau+l

    // it("should generate maximum possible system names when totalNumber is 0 or less", function() {
    //     let result = nameGenerator.generate(-1);
    //     assert.isAtLeast(
    //         [...result].length,
    //         nameGenerator.COUNT_CAPA,
    //         `should generate at least ${nameGenerator.COUNT_CAPA} names`
    //     );
    // });
    it("should generate the same amount level of system names with the theoretical capacity when totalNumber is 0 or less", function() {
        const { compareLog10Integers } = require(path.resolve(
            "services/libs/shared/index"
        ));
        let result = nameGenerator.generate(-1);
        assert.isTrue(
            compareLog10Integers([...result].length, nameGenerator.COUNT_CAPA),
            `should generate at least ${nameGenerator.COUNT_CAPA} names`
        );
    });

    // Add more test cases as needed
});