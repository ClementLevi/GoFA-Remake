# GoFA Remake — 设计阶段待办清单

> 最后更新: 2026-08-22
> 维护人: Clement_Levi (CL)
> **当前阶段: 需求设计 → 后端开发过渡**（参照 README 开发阶段树）
> 状态标记: `[ ]` 待设计 | `[o]` 设计中 | `[x]` 设计完成/已确认

---

## 阶段总览

依据 README 定义的开发阶段树，当前处于 **[ o ] 需求设计 → [ o ] 后端开发** 过渡期。
设计侧核心闭环已确认；后端 API 骨架已落地（add_apis 分支），业务逻辑待填充。
以下待办项围绕"想清楚、设计完备"——实现类待办在分支 add_apis / extend_db 进行。

### 设计阶段树（现状标注）

```
[ o ] 需求设计
├─ [ o ] 游戏环境需求设计
├─ [ o ] 游戏内容设计 ← 核心闭环决策已确认；战斗算法/逃逸百分比已设计完成
│     ├─ [ o ] 数据模型           ← 36 实体盘点完成，补表方案已定（extend_db），DDL 待落地
│     ├─ [ o ] 交互模型           ← 用例图完成，事件覆盖审计完成，S2C 轮询清单已定义
│     └─ [ o ] 核心玩法规则       ← 编队到达/战斗/机群已确认，数值框架待补
├─ [   ] 故事大纲                 ← 完全未开始
└─ [ o ] 前后端通信API            ← 全局约定已确认(JWT+统一壳+HTTP轮询)，错误码分段已设计

[ o ] 后端开发
├─ [ o ] 数据库设计               ← SQLite确认+字典完成，补表方案已定（extend_db）
├─ [ o ] 模块编码                 ← API 骨架+架构清理已完成（add_apis，104 占位端点），业务逻辑待填充
└─ [   ] 测试单元开发             ← 前置：模块编码必须先完成
```

---

## 已确认的设计决策

> 详见 `docs/service_structure/design_decisions.md`

### 全局技术决策

| 决策项 | 结论 | 状态 |
|--------|------|------|
| API认证 | JWT Bearer Token（大厅颁发，游戏服验证） | `[x]` |
| API响应壳 | `{ code: 0, data: {...} }` 统一格式，业务码分段 | `[x]` |
| 字段命名 | camelCase | `[x]` |
| 分页约定 | 邮件/聊天→cursor, 列表→offset+limit | `[x]` |
| S2C推送 | 现阶段HTTP轮询，后续升级SSE | `[x]` |
| 数据库 | SQLite先行，DAO层留迁移接口 | `[x]` |
| WS通信 | 现阶段不用WebSocket | `[x]` |
| 心跳 | HTTP GET /ping 每30秒 | `[x]` |

### 核心玩法规则决策

| 决策项 | 结论 | 状态 |
|--------|------|------|
| 殖民规则 | 先到先得，同tick按注册时间判优先级 | `[x]` |
| 同到达分流 | 友好→停泊，中立→返回，敌对→战斗预备 | `[x]` |
| 拦截机制 | 实时操作+重力井，服务端维护精确位置 | `[x]` |
| 运输闭环 | 自动往返，返回也触发ARRIVE | `[x]` |
| 战斗触发 | 两阶段制(预备+结算)，到达敌方自动入预备 | `[x]` |
| 战报格式 | 初态+终态+胜负，回合小结客户端运算 | `[x]` |
| 胜负判定 | 逃逸百分比机制，防御方不能逃逸 | `[x]` |
| 机群创建 | 造船厂完工自动触发 | `[x]` |
| 机群重组 | 仅停泊于玩家星球时 | `[x]` |
| 机群升级 | 四色道具(红攻蓝防黄速绿拦截)，p级需p-1道具，上限20 | `[x]` |
| 机群摧毁 | 无回收，编队中不允许 | `[x]` |

---

## A — 需求设计（核心阻塞项）

### A-1 交互模型设计 `[o]` 设计中

- [x] 用例图完成 (`docs/service_structure/server/use_case/use_cases.pu`, 12板块+总览)
- [x] 事件覆盖审计完成 (核心闭环6个🔴断裂点已标注)
- [ ] 交互时序图：注册→登录→选角色→进入星图→殖民→建造→造舰→出征→到达结算→战斗→战报→回收
- [x] S2C推送轮询接口清单定义 → 已写入 `docs/service_structure/design_decisions.md` §2.2（战报/雷达/邮件/聊天/联盟/心跳 6 项+间隔）
- [ ] README 阶段树更新：交互模型推进到 `[x]`

### A-2 游戏内容设计 `[o]` 设计中

核心玩法规则已有重大推进（编队到达/战斗/机群三组P0决策已确认），但仍有关键空白。

- [x] 编队到达结算分支规则（殖民/拦截/运输/战斗预备）
- [x] 战斗触发条件与两阶段制规则
- [x] 战报格式与胜负判定（逃逸百分比机制）
- [x] 机群操作合法性规则（创建/重组/升级/摧毁）
- [x] 战斗算法设计（需求文档 `docs/gameplay/combat_algorithm_requirements.md` 已归档）
  - [x] 舰载机 vs 舰载机 / 航母 vs 航母 / 航母战阶段的流程（`fleet_combat.pu` 已填充）
  - [x] 逃逸百分比的精确触发时机（`design_decisions.md` §1.2：已达阈值→下回合入航母战，触发即战败，防御方不可逃逸）
  - [x] 伤害/防御/命中等公式骨架（需求文档 §3.1/3.2/3.3，含分组选中/高等级优先/击坠分摊）
- [x] 地面战与占领/撤离流程（`planetary_combat.pu` 已填充）
- [ ] 进度/数值框架初稿
  - [ ] 四色增幅器属性查表设计（每级属性增量 + 升级消耗公式）
  - [ ] 资源产出速率、建造时间、舰队移动速度
  - [ ] 殖民后星球初始状态（建筑？资源？防御？）
- [ ] 玩法规则剩余项
  - [ ] 编队解散规则（是否需要所有航母停泊？航行中是否允许解散？）
  - [ ] 星球放弃条件（有外部舰队/建筑时是否允许？）
  - [ ] 侦察扫描范围与结果格式
  - [ ] 科研系统（哪些项目？周期？效果？）

### A-3 故事大纲 `[ ]` 未开始

- [ ] 继承 vs 原创的设定边界确认
- [ ] 故事背景与世界观初稿
- [ ] 故事大纲文档写入 `docs/`

---

## B — 数据模型设计（有骨架，多处空白）

### B-1 Player / Role 实体 `[ ]` 缺类图

- [ ] Role 实体类图：资源库存(Metal/Gas/Crystal)、等级/经验、联盟ID、持有物品背包、舰队列表、星球列表、逃逸百分比值
- [ ] Role 实体字段与 Apifox `/Role/view/{id}` 接口响应体对齐
- [ ] PDMan 模型中 Role 表补完字段

### B-2 Fleet / Carrier 实体 `[ ]` 缺类图

- [ ] Fleet 实体类图：组成(carriers)、载量(cargo)、出发星球、目标星球、移动状态机、任务类型、气体资源量、航行位置(服务端精确计算)
- [ ] Carrier 实体类图：TYPE(含gravity_interceptor=5)、等级(0~20)、增幅器颜色、机群构成、载荷构成
- [ ] Fleet 状态机设计：idle → depart → moving → (可抛锚) → arrived → (分支结算) → returning → idle
- [ ] Fleet/Carrier 与 Apifox Fleet 接口对齐

### B-3 Planet 实体 `[ ]` 空壳

- [ ] Planet 实体类图：类型、名称、大小、三种资源产出率、效率、建筑列表、持有者、防御值、星门状态
- [ ] Planet 与 Building 的关系图
- [ ] Planet 类图与 Apifox Planet 接口对齐

### B-4 Building 实体 `[ ]` 无类图

- [ ] Building 实体类图：类型(13种枚举)、等级、建造/升级状态、产出速率
- [ ] Building 与 Planet 的关联方式确认

### B-5 Modifier 系统 `[ ]` 仅接口定义

- [ ] Modifier 分类体系：CarrierModifier(战斗) / PlanetModifier(产出) / GlobalModifier(科研)
- [ ] CarrierModifier 具体类图（四色增幅器的字段、计算逻辑）
- [ ] Modifier 触发/生效机制

### B-6 Combat 算法 `[ ]` 有数据结构无算法

- [ ] 舰队战斗计算流程时序图（fleet combat calculation sequence）
- [ ] 星球防御战斗计算流程时序图（planetary combat calculation sequence）
- [ ] 战斗公式骨架：伤害=?、护盾减免=?、命中=?、编队加成=?、逃逸触发时机
- [ ] 战斗结果数据结构定义（战损报告、战利品、遭遇战掠夺上限）

### B-7 Rules Manager `[ ]` "还没想好"

- [ ] 需规则判定的行为清单确认（殖民条件、建造解锁、舰队出征条件、重组合法性、升级条件等）
- [ ] rules.judgement 判定逻辑设计
- [ ] rules.logger 日志方法清单

---

## C — 前后端通信 API 设计

### C-1 API 协议规范 `[x]` 全局约定已确认

- [x] 认证模型：JWT Bearer Token
- [x] 统一响应壳：`{ code, data }` + `{ code, message, detail }`
- [x] 字段命名：camelCase
- [x] 分页约定：邮件→cursor, 列表→offset+limit
- [x] 业务错误码分段设计 → `design_decisions.md` §2.1.1（10xxx~90xxx 全段+码表），`server/services/libs/shared/response.js` 已同步
- [ ] 上述约定写入 Apifox 全局定义

### C-2 事件补完 → API端点推导 `[o]` 设计中

事件驱动设计方法：先补完 ENUMGoFAGameEvents → 再推导 API 端点请求/响应体。

**P0 事件补完（✅ 已完成，写入 `ENUMGoFAGameEvents.js`）**:

- [x] 编队到达结算分支事件 → P7 编队 S2C 已写入（TASKFORCE_COMBAT_PREP/INTERCEPT_TRIGGER/DOCKED/DOCKED_DEPLETED）
- [x] 战斗预备+结算事件 → P8 战斗已写入（MAIL_BATTLE_REPORT 等，COMBAT_RESULT 待补）
- [x] 机群操作响应事件 → P6 机群 S2C 已写入（FLEET_RENAMED/RENAME_FAILED/RECOMPOSE_FAILED）
- [x] 用例图注释同步更新 (已完成部分)

**P1 事件补完（增强级）**:

- [ ] 星球请求响应事件 (6个新增)
- [ ] 建筑失败细分事件 (3个新增)
- [ ] 侦察科研事件 (4个新增)

**P2 事件补完（社交级）**:

- [ ] 联盟外交响应事件 (6个新增)
- [ ] 通信推送事件 (2个新增)

**事件补完完成后 → 推导API端点**:

- [o] 从补完的 C2S 事件 → 推导 31个REST端点的请求体（add_apis 已落成 104 个占位端点，请求/响应体待填）
- [o] 从补完的 S2C 事件 → 推导 31个REST端点的响应体 + 轮询接口（同上，轮询接口已在 §2.2 定义）

### C-3 S2C 推送轮询接口 `[x]` 已定义（design_decisions.md §2.2）

- [x] 战报轮询接口 `GET /api/v1/combat/report/{taskId}` (15分钟间隔)
- [x] 来敌预警接口 `GET /api/v1/radar/alerts` (30秒间隔)
- [x] 邮件未读接口 `GET /api/v1/mail/unread` (60秒间隔)
- [x] 聊天消息接口 `GET /api/v1/chat/{channelId}/recent` (2~5秒间隔)
- [x] 联盟事件接口 `GET /api/v1/alliance/events` (60秒间隔)
- [x] 心跳接口 `GET /api/v1/ping` (30秒间隔)
- [ ] 接口实现（add_apis 占位端点已挂载，轮询语义待实现）

---

## D — 数据库设计

### D-1 表结构 `[o]` 补表方案已定，DDL 待落地（extend_db）

- [o] 36 实体/221 字段盘点完成（PDMaas 模型 + 补表方案：4 缺失表 MAIL_BATTLE_REPORT/MAIL_SPY_REPORT/TASKFORCE_DOCKED/拦截状态 + 5 新表）
- [ ] 补表方案落进 `docs/data_models/GoFA-Remake.pdma` 并重新生成全量 SQLite DDL
- [ ] 主表设计：Account、Role、Planet、System、Atlas、Fleet、Carrier、Alliance、Building、Modifier
- [ ] 关系表设计：Role-Planet、Role-Fleet、Alliance-Role、Fleet-Carrier 等
- [ ] 日志表设计：PlayerActionLog
- [ ] 验证 DDL 与 Apifox 接口数据的一致性

### D-2 数据库选型 `[x]` 已确认

- [x] SQLite先行，DAO层留迁移接口（沿用现有 Database + Sqlite3/NodeSqlite 双连接器）
- [x] MySQL+Redis+MongoDB 暂搁置，等性能瓶颈出现再迁移

---

## E — 模块边界与架构设计

### E-1 网络模块 `[x]` 已确认

- [x] 通信方式：纯HTTP REST（现阶段不用WebSocket）
- [x] S2C推送：HTTP轮询
- [ ] 网络模块职责边界：HTTP路由 + JWT验证 + 连接状态管理
- [ ] 网络模块与 game_entities 的调用关系设计

### E-2 产品整体结构 `[ ]` placeholder

- [ ] `index.md` 补写为服务架构总览文档
- [ ] 后端模块调用关系图（PlantUML 组件图）
- [ ] 前端 UI 结构草稿与 Apifox 接口对齐

### E-3 服务边界 `[ ]` lobby / game / mail 未定

- [ ] 大厅服务(lobby-server)职责确认
- [ ] 游戏服务(server)与大厅服务的接口边界
- [ ] 邮件服务(mail-server)职责确认
- [ ] 各服务是否独立部署还是共用进程？

### E-4 Tick循环 `[x]` 已解决（EventBus 落地）

- [x] EventBus 重写事件机制 + 接入 tick 循环（add_apis 0735b27），定时事件统一走 EventBus
- [x] 固定 tick 频率与掉刻检测已在 main.js 实现（TICK_RATE 可配）
- [x] 结论：保留 1 秒 tick 循环（到达先后判定/资源产出/状态刷新依赖），定时器方案仅作补充

---

## F — 技术选型与约定确认

### F-1 客户端引擎 `[ ]` 未定

- [ ] 客户端引擎选型确认
- [ ] 是否有人负责客户端开发？

### F-2 网络库 `[x]` 已确认

- [x] 现阶段不用WebSocket，不需要WS库选型
- [x] HTTP层继续使用Express

---

## G — 内置指令系统（服务器监控 + 日常管理）

> 设计文档：`docs/service_structure/server/commands/index.md`（总览）、`command_reference.md`（指令参考）、`api_bridge.md`（API 映射）。

### G-1 指令框架 `[x]` 已完成

- [x] CommandBus 增强：meta 注册（description/usage/category）、`executeAsync` 输出收集、`ctx.reply` 双通道（终端→日志 / API→收集）
- [x] 权限模型：终端物理访问 = 最高权限；API 走 `isAdminAuthorized`（JWT + 数据库管理员资格 / 口令兜底）
- [x] 分支指令系统盘点：add_apis / events_extended / extend_db 均与当前 CommandBus 同源，无独立指令集需合并（结论写入 `index.md` §7）

### G-2 已实现指令（P0，15 个） `[x]` 已完成

- [x] 监控：status / metrics / uptime / health / eventqueue / dbinfo
- [x] 管理：help / version / echo / halt / component
- [x] 数据：players / player / dbquery（只读白名单 SELECT/PRAGMA/EXPLAIN）
- [x] 事件：publish（即时/延时/payload）
- [x] 配套 API 真实实现：GET /health、GET /admin/status、GET /admin/metrics、GET /admin/event-queue、GET /admin/components、GET /admin/players/online、POST /admin/command（远程控制台桥）
- [x] 顺带修复：`main.js` tick 耗时写入 `this.time.last_tick_elapse`（此前写错对象导致 metrics/调度读到 -1）

### G-3 规划指令（依赖前置，落地时实现）

- [ ] P1 玩家管理：kick / ban / unban / grant / revoke / give / setresource（前置：在线连接层 + player_role 等业务表 + 聊天/广播事件）
- [ ] P1 广播：broadcast（前置：在线连接层 + 聊天推送）
- [ ] P2 运维：save / reloadconfig / restart / maintenance / whitelist（前置：存档/配置热加载）
- [ ] P2 地图：mapinfo / regenmap（前置：map_* 表 + 地图再生成）
- [ ] P2 日志：loglevel / tail（前置：Logger 动态级别 + 内存日志缓冲）
- [ ] P2 管理：announce（前置：邮件/公告系统）

---

## 检查项（定期回顾）

- [ ] README 阶段树是否准确反映当前状态？每次设计推进后同步更新
- [ ] 已有代码（game_entities、libs）是否与设计文档对齐？设计变更时同步代码
- [ ] Apifox 接口状态从「设计中」推进到「已确认」的条件：请求体+响应体+字段定义全部填写
- [ ] 事件枚举补完后，与用例图注释一致性检查
