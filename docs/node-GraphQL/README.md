# Node-GraphQL

## 官网介绍
任何技术我们学习的时候其实官网都是一个好的学习路径，尤其的官网的快速入门，所以我们先从官网介绍一下`GraphQL`,它可能不是最容易理解的，但是一定是最官网的

<font color=#1E90FF>**① 一种用于API的查询语言**</font>

`GraphQL`既是一种用于`API`的查询语言也是一个满足你数据查询的运行时。 `GraphQL`对你的`API`中的数据提供了一套易于理解的完整描述，使得客户端能够准确地获得它需要的数据，而且没有任何冗余，也让`API`更容易地随着时间推移而演进，还能用于构建强大的开发者工具。

<font color=#1E90FF>**② 请求你所要的数据不多不少**</font>

向你的`API`发出一个`GraphQL`请求就能准确获得你想要的数据，不多不少。`GraphQL`查询总是返回可预测的结果。使用 `GraphQL`的应用可以工作得又快又稳，因为控制数据的是应用，而不是服务器。

<font color=#1E90FF>**③ 获取多个资源只用一个请求**</font>

`GraphQL`查询不仅能够获得资源的属性，还能沿着资源间引用进一步查询。典型的`REST API`请求多个资源时得载入多个`URL`，而`GraphQL`可以通过一次请求就获取你应用所需的所有数据。这样一来，即使是比较慢的移动网络连接下，使用`GraphQL`的应用也能表现得足够迅速。

<font color=#1E90FF>**④ 描述所有的可能类型系统**</font>

`GraphQL API`基于类型和字段的方式进行组织，而非入口端点。你可以通过一个单一入口端点得到你所有的数据能力。`GraphQL` 使用类型来保证应用只请求可能的数据，还提供了清晰的辅助性错误信息。应用可以使用类型，而避免编写手动解析代码。

<font color=#1E90FF>**⑤ API 演进无需划分版本**</font>

给你的`GraphQL API`添加字段和类型而无需影响现有查询。老旧的字段可以废弃，从工具中隐藏。通过使用单一演进版本，`GraphQL API`使得应用始终能够使用新的特性，并鼓励使用更加简洁、更好维护的服务端代码。

<font color=#1E90FF>**⑥ 使用你现有的数据和代码**</font>

`GraphQL`让你的整个应用共享一套`API`，而不用被限制于特定存储引擎。`GraphQL`引擎已经有多种语言实现，通过`GraphQL API`能够更好利用你的现有数据和代码。你只需要为类型系统的字段编写函数，`GraphQL`就能通过优化并发的方式来调用它们。

## 什么是GraphQL?
首先，`GraphQL`来自`Facebook`，如果你也跟我一样完全没了解过它，不知道它到底是干什么的，那么你一定听说过另一个叫做 `Structured QL`的东西。WHAT? 其实就是`SQL`了。

+ <font color=#CC99CD>和SQL一样，GraphQL是一门查询语言（Query Language）</font>
+ <font color=#CC99CD>和SQL一样的是，GraphQL也是一套规范，就像MySQL是SQL的一套实现一样，Apollo, Relay...也是GraphQL规范的实现</font>
+ <font color=#CC99CD>与SQL不同的是，SQL的数据源是数据库，而GraphQL的数据源可以是各种各样的REST API，可以是各种服务/微服务，甚至可以是数据库</font>

<img :src="$withBase('/graphql_what.png')" alt="什么是GraphQL">

## REST和GraphQL
`GraphQL`称为`REST`的代替品，那么`RESTful API`有哪些问题呢？
+ <font color=#1E90FF>REST API 最大的问题是其多端点的本质。这要求客户端进行多次往返以获取数据。</font>
+ <font color=#1E90FF>REST API 的另一大问题是版本控制。如果你需要支持多个版本，那通常意味着需要新的端点。而在使用和维护这些端点时会导致诸多问题，并且这可能导致服务器上的代码冗余。</font>

而`Graphql`讨论的就是基于资源的`HTTP`端点`API`。这些`API`中的每一个最终都会变成一个具有常规`REST`端点 + 由于性能原因而制定的自定义特殊端点的组合。这就是为什么`GraphQL`提供了更好的选择，它背后有很多概念和设计决策：
+ <font color=#1E90FF>GraphQL 模式是强类型模式。要创建一个 GraphQL 模式，我们要定义具有_类型_的_字段_。这些类型可以是原语的或者自定义的，并且模式中的所有其他类型都需要类型。这种丰富的类型系统带来丰富的功能，如拥有内省 API，并能够为客户端和服务器构建强大的工具。</font>
+ <font color=#1E90FF>GraphQL 使用图与数据通信，数据自然是图。如果需要表示任何数据，右侧的结构便是图。GraphQL 运行时允许我们使用与该数据的自然图形式匹配的图 API 来表示我们的数据。</font>
+ <font color=#1E90FF>GraphQL 具有表达数据需求的声明性。GraphQL 为客户端提供了一种声明式语言，以便表达它们的数据需求。这种声明性创造了一个关于使用 GraphQL 语言的内在模型，它接近于我们用英语考虑数据需求的方式，并且它让使用 GraphQL API 比备选方案（REST API）容易得多</font>



**参考资料**

+ [前端er了解GraphQL，看这篇就够了](https://juejin.im/post/5ca1b7be51882543ea4b7f27#heading-0)
+ [[译] REST API 已死，GraphQL 长存](https://juejin.im/post/5991667b518825485d28dfb1)
+ [安息吧 REST API，GraphQL 长存](https://juejin.im/entry/59b8f213f265da065a63a236)