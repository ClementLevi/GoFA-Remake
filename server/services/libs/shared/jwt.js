/**
 * @module jwt
 * @description JWT 签发与校验（对齐设计决策A：JWT Bearer Token）。
 *  密钥为运行时注入（Auth Server 加载后经 AppContext.setJwtSecret 提供），非静态配置；
 *  未注入密钥时 sign 返回 null，verify 抛出异常。
 * JWT sign/verify (design decision A: JWT Bearer Token). The secret is injected
 * at runtime by the Auth Server (not static config); sign returns null and verify
 * throws when the secret is missing.
 *
 * 类型约定（TS 级 JSDoc）：载荷用 JwtPayload 描述（sub/role 等可选字段）；
 * sign 返回 string|null；verify 返回 JwtPayload，无效/过期时抛错。
 */

const jwt = require("jsonwebtoken");
const path = require("node:path");
const AppContext = require(path.resolve(__dirname, "./AppContext"));

/**
 * JWT 载荷（业务字段全部可选，仅承载身份）  JWT payload (all business fields optional)
 * @typedef {object} JwtPayload
 * @property {string} [sub] - 主体标识（玩家/角色 ID）  Subject (player/role ID)
 * @property {string} [role] - 角色名  Role name
 * @property {number} [iat] - 签发时间戳（秒）  Issued-at timestamp (seconds)
 * @property {number} [exp] - 过期时间戳（秒）  Expiry timestamp (seconds)
 */

/**
 * 获取 JWT 密钥（运行时由 Auth Server 注入，非静态配置）  Get the JWT secret
 * @returns {string|null} 密钥；未注入返回 null  The secret, or null if not injected
 */
function getSecret() {
    return AppContext.getJwtSecret();
}

/**
 * 签发 JWT  Sign a JWT
 * @param {JwtPayload} payload - 载荷（sub/role 等）  Payload
 * @param {import("jsonwebtoken").SignOptions} [options] - 签发选项（expiresIn 缺省 "1h"）  Sign options
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
 * 校验 JWT 并返回解码载荷  Verify a JWT and return the decoded payload
 * @param {string} token - 令牌  Token
 * @returns {JwtPayload} 解码载荷  Decoded payload
 * @throws {Error} 密钥未注入，或令牌无效/过期（jsonwebtoken 抛错）
 */
function verify(token) {
    const secret = getSecret();
    if (!secret) {
        throw new Error("JWT secret not injected");
    }
    // 载荷始终为对象，验证结果可直接断言为 JwtPayload
    // Payload is always an object, so assert the verify result as JwtPayload
    return /** @type {JwtPayload} */ (jwt.verify(token, secret));
}

module.exports = { sign, verify, getSecret };
