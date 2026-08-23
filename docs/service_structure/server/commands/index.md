# GoFA-Remake 内置指令系统设计总览

> 版本: v0.1 | 日期: 2026-08-23 | 分支: more_builtincommands
> 配套文档: [`command_reference.md`](command_reference.md)（指令参考大全）、[`api_bridge.md`](api_bridge.md)（控制台指令 ↔ 管理 API 映射）

---

## 当前概况与下一步

- **现状（P0 已落地）**：15 个内置指令（监控 6 / 管理 5 / 数据 3 / 事件 1）+ 7 个管理 API 真实端点 + CommandBus 增强（meta 注册 / 异步执行 / 双通道输出），测试 93 passing。提交 `more_builtincommands@6e6aac4`。
- **下一步（P1）**：玩家管理指令（kick / ban / grant / give 等）与 broadcast 广播 —— 前置是**在线连接层**（现有 `network/server.js` 为遗留 WS 代码未接入）与 `player_role` 等业务表落地。
- **远期（P2）**：运维（save / reloadconfig / restart / maintenance / whitelist）、地图（mapinfo / regenmap）、日志（loglevel / tail）—— 依赖存档/配置热加载与地图再生成流程。

---

## 1. 目的与范围

为服务器提供**运维监控**与**日常管理**两方面的内置指令能力：

- **服务器监控**：运行状态、tick 指标、健康检查、事件队列、数据库、组件在线状态。
- **日常管理**：定时停机、指令远程执行（API 桥）、账户/数据查询、事件发布等运营操作。

设计上分阶段落地：**P0（本轮实现）** 只做当前数据库与架构**已经能支撑**的指令；
**P1/P2（规划）** 记录完整指令集与依赖前置，待对应系统（在线连接层、玩家角色表、聊天/广播事件等）就绪后逐项实现。
现阶段以「文档完备、覆盖充分」为主，实现与文档标注一一对应（见 `command_reference.md` 状态列）。

---

## 2. 参考游戏指令体系

| 游戏 | 借鉴点 | 来源 |
|------|--------|------|
| ARK: Survival Evolved | 控制台 `cheat` 指令 + RCON 远程管理；`GiveItem/SetPlayerPos/DestroyAll` 等运营指令命名风格 | [Host Havoc Wiki](https://hosthavoc.com/wiki/game-servers/ark-survival-evolved/admin-commands) |
| Palworld | `Broadcast/Shutdown/Save` 等服务器运维指令 + RCON/REST API 双通道执行 | [Doomhosting](https://www.doomhosting.com/help/articles/palworld-admin-commands)、[ConnectHosting（含 REST API）](https://connecthosting.net/blog/palworld-admin-commands-rest-api#1) |
| Minecraft | 分层权限模型（op 分级）、`/help` 分组展示、`/say` 广播、`/list` 在线列表 | 通用服务器控制台实践 |
| Terraria / Rust | 服务器控制台直接输入、日志联动、`kick/ban/unban` 玩家管理指令族 | 通用服务器控制台实践 |
| 星际类 SLG（GoF 系） | 指令应与「角色/舰队/星球/联盟」业务域对齐，运营指令（资源发放、公告、封禁）贴近实际运营场景 | 本项目设计决策 |

**共性提炼**：

1. **双通道执行**：控制台直接输入 + 远程管理（RCON / REST API），Palworld 与 ARK 均如此 → 本项目以 `POST /api/v1/admin/command` 作为远程控制台。
2. **指令分组**：监控 / 管理 / 玩家 / 地图 / 日志，`help` 按组展示（Minecraft 风格）。
3. **只读查询与写操作分离**：查询类（status/metrics/health）对运营频繁、风险低；写操作（halt/broadcast/kick）需鉴权与确认。
4. **与事件总线联动**：指令是触发源而非实现体——停机走 `SERVER_SHUTDOWN` 事件、组件状态走 `SERVER_COMPONENT_ONLINE/OFFLINE` 事件，与游戏内事件体系保持一致（对应 `ENUMGoFAGameEvents.js` 的「服务端内部非业务逻辑事件」区）。

---

## 3. 架构

> 架构图：`COM_command_architecture.pu`（PlantUML 组件图；本地安装 PlantUML 编译查看，或使用在线编译器 <http://www.plantuml.com/plantuml>）。

**组件职责**：

| 组件 | 职责 | 文件 |
|------|------|------|
| `CommandBus` | 命令注册表、终端输入、同步/异步执行、help 分组、输出收集 | `server/services/libs/commands/CommandBus.js` |
| `Commands` | 业务指令实现集合（按分类导出），由 Main 注册 | `server/services/libs/commands/Commands.js` |
| `ComponentRegistry` | 组件在线状态注册表（内存），指令与 API 共用 | `server/services/libs/commands/ComponentRegistry.js` |
| `Main` | 持有 CommandBus/db/game/event_bus；`executeCommand(name,...)` 暴露给 API | `server/main.js` |
| admin API | 远程控制台桥 + 监控端点（读取 Main 与注册表） | `server/services/GoFA-Remake/api/admin.js` |

**输出模型**：指令处理函数签名统一为 `(args: string[], ctx: CommandContext) => void | Promise<void>`。
`ctx.reply(text)` 将结果写入当前通道——终端执行时转发给日志库（`Log.info`），API 执行时收集进响应 `data.output[]`（Palworld REST 模式）。指令**不直接持有 Express/readline 依赖**，保证可测试性。

---

## 4. 权限模型

| 通道 | 鉴权 | 说明 |
|------|------|------|
| 控制台终端 | 物理访问即视为最高权限 | 与 ARK/Terraria 控制台一致 |
| 管理 API | JWT 身份 + 数据库 `player_role.role_privilege == 'admin'`（或口令兜底） | 复用 `adminService.isAdmin` + `isAdminAuthorized` |
| 未来分级 | `admin` / `mod` 两级 | P2 规划：危险指令（halt/dbquery）限 admin |

`CommandBus` 不内置权限判断——权限在**入口**（终端直接放行、API 入口鉴权）处执行，指令本身保持纯逻辑，避免职责耦合。

---

## 5. 指令分类

| 分类 | 覆盖 | 典型指令 |
|------|------|----------|
| 监控 (monitor) | 服务器运行状态与性能 | `status` `metrics` `uptime` `health` `eventqueue` `dbinfo` |
| 管理 (management) | 运营与生命周期 | `help` `version` `echo` `halt` `component` `broadcast`* |
| 数据 (data) | 数据库查询（只读） | `players` `player` `dbquery` |
| 事件 (event) | 事件总线联动 | `publish` |
| 玩家 (player) *规划* | 在线/封禁/资源 | `kick` `ban` `unban` `grant` `give` |
| 运维 (ops) *规划* | 存档/配置/维护 | `save` `reloadconfig` `maintenance` `whitelist` |
| 地图 (map) *规划* | 星图信息与再生成 | `mapinfo` `regenmap` |
| 日志 (log) *规划* | 日志级别与追踪 | `loglevel` `tail` |

> `*` 表示规划中（依赖在线连接层或聊天事件），详见 `command_reference.md`。

---

## 6. 阶段规划

### P0 — 监控 + 基础管理（本轮，已实现）

当前架构**已经能支撑**的能力：`Main.time`（tick 指标）、`Main.stage`、`EventBus`（发布/订阅/延时队列）、`Database`（SQLite 执行）、`ComponentRegistry`（新增）。实现指令：

`status` `metrics` `uptime` `health` `eventqueue` `dbinfo` `help` `version` `echo` `halt` `component` `players` `player` `dbquery` `publish`（15 个）

配套 API：`GET /health` `GET /admin/status` `GET /admin/metrics` `GET /admin/event-queue` `GET /admin/components` `GET /admin/players/online` `POST /admin/command`（7 个真实端点）。

### P1 — 玩家管理与广播（近期）

前置依赖：在线连接层（当前 `network/server.js` 为遗留 WS 代码未接入）、`player_role` 等业务表落地、聊天/广播事件就绪。

规划指令：`kick` `ban` `unban` `grant` `revoke` `give` `setresource` `broadcast` `mailto` `announce`。

### P2 — 运维与地图（远期）

前置依赖：存档/配置热加载、地图再生成流程、日志分级体系。

规划指令：`save` `reloadconfig` `restart` `maintenance` `whitelist` `mapinfo` `regenmap` `loglevel` `tail`。

---

## 7. 分支指令系统盘点（拉取合并结论）

对 `add_apis` / `events_extended` / `extend_db` 三个分支的指令系统进行了盘点：

| 分支 | 指令相关文件 | 结论 |
|------|--------------|------|
| `add_apis` | `CommandBus.js` `Commands.js`（与当前分支同源） | 已含于当前分支，无需合并 |
| `events_extended` | `shared/commandLine.js`（旧版，事件监听式注册） | 已被 `CommandBus` 取代（提交 76c749a 删除死代码），无独立指令集 |
| `extend_db` | `CommandBus.js` `Commands.js`（与当前分支同源） | 已含于当前分支，无需合并 |

历史可借鉴点（已融入本次实现）：

1. 旧 `Commands.js` 的「`exit`/`help` 核心命令与业务命令分离」决策 → 保留：`help` 内置，`exit` 由 Main 绑定。
2. 旧 `commandLine.js` 的 `registerCommand` 事件监听式注册 → 升级为 `CommandBus` 注册表 + 批量注册（`registerBatch`）。
3. `31d467a` 提交中的 `onCommand` 简化执行思路 → 演化为 `execute / executeAsync` 双通道。

结论：**无跨分支的独立指令系统需要合并**，本次在现有 CommandBus 谱系上直接增强实现。

---

## 8. 与现有文档的关系

- 事件枚举：`server/services/GoFA-Remake/event_manager/ENUMGoFAGameEvents.js`「服务端内部非业务逻辑事件」区（SERVER_* 系列）为指令联动目标。
- 管理 API 端点清单：`docs/service_structure/server/api/endpoints_admin.md`（14 个端点，本轮将其中 7 个从占位升级为真实实现）。
- 错误码分段：`docs/service_structure/design_decisions.md` §2.1.1 + `server/services/libs/shared/response.js`。
- 待办总表：`TODOs.md`（新增「指令系统」段落跟踪进度）。
