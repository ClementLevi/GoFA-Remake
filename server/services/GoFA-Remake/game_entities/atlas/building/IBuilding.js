const path = require("path");
const ajv = new (require("ajv").Ajv)({ strict: true });
const ENUM_BUILDING_DATA = require(__dirname + "/BuildingsData.json");
const BUILDING_DATA_JSON_SCHEMA = require(__dirname +
    "/BuildingsDataJsonSchema.json");

const validate = ajv.compile(BUILDING_DATA_JSON_SCHEMA);

if (!validate(ENUM_BUILDING_DATA)) {
    console.warn(validate.errors);
    throw new Error("Invalid BuildingData.json");
}
class IBuilding {
    static BUILDING_INTERNAL_KEYS = Object.keys(ENUM_BUILDING_DATA.buildings);
    static DATA_VERSION = ENUM_BUILDING_DATA.version;
    static BUILDING_DATA = ENUM_BUILDING_DATA.buildings;

    /**
     *
     * @param {*} buildingType
     * @param {*} planetId
     */
    constructor(buildingType, planetId) {
        // 初始化。默认生成一个空建筑（empty slot）
        this.building_lv = 1; // 建筑等级
        this.building_type = buildingType; // 建筑类型
        this.building_planet = planetId; // 建筑所在的星球
    }

    get_upgrade_cost() {
        return Buildings_info.upgrade_cost[
            this.buildings_list_reverse[this.building_type]
        ];
    }

    upgrade() {
        if (this.building_lv <= 20) {
            this.building_lv += 1;
        } else {
            return 0;
        }
    }

    attacked() {
        if (this.building_type !== 0) {
            this.building_lv -= 1;
        }

        if (this.building_lv === 0) {
            this.building_type = 0;
            this.building_planet = null;
        }

        return this.building_lv;
    }
}

module.exports = IBuilding;

if (require.main === module) {
    console.log("IBuilding.js has been loaded");
    console.log(`All building: ${IBuilding.BUILDING_INTERNAL_KEYS}`);
}
