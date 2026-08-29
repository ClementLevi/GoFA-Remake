/**
 * @module authMiddleware
 * @description JWT 认证中间件：提取 Bearer token、校验、管理员鉴权。
 *  JWT auth middleware: extract the bearer token, verify it, and authorize admins.
 *  管理员资格以数据库 player_role.role_privilege 为准（经 adminService.isAdmin 查询）。
 *
 * 类型约定（TS 级 JSDoc）：Express 中间件签名用 callback AuthMiddleware 定义；
 *  解码载荷复用 jwt 模块的 JwtPayload；错误响应走 response 模块的统一响应壳。
 */

const path = require("node:path");
const { verify } = require(path.resolve(__dirname, "./jwt"));
const { ENUM_ERROR_CODE, fail } = require(path.resolve(__dirname, "./response"));
const adminService = require(path.resolve(
    __dirname,
    "../../GoFA-Remake/adminService"
));

/**
 * Express 认证中间件签名（标准中间件三元组）  Express middleware signature
 * @callback AuthMiddleware
 * @param {import("express").Request} req - 请求  Request
 * @param {import("express").Response} res - 响应  Response
 * @param {import("express").NextFunction} next - 下一个中间件  Next middleware
 * @returns {void|Promise<void>} 可同步或异步完成  Sync or async completion
 */

/**
 * 提取 Bearer token  Extract the bearer token
 * @param {import("express").Request} req - 请求  Request
 * @returns {string|null} token；无 Authorization 头或非 Bearer 前缀时返回 null  Token, or null
 */
function extractBearer(req) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return null;
    }
    return header.slice(7).trim();
}

/**
 * 校验 JWT 并返回解码载荷；无效/过期/无 token 时静默返回 null  Verify JWT → payload or null
 * @param {import("express").Request} req - 请求  Request
 * @returns {import("./jwt").JwtPayload|null} 解码载荷；校验失败为 null  Decoded payload, or null
 */
function verifyJwt(req) {
    const token = extractBearer(req);
    if (!token) {
        return null;
    }
    try {
        return verify(token);
    } catch {
        return null;
    }
}

/**
 * 已认证请求（在 Express Request 上挂载 user 载荷）  Authenticated request (attaches user payload)
 * @typedef {import("express").Request & {user?: import("./jwt").JwtPayload}} AuthenticatedRequest
 */

/**
 * 管理员鉴权中间件（async）：先验 JWT，再查数据库管理员资格，
 * 通过后挂载 req.user 并放行；失败直接写错误响应。  Admin authorization middleware
 * @param {AuthenticatedRequest} req - 请求  Request
 * @param {import("express").Response} res - 响应  Response
 * @param {import("express").NextFunction} next - 下一个中间件  Next middleware
 * @returns {Promise<void|import("express").Response>} 放行返回 void；鉴权失败返回响应对象
 */
async function requireAdmin(req, res, next) {
    const payload = verifyJwt(req);
    if (!payload) {
        return fail(
            res,
            ENUM_ERROR_CODE.UNAUTHORIZED,
            "未认证",
            "需要有效的 Bearer token",
            401
        );
    }
    const is_admin = await adminService.isAdmin(payload.sub);
    if (!is_admin) {
        return fail(
            res,
            ENUM_ERROR_CODE.FORBIDDEN,
            "无管理员权限",
            "需要数据库中的管理员资格",
            403
        );
    }
    req.user = payload;
    next();
}

module.exports = { extractBearer, verifyJwt, requireAdmin };
