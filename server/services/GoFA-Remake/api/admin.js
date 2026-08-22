/**
 * @module admin
 * @description 管理与监控域路由（Admin & Monitoring domain routes）
 *  除占位回显外，含真实的管理员停机端点 POST /admin/halt（定时触发控制台指令 exit）。
 */
const path = require("node:path");
const express = require("express");

const Log = require(path.resolve(__dirname, "../../libs/shared/logger"));

const router = express.Router();

/**
 * 校验管理员权限：管理员 token（Authorization: Bearer <ADMIN_TOKEN>）或口令 data.power。
 * Authorize admin: admin token (Authorization: Bearer <ADMIN_TOKEN>) or passphrase data.power.
 * @param {import("express").Request} req - 请求  Request
 * @returns {boolean} 是否通过  Whether authorized
 */
function isAdminAuthorized(req) {
    // 口令兜底（任务要求）  Passphrase fallback (required by task)
    if (req.body?.data?.power === "卧室牢大") {
        return true;
    }
    // 管理员 token（现阶段无 JWT，用共享 ADMIN_TOKEN 占位，对应 P0-A2 差距）
    // Admin token (no JWT yet, shared ADMIN_TOKEN placeholder, see gap P0-A2)
    const admin_token = req.app?.locals?.main?.config?.ADMIN_TOKEN;
    if (admin_token && req.headers.authorization === `Bearer ${admin_token}`) {
        return true;
    }
    return false;
}

// 心跳
router.get("/ping", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 健康检查
router.get("/health", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 运行状态
router.get("/admin/status", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 运行指标
router.get("/admin/metrics", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 组件在线状态
router.get("/admin/components", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 在线玩家
router.get("/admin/players/online", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 事件队列状态
router.get("/admin/event-queue", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 日志与审计
router.get("/admin/logs", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 完整性校验失败记录
router.get("/admin/integrity-failures", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 执行控制台指令
router.post("/admin/command", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 发起客户端完整性校验
router.post("/admin/integrity-challenge", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 断开玩家连接
router.post("/admin/players/:playerId/disconnect", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 重定向玩家
router.post("/admin/players/:playerId/reroute", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 部署初始化
router.post("/admin/deploy", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 定时停机（真实业务逻辑示例）  Scheduled shutdown (real business logic example)
router.post("/admin/halt", (req, res) => {
    // 鉴权  Authorization
    if (!isAdminAuthorized(req)) {
        return res.status(403).json({
            code: 40300,
            message: "无管理员权限",
            detail: "需要管理员 token 或正确的 power 口令",
        });
    }
    // 参数校验：tth 必须为数字（秒），不可缺省
    // Validate tth: number (seconds), required
    const tth = req.body?.data?.tth;
    if (typeof tth !== "number" || Number.isNaN(tth) || tth < 0) {
        return res.status(400).json({
            code: 40001,
            message: "参数错误",
            detail: "tth 必须为数字（单位：秒），不可缺省",
        });
    }
    // 设置定时任务：tth 秒后触发控制台指令 exit
    // Schedule timed task: trigger console command exit after tth seconds
    const main = req.app?.locals?.main;
    const tick_rate = main?.time?.TICK_RATE ?? 5;
    const delay_ticks = Math.ceil(tth * tick_rate);
    main?.registerTimedEvent(
        "halt",
        () => {
            Log.info("停机定时任务到期，触发控制台指令 exit");
            Log.onCommand("exit");
        },
        delay_ticks
    );
    return res.json({
        code: 0,
        data: { message: "停机定时任务已设置", haltAfterSeconds: tth },
    });
});

module.exports = router;
