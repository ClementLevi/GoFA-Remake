const path = require("node:path");

const Planet = require(path.resolve(__dirname, "../planet/Planet"));

class PrimitivePlanet extends Planet {}
module.exports = PrimitivePlanet;

if (require.main === module) {
    console.log("This is the main module of PrimitivePlanet.js");
}
