/**
 * @module AppContext
 * @description 全局应用上下文：持有 Main 单例引用与运行时 JWT 密钥，供各组件（API / Commands）访问根环境。
 *  JWT 密钥不静态配置，由 Auth Server 在服务器加载完成后运行时注入（setJwtSecret）。
 * Global app context: holds the Main singleton and the runtime JWT secret.
 * The JWT secret is not static config; the Auth Server injects it after load (setJwtSecret).
 */

let main_instance = null;
let jwt_secret = null;

module.exports = {
    /**
     * 注册 Main 单例  Register the Main singleton
     * @param {object} main - Main 实例  The Main instance
     * @returns {object} 入参 main  The passed-in main
     */
    setMain(main) {
        main_instance = main;
        return main;
    },

    /**
     * 获取 Main 单例  Get the Main singleton
     * @returns {object|null} Main 实例，未注册时为 null  The Main instance, or null before registration
     */
    getMain() {
        return main_instance;
    },

    /**
     * 注入运行时 JWT 密钥（Auth Server 加载完成后调用）  Inject the runtime JWT secret
     * @param {string} secret - JWT 密钥  JWT secret
     * @returns {string} 入参 secret
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
