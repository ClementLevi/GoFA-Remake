const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

/**同步地读取配置文件。
 * Read config file by default from './config/server_settings.yml' synchronically.
 * 该公开方法作为读取配置文件的接口，其能读取何种文件格式可自行追加实现。
 * This public method serves as an interface to read config files, where what
 * types can it read can be implemented by situation.
 * @public
 * @param {String} file_addr The config file required
 * @returns {Object} All contents in the config file
 */
function read_config_Sync(file_addr) {
    if (!file_addr) {
        file_addr = path.resolve("./configs/server_settings.yml");
    }
    let file = fs.readFileSync(file_addr, "utf-8");
    let config = read_YAML_config(file); // 具体实现
    return config;
}

/**
 * 读取YAML格式的配置文件。文件已经被fs模块打开。
 * Read a YAML file which has been opened by 'fs' module
 * @protected
 * @param {String} file
 * @returns
 */
function read_YAML_config(file){
    return YAML.parse(file);
}

module.exports = { read_config_Sync };
