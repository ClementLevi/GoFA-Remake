# GoFA-Remake 设计决策文档

> 版本: v1.2.1 | 日期: 2026-07-26 | 作者: 小小CL + CL
> 前置文档: `server/use_case/use_cases.pu` (用例图)、`ENUMGoFAGameEvents.js` (事件枚举)

---

## 一、核心玩法闭环设计决策

### 1.1 编队到达结算分支 (P0-①)

**设计方法**: 事件驱动 — `TASKFORCE_ARRIVE` 到达后触发分支判定

#### 殖民规则

| 条件                                     | 结果                                                     | 涉及事件                               |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| 目标星球无主 + 任何有效舰队到达          | 星球立即被殖民，划归该舰队所属玩家，舰队自动停泊于该星球 | `TASKFORCE_ARRIVE`                   |
| 同 tick 内多名玩家的舰队到达同一无主星球 | 注册时间较早的玩家获得星球；其他玩家按外交关系分流       | 同上，服务端按注册时间排序。事件见下表 |

**同 tick 到达的分流规则**:

| 与获得星球的玩家关系 | 舰队走向             | 涉及事件                                                                                |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| 友好（同联盟或NAP）  | 停泊于该星球         | `TASKFORCE_ARRIVE`                                                                    |
| 中立或无联盟         | 自动返回出发星球     | `TASKFORCE_DEPARTED`                                                                  |
| 敌对（战争状态）     | 自动进入战斗预备阶段 | `TASKFORCE_ARRIVE`, `TASKFORCE_DEPARTED`; `TASKFORCE_COMBAT` (到达结算时间后触发) |

#### 拦截机制

**核心机制**: 玩家A在舰队航行中手动命令舰队抛锚。抛锚的舰队会在一段时间内持续拦截其他玩家经过的舰队。

- **拦截能力**: 仅编有 `carrier_TYPE=5 (gravity_interceptor)` 且该航母存活的舰队具有超空间拦截能力
- **拦截圈**: 以舰队抛锚位置为圆心，拦截能力数值为半径划定重力井拦截圈
- **拦截触发条件**:
  1. 玩家B的舰队进入航行状态
  2. 其航线与拦截圈相割
  3. A与B属于中立或敌对关系
  4. 舰队航行位置（按时间、速度、航线长度线性演算）到达相割弦时触发拦截
- **抛锚时机**: 舰队可在航行中任意时刻执行 `TASKFORCE_DOCK_IN_VOID`：
  - 例：刚离开星球1s后抛锚 → 拦截圈靠近出发星系
  - 例：到达前1s抛锚 → 拦截圈靠近目标星系
  - 例：航行一半路程时抛锚 → 拦截圈位于航线中段
- **抛锚持续时长**: 由舰队所载气体资源数量决定。每种航母和舰载机每分钟消耗不同数量的气体资源。气体耗尽后：
  - 舰队继续前往原定目的地
  - 不再能抛锚
  - 取消尚未结算的战斗
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

| 阶段     | 时机                | 行为                                                     | 缓存策略                         |
| -------- | ------------------- | -------------------------------------------------------- | -------------------------------- |
| 预备阶段 | 结算时间窗口开始前  | 所有到达星球的舰队自动计入预备阶段；玩家可增援或撤回舰队 | 缓存结果，增援/撤回使缓存失效    |
| 结算阶段 | 每小时00/15/30/45分 | 根据缓存有效性决定重算或直返战报                         | 有效缓存直接返回，无效则重新计算 |

**关键规则**:

- 舰队到达敌方星球 → 自动进入战斗预备（不需要玩家主动选择）
- 友好关系到达 → 自动停泊，不触发战斗
- 预备阶段中，增援/撤回操作使缓存失效 → 结算时需重算

**新增事件**:

```
TASKFORCE_COMBAT_PREP:  "taskforce_combat_prep"    // 舰队进入战斗预备阶段，等待00/15/30/45分触发结算
```

> 预备阶段撤回舰队触发 `TASKFORCE_DEPARTED`（舰队返航），同时使战斗缓存失效。不需要单独的 WITHDRAW 事件。

---

### 1.2 战斗结果数据结构 (P0-②)

#### 战报格式

| 内容                                                   | 服务端提供 | 客户端运算                      |
| ------------------------------------------------------ | ---------- | ------------------------------- |
| 初态总览（双方舰队构成、兵力、玩家列表、玩家面板属性） | ✓         | —                              |
| 终态总览（存活/损失/战利品/星球新归属）                | ✓         | —                              |
| 每回合战斗小结                                         | — (参数)  | ✓ (按需，以初态为参数实时运算) |
| 胜负判定                                               | ✓         | —                              |
| 战利品（可掠夺资源）                                   | ✓         | —                              |

**服务端推送**:

- 结算时间到达时，推送战报总览（初态+终态+胜负+战利品）
- 回合小结仅存初态参数，客户端按需实时渲染
- 战报通过 HTTP 轮询获取（与15分钟结算周期对齐）

#### 舰队遭遇战（被拦截触发）

- 仅在被拦截时发生
- 不涉及星球所有权交割
- 可掠夺运输机上的资源：金属、气体、晶体、间谍无人机；不可掠夺：步兵
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
TASKFORCE_COMBAT: "taskforce_combat"  // 舰队战斗结算完成，触发 MAIL_BATTLE_REPORT 以推送战报
MAIL_BATTLE_REPORT: "mail_battle_report"  // 战报以邮件形式发送给玩家
```

---

### 1.3 机群操作合法性规则 (P0-③)

**设计方法**: 机群的创建/摧毁/增减通过**编队成员变更**事件统一处理，而非单独的 FLEET_CREATE/DESTROY S2C。

| 操作 | 条件                     | 约束                                                                                 | C2S 请求                    | S2C 响应                              |
| ---- | ------------------------ | ------------------------------------------------------------------------------------ | --------------------------- | -------------------------------------- |
| 创建 | 造船厂建造完成后自动触发 | 初始属性通过查数据表确定；航母自动加入驻扎星球默认编队                               | `BUILDING_FINISH`, `FLEET_CREATE`    | `FLEET_CREATED`, `TASKFORCE_MEMBER_CHANGED`            |
| 重组 | 仅停泊于玩家拥有星球上时 | 每艘航母可单独重组自身的机群和载荷                                                   | `FLEET_RECOMPOSE`          | `FLEET_RECOMPOSED` / `FLEET_RECOMPOSE_FAILED` |
| 升级 | 需增幅器道具             | 不可降级、不可换色；无升级=0级，升到p级需p-1个道具；上限20级；绿道具仅拦截者航母可用 | `FLEET_UPGRADE`            | (需新增) `FLEET_UPGRADED` / `FLEET_UPGRADE_FAILED` |
| 摧毁 | 无需时间或消耗           | 编队中的航母不允许摧毁；无资源回收                                                   | `FLEET_DESTROY` | `FLEET_DESTROYED`            |
| 命名 | —                        | 航母可重命名                                                                         | `FLEET_RENAME`             | `FLEET_RENAMED` / `FLEET_RENAME_FAILED` |

> `TASKFORCE_ADD_MEMBER` 和 `TASKFORCE_REMOVE_MEMBER` 也可用于编队固定编队的航母成员变更（玩家主动调整编队构成），不限于新建/摧毁。

**四色增幅器道具**:

| 颜色 | 效果                        | 适用范围               | 每级属性增量 |
| ---- | --------------------------- | ---------------------- | ------------ |
| 红色 | 增加战机+航母伤害           | 所有航母               | 查表确定     |
| 蓝色 | 增加战机+航母防御力和生命值 | 所有航母               | 查表确定     |
| 黄色 | 增加航母超空间航行速度      | 所有航母               | 查表确定     |
| 绿色 | 增加拦截者航母重力井半径    | 仅 gravity_interceptor | 查表确定     |

**升级公式**: 从p-1级升到第p级，需要消耗 p-1 个同色道具（升到第20级需要19个道具）

**数据模型**: `carrier_upgrade_item` 字段改为 JSON 存储 `{ color: "red"|"blue"|"yellow"|"green", level: 0~20 }`，颜色和等级一并存储，无需单独字段。

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

**业务错误码设计** (待细化)。

### 2.2 S2C 推送实现 (决策B)

**选定方案**: 现阶段用 HTTP 轮询，后续升级到 SSE

**轮询策略**:

| 推送场景      | 轮询接口                                | 建议间隔                 | 说明               |
| ------------- | --------------------------------------- | ------------------------ | ------------------ |
| 战报推送      | `GET /api/v1/combat/report/{taskId}`  | 15分钟（与结算周期对齐） | 结算后一次性获取   |
| 雷达来敌预警  | `GET /api/v1/radar/alerts`            | 30秒                     | 拦截发生时及时感知 |
| 邮件/战报通知 | `GET /api/v1/mail/unread`             | 60秒                     | 低频通知           |
| 聊天消息      | `GET /api/v1/chat/{channelId}/recent` | 2~5秒                    | 频率最高           |
| 联盟事件      | `GET /api/v1/alliance/events`         | 60秒                     | 外交变更、成员变动 |

**后续升级路径**:

- MVP → 纯轮询
- V1 → SSE（战报/邮件/联盟事件走 SSE 推送，聊天仍可轮询）
- V2 → WebSocket（如实时性需求超出现有方案）

**心跳机制**: 无 WS 心跳 → 客户端每30秒发 `GET /api/v1/ping` 维持在线状态，服务端超过阈值标记离线

**编队航行位置**: 客户端本地模拟航行轨迹（出发时间+速度+航线长度 → 线性演算），服务端只在关键节点（出发/抛锚/被拦截/到达）通过 HTTP 同步

### 2.3 数据库选型

**选定方案**: 先 SQLite，DAO 层留迁移接口

- 当前代码已有 `Database + Sqlite3/NodeSqlite` 双连接器
- 所有数据库操作通过 DAO 层抽象，不直接写 SQL
- 后续迁移只需：换连接器实现 + 适配连接池/事务差异
- 设计文档中的 MySQL+Redis+MongoDB 暂搁置，等性能瓶颈出现再迁移

---

## 三、事件覆盖审计

### 3.1 核心闭环 (P1~P8)

| 板块      | C2S 状态 | S2C 状态                                          | Internal 状态 | 断裂点                          |
| --------- | -------- | ------------------------------------------------- | ------------- | ------------------------------- |
| P1 账号   | ✓ 5个   | 🔴 大厅职责                                       | —            | 不在游戏服范围                  |
| P2 角色   | ✓ 4个   | ✓ 8对 COMPLETE/FAILED                            | —            | ✓ 闭环                         |
| P3 客户端 | ✓ 5个   | ⚠️ REROUTED/LOAD_MAP                            | ✓ DISCONNECT | —                              |
| P4 星球   | ✓ 6个   | ⚠️ TRANSFER+BECOMES_GATE+RESOURCE_UPDATE+INCOMING_DETECTED+INCOMING_RELIEVED | —            | 缺 ABANDON/SPY 等请求的响应    |
| P5 建筑   | ✓ 8个   | ⚠️ BUILT/DESTROYED/UPGRADED/FINISHED/ENQUEUED/EQUIPPED/SPEEDED_UP/CANCELLED + REJECTED | —            | REJECTED笼统，缺细分           |
| P6 机群   | ✓ 5个 (含FLEET_RENAME) | ⚠️ RECOMPOSED/RECOMPOSE_FAILED+RENAMED/RENAME_FAILED | —            | 缺 TASKFORCE_MEMBER_CHANGED + FLEET_UPGRADED |
| P7 编队   | ✓ 6个   | ⚠️ DEPARTED/ARRIVE/MISSING+COMBAT_PREP+INTERCEPT_TRIGGER+DOCKED/DOCKED_DEPLETED | ✓ COMBAT     | 缺 TASKFORCE_ADD/REMOVE_MEMBER (C2S) |
| P8 战斗   | —       | ⚠️ MAIL_BATTLE_REPORT (战报→邮件)                | ✓ COMBAT     | 缺 COMBAT_RESULT                |

### 3.2 次级板块 (P9~P12)

| 板块         | C2S 状态         | S2C 状态                                    | Internal 状态 | 断裂点                      |
| ------------ | ---------------- | ------------------------------------------- | ------------- | --------------------------- |
| P9 联盟      | ✓ 20+个         | ⚠️ CREATE_CONFIRM/FAILED+DISBAND+RELATION_CHANGED | ✓ LOG        | 缺成员变更S2C              |
| P10 通信     | ✓ 6个(含SPY 3个) | ⚠️ MAIL_ALREADY_READ+MAIL_SPY_REPORT+MAIL_ESPIONAGE_ALERT | ❌            | 缺聊天广播推送              |
| P11 侦察 | ✓ 3个(SPY_*系)  | ⚠️ MAIL_SPY_REPORT+MAIL_ESPIONAGE_ALERT     | ❌            |                   |
| P12 运维     | ✓ 5个           | ✓                                           | ✓ 9个        | ✓ 基本完备                 |



## 四、事件补完进度与路线图

### 已补完事件（CL commit 5fe92b1c 已写入枚举）

| 板块 | 新增事件 | 状态 |
|------|----------|------|
| P4 星球 S2C | `PLANET_RESOURCE_UPDATE` / `PLANET_INCOMING_DETECTED` / `PLANET_INCOMING_RELIEVED` | ✅ 已写入 |
| P6 机群 S2C | `FLEET_RENAMED` / `FLEET_RENAME_FAILED` / `FLEET_RECOMPOSE_FAILED` | ✅ 已写入 |
| P7 编队 S2C | `TASKFORCE_COMBAT_PREP` / `TASKFORCE_INTERCEPT_TRIGGER` / `TASKFORCE_DOCKED` / `TASKFORCE_DOCKED_DEPLETED` | ✅ 已写入 |
| P8 战斗 S2C | `MAIL_BATTLE_REPORT` (战报→邮件) | ✅ 已写入 |
| P9 联盟 S2C | `ALLIANCE_DISBAND` / `ALLIANCE_RELATION_CHANGED` | ✅ 已写入 |
| P11 侦察 C2S | `SPY_INCOMING_COUNTER` / `SPY_PLANET_ESPIONAGE` / `SPY_BOUNTY_DISCOVER` | ✅ 已写入 |
| P11 侦察 S2C | `MAIL_SPY_REPORT` / `MAIL_ESPIONAGE_ALERT` | ✅ 已写入 |
| P10 邮件 S2C | `MAIL_ALREADY_READ` | ✅ 已写入 |

### 待补完事件（尚未写入枚举）

| 板块 | 待新增事件 | 优先级 | 说明 |
|------|-----------|--------|------|
| P6 机群 | `TASKFORCE_ADD_MEMBER` (C2S) / `TASKFORCE_REMOVE_MEMBER` (C2S) / `TASKFORCE_MEMBER_CHANGED` (S2C) | P0 | 机群创建/摧毁/编队成员变更统一走此事件 |
| P6 机群 | `FLEET_UPGRADED` (S2C) / `FLEET_UPGRADE_FAILED` (S2C) | P0 | 机群升级响应，配合已有的 C2S `FLEET_UPGRADE` |
| P5 建筑 | `BUILDING_BUILD_FAILED` / `BUILDING_UPGRADE_FAILED` / `BUILDING_PRODUCTION_FAILED` | P1 | 当前 REJECTED 过笼统，细分失败原因 |
| P9 联盟 | 联盟成员变更 S2C (成员加入/退出/踢出/邀请接受/邀请拒绝) | P2 | 当前仅 CREATE 有成对响应 |

### 路线图优先级

```
P0 (阻断级) ─────────────────────────────────────
  ① 编队到达结算 → CL已补完大部分S2C事件，剩余：TASKFORCE_ADD/REMOVE_MEMBER
  ② 战斗预备+结算 → CL已补完 COMBAT_PREP/INTERCEPT_TRIGGER/MAIL_BATTLE_REPORT
  ③ 机群升级响应 → 待补 FLEET_UPGRADED/FLEET_UPGRADE_FAILED
  → 补完后：核心玩法闭环可完整推演

P1 (增强级) ─────────────────────────────────────
  ④ 建筑失败细分 → 3个BUILDING_*_FAILED事件
  → 补完后：建筑玩法闭环

P2 (社交级) ─────────────────────────────────────
  ⑤ 联盟成员变更S2C → 成员加入/退出/踢出/邀请
  ⑥ 通信推送 → 聊天消息广播 (可暂用轮询替代)
  → 补完后：联盟/通信闭环

全局前置 ──────────────────────────────────────────
  A API约定 ← 已决策 (JWT+统一壳+camelCase)
  B S2C推送 ← 已决策 (先轮询)
  C 数据库 ← 已决策 (SQLite+迁移接口)
```

### 执行顺序建议

1. **P0 剩余事件补完** → `TASKFORCE_ADD/REMOVE_MEMBER` + `FLEET_UPGRADED/UPGRADE_FAILED` → 更新枚举 + 用例图
2. **P0 → API 端点推导** → 从补完的事件推导核心闭环的 REST 端点请求/响应体
3. **P1 建筑失败细分** → 3 个 BUILDING_*_FAILED
4. **P2 联盟/通信** → 成员变更 S2C + 聊天广播

---

## 五、待定/待讨论事项（CL已反馈部分讨论）

1. **Tick 循环必要性** — CL 考虑用定时器+事件队列替代传统游戏 tick 循环。需确认：
   - 1秒 tick 的必要性（资源产出更新、星球状态刷新等需要周期性计算）
     - A: 资源产出更新、星球状态更新等，可以使用懒计算方式，仅在有玩家的操作导致需要时才计算；建筑建造、舰队动向等事件，则因速度和事件发生时间确定，而可以通过设置定时任务触发计算。
   - 定时器方案能否满足"按 tick 判定到达先后"的需求
     - A: 即将到达星球的所有舰队可以设置列表，遍历列表即可找出先后到达者。

2. **战斗算法** — `fleet_combat.pu` 和 `planetary_combat.pu` 仍为空壳，需要设计：
   - 战斗回合内每一步的算法
     - A: 待实现和平衡优化，可先简单地以减法运算占位：`受击方战损数量 = 攻击方数量`。
   - 舰载机 vs 舰载机 / 航母 vs 航母 / 航母战阶段的流程
     - A: 分为三个阶段：
       - 战机战：每回合内防守方先攻，进攻方再攻。按拦截机、战斗机、轰炸机三款机型顺序组织回合。
       - 航母战：双方同时计算伤害，造成伤害/单舰血量=数量的损失。尚有存活战机的航母只计算伤害，不计算受伤。
       - 地面战：进攻方按`伤害=轰炸机数量*每架轰炸机伤害*(1-星球防御水平)`计算造成步兵伤亡，然后再计算`进攻方步兵数量-防守方步兵数量`。
   - 逃逸百分比的精确触发时机
     - A: 每回合后计算是否触发。

3. **增幅器属性查表** — 四色道具的每级属性增量需要设计数值表。`ATTR_carrier` 和 `ATTR_ship` 已有基本结构，但缺：
   - 每级红色道具增加多少 atk？
   - 每级蓝色道具增加多少 def/hp？
   - 每级黄色道具增加多少速度？
   - 每级绿色道具增加多少重力井半径？
   - 需新增一张字典/表定义增量
   - A: 可先创建数据表，均设为5%，后续进行数值平衡调整。

4. **殖民后星球初始状态** — 殖民成功后：
   - 星球的初始建筑如何确定？（HQ自动出现？其他建筑为空？）
     - A: HQ自动出现且为1级，其余建筑根据星球遗弃前的状态保留，但是清空实验室的蓝图。如果星球从未被占领过，则只有HQ1级。
   - 星球的初始资源储备？
     - A: 保留星球遗弃前的资源，不得超过上限。
   - 星球的初始防御值（0？还是有基础防御？）
     - A：初始防御值为10%。当且仅当星球上有建筑“行星防御设施”时才有更多防御值。该建筑每级提供累加的5%防御值。（例：拥有3级行星防御设施的星球防御值为25%）

5. **编队解散规则** — `TASKFORCE_DISBAND` 的具体条件：
   - 是否需要所有航母都停泊？
     - A：是
   - 航行中是否允许解散？
     - A：不允许

6. **拦截机制实现复杂度** — 实时操作+服务端精确位置计算+气体资源消耗管理是全新系统，需要单独设计：
   - 舰队航行位置实时计算引擎
     - A: 同样使用懒计算和定时任务策略。
   - 抛锚请求合法性验证（时间窗口+位置合理性+气体资源检查）
     - A: 只要舰队（TASKFORCE）处于移动状态，且载有资源，即可抛锚。
   - 拦截圈几何判定（航线与圆的相交检测）
     - A: 使用几何算法，如直线与圆的相交检测。
   - 气体资源消耗管理（每分钟消耗速率、耗尽后的状态切换）
     - A：需要写数据表，计算该舰队总消耗速率后进行除算得出可抛锚时长，设置定时任务以前进。
   - 位置同步频率（HTTP请求频率 vs tick频率的差异如何调和）
     - A：收到HTTP请求的那一tick即时处理请求

7. **数据模型命名冲突** — `CARRIER_UPGRADE_ITEM` 字典中 `gravity_well_amplifier`（道具）和 `PLANET_STRUCTURE` 字典中 `Gravity Well Amplifier`（建筑类型12）同名，需区分：
   - 建议：道具改名（如 `green_stone` 或 `interceptor_amplifier`），建筑保持原名（语境不同）
     - A：拟采用`green_stone`命名，计划在后续数据库定义中修改
     - TODO

8. **planet_storage / planet_structure JSON Schema** — 两个核心字段用 JSON 存储但未定义内部结构。需明确 JSON Schema：
   - `planet_structure`：`{ buildingTypeId: buildingInstance }` 还是 `{ slotIndex: buildingId }`？
   - `planet_storage`：`{ metal: number, gas: number, crystal: number }` 还是更复杂的结构？
   - 殖民后初始值？
   - TODO

9. **PDMan 缺失表** — 数据模型中缺少以下表：
   - 战报内容表（MAIL_BATTLE_REPORT 需存储初态+终态+战利品）
   - 联盟小队结构表（C2S 有 CREATE/JOIN/LEAVE_TEAM 但模型缺表）
   - 侦察报告表（MAIL_SPY_REPORT 需存储星球数据快照）
   - 拦截状态追踪表（TASKFORCE_DOCKED 需记录锚定位置+气体消耗速率+剩余时长）
   - TODO
