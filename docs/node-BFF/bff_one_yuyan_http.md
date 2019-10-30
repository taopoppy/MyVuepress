#  实战技术预研 - http

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

## express框架
在`web`开发当中，比较老牌且经典的框架就是`express`框架，那么分析一个框架，我们首先要去看一下这个框架的特点，然后来知道它解决的什么问题，在`npm`官网上`express`的特点分析是这样的：
+ <font color=#CC99CD>Robust routing</font>（<font color=#3eaf7c>强大的路由系统</font>）
  + 因为当一个服务器接收到数据包的时候要去处理，但是服务器有很多的控制器或者处理单元，服务器要根据数据包中提供的`url`来分配到不同的控制器中处理，这个分发的过程就叫做路由。
+ <font color=#CC99CD>Focus on high performance</font>（<font color=#3eaf7c>专注于高性能</font>）
+ <font color=#CC99CD>Super-high test coverage</font>（<font color=#3eaf7c>超高的测试覆盖</font>）
+ <font color=#CC99CD>HTTP helpers (redirection, caching, etc)</font>（<font color=#3eaf7c>http辅助功能强大</font>）
  + 那么`express`还同时实现了很多强大的`http`功能，比如说重定向，服务器会返回一个302的状态码，同时会返回一个`location`的头部字段，告诉浏览器你访问的当前网页已经换到新的地址上去了。
  + 关于304缓存策略也是前端常见的一个问题，那么`express`也会将304相关的功能快速帮助你实现
+ <font color=#CC99CD>View system supporting 14+ template engines</font>（<font color=#3eaf7c>模板引擎支持的种类繁多</font>）
+ <font color=#CC99CD>Content negotiation</font>（<font color=#3eaf7c>内容协商</font>）
  + 表面是内容协商，其实更准确的是内容格式的规定，因为在客户端会通过`content-request`等某些字段来规定双方包的数据格式，比如`text/html`、`json/application`等等
+ <font color=#CC99CD>Executable for generating applications quickly</font>（<font color=#3eaf7c>通过脚手架快速构建</font>） 


`express`洋葱模型的问题：<font color=#DD1144>因为next()是个普通的函数，是个阻塞的过程</font>，那么我们举个例子来看一下：
```javascript
const express = require('express')
const app = express()

let num = 0

app.get('/game',function(req,res,next){
  if(num > 3) {
    res.status(500)
    res.send('你请求超过3次了')
    return 
  }

  next()

  if(res.isVisit){
    ++num
    console.log('num',num)
  }
},function(req,res){
  let random = Math.random()
  console.log('random',random)
  if(random > 0.1) {
    setTimeout(() => {
      res.status(200)
      res.send('你请求了一次，看控制台')
      res.isVisit = true
    }, 1000);
  }
})

app.get('/',function(req,res) {
  res.status(200)
  res.send('hello')
})

app.listen(3000)
console.log('3000 port is running')
```
理论上，我们写上面这段代码的意思是我们连续访问4次，`num`的结果为4，那么服务器就会返回500,然后在浏览器显示`你请求的超过3次了`，可是并没有生效，原因就是在`next`中间件是个普通的函数，且`setTimeout`是个异步函数，所以导致`setTimeout`的回调函数是在下一个事件循环当中执行的，而判断`res.isVisit`的代码在第一个事件循环就执行了，所以`if(res.isVisit)`永远比`res.isVisit`先执行，导致`num`永远不能增加，所以也永远执行不到`num > 3`的代码。

所以这样的洋葱模型是由缺陷的，我们下面就会学习新一代的web框架`koa2`

## koa2框架
`koa`相对于`express`框架主要有3个比较显著的特点就是：
+ <font color=#DD1144>功能完善的中间件机制</font>
  + 天生支持`async await`,使得中间件在异步的情况下程序得以正确的按照逻辑执行
+ <font color=#DD1144>请求响应写法更加简单</font>
+ <font color=#DD1144>不绑定任何中间件</font>

我们这次使用`koa`当中完善的中间件的机制来重写我们之前`express`那个例子：
```javascript
const koa = require('koa')
const app = new koa()
const mount = require('koa-mount')

let num = 0

const gameKoa = new koa()
app.use(mount('/game',gameKoa))

gameKoa.use(async function (ctx,next){
  if(num > 3) {
    ctx.status = 500
    ctx.body = '你请求超过3次了'
    return 
  }

  await next()

  if(ctx.isVisit){
    console.log('num',num)
    num++ 
  }
})

gameKoa.use(async function (ctx){
  let random = Math.random()
  console.log('random',random)
  if(random > 0.1) {
    await new Promise((resolve)=> {
      setTimeout(() => {
        ctx.status =200
        ctx.body = '你请求了一次，看控制台'
        ctx.isVisit = true
        resolve()
      }, 1000);
    })
  } else {
    ctx.status = 200
    ctx.body = '这次不算'
  }
})

app.use(mount('/',(ctx) => {
  ctx.status = 200
  ctx.body = 'hello'
}
))

app.listen(3000)
console.log('3000 port is running')
```
使用`koa`中的中间件，通过使用`async await`来修饰中间件后，遇到异步的问题就能完美解决