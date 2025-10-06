/**
 * @module DB_Config
 * @exports DB_Config
 * @public
 */

/**
 * @description 创建数据库链接所需的其他参数
 * @typedef {object} DB_Config
 * @property {string} [filePath] - 数据库文件路径，仅在使用SQLite时需要。
 * @property {string} [dbName] - 数据库名称，仅在使用SQLite时需要。
 * @property {string} [host] - 数据库主机地址，仅在使用MySQL或PostgreSQL时需要。
 * @property {number} [port] - 数据库端口号，仅在使用MySQL或PostgreSQL时需要。
 * @property {string} [user] - 数据库用户名，仅在使用MySQL或PostgreSQL时需要。
 * @property {string} [password] - 数据库密码，仅在使用MySQL或PostgreSQL时需要。
 */
module.exports = DB_Config;

