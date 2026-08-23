/**
 * @module ComponentRegistry
 * @description 组件在线状态注册表（内存态）：记录组件名 → 状态/最近变更时间/备注。
 *  供 component 指令与 /api/v1/admin/components 端点共用；状态变更时由调用方发布
 *  SERVER_COMPONENT_ONLINE / SERVER_COMPONENT_OFFLINE 事件（见 ENUMGoFAGameEvents）。
 *  In-memory component online/offline registry shared by the component command and the
 *  admin components API. Status changes publish SERVER_COMPONENT_* events at the caller.
 *
 *  类型约定（TS 级 JSDoc）：状态用联合类型 ComponentStatus；内部存储为
 *  Map<string, ComponentState>；list() 输出展平为带 name 的 ComponentStateEntry。
 */

// ─────────────────── 类型体操：领域类型定义 ───────────────────

/**
 * 组件在线状态（联合类型）  Component status (union type)
 * @typedef {"online"|"offline"|"unknown"} ComponentStatus
 */

/**
 * 组件状态（存储值）  Component state (stored value)
 * @typedef {object} ComponentState
 * @property {ComponentStatus} status - 在线状态  Status
 * @property {number} lastChange - 最近变更时间戳（ms，0=尚未上报）  Last change timestamp
 * @property {string} detail - 备注  Detail note
 */

/**
 * 组件状态条目（list() 输出：状态 + 组件名）  Component state entry (list() output)
 * @typedef {ComponentState & {name: string}} ComponentStateEntry
 */

/**
 * 组件状态 Map（内部存储类型）  Component state map (internal storage type)
 * @typedef {Map<string, ComponentState>} ComponentMap
 */

/**
 * 核心组件默认清单（冻结元组，运行时不可变）  Core component defaults
 * @type {readonly string[]}
 */const DEFAULT_COMPONENTS = Object.freeze([
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
        /** @type {ComponentMap} components - 组件状态表  Component state map */
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
     * @param {"online"|"offline"} status - 状态（unknown 仅作初始值，不经本方法写入）  Status
     * @param {string} [detail] - 备注  Detail
     * @returns {this} 支持链式调用  Chainable
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
     * 列出全部组件状态（展平为带 name 的条目）  List all component states (flattened with name)
     * @returns {ComponentStateEntry[]}
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
     * @returns {this} 支持链式调用  Chainable
     */
    remove(name) {
        this.components.delete(name);
        return this;
    }

    /**
     * 统计某状态组件数（类型体操：status 参数限定为 ComponentStatus 联合）
     *  Count components with a given status (status constrained to the ComponentStatus union)
     * @param {ComponentStatus} [status] - 状态过滤；缺省统计全部  Status filter, defaults to all
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
