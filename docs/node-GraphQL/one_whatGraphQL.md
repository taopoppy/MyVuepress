# 什么是GraphQL

## 官网介绍
任何技术我们学习的时候其实官网都是一个好的学习路径，尤其的官网的快速入门，所以我们先从官网介绍一下`GraphQL`,它可能不是最容易理解的，但是一定是最官网的
<font color=#1E90FF>**① 一种用于API的查询语言**</font>

`GraphQL`既是一种用于`API`的查询语言也是一个满足你数据查询的运行时。 `GraphQL`对你的`API`中的数据提供了一套易于理解的完整描述，使得客户端能够准确地获得它需要的数据，而且没有任何冗余，也让`API`更容易地随着时间推移而演进，还能用于构建强大的开发者工具。

<font color=#1E90FF>**② 请求你所要的数据
不多不少**</font>

向你的`API`发出一个`GraphQL`请求就能准确获得你想要的数据，不多不少。`GraphQL`查询总是返回可预测的结果。使用 `GraphQL`的应用可以工作得又快又稳，因为控制数据的是应用，而不是服务器。

<font color=#1E90FF>**③ 获取多个资源
只用一个请求**</font>

`GraphQL`查询不仅能够获得资源的属性，还能沿着资源间引用进一步查询。典型的`REST API`请求多个资源时得载入多个`URL`，而`GraphQL`可以通过一次请求就获取你应用所需的所有数据。这样一来，即使是比较慢的移动网络连接下，使用`GraphQL`的应用也能表现得足够迅速。

<font color=#1E90FF>**④ 描述所有的可能
类型系统**</font>

`GraphQL API`基于类型和字段的方式进行组织，而非入口端点。你可以通过一个单一入口端点得到你所有的数据能力。`GraphQL` 使用类型来保证应用只请求可能的数据，还提供了清晰的辅助性错误信息。应用可以使用类型，而避免编写手动解析代码。

<font color=#1E90FF>**⑤ API 演进
无需划分版本**</font>

给你的`GraphQL API`添加字段和类型而无需影响现有查询。老旧的字段可以废弃，从工具中隐藏。通过使用单一演进版本，`GraphQL API`使得应用始终能够使用新的特性，并鼓励使用更加简洁、更好维护的服务端代码。

<font color=#1E90FF>**⑥ 使用你现有的
数据和代码**</font>

`GraphQL`让你的整个应用共享一套`API`，而不用被限制于特定存储引擎。`GraphQL`引擎已经有多种语言实现，通过`GraphQL API`能够更好利用你的现有数据和代码。你只需要为类型系统的字段编写函数，`GraphQL`就能通过优化并发的方式来调用它们。

## 什么是GraphQL?
首先，`GraphQL`来自`Facebook`，如果你也跟我一样完全没了解过它，不知道它到底是干什么的，那么你一定听说过另一个叫做 `Structured QL`的东西。WHAT? 其实就是`SQL`了。

+ <font color=#CC99CD>和SQL一样，GraphQL是一门查询语言（Query Language）</font> 
+ <font color=#CC99CD>和SQL一样的是，GraphQL也是一套规范，就像MySQL是SQL的一套实现一样，Apollo, Relay...也是GraphQL规范的实现</font> 
+ <font color=#CC99CD>与SQL不同的是，SQL的数据源是数据库，而GraphQL的数据源可以是各种各样的REST API，可以是各种服务/微服务，甚至可以是数据库</font> 

<img :src="$withBase('/graphql_what.png')" alt="什么是GraphQL">

## REST和GraphQL
未完待续...

**参考资料**

+ [前端er了解GraphQL，看这篇就够了](https://juejin.im/post/5ca1b7be51882543ea4b7f27#heading-0)
+ [[译] REST API 已死，GraphQL 长存](https://juejin.im/post/5991667b518825485d28dfb1)
+ [安息吧 REST API，GraphQL 长存](https://juejin.im/entry/59b8f213f265da065a63a236)