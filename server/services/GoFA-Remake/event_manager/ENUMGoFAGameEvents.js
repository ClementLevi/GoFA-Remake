const path = require("node:path");
const { version } = require(path.resolve(__dirname, "../../../package.json"));

// 以下所有事件均为服务端内部处理的事件
const GameEvent = Object.freeze({
    /**
     * @description 从项目package.json中获取
     * @constant
     * @type {string}
     */
    __version: version,
    /**
     * @borrows GameEvent~__version as GameEvent.version
     * @returns {string}
     */
    get version() {
        return this.__version;
    },
    // # 服务端内部非业务逻辑事件
    // 服务器启动
    SERVER_READY: "server_ready",
    // 服务器关闭
    SERVER_SHUTDOWN: "server_shutdown",
    // 组件上线
    SERVER_COMPONENT_ONLINE: "server_component_online",
    // 组件离线
    SERVER_COMPONENT_OFFLINE: "server_component_offline",
    // 服务器收到控制台命令
    SERVER_COMMAND: "server_command",
    // 服务器完整性校验失败
    SERVER_INTEGRITY_FAILED: "server_integrity_failed",
    // 服务器部署开始
    SERVER_DEPLOYMENT_INITIATE: "server_deployment_initiate",
    // 服务器部署完成
    SERVER_DEPLOYED: "server_deployed",
    // 该校验客户端完整性了，所有在线客户端每gt各有千分之一概率触发
    SERVER_CREATE_CLIENT_INTEGRITY_CHALLENGE:
        "server_create_client_integrity_challenge",
    // 发现客户端未通过完整性校验挑战
    SERVER_FOUND_CLIENT_FAILING_CHALLENGE:
        "server_found_client_failing_challenge",
    // 服务器认为客户端掉线
    SERVER_DISCONNECT_CLIENT: "server_disconnect_client",
    // 服务器将客户端从大厅重定向到子服务器
    SERVER_REROUTE_CLIENT: "server_reroute_client",


    // # 服务端内部业务逻辑事件

    // ## 子服务器角色
    // 角色修改名称成功
    ROLE_CHANGE_NAME_COMPLETE: "role_change_name_complete",
    // 角色使用技能点成功
    ROLE_UPGRADE_SKILL_COMPLETE: "role_upgrade_skill_complete",
    // 角色使用道具成功
    ROLE_USE_ITEM_COMPLETE: "role_use_item_complete",
    // 角色购买道具成功
    ROLE_PURCHASE_ITEM_COMPLETE: "role_purchase_item_complete",
    // 角色修改名称失败
    ROLE_CHANGE_NAME_FAILED: "role_change_name_failed",
    // 角色使用技能点失败
    ROLE_UPGRADE_SKILL_FAILED: "role_upgrade_skill_failed",
    // 角色使用道具失败
    ROLE_USE_ITEM_FAILED: "role_use_item_failed",
    // 角色购买道具失败
    ROLE_PURCHASE_ITEM_FAILED: "role_purchase_item_failed",

    // ## 星球
    // 星球更改所有权，作战结束（TASKFORCE_COMBAT）、玩家抛弃（PLANET_ABANDON）或占据无主星球（TASKFORCE_MOVE或PLAYER_NEW_GATE）触发
    PLANET_TRANSFER: "planet_transfer",
    // 星球成为某人的星门
    PLANET_BECOMES_GATE: "planet_becomes_gate",
    // 更新星球资源数量。当玩家访问星球（PLANET_INSPECT）、刺探星球（SPY_PLANET_ESPIONAGE）或攻击结算（TASKFORCE_COMBAT）时触发
    PLANET_RESOURCE_UPDATE:     "planet_resource_update",
    // 星球遭到攻击。在战斗结算前都保持被攻击状态
    PLANET_INCOMING_DETECTED: "planet_incoming_detected",
    // 星球遭到的攻击解除，可能通过 `TASKFORCE_MOVE-TASKFORCE_DEPARTED`（玩家取消攻击移动）或 `TASKFORCE_DOCK_IN_VOID` 抛锚操作触发
    PLANET_INCOMING_RELIEVED: "planet_incoming_relieved",

    // ## 地表建筑
    // 建筑开始建造
    BUILDING_BUILT: "building_built",
    // 建筑已摧毁
    BUILDING_DESTROYED: "building_destroyed",
    // 建筑开始升级
    BUILDING_UPGRADED: "building_upgraded",
    // 建筑完成，包括升级、生产序列的完成
    BUILDING_FINISHED: "building_finished",
    // 建筑已启动生产队列，如生产探测器、飞船、地面部队和升级可装备项目等
    BUILDING_PRODUCTION_ENQUEUED: "building_production_enqueued",
    // 建筑已选择装备，指蓝图、增幅器等
    BUILDING_EQUIPPED: "building_equipped",
    // 建筑已加速生产
    BUILDING_SPEEDED_UP_PRODUCTION: "building_speeded_up_production",
    // 建筑已取消生产
    BUILDING_CANCELLED: "building_cancelled",
    // 建筑已拒绝操作，服务器认为该操作不合法，如建造或升级时资源不足、生产队列已满等
    BUILDING_REJECTED: "building_rejected",

    // ## 机群
    // 机群重组完成，涉及航母及其编队和载荷的数量调整
    FLEET_RECOMPOSED: "fleet_recomposed",
    // 机群重组失败
    FLEET_RECOMPOSE_FAILED: "fleet_recomposed_failed",
    // 航母重命名
    FLEET_RENAMED: "fleet_renamed",
        // 航母重命名
    FLEET_RENAME_FAILED: "fleet_rename_failed",

    // ## 舰队
    // 舰队开始移动
    TASKFORCE_DEPARTED: "taskforce_departed",
    // 舰队到达，触发舰队移动结算事件
    TASKFORCE_ARRIVE: "taskforce_arrive",
    // 舰队失踪，一定时间后造成随机损伤并返回（TASKFORCE_MOVE）
    TASKFORCE_MISSING: "taskforce_missing",
    // 舰队战斗结束，发生地点任意，反馈结算。通过触发 `MAIL_BATTLE_REPORT` 事件发送结果
    TASKFORCE_COMBAT: "taskforce_combat",
    // 舰队准备进入战斗，等待00/15/30/45分触发
    TASKFORCE_COMBAT_PREP:  "taskforce_combat_prep",
    // 舰队被拦截，进入战斗预备
    TASKFORCE_INTERCEPT_TRIGGER: "taskforce_intercept_trigger",
    // 舰队在深空抛锚
    TASKFORCE_DOCKED: "taskforce_docked",
    // 舰队抛锚期间补给消耗殆尽，会触发 `TASKFORCE_DEPARTED` 事件以继续前进
    TASKFORCE_DOCKED_DEPLETED: "taskforce_docked_depleted",

    // ## 联盟
    // 联盟创建成功
    ALLIANCE_CREATE_CONFIRM: "alliance_create_confirm",
    // 联盟创建失败
    ALLIANCE_CREATE_FAILED: "alliance_create_failed",
    // 联盟日志，包括基本信息、成员、小队、管理层级、外交关系、公告创建与删除等修改
    ALLIANCE_LOG: "alliance_log",
    // 联盟解散
    ALLIANCE_DISBANDED: "alliance_disbanded",
    // 联盟外交关系变更
    ALLIANCE_RELATION_CHANGED: "alliance_relation_changed",

    // ## 邮件
    // 消息已读
    MAIL_ALREADY_READ: "mail_already_read",
    // ### 战斗报告
    MAIL_BATTLE_REPORT: "mail_battle_report",
    // ### 侦察
    // 侦察报告，由间谍卫星阵列发送探测器
    MAIL_SPY_REPORT: "mail_spy_report",
    // 被刺探报告，当玩家星球或攻击舰队被扫描时触发
    MAIL_ESPIONAGE_ALERT: "mail_espionage_alert",


    // # 由客户端向服务端推送的事件
    // ! 注意所有参数需要服务端内部校验

    // ## 客户端非业务逻辑事件
    // 客户端连接到大厅
    CLIENT_CONNECTED: "client_connected",
    // 客户端重定向，指从大厅转到子服务器
    CLIENT_REROUTED: "client_rerouted",
    // 客户端答复完整性挑战，校验客户端完整性
    CLIENT_ANSWER_INTEGRITY_CHALLENGE: "client_answer_integrity_challenge",
    // 客户端心跳，一段时间内无该事件则认为掉线（DISCONNECTED）
    CLIENT_HEARTBEAT: "client_heartbeat",
    // 客户端加载指定范围地图，会加载一定范围内的星系静态数据和玩家所有权数据
    CLIENT_LOAD_MAP: "client_load_map",

    // ## 玩家账号
    // 玩家注册，获取到的ID是唯一且不可更改的
    PLAYER_REGISTER: "player_register",
    // 玩家登录，使用ID或邮箱
    PLAYER_LOGIN: "player_login",
    // 玩家登出
    PLAYER_LOGOUT: "player_logout",
    // 玩家修改密码
    PLAYER_CHANGE_PASSWORD: "player_change_password",
    // 玩家修改邮箱
    PLAYER_CHANGE_EMAIL: "player_change_email",
    // 玩家创建角色
    PLAYER_CREATE_ROLE: "player_create_role",
    // 玩家使用角色
    PLAYER_USE_ROLE: "player_use_role",
    // 玩家删除角色
    PLAYER_DELETE_ROLE: "player_delete_role",
    // 玩家新选择星门，客户端发出，服务端需校验：当前无星门，当前无外部星球
    PLAYER_NEW_GATE: "player_new_gate",

    // ## 子服务器角色
    // 角色修改名称
    ROLE_CHANGE_NAME: "role_change_name",
    // 角色使用技能点
    ROLE_UPGRADE_SKILL: "role_upgrade_skill",
    // 角色使用道具
    ROLE_USE_ITEM: "role_use_item",
    // 角色购买道具
    ROLE_PURCHASE_ITEM: "role_purchase_item",

    // ## 星球
    // 星球放弃，将该星球转化为无主星球
    PLANET_ABANDON: "planet_abandon",
    // 星球检视，用于向星球数据字段惰性更新产出
    PLANET_INSPECT: "planet_inspect",
    // 星球侦察，由间谍卫星阵列发送探测器。在客户端，该操作仅仅调起GUI页面，以便用户点选合适的间谍卫星阵列、组织合适数量的间谍卫星探测器，然后发起 `SPY_PLANET_ESPIONAGE` 请求
    PLANET_SPY: "planet_spy",
    // 标记收藏
    PLANET_PIN_SET: "planet_pin_set",
    // 取消收藏
    PLANET_PIN_OFF: "planet_pin_off",
    // 标记悬赏，玩家需位于联盟中，需根据时长支付相应的费用（ROLE_USE_ITEM）
    PLANET_REWARD_SET: "planet_reward_set",

    // ## 地表建筑
    // 建筑建造
    BUILDING_BUILD: "building_build",
    // 建筑摧毁
    BUILDING_DESTROY: "building_destroy",
    // 建筑升级
    BUILDING_UPGRADE: "building_upgrade",
    // 建筑完成，包括升级、生产序列的完成
    BUILDING_FINISH: "building_finish",
    // 建筑排入生产队列，如生产探测器、飞船、地面部队和升级可装备项目等
    BUILDING_PRODUCTION_ENQUEUE: "building_production_enqueue",
    // 建筑装备，指蓝图、增幅器等
    BUILDING_EQUIP: "building_equip",
    // 建筑加速生产
    BUILDING_SPEED_UP_PRODUCTION: "building_speed_up_production",
    // 建筑取消生产，对于生产序列，会按当前进度计算无法退款的资源转换成成品
    BUILDING_CANCEL: "building_cancel",

    // ## 机群
    // 机群创建，指单个航母的建造完成
    FLEET_CREATE: "fleet_create",
    // 机群摧毁，指玩家手动删除航母或在交战中摧毁
    FLEET_DESTROY: "fleet_destroy",
    // 机群重组，涉及航母及其编队和载荷的数量调整
    FLEET_RECOMPOSE: "fleet_recompose",
    // 机群升级，指增幅器，这也会触发ROLE_USE_ITEM事件
    FLEET_UPGRADE: "fleet_upgrade",
    // 航母重命名
    FLEET_RENAME: "fleet_rename",

    // ## 舰队
    // 舰队命名，组成固定编队
    TASKFORCE_ENTITLE: "taskforce_entitle",
    // 舰队解散，玩家手动解散或所有机群被摧毁
    TASKFORCE_DISBAND: "taskforce_disband",
    // 舰队移动，由服务端根据到达时的目的地选择触发作战、重新安置或协助防御
    TASKFORCE_MOVE: "taskforce_move",
    // 舰队运输，无视目的地属性，将载荷运送至目的地并返回
    TASKFORCE_TRANSPORT: "taskforce_transport",
    // 舰队在太空中抛锚，仅适用于装备了重力井的舰队
    TASKFORCE_DOCK_IN_VOID: "taskforce_dock_in_void",
    // 舰队远征，指单个舰队的远征，由服务端根据远征结果触发作战
    TASKFORCE_EXPEDITION: "taskforce_expedition",

    // ## 聊天
    // 聊天消息, 可选的目标包括公聊（PUBLIC）、联盟聊天（ALLIANCE）、小队聊天（TEAM）频道
    CHAT_MSG: "chat_msg",

    // ## 邮件
    // 发送邮件
    MAIL_TO: "mail_to",
    // 删除邮件
    MAIL_DELETE: "mail_delete",
    // 阅读邮件
    MAIL_READ: "mail_read",
    // 回复邮件，将会把上一封邮件的文本内容拼接在其后
    MAIL_REPLY: "mail_reply",
    // 领取邮件附件
    MAIL_CLAIM: "mail_claim",

    // ## 侦察
    // 来袭舰队探测
    SPY_INCOMING_COUNTER: "spy_incoming_counter",
    // 星球探测
    SPY_PLANET_ESPIONAGE: "spy_planet_espionage",
    // 本地任务扫描，会生成可以派遣舰队处理的任务副本。
    SPY_BOUNTY_DISCOVER: "spy_bounty_discovery",

    // ## 联盟
    // ### 基本管理
    // 联盟创建，由无联盟玩家发起，创建后不能改名和缩写，将会触发玩家使用物品事件（ROLE_USE_ITEM）
    ALLIANCE_CREATE: "alliance_create",
    // 联盟解散，由联盟所有者（O-5）发起
    ALLIANCE_DISBAND: "alliance_disband",
    // 联盟修改简介，由联盟高级管理员（O-4+）发起
    ALLIANCE_CHANGE_INTRO: "alliance_change_intro",
    // 联盟修改头像，由联盟高级管理员（O-4+）发起
    ALLIANCE_CHANGE_AVATAR: "alliance_change_avatar",

    // ### 外交关系，均需要联盟高级管理员（O-4+）权限
    // 发起不侵犯条约请求
    ALLIANCE_REQUEST_NAP: "alliance_request_NAP",
    // 接受不侵犯条约请求
    ALLIANCE_ACCEPT_NAP: "alliance_accept_NAP",
    // 拒绝不侵犯条约请求
    ALLIANCE_REJECT_NAP: "alliance_reject_NAP",
    // 宣战，不需要对方同意
    ALLIANCE_DECLARE_WAR: "alliance_declare_war",
    // 请求中立
    ALLIANCE_REQUEST_NEUTRAL: "alliance_request_neutral",
    // 同意中立
    ALLIANCE_ACCEPT_NEUTRAL: "alliance_accept_neutral",

    // ### 成员管理
    // 邀请加入，由联盟管理员（O-3+）及以上权限发起
    ALLIANCE_INVITE: "alliance_invite",
    // 接受邀请，由非联盟成员玩家发起
    ALLIANCE_ACCEPT_INVITE: "alliance_accept_invite",
    // 拒绝邀请，由非联盟成员玩家发起
    ALLIANCE_REJECT_INVITE: "alliance_reject_invite",
    // 退出联盟
    ALLIANCE_LEAVE: "alliance_leave",
    // 申请加入联盟，由非联盟成员玩家发起
    ALLIANCE_APPLY: "alliance_apply",
    // 联盟修改成员角色，由联盟管理员及以上角色（O-3+）发起，注意O-4职位限额为=FLOOR(MemberCount/7)+
    ALLIANCE_APPOINTMENT: "alliance_appointment",
    // 联盟移除成员，由联盟管理员及以上角色（O-3+）发起，注意O-5以外角色不能移除相邻权限等级的成员

    // ### 管理层重构，需要联盟所有者（O-5）为不活跃状态3个月
    // 罢免盟主，由联盟高级管理员（O-4+）发起
    ALLIANCE_EXILE_LEADER: "alliance_exile_leader",
    /*
     * 就罢免盟主及提名新盟主投票，需要联盟处于罢免状态。
     * 需要有4/5总数的活跃玩家支持罢免，方可通过罢免。
     * 提名最多的人选将成为新的盟主，旧盟主视O-4职位限额调整为O-4或O-3。
     */
    ALLIANCE_LEADER_VOTE: "alliance_leader_vote",
    // 镇压罢免，需要联盟所有者（O-5）权限
    ALLIANCE_EXILE_PACIFY:"alliance_exile_pacify",

    // ### 联盟公告管理
    ALLIANCE_KICK: "alliance_kick",
    // 联盟成员发布公告
    ALLIANCE_POST_INITIATE: "alliance_post_initiate",
    // 联盟成员删除公告，需要是公告作者或管理员
    ALLIANCE_POST_DELETE: "alliance_post_delete",
    // 置顶公告，由联盟管理员发起
    ALLIANCE_POST_PIN: "alliance_post_pin",
    // 取消置顶公告，由联盟管理员发起
    ALLIANCE_POST_UNPIN: "alliance_post_unpin",

    // ### 联盟小队
    // 创建小队，由联盟高级成员（O-2）以上发起
    ALLIANCE_CREATE_TEAM: "alliance_create_team",
    // 加入小队，未在当前小队中的成员可加入
    ALLIANCE_JOIN_TEAM: "alliance_join_team",
    // 退出小队，由小队成员发起
    ALLIANCE_LEAVE_TEAM: "alliance_leave_team",
});

module.exports = GameEvent;
console.log(GameEvent.version);
