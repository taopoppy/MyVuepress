# 项目搭建流程

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

## 版本号
前端发展飞速，我们使用的这些包的版本号也在飞速变化，关于一个包的版本号`^aa.bb.cc`，我们需要知道：
+ <font color=#1E90FF>^表示自动在大版本的范围内更新小版本，比如在package.json当中写的^1.0.1，而npm install的时候发现已经有1.0.2,就会自动下载1.0.2，但是npm install的时候发现已经有2.0.1的时候，它是不会去自动更新的，因为大版本之间无法兼容</font>

+ <font color=#1E90FF>aa是大版本号，一般只有breaking changes的时候才会更新</font>
+ <font color=#1E90FF>bb是一般修复比较大的bug</font>
+ <font color=#1E90FF>cc则是一些细微的修改</font>

## 创建next.js项目
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

## next作为koa中间件
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

## koa的基本使用

## redis的安装和使用

## nextjs继承antd