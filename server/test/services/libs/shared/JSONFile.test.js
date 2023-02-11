const path = require("path");
const fs = require("fs");
const chai = require("chai");
const JSONFile = require(path.resolve("./service/utils/JSONFile"));

var testCase = {
    abc: 123,
    def: "456",
}; // TODO Switch to mockjs

const testPath = path.resolve("./testCase.json");

describe("JSONFile module", () => {
    it("Can write into a file", () => {
        chai.expect(JSONFile.writeJSONFile(testCase, testPath)).equal(
            testCase.toString().length
        );
    });
    it("Can read it back", () => {
        chai.expect(JSONFile.readJSONFile(testPath).toString()).equal(
            testCase.toString()
        );
        fs.unlinkSync(testPath);
    });
});
