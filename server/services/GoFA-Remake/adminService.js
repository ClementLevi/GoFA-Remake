/**
 * @module adminService
 * @description 管理员鉴权服务：管理员权限写入数据库，由数据库查询判定。
 *  JWT 仅承载身份（sub），管理员资格以 player_role.role_privilege 为准。
 * Admin authorization service: admin permission is stored in the database.
 * JWT carries only identity (sub); admin eligibility is decided by DB lookup.
 */

const path = require("node:path");
const AppContext = require(path.resolve(__dirname, "../libs/shared/AppContext"));

/**
 * 查询玩家是否为管理员  Query whether a player is an admin
 * @param {string} playerId - 玩家/角色 ID  Player/role ID
 * @returns {Promise<boolean>} 是否管理员  Whether admin
 */
async function isAdmin(playerId) {
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

module.exports = { isAdmin };
