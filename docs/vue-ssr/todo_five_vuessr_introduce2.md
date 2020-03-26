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
npm i concurrently@3.5.1 -D --registry=https://registry.npm.taobao.org
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
### 1. 客户端处理元信息
我们希望每次服务端渲染返回的头信息都是针对这个页面的头信息，这些是对`SEO`有好处的，我们在服务端渲染的时候是这样来处理的，使用`vue-meta`这个工具，首先下载它：
```javascript
npm i vue-meta@1.4.3 -S --registry=https://registry.npm.taobao.org
```
然后我们在`client/create-app.js`引入`Meta`：
```javascript
// client/create-app.js
import Meta from 'vue-meta'

Vue.use(Meta)
```
<font color=#1E90FF>这样在项目中引入了Meta组件之后，我们就能在书写组件的时候去使用Meta组件去声明一些meta信息,并且组件之间的meta信息的关系是下级覆盖上级</font>：

```javascript
// client/app.vue
export default {
	metaInfo: {
		title: 'Taopoppy\'s Todo App'
	}
}

// client/views/todo/todo.vue
export default {
  metaInfo: {
    title: 'The Todo App'
  },
}

// client/views/login/login.vue
```
这样修改之后暂时还不行，因为我们是在`client/create-app.js`文件当中引入`Meta`组件的，但是`webpackDevServer`现在是用`client/index.js`作为入口，这个时候`index`压根不依赖`create-app`,所以我们重新新建文件：`client/client-entry.js`,<font color=#1E90FF>因为做服务端渲染的时候，客户端的js要做一些相应的配合</font>
```javascript
// client/client-entry.js
import createApp from './create-app'

const { app, router } = createApp()

// 等到router.onReady的时候才去做真正的服务端渲染
router.onReady(() => {
  app.$mount('#root')
})
```
然后我们修改一下`webpack.config.base.js`和`webpack.config.client.js`中的路径；
```javascript
// webpack.config.base.js
entry: path.join(__dirname, '../client/client-entry.js')

// webpack.config.client.js
app: path.join(__dirname, '../client/client-entry.js')
```
然后我们启动项目，访问客户端的页面`localhost:8000`，分别访问`localhost:8000/app`和`localhost:8000/login`，就能看到页面的`title`的变化

### 2. 服务端的元信息
但是我们只是做了客户端使用`Vue-Meta`的情况，我们在服务端渲染的时候还需要做一些事情，我们首先在`client/server-entry.js`当中去在`resolve(app)`之前添加一行代码：
```javascript
// client/server-entry.js
context.meta = app.$meta() // 将
resolve(app)
```
然后我们在渲染`html`的时候，就能通过`context`拿到元信息，在`server/routers/server-render.js`当中：
```javascript
// server/routers/server-render.js
const { title } = context.meta.inject() // 拿到meta信息
const html = ejs.render(template, {
	...
	title: title.text() // 以title标签的形式添加到html中
})
```
通过我们在`ejs`模板中也修改一下：
```html
<!-- server/routers/server.template.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <%- title %>
  <%- style %>
</head>
<body>
  <div id="root"><%- appString %></div>
  <%- scripts %>
</body>
</html>
```
这个时候我们再去访问`localhost:3333/app`和`localhost:3333/login`就能看到页面`title`的信息变化了。<font color=#1E90FF>实际上头标签里面的东西都能通过这样的方式去改变，我们这里只是拿title来举个例子而已</font>

## 生产环境下的服务端渲染
### 1. 打包文件
最后我们就要来书写`server/routers/ssr.js`文件了，也就是正式环境的`ssr`，实际上服务端渲染的主要流程，我们都在`server/routers/server-render.js`中书写好了，在`ssr.js`中我们就去`require`一些依赖即可，首先我们要去`build`一下我们的内容,我们在`package.json`当中修改一些命令：
```javascript
// package.json
{
	"script": {
		"build:server":"cross-env NODE_ENV=production webpack --config build/webpack.config.server.js",
    "build": "npm run clean && npm run build:client && npm run build:server",
    "clean": "rimraf dist && rimraf server-build",
	}
}
```
然后在`.gitignore`文件中忽略几个文件,`dist`和`server-build`都是构建时产生的文件
```javascript
// .gitignore
node_modules
dist
server-build
```
然后我们启动打包命令：`npm run build`,然后就会在项目中生成`dist`和`server-build`文件夹，里面分别包含着：`/dist/vue-ssr-client-manifest.json`文件和`server-build/vue-ssr-server-bundle.json`文件，这是两个特别重要的文件。

### 2. 配置文件
我们来书写`server/routers/ssr.js`文件,实际上`ssr.js`文件和`dev-ssr.js`的逻辑基本上是一样，你可以对比一下：
```javascript
// server/routers/ssr.js
const Router = require('koa-router')
const path = require('path')
const fs = require('fs')
const VueServerRender = require('vue-server-renderer')
const serverRender = require('./server-render')

const clientManifest = require('../../dist/vue-ssr-client-manifest.json')

// 正式环境一次性创建好，后续都用同一个render
const renderer = VueServerRender.createBundleRenderer(
  path.join(__dirname,'../../server-build/vue-ssr-server-bundle.json'),
  {
    inject: false,
    clientManifest
  }
)

const template = fs.readFileSync(
  path.join(__dirname, '../server.template.ejs'),
  'utf-8'
)

const pageRouter = new Router()

pageRouter.get('*', async(ctx) => {
  await serverRender(ctx, renderer, template)
})

module.exports = pageRouter
```
现在既然开发环境和生产环境的代码我们都写好了，在`server/server.js`文件中，我们就要对引入的`router`做环境的判断了：
```javascript
// server/server.js部分代码
let pageRouter
if(isDev) {
  pageRouter = require('./routers/dev-ssr')
} else {
  pageRouter = require('./routers/ssr')
}
```
最后我们在`package.json`当中添加一条启动命令：
```javascript
// package.json
{
	"script": {
		"start": "cross-env NODE_ENV=production node server/server.js"
	}
}
```
我们启动后会发现我们启动后，之前我们的正式环境的静态资源请求路径没有设置对，因为在`webpack.config.base.js`中设置了`publicPath`为`http://127.0.0.1/8000/public/`,在`webpack.config.client.js`中的正式环境的配置延用了那个基础配置，我们需要在`webpack.config.client.js`当中的额正式环境配置中的`output`中添加下面一条属性：
```javascript
output: {
	filename: '[name].[chunkhash:8].js',
	publicPath: '/public/'  // 添加这个
},
```
然后我们再`server`端处理这个路径，我们创建`server/routers/static.js`:
```javascript
// server/routers/static.js
const Router = require('koa-router')

const send = require('koa-send')

// 只会处理public开头的路径请求
const staticRouter = new Router({ prefix: '/public' })

staticRouter.get('/*', async ctx => {
  await send(ctx ,ctx.path)
})

module.exports = staticRouter
```
然后在`server/server.js`中引入：
```javascript
// server/server.json
const staticRouter = require('./routers/static')

// staticRouter要放在pageRouter之前
app.use(staticRouter.routes()).use(staticRouter.allowedMethods())
```
同时因为我们处理的是`public`静态路径，但是打包的是`dist`目录，所以我们分别要在`webpack.config.base.js`文件，`package.json`文件，`.gitignore`文件，还有`server/routers/ssr.js`文件中通通将`dist`修改成为`public`,这样映射才成功。然后重新`npm run build`

所以经过一系列的处理我们现在简化一下正式环境时候的流程图：
<img :src="$withBase('/vuessr_vuessr_production_liucheng.png')" alt="正式环境的流程图">