/**
 * @module adminService
 * @description 管理员鉴权服务：管理员权限写入数据库，由数据库查询判定。
 *  JWT 仅承载身份（sub），管理员资格以 player_role 表的 role_privilege 字段为准
 *  （小写化后等于 'admin' 视为管理员）。
 * Admin authorization service: admin permission is stored in the database.
 * JWT carries only identity (sub); admin eligibility is decided by DB lookup
 * on player_role.role_privilege (normalized to lowercase and compared with 'admin').
 *
 * 类型约定（TS 级 JSDoc）：导出形状用 AdminService 描述；管理员资格查询签名用
 *  callback IsAdminFn 定义；数据库实例用 DbLike 投影（仅取 execute）；查询行用 PlayerRoleRow。
 */

const path = require("node:path");
const AppContext = require(path.resolve(__dirname, "../libs/shared/AppContext"));

/**
 * player_role 表查询行（按需投影）  player_role row projection
 * @typedef {object} PlayerRoleRow
 * @property {unknown} [role_privilege] - 角色权限标记（'admin' 表示管理员）  Role privilege marker
 */

/**
 * 数据库实例按需投影（仅取 adminService 需要的 execute 形状）  DB instance projection
 * @typedef {object} DbLike
 * @property {(sql: string, params: unknown[], cb: (err: Error|null, rows?: PlayerRoleRow[]) => void) => void} execute -
 *   执行 SQL（回调风格）  Run SQL (callback style)
 */

/**
 * 管理员资格查询函数签名  Admin eligibility query signature
 * @callback IsAdminFn
 * @param {string} playerId - 玩家/角色 ID  Player/role ID
 * @returns {Promise<boolean>} 是否管理员  Whether admin
 */

/**
 * 管理员鉴权服务形状  Admin service shape
 * @typedef {object} AdminService
 * @property {IsAdminFn} isAdmin - 查询玩家是否为管理员  Query whether a player is an admin
 */

/**
 * 查询玩家是否为管理员（以 player_role.role_privilege 判定）  Query whether a player is an admin
 * @param {string} playerId - 玩家/角色 ID  Player/role ID
 * @returns {Promise<boolean>} 是否管理员  Whether admin
 */
async function isAdmin(playerId) {
    /** @type {DbLike|null|undefined} */
    const db = AppContext.getMain()?.db;
    if (!db || typeof db.execute !== "function") {
        return false;
    }
    return new Promise((resolve) => {
        db.execute(
            "SELECT role_privilege FROM player_role WHERE role_ID = ?",
            [playerId],
            (err, rows) => {
                if (err || !rows || rows.length === 0) {
                    return resolve(false);
                }
                // role_privilege 字段语义待与 DB 设计对齐（以 admin 标记判定）
                // Field semantics to be aligned with DB design (judged by 'admin' marker)
                resolve(
                    String(rows[0].role_privilege ?? "").toLowerCase() === "admin"
                );
            }
        );
    });
}

/** @type {AdminService} */
module.exports = { isAdmin };
