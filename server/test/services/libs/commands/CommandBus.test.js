const assert = require("assert");
const path = require("path");

const CommandBus = require(path.resolve("services/libs/commands/CommandBus"));
const AppContext = require(path.resolve("services/libs/shared/AppContext"));

describe("CommandBus", function () {
    let bus;

    beforeEach(function () {
        bus = new CommandBus(null); // 无 logger，输出走收集器  no logger, output via collector
    });

    afterEach(function () {
        AppContext.setMain(null);
    });

    it("register + execute should invoke the handler and return true", function () {
        let called = false;
        bus.register("test", () => {
            called = true;
        });
        const ok = bus.execute("test");
        assert.strictEqual(ok, true);
        assert.strictEqual(called, true);
    });

    it("execute on unknown command should return false", function () {
        assert.strictEqual(bus.execute("no_such_command"), false);
    });

    it("register should reject non-function handlers", function () {
        bus.register("bad", "not a function");
        assert.strictEqual(bus.execute("bad"), false);
    });

    it("multiple handlers for one command should all run", async function () {
        const calls = [];
        bus.register("multi", () => calls.push(1));
        bus.register("multi", () => calls.push(2));
        const { found } = await bus.executeAsync("multi");
        assert.strictEqual(found, true);
        assert.deepStrictEqual(calls, [1, 2]);
    });

    it("registerBatch should accept { handler, meta } entries", async function () {
        bus.registerBatch({
            alpha: {
                handler: (args, ctx) => ctx.reply(`alpha:${args.join(",")}`),
                meta: { description: "A", category: "monitor" },
            },
            beta: (args, ctx) => ctx.reply(`beta:${args.length}`),
        });
        const { found, output } = await bus.executeAsync("alpha", "1", "2");
        assert.strictEqual(found, true);
        assert.deepStrictEqual(output, ["alpha:1,2"]);
        const beta = await bus.executeAsync("beta");
        assert.strictEqual(beta.found, true);
        assert.deepStrictEqual(beta.output, ["beta:0"]);
    });

    it("executeAsync should collect ctx.reply output", async function () {
        bus.register("greet", (args, ctx) => {
            ctx.reply(`hello ${args[0]}`);
        });
        const { found, output } = await bus.executeAsync("greet", "world");
        assert.strictEqual(found, true);
        assert.deepStrictEqual(output, ["hello world"]);
    });

    it("executeAsync should await async handlers", async function () {
        bus.register("slow", async (args, ctx) => {
            await new Promise((res) => setTimeout(res, 10));
            ctx.reply("done");
        });
        const { output } = await bus.executeAsync("slow");
        assert.deepStrictEqual(output, ["done"]);
    });

    it("handler errors should be isolated and reported in output", async function () {
        bus.register("boom", () => {
            throw new Error("kaboom");
        });
        bus.register("boom", (args, ctx) => ctx.reply("second-handler-ok"));
        const { found, output } = await bus.executeAsync("boom");
        assert.strictEqual(found, true);
        assert.ok(output.some((l) => l.includes("kaboom")));
        assert.ok(output.some((l) => l === "second-handler-ok"));
    });

    it("help should list commands and support category filter", async function () {
        bus.register("alpha", () => {}, {
            description: "Alpha command",
            category: "monitor",
        });
        bus.register("beta", () => {}, {
            description: "Beta command",
            category: "management",
        });
        const all = await bus.executeAsync("help");
        assert.ok(all.output.some((l) => l.includes("[help]")));
        assert.ok(all.output.some((l) => l.includes("monitor")));
        assert.ok(all.output.some((l) => l.includes("management")));
        const monitor = await bus.executeAsync("help", "monitor");
        assert.ok(monitor.output.some((l) => l.includes("alpha")));
        assert.ok(!monitor.output.some((l) => l.includes("beta")));
        const empty = await bus.executeAsync("help", "nope");
        assert.ok(empty.output.some((l) => l.includes("暂无指令")));
    });

    it("listCommands should return command metadata", function () {
        bus.register("alpha", () => {}, {
            description: "A",
            usage: "alpha <x>",
            category: "data",
        });
        const list = bus.listCommands();
        const alpha = list.find((c) => c.name === "alpha");
        assert.ok(alpha);
        assert.strictEqual(alpha.description, "A");
        assert.strictEqual(alpha.usage, "alpha <x>");
        assert.strictEqual(alpha.category, "data");
    });
});
