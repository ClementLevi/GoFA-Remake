# 需求索引

> 本目录是 **req_docs 分支**上经审定的**当前阶段权威需求**。

## 状态标签（每份文档头部应标注其一）

| 标签 | 含义 | 可提交 |
|---|---|---|
| `[REF]` | 参考文档（旧稿 / 其他分支产物 / 代码旁证），不参与审定 | 是（只读引用） |
| `[WIP]` | 草稿，未经审定 | 否 |
| `[REVIEW]` | 提交审阅的草稿，等待批注/修订 | 否 |
| `[REVIEWED]` | 已复阅，需按审定意见精简/修订，待复审 | 否 |
| `[APPROVED]` | 审定版本 | 是 |

## 目录结构与命名规范简述

```
docs/use_cases/         详细用例图（宏观→微观逻辑层级设计与命名）
  UC00_overview.pu   L0 系统宏观用例图
  UC01_account.pu            L1 账号与角色域（含 L2 微观示例）
  ... 每域一个文件，域内层级用 newpage 分页
docs/gameplay/          玩法类流程图 + 时序图（按用例板块分文件夹）
  <board>/FLOW_<name>.pu    流程图（activity）
  <board>/SEQ_<name>.pu     时序图（sequence）
docs/framework/         框架性业务逻辑流程图 + 时序图（按用例板块分文件夹）
  <board>/FLOW_<name>.pu
  <board>/SEQ_<name>.pu
```

图类型前缀沿用仓库既有惯例：`UC_` 用例图、`FLOW_` 流程图、`SEQ_` 时序图、`CLS_` 类图、`COM_` 组件图、`STATE_` 状态图。
分页：同一逻辑单元内容超过一页可读上限时，用 `newpage` 分页；**一页只放一张图**。

## 域划分（参照 [ENUMGoFAGameEvents.js](server/services/GoFA-Remake/event_manager/ENUMGoFAGameEvents.js) 分组）

| 域编号 | 域 | 客户端→服务端事件 | 服务端内部事件 |
|---|---|---|---|
| UC-0x | 生命周期 / 部署 / 完整性（框架） | CLIENT_CONNECTED/REROUTED/ANSWER_INTEGRITY_CHALLENGE/HEARTBEAT/LOAD_MAP | SERVER_READY/SHUTDOWN/COMPONENT_ONLINE/OFFLINE/COMMAND/INTEGRITY_FAILED/DEPLOYMENT_INITIATE/DEPLOYED/CREATE_CLIENT_INTEGRITY_CHALLENGE/FOUND_CLIENT_FAILING_CHALLENGE/DISCONNECT_CLIENT/REROUTE_CLIENT |
| UC-1x | 账号与角色 | PLAYER_REGISTER/LOGIN/LOGOUT/CHANGE_PASSWORD/CHANGE_EMAIL/CREATE_ROLE/USE_ROLE/DELETE_ROLE/NEW_GATE；ROLE_CHANGE_NAME/UPGRADE_SKILL/USE_ITEM/PURCHASE_ITEM | ROLE_CHANGE_NAME/UPGRADE_SKILL/USE_ITEM/PURCHASE_ITEM 的 _COMPLETE/_FAILED |
| UC-2x | 星球 | PLANET_ABANDON/INSPECT/SPY/PIN_SET/PIN_OFF/REWARD_SET | PLANET_TRANSFER/BECOMES_GATE/RESOURCE_UPDATE/INCOMING_DETECTED/INCOMING_RELIEVED |
| UC-3x | 地表建筑 | BUILDING_BUILD/DESTROY/UPGRADE/FINISH/PRODUCTION_ENQUEUE/EQUIP/SPEED_UP_PRODUCTION/CANCEL | BUILDING_BUILT/DESTROYED/UPGRADED/FINISHED/PRODUCTION_ENQUEUED/EQUIPPED/SPEEDED_UP_PRODUCTION/CANCELLED/REJECTED |
| UC-4x | 机群（航母） | FLEET_CREATE/DESTROY/RECOMPOSE/UPGRADE/RENAME | FLEET_CREATED/DESTROYED/RECOMPOSED/RECOMPOSE_FAILED/RENAMED/RENAME_FAILED |
| UC-5x | 舰队（TaskForce） | TASKFORCE_ENTITLE/DISBAND/MOVE/TRANSPORT/DOCK_IN_VOID/EXPEDITION | TASKFORCE_DEPARTED/ARRIVE/MISSING/COMBAT/COMBAT_PREP/INTERCEPT_TRIGGER/DOCKED/DOCKED_DEPLETED |
| UC-6x | 联盟 | ALLIANCE_CREATE/DISBAND/CHANGE_INTRO/CHANGE_AVATAR；REQUEST/ACCEPT/REJECT_NAP、DECLARE_WAR、REQUEST/ACCEPT_NEUTRAL；INVITE/ACCEPT/REJECT_INVITE、LEAVE、APPLY、APPOINTMENT、KICK；EXILE_LEADER、LEADER_VOTE、EXILE_PACIFY；POST_INITIATE/DELETE/PIN/UNPIN；CREATE/JOIN/LEAVE_TEAM | ALLIANCE_CREATE_CONFIRM/CREATE_FAILED/LOG/DISBANDED/RELATION_CHANGED |
| UC-7x | 邮件 | MAIL_TO/DELETE/READ/REPLY/CLAIM | MAIL_ALREADY_READ/BATTLE_REPORT/SPY_REPORT/ESPIONAGE_ALERT |
| UC-8x | 侦察 | SPY_INCOMING_COUNTER/PLANET_ESPIONAGE/BOUNTY_DISCOVER | （结算入 MAIL_* 与 PLANET_*） |
| UC-9x | 聊天 | CHAT_MSG（PUBLIC/ALLIANCE/TEAM） | — |

> 战斗结算（TASKFORCE_COMBAT → MAIL_BATTLE_REPORT / PLANET_TRANSFER）为跨域用例，归 UC-5x 舰队域主文档，星球队与邮件队各自引用。

## 用例状态总表（随审定进度更新）

| 文件 | 内容 | 状态 | 审定日期 |
|---|---|---|---|
| `UC00_overview.pu` | L0 系统宏观用例图 | `[REVIEWED]` 需精简：总览层仅保留域级用例，细节下沉各域文件 | — |
| `UC01_account.pu` | L1 账号与角色域用例图 | `[APPROVED]` | 2026-08-30 |
| `UC02_planet.pu` | L1 星图与星球域用例图 | `[APPROVED]` | 2026-08-30 |
| `UC03_building.pu` | L1 地表建筑域用例图 | `[APPROVED]` | 2026-08-30 |
| `UC04_fleet.pu` | L1 机群(航母)域用例图 | `[WIP]` | — |
| `UC05_taskforce.pu` | L1 舰队(TaskForce)域用例图（含战斗结算） | `[WIP]` | — |
| （待创建） | ... | `[ ]` | — |

## 审定流程约定

1. AI协助生成初稿：每批创建 2-5 个文件，头部标 `[WIP]`；
2. 开发者审定：根据草稿，以直接修改方式，给出修订意见，执行 `git commit` 到 `req_docs` 分支，文件头部状态改为 `[APPROVED]`；
3. AI复阅需求：通过 `git log` 监控分支提交，理解开发者修订与草稿之间的偏差，以便在后续批次中对齐意图和风格等。
