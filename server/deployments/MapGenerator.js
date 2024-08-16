const packageName = require('packageName');

const EnumMapElementLevel = {
    "MAP": 0,
    "CHUNK": 1,
    "REGION": 2,
    "SYSTEM": 3,
    "PLANET": 4,
    "FLOATING_OBJECT": 5
}

const DefaultConfig = {
    chunkSize: 40,

}

class mapGenerator {
    mapGenerator(seed, width = 2000, height = 2000) {

    }
}

class chunkGenerator {

}

class systemGenerator {

}

class planetGenerator {

}
module.exports = { mapGenerator, chunkGenerator, systemGenerator, planetGenerator }