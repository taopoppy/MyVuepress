# node生态实战微博

## 项目概述

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

## 技术选型概述
<font color=#1E90FF>**① 框架选型**</font>

+ <font color=#DD1144>koa</font>：原生支持`async await`,对于异步编程提供了非常好的技术方法和良好的异步代码的写法风格
+ <font color=#3eaf7c>express</font>：这个框架非常有名，但是是基于JS回调的，回调对于异步来说是非常繁琐的
+ <font color=#3eaf7c>egg</font>：企业级的开发框架，在`Koa2`的基础上封装了很多业务上的东西

比较上述三种框架，其实我们会发现，<font color=#CC99CD>koa是一个比较先进且干净，我们可以在这种以http为内核的简易框架上更多发挥出我们自己想法和实现的框架</font>。我们可以根据我们自己的想法和逻辑在此之上拼接模块。而`egg`当然比`Koa2`更强大，但是如果使用`egg`其实大部分你学习的是它的套路，或者开发规范，对于学习不是一个很好的选择。

<font color=#1E90FF>**② 数据库**</font>

+ <font color=#DD1144>mysql</font>:基本上`Mysql`是现有企业开发最基本或者最广泛，成本最低的一个数据库系统了
+ <font color=#3eaf7c>mongodb</font>：它当然是`Nosql`的典范了，不过这种比较适合中小型企业，因为大型企业有专门的数据库运维人员，对于数据库的管理和技术更高

<font color=#1E90FF>**③ 登录技术**</font>

+ <font color=#DD1144>session</font>：最广泛的登陆技术，<font color=#CC99CD>最适合的就是这种集中式的，或者单体式的WebServer开发</font>
+ <font color=#3eaf7c>jwt</font>：<font color=#CC99CD>基本上jwt最适合的场景是前后端分离和以RESTful风格的接口开发</font>

<font color=#1E90FF>**④ 前端页面**</font>

+ <font color=#DD1144>ejs后端模板引擎</font>：单体式的开发，服务端渲染技术的最佳选择，且是服务端开发的必学知识点。
+ <font color=#3eaf7c>前端框架react/vue</font>:本身就很复杂，而且最适合在前后端分离，且前端业务和需求较多且复杂的项目中

<font color=#1E90FF>**⑤ 缓存数据库和单元测试**</font>

+ <font color=#3eaf7c>redis</font>：缓存数据库的最佳选择，没有别的
+ <font color=#3eaf7c>jest</font>：单元测试最广泛和最佳的选择

## 提交规范
+ 重构提交标识：
  ```javascript
  git commit -m 'refactor: 调整目录结构'
  ```
+ 新功能增加：
  ```javascript
  git commit -m 'feat: 路由的演示'
  ```
  