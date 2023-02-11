const fs = require("fs");

function readJSONFile(path) {
    let f = fs.readFileSync(path);
    return JSON.parse(f);
}

function writeJSONFile(obj, path) {
    let f = fs.writeFileSync(path, JSON.stringify(obj));
    return obj.toString().length;
}

module.exports = { readJSONFile, writeJSONFile };
