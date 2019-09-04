# node要精通

## 到底什么是node
如果有人问你到底什么是`node`,可以用一句话来回答，因为这句话基本上包含了`node`的本质和其作用：

<font color=#3eaf7c>Node不是一门语言，也不是一个框架，是基于Chrome V8引擎的JavaScript运行时环境；同时结合libuv扩展了JavaScript的功能，使得JavaScript能够支持浏览器Dom的操作，同时具有了后端语言才有的I/O，文件读写和操作数据库的能力，是目前最简单的全栈环境</font>

因为大道至简，任何知识当你理解到一种程度的时候就可以用一句话来总结，但是实际上任何知识点如果你要开始学习它，都不是一句话能学的懂的，所以作为前端程序员我们首先要知道为什么`Node`选择了`JavaScript`，因为
+ <font color=#3eaf7c>语言的语法结构简单，进行数据提取和分析就越容易，用来开发互联网应用也就越简单，如果对象创建和线程管理都不是必须的，那么基于原型而不是面向对象的JavaScript就是最完美的</font>

这也印证了万维网之父Tim-Berners-Lee的那句话： 
+ <font color=#CC99CD>任何可以使用JavaScript实现的应用，最终都用JavaScript实现</font>

## node概述
在官网有段关于`node`的描述如下：

`Node.js is a JavaScript runtime built on Chrome's V8 engine. Node.js uses an event-driven , non-block I/O model that makes it lightweight and efficient, Node.js' package ecosystem,npm, is the largest ecosystem of open source libraries in the world`

+ 首先最重要的就是node的本质是`JavaScript`环境运行时，因为在过去`JavaScript`只能在浏览器当中运行，而因为浏览器当中有`JS引擎`，它可以帮助浏览器去识别和执行`JavaScript`语言，但是浏览器是每个不同厂家的产品，其实使用的引擎也不一样，而作为最近十年表现优异的`V8引擎`也帮助Chrome浏览器在市场独占鳌头，所以有人把它拿出来做了修改，让`V8引擎`可以单独运行在别的地方，也致使`JavaScript`脱离的浏览器也可以运行，所谓环境运行时，就是`JavaScript`可以运行的平台。

+ `JavaScript`和`C++`有着千丝万缕的联系。因为`V8引擎`是通过`C++`来编写的，但是实际上这种底层语言的学习成本和使用成本都很大，我们编写的`JavaScript`实际上要转化成为这种`C++`去运行的，同时在`node`当中I/O都是异步的，全部要交给由`C++`编写的`libuv`这个事件循环库来处理，简化了并发模型。

+ `Node`的目标是让并发变的简单，而使用的这种<font color=#3eaf7c>事件循环</font>和<font color=#3eaf7c>非阻塞I/O模型</font>让在以网络编程为主的I/O密集的应用当中脱引而出。但是这两个名词概念有点生疏，我们下面来说一下这个两个概念。

### 1. 非阻塞I/O
首先`I/O`是`input`和`output`的缩写，表示计算机输入输出的意思，除了常见的键盘，显示器，打印机都是输入输出设备，对计算机来说读写磁盘和网络操作都是`I/O`操作，当然数据库的操作也算，因为数据库也在磁盘当中。

我们先来看看<font color=#CC99CD>阻塞I/O</font>：`I/O`的时候进程休眠等待`I/O`完成后进入下一步。如果不考虑跳转语句，普通的程序是逐条执行的，当程序走到`I/O`操作的时候，程序会调用操作系统更底层的命令来完成操作，期间程序就会等待底层命令返回结果。拿到结果才能进行下一条程序语句的执行，<font color=#3eaf7c>我们把程序等待底层命令结果返回的这种行为或者现象称之为阻塞</font>

<font color=#CC99CD>非阻塞I/O</font>：`I/O`时函数立即返回，进程不等待`I/O`完成。程序进行到`I/O`操作的时候，主程序开始调用底层命令，但是主程序并不会一直等待底层命令的返回，而是执行下一条程序语句。然后等到底层`I/O`有结果返回的时候，主程序再去决定丢弃还是处理。

但是计算机指令都可以理解为阻塞的，为什么偏偏`I/O`操作就是特殊的呢？简单来说: 大部分的指令都依赖于`CPU`运算，因为到当下来说`CPU`运行速度极其的快，一秒能执行30亿条语句，非`I/O`操作压根感觉不到阻塞，但是`I/O`操作更慢，比如拷贝电影文件，这都是肉眼看得见的慢。

### 2. 事件驱动
前面我们说`I/O`操作完成后主程序会感知到，但是一定会有一种机制，就是主程序啥时候知道`I/O`操作完成，或者说完成的结果以怎么样的方式告诉主程序？

非阻塞的`I/O`认为立即完成的，同时发射一个事件并写好这个事件的处理函数，底层`I/O`操作完成后触发这个事件并执行相关的处理函数，内部的实现实际上是一个<font color=#3eaf7c>观察者模式</font>

## node架构模式

<img :src="$withBase('/node_mode.jpg')" alt="node早期的架构">

首先`libuv`由<font color=#3eaf7c>事件循环</font>和<font color=#3eaf7c>线程池</font>组成，负责所有I/O任务的分发和执行 `Node.js`是由事件循环来分发I/O任务，由工作线程将人物分发到线程池当中，事件循环只需要等待执行结果即可。这就是`node`的架构模式，我们下面来解释一下为什么是这样：
+ 因为JS是单线程,单线程的特点就是同同一时间只能干一件事，所有任务都需要排队挨个执行。
+ 而CPU是空闲的，它完全可以不管I/O设备而直接挂起处于等待中的任务，先运行排在后面的任务
+ 将等待的I/O任务放在事件循环中，但是I/O任务分为<font color=#3eaf7c>文件I/O</font>和<font color=#3eaf7c>网络I/O</font>, 可以看到文件I/O是在线程池中进行的，而网络I/O是不通过线程池完成的。

## node的特点
`Node`由4个很重要的特点就是：<font color=#3eaf7c>适合构建WEB应用</font>、<font color=#3eaf7c>高性能</font>、 <font color=#3eaf7c>简单</font>、 <font color=#3eaf7c>可扩展</font>
### 1. 适合构建WEB应用
+ <font color=#CC99CD>构建网站</font>
  传统的开发都是一体式的，视图渲染还有数据库访问，基本上都在一个项目当中，和传统的`java`还有`php`没有太大区别;

+ <font color=#CC99CD>构建API</font>  
  多端应用将`API`接口开发推向了浪尖，各种风格的接口开发琳琅满目，比如<font color=#3eaf7c>GitHub V3版的RESTful API</font>、 <font color=#3eaf7c>微博API的自定义约定</font>，包括最新的<font color=#3eaf7c>GraphQL</font>。但是大型工程当中的`API`比较复杂，<font color=#3eaf7c>因此在后端的API接口开发上封装一层专门供前端使用的 API Proxy是很有必要的</font>。所以这个在后面我们也会讲。

+ <font color=#CC99CD>构建RPC服务</font>
  `RPC协议服务`也叫做远程过程调用，常见的做法就是将数据库访问返回的数据以`TCP`形式传输给调用方，在协议和传输上有明显的优势，比如像著名的`RPC`服务有`Java`版本的`Dubbo`。

+ <font color=#CC99CD>前后端分离</font>
  前端分离的应用场景有：<font color=#3eaf7c>前端页面静态化（page static）</font>、<font color=#3eaf7c>前端页面服务化（PAAS）</font>、<font color=#3eaf7c>服务端渲染（SSR）</font>、<font color=#3eaf7c>渐进式Web应用（PWA）</font>

+ <font color=#CC99CD>适用于Serverless</font>
  有关运维，`API`快速开发，服务端渲染问题都能通过Serverless来解决，开发者不需要去关心运维，流量处理和容器编排，通过一个函数（函数内置RPC,缓存，配置等）就能完成所有开发，可以简单理解为`Serveless`是云计算的延时，而`Node.js`在这方面有得天独厚的优势。

### 2. 高性能
+ <font color=#CC99CD>执行速度开</font>
  构建在优秀的`V8`引擎上，执行速度在动态语言中算最快的

+ <font color=#CC99CD>天生异步</font>
  <font color=#3eaf7c>事件驱动</font>和<font color=#3eaf7c>非阻塞I/O</font>特性决定了必须要采用异步的方式，实际上<font color=#3eaf7c>每个I/O都是异步的</font>，因此集成到`libuv`中才会让开发者感觉不到并发的存在。

### 3. 简单可扩展
+ 语法简单，并发编程简单，部署运维简单，开发简单，可以使用大量的`npm`模块，也可以通过编写`C++`实现`CPU`密集型任务

## node和Web
上面我们说到`node`在`Web`这种高并发、I/O密集场景性能上优势很明显，下面我们就要好好说一说原因。

**1.I/O密集**

我们先说一下`I/O`密集和`CPU`密集，以及为什么`Web`属于`I/O`密集。
+ <font color=#CC99CD>CPU密集</font>：程序大部分用来做计算和逻辑处理，比如牙所，解压，加密，解密等等
+ <font color=#CC99CD>I/O密集</font>：程序大部分用来做存取设备，网络设施的一些读取操作，以及数据库的读取，比如文件操作，网络操作，数据库

**2.web常见场景**

然后为什么在`Web`常常属于`I/O`密集，我们来看看web常见场景；
+ <font color=#CC99CD>静态资源读取</font> 
  基本上网络当中静态资源的获取都是要从服务器上获取，服务器这些资源是放在服务器的硬盘上的，所以对于服务器就是静态资源读取，属于文件操作，属于`I/O`密集。

+ <font color=#CC99CD>数据库操作</font>
  动态数据和信息都是要读取数据库的，当然也有少部分的`CPU`处理，但是慢的还是`I/O`操作

+ <font color=#CC99CD>渲染页面</font>
  读取模板也是属于`I/O`操作，因为属于文件读取么

**3.高并发应对之道**

高并发就是单位时间内的访问量比较大，我们来说一下从传统到现在的应对高并发的方法
+ <font color=#CC99CD>增加机器数</font>：相同大的流量，通过负载均衡分发到不同的机器上来应对高并发
+ <font color=#CC99CD>提高机器的质量</font>：计算需求高的提高`CPU`的核数和质量，然后`I/O`需求高的就买好一点的，硬盘质量好的机器。这种方法就和使用什么语言就没啥关系了
