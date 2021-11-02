// 相对路径去世
// TODO 改天去主程序入口内把工作路径改成server/
console.log(process.cwd());
const commonFunctions = require(".\\server\\common-functions-GoFA");
const nameTemplates = require(".\\server\\deployments\\SystemNameLoader");

/** 咱们从哪说起呢
 *
 */
var name_generator = {
    namePool: new Set(),
    // import JSON template via "nameTemplates" module interface
    // 从
    head: Array.from(nameTemplates.head),
    body: Array.from(nameTemplates.body),
    end: Array.from(nameTemplates.end),
    COUNT_CAPA: Number.from(nameTemplates.MAX),
    fuseCount: 0,
    //! This will be not compatable with new naming rules when new
    //! sections are to add
    //? 或许我不该这么早就考虑扩展性？

    /**
     * Start generating procedure.
     * @param {Number} totalNumber How many names you want to generate. Should
     *      be an integer. -1 for "as much as possible".
     * @returns {Set} all the names generated randomly
     */
    generate: function(totalNumber = -1, nameCountRequirement = 1000000) {
        // filt out the bad argument
        if (totalNumber == -1) {
            totalNumber = this.COUNT_CAPA();
        } else {
            totalNumber = Math.floor(totalNumber);
        }
        /* Count to generate required amount of names
         * While the length of 3 pools each is 28, 98, 15, this can generate at
         * most about 34104 names due to the possibility.
         * If you need more than that, plz add elements into the pools and
         * then recalculate the limit.
         */
        while (this.namePool.size < totalNumber) {
            var newName = commonFunctions.ranchoice(this.head) +
                commonFunctions.ranchoice(this.body) +
                commonFunctions.ranchoice(this.end);
            // uppercase the new name with self-built function 首字母大写
            newName = commonFunctions.titleCase(newName);
            // Probe to check if a name is indeedly added to the set.
            var test = this.namePool.size;
            // If the length of set didn't change during this try:
            if (test == this.namePool.size) {
                this.fuseCount += 1; // Fuse heat up
                // And when the fuse has been detonated 10 million times:
                if (this.fuseCount > nameCountRequirement) {
                    // Okay, that's all' o' em
                    console.log("Too much names required.");
                    break;
                }
            } else { // If it still work in next try:
                this.fuseCount = 0; // Fuse cool down to zero
            }
        }
        // Finish this generation with all name required output in a Set
        console.log("%s system names successfully generated! " % len(self.name_pool))
        return this.namePool;
    }
};

// Test
var nameGenerator = new name_generator();
console.log(nameGenerator.generate(-1, 10));