# GoFA-Remake 错误处理规范

## 错误类型
1. 使用自定义错误类体系
2. 继承自`CustomBaseError`基类
3. 主要错误类型：
   - `AbstractClassError`: 抽象类实例化错误
   - `ValueError`: 值无效错误
   - `ConfigError`: 配置错误
   - `InitializationViolationError`: 初始化违规错误
   - `InterfaceClassError`: 接口类实例化错误

## 错误定义
1. 每个错误类必须有详细描述
```javascript
/**
 * @description 配置无效错误
 * Invalid configuration error
 */
class ConfigError extends CustomBaseError {
    constructor(message) {
        super(message);
    }
}
```

## 错误抛出
1. 使用`throw`关键字抛出错误
2. 提供清晰的错误信息
3. 包含相关错误值
```javascript
if (!config) {
    throw new ConfigError("Missing required configuration");
}
```

## 错误捕获
1. 使用`try/catch`捕获错误
2. 按错误类型分别处理
```javascript
try {
    // 可能抛出错误的代码
} catch (e) {
    if (e instanceof ConfigError) {
        // 处理配置错误
    } else if (e instanceof ValueError) {
        // 处理值错误
    } else {
        // 处理其他错误
    }
}
```

## 错误日志
1. 使用项目标准日志工具记录错误
2. 记录完整错误堆栈
```javascript
const Log = require("../libs/shared/logger");

try {
    // ...
} catch (e) {
    Log.error(`${e.name}: ${e.message}`, e.stack);
}
```

## 错误信息格式
1. 错误信息应简明扼要
2. 包含足够上下文信息
3. 使用中英双语
```javascript
throw new ValueError(
    "无效的玩家等级: 必须介于1-100之间\n" +
    "Invalid player level: must be between 1-100",
    level
);
```

## 最佳实践
1. 尽早验证输入参数
2. 使用守卫语句提前返回
3. 为关键操作添加错误边界
4. 避免过度捕获和静默错误

## AI辅助提示
1. 检查错误处理完整性
2. 建议合适的错误类型
3. 验证错误信息格式
