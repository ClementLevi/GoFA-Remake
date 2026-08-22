/**
 * @module response
 * @description 统一响应壳（对齐设计决策A）与业务错误码枚举。
 *  成功：{ code: 0, data }；错误：{ code, message, detail }。
 * Unified response shell (design decision A) and business error codes.
 * Success: { code: 0, data }; error: { code, message, detail }.
 */

/**
 * 业务错误码（10xxx~90xxx 分段）  Business error codes (10xxx~90xxx segments)
 * @readonly
 * @enum {number}
 */
const ENUM_ERROR_CODE = Object.freeze({
    SUCCESS: 0,
    // 10xxx 通用 / 参数  Common / parameter
    INVALID_PARAM: 10001,
    // 20xxx 认证 / 授权  Authentication / authorization
    UNAUTHORIZED: 20001,
    FORBIDDEN: 20002,
    // 40xxx 资源 / 路由  Resource / routing
    NOT_FOUND: 40401,
    METHOD_NOT_ALLOWED: 40501,
    // 90xxx 系统 / 内部  System / internal
    INTERNAL_ERROR: 90001,
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
