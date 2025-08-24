const path = require("path");
const uuid = require("uuid");
const _ = require("lodash");
const Pos2d = require(path.resolve(__dirname, "../Pos/Pos2d.js"));

/**
 * @module System
 */

/**
 * @typedef {Object} SystemColor
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
    /**@default */
    WHITE: 9,
    BLACK_HOLE: 10,
};

/**
 * @typedef {import ("../Pos/Pos2d.js")} Pos2d
 * ---
 * @typedef {Object} SystemOptions
 * @property {Pos2d} Pos
 * @property {string} [name]
 * @property {string} [appearance]
 * @property {number} [size]
 * @property {ENUM_SYSTEM_COLOR[keyof ENUM_SYSTEM_COLOR]} [color]
 */

class System {
    static generateNames(count) {}
    static ATTR_RANGE_LIMIT = Object.freeze({});
    /**
     * @overload
     * @param {SystemOptions} options 系统选项对象
     */
    /**
     * @overload
     * @param {Pos2d} pos 系统位置
     * @param {string} [name] 系统名称
     * @param {string} [appearance] 系统外观
     * @param {number} [size] 系统大小
     * @param {ENUM_SYSTEM_COLOR[keyof ENUM_SYSTEM_COLOR]} [color] 系统颜色
     */
    constructor(options, name, appearance, size, color) {
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
        this.name = options.name ?? "System_" + this.uuid.slice(0, 4);
        // appearance, for frontend rendering, no logic related to it.
        // But it has to be static to store in db.
        this.appearance = options.appearance ?? "";
        // size
        this.size = options.size ?? 1;
        this.color = options.color ?? ENUM_SYSTEM_COLOR.WHITE;

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
    get Name() {
        return this.is_name_modified ? this.display_name : this.name;
    }

    set Name(name) {
        this.display_name = name;
    }

    get Heat() {
        return this.heat;
    }
    getDistance(other_system) {
        return this.Pos.distanceTo(other_system.Pos);
    }
    /**
     * @typedef {import ("./SystemNameGenerator.js")} InameGenerator
     * ---
     *
     * @param {InameGenerator} nameGenerator
     */
    randomizeName(nameGenerator) {
        if (!nameGenerator) {
            this.display_name = "System_" + uuid.v4().slice(0, 4);
        }
        debugger
        this.display_name = nameGenerator.pick();
    }
    offset(e) {
        this.Pos.offset(e);
    }
}

module.exports = System;

if (require.main === module) {
    const system = new System(
        new Pos2d(1, 0),
        "Test System",
        "Test Apprearance",
        2,
        ENUM_SYSTEM_COLOR.PINK // TODO 类型推导有点问题，应该是枚举的值类型
    );
    const CLSSystemNameGenerator = require(path.resolve(__dirname, "./SystemNameGenerator.js"));
    const nameGenerator = new CLSSystemNameGenerator();
    console.log(system);
    const system2 = new System({ Pos: new Pos2d(0, 1) });
    console.log(system2);
    console.log(system.getDistance(system2));
    system.offset(1);
    nameGenerator.use_name_template("systemNameRule.json").then(() => {
        nameGenerator.generate(10).then((names) => {
            system.randomizeName(nameGenerator)
            console.log(system);
        });
    });
}
