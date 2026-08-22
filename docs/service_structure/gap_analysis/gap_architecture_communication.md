# 差距分析：架构与通信层（设计文档声明 vs 代码现状）

> 作者：差距分析子代理A（架构与通信层）
> 分析范围：Phase 1（差距分析）的一半 —— 聚焦架构与通信层（决策A API约定 / 决策B S2C推送 / 微服务边界）。
> 基准文档：`docs/service_structure/design_decisions.md`（v1.2.1，2026-07-26）、`TODOs.md`、`README*.md`、`docs/service_structure/**`。
> 代码基准：仓库 `add_apis` 分支，只读分析，未改动任何代码。

**背景一句话**：项目设计层已确认「JWT + 统一响应壳 + HTTP 轮询（不用 WebSocket）」三大全局技术决策，但游戏服务器（`server/`）当前是一个纯 tick 循环 + EventManager + game_entities 的领域层程序，HTTP/API 通信层在代码中处于**零实现**状态，且遗留了一批与决策相矛盾的 WebSocket 死代码。

---

## 差距清单（按优先级分级）

### P0 — 阻断级（游戏服对外通信缺承载，前后端无法对接）

| # | 声明（文档/决策） | 现状（代码） | 差距 | 影响面 | 建议 |
|---|---|---|---|---|---|
| P0-1 | 决策A/B 依赖 HTTP REST；TODOs F-2「HTTP 层继续使用 Express」`[x]`、E-1「纯 HTTP REST」`[x]` | `server/main.js` 是纯 tick 循环游戏服务器（`Main extends EventEmitter` + `setTimeout` tick），仅加载 logger / commands / db / deployer / game，**未挂载任何 express app、router 或 http server**。全局 grep：`server/` 目录内无 `require('express')`、无 `app.listen`、无 `http.createServer`、无 `res.json`。`server/services/libs/network/` 下只有 3 个文件：`server.js`（WS 遗留）、`connections_handler.js`（WS 重复拷贝）、`heartbeats.js`（0 字节空文件），**均无 HTTP 路由骨架**。 | **游戏服 HTTP 层零实现**。唯一真实 Express 实现在 `admin-server/`（静态站），与游戏 API 无关。 | 前后端无法通信；所有 `/api/v1/*` REST 端点、轮询接口均无代码承载；这是架构最基础的缺口。 | 新建 `server/services/libs/network/` 下的 HTTP 层骨架：express app + Router，在 `main.js` 中与 tick 循环共存挂载；先落地 `GET /api/v1/ping` 心跳端点，并把 Router 与 EventManager 打通（命令 → `dispatch(event, taskId)`）。 |
| P0-2 | 决策A：JWT Bearer + 统一响应壳 `{code:0,data}`/`{code:40001,message,detail}` + camelCase + 分页 + 版本 `/api/v1`（见 `CLS_unified_response.pu`、`SEQ_command_event_query.pu`） | ① `server/package.json` **无 jsonwebtoken / jose / bcrypt 依赖**，JWT 无法实现；② 代码中无任何认证中间件、响应封装、错误码枚举、路由；③ `/api/v1` 仅出现在 docs/.pu 与 TODOs 文本里，代码 0 命中；④ `CLS_unified_response.pu` 的 `ResponseEnvelope`/`CommandAck`/`ErrorResponse`/`Pagination` 类图无对应 JS 实现；⑤ `SEQ_command_event_query.pu` 的命令受理回执 / 心跳承载事务（taskId 关联）无代码。 | API 约定 **100% 停留在文档层，代码零落地**，且缺 JWT 依赖这一硬缺口。 | 客户端无任何可对接的契约；与 P0-1 同源，是「HTTP 零实现」在契约维度的具体展开。 | 与 P0-1 一并落地：① 响应壳工具（success/error/fail 三态封装）；② 业务错误码枚举（10xxx~90xxx 分段，补上 design_decisions 中「待细化」部分）；③ 新增 `jsonwebtoken` 依赖 + JWT 校验中间件；④ camelCase 序列化约定；⑤ 分页工具（cursor / offset+limit）。 |

### P1 — 高优先级（决策与现状矛盾、污染后续开发）

| # | 声明（文档/决策） | 现状（代码） | 差距 | 影响面 | 建议 |
|---|---|---|---|---|---|
| P1-1 | 决策B / TODOs「现阶段不用 WebSocket」`[x]`、F-2「不需要 WS 库选型」`[x]` | ① `server/package.json` 仍声明 `express-ws@5.0.2`、`nodejs-websocket@1.7.2`；② `server/services/libs/network/server.js` 是**完整可运行的 nodejs-websocket WS 服务器**（硬编码注册/登录/心跳协议、`listen(3000)`、直接操作 sqlite3 `test.db`，且文件内 `sqlite3` 被注释掉，运行即崩）；③ `connections_handler.js` 是 `server.js` 连接逻辑的重复拷贝；④ `heartbeats.js` 0 字节空文件；⑤ **无任何代码 require 这些文件**（grep `libs/network` / `connections_handler` / `network/server` 均无命中）。 | 属于**纯遗留依赖 + 孤儿死代码**（未挂载、非活跃），但决策声明与依赖/源码直接矛盾。`server.js` 若被误 require 会硬编码监听 3000，与 `admin-server` 端口 3000 **冲突**；`nodejs-websocket` 已多年未维护（安全隐患）。 | 误导后续开发者以为 WS 方案仍在用；依赖膨胀；端口冲突 + 安全风险隐患。 | ① 从 `server/package.json` 移除 `express-ws`、`nodejs-websocket`；② 归档/删除 `network/server.js`、`connections_handler.js`（或整体重写为 HTTP 层骨架）；③ `heartbeats.js` 空壳补写为 HTTP 心跳逻辑或删除。 |
| P1-2 | TODOs「最后更新 2026-07-26」，F-2/E-1/C-1 均标 `[x]` 已确认 | 逐条核对见下表。核心矛盾：**设计决策已确认甚至已落代码，但 TODOs 标记与代码现状、与最新 design_decisions 三者不一致**。 | 见下表逐项。 | TODOs 作为「设计阶段待办清单」已失去可信度，无法指导排期。 | 逐项修正 TODOs 状态标记（详见下表「建议」列），并更新「最后更新」时间戳。 |

**P1-2 逐条核对明细**：

| TODOs 项 | 声明状态 | 代码/文档现状 | 判定 | 建议 |
|---|---|---|---|---|
| F-2 网络库「HTTP 继续使用 Express」 | `[x]` 已确认 | 游戏服 `server/` 0 处使用 Express（仅 admin-server 用）；`express` 仅在 package.json 声明 | **声明≠实现**：选型确认了但游戏服无 Express 骨架 | 保留「选型已确认」含义，但补「游戏服 Express 骨架未建」现状，或把「网络模块职责边界」E-1 子项联动置为进行中 |
| F-2「不需要 WS 库选型」 | `[x]` 已确认 | package.json 仍含 express-ws + nodejs-websocket | **决策与依赖声明冲突** | 与 P1-1 一并清理依赖 |
| E-1 网络模块「纯 HTTP REST」 | `[x]` 已确认 | `network/` 目录实际内容 = WS 遗留代码 + 空文件，无任何 HTTP REST 代码 | **声明≠实现**：目录内容与「纯 HTTP REST」相反 | 同上，清理 WS 遗留、补 HTTP 骨架 |
| E-1「网络模块职责边界（HTTP路由+JWT验证+连接状态管理）」 | `[ ]` 未完成 | 无 | 一致（确实未设计） | 保持 `[ ]`，作为 P0-1 落地的设计前置 |
| C-1 API 协议「已确认」 | `[x]` 已确认 | 同节内「业务错误码分段设计（10xxx~90xxx）」「写入 Apifox 全局定义」仍 `[ ]`；design_decisions 也写「业务错误码设计（待细化）」 | **部分确认**：「已确认」与「待细化」并存 | 把 C-1 拆成「已确认」与「待细化」两档，勿整体标 `[x]` |
| C-2「P0 事件补完 → 更新 ENUMGoFAGameEvents.js」 | `[ ]` 未完成 | `ENUMGoFAGameEvents.js`（356 行）**已含** `TASKFORCE_COMBAT_PREP` / `TASKFORCE_INTERCEPT_TRIGGER` / `MAIL_BATTLE_REPORT` / `FLEET_RENAMED` / `ALLIANCE_DISBAND` / `MAIL_SPY_REPORT` / `SPY_INCOMING_COUNTER` / `PLANET_RESOURCE_UPDATE` 等；与 design_decisions 第四节「已补完事件（commit 5fe92b1c 已写入枚举）」一致 | **TODOs 严重过时**：事件已落枚举，TODOs 仍标未完成 | 把 C-2 的 P0 事件补完项更新为 `[x]`（剩余 `TASKFORCE_ADD/REMOVE_MEMBER`、`FLEET_UPGRADED` 等仍为待补，与 design_decisions 待补完表对齐） |
| C-3 S2C 推送轮询接口「待设计」 | `[ ]` 待设计 | design_decisions 决策B 已**完整列出** 5 个轮询接口表 + 心跳接口（combat/radar/mail/chat/alliance + ping，含间隔） | **文档不同步**：已设计内容在 TODOs 仍标「待设计」 | C-3 改为 `[x]` 或标注「详见 design_decisions 决策B」 |

| # | 声明（文档/决策） | 现状（代码） | 差距 | 影响面 | 建议 |
|---|---|---|---|---|---|
| P1-3 | README / `server_overall_structure.pu` 画「Lobby Server + Server Cluster(1/2/3) + Database Cluster」多服务；决策A 依赖「大厅登录后颁发 JWT → 游戏服验证」；`COM_api_event_domain.pu` 提到 `Router /api/v1 + /admin`；TODOs E-3「lobby/game/mail 未定」`[ ]` | 仓库仅有 `server/`（游戏服，tick 循环，无 HTTP）与 `admin-server/`（最小 Express 静态站，端口 3000）两个目录。**无 lobby-server、无 mail-server**。 | 文档画多服集群，现实是单游戏服 + 管理后台。lobby（JWT 颁发方）、mail（`MAIL_BATTLE_REPORT` 战报邮件承载）均未立项。 | 决策A 的 JWT 流程缺起点（无大厅 `/auth/login`、`/auth/refresh`）；邮件/战报服务无承载进程；多服部署图与实际不符。 | 明确 MVP 服务边界：先决定 lobby 是否并入 server 单进程（减少跨服复杂度）还是独立进程；在 `index.md`（现为 placeholder）补写服务架构总览，与 `server_overall_structure.pu` 对齐。 |

### P2 — 低优先级（文档内部一致性 / 清理项）

| # | 声明（文档/决策） | 现状（代码） | 差距 | 影响面 | 建议 |
|---|---|---|---|---|---|
| P2-1 | 决策B「现阶段不用 WebSocket」 | `SEQ_event_S2C_C2S_paradigms.pu` 仍以「WebSocket: Invoke event / WebSocket: Event with minimum data load」描述 S2C 事件范式 | **文档内部冲突**：该图未随决策B 更新，S2C 描述与 HTTP 轮询决策矛盾 | 误导后来者以为 S2C 走 WS | 将该图改为「服务端写入轮询缓存 → 客户端 HTTP 轮询拉取」范式，或标注「已废弃（见决策B）」 |
| P2-2 | TODOs E-2「`index.md` 补写为服务架构总览文档」`[ ]` | `docs/service_structure/index.md` 内容仅 `// placeholder` | 服务架构总览文档缺失 | 新协作者无架构入口 | 补写 `index.md`，汇总 server / admin-server / lobby / mail 边界与依赖方向 |
| P2-3 | 决策B「心跳机制：客户端每 30 秒发 `GET /api/v1/ping`」 | `server/services/libs/network/heartbeats.js` 为 0 字节空文件；无任何 HTTP 心跳实现 | 心跳组件空壳，无代码 | 当前无影响（HTTP 层尚未建），但属遗留空壳 | 在 P0-1 建 HTTP 层时一并实现心跳逻辑，或删除空文件 |

---

## 结论

1. **整体状态：设计已决策、代码零落地。** 游戏服务器（`server/`）的代码只覆盖领域层（`EventEmitter` tick 循环 + `EventManager` 事件总线 + `game_entities` 领域实体 + `Database`/双连接器），**HTTP/API 通信层完全缺失**（P0-1、P0-2）。三大全局技术决策（决策A API约定、决策B HTTP轮询）在代码中无任何承载。
2. **决策B 与代码现状方向相反。** 一方面决策明确「不用 WebSocket」，另一方面 `package.json` 仍声明 `express-ws` + `nodejs-websocket`，且 `network/` 下残留完整可运行的 WS 服务器源码（孤儿死代码，未挂载），并含硬编码端口 3000 与 admin-server 冲突隐患（P1-1）。
3. **文档层内部不一致，TODOs 明显过时。** TODOs 多处「已确认 `[x]`」与代码零实现不符（F-2/E-1/C-1）；事件枚举已按 design_decisions 补完但 TODOs C-2 仍标未完成；C-3 已设计的轮询接口在 TODOs 仍标「待设计」；`SEQ_event_S2C_C2S_paradigms.pu` 仍用 WS 描述 S2C（P1-2、P2-1、P2-2）。
4. **微服务边界未落地。** 文档画多服集群（lobby/mail/game），现实仅 `server/` + `admin-server/`，JWT 流程缺大厅起点（P1-3）。
5. **正面确认（非本层重点，供参考）**：决策C（数据库）代码现状与声明一致 —— `services/libs/db/` 下 `Database.js` + `Sqlite3Connector.js` + `NodeSqliteConnector.js` + `IDBConnector.js` 双连接器 + DAO 抽象真实存在；事件枚举 `ENUMGoFAGameEvents.js`（356 行）已按 design_decisions 第四节补完。

**最关键的 3 条**：① P0-1 游戏服 HTTP 层零实现，前后端无法通信；② P0-2 API 约定（JWT/响应壳/camelCase/分页/版本）零落地且缺 jsonwebtoken 依赖；③ P1-1 WebSocket 遗留死代码与依赖声明和「不用 WS」决策直接矛盾，须清理。
