/**
 * @module AppContext
 * @description 全局应用上下文：持有 Main 单例引用，供各组件（API / Commands）访问根环境。
 *  通过本模块获取 Main，避免 API 路由反向 require main.js 造成的循环依赖。
 * Global app context: holds the Main singleton reference so components can access the root,
 * avoiding the circular dependency of requiring main.js from API routes.
 */

let main_instance = null;

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
};
