const expect = require("chai").expect;
const index = require("../index");

describe("Test Module", () => {
    it("Main function should not be included", () => {
        expect(index).equal("Application entry point can/should not be included!")
    })

})