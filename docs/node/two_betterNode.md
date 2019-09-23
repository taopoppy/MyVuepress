# node了不起
`Node`最开始是为了解决后端高并发而设计的，不想却成为了大前端领域的基石，而`Node`当下有了更多的应用场景，它的意义已经远远大于设计时候的初衷了，下面我们就来了解一下`Node`

## 架构升级
### 1. 从LAMP到MEAN

Web开发技术经过了两次比较大的架构演变，即从`LAMP`到`MEAN`
+ <font color=#CC99CD>LAMP</font>: `Linux`、`Apache`、`mysql`、`PHP`
+ <font color=#CC99CD>MEAN</font>: `Mongodb`、`Express`、`Angular`、`Node`

在微服务架构盛行的今天，`MEAN`已经因为技术栈过于复杂而被大家慢慢淡忘，更多的采用阿里巴巴开源的`Egg.js`,因为<font color=#3eaf7c>服务化才是流行的解决方案</font>，比如说`RPC`服务，服务组装还有页面即服务。

### 2. 前后端分离

绝大多数开发都是从<font color=#CC99CD>单体式架构</font>开始的，简单集成度高，上手十分容易，但是在团队协作重度化的今天，多人协作势必会导致专业化分工，<font color=#CC99CD>前后端分离也伴随而来</font>，典型的企业应用会采用三层架构模式：
+ <font color=#CC99CD>表现层</font>：处理`HTTP`请求，直接返回`HTML`渲染，或者返回`API`结果，对于复杂的应用系统，表面层通常是代码中比较重要的部分
+ <font color=#CC99CD>业务逻辑层</font>：完成具体的业务逻辑，是应用的核心组成部分
+ <font color=#CC99CD>数据访问层</font>：访问基础数据，例如数据库，缓存和消息队列

按照传统的分类方式，表现层就是前端，业务逻辑层和数据访问层都属于后端，而且现在重度API化的今天，后端业务逻辑被削弱了，更多业务逻辑可以被移到前端，比如说：<font color=#CC99CD>组装API</font>、<font color=#CC99CD>RPC服务</font>、<font color=#CC99CD>提供配置</font>、<font color=#CC99CD>静态API接口等等</font>，除了不直接操作数据库，前端都能承担。当前最常见的模式就是：<font color=#CC99CD>前端 + API + 后端服务</font>，如下所示：
+ <font color=#3eaf7c>用户客户端</font> -> <font color=#3eaf7c>请求</font> -> <font color=#3eaf7c>Nginx</font> -> <font color=#3eaf7c>node(前端Vue/React)</font> <- <font color=#3eaf7c>(json<-)静态API(->Ajax)</font> -> <font color=#3eaf7c>后端服务（node、java、Go）</font>

而上述为什么把前端`Vue/React`也列举为`node`呢，因为本质是使用`node`启动的服务，而单页面应用也是<font color=#CC99CD>页面即服务</font>的典型应用，因为前后端分离是比较大的话题，我们在下一个章节会展开来说

## 贯穿开发全过程
`Node`是了不起的，但是在做技术选型的时候，我们不应该只关注技术本身，更重要的是技术适合做什么，很多时候不是`Node`不行，而是没有用对，下面我们列出`Node`擅长的一些场景：
+ <font color=#CC99CD>大前端</font>：遵循`JavaScript`语法规则，使用`Node`做前后端分离
+ <font color=#CC99CD>API接口</font>：典型的`Web`应用，绝大多数都是`I/O`密集型应用，是`Node`最擅长的
+ <font color=#CC99CD>RPC服务</font>：主要针对于`OLTP`（联机事务处理过程）数据库进行操作

`Node`可以说贯穿了开发全过程，优化了各个环节，明显的提高开发效率，下面给出一些场景：

### 1. 静态API
静态`API`（也可以叫做Mock API）简单的说就是我们开发中的接口开发，那为什么叫静态的? <font color=#CC99CD>因为这种API的URL固定，前端请求的发送的请求JSON格式和后端响应的JSON格式或者风格都是固定的，所以这种能使前后端可以同时开始，而且不会产生扯皮的问题</font>

那么怎么实现静态`API`呢？就是我们最常用`Express`和`koa`框架，只不过因为在响应`Json`的风格上有很多，比如<font color=#CC99CD>GitHub v3 REST</font>风格、<font color=#CC99CD>微博自定义式风格</font>、还有流行的<font color=#CC99CD>GraphQL</font>风格的等等。

### 2. 现代Web开发
前端领域的空前火爆，目前前端还处于发展期，没有形成固定的模式，但是趋势就是上升的，复杂的，不过当前前端开发已经很复杂了，我们总结几个阶段：
+ 基础： HTML、CSS、JavaScript
+ 曾经流行：jQuery、Extjs、BackBone
+ 当前流行：Vue、React、Angular

对于`Node`来说，所有的前端框架都是视图上的展现层而已，可以非常方便的和各种框架无缝集成，所有的前端框架都采用了`Node`和`NPM`作为辅助开发工具，所以你如果熟悉掌握了`Node`和`npm`，对于前端技术的学习就只是纯前端的部分，其他技术复用价值很高。所以现代`Web`开发都是依靠`Node`模块的，我们可以简单的列举：

| 编号            | 分类          | 举例  |
| :-------------: |:-------------:| :-----:|
|1                | 压缩          | UglifyJS JSmin CSSO |
|2                | 依赖管理      | npm Bower |
|3                | 模块系统      | CommonJS AMD ES6module  |
|4                | 模块加载器    | Require.js jspm Sea.js System.js  |
|5                | 模块打包器    | Browerify Webpack |
|6                | css预处理器   | PostCss Less Sass stylus |
|7                | 构建工具      | Grunt Gulp |
|8                | 引擎模板      | Jade Handlebars Numjucks |
|9                | JavaScript友好语言  | CoffeeScipt Babel Typescript |
|10               | 跨平台打包工具| Electron NW.js cordova |
|11               | 生成器        | yeoman Slush vue-cli create-react-app |

### 3. 后端开发
