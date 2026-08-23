/**
 * @module response
 * @description 统一响应壳（对齐设计决策A）与业务错误码枚举。
 *  成功：{ code: 0, data }；错误：{ code, message, detail }。
 * Unified response shell (design decision A) and business error codes.
 * Success: { code: 0, data }; error: { code, message, detail }.
 */

/**
 * 业务错误码（10xxx~90xxx 分段）  Business error codes (10xxx~90xxx segments)
 * 分段方案见 docs/service_structure/design_decisions.md §2.1.1。
 * @readonly
 * @enum {number}
 */
const ENUM_ERROR_CODE = Object.freeze({
    SUCCESS: 0,
    // 10xxx 通用 / 参数  Common / parameter
    INVALID_PARAM: 10001,
    INVALID_JSON: 10002,
    MISSING_REQUIRED_FIELD: 10003,
    VALUE_OUT_OF_RANGE: 10004,
    RATE_LIMITED: 10005,
    // 20xxx 认证 / 授权  Authentication / authorization
    UNAUTHORIZED: 20001,
    FORBIDDEN: 20002,
    TOKEN_EXPIRED: 20003,
    TOKEN_INVALID: 20004,
    ACCOUNT_NOT_FOUND: 20005,
    ACCOUNT_DISABLED: 20006,
    // 30xxx 玩家 / 角色  Player / role
    ROLE_NOT_FOUND: 30001,
    ROLE_LOCKED: 30002,
    // 40xxx 资源 / 路由  Resource / routing
    INSUFFICIENT_RESOURCE: 40001,
    STORAGE_FULL: 40002,
    NOT_FOUND: 40401,
    METHOD_NOT_ALLOWED: 40501,
    // 50xxx 联盟 / 社交  Alliance / social
    ALLIANCE_NOT_FOUND: 50001,
    ALLIANCE_FULL: 50002,
    NOT_ALLIANCE_MEMBER: 50003,
    ALLIANCE_PERMISSION_DENIED: 50004,
    // 60xxx 舰队 / 编队 / 战斗  Fleet / taskforce / combat
    FLEET_NOT_FOUND: 60001,
    FLEET_INVALID_STATE: 60002,
    CARRIER_NOT_FOUND: 60003,
    TASKFORCE_INVALID_OP: 60004,
    // 70xxx 邮件 / 通信  Mail / communication
    MAIL_NOT_FOUND: 70001,
    CHANNEL_NOT_FOUND: 70002,
    // 80xxx 星球 / 地图 / 建筑 / 科研  Planet / map / building / research
    PLANET_NOT_FOUND: 80001,
    PLANET_NOT_OWNED: 80002,
    BUILDING_QUEUE_FULL: 80003,
    RESEARCH_LOCKED: 80004,
    // 90xxx 系统 / 内部  System / internal
    INTERNAL_ERROR: 90001,
    SERVICE_UNAVAILABLE: 90002,
    CONFIG_ERROR: 90003,
});

/**
 * 成功响应  Success response
 * @param {import("express").Response} res - Express 响应  Response
 * @param {object} [data] - 数据  Data payload
 * @returns {import("express").Response}
 */
function success(res, data = {}) {
    res.json({ code: ENUM_ERROR_CODE.SUCCESS, data });
    return res;
}

/**
 * 错误响应  Error response
 * @param {import("express").Response} res - Express 响应  Response
 * @param {number} code - 业务错误码  Business error code
 * @param {string} message - 错误信息  Message
 * @param {string} [detail] - 详细说明  Detail
 * @param {number} [httpStatus] - HTTP 状态码  HTTP status code
 * @returns {import("express").Response}
 */
function fail(res, code, message, detail = "", httpStatus = 400) {
    res.status(httpStatus).json({ code, message, detail });
    return res;
}

module.exports = { ENUM_ERROR_CODE, success, fail };
