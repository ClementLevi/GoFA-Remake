/**
 * @module api
 * @description GoFA-Remake HTTP API 路由聚合入口（route aggregator）
 *  挂载 API 访问日志中间件、4 个域子路由，以及 404/405 兜底处理。
 */
const path = require("node:path");
const express = require("express");

const Log = require(path.resolve(__dirname, "../../libs/shared/logger"));
const { ENUM_ERROR_CODE, fail } = require(path.resolve(
    __dirname,
    "../../libs/shared/response"
));

const accountRoleRouter = require("./account_role");
const fleetCombatRouter = require("./fleet_combat");
const worldSocialRouter = require("./world_social");
const adminRouter = require("./admin");

/**
 * API 访问日志中间件（使用日志库 Log 的 api 等级，青色独立配色）。
 * API access logging middleware (uses the Log.api level, cyan color).
 * @param {import("express").Request} req - 请求  Request
 * @param {import("express").Response} res - 响应  Response
 * @param {import("express").NextFunction} next - 下一个中间件  Next middleware
 */
function apiAccessLog(req, res, next) {
    const started_at = process.hrtime.bigint();
    res.on("finish", () => {
        const duration_ms = Number(process.hrtime.bigint() - started_at) / 1e6;
        const ip = req.ip || req.socket?.remoteAddress || "-";
        Log.api(
            `[API] ${req.method} ${req.originalUrl} ${res.statusCode} ${ip} ${duration_ms.toFixed(2)}ms`
        );
    });
    next();
}

/**
 * 简单路径匹配：支持 :param 段。  Simple path matching (supports :param segments).
 * @param {string} pattern - 路由模式（如 /roles/:roleId）  Route pattern
 * @param {string} actual - 实际请求路径  Actual request path
 * @returns {boolean} 是否匹配  Whether matches
 */
function pathMatches(pattern, actual) {
    const p = pattern.split("/").filter(Boolean);
    const a = actual.split("/").filter(Boolean);
    if (p.length !== a.length) return false;
    return p.every((seg, i) => seg.startsWith(":") || seg === a[i]);
}

/**
 * 收集能匹配该路径的所有 HTTP 方法（递归遍历子路由）。
 * Collect HTTP methods that match the path (recursively walks sub-routers).
 * @param {import("express").Router} router - 路由  Router
 * @param {string} actual_path - 实际请求路径  Actual request path
 * @returns {string[]} 允许的方法列表  Allowed methods
 */
function collectMethods(router, actual_path) {
    const methods = new Set();
    for (const layer of router.stack || []) {
        if (layer.route) {
            if (pathMatches(layer.route.path, actual_path)) {
                for (const m of Object.keys(layer.route.methods)) {
                    if (layer.route.methods[m]) methods.add(m.toUpperCase());
                }
            }
        } else if (layer.handle && layer.handle.stack) {
            // 子路由（挂载无前缀）  Sub-router (mounted without prefix)
            for (const m of collectMethods(layer.handle, actual_path)) {
                methods.add(m);
            }
        }
    }
    return [...methods];
}

const router = express.Router();

// 访问日志  Access logging
router.use(apiAccessLog);
// 挂载各域子路由  Mount domain sub-routers
router.use(accountRoleRouter);
router.use(fleetCombatRouter);
router.use(worldSocialRouter);
router.use(adminRouter);

// 404/405 兜底（放在所有子路由之后）  404/405 fallback (after all sub-routers)
router.use((req, res) => {
    const allowed = collectMethods(router, req.path);
    if (allowed.length > 0) {
        res.set("Allow", allowed.join(", "));
        return fail(
            res,
            ENUM_ERROR_CODE.METHOD_NOT_ALLOWED,
            "方法不允许",
            `该路径支持方法：${allowed.join(", ")}`,
            405
        );
    }
    return fail(
        res,
        ENUM_ERROR_CODE.NOT_FOUND,
        "接口不存在",
        `未找到 ${req.method} ${req.originalUrl}`,
        404
    );
});

module.exports = router;
