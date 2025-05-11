const path = require("path");
const uuid = require("uuid");
const _ = require("lodash");
const Pos2d = require(path.resolve(
    "services/GoFA-Remake/game_entities/atlas/Pos/Pos2d.js"
));

/**
 * @enum {number}
 * @readonly
 */
const ENUM_SYSTEM_COLOR = {
    PINK: 0,
    RED: 1,
    ORANGE: 2,
    YELLOW: 3,
    LIME: 4,
    GREEN: 5,
    WATER: 6,
    BLUE: 7,
    PURPLE: 8,
    WHITE: 9,
    BLACK_HOLE: 10,
};

class ISystem {
    constructor(options) {
        if (new.target === ISystem) {
            throw new Error("Cannot instantiate ISystem directly");
        }
        // if more than one argument is passed, pack them into an object as options
        if (arguments.length > 1) {
            if (arguments.length > 5) {
                throw new Error("Too many arguments");
            }
            options = {
                Pos: arguments[0],
                name: arguments[1],
                appearance: arguments[2],
                size: arguments[3],
                color: arguments[4],
            };
        }

        // Constant properties 静态属性
        // uuid
        this.uuid = uuid.v4();
        // Log generator options
        this.options = JSON.stringify(options);
        // Pos
        this.Pos = options.Pos;
        // Name
        this.name = options.name
            ? options.name
            : "System_" + this.uuid.slice(0, 4);
        // appearance
        this.appearance = options.appearance ? options.appearance : "";
        // size
        this.size = options.size ? options.size : 1;
        // color
        this.color = options.color ? options.color : ENUM_SYSTEM_COLOR.WHITE;

        // Dynamic properties 动态属性
        // Combat relative amount
        this.heat = 0; // calculated by recent combat activity
        // Occupied by alliance
        this.is_occupied = false;
        this.controlled_by = null;
        // Name can be modified when carnival is active
        this.is_name_modified = false;
        this.display_name = this.name;
    }
}

class System extends ISystem {

    static generateNames(count){

    }
    constructor(options) {
        super(options);
        // if more than one argument is passed, pack them into an object as options
        if (arguments.length > 1) {
            if (arguments.length > 5) {
                throw new Error("Too many arguments");
            }
            options = {
                Pos: arguments[0],
                name: arguments[1],
                appearance: arguments[2],
                size: arguments[3],
                color: arguments[4],
            };
        }

        // Constant properties 静态属性
        // uuid
        this.uuid = uuid.v4();
        // Log generator options
        this.options = JSON.stringify(options);
        // Pos
        this.Pos = options.Pos;
        // Name
        this.name = options.name
            ? options.name
            : "System_" + this.uuid.slice(0, 4);
        // appearance
        this.appearance = options.appearance ? options.appearance : "";
        // size
        this.size = options.size ? options.size : 1;
        // color
        this.color = options.color ? options.color : ENUM_SYSTEM_COLOR.WHITE;

        // Dynamic properties 动态属性
        // Combat relative amount
        this.heat = 0; // calculated by recent combat activity
        // Occupied by alliance
        this.is_occupied = false;
        this.controlled_by = null;
        // Name can be modified when carnival is active
        this.is_name_modified = false;
        this.display_name = this.name;
    }
    getPos() {
        return this.Pos;
    }
    getName() {
        return this.is_name_modified ? this.display_name : this.name;
    }

    getHeat() {
        return this.heat;
    }
    getDistance(other_system) {
        return this.Pos.distanceTo(other_system.Pos);
    }
    setName(name) {
        this.display_name = name;
    }
    randomizeName() {
        this.display_name = "System_" + uuid.v4().slice(0, 4);
    }
    offset(e) {
        this.Pos.offset(e);
    }
}

module.exports = { System, ISystem };

if (require.main === module) {
    const system = new System(new Pos2d(1, 0), "Test System", {
        apprearance: "Test Apprearance",
        size: 2,
        color: ENUM_SYSTEM_COLOR.PINK,
    });

    console.log(system);
    const system2 = new System({ Pos: new Pos2d(0, 1) });
    console.log(system2);
    console.log(system.getDistance(system2));
    system.offset(1);
    console.log(system);
}
