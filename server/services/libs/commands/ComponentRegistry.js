/**
 * @module ComponentRegistry
 * @description 组件在线状态注册表（内存态）：记录组件名 → 状态/最近变更时间/备注。
 *  供 component 指令与 /api/v1/admin/components 端点共用；状态变更时由调用方发布
 *  SERVER_COMPONENT_ONLINE / SERVER_COMPONENT_OFFLINE 事件（见 ENUMGoFAGameEvents）。
 *  In-memory component online/offline registry shared by the component command and the
 *  admin components API. Status changes publish SERVER_COMPONENT_* events at the caller.
 */

/**
 * @typedef {object} ComponentState
 * @property {"online"|"offline"|"unknown"} status - 在线状态  Status
 * @property {number} lastChange - 最近变更时间戳（ms）  Last change timestamp
 * @property {string} detail - 备注  Detail note
 */

/** 核心组件默认清单  Core component defaults */
const DEFAULT_COMPONENTS = Object.freeze([
    "db",
    "event_bus",
    "http",
    "game",
    "chat",
    "mail",
    "lobby",
]);

/**
 * @class ComponentRegistry
 * @description 组件在线状态注册表  Component status registry
 */
class ComponentRegistry {
    constructor() {
        /** @type {Map<string, ComponentState>} */
        this.components = new Map();
        // 预置核心组件（unknown 起步，待上报）  Seed core components as unknown
        for (const name of DEFAULT_COMPONENTS) {
            this.components.set(name, {
                status: "unknown",
                lastChange: 0,
                detail: "",
            });
        }
    }

    /**
     * 设置组件状态  Set a component's status
     * @param {string} name - 组件名  Component name
     * @param {"online"|"offline"} status - 状态  Status
     * @param {string} [detail] - 备注  Detail
     * @returns {this}
     */
    set(name, status, detail = "") {
        if (typeof name !== "string" || name.length === 0) {
            return this;
        }
        const s = status === "online" ? "online" : "offline";
        this.components.set(name, {
            status: s,
            lastChange: Date.now(),
            detail: String(detail ?? ""),
        });
        return this;
    }

    /**
     * 读取组件状态  Get a component's state
     * @param {string} name - 组件名  Component name
     * @returns {ComponentState|null} 不存在时返回 null  null when absent
     */
    get(name) {
        return this.components.get(name) ?? null;
    }

    /**
     * 列出全部组件状态  List all component states
     * @returns {Array<{name: string, status: string, lastChange: number, detail: string}>}
     */
    list() {
        return [...this.components.entries()].map(([name, v]) => ({
            name,
            status: v.status,
            lastChange: v.lastChange,
            detail: v.detail,
        }));
    }

    /**
     * 移除组件  Remove a component
     * @param {string} name - 组件名  Component name
     * @returns {this}
     */
    remove(name) {
        this.components.delete(name);
        return this;
    }

    /**
     * 统计某状态组件数  Count components with a given status
     * @param {string} [status] - 状态过滤；缺省统计全部  Status filter, defaults to all
     * @returns {number}
     */
    count(status) {
        let n = 0;
        for (const v of this.components.values()) {
            if (!status || v.status === status) n++;
        }
        return n;
    }
}

module.exports = ComponentRegistry;
