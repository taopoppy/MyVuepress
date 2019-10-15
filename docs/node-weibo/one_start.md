# 开始项目

我们在这个项目中要做什么？ - <font color=#CC99CD>koa2从零模仿新浪微博</font>

哪些部分？ - <font color=#CC99CD>技术选型，知识点串讲，开发微博，总结最佳实践</font>

技术？ - <font color=#1E90FF>koa2</font>、<font color=#1E90FF>ejs</font>、<font color=#1E90FF>mysql</font>、<font color=#1E90FF>sequelize</font>、<font color=#1E90FF>redis</font>、<font color=#1E90FF>session</font>、<font color=#1E90FF>jest</font>、<font color=#1E90FF>jwt</font>

这样的实战有什么意义，对于初级工程师，其实最缺乏的就是架构上的东西，而架构上的东西并没有办法通过文章或者教科书来系统的学习，只有在复杂的项目当中演练和学习，学习<font color=#DD1144>怎么给系统做设计，分层，抽离等等</font>

下面这个是我们项目的架构，希望你在整个项目完成之后返回来看看这个图，看看从中学到了什么：

<img :src="$withBase('/node_weibo_jiagou.png')" alt="微博的架构">

项目开发安排：  
<font color=#1E90FF>**① 技术选型**</font>  

+ 框架
+ 存储和缓存
+ 用户认证

<font color=#1E90FF>**② 知识点串讲**</font>

+ koa2和ejs
+ mysql和sequelize
+ redis
+ session和jwt
+ jwt单元测试
+ eslint和inspect debug

<font color=#1E90FF>**③ 技术方案设计**</font>

+ 架构设计
+ 接口和路由
+ 数据表和存储模型

<font color=#1E90FF>**④ 功能开发**</font>

+ 用户： 登录，注册，用户设置，粉丝和关注
+ 微博： 发布。列表（首页，个人主页，广场页）
+ @功能： @某人，回复，接收 @到我的消息

<font color=#1E90FF>**⑤ 线上环境**</font>

+ pm2和多进程
+ nginx和反向代理
+ 日志

<font color=#1E90FF>**⑥ 总结最佳实践**</font>

+ 项目结构
+ 错误处理
+ 代码风格
+ 质量保证
+ 安全
+ 线上环境

你的收获：
+ node.js真正的实战项目，koa2和周边工具的使用
+ 系统设计，分层思路，接口设计思路，数据建模思路
+ node最佳实践，对标实际开发工作