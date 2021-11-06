/**
 * Interface for all types of buildings
 */
const fs = require("fs");

const empty = JSON.parse(fs.readFileSync(__dirname + "/empty.json"));
const hq = JSON.parse(fs.readFileSync(__dirname + "/hq.json"));
const metalPlant = JSON.parse(fs.readFileSync(__dirname + "/metalPlant.json"));
// const gasPlant = JSON.parse(fs.readFileSync(__dirname + "/gasPlant.json"));
// const crystalPlant = JSON.parse(fs.readFileSync(__dirname + "/crystalPlant.json"));
// const shipyard = JSON.parse(fs.readFileSync(__dirname + "/shipyard.json"));
// const barrack = JSON.parse(fs.readFileSync(__dirname + "/barrack.json"));
// const radar = JSON.parse(fs.readFileSync(__dirname + "/radar.json"));
// const lab = JSON.parse(fs.readFileSync(__dirname + "/lab.json"));
// const tradeCenter = JSON.parse(fs.readFileSync(__dirname + "/tradeCenter.json"));
// const shield = JSON.parse(fs.readFileSync(__dirname + "/shield.json"));
// const cit = JSON.parse(fs.readFileSync(__dirname + "/cit.json"));

exports.Building = {
    empty,
    hq,
    metalPlant,
    // gasPlant,
    // crystalPlant,
    // shipyard,
    // barrack,
    // radar,
    // lab,
    // tradeCenter,
    // shield,
    // cit
}
for (item in exports.Building) {
    console.log(item);
}
console.log(Object.keys(exports.Building))