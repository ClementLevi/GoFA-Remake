DROP TABLE IF EXISTS player_account;
CREATE TABLE player_account(
    player_ID TEXT(32) NOT NULL AUTOINCREMENT , --账户ID
    player_LoginMethod TEXT(32) NOT NULL  , --登陆方式
    player_LoginAcct TEXT(90) NOT NULL  , --登陆账号
    player_PwMD5 TEXT(32) NOT NULL  , --登陆密码MD5
    player_RegisterTime NUMERIC NOT NULL  , --注册时间
    player_LastLogin NUMERIC NOT NULL  , --上次登录事件记录
    PRIMARY KEY (player_ID)
)  ; --玩家账户;这张表考虑单独放一个身份校验服务器里，而各个角色的数据则用没有服务器标识号字段的子服务器存储
（合并服务器可能性微存）

DROP TABLE IF EXISTS player_role;
CREATE TABLE player_role(
    role_ID TEXT(32) NOT NULL AUTOINCREMENT , --角色ID
    role_RACE TEXT(32) NOT NULL  , --种族
    role_CREATE_TIME NUMERIC   , --创建时间
    role_NAME TEXT(32) NOT NULL  , --角色名
    role_exp LONG NOT NULL  DEFAULT 0, --经验值
    role_lv INTEGER NOT NULL  DEFAULT 1, --等级
    role_credit INTEGER NOT NULL  DEFAULT 0, --信用点
    role_last_login NUMERIC NOT NULL  , --上次登录时间
    role_alliance TEXT(32)   , --所属联盟
    role_privilege TEXT(2) NOT NULL  DEFAULT 0, --权限组;op又不能刷资源 要权限组干什么
    role_skill TEXT(255)   , --技能点;char类型数组，维护各种技能的等级，形如“000A0904”表示四项技能分别为0、10、9、4级。具体技能顺序另作安排。
    PRIMARY KEY (role_ID)
)  ; --玩家角色数据

DROP TABLE IF EXISTS player_purchases;
CREATE TABLE player_purchases(
    PRecordID INTEGER NOT NULL  , --流水号
    role_ID TEXT(32) NOT NULL  , --角色ID
    PItem TEXT(32)   , --购买项目
    PAmount REAL(24,6)   , --支付金额
    PChannel TEXT(32)   , --购买途径
    POrderTime NUMERIC   , --下单时间
    PStatus TEXT(32)   , --支付状态
    PRecordComment TEXT(90)   , --订单备注
    PRIMARY KEY (PRecordID)
)  ; --氪金记录

DROP TABLE IF EXISTS player_security;
CREATE TABLE player_security(
    SRecordID INTEGER NOT NULL AUTOINCREMENT , --日志ID
    SUserID TEXT(32) NOT NULL  , --行为者ID;非注册用户的行为就交给服务器日志去记录吧
    SAction TEXT(32) NOT NULL  , --行为
    SObject TEXT(32)   , --行为对象
    STime NUMERIC NOT NULL  , --时间
    SIP INT   , --IP地址;xxx.xxx.xxx.xxx
    PRIMARY KEY (SRecordID)
)  ; --玩家日志

DROP TABLE IF EXISTS player_msg;
CREATE TABLE player_msg(
    MSGID INTEGER NOT NULL AUTOINCREMENT , --ID
    MSGTheme TEXT(90)   , --主题
    MSGSender TEXT(32) NOT NULL  , --发件人
    MSGReceiver TEXT(32) NOT NULL  , --收件人
    MSGContent TEXT(900)   , --正文
    MSGStatus TEXT(32)   , --邮件状态
    MSGTimestamp NUMERIC NOT NULL  , --发件时间
    PRIMARY KEY (MSGID)
)  ; --玩家私信

DROP TABLE IF EXISTS map_chunk;
CREATE TABLE map_chunk(
    chunk_ID TEXT(32)   , --ID
    chunk_CENTER TEXT(255)   , --地图块中心点坐标
    chunk_system_member TEXT(32)    --区块成员;指星系
)  ; --星图（显示星系）

DROP TABLE IF EXISTS map_system;
CREATE TABLE map_system(
    system_ID TEXT(32) NOT NULL  , --星系ID
    system_X REAL(24,6) NOT NULL  , --坐标x
    system_Y REAL(24,6) NOT NULL  , --坐标y
    system_Z REAL(24,6) NOT NULL  , --坐标z
    system_APPEARANCE TEXT(32) NOT NULL  , --外观
    system_NAME TEXT(90)   , --名称
    system_SIZE INTEGER NOT NULL  , --大小;指可容纳的星球数（1-9）
    PRIMARY KEY (system_ID)
)  ; --星系图（显示行星）

DROP TABLE IF EXISTS map_planet;
CREATE TABLE map_planet(
    planet_ID TEXT(32) NOT NULL  , --星球ID
    planet_NAME TEXT(255) NOT NULL  , --星球名称;根据星系名+序号自动填充
    planet_SIZE INTEGER NOT NULL  , --星球尺寸;5-16之间
    planet_RSS_M INTEGER NOT NULL  , --金属产量
    planet_RSS_G INTEGER NOT NULL  , --气体产量
    planet_RSS_C INTEGER NOT NULL  , --晶体产量
    planet_EFFICIENCY INTEGER NOT NULL  , --效率
    planet_TYPE TEXT(32) NOT NULL  DEFAULT 0, --种类
    planet_owner TEXT(32)   , --所有者
    planet_structure json(255)   , --建筑设施
    planet_storage json(255)   , --资源储量;资源、步兵、侦察机、舰载机
    planet_last_update NUMERIC   , --上次更新时间;资源放在全局里自增开销太大，只在需要时更新就够了
    planet_recent_attack INTEGER   , --近期被攻击次数;距离上次被攻击1周清零
    planet_last_attacked NUMERIC   , --上次被攻击时间
    planet_jumpgate_of TEXT(32)   , --属于谁的星门
    REVISION INTEGER   , --乐观锁
    PRIMARY KEY (planet_ID)
)  ; --星球表（星球属性、资源、建筑）

DROP TABLE IF EXISTS player_role_item;
CREATE TABLE player_role_item(
    role_ID TEXT(32) NOT NULL  , --角色ID
    item_code TEXT(32) NOT NULL  , --物品编号
    item_count INTEGER   , --物品数量
    PRIMARY KEY (role_ID)
)  ; --角色持有物品数量表

DROP TABLE IF EXISTS relation_planet-structure;
CREATE TABLE relation_planet-structure(
    planet_ID TEXT(32) NOT NULL  , --星球ID
    REVISION TEXT(32)   , --乐观锁
    UPDATED_TIME NUMERIC   , --更新时间
    structure_id TEXT(255)   , --建筑
    structure_lv TEXT(255)   , --建筑等级
    structure_queue    , --建筑队列
    structure_queue_ETA NUMERIC    --建筑队列预计完成时间
)  ; --建筑表;每种建筑的建造队列所能生产的物资都有所不同，例如兵营只有1种建造队列，即训练步兵，造船厂也是，即建造飞船和航母；但雷达站可能生产无人机，也可能执行扫描任务；实验室可能正在升级研究，也可能已经装备了未在升级的研究项。这些多种可能性的，都需要在json里注明

DROP TABLE IF EXISTS relation_player-roles;
CREATE TABLE relation_player-roles(
    player_ID TEXT(32) NOT NULL AUTOINCREMENT , --账户ID
    role_ID TEXT(32) NOT NULL  , --角色ID
    server_ID INTEGER NOT NULL  , --所在服务器
    PRIMARY KEY (player_ID)
)  ; --玩家可用角色表

DROP TABLE IF EXISTS fleet_carrier;
CREATE TABLE fleet_carrier(
    carrier_ID TEXT(32) NOT NULL  , --战舰ID
    carrier_OWNER TEXT(32) NOT NULL  , --战舰控制者
    carrier_TYPE TEXT(32) NOT NULL  , --战舰型号
    carrier_SQUADRON＿LIMIT INTEGER NOT NULL  , --舰载机上限
    carrier_name TEXT(90)   , --战舰舰名
    carrier_fleet TEXT(32)   , --战舰所属编制;玩家需要花cr购买的战区编制
    carrier_task_force TEXT(32)   , --战舰所属特混舰队;只在执行任务时编成，任务结束即解散，为空即表示战舰空闲
    carrier_squadron    , --舰载机
    carrier_upgrade_item    , --战舰升级项
    carrier_updated_time NUMERIC   , --更新时间
    PRIMARY KEY (carrier_ID)
)  ; --航母表

DROP TABLE IF EXISTS fleet_fleet;
CREATE TABLE fleet_fleet(
    fleet_ID TEXT(32) NOT NULL  , --舰队ID
    fleet_OWNER TEXT(32) NOT NULL  , --舰队所有者
    fleet_name TEXT(90) NOT NULL  DEFAULT fleet_$fleet_ID, --舰队自定义名称
    fleet_member TEXT(32)   , --舰队成员
    PRIMARY KEY (fleet_ID)
)  ; --舰队平时编制表

DROP TABLE IF EXISTS fleet_task_force;
CREATE TABLE fleet_task_force(
    taskforce_ID TEXT(32) NOT NULL  , --特混舰队ID
    taskforce_OWNER TEXT(32) NOT NULL  , --特混舰队所属人
    taskforce_CREATED_TIME NUMERIC NOT NULL  , --特混舰队创建时间
    taskforce_UPDATED_TIME NUMERIC NOT NULL  , --特混舰队更新时间
    taskforce_DEPART_PLACE TEXT(32) NOT NULL  , --特混舰队出发地;不存在显示为“多个”的情况，即一地一时只能发出一个特混舰队
    taskforce_DEPART_TIME NUMERIC NOT NULL  , --特混舰队出发时间
    taskforce_TASK TEXT(32) NOT NULL  , --特混舰队任务类型
    taskforce_ETA NUMERIC NOT NULL  , --特混舰队目的地
    taskforce_MEMBER TEXT(32) NOT NULL  , --特混舰队成员舰
    PRIMARY KEY (taskforce_ID)
)  ; --特混舰队表

DROP TABLE IF EXISTS ATTR_carrier;
CREATE TABLE ATTR_carrier(
    carrier_TYPE TEXT(32) NOT NULL  , --ID
    _atk REAL(24,6) NOT NULL  , --攻击力
    _def REAL(24,6) NOT NULL  , --防御力
    _hp REAL(24,6) NOT NULL  , --血量
    _spd REAL(24,6) NOT NULL  , --航速
    _lim INTEGER NOT NULL  , --载机量
    _range REAL(24,6) NOT NULL  , --超空间阻绝范围
    PRIMARY KEY (carrier_TYPE)
)  ; --航母属性;静态表，一般不增改删数据。建议只在服务器开机时读取一次配置（那我为什么不用json配置文件）

DROP TABLE IF EXISTS ATTR_ship;
CREATE TABLE ATTR_ship(
    ship_TYPE TEXT(255)   , --
    _atk REAL(24,6) NOT NULL  , --攻击力
    _shield REAL(24,6) NOT NULL  , --护盾
    _hp REAL(24,6) NOT NULL   --血量
)  ; --舰载机属性;战机先手一方（防御玩家）对后手方当前存活的偏好目标进攻，之后由后手方选择进攻偏好目标。进攻伤害计算：被击坠数量 = 被击方数量*(被击方单体护盾+被击方生命值) - 攻击方数量*攻击方攻击力

DROP TABLE IF EXISTS alliance_basic;
CREATE TABLE alliance_basic(
    alliance_ID TEXT(32) NOT NULL AUTOINCREMENT , --ID
    alliance_NAME TEXT(90) NOT NULL  , --联盟名
    alliance_ABBREVIATION TEXT(5) NOT NULL  , --联盟简称
    alliance_intro TEXT(900)   , --联盟简介
    alliance_leader TEXT(32) NOT NULL  , --联盟首领
    alliance_player_limit INTEGER   , --联盟玩家上限;由高级军官数量*6得到
    alliance_permission_lv TEXT(255)   , --联盟许可等级
    UPDATED_TIME NUMERIC   , --更新时间
    PRIMARY KEY (alliance_ID)
)  ; --联盟基本信息表

DROP TABLE IF EXISTS alliance_playerlist;
CREATE TABLE alliance_playerlist(
    alliance_ID TEXT(32) NOT NULL AUTOINCREMENT , --联盟ID
    alliance_PLAYER_ID TEXT(255) NOT NULL  , --玩家ID
    alliance_JOIN_TIME NUMERIC NOT NULL  , --加入时间
    alliance_player_rank TEXT(32) NOT NULL  , --玩家职阶
    PRIMARY KEY (alliance_ID)
)  ; --联盟玩家表

DROP TABLE IF EXISTS alliance_relation;
CREATE TABLE alliance_relation(
    alliance_ID TEXT(32) NOT NULL AUTOINCREMENT , --联盟ID
    alliance_relationship_TARGET TEXT(255) NOT NULL  , --对方联盟ID
    alliance_relationship_RELATION TEXT(32) NOT NULL  DEFAULT 0, --关系
    UPDATED_TIME NUMERIC NOT NULL  , --更新时间
    PRIMARY KEY (alliance_ID,alliance_relationship_RELATION)
)  ; --联盟间关系表

DROP TABLE IF EXISTS alliance_msgboards;
CREATE TABLE alliance_msgboards(
    alliance_msg_ID TEXT(32) NOT NULL  , --主题ID
    alliance_ID TEXT(32) NOT NULL  , --联盟ID
    alliance_msg_TOPIC TEXT(255)   , --对话主题
    CREATED_TIME NUMERIC NOT NULL  , --创建时间
    alliance_msg_isLocked TEXT(1)   , --对话锁定
    alliance_msg_isPinned TEXT(1)   , --对话置顶
    PRIMARY KEY (alliance_msg_ID)
)  ; --联盟聊天版表

DROP TABLE IF EXISTS alliance_msgReplies;
CREATE TABLE alliance_msgReplies(
    alliance_msg_ID TEXT(255) NOT NULL AUTOINCREMENT , --对话项ID
    alliance_msg_TOPICID TEXT(32) NOT NULL  , --主题ID
    alliance_msg_SENDER TEXT(32) NOT NULL  , --发送者
    alliance_msg_LINE INTEGER NOT NULL AUTOINCREMENT , --对话层数
    alliance_msg_CONTENTS TEXT(255)   , --对话正文
    alliance_msg_isPinned TEXT(1)   , --对话置顶
    CREATED_TIME NUMERIC NOT NULL  , --创建时间
    PRIMARY KEY (alliance_msg_ID)
)  ; --联盟对话楼层表

DROP TABLE IF EXISTS chat_mail;
CREATE TABLE chat_mail(
    mail_SENDER TEXT(32) NOT NULL  , --
    mail_RECEIVER TEXT(32) NOT NULL  , --
    mail_TITLE TEXT(900) NOT NULL  , --
    mail_CONTENT TEXT(900) NOT NULL  , --
    mail_SENDTIME NUMERIC NOT NULL  , --
    mail_STATUS TEXT(32) NOT NULL   --
)  ; --私信表

DROP TABLE IF EXISTS chat_online_chatroom;
CREATE TABLE chat_online_chatroom(
    chat_SENDER TEXT(32) NOT NULL  , --消息发送人
    chat_CONTENT TEXT(900) NOT NULL  , --消息内容
    chat_TIME NUMERIC NOT NULL  , --消息发送时间
    PRIMARY KEY (chat_TIME)
)  ; --聊天室表

DROP TABLE IF EXISTS chat_online_alliance;
CREATE TABLE chat_online_alliance(
    allieschat_TIME NUMERIC NOT NULL  , --消息发送时间
    allieschat_CONTENT TEXT(900) NOT NULL  , --消息内容
    allieschat_SENDER TEXT(32) NOT NULL  , --消息发送人
    allieschat_ALLIANCE TEXT(32) NOT NULL  , --消息关联联盟
    PRIMARY KEY (allieschat_TIME)
)  ; --联盟聊天室表

DROP TABLE IF EXISTS chat_online_workgroup;
CREATE TABLE chat_online_workgroup(
    groupchat_TIME NUMERIC NOT NULL  , --消息发送时间
    groupchat_CONTENT TEXT(900) NOT NULL  , --消息内容
    groupchat_SENDER TEXT(32) NOT NULL  , --消息发送人
    groupchat_GROUP_CREATOR TEXT(32) NOT NULL  , --消息组创建人
    PRIMARY KEY (groupchat_TIME)
)  ; --工作组聊天

DROP TABLE IF EXISTS chatgroup_online_member;
CREATE TABLE chatgroup_online_member(
    groupchat_GROUP_CREATOR TEXT(32) NOT NULL  , --消息组创建人
    groupchat_member TEXT(32) NOT NULL   --消息组成员
)  ; --小组聊天成员表

CREATE VIEW view_system-planet AS
SELECT 
    map_system.system_ID AS system_ID,
    map_planet.planet_ID AS planet_ID
FROM map_system,map_planet;

