const Log = require(__dirname + "/../../../../services/libs/shared/logger");
class Atlas {
    constructor(primitive_galaxy_builder) {
        this.atlas = [];
    }

    async load(){
        
    }

    async save() {
        Log.info("Saving atlas");
        return new Promise(() => {
            Log.info(`Atlas saved`);
        });
    }
}

module.exports = Atlas;

if (require.main === module) {
    console.log("Atlas class definition");
    const atlas = new Atlas();

    atlas.save().then(() => {
        console.log("Atlas saved by module");
    });
}
