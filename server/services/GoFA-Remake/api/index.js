/**
 * @module api
 * @description GoFA-Remake HTTP API 路由聚合入口（route aggregator）
 *  挂载 API 访问日志中间件与 4 个域子路由。
 */
const path = require("node:path");
const express = require("express");

const Log = require(path.resolve(__dirname, "../../libs/shared/logger"));

const accountRoleRouter = require("./account_role");
const fleetCombatRouter = require("./fleet_combat");
const worldSocialRouter = require("./world_social");
const adminRouter = require("./admin");

/**
 * API 访问日志中间件（使用日志库 Log）。
 * API access logging middleware (uses the Log library).
 * @param {import("express").Request} req - 请求  Request
 * @param {import("express").Response} res - 响应  Response
 * @param {import("express").NextFunction} next - 下一个中间件  Next middleware
 */
function apiAccessLog(req, res, next) {
    const started_at = process.hrtime.bigint();
    res.on("finish", () => {
        const duration_ms = Number(process.hrtime.bigint() - started_at) / 1e6;
        const ip = req.ip || req.socket?.remoteAddress || "-";
        Log.info(
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

module.exports = router;
