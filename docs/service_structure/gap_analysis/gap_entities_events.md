# 设计文档声明 vs 代码现状 · 差距分析：数据实体与事件机制

> 作者：差距分析子代理B（实体与事件层）
> 范围：`docs/data_models/GoFA-Remake.pdma`（36 实体）· `docs/service_structure/design_decisions.md` · `docs/service_structure/server/**/*.pu` 类图 · `server/services/GoFA-Remake/game_entities/` · `server/services/GoFA-Remake/event_manager/`
> 分支：add_apis（只读分析，未改动任何代码）

**背景一句话**：数据模型层权威来源（pdma 36 张物理表）与事件枚举（ENUMGoFAGameEvents.js）已相对完整，但代码层的实体类几乎为零、事件总线骨架不可运行、且设计文档列出的 P0「待补完事件」至今仍未写入枚举。

---

## P0（阻断级）

### P0-1 核心游戏实体类全面缺失（Fleet / Carrier / TaskForce / Role / Alliance / Combat / Modifier / Account / Player）

- **声明**：
  - pdma 36 实体中，核心玩法表 `fleet_carrier`(航母,10字段)、`fleet_fleet`(舰队编制,4)、`fleet_task_force`(特混舰队,9)、`player_role`(角色,11)、`alliance_basic/alliance_playerlist/alliance_relation/alliance_msgboards/alliance_msgReplies`、`events_combat`(16字段) 等均存在。
  - 类图已要求：`CLS_fleet_combat_args.pu` 定义了 `Fleet`/`ICarrier`/`CarrierModifier`/`IShip`/`ILoadable`/`Commander`/`CommanderSkill`/`EventCombat`/`CombatParticipant`/`BattlefieldEnvironmentModifier`；`CLS_alliance_structure.pu` 定义 `Group`/`Alliance`；`CLS_account_structure.pu` 定义 `Account -|> Entity`；`ABSCLS_entity_stucture.pu` 定义抽象基类 `Entity{UUID EntityID, Time createTime, bool isKilled, killEntity()}`；`CLS_modifier.pu` 定义 `IModifier{name,lv,targets,getValue()}`。
- **现状**：`game_entities/` 下只有 `atlas/` 系列（`Atlas`、`System`、`Planet`、`Building`/`BuildingSlot`/`IBuilding`、`Pos`/`Pos2d`、`Mask`/`IMask`、`generator/Nebula`、`PrimitiveGalaxyBuilder`）。`grep -rniE "class (Fleet|Carrier|TaskForce|Role|Alliance|Combat|Modifier|Account|Player|Ship)"` 在 `server/` 全树（除 node_modules）**0 命中**。
- **差距**：36 张物理表中，**除地图系列（map_chunk/map_system/map_planet 对应 atlas 类）外，0 张表有代码实体类**。连抽象基类 `Entity` 与 `IModifier` 也仅有 .pu 声明、无 .js 落地。
- **影响面**：核心玩法闭环（编队到达/战斗结算/航母/联盟/角色成长）没有领域模型承载层。`CLS_command_event_correlation.pu` 要求领域操作（`fleet_arrive()/planet_colonize()/carrier_destroy()`）作为事件消费者的唯一入口，而 `fleet_arrive/planet_colonize/carrier_destroy` 在代码中 0 命中 —— 领域层整体空缺，API 无法按设计走「领域操作 → 持久化」路径。
- **建议**：先落地 `Entity` 抽象基类（对齐 `ABSCLS_entity_stucture.pu`），再按依赖顺序补 `Fleet`/`Carrier`/`TaskForce`（P6/P7 核心）→ `Role`（P2）→ `Alliance`/`Group`（P9）→ `Combat`/`Modifier`（P8/P0-②）。优先补 `Fleet/Carrier/TaskForce/Role` 四类（任务重点点名）。

### P0-2 事件总线骨架不可运行（EventManager / PriorityQueue / GoFAGameEvent 多处硬缺陷）

- **声明**：`CLS_command_event_correlation.pu` 定义 `EventBus{publish(event), subscribe(consumer)}`、`GameEvent{type, taskId, payload}`、`Consumer.onEvent`、`DomainOperation`、`Persistence`；`ABSCLS_event_record_strcture.pu` 定义 `EventRecord{EventID, createTime, isDeleted, deleteRecord()}`。
- **现状**（逐文件确认）：
  1. **`EventManager.js`（42行）**：继承 `node:events` 的 `EventEmitter`，但 `emit()` 里调用 `EventEmitter.getRemainingTime()` —— 该方法**不存在**（会抛 TypeError）；`this.pq.enqueue(event, priority)` —— `PriorityQueue` 的实际方法名是 `push` 且只收 1 个参数，且 `event` 是**未定义变量**（`emit(eventName, ...args)` 里根本没有 `event`）；`update()` 是空壳（两个空 for 循环体）。该文件从未被业务代码 require，是**孤儿模块**。
  2. **`PriorityQueue.js`（45行）**：`PrioritizedEvent` 构造器 `super()` 无参 → `IGoFAEvent` 的 `schedule` 未赋值 → `this.priority = this.schedule?.timeLeft` **恒为 undefined**；`pop()` 返回 `this.queue.shift().item`，但事件对象根本没有 `.item` 字段 → 返回 undefined；`push()` 的 `sort((a,b)=>a.priority-b.priority)` 对全 undefined 排序无意义。
  3. **`GoFAGameEvent.js`（23行）**：构造器参数 `gameEventReq` **未使用**；`super()` 无参；`this.game = null` 从未被赋值；未实现设计要求的 `type/taskId/payload` 三字段。
  4. **`IGoFAEvent.js`**：`Schedule` 用 `timeElapse.startTime !== null` + `typeof !== "number"` 校验（逻辑正确），但 `length` 校验后 `this.endTime = startTime + length` 未考虑 `startTime=null` 时 `Date.now()` 分支；`isInstantEvent()` 可读性弱。整体可用，是 5 个文件中唯一逻辑基本自洽的。
- **差距**：设计中的「事件总线（pub/sub + 优先队列调度 + taskId 关联）」完全未落地；现有骨架连「加载后能运行」都做不到（`emit` 一调用即抛异常）。
- **影响面**：事件驱动是全部核心玩法（编队到达结算、战斗预备/结算、邮件战报、拦截）的机制基座。基座不可运行 → P0 玩法闭环无法推演，且当前无任何消费方接入，事件枚举只是「字典」，没有「总线」。
- **建议**：重写 `EventManager` 为真正的 `publish/subscribe` 总线 + 定时器驱动的优先队列调度；`GoFAGameEvent` 补齐 `type/taskId/payload`；修复 `PriorityQueue` 的 `item`/`priority` 语义（事件本身进队、优先级取自剩余时间）；并接入一个最小驱动循环（见 P1-2）。

### P0-3 机群成员变更 + 升级响应事件（P0 待补完）仍未写入枚举

- **声明**：`design_decisions.md`「四、待补完事件」P0 行明确要求补：`TASKFORCE_ADD_MEMBER`(C2S)、`TASKFORCE_REMOVE_MEMBER`(C2S)、`TASKFORCE_MEMBER_CHANGED`(S2C)、`FLEET_UPGRADED`(S2C)、`FLEET_UPGRADE_FAILED`(S2C)。1.3 节要求机群创建/摧毁/增减统一走「编队成员变更」事件。
- **现状**：grep 逐名核对 `ENUMGoFAGameEvents.js`：上述 5 个事件名 **0 命中**。现有 TASKFORCE_* 事件仅 `ENTITLE/DISBAND/MOVE/TRANSPORT/DOCK_IN_VOID/EXPEDITION`(C2S) 与 `DEPARTED/ARRIVE/MISSING/COMBAT/COMBAT_PREP/INTERCEPT_TRIGGER/DOCKED/DOCKED_DEPLETED`(S2C/Internal)；FLEET_* 有 `FLEET_UPGRADE`(C2S) 但无 `FLEET_UPGRADED/UPGRADE_FAILED`(S2C)。
- **差距**：文档已明确「待补完」且列为 P0，实际枚举仍缺失。`FLEET_CREATE/FLEET_UPGRADE` 的 C2S 无对应 S2C 响应，机群创建/升级/编队调整闭环断裂。
- **影响面**：P6 机群、P7 编队两大核心板块的闭环无法推演，直接阻断设计文档「路线图 P0-①③」。
- **建议**：在 `ENUMGoFAGameEvents.js` 补入这 5 个事件（S2C 与 C2S 分区正确），同步更新 `design_decisions.md`「待补完→已补完」。

---

## P1（增强级）

### P1-1 建筑失败细分事件缺失（BUILDING_*_FAILED 三个）

- **声明**：`design_decisions.md`「四、待补完事件」P1 行：`BUILDING_BUILD_FAILED` / `BUILDING_UPGRADE_FAILED` / `BUILDING_PRODUCTION_FAILED`，用于细分「当前 REJECTED 过笼统」。
- **现状**：grep 三个事件名 **0 命中**。现有 BUILDING_* S2C 为 `BUILT/DESTROYED/UPGRADED/FINISHED/PRODUCTION_ENQUEUED/EQUIPPED/SPEEDED_UP_PRODUCTION/CANCELLED/REJECTED`；无任何 `*_FAILED` 细分。
- **差距**：文档 P1 待补，枚举未写。建造/升级/生产失败仍只能笼统发 `BUILDING_REJECTED`。
- **影响面**：客户端无法区分「资源不足 / 队列满 / 其他」失败原因，建筑玩法体验闭环不完整（P1 级，非阻断）。
- **建议**：按 P1 节奏补 3 个 BUILDING_*_FAILED，并与 `BUILDING_REJECTED` 的语义边界在文档中明确。

### P1-2 事件循环 / 调度引擎完全缺失

- **声明**：`docs/service_structure/server/engine/event_loop.pu` 应定义事件循环；`design_decisions.md`「五.1」讨论 tick 循环必要性（结论：定时器+事件队列替代传统 tick）；`EventManager.update()` 注释描述了「按优先级调度任务」的循环算法。
- **现状**：`event_loop.pu` **0 字节（空文件）**；`EventManager.update()` 为**空壳**（无任何调度逻辑、`sleptTime` 从不推进）；无任何 setTimeout/setInterval/优先级驱动代码；`PriorityQueue` 本身也有缺陷（见 P0-2）。
- **差距**：事件循环从设计文档到代码均无实现。
- **影响面**：即便枚举补全、总线重写，缺少调度引擎就无法触发「定时到达/结算/拦截」等延时事件，P0 玩法闭环仍无法运行。
- **建议**：实现基于优先队列 + 定时器的事件循环（可参考 `EventManager.update()` 注释里的两阶段算法），并回填 `event_loop.pu` 时序图。

### P1-3 事件命名拼写/词性漂移（枚举 key 与 value 不一致）

- **声明**：`design_decisions.md` 1.3 与「三/四」中事件名是权威，枚举应 key=value 语义一致。
- **现状**（逐行核对 `ENUMGoFAGameEvents.js`）：
  1. `FLEET_RECOMPOSE_FAILED: "fleet_recomposed_failed"`（第104行）—— key 用动词原形 `RECOMPOSE`，value 用过去分词 `recomposed`，与相邻 `FLEET_RECOMPOSED: "fleet_recomposed"`（第102行）只差 `_failed` 后缀，极易误拼/误匹配。
  2. `SPY_BOUNTY_DISCOVER: "spy_bounty_discovery"`（第281行）—— key 用动词 `DISCOVER`，value 用名词 `discovery`。文档「四」写的是 `SPY_BOUNTY_DISCOVER`（key 对，value 漂移）。
  3. `ALLIANCE_KICK: "alliance_kick"`（第336行）被误放在「### 联盟公告管理」注释段下；而其注释「联盟移除成员…」（第321行）却孤悬在「成员管理」段末尾、其后无对应事件声明。
  4. 文档「四、已补完」写 `ALLIANCE_DISBAND`，枚举 S2C 实际是 `ALLIANCE_DISBANDED`（第140行），C2S 才是 `ALLIANCE_DISBAND`（第288行）—— 文档名与 S2C 枚举 key 有微小漂移（两者均存在，语义未丢）。
- **差距**：枚举已 `Object.freeze` 且被设计文档当作权威，key/value 词性漂移一旦被消费者硬编码字符串匹配，会埋下隐性 bug。
- **影响面**：暂无消费方，故目前无实际破坏；但趁「无消费者」窗口期修正成本最低，属 P1 预防性债务。
- **建议**：统一 `FLEET_RECOMPOSE_FAILED` 的 value 为 `"fleet_recompose_failed"`（或同时改 key 为 `FLEET_RECOMPOSED_FAILED` 二选一，全仓同步）；`SPY_BOUNTY_DISCOVER` 的 value 改为 `"spy_bounty_discover"`；把 `ALLIANCE_KICK` 移到成员管理段并修正注释位置；文档「四」的 `ALLIANCE_DISBAND` 标注改为 `ALLIANCE_DISBANDED`。

---

## P2（社交/数据完整性级）

### P2-1 联盟成员变更 S2C 事件缺失

- **声明**：`design_decisions.md`「四、待补完事件」P2 行：「联盟成员变更 S2C（成员加入/退出/踢出/邀请接受/邀请拒绝）」，并指出「当前仅 CREATE 有成对响应」。
- **现状**：grep `ALLIANCE_MEMBER_JOINED/LEFT/KICKED/INVITE_ACCEPTED/INVITE_REJECTED` 均 **0 命中**。现有联盟 S2C 仅 `CREATE_CONFIRM/CREATE_FAILED/LOG/DISBANDED/RELATION_CHANGED`；C2S 侧已有 `INVITE/ACCEPT_INVITE/REJECT_INVITE/LEAVE/APPLY/APPOINTMENT/KICK` 等，但无对应 S2C。
- **差距**：成员变更只有 C2S、无 S2C 广播，社交闭环不完整。
- **影响面**：P2 级；联盟成员变动无法主动推送给其他成员（设计「决策B」可用轮询 `GET /api/v1/alliance/events` 暂代）。
- **建议**：按 P2 节奏补成员变更 S2C 事件族（JOIN/LEAVE/KICK/INVITE_ACCEPT/INVITE_REJECT）。

### P2-2 PDMan 缺失表（战报 / 联盟小队 / 侦察报告 / 拦截状态）

- **声明**：`design_decisions.md`「五.9」TODO 明确缺 4 张表：战报内容表（MAIL_BATTLE_REPORT 存初态+终态+战利品）、联盟小队结构表（C2S 有 CREATE/JOIN/LEAVE_TEAM 但模型缺表）、侦察报告表（MAIL_SPY_REPORT 存星球快照）、拦截状态追踪表（TASKFORCE_DOCKED 记录锚点+气体消耗速率+剩余时长）。
- **现状**：对 pdma 36 实体 defKey 做关键词检索，`battle/report/team/squad/spy/intercept/dock/anchor/gravity` **全部无命中**。`events_combat` 虽有 16 个 `EV_B_*` 字段（`EV_B_ATK_FORCES/EV_B_ATK_FORCES_REMAIN/EV_B_ATK_LOOT` 等）可**部分承载战报**，但无独立战报内容表；小队/侦察/拦截三张表彻底缺失。
- **差距**：4 张表均未建模（`events_combat` 仅部分覆盖战报）。
- **影响面**：P2 级，但直接影响 P7 拦截、P8 战报、P9 小队、P11 侦察四个板块的持久化落地。
- **建议**：在 PDMan 增补 4 张表；战报表可复用/关联 `events_combat` 的 `EV_B_*` 字段设计，避免重复。

### P2-3 planet_storage / planet_structure JSON Schema 未定义

- **声明**：`design_decisions.md`「五.8」TODO：`planet_structure`（`{buildingTypeId: buildingInstance}` 还是 `{slotIndex: buildingId}`？）、`planet_storage`（`{metal,gas,crystal}` 结构？）、殖民后初始值，均未定义。
- **现状**：`map_planet` 表含 `planet_structure[JSON]`、`planet_storage[JSON]`、`planet_modifiers[VARCHAR]`，但无 JSON Schema 约束；`relation_planet_structure` 另有 `structure_queue[JSON]` 同样无 schema。代码 `Planet.js` 未含 storage/structure 结构化字段（仅 atlas 展示属性）。
- **差距**：两个核心 JSON 字段语义未定，schema 缺位。
- **影响面**：P2 级；星球资源/建筑读写、殖民初始化逻辑无法正确建模，且与 `Building`/`BuildingSlot` 类如何对接未知。
- **建议**：定义两份 JSON Schema（建议 `planet_structure: {slotIndex: structureId}` + `planet_storage: {metal,gas,crystal}` 并明确上限），落地到 schema 文件并让 `Planet` 类引用。

### P2-4 events_* 六张事件表 + 所有权关系表是空壳

- **声明**：pdma 中 `events_admin_ops/events_player_growth/events_client_ops/events_alliance_management/events_purchases/events_construction`、`relation_system_planet_ownership` 应为有内容的表。
- **现状**：这 7 张表字段**只有** `_ID/REVISION/CREATED_TIME/UPDATED_TIME`（审计四件套），**无任何领域字段**（对比 `events_combat` 有 16 个真实字段）。`relation_system_planet_ownership` 同样空壳。
- **差距**：事件记录表、所有权关系表建模未完成，仅占位。
- **影响面**：P2 级；审计/成长/购买/联盟管理/建设等事件日志与「星系-星球所有权」无法落库。
- **建议**：按各板块事件的实际载荷字段补列（可参照 `events_combat` 的建模粒度）。

### P2-5 事件模块尾随副作用 + GoFAGameEvent 未落地设计字段

- **声明**：`CLS_command_event_correlation.pu` 的 `GameEvent{type, taskId, payload}`。
- **现状**：`ENUMGoFAGameEvents.js` 第356行 `console.log(GameEvent.version)` 在**模块加载时即打印**（require 副作用，污染任何引入方输出）；`GoFAGameEvent` 未实现 `type/taskId/payload`，`gameEventReq` 参数未用、`game=null` 永不赋值（P0-2 已详述，此处聚焦字段落地）。
- **差距**：事件载体对象与设计的 `GameEvent` 契约不符；枚举模块有导入副作用。
- **影响面**：P2 级；`console.log` 会在生产日志/测试输出中刷屏；事件对象缺 `taskId` 无法实现命令-结果关联（`CLS_command_event_correlation.pu` 的核心关联点）。
- **建议**：删除枚举尾随 `console.log`（或改为显式 debug 入口）；`GoFAGameEvent` 实现 `type/taskId/payload` 并让 `gameEventReq` 作为 `type/payload` 的入参来源。

---

## 结论

1. **实体层几乎为零**：36 张物理表中仅地图系列（map_chunk/map_system/map_planet）有对应 atlas 类，**核心玩法实体（Fleet/Carrier/TaskForce/Role/Alliance/Combat/Modifier/Account/Player）全部缺类**，连抽象基类 `Entity` 与 `IModifier` 都未落地 —— 这是全项目最大的结构性差距（P0-1）。
2. **事件机制「有枚举、无总线」**：`ENUMGoFAGameEvents.js`（356行，冻结枚举）本身较完整、且「四、已补完事件」表经 grep 核对**全部属实**；但 `EventManager`/`PriorityQueue`/`GoFAGameEvent` 骨架存在**不可运行的硬缺陷**（调不存在的方法、用未定义变量、priority 恒 undefined），且无任何消费方接入、事件循环（event_loop.pu）为空 —— 事件驱动基座尚未建立（P0-2/P1-2）。
3. **事件补完进度停在「已补完」档**：设计文档「四」列出的 **P0/P1/P2「待补完事件」至今一个都未写入枚举**（TASKFORCE_*_MEMBER、FLEET_UPGRADED/UPGRADE_FAILED、BUILDING_*_FAILED、联盟成员变更 S2C 全部 grep 0 命中），即 commit 5fe92b1c 之后补完工作停滞（P0-3/P1-1/P2-1）。
4. **命名与建模完整性欠账**：枚举存在 key/value 词性漂移（`FLEET_RECOMPOSE_FAILED`、`SPY_BOUNTY_DISCOVER`）与注释错位（`ALLIANCE_KICK`）；PDMan 缺 4 张表、`planet_storage/structure` JSON Schema 未定、6 张 events_* 表为空壳 —— 均为 P1/P2 债务，但应在「无消费者」窗口期尽早清理。

**建议优先级**：先 P0-2（修事件总线，否则事件机制无从谈起）→ P0-3（补 P0 事件枚举）→ P0-1（落地 Entity 基类 + Fleet/Carrier/TaskForce/Role）→ 再按 P1→P2 顺序清理命名漂移、事件循环、缺失表与 Schema。
