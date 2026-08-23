/**
 * @module admin
 * @description 管理与监控域路由（Admin & Monitoring domain routes）
 *  除占位回显外，含真实的管理员停机端点 POST /admin/halt（定时触发控制台指令 exit）。
 *  本轮新增真实实现（对齐 docs/service_structure/server/commands/api_bridge.md）：
 *   - GET /health、GET /admin/status、GET /admin/metrics、GET /admin/event-queue
 *   - GET /admin/components、GET /admin/players/online
 *   - POST /admin/command（远程控制台桥 → Main.executeCommandAsync）
 */
const path = require("node:path");
const { makeRouter } = require("./routeRegistry");

const Log = require(path.resolve(__dirname, "../../libs/shared/logger"));
const AppContext = require(path.resolve(
    __dirname,
    "../../libs/shared/AppContext"
));
const { ENUM_ERROR_CODE, success, fail } = require(path.resolve(
    __dirname,
    "../../libs/shared/response"
));
const { verifyJwt } = require(path.resolve(
    __dirname,
    "../../libs/shared/authMiddleware"
));
const adminService = require(path.resolve(
    __dirname,
    "../adminService"
));
const GoFAGameEvent = require(path.resolve(
    __dirname,
    "../event_manager/GoFAGameEvent"
));
const GameEvent = require(path.resolve(
    __dirname,
    "../event_manager/ENUMGoFAGameEvents"
));

const router = makeRouter();

/**
 * 校验管理员权限：口令兜底或 JWT 身份 + 数据库管理员资格。
 * Authorize admin: passphrase fallback, or JWT identity + DB admin eligibility.
 * @param {import("express").Request} req - 请求  Request
 * @returns {Promise<boolean>} 是否通过  Whether authorized
 */
async function isAdminAuthorized(req) {
    // 口令兜底（任务要求）  Passphrase fallback (required by task)
    if (req.body?.data?.power === "卧室牢大") {
        return true;
    }
    // JWT 仅承载身份（sub），管理员资格查数据库  JWT carries only identity; admin eligibility from DB
    const payload = verifyJwt(req);
    if (!payload?.sub) {
        return false;
    }
    return adminService.isAdmin(payload.sub);
}

/**
 * 鉴权失败响应  Forbidden response helper
 * @param {import("express").Response} res
 * @returns {import("express").Response}
 */
function deny(res) {
    return fail(
        res,
        ENUM_ERROR_CODE.FORBIDDEN,
        "无管理员权限",
        "需要管理员身份（数据库管理员资格）或正确的 power 口令",
        403
    );
}

/**
 * 获取 Main 实例  Get the Main singleton
 * @returns {object|null}
 */
function getMain() {
    return AppContext.getMain();
}

// 心跳（公开）  Heartbeat (public)
router.get("/ping", (req, res) => {
    const main = getMain();
    return success(res, {
        serverTime: Date.now(),
        tick: main?.time?.TICK ?? -1,
    });
});

// 健康检查（公开）  Health check (public)
router.get("/health", async (req, res) => {
    const main = getMain();
    let db = "missing";
    try {
        const ok = await main?.db?.test?.();
        db = ok ? "ok" : "error";
    } catch {
        db = "error";
    }
    return success(res, {
        db,
        eventBus: main?.event_bus ? "ok" : "missing",
        http: main?.http_server?.listening ? "ok" : "down",
        tick: main?.time?.TICK ?? -1,
        stage: main?.stage ?? "unknown",
    });
});

// 运行状态（管理员）  Runtime status (admin)
router.get("/admin/status", async (req, res) => {
    if (!(await isAdminAuthorized(req))) return deny(res);
    const main = getMain();
    const start = main?.time?.startTime ?? 0;
    return success(res, {
        stage: main?.stage ?? "unknown",
        version: GameEvent.version,
        tick: main?.time?.TICK ?? -1,
        tickRate: main?.time?.TICK_RATE ?? -1,
        startTime: start,
        uptimeSeconds: start
            ? Math.max(0, Math.floor((Date.now() - start) / 1000))
            : -1,
        gamelife: main?.GAME_LIFE ?? -1,
        serverName: main?.config?.SERVER_NAME ?? null,
        serverPort: main?.config?.SERVER_PORT ?? null,
        isTestServer: main?.config?.IS_TEST_SERVER ?? null,
    });
});

// 运行指标（管理员）  Runtime metrics (admin)
router.get("/admin/metrics", async (req, res) => {
    if (!(await isAdminAuthorized(req))) return deny(res);
    const main = getMain();
    const t = main?.time;
    const rate = t?.TICK_RATE ?? -1;
    const elapses = Array.from(t?.recentTicksElapses ?? []);
    const avg =
        elapses.length > 0
            ? elapses.reduce((a, b) => a + b, 0) / elapses.length
            : -1;
    const [lag, lagAvg] =
        typeof main?.detectLag === "function" ? main.detectLag() : [false, -1];
    return success(res, {
        tickRate: rate,
        tickIntervalMs: rate > 0 ? 1000 / rate : -1,
        lastTickElapseMs: t?.last_tick_elapse ?? -1,
        recentTicksElapses: elapses,
        averageElapseMs: Number(avg.toFixed(2)),
        lagWarnThresholdMs: t?.LAG_WARN_THRESHOLD ?? -1,
        lag,
        averageLagElapseMs: lagAvg,
    });
});

// 组件在线状态（管理员）  Component status (admin)
router.get("/admin/components", async (req, res) => {
    if (!(await isAdminAuthorized(req))) return deny(res);
    const main = getMain();
    const registry = main?.component_registry;
    return success(res, {
        components: registry?.list() ?? [],
        onlineCount: registry?.count("online") ?? 0,
        offlineCount: registry?.count("offline") ?? 0,
        unknownCount: registry?.count("unknown") ?? 0,
    });
});

// 在线玩家（管理员）：当前返回 HTTP 连接数 + 在线列表（连接层未落地，列表留空）
// Online players (admin): HTTP connection count + online list (connection layer pending, list empty)
router.get("/admin/players/online", async (req, res) => {
    if (!(await isAdminAuthorized(req))) return deny(res);
    const main = getMain();
    const connections = await new Promise((resolve) => {
        const server = main?.http_server;
        if (!server || typeof server.getConnections !== "function") {
            return resolve(-1);
        }
        server.getConnections((err, count) => resolve(err ? -1 : count));
    });
    return success(res, {
        connections,
        onlinePlayers: [], // 待在线连接层落地（P1，见 commands/index.md）
    });
});

// 事件队列状态（管理员）  Event queue status (admin)
router.get("/admin/event-queue", async (req, res) => {
    if (!(await isAdminAuthorized(req))) return deny(res);
    const main = getMain();
    const bus = main?.event_bus;
    const delayedCount = bus?.delayed?.size ?? 0;
    const nextDue = delayedCount > 0 ? bus.delayed.peek()?.dueTick : null;
    /** @type {Record<string, number>} */
    const topics = {};
    bus?.subscribers?.forEach((list, topic) => {
        topics[topic] = list.length;
    });
    return success(res, {
        currentTick: bus?.currentTick ?? -1,
        delayedCount,
        nextDueTick: nextDue,
        topics,
    });
});

// 日志与审计（占位）  Logs & audit (placeholder)
router.get("/admin/logs", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 完整性校验失败记录（占位）  Integrity failure records (placeholder)
router.get("/admin/integrity-failures", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 执行控制台指令（远程控制台桥，管理员）  Execute a console command (remote console bridge, admin)
router.post("/admin/command", async (req, res) => {
    if (!(await isAdminAuthorized(req))) return deny(res);
    const { command, args } = req.body?.data ?? {};
    if (typeof command !== "string" || command.length === 0) {
        return fail(
            res,
            ENUM_ERROR_CODE.INVALID_PARAM,
            "参数错误",
            "command 必须为非空字符串",
            400
        );
    }
    let argList = [];
    if (args !== undefined) {
        if (
            !Array.isArray(args) ||
            args.some((a) => typeof a !== "string")
        ) {
            return fail(
                res,
                ENUM_ERROR_CODE.INVALID_PARAM,
                "参数错误",
                "args 必须为字符串数组",
                400
            );
        }
        argList = args;
    }
    const main = getMain();
    if (!main || typeof main.executeCommandAsync !== "function") {
        return fail(
            res,
            ENUM_ERROR_CODE.INTERNAL_ERROR,
            "内部错误",
            "指令系统未就绪",
            500
        );
    }
    const { found, output } = await main.executeCommandAsync(
        command,
        ...argList
    );
    if (!found) {
        return fail(
            res,
            ENUM_ERROR_CODE.NOT_FOUND,
            "指令不存在",
            `未注册指令: ${command}`,
            404
        );
    }
    return success(res, { command, output });
});

// 发起客户端完整性校验（占位）  Client integrity challenge (placeholder)
router.post("/admin/integrity-challenge", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 断开玩家连接（占位，待连接层落地）  Disconnect player (placeholder)
router.post("/admin/players/:playerId/disconnect", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 重定向玩家（占位）  Reroute player (placeholder)
router.post("/admin/players/:playerId/reroute", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 部署初始化（占位）  Deployment initiate (placeholder)
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
router.post("/admin/halt", async (req, res) => {
    // 鉴权  Authorization
    if (!(await isAdminAuthorized(req))) {
        return deny(res);
    }
    // 参数校验：tth 必须为数字（秒），不可缺省
    // Validate tth: number (seconds), required
    const tth = req.body?.data?.tth;
    if (typeof tth !== "number" || Number.isNaN(tth) || tth < 0) {
        return fail(
            res,
            ENUM_ERROR_CODE.INVALID_PARAM,
            "参数错误",
            "tth 必须为数字（单位：秒），不可缺省",
            400
        );
    }
    // 设置定时任务：tth 秒后经事件总线触发 SERVER_SHUTDOWN → exit 命令
    // Schedule: publish delayed SERVER_SHUTDOWN via event bus, consumed to trigger exit
    const main = getMain();
    const tick_rate = main?.time?.TICK_RATE ?? 5;
    const delay_ticks = Math.ceil(tth * tick_rate);
    main?.event_bus?.publish(
        new GoFAGameEvent({
            type: GameEvent.SERVER_SHUTDOWN,
            timeElapse: { startTick: null, length: delay_ticks },
        })
    );
    return success(res, {
        message: "停机定时任务已设置",
        haltAfterSeconds: tth,
    });
});

module.exports = router;
