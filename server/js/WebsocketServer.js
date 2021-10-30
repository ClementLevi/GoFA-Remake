let ws = require("nodejs-websocket");
 
let server = ws.createServer((connection)=>{
    connection.on("text", (data)=>{
        console.log('收到客户端消息：', data);
        //遍历所有连接的客户端，发送消息
        server.connections.forEach((conn)=>{
            conn.send(data);
        });
    });
 
    connection.on("close", (code)=>{
        console.log('关闭连接：' + code);
    });
 
    connection.on("error", (code, reason)=>{
        console.log("异常关闭")
    });
});
 
server.listen(3000);
 
console.log("服务器启动成功！");
 
server.on("connection", (connection)=>{
    console.log("有客户端连接");
