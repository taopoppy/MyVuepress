# webpack性能优化

## webpack打包速度的优化
### 1. 跟上技术的迭代
这个都不用解释，因为`webpack`是运行在`Node`环境下的，项目的依赖都是使用的`npm`或者`yarn`这样的包管理工具，所以使用高版本且稳定的`node`、`npm`、`yarn`总是没错的。

### 2.在尽可能少的模块上应用Loader
意思就是当你使用某个`loader`去打包某种文件的时候，最好标注这个`loader`所处理文件的范围，比如下面这样明确使用<font color=#1E90FF>include</font>或者<font color=#1E90FF>exclude</font>参数标明`loader`的作用范围就能减少不必要的打包
```javascript
// include写法
{
	test: /\.js$/,
	include: path.resolve(_-dirname,'../src'),
	use: ['babel-loader', 'eslint-loader']
}
// exclude写法
{
	test: /\.js$/,
	exclude: /node_modules/,
	use: ['babel-loader', 'eslint-loader']
}
```
像上面这种`js`文件是需要这样的限制条件的，因为像`node_modules`中的第三方包都是已经通过`babel`编译过也通过`eslint`检查过了，不然怎么能上传到`npm`上，所以我们自己打包项目的时候没有必要在重复一次。但是像图片这种资源我们就没必要去添加这种限制条件，因为无论图片在哪里都必须要经过我们使用的`loader`来处理。

### 3. Plugin尽可能精简并且确保可靠
首先确保在一次打包中没有对使用的`plugin`浪费，比如我们生产环境下要对`css`文件进行压缩，所以我们使用到了`OptimizeCSSAssetsPlugin`这个插件，但是开发环境就没必要使用这个插件，所以开发环境使用这个插件不但会增加打包时间，降低打包速度，还不利于我们对`css`的修改和查错。

同时这些插件都是官网上的推荐的插件，都是通过社区验证的，我们要相信社区和官网的力量。

### 4. resolve参数的合理配置
之前我们在项目当中并没有使用`resolve`这个参数来配置项目，就是因为这个参数能不用就不用，我们下面先来说明它有哪些配置，然后并且说明为什么要避免这个参数配置过多。

<font color=#1E90FF>**① extensions**</font>

比如我们书写了一个文件为`child.jsx`，它的目录在`src/child/child.jsx`下面，那么按照文件的类型我们会在引用这个组件的文件中这样引入：
```javascript
import Child from './child/child'
```
我们在这里没有使用文件名的后缀，所以直接启动一定会报错，<font color=#1E90FF>因为如果没有配置resolve参数的话，默认只会找js类型的文件</font>，我们这里的`child`是`jsx`类型的文件， 我们如果要使用这样的引入方式，就必须在`webpack.common.js`中这样配置：
```javascript
// webpack.common.js
module.exports = {
  resolve: {
    extensions: ['.js','.jsx']
  },
}
```
这样的配置就是说：<font color=#DD1144>当你引入某个组件或者模块的时候，没有加后缀名，那么webpack会按照extentions中数组中元素的顺序去一个一个匹配</font>，比如说上面的这个例子，它会先按照你给的路径去找`src/child/child.js`文件存在不，再去找`src/child/child.jsx`文件存在不，所以不建议这个属性加太多配置的原因就是如此：<font color=#DD1144>extentions的元素越多会增加文件类型查找的次数，会降低打包的速率</font>

<font color=#1E90FF>**② mainFiles**</font>

这个参数我们就最好别使用，因为特别蠢，为什么，因为按照上面的例子有的人还会这样引入`src/child.child.jsx`
```javascript
import Child from 'src/child/'
```
然后他在`webpack.common.js`中这样配置：
```javascript
// webpack.common.js
module.exports = {
  resolve: {
		extensions: ['.js','.jsx'],
		mainFiles: ['index','child']
  },
}
```
<font color=#DD1144>mainFiles的意思就是当你引入一个组件的路径没有具体到文件，而是具体到目录，它会先在这个目录下找index名称的文件，然后找child名称的文件</font>。这种配置真的蠢，<font color=#DD1144>你本来直接写`import Child from 'src/child/child.jsx'`就完事了，现在非要这样配置，那么webpack会先找index，一看没有，然后找child.js，然后找child.jsx才找到，浪费了时间不说，还浪费了性能，更重要的是根本没有必要</font>。

<font color=#1E90FF>**③ alias**</font>

这个参数是个别名的意思，比如说我们在项目中写了这样的代码：
```javascript
import Child from 'taopoppy'
```
`webpack`或者`es module`压根不认识`taopoppy`，它既不是我们写的模块也不是第三方包，它只是我们给`src/child/child/jsx`这个文件导出的组件起了一个别名，所以要想让上面的写法起效就要在`webpack.common.js`中去配置：
```javascript
// webpack.common.js
module.exports = {
	resolve: {
		alias:{
			taopoppy: path.resolve(__dirname, '../src/child/child.jsx')
		}
	}
}
```
这种配置有必要么，没有必要，但是它也并非没有使用的场景，比如引入文件的路径嵌套太深，或者有些第三方包中有许多版本，我们想引入其他版本，就能用到这个东西，比如我们想引入`vue`的其他版本就可以这样写，这也是`vue`服务端渲染中的一个例子，正好可以在这里作为例子拿出来讲解，我们正常使用`import Vue from 'vue'`其实引入的是`../node_modules/vue/dist/vue.runtime.ems.js`这个文件,生产环境引入的其实是`../node_modules/vue/dist/vue.runtime.min.js`这个文件,想要更换其他版本的文件就要这样做：
```javascript
  resolve: {
    alias: {
			'vue': path.join(__dirname, '../node_modules/vue/dist/vue.esm.js')  
    }
  },
```
这样我们使用`import Vue from 'vue'`你引入的`vue`文件就是`vue.esm.js`了。所以这个属性在有必要的时候去使用，不建议给大量的文件起别名，还是直接通过路径引入比较直观。

### 5. 使用DllPlugin提高打包速度
我们知道在打包的过程中，其实第三方的一些模块是不会变的，<font color=#1E90FF>但是我们每次使用npm run build就会重新对这些第三方包进行分析，这其实占用了一些打包的时间</font>，我们希望的方式是这样：<font color=#DD1144>对于这些第三方模块，我们希望开始就打包一次，做一次分析，然后后面的打包都能利用第一次的分析结果，这样就能提高打包的速率</font>

我们在`index.js`当中去书写这样的代码：
```javascript
// index.js
import React, { Component } from 'react'
import ReactDom from 'react-dom'
import _ from 'lodash'

class App extends Component {
	render() {
		return (
			<div>
				<div>{_.join(['this','is','taopoppy'], ' ')}</div>
			</div>
		)
	}
}
ReactDom.render(<App />, document.getElementById('root'))
```
那这样的代码引用了3个第三方库，分别是`React`、`ReactDom`和`lodash`，所以我们现在就在`build`目录下面创建一个`webpack.dll.js`文件，然后代码如下：
```javascript
// webpack.dll.js
const path = require('path')
module.exports = {
	mode: 'production',
	entry: {
		vendors: ['react','react-dom','lodash']
	},
	output: {
		filename: '[name].dll.js',
		path: path.resolve(__dirname,'../dll'),
		library: '[name]'
	}
}
```
然后这样的配置是什么意思呢？<font color=#1E90FF>分别对react、react-dom、lodash这三个库打包到dll文件下，名称为vendors.dll.js，并且配置了库的形式，所以如果index.html引入它就在全局有了一个变量叫做vendors，就包含了三个库中的内容</font>,所以此时我们需要使用一个插件来让我们最终的`html`模块中可以引用到这个文件:
```javascript
npm install add-asset-html-webpack-plugin --save
```
```javascript
// webpack.common.js
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')
module.exports = {
	plugins: [
		new AddAssetHtmlWebpackPlugin({
      filepath: path.resolve(__dirname,'../dll/vendors.dll.js')
    }),
	]
}
```
此时此刻我们已经完成了第一阶段的目标：<font color=#DD1144>第三方模块只打包了一次</font>，我们可以添加命令：
```javascript
// package.json
{
	"script": {
		"build:dll":"webpack --config ./build/dll/vendors.dll.js"
	}
}
```
通过先启动`npm run build:dll`生成`dll/vendors.dll.js`,然后启动`npm run dev`，就能在浏览器中的命令行中看到`vendors`这个全局变量，但是接下来我们要做的就是另外一件事：<font color=#DD1144>让业务逻辑（index.js）中引入的react，react-dom，lodash等第三方包都从vendors这个全局变量中拿，而不是从node_modules中去拿</font>

我们到`webpack.dll.js`中添加一下插件配置：
```javascript
// webpack.dll.js
module.exports = {
  plugins: [
		// 使用这个插件来分析库中的映射关系，分析结果放在path中
		new webpack.DllPlugin({
			name: '[name]',
			path: path.resolve(__dirname,'../dll/[name].manifest.json')
		})
	]
}
```
然后使用`npm run build:dll`在`dll`目录下就会生产`vendors.manifest.json`的映射文件，然后我们到`webpack.common.js`中使用另一个插件来使用这个映射文件：
```javascript
// webpack.common.js
module.exports = {
	plugins: [
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname,'../dll/vendors.manifest.json')
    }),
	]
}
```
这样我们就完成了，我们的目的也就达到了，实现了<font color=#DD1144>在业务逻辑中去第三方包的时候会通过DllReferencePlugin这个插件来检测第三方包是否在映射关系中，如果在，就直接去第一阶段我们实现的全局变量vendors中拿结果就行了，如果没有，再去node_modules去找，去分析，这样下来大大减少了打包时间，整个流程如下</font>：
<img :src="$withBase('/webpack_four_dllplugin.png')" alt="">

当然了这样打包后的`vendors.dll.js`体积会很小，那么随着项目扩大，引入的第三方包越来越多，那么`vendors.dll.js`的体积势必会越来越大，我们还可以做分割,先在`webpack.dll.js`中这样配置入口：
```javascript
// webpack.dll.js
module.exports = {
  entry: {
		vendors: ['lodash'],
		react: ['react','react-dom']
	},
}
```
这样执行`npm run build:dll`,就会生成四个文件<font color=#1E90FF>react.dll.js</font>、<font color=#1E90FF>vendors.dll.js</font>、<font color=#1E90FF>react.manifest.json</font>、<font color=#1E90FF>vendors.manifest.json</font>,所以我们在`webpack.common.js`中就要这样配置：
```javascript
// webpack.common.js
module.exports = {
	plugin: [
    new AddAssetHtmlWebpackPlugin({
      filepath: path.resolve(__dirname,'../dll/vendors.dll.js')
		}),
    new AddAssetHtmlWebpackPlugin({
      filepath: path.resolve(__dirname,'../dll/react.dll.js')
    }),
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname,'../dll/vendors.manifest.json')
		}),
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname,'../dll/react.manifest.json')
    }),
	]
}
```
此时在`index.html`中最先引入的就是`vendors.dll.js`和`react.dll.js`

如果分割的模块多了，你可以单独写一个`node`程序去循环往`plugins`中添加这些插件。
```javascript
// webpack.common.js
const files = fs.readdirSync(path.resolve(__dirname,'../dll'))
files.forEach(file => {
	if(/.*\.dll.js/.test(file)){
		plugins.push(
		  new AddAssetHtmlWebpackPlugin({
	    	filepath: path.resolve(__dirname,'../dll',file)
		  }),
		)
	}
	if(/.*\.manifest.json/.test(file)){
		plugins.push(
		  new webpack.DllReferencePlugin({
		    manifest: path.resolve(__dirname,'../dll',file)
		  }),
		)
	}
});
```
### 6. 控制包文件大小
当我们打包出来的文件如果太大，命令行里就有提示，而且太大的文件加载速度就会很慢，我们的做法就是
+ 利用`Tree-shaking`过滤被引用组件中的没有使用到的代码
+ 使用代码分割来将大的文件来分离成小的文件，涉及到的知识我们在之前的`Code-splitting`和`Lazy-loading`中都有详细的介绍。

### 7. 多进程打包
可以使用到`thread-loader`,`parallel-webpack`,`happypack`等等这些工具进行打包，这些工具如果你有兴趣可以到官网自行查询

### 8. 合理的使用sourceMap
关于怎么配置`sourceMap`以及不同环境下`devtoos`的最佳实践我们之前都有详细的介绍，可以回头在仔细查看一下。

### 9. 结合stats分析打包结果
通过命令来生成相关的打包文件，利用工具来检查打包过程的各个细节。这个我们在之前也有详细的介绍。这里就不多赘述。

## 多页面打包
多页面打包是一个比较简单的东西，<font color=#DD1144>本质上就是在配置多个entry和多个HtmlWebpackPlugin插件而已</font>

比如我们现在有两个`js`文件都要通过同一个模板来渲染，并且打包到`dist`是两个`html`文件，我们先来写两个`js`文件：
```javascript
// index.js
import React, { Component } from 'react'
import ReactDom from 'react-dom'
import _ from 'lodash'
class App extends Component {
	render() {
		return (
			<div>
				<div>{_.join(['this','is','taopoppy'], ' ')}</div>
			</div>
		)
	}
}
ReactDom.render(<App />, document.getElementById('root'))
```
```javascript
// list.js
import React, { Component } from 'react'
import ReactDom from 'react-dom'
class List extends Component {
	render() {
		return (
			<div>
				<div>this is listPage</div>
			</div>
		)
	}
}
ReactDom.render(<List />, document.getElementById('root'))
```
然后我们配置`webpack.common.js`:
```javascript
// webpack.common.js
module.exports = {
  entry: {
    main: './src/index.js',
    list: './src/list.js'
	},
	plugins: [
    new HtmlWebpackPlugin({
      template:'src/index.html',
      filename: 'index.html', // 最终在dist生成一个index.html的文件
      chunks: ['runtime','vendors','main'] // 里面加载的js文件有runtime.[hash].js,vendors.dll.js,main.[hash].js
    }),
    new HtmlWebpackPlugin({
      template:'src/index.html',
      filename: 'list.html',// 最终在dist生成list.html的文件
      chunks: ['runtime','vendors','list'] // 里面加载的js文件有runtime.[hash].js,vendors.dll.js,list.[hash].js
    }),
	]
}
```
实现上面的配置就可以了，这里无非就要<font color=#1E90FF>多些几个HtmlWebpackPlugin的插件和其中的配置而已</font>,这里特别要注意，<font color=#1E90FF>vendors.dll.js文件在html中的加载不是通过HtmlWebpackPlugin插件中的chunks配置加进去的，而是通过之前我们使用的AddAssetHtmlWebpackPlugin插件加进去的，因为有一部分的第三方包我们会通过dllPlugin的配置提前打包一次，他们是通过AddAssetHtmlWebpackPlugin插件加到html文件中的，而还有一部分引入的第三方包我们没有在webpack.dll.js的入口中配置，按照splitChunks的配置还会打包到vendors这个chunks当中，所以还需要通过在HtmlWebpackPlugin的chunks属性数组值中添加vendors才能使用</font> 

但是如果页面多起来了的话，我们就不用在`plugins`中逐个写`HtmlWebpackPlugin`插件了，可以通过写一段逻辑代码循环向`plugins`数组中添加`HtmlWebpackPlugin`插件：
```javascript
// webpack.common.js
Object.keys(entry).forEach(item => {
	plugins.push(
		new HtmlWebpackPlugin({
      template:'src/index.html',
      filename: `${item}.html`,
      chunks: ['runtime','vendors',`${item}`]
	)
})
```

**参考资料**
1. [https://www.webpackjs.com/guides/build-performance/](https://www.webpackjs.com/guides/build-performance/)