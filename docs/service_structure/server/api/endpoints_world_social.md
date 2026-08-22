# 星球/建筑 + 联盟/邮件/聊天 资源域 REST API 端点清单

> 范围：星球、建筑、星图、联盟、邮件、聊天、侦察 七类资源域的 REST API 占位设计，均遵循 `/api/v1/...`、camelCase、REST 语义，JWT Bearer 鉴权，统一响应壳（本阶段不填请求/响应体）。

| 方法 | 路径 | 名称 | 鉴权 | 用途 | 对应事件/表 |
|------|------|------|------|------|-------------|
| GET | `/api/v1/map/chunk/{chunkId}` | 星图地块检视 | JWT | 返回地块及其所属星系索引 | CLIENT_LOAD_MAP / map_chunk |
| GET | `/api/v1/map/system/{systemId}` | 星系检视 | JWT | 返回星系坐标与内部星球索引 | CLIENT_LOAD_MAP / map_system |
| GET | `/api/v1/map/chunk/{chunkId}/systems` | 地块星系列表 | JWT | 返回地块内全部星系 | map_chunk / map_system |
| GET | `/api/v1/map/system/{systemId}/planets` | 星系星球列表 | JWT | 返回星系内全部星球 | map_system / map_planet |
| GET | `/api/v1/planets/{planetId}` | 星球检视 | JWT | 惰性更新产出并返回星球详情 | PLANET_INSPECT / map_planet |
| POST | `/api/v1/planets/{planetId}/abandon` | 放弃星球 | JWT | 清除 owner，可能触发星球易主 | PLANET_ABANDON / map_planet |
| POST | `/api/v1/planets/{planetId}/spy` | 星球间谍侦察 | JWT | 对指定星球发起间谍侦察 | PLANET_SPY / map_planet |
| POST | `/api/v1/planets/{planetId}/pin` | 置顶星球 | JWT | 置顶关注星球 | PLANET_PIN_SET / map_planet |
| DELETE | `/api/v1/planets/{planetId}/pin` | 取消置顶星球 | JWT | 取消星球置顶 | PLANET_PIN_OFF / map_planet |
| POST | `/api/v1/planets/{planetId}/reward` | 设置星球奖励 | JWT | 设置星球悬赏/资源奖励 | PLANET_REWARD_SET / map_planet |
| GET | `/api/v1/planets/{planetId}/buildings` | 星球建筑列表 | JWT | 返回星球上全部建筑及等级 | BUILT / relation_planet_structure |
| POST | `/api/v1/planets/{planetId}/buildings` | 建造建筑 | JWT | 在星球上建造建筑并进入队列 | BUILDING_BUILD / relation_planet_structure |
| DELETE | `/api/v1/buildings/{structureId}` | 拆除建筑 | JWT | 拆除指定建筑 | BUILDING_DESTROY / relation_planet_structure |
| POST | `/api/v1/buildings/{structureId}/upgrade` | 升级建筑 | JWT | 升级指定建筑 | BUILDING_UPGRADE / relation_planet_structure |
| POST | `/api/v1/buildings/{structureId}/production` | 生产入队 | JWT | 向建筑生产队列追加任务 | BUILDING_PRODUCTION_ENQUEUE / relation_planet_structure |
| POST | `/api/v1/buildings/{structureId}/equip` | 建筑装备 | JWT | 为建筑装备道具/组件 | BUILDING_EQUIP / relation_planet_structure |
| POST | `/api/v1/buildings/{structureId}/speedup` | 加速生产 | JWT | 加速建筑生产/建造队列 | BUILDING_SPEED_UP_PRODUCTION / relation_planet_structure |
| POST | `/api/v1/buildings/{structureId}/cancel` | 取消队列 | JWT | 取消建筑队列中的任务 | BUILDING_CANCEL / relation_planet_structure |
| POST | `/api/v1/alliances` | 创建联盟 | JWT | 创建联盟 | ALLIANCE_CREATE / alliance_basic |
| GET | `/api/v1/alliances/{allianceId}` | 联盟详情 | JWT | 返回简介/头像/成员数等 | alliance_basic |
| POST | `/api/v1/alliances/{allianceId}/disband` | 解散联盟 | JWT | 解散联盟 | ALLIANCE_DISBAND / alliance_basic |
| GET | `/api/v1/alliances/{allianceId}/members` | 联盟成员列表 | JWT | 返回联盟成员列表 | alliance_playerlist |
| PATCH | `/api/v1/alliances/{allianceId}/intro` | 修改联盟简介 | JWT | 修改联盟简介 | ALLIANCE_CHANGE_INTRO / alliance_basic |
| PATCH | `/api/v1/alliances/{allianceId}/avatar` | 修改联盟头像 | JWT | 修改联盟头像 | ALLIANCE_CHANGE_AVATAR / alliance_basic |
| POST | `/api/v1/alliances/{allianceId}/relations` | 联盟关系变更 | JWT | NAP/宣战/中立请求与接受归并 | alliance_relation / ALLIANCE_RELATION_CHANGED |
| POST | `/api/v1/alliances/{allianceId}/invite` | 邀请加入联盟 | JWT | 邀请玩家加入联盟 | ALLIANCE_INVITE / alliance_playerlist |
| POST | `/api/v1/alliances/{allianceId}/invitations/{invitationId}/accept` | 接受联盟邀请 | JWT | 接受联盟邀请 | ALLIANCE_ACCEPT_INVITE / alliance_playerlist |
| POST | `/api/v1/alliances/{allianceId}/invitations/{invitationId}/reject` | 拒绝联盟邀请 | JWT | 拒绝联盟邀请 | ALLIANCE_REJECT_INVITE / alliance_playerlist |
| POST | `/api/v1/alliances/{allianceId}/join` | 申请加入联盟 | JWT | 申请加入联盟 | ALLIANCE_APPLY / alliance_playerlist |
| POST | `/api/v1/alliances/{allianceId}/leave` | 退出联盟 | JWT | 退出联盟 | ALLIANCE_LEAVE / alliance_playerlist |
| POST | `/api/v1/alliances/{allianceId}/appoint` | 任命联盟职位 | JWT | 任命/调整联盟职位 | ALLIANCE_APPOINTMENT / alliance_playerlist |
| POST | `/api/v1/alliances/{allianceId}/kick` | 踢出联盟成员 | JWT | 踢出联盟成员 | ALLIANCE_KICK / alliance_playerlist |
| POST | `/api/v1/alliances/{allianceId}/exile-leader` | 弹劾盟主 | JWT | 发起弹劾盟主 | ALLIANCE_EXILE_LEADER / alliance_basic |
| POST | `/api/v1/alliances/{allianceId}/leader-vote` | 盟主投票 | JWT | 盟主选举投票 | ALLIANCE_LEADER_VOTE / alliance_basic |
| POST | `/api/v1/alliances/{allianceId}/exile-pacify` | 安抚弹劾 | JWT | 撤销/平息弹劾 | ALLIANCE_EXILE_PACIFY / alliance_basic |
| POST | `/api/v1/alliances/{allianceId}/posts` | 联盟发帖 | JWT | 联盟留言板发帖 | ALLIANCE_POST_INITIATE / alliance_msgboards |
| DELETE | `/api/v1/alliances/{allianceId}/posts/{postId}` | 删除联盟帖子 | JWT | 删除联盟留言板帖子 | ALLIANCE_POST_DELETE / alliance_msgboards |
| POST | `/api/v1/alliances/{allianceId}/posts/{postId}/pin` | 置顶联盟帖子 | JWT | 置顶联盟留言板帖子 | ALLIANCE_POST_PIN / alliance_msgboards |
| DELETE | `/api/v1/alliances/{allianceId}/posts/{postId}/pin` | 取消置顶联盟帖子 | JWT | 取消置顶联盟留言板帖子 | ALLIANCE_POST_UNPIN / alliance_msgboards |
| POST | `/api/v1/alliances/{allianceId}/teams` | 创建联盟小组 | JWT | 创建联盟内小组 | ALLIANCE_CREATE_TEAM / alliance_basic |
| POST | `/api/v1/alliances/{allianceId}/teams/{teamId}/join` | 加入联盟小组 | JWT | 加入联盟内小组 | ALLIANCE_JOIN_TEAM / alliance_playerlist |
| POST | `/api/v1/alliances/{allianceId}/teams/{teamId}/leave` | 退出联盟小组 | JWT | 退出联盟内小组 | ALLIANCE_LEAVE_TEAM / alliance_playerlist |
| GET | `/api/v1/alliances/events` | 联盟事件轮询 | JWT | 轮询(60s)返回联盟日志/关系变更/解散事件流 | ALLIANCE_LOG / ALLIANCE_RELATION_CHANGED / ALLIANCE_DISBANDED |
| GET | `/api/v1/mail` | 邮件列表 | JWT | 邮件列表，分页用 cursor 游标 | chat_mail |
| GET | `/api/v1/mail/unread` | 未读邮件轮询 | JWT | 轮询(60s)返回未读数与未读摘要 | chat_mail |
| POST | `/api/v1/mail` | 发送邮件 | JWT | 发送邮件给玩家/联盟 | MAIL_TO / chat_mail |
| POST | `/api/v1/mail/{mailId}/read` | 标记邮件已读 | JWT | 标记邮件已读 | MAIL_READ / MAIL_ALREADY_READ / chat_mail |
| POST | `/api/v1/mail/{mailId}/reply` | 回复邮件 | JWT | 回复邮件 | MAIL_REPLY / chat_mail |
| POST | `/api/v1/mail/{mailId}/claim` | 领取邮件附件 | JWT | 领取邮件附件/奖励 | MAIL_CLAIM / chat_mail |
| DELETE | `/api/v1/mail/{mailId}` | 删除邮件 | JWT | 删除邮件 | MAIL_DELETE / chat_mail |
| POST | `/api/v1/chat` | 发送聊天消息 | JWT | 发送聊天消息到指定频道 | CHAT_MSG / chat_online_chatroom |
| GET | `/api/v1/chat/{channelId}/recent` | 最近聊天消息轮询 | JWT | 轮询(2~5s)返回最近消息，分页用 cursor 游标 | chat_online_chatroom / chat_online_alliance / chat_online_workgroup / chatgroup_online_member |
| POST | `/api/v1/spy/planet` | 星球间谍侦察 | JWT | 对星球发起间谍侦察 | SPY_PLANET_ESPIONAGE / MAIL_SPY_REPORT |
| GET | `/api/v1/spy/incoming` | 来袭侦察计数 | JWT | 返回针对己方的来袭舰队/侦察统计 | SPY_INCOMING_COUNTER / PLANET_INCOMING_DETECTED |
| POST | `/api/v1/spy/bounty` | 悬赏侦察 | JWT | 发布/发现悬赏目标 | SPY_BOUNTY_DISCOVER / MAIL_ESPIONAGE_ALERT |

> 已写入 Apifox AI 分支（`ai/20260822-from-main-api-skeleton`），共 55 个。
