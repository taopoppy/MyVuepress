# React服务端渲染

## 在服务端编写React组件
现在要想实现使用`react`的同时，又要实现首屏加速速度极快和`SEO`又好的话，就必须将`react`和服务端渲染结合，为了搞清这个流程，我们先来看看客户端渲染的流程：
+ <font color=#1E90FF>浏览器发送请求</font>
+ <font color=#1E90FF>服务器返回HTML</font>
+ <font color=#1E90FF>浏览器发送bundle.js请求</font>
+ <font color=#1E90FF>服务器返回bundle.js</font>
+ <font color=#1E90FF>浏览器执行bundele.js中的React代码</font>

接着我们如果做`React`的服务端渲染的话，流程应该如下：
+ <font color=#9400D3>浏览器发送请求</font>
+ <font color=#9400D3>服务器运行React代码生成页面</font>
+ <font color=#9400D3>服务器返回页面</font>

所以我们现在要开始在服务器端来编写一些`React`的组件,我们先来下载`React`相关的包:
```javascript
npm install react@16.4.1 --save --registry=https://registry.npm.taobao.org
```
在`src/index.js`当中引入一个`react`组件：
```javascript
// src/index.js
const express = require('express')
const app = express()
const Home = require('./containers/Home/index.js') // 引入react组件

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

然后创建`src/containers/Home/index.js`,内容如下：
```javascript
// src/containers/Home/index.js
const React = require('react')

const Home = () => {
	return <div>home</div>
}

module.exports = {
	default: Home
}
```
关于这段代码注意的就是在服务端书写`react`，要符合`commonjs`的规范，其次，还需要我们使用`webpack`来打包这段代码，才能真正运行起来, <font color=#DD1144>因为这里根本无法识别jsx语法</font>。

## 服务器端Webpack的配置
我们首先安装`webpack`（在生产环境中不需要`--save`）:
```javascript
npm install webpack@4.16.0 webpack-cli@3.0.8 --save
```
然后创建一个`webpack.server.js`，内容如下:
```javascript
// webpack.server.js
const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
	mode: 'development',
	target:'node', // 需要设置这一项，服务端和客户端的打包结果不同
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname,'build')
	},
	externals:[
		nodeExternals(), // node当中引入的包（比如express）不会被打包进入bundle.js
	],
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
因为我们上面关于`webpack`配置需要一些`loader`和`plugins`，我们这里需要下载一下：
```javascript
// 使用babel-loader
npm install babel-loader@7.1.5 babel-core@6.26.3 --save

// 使用babel-presets-react
npm install babel-preset-react@6.24.1 --save

// 使用babel-preset-stage-0
npm install babel-preset-stage-0@6.24.1 --save

// 使用babel-preset-env
npm install babel-preset-env@1.7.0 --save

// 使用webpack-node-externals
npm install webpack-node-externals@1.7.2 --save
```

此时我们在`package.json`中的命令应该是：
```javascript
// package.json
{
  "scripts": {
		"start": "node ./build/bundle.js",
		"build": "webpack --config webpack.server.js"
  },
}
```
+ 然后执行`npm run build`，这样就将整个服务端的代码打包进入了`build/bundle.js`了
+ 最后执行`npm start`,启动服务器的代码

虽然我们在`index.js`中引入了`react`组件`Home`，但是只要打包不报错，服务正常运行，说明`webpack`配置正确了，现在服务端可以正确识别`react`代码当中的`JSX`语法。

## 实现服务端组件渲染
在实现了`webpack`的配置之后，而且用了`babel-preset-stage-0`，我们完全就能在`node`当中书写`ES Module`了。

但是我们回想一下，在客户端渲染的时候，<font color=#1E90FF>是react-dom提供了ReactDOM.render方法帮助我们将react元素挂载到页面上的，但是在服务端这种方法就行不通，好在react-dom还提供了另外的renderToString方法来供服务端使用</font>，所以我们先来下载`react-dom`:
```javascript
npm install react-dom@16.4.1 --save
```
然后我们再来看怎么通过`ES Module`和`renderToString`将我们通过`react`书写的代码通过服务端渲染的方式返回给浏览器：
```javascript
// index.js
import express from 'express'
import Home from './containers/Home/index'
import React from 'react' // 使用jsx语法
import { renderToString } from 'react-dom/server' // 引入renderToString

const app = express()
const content = renderToString(<Home />) // 把组件的内容转换成html的字符串

app.get('/',function (req,res) {
	res.send(
		`<html>
			<head>
				<title>ssr</title>
			</head>
			<body>
				${content}
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
// src/containers/Home/index.js
import React from 'react'

const Home = () => {
	return <div>home</div>
}

export default Home
```
到此为止，我们就实现了一个最简单的`React`服务端渲染，使用`React`书写的组件完全是在服务端生产好并且挂载到一个`html`文本当中，最终一起返回给浏览器的。


## 虚拟DOM的服务端渲染
<font color=#9400D3>**① 虚拟DOM和服务端渲染的关系**</font>

`React`服务端渲染的技术是建立在虚拟`DOM`的技术上面的，<font color=#1E90FF>虚拟DOM是用来描述真实DOM结构的javascript对象，或者说是真实DOM的一个JavaScript对象的映射</font>，所以由于存在虚拟`DOM`：
+ 在客户度渲染中通过`ReactDOM.render()`方法将其转换成为真实`DOM`挂载到页面上
+ 在服务端渲染中通过`renderToString()`方法将其转换成为字符串返回给浏览器

所以虚拟`DOM`的存在实际上存在诸多好处：
+ <font color=#1E90FF>减少真实DOM操作，提高页面渲染速度</font>
+ <font color=#1E90FF>使得跨端得以实现，虚拟DOM被react和react native都能识别</font>
+ <font color=#1E90FF>使得服务端渲染变的非常简单</font>

<font color=#9400D3>**② 服务端渲染的弊端**</font>

客户端渲染的时候，`React`代码的执行是在浏览器中执行的，消耗的是客户端的浏览器，而服务端渲染消耗的是服务器端的性能，<font color=#DD1144>所以其实在不需要搜索引擎优化的项目，或者说在前后端分离的项目中已经优化的不错了的情况下，尽量不要SSR技术</font>

## Webpack自动打包和服务重启
我们下载`nodemon`来帮助我们自动重启`node`服务：
```javascript
npm install nodemon@1.18.2 --save-dev
```
然后我们修改`package.json`文件：
```javascript
// package.json
{
  "scripts": {
    "start": "nodemon --watch build --exec node \"./build/bundle.js\"",
    "build": "webpack --config webpack.server.js --watch"
  },
}
```
+ 首先我们在`npm run build`命令中添加`--watch`来监听，凡是`index.js`以及它里面中所有引入的东西发生变化就会重新打包
+ 其次我们使用`nodemon`来监听`build`目录中内容的变化，一旦`build`文件夹中的文件发生变化就会去执行`node ./build/bundle.js`这个命令

所以这样的话我们需要在开发环境中同时开两个命令行窗口。还是有点复杂，我们下面来说`npm-run-all`


## npm-run-all提高效率
下载`npm-run-all`来帮助我们在一个命令行同时执行多个命令:
```javascript
npm install npm-run-all@4.1.3 --save-dev
```
然后修改`package.json`：
```javascript
// package.json
{
  "scripts": {
    "dev:start": "nodemon --watch build --exec node \"./build/bundle.js\"",
    "dev:build": "webpack --config webpack.server.js --watch",
    "dev":"npm-run-all --parallel dev:**"
  },
}
```
我们执行`npm run dev`，它就会并行的执行以`dev:`打头的所有命令。也就是同时执行`npm run dev:start`和`npm run dev:build`