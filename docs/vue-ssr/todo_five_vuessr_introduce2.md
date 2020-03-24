# 服务端渲染（2）

实际上通过前面的一个完整的介绍和`Vue-SSR`的实现，我们已经能基本上出来我们需要的功能，但是还有一些问题，我们在这里逐个解决

## 静态资源路径处理
### 1. 修正静态资源路径
首先就是<font color=#DD1144>静态资源路径处理</font>的问题，我们经过服务端渲染拿到的`html`页面中，从`3333`端口拿到的几个`js`路径是错误的:
```html
<script src="/public/0.bundle.a396a520.js"></script>
<script src="/public/bundle.a396a520.js"></script>
```
而这个路径是在`server/routers/dev-ssr.js`中通过`clientManifest`生成的，我们看一下原始的代码：
```javascript
// server/routers/dev-ssr.js中的部分代码
// 从客户端（8000端口）拿到打包好的js的路径
const clientManifestResp = await axios.get(
	`http://127.0.0.1:8000/public/vue-ssr-client-manifest.json`
)
const clientManifest = clientManifestResp.data

// 自动生成一个带有script标签的js文件引用的字符串，可以直接填到ejs中
const renderer = VueServerRenderer
	.createBundleRenderer(bundle, {
		inject: false,
		clientManifest
	})
```
可以看到:<font color=#DD1144>我们没有对/public/0.bundle.a396a520.js和/public/bundle.a396a520.js这中路经做处理，相当于你还访问的是localhost:3333端口的这个路径，3333端口也就是node服务又不会处理，它把这个路径直接传到8000端口（client/server-entry.js）,在server-entry.js中通过router.push推送进去，但是8000端口的服务并没有这样静态资源处理的路由，所有就报错了</font>

所以我们如果要在开发环境中正确运行，<font color=#9400D3>就需要将路由映射正确，面对静态资源的http请求能正确加载客户端的js文件</font>，我们有两种方法：
+ <font color=#1E90FF>第一种方法：可以在node服务中起一个代理，然后将/public/路径的请求代理到webpack-dev-server</font>
+ <font color=#DD1144>第二种方法：修改build/webpack.config.base.js中的publicPath的值为http://127.0.0.1:8000/public/,这样就将静态资源的路径指定为一个完整的url，导致即使在3333端口的服务访问，也是 通过完整的url访问webackdevserver的</font>


### 2. 修正网页图标
然后我们搞一个`favicon.ico`文件放在项目的根目录下面，然后下载`koa-send`来帮助我们发送一些静态文件：
```javascript
npm i koa-send -S --registry=https://registry.npm.taobao.org
```
然后在`server/routers/server.js`中添加代码：
```javascript
// server/routers/server.js
const send = require('koa-send')
const path = require('path')

app.use(async (ctx, next) => {
  if (ctx.path === '/favicon.ico') {
    await send(ctx, '/favicon.ico', { root: path.join(__dirname, '../') })
  } else {
    await next()
  }
})
```

### 3. 添加nodemon和concurrently
下载`nodemon`来帮助我们自动重启项目，方便我们开发：
```javascript
npm i nodemon@1.14.12 -D --registry=https://registry.npm.taobao.org
```
然后在项目的根目录下创建：`nodemon.json`:
```javascript
// nodemon.json
{
  "restartable": "rs", // 重启命令
  "ignore": [          // 忽略监听文件
    ".git",
    "node_moudle/**/node_module",
    ".eslintrc",
    ".eslintignore",
    "build/webpack.config.client.js",
    "public"
  ],
  "verbose": true,
  "env": {
    "NODE_ENV": "development" // 设置开发参数
  },
  "ext": "js json ejs"        // 监听文件类型
}
```
然后我们服务端的启动命令就可以在`package.json`当中写成这样：
```javascript
{
  "scripts": {
    "dev:server": "nodemon server/server.js"
  }
}
```
然后我们按照上面的代码修改好之后，我们依然要启动两个命令`npm run dev:server`和`npm run dev:client`来启动客户端和服务端，我们下面下载一个工具来帮助我们同时启动两个命令：
```javascript
npm i concurrently -D --registry=https://registry.npm.taobao.org
```
然后我们在`package.json`当中去添加`dev`命令：
```javascript

{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\""
  }
}
```

## 使用vue-meta处理元信息

## 生产环境下的服务端渲染
