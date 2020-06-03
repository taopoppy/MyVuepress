# 服务端渲染概述

主流的单页面应用`vue`、`react`都是客户端渲染技术，也就是俗称的<font color=#DD1144>CSR</font>,这种会带来两个普遍的问题：
+ <font color=#9400D3>首屏展示(TTFP)时间过长</font>
+ <font color=#9400D3>网站的SEO搜索效果都很差</font>

所以关于主流的`SSR`框架都有<font color=#DD1144>NEXT.js(react)</font>和<font color=#DD1144>NUXT.js(vue)</font>,但是使用别人的框架不算什么本事，我们希望自己能够搞出一个`SSR`框架，实现原理的真正熟知。我们整个要解决的问题有下面这些：
+ <font color=#1E90FF>搭建React SSR框架，解决CSR问题</font>
+ <font color=#1E90FF>在框架中如何实现同构</font>
+ <font color=#1E90FF>框架中路由机制的实现</font>
+ <font color=#1E90FF>框架与Redux的融合</font>
+ <font color=#1E90FF>框架作为中间层的职能处理</font>
+ <font color=#1E90FF>细节调优</font>
+ <font color=#1E90FF>样式相关的Webpack配置</font>
+ <font color=#1E90FF>框架SEO特性优化</font>
+ <font color=#1E90FF>预渲染技术介绍</font>

## 什么是服务端渲染
我们首先创建一个`server`文件件，使用`npm init`创建`package.json`文件，然后下载`express`：
```javascript
npm install express --save --registry=https://registry.npm.taobao.org
```
然后创建`app.js`，内容如下：
```javascript
// app.js
var express = require('express')
var app = express()

app.get('/',function (req,res) {
	res.send(
		`<html>
			<head>
				<title>hello</title>
			</head>
			<body>
				<h1>first lesson</h1>
				<p>hello world</p>
			</body>
		</html>`
	)
})

var server = app.listen(3000, function() {
	var host = server.address().address
	var port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)
})
```
这就是一个最简单的`Node`的`http`的服务器，使用`node app.js`即可以启动整个服务器，然后在浏览器中打开`localhost:3000`就能看到内容了。

这种页面渲染的方式就是<font color=#DD1144>服务端渲染</font>，<font color=#9400D3>服务端渲染的本质就是页面显示的内容是服务器端生产出来的</font>，它的最大的特性页面上的内容全部都是在服务端上就已经做好了，浏览器拿到只负责显示而已。

## 什么是客户端渲染
我们再通过`create-react-app client`来创建一个`react`的项目，然后使用`npm start`来启动项目，你会在浏览器发现是有内容的，但是当你打开源代码你会发现实际上页面显示的东西并不存在于源代码当中，而是源代码通过加载一个`js`文件，通过`javascript`来向空的页面上添加内容。

所以<font color=#9400D3>客户端渲染的本质就是浏览器上的页面上的内容是通过javascript代码执行生产出来的，而javascript执行在客户端，所以称为客户端渲染</font>

## 客户端渲染的优劣
在前后端分离的过程当中，客户端渲染的优势很明显，
+ <font color=#DD1144>前端负责渲染页面，后端负责实现接口，各自干好各自的事情，对开发效率有极大的提升</font>

但是客户端的劣势也极其明显：
<img :src="$withBase('/react_ssr_csr_ssr.png')" alt="">

+ <font color=#DD1144>SSR的请求流程很简单，就是请求服务器，服务器返回完整的html文件，浏览器直接显示即可，但是CSR浏览器拿到的是一个空的html和一堆js文件，所以浏览器要想服务器重新请求这些js文件并且下载，下载好了还要执行，js文件执行的就是react代码，react代码运行完毕用户才能看到完整的页面</font>

+ <font color=#1E90FF>对比之下，CSR用户看到页面要经历的时间更长，就是因为时间都花费在了下载js文件和执行js文件，导致首屏加载时间过长</font>

+ <font color=#1E90FF>同时正是因为页面的DOM结构都是由js渲染出来的，对SEO不友好，因为搜索引擎的爬虫只认识html上的内容，不认识js的内容，所以如果是客户端渲染的网页，爬虫爬的是空的html文件，当然无法给你好的排名</font>