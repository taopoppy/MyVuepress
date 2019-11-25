# Vue+Webpack工程化配置
## Webpack+vue-loader
创建`package.json`的包：
```javascript
npm init
```
下载`webpack`、`vue`、`vue-loader`
```javascript
npm i webpack@3.10.0 vue@2.5.13 vue-loader@13.6.0 --registry=https://registry.npm.taobao.org
```
因为下载后会提示一些警告，警告告诉我们需要安装其他一些依赖，我们就根据提示下载即可：
```javascript
npm i vue-template-compiler@2.5.13 css-loader@0.28.7 --registry=https://registry.npm.taobao.org
```
创建`src/app.vue`和`src/index.js`
```javascript
// app.vue
<template>
	<div id="test">{{text}}</div>
</template>

<script>
export default {
	data(){
		return {
			text:'abc'
		}
	}
}
</script>

<style>
#test {
	color: red
}
</style>
```
```javascript
// index.js
import Vue from 'vue'
import App from './app.vue'

const root = document.createComment('div')
document.body.appendChild(root)

new Vue({
	render:(h)=>h(App)
}).$mount('root')
```
接着我们配置`webpack`当中的东西：
```javascript
// webpack.config.js
const path = require('path')
module.exports = {
	entry: path.join(__dirname,'src/index.js'),
	module: {
		rules: [
			{
				test: /.vue$/,
				loader: 'vue-loader'
			}
		]
	},
	output: {
		filename: 'bundle.js',
		path: path.join(__dirname, 'dist')
	}
}
```

## Webpack+静态资源
首先下载相关的`loader`帮助我们打包不同的静态资源：
```javascript
npm i url-loader@0.6.2 style-loader@0.19.1 file-loader@1.1.6 --registry=https://registry.npm.taobao.org

```
然后我们在`webpack.config.js`当中去添加这样的配置项：
```javascript
// webpack.config.js
module.exports = {
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.(gif|jpg|jpeg|png|svg)$/,
				use:[
					{
						loader: 'url-loader',
						options: {
							limit: 1024,
							name: '[name].[ext]'
						}
					}
				]
			}
		]
	},
}
```
这样配置了之后，<font color=#1E90FF>我们就能在js代码当中import这些非js的模块，比如图片，css等</font>,同时我们书写样式会用到`stylus`这预处理器，我们首先去安装相关的`loader`：
```javascript
npm i stylus@0.54.5 stylus-loader@3.0.1 --registry=https://registry.npm.taobao.org
```
然后在`webpack.config.js`当中继续配置`module.rules`:
```javascript
// webpack.config.js
module.exports = {
	module: {
		rules: [
			{
				test: /\.styl$/,
				use: [
					'style-loader',
					'css-loader',
					'stylus-loader'
				]
			},
}
```
这样的配置都会把你通过预处理器写的`css`代码打包进入`bundle.js`文件当中，然后通过`js`来渲染`css`效果，这实际上就是我们通常说的`css in js`。那么基本配置就是这些，我们后面来说一下开发利器`webpack-dev-server`.

## webpack+webpack-dev-server
首先我们来安装`webpack-dev-server`
```javascript
npm install webpack-dev-server@2.9.7 cross-env@5.1.3 html-webpack-plugin@2.30.1 --registry=https://registry.npm.taobao.org
```
然后我们只需要去增加个启动命令即可,并在`webpack.config.js`配置即可：
```javascript
// package.json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "cross-env NODE_ENV=production webpack --config webpack.config.js",
    "dev": "cross-env NODE_ENV=development webpack-dev-server --config webpack.config.js"
  },
}
```
```javascript
// webpack.config.js
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin') // dist目录下面生成html的插件
const webpack = require('webpack')
const isDev = process.env.NODE_ENV === 'development'  // 根据启动命令当中的环境变量的配置判断isDev是不是true（开发环境）

const config = {
	target: 'web',                                // 目标，打包web项目
	entry: path.join(__dirname, 'src/index.js'),
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.styl/,
				use: [
					'style-loader',
					'css-loader',
					'stylus-loader'
				]
			},
			{
				test: /\.(gif|jpg|jpeg|png|svg)$/,
				use:[
					{
						loader: 'url-loader',
						options: {
							limit: 1024,
							name: '[name].[ext]'
						}
					}
				]
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: isDev? '"development"': '"production"'
			}
		}), // 这个配置是通过在启动命令中设置的环境变量，让我们在业务代码中也能直接使用process.env.NODE_ENV
		new HTMLPlugin() // 自动生成html的插件
	],
	output: {
		filename: 'bundle.js',
		path: path.join(__dirname, 'dist')
	}
}

if(isDev) {  // 如果是开发环境，我们就给配置增添新的东西
	config.devtool = '#cheap-module-eval-source-map' // sourceMap的配置
	config.devServer = {
		port: 8000,
		host: '0.0.0.0',   // 通过内网也能访问
		overlay: {
			errors: true     // 错误显示在页面上
		},
		hot:true           // 热加载配置
	}
	config.plugins.push(
		new webpack.HotModuleReplacementPlugin(), // 热加载插件
		new webpack.NoEmitOnErrorsPlugin() // 和热加载插件一起配置的，不知道有啥作用
	)
}

module.exports = config
```

