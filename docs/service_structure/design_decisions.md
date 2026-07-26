# GoFA-Remake 设计决策文档

> 版本: v1.0 | 日期: 2026-07-26 | 作者: 小小CL + CL
> 前置文档: `server/use_case/use_cases.pu` (用例图)、`ENUMGoFAGameEvents.js` (事件枚举)

---

## 一、核心玩法闭环设计决策

### 1.1 编队到达结算分支 (P0-①)

**设计方法**: 事件驱动 — `TASKFORCE_ARRIVE` 到达后触发分支判定

#### 殖民规则

| 条件 | 结果 | 涉及事件 |
|------|------|----------|
| 目标星球无主 + 任何有效舰队到达 | 星球立即被殖民，划归该舰队所属玩家，舰队自动停泊于该星球 | `TASKFORCE_ARRIVE_COLONIZE` (需新增) |
| 同 tick 内多支舰队到达同一无主星球 | 注册时间较早的玩家获得星球 | 同上，服务端按注册时间排序 |
| 同 tick 到达但未获得星球的其他玩家 | 按外交关系分流 | 见下表 |

**同 tick 到达的分流规则**:

| 与获得星球的玩家关系 | 舰队走向 | 涉及事件 |
|---------------------|----------|----------|
| 友好（同联盟或NAP） | 停泊于该星球 | `TASKFORCE_ARRIVE_DOCK` (需新增) |
| 中立或无联盟 | 自动返回出发星球 | `TASKFORCE_ARRIVE_RETURN` (需新增) |
| 敌对（战争状态） | 自动进入战斗预备阶段 | `TASKFORCE_ARRIVE_COMBAT_PREP` (需新增) |

#### 拦截机制

**核心机制**: 实时操作 — 玩家在舰队航行中手动抛锚，抛锚位置取决于操作时机。

- **拦截能力**: 仅编有 `carrier_TYPE=5 (gravity_interceptor)` 且该航母存活的舰队具有超空间拦截能力
- **拦截圈**: 以舰队抛锚位置为圆心，拦截能力数值为半径划定重力井拦截圈
- **触发条件**:
  1. 玩家B的舰队进入航行状态
  2. 其航线与拦截圈相割
  3. A与B不属于友好关系
  4. 舰队航行位置（按时间、速度、航线长度线性演算）到达相割弦时触发拦截
- **抛锚时机**: 舰队可在航行中任意时刻执行 `TASKFORCE_DOCK_IN_VOID`：
  - 刚离开星球1s后抛锚 → 拦截圈靠近出发星系
  - 到达前1s抛锚 → 拦截圈靠近目标星系
  - 航行一半路程时抛锚 → 拦截圈位于宙域深空
- **抛锚持续时长**: 由舰队所载气体资源数量决定。每种航母和舰载机每分钟消耗不同数量的气体资源。气体耗尽后：
  - 舰队继续前往原定目的地
  - 不再能抛锚
- **服务端验证**: 服务端维护每支舰队的精确航行位置，验证抛锚请求合法性（航行状态 + 气体资源 + 时间窗口）

**新增事件**:
```
TASKFORCE_INTERCEPT_TRIGGER: "taskforce_intercept_trigger"  // 舰队被拦截，进入战斗预备
```

#### 运输闭环

- 运输完成后，编队自动返回出发星球
- 返回到达瞬间同样触发 `TASKFORCE_ARRIVE` 事件
- 返回过程可被拦截（与正常航行相同）

#### 战斗触发条件 (P0-①④)

**两阶段制**:

| 阶段 | 时机 | 行为 | 缓存策略 |
|------|------|------|----------|
| 预备阶段 | 结算时间窗口开始前 | 所有到达星球的舰队自动计入预备阶段；玩家可增援或撤回舰队 | 缓存结果，增援/撤回使缓存失效 |
| 结算阶段 | 每小时00/15/30/45分 | 根据缓存有效性决定重算或直返战报 | 有效缓存直接返回，无效则重新计算 |

**关键规则**:
- 舰队到达敌方星球 → 自动进入战斗预备（不需要玩家主动选择）
- 友好关系到达 → 自动停泊，不触发战斗
- 预备阶段中，增援/撤回操作使缓存失效 → 结算时需重算

**新增事件**:
```
TASKFORCE_COMBAT_PREP_START:  "taskforce_combat_prep_start"    // 舰队进入战斗预备阶段
TASKFORCE_COMBAT_PREP_REINFORCE: "taskforce_combat_prep_reinforce"  // 预备阶段增援
TASKFORCE_COMBAT_PREP_RETREAT: "taskforce_combat_prep_retreat"     // 预备阶段撤回
```

---

### 1.2 战斗结果数据结构 (P0-②)

#### 战报格式

| 内容 | 服务端提供 | 客户端运算 |
|------|-----------|-----------|
| 初态总览（双方舰队构成、兵力） | ✓ | — |
| 终态总览（存活/损失/战利品） | ✓ | — |
| 每回合战斗小结 | — (参数) | ✓ (按需，以初态为参数实时运算) |
| 胜负判定 | ✓ | — |
| 战利品（可掠夺资源） | ✓ | — |

**服务端推送**:
- 结算时间到达时，推送战报总览（初态+终态+胜负+战利品）
- 回合小结仅存初态参数，客户端按需实时渲染
- 战报通过 HTTP 轮询获取（与15分钟结算周期对齐）

#### 舰队遭遇战（被拦截触发）

- 仅在被拦截时发生
- 不涉及星球所有权交割
- 可掠夺运输机上的资源：金属、气体、晶体、间谍无人机
- **不可掠夺**: 步兵
- 掠夺上限 = 获胜方有空余仓储的运输船容量，超出部分全部丢失

#### 胜负判定 — 逃逸百分比机制

- 玩家可在角色面板设定战损逃逸百分比值，对所有麾下舰队生效
- 已损失舰载机数量达到逃逸百分比 → 下一回合直接进入航母战和后续结算
- **触发逃逸 = 战败**，无论实际损失比对方少
- 双方同时触发逃逸 → 均视为战败
- **防御方**（星球所属玩家）不能触发逃逸
- **协防方**（非星球所属的友方玩家）可以按百分比触发逃逸

**新增事件**:
```
TASKFORCE_COMBAT_RESULT:   "taskforce_combat_result"      // 舰队战斗结算完成，推送战报
PLANETARY_COMBAT_RESULT:   "planetary_combat_result"       // 星球防御战结算完成
```

---

### 1.3 机群操作合法性规则 (P0-③)

| 操作 | 条件 | 约束 | S2C 响应(需新增) |
|------|------|------|-----------------|
| 创建 | 造船厂建造完成后自动触发 | 初始属性通过查数据表确定 | `FLEET_CREATE_COMPLETE` |
| 重组 | 仅停泊于玩家拥有星球上时 | 每艘航母可单独重组自身的机群和载荷 | `FLEET_RECOMPOSE_COMPLETE` / `FLEET_ACTION_FAILED` |
| 升级 | 需增幅器道具 | 不可降级、不可换色；无升级=0级，升到p级需p-1个道具；上限20级；绿道具仅拦截者航母可用 | `FLEET_UPGRADE_COMPLETE` / `FLEET_ACTION_FAILED` |
| 摧毁 | 无需时间或消耗 | 编队中的航母不允许摧毁；无资源回收 | `FLEET_DESTROY_COMPLETE` / `FLEET_ACTION_FAILED` |

**四色增幅器道具**:

| 颜色 | 效果 | 适用范围 | 每级属性增量 |
|------|------|----------|-------------|
| 红色 | 增加战机+航母伤害 | 所有航母 | 查表确定 |
| 蓝色 | 增加战机+航母防御力和生命值 | 所有航母 | 查表确定 |
| 黄色 | 增加航母超空间航行速度 | 所有航母 | 查表确定 |
| 绿色 | 增加拦截者航母重力井半径 | 仅 gravity_interceptor | 查表确定 |

**升级公式**: 从0级升到第p级，需要消耗 p-1 个同色道具（升到第20级需要19个道具）

---

## 二、全局技术决策

### 2.1 API 约定 (决策A)

**选定方案**: JWT + 统一响应壳 + camelCase

```
认证:        JWT Bearer Token（大厅登录后颁发，游戏服验证）
请求头:      Authorization: Bearer <token>

成功响应:    { "code": 0, "data": { ... } }
错误响应:    { "code": 40001, "message": "资源不足", "detail": "需要气体50，当前32" }

字段命名:    camelCase (fleetId, planetName, combatResult)
分页约定:    邮件/聊天历史 → cursor-based
             成员列表/排行榜 → offset+limit
版本管理:    URL路径 /api/v1/... 或 请求头 X-API-Version
```

**选择理由**:
1. 大厅与游戏服分离 → JWT 跨服务验证，不需要在游戏服维护 session 表
2. 统一响应壳 → 客户端解析逻辑单一，先看 code 判断成功/失败
3. camelCase → Node.js 后端 + Unity C# 前端都自然支持
4. code 字段比 HTTP 状态码更精细 → 游戏业务需细分错误（"资源不足"vs"建筑队列满"）

**JWT 流程**:
1. 玩家在大厅 `POST /auth/login` → 获得 JWT + refresh token
2. 进入游戏服时带 JWT → 游戏服验证签名 + 检查过期
3. JWT 过期 → 用 refresh token 刷新（大厅提供 `POST /auth/refresh`）

**业务错误码设计** (待细化):

| 码段 | 范围 | 含义 |
|------|------|------|
| 0 | 0 | 成功 |
| 10xxx | 10001~19999 | 账号/认证类 |
| 20xxx | 20001~29999 | 角色/道具类 |
| 30xxx | 30001~39999 | 星球/领土类 |
| 40xxx | 40001~49999 | 建筑/生产类 |
| 50xxx | 50001~59999 | 舰队/编队类 |
| 60xxx | 60001~69999 | 战斗类 |
| 70xxx | 70001~79999 | 联盟类 |
| 80xxx | 80001~89999 | 通信(聊天/邮件)类 |
| 90xxx | 90001~99999 | 侦察/科研类 |

### 2.2 S2C 推送实现 (决策B)

**选定方案**: 现阶段用 HTTP 轮询，后续升级到 SSE

**轮询策略**:

| 推送场景 | 轮询接口 | 建议间隔 | 说明 |
|----------|---------|---------|------|
| 战报推送 | `GET /api/v1/combat/report/{taskId}` | 15分钟（与结算周期对齐） | 结算后一次性获取 |
| 雷达来敌预警 | `GET /api/v1/radar/alerts` | 30秒 | 拦截发生时及时感知 |
| 邮件/战报通知 | `GET /api/v1/mail/unread` | 60秒 | 低频通知 |
| 聊天消息 | `GET /api/v1/chat/{channelId}/recent` | 2~5秒 | 频率最高 |
| 联盟事件 | `GET /api/v1/alliance/events` | 60秒 | 外交变更、成员变动 |

**后续升级路径**:
- MVP → 纯轮询
- V1 → SSE（战报/邮件/联盟事件走 SSE 推送，聊天仍可轮询）
- V2 → WebSocket（如实时性需求超出现有方案）

**心跳机制**: 无 WS 心跳 → 客户端每30秒发 `GET /api/v1/ping` 维持在线状态，服务端超过阈值标记离线

**编队航行位置**: 客户端本地模拟航行轨迹（出发时间+速度+航线长度 → 线性演算），服务端只在关键节点（出发/抛锚/被拦截/到达）通过 HTTP 同步

### 2.3 数据库选型 (决策C)

**选定方案**: 先 SQLite，DAO 层留迁移接口

- 当前代码已有 `Database + Sqlite3/NodeSqlite` 双连接器
- 所有数据库操作通过 DAO 层抽象，不直接写 SQL
- 后续迁移只需：换连接器实现 + 适配连接池/事务差异
- 设计文档中的 MySQL+Redis+MongoDB 暂搁置，等性能瓶颈出现再迁移

---

## 三、事件覆盖审计

### 3.1 核心闭环 (P1~P8)

| 板块 | C2S 状态 | S2C 状态 | Internal 状态 | 断裂点 |
|------|---------|---------|-------------|--------|
| P1 账号 | ✓ 5个 | 🔴 大厅职责 | — | 不在游戏服范围 |
| P2 角色 | ✓ 8个 | ✓ 8对 COMPLETE/FAILED | — | ✓ 闭环 |
| P3 客户端 | ✓ 5个 | ⚠️ REROUTED/LOAD_MAP | ✓ DISCONNECT | — |
| P4 星球 | ✓ 6个 | 🔴 仅 TRANSFER+BECOMES_GATE | — | 缺各请求的成功/失败响应 |
| P5 建筑 | ✓ 8个 | ⚠️ FINISHED+REJECTED | — | REJECTED笼统，缺细分 |
| P6 机群 | ✓ 4个 | 🔴 无 | — | 全缺 COMPLETE/FAILED |
| P7 编队 | ✓ 6个 | ⚠️ DEPARTED/ARRIVE/MISSING | ✓ COMBAT | ARRIVE缺分支细分 |
| P8 战斗 | — | 🔴 无 | ✓ COMBAT触发 | 缺 COMBAT_RESULT |

### 3.2 次级板块 (P9~P12)

| 板块 | C2S 状态 | S2C 状态 | Internal 状态 | 断裂点 |
|------|---------|---------|-------------|--------|
| P9 联盟 | ✓ 20+个 | 🔴 仅 CREATE 成对 | ✓ LOG | 外交/成员响应全缺 |
| P10 通信 | ✓ 6个 | 🔴 无 | ❌ | 聊天广播+邮件送达全缺 |
| P11 侦察科研 | ❌ 全空 | ❌ 全空 | ❌ 全空 | 事件枚举空白 |
| P12 运维 | ✓ 5个 | ✓ | ✓ 9个 | ✓ 基本完备 |

---

## 四、事件补完方案

### 4.1 P0 — 核心闭环阻断（必须最先补完）

#### 编队到达结算分支

```javascript
// 殖民成功 — 星球划归玩家
TASKFORCE_ARRIVE_COLONIZE:    "taskforce_arrive_colonize",
// 停泊 — 友好关系到达
TASKFORCE_ARRIVE_DOCK:        "taskforce_arrive_dock",
// 自动返回 — 中立关系/无联盟
TASKFORCE_ARRIVE_RETURN:      "taskforce_arrive_return",
// 进入战斗预备 — 敌对关系
TASKFORCE_ARRIVE_COMBAT_PREP: "taskforce_arrive_combat_prep",
// 运输完成 — 编队自动返回出发星球
TASKFORCE_ARRIVE_TRANSPORT_DONE: "taskforce_arrive_transport_done",
// 到达失败（殖民但星球已有主人等）
TASKFORCE_ARRIVE_FAILED:      "taskforce_arrive_failed",

// 拦截触发 — 舰队被重力井拦截
TASKFORCE_INTERCEPT_TRIGGER:  "taskforce_intercept_trigger",
```

#### 战斗预备 + 结算

```javascript
// 舰队进入战斗预备阶段
TASKFORCE_COMBAT_PREP_START:     "taskforce_combat_prep_start",
// 预备阶段增援
TASKFORCE_COMBAT_PREP_REINFORCE: "taskforce_combat_prep_reinforce",
// 预备阶段撤回
TASKFORCE_COMBAT_PREP_RETREAT:   "taskforce_combat_prep_retreat",

// 舰队战斗结算完成，推送战报
TASKFORCE_COMBAT_RESULT:         "taskforce_combat_result",
// 星球防御战结算完成
PLANETARY_COMBAT_RESULT:         "planetary_combat_result",
```

#### 机群操作响应

```javascript
// 创建完成
FLEET_CREATE_COMPLETE:      "fleet_create_complete",
// 摧毁完成
FLEET_DESTROY_COMPLETE:     "fleet_destroy_complete",
// 重组完成
FLEET_RECOMPOSE_COMPLETE:   "fleet_recompose_complete",
// 升级完成
FLEET_UPGRADE_COMPLETE:     "fleet_upgrade_complete",
// 操作失败（重组不合法/升级资源不足等）
FLEET_ACTION_FAILED:        "fleet_action_failed",
```

### 4.2 P1 — 核心玩法增强

#### 星球请求响应

```javascript
// 星球放弃成功
PLANET_ABANDON_COMPLETE:    "planet_abandon_complete",
// 星球放弃失败（有外部舰队/建筑）
PLANET_ABANDON_FAILED:      "planet_abandon_failed",
// 星球侦察结果推送
PLANET_SPY_RESULT:          "planet_spy_result",
// 星门选择成功
PLANET_NEW_GATE_COMPLETE:   "planet_new_gate_complete",
// 星门选择失败（已有星门/有外部星球）
PLANET_NEW_GATE_FAILED:     "planet_new_gate_failed",
// 资源产出周期更新（游戏 tick 驱动）
PLANET_RESOURCE_UPDATE:     "planet_resource_update",
```

#### 建筑失败细分

```javascript
// 建造失败（资源不足/格子已满）
BUILDING_BUILD_FAILED:      "building_build_failed",
// 升级失败
BUILDING_UPGRADE_FAILED:    "building_upgrade_failed",
// 生产入队失败（队列满/资源不足）
BUILDING_PRODUCTION_FAILED: "building_production_failed",
```

#### 侦察与科研

```javascript
// 雷达扫描结果
RADAR_SCAN_RESULT:           "radar_scan_result",
// 雷达探测来袭舰队
RADAR_INCOMING_DETECTED:     "radar_incoming_detected",
// 科研开始
RESEARCH_START:              "research_start",
// 科研完成
RESEARCH_COMPLETE:           "research_complete",
```

### 4.3 P2 — 社交闭环

#### 联盟外交响应

```javascript
// NAP 建立成功
ALLIANCE_NAP_ESTABLISHED:    "alliance_NAP_established",
// 宣战生效
ALLIANCE_WAR_ESTABLISHED:    "alliance_war_established",
// 中立关系生效
ALLIANCE_NEUTRAL_ESTABLISHED: "alliance_neutral_established",
// 成员变更通知
ALLIANCE_MEMBER_CHANGED:     "alliance_member_changed",
// 申请被接受
ALLIANCE_APPLY_ACCEPTED:     "alliance_apply_accepted",
// 申请被拒绝
ALLIANCE_APPLY_REJECTED:     "alliance_apply_rejected",
```

#### 通信推送

```javascript
// 聊天消息推送（S2C 广播给频道内所有人）
CHAT_MSG_PUSH:               "chat_msg_push",
// 邮件送达通知
MAIL_DELIVERED:              "mail_delivered",
```

---

## 五、补完路线图

### 优先级排序

```
P0 (阻断级) ─────────────────────────────────────
  ① 编队到达结算分支事件 (6+1个新增)
  ② 战斗预备+结算事件 (5个新增)
  ③ 机群操作响应事件 (5个新增)
  → 补完后：核心玩法闭环可完整推演

P1 (增强级) ─────────────────────────────────────
  ④ 星球请求响应事件 (6个新增)
  ⑤ 建筑失败细分事件 (3个新增)
  ⑥ 侦察科研事件 (4个新增)
  → 补完后：星球/建筑/侦察玩法闭环

P2 (社交级) ─────────────────────────────────────
  ⑦ 联盟外交响应事件 (6个新增)
  ⑧ 通信推送事件 (2个新增)
  → 补完后：联盟/通信闭环

全局前置 ──────────────────────────────────────────
  A API约定 (JWT+统一壳+camelCase) ← 已决策，待写入规范
  B S2C推送 (先轮询) ← 已决策，待设计轮询接口
  C 数据库 (SQLite先跑) ← 已决策，沿用现有抽象层
```

### 执行顺序建议

1. **全局前置 A/B/C** → 先确定 API 约定规范文档 + 轮询接口设计
2. **P0 事件补完** → 更新 `ENUMGoFAGameEvents.js` + 用例图注释
3. **P0 → API 端点推导** → 从补完的事件推导出 31 个接口的请求/响应体
4. **P1 事件补完** → 星球/建筑/侦察科研
5. **P2 事件补完** → 联盟/通信

---

## 六、待定/待讨论事项

1. **Tick 循环必要性** — CL 考虑用定时器+事件队列替代传统游戏 tick 循环。需确认：
   - 1秒 tick 的必要性（资源产出更新、星球状态刷新等需要周期性计算）
   - 定时器方案能否满足"按 tick 判定到达先后"的需求
   
2. **战斗算法** — `fleet_combat.pu` 和 `planetary_combat.pu` 仍为空壳，需要设计：
   - 战斗回合内每一步的算法
   - 舰载机 vs 舰载机 / 航母 vs 航母 / 航母战阶段的流程
   - 逃逸百分比的精确触发时机
   
3. **增幅器属性查表** — 四色道具的每级属性增量、升级消耗公式需要设计数值表
   
4. **殖民后星球初始状态** — 殖民成功后：
   - 星球的初始建筑如何确定？（HQ自动出现？其他建筑为空？）
   - 星球的初始资源储备？
   - 星球的初始防御值（0？还是有基础防御？）
   - 舰队殖民后自动停泊于该星球
   
5. **编队解散规则** — `TASKFORCE_DISBAND` 的具体条件（是否需要所有航母都停泊？是否需要编队不在航行中？）

6. **拦截机制实现复杂度** — 实时操作+服务端精确位置计算+气体资源消耗管理是全新系统，需要单独设计：
   - 舰队航行位置实时计算引擎（服务端每tick更新所有航行舰队位置）
   - 抛锚请求合法性验证（时间窗口+位置合理性+气体资源检查）
   - 拦截圈几何判定（航线与圆的相交检测）
   - 气体资源消耗管理（每分钟消耗速率、耗尽后的状态切换）
   - 位置同步频率（HTTP请求频率 vs tick频率的差异如何调和）
