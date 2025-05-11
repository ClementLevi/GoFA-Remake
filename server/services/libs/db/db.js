const dotnet = require("dotnet");
const path = require("path");
const sql = require("sqlite3");

class DB {
    constructor() {
        this.db = new sql.Database(path.join(__dirname, "GoFA.db"));
    }
    run(query, params)   {}
    get(query, params)   {}
    all(query, params)   {}
    each(query, params)  {}
    exec(query, params)  {}
    close()              {}
}

module.exports = DB;
