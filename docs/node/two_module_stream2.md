# 核心模块 - stream（二）

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

## 逐行读取readline