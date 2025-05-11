class Atlas {
    constructor(primitive_galaxy_builder) {
        this.atlas = [];
    }

    async save() {
        console.log("Saving atlas");
        return new Promise(() => {
            console.log(`Atlas saved`);
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
