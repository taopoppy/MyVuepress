# 项目需求分析

## 需求流程
关于项目需求分析，我们注意下面这个几个点：
+ <font color=#1E90FF>项目全局思维，需求分析重难点</font>
+ <font color=#1E90FF>案例项目需求分析，业务拆解，功能拆解</font>
+ <font color=#1E90FF>需求分析的工具以及使用场景</font>

<font color=#DD1144>主要要根据原型图、流程图来产出需求文档</font>

<img :src="$withBase('/bigfrontend-devop-3.png')" alt="">

关于项目管理有很多的优秀的工具：
+ <font color=#9400D3>jira（敏捷团队的 首选软件 开发工具）</font>
+ <font color=#9400D3>Notion（Notion 是一款“重新定义数字笔记”的出色全能知识管理软件）</font>
+ <font color=#9400D3>gitee</font>、<font color=#9400D3>slack</font>等等。

一个好的项目需求分析一定要注重下面这些点：
+ <font color=#1E90FF>需求分析分析内容（从哪里来）</font>
+ <font color=#1E90FF>需求分析中重点的内容（抓痛点）</font>
+ <font color=#1E90FF>需求分析文档以工具（怎么做）</font>

::: tip
<font color=#3eaf7c>需求文档有一个固定的模式，我们会在后面进行提供</font>
:::

## 需求分析难点和痛点
### 1. 需求分析前置考虑
需求产生的原因基本都是项目的性质决定的，项目的性质一般就分为下面的三类：
+ <font color=#DD1144>业务型</font>：无纸化带来的效率提升
+ <font color=#DD1144>痛点型</font>：市场决定的风声浪口
+ <font color=#DD1144>功能型</font>：企业&客户需求，决定流量入口

抓住用户或者客户的需求痛点是未来能够正确引导用户需求的关键的一步，所以要避免需求分析当中的不好的习惯，比如<font color=#1E90FF>不想就做</font>、<font color=#1E90FF>照单全收</font>、<font color=#1E90FF>未沟通/确认</font>、<font color=#1E90FF>放养式管理</font>

### 2. 需求分析的难点
+ <font color=#1E90FF>除了考虑功能实现，还要考虑时间/成本</font>
+ <font color=#1E90FF>形成需求文档，用户回馈确认</font>
+ <font color=#1E90FF>引导用户的需求，创造用户的需求</font>：因为有的用户并不懂技术，提出的需求天马行空，他认为很简单的东西可能在技术上是难以实现的，或者是可以实现，但是成本很大，所以如何正确引导用户的需求呢？这里建议：<font color=#DD1144>往公司做过的产品上靠，往公司技术人员熟悉的领域去靠，或者往公司发展或者行业发展的方向去靠</font>

### 3. 需求分析组成部分
关于需求分析顺序我们在之前的图中已经说过有：<font color=#9400D3>项目需求</font> -> <font color=#9400D3>业务需求</font>-><font color=#9400D3>用户需求</font> -> <font color=#9400D3>具体产出</font>

## 需求分析实战(重点)
<img :src="$withBase('/bigfrontend-devop-4.png')" alt="">


## 核心业务需求分析
我们的业务从大体上是分类前后端：
<img :src="$withBase('/bigfrontend-devop-5.png')" alt="">

然后从业务和功能来讲：
<img :src="$withBase('/bigfrontend-devop-6.png')" alt="">

所以前后端和业务功能分析完毕之后，我们就可以将其串联起来：
+ 前后端分离 -> 接口鉴权 -> 数据通用性 -> 数据库设计
+ 内容管理 -> 搜索 -> 筛选 -> 积分管理体系
+ 社区业务 -> 权限 -> 积分 -> 用户体系

## 原型设计
原型设计就是清晰的表达系统的构想，原型设计的目标是什么？
+ <font color=#1E90FF>展现布局逻辑结构</font>
+ <font color=#1E90FF>表明状态关系和跳转关系（也可以在流程图当中体现）</font>
+ <font color=#1E90FF>低成本的快速修改（如果直接书写代码，大概率不是用户想要的）</font>

知道了原型设计的目标，那么原型设计的本质或者工作内容是什么？
+ <font color=#DD1144>原型</font>：用线条，图形描绘出产品框架，也称线框图
+ <font color=#DD1144>设计</font>：综合考虑产品目标，功能需求场景，用户体验等等因素，对产品的各板块，界面和元素进行的合理性排序过程。

所以整个产品阶段就是：<font color=#1E90FF>想法</font> -> <font color=#1E90FF>需求采集</font> -> <font color=#1E90FF>功能结构</font> -> <font color=#1E90FF>原型设计</font> -> <font color=#1E90FF>产品需求文档</font>

## PC端需求分析
对于在原型设计过程当中，对于某个功能或者模块进行设计的时候，掌握三个重点：
+ <font color=#1E90FF>借鉴</font>：可以到[花瓣网](huaban.com)、[优设](uisdc.com)、[UI中国](ui.cn)这些网站上面搜索和借鉴
+ <font color=#1E90FF>向技术人员寻求建议，因为很多设计不能脱离技术和安全（后端），也不能脱离交互感受（前端）</font>
+ <font color=#1E90FF>确保在一定要满足客户的要求，设计要和客户意见保持统一</font>

对于社区PC端来讲，最重要的三个东西：<font color=#DD1144>内容展示</font>、<font color=#DD1144>回复点赞</font>、<font color=#DD1144>积分和用户系统</font>，这三个是PC端最主要的三个模块和内容，所以下面我们稍微来做一个思考：

对于一个社区来说，无论是什么社区，平台，<font color=#1E90FF>导航</font>和<font color=#1E90FF>用户中心</font>是必须要有的，涉及到用户中心，就有<font color=#1E90FF>我的主页</font>、<font color=#1E90FF>基本设置</font>等等，同时社区以发帖为主，那么在用户中心当中肯定还有<font color=#1E90FF>我的贴子</font>、<font color=#1E90FF>我的消息</font>，因为会有人给你的贴子回复和点赞。所以由于社区是以人为本的，所以关于用户的相关贴子，相关消息，都应该作为链接在首页就让用户看到，方便用户操作。其次我们再从<font color=#DD1144>内容展示</font>、<font color=#DD1144>回复点赞</font>、<font color=#DD1144>积分和用户系统</font>一个一个说，内容展示方面，是贴子，也是讨论，所以类型有很多，类型多，内容多就涉及到搜索功能以及分类功能，以及重要的排序，排序就又设计到榜单，什么热榜，新榜，分类榜等等。回复点赞收藏都是用户之间的交流方式，有对应的`UI`功能和合理的数据库设计。最后，积分作为功能亮点，设计到的就是积分系统，和显眼的`UI`显示，既然是积分，无论是发帖，签到，或者评论都有积分显示和参与。

整个上面就大概是一个需求分析过程，经过这个分析过程，我们最终可以获得一个<font color=#9400D3>脑图</font>：

<img :src="$withBase('/bigfrontend-devop-7.png')" alt="脑图">

但是上面这个东西基本上是产品经理应该干的事情，有了脑图，然后给`UI`设计师，去根据脑图再使用一些原型图工具去绘制原型图，<font color=#1E90FF>比较重要的是UI设计师使用类似于Axure等原型工具的时候也要写日志，方便记录和工作</font>

所以整个操作下来，我们应该可以明确的知道产品再开发前应该经历一个什么样的步骤：
+ <font color=#DD1144>需求分析（以产品经理为主）</font>：脑图
+ <font color=#DD1144>UI设计（以UI设计师为主）</font>：原型图集、流程图集
+ <font color=#DD1144>需求总结（以项目经理为主 ）</font>：需求文档

需求文档一般为`md`文档的形式，关于模板我们会在[github](https://github.com/taopoppy/Big-front-end/tree/main/resources)上提供。


## 服务端需求分析
服务端的需求分析，大体上一般都和用户，数据相关，而前端一般是和体验或者操作流程相关的，和交互层面相关的
+ <font color=#1E90FF>用户，权限管理</font>
+ <font color=#1E90FF>内容管理，首页管理</font>
+ <font color=#1E90FF>其他功能（日志，多语言等等）</font>

具体的需求分析和前面一样，我们就不会细说，我们经过一番思考，最终会得到一个脑图，如下：

<img :src="$withBase('/bigfrontend-devop-8.png')" alt="">

服务端根据脑图一般给出的说明文档或者需求文档，如果是前后端分离的项目中，就是具体的接口文档，如果在项目还没有开始写出接口文档，一般使用word文件或者PDF形式写出<font color=#9400D3>接口设计文档</font>、如果一边做一边生成，这个叫做<font color=#9400D3>接口生成文档</font>，这个是可以通过很多工具帮忙生成的，比如<font color=#1E90FF>postman的上传接口</font>、<font color=#1E90FF>swagger</font>等等。

## webapp/小程序需求分析
小程序和`webapp`放在一起，因为都是要进行一部分的适配设计，都属于移动端的部分。

+ <font color=#1E90FF>主体功能</font>：因为一般移动端和小程序上的功能没有那么复杂和多样，所以要找到主体功能（除了视频类型的除外）
+ <font color=#1E90FF>技术实现/交互体验</font>：移动端的交互和浏览器差别很大，要考虑移动端的技术实现
+ <font color=#1E90FF>用户数据与流量入口</font>：移动端的业务开发是否能带来用户，如果成本高于收益，是不建议考虑的

所以经过一番思考，我们在`PC`端分析的基础上精简了一些，就形成了下面的移动端的脑图：

<img :src="$withBase('/bigfrontend-devop-9.png')" alt="">

有了脑图，继续按照<font color=#1E90FF>原型图</font> -> <font color=#1E90FF>流程图</font> -> <font color=#1E90FF>需求文档</font>的顺序进行需求产出。

## 技术栈考量
+ 团队技术实力与业务需求结合
+ 能够复用，坚决不造轮子，需要造轮子，坚决不牵强
+ 怎么简单怎么来，多考虑时间，进度，质量因素

技术栈的考虑最终会新城一个<font color=#9400D3>架构图</font>，如下所示：

<img :src="$withBase('/bigfrontend-devop-10.png')" alt="">

关于前端和后端的技术栈的选择基本都是和业务相关，但是`web`服务我们使用的是`Restful api`，其实还有很多的选择，比如`Graphql`、`Rpc`等等。关于`API`风格的选择可以在网上仔细研究一下区别，这里就不过多说。

而`MongoDB`和`Redis`的数据库使用，应该是最契合大前端工程师了，所以没有太多挑剔的地方，而运行环境选择`Docker`则实际能快速帮助我们建立开发和运行的测试环境，也能快速帮助我们实现生产部署的技术。

## 需求工具概览
+ <font color=#1E90FF>原型类</font>：Axure,PS,墨刀。蓝湖
+ <font color=#1E90FF>思维脑图</font>：Xmind、mindmaster、MindNode(Mac)、MindManager
+ <font color=#1E90FF>流程图</font>：Visio(windows)、OmniGraffle(Mac)、processOn