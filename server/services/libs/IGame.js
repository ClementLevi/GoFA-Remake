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
/**
 * @abstract
 * @interface IGame
 * @property {Enum<>} state - the current state of the game.
 * @property {Array} eventBuses - the event buses of the game.
 * @property {number} tickInterval - the interval of the game's tick.
 */
class IGame {
    static stages = {
        INIT: "init",
        RUNNING: "running",
        EXITING: "exiting",
    };
    /**
     * @constructor
     */
    constructor() {
        this.state = null;
        this.eventBuses = [];
        this.tickInterval = -1;
    }
    getInstance() {
        return this;
    }
    init() {
        this.state = IGame.stages.INIT;
        // do something
    }
    exit() {
        this.state = IGame.stages.EXITING;
    }
    registerEventBus(evb) {
        this.eventBuses.push(evb);
    }
    beforeTick() {}
    tick(tickInterval = this.tickInterval) {
        Log.info("IGame ticked.");
    }
    setTickInterval(ms) {
        if (typeof ms !== "number") {
            throw new Error("Tick interval must be a number.");
        }
        if (ms <= 0) {
            throw new Error("Tick interval must be positive.");
        }
        this.tickInterval = ms;
    }
}
module.exports = IGame;
