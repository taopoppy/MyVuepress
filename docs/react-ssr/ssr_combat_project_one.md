# 项目搭建流程


## 项目概述
### 1. 项目内容
在学习了一系列的服务端渲染的原理之后，我们希望通过实践来检验我们的学习效果，但是通常我们在工作当中是不可能手动去搭建一个`SSR`框架的，我们需要借助现有的好的框架来快速的开发项目，对于`react`服务端渲染毫无疑问要学习的就是<font color=#DD1144>next.js</font>这个同构框架。

学习完实战的内容，你会学习到：
+ <font color=#1E90FF>非常适合展示型的项目的next.js框架</font>
+ <font color=#DD1144>web界最广泛使用的第三方OAUuth授权体系</font>
+ <font color=#DD1144>React的新型开发模式React Hooks</font>
+ <font color=#DD1144>内存数据库Redis和Koa</font>

对于`next.js`这个同构框架有什么优势呢？
+ <font color=#1E90FF>完善的React项目架构，搭建轻松</font>
+ <font color=#1E90FF>自带数据同步策略，解决同构项目最大的难点</font>
+ <font color=#1E90FF>丰富的插件帮助我们增加各种功能</font>
+ <font color=#1E90FF>灵活的配置根据你的需求来自定义</font>

我们在整个项目的开发当中都将围绕下面这个流程图来一步一步前进，所以当整个项目开发完完毕，你就能深入的理解这个流程：
<img :src="$withBase('/react_nextjs_liucheng.png')" alt="next流程图">

### 2. 版本号
前端发展飞速，我们使用的这些包的版本号也在飞速变化，关于一个包的版本号`^aa.bb.cc`，我们需要知道：
+ <font color=#1E90FF>^表示自动在大版本的范围内更新小版本，比如在package.json当中写的^1.0.1，而npm install的时候发现已经有1.0.2,就会自动下载1.0.2，但是npm install的时候发现已经有2.0.1的时候，它是不会去自动更新的，因为大版本之间无法兼容</font>

+ <font color=#1E90FF>aa是大版本号，一般只有breaking changes的时候才会更新</font>
+ <font color=#1E90FF>bb是一般修复比较大的bug</font>
+ <font color=#1E90FF>cc则是一些细微的修改</font>

## nextjs和Koa

### 1. 创建next.js项目
创建一个`next.js`项目有两种方式，<font color=#1E90FF>手动创建</font>和<font color=#1E90FF>脚手架create-next-app创建</font>

<font color=#1E90FF>**① 手动创建**</font>

我们先来手动创建：创建一个`nextjs-project`的文件夹，然后`npm init`，接着我们下载依赖：
```javascript
yarn add react@16.8.3 react-dom@16.8.3 next@8.0.3
```
然后我们修改`package.json`：
```javascript
// package.json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "next", // 开发环境下自动编译，自动监听并生成页面，并且有hot module等webpack的功能
    "build": "next build", // 部署生产环境
    "start": "next start" // 启动正式服务
  },
}
```
现在在开发环境就可以通过`yarn dev`来启动项目,但是启动后会是404的页面，<font color=#1E90FF>我们接着创建pages/index.js</font>:
```javascript
// pages/index.js
export default () => <span>index</span>
```
+ <font color=#DD1144>在nextjs当中，所有的页面都会放在pages这个文件夹下面，这个是nextjs规定的，pages下面每个文件都对应的是一个页面</font>
+ <font color=#DD1144>而且我们不需要在书写jsx的地方引入React，这个nextjs在全局已经做过处理了</font>


<font color=#1E90FF>**② 脚手架创建**</font>

安装脚手架，利用脚手架创建项目：
```javascript
// 下载脚手架
npm install -g create-next-app

// 创建项目
npx create-next-app nextjs-project
```

### 2. next作为koa中间件
<font color=#1E90FF>**① nextjs自身带有服务器，只处理ssr渲染**</font>

<font color=#DD1144>使用 yarn dev 启动 nextjs 项目会自动启动一个 node 的服务，但是这个服务是只能处理把 pages 当中的文件编译成页面，然后根据路由返回对应的内容，也就是说在 pages 文件夹中的所有 js 文件都需要通过 react 渲染成为 html 字符串返回给浏览器，整个过程是 nextjs 帮助我们完成的。</font>

<font color=#1E90FF>**② 处理HTTP请求，返回响应**</font>

<font color=#DD1144>nextjs自带的服务器只处理页面请求和静态文件请求，诸如数据请求这种不属于nextjs要干的事情，所以我们需要koa来创建一个服务器来处理<font color=#9400D3>数据接口</font>、<font color=#9400D3>数据库连接</font>、<font color=#9400D3>session状态处理</font>，这些都是nextjs自带服务器干不了的事，我们也无法修改它的代码</font>

<font color=#DD1144>所以我们需要将nextjs作为koa的一个中间件使用，如果是页面请求和静态文件请求，我们沿着中间件进入nextjs服务器，如果是其他的就进入koa自己的服务器处理请求</font>

我们首先下载依赖：
```javascript
yarn add koa@2.7.0 koa-router@7.4.0 koa-session@5.10.1
```
然后在根目录下面去创建`server.js`,这个就是我们同时启动`koa`和`nextjs`的文件
```javascript
// server.js
const Koa = require('koa')
const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })

const handle = app.getRequestHandler() // 拿到nextjs服务中的handle来处理http请求的响应

app.prepare().then(()=> {
	// 等待pages下所有文件编译完成才启动nextjs服务和koa服务
	const server = new Koa()

	server.use(async (ctx, next) => { // nextjs服务作为koa的中间件使用
		await handle(ctx.req, ctx.res)
		ctx.respond = false
	})

	server.listen(3000, ()=> {
		console.log("koa server listening on 3000")
	})
})
```
此时我们使用`yarn dev`或者`npm run dev`就要启动的是`koa`的服务，所以我们的`package.json`中的命令就要改成：
```javascript
// package.json
{
  "scripts": {
    "dev": "node server.js",
  },
}
```

### 3. koa的基本使用
`koa`是一个轻量级的框架，并没有集成太多的功能，而是封装了请求从进入到响应的一个完成的流程，可以使得我们在其中使用很多的其他中间件来完成丰富的功能。

关于`koa`中间件的本质就是一个个方法，这些方法按照你书写中间件的顺序去执行，依次对请求和响应进行操作，<font color=#1E90FF>但是所有的中间件都是异步的，因为每个中间件都不会知道上一个和下一个中间件是异步还是同步，所以统一写为异步，使用async 和 await的方式去执行</font>

我们来看一段最简单的`koa`的使用代码
```javascript
const Koa = require('koa')
const Router = require('koa-router')

const server = new Koa() // 创建koa对象
const router = new Router() // 创建router对象

server.use(async (ctx, next) => {
	await	next() // 进入下一个中间件
})


router.get('/test/:id', (ctx) => {
	const path = ctx.path // 请求路径
	const method = ctx.method // 请求方法
	ctx.body = {   // 设置返回json
		success: true,
		id: ctx.params.id
	}
	ctx.set('Content-Type','application/json') // 设置返回头
})

server.use(router.routes()) // 使用路由中间件

server.listen(3000, ()=> {
	console.log("koa server listening on 3000")
})
```
下面我们要说一下`res`、`req`、`response`、`request`之间的关系，<font color=#1E90FF>其实在Node原生当中的http的模块中使用的是res和req作为响应和请求的对象，那无论是koa还是express都是在原生node的http模块上进行封装和增强，所以这里的res和req都是原生Node当中的对象，response和request都是在res和req基础上的增强版</font>

所以你可以看到在上一节`nextjs`作为`koa`的中间件使用的时候调用的是原始的`ctx.req`和`ctx.res`，因为`nextjs`并不是专为`koa`设计的，为了兼容所有`node`框架，`nextjs`必须使用原生的`node`中`http`模块当中的`req`和`res`。

## Redis
### 1. Redis的安装和使用
首先`redis`必须要去`github`的网站上去下载，地址为[https://github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases)，有两种下载方式：

<font color=#1E90FF>**① msi安装**</font>

到`github`上下载`Redis-x64-5.0.9.msi`到本机上，解压到某个文件中，然后点击执行安装程序，都是傻瓜式的安装，<font color=#1E90FF>重要的是这种方式安装后，会把Redis作为window中的默认服务，每次开机就会自己启动</font>

<font color=#1E90FF>另外通过msi安装方式，已经将命令添加到系统的环境变量中了，所以不需要进入到redis的安装目录，任意目录都能执行redis的命令</font>

<font color=#DD1144>任意目录下面执行redis-cli就会进入127.0.0.1:6379,然后可以通过set和get命令去设置数据和获取数据</font>

<font color=#1E90FF>**② zip**</font>

到`github`上去下载`Redis-x64-5.0.9.zip`，然后加压后将文件命名为`redis`，一般是放在`C:\redis`下面，进入`C:\redis`启动`redis`：
```bash
C:\REDUS> redis-server.exe redis.windows.conf
```
然后需要重新打开一个命令行进入`redis`的操作：
```bash
C:\redis> redis-cli.exe -h 127.0.0.1 -p 6379
127.0.0.1:6379> set myKey abc
OK
127.0.0.1:6379> get myKey
"abc"
127.0.0.1:6379>
```
关于`zip`方法，每次都需要自己这样启动`redis`服务，这种方法在[菜鸟教程](https://www.runoob.com/redis/redis-install.html)中也能找到。

### 2. Redis的基本使用
`redis`安装好是没有密码的，这并不是说`redis`就是不安全的，因为通常`redis`数据库是设置在内网中的，外网访问不到，但是我们也可以来设置密码。

我们打开`redis.windows.conf`文件，然后查找`requirepass`，可以看到有一行是这样：
```javascript
// requirepass foobared
```
我们取消这行注释，并修改成为下面这样，这样就将密码修改成为了123456
```javascript
requirepass 123456
```
然后重启之后，我们比如`set`一个数据就会出现`NOAUTH Authentication required`这样的错误提示，我们必须使用密码登录：
```bash
127.0.0.1:6379> set b 111
(error) NOAUTH Authentication required
127.0.0.1:6379> auth 123456
OK
127.0.0.1:6379> set b 111
OK
```

关于`redis`我们设置和获取数据的命令只需要知道`set`和`get`，虽然`redis`只是一个`key:value`的数据库，但是`value`可以有各种各样的数据结构。当我们我们出了`set`和`get`我们还需要知道`setex`，这个命令可以给`key`设置一个过期时间：
```bash
// 给key:value为name:taopoppy设置一个10秒的过期时间
127.0.0.1:6379> setex name 10 taopoppy
```
然后如果我们需要查找所有存在于`redis`当中的`key`并且删除某些`key`,我们可以：
```bash
127.0.0.1:6379> keys *
1) "bs001"
2) "bs002"
127.0.0.1:6379> del bs001
(integet) 1
127.0.0.1:6379> keys *
1) "bs002"
```

### 3. Node连接Redis
安装`ioredis`这个包：
```javascript
yarn add ioredis@4.6.2
```
```javascript
// nextjs-project\test\test-redis.js
async function test() {
	const Redis = require('ioredis')

	const redis = new Redis({
		port:'6379'
		// password:123456
	})

	await redis.set("c",123)           // 设置key:value
	await redis.setex("d",10,1234)     // 设置有过期时间的key:value
	const keys = await redis.keys("*") // 取出所有key
	const value = await redis.get("c") // 取出key为c的value

	console.log(keys,value)
}

test()
```
可以看到的是，`ioredis`这个包基本上用法和我们在命令行当中的用法是一样的。

## nextjs继承antd
首先安装`antd`有几个问题：

<font color=#1E90FF>**① next.js默认不支持css文件**</font>

<font color=#1E90FF>nextjs默认是不支持直接import css文件的，因为默认功能当中有个css-in-js的方案的，但是nextjs同时又提供了很多插件来帮助我们实现各种各样的功能，所以我们来看一下怎么使用</font>

首先来安装`@zeit/next-css`
```javascript
yarn add @zeit/next-css@1.0.1
```
这个包就是提供了`nextjs`使用`css`的一些配置，然后我们创建`next.config.js`文件：
```javascript
// nextjs-project/next.config.js
const withCss = require('@zeit/next-css')

if (typeof require !== 'undefined') {
	require.extensions['.css'] = file => {}
}

module.exports = withCss({})
```
实际上`withCss`就是`@zeit/next-css`这个包导出的配置，我们让整个配置直接成为`next.config.js`的配置，这样直接将使用`css`的能力接入到了`nextjs`当中,这个时候我们再创建一个`css`文件并引入到`index.js`当中测试一下：
```css
/*nextjs-project/text.css*/
body {
	color: aqua;
}
```
```javascript
// nextjs-project/pages/index.js
import '../text.css'
export default () => <span>index</span>
```
这样`css`文件就被正确引入并且生效了。

<font color=#1E90FF>**② 如何分模块加载组件**</font>

在`antd`旧一点的版本当中，需要使用`babel-plugin-import`来解决按需加载的问题，使用到`antd`中的什么组件就只会加载什么组件，不会将所有`antd`的代码全部打包进来：
```javascript
// 下载antd
yarn add antd@3.13.6

// 下载babel-plugin-import
yarn add babel-plugin-import@1.11.0
```
然后创建`nextjs-project/.babelrc`:
```javascript
// nextjs-project/.babelrc
{
	"presets": ["next/babel"], // 加入next当中的默认babel配置
	"plugins": [
		[
			"import",
			{
				"libraryName":"antd"
			}
		]
	]
}
```
这个配置之后，我们在代码当中使用`import { Button } from 'antd'`,那么`babel`在`webpack`打包之前会先将其转换成为`import Button from 'antd/lib/button'`,这样`webpack`打包就只会打包`antd/lib/button`当中的代码，而不会将`antd`所有的代码都打包进来。

然后我们直接去使用:
```javascript
// nextjs-project/pages/index.js
import { Button } from 'antd'
export default () => <Button>index</Button>
```
当然这样用是没有样式效果的，在`antd`官网上说还要全局引入`antd`的`css`样式，所以我们去创建`nextjs-project/pages/_app.js`：
```javascript
// nextjs-project/pages/_app.js
import App from 'next/app'
import 'antd/dist/antd.css' // 引入样式

export default App
```
这个文件是覆盖`nextjs`默认的全局`app.js`文件的，这个我们下一章会再详细说。
