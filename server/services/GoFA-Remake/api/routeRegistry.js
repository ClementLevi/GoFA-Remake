/**
 * @module routeRegistry
 * @description 路由注册表：在定义路由时记录 (method, path)，供 405 判定使用，
 *  避免依赖 Express 内部 stack（layer.route / layer.handle.stack）。
 *  本模块以显式路由表（path → 方法集合）作为唯一事实来源：makeRouter 包装
 *  Router 的 get/post/put/patch/delete/options/head 方法，在每次注册时同步写入
 *  注册表；index.js 的 404/405 兜底通过 getAllowedMethods 查询该表判定
 *  405（方法不允许，附 Allow 头）或 404（接口不存在）。
 * Route registry: records (method, path) at route definition for 405 detection,
 * avoiding dependence on Express internal stack. An explicit route table
 * (path → method set) is the single source of truth: makeRouter wraps the Router
 * methods and writes the registry on registration; index.js's 404/405 fallback
 * queries it via getAllowedMethods.
 *
 * 类型约定（TS 级 JSDoc）：注册表为 RouteRegistry（Map<string, Set<string>>）；
 * registerRoute 仅内部使用，对外导出 makeRouter 与 getAllowedMethods；makeRouter
 * 返回 express.Router（自动注册版本）。
 */

const express = require("express");

// ─────────────────── 类型体操：领域类型定义 ───────────────────

/**
 * 路由注册表：路径 → 允许的 HTTP 方法集合（统一大写）
 *  Route registry: path → set of allowed HTTP methods (uppercased)
 * @typedef {Map<string, Set<string>>} RouteRegistry
 */

/**
 * 全局路由注册表  Global route registry
 * @type {RouteRegistry}
 */
const registry = new Map();

/**
 * 记录一条路由（内部使用：路由注册时写入显式路由表）
 *  Record a route (internal: write the explicit route table on registration)
 * @param {string} method - HTTP 方法（大小写不敏感，统一转大写）  HTTP method (case-insensitive)
 * @param {string} path - 路由路径  Route path
 * @returns {void}
 */
function registerRoute(method, path) {
    const m = method.toUpperCase();
    if (!registry.has(path)) {
        registry.set(path, new Set());
    }
    registry.get(path).add(m);
}

/**
 * 获取某路径允许的 HTTP 方法列表（供 405 判定使用）
 *  Get allowed methods for a path (for 405 detection)
 * @param {string} path - 路由路径  Route path
 * @returns {string[]} 方法列表；路径未注册时返回空数组  Method list, or [] if unregistered
 */
function getAllowedMethods(path) {
    const methods = registry.get(path);
    return methods ? [...methods] : [];
}

/**
 * 创建会自动注册路由的 Router（包装 7 个 HTTP 方法，注册时同步写路由表）
 *  Create a Router that auto-registers routes (wraps the 7 HTTP methods)
 * @returns {import("express").Router} 自动注册的 Router  An auto-registering Router
 */
function makeRouter() {
    const router = express.Router();
    for (const method of [
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "options",
        "head",
    ]) {
        const original = router[method].bind(router);
        /**
         * 包装后的路由注册方法：先写入显式路由表，再调用 Express 原始方法
         *  Wrapped route registration: write the registry, then call the Express original
         * @param {string} path - 路由路径  Route path
         * @param {...import("express").RequestHandler} handlers - 处理器（可多个）  Handlers
         * @returns {import("express").Router} 原始方法返回值（Router，可链式）  Original return (chainable Router)
         */
        router[method] = (path, ...handlers) => {
            registerRoute(method, path);
            return original(path, ...handlers);
        };
    }
    return router;
}

module.exports = { makeRouter, getAllowedMethods };
