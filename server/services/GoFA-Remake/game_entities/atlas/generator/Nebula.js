const path = require("path");

const PrimitivePlanet = require(path.resolve(__dirname, "./PrimitivePlanet"));

class Nebula {}

module.exports = Nebula;

if (require.main === module) {
    console.log("This is the Nebula class");
}
