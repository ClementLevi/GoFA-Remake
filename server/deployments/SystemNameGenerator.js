// 相对路径去世
// 是你太菜来的大叔
const commonFunctions = require("..\\common-functions-GoFA");
const nameTemplates = require(".\\SystemNameLoader").name_rule;

/**
 * 星系随机起名机
 * Star systems name giver
 * @method generate(totalNumber=-1, duplicateFuseMaxTry=1000000)
 *
 */
function NameGenerator() {
    this.namePool = new Set();
    this.fuseCount = 0;
    // import JSON template via "nameTemplates" module interface
    // 从“SystemNameLoader”类导入JSON里的数据
    /**
     * 词根的三个部分：前缀词干后缀
     * @type {Array}
     */
    this.head = nameTemplates.head.slice();
    this.body = nameTemplates.body.slice();
    this.end = nameTemplates.end.slice();
    /**
     * 最大可能数量，其值由SystemNameLoader类传入
     * @type {Number}
     */
    this.COUNT_CAPA = nameTemplates.MAX;

    //! This will be not compatable with new naming rules when new
    //! sections are to add
    //? 或许我不该这么早就考虑扩展性？
    // TODO 或许还是应该考虑一下传入的JSON里可能包含多个词根字段，在这里用一个对象统一吸入比较好

    /**
     * 执行星系名生成的方法
     * Start star-systems-names generating procedure.
     * @param {Number} totalNumber=-1 - How many names you want to generate. Should
     *      be an integer. 0 or less for "as much as possible".
     * @param {Number} duplicateFuseMaxTry=1000000 - Indicates how many tries you wish
     *      the module to carry on to search as many names as possible.
     *      The smaller the value is, the less likely will the output number
     *      approach to theoratical maximum output number.
     * @returns {Set} - all the names generated randomly
     */
    this.generate = function(totalNumber = -1, duplicateFuseMaxTry = 1000000) {
        // filt out the bad argument
        // 首先过滤非法参数
        if (totalNumber <= 0) {
            totalNumber = this.COUNT_CAPA; //参数非法时，生成最大可能数量
        } else {
            totalNumber = Math.floor(totalNumber);
        }
        // alert when the required total number is beyond maximum output possibility
        // 当要求生成的数量超过可能生成数量时，需要在控制台确认
        if (totalNumber > this.COUNT_CAPA) {
            const readlineSync = require('readline-sync');

            const confirm = readlineSync.keyInYN(
                `'totalNumber' appointed is greater than maximum possible output.\n
Continuiung will cost too much system resources in trying searching.\n
Would you still like to continue?: `);
            if (!confirm) {
                console.warn(">> Name generation has been aborted.");
                process.exit(1);
            }
        }
        // Randomly generation loop
        // 随机取名循环
        while (this.namePool.size < totalNumber) {
            var newName = commonFunctions.ranchoice(this.head) +
                commonFunctions.ranchoice(this.body) +
                commonFunctions.ranchoice(this.end);
            // TODO 以后这里的算法最好是随机选择词根是否出现或者出现几次
            // uppercase the new name with self-built function 首字母大写并加入
            newName = commonFunctions.titleCase(newName);
            this.namePool.add(newName);
            // Probe to check if a name is indeedly added to the set.  查看新名字是否已在清单里
            var test = this.namePool.size;
            // If the length of set didn't change during this try (new name is not added):  假如清单的长度没有改变（添加不成功）
            if (test == this.namePool.size) {
                this.fuseCount += 1; // Fuse heat up  保险丝就会升温
                // And when the fuse has been detonated several times:  保险丝升温到一定程度后
                if (this.fuseCount >= duplicateFuseMaxTry) {
                    // Okay, that's all' o' em   说明已经没有可以生成的随机名字
                    console.log("Too much names required.");
                    break; // End this generation procedure  结束生成
                }
            } else { // If it still work in next try:   如果这一个名字加进去了
                this.fuseCount = 0; // Fuse cool down to zero   保险丝就归零
            }
        }
        // Finish this generation with all name required output in a Set
        // 生成结束，所有名字用Set对象导出
        console.log(`${ this.namePool.size }system names successfully generated!`);
        return this.namePool;
    };
    return this; // ? 这个有必要返回吗
}

exports.NameGenerator = new NameGenerator();
// Test
// var nameGenerator = new NameGenerator();
// nameGenerator.generate(40);
// console.log(nameGenerator);