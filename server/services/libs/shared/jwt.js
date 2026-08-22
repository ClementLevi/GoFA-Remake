/**
 * @module jwt
 * @description JWT 签发与校验（对齐设计决策A：JWT Bearer Token）。
 *  密钥从 Main 配置 JWT_SECRET 读取（经 AppContext）。
 * JWT sign/verify (design decision A); secret from Main config JWT_SECRET via AppContext.
 */

const jwt = require("jsonwebtoken");
const path = require("node:path");
const AppContext = require(path.resolve(__dirname, "./AppContext"));

/**
 * 获取 JWT 密钥  Get the JWT secret
 * @returns {string|null} 密钥；未配置返回 null  The secret, or null if not configured
 */
function getSecret() {
    return AppContext.getMain()?.config?.JWT_SECRET ?? null;
}

/**
 * 签发 JWT  Sign a JWT
 * @param {object} payload - 载荷（如 { sub, role }）  Payload
 * @param {object} [options] - 选项  Options
 * @param {string|number} [options.expiresIn] - 过期时间  Expiry
 * @returns {string|null} 令牌；未配置密钥返回 null  Token, or null if no secret
 */
function sign(payload, options = {}) {
    const secret = getSecret();
    if (!secret) {
        return null;
    }
    return jwt.sign(payload, secret, { expiresIn: options.expiresIn ?? "1h" });
}

/**
 * 校验 JWT  Verify a JWT
 * @param {string} token - 令牌  Token
 * @returns {object} 解码载荷；无效/过期抛错  Decoded payload; throws if invalid/expired
 */
function verify(token) {
    const secret = getSecret();
    if (!secret) {
        throw new Error("JWT_SECRET not configured");
    }
    return jwt.verify(token, secret);
}

module.exports = { sign, verify, getSecret };
