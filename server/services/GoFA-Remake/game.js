const IGame = require(__dirname + '/../libs/IGame');
const Log = require(__dirname + '/../libs/shared/logger');
const singleton = require(__dirname + '/../libs/shared/Singleton');

class GoFA_Remake_Game extends IGame {
    constructor() {
        super();
    }
    /**
     * @override
     */
    tick(){
        super.tick()
        Log.info("Game ticked.")
    }
}
let GoFA_Instance = singleton(new GoFA_Remake_Game());
module.exports = GoFA_Instance;