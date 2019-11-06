# 实战页面 - 下载页

## 页面架构分析
实际对于一个项目的架构设计，可以从消息发送的路径走向，或者按照协议的路径进行设计，我们首先来设计一下下载页的架构，因为下载页是一个静态的网页，基本上就是一个浏览器和`Node-bff`层的交互：

<img :src="$withBase('/node_bff_xiazaiye_jiagoutu.png')" alt="下载页的架构图">

+ 浏览器和`Node-BFF`层建立TCP链接，发送`http`数据包
+ `Node-BFF`层的路由判断`http`数据包中的请求`url`,将数据包转发到负责下载页的逻辑单元去
+ 下载页的逻辑单元判断这个是静态页面，所以从`Node-BFF`层所在的这个机器上面使用`fs`模块读取静态页面并通过路由返回给浏览器（<font color=#DD1144>以上三步在上图由红色直线标注</font>）

+ 然后浏览器拿到这个页面，页面渲染才刚刚开始
+ 在静态页面当中有很多`css`或者`javascript`标签标注的文件，那么这些都属于一个个`http`链接
+ 比如某个`css`文件在当前域名下面某个文件中，那么浏览器依旧要请求到`Node-BFF`层中
+ 那么下载页的逻辑单元拿到这个请求发现这个是个静态资源的请求，那么会转发到另外一个专门处理`css`和`js`脚本的处理逻辑单元
+ 这个专门处理`css`和`js`的逻辑单元把静态文件返回给下载页的处理逻辑单元，再返回给路由，再返回给浏览器
+ 浏览器拿到这些静态`css`文件和`js`脚本文件才开始渲染（<font color=#3eaf7c>以上六步在上图由绿色直线标注</font>）


## 下载页的开发
```javascript
const koa = require('koa')
const mount = require('koa-mount')
const static = require('koa-static')
const fs = require('fs')

const app = new koa()

app.use(static(__dirname + '/source/'))

app.use(
  mount('/', async(ctx) => {
    ctx.body = fs.readFileSync(__dirname + '/source/index.html','utf-8')
  })
)

app.listen(3000)
```
可以看的出，下载页的开发很简单，几个中间件的使用我们在这里也不做太多的解释。

当我们写好的时候，我们访问的时候访问的`URL`如下：`localhost:3000/download/`（如果少了最后一个反斜杠，访问`localhost:3000/download`，就会造成css加载不成功的结果）
这里我们来把后面几个页面的访问地址都放在这里：
+ <font color=#3eaf7c>http://localhost:3000/download/</font>
+ <font color=#3eaf7c>http://localhost:3000/detail/?columnid=1</font>
+ <font color=#3eaf7c>http://localhost:3000/play/</font>
+ <font color=#3eaf7c>http://localhost:3000/list/</font>

所有实战的项目的源码地址：[https://github.com/geektime-geekbang/geek-nodejs/tree/master/chapter3](https://github.com/geektime-geekbang/geek-nodejs/tree/master/chapter3)