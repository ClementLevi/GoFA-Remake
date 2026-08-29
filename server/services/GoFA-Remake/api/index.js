/**
 * @module api
 * @description GoFA-Remake HTTP API 路由聚合入口（route aggregator）。
 *  职责：①挂载 API 访问日志中间件（apiAccessLog，Log.api 青色配色）；
 *  ②挂载 4 个域子路由（account_role / fleet_combat / world_social / admin）；
 *  ③提供 404/405 兜底。兜底策略：置于所有子路由之后，先经
 *  getAllowedMethods(req.path) 查询 routeRegistry 显式路由表——路径已注册但方法
 *  不允许 → 405（附 Allow 头）；路径未注册 → 404。本地 pathMatches 路由表已删除，
 *  405 判定完全委托 routeRegistry，避免依赖 Express 内部 stack。
 * Aggregator entry for the GoFA-Remake HTTP API: mounts the access-log middleware,
 * the 4 domain sub-routers, and the 404/405 fallback. The fallback queries the
 * explicit route table via getAllowedMethods: a registered path with a disallowed
 * method → 405 (with Allow header); an unknown path → 404. The local pathMatches
 * table was removed; 405 detection is fully delegated to routeRegistry.
 */
const path = require("node:path");
const express = require("express");

const Log = require(path.resolve(__dirname, "../../libs/shared/logger"));
const { ENUM_ERROR_CODE, fail } = require(path.resolve(
    __dirname,
    "../../libs/shared/response"
));
const { getAllowedMethods } = require("./routeRegistry");

const accountRoleRouter = require("./account_role");
const fleetCombatRouter = require("./fleet_combat");
const worldSocialRouter = require("./world_social");
const adminRouter = require("./admin");

/**
 * API 访问日志中间件（使用日志库 Log 的 api 等级，青色独立配色）。
 *  监听 res "finish" 事件，记录 method/originalUrl/statusCode/ip/耗时。
 * API access logging middleware (uses the Log.api level, cyan color).
 * Listens on the res "finish" event and logs method/url/status/ip/duration.
 * @param {import("express").Request} req - 请求  Request
 * @param {import("express").Response} res - 响应  Response
 * @param {import("express").NextFunction} next - 下一个中间件  Next middleware
 * @returns {void}
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

const router = express.Router();

// 访问日志  Access logging
router.use(apiAccessLog);
// 挂载各域子路由  Mount domain sub-routers
router.use(accountRoleRouter);
router.use(fleetCombatRouter);
router.use(worldSocialRouter);
router.use(adminRouter);

/**
 * 404/405 兜底中间件（置于所有子路由之后）：查询 routeRegistry 显式路由表判定
 *  405（方法不允许，附 Allow 头）或 404（接口不存在）。
 *  404/405 fallback middleware (after all sub-routers): queries the explicit route
 *  table to return 405 (disallowed method + Allow header) or 404 (unknown path).
 * @param {import("express").Request} req - 请求  Request
 * @param {import("express").Response} res - 响应  Response
 * @returns {import("express").Response} 兜底 JSON 响应  Fallback JSON response
 */
router.use((req, res) => {
    const allowed = getAllowedMethods(req.path);
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
