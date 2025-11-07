/**
 * @module game
 */

const path = require("node:path");
const EventEmitter = require("node:events");

/**
 * @typedef {import ("../libs/shared/logger")} Logger
 * @type {Logger}
 */
const Log = require(path.resolve(__dirname, "../libs/shared/logger"));

/**
 * @template {new (...args: any[]) => T} T
 * @typedef {typeof import("../libs/shared/Singleton")} Singleton<T>
 * @type {Singleton<T>}
 */
const singleton = require(path.resolve(__dirname, "../libs/shared/Singleton"));

/**
 * @typedef {typeof import('../libs/shared/DataStructure').Queue} Queue
 * @typedef {typeof import('../libs/shared/DataStructure').Stack} Stack
 * @type {{Queue: Queue,Stack: Stack}}
 */
const { Queue, Stack } = require(path.resolve(
    __dirname,
    "../libs/shared/DataStructure"
));

/**
 * @typedef {import ("../../main").IMain} IMain
 * @typedef {import ("../../main").EnumStage} ENUM_STAGE
 * @typedef {import ("../libs/game_entities/IGameEntity.d")} IGameEntity
 *
 */

/**
 * @typedef IGame
 * @property {IMain} env - the environment of the game.
 * @property {ENUM_STAGE} stage - the current state of the game.
 * @property {number} tickInterval - the interval of the game's tick.
 * @property {()=>InstanceType<IGame>} getInstance - get the instance of the game.
 * @property {()=>void} init - initialize the game.
 * @property {()=>void} exit - called when the game is exited.
 * @property {()=>void} beforeTick - called before each tick.
 * @property {()=>void} tick - called every tick.
 */

/**
 * @class GoFA_Remake_Game
 * @implements {IGame}
 */
class GoFA_Remake_Game extends EventEmitter{
    /**
     * @member
     * @static
     * @readonly
     */
    static stages = Object.freeze({
        INIT: "init",
        RUNNING: "running",
        EXITING: "exiting",
    });
    /**
     * @param {IMain} env
     */
    constructor(env) {
        super();
        this.env = env ?? null;
        this.stage = null;
        this.tickInterval = -1;
        /**
         * @description 事件和待更新任务队列
         * @type {{onStart:InstanceType<Queue>,
         * events:Record<string,InstanceType<Queue>>,
         * timedEvents:Record<number,InstanceType<Queue>>,
         * cleanups: InstanceType<Queue>,
         * updatable: InstanceType<Queue>}}
         */
        this.ev_queues = {
            onStart: new Queue(),
            events: {},
            timedEvents: {},
            cleanups: new Queue(), // alias: onExit
            updatable: new Queue(),
        };
        this._gamelife = 0;
    }
    /**
     * @public
     */
    async init() {
        this.stage = GoFA_Remake_Game.stages.INIT;
        Log.info("Initializing game...");
        Log.info("Game initialized.");
        this.stage = this.env?.stage.RUNNING;
    }
    /**
     * @public
     */
    tick() {
        this._gamelife++;
        Log.info("Game ticked.", this._gamelife);
    }
    /**
     * 注册事件
     * @param {string | symbol} name
     * @param {(...args: any[]) => void} cb
     */
    regEvent(name, cb) {
        if (typeof name !== "string") return this;
        if (typeof cb !== "function") return this;
        this.on(name, cb);
        return this;
    }
    /**
     * @description 注册定时事件，在delay个tick后执行
     * @param {string} name
     * @param {() => void} cb
     * @param {number} delay
     */
    registerTimedEvent(name, cb, delay) {
        if (typeof name !== "string") return this;
        if (typeof cb !== "function") return this;
        if (typeof delay !== "number") return this;
        let timeout = this._gamelife + delay;
        if (!this.ev_queues.timedEvents[timeout]) {
            this.ev_queues.timedEvents[timeout] = new Queue();
        }
        this.ev_queues.timedEvents[timeout].push(cb);
        console.log(`Registered Timed Event: ${name} after ${delay} ticks.`);
        return this;
    }
    /**
     * @description 消费定时事件
     * @private
     */
    consumeTimedEvents() {
        if (this.ev_queues.timedEvents[this._gamelife]) {
            this.ev_queues.timedEvents[this._gamelife].forEach((task) =>
                task()
            );
            delete this.ev_queues.timedEvents[this._gamelife];
        }
        return this;
    }
    // 生命周期阶段 Life Cycle Stages
    exit() {}
    beforeTick() {}
    getInstance() {
        return this;
    }
    get Instance() {
        return this;
    }
    get PARENT() {
        return this.env;
    }
}
let GoFA_Constructor = (/** @type {any[]} */ ...args) =>
    singleton(new GoFA_Remake_Game(...args));

// module.exports = GoFA_Constructor;
module.exports = (/** @type {any} */ ...args) => new GoFA_Remake_Game(...args);
