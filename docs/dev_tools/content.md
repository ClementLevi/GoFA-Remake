# 1. 开发工具

## 1.1 数据结构设计

### 1.1.1 CHINER元数建模（PDManer、PDMan）

version: 3.5.7+

用于设计数据库结构、数据表间关系，并且还能兼顾制图。
这软件老是改名字，不好找.

[【gitee代码仓库】](https://gitee.com/robergroup/chiner)

### 1.1.2 SQLite Studio

轻量级数据库管理软件（指针对sqlite格式的数据库），开源不要钱

[【官网】](https://sqlitestudio.pl/)

## 1.2 文档编写

### 1.2.1 ApiFox

Apifox = Postman + Swagger + Mock + JMeter，他们说的。

目前可以公开的API在[此页面](https://www.apifox.cn/apidoc/shared-15f62724-a6dc-453d-9ae6-55019382ff63)查看

[【首页】](https://www.apifox.cn/)

### 1.2.2 PlantUML

使用纯文本代码生成用例图、时序图、流程图、组织结构图等图片，想看图请自行编译。

[【官网】](https://plantuml.com/zh/)
[【使用例】](https://gitee.com/lastinglate007/PlantUML-Samples)

### 1.2.3 Microsoft Visio 2021

画结构图流程图UML用例图各种矢量图的还是用PlantUML好一些，别的倒是可以用这货补充。淘宝买个激活码50元，比乱七八糟的在线编辑器省心一些，除了云协作不方便都还好。

该软件作为PlantUML的补充使用，**不建议直接向本仓库提交Visio的二进制文件**！

[【淘宝搜索】](https://s.taobao.com/search?q=Visio+2021)

### 1.2.4 ~~快乐摸鱼（moyu）~~（已弃用）

version: 0.8.0

用于搭建前后端交互API，较为廉价地产生文档。感觉不如ApiFox，因此废弃。

[【GitHub代码仓库】](https://github.com/trueleaf/moyu)

## 1.3 数值模型

### 1.3.1 洋葱引擎

version: 3.7.3+

还在开发中的一款工具，貌似没开源。感觉不如excel好用。

[【Bilibili宣传片】](https://www.bilibili.com/video/BV14v411G7ai)

纠正一下：所有UI的设计都反直觉反人类，可以说是一款由完全没学过人机交互，也不会凭生活经验为他人着想的人设计出来的工具。

## 1.4 前端

### 1.4.1 音频资源

### 1.4.2 静态画面资源

### 1.4.3 3D模型资源

#### 1.4.3.1 Blender

version: -

建模软件，也是一个便宜二字

[【steam商店页面】](https://store.steampowered.com/app/365670)

## 1.5 测试工具集

### 1.5.1 单元测试

测试用例使用MockJS库；
单元测试框架使用Mocha库。

### 1.5.2 基准测试

不会

### 1.5.3 压力测试

不会

# 2. 生产技术栈

## 2.1 后端

### 2.1.1 开发语言

JavaScript和TypeScript。使用C/C++编写链接库以供高性能需求的计算任务。

### 2.1.2 服务器框架

框架自研，争取能够在其他项目中复用。

采用Express框架，按照MVC模式进行开发。一般业务逻辑使用Js或者Typescript编写，而计算密集的类（如战斗计算）采用C++编写，预编译以后供Js调用。

### 2.1.3 数据库选型

游戏业务数据库使用MySQL+Redis缓存，大厅认证和玩家角色绑定信息的数据库使用MongoDB。

## 2.2 客户端

### 2.2.1 Unity还是Unreal还是Cocos呢

我反正都不会

// TODO: 谁负责客户端来着？
