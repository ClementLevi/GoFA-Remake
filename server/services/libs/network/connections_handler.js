var ws = require("nodejs-websocket");
var server = ws.createServer(function(connect) //创建连接
        {
            connect.on("text", function(data) { //收到消息
                console.log('收到消息=', data);
                jx(data); //解析数据
                if (a == '0001') { //连接请求
                    let data = {};
                    data.a = '1001';
                    data.b = coni + 1;
                    let jsonStr = JSON.stringify(data); //转换为文本
                    connect.sendText(jsonStr); //发送给来源，不推荐使用                       
                } else if (a == '0002') { //注册逻辑
                    if (c != '' && d != '') {
                        db.serialize(function() { //序列化执行
                            db.all("select id from UserTable where Uid = '" + c + "'", function(err, rows) { //查询
                                if (err) {
                                    console.log("select from node error,", err.message);
                                } else {
                                    if (rows == '') {
                                        db.run("INSERT INTO UserTable(Uid,Pwd) VALUES (?,?);", [c, d], err => {});
                                        let data = {};
                                        data.a = '1002';
                                        data.b = b;
                                        data.c = 'y';
                                        data.d = '注册成功，您的帐号[' + c + ']请妥善保管'
                                        asend(data);
                                    } else {
                                        console.log('已存在')
                                        let data = {};
                                        data.a = '1002';
                                        data.b = b;
                                        data.c = 'n';
                                        data.d = '注册失败，该账号已存在'
                                        asend(data);
                                    }
                                }
                            });
                        });
                    } else {
                        console.log('注入')
                    }
                } else if (a == '0003') { //登录逻辑
                    if (c != '' && d != '') {
                        db.serialize(function() { //序列化执行
                            db.all("select id from UserTable where Uid = '" + c + "' and Pwd = '" + d + "'", function(err, rows) { //查询
                                if (err) {
                                    console.log("select from node error,", err.message);
                                } else {
                                    if (rows != '') {
                                        let ii = String((new Date()).valueOf());
                                        db.run("UPDATE UserTable SET UUid = '" + ii + "' WHERE id = '" + rows[0].id + "' ", err => {}); //更新
                                        let data = {};
                                        data.a = '1003';
                                        data.b = b;
                                        data.c = 'y';
                                        data.d = '登陆成功'
                                        data.e = ii;
                                        asend(data);
                                    } else {
                                        let data = {};
                                        data.a = '1003';
                                        data.b = b;
                                        data.c = 'n';
                                        data.d = '帐号或密码错误'
                                        asend(data);
                                    }
                                }
                            });
                        });
                    }
                } else if (a == '0004') {


                } else if (a == '0009') { //心跳检测返回
                    if (c == 'pong') {
                        for (var aa = 0; aa < uuid.length; aa++) { //遍历寻找来源定位
                            if (uuid[aa] == b) {
                                pingpong[aa] = true; //标记非尸体
                            };
                        };
                    }
                } else if (a == '0010') { //确认连接
                    coni++ //生成唯一ID
                    client[client.length] = connect //加入连接池
                    uuid[uuid.length] = coni //记录唯一ID
                } else if (a == '9999') { //备用




                }

            })
            connect.on("close", function(code, reason) {}); //连接关闭回调
            connect.on("error", function(code, reason) {}); //连接错误回调
        }).listen(3000) //监听端口
console.log('websocket服务端启动')