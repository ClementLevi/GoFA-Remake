/**
 * @module account_role
 * @description 玩家与角色域占位路由（Player & Role domain placeholder routes）。
 *  覆盖三组资源：认证（/auth/register、/auth/login、/auth/refresh、/auth/logout）、
 *  账号（/account/password、/account/email）、角色（/roles 列表/创建/详情/选择/
 *  删除/改名/技能/道具/氪金/星门）。
 *  Covers three resource groups: auth, account, and role.
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

// 玩家注册
router.post("/auth/register", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 玩家登录
router.post("/auth/login", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 刷新令牌
router.post("/auth/refresh", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 玩家登出
router.post("/auth/logout", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 修改密码
router.post("/account/password", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 修改邮箱
router.post("/account/email", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 我的角色列表
router.get("/roles", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 创建角色
router.post("/roles", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 角色详情
router.get("/roles/:roleId", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 选择使用角色
router.post("/roles/:roleId/select", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 删除角色
router.delete("/roles/:roleId", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 修改角色名称
router.patch("/roles/:roleId/name", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 升级技能
router.post("/roles/:roleId/skill", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 使用道具
router.post("/roles/:roleId/items/use", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 购买道具
router.post("/roles/:roleId/items/purchase", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 角色物品列表
router.get("/roles/:roleId/items", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 角色氪金记录
router.get("/roles/:roleId/purchases", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

// 选择星门
router.post("/roles/:roleId/gate", (req, res) => {
    res.json({
        path: req.baseUrl + req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body ?? null,
    });
});

module.exports = router;
