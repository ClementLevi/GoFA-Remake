# 差距分析总览（Phase 1 统一交付物）

> 阶段：API 服务骨架搭建 · Phase 1 差距分析
> 分支：add_apis
> 方法：2 子代理并行（架构通信层 / 实体事件层），只读分析，未改代码

## 产出文件

| 子代理 | 聚焦域 | 文件 | 条数 |
|---|---|---|---|
| A（架构与通信层） | API 约定落地、HTTP/WS、微服务边界、TODOs 过时 | [gap_architecture_communication.md](./gap_architecture_communication.md) | 8 |
| B（实体与事件层） | pdma 实体 vs 代码实体类、事件枚举覆盖、事件总线骨架、命名一致性 | [gap_entities_events.md](./gap_entities_events.md) | 11 |

## 差距汇总（19 条）

### P0 — 阻断级（5 条）

| 编号 | 差距 | 来源 |
|---|---|---|
| P0-A1 | 游戏服 `server/main.js` 为纯 tick 循环，**未挂载任何 Express/HTTP**，HTTP 层零实现 | A |
| P0-A2 | 决策A（JWT/响应壳/camelCase/分页/`/api/v1`）**100% 零落地**，且缺 `jsonwebtoken` 依赖 | A |
| P0-B1 | 核心实体类全面缺失：Fleet/Carrier/TaskForce/Role/Alliance/Combat/Modifier/Account/Player 均无代码类（仅 atlas 地图系列有类） | B |
| P0-B2 | 事件总线骨架不可运行：`EventManager.emit` 调不存在方法/用未定义变量、`PriorityQueue.priority` 恒 undefined | B |
| P0-B3 | 机群成员变更+升级响应事件（`TASKFORCE_*_MEMBER`、`FLEET_UPGRADED/UPGRADE_FAILED`）仍未写入枚举 | B |

### P1 — 高优先级（6 条）

| 编号 | 差距 | 来源 |
|---|---|---|
| P1-A1 | WebSocket 遗留死代码 + `express-ws`/`nodejs-websocket` 依赖与「不用 WS」决策矛盾，硬编码端口 3000 与 admin-server 冲突 | A |
| P1-A2 | TODOs 多处过时（F-2/E-1/C-1 标「已确认」但代码零实现；C-2 事件已补完仍标 `[ ]`） | A |
| P1-A3 | 微服务边界未落地：文档画 lobby/mail/game 多服，仓库仅 `server/` + `admin-server/` | A |
| P1-B1 | 建筑失败细分事件缺失（`BUILDING_*_FAILED` 3 个） | B |
| P1-B2 | 事件循环/调度引擎完全缺失（`event_loop.pu` 0 字节，`EventManager.update()` 空壳） | B |
| P1-B3 | 事件命名拼写/词性漂移（`FLEET_RECOMPOSE_FAILED`、`SPY_BOUNTY_DISCOVER`、`ALLIANCE_KICK` 注释错位） | B |

### P2 — 低优先级（8 条）

| 编号 | 差距 | 来源 |
|---|---|---|
| P2-A1 | `SEQ_event_S2C_C2S_paradigms.pu` 仍用 WebSocket 描述 S2C，与决策B 冲突 | A |
| P2-A2 | `docs/service_structure/index.md` 仅 placeholder，缺服务架构总览 | A |
| P2-A3 | `network/heartbeats.js` 0 字节空壳，心跳无实现 | A |
| P2-B1 | 联盟成员变更 S2C 事件缺失（JOIN/LEAVE/KICK/INVITE_ACCEPT/INVITE_REJECT） | B |
| P2-B2 | PDMan 缺 4 表（战报内容/联盟小队/侦察报告/拦截状态追踪） | B |
| P2-B3 | `planet_storage`/`planet_structure` JSON Schema 未定义 | B |
| P2-B4 | `events_*` 6 张事件表 + 所有权关系表为空壳（仅审计四件套字段） | B |
| P2-B5 | 枚举尾随 `console.log` 副作用 + `GoFAGameEvent` 未落地 `type/taskId/payload` | B |

## 结论（三句话）

1. **设计已决策、代码零落地**：领域层（tick 循环 + 实体 + DB）之外，HTTP/API 通信层与核心实体类、事件总线均缺实现。
2. **事件机制「有枚举、无总线」**：`ENUMGoFAGameEvents.js` 本身完整，但 EventManager/PriorityQueue/GoFAGameEvent 骨架不可运行，事件循环缺失。
3. **文档内部不一致**：TODOs 过时、WebSocket 遗留与 HTTP 决策矛盾、多服架构图与实际不符。

## 后续（Phase 2 起）

- Phase 2 消费 B 层事件相关差距（P0-B2/P0-B3/P1-B2/P1-B3/P2-B5）做事件机制架构设计。
- 本阶段（API 骨架）只落地「占位」：不实现业务逻辑，实体类与事件总线**重写**不属于本阶段编码范围，仅在设计文档给出改造路径。
