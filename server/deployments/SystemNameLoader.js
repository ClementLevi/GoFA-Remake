const fs = require("fs");

// Open word-root rule JSON from templates into an Object
// 加载模板里的JSON命名规则
var raw_rule = fs.readFileSync(".//server//templates//system_name_root.json");

var name_rule = JSON.parse(raw_rule);
var rule_keys = Object.keys(name_rule);

// Get the product of every piece of word-root
// (Maximum possible word output count)
// 获取各字段容量的乘积（最大可能构词数量）
var MAX = 0;
for (i = 0; i < rule_keys.length; i++) {
    if (MAX != 0) {
        MAX = MAX * name_rule[rule_keys[i]].length;
    } else {
        MAX = name_rule[rule_keys[i]].length;
    }
}

name_rule.MAX = MAX;
exports.name_rule = name_rule;
console.log(">> Module `SystemNameLoader` loaded.");