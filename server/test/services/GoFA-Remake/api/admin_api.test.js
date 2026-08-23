const assert = require("assert");
const path = require("path");
const express = require("express");

const AppContext = require(path.resolve("services/libs/shared/AppContext"));
const Database = require(path.resolve("services/libs/db/Database"));
const EventBus = require(path.resolve(
    "services/GoFA-Remake/event_manager/EventBus"
));
const adminRouter = require(path.resolve("services/GoFA-Remake/api/admin"));
const CommandBus = require(path.resolve("services/libs/commands/CommandBus"));
const {
    commands,
    componentRegistry,
} = require(path.resolve("services/libs/commands/Commands"));
const { sign } = require(path.resolve("services/libs/shared/jwt"));
const { Queue } = require(path.resolve("services/libs/shared/DataStructure"));

const POWER = "卧室牢大";

describe("admin API（管理与监控端点）", function () {
    let server;
    let base;
    let db;
    let bus;
    let main;

    function exec(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.execute(sql, params, (err, rows) =>
                err ? reject(err) : resolve(rows ?? [])
            );
        });
    }

    function get(url, token) {
        return fetch(base + url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    function post(url, body, token) {
        return fetch(base + url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
        });
    }

    function adminToken() {
        return sign({ sub: "admin-1" });
    }

    before(async function () {
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
        // 管理员资格表（adminService.isAdmin 查询 player_role）
        await exec(
            "CREATE TABLE player_role (role_ID TEXT PRIMARY KEY, role_privilege TEXT)"
        );
        await exec(
            "INSERT INTO player_role (role_ID, role_privilege) VALUES (?,?)",
            ["admin-1", "admin"]
        );

        bus = new CommandBus(null);
        bus.registerBatch(commands);

        main = {
            stage: "running",
            time: {
                TICK: 42,
                TICK_RATE: 5,
                startTime: Date.now() - 5000,
                recentTicksElapses: new Queue(2.1, 2.3, 2.2),
                recentTicksSize: 5,
                last_tick_elapse: 2.2,
                get TICK_INTERVAL() {
                    return 1000 / this.TICK_RATE;
                },
                get LAG_WARN_THRESHOLD() {
                    return this.TICK_INTERVAL * 5;
                },
            },
            game: { _gamelife: 7 },
            config: {
                DB_TYPE: "sqlite3",
                DB_URL: ":memory:",
                SERVER_NAME: "api-test",
                SERVER_PORT: 8080,
                IS_TEST_SERVER: true,
            },
            db,
            event_bus: new EventBus(),
            component_registry: componentRegistry,
            http_server: null,
            GAME_LIFE: 7,
            detectLag: () => [false, 2.2],
            executeCommandAsync: (name, ...args) =>
                bus.executeAsync(name, ...args),
        };
        AppContext.setJwtSecret("test-secret-for-api");
        AppContext.setMain(main);

        const app = express();
        app.use(express.json());
        app.use("/api/v1", adminRouter);
        server = app.listen(0);
        await new Promise((res) => server.once("listening", res));
        base = `http://127.0.0.1:${server.address().port}/api/v1`;
    });

    after(async function () {
        await new Promise((res) => server.close(res));
        AppContext.setMain(null);
        AppContext.setJwtSecret(null);
        await db.close();
    });

    it("GET /ping 应返回服务器时间与 tick（公开）", async function () {
        const res = await get("/ping");
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.code, 0);
        assert.ok(body.data.serverTime > 0);
        assert.strictEqual(body.data.tick, 42);
    });

    it("GET /health 应返回组件健康状态（公开）", async function () {
        const res = await get("/health");
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.data.db, "ok");
        assert.strictEqual(body.data.eventBus, "ok");
        assert.strictEqual(body.data.stage, "running");
    });

    it("GET /admin/status 应鉴权并返回运行状态", async function () {
        const denied = await get("/admin/status");
        assert.strictEqual(denied.status, 403);
        const res = await get("/admin/status", adminToken());
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.data.stage, "running");
        assert.strictEqual(body.data.tick, 42);
        assert.strictEqual(body.data.gamelife, 7);
    });

    it("GET /admin/metrics 应返回 tick 指标", async function () {
        const res = await get("/admin/metrics", adminToken());
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.data.tickRate, 5);
        assert.strictEqual(body.data.lag, false);
        assert.ok(Array.isArray(body.data.recentTicksElapses));
    });

    it("GET /admin/event-queue 应返回事件队列状态", async function () {
        const res = await get("/admin/event-queue", adminToken());
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.data.delayedCount, 0);
        assert.ok(typeof body.data.topics === "object");
    });

    it("GET /admin/components 应返回组件列表", async function () {
        componentRegistry.set("db", "online");
        const res = await get("/admin/components", adminToken());
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.ok(Array.isArray(body.data.components));
        assert.ok(
            body.data.components.some((c) => c.name === "db" && c.status === "online")
        );
        assert.ok(body.data.onlineCount >= 1);
    });

    it("GET /admin/players/online 应返回连接数", async function () {
        const res = await get("/admin/players/online", adminToken());
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.ok("connections" in body.data);
        assert.ok(Array.isArray(body.data.onlinePlayers));
    });

    it("POST /admin/command 应通过口令执行指令并返回输出", async function () {
        const res = await post(
            "/admin/command",
            { data: { power: POWER, command: "echo", args: ["hi", "there"] } }
        );
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.code, 0);
        assert.strictEqual(body.data.command, "echo");
        assert.deepStrictEqual(body.data.output, ["hi there"]);
    });

    it("POST /admin/command 应支持异步指令（status）", async function () {
        const res = await post(
            "/admin/command",
            { data: { power: POWER, command: "status" } }
        );
        const body = await res.json();
        assert.strictEqual(body.code, 0);
        assert.ok(body.data.output[0].includes("stage=running"), body.data.output[0]);
        assert.ok(body.data.output[0].includes("accounts=1"), body.data.output[0]);
    });

    it("POST /admin/command 未注册指令应返回 404", async function () {
        const res = await post(
            "/admin/command",
            { data: { power: POWER, command: "nope" } }
        );
        assert.strictEqual(res.status, 404);
        const body = await res.json();
        assert.strictEqual(body.code, 40401);
    });

    it("POST /admin/command 缺 command 应返回 400", async function () {
        const res = await post(
            "/admin/command",
            { data: { power: POWER, args: [] } }
        );
        assert.strictEqual(res.status, 400);
        const body = await res.json();
        assert.strictEqual(body.code, 10001);
    });

    it("POST /admin/command args 非字符串数组应返回 400", async function () {
        const res = await post(
            "/admin/command",
            { data: { power: POWER, command: "echo", args: [1, 2] } }
        );
        assert.strictEqual(res.status, 400);
    });

    it("POST /admin/command 无权限应返回 403", async function () {
        const res = await post("/admin/command", {
            data: { command: "echo", args: [] },
        });
        assert.strictEqual(res.status, 403);
    });

    it("POST /admin/halt 应设置停机定时任务（事件入队）", async function () {
        const before = main.event_bus.delayed.size;
        const res = await post(
            "/admin/halt",
            { data: { power: POWER, tth: 30 } }
        );
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.data.haltAfterSeconds, 30);
        assert.strictEqual(main.event_bus.delayed.size, before + 1);
    });

    it("未实现端点（占位）应返回回显", async function () {
        const res = await get("/admin/logs", adminToken());
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.ok(body.path.includes("/admin/logs"));
    });
});
