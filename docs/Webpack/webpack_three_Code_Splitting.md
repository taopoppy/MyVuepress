# Code-Splitting

## 什么是Code-Splitting
为了解释<font color=#DD1144>代码分割</font>，我们需要先写一个简单的例子并进行打包分析
```javascript
import _ from 'lodash' // 需要npm i lodash --save

// 此时假如有很多业务代码，业务代码中也使用了很多lodash的方法
console.log(_.join(['a','b','c']));
```
上述代码是一段很简单的代码，我们通过打包后会有这样的一过程，会将<font color=#1E90FF>业务代码</font>和<font color=#1E90FF>大部分的lodash第三方包的代码</font>（因为会经过Tree-Shaking的过滤，所以说是大部分）打包到同一个文件上线，假如第三方包有1M，业务代码有1M,打包后的`js`文件有2M，那么用户在加载页面的时候就会加载2M的内容。然后业务逻辑发生了变化，重新打包，此时依旧会把没有修改的第三包的代码和修改后的业务代码打包，又是2M。<font color=#DD1144>用户重新加载页面的时候又要重新加载2M的东西，而实际上大部分的第三方包的代码并不会改变，用户无需重复加载相同的第三包中的代码</font>

所以我们来分析一下两种方式打包的过程： 

<font color=#1E90FF>**① 无代码分割**</font>
+ 首次访问页面时，加载`main.js`（2M）
+ 当页面业务逻辑发生变化的时候，又要加载2M的内容

<font color=#1E90FF>**② 有代码分割**</font>
+ `main.js`被拆分成为`lodash.js`（1M）和`main.js`（1M）
+ 当页面业务逻辑发生变化的时候，只需要加载`main.js`，而`lodash.js`在上一次被缓存过，无需重新加载

所以`Code-Splitting`的含义就是，<font color=#DD1144>通过分离一些类似于第三包这种不变的代码使其缓存，来提高下一次加载页面的速率</font>

## webpack配置
那么说到代码分割，和`webpack`本质上有关系么。<font color=#DD1144>Code-Splitting本质上和webpack没有关系</font>，那么为什么现在一使用到`webpack`人们就能和代码分割联系到一起呢?因为在新版本的`webpack`当中有个插件叫做<font color=#1E90FF>split-chunks-plugin</font>可以帮助我们轻松完成这种代码分割的功能，当然我们手动也能做代码分离，只不过对于如今第三方包群英荟萃的时代，手动的东西已经很落后和效率低下了。

### 1. 同步分割
同步分割的方式比较简单，<font color=#1E90FF>会按照你的第三方包引入的顺序分别将业务逻辑代码和第三方包的代码分开打包，并按照顺序添加到html中的script标签中</font>
```javascript
// webpack.common.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
}
```
在`webpack`上这样简单的配置之后，然后重新打包，无论是开发环境还是生产环境，都会多打包出来一个<font color=#1E90FF>vendors~main.js</font>文件出来，这个里面就是第三包的内容，然后挂载到`index.html`文件中就是这样：
```html
<script type="text/javascript" src="vendors~main.js"></script>
<script type="text/javascript" src="main.js"></script></body>
```

### 2. 异步分割
我们在`index.js`书写下面的这样的代码：
```javascript
function getComponent() {
	return import('lodash').then(({default: _}) => {
		var element = document.createElement('div')
		element.innerHTML = _.join(['hello ','taopoppy'])
		return element
	})
}

getComponent().then(element => {
	document.body.appendChild(element)
})
```
笔者此时写这篇文章的时候已经支持这种`ES6`动态引入的语法，但是保不齐有的人还用的老版本，老版本会提示这样的问题：<font color=#1E90FF>所以如果遇到这样试验性质语法的报错，我们需要靠babel的一些插件来解决这个问题</font>，我们首先来下载和在`babel`当中来配置：
+ 下载插件：
	```javascript
	npm install babel-plugin-dynamic-import-webpack --save-dev
	```
+ 插件配置
	```javascript
	// .babelrc
	{
		"presets": [
		],
		"plugins": [
			"dynamic-import-webpack" // 这里进行配置
		]
	}
	```

如果你有不识别动态语法引入的问题，按照上面这样配置即可，接着我们来分析打包后的文件： <font color=#1E90FF>打包后生成的三个文件，其中lodash被动态引入打包到了0.js文件当中，而延误代码依然被打包到了main.js当中</font>。

### 3. 总结
+ <font color=#DD1144>同步代码</font>：<font color=#1E90FF>只需要在webpack.common.js中做optimization的配置即可</font>
+ <font color=#DD1144>异步代码</font>：<font color=#1E90FF>通过import().then这种语法引入，无需做任何配置，也会自动进行代码分割，放置在新的文件当中</font>
+ <font color=#DD1144>weback配置</font>：<font color=#1E90FF>虽然异步代码无需配置就能自动代码分割，但是配置了webpack.common.js当中的optimization依旧会对异步代码有影响，后面你就会看到</font>

## SplitChunksPlugin配置
### 1. 魔法注释
值得注意的是我们在通过上面的异步代码的打包后的名称为`0.js`我们想改个名字，<font color=#1E90FF>之所以是这样的命名是因为webpack默认将0作为整个lodash模块的chunkName了</font>，我们可以这样修改代码：
```javascript
// index.js
function getComponent() {
	return import(/*webpackChunkName:"lodash"*/'lodash').then(({default: _}) => {
		var element = document.createElement('div')
		element.innerHTML = _.join(['hello ','taopoppy'])
		return element
	})
}

```
通过在异步引入的同时添加<font color=#DD1144>魔法注释</font>来修改`lodash`的`ChunkName`，这样进行打包后`lodash`模块就会单独打包到名字叫做<font color=#1E90FF>vendors~lodash.js</font>的文件当中。

但是如果你使用的是老的版本，并且配置了`babel-plugin-dynamic-import-webpack`这个`babel`插件的话，这个插件并不认识这种魔法注释，所以无法做到将`lodash`的`ChunkName`修改，所以如果你是老的版本的话，要使用官方的插件来替换之前的第三方插件：
+ 安装插件
	```javascript
	npm install --save-dev @babel/plugin-syntax-dynamic-import
	```
+ 插件配置
	```javascript
	// .babelrc
	{
		"presets": [
			...
		]
		"plugins": [
			"@babel/plugin-syntax-dynamic-import"  // 这里替换babel-plugin-dynamic-import-webpack
		]
	}
	```
	
当然了，不管是老版本还是新版本，你打包后的文件都叫做`vendors~lodash.js`，我们希望能不能不要那个`vendors`了，直接叫做`lodash.js`，那么我们就要去修改`webpack.common.js`当中的`optimization`中的`splitChunks`配置，新老版本都是如此。但是`splitChunks`的配置很多，我们必须单独拿出来讲。

### 2. splitChunks
首先我们要明白关于`splitChunks`是有一套默认的配置，也就是说下面两种配置效果一样：
```javascript
// webpack.common.js
module.exports = {
	optimization: {
		splitChunks: {}
	},
}

```
```javascript
// webpack.common.js
module.exports = {
	optimization: {
		splitChunks: {
			chunks: "async",
			minSize: 30000,
			minChunks: 1,
			maxAsyncRequests: 5,
			maxInitialRequests: 3,
			automaticNameDelimiter: '~',
			name: true,
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					priority: -10
				},
				default: {
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true
				}
			}
		}
	}
}

```
+ <font color=#DD1144>chunks</font>
	+ <font color=#1E90FF>"initial"</font>:代码分割只对同步代码有效，对异步代码无效，同步代码还必须额外对cacheGroups中的vendors做好配置才有效。
	+ <font color=#1E90FF>"async"</font>:代码分割只对异步代码有效，同步引入的代码不会做代码分割。
	+ <font color=#1E90FF>"all"</font>: 代码分割对同步异步都有效，只不过同步代码还必须额外的对cacheGroups中的vendors做好配置才有效。
+ <font color=#DD1144>minSize</font>（<font color=#3eaf7c>一般不动</font>）
	+ 模块小于30000字节不予代码分割，大于30000字节才做代码分割
+ <font color=#DD1144>minChunks</font>（<font color=#3eaf7c>一般不动</font>）
	+ 至少引用几次才能做代码分割，默认配置为1，引入1次就会被进行代码分割。
+ <font color=#DD1144>maxAsyncRequests</font>（<font color=#3eaf7c>一般不动</font>）
	+ 同时加载的魔块数最多是5个。
+ <font color=#DD1144>maxInitialRequest</font>（<font color=#3eaf7c>一般不动</font>）
	+ 整个网站首页加载的时候，或者入口文件做代码分割，最多分割出3个
+ <font color=#DD1144>automaticNameDelimiter</font>（<font color=#3eaf7c>一般不动</font>）
	+ 文件名称前缀和后缀的连接符
+ <font color=#DD1144>name</font>（<font color=#3eaf7c>一般不动</font>）
	+ 保证`cacheGroups`这个配置对打包文件的名称命名有效
+ <font color=#DD1144>cacheGroups</font>
	+ <font color=#1E90FF>vendors</font>: 如果加载的模块在`node_modules`当中，或者说属于`npm`下载的第三方包，<font color=#3eaf7c>会分到vendors这个组当中，所以打包后模块文件会以vendors最为前缀,然后会以入口文件的chunk为后缀，所以打包出来为vendors~main.js</font>，如果你添加了`vendors`当中的`name`参数，那么打包后的文件名会按照你`name`的值命名，比如`name: 'vendors'`，那么最终打包出来的文件名字就不是`vendors~main.js`，而是`vendors.js`
		```javascript
		vendors: {
			test: /[\\/]node_modules[\\/]/,
			priority: -10,
			name: 'vendors'
		},
		```
		另外<font color=#DD1144>priority</font>这属性表示优先级的意思，比如你在项目当中使用了一个`jquery`，实际上它即符合`vendors`组的要求，也符合`default`组的要求，因为`default`中压根没有`test`匹配要求，实际上所有的模块都符合它。所以`priority`值越大，优先级越高，这样`jquery`就分配到了优先级比较高的`vendors`组当中了。
	+ <font color=#1E90FF>default</font>：如果加载的模块不符合其他组的条件就会走到`default`这个组来。其中<font color=#DD1144>reuseExistingChunk</font>的意思是避免重复打包相同的模块，从字面意思也能看出来，拒绝已存在的Chunk。

所以到目前为止，基本上`splitChunks`的默认配置就搞定了，最难的还是同步代码的配置，因为`chunks`和`cacheGroups`两个配置是相互起作用的。也就是`chunks`中配置了同步代码分割有效，但是至于具体对同步代码怎么分割，还要走到`cacheGroups`的配置才知道分割的流程。


**参考文档**

1. [https://www.webpackjs.com/guides/code-splitting/](https://www.webpackjs.com/guides/code-splitting/)
2. [https://www.webpackjs.com/plugins/split-chunks-plugin/](https://www.webpackjs.com/plugins/split-chunks-plugin/)