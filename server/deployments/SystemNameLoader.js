const fs = require("fs");
const path = require("path");
const _ = require("lodash");

// Open word-root rule JSON from templates into an Object
// 加载模板里的JSON命名规则
var raw_rule = fs.readFileSync(
    path.resolve(
        "services/GoFA-Remake/game_entities/atlas/system/systemNameRule.json"
    )
);

var name_rule = JSON.parse(raw_rule);
var rule_keys = Object.keys(name_rule);

_.forIn(name_rule, (v, k) => {
    name_rule[k] = _.uniq(v);
});

// Get the product of every piece of word-root
// (Maximum possible word output count)
// 获取各字段容量的乘积（最大可能构词数量，做笛卡尔积得到）
let MAX = 1;
for (let i = 0; i < rule_keys.length; i++) {
    MAX *= name_rule[rule_keys[i]].length;
}

module.exports = { name_rule, MAX };

// TEST
if (require.main === module) {
    console.log(name_rule);
    console.log(MAX);
    console.log(">> Module `SystemNameLoader` loaded.");
}