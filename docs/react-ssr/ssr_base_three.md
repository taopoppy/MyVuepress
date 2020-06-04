# 同构的概念和梳理

## 什么是同构
我们把之前的`Home`组件当中的代码修改一下：
```javascript
// src/containers/Home/index.js
import React from 'react'

const Home = () => {
	return (
		<div>
			<div>this is home</div>
			<button onClick={()=> {alert('click')}}>click</button>
		</div>
	)
}
export default Home
```
然后我们重新执行`npm run dev`，你会发现在页面上有完整的显示，但是`button`按钮是点击不了的，<font color=#DD1144>因为在服务端渲染使用renderToString这个方法的时候，在react代码中书写的事件处理的东西压根不会渲染</font>，所以在页面上的源代码是这样：
```html
<html>
	<head>
		<title>ssr</title>
	</head>
	<body>
		<div data-reactroot=""><div>this is home</div><button>click</button></div>
	</body>
</html>
```
这个问题怎么解决呢？<font color=#9400D3>首先让服务端先把这个页面渲染出来，此时页面只有html和css，没有任何js交互的效果，然后让react代码像传统的一样在浏览器的重跑一遍，这样交互的js效果就全有了</font>

因为这样的做法，所以衍生出同构的概念，<font color=#9400D3>同构就是一套React代码，在服务端执行一次，再在客户端执行一次</font>，所以怎么让我们书写的`React`代码再在客户端跑一次呢，我们后面再说。

## 浏览器上执行JS
我们想一下，我们在服务端给浏览器返回的是一个`html`，要让浏览器显示`html`的同时去执行一段`js`，那我们就必须要在`html`的`body`中添加一个`script`标签，然后引入服务端的一个文件：
```javascript
// src/index.js
import express from 'express'
import Home from './containers/Home/index'
import React from 'react'
import { renderToString } from 'react-dom/server'

const app = express()
app.use(express.static('public'))  // 所以静态文件的请求都去public目录下拿

const content = renderToString(<Home />)

app.get('/',function (req,res) {
	res.send(
		`<html>
			<head>
				<title>ssr</title>
			</head>
			<body>
				${content}
				<script src='/index.js'></script> <!-- 引入一个script标签 -->
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
```javascript
// public/index.js
console.log('public public')
```
有了上面的代码我们来屡一下思路：
+ <font color=#1E90FF>浏览器请求localhost:3000,服务端返回html</font>
+ <font color=#1E90FF>浏览器显示html，发现有script标签，继续请求localhost:3000/index.js</font>
+ <font color=#1E90FF>服务端发现是静态文件的请求，到public目录下返回给浏览器index.js文件</font>
+ <font color=#1E90FF>浏览器拿到index.js的内容，执行一遍</font>

## 浏览器上执行React
有了上面的在浏览器执行经验，我们就知道怎么在浏览器上运行`react`的代码了，我们的思路是，将我们写的`react`代码按照客户端打包的方式打包进入`public/index.js`，然后就可以实现同构：
```javascript
// src/index.js
import express from 'express'
import Home from './containers/Home/index'
import React from 'react'
import { renderToString } from 'react-dom/server'

const app = express()
app.use(express.static('public'))

const content = renderToString(<Home />)

app.get('/',function (req,res) {
	res.send(
		`<html>
			<head>
				<title>ssr</title>
			</head>
			<body>
				<div id="root">${content}</div>
				<script src='/index.js'></script>
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
因为如果要按照客户端渲染的方式去再次渲染一下页面，我们需要在`${content}`外层包裹一层`id`为`root`的`div`标签。接着我们创建`src/client/index.js`:
```javascript
// src/client/index.js
import React from 'react'
import ReactDom from 'react-dom'

import Home from '../containers/Home/index'
ReactDom.hydrate(<Home />,document.getElementById('root'))
```
这里特别要注意我们这里不再使用`ReactDom.render()`方法，而是使用`ReactDom.hydrate()`,当然`react`代码还需要通过`webpack`打包成为浏览器能识别的`js`才能在浏览器正确执行，所以我们创建`webpack.client.js`:
```javascript
// webpack.client.js
const path = require('path')

module.exports = {
	mode: 'development',
	entry: './src/client/index.js',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname,'public') // 这里要打包进入public/index.js当中
	},
	module: {
		rules: [{
			test:/.\.js?$/,
			loader: 'babel-loader',
			exclude: /node_modules/,
			options: {
				presets: [
					'react',
					'stage-0',
					[
						'env',
						{
							targets: {
								browsers: ['last 2 versions']
							}
						}
					]
				]
			}
		}]
	}
}
```
最后我们修改`package.json`：
```javascript
// package.json
{
  "scripts": {
    "dev:start": "nodemon --watch build --exec node \"./build/bundle.js\"",
    "dev:build:server": "webpack --config webpack.server.js --watch",
    "dev:build:client": "webpack --config webpack.client.js --watch",
    "dev":"npm-run-all --parallel dev:**"
  },
}
```
我们在同时打包服务端代码的同时又要去打包客户端的代码，所以此时此刻我们就完成了一个最简单的<font color=#DD1144>同构</font>，为了理解的更清楚一点，我们需要画图来理解一下整个流程：

<img :src="$withBase('/react_ssr_browser.png')" alt="浏览器请求流程">

+ <font color=#9400D3>服务端运行React代码渲染出HTML</font>
+ <font color=#9400D3>服务器发送HTML给浏览器</font>
+ <font color=#9400D3>浏览器接收到内容并展示</font>
+ <font color=#9400D3>浏览器想服务器请求js文件并加载</font>
+ <font color=#9400D3>JS中的React代码在浏览器端重新执行</font>
+ <font color=#9400D3>JS中的React代码接管页面操作</font>

## 工程代码优化
<font color=#1E90FF>**① webpack的优化**</font>

我们在`webpack.server.js`和`webpack.client.js`当中都有很多相同的代码，我们希望抽离，此时我们需要`webpack-merge`:
```javascript
npm install webpack-merge@4.1.3 --save
```
然后我们创建`webpack.base.js`：
```javascript
// webpack.base.js
module.exports = {
	module: {
		rules: [{
			test:/.\.js?$/,         // 所有的js文件
			loader: 'babel-loader', // 使用babel-loader编译
			exclude: /node_modules/,// 排除node_modules
			options: {
				presets: [            // 制定编译规则
					'react',            // 按照react代码编译，需要babel-preset-react
					'stage-0',          // 识别异步的语法，需要babel-preset-stage-0
					[
						'env',            // 根据环境做一些适配
						{
							targets: {
								browsers: ['last 2 versions'] // 打包时，babel会兼容所有主流浏览器最新的两个版本
							}
						}
					]
				]
			}
		}]
	}
}
```
```javascript
// webpack.server.js
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const merge = require('webpack-merge')
const config = require('./webpack.base.js')

const serverConfig = {
	mode: 'development',
	target:'node', // 需要设置这一项，服务端和客户端的打包结果不同
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname,'build')
	},
	externals:[
		nodeExternals(), // node当中引入的包（比如express）不会被打包进入bundle.js
	]
}

module.exports = merge(config, serverConfig)
```
```javascript
// webpack.client.js
const path = require('path')
const merge = require('webpack-merge')
const config = require('./webpack.base.js')

const clientConfig = {
	mode: 'development',
	entry: './src/client/index.js',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname,'public')
	}
}

module.exports = merge(config,clientConfig)
```

<font color=#1E90FF>**② 目录修改**</font>

为了项目结构更加清晰，我们把`src/index.js`移动到`src/server/index.js`，然后将其他的引入地址和`webpack`的打包入口地址修改一下即可.
