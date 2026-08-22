# 管理与监控（管理员/开发者）REST API 端点清单

> 范围：管理员/开发者对服务器运行状态、组件在线、玩家连接、事件队列、日志审计的监控，以及控制台指令、客户端完整性校验、断连/重定向、部署等管理操作。对应 `ENUMGoFAGameEvents.js` 的「服务端内部非业务逻辑事件」区，及 pdma 审计表 `player_security`、`events_admin_ops`、`events_*`。

## 端点表

| 方法 | 路径 | 名称 | 鉴权 | 用途 | 对应事件/表 |
|------|------|------|------|------|-------------|
| GET | /api/v1/ping | 心跳 | 公开 | 心跳维持在线（决策B 30s） | 决策B；关联 CLIENT_HEARTBEAT 超时判定 |
| GET | /api/v1/health | 健康检查 | 公开 | 探测 tick 循环存活与数据库连通性 | Main.time.TICK / Database |
| GET | /api/v1/admin/status | 运行状态 | 管理员 token | 阶段 stage / tick 计数 / 启动时间 | SERVER_READY / SERVER_SHUTDOWN、ENUM_STAGE、Main.time.TICK/startTime |
| GET | /api/v1/admin/metrics | 运行指标 | 管理员 token | tick 频率 / 掉刻 / 平均耗时 | Main.time.recentTicksElapses/last_tick_elapse、detectLag/LAG_WARN_THRESHOLD |
| GET | /api/v1/admin/components | 组件在线状态 | 管理员 token | 组件在线/离线状态 | SERVER_COMPONENT_ONLINE / SERVER_COMPONENT_OFFLINE |
| GET | /api/v1/admin/players/online | 在线玩家 | 管理员 token | 在线玩家/连接列表 | CLIENT_CONNECTED / CLIENT_HEARTBEAT / SERVER_DISCONNECT_CLIENT |
| GET | /api/v1/admin/event-queue | 事件队列状态 | 管理员 token | 事件队列/延时队列状态 | Main.ev_queues（onStart/events/timedEvents/cleanups/updatable）、EventBus.delayed |
| GET | /api/v1/admin/logs | 日志与审计 | 管理员 token | 日志/审计查询 | player_security、events_admin_ops、events_* 各审计表 |
| GET | /api/v1/admin/integrity-failures | 完整性校验失败记录 | 管理员 token | 查询客户端完整性校验失败记录 | SERVER_INTEGRITY_FAILED / SERVER_FOUND_CLIENT_FAILING_CHALLENGE |
| POST | /api/v1/admin/command | 执行控制台指令 | 管理员 token | 执行控制台指令 | SERVER_COMMAND、regCommands / CONSOLE_COMMANDS |
| POST | /api/v1/admin/integrity-challenge | 发起客户端完整性校验 | 管理员 token | 主动发起客户端完整性校验 | SERVER_CREATE_CLIENT_INTEGRITY_CHALLENGE |
| POST | /api/v1/admin/players/{playerId}/disconnect | 断开玩家连接 | 管理员 token | 断开指定玩家连接 | SERVER_DISCONNECT_CLIENT |
| POST | /api/v1/admin/players/{playerId}/reroute | 重定向玩家 | 管理员 token | 将玩家从大厅重定向到子服务器 | SERVER_REROUTE_CLIENT |
| POST | /api/v1/admin/deploy | 部署初始化 | 管理员 token | 触发服务器部署初始化 | SERVER_DEPLOYMENT_INITIATE / SERVER_DEPLOYED、ServerDeployer |

已写入 Apifox AI 分支，共 14 个。
