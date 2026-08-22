# GoFA 游戏服务器镜像（配合挂载 server/ 目录到 /server 使用）
# 用法示例: docker run -v "$PWD/server:/server" <image>
FROM node:22
WORKDIR /server
CMD ["npm", "install"]
ENTRYPOINT ["node", "main.js"]
