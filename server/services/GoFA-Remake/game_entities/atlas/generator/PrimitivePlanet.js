const path = require("path");

const Planet = require(path.resolve("services/GoFA-Remake/game_entities/atlas/planet/Planet"));

class PrimitivePlanet extends Planet {}
module.exports = PrimitivePlanet;

if (require.main === module) {
    console.log("This is the main module of PrimitivePlanet.js");
}
