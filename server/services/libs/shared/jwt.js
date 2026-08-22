/**
 * @module jwt
 * @description JWT 签发与校验（对齐设计决策A：JWT Bearer Token）。
 *  密钥为运行时注入（Auth Server 加载后经 AppContext.setJwtSecret 提供），非静态配置。
 * JWT sign/verify (design decision A); secret is injected at runtime by the Auth Server.
 */

const jwt = require("jsonwebtoken");
const path = require("node:path");
const AppContext = require(path.resolve(__dirname, "./AppContext"));

/**
 * 获取 JWT 密钥（运行时由 Auth Server 注入，非静态配置）  Get the JWT secret (runtime, injected by Auth Server)
 * @returns {string|null} 密钥；未注入返回 null  The secret, or null if not injected
 */
function getSecret() {
    return AppContext.getJwtSecret();
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
        throw new Error("JWT secret not injected");
    }
    return jwt.verify(token, secret);
}

module.exports = { sign, verify, getSecret };
