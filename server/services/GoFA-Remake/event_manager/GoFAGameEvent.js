//@ts-check

const IGoFAEvent = require(__dirname + "/IGoFAEvent.js");

/**
 * @class GoFAGameEvent
 * @implements {IGoFAEvent}
 */
class GoFAGameEvent extends IGoFAEvent {
    constructor(gameEventReq) {
        super();
        this.game = null;
    }


}

module.exports = GoFAGameEvent;

if (require.main === module) {
    const game = new GoFAGameEvent();
    console.log(game);
}
