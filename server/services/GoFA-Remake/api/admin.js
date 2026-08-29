/**
 * @module admin
 * @description 管理与监控域路由（Admin & Monitoring domain routes）。
 *  混合占位与真实端点：
 *   - 占位回显：GET /admin/logs、GET /admin/integrity-failures、POST /admin/integrity-challenge、
 *     POST /admin/players/:playerId/disconnect、POST /admin/players/:playerId/reroute、POST /admin/deploy；
 *   - 公开真实端点：GET /ping（心跳）、GET /health（健康检查）；
 *   - 管理员真实端点：GET /admin/status、GET /admin/metrics、GET /admin/event-queue、
 *     GET /admin/components、GET /admin/players/online、POST /admin/command（远程控制台桥 →
 *     Main.executeCommandAsync）、POST /admin/halt（定时停机，经事件总线触发 SERVER_SHUTDOWN → exit）。
 *  鉴权（isAdminAuthorized）：口令兜底（data.power === "卧室牢大"），或 JWT 身份 +
 *  数据库管理员资格（adminService.isAdmin(payload.sub)）。
 *
 *  类型约定（TS 级 JSDoc）：AdminRequest/AdminResponse 简写 Express 类型；AdminRequestBody
 *  描述统一壳 { data } 载荷；AdminMain 复用 libs/types/main_types.js 的 IMainLike 投影类型。
 */

// ─────────────────── 类型体操：领域类型定义 ───────────────────

/**
 * Express 请求简写  Express request alias
 * @typedef {import("express").Request} AdminRequest
 */

/**
 * Express 响应简写  Express response alias
 * @typedef {import("express").Response} AdminResponse
 */

/**
 * 管理 API 统一请求体（决策A：{ data } 壳内按端点携带不同载荷）
 *  Admin API unified request body (design decision A: per-endpoint payload inside { data })
 * @typedef {object} AdminRequestBody
 * @property {object} [data] - 数据壳  Data shell
 * @property {string} [data.command] - POST /admin/command：指令名  Command name
 * @property {string[]} [data.args] - POST /admin/command：参数数组  Arguments
 * @property {string} [data.power] - 口令兜底（任务要求）  Passphrase fallback
 * @property {number} [data.tth] - POST /admin/halt：停机秒数  Seconds until halt
 */

/**
 * 远程控制台成功响应形状  Remote console success response shape
 * @typedef {object} AdminCommandResponse
 * @property {0} code - 业务码：成功  Success code
 * @property {object} data - 数据  Data
 * @property {string} data.command - 指令名  Command name
 * @property {string[]} data.output - 收集的输出行  Collected output
 */

/**
 * Main 实例投影类型（权威：libs/types/main_types.js 的 IMainLike；其 time 已是含
 *  LAG_WARN_THRESHOLD 的 IMainTime，无需再交叉覆盖）
 *  Main instance projection (authority: IMainLike in libs/types/main_types.js;
 *  its time is already IMainTime including LAG_WARN_THRESHOLD)
 * @typedef {import("../../libs/types/main_types").IMainLike} AdminMain
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
 * @param {AdminRequest} req - 请求  Request
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
 * @param {AdminResponse} res - 响应  Response
 * @returns {AdminResponse}
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
 * @returns {AdminMain|null} Main 实例或 null  The Main instance, or null
 */
function getMain() {
    return AppContext.getMain();
}

/**
 * 心跳（公开）  Heartbeat (public)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {AdminResponse} JSON 响应  JSON response
 */
router.get("/ping", (req, res) => {
    const main = getMain();
    return success(res, {
        serverTime: Date.now(),
        tick: main?.time?.TICK ?? -1,
    });
});

/**
 * 健康检查（公开）  Health check (public)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {Promise<AdminResponse>} JSON 响应  JSON response
 */
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

/**
 * 运行状态（管理员）  Runtime status (admin)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {Promise<AdminResponse>} JSON 响应  JSON response
 */
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

/**
 * 运行指标（管理员）  Runtime metrics (admin)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {Promise<AdminResponse>} JSON 响应  JSON response
 */
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

/**
 * 组件在线状态（管理员）  Component status (admin)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {Promise<AdminResponse>} JSON 响应  JSON response
 */
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

/**
 * 在线玩家（管理员）：当前返回 HTTP 连接数 + 在线列表（连接层未落地，列表留空）
 *  Online players (admin): HTTP connection count + online list (connection layer pending, list empty)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {Promise<AdminResponse>} JSON 响应  JSON response
 */
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

/**
 * 事件队列状态（管理员）  Event queue status (admin)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {Promise<AdminResponse>} JSON 响应  JSON response
 */
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

/**
 * 日志与审计（占位回显）  Logs & audit (placeholder echo)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {void} 直接以 res.json 回显  Echoes via res.json
 */
router.get("/admin/logs", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

/**
 * 完整性校验失败记录（占位回显）  Integrity failure records (placeholder echo)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {void} 直接以 res.json 回显  Echoes via res.json
 */
router.get("/admin/integrity-failures", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

/**
 * 执行控制台指令（远程控制台桥，管理员）  Execute a console command (remote console bridge, admin)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {Promise<AdminResponse>} JSON 响应  JSON response
 */
router.post("/admin/command", async (req, res) => {
    if (!(await isAdminAuthorized(req))) return deny(res);
    /** @type {AdminRequestBody} */
    const body = req.body ?? {};
    const { command, args } = body.data ?? {};
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

/**
 * 发起客户端完整性校验（占位回显）  Client integrity challenge (placeholder echo)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {void} 直接以 res.json 回显  Echoes via res.json
 */
router.post("/admin/integrity-challenge", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

/**
 * 断开玩家连接（占位回显，待连接层落地）  Disconnect player (placeholder echo)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {void} 直接以 res.json 回显  Echoes via res.json
 */
router.post("/admin/players/:playerId/disconnect", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

/**
 * 重定向玩家（占位回显）  Reroute player (placeholder echo)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {void} 直接以 res.json 回显  Echoes via res.json
 */
router.post("/admin/players/:playerId/reroute", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

/**
 * 部署初始化（占位回显）  Deployment initiate (placeholder echo)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {void} 直接以 res.json 回显  Echoes via res.json
 */
router.post("/admin/deploy", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

/**
 * 定时停机（真实业务逻辑示例）  Scheduled shutdown (real business logic example)
 * @param {AdminRequest} req - 请求  Request
 * @param {AdminResponse} res - 响应  Response
 * @returns {Promise<AdminResponse>} JSON 响应  JSON response
 */
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
