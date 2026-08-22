# 舰队与机群战斗 资源域 REST API 占位清单

领域范围：机群/航母（查询编队、建造/拆除/重组/升级/重命名航母）、特混舰队（查询/组建/解散/移动/运输/抛锚/远征）、战斗轮询（战报 15 分钟、来敌预警 30 秒）。

| 方法 | 路径 | 名称 | 鉴权 | 用途 | 对应事件/表 |
|------|------|------|------|------|-------------|
| GET | /api/v1/fleets | 我的机群列表 | bearer | 查询当前玩家的全部机群/航母编队 | fleet_carrier / fleet_fleet |
| GET | /api/v1/fleets/{fleetId}/carriers | 查询编队航母成员 | bearer | 查询指定编队下的航母成员列表 | fleet_fleet.member / fleet_carrier |
| POST | /api/v1/fleets/{fleetId}/carriers | 建造航母 | bearer | 在指定编队建造航母 | FLEET_CREATE / fleet_carrier |
| DELETE | /api/v1/carriers/{carrierId} | 拆除航母 | bearer | 拆除指定航母 | FLEET_DESTROY / fleet_carrier |
| POST | /api/v1/carriers/{carrierId}/recompose | 重组机群 | bearer | 重组指定航母的机群与载荷 | FLEET_RECOMPOSE / fleet_carrier(squadron)，S2C _RECOMPOSED/_FAILED |
| POST | /api/v1/carriers/{carrierId}/upgrade | 升级航母 | bearer | 用增幅器道具升级指定航母 | FLEET_UPGRADE / fleet_carrier(upgrade_item) / ATTR_carrier |
| PATCH | /api/v1/carriers/{carrierId}/name | 航母重命名 | bearer | 重命名指定航母 | FLEET_RENAME / fleet_carrier(name)，S2C _RENAMED/_FAILED |
| GET | /api/v1/taskforces | 我的特混舰队列表 | bearer | 查询当前玩家的全部特混舰队 | fleet_task_force |
| GET | /api/v1/taskforces/{taskforceId} | 特混舰队详情 | bearer | 查询指定特混舰队详情 | fleet_task_force / fleet_fleet(member) |
| POST | /api/v1/taskforces | 组建特混舰队 | bearer | 组建固定编队 | TASKFORCE_ENTITLE / fleet_task_force |
| POST | /api/v1/taskforces/{taskforceId}/disband | 解散特混舰队 | bearer | 解散指定特混舰队 | TASKFORCE_DISBAND / fleet_task_force |
| POST | /api/v1/taskforces/{taskforceId}/move | 舰队移动 | bearer | 特混舰队移动 | TASKFORCE_MOVE / fleet_task_force |
| POST | /api/v1/taskforces/{taskforceId}/transport | 舰队运输 | bearer | 运输载荷至目的地并返回 | TASKFORCE_TRANSPORT / fleet_task_force |
| POST | /api/v1/taskforces/{taskforceId}/dock | 深空抛锚 | bearer | 在太空中抛锚拦截（重力井） | TASKFORCE_DOCK_IN_VOID / fleet_task_force |
| POST | /api/v1/taskforces/{taskforceId}/expedition | 舰队远征 | bearer | 特混舰队远征 | TASKFORCE_EXPEDITION / fleet_task_force |
| GET | /api/v1/combat/report/{taskId} | 战报轮询 | bearer | 轮询战斗战报（15 分钟对齐结算周期） | MAIL_BATTLE_REPORT / events_combat |
| GET | /api/v1/radar/alerts | 来敌预警轮询 | bearer | 轮询雷达来敌预警（30 秒） | SPY_INCOMING_COUNTER / PLANET_INCOMING_DETECTED / events_combat |

已写入 Apifox AI 分支（ai/20260822-from-main-api-skeleton），共 17 个占位接口。
