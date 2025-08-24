const path = require("node:path");
const fs = require("node:fs");
const _ = require("lodash");
const { InitializationViolationError } = require(path.resolve(
    __dirname,
    "../../../../libs/error/Error"
));
const commonFunctions = require(path.resolve(
    __dirname,
    "../../../../libs/shared/index"
));

/**
 * @typedef {Object} NameRule
 * @property {string[]} head
 * @property {string[]} neck
 * @property {string[]} body
 * @property {string[]} end
 */

/**
 * 星系随机起名机
 * Star systems namer
 */
class NameGenerator {
    constructor() {
        this.namePool = new Set();
        // 从“SystemNameLoader”类导入JSON里的数据
        /**
         * 词根可包含任意多部分
         * @type {NameRule|null}
         */
        this.dic = null;
        /**
         * @type {Array<Array<String>>}
         */
        this.dic_2d = _.values(this.dic);

        /**
         * 最大可能数量，其值由SystemNameLoader类传入
         * @type {Number}
         */
        this.COUNT_CAPA = -1;

        this._is_initialized = false;
    }

    /**
     * 执行星系名生成的方法
     * Start star-systems-names generating procedure.
     * @param {Number} totalNumber=-1 - How many names you want to generate. Should
     *      be an integer. 0 or less for "as many as possible".
     * @returns {Promise<Set<String>>} - all the names generated randomly
     */
    async generate(totalNumber = -1) {
        return new Promise((resolve, reject) => {
            if (!this._is_initialized) {
                reject(
                    new InitializationViolationError(
                        "Use `use_name_template` method to load name template first."
                    )
                );
            }
            // 首先过滤非法参数
            if (totalNumber <= 0) {
                totalNumber = this.COUNT_CAPA; //参数非法时，生成最大可能数量
            } else {
                totalNumber = Math.floor(totalNumber);
            }
            // 当要求生成的数量超过可能生成数量时，需要在控制台确认
            if (totalNumber > this.COUNT_CAPA) {
                console.warn(
                    `Required too many generation: capacity of this diction is ${this.COUNT_CAPA}, requiring ${totalNumber}`
                );
            }
            // 随机生成所需数量的名字，并用Set对象保存
            this.namePool = new Set(
                _.shuffle(commonFunctions.cartesianProduct(this.dic_2d))
                    .slice(0, totalNumber)
                    .map((i) => commonFunctions.titleCase(i))
            );
            // 生成结束，所有名字用Set对象导出
            resolve(this.namePool);
        });
    }
    /**
     * 使用的命名模板，必须是满足{@link NameRule}结构的JSON文件
     * @param {string|
     * NameRule} template 要使用的JSON文件相对路径
     * @see NameRule
     * @returns {Promise<NameGenerator>}
     */
    async use_name_template(template) {
        return new Promise((resolve, reject) => {
            if (typeof template === "string") {
                fs.readFile(path.resolve(__dirname, template), (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    const nameRule = JSON.parse(data);
                    const ruleKeys = Object.keys(nameRule);
                    // 去重
                    _.forIn(nameRule, (v, k) => {
                        nameRule[k] = _.uniq(v);
                    });
                    // 获取各字段容量的乘积（最大可能构词数量，做笛卡尔积得到）
                    let max = 1;
                    for (let i = 0; i < ruleKeys.length; i++) {
                        max *= nameRule[ruleKeys[i]].length;
                    }
                    this.COUNT_CAPA = max;
                    this.dic = nameRule;
                    this.dic_2d = _.values(this.dic);
                    this._is_initialized = true;
                    resolve(this);
                });
            } else {
            }
        });
    }
    /**
     * @throws {InitializationViolationError}
     * @returns {string} - 随机生成的名字
     */
    pick() {
        if (this.namePool.size <= 0) {
            this._is_initialized = false; // 需要重新初始化
            throw new InitializationViolationError(
                "No unused name left. Use async `generate` method to generate names first."
            );
        }
        return commonFunctions.randomPop(this.namePool);
    }
}

module.exports = NameGenerator;

// Test
if (require.main === module) {
    var systemNameGenerator = new NameGenerator();

    // 有点回调地狱看着
    systemNameGenerator.use_name_template("systemNameRule.json").then(() => {
        systemNameGenerator.generate(40).then((result) => {
            console.log(result);
            console.warn(commonFunctions.ranchoice(result));
        });
        systemNameGenerator.generate(65535).then((result2) => {
            console.log(result2);
            console.log(systemNameGenerator.COUNT_CAPA);
            console.log(systemNameGenerator.pick());
        });
    });
}
