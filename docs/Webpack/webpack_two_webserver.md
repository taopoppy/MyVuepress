# WebpackDevServer

## WebpackDevServer
通过上面的学习，我们会发现一个比较麻烦的问题，就是每次我们修改了配置，我们必须手动的去当前项目所在的命令行当中手动输入`npx webpack`或者`npm run bundle`命令才能重新打包，我们现在希望在修改后代码它就能自动帮助我们重新启动，我们现在有这样的3种模式:

### 1. watch
我们可以在`package.json`的`script`标签当中去配置这样的命令：
```javascript
// package.json
{
  "scripts": {
    "watch": "webpack --watch"
  },
}
```
通过<font color=#1E90FF>npm run watch</font>可以监听要打包的文件，当我们修改了源码文件，在保存的时候`webpack`监听到打包文件有变动，会重新打包，然后我们再去浏览器重新刷新即可。

### 2. WebpackDevServer
当然上面的方法还不是最好的，我们希望重新打包的同时还能帮助我们打开浏览器，同时还能模拟一下服务器的特性，此时就是<font color=#DD1144>webpackDevServer</font>上场的时候了。<font color=#1E90FF>webpackDevServer能在我们配置的目录下面启动一个默认端口为8080的服务器，不仅能够感知文件内容的变化，还能在重新打包后帮助我们顺便刷新浏览器</font>

当然了，`webpack`内置了这样一个东西的配置，需要我们去安装<font color=#1E90FF>webpack-dev-server</font> 
```javascript
npm install webpack-dev-server -D
```
然后我们到`package.json`当中去添加一个启动参数，使用`webpack-dev-server`帮助我们在开发时启动：
```javascript
// package.json
{
  "scripts": {
    "start": "webpack-dev-server"
  },
}
```
最后，我们只需要关注怎么在`webpack.config.js`当中配置<font color=#1E90FF>devServer</font>这个属性即可。
```javascript
// webpack.config.js
module.exports = {
	devServer: {
    	contentBase: './dist', // 服务器启动在dist目录下
		open: true             // 启动webpack-dev-server的同时打开浏览器
		proxy: {
			'/api': 'http://localhost:3000' 
			// 开启代理，访问localhost:8080/api相当于实际在访问http://localhost:3000
    }
  },
}
```

为什么我们要借助`webpack-dev-server`来启动服务器呢? 
+ <font color=#1E90FF>我们可以看到之前我们通过文件打开的dist/index.html网页是文件协议，假如这个html页面当中存在ajax之类的网络请求，必须要依靠http这种协议，而文件协议是不支持的，所以，我们通过http://localhost:8080打开dist/index.html就能支持关于网络请求的所有操作。</font>

这里顺便也提及一下，<font color=#DD1144>像vue/react这种脚手架工具当中，也使用了webpack当中的这个devServer的配置开启了一个服务器来运行页面。所以在vue/react当中可以使用代理的原因就是因为webpack底层就支持这样跨域代理，所以各个脚手架能支持代理的原因就是如此。</font>

### 3. webpack-dev-middleware
在早期的`vue/react`，他们的脚手架当中并没有直接使用`webpack`的`devServer`的配置，因为早期的`webpackDevServer`配置极少，运行不稳定，导致开发人员会自己写一个服务器，然后通过`webpack-dev-middleware`这个容器把打包后的文件传递给服务器。接下来是一个`webpack-dev-middleware`配合`express server`的示例。首先，安装`express`和`webpack-dev-middleware`：
```javascript
npm install --save-dev express webpack-dev-middleware
```
接下来我们需要对`webpack`的配置文件做一些调整，以确保中间件(middleware)功能能够正确启用：
```javascript
// webpack.config.js
module.exports = {
	    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/' // 以确保文件资源能够在 http://localhost:3000 下正确访问
    }
}
```
接着我们开始自己书写一个自定义的`express`服务器：
```javascript
  webpack-demo
  |- package.json
  |- webpack.config.js
+ |- server.js
  |- /dist
  |- /src
    |- index.js
    |- print.js
  |- /node_modules
```
```javascript
// server.js
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);  // 返回的编译器，运行一次这个编译器实际上就会打包一次代码

app.use(webpackDevMiddleware(compiler, {
	publicPath: config.output.publicPath   
	// 通过编译器打包后将结果传递给 '/'，启动服务器，打包的内容就在localhost:3000/ 下面
}));

// Serve the files on port 3000.
app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});
```
最后我们启动服务器，`node server.js`，同样可以实现和`webpack-dev-server`一样的功能，但是，毕竟手动写这样的服务器要想实现和`webpack-dev-server`一样丰富的功能是很困难的，所以你知道能这样写就可以了。现在的`webpackDevServer`已经很智能和功能强大了。

### 4. 总结
<font color=#1E90FF>我们最后要注意一个问题，就是当使用了webpackDevServer之后呢，打包之后我们在文件中看不到dist文件了，这是因为webpackDevServer将dist保存在了电脑内存当中，没有保存在电脑的磁盘里。因为对磁盘文件这种I/O操作很慢，而放在电脑内存当中会很快。
</font>
## HotModuleReplacement
那么学习了上面`webpackDevServer`之后我们要想一个问题，它能帮我们自动在文件发生变化的时候去重新打包，按照我们之前使用的`htmlWebpackPlugin`和`cleanWebpackPlugin`，基本上重新打包后的代码都都是新的一份，这样其实在我们边开发边调试的时候是不方便的，我们需要它只去更新我们更改的部分，并不是从头开始。那么这个时候<font color=#DD1144>HotMoudleReplacement</font>就派上用场了。

```javascript
const webpack = require('webpack') // 引入

module.exports = {
  devServer: {
    hot: true,   // 开启热更新
    hotOnly: true // 热更新有效的时候去刷新浏览器
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin() // 使用插件
  ],
}
```
### 1. css示例
```javascript
// index.js
import './style.css'

var btn = document.createElement('button')
btn.innerHTML = '新增'
document.body.appendChild(btn)

btn.onclick = function() {
	var div = document.createElement('div')
	div.innerHTML = 'item'
	document.body.appendChild(div)
}
```
```css
div:nth-of-type(odd) {
	background: yellow;
}
```
如果我们没有启用热更新，我们在页面上进行一些列的`dom`操作后，会在页面产生很多`div`，偶数的`div`背景是黄色，结果我们去修改了一下`css`,把黄色改为蓝色，结果回到浏览器，刚才产生的`div`都不见了，就是因为没有热更新，我们的`webpackDevServer`自动重新打包所有文件，刚才页面操作产生的`dom`节点和相关数据统统被清理了，浏览器刷新后就回到了最初的样子。

使用了<font color=#1E90FF>HotModuleReplacement</font>之后，<font color=#DD1144>它就只会检测到css文件产生了变化，就只会去重新打包css文件然后替换，对于js产生的内容是不做修改的。</font> 

### 2. js示例
```javascript
// counter.js
function counter() {
	var div = document.createElement('div')
	div.setAttribute('id','counter')
	div.innerHTML = 1
	div.onclick = function() {
		div.innerHTML = parseInt(div.innerHTML,10) + 1
	}
	document.body.appendChild(div)
}
export default counter
```
```javascript
// number.js
function number() {
	var div = document.createElement('div')
	div.setAttribute('id','number')
	div.innerHTML = 2000
	document.body.appendChild(div)
}

export default number
```
```javascript
// index.js
import counter from './counter.js'
import number from './number.js'

counter()
number()

// 热更新的额外处理逻辑
if(module.hot) {
	module.hot.accept('./number', ()=> {
		document.body.removeChild(document.getElementById('number'))
		number()
	})
	module.hot.accept('./counter', ()=> {
		document.body.removeChild(document.getElementById('counter'))
		number()
	})
}
```
可以看到，当我们使用`HotModuleReplacement`来处理`javascript`的时候，我们需要对引入的模块做一下逻辑的处理，这些逻辑的处理都写在`module.hot.accept`函数的第二个参数当中，表示的含义是：<font color=#1E90FF>当这个js模块发生了变化，为了不重新加载所有的模块，我单独对这个模块做重新加载的处理，以避免影响其他js模块已经使用并且产生的数据</font>

<font color=#DD1144>其实对于所有的热更新模块都需要写类似于js的这种额外的逻辑语句，但是为什么像css模块，图片模块不用写呢，因为类似于这样的处理代码都在像css-loader、file-loader、vue-loader当中内置了，所以我们不用去额外的书写，但是js和一些特殊的数据文件需要我们这样来处理它的热加载逻辑</font>

**参考资料**

1. [https://www.webpackjs.com/guides/development/](https://www.webpackjs.com/guides/development/)
2. [https://www.webpackjs.com/configuration/devtool/](https://www.webpackjs.com/configuration/devtool/)
3. [https://www.webpackjs.com/configuration/dev-server/](https://www.webpackjs.com/configuration/dev-server/)
4. [https://www.webpackjs.com/guides/hot-module-replacement/](https://www.webpackjs.com/guides/hot-module-replacement/)
5. [https://www.webpackjs.com/api/hot-module-replacement/](https://www.webpackjs.com/api/hot-module-replacement/)
6. [https://www.webpackjs.com/concepts/hot-module-replacement/](https://www.webpackjs.com/concepts/hot-module-replacement/)