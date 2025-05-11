const path = require("path");
const IBuilding = require(__dirname + "/IBuilding");

class BuildingSlot {
    constructor(planetID) {
        this.building = null;
        this.planet = planetID ?? null;
    }
    get() {
        return this.building;
    }
    /**
     *
     * @param {IBuilding} building - Must be an instance of IBuilding and have a constructor that takes in args.
     * @param {Object} args
     */
    build(building, args) {
        let b = new building(args);
        this.building = b;
    }
    destroy() {
        this.building = null;
    }
}
module.exports = BuildingSlot;

if (require.main === module) {
    let slot = new BuildingSlot();
    console.log(slot.get());
    let test_building = IBuilding;
    slot.build(test_building,{});
    console.log(slot.get());
}
