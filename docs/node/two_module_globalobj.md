# 全局对象和调试入门
## 全局对象概述

之前我们说模块有两种写法，一种是基于`CommonJS`规范编写的，第二种就是<font color=#CC99CD>全局对象的写法</font>，<font color=#3eaf7c>全局对象就是无须引用就可以直接使用的对象</font>，当然我们也要注意全局对象和`global`关键字之间的区别

内置对象大致能够分为5大类：
+ <font color=#1E90FF>**① 为模块包装而提供的全局对象**</font>
+ <font color=#1E90FF>**② 内置的process对象**</font>  
+ <font color=#1E90FF>**③ 控制台Console模块**</font> 
+ <font color=#1E90FF>**④ EventLoop相关API**</font>
+ <font color=#1E90FF>**⑤ Buffer数据类型和全局对象global**</font>

### 1. 为模块包装而提供的全局对象
我们在之前已经说过，模块的加载和运行都是在`Node`当中进行包装的，包装成为一个函数，而<font color=#CC99CD>exports</font>、<font color=#CC99CD>require</font>、<font color=#CC99CD>module</font>、<font color=#CC99CD>__fileName</font>、<font color=#CC99CD>__dirname</font>这5个内置对象是作为参数而传入到模块当中的，或者说这5个都是为了模块包装而提供的内置对象

在前两小节我们已经清楚的讲解了`module`、`require`、`exports`这三个全局对象的作用
+ `module`表示对这个模块的引用，因此`module`实际上不是全局的，而是每个模块本地的。`module`除了`exports`还有其他关于模块的属性,我们前面已经说活模块是一个对象，里面包含6个属性和一个方法
+ `exports`其实是`module.exports`的简写，表示这个模块的输出。有一点需要注意，对`exports`直接赋值`exports = {...}`并不会被输出，因为`exports`事先已经被定义了，再次这样赋值会被覆盖，需要带上`module：module.exports = {...}`
+ `require`是引入模块的，涉及到引用模块的加载和执行我们都在上一小节清楚的讲了

### 2. 内置的process对象  
<font color=#CC99CD>作为核心模块，它可以对当前Node的各种信息进行绑定，使用它是个明智的选择</font>，那我们首先来了解一下进程的概念： 

+ 在`Node.js`中每个应用程序都是一个进程类的实例对象。
+ 使用`process`对象代表应用程序,这是一个全局对象，可以通过它来获取`Node.js`应用程序以及运行该程序的用户、环境等各种信息的属性、方法和事件。

<font color=#bl4>综上所述，process这个全局对象提供了一下当前进程的信息以及控制方法</font>

`process`提供的接口包括
+ 描述进程的一些状态（事件）：`exit`、`beforeExit`、`uncaughtException`、`Signal`
+ 进程退出返回的状态码：`Uncaught`、 `Fatal Exception`、`Signal Exits`、`Unused`等
+ 进程的相关信息：`stdout`、`stderr`、`config`、`stdin`、`exitCode`、`pid`(进程编号)等
+ 操作进程的方法：`abort`、`chdir`、`cwd`、`kill`(发送信号给进程)、`exit`、`nextTick`、`getgid`、`setgid`、`uptime`等

关于`process`这个核心模块我们后面会单独拿出来详细描述用法，与之相关的`child_process`和`Cluster`模块我们都会在后面的一个小节当中单独的拿出来讲解。

### 3. 控制台Console模块 

`console`这个模块在`javascript`浏览器和`Node`当中是不一样的实现，因为`Node`是要在终端输出，`console`模块是在源码的`lib/internal/bootstrap_node.js`当中被绑定为全局对象的。然而，尽管 `console.log`有其适用的场合，大多数人仍然没有意识到`console`本身除了基础`log`还有许多选择。合理使用这些方法能让调试更简单、更快速，并且更加直观。

当然我们强调两点，十分重要：
+ <font color=#3eaf7c>console模块在浏览器和Node当中是由区别的，实现是不同的，所以在Node当中使用要仔细查看官网</font>
+ <font color=#3eaf7c>实际上很多console的方法没啥大用，因为适用的场景太特殊化了，但是还有一些很有用的我们打算说出来，帮助大家拓展，而不是只会console.log</font>

<font color=#1E90FF>**① console.table**</font><font color=#dl4>(非常有用)</font>  
`console.table`更偏向于一种方式展示列表形式的数据，这比只扔下原始的对象数组要更加整洁。不说废话直接代码和图：
```javascript
const transactions = [{
  id: "7cb1-e041b126-f3b8",
  seller: "WAL0412",
  buyer: "WAL3023",
  price: 203450,
  time: 1539688433
},
{
  id: "1d4c-31f8f14b-1571",
  seller: "WAL0452",
  buyer: "WAL3023",
  price: 348299,
  time: 1539688433
},
{
  id: "b12c-b3adf58f-809f",
  seller: "WAL0012",
  buyer: "WAL2025",
  price: 59240,
  time: 1539688433
}];
console.table(transactions)
console.table(transactions,["id", "price"])
```
相同的代码在浏览器的控制台和`Node`控制台打印出来样子是差不多的，但是浏览器的更好看，而且通过每列的右上角的向上的小箭头还能进行排序，而`Node`当中就是简单的展示而已：
+ 浏览器中的效果
  <img :src="$withBase('/node_console_table_one.png')" alt="console.table浏览器效果">
+ Node当中的效果
  <img :src="$withBase('/node_console_table_two.png')" alt="console.table在Node中的效果">

<font color=#1E90FF>**② console.time**</font>  
和定时器有关的三个`API`如下：
+ <font color=#CC99CD>console.time([label])</font>: 启动一个计时器，用以计算一个操作的持续时间。 计时器由一个唯一的`label`标识
+ <font color=#CC99CD>console.timeLog([label][, ...data])</font>: 停止先前通过调用 `console.time()`启动的计时器，并打印结果到`stdout`
+ <font color=#CC99CD>console.timeEnd([label])</font>: 停止先前通过调用`console.time()`启动的计时器，并打印结果到`stdout`

用法也很简单，上述三个`API`分别用于定时器开始，其中和结束：
```javascript
console.time('100-elements'); // 打印：100-elements: 0.093ms 0
for (let i = 0; i < 100; i++) {
  console.timeLog('100-elements',i) // 打印100次：100-elements: xxxms i
}
console.timeEnd('100-elements'); // 打印：100-elements: 34.542ms
```

### 4. EventLoop相关API

这一类基本上就是`SetTimeout`、`SetInterval`、`SetImmediate`和对应的`clear`方法的实现，这些东西我们已经在整个讲解事件循环都不知道用了多少次了，具体的使用还是去看一下[官网](http://nodejs.cn/api/timers.html)

### 5. Buffer数据类型和全局对象global

`Buffer`我们会在后面单独拉出来讲，`global`对象，<font color=#CC99CD>主要用来扩展变量和方法</font>，比如我们经常使用下面的代码来判断是否开启日志和打印日志
```javascript
global.debug = false
global.log = console.log
```
但是也不能滥用这个全局对象，因为如果你不是很懂`Node`的话，`global`关键字的位置使用不准确就会带来代码的混乱。

## 调试入门
我们下一节就要开始讲一些核心模块了，为了让大家更好的将学习和理论结合，我们在这里先将调试，方便大家在后面自己动手敲代码的时候遇到问题可以通过调试的方式来发现和寻找错误。

### 1. Inspector
<font color=#1E90FF>**① 使用Inspector调试Node的优势**</font>

使用`Inspector`调试`Node`的本质是<font color=#bl4>断点调试</font>，断点调试的优势在于
+ 可以查看当前上下文的变量
+ 可观察当前函数的调用堆栈
+ 不侵入代码
+ 可以在暂停的状态下执行指定代码

<font color=#1E90FF>**② Inspector的构成以及原理**</font>

当启动了`Inspector`的时候，会开始一个<font color=#bl4>WebSockets服务（监听命令）</font>，监听的这些命令都是遵循<font color=#bl4>Inspector协议</font>，同时还启动一个<font color=#bl4>Http服务（获取元信息）</font>

我们随便点击F5去启动一个`NODE`的程序，会在命令行中显示这样的东西
```javascript
Debugger listening on ws://127.0.0.1:12729/b649d2b5-4f15-4e92-be40-ff72e9690031
```
+ 首先这是一条完整的`WebSockets`服务
+ 我们可以在浏览器中直接打开<font color=#CC99CD>127.0.0.1:12729</font>，去查询`http`服务
+ 通过<font color=#CC99CD>127.0.0.1:12729/json</font>可以查询一些调试元信息

### 2. 激活调试
<font color=#1E90FF>**① 如何激活调试**</font>

激活调试基本上就在运行`NODE`的时候添加启动参数 ` --inspect`就好了,比如:
```javascript
node --inspect a.js
```
基本上这种命令适合`web`开发，因为我们`node`开发一个服务端，服务端一直会在服务当中，而一般的程序会快速执行完毕，并且关闭掉进程，如果想调试一般的程序，我们可以使用下面这个命令:
```javascript
node --inspect-brk a.js
```
然后在`chrome`当中去打开`chrome://inspect`这个url，稍等一会在下面救能看到调试的远程文件了

<font color=#1E90FF>**② 激活调试后会发生什么**</font>

激活调试之后我们的`Node`进程就会通过`WebSockets`监听调试信息，监听的是客户端的调试信息，如果你在`VScode`当中去调试，那么`VScode`就是程序的客户端了，同时还会提供一个`Http`服务来提供调试的元信息

### 3.调试客户端 - Chrome DevTools
<font color=#1E90FF>**① 调试客户端是什么**</font>

调试客户端就是连接到`Node.js Inspector`的工具，市面上有很多这样的工具，但是最好用的就是这么几个：<font color=#bl4>Chrome DevTools 55+</font>、<font color=#bl4>VS Code</font>

<font color=#1E90FF>**② Chrome DevTools怎么使用**</font>

+ 访问`chrome://inspect`,点击配置按钮，确保`Host`和`Port`对应 
+ 访问元信息中的`devtoolsFrontendUrl`
+ 激活调试之后，打开开发者面板，点击左上角的绿色小图标  
(
  <font color=#CC99CD>上述三个方法基本上打开的是同个面板，里面的东西都一样，这样要介绍一个测试性能的方法，因为在web开发当中，我们一个请求如果很慢，我们可以通过这种方法去检查到底是哪个部分执行的速度很慢，我们可以在上述已经打开的调试面板当中Profiler中看到下面有个start，在请求之前点击一下，然后执行一下程序，然后点击stop，就会出来各个函数运行的时间，通过这些时间你就能知道，哪个部分到底执行的时间很长，从而进行优化</font>
)

### 3.调试客户端 - VS code
+ <font color=#CC99CD>启动方式</font>：按F5
+ <font color=#CC99CD>配置launch.json</font>: 因为按F5本质只是`Node`了整个文件，但是有时候我们启动程序的时候需要后面添加参数，那这样直接按F5肯定不行，我们需要配置`launch.json`，我们只需要在调试的界面（点击左侧的小虫子的图标）当中的绿色启动按钮右侧的下拉菜单中点击添加配置，然后就会自动在当前目录下添加一个`.vscode`的文件夹，文件夹下面就由`launch.json`,你可以在其中添加各种调试的配置。

### 5.命令行参数介绍
关于`inspect`还有很多拓展的参数，我们可以到[官网](https://nodejs.org/zh-cn/docs/guides/debugging-getting-started/)上去自动学习。

**参考资料**

1. [认识node核心模块--全局对象及Cluster](https://juejin.im/post/59fc72da518825299a468d8b) 
2. [nodejs第三天(全局对象)](https://juejin.im/post/59f07b386fb9a0452a3b8934)
3. [[译] 你不知道的 console 命令](https://juejin.im/post/5bf64218e51d45194266acb7#heading-2)
4. [[译] 使用 VS Code 调试 Node.js 的超简单方法](https://juejin.im/post/5cce9b976fb9a0322415aba4)
5. [node调试入门](https://www.imooc.com/learn/1093)
6. [Node.js入门到企业Web开发中的应用](https://coding.imooc.com/class/146.html)