// 相对路径去世
const path = require("path");
const _ = require("lodash");
const commonFunctions = require(path.resolve("services/libs/shared/index"));
const nameTemplates = require(path.resolve(
    "services/GoFA-Remake/game_entities/atlas/system/SystemNameLoader"
));

/**
 * 星系随机起名机
 * Star systems namer
 */
class SystemNameGenerator {
    constructor() {
        this.namePool = new Set();
        // 从“SystemNameLoader”类导入JSON里的数据
        /**
         * 词根可包含任意多部分
         * @type {Object<Array<String>>}
         */
        this.dic = nameTemplates.name_rule;
        /**
         * @type {Array<Array<String>>}
         */
        this.dic_2d = _.values(this.dic);

        /**
         * 最大可能数量，其值由SystemNameLoader类传入
         * @type {Number}
         */
        this.COUNT_CAPA = nameTemplates.MAX;
    }

    /**
     * 执行星系名生成的方法
     * Start star-systems-names generating procedure.
     * @param {Number} totalNumber=-1 - How many names you want to generate. Should
     *      be an integer. 0 or less for "as many as possible".
     * @returns {Set} - all the names generated randomly
     */
    generate(totalNumber = -1) {
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
        return this.namePool;
    }
}

module.exports = SystemNameGenerator;

// Test
if (require.main === module) {
    var systemNameGenerator = new SystemNameGenerator();
    let result = systemNameGenerator.generate(40);
    let result2 = systemNameGenerator.generate(65535); // MAX=50490
    console.log(result2);
    console.log(result2.length);
    console.log(systemNameGenerator.COUNT_CAPA);
}
