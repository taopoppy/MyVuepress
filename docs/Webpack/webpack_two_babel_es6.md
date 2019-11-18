# Babel-Es6

虽然`ES6`已经是几年前的东西了，但是我们都知道`ES6`的内容比过去十年的`javascript`的东西都要多，那么对于浏览器来说，到目前为止，都不是所有的浏览器都支持`ES6`语法，而且即使是`Chrome`，也只是实现支持大部分的`ES6`语法，所以我们如果想在项目当中使用`ES6`语法，且让所有浏览器都能正常运行，<font color=#1E90FF>就必须借助Babel将其转换成为ES5的写法</font>


## 语法转义
我们到`Babel`的[官网](https://www.babeljs.cn/setup#installation)看到关于`Babel`在各个场景中使用的设置和介绍，我们就点击`Babel`在`Webpack`当中的使用：

<font color=#1E90FF>**① 安装**</font>

```javascript
npm install --save-dev babel-loader @babel/core
```

<font color=#1E90FF>**② 配置**</font>

```javascript
// webpack.config.js
module.exports = {
	module: {
		rules: [
			{ 
				test: /\.js$/, 
				exclude: /node_modules/,
				loader: "babel-loader",
				// options: {presets: ["@babel/preset-env"] }
			}
		]
	}
}
```
其中要说明的是关于`node_modules`文件中第三方模块是不需要`babel`转义的，因为人家早就帮你做好了，但是我们要注意：<font color=#DD1144>babel-loader并不是将ES6转ES5的工具，只是连接webpack和babel的桥梁，真正能转移语法的工具我们还要继续在下面进行配置</font>

<font color=#1E90FF>**③ babel配置**</font>

创建`.babelrc`文件，并在里面进行配置,这种配置和直接在`webpack.config.js`当中添加`options`属性是一样的。如果你有更多关于`babel`的配置，
```javascript
// .babelrc
{
  "presets": ["@babel/preset-env"]
}
```

<font color=#1E90FF>**④ 下载依赖**</font>

```javascript
npm install @babel/preset-env --save-dev
```

## 对象添加
实际上经过上面的一顿操作，并没有完整的说将`ES6`转换成为了`ES5`，为什么？<font color=#1E90FF>ES6比ES5多的不仅仅是语法的东西，还有很多关键字，变量，对象是无法通过语法转化起效果的，我们需要将这些缺失的东西补充到低版本的浏览器里</font>

那么怎么做补充呢？此时<font color=#DD1144>polyfill</font>就登场了。

<font color=#1E90FF>**① 安装依赖**</font>

```javascript
npm install --save @babel/polyfill
```

<font color=#1E90FF>**② 使用库**</font>

我们要在`src/index.js`的最顶部，也就是说整个项目在一开始的时候就需要引入库
```javascript
// src/index.js
import "@babel/polyfill";
const arr = [
	new Promise(()=> {}),
	new Promise(()=> {})
]

arr.map(item => {
	console.log(item)
})
```

<font color=#1E90FF>**③ 优化**</font>

可以看到实际上`@babel/polyfill`有很多东西，然而我们上述中的代码只有使用到了`Promise`和`map`，我们需要在`webpack.config.js`当中配置一下参数来只引入`@babel/polyfill`被用到的部分，其余统统不用加载进来，<font color=#1E90FF>这样能极大的减小打包js文件的大小</font>
```javascript
// webpack.config.js
module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            ["@babel/preset-env",{
							useBuiltIns:'usage',  // 按需引入所需要的部分
							targets: {           // 添加浏览器版本，低于这些浏览器版本就会去转义
								edge: "17",
								firefox: "60",
								chrome: "67",
								safari: "11.1",
							},
            }]
          ]
        }
      },
		]
	}
}
```
当然了，关于`babel`在`webpack`当中的使用呢，还是推荐写在`.babelrc`目录下面，这样在`webpack.config.js`当中就不用写`options`那一项了：
```javascript
// .babelrc
{
	"presets": [
		["@babel/preset-env",{
			"useBuiltIns":"usage", 
			"targets": {
				"edge": "17",
				"firefox": "60",
				"chrome": "67",
				"safari": "11.1"
			}
		}]
	]
}
```

## 其他场景
上面介绍的都是我们在业务代码时候的配置，但是实际上通过`@babel.polyfill`这种库在全局对象上添加对象来实现的，如果你写的是类库代码，关于`webpack`中的`babel`配置是不能像上面这样的，你需要使用`babel-plugin-transform-runtime`这种插件去配置，如果你有兴趣，可以自行研究一下。



**参考资料**

1. [https://www.babeljs.cn/setup#installation](https://www.babeljs.cn/setup#installation)
2. [https://www.babeljs.cn/docs/babel-polyfill](https://www.babeljs.cn/docs/babel-polyfill)