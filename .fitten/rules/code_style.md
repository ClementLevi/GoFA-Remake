# GoFA-Remake 代码风格规范

## 文件组织

1. 每个模块/类单独一个文件
2. 文件名使用大驼峰命名法(如 GameManager.js)
3. 目录名使用小驼峰命名法(如 game_entities)
7. 为类使用 jsdoc 实现类似 TypeScript 的类型定义，将定义文件放在同目录下，文件名为`类名.d.ts`

## 代码风格

1. 缩进：4 个空格
2. 行宽：不超过 100 字符
3. 括号风格：K&R 风格

    ```javascript
    // 正确
    if (condition) {
        // code
    }

    // 错误
    if (condition) {
        // code
    }
    ```

4. 尽量使用分号结尾，除非刻意借助AST解析原理简化代码结构
5. 方法之间空一行，类之间空两行
6. 避免魔数，使用命名常量替代
7. 在方法定义伊始使用guarding statement提前校验返回
8. 当if后的执行体足够简短时，可将执行体（如`return this;`）与if写在同一行；
9. 预先构造返回值，如：
```javascript
/**
 * @description ...
 * @param {any} obj ...
 * @returns {any} ...
 */
function doSthWithSpecialClassInstance(obj){
    let ret = {};
    if(!(obj instanceof SpecialClass)) return ret;
    if(obj.someProp === undefined) return ret;
    //... do something with obj...
    ret = /*...*/;
    return ret;
}
```

## 命名规范

1. 类名：大驼峰(如 GameEntity)，整体应是单数名词短语
2. 方法名：小驼峰(如 initGame)，以动词开头
3. 常量：全大写加下划线(如 MAX_PLAYERS)；仅在为数组类型时使用复数名词形式；
4. 私有成员：下划线前缀(如\_privateVar)；仅在为数组类型时使用复数名词形式；
5. 局部变量：snake_case(如 my_var)，使用 let 声明；仅在为数组类型时使用复数名词形式；
6. 回调函数：使用() => {} 语法，考虑参数和返回值情况简写括号
7. 枚举：使用"ENUM\_"前缀命名，值为 Object.freeze()的对象
8. 类型：类型文件放置在与类文件同路径的`类名.d.js`下；对应类中所有需要使用的外部参数和 object 类型返回值都要明确成员属性：

```js
// ClassA.d.js
/**
 * @typedef GameConfig
 * @property {number} max_players
 * @property {string} game_name
 * @exports
 */
// ClassA.js

/**
 * @typedef {import('./GameConfig.d').GameConfig} GameConfig
 */

class ClassA {
    /**
     * @param {GameConfig} config
     */
    constructor(config) {
        //...
        /** @type {number} */
        this.max_players = config.max_players;
        /** @type {string} */
        this.game_name = config.game_name;
    }
    //...
}
```

## 模块规范

1. 使用 CommonJS 模块系统
2. 模块导出统一放在文件下半部：类定义结束后，测试用例的`if(require.main === module)`前

    ```javascript
    // 正确
    module.exports = Game;

    // 错误
    exports.Game = Game;
    ```

3. 每个模块开头按照 node 官方库、第三方库、自定义核心通用库、自定义业务逻辑库的顺序导入依赖
4. node官方库优先使用形如"node:fs"的`node:`前缀，除非如此引用会导致歧义
5. 每个导入的依赖前部使用 jsdoc 声明有关类型定义
6. 避免引入不必要或过于臃肿的依赖，使用解构拆包语法避免这一情况
7. 优先使用基于`__dirname`和`path.resolve`的相对引用
8. 严格杜绝循环依赖
9. 优先考虑依赖倒置原则

## 测试规范

1. 优先使用node内置的node:test和node:assert模块实现测试。有这些模块无法实现的功能时，为整个单元测试文件使用 mocha 框架；
2. 使用`npm run test`命令运行全局单元测试；
3. 每个模块都自包含简单的测试用例，使用`if(require.main === module){...}`包裹，至少对模块中的每个方法提供一项测试用例。
4. 每个模块要提供详细的测试用例，放在`test`目录下，使用`*.test.js`命名。
5. 每个`*.test.js`测试文件都要按 类、类的方法、方法的使用场景 3 个层级组织详细测试。
6. 对于`services/libs`路径下的通用核心库方法，提供 8 个以上测试用例，涵盖基本使用场景、边界情况、时间复杂度和空间复杂度测试。
7. 每个其他方法提供 3 个以上测试用例；

## 注释规范

1. 中英双语注释，逐句对应，各占一行，中文在上，英文在下
2. 使用`npm run doc`命令调用jsdoc工具，生成jsdoc API文档，生成后的文档会自动存放在`server\docs\JsDoc\out`下
3. 严格使用jsdoc语法，注意其与tsdoc的区别
4. 每个类文件开头写上类注释，包括类名、描述、作者、创建日期等信息
5. 每个方法开头写上方法注释，包括方法名、描述、参数、返回值等信息
6. 每个类型定义文件开头写上类型注释，包括类型名、描述、属性、方法等信息

## AI 辅助提示

1. 严格遵循现有代码风格
2. 提供自动格式化建议
3. 对不符合规范的代码给出具体修改建议
