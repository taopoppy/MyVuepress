# 异步写法和流程控制
<font color=#3eaf7c>流程控制</font>是程序当中的逻辑控制的统称，为什么到`Node`当中就成了<font color=#3eaf7c>异步流程控制</font>？这个和`node`本身的异步流程有关，若每个函数都是异步的，性能虽会更好，但会造成`callback hell`(回调地狱)问题，为了解决这种`API`级别的回调地狱问题，便引入了异步流程控制。

为什么说异步流程控制如此重要，因为基于`node`的事件循环执行机制和非阻塞`I/O`,异步成为常态，如果你对异步和异步写法不是很熟悉，你势必会在`node`程序当中迷失方向，可以很负责任的说这么一句话：
+ <font color=#3eaf7c>掌握了node中的异步流程控制，你就掌握了Node当中一半以上的内容</font>

异步流程控制的解决方案发展的非常迅速，从实现了<font color=#CC99CD>Thunk</font>,到<font color=#CC99CD>Promise/A+</font>规范落地，到`ES6`当中的<font color=#CC99CD>Generator</font>和<font color=#CC99CD>co</font>模块，以及到现在目前为止最被看好的<font color=#CC99CD>async</font>和<font color=#CC99CD>await</font>方案

## 异步调用
<font color=#3eaf7c>异步调用是node当中的精髓</font>，掌握了异步写法就能在编程当中游刃有余，但是想要熟悉异步调用我们必须从最基础的概念了解，首先要懂的什么是异步和同步

### 1. 异步和同步
+ <font color=#3eaf7c>同步</font>：必须等到别人的回复才能干别的事情，至死方休
+ <font color=#3eaf7c>异步</font>：充分利用时间差，合理运用时间高效做事，各不耽误

虽然这样的定义可以并不是很好懂，但是现在我们可以举个例子，比如你现在向教务处打电话要查询成绩，查完成绩要去吃饭，查成绩和吃饭实际上没有任何联系，只是你脑海里有这么个先后顺序。教务处的负责人在电话里这样说：“你先别挂电话，我马上给你查”。然后在他查询成绩的这段时间你就只能握住电话等待，但是你也不知道他啥时候查完，假如人家查了1个小时，你就必须等一个小时后再去吃饭。这就是同步，当我们和其他有交互的时候必须等待别人回复我们才能做后面的事。

由于信号不好，现在你又打电话给教务处打电话查询成绩，此时教务处的负责人在电话里这样说：“我们这边已经有你的电话了，等我们查到你成绩了给你回电话”，说完他就挂了电话，此时的你在教务处回复你的期间可以去吃饭，你可以吃饭，你还可以旅游去，也不用等待和担心，因为教务处查到成绩会自动给你回话，这就是异步，充分利用了打电话和最后知道成绩的这个期间的时间干自己的事。

`node`当中的同步和异步也是如此，如果两个操作没有直接的联系，只有书写代码先后执行的问题，那么最好用异步的方式去执行，这样不会造成后面程序的执行阻塞在同步的等待当中。

### 2. 浏览器和node的异步原理
不知道你们发现了没有，在异步调用当中，我们自己是无法独自完成异步，必须依靠某个东西和我们共同完成，就好比上个例子当中的教务处负责人，他负责接收我的查成绩的请求，并在查到成绩后主动给我电话或发短信通知我。至于他是自己用电脑去学校系统上查还是叫下属拿出成绩册看，我们并不关心实际交互的过程。所以这个教务处的负责人是整个异步的核心。

<font color=#3eaf7c>所以不管什么异步模式当中是一定有这样一个核心中间人，去做最重要的三件事：</font><font color=#CC99CD>接收异步请求</font>、<font color=#CC99CD>发生异步交互</font>、<font color=#CC99CD>返回异步响应</font>

**1. 浏览器中的异步**

我们知道在浏览器当中异步模式是依赖于<font color=#3eaf7c>Ajax</font>的，而`Ajax`中的核心，或者核心中间人就是<font color=#CC99CD>XMLHttpRequest</font>，如下图：

<img :src="$withBase('/async_ajax_brower.png')" alt="浏览器中的异步">

如上图,`Ajax`定义好请求和回调函数后，剩下的事情就交给`XMLHttpRequest`处理，`XMLHttpRequest`会和服务器交互，并产生时间差役，所以异步操作能够很好的解决这个问题，不需要刷新页面就能获取数据。

**2. node中的异步**

我们知道在`Node`当中异步模式是依赖于<font color=#3eaf7c>异步非阻塞I/O模型</font>的，而这种模型中的核心，或者核心中间人就是<font color=#CC99CD>EventLoop</font>，如下图：

<img :src="$withBase('/async_node_js.png')" alt="node中的异步">

如上图，我们在调用`Node API`方法的时候，会把具体操作和回调函数交给`EventLoop`去执行，`EventLoop`维护了一个事件队列，当异步函数执行的时候，会把回调函数放进事件队列当中，`V8`引擎知道异步函数执行完成才会开始处理`EventLoop`,这意味着`JavaScript`代码不是多线程的，及时好像看起来能同时执行多个线程的任务

**3. 总结**

无论是`Ajax`还是`Node`,都是借助<font color=#3eaf7c>中间层</font>来进行实际操作的，在使用的时候无须过多关注中间层之后的操作就能完成功能开发，这就是`Node`的特点，能够以最小的成本获取高性能，只需要专注写代码即可。

### 3. 异步好处和问题
虽然`node`当中也有很多同步的`API`,但是同步和异步的写法造成的结果也很大：
+ 同步方式更容易理解，但是会造成线程阻塞，无法最大限度的利用系统资源
+ 异步方式需要嵌套回调，即使代码写的非常规范也不容易理解和维护，但是它能够<font color=#3eaf7c>并行执行</font>，同时处理更多任务，效率更高

但是异步的通常最大的问题就是： <font color=#CC99CD>执行结果不是我们想要的，或者我们理想状态的结果</font>，因为异步执行的结果具有一定的不确定性，所以如何提高可控性是开发人员要解决的问题，也是`Node`当中最难的点。所以你可以看到关于流程控制的技术再不断的更新和发展，下面我们就会去从最基础的`node`自带的异步写法开始了解，最后到更好的异步流程写法，让`node`工程师在异步的世界中如鱼得水。


## node自带的异步写法
`node`当中有两种事件处理的方式，分别是<font color=#3eaf7c>callback（回调）</font>和<font color=#3eaf7c>EventEmitter（事件发射器）</font>，这里我们先要说的就是<font color=#CC99CD>callback采用的是错误优先的回调方式，EventEmitter采用的是事件驱动当中的事件发射器</font>

### 1. callback
因为`callback`采用的是错误优先的回调方式，而这种方式只需要注意两条规则即可：
+ 回调函数的第一个参数返回的是`error`对象，如果错误发生，该对象会作为第一个参数返回，如果执行正常，一般的做法是将`error`返回`null`
+ 回调函数的第二个参数返回的是所有成功响应的响应结果数据，如果结果正常，那么参数`err`就会被设置为`null`,并在第二个参数上面返回正确结果

我们知道<font color=#CC99CD>异常处理实际上是异步流程控制当中最难的部分</font>，异常主要分为<font color=#3eaf7c>系统错误</font>和<font color=#3eaf7c>程序员错误</font>，系统错误包括请求超时，系统内存不足，远程连接服务失败等等，一般需要搭配系统监控等辅助软件解决。而程序员错误产生的原因比较复杂，比如咋异步调用的时候没有使用回调，无法读取`undefined`对象的属性，在高并发的场合使用了同步阻塞代码等等，但是这些错误可以通过<font color=#CC99CD>书写合适的错误处理代码，启动日志服务，记录错误</font>的方法来修改和避免错误，下面我们来举个例子说明怎么书写合适的错误处理代码：
```javascript
const fs = require('fs')
function readJSON(filePath,callback) {
  fs.readFile(filePath, function(err,data){
    callback(JSON.parse(data))
  })
}
```
上面这种错误的示例告诉我们有两种错误需要我们通过书写合适的代码去监控和处理，分别是<font color=#3eaf7c> 回调函数中错误对象err </font>和<font color=#3eaf7c> 运行时错误 </font>，而我们的解决方法也很简单：
+ <font color=#CC99CD>模块应该暴露错误优先的回调接口</font>：或者说我们在回调函数中应该先考虑错误对象`err`存在的情况 
+ <font color=#CC99CD>多去增加异常捕获的写法</font>：按照程序一定会出错的方向去考虑怎么写异常捕获，多使用`try-catch`和短路操作运算符来避免错误发生导致程序奔溃的情况

然后我们来看上面的例子会发生什么错误，首先没有对`err`进行错误处理，导致如果`err`对象存在的时候，`data`就是`null`,而`JSON.parse`无法将字符串转化成为对象的时候就会抛出异常，所以我们既要对回调函数当中的错误对象优先处理，还要考虑程序本身可能会发生的运行时错误：
```javascript
const fs = require('fs')
function readJSON(filePath,callback) {
  fs.readFile(filePath, function(err,data){
    // 优先处理回调函数中的err对象
    if(err) {
      return callback(null)
    }
    // 使用try-catch捕获JSON解析的错误
    try {
      parseJson = JSON.parse(data)
    } catch (error) {
      return callback(error)
    }
    // 一切正常的时候我们直接调用回调函数
    return callback(parseJson)
  })
}
```

### 2. EventEmitter
**1. EventEmitter入门**

事件模块是`Node.js`内置的对观察者模式的实现，通过`EventEmitter`属性提供一个构造函数，这个构造函数的示例中具有两个常用的方法，其中`on`方法可以用来监听指定事件，并处罚回调函数，另外一个`emit`方法可以用来发布事件。我们来看一个简单的代码：
```javascript
const EventEmitter = require('events')
const observer = new EventEmitter()

observer.on('topic', function () {
  console.log('topic has occured! ')
})

function main() {
  console.log('start')
  observer.emit('public topic')
  console.log('end')
}
main() // start; topic has occured ; end
```
`EventEmitter`可以理解为`发布/订阅`模式，`topic`是主题，`observer`首先通过`on`方法进行注册，对`topic`事件进行订阅，当`observer`调用`emit`方法时，所有通过`on`注册该`topic`事件的回调函数都会被调用。上述代码也表明，`EventEmitter`对象的事件触发和监听是同步的，即只有在事件的回调函数是异步的情况下，函数`emit`才会被触发执行

**2. EventEmitter相关用法**

`events`模块只提供了一个对象：`events.EventEmitter`，而`EventEmitter`的核心部分就是对事件触发和事件监听功能的封装，遇到错误时，会触发`error`事件，当增加一个监听者的时候，会触发`newListener`事件，移除一个监听者会触发`removeListener`事件，总之该对象提供了很多方法和属性，具体请查看[官网](http://nodejs.cn/api/events.html#events_event_newlistener)

`Node.js`允许同一个事件最多指定10个回调函数，可以通过`.setMaxListeners(20)`或者`.setMaxListeners(Infinity)`

`once`方法回调函数只会被触发一次，而在`on`方法当中会被触发多次，而且执行该方法会返回一个`EventEmitter`对象，因此可以链式加载监听函数

获取监听器信息是通过`.listeners`方法实现的，改方法接受一个事件名称作为参数，返回由该事件所有回调函数组成的数组

### 3. 风格选择
通过上述我们对`callback`和`EventEmitter`写法的分析可以看出：
+ <font color=#3eaf7c>采用回调函数的写法，代码可读性很强，是参数同步语义化的传统思路</font>
+ <font color=#3eaf7c>EventEmitter写法语义更清晰，可以帮助学习者非常容易理解异步原理</font>

但是要注意，两种写法都能实现相同的功能，现实当中选择什么样的风格也许取决于个人爱好或者公司规定，但是从单纯使用的角度来讲：<font color=#CC99CD> API推荐使用错误优先（callback）的回调方式，和Node.js SDK风格保持一致是最好的。但是在同一个对象当中，使用EventEmitter解耦可以合理利用集成，使局部代码可读性更强 </font>

## 更好的异步流程
这一小节的内容非常多，我们会在下面的两个章节[异步流程初探](https://www.taopoppy.cn/node/three_asyncPreliminary.html)和[异步流程重点解析](https://www.taopoppy.cn/node/three_asyncDepth.html)当中深刻讲解异步的东西。