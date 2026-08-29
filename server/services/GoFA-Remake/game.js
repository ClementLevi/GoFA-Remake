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
 * @typedef {typeof import('../libs/shared/DataStructure').Queue} Queue
 * @typedef {typeof import('../libs/shared/DataStructure').Stack} Stack
 * @type {{Queue: Queue,Stack: Stack}}
 */
const { Queue, Stack } = require(path.resolve(
    __dirname,
    "../libs/shared/DataStructure"
));

/**
 * 游戏环境投影类型（权威：libs/types/main_types.js 的 IMainForGame）
 *  Game environment projection (authority: IMainForGame in libs/types/main_types.js)
 * @typedef {import("../libs/types/main_types").IMainForGame} IMain
 */

/**
 * @typedef IGame
 * @property {IMain} env - the environment of the game.
 * @property {"init"|"running"|"exiting"} stage - the current state of the game.
 * @property {number} tickInterval - the interval of the game's tick.
 * @property {()=>IGame} getInstance - get the instance of the game.
 * @property {()=>Promise<void>} init - initialize the game.
 * @property {()=>void} exit - called when the game is exited.
 * @property {()=>void} beforeTick - called before each tick.
 * @property {(deltaTime?: number) => void} tick - called every tick.
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
         * cleanups: InstanceType<Queue>,
         * updatable: InstanceType<Queue>}}
         */
        this.ev_queues = {
            onStart: new Queue(),
            events: {},
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
        // 环境运行中则标记游戏为 running（原 env.stage.RUNNING 属性访问有误，属类型错误修复）
        // Mark the game as running when the environment is running (fixed invalid property access)
        this.stage =
            this.env?.stage === "running"
                ? GoFA_Remake_Game.stages.RUNNING
                : this.stage;
    }
    /**
     * @public
     */
    tick() {
        this._gamelife++;
        // 每 tick 打印一行过吵，注释掉  Too noisy to log every tick, commented out
        // Log.info("Game ticked.", this._gamelife);
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
/**
 * 创建游戏实例的工厂  Game instance factory
 * @param {IMain} env - 主程序环境  Main environment
 * @returns {InstanceType<GoFA_Remake_Game>} 游戏实例  Game instance
 */
module.exports = (env) => new GoFA_Remake_Game(env);
