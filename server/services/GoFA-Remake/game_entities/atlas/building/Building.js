const path = require("node:path");
const IBuilding = require(path.resolve(__dirname, "./IBuilding"));

class Building extends IBuilding {}
module.exports = Building;

if (require.main === module) {
}
