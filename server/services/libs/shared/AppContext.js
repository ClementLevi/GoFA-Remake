/**
 * @module AppContext
 * @description 全局应用上下文（模块级单例）：持有 Main 单例引用与运行时 JWT 密钥，
 *  供各组件（API / Commands）访问根环境。JWT 密钥不静态配置，由 Auth Server 在
 *  服务器加载完成后运行时注入（setJwtSecret），其余模块经 getJwtSecret 读取。
 * Global app context (module-level singleton): holds the Main singleton reference
 * and the runtime JWT secret. The secret is not static config; the Auth Server
 * injects it after load via setJwtSecret, and other modules read it via getJwtSecret.
 *
 * 类型约定（TS 级 JSDoc）：模块导出对象用 AppContextInstance 形状描述；
 * Main 单例通过 IMainLike 投影类型引用（入口文件 main.js 不导出类）。
 */

/**
 * Main 实例投影类型（权威：libs/types/main_types.js 的 IMainLike，禁止本处手写重复形状）
 *  Main instance projection (authority: IMainLike in libs/types/main_types.js)
 * @typedef {import("../types/main_types").IMainLike} IMainLike
 */

/**
 * 全局应用上下文实例形状（模块单例导出形状，方法签名与下方实现一一对应）
 *  Global app context instance shape (mirrors the exported object literal)
 * @typedef {object} AppContextInstance
 * @property {(main: IMainLike) => IMainLike} setMain - 注册 Main 单例并原样返回  Register the Main singleton and return it
 * @property {() => IMainLike|null} getMain - 获取 Main 单例（未注册为 null）  Get the Main singleton
 * @property {(secret: string) => string} setJwtSecret - 注入运行时 JWT 密钥  Inject the runtime JWT secret
 * @property {() => string|null} getJwtSecret - 获取运行时 JWT 密钥（未注入为 null）  Get the runtime JWT secret
 */

let main_instance = null;
let jwt_secret = null;

/** @type {AppContextInstance} */
module.exports = {
    /**
     * 注册 Main 单例  Register the Main singleton
     * @param {IMainLike} main - Main 实例  The Main instance
     * @returns {IMainLike} 入参 main 原样返回  The passed-in main
     */
    setMain(main) {
        main_instance = main;
        return main;
    },

    /**
     * 获取 Main 单例  Get the Main singleton
     * @returns {IMainLike|null} Main 实例；未注册时为 null  The Main instance, or null before registration
     */
    getMain() {
        return main_instance;
    },

    /**
     * 注入运行时 JWT 密钥（Auth Server 加载完成后调用）  Inject the runtime JWT secret
     * @param {string} secret - JWT 密钥  JWT secret
     * @returns {string} 入参 secret 原样返回  The passed-in secret
     */
    setJwtSecret(secret) {
        jwt_secret = secret;
        return secret;
    },

    /**
     * 获取运行时 JWT 密钥  Get the runtime JWT secret
     * @returns {string|null} 密钥；未注入时为 null  The secret, or null if not injected
     */
    getJwtSecret() {
        return jwt_secret;
    },
};
