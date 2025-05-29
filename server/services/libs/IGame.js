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
class IGame {
    constructor() {
        this.state = null;
        this.eventBuses = [];
        this.tickInterval = -1;
    }
    getInstance(){return this}
    onLoad(){}
    onExit(){}
    registerEventBus(){}
    beforeTick(){}
    tick(tickInterval=this.tickInterval) {
        Log.info("IGame ticked.")
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