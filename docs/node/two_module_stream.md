# 核心模块 - stream

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
关于流转过程和实例详解，我们会下面专门来用一个大节说明

## 流转和应用概述
在介绍`stream`的流转过程之前我们先了解一下流转过程中最重要的三个东西：
+ <font color=#1E90FF>data事件</font>: 用来监听stream数据的流入
+ <font color=#1E90FF>end事件</font>：用来监听stream数据输入的完成
+ <font color=#1E90FF>pipe方法</font>: 用来做数据流转

<font color=#1E90FF>**① stream从哪里来-soucre**</font>

stream的常见来源方式有三种：

+ <font color=#DD1144>从控制台输入</font> 
+ <font color=#DD1144>http请求中的request</font>
+ <font color=#DD1144>读取文件</font>

这里先说一下从控制台输入这种方式，看一段`process.stdin`的代码：
```javascript
process.stdin.on('data', function (chunk) {
    console.log('stream by stdin', chunk)  // stream by stdin <Buffer 6b 6f 61 6c 61 6b 6f 61 6c 61 0a>
    console.log('stream by stdin', chunk.toString()) // stream by stdin koalakoala
})
```
然后从控制台输入任何内容都会被`data`事件监听到，`process.stdin`就是一个`stream`对象,`data`
是`stream`对象用来监听数据传入的一个自定义函数，
(说明： `stream`对象可以监听"data","end","opne","close","error"等事件。`node.js`中监听自定义事件使用`.on`方法，例如`process.stdin.on(‘data’,…)`, `req.on(‘data’,…)`,通过这种方式，能很直观的监听到`stream`数据的传入和结束)

<font color=#1E90FF>**② 连接水桶的管道-pipe**</font>

从水桶管道流转图中可以看到，在`source`和`dest`之间有一个连接的管道`pipe`,它的基本语法是 <font color=#DD1144>source.pipe(dest)</font> ，`source`和`dest`就是通过`pipe`连接，让数据从`source`流向了`dest`。

<font color=#1E90FF>**③ stream到哪里去-dest**</font>

stream的常见输出方式有三种：
+ <font color=#DD1144>输出控制台</font> 
+ <font color=#DD1144>http请求中的response</font> 
+ <font color=#DD1144>写入文件</font> 

我们上面借助控制台输入输出来讲解了`stream`的流转过程，可是在实际应用场景中，`http`请求和文件操作当中使用`stream`的频率异常的频繁。原因是这样：

<font color=#DD1144>http请求和文件操作都属于IO ，即 stream 主要的应用场景就是处理IO ，这就又回到了stream的本质 —— 由于一次性IO操作过大，硬件开销太多，影响软件运行效率，因此将IO分批分段操作，让数据一点一点的流动起来，直到操作完成</font> 。

所以我们下面就来详细介绍一下两个经典的`stream`应用场景：

## http中的stream
### 1. get请求
```javascript
const http = require('http')
const server = http.createServer(function (req, res) {
  const method = req.method; // 获取请求方法
  if (method === 'GET') { // get 请求
      const fileName = path.resolve(__dirname, 'data.txt');
      let stream = fs.createReadStream(fileName);
      stream.pipe(res); // 将 res 作为 stream 的 dest
  }
  // 其他method暂时忽略
});
server.listen(8000);
```
从上面例子可以看出，对`response`使用`stream`特性能提高性能。因此，在`nodejs`中如果要返回的数据是经过`IO`操作得来的，例如上面例子中读取文件内容，可以直接使用<font color=#DD1144>stream.pipe(res)</font> ,毕竟`response`也是一个`stream`对象，可以作为参数传入`pipe`当中，而不要再用`res.end(data)`了。

这种应用的实例应该比较多，主要有两种场景：
+ <font color=#1E90FF>使用 node.js 作为服务代理，即客户端通过 node.js 服务作为跳板去请求其他服务，返回请求的内容</font>
+ <font color=#1E90FF>使用 node.js 做静态文件服务器，直接返回静态文件</font>

### 2. post请求
`web server`接收`http`请求肯定是通过`request`，而`request`接收数据的本质其实就是`stream`。所以
看似是`request`接收数据，但是在服务端的角度来说，`request`就是产生数据的`source`,那么`soucre`类型的`stream`对象都能监听`data`,`end`事件。分别触发数据接收和数据接收完成的通知，所以代码可以如下进行改造：
```javascript
var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function (req, res) {
    var method = req.method; // 获取请求方法
    if (method === 'POST') { // 暂只关注 post 请求
        req.on('data', function (chunk) {
            // 接收到部分数据
            console.log('chunk', chunk.toString().length);
        });
        req.on('end', function () {
            // 接收数据完成
            console.log('end');
            res.end('OK');
        });
    }
    // 其他请求方法暂不关心
});
server.listen(8000);
```
总结一下，`request`和`response`一样，本身也是一个`stream`对象，可以用`stream`的特性，那肯定也能提高性能。两者的区别就在于，`request`是`source`类型的、是`stream`的源头，而`response`是 dest 类型的、是`stream`的目的地。

这里再多举个例子，比如我们现在要将`node.js`接收到的`post`请求的数据写入文件，一般的小伙伴会这样写：
```javascript
var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function (req, res) {
    var method = req.method; // 获取请求方法
    if (method === 'POST') { // 暂只关注 post 请求
        var dataStr = '';
        req.on('data', function (chunk) {
            // 接收到数据，先存储起来
            var chunkStr = chunk.toString()
            dataStr += chunkStr
        });
        req.on('end', function () {
            // 接收数据完成，将数据写入文件
            var fileName = path.resolve(__dirname, 'post.txt');
            fs.writeFile(fileName, dataStr)

            res.end('OK');
        });
    }
    // 其他请求方法暂不关心
});
server.listen(8000);
```
这种写法也是对的，但是还没有真正理解`stream`，当我们学习了文件操作中的`stream`，你可能就hi写出更简单的代码，比如说下面这种：
```javascript
var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function (req, res) {
    var method = req.method; // 获取请求方法
    if (method === 'POST') { // 暂只关注 post 请求
        var fileName = path.resolve(__dirname, 'post.txt');
        var writeStream = fs.createWriteStream(fileName)
        req.pipe(writeStream)
        req.on('end', function () {
            // 接收数据完成
            res.end('OK');
        });
    }
    // 其他请求方法暂不关心
});
server.listen(8000);
```

和`get`请求使用`stream`的场景类似，`post`请求使用`stream`的场景，主要是用于将接收的数据直接进行 `IO`操作，例如：
+ <font color=#1E90FF>将接受的数据直接存储为文件</font>
+ <font color=#1E90FF>将接受的数据直接post给其他的web server</font>

## fs中的stream
用`stream`读写文件其实前面章节都有多处用到，这里在统一整理一下：
+ <font color=#1E90FF>可以使用fs.createReadStream(fileName)</font>来创建读取文件的`stream`对象
+ <font color=#1E90FF>可以使用fs.createWriteStream(fileName)</font>来创建写入文件的`stream`对象

读取文件的`stream`对象，对应的就是`source`，即数据的来源。写入文件的`steram`对象对应的就是 `dest` ，即数据的目的地。下面我们分别用普通的读写和使用`stream`实现一个文件拷贝的功能，并通过监控工具<font color=#DD1144>memeye</font>来监控`node.js`内存占用的情况
```javascript
const fs = require('fs')
const path = require('path')
const memeye = require('memeye')
memeye()
function copy(num) {
  const fileName1 = path.resolve(__dirname,'data.txt')// 42kb左右
  fs.readFile(fileName1,function(err,data) {
    if(err) {
      console.log('读取出错',err.message)
      return 
    }
    var dataStr = data.toString()

    var fileName2 = path.resolve(__dirname,'data-bak.txt')
    fs.writeFile(fileName2,dataStr,function(err) {
      if(err){
        console.log('写入出错',err.message)
        return 
      }
      console.log(`拷贝第${num}次成功`)
    })
  })
}

setTimeout(()=> {
  for (let i = 0; i < 100; i++) {
    copy(i)
  }
},5000)
```
启动文件，在浏览器打开`localhost:23333/`,可以看到<font color=#DD1144>heapUsed</font>在13.26M左右，<font color=#1E90FF>heapTotal</font>在30M左右，<font color=#3eaf7c>rss</font>在40M左右
```javascript
const fs = require('fs')
const path = require('path')
const memeye = require('memeye')
memeye()
function copy(num) {
  var fileName1 = path.resolve(__dirname,'data.txt') // 42KB左右
  var fileName2 = path.resolve(__dirname,'data-bak.txt')
  // 读取文件的stream对象
  var readStream = fs.createReadStream(fileName1)
  // 写入文件的stream对象
  var writeStream = fs.createWriteStream(fileName2)
  // 通过pipe实现数据的流转
  readStream.pipe(writeStream)

  // 监听数据完成的情况
  readStream.on('end',function () {
      console.log('拷贝完成');
  })
}

setTimeout(()=> {
  for (let i = 0; i < 100; i++) {
    copy(i)
  }
},5000)
```
启动文件，在浏览器打开`localhost:23333/`,可以看到<font color=#DD1144>heapUsed</font>在6.4M左右，<font color=#1E90FF>heapTotal</font>在9.23M左右，<font color=#3eaf7c>rss</font>在30M左右

总结：<font color=#1E90FF>所有执行文件操作的场景，都应该尝试使用 stream ，例如文件的读写、拷贝、压缩、解压、格式转换等。除非是体积很小的文件，而且读写次数很少，性能上被忽略。<font color=#DD1144>如果是体积很大或者读写次数很多的情况下，建议使用stream来优化性能</font> </font>

## 逐行读取readline
用`stream`操作文件，会来带很大的性能提升。但是原生的`stream`却对“行”无能为力，它只是把文件当做一个数据流、简单粗暴的流动。很多文件格式都是分行的，例如`csv`文件、日志文件，以及其他一些自定义的文件格式。

`node.js`提供了非常简单的按行读取的API —— <font color=#DD1144>readline</font>，它本质上也是`stream`，只不过是以“行”作为数据流动的单位。本节将结合一个分析日志文件的案例，讲解 `readline`的使用。
```javascript
const fs = require('fs')
const path = require('path')
const readline = require('readline')

var fileName = path.resolve(__dirname,'data.txt')
var readStream = fs.createReadStream(fileName)
// 创建readline对象
var readlineObj = readline.createInterface({
  input: readStream
})

readlineObj.on('line',(lineDate)=> {
  console.log(lineDate)
  console.log('---- line ----');
})

readlineObj.on('close',()=> {
  console.log('end');
})
```
对`readline`最常见的使用应该是<font color=#DD1144>日志的逐行分析</font>了，比如我们要从一个10万行的日志中去找一个`2018-10-23 14:00`这一分钟，对`user.html`的访问次数，我们就应该这样做：
```javascript
let num = 0
// 逐行读取日志内容，如果有包含`2018-10-23 14:00`和`user.html`的字符串就表示
// 在这一分钟有人访问了user.html,我们就记录一次
readlineObj.on('line'，function(lineData){
    if(lineData.indexOf('2018-10-23 14:00')>=0 && lineData.indexOf('user.html') >= 0){
        num++
    }
})

// 监听读取完成
readline.on('close',()=> {
    console.log('num',num)
})
```
借用这个简单的例子来演示`readline`的使用以及使用场景，其实日常工作中情况会更加复杂，不过再复杂的场景选择`readline`做逐行分析一定是不会错的。<font color=#DD1144>方向选对了很重要，选择大于努力</font>

## Stream和Buffer
到这里已经讲完了`stream`在网络`IO`和文件`IO`的基本使用，就像一开始介绍的管道换水的例子，一点一点的将数据流出来。那么，每次流动的这一点数据到底是什么（即之前代码示例中的chunk变量）我们现在就来聊一聊两者的关系：

半个世纪之前，现代计算机之父 冯.诺依曼 提出了“冯.诺依曼结构”，其中最核心的内容之一就是：<font color=#DD1144>计算式使用二进制形式进行存储了计算</font>。这种设计一直沿用至今，而且在未来也会一直用下去，除非真的出现了传说中的量子计算以颠覆现代计算机结构。

计算机内存由若干个存储单元组成，每个存储单元只能存储 0 或者 1 （因为内存是硬件，计算机硬件本质上就是一个一个的电子元件，只能识别充电和放电的状态，充电代表 1 ，放电代表 0 ，可以先这么简单理解），即<font color=#DD1144>二进制单元（英文叫 bit）</font>。但是这一个单元所能存储的信息太少，因此<font color=#DD1144>约定将8个二进制单元为一个基本存储单元，叫做字节（英文是 byte）</font>。一个字节所能存储的最大整数就是 2^8=256,也正好是16^2,因此也常常使用两位的16进制数字表示一个字节
+ <font color=#DD1144>二进制单元（0、1）</font>-> <font color=#1E90FF>bit</font> 
+ <font color=#DD1144>基本存储单元（00000000）-> 8个二进制单元 </font>-> <font color=#1E90FF>byte</font> -> <font color=#1E90FF>字节</font>

二进制是计算机最底层的数据格式，也是一种通用格式。<font color=#DD1144>计算机中的任何数据格式，字符串、数字、视频、音频、程序、网络包等，在最底层都是用二进制来进行存储</font> 。这些高级格式和二进制之间，都可通过固定的编码格式进行相互转换。例如，C 语言中`int32`类型的十进制整数（无符号的），就占用`32 bit`即`4 byte` ，十进制的3用`int32`表示，对应的二进制就是`00000000 00000000 00000000 00000011`，字符串也是同理，可以根据`ASCII`编码规则或者`unicode`编码规则等等和二进制进行相互转化。

`node`怎么表示二进制呢？答案就是`Buffer`
```javascript
var str = '学习 nodejs stream'
var buf = Buffer.from(str, 'utf-8') // 注意：node 版本 < 6.0 的使用 var buf = new Buffer(str, 'utf-8')
console.log(buf) // <Buffer e5 ad a6 e4 b9 a0 20 6e 6f 64 65 6a 73 20 73 74 72 65 61 6d>
console.log(buf.toString('utf-8'))  // 学习 nodejs stream

var readStream = fs.createReadStream('./file1.txt')
readStream.on('data', function (chunk) {
    console.log(chunk instanceof Buffer) // true
    console.log(chunk) //  <Buffer 72 55 73 61 8c ...>
})
```
可以看到`stream`中流动的数据就是`Buffer`类型，就是二进制。因此，在使用`stream chunk`的时候，需要将这些二进制数据转换为相应的格式。`stream`中为何要“流动”二进制格式的数据呢？
+ <font color=#1E90FF>回答这个问题得再次考虑一下 stream 的设计目的 —— 为了优化 IO 操作。无论是文件 IO 还是网络 IO ，其中包含的数据格式是未可知的，如字符串、音频、视频、网络包等。即便都是字符串，其编码规则也是未可知的，如 ASC 编码、utf-8 编码。再这么多未可知的情况下，只能是以不变应万变，直接用最通用的二进制格式，谁都能认识。而且，用二进制格式进行流动和传输，是效率最高的。</font> 

按照上面的说法，无论用`stream`读取文件还是`fs.readFile`读取文件，读出来的都应该是二进制格式？—— 答案是正确的。

## stream的种类

### 1. readable stream
可读流是对提供数据的来源的一种抽象。

可读流的例子包括：<font color=#1E90FF>客户端的HTTP响应</font>、<font color=#1E90FF>服务器的HTTP请求</font>、<font color=#1E90FF>fs的读取流</font>、<font color=#1E90FF>zilb流</font>、<font color=#1E90FF>crypto流</font>、<font color=#1E90FF>TCP socket</font>、<font color=#1E90FF>子进程stdout与stderr</font>、<font color=#1E90FF>process.stdin</font>，因为这些可读流都实现了`stream.Readable`类定义的接口

具体的相关方法和监听事件我推荐你去[官网](http://nodejs.cn/api/stream.html#stream_readable_streams)去看看，在这里罗列出来没有啥意义
### 2. writeable stream
可写流是对数据要被写入的目的地的一种抽象

可写流的例子包括：<font color=#1E90FF>客户端的HTTP响应</font>、<font color=#1E90FF>服务器的HTTP请求</font>、<font color=#1E90FF>fs的读取流</font>、<font color=#1E90FF>zilb流</font>、<font color=#1E90FF>crypto流</font>、<font color=#1E90FF>TCP socket</font>、<font color=#1E90FF>子进程stdout与stderr</font>、<font color=#1E90FF>process.stdin</font>，因为这些可写流都实现了`stream.Writable`类定义的接口

具体的相关方法和监听事件我推荐你去[官网](http://nodejs.cn/api/stream.html#stream_writable_streams)去看看

### 3. duplex stream
```javascript
var fs = require('fs')
var zlib = require('zlib')
var readStream = fs.createReadStream('./data.txt')
var writeStream = fs.createWriteStream('./data-bak.txt')
readStream.pipe(zlib.createGzip()).pipe(writeStream)
```
`pipe`的严谨用法要遵循下面三个原则：
+ <font color=#DD1144>调用pipe的对象必须是readable stream或者duplex stream这样的具有读取数据的功能的流对象</font>
+ <font color=#DD1144>pipe中的参数对象必须是writeable stream或者duplex stream这样的具有写入数据的功能的流对象</font>
+ <font color=#DD1144>pipe支持链式调用</font>

### 4. transform stream
转换流（Transform）是一种`Duplex`流，但它的输出与输入是相关联的,而且一般只有触发了写入操作时才会进入`_transform`方法中。 与`Duplex`流一样， `Transform`流也同时实现了`Readable`和`Writable`接口。


**参考资料**

1. [想学Node.js，stream先有必要搞清楚（入门）](https://juejin.im/post/5d25ce36f265da1ba84ab97a)
2. [两小时学会 Node.js stream（入门）](http://www.imooc.com/read/8/article/51)
3. [七天学不会nodejs——流（入门）](https://juejin.im/post/5b54a7f95188251afc257dac)
4. [渴望力量吗？少年！流的原理（原理）](https://juejin.im/post/5b483255f265da0f521ddf6f)
5. [深入理解 Node Stream 内部机制（原理）](https://www.barretlee.com/blog/2017/06/06/dive-to-nodejs-at-stream-module/)
6. [Node.js Stream - 基础篇](https://tech.meituan.com/2016/07/08/stream-basics.html) 
7. [Node.js Stream - 进阶篇](https://tech.meituan.com/2016/07/15/stream-internals.html)
8. [Node.js Stream - 实战篇](https://tech.meituan.com/2016/07/22/stream-in-action.html)
9. [[译] 你所需要知道的关于 Node.js Streams 的一切](https://mp.weixin.qq.com/s/huPERCsDnDpk6jRnbD6n-Q)