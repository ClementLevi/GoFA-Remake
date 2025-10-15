const path = require("node:path");
/**
 * @deprecated
 * TODO: use node:crypto.randomUUID() instead
 */
const uuid = require("uuid");
const _ = require("lodash");

/**
 * @typedef {typeof import ("../pos/Pos")} Pos
 * @type {Pos}
 */
const Pos = require(path.resolve(__dirname, "../pos/Pos.js"));
/**
 * @typedef {typeof import ("../pos/Pos2d")} Pos2d
 * @type {Pos2d}
 */
const Pos2d = require(path.resolve(__dirname, "../Pos/Pos2d.js"));
/**
 * @typedef {import ("./System.d").ENUM_SYSTEM_COLOR} SystemColor
 * @type {SystemColor}
 */

/**
 * @typedef {typeof import ("../planet/Planet")} Planet
 * @type {Planet}
 */
const Planet = require(path.resolve(__dirname, "../planet/Planet"));

const ENUM_SYSTEM_COLOR = require(path.resolve(
    __dirname,
    "./System.d.js"
)).ENUM_SYSTEM_COLOR;

/**
 * @typedef {import("./System.d").SystemOptions} SystemOptions
 * @typedef {import ("./SystemNameGenerator.js")} INameGenerator
 * @typedef {import ("./SystemNameGenerator.js").NameRule} NameRule
 * @typedef {typeof import("./SystemNameGenerator.js")} SystemNameGenerator
 */

/**
 * @module System
 * @class
 * @classdesc 表示星系的类，作为地图基本元素保存。 Class representing a star system, as a basic element of the map.
 */
class System {
    /**
     * @param {SystemOptions} options 系统选项对象
     */

    constructor(options) {
        // Constant properties 静态属性
        /** @type {string} */
        this.uuid = uuid.v4();
        /** @type {InstanceType<Pos2d>} */
        this.pos = options.Pos;
        /** @type {string} */
        this._name = options.name ?? "System_" + this.uuid.slice(0, 4);
        /** @type {SystemOptions["seed"] } */
        this.seed = options.seed ?? uuid.v4();
        /** @type {string} */
        this.appearance = options.appearance ?? ""; // Appearance, for frontend rendering, no logic related to it. But it has to be static to store in db.
        /** @type {number} */
        this.size = options.size ?? 1;
        /** @type {InstanceType<Planet>[]} */
        this.planets = [];
        for (let c = 0; c < this.size; c++) {
            let p = new Planet(this, this.seed);
            this.planets.push(p);
        }
        /** @type {ENUM_SYSTEM_COLOR} */
        this.color = options.color ?? ENUM_SYSTEM_COLOR.WHITE;

        // Dynamic properties 动态属性

        /** @type {number} */
        this._heat = 0; // Combat relative amount. Calculated by recent combat activity

        /** @type {boolean} */
        this.is_occupied = false;
        /** @type {?} */
        this.controlled_by = null; // TODO: Occupied by alliance

        /** @type {boolean} */
        this.is_name_modified = false; // Name can be modified when carnival is active
        /** @type {string} */
        this.display_name = this._name;
    }
    get name() {
        return this.is_name_modified ? this.display_name : this._name;
    }

    set name(name) {
        this.display_name = name;
    }

    get heat() {
        return this._heat;
    }
    /**
     *
     * @param {{"pos":InstanceType<Pos2d>}} other_system
     * @returns {number}
     */
    getDistance(other_system) {
        return this.pos.distanceTo(other_system.pos);
    }
    /**
     * @param {INameGenerator} name_generator
     */
    randomizeName(name_generator) {
        if (!name_generator) {
            this.display_name = "System_" + uuid.v4().slice(0, 4);
            return;
        }
        this.display_name = name_generator.pick();
        this.planets.forEach((planet) => {
            planet.name = planet.name.replace(this._name, this.display_name);
        });
    }
    /**
     * @description 随机偏移坐标
     * @see {@link Pos.offset}
     * @param {number} e
     */
    offset(e) {
        this.pos.offset(e);
    }
    /**
     * Get the alliance that occupies this system.
     * Which alliance holds more than any others in the system is the occupier.
     * TODO: implement this
     * @return {void} alliance interface to be designed, but should return something
     */
    calculateOccupier() {}
    [Symbol.toString](){
        return `[System @(${this.pos.x}, ${this.pos.y}) - size:${this.size}]`
    }
}

module.exports = System;

if (require.main === module) {
    const system = new System({
        Pos: new Pos2d(1, 0),
        name: "Test System",
        appearance: "Test Apprearance",
        size: 2,
        color: ENUM_SYSTEM_COLOR.PINK,
        seed: "seed",
    });
    /**
     * @type {SystemNameGenerator}
     */
    const CLSSystemNameGenerator = require(path.resolve(
        __dirname,
        "./SystemNameGenerator.js"
    ));
    /** @type {InstanceType<SystemNameGenerator>} */
    const nameGenerator = new CLSSystemNameGenerator();
    console.log(system);
    const system2 = new System({ Pos: new Pos2d(0, 1) });
    console.log(system2);
    console.log(system.getDistance(system2));
    system.offset(1);
    nameGenerator
        .use_name_template(/** @type {NameRule} */ "systemNameRule.json")
        .then(() => {
            nameGenerator.generate(10).then((names) => {
                system.randomizeName(nameGenerator);
                console.log(system);
            });
        });
}
