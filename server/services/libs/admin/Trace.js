const trace = require("node:trace_events");
const fs = require("node:fs");
const path = require("node:path");

class Trace {
    static CATEGORIES = Object.freeze({
        node: "node", // enabled by default
        async_hooks: "node.async_hooks", // enabled by default
        bootstrap: "node.bootstrap",
        console: "node.console",
        threadpoolwork_sync: "node.threadpoolwork.sync",
        threadpoolwork_async: "node.threadpoolwork.async",
        dns_native: "node.dns.native",
        net_native: "node.net.native",
        fs_sync: "node.fs.sync",
        fs_dir_sync: "node.fs.dir.sync",
        fs_async: "node.fs.async",
        fs_dir_async: "node.fs.dir.async",
        perf: "node.perf",
        perf_usertiming: "node.perf.usertiming",
        perf_timerify: "node.perf.timerify",
        promises_rejections: "node.promises.rejections",
        vm_script: "node.vm.script",
        v8: "v8", // enabled by default
        http: "node.http",
        module_timner: "node.module_timer",
    });
    constructor() {
        this.trace_state = false;
        /**@type {Record<string | symbol, import("node:trace_events").Tracing>} */
        this.traces = {};

        // Default trace categories
        this.traces["default_tracer"] = trace.createTracing({
            categories: ["node.async_hooks"],
        });
    }
    toggle_trace() {
        this.trace_state = !this.trace_state;
    }

    /**
     *
     * @param {string | symbol} event_name
     * @param {Trace.CATEGORIES[keyof Trace.CATEGORIES]} category
     * @returns {this}
     */
    add_tracer(event_name, category) {
        this.traces[event_name] = trace.createTracing({
            categories: [category],
        });
        return this;
    }

    get state() {
        return this.trace_state;
    }
}

module.exports = new Trace();

if (require.main === module) {
    let T = new Trace();
    T.add_tracer("test_tracer", "node.async_hooks");
    T.add_tracer("not_working", /** @type {any} */ ("not_exist_category"));
    T.toggle_trace();
}
