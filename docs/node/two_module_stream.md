# 核心模块 - stream（一）

## Stream概述
### 1. 什么是stream
理解什么是`stream`我们一定要到官网去看看：
<font color=#1E90FF>A stream is an abstract interface for working with streaming data in Node.js. The stream module provides an API for implementing the stream interface.There are many stream objects provided by Node.js. For instance, a request to an HTTP server and process.stdout are both stream instances.Streams can be readable, writable, or both. All streams are instances of EventEmitter.The stream module is useful for creating new types of stream instances. It is usually not necessary to use the stream module to consume streams.</font>

上述的意思就是：在`node`当中`stream`是一种处理流数据的抽象接口，`stream`模块提供了一系列实现流的API,在`node`当中提供了很多关于流的对象，比如 `http`服务器的请求和`process.stdout`标准输出都是流的实例，流失可读的，可写的，同时也可以是可读写的，所有的流都是`EventEmitter`的实例。下面有一幅图来表示: <font color=#DD1144>stream是如何让数据流动起来的</font>：
<img :src="$withBase('/node_stream_introduce.png')" alt="stream是什么">

<font color=#CC99CD>stream不是node.js独有的概念，而是一个操作系统最基本的操作方式，只不过node.js有API支持这种操作方式。linux命令的|就是stream</font>。

### 2. 为什么要使用stream
暂不管编程的原因，先分析一下上图中换水的例子。如果没有中间的管道，而是直接抱起`source`水桶往 dest 水桶中倒，那肯定得需要一个力量特别大的人（或者多个人）才能完成。而有了这个管道，小孩子都可以很轻松的完成换水，而且管道粗细都可以最终完成，只不过是时间长短的问题。即，有管道换水需要的力量消耗非常少，不用管道换水消耗力量很大，这个应该很好理解。

其实这里所说的“力量”，对应到计算机编程中就是<font color=#DD1144>硬件的性能</font> ，这包括 CPU 的运算能力，内存的存储能力，硬盘和网络的读写速度（硬盘存储能力暂不考虑）。将上面倒水的例子对应到下面两个例子当中你就明白了：

<font color=#1E90FF>**① 在线看电影**</font>

`source`就是服务器端的视频，`dest`就是你自己的播放器（或者浏览器中的 flash 和 h5 video）。到这里大家应该一下子能明白，目前看电影的方式就是如同用管道换水一样，一点一点的从服务端将视频流动到本地播放器，一边流动一边播放，最后流动完了也播放完了。

那播放视频为何要使用这种方式？解决这个问题不妨考虑反证法，即不用管道和流动的方式，先从服务端加载完视频文件，然后再播放。这样导致最直观的问题就是，需要加载很长一段时间才能播放视频。其实这仅仅的表面现象，还有可能是视频加载过程中，因内存占用太多而导致系统卡顿或者崩溃。因为我们的网速、内存、CPU 运算速度都是有限的（而且还要多个程序共享使用），这个视频文件可能有几个 G 那么大。

<font color=#1E90FF>**② 读取大文件data的例子**</font>

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(function (req, res) {
    const fileName = path.resolve(__dirname, 'data.txt');
    fs.readFile(fileName, function (err, data) {
        res.end(data);
    });
});
server.listen(8000);
```
使用文件读取这段代码语法上并没有什么问题，但是如果`data.txt`文件非常大的话，到了几百M，在响应大量用户并发请求的时候，程序可能会消耗大量的内存，这样可能造成用户连接缓慢的问题。而且并发请求过大的话，服务器内存开销也会很大。这时候我们来看一下用`stream`实现:
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(function (req, res) {
    const fileName = path.resolve(__dirname, 'data.txt');
    let stream = fs.createReadStream(fileName);  // 这一行有改动
    stream.pipe(res); // 这一行有改动
});
server.listen(8000);
```
使用`stream`就可以不需要把文件全部读取了再返回，而是一边读取一边返回，数据通过管道流动给客户端，真的减轻了服务器的压力。

<font color=#1E90FF>**③ 总结**</font>

<font color=#DD1144>之所以用stream ，是因为一次性读取、操作大文件，内存和网络是“吃不消”的，因此要让数据流动起来，一点一点的进行操作,这其实也符合算法中一个很重要的思想 —— 分而治之</font>

### 3. stream的流转过程
关于流转过程和实例详解，我们会下面专门来用一个大节说明，详细请看[# 核心模块 - stream（二）](https://www.taopoppy.cn/node/two_module_stream2.html)

## stream的种类

**参考资料**

1. [想学Node.js，stream先有必要搞清楚](https://juejin.im/post/5d25ce36f265da1ba84ab97a)
2. [两小时学会 Node.js stream](http://www.imooc.com/read/8/article/51)
3. [七天学不会nodejs——流](https://juejin.im/post/5b54a7f95188251afc257dac)
4. [渴望力量吗？少年！流的原理](https://juejin.im/post/5b483255f265da0f521ddf6f)
5. [深入理解 Node Stream 内部机制](https://www.barretlee.com/blog/2017/06/06/dive-to-nodejs-at-stream-module/)
6. [Node.js Stream - 基础篇](https://tech.meituan.com/2016/07/08/stream-basics.html) 
7. [Node.js Stream - 进阶篇](https://tech.meituan.com/2016/07/15/stream-internals.html)
8. [Node.js Stream - 实战篇](https://tech.meituan.com/2016/07/22/stream-in-action.html)