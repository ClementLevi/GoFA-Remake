/**
 * Base class for game logic.
 * All game logic should inherit from this class.
 * This class indicates how the game events should emit and be handled,
 * more specifically, in what sequence.
 * @abstract
 * @method {void} onLoad - called when the game is loaded.
 * @method {void} onExit - called when the game is exited.
 * @method {void} setTickInterval - set the tick interval in milliseconds.
 * @method {void} beforeTick - called before each tick.
 * @method {void} tick - called every tick.
 */
const Log = require(__dirname + "/shared/logger");
//const IEventBus = require(__dirname + "/events/IEventBus");

class IGame {

    /**
     * @constructor
     */
    constructor(env) {
        this.env = env;
        this.state = null;
        this.updateables = [];
        this.eventBuses = [];
        this.tickInterval = -1;
    }
    getInstance() {
        return this;
    }
    /**
     * @public
     * @returns {void}
     */
    init() {
        this.state = IGame.stages.INIT;
        // do something
    }
    /**
     * @public
     * @returns {void}
     */
    exit() {
        this.state = IGame.stages.EXITING;
    }
    /**
     * @public
     * @requires IEventBus from __dirname + "/events/IEventBus"
     * @param {IEventBus} evb
     */
    registerEventBus(evb) {
        this.eventBuses.push(evb);
    }
    unregisterEventBus(evb) {}
    /**
     *
     * @param {string} event
     * @param {*} options
     */
    on(event, options) {
        this.eventBuses.forEach((evb) => {
            evb.on(event, options);
        });
    }
    beforeTick() {}
    tick(tickInterval = this.tickInterval) {
        for (let i = 0; i < this.updateables.length; i++) {
            this.updateables[i].update();
        }
        Log.debug("IGame ticked.");
    }
    setTickInterval(ms) {
        if (typeof ms !== "number") {
            throw new TypeError("Tick interval must be a number.");
        }
        if (ms <= 0) {
            throw new Error("Tick interval must be positive.");
        }
        this.tickInterval = ms;
    }
}
module.exports = IGame;

class IGame {
    constructor(env: any);
    env: any;
    state: any;
    updateables: any[];
    eventBuses: any[];
    tickInterval: number;
    getInstance(): this;
    public init(): void;
    public exit(): void;
    public registerEventBus(evb: IEventBus): void;
    unregisterEventBus(evb: any): void;
    on(event: string, options: any): void;
    beforeTick(): void;
    tick(tickInterval?: number): void;
    setTickInterval(ms: any): void;
}
