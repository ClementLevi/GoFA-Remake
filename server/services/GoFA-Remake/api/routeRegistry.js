/**
 * @module routeRegistry
 * @description 路由注册表：在定义路由时记录 (method, path)，供 405 判定使用，
 *  避免依赖 Express 内部 stack（layer.route / layer.handle.stack）。
 * Route registry: records (method, path) at route definition for 405 detection,
 * avoiding dependence on Express internal stack (layer.route / layer.handle.stack).
 */

const express = require("express");

/** @type {Map<string, Set<string>>} path -> 方法集合  path -> set of methods */
const registry = new Map();

/**
 * 记录一条路由  Record a route
 * @param {string} method - HTTP 方法  HTTP method
 * @param {string} path - 路由路径  Route path
 */
function registerRoute(method, path) {
    const m = method.toUpperCase();
    if (!registry.has(path)) {
        registry.set(path, new Set());
    }
    registry.get(path).add(m);
}

/**
 * 获取某路径允许的方法  Get allowed methods for a path
 * @param {string} path - 路由路径  Route path
 * @returns {string[]} 方法列表  Method list
 */
function getAllowedMethods(path) {
    const methods = registry.get(path);
    return methods ? [...methods] : [];
}

/**
 * 创建会自动注册路由的 Router  Create a Router that auto-registers routes
 * @returns {import("express").Router}
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
        router[method] = (path, ...handlers) => {
            registerRoute(method, path);
            return original(path, ...handlers);
        };
    }
    return router;
}

module.exports = { makeRouter, getAllowedMethods };
