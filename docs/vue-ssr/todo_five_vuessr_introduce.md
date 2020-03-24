# 服务端渲染（1）

## 开发时服务端渲染配置和原理

### 1. 服务端渲染原理
<img :src="$withBase('/vuessr_ssr_pickage.png')" alt="服务端渲染">

对于服务端渲染，我们不能仅仅知道它的相关配置，要知道它为了解决什么问题，还有它的实现底层原理。我们首先来讲一下上面这幅图的意思：
+ <font color=#1E90FF>webpack dev server（8000端口）本质上是一个前端自主的server，服务端渲染的代码是不能写在这里的，我们需要自己重新再开一个服务（3333端口）去书写这部分逻辑</font>
+ <font color=#1E90FF>对于服务端渲染的逻辑，<font color=#DD1144>我们会使用到vue-server-render的这个包来帮助我们在node中许渲染出vue代码生成的html代码，这部分代码只直接返回给用户的，是直接能在浏览器当中运行看到结果的</font></font>
+ <font color=#1E90FF>现在用户如果走服务端渲染的路线呢，<font color=#DD1144>在node服务当中也要打包一个vue的整个应用的代码逻辑，打包出来的这个并不是运行在浏览器端的，而是运行在node端的。我们通过webpack server compiler打包出来一个server bundle的js文件，然后通过vue-server-render去渲染出html的代码</font></font>
+ <font color=#1E90FF>但是要明确的是，node端（3333端口）经过一系列操作渲染出来的html可以直接给用户，但是是只能看不能用，因为没有任何操作，路由，store的逻辑，这些逻辑还是得需要前端服务（8000端口）去生成，<font color=#9400D3>所以最重要的一句话就是：传统的纯前端渲染是渲染html和渲染js两部分工作，现在服务端渲染把渲染html的工作拿了过来自己做，8000端口渲染js，3333端口渲染html，两个一结合，共同输送到浏览器，成为又可看又可操作的html页面</font></font>
+ <font color=#1E90FF>那实际上上面这个图是开发环境的图，正式环境我们之前通过webpack生成的js文件都是存在硬盘当中的，只需要文件引用即可，不需要请求http，所以正式环境的整个流程相对比较简单</font>

### 2. 服务端webpack配置
服务端`webpack`的配置并不是很难，因为<font color=#DD1144>打包的结果是服务端内部的server bundle，而这个js文件又要被vue-server-render渲染成为html代码。所以不存在什么优化，压缩，热更新这些有的没的，只需要在node端跑起来即可</font>，我们创建`build/webpack.config.server.js`；
```javascript
// build/webpack.config.server.js
const path = require('path')
const webpack = require('webpack')
const baseConfig = require('./webpack.config.base')
const merge = require('webpack-merge')
const ExtractPlugin = require('extract-text-webpack-plugin')
const VueServerPlugin = require('vue-server-renderer/server-plugin')

let config

config = merge(baseConfig, {
  target: 'node', // 必须要配置，因为打包出来的东西要在node环境跑
  entry: path.join(__dirname, '../client/server-entry.js'), // 修改新的路径
  devtool: 'source-map', // 修改devtools的方式
  output: {
    libraryTarget: 'commonjs2', // 通过module.export的形式将代码导出，因为是跑在node端
    filename: 'server-entry.js',
    path: path.join(__dirname, '../server-build')
  },
  externals: Object.keys(require('../package.json').dependencies), // 因为vue，vuex和vue-router都在node_modules中，不需要打包进入server-entry.js
  module: {
    rules: [
      {
        test: /\.styl/,
        use: ExtractPlugin.extract({
          fallback: 'vue-style-loader', // 由于vue-style-loader有DOM操作，我们需要将css代码分离出去
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true
              }
            },
            'stylus-loader'
          ]
        })
      }
    ]
  },
  plugins: [
    new ExtractPlugin('styles.[contentHash:8].css'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"' // 官方推荐的配置，可能在插件中会用到
    }),
    new VueServerPlugin() // 使用最重要的插件，可以通过{filename:'xxx'}指定打包后的文件名。默认是vue-ssr-server-bundle.json
  ]
})

module.exports = config
```
然后我们根据这个文件做的额外的操作就是：
+ <font color=#1E90FF>创建client/server-entry.js文件</font>
+ <font color=#1E90FF>下载服务端渲染最重要的插件：vue-server-renderer，这个插件能够帮助我们生成一个json文件，帮助我们做很多复杂的逻辑</font>：
	```javascript
	npm i vue-server-renderer@2.5.13 -S --registry=https://registry.npm.taobao.org
	```

## nodeServer的实现
我们使用`koa`框架来做后端的服务,必不可少的还有`koa`的一些工具
```javascript
npm i koa@2.4.1 -S --registry=https://registry.npm.taobao.org
npm i koa-router@7.4.0 -S --registry=https://registry.npm.taobao.org
npm i axios@0.17.1 -S --registry=https://registry.npm.taobao.org
npm i memory-fs -D --registry=https://registry.npm.taobao.org
npm i ejs@2.5.7 -S --registry=https://registry.npm.taobao.org
```
然后创建`server/server.js`文件来书写服务：
```javascript
// server/server.js
const Koa = require('koa')
const app = new Koa()
const isDev = process.env.NODE_ENV === 'development'

app.use(async (ctx, next) => {
  try {
    console.log(`request with path ${ctx.path}`)
    await next()
  } catch (err) {
    console.log(err)
    ctx.status = 500
    if (isDev) {
      ctx.body = err.message
    } else {
      ctx.body = `please try again later`
    }
  }
})

// 服务端渲染区分开发和正式环境两种不同情况
...未完待续
```
并创建`server/routers/dev-ssr.js`和`server/routers/ssr.js`来书写开发环境和正式环境的`ssr`：
```javascript
// server/routers/dev-ssr.js
const Router = require('koa-router')
const axios = require('axios')
const MemoryFs = require('memory-fs')
const webpack = require('webpack')
const fs = require('fs')

const VueServerRenderer = require('vue-server-renderer')
const path = require('path')

const serverConfig = require('../../build/webpack.config.server')

// node当中要将webpack跑起来
const serverCompiler = webpack(serverConfig)
const mfs = new MemoryFs()

// MemoryFs和node中的fs的api一样，还扩展了一些
// MemoryFs的用处是将文件输出写入内存而不是磁盘
// webpack打包，编译都依赖于大量的临时文件写入写出，全部都写入磁盘会浪费性能和时间
serverCompiler.outputFileSystem = mfs

// 记录每次webpack打包的文件
let bundle

// 监听文件的修改，重新打包
serverCompiler.watch({}, (err, stats) => {
  if (err) throw err
  stats = stats.toJson()
  stats.errors.forEach(err => { console.log(err) })
  stats.hasWarnings.forEach(warn => console.warn(err))

  const bundlePath = path.join(
    serverConfig.output.path,
    'vue-ssr-server-bundle.json' // 通过VueServerPlugin打包出来是个json文件
  )
  bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
})

// 书写一个中间件，帮助我们处理服务端渲染返回的东西
// 只需要在ctx.body上挂载我们要返回的html的内容
const handleSSR = async (ctx) => {
  if (bundle) {
    ctx.body = '稍等一会,别着急...'
    return
  }

  // 从客户端（8000端口）拿到打包好的js的路径
  const clientManifestResp = await axios.get(
    `http://127.0.0.1:8000/vue-ssr-client-manifest.json`
  )
  const clientManifest = clientManifestResp.data

  // 开始进行服务端渲染的过程
  // 因为通过VueServerPlugin渲染出来只是一个完整html文件中的body部分，其他头部，mete信息我们要有模板
  // 我们就自己通过ejs去创建一个模板
  const template = fs.readFileSync(
    path.join(__dirname, '../server.template.ejs')
  )

  // 自动生成一个带有script标签的js文件引用的字符串，可以直接填到ejs中
  const renderer = VueServerRenderer
    .createBundleRenderer(bundle, {
      inject: false,
      clientManifest
    })
}
```
其中我们要从客户端拿到`vue-ssr-client-manifest.json`文件，就还需要在`client`的`webpack`配置中添加修改：
```javascript
// build/webpack.config.client.js
const VueClientPlugin = require('vue-server-renderer/client-plugin') //这里使用的是client-plugin

const defaultPlugins = [
  ...
  new VueClientPlugin() // 默认的生成文件名是vue-ssr-client-manifest.json
]
```
同时我们也要创建一个`server`端使用的模板，创建`server/server.template.ejs`:
```html
<!--server/server.template.ejs-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <%- style %>
</head>
<body>
  <div id="root"><%- appString %></div>
  <%- scripts %>
</body>
</html>
```


## 服务端渲染的entry配置
### 1. 实现服务端渲染操作server-render.js
接下来我们就是要做真正的服务端渲染的操作，我们封装到另外一个文件，因为开发和正式环境这个操作是一样的，我们创建`server/routers/server-render.js`:
```javascript
// server/routers/server-render.js
const ejs = require('ejs')

module.exports = async (ctx, renderer, template) => {
  ctx.headers['Content-Type'] = 'text/html'

  // 这个context对象是传入到VueServerRender中的
  // VueServerRender渲染完成之后会在context对象上插入一系列属性
  // 包括客户端js的路径，css路径，还有头部信息
  const context = { url: ctx.path }

  try {
    const appString = await renderer.renderToString(context)

    // 渲染出html
    const html = ejs.render(template, {
      appString,
      style: context.renderStyles(), // 拿到带有style的整个标签
      scripts: context.renderScripts() // 拿到带有script的整个标签
    })

    // 返回给客户端我们的html内容
    ctx.body = html
  } catch (err) {
    console.log('render error', err)
    throw err
  }
}
```

### 2. 实现入口文件server-entry.js
首先我们需要创建`client/create-app.js`,这个文件的作用：<font color=#DD1144>每一次服务端渲染都要渲染一个新的app，不能用上一次渲染过的对象进行下一次的渲染，因为包含了上一次app的状态，会影响下一次渲染内容</font>，<font color=#1E90FF>另外这个create-app.js会和client/index.js长的比较像</font>:
```javascript
// client/create-app.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import App from './app.vue'
import createStore from './store/store'
import createRouter from './config/router'

import './assets/styles/global.styl'

Vue.use(VueRouter)
Vue.use(Vuex)

export default () => {
  const router = createRouter()
  const store = createStore()

  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })

  return { app, router, store }
}
```
上面这个`create-app.js`文件我们后续还要继续增加东西，现在我们要回到`client/server-entry.js`,书写这里的逻辑:
```javascript
// client/server-entry.js
import { createApp } from './create-app'

export default context => {
  return new Promise((resolve, reject) => {
    // 当我们把服务端所有的api实现完成之后，进行异步请求的时候才会用到store
    // const { app, router, store } = createApp()
    const { app, router } = createApp()

    // 路由推进一条记录
    router.push(context.url)
    // 路由当中所有异步操作完成之后,onReady方法只有在服务端渲染的时候用
    router.onReady(() => {
      // 返回目标位置或是当前路由匹配的组件数组 (是数组的定义/构造类，不是实例)。通常在服务端渲染的数据预加载时使用
      const matchedComponents = router.getMatchedComponents()
      if (!matchedComponents.length) {
        return reject(new Error('no component matched'))
      }
      resolve(app)
    })
  })
}
```
到这里为止，我们基本的东西就已经写完了，我们来在`package.json`当中添加一条记录，来启动调试：
```javascript
// package.json
{
  "scripts": {
		"dev:client": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.client.js",
    "dev:server": "cross-env NODE_ENV=development node server/server.js"
  },
}
```

