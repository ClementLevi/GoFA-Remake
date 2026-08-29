/**
 * @module main_types
 * @description 主程序（Main）的规范类型定义，按组件分层组织（用户要求的 ECS/组件分层）。
 *  分层：IMainState（数据/状态域）、IMainCapabilities（能力域）、IMainLifecycle（生命周期域），
 *  IMain = IMainState & IMainCapabilities & IMainLifecycle，是 Main 类的单一事实来源。
 *  消费方一律用 Pick/Omit 从 IMain 派生窄投影（IMainLike / IMainForGame / IMainForDeployer），
 *  禁止手写重复形状（历史问题：main.js / CommandBus / AppContext 曾三份漂移）。
 * Layered type definitions for the Main class; the single source of truth.
 * Consumers derive narrow projections via Pick/Omit instead of hand-writing shapes.
 */

/**
 * 主程序运行阶段（联合类型）  Main runtime stage (union type)
 * @typedef {"initializing"|"running"|"exiting"} IMainStage
 */

/**
 * 主程序配置（loadConfig 过滤后的键，全部可选）  Main config (all optional)
 * @typedef {object} IMainConfig
 * @property {string} [GAME_VERSION] - 游戏版本  Game version
 * @property {string} [SERVER_NAME] - 服务器名  Server name
 * @property {number} [SERVER_PORT] - HTTP 端口  HTTP port
 * @property {boolean} [IS_TEST_SERVER] - 是否测试服务器  Test server flag
 * @property {number} [TICK_RATE] - tick 频率（次/秒）  Tick rate
 * @property {string} [DB_TYPE] - 数据库类型  DB type
 * @property {string} [DB_URL] - 数据库地址  DB url
 * @property {number} [DB_PORT] - 数据库端口  DB port
 * @property {string} [DB_USERNAME] - 数据库用户名  DB username
 * @property {string} [DB_PASSWORD] - 数据库密码  DB password
 * @property {string} [MAP_SEED] - 星图种子  Map seed
 * @property {number} [MAP_SIZE_W] - 星图宽（chunk 数）  Map width
 * @property {number} [MAP_SIZE_H] - 星图高（chunk 数）  Map height
 * @property {string} [MAP_MASK_SCRIPT] - 掩码脚本  Mask script
 */

/**
 * 主程序时间信息  Main time info
 * @typedef {object} IMainTime
 * @property {number} TICK - 自启动以来的 tick 数（全局时间）  Total ticks
 * @property {number} TICK_RATE - tick 频率（次/秒）  Tick rate
 * @property {number} startTime - 启动时间戳（ms）  Start timestamp
 * @property {number} last_tick_elapse - 上一次 tick 耗时（ms）  Last tick elapse
 * @property {number[]} recentTicksElapses - 最近几次 tick 耗时  Recent tick elapses
 * @property {number} recentTicksSize - 最近 tick 队列长度  Recent ticks queue size
 * @property {number} TICK_INTERVAL - tick 间隔（ms，getter）  Tick interval
 * @property {number} LAG_WARN_THRESHOLD - 掉刻警告阈值（ms，getter）  Lag warning threshold
 */

/**
 * 数据库实例的按需投影（权威类型：libs/db/Database.js 的 Database 类）
 *  DB instance projection (authority: Database class in libs/db/Database.js)
 * @typedef {object} IDatabaseLike
 * @property {() => Promise<any>} test - 连通性测试  Connectivity test
 * @property {() => Promise<any>} init - 初始化  Initialize
 * @property {(sql: string, params: any[], cb: (err: any, rows?: any[]) => void) => Promise<any>} execute - 执行 SQL  Execute SQL
 * @property {() => Promise<any>} close - 关闭  Close
 * @property {(parent: any) => any} bindParent - 绑定父级  Bind parent
 */

/**
 * 游戏实例的按需投影（权威类型：GoFA-Remake/game.js 的 IGame）
 *  Game instance projection (authority: IGame in GoFA-Remake/game.js)
 * @typedef {object} IGameLike
 * @property {"init"|"running"|"exiting"} stage - 游戏阶段  Game stage
 * @property {() => Promise<void>} init - 初始化  Initialize
 * @property {(deltaTime?: number) => void} tick - 每 tick 调用  Called every tick
 * @property {() => void} exit - 退出  Exit
 */

/**
 * 数据/状态域（Main 持有的东西）  Data/state layer (what Main holds)
 * @typedef {object} IMainState
 * @property {IMainConfig} config - 配置  Config
 * @property {IDatabaseLike|null} db - 数据库实例  Database instance
 * @property {IGameLike|null} game - 游戏实例  Game instance
 * @property {InstanceType<import("../shared/logger").TypeLogger>} logger - 日志单例  Logger
 * @property {IMainStage} stage - 运行阶段  Runtime stage
 * @property {IMainTime} time - 时间信息  Time info
 * @property {InstanceType<typeof import("../commands/CommandBus")>} commands - 命令总线  Command bus
 * @property {InstanceType<typeof import("../../GoFA-Remake/event_manager/EventBus")>} event_bus - 事件总线  Event bus
 * @property {InstanceType<typeof import("../commands/ComponentRegistry")>|null} component_registry - 组件在线注册表  Component registry
 * @property {import("node:http").Server|null} http_server - HTTP 服务器  HTTP server
 * @property {import("express").Express|null} http_app - Express 应用  Express app
 * @property {object} ev_queues - 事件与待更新任务队列  Event & task queues
 * @property {ReturnType<typeof setTimeout>|null} event_loop_handle - tick 定时器句柄  Tick timer handle
 */

/**
 * 能力域（Main 能做什么）  Capabilities layer (what Main can do)
 * @typedef {object} IMainCapabilities
 * @property {(name: string, ...args: string[]) => boolean} executeCommand - 同步执行指令  Sync execute command
 * @property {(name: string, ...args: string[]) => Promise<import("../commands/CommandBus").CommandExecutionResult>} executeCommandAsync - 异步执行指令并收集输出  Async execute command
 * @property {(name: string|symbol, cb: (...args: any[]) => void) => object} regEvent - 注册事件（返回 this 链式）  Register event (chainable)
 * @property {() => [boolean, number]} detectLag - 掉刻检测，返回 [是否掉刻, 平均耗时]  Lag detection
 * @property {(last_elapse: number) => void} refreshRecentTicksElapses - 刷新最近 tick 耗时  Refresh recent tick elapses
 * @property {number} GAME_LIFE - 游戏生命周期（getter）  Game life
 * @property {IMainConfig} OPTIONS - 配置快捷访问（getter）  Options shortcut
 */

/**
 * 生命周期域（对外契约：init → run → tick → exit；onStarted/onLag/onExit 等内部钩子不属契约）
 *  Lifecycle layer (external contract: init -> run -> tick -> exit; internal hooks excluded)
 * @typedef {object} IMainLifecycle
 * @property {() => Promise<object>} init - 初始化游戏  Initialize
 * @property {() => void} run - 运行（进入 tick 循环）  Run
 * @property {(deltaTime: number) => void} tick - 每 tick 调用  Tick
 * @property {() => void|number} exit - 退出（清理资源）  Exit
 */

/**
 * 主程序完整形状（组件分层组合）  Full Main shape (layered composition)
 * @typedef {IMainState & IMainCapabilities & IMainLifecycle} IMain
 */

/**
 * 通用环境投影（CommandBus / AppContext / admin / 指令系统复用）
 *  Common environment projection (reused by CommandBus / AppContext / admin / commands)
 * @typedef {Pick<IMain, "stage"|"time"|"db"|"game"|"event_bus"|"http_server"|"component_registry"|"config"|"GAME_LIFE"|"detectLag"|"executeCommand"|"executeCommandAsync">} IMainLike
 */

/**
 * 游戏消费方窄投影（游戏仅需 stage）  Game consumer projection (game only needs stage)
 * @typedef {Pick<IMain, "stage">} IMainForGame
 */

/**
 * 部署器消费方窄投影（部署器仅需 db）  Deployer consumer projection (deployer only needs db)
 * @typedef {Pick<IMain, "db">} IMainForDeployer
 */

module.exports = {};
