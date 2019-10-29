#  实战技术预研 - 通信

## http协议概述
其实`http`作为协议真正去讲的话会有很多东西，这里我们只会用最简单的例子帮助你理解概念，在网络5层模型中，`http`是属于应用层的一种协议，举个最简单的例子，如下：
<img :src="$withBase('/node_howtoknow_http.png')" alt="http">

理解`http`的本质和在整个网络传输层的位置，我们就可以使用上面的这个比喻，<font color=#DD1144>一封信是由信封和信的内容组成，这就好比一个网页用http协议打包成了一个网络数据包</font>，通过层层传递到了收信人手里, <font color=#DD1144>收信人拆开信封，就好比把http数据包打开然后取出里面的网页</font>，这个例子中最形象的比喻莫过于信封的大小，还有信封上的的联系人，地址，等等都好比是`http`的头部，而`http`的身体部分就好比信的内容。

那么一个网页，就包含两次`HTTP`包交换:
+ <font color=#1E90FF>浏览器向HTTP服务器发送请求HTTP包</font>
+ <font color=#1E90FF>HTTP服务器向浏览器返回HTTP包</font>    
如果用上面的图示来表示，就是前者给后者写了一封信，后者又给前者写了一封信，这就是一次
`http`请求的过程。

那么http服务器要做什么事情：
+ <font color=#DD1144>解析进来的http请求报文</font>
+ <font color=#DD1144>返回对应的http返回报文</font>

## 简单的http服务
```javascript
const http = require('http')
const fs = require('fs')

http.createServer(function(req,res) {
  if(req.url === '/favicon.ico') {
    res.writeHead(200);
    res.end();
    return 
  }
  fs.createReadStream(__dirname + '/index.html').pipe(res)
}).listen(3000)

```
这个基本就是一个最简单的`http`的服务了，那么相关的在`npm`上面有个<font color=#1E90FF>httpserver</font>这个包，可以快速的在某个目录下面创建一个静态的资源服务器，这样，该目录下面的文件图片访问都可以以`http`协议的方式打开，而不是`file`协议的方式。