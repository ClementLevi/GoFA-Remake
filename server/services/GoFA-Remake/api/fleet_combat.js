/**
 * @module fleet_combat
 * @description 舰队与机群战斗域占位路由（Fleet & Squadron Combat domain placeholder routes）。
 *  覆盖四组资源：机群/航母（/fleets、/fleets/:fleetId/carriers、/carriers/:carrierId
 *  及 recompose/upgrade/name）、特混舰队（/taskforces 列表/详情/组建/解散/move/
 *  transport/dock/expedition）、战斗战报（/combat/report/:taskId）、来敌预警
 *  （/radar/alerts）。
 *  Covers four resource groups: squadron/carrier, taskforce, combat report, and radar alert.
 *
 *  类型约定（TS 级 JSDoc）：所有 handler 均为占位回显——原样回显
 *  path、method、query、params、body 五个字段（经 res.json 输出），不实现业务逻辑；
 *  统一由 PlaceholderHandler 回调类型描述（见下方 typedef），不再逐个标注。
 */

const { makeRouter } = require("./routeRegistry");

/**
 * 占位 handler 回调类型：回显请求详情，不实现业务逻辑。
 *  Placeholder handler callback: echoes request details, no business logic.
 * @callback PlaceholderHandler
 * @param {import("express").Request} req - 请求  Request
 * @param {import("express").Response} res - 响应  Response
 * @returns {void} 直接以 res.json 回显  Echoes via res.json
 */

const router = makeRouter();

// 我的机群列表
router.get("/fleets", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 查询编队航母成员
router.get("/fleets/:fleetId/carriers", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 建造航母
router.post("/fleets/:fleetId/carriers", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 拆除航母
router.delete("/carriers/:carrierId", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 重组机群
router.post("/carriers/:carrierId/recompose", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 升级航母
router.post("/carriers/:carrierId/upgrade", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 航母重命名
router.patch("/carriers/:carrierId/name", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 我的特混舰队列表
router.get("/taskforces", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 特混舰队详情
router.get("/taskforces/:taskforceId", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 组建特混舰队
router.post("/taskforces", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 解散特混舰队
router.post("/taskforces/:taskforceId/disband", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 舰队移动
router.post("/taskforces/:taskforceId/move", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 舰队运输
router.post("/taskforces/:taskforceId/transport", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 深空抛锚
router.post("/taskforces/:taskforceId/dock", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 舰队远征
router.post("/taskforces/:taskforceId/expedition", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 战报轮询
router.get("/combat/report/:taskId", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 来敌预警轮询
router.get("/radar/alerts", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

module.exports = router;
