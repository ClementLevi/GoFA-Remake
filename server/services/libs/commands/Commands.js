/**
 * @module commands
 * @description 存放游戏业务控制台命令；由 Main 注册到 CommandBus。
 *  核心命令（exit/help）由 CommandBus 内置或 Main 绑定，不在此处。
 *  Game domain console commands; registered into CommandBus by Main.
 *  Core commands (exit/help) are built into CommandBus or bound by Main, not here.
 *
 *  命令条目格式：{ handler: (args, ctx) => void|Promise<void>, meta: {description, usage, category} }
 *  ctx = { name, args, main, reply }，见 CommandBus。
 *  导出 { commands, componentRegistry }：commands 交给 Main.registerBatch，componentRegistry 供 API 共用。
 *
 *  类型约定（TS 级 JSDoc）：handler 类型复用 `CommandBus.CommandHandler`；commands 集合为
 *  GoFACommandSet（Record<string, GoFACommandEntry>）；dbQuery 以 template T 泛化行类型，
 *  调用处以行内 type 标注收窄（如 dbinfo 的表行、players 的账户行）。
 */

// ─────────────────── 类型体操：领域类型定义 ───────────────────

/**
 * 单条命令条目（handler + meta）  Single command entry (handler + meta)
 * @typedef {object} GoFACommandEntry
 * @property {import("./CommandBus").CommandHandler} handler - 处理函数  Handler
 * @property {import("./CommandBus").CommandMeta} [meta] - 元信息  Metadata
 */

/**
 * 指令集（指令名 → 条目）  Command set (name → entry)
 * @typedef {Record<string, GoFACommandEntry>} GoFACommandSet
 */

/**
 * Commands 模块导出形状  Module export shape
 * @typedef {object} CommandsModule
 * @property {GoFACommandSet} commands - 指令集（交给 Main.registerBatch）  Command set
 * @property {InstanceType<typeof ComponentRegistry>} componentRegistry - 组件注册表单例  Component registry singleton
 */

const path = require("node:path");

const AppContext = require(path.resolve(__dirname, "../shared/AppContext"));
const ComponentRegistry = require(path.resolve(__dirname, "./ComponentRegistry"));
const GoFAGameEvent = require(path.resolve(
    __dirname,
    "../../GoFA-Remake/event_manager/GoFAGameEvent"
));
const GameEvent = require(path.resolve(
    __dirname,
    "../../GoFA-Remake/event_manager/ENUMGoFAGameEvents"
));

/** @type {InstanceType<ComponentRegistry>} 组件注册表单例（指令与 admin API 共用） */
const componentRegistry = new ComponentRegistry();

/** 只读 SQL 白名单前缀  Read-only SQL whitelist prefixes */
const DBQUERY_WHITELIST = /^\s*(SELECT|PRAGMA|EXPLAIN)\b/i;
/** 写操作关键字（dbquery 拒绝）  Write keywords rejected by dbquery */
const DBQUERY_FORBIDDEN =
    /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|TRUNCATE)\b/i;

/**
 * 获取 Main 单例  Get the Main singleton
 * @returns {object|null}
 */
function getMain() {
    return AppContext.getMain();
}

/**
 * 执行只读数据库查询（类型体操：template T 泛化行类型，调用处以行内 type 标注收窄）。
 *  T 由调用处推断：如 dbinfo 的表行、players 的账户行。
 *  Promise-wrapped read-only DB query; the template T generalizes the row type,
 *  narrowed at call sites with inline type annotations.
 * @template T
 * @param {import("./CommandBus").IMainLike|null|undefined} main - Main 实例
 * @param {string} sql - SQL 语句
 * @param {any[]} [params] - 参数
 * @returns {Promise<T[]>} 行数组  Row array
 */
function dbQuery(main, sql, params = []) {
    return new Promise((resolve, reject) => {
        if (!main?.db || typeof main.db.execute !== "function") {
            return reject(new Error("数据库未初始化"));
        }
        main.db.execute(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows ?? []);
        });
    });
}

/**
 * 格式化时间戳/原始值  Format timestamp or raw value
 * @param {*} v - 值
 * @returns {string}
 */
function fmtTime(v) {
    if (v == null || v === "") return "-";
    const n = Number(v);
    if (!Number.isNaN(n) && n > 0) {
        return new Date(n).toLocaleString();
    }
    return String(v);
}

/**
 * 统计某表行数（失败返回 -1）  Count rows of a table (-1 on failure)
 * @param {object} main
 * @param {string} table - 表名（内部使用，非用户输入）
 * @returns {Promise<number>}
 */
async function countRows(main, table) {
    try {
        /** @type {{n: number}[]} */
        const rows = await dbQuery(
            main,
            `SELECT COUNT(*) AS n FROM ${table}`,
            []
        );
        return rows?.[0]?.n ?? 0;
    } catch {
        return -1;
    }
}

/**
 * 获取 HTTP 连接数  Get active HTTP connection count
 * @param {object} main
 * @returns {Promise<number>}
 */
function getConnections(main) {
    return new Promise((resolve) => {
        const server = main?.http_server;
        if (!server || typeof server.getConnections !== "function") {
            return resolve(-1);
        }
        server.getConnections((err, count) => {
            resolve(err ? -1 : count);
        });
    });
}

// ─────────────────────────── 监控类 monitor ───────────────────────────

/**
 * status：服务器运行状态  Server runtime status
 */
async function cmdStatus(args, ctx) {
    const main = ctx.main ?? getMain();
    if (!main) return ctx.reply("Main 未初始化");
    const stage = main.stage ?? "unknown";
    const tick = main.time?.TICK ?? -1;
    const start = main.time?.startTime ?? 0;
    const uptime = start
        ? Math.max(0, Math.floor((Date.now() - start) / 1000))
        : -1;
    const accounts = await countRows(main, "player_account");
    const connections = await getConnections(main);
    ctx.reply(
        `stage=${stage} version=${GameEvent.version} tick=${tick} ` +
            `uptime=${uptime}s gamelife=${main.GAME_LIFE ?? -1} ` +
            `accounts=${accounts} connections=${connections}`
    );
}

/**
 * metrics：tick 运行指标  Tick metrics
 */
function cmdMetrics(args, ctx) {
    const main = ctx.main ?? getMain();
    const t = main?.time;
    if (!t) return ctx.reply("Main.time 未初始化");
    const rate = t.TICK_RATE ?? 5;
    const interval = rate > 0 ? 1000 / rate : -1;
    const last = t.last_tick_elapse ?? -1;
    const elapses = Array.from(t.recentTicksElapses ?? []);
    const avg =
        elapses.length > 0
            ? elapses.reduce((a, b) => a + b, 0) / elapses.length
            : -1;
    const threshold = t.LAG_WARN_THRESHOLD ?? -1;
    const lag =
        typeof main.detectLag === "function" ? main.detectLag()[0] : false;
    ctx.reply(
        `tickRate=${rate} interval=${interval}ms last=${last}ms ` +
            `avg=${avg.toFixed(2)}ms threshold=${threshold}ms lag=${lag}`
    );
}

/**
 * uptime：运行时长  Uptime
 */
function cmdUptime(args, ctx) {
    const main = ctx.main ?? getMain();
    const t = main?.time;
    if (!t) return ctx.reply("Main.time 未初始化");
    const start = t.startTime ?? 0;
    const secs = start ? Math.max(0, Math.floor((Date.now() - start) / 1000)) : -1;
    ctx.reply(
        `started=${start ? new Date(start).toLocaleString() : "unknown"} ` +
            `uptime=${secs}s ticks=${t.TICK ?? 0}`
    );
}

/**
 * health：健康检查  Health check
 */
async function cmdHealth(args, ctx) {
    const main = ctx.main ?? getMain();
    let db = "missing";
    try {
        const ok = await main?.db?.test?.();
        db = ok ? "ok" : "error";
    } catch {
        db = "error";
    }
    const eventBus = main?.event_bus ? "ok" : "missing";
    const http = main?.http_server?.listening ? "ok" : "down";
    const tick = (main?.time?.TICK ?? 0) > 0 ? "alive" : "idle";
    ctx.reply(`db=${db} eventBus=${eventBus} http=${http} tick=${tick}`);
}

/**
 * eventqueue：事件队列状态  Event queue status
 */
function cmdEventQueue(args, ctx) {
    const main = ctx.main ?? getMain();
    const bus = main?.event_bus;
    if (!bus) return ctx.reply("EventBus 未初始化");
    const delayedCount = bus.delayed?.size ?? 0;
    const next = delayedCount > 0 ? bus.delayed.peek() : null;
    const topics = bus.subscribers?.size ?? 0;
    ctx.reply(
        `tick=${bus.currentTick ?? 0} delayed=${delayedCount} ` +
            `nextDue=${next?.dueTick ?? "-"} topics=${topics}`
    );
}

/**
 * dbinfo：数据库信息  Database info
 */
async function cmdDbInfo(args, ctx) {
    const main = ctx.main ?? getMain();
    // 与 main.js 数据库初始化缺省一致  Mirror main.js DB defaults
    const type = main?.config?.DB_TYPE ?? "sqlite3";
    const file = main?.config?.DB_URL ?? ":memory:";
    let tables = [];
    try {
        /** @type {{name: string}[]} */
        const rows = await dbQuery(
            main,
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
            []
        );
        tables = rows.map((r) => r.name);
    } catch {
        tables = [];
    }
    ctx.reply(`type=${type} file=${file} tables=[${tables.join(", ")}]`);
}

// ─────────────────────────── 管理类 management ───────────────────────────

/**
 * version：版本与配置摘要  Version & config summary
 */
function cmdVersion(args, ctx) {
    const main = ctx.main ?? getMain();
    const cfg = main?.config ?? {};
    ctx.reply(`gofa-remaster-server v${GameEvent.version}`);
    ctx.reply(
        `serverName=${cfg.SERVER_NAME ?? "-"} port=${cfg.SERVER_PORT ?? 8080} ` +
            `tickRate=${cfg.TICK_RATE ?? 5} dbType=${cfg.DB_TYPE ?? "-"} ` +
            `isTestServer=${cfg.IS_TEST_SERVER ?? "-"}`
    );
}

/**
 * echo：回显  Echo arguments
 */
function cmdEcho(args, ctx) {
    ctx.reply(args.join(" "));
}

/**
 * halt：定时停机（经事件总线 SERVER_SHUTDOWN → exit）  Scheduled shutdown
 */
function cmdHalt(args, ctx) {
    const main = ctx.main ?? getMain();
    const tth = args[0] !== undefined ? Number(args[0]) : NaN;
    if (Number.isNaN(tth) || tth < 0) {
        return ctx.reply("用法: halt <秒数>（非负数字）");
    }
    if (!main?.event_bus) return ctx.reply("EventBus 未初始化");
    const tickRate = main?.time?.TICK_RATE ?? 5;
    const delayTicks = Math.ceil(tth * tickRate);
    main.event_bus.publish(
        new GoFAGameEvent({
            type: GameEvent.SERVER_SHUTDOWN,
            timeElapse: { startTick: null, length: delayTicks },
        })
    );
    ctx.reply(`已设置停机定时任务：${tth} 秒后触发（${delayTicks} ticks）`);
}

/**
 * component：组件在线状态（查询/设置 + 事件发布）  Component online status
 */
function cmdComponent(args, ctx) {
    const registry = ctx.main?.component_registry ?? componentRegistry;
    if (!args.length) {
        const list = registry.list();
        if (list.length === 0) return ctx.reply("（暂无组件）");
        list.forEach((c) =>
            ctx.reply(
                `${c.name}: ${c.status}${c.detail ? ` (${c.detail})` : ""}`
            )
        );
        return;
    }
    const [name, status] = args;
    if (status !== "online" && status !== "offline") {
        return ctx.reply("用法: component <组件名> <online|offline>；或 component 查询列表");
    }
    registry.set(name, status);
    const bus = ctx.main?.event_bus;
    if (bus) {
        const evType =
            status === "online"
                ? GameEvent.SERVER_COMPONENT_ONLINE
                : GameEvent.SERVER_COMPONENT_OFFLINE;
        bus.publish(
            new GoFAGameEvent({ type: evType, payload: { component: name } })
        );
    }
    ctx.reply(`${name}: ${status}`);
}

// ─────────────────────────── 数据类 data ───────────────────────────

/**
 * players：账户列表  Account list
 */
async function cmdPlayers(args, ctx) {
    const main = ctx.main ?? getMain();
    let limit = args[0] !== undefined ? parseInt(args[0], 10) : 20;
    if (Number.isNaN(limit) || limit < 1) limit = 20;
    if (limit > 200) limit = 200;
    /**
     * 账户列表行类型（类型体操：列级收窄，避免 any）  Account list row type
     * @typedef {{player_ID: string, player_LoginAcct: string, player_RegisterTime: unknown, player_LastLogin: unknown}} PlayerAccountRow
     */
    /** @type {PlayerAccountRow[]} */
    let rows = [];
    try {
        rows = await dbQuery(
            main,
            "SELECT player_ID, player_LoginAcct, player_RegisterTime, player_LastLogin " +
                "FROM player_account ORDER BY player_RegisterTime LIMIT ?",
            [limit]
        );
    } catch (e) {
        return ctx.reply(`查询失败: ${e?.message ?? e}`);
    }
    if (!rows.length) return ctx.reply("（player_account 无数据）");
    ctx.reply(`账户列表（${rows.length} 条）：`);
    rows.forEach((r) => {
        ctx.reply(
            `  ${r.player_ID} | ${r.player_LoginAcct} | ` +
                `注册=${fmtTime(r.player_RegisterTime)} | 上次登录=${fmtTime(r.player_LastLogin)}`
        );
    });
}

/**
 * player：账户详情  Account detail
 */
async function cmdPlayer(args, ctx) {
    const main = ctx.main ?? getMain();
    const id = args[0];
    if (!id) return ctx.reply("用法: player <账户ID>");
    /**
     * 账户全行类型（含密码列，展示时跳过）  Full account row type (password column skipped at display)
     * @typedef {{player_ID: string, player_LoginMethod: string, player_LoginAcct: string, player_PwMD5: string, player_RegisterTime: unknown, player_LastLogin: unknown}} PlayerAccountFullRow
     */
    /** @type {PlayerAccountFullRow[]} */
    let rows = [];
    try {
        rows = await dbQuery(
            main,
            "SELECT * FROM player_account WHERE player_ID = ?",
            [id]
        );
    } catch (e) {
        return ctx.reply(`查询失败: ${e?.message ?? e}`);
    }
    if (!rows.length) return ctx.reply(`账户不存在: ${id}`);
    Object.entries(rows[0]).forEach(([k, v]) => {
        if (k === "player_PwMD5") return; // 不回显密码摘要
        ctx.reply(`  ${k}: ${v}`);
    });
}

/**
 * dbquery：只读 SQL 查询  Read-only SQL query
 */
async function cmdDbQuery(args, ctx) {
    const main = ctx.main ?? getMain();
    const sql = args.join(" ");
    if (!sql) {
        return ctx.reply("用法: dbquery <SQL>（仅 SELECT / PRAGMA / EXPLAIN 只读语句）");
    }
    if (!DBQUERY_WHITELIST.test(sql)) {
        return ctx.reply("拒绝：仅允许 SELECT / PRAGMA / EXPLAIN 只读语句");
    }
    if (DBQUERY_FORBIDDEN.test(sql)) {
        return ctx.reply("拒绝：语句包含写操作关键字");
    }
    let rows = [];
    try {
        rows = await dbQuery(main, sql, []);
    } catch (e) {
        return ctx.reply(`查询失败: ${e?.message ?? e}`);
    }
    ctx.reply(`查询成功，${rows.length} 行：`);
    rows.slice(0, 20).forEach((r) => ctx.reply(`  ${JSON.stringify(r)}`));
    if (rows.length > 20) {
        ctx.reply(`  ... 共 ${rows.length} 行，仅显示前 20 行`);
    }
}

// ─────────────────────────── 事件类 event ───────────────────────────

/**
 * publish：向事件总线发布任意事件  Publish an event to the event bus
 */
function cmdPublish(args, ctx) {
    const main = ctx.main ?? getMain();
    const type = args[0];
    if (!type) {
        return ctx.reply("用法: publish <事件类型> [延时tick数] [payloadJson]");
    }
    if (!main?.event_bus) return ctx.reply("EventBus 未初始化");
    let delay = 0;
    if (args[1] !== undefined) {
        delay = Number(args[1]);
        if (Number.isNaN(delay) || delay < 0) {
            return ctx.reply("延时 tick 数必须为非负数字");
        }
    }
    let payload = null;
    if (args[2] !== undefined) {
        try {
            payload = JSON.parse(args[2]);
        } catch {
            return ctx.reply("payload 不是合法 JSON");
        }
    }
    const ev = new GoFAGameEvent({
        type,
        payload,
        timeElapse:
            delay > 0 ? { startTick: null, length: delay } : null,
    });
    main.event_bus.publish(ev);
    ctx.reply(
        `已发布事件 ${type}（${delay > 0 ? `延时 ${delay} ticks` : "即时"}），id=${ev.id}`
    );
}

/**
 * 指令集（交给 Main.registerBatch）
 * Command set (consumed by Main.registerBatch)
 */
const commands = {
    // 监控 monitor
    status: {
        handler: cmdStatus,
        meta: {
            description: "服务器运行状态（阶段/版本/tick/运行时长/账户数/连接数）",
            usage: "status",
            category: "monitor",
        },
    },
    metrics: {
        handler: cmdMetrics,
        meta: {
            description: "tick 运行指标（频率/耗时/掉刻）",
            usage: "metrics",
            category: "monitor",
        },
    },
    uptime: {
        handler: cmdUptime,
        meta: {
            description: "运行时长与累计 tick",
            usage: "uptime",
            category: "monitor",
        },
    },
    health: {
        handler: cmdHealth,
        meta: {
            description: "健康检查（数据库/事件总线/HTTP/tick 循环）",
            usage: "health",
            category: "monitor",
        },
    },
    eventqueue: {
        handler: cmdEventQueue,
        meta: {
            description: "事件队列状态（延时事件/订阅主题）",
            usage: "eventqueue",
            category: "monitor",
        },
    },
    dbinfo: {
        handler: cmdDbInfo,
        meta: {
            description: "数据库信息（类型/路径/表清单）",
            usage: "dbinfo",
            category: "monitor",
        },
    },
    // 管理 management
    version: {
        handler: cmdVersion,
        meta: {
            description: "版本与配置摘要",
            usage: "version",
            category: "management",
        },
    },
    echo: {
        handler: cmdEcho,
        meta: {
            description: "回显参数（脚本调试/通道连通性验证）",
            usage: "echo <文本...>",
            category: "management",
        },
    },
    halt: {
        handler: cmdHalt,
        meta: {
            description: "定时停机（N 秒后经 SERVER_SHUTDOWN 事件触发 exit）",
            usage: "halt <秒数>",
            category: "management",
        },
    },
    component: {
        handler: cmdComponent,
        meta: {
            description: "组件在线状态查询/设置（发布 SERVER_COMPONENT_* 事件）",
            usage: "component [组件名] [online|offline]",
            category: "management",
        },
    },
    // 数据 data
    players: {
        handler: cmdPlayers,
        meta: {
            description: "账户列表（player_account，默认 20 条）",
            usage: "players [limit]",
            category: "data",
        },
    },
    player: {
        handler: cmdPlayer,
        meta: {
            description: "账户详情",
            usage: "player <账户ID>",
            category: "data",
        },
    },
    dbquery: {
        handler: cmdDbQuery,
        meta: {
            description: "只读 SQL 查询（SELECT/PRAGMA/EXPLAIN 白名单）",
            usage: "dbquery <SQL>",
            category: "data",
        },
    },
    // 事件 event
    publish: {
        handler: cmdPublish,
        meta: {
            description: "向事件总线发布事件（可延时、带 payload）",
            usage: "publish <事件类型> [延时tick数] [payloadJson]",
            category: "event",
        },
    },
};

/**
 * Commands 模块导出：{ commands, componentRegistry }
 * @type {CommandsModule}
 */
module.exports = { commands, componentRegistry };
