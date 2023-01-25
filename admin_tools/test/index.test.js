const expect = require("chai").expect;
const index = require("../index");

describe("OnEnterServer", ()=>{
    it("Main function functions", ()=>{
        expect(index.onEnterAdminServer()).equal(0)
    })
})