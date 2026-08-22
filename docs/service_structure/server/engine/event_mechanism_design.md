# GoFA-Remake 事件机制架构设计（Phase 2）

> 作者：事件机制架构设计子代理（Phase 2）
> 分支：`add_apis`
> 阶段性质：**仅设计文档，不写业务代码**。文档具体到可指导后续实现。
> 基准源码：`server/main.js`（tick 循环）、`server/services/GoFA-Remake/event_manager/`（5 个文件）、`server/services/GoFA-Remake/game.js`
> 基准设计：`docs/service_structure/design_decisions.md`（五.1 tick 循环、三/四事件覆盖审计）、`docs/service_structure/gap_analysis/`（Phase 1 产出）
> 关联图：`CLS_command_event_correlation.pu`、`SEQ_event_multiconsumer.pu`、`SEQ_event_S2C_C2S_paradigms.pu`、`CLS_fleet_combat_args.pu`、`SEQ_combat_calculation.pu`

---

## 1. 设计目标

1. **可运行的 pub/sub 总线**：以 `ENUMGoFAGameEvents` 的 key 为 topic，落地 `publish / subscribe / unsubscribe` 三原语，替代当前不可运行的 `EventManager`（其 `emit` 一调用即抛异常）。
2. **命令-结果可关联**：落地 `GameEvent{type, taskId, payload}` 契约（对齐 `CLS_command_event_correlation.pu`），让 HTTP 命令受理与结果获取之间以 `taskId` 唯一显式关联。
3. **多消费者副作用分散**：一个事件可被多个领域消费者订阅，各自写各自资源域的状态（对齐 `SEQ_event_multiconsumer.pu`），消费者是领域操作唯一入口，持久化是下游副作用。
4. **tick 驱动的调度引擎**：以「定时器 + 优先队列」替代每 tick 全量遍历，与 `main.js` 现有 `TICK` 计数、`registerTimedEvent/consumeTimedEvents` 整合或替代，回填 `event_loop.pu` 空壳的算法语义。
5. **懒计算与定时任务的边界清晰**：对齐 `design_decisions.md` 五.1 —— 可推导状态懒计算，状态跃迁走定时事件。
6. **为 HTTP 层铺路**：事件总线承接「HTTP handler → 校验 → publish → 返回 taskId 回执」的异步链路（本阶段不写 HTTP 代码，只画时序）。

---

## 2. 总体架构

```
                        ┌─────────────────────────────────────────────┐
                        │  Main (server/main.js)  — tick 驱动         │
                        │  setTimeout 循环，this.time.TICK 全局计数    │
                        └───────────────┬─────────────────────────────┘
                                        │ 每 tick 调 eventBus.tick(TICK)
                                        ▼
   HTTP 层(待建)   publish(GameEvent)  ┌──────────────────────────────┐
  ────────────────►                    │         EventBus              │
   handler 校验    ◄── 回执 taskId ─── │  - subscribers: Map<topic,   │
   JWT + params                        │                 Consumer[]>  │
                                        │  - delayed: PriorityQueue    │
                                        │  - currentTick: number       │
                                        └───────┬──────────────┬──────┘
                                  立即事件      │              │ 延时事件(dueTick)
                                 (同步/本tick)  │              ▼
                                        │      │      ┌───────────────┐
                                        │      │      │ PriorityQueue │
                                        │      │      │ 按 dueTick 排序 │
                                        │      │      └───────┬───────┘
                                        ▼      ▼              │ 到期消费
                                   ┌──────────────────────────┴──────┐
                                   │  Consumer（领域消费者，可多个）      │
                                   │  → DomainOperation（fleet_arrive  │
                                   │    /planet_colonize/…）           │
                                   │  → Persistence（下游副作用）       │
                                   └──────────────┬───────────────────┘
                                                  │ publish(ResultEvent{taskId})
                                                  ▼
                                          ResultStore（按 taskId 存结果，
                                          HTTP 轮询 /api/v1/*/result/{taskId}）
```

**核心思想**：`EventBus` 是唯一的事件分发中枢。`Main` 的 tick 循环退化为「时钟 + 驱动」，不再亲自维护领域事件队列；领域逻辑全部下沉到 Consumer。事件分两类：

- **即时事件（instant）**：`publish` 时同步分发，或在当前 tick 内批量分发。
- **延时事件（delayed）**：携带 `dueTick`，进入 `PriorityQueue`，由 `EventBus.tick(TICK)` 逐 tick 取出到期者分发。

---

## 3. 事件总线接口（Event Bus / pub-sub）

### 3.1 接口契约

```js
class EventBus {
    /** 发布一个领域事件；立即分发或入延时队列 */
    publish(event /* GoFAGameEvent */) : void

    /** 订阅某 topic（ENUMGoFAGameEvents 的 key） */
    subscribe(topic /* string(枚举key) */, consumer /* Consumer */) : () => void

    /** 退订（subscribe 返回的函数即退订句柄，也可显式调用） */
    unsubscribe(topic, consumer) : void

    /** 每个 tick 驱动：推进时钟、消费到期延时事件 */
    tick(currentTick /* number */) : void
}
```

### 3.2 topic 语义（key vs value）

- **topic = `ENUMGoFAGameEvents` 的 key**（如 `GameEvent.TASKFORCE_ARRIVE`）。订阅/发布一律传枚举常量引用，杜绝硬编码魔法字符串。
- 枚举的 value（如 `"taskforce_arrive"`）是**协议层字符串**：用于日志、持久化、HTTP 回执里的 `type` 字段、未来跨进程/跨服务传输。二者由 `ENUMGoFAGameEvents` 统一维护（key → value 一一映射）。
- 由于枚举 `Object.freeze`，key 是稳定标识；consumer 内 `switch (event.type)` 一律 `case GameEvent.TASKFORCE_ARRIVE`。

### 3.3 多消费者语义（对照 SEQ_event_multiconsumer.pu）

- `subscribers` 结构：`Map<topic, Consumer[]>`。**一个 topic 对应多个 Consumer**，dispatch 时按订阅顺序逐个调用（注册顺序即确定性顺序，便于测试与复盘）。
- 语义：多消费者**不是抢一个 HTTP 响应**，而是「多领域副作用分散写各自状态」。例：`TASKFORCE_ARRIVE` 同时驱动 `planet.colonize()`（星球归属）、`fleet.arrive()`（停泊状态）、`COMBAT_RESULT`（战斗结算）、`mail_battle_report`（战报邮件）四个消费者，各自落各自的资源域，各归各的查询接口。
- 消费者抛异常的处理：捕获、记录、**不中断后续消费者**（隔离副作用），但可配置「重试 N 次 / 失败进死信队列」策略（MVP 先只记录）。

### 3.4 命令-结果 taskId 关联（对照 CLS_command_event_correlation.pu）

- `GameEvent.taskId` 是**关联 id（correlation id）**：HTTP 受理命令时生成 `taskId`（UUID），随事件贯穿「命令 → 领域操作 → 结果」，消费者产出 `ResultEvent{taskId, result}` 写回 `ResultStore`。
- 客户端凭 `taskId` 轮询结果（决策 B 轮询），或轮询资源端点（`GET /fleet/:id`）获取副作用后的新状态。
- `ResultEvent` 是 `GoFAGameEvent` 的特化（`type = 对应 S2C 事件 key`，如 `TASKFORCE_ARRIVE`），与 `CLS_command_event_correlation.pu` 的 `ResultEvent` 一致。

---

## 4. 事件对象模型

### 4.1 类图（见 `CLS_event_bus.pu`）

### 4.2 GoFAGameEvent 字段落地

```js
class GoFAGameEvent extends IGoFAEvent {
    /**
     * @param {object} gameEventReq
     * @param {string} gameEventReq.type      事件类型（ENUMGoFAGameEvents 的 key）
     * @param {string} [gameEventReq.taskId]  命令-结果关联 id；无命令来源可为 null
     * @param {object} [gameEventReq.payload] 事件载荷（单对象，领域消费者入参）
     * @param {object} [gameEventReq.timeElapse] 延时事件调度：{ startTick|null, length }
     */
    constructor(gameEventReq) { /* type/taskId/payload/createdAt/id/dueTick/priority */ }
}
```

| 字段 | 类型 | 语义 | 来源 |
|---|---|---|---|
| `type` | string | 事件类型，取 `ENUMGoFAGameEvents` 的 key | 必填，`gameEventReq.type` |
| `taskId` | string\|null | 关联 id，命令受理时由 HTTP 层生成 | `gameEventReq.taskId` |
| `payload` | object | 领域操作入参（单对象，不散传） | `gameEventReq.payload` |
| `id` | string(UUID) | 事件自身唯一 id（对齐 `ABSCLS_event_record_strcture.pu` 的 EventID） | 构造时生成 |
| `createdAt` | number(tick) | 创建时的 tick 计数（非 wall-clock） | 发布时由 EventBus 盖戳 |
| `dueTick` | number | 到期 tick（即时事件 = createdAt） | 由 Schedule 推导 |
| `priority` | number | 调度优先级 = `dueTick`（越小越先），或显式覆盖 | `dueTick` |

### 4.3 与 IGoFAEvent / Schedule 的关系（即时 vs 延时）

- `IGoFAEvent` 保留「即时/延时」骨架（`_isInstantEvent` + 可选 `schedule`），`GoFAGameEvent` 继承它补领域字段。
- **即时事件**：`schedule == null`，`dueTick = createdAt`，`publish` 后本 tick 内分发。
- **延时事件**：`schedule != null`，`dueTick = startTick + length`，入 `PriorityQueue` 等待到期。
- `Schedule` 修复后语义（见 §6 缺陷 D14~D16）：
  - `startTick: number|null` —— `null` 表示「自发布时刻起算」；`number` 表示绝对起始 tick。
  - `length: number` —— 持续时间（tick 数）。
  - `dueTick: number` —— `startTick ?? nowTick + length`，为**只读推导值**。
  - `remaining(currentTick) = dueTick - currentTick` —— **方法而非字段**，随 tick 递减，供 PriorityQueue 动态重排/校验。

### 4.4 时钟统一约定

- **调度时钟统一用 tick 计数**（`main.time.TICK`），不再用 `Date.now()` wall-clock。理由：现有 tick 循环与 `registerTimedEvent` 都以 `this.time.TICK + delay` 计算到期，若 Schedule 用 `Date.now()` 会与 tick 计数错位（tick 掉刻/追赶时两者不等价）。
- 需要真实时间（如「15 分钟战斗结算」）时，由**调用方换算** `ticks = ceil(seconds * TICK_RATE)` 再入队，换算只发生在边界（HTTP 层/配置），不进入调度核心。

---

## 5. 调度引擎 / 事件循环（tick 驱动）

### 5.1 与 main.js 现有 tick 循环的整合方式

**结论：保留 `Main` 的 `setTimeout` tick 循环作为「时钟驱动器」，用 `EventBus` 替代 `ev_queues.timedEvents` 机制承载领域延时事件。**

现有 main.js tick 顺序（`main.js` 371~409 行）：

```
TICK++
consumeTimedEvents()          // ev_queues.timedEvents[TICK].forEach(cb => cb())
updatable[TICK].forEach(task) // 引擎更新
game.tick(deltaTime)          // 领域逻辑
setTimeout(next tick)
```

改造后 tick 顺序（`EventBus.tick(TICK)` 承接 2/3/4）：

```
0x00 TICK++                        // 时钟推进（不变）
0x01 eventBus.tick(TICK)           // 消费到期延时事件 + 分发（替代 consumeTimedEvents）
0x02 领域逻辑 game.tick(deltaTime) // 领域逻辑（不变；懒计算在此处按需触发）
0x03 schedule next tick            // setTimeout（不变）
```

**整合方式**（推荐，二选一，见开放问题 OQ-1）：
- **方案 A（替代）**：`Main` 持有 `EventBus` 实例，删除/停用 `registerTimedEvent`/`consumeTimedEvents`，`ev_queues.timedEvents` 迁移为 `EventBus.delayed`。领域延时任务统一 `bus.publish(delayedEvent)`。
- **方案 B（桥接）**：`Main.consumeTimedEvents` 内部改为调 `eventBus.tick(TICK)`，`registerTimedEvent(name, cb, delay)` 内部转 `bus.publish(new GoFAGameEvent({type:name, timeElapse:{length:delay}}))`，保留旧 API 兼容期。

### 5.2 优先队列排序键

- 排序键 = `dueTick`（到期 tick），**最小堆**。`dueTick` 越小越先到期。`priority` 即 `dueTick`，显式优先级通过覆盖 `priority` 字段实现（在相同 `dueTick` 内再比较 `priority`）。
- 数据结构：**二叉最小堆**（push/pop O(log n)）优于现有「数组 + sort（O(n log n)）」。MVP 事件量小可用数组 sort，但接口留 `push/pop/peek/popDue`，后续无痛换堆实现。
- `popDue(currentTick)`：弹出**所有** `dueTick <= currentTick` 的事件（可能多个同一 tick 到期，按入队序/priority 序），返回数组交 `EventBus` 分发。

### 5.3 tick 内执行顺序（消费到期 → 领域逻辑 → 调度下一 tick）

```
EventBus.tick(currentTick):
  1. this.currentTick = currentTick
  2. dueEvents = this.delayed.popDue(currentTick)     // 到期事件出队
  3. for e in dueEvents: this.dispatch(e)             // 分发到各 Consumer
  4. drain 即时事件队列（消费者在 dispatch 中可能 publish 新即时事件，
     循环 drain 直到 quiescent，设 MAX_DRAIN 防死循环）
  5. 返回；Main 继续执行 game.tick(deltaTime)，再 setTimeout 下一 tick
```

- **即时事件 drain 上限**：`MAX_DRAIN`（如 1000）防「事件 A 触发 B 触发 A」无限递归；超限记 warn 并丢弃后续（或转下 tick）。
- **跨 tick 不可重入**：`publish` 在 `tick` 之外被调用（HTTP 线程/同线程同步）时，即时事件同步分发，延时事件仅入队，不驱动时钟。

### 5.4 懒计算与定时任务的边界（对齐 design_decisions 五.1）

| 状态类型 | 示例 | 策略 | 承载 |
|---|---|---|---|
| **可推导状态（随时间线性/确定性变化）** | 星球资源产出、`planet_storage` 增量、舰队航行位置线性演算 | **懒计算**：读时用 `(currentTick - lastUpdatedTick) × rate` 现算，不逐 tick 累加 | 领域对象持有 `lastUpdatedTick`，读操作触发 catch-up |
| **状态跃迁（在确定时刻改变状态）** | 建筑建造完成（`BUILDING_FINISHED`）、舰队到达（`TASKFORCE_ARRIVE`）、战斗结算（00/15/30/45 分） | **定时事件**：`publish(delayedEvent)`，`dueTick = now + 时长`，到期分发执行跃迁 | `PriorityQueue` |
| **被玩家操作驱动** | 殖民、机群重组、联盟外交 | **即时事件**：`publish(instantEvent)` 本 tick 执行 | `subscribers` |

**边界判据**：能否仅由「当前时刻 + 起点状态」确定性算出、且中间态对他人不可见 → 懒计算；否则（中间态会被他人观察到、或需在时刻点触发副作用）→ 定时事件。

---

## 6. 缺陷清单与改造路径

> 粒度：文件级 → 方法级。标注【重写】= 该文件整体重写；【修补】= 保留骨架、定点修改。
> 缺陷编号 D1~D22，与 Phase 1 gap_entities_events.md（P0-B2 / P1-B2 / P1-B3 / P2-B5）对应。

### 6.1 EventManager.js（42 行）——【重写】

| # | 缺陷 | 位置 | 改造路径 |
|---|---|---|---|
| D1 | `emit()` 调 `EventEmitter.getRemainingTime()`，方法不存在 → 一调用即 `TypeError` | `emit()` 31 行 | 删除 `emit`，重写为 `publish(event)` |
| D2 | `this.pq.enqueue(event, priority)`：方法名应为 `push`、入参应为 1 个事件对象、且 `event` 是未定义变量 | `emit()` 32 行 | 重写为 `publish` 内部按即时/延时分流 |
| D3 | `update()` 空壳（注释描述两阶段算法，两个 for 循环体为空） | `update()` 10~19 行 | 重写为 `tick(currentTick)`（见 §5.3） |
| D4 | `sleptTime` 字段初始化后永不推进、无任何读取 | 构造器 8 行 | 删除；用 `currentTick` 取代 |
| D5 | 孤儿模块：无任何业务代码 require | 全文件 | 重写后在 `main.js` 挂载（`this.eventBus = new EventBus()`） |

**重写目标**：`EventBus` 类，字段 `subscribers: Map`、`delayed: PriorityQueue`、`currentTick`；方法 `publish/subscribe/unsubscribe/tick/dispatch`。

### 6.2 PriorityQueue.js（45 行）——【重写】

| # | 缺陷 | 位置 | 改造路径 |
|---|---|---|---|
| D6 | `PrioritizedEvent` 构造 `super()` 无参 → `IGoFAEvent` 的 `schedule` 未赋值 → `this.priority = this.schedule?.timeLeft` 恒 `undefined` | `PrioritizedEvent` 5~10 行 | 删除 `PrioritizedEvent`；优先级改由事件自带 `dueTick/priority` 字段承载 |
| D7 | `pop()` 返回 `this.queue.shift().item`，事件对象无 `.item` → 恒返回 `undefined` | `pop()` 24~26 行 | 改为返回事件本身：`pop()` → 弹出最小 `dueTick` 事件 |
| D8 | `push()` 的 `sort((a,b)=>a.priority-b.priority)` 对全 `undefined` 排序无意义 | `push()` 19~22 行 | 按 `dueTick`（数值）排序/堆化；`priority` 作次键 |
| D9 | `getTopPriority()` 空队列时 `queue[0].priority` 抛异常 | `getTopPriority()` 31~33 行 | 加空队列保护；用 `peek()` 返回 `event` 而非裸 priority |

**重写目标**：接口 `push(event)/pop()/peek()/isEmpty()/size()/popDue(currentTick)`；内部二叉最小堆（MVP 可数组+sort，接口不变）。

### 6.3 GoFAGameEvent.js（23 行）——【重写】

| # | 缺陷 | 位置 | 改造路径 |
|---|---|---|---|
| D10 | 构造参数 `gameEventReq` 未使用 | 构造器 10 行 | `gameEventReq` 作为 `type/taskId/payload/timeElapse` 来源 |
| D11 | `super()` 无参 → 恒 `isInstant=true`、`timeElapse=null`、`data=[]` | 构造器 11 行 | `super(false, gameEventReq.timeElapse, gameEventReq.payload)` 按需 |
| D12 | `this.game = null` 永不赋值 | 构造器 12 行 | 删除无用字段；领域状态由 Consumer/Domain 持有，事件不持 game 引用 |
| D13 | 未实现 `type/taskId/payload` 三字段 | 全文件 | 补齐 §4.2 字段表（含 `id/createdAt/dueTick/priority`） |

**重写目标**：§4.2 的字段落地 + 继承 `IGoFAEvent` 的即时/延时语义。

### 6.4 IGoFAEvent.js（85 行）——【修补】（唯一基本自洽的文件）

| # | 缺陷 | 位置 | 改造路径 |
|---|---|---|---|
| D14 | `Schedule` 用 wall-clock（`Date.now()`），与 tick 计数器语义错位 | `Schedule` 28 行 | `startTime` 改 `startTick`，`null` 语义 = 「发布时刻起算」，不再落 `Date.now()` |
| D15 | `timeLeft`/`passedTime` 初始化后从不更新 → priority 不递减、队列无法随 tick 重排 | `Schedule` 31~32 行 | 删除静态 `timeLeft`；改 `remaining(currentTick)` 方法（§4.3） |
| D16 | `startTime=null` 经 `?? Date.now()` 后 `endTime = startTime + length`，语义在 tick 下错位 | `Schedule` 28~30 行 | 改为 `dueTick = (startTick ?? nowTick) + length` |
| D17 | `data` 用 rest 参数（数组）承载，与单对象 `payload` 契约不一致 | 构造器 45、58 行 | 收敛为单 `payload` 对象（`...data` 保留兼容但约定只传一个对象） |
| D18 | `isInstantEvent()` 方法 vs `_isInstantEvent` 字段可读性弱 | 61~63 行 | 加 `get isInstant()` getter，保留旧方法兼容 |

### 6.5 ENUMGoFAGameEvents.js（356 行）——【修补】

| # | 缺陷 | 位置 | 改造路径 |
|---|---|---|---|
| D19 | 尾随 `console.log(GameEvent.version)`：模块加载即打印（require 副作用，污染日志/测试输出） | 356 行 | 删除；如需展示版本，移入 `require.main === module` 块或显式 debug 入口 |
| D20 | `FLEET_RECOMPOSE_FAILED: "fleet_recomposed_failed"`：key 动词原形 vs value 过去分词，与相邻 `FLEET_RECOMPOSED` 仅差 `_failed` 后缀，易误匹配 | 104 行 | value 改 `"fleet_recompose_failed"`（全仓同步引用处） |
| D21 | `SPY_BOUNTY_DISCOVER: "spy_bounty_discovery"`：key 动词 vs value 名词 | 281 行 | value 改 `"spy_bounty_discover"` |
| D22 | `ALLIANCE_KICK: "alliance_kick"` 挂在「联盟公告管理」注释段下，其注释孤悬「成员管理」段末尾 | 321~336 行 | 将 `ALLIANCE_KICK` 移到「成员管理」段并归位注释 |

### 6.6 event_loop.pu（0 字节）——本阶段不修改

- 当前为 0 字节空文件（Phase 1 gap P1-B2 已确认）。本设计**不改动它**，其应承载的「事件循环」算法语义已在本 §5 与 `SEQ_event_dispatch.pu` 落地。
- **建议后续回填**：以 §5.3 tick 内执行顺序 + `SEQ_event_dispatch.pu` 为蓝本，回填 `event_loop.pu` 时序图（`Main.tick → EventBus.tick → popDue → dispatch → game.tick → setTimeout`）。

### 6.7 改造路径统计

| 分类 | 文件 | 缺陷编号 | 条数 |
|---|---|---|---|
| **重写** | `EventManager.js` | D1~D5 | 5 |
| **重写** | `PriorityQueue.js` | D6~D9 | 4 |
| **重写** | `GoFAGameEvent.js` | D10~D13 | 4 |
| **修补** | `IGoFAEvent.js` | D14~D18 | 5 |
| **修补** | `ENUMGoFAGameEvents.js` | D19~D22 | 4 |
| （不改动） | `event_loop.pu` | 空壳，建议回填 | — |

**合计：重写 3 处（文件级），修补 2 处（文件级），共 22 条缺陷。**

---

## 7. 与 HTTP 层的衔接

> 本阶段不写 HTTP 代码，仅说明事件总线如何承接 HTTP 命令受理。HTTP 层差距见 `gap_architecture_communication.md`（P0-A1 零实现 / P0-A2 API 约定零落地）。

### 7.1 异步受理链路（C2S）

```
HTTP handler（POST /api/v1/fleet/move）
  1. 校验 JWT + 请求体（zod/校验中间件，camelCase）
  2. 生成 taskId = uuid()
  3. 构造 event = new GoFAGameEvent({ type: GameEvent.TASKFORCE_MOVE,
                                       taskId, payload: { fleetId, destPlanetId } })
  4. bus.publish(event)                     // 立即返回，不阻塞领域执行
  5. 响应 { code: 0, data: { taskId } }     // 受理回执（fire-and-forget）
```

- **可同步校验的命令**（如参数非法、资源不足）在 `publish` **前**直接返回错误壳 `{code:400xx, message, detail}`，不产生事件。
- **需异步结算的命令**（如舰队移动、建造）`publish` 后立即回执 `taskId`，客户端凭 `taskId` 轮询结果。

### 7.2 结果回执链路（S2C）

```
Consumer 完成领域操作 → bus.publish(new ResultEvent({ taskId, type: S2C事件key, payload: result }))
  → EventBus 将结果写入 ResultStore（Map<taskId, result> / 或落库）
客户端轮询：
  GET /api/v1/*/result/{taskId}   →  ResultStore.get(taskId)
  或 GET /api/v1/fleet/:id        →  副作用后的资源新状态
```

### 7.3 与设计决策的对应

- **决策 A（统一响应壳）**：回执 `{code:0, data:{taskId}}`；错误 `{code, message, detail}`。
- **决策 B（HTTP 轮询）**：`taskId` 即轮询关联点；5 个轮询接口（combat/radar/mail/chat/alliance）均从 `ResultStore` / 各资源域读取。
- **五.6（HTTP 请求即时处理）**：`publish` 的即时事件在收到 HTTP 请求的那一 tick 内同步分发（§5.3 drain 阶段），延时事件进入 `PriorityQueue` 按 `dueTick` 到期执行。
- 时序详见 `SEQ_event_dispatch.pu`。

---

## 8. 开放问题（Open Questions）

- **OQ-1 整合方式取舍**：§5.1 方案 A（彻底替代 `registerTimedEvent/consumeTimedEvents`）vs 方案 B（桥接兼容）。建议先 A，避免两套定时机制并存；若存在未迁移调用方，先用 B 过渡。
- **OQ-2 即时事件的执行时机**：`publish` 同步分发 vs 统一压入「本 tick 待分发队列」由 `tick` drain。前者简单但可能深递归，后者确定性更好。建议：tick 外 publish → 同步分发；tick 内 publish → 入 drain 队列。
- **OQ-3 消费者异常策略**：MVP 只记录；重试/死信队列是否引入，取决于领域操作的幂等性设计。
- **OQ-4 ResultStore 落库 vs 内存**：MVP 可用内存 Map（进程内）；是否需要持久化（重启后 `taskId` 仍可查）取决于客户端轮询窗口与服务重启策略。建议先内存，`ResultStore` 抽象为接口。
- **OQ-5 战斗结算「00/15/30/45 分」的换算**：真实时间到 tick 的换算（`ceil(seconds × TICK_RATE)`）在掉刻/追赶时可能漂移，需定义「对齐到分边界」的取整策略（对齐 `SEQ_combat_calculation.pu` 的 `Time is *:00/15/30/45`）。
- **OQ-6 懒计算的 `lastUpdatedTick` 归属**：资源产出等懒计算状态挂在领域实体上（`Planet.lastUpdatedTick`），与事件循环如何协调首次读的初始化，需在实体类设计阶段落地。
- **OQ-7 topic 用 key 还是 value 作为 `Map` 键**：本设计以枚举 key 为逻辑 topic，运行时落到 value 字符串；若未来跨进程（大厅/游戏服拆分），需在传输层再做 key→value 序列化约定。
