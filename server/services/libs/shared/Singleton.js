/**
 * 创建一个单例模式的实例管理器。
 * 单例模式确保一个类只有一个实例，并提供一个全局访问点。
 * 该函数返回一个代理对象，该代理对象控制类的实例化过程。
 * 如果尚未创建实例，则使用提供的初始化实例创建一个新的实例。
 * 如果已经存在实例，则直接返回该实例。
 *
 * @template {new (...args: any[]) => ClassNameInstance} ClassName - 类构造函数类型
 * @template ClassNameInstance - 类实例类型
 * @param {ClassNameInstance} initializedInstance - 已初始化的类实例
 * @returns {ClassName & {
 *   getInstance?: (...args: any[]) => ClassNameInstance
 * }} - 代理后的单例类
 *
 * @example
 * // 定义一个类
 * class MyClass {
 *     constructor(arg1, arg2) {
 *         this.arg1 = arg1;
 *         this.arg2 = arg2;
 *     }
 * }
 *
 * // 在模块定义中创建单例实例
 * const mySingleton = singleton(new MyClass('value1', 'value2'));
 *
 * // 使用单例实例
 * const instance1 = new mySingleton();
 * const instance2 = new mySingleton();
 * console.log(instance1 === instance2); // 输出: true
 * // 对于较复杂的需在初始化时指定多个参数的类，模块制作者可以提供一个工厂函数，令使用者自行创建实例。如：
 * module.exports = (...args) => singleton(new MyClass(...args));
 * // moduleUser.js
 * const instance3 = require('./module')('value1', 'value2');
 */
function singleton(initializedInstance) {
    /**
     * @private
     * @type {any}
     */
    let _instance;
    /** @type {ClassName & {getInstance?: (...args: any[]) => ClassNameInstance}} */
    let proxy = new Proxy(initializedInstance, {
        construct(target, args) {
            if (!_instance) {
                _instance = Reflect.construct(target, args);
            }
            return _instance;
        },
        get(target, prop, receiver) {
            if (prop === "getInstance") {
                return target.getInstance
                    ? target.getInstance.bind(target)
                    : () => _instance;
            }
            return target[prop];
        },
    });
    return proxy;
}
module.exports = singleton;

if (require.main === module) {
    class TestClass {
        constructor(value) {
            this.value = value || Math.random();
        }
    }

    // 测试1: 通过new创建实例
    const TestClassSingletonInstance = singleton(new TestClass());
    const instance1 = TestClassSingletonInstance;
    const instance2 = TestClassSingletonInstance;

    // 测试2: 通过getInstance获取/创建实例
    const instance3 = TestClassSingletonInstance.getInstance();
    const instance4 = TestClassSingletonInstance.getInstance(0.5); // 带参数创建

    console.log("单例模式测试:");
    console.log("instance1 === instance2:", instance1 === instance2);
    console.log("instance1 === instance3:", instance1 === instance3);

    // 测试3：稍复杂的类定义与实例化
    /**
     * @typedef config - 配置对象
     * @property {"mysql"|"sqlite"|"mongodb"} type - 数据库类型
     * @property {(config["type"] extends "sqlite"? string: never)} [path] - 数据库路径
     * @property {(config["type"] extends "mysql"? string: never)} [host] - 数据库主机名
     */
    class MockDB {
        /**
         * @param {config} config - 配置对象
         */
        constructor(config) {
            this.config = config;
        }
    }

    const MockDBCreator = (/** @type {any[]}*/ ...args) => {
        return singleton(...args);
    };
    const MockDBSingletonInstance = MockDBCreator(
        new MockDB({ type: "mysql", host: "localhost", path: "./test.db" })
    );
    console.log("MockDBSingletonInstance:", MockDBSingletonInstance);
}
