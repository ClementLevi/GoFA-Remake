var ws = require("nodejs-websocket");//引入模块
//var sqlite3 = require('sqlite3').verbose(); //引入模块
var db//数据库对象
var client = [];//客户端连接数组
var pingpong = [];//心跳状态数组
var uuid = [];//唯一ID数组
var csid = [];//部分ID数组
var coni = 0;//连接数
var a;//拆json
var b;
var c;
var d;
var e;
var server = ws.createServer(function (connect)//创建连接
{
    connect.on("text", function (data) {//收到消息
        console.log('收到消息=',data);
        jx(data);//解析数据
        if(a == '0001') {//连接请求
            let data = {};
            data.a = '1001';
            data.b = coni+1; 
            let jsonStr=JSON.stringify(data);//转换为文本
            connect.sendText(jsonStr);//发送给来源，不推荐使用                       
        }else if(a == '0002') {//注册逻辑
            if(c != '' && d!= '') {
                db.serialize(function() {//序列化执行
                    db.all("select id from UserTable where Uid = '"+c+"'", function(err, rows) { //查询
                        if(err){
                        console.log("select from node error,",err.message);
                        }else{
                            if(rows == ''){
                                db.run("INSERT INTO UserTable(Uid,Pwd) VALUES (?,?);", [c, d], err => {});
                                let data = {};
                                data.a = '1002';
                                data.b = b;
                                data.c = 'y';
                                data.d = '注册成功，您的帐号['+c+']请妥善保管'
                                asend(data);
                            }else{
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
            }else{
                console.log('注入')          
            }
        }else if(a == '0003') {//登录逻辑
            if(c != '' && d!= '') {
                db.serialize(function() {//序列化执行
                    db.all("select id from UserTable where Uid = '"+c+"' and Pwd = '"+d+"'", function(err, rows) { //查询
                        if(err){
                        console.log("select from node error,",err.message);
                        }else{
                            if(rows != ''){
                                let ii = String((new Date()).valueOf());
                                db.run("UPDATE UserTable SET UUid = '"+ii+"' WHERE id = '"+rows[0].id+"' ", err => {});//更新
                                let data = {};
                                data.a = '1003';
                                data.b = b;
                                data.c = 'y';
                                data.d = '登陆成功'
                                data.e = ii;
                                asend(data);
                            }else{
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
        }else if(a == '0004') {


        }else if(a == '0009') {//心跳检测返回
            if(c == 'pong') {
                for (var aa = 0; aa<uuid.length; aa++) {//遍历寻找来源定位
                    if (uuid[aa] == b){
                        pingpong[aa] = true;//标记非尸体
                    };
                };
            }
        }else if(a == '0010') {//确认连接
            coni++//生成唯一ID
            client[client.length] = connect//加入连接池
            uuid[uuid.length] = coni//记录唯一ID
        }else if(a == '9999') {//备用
            



        }

    })
    connect.on("close", function (code, reason) {});//连接关闭回调
    connect.on("error", function (code, reason) {});//连接错误回调
}).listen(3000)//监听端口
console.log('websocket服务端启动')

setInterval(function() {//心跳检测发出
    if (client.length != 0){
        let data = {};
        data.a = '1009';
        data.b = 'ping';
        let jsonStr=JSON.stringify(data);
        for (var aa = 0; aa<client.length; aa++) {//遍历发送心跳检测
            client[aa].sendText(jsonStr);
            pingpong[aa] = false;
        };
        setTimeout(function() {//剔除尸体
            for (var aa = 0; aa<client.length; aa++) {//遍历
                if(pingpong[aa] == false){//对比尸体标记
                    console.log("剔除"+uuid[aa]+"出连接池")
                    pingpong.splice(aa,1);//从数组中移除当前
                    client.splice(aa,1);//从数组中移除当前
                    uuid.splice(aa,1);//从数组中移除当前
                }
            }
        },"2000")//心跳检测剔除尸体延迟时间

    } 
},5000)//心跳检测发出循环时间


dbcon();





function jx(data) {//解析数据
    let json=JSON.parse(data);//转换为json
        a = json.a;
        b = json.b;
        c = json.c;
        d = json.d;
        e = json.e;
}

function asend(data) {//发送给来源
    for (var aa = 0; aa<uuid.length; aa++) {//遍历
        if (uuid[aa] == b){//对比唯一ID
            let jsonStr=JSON.stringify(data);//转换为文本
            client[aa].sendText(jsonStr);//连接池取出当前连接发送
        };
    };
}

function bsend(data) {//发送给全体
    for (var aa = 0; aa<uuid.length; aa++) {//遍历
        let jsonStr=JSON.stringify(data);//转换为文本
        client[aa].sendText(jsonStr);//连接池取出当前连接发送
    };
}

function csend(data,aaa) {//发送给部分
    for (var aa = 0; aa<aaa.length; aa++) {//遍历
        let jsonStr=JSON.stringify(data);//转换为文本
        client[aaa[aa]].sendText(jsonStr);//连接池取出指定连接发送
    };
}


function dbcon() {//连接数据库
    db = new sqlite3.cached.Database('test.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function(err) { //连接数据库，第二个参数用途未知，删无影响
        if (err) {
            console.log('err:' + err);
        } else {
            console.log('数据库连接完毕');
            db.run("UPDATE UserTable SET UUid = ''", err => {});
            console.log('数据初始化完毕')
        }
    });
}

//==========================数据库操作示例==========================//
//db.serialize(function() {//序列化执行
    //db.run("INSERT INTO node(node_id,title) VALUES (?,?);", ['123', '欲插入数据'], err => {});       //插入
    
    //db.run("UPDATE node SET node_id = '123' WHERE _id = '107' ", err => {});                        //更新

    //db.all("select content from node where node_id = '123' and _id = '107' ", function(err, rows) { //查询
        //if(err){
        //console.log("select from node error,",err.message);
        //}else{
        //data = rows;
        //console.log(rows);
        //}
    //});
//});
//==========================数据库操作示例==========================//

//db.close();

//=============================发送示例=============================//
//let data = {}; //组装消息
//data.a = '*';//欲发送数据
//data.b = '*';
//asend(data);//发送给来源
//bsend(data);//发送给全体
//csid[0] = 1;
//csend(data,csid)//发送给指定
//=============================发送示例=============================//