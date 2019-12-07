# 编写loader和plugin

## 最简单的Loader
其实`Loader`和它的`API`在官网有很清楚的解释：
+ <font color=#1E90FF>所谓 loader 只是一个导出为函数的 JavaScript 模块。loader runner 会调用这个函数，然后把上一个 loader 产生的结果或者资源文件(resource file)传入进去。函数的 this 上下文将由 webpack 填充，并且 loader runner 具有一些有用方法，可以使 loader 改变为异步调用方式，或者获取 query 参数。</font>
+ <font color=#1E90FF>第一个 loader 的传入参数只有一个：资源文件(resource file)的内容。compiler 需要得到最后一个 loader 产生的处理结果。这个处理结果应该是 String 或者 Buffer（被转换为一个 string），代表了模块的 JavaScript 源码。另外还可以传递一个可选的 SourceMap 结果（格式为 JSON 对象）。</font>
+ <font color=#1E90FF>如果是单个处理结果，可以在同步模式中直接返回。如果有多个处理结果，则必须调用 this.callback()。在异步模式中，必须调用 this.async()，来指示 loader runner 等待异步结果，它会返回 this.callback() 回调函数，随后 loader 必须返回 undefined 并且调用该回调函数。</font>


书写一个`loader`并不难，因为`Loader`本质上是一个函数，函数可以通过参数<font color=#DD1144>source</font>参数拿到解析文件中的代码，然后做一些变更，最后将修改后的`source`返回出去就可以了。比如我们写一个最简单的`Loader`，用来替换代码中的某些字符串：
```javascript
// webpack.config.js或者webpack.common.js
module.exports = {
	module: {
		rules: [
			{
				test: /\.js/,
				use : [
					{
						loader: path.resolve(__dirname, './loaders/replaceLoader.js'),
						options: {
							name:'taopoppy'
						}
					}
				]
			}
		]
	}
}
```
```javascript
// replaceLoader.js
const loaderUtils = require('loader-utils')
module.exports = function (source) {
	const options = loaderUtils.getOptions(this);
	return source.replace('tao',options.name)
}
```
+ <font color=#DD1144>首先在loader这个函数中你不能使用箭头函数，因为箭头函数会影响this</font>
+ <font color=#DD1144>其次我们在配置的时候书写的options中的内容不是通过参数传递到loader函数中的，而是通过this获取的，通过this.query.name就能获取到我们在配置文件中配置的name的值。</font>
+ <font color=#1E90FF>通过loaderUtils这个官方推荐的插件可以帮我们很好的规范this中的值，在字符串和对象之间做很好的处理。</font>

## Loader简单扩展
<font color=#1E90FF>**① 同步Loader**</font>

因为直接`retrun source`就只能返回`source`，而在[官网](https://www.webpackjs.com/api/loaders/)给出了很多可以在`Loader`函数中直接使用的`API`,其中有一个`this.callback`,它可以同时返回多个内容，所以无论是`return`还是 `this.callback`都可以同步地返回转换后的`source`内容：
```javascript
// replacceLoader.js
const loaderUtils = require('loader-utils')
module.exports = function (source) {
	const options = loaderUtils.getOptions(this);
	const content = source.replace('tao',options.name);
	this.callback(null, result)
	// this.callback能接受的参数还有很多，你可以到官网上去查
}
```

<font color=#1E90FF>**② 异步Loader**</font>

为了使用异步的`Loader`，我们需要借助另外一个`API`，叫做`this.async`，它的作用是<font color=#1E90FF>告诉 loader-runner这个loader将会异步地回调。返回this.callback。</font>，所以代码就能改变为：
```javascript
const loaderUtils = require('loader-utils')
module.exports = function (source) {
	const options = loaderUtils.getOptions(this);
	const callback = this.async
	setTimeout(() => {
		const content = source.replace('tao',options.name);
		callback(null, result)
	}, 1000);
}
```
这样的异步操作就得以实现，不过这样的异步操作会增加打包的时间，因为你配置的是1秒后执行的操作，所以会在原来同步打包时间的基础上增加1秒。

<font color=#1E90FF>**③ 自定义路径**</font>

可以看到我们自己书写了一个`Loader`后，在`webpack.config.js`中需要写路径，我们希望像第三方`loader`配置的时候直接书写`loader:'replaceLoader'`，那么我们就需要这样的配置：
```javascript
// webpack.config.js或者webpack.common.js
module.exports = {
	resolveLoader: {
		modules: ['node_modules','./loaders']
	},
	module: {
		rules: [
			{
				test: /\.js/,
				use: [
					{
						loader: 'replaceLoader',
						options: {
							name: 'taopoppy'
						}
					}
				]
			}
		]
	}
}
```
上面主要配置了<font color=#DD1144>resolveLoader</font>这属性，这样配置的意思就是使用`loader`的时候先到`node_modules`文件下找有没有，再去找`./loaders`这个路径下有没有。

关于`Loader`简单扩展就这么多，我想说的是:<font color=#DD1144>其实想真正去写一个loader你要的预备工作有很多，首先你要到[官网](https://www.webpackjs.com/api/loaders/)把这些关于Loader的API全部熟知一遍，然后找几个官网推荐且很成熟的loader去看看他们的源码，参照一下这些比较好的loader的写法，然后再去尝试去写一些可用的，有作用的Loader</font>

## 编写Plugin
编写一个`Plugin`是要比编写一个`Loader`，因为`webpack`有80%以上的代码都和插件有关，所以我们对`Plguin`应该有一个全新的理解：<font color=#DD1144>plugin是webpack的灵魂，它基于的设计模式是事件驱动模式或者发布订阅的模式</font>。

我们下面来书写一个打包完后会在`dist`目录下生成一个版权文件`copyright.txt`，里面包含一些版权信息:
```javascript
// webpack.common.js
const CopyRightWebpackPlugin = require('../plugins/copyright-webpack-plugin')
module.exports = {
	plugins: [
		new CopyRightWebpackPlugin({
			content: 'copyright is belong to taopooy'
		})
	]
}
```
```javascript
// plugins/copyright-webpack-plugin.js
class CopyrightWebpackPlugin{
	constructor(options){
		this.content = options.content || '赞无版权信息'
	}
	apply(compiler) {
		// 同步钩子的写法（和业务没有直接关系，只展示同步和异步的写法区别）
		compiler.hooks.compile.tap('CopyrightWebpackPlugin',(compilation)=> {
			console.log(this.content)
		})
		const content = this.content
		// 异步钩子的写法
		compiler.hooks.emit.tapAsync('CopyrightWebpackPlugin',(compilation,callback)=>  {
			debugger
			compilation.assets['copyright.txt'] = {
				source: function () {
					return content
				},
				size: function () {
					return content.length
				}
			}
			callback()
		})
	}
}

module.exports = CopyrightWebpackPlugin
```
+ 我们首先要说的就是：<font color=#1E90FF>插件并不是和loader一样的函数写法，是一种类的写法，所以你看到在webpack中的插件配置都是通过new来实例化的写法</font>
+ <font color=#1E90FF>options作为constructor的参数可以拿到我们在webpack中配置插件的时候传递的参数</font>
+ <font color=#DD1144>我们调用插件实际上在调用apply方法，compiler参数实际上是一个webpack的实例，包含webpack的所有配置和打包的信息</font>

以上基本是一个写`Plugin`需要注意的最基础的部分，那么我们之前就说过：<font color=#1E90FF>插件是在webpack从开始打包到打包结束这段期间，在某个时刻是执行的一段逻辑</font>，那么问题就来了，这个时刻是怎么确定的?在`vue/react`中我们知道有一些给定的生命周期函数，我们可以在这里去在固定的某个组件周期中写逻辑，同样的，<font color=#DD1144>对于webpack中的plugin，它提供的compiler.hooks来提供打包周期中的某个时刻</font>，所以我们重点要来说说这个`compiler hooks`

首先在官网给出了明确的原理和使用方法：
+ <font color=#DD1144>Compiler支持可以监控文件系统的监听(watching)机制，并且在文件修改时重新编译。当处于监听模式(watch mode)时，compiler会触发诸如watchRun, watchClose和invalid等额外的事件。通常用于开发环境中使用，也常常会在 webpack-dev-server这些工具的底层之下调用，由此开发人员无须每次都使用手动方式重新编译。还可以通过 CLI 进入监听模式。</font>

+ 相关钩子：以下生命周期钩子函数，是由`compiler`暴露，可以通过如下方式访问：
	```javascript
	compiler.hooks.someHook.tap(...)
	```
	取决于不同的钩子类型，也可以在某些钩子上访问`tapAsync`和`tapPromise`。
+ 我们在上个例子中使用的是`emit`这个钩子，这个钩子官方给出的定义是：<font color=#1E90FF>生成资源到 output 目录之前</font>。所以我们在这个时刻向资源中添加一个`copyright.txt`文件，使之生成到`dist`目录下。
 
在说完了`compiler`我们还需要来说一下`compilation`，它和`compiler`虽然长的很像，但是有比较大的区别，<font color=#DD1144>compiler是包含webpack的所有配置内容，而compilation只包含本次打包中的相关内容</font>,所以我们想知道`compilation`到底有哪些东西，我们可以通过`node`调试看一下：
+ 首先我们要打断点，我们在断点处书写了`debugger`
+ 启动这样的命令：`node --inspect --inspect-brk node_modules/webpack/bin/webpack.js --config ./build/webpack.prod.js`
+ 打开浏览器，开发开发者调试工具，点击左上角的`node`的绿色标志
+ 提前在`watch`中输入要监控的对象`compilation`，然后运行代码到断点处，即可看到`watch`中的`compilation`对象所有的属性
<img :src="$withBase('/webpack_five_pugin_debugger.png')" alt="插件调试">

实际上这也不仅仅是我们书写`webpack`插件调试插件的方法，也是我们在其他`node`程序中编写程序的调试方法。