/**
 * @module response
 * @description 统一响应壳（对齐设计决策A）与业务错误码枚举。
 *  成功：{ code: 0, data }；错误：{ code, message, detail }。
 * Unified response shell (design decision A) and business error codes.
 * Success: { code: 0, data }; error: { code, message, detail }.
 *
 * 类型约定（TS 级 JSDoc）：错误码枚举用 enum 标注（只读冻结、每个成员带注释）；
 *  成功/失败响应壳分别用 SuccessResponse / ErrorResponse 描述。
 */

/**
 * 成功响应壳  Success response shell
 * @typedef {object} SuccessResponse
 * @property {number} code - 业务码（成功恒为 0）  Business code (always 0)
 * @property {*} [data] - 数据  Data payload
 */

/**
 * 错误响应壳  Error response shell
 * @typedef {object} ErrorResponse
 * @property {number} code - 业务错误码  Business error code
 * @property {string} message - 错误信息  Message
 * @property {string} [detail] - 详细说明  Detail
 */

/**
 * 业务错误码（10xxx~90xxx 分段）  Business error codes (10xxx~90xxx segments)
 * 分段方案见 docs/service_structure/design_decisions.md §2.1.1。
 * @readonly
 * @enum {number}
 */
const ENUM_ERROR_CODE = Object.freeze({
    /** 成功  Success */
    SUCCESS: 0,
    // 10xxx 通用 / 参数  Common / parameter
    /** 参数非法  Invalid parameter */
    INVALID_PARAM: 10001,
    /** JSON 非法  Invalid JSON */
    INVALID_JSON: 10002,
    /** 缺少必填字段  Missing required field */
    MISSING_REQUIRED_FIELD: 10003,
    /** 取值越界  Value out of range */
    VALUE_OUT_OF_RANGE: 10004,
    /** 触发限流  Rate limited */
    RATE_LIMITED: 10005,
    // 20xxx 认证 / 授权  Authentication / authorization
    /** 未认证  Unauthorized */
    UNAUTHORIZED: 20001,
    /** 无权限  Forbidden */
    FORBIDDEN: 20002,
    /** 令牌过期  Token expired */
    TOKEN_EXPIRED: 20003,
    /** 令牌无效  Token invalid */
    TOKEN_INVALID: 20004,
    /** 账号不存在  Account not found */
    ACCOUNT_NOT_FOUND: 20005,
    /** 账号已禁用  Account disabled */
    ACCOUNT_DISABLED: 20006,
    // 30xxx 玩家 / 角色  Player / role
    /** 角色不存在  Role not found */
    ROLE_NOT_FOUND: 30001,
    /** 角色已锁定  Role locked */
    ROLE_LOCKED: 30002,
    // 40xxx 资源 / 路由  Resource / routing
    /** 资源不足  Insufficient resource */
    INSUFFICIENT_RESOURCE: 40001,
    /** 存储已满  Storage full */
    STORAGE_FULL: 40002,
    /** 资源不存在  Not found */
    NOT_FOUND: 40401,
    /** 方法不允许  Method not allowed */
    METHOD_NOT_ALLOWED: 40501,
    // 50xxx 联盟 / 社交  Alliance / social
    /** 联盟不存在  Alliance not found */
    ALLIANCE_NOT_FOUND: 50001,
    /** 联盟已满  Alliance full */
    ALLIANCE_FULL: 50002,
    /** 非联盟成员  Not an alliance member */
    NOT_ALLIANCE_MEMBER: 50003,
    /** 联盟权限不足  Alliance permission denied */
    ALLIANCE_PERMISSION_DENIED: 50004,
    // 60xxx 舰队 / 编队 / 战斗  Fleet / taskforce / combat
    /** 舰队不存在  Fleet not found */
    FLEET_NOT_FOUND: 60001,
    /** 舰队状态非法  Fleet invalid state */
    FLEET_INVALID_STATE: 60002,
    /** 航母不存在  Carrier not found */
    CARRIER_NOT_FOUND: 60003,
    /** 编队操作非法  Taskforce invalid op */
    TASKFORCE_INVALID_OP: 60004,
    // 70xxx 邮件 / 通信  Mail / communication
    /** 邮件不存在  Mail not found */
    MAIL_NOT_FOUND: 70001,
    /** 频道不存在  Channel not found */
    CHANNEL_NOT_FOUND: 70002,
    // 80xxx 星球 / 地图 / 建筑 / 科研  Planet / map / building / research
    /** 星球不存在  Planet not found */
    PLANET_NOT_FOUND: 80001,
    /** 星球不属于该玩家  Planet not owned */
    PLANET_NOT_OWNED: 80002,
    /** 建筑队列已满  Building queue full */
    BUILDING_QUEUE_FULL: 80003,
    /** 科研未解锁  Research locked */
    RESEARCH_LOCKED: 80004,
    // 90xxx 系统 / 内部  System / internal
    /** 内部错误  Internal error */
    INTERNAL_ERROR: 90001,
    /** 服务不可用  Service unavailable */
    SERVICE_UNAVAILABLE: 90002,
    /** 配置错误  Config error */
    CONFIG_ERROR: 90003,
});

/**
 * 成功响应  Success response
 * @param {import("express").Response} res - Express 响应  Response
 * @param {*} [data] - 数据  Data payload
 * @returns {import("express").Response} 原响应对象（可链式）  The response (chainable)
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
 * @param {string} [detail] - 详细说明（缺省空串）  Detail (default empty)
 * @param {number} [httpStatus] - HTTP 状态码（缺省 400）  HTTP status code (default 400)
 * @returns {import("express").Response} 原响应对象（可链式）  The response (chainable)
 */
function fail(res, code, message, detail = "", httpStatus = 400) {
    res.status(httpStatus).json({ code, message, detail });
    return res;
}

module.exports = { ENUM_ERROR_CODE, success, fail };
