# GoFA-Remake JSDoc注释规范

## 基本要求
1. 中英双语注释，逐句对应，各占一行，中文在上，英文在下
2. 使用`npm run doc`命令调用jsdoc工具生成API文档
3. 严格使用jsdoc语法，注意其与tsdoc的区别

## 文件注释
1. 每个文件顶部添加模块描述
```javascript
/**
 * @module game/GameManager
 * @description 游戏主循环管理模块
 * Game main loop management module
 */
```

## 类注释
1. 包含类名、描述、作者、创建日期
```javascript
/**
 * 游戏主循环类
 * Game main loop class
 * @class
 * @author Developer
 * @since 2025-10-01
 * @implements {IGame}
 */
class Game {/*...*/}
```

## 方法注释
1. 必须包含`@description`、`@param`和`@returns`
2. 参数和返回值必须指定类型
```javascript
/**
 * 初始化游戏
 * Initialize game
 * @description 初始化游戏资源和状态
 * Initialize game resources and state
 * @param {GameConfig} config 游戏配置
 * Game configuration
 * @returns {Promise<void>}
 */
async init(config) {/*...*/}
```

## 类型定义
1. 使用`.d.js`文件定义类型
2. 使用`@typedef`和`@property`
```javascript
/**
 * @typedef Player
 * @property {string} id 玩家ID
 * Player ID
 * @property {number} level 玩家等级
 * Player level
 */
```

## 常用标签
1. `@type` - 变量类型
```javascript
/** @type {number} */
let count = 0;
```

2. `@returns` - 返回值描述
```javascript
/** 
 * @returns {boolean} 是否成功
 * Whether succeeded
 */
```

3. `@throws` - 抛出异常
```javascript
/**
 * @throws {Error} 参数无效时抛出
 * Throws when invalid parameter
 */
```

## 模块导入导出
1. 导入类型注释
```javascript
/**
 * @typedef {import('./GameConfig.d').GameConfig} GameConfig
 */
```

2. 导出注释
```javascript
/**
 * @exports Game
 */
module.exports = Game;
```

## 与TypeScript的区别
1. 使用`@type`而不是`:`
2. 使用`@typedef`而不是`interface`
3. 使用`@property`定义对象属性
4. 使用`@template`定义泛型

## AI辅助提示
1. 检查JsDoc语法正确性
2. 确保类型定义完整
3. 对缺失注释给出补充建议
