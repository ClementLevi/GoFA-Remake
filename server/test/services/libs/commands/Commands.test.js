const assert = require("assert");
const path = require("path");

const AppContext = require(path.resolve("services/libs/shared/AppContext"));
const CommandBus = require(path.resolve("services/libs/commands/CommandBus"));
const {
    commands,
    componentRegistry,
} = require(path.resolve("services/libs/commands/Commands"));
const ComponentRegistry = require(path.resolve(
    "services/libs/commands/ComponentRegistry"
));
const Database = require(path.resolve("services/libs/db/Database"));
const EventBus = require(path.resolve(
    "services/GoFA-Remake/event_manager/EventBus"
));
const GameEvent = require(path.resolve(
    "services/GoFA-Remake/event_manager/ENUMGoFAGameEvents"
));
const { Queue } = require(path.resolve("services/libs/shared/DataStructure"));

describe("Commands（内置指令集）", function () {
    let bus;
    let db;
    let main;
    let eventBus;

    function exec(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.execute(sql, params, (err, rows) =>
                err ? reject(err) : resolve(rows ?? [])
            );
        });
    }

    function run(cmd, ...args) {
        return bus.executeAsync(cmd, ...args);
    }

    before(async function () {
        // 内存数据库 + player_account 表（对齐 server/deployments/testDDL.sql）
        db = Database("sqlite3", { filePath: ":memory:" });
        await db.init();
        await exec(
            "CREATE TABLE player_account (" +
                "player_ID TEXT(32) NOT NULL, " +
                "player_LoginMethod TEXT(32) NOT NULL, " +
                "player_LoginAcct TEXT(90) NOT NULL, " +
                "player_PwMD5 TEXT(32) NOT NULL, " +
                "player_RegisterTime NUMERIC NOT NULL, " +
                "player_LastLogin NUMERIC NOT NULL, " +
                "PRIMARY KEY (player_ID))"
        );
        await exec(
            "INSERT INTO player_account VALUES (?,?,?,?,?,?)",
            ["acc-0001", "0", "alice@test", "md5a", 1700000000000, 1700000100000]
        );
        await exec(
            "INSERT INTO player_account VALUES (?,?,?,?,?,?)",
            ["acc-0002", "1", "bob@test", "md5b", 1700000200000, 1700000300000]
        );

        eventBus = new EventBus();
        main = {
            stage: "running",
            time: {
                TICK: 100,
                TICK_RATE: 5,
                startTime: Date.now() - 100000,
                recentTicksElapses: new Queue(3.2, 3.5, 3.1),
                recentTicksSize: 5,
                last_tick_elapse: 3.2,
                get TICK_INTERVAL() {
                    return 1000 / this.TICK_RATE;
                },
                get LAG_WARN_THRESHOLD() {
                    return this.TICK_INTERVAL * 5;
                },
            },
            game: { _gamelife: 42 },
            config: {
                DB_TYPE: "sqlite3",
                DB_URL: ":memory:",
                SERVER_NAME: "test-server",
                SERVER_PORT: 8080,
                TICK_RATE: 5,
                IS_TEST_SERVER: true,
            },
            db,
            event_bus: eventBus,
            component_registry: componentRegistry,
            http_server: null,
            GAME_LIFE: 42,
            detectLag: () => [false, 3.2],
        };
        AppContext.setMain(main);

        bus = new CommandBus(null);
        bus.registerBatch(commands);
    });

    after(async function () {
        AppContext.setMain(null);
        await db.close();
    });

    // ── 监控类 ──
    it("status 应输出运行状态摘要", async function () {
        const { found, output } = await run("status");
        assert.strictEqual(found, true);
        const line = output[0];
        assert.ok(line.includes("stage=running"), line);
        assert.ok(line.includes("tick=100"), line);
        assert.ok(line.includes("uptime="), line);
        assert.ok(line.includes("gamelife=42"), line);
        assert.ok(line.includes("accounts=2"), line);
    });

    it("metrics 应输出 tick 指标", async function () {
        const { output } = await run("metrics");
        assert.ok(output[0].includes("tickRate=5"), output[0]);
        assert.ok(output[0].includes("interval=200ms"), output[0]);
        assert.ok(output[0].includes("lag=false"), output[0]);
    });

    it("uptime 应输出运行时长", async function () {
        const { output } = await run("uptime");
        assert.ok(output[0].includes("ticks=100"), output[0]);
        assert.ok(output[0].includes("uptime=100s"), output[0]);
    });

    it("health 应输出数据库/事件总线/HTTP 状态", async function () {
        const { output } = await run("health");
        assert.ok(output[0].includes("db=ok"), output[0]);
        assert.ok(output[0].includes("eventBus=ok"), output[0]);
        assert.ok(output[0].includes("http=down"), output[0]);
        assert.ok(output[0].includes("tick=alive"), output[0]);
    });

    it("eventqueue 应输出事件队列状态", async function () {
        const { output } = await run("eventqueue");
        assert.ok(output[0].includes("delayed=0"), output[0]);
        assert.ok(output[0].includes("topics=0"), output[0]);
    });

    it("dbinfo 应列出数据库表", async function () {
        const { output } = await run("dbinfo");
        assert.ok(output[0].includes("type=sqlite3"), output[0]);
        assert.ok(output[0].includes("player_account"), output[0]);
    });

    // ── 管理类 ──
    it("version 应输出版本与配置摘要", async function () {
        const { output } = await run("version");
        assert.ok(output[0].includes("gofa-remaster-server v"), output[0]);
        assert.ok(output.some((l) => l.includes("serverName=test-server")));
    });

    it("echo 应回显参数", async function () {
        const { output } = await run("echo", "hello", "world");
        assert.deepStrictEqual(output, ["hello world"]);
    });

    it("halt 应通过事件总线发布延时 SERVER_SHUTDOWN", async function () {
        const { output } = await run("halt", "60");
        assert.ok(output[0].includes("已设置停机定时任务"), output[0]);
        assert.strictEqual(eventBus.delayed.size, 1);
        const ev = eventBus.delayed.peek();
        assert.strictEqual(ev.type, GameEvent.SERVER_SHUTDOWN);
        // 60s * 5 ticks/s = 300 ticks，总线当前 tick=0 → dueTick=300
        assert.strictEqual(ev.dueTick, 300);
    });

    it("halt 应拒绝非法参数", async function () {
        const { output } = await run("halt", "abc");
        assert.ok(output[0].includes("用法"), output[0]);
        assert.strictEqual(eventBus.delayed.size, 1); // 未新增
    });

    it("component 应设置状态并发布事件，查询模式应列出组件", async function () {
        const received = [];
        eventBus.subscribe(GameEvent.SERVER_COMPONENT_ONLINE, {
            onEvent: (ev) => received.push(ev),
        });
        const set = await run("component", "chat", "online");
        assert.deepStrictEqual(set.output, ["chat: online"]);
        assert.strictEqual(received.length, 1);
        assert.strictEqual(received[0].payload.component, "chat");
        assert.strictEqual(componentRegistry.get("chat").status, "online");

        const list = await run("component");
        assert.ok(list.output.some((l) => l.includes("chat: online")));

        // 清理，避免影响其他用例
        componentRegistry.set("chat", "unknown");
    });

    it("component 应拒绝非法状态", async function () {
        const { output } = await run("component", "chat", "bogus");
        assert.ok(output[0].includes("用法"), output[0]);
    });

    // ── 数据类 ──
    it("players 应列出账户", async function () {
        const { output } = await run("players");
        assert.ok(output[0].includes("账户列表"), output[0]);
        assert.ok(output.some((l) => l.includes("acc-0001")));
        assert.ok(output.some((l) => l.includes("acc-0002")));
    });

    it("players 应支持 limit 参数", async function () {
        const { output } = await run("players", "1");
        assert.ok(output[0].includes("1 条"), output[0]);
    });

    it("player 应输出账户详情且不含密码摘要", async function () {
        const { output } = await run("player", "acc-0001");
        assert.ok(output.some((l) => l.includes("alice@test")));
        assert.ok(!output.some((l) => l.includes("md5a")));
    });

    it("player 应提示账户不存在", async function () {
        const { output } = await run("player", "nobody");
        assert.ok(output[0].includes("账户不存在"), output[0]);
    });

    it("dbquery 应执行只读查询", async function () {
        const { output } = await run(
            "dbquery",
            "SELECT player_ID FROM player_account ORDER BY player_ID"
        );
        assert.ok(output[0].includes("2 行"), output[0]);
        assert.ok(output.some((l) => l.includes("acc-0001")));
    });

    it("dbquery 应拒绝写语句", async function () {
        const insert = await run(
            "dbquery",
            "INSERT INTO player_account VALUES ('x','0','x','x',1,1)"
        );
        assert.ok(insert.output[0].includes("拒绝"), insert.output[0]);
        const drop = await run("dbquery", "DROP TABLE player_account");
        assert.ok(drop.output[0].includes("拒绝"), drop.output[0]);
    });

    it("dbquery 应拒绝非白名单前缀", async function () {
        const { output } = await run("dbquery", "DELETE FROM player_account");
        assert.ok(output[0].includes("拒绝"), output[0]);
    });

    // ── 事件类 ──
    it("publish 应发布即时事件", async function () {
        const received = [];
        eventBus.subscribe("test_instant", {
            onEvent: (ev) => received.push(ev),
        });
        const { output } = await run("publish", "test_instant");
        assert.ok(output[0].includes("已发布事件 test_instant"), output[0]);
        assert.strictEqual(received.length, 1);
    });

    it("publish 应支持延时与 payload", async function () {
        const received = [];
        eventBus.subscribe("test_delayed", {
            onEvent: (ev) => received.push(ev),
        });
        await run("publish", "test_delayed", "3", '{"a":1}');
        assert.strictEqual(received.length, 0); // 未到期
        eventBus.tick(103); // 当前 tick=100 + 3
        assert.strictEqual(received.length, 1);
        assert.deepStrictEqual(received[0].payload, { a: 1 });
    });

    it("publish 应拒绝非法 payload", async function () {
        const { output } = await run("publish", "x", "0", "{bad json");
        assert.ok(output[0].includes("不是合法 JSON"), output[0]);
    });

    // ── 元信息 ──
    it("所有已注册指令均带 meta（description/category）", function () {
        const list = bus.listCommands();
        const names = Object.keys(commands);
        assert.strictEqual(
            list.filter((c) => names.includes(c.name)).length,
            names.length
        );
        for (const c of list) {
            assert.ok(typeof c.description === "string");
            assert.ok(typeof c.category === "string");
            assert.ok(typeof c.usage === "string");
        }
    });
});
