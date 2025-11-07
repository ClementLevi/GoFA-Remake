CREATE TABLE player_account (
    player_ID TEXT(32) NOT NULL, --账户ID
    player_LoginMethod TEXT(32) NOT NULL, --登陆方式
    player_LoginAcct TEXT(90) NOT NULL, --登陆账号
    player_PwMD5 TEXT(32) NOT NULL, --登陆密码MD5
    player_RegisterTime NUMERIC NOT NULL, --注册时间
    player_LastLogin NUMERIC NOT NULL, --上次登录事件记录
    PRIMARY KEY (player_ID)
);