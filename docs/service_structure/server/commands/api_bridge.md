# 控制台指令 ↔ 管理 API 映射

> 版本: v0.1 | 日期: 2026-08-23
> 前置: [`index.md`](index.md)（架构）、[`command_reference.md`](command_reference.md)（指令参考）

---

## 当前概况

- **已真实实现（7 个）**：`POST /admin/command`（远程控制台桥）+ 6 个监控端点（`/health`、`/admin/status`、`/admin/metrics`、`/admin/event-queue`、`/admin/components`、`/admin/players/online`）。
- **仍为占位（6 个）**：logs、integrity-failures、integrity-challenge、players/{id}/disconnect、players/{id}/reroute、deploy —— 待连接层 / 审计表 / 大厅架构落地（P1/P2）。
- **下一步**：在线连接层落地后，`players/{id}/disconnect` 对接 `kick` 指令。

---

## 1. 远程控制台（核心桥）

### POST /api/v1/admin/command — 执行控制台指令

管理 API 是控制台的**远程通道**（Palworld REST / ARK RCON 模式）。鉴权复用 `isAdminAuthorized`
（JWT 身份 + 数据库管理员资格，或口令兜底）。

**请求体**（对齐统一壳 `{ data }` 约定）：

```jsonc
{
  "data": {
    "command": "status",          // 必填：指令名
    "args": ["5"]                 // 可选：参数数组（字符串）
  }
}
```

**响应**（成功 `code: 0`）：

```jsonc
{
  "code": 0,
  "data": {
    "command": "status",
    "output": ["stage=running, version=1.0.0, tick=12345, ..."]
  }
}
```

**错误**（未命中指令 → `40401 NOT_FOUND`；无权限 → `20002 FORBIDDEN`；参数非法 → `10001 INVALID_PARAM`）。

**实现要点**：

- 走 `Main.executeCommand` 的异步变体：`executeAsync(command, ...args)`，收集 `ctx.reply` 输出到 `data.output[]`。
- 指令处理函数支持 `Promise`（如 DB 查询），API 等待全部完成后返回。
- 与 `/admin/halt` 共用 `isAdminAuthorized`，权限口径一致。

---

## 2. 监控端点 ↔ 指令映射

| 端点 | 等价指令 | 实现状态 | 数据来源 |
|------|----------|----------|----------|
| `GET /api/v1/health` | `health` | ✅ 已实现 | `db.test()` + `event_bus` + `http_server` |
| `GET /api/v1/admin/status` | `status` | ✅ 已实现 | `Main.stage/time/config/game` + 连接数 |
| `GET /api/v1/admin/metrics` | `metrics` | ✅ 已实现 | `Main.time.recentTicksElapses/detectLag` |
| `GET /api/v1/admin/event-queue` | `eventqueue` | ✅ 已实现 | `EventBus.delayed/subscribers` |
| `GET /api/v1/admin/components` | `component`（查询模式） | ✅ 已实现 | `ComponentRegistry` |
| `GET /api/v1/admin/players/online` | `players`（在线语义） | ✅ 已实现（连接数 + 注册表） | `http_server.getConnections` |
| `GET /api/v1/admin/logs` | `tail` ⬜ | 🟡 占位 | — |
| `GET /api/v1/admin/integrity-failures` | — | 🟡 占位 | — |

> 说明：`/admin/logs` 与 `/admin/integrity-failures` 依赖审计表与日志缓冲（P2），维持占位回显。

---

## 3. 管理操作端点 ↔ 指令映射

| 端点 | 等价指令 | 实现状态 |
|------|----------|----------|
| `POST /api/v1/admin/command` | 任意指令（远程控制台） | ✅ 已实现 |
| `POST /api/v1/admin/halt` | `halt <秒数>` | ✅ 已实现（复用同一事件链路） |
| `POST /api/v1/admin/deploy` | `deploy`（ServerDeployer） | 🟡 占位 |
| `POST /api/v1/admin/players/{playerId}/disconnect` | `kick` ⬜ | 🟡 占位（依赖连接层） |
| `POST /api/v1/admin/players/{playerId}/reroute` | — | 🟡 占位（依赖大厅/子服架构） |
| `POST /api/v1/admin/integrity-challenge` | — | 🟡 占位（依赖完整性校验系统） |

---

## 4. 统一壳与错误码

所有端点遵循 `docs/service_structure/design_decisions.md` §2.1 决策：

```
成功: { "code": 0, "data": { ... } }
失败: { "code": 10001, "message": "参数非法", "detail": "..." }
```

相关错误码（`server/services/libs/shared/response.js`）：`10001 INVALID_PARAM`、`20002 FORBIDDEN`、`40401 NOT_FOUND`、`40501 METHOD_NOT_ALLOWED`、`90001 INTERNAL_ERROR`。

---

## 5. 端到端示例

```bash
# 1) 远程执行 status 指令
curl -X POST http://localhost:8080/api/v1/admin/command \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"data":{"command":"status"}}'
# → { "code": 0, "data": { "command": "status", "output": ["stage=running, ..."] } }

# 2) 查询运行指标
curl http://localhost:8080/api/v1/admin/metrics -H "Authorization: Bearer <admin-jwt>"

# 3) 定时停机（与指令 halt 60 等价）
curl -X POST http://localhost:8080/api/v1/admin/halt \
  -H "Content-Type: application/json" \
  -d '{"data":{"tth":60}}'
```
