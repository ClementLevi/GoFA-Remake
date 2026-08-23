# GoFA-Remake 内置指令参考大全

> 版本: v0.1 | 日期: 2026-08-23
> 状态标记: ✅ 已实现（P0） | 🟡 部分实现 | ⬜ 规划中（P1/P2）
> 语法约定: `<>` 必填参数，`[]` 可选参数；参数以空格分隔（终端）或数组传入（API）。
> 指令入口: 控制台终端（`[ GoFA ] > `）与 `POST /api/v1/admin/command` 双通道，详见 [`api_bridge.md`](api_bridge.md)。

---

## 当前概况

- **已实现（P0，15 个）**：监控 6（status / metrics / uptime / health / eventqueue / dbinfo）、管理 5（help / version / echo / halt / component）、数据 3（players / player / dbquery）、事件 1（publish）。
- **规划中（17 个）**：P1 玩家管理 8 个（kick / ban / unban / grant / revoke / give / setresource / broadcast）、P2 运维/地图/日志 9 个 —— 前置依赖见各指令表。
- 完整清单与统计见文末「汇总」。

---

## 一、监控类 (monitor)

### 1.1 status — 服务器运行状态

| 项 | 值 |
|----|----|
| 语法 | `status` |
| 说明 | 汇总展示运行阶段、版本、tick 计数、运行时长、游戏生命周期、DB 账户数、HTTP 连接数。 |
| 数据来源 | `Main.stage` / `Main.time` / `Main.game._gamelife` / `player_account` 表 / `http_server.getConnections` |
| 示例 | `> status` → `stage=running, version=1.0.0, tick=12345, uptime=4123s, accounts=3, connections=2` |
| 状态 | ✅ 已实现 |

### 1.2 metrics — tick 运行指标

| 项 | 值 |
|----|----|
| 语法 | `metrics` |
| 说明 | 展示 TICK_RATE、tick 间隔、最近 N 次 tick 耗时、平均耗时、掉刻阈值、是否掉刻（`detectLag`）。 |
| 数据来源 | `Main.time.recentTicksElapses` / `last_tick_elapse` / `LAG_WARN_THRESHOLD` |
| 示例 | `> metrics` → `rate=5, interval=200ms, last=3.2ms, avg=3.1ms, threshold=1000ms, lag=false` |
| 状态 | ✅ 已实现 |

### 1.3 uptime — 运行时长

| 项 | 值 |
|----|----|
| 语法 | `uptime` |
| 说明 | 启动时间戳、运行秒数、累计 tick 数。 |
| 数据来源 | `Main.time.startTime` / `TICK` |
| 示例 | `> uptime` → `started=2026-08-23 10:00:00, uptime=4123s, ticks=20615` |
| 状态 | ✅ 已实现 |

### 1.4 health — 健康检查

| 项 | 值 |
|----|----|
| 语法 | `health` |
| 说明 | 检查数据库连通性（`db.test()`）、事件总线、HTTP 服务、tick 循环是否存活。 |
| 数据来源 | `db.test` / `event_bus` / `http_server` / `Main.time.TICK` |
| 示例 | `> health` → `db=ok, eventBus=ok, http=ok, tick=alive` |
| 状态 | ✅ 已实现 |

### 1.5 eventqueue — 事件队列状态

| 项 | 值 |
|----|----|
| 语法 | `eventqueue` |
| 说明 | 展示事件总线当前 tick、延时事件数量、最早到期事件、订阅主题数与各主题消费者数。 |
| 数据来源 | `EventBus.delayed` / `subscribers` |
| 示例 | `> eventqueue` → `tick=12345, delayed=2, nextDue=12350, topics=5` |
| 状态 | ✅ 已实现 |

### 1.6 dbinfo — 数据库信息

| 项 | 值 |
|----|----|
| 语法 | `dbinfo` |
| 说明 | 展示数据库类型（config.DB_TYPE）、文件路径（config.DB_URL）、表清单（sqlite_master）。 |
| 数据来源 | `Main.config` / `db.execute("SELECT name FROM sqlite_master ...")` |
| 示例 | `> dbinfo` → `type=sqlite3, file=:memory:, tables=[player_account]` |
| 状态 | ✅ 已实现 |

---

## 二、管理类 (management)

### 2.1 help — 帮助

| 项 | 值 |
|----|----|
| 语法 | `help [分类]` |
| 说明 | 按分类分组列出已注册指令与一句话说明；带分类参数时只显示该分类。 |
| 数据来源 | CommandBus 注册表 meta |
| 示例 | `> help monitor` → 列出监控类指令 |
| 状态 | ✅ 已实现（CommandBus 内置增强） |

### 2.2 version — 版本与配置摘要

| 项 | 值 |
|----|----|
| 语法 | `version` |
| 说明 | 展示 package.json 版本、服务器名、端口、tick 频率、数据库配置等关键配置项。 |
| 数据来源 | `GameEvent.version`（package.json）/ `Main.config` |
| 示例 | `> version` → `gofa-remaster-server v1.0.0, name=GoFA, port=8080, tickRate=5` |
| 状态 | ✅ 已实现 |

### 2.3 echo — 回显

| 项 | 值 |
|----|----|
| 语法 | `echo <文本...>` |
| 说明 | 将参数原样回显（空格用引号或直接拼接）。用于脚本调试与验证远程通道连通。 |
| 示例 | `> echo hello world` → `hello world` |
| 状态 | ✅ 已实现 |

### 2.4 halt — 定时停机

| 项 | 值 |
|----|----|
| 语法 | `halt <秒数>` |
| 说明 | 设置定时任务，N 秒后经事件总线发布 `SERVER_SHUTDOWN`，触发 `exit` 指令优雅停机。与 `POST /admin/halt` 语义一致（同一事件链路）。 |
| 数据来源 | `EventBus.publish(GoFAGameEvent SERVER_SHUTDOWN, delay)` |
| 示例 | `> halt 60` → `已设置停机定时任务：60 秒后触发` |
| 状态 | ✅ 已实现 |

### 2.5 component — 组件在线状态

| 项 | 值 |
|----|----|
| 语法 | `component <组件名> <online|offline>` |
| 说明 | 设置/查询组件在线状态。变更时发布 `SERVER_COMPONENT_ONLINE/OFFLINE` 事件，并写入 `ComponentRegistry`。无参数时为查询模式列出全部组件。 |
| 数据来源 | `ComponentRegistry` + 事件发布 |
| 示例 | `> component chat online` → `chat: online`；`> component` → 列表 |
| 状态 | ✅ 已实现 |

### 2.6 broadcast — 全服广播 ⬜

| 项 | 值 |
|----|----|
| 语法 | `broadcast <消息文本>` |
| 说明 | 向全体在线玩家推送公告。依赖在线连接层与聊天推送事件（P1 前置）。 |
| 前置依赖 | 在线连接层、聊天广播事件 |
| 状态 | ⬜ P1 规划 |

### 2.7 announce — 服务器公告 ⬜

| 项 | 值 |
|----|----|
| 语法 | `announce <标题> <内容>` |
| 说明 | 全服公告（含标题/内容），落地为邮件或公告栏。依赖邮件/公告系统。 |
| 状态 | ⬜ P2 规划 |

---

## 三、数据类 (data)

### 3.1 players — 账户列表

| 项 | 值 |
|----|----|
| 语法 | `players [limit]` |
| 说明 | 列出 `player_account` 表账户（ID、登录账号、注册时间、上次登录），默认最多 20 条。 |
| 数据来源 | `player_account` 表 |
| 示例 | `> players 5` → 账户列表 |
| 状态 | ✅ 已实现 |

### 3.2 player — 账户详情

| 项 | 值 |
|----|----|
| 语法 | `player <账户ID>` |
| 说明 | 查看指定账户完整信息（不含密码摘要）。 |
| 数据来源 | `player_account` 表 |
| 示例 | `> player acc-0001` → 账户详情 |
| 状态 | ✅ 已实现 |

### 3.3 dbquery — 只读 SQL 查询

| 项 | 值 |
|----|----|
| 语法 | `dbquery <SQL语句>` |
| 说明 | 执行**只读** SQL 查询（白名单：`SELECT` / `PRAGMA` / `EXPLAIN` 开头）。任何写操作（INSERT/UPDATE/DELETE/DROP 等）被拒绝。返回行数以 JSON 摘要形式展示。 |
| 安全约束 | 仅白名单前缀；禁止写语句；禁止多语句注入 |
| 示例 | `> dbquery SELECT * FROM player_account LIMIT 2` → 查询结果 |
| 状态 | ✅ 已实现 |

---

## 四、事件类 (event)

### 4.1 publish — 发布事件

| 项 | 值 |
|----|----|
| 语法 | `publish <事件类型> [延时tick数] [payloadJson]` |
| 说明 | 向事件总线发布任意事件（默认即时，可指定延时 tick）。payload 为可选 JSON 对象。 |
| 数据来源 | `EventBus.publish(GoFAGameEvent)` |
| 示例 | `> publish server_component_online`；`> publish server_shutdown 25`（延时 25 tick） |
| 状态 | ✅ 已实现 |

---

## 五、玩家管理类 (player) ⬜ P1

| 指令 | 语法 | 说明 | 前置依赖 | 状态 |
|------|------|------|----------|------|
| `kick` | `kick <玩家ID> [原因]` | 断开指定玩家连接 | 在线连接层（`SERVER_DISCONNECT_CLIENT`） | ⬜ P1 |
| `ban` | `ban <账户ID> [时长] [原因]` | 封禁账户 | `player_account` 封禁字段 + 认证服务 | ⬜ P1 |
| `unban` | `unban <账户ID>` | 解封账户 | 同上 | ⬜ P1 |
| `grant` | `grant <玩家ID> admin\|mod` | 授予管理权限 | `player_role.role_privilege` 写 | ⬜ P1 |
| `revoke` | `revoke <玩家ID> admin\|mod` | 收回管理权限 | 同上 | ⬜ P1 |
| `give` | `give <玩家ID> <物品> <数量>` | 发放物品/道具 | `player_role_item` 表 + 背包系统 | ⬜ P1 |
| `setresource` | `setresource <玩家ID> <金属\|气体\|晶体> <数量>` | 设置角色资源 | 角色资源表 | ⬜ P1 |

---

## 六、运维类 (ops) ⬜ P2

| 指令 | 语法 | 说明 | 前置依赖 | 状态 |
|------|------|------|----------|------|
| `save` | `save` | 手动存档（DB checkpoint） | SQLite WAL checkpoint | ⬜ P2 |
| `reloadconfig` | `reloadconfig` | 热加载配置 | 配置热加载机制 | ⬜ P2 |
| `restart` | `restart [延迟秒]` | 重启服务器 | 进程守护（pm2 已在依赖中） | ⬜ P2 |
| `maintenance` | `maintenance on\|off` | 维护模式开关（拒绝登录） | 登录流程接入 | ⬜ P2 |
| `whitelist` | `whitelist add\|remove <账户ID>` | 白名单管理 | 登录流程接入 | ⬜ P2 |

---

## 七、地图类 (map) ⬜ P2

| 指令 | 语法 | 说明 | 前置依赖 | 状态 |
|------|------|------|----------|------|
| `mapinfo` | `mapinfo` | 星图信息（尺寸、星系/星球数） | `map_*` 表 + 地图生成器 | ⬜ P2 |
| `regenmap` | `regenmap` | 重新生成星图（危险操作） | 地图再生成流程 | ⬜ P2 |

---

## 八、日志类 (log) ⬜ P2

| 指令 | 语法 | 说明 | 前置依赖 | 状态 |
|------|------|------|----------|------|
| `loglevel` | `loglevel <debug\|info\|warn\|error>` | 动态调整日志级别 | Logger 动态级别 | ⬜ P2 |
| `tail` | `tail [行数]` | 查看最近日志 | 内存日志环形缓冲 | ⬜ P2 |

---

## 汇总

| 分类 | 已实现 (P0) | 规划 (P1) | 规划 (P2) |
|------|-------------|-----------|-----------|
| 监控 | status, metrics, uptime, health, eventqueue, dbinfo | — | — |
| 管理 | help, version, echo, halt, component | broadcast | announce |
| 数据 | players, player, dbquery | — | — |
| 事件 | publish | — | — |
| 玩家 | — | kick, ban, unban, grant, revoke, give, setresource | — |
| 运维 | — | — | save, reloadconfig, restart, maintenance, whitelist |
| 地图 | — | — | mapinfo, regenmap |
| 日志 | — | — | loglevel, tail |

**总计：15 个已实现（P0）+ 8 个 P1 规划 + 9 个 P2 规划 = 32 个指令。**
