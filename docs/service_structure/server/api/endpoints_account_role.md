# 玩家与角色 资源域 REST API 占位清单

领域范围：玩家账户（注册/登录/登出/改密/改邮箱）、玩家角色（创建/选择/删除/改名/升级技能）、角色持有物品（使用/购买/查询）、氪金记录、星门选择。

| 方法 | 路径 | 名称 | 鉴权 | 用途 | 对应事件/表 |
|------|------|------|------|------|-------------|
| POST | /api/v1/auth/register | 玩家注册 | noauth | 注册玩家账户 | PLAYER_REGISTER / player_account |
| POST | /api/v1/auth/login | 玩家登录 | noauth | 登录并颁发 JWT | PLAYER_LOGIN / player_account |
| POST | /api/v1/auth/refresh | 刷新令牌 | noauth | 刷新访问令牌 | player_account |
| POST | /api/v1/auth/logout | 玩家登出 | noauth | 登出、令牌失效 | PLAYER_LOGOUT / player_account |
| POST | /api/v1/account/password | 修改密码 | bearer | 修改登录密码 | PLAYER_CHANGE_PASSWORD / player_account(PwMD5) |
| POST | /api/v1/account/email | 修改邮箱 | bearer | 修改登录邮箱 | PLAYER_CHANGE_EMAIL / player_account(LoginAcct) |
| GET | /api/v1/roles | 我的角色列表 | bearer | 查询当前玩家角色（offset+limit） | relation_player_roles / player_role |
| POST | /api/v1/roles | 创建角色 | bearer | 创建角色 | PLAYER_CREATE_ROLE / player_role / relation_player_roles |
| GET | /api/v1/roles/{roleId} | 角色详情 | bearer | 查询单个角色 | player_role |
| POST | /api/v1/roles/{roleId}/select | 选择使用角色 | bearer | 选择当前使用角色 | PLAYER_USE_ROLE / relation_player_roles / player_role(last_login) |
| DELETE | /api/v1/roles/{roleId} | 删除角色 | bearer | 删除角色 | PLAYER_DELETE_ROLE / player_role / relation_player_roles |
| PATCH | /api/v1/roles/{roleId}/name | 修改角色名称 | bearer | 修改角色名称 | ROLE_CHANGE_NAME / player_role(NAME)，S2C _COMPLETE/_FAILED |
| POST | /api/v1/roles/{roleId}/skill | 升级技能 | bearer | 使用技能点升级技能 | ROLE_UPGRADE_SKILL / player_role(skill)，S2C _COMPLETE/_FAILED |
| POST | /api/v1/roles/{roleId}/items/use | 使用道具 | bearer | 使用角色持有道具 | ROLE_USE_ITEM / player_role_item，S2C _COMPLETE/_FAILED |
| POST | /api/v1/roles/{roleId}/items/purchase | 购买道具 | bearer | 购买道具 | ROLE_PURCHASE_ITEM / player_role_item / player_purchases，S2C _COMPLETE/_FAILED |
| GET | /api/v1/roles/{roleId}/items | 角色物品列表 | bearer | 查询角色持有物品（offset+limit） | player_role_item |
| GET | /api/v1/roles/{roleId}/purchases | 角色氪金记录 | bearer | 查询角色氪金记录（offset+limit） | player_purchases |
| POST | /api/v1/roles/{roleId}/gate | 选择星门 | bearer | 玩家新选择星门 | PLAYER_NEW_GATE / player_role |

已写入 Apifox AI 分支（ai/20260822-from-main-api-skeleton），共 18 个占位接口。
