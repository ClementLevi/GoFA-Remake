/**
 * @module authMiddleware
 * @description JWT 认证中间件：提取 Bearer token、校验、管理员鉴权。
 * JWT auth middleware: extract bearer token, verify, admin authorization.
 */

const path = require("node:path");
const { verify } = require(path.resolve(__dirname, "./jwt"));
const { ENUM_ERROR_CODE, fail } = require(path.resolve(__dirname, "./response"));

/**
 * 提取 Bearer token  Extract the bearer token
 * @param {import("express").Request} req - 请求  Request
 * @returns {string|null} token 或 null
 */
function extractBearer(req) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return null;
    }
    return header.slice(7).trim();
}

/**
 * 校验 JWT，返回载荷或 null  Verify JWT, return payload or null
 * @param {import("express").Request} req - 请求  Request
 * @returns {object|null} 解码载荷  Decoded payload
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
 * 管理员鉴权中间件  Admin authorization middleware
 * @param {import("express").Request} req - 请求
 * @param {import("express").Response} res - 响应
 * @param {import("express").NextFunction} next - 下一个中间件
 */
function requireAdmin(req, res, next) {
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
    if (payload.role !== "admin") {
        return fail(
            res,
            ENUM_ERROR_CODE.FORBIDDEN,
            "无管理员权限",
            "需要管理员角色",
            403
        );
    }
    req.user = payload;
    next();
}

module.exports = { extractBearer, verifyJwt, requireAdmin };
