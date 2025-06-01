const IGame = require(__dirname + "/../libs/IGame");
const Log = require(__dirname + "/../libs/shared/logger");
const singleton = require(__dirname + "/../libs/shared/Singleton");

class GoFA_Remake_Game extends IGame {
    constructor() {
        super();
        this._gamelife = 0;
    }
    /**
     * @override
     */
    async init() {
        Log.info("Initializing game...");
        Log.startSpinner("Loading");
        this.state = IGame.stages.INIT;
        super.init();
        let that = this;
        setTimeout(() => {
            Log.info("Game initialized.");
            Log.stopSpinner();
            that.state = IGame.stages.RUNNING;
        }, 5000);
    }
    /**
     * @override
     */
    async tick() {
        switch (this.state) {
            case IGame.stages.RUNNING:
                break;
            case IGame.stages.INIT:
            case IGame.stages.EXITING:
                return;
            default:
                Log.error(`Unknown game state: ${this.state}`);
                return;
        }
        this._gamelife++;
        Log.info("Game ticked.", this._gamelife);
    }
}
let GoFA_Instance = singleton(new GoFA_Remake_Game());
module.exports = GoFA_Instance;
