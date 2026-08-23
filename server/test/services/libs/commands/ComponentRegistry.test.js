const assert = require("assert");
const path = require("path");

const ComponentRegistry = require(path.resolve(
    "services/libs/commands/ComponentRegistry"
));

describe("ComponentRegistry", function () {
    it("should seed core components as unknown", function () {
        const reg = new ComponentRegistry();
        assert.strictEqual(reg.count("unknown"), 7);
        assert.strictEqual(reg.get("db").status, "unknown");
    });

    it("set/get should update a component status", function () {
        const reg = new ComponentRegistry();
        reg.set("db", "online");
        assert.strictEqual(reg.get("db").status, "online");
        assert.ok(reg.get("db").lastChange > 0);
    });

    it("set should treat any non-online status as offline", function () {
        const reg = new ComponentRegistry();
        reg.set("chat", "offline");
        assert.strictEqual(reg.get("chat").status, "offline");
        reg.set("mail", "weird");
        assert.strictEqual(reg.get("mail").status, "offline");
    });

    it("set should ignore invalid names", function () {
        const reg = new ComponentRegistry();
        reg.set("", "online");
        assert.strictEqual(reg.count("online"), 0);
    });

    it("list should return all entries with name/status/detail", function () {
        const reg = new ComponentRegistry();
        reg.set("lobby", "online", "gate up");
        const list = reg.list();
        const lobby = list.find((c) => c.name === "lobby");
        assert.ok(lobby);
        assert.strictEqual(lobby.status, "online");
        assert.strictEqual(lobby.detail, "gate up");
    });

    it("remove should delete a component", function () {
        const reg = new ComponentRegistry();
        reg.remove("db");
        assert.strictEqual(reg.get("db"), null);
        assert.strictEqual(reg.count(), 6);
    });

    it("count should filter by status", function () {
        const reg = new ComponentRegistry();
        reg.set("db", "online");
        reg.set("http", "online");
        reg.set("chat", "offline");
        assert.strictEqual(reg.count("online"), 2);
        assert.strictEqual(reg.count("offline"), 1);
        assert.strictEqual(reg.count("unknown"), 4);
        assert.strictEqual(reg.count(), 7);
    });
});
