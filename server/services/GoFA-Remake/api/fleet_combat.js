/**
 * @module fleet_combat
 * @description 舰队与机群战斗域占位路由（Fleet & Squadron Combat domain placeholder routes）
 *  仅回显请求详情，不实现业务逻辑（placeholder only, echoes request details）。
 */

const { makeRouter } = require("./routeRegistry");

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
