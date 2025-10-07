/**
 * 数据库类型枚举
 * @enum {string}
 * @readonly
 */
const ENUM_DB_TYPE = Object.freeze({
    SQLITE3: "sqlite3",
    NODE_SQLITE: "node:sqlite",
    //MYSQL: "mysql",
    //POSTGRESQL: "postgresql",
});
module.exports = ENUM_DB_TYPE;