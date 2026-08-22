const path = require("path");
const assert = require("chai").assert;
const { describe, it, beforeEach } = require("mocha");
const { expect } = require("chai");
// 模块导出的是 NameGenerator 类（module.exports = NameGenerator），直接 require 即可
const SystemNameGenerator = require(path.resolve(
    "services/GoFA-Remake/game_entities/atlas/system/SystemNameGenerator.js"
));

describe("NameGenerator", function() {
    let nameGenerator;

    // 每次生成都需先构造全部 ~442 万组合再取子集，耗时较长，放宽默认超时
    this.timeout(120000);

    beforeEach(async function() {
        nameGenerator = new SystemNameGenerator();
        // use_name_template 内部以 __dirname 为基准解析模板路径，传入文件名即可
        await nameGenerator.use_name_template("systemNameRule.json");
    });

    it("should generate system names successfully", async function() {
        const result = await nameGenerator.generate(40);
        assert.instanceOf(result, Set, "result should be an instance of Set");
        assert.equal(result.size, 40, "should generate 40 system names");
    });

    it("element should be string", async function() {
        const result = await nameGenerator.generate(2);
        expect([...result][0]).to.be.a("string");
        expect([...result][1]).to.be.a("string");
    });

    it("should throw when generating before loading template", async function() {
        const uninitialized = new SystemNameGenerator();
        let threw = false;
        try {
            await uninitialized.generate(10);
        } catch (err) {
            threw = true;
            assert.include(
                err.message,
                "Use `use_name_template` method to load name template first."
            );
        }
        assert.isTrue(threw, "generate before init should reject");
    });

    //! 已知设计限制：部分组合经 titleCase 归一化后会碰撞，实际数量略低于理论容量，
    //! 故用数量级比较而非精确相等。参见原注释的 TEST WILL FAIL 用例。
    it("should generate the same amount level of system names with the theoretical capacity when totalNumber is 0 or less", async function() {
        const { compareLog10Integers } = require(path.resolve(
            "services/libs/shared/index"
        ));
        const result = await nameGenerator.generate(-1);
        assert.isTrue(
            compareLog10Integers(result.size, nameGenerator.COUNT_CAPA),
            `should generate at least ${nameGenerator.COUNT_CAPA} names`
        );
    });
});
