const expect = require("chai").expect;
const index = require("../index");

describe("Test Module", ()=>{
    it("Main function functions", ()=>{
        expect(index.test(2)).equal(114516)
    })
    it("Main function functions 2", ()=>{
        expect(index.test(0)).equal(114514)
    })
})