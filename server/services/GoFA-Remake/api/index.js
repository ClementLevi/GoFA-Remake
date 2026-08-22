/**
 * @module api
 * @description GoFA-Remake HTTP API 占位路由聚合入口（placeholder route aggregator）
 *  挂载 4 个域子路由；仅回显请求详情，不实现业务逻辑（placeholder only）。
 */
const express = require("express");

const accountRoleRouter = require("./account_role");
const fleetCombatRouter = require("./fleet_combat");
const worldSocialRouter = require("./world_social");
const adminRouter = require("./admin");

const router = express.Router();

// 挂载各域子路由  Mount domain sub-routers
router.use(accountRoleRouter);
router.use(fleetCombatRouter);
router.use(worldSocialRouter);
router.use(adminRouter);

module.exports = router;
