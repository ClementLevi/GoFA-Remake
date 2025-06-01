const dotenv = require("dotenv");
const path = require("path");
const sqlite3 = require("sqlite3");

class IDBConnector {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, "GoFA.db"));
    }
    run(query, params)   {}
    get(query, params)   {}
    all(query, params)   {}
    each(query, params)  {}
    exec(query, params)  {}
    close()              {}
}

module.exports = IDBConnector;
