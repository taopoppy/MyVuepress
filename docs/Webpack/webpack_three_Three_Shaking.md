# Tree-Shaking

## 什么是Tree-Shaking
我们举个最简单的例子：
```javascript
// math.js
export const add = (a,b) => {
	console.log(a + b)
}

export const minus = (a, b) =>{
	console.log(a - b);
}
```
```javascript
// index.js
import { add } from './math'

add(1,2)
```
像上面代码写的那样，虽然我们引用了`math.js`当中的东西，但是对于整个项目来说，引用的只有`add`方法，但是按照我们之前对于`webpack`的配置来说，打包的时候对于`math.js`会将其所有代码打包，包括项目中用到的`add`方法和项目中没有用到的`minus`方法，这就导致我们打包后的`js`文件里面包含了很多项目中没有用到的方法或者代码。`js`文件的体积增大会降低`js`文件的加载速率。

此时就是<font color=#DD1144>Tree-Shaking</font>登场了，<font color=#1E90FF>Tree-Shanking的意思就是表面上的意思，摇树，会将模块当中没有用到的代码统统像枯萎的叶子被摇晃下来</font>

这里要注意的一点就是：<font color=#DD1144>Tree-Shaking是webpack的新特性，它只支持ES module的模块导入导出方法</font>

## development：Tree-Shaking
`Tree-Shaking`本身是不用在开发环境下的，但是这里为了学习我们依旧要看看`Tree-Shaking`怎么配置，并且学习一下要注意的地方。

<font color=#1E90FF>**① webpack.config.js配置**</font>

首先我们在`webpack.config.js`做配置：
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true
  },
}
```
<font color=#1E90FF>**② package.json配置**</font>

```json
// package.json
{
	"name":"webpack-demo",
	"sideEffects": [
		"*.css",
		"@babel/polyfill",
	]
}
```
主要说一下为什么要在`package.json`当中配置`sideEffects`这个属性，<font color=#DD1144>因为Tree-Shaking只对ES module有效，所以对于有明确输入输出的模块它会很清楚的做无用代码的分离，但是对于有些文件，比如@babel/polyfill它只是在windows对象上挂载一些ES6的对象或者关键字，并没有实质的输出，所以如果你在代码中写了import "@babel/polyfill"那么Tree-Shaking一看你没有输出什么东西就全部摇掉了，这样势必会对代码有影响，css之类的文件也是如此</font>

所以对于`package.json`中的`sideEffects`属性配置的目的就是：<font color=#1E90FF>明确告诉Tree-Shaking哪些类型的文件不要做Tree-Shaking</font>，所以如果你对所以文件都要做`Tree-Shaking`,那么你可以直接在这里配置：
```javascript
// package.json
{
	"name":"webpack-demo",
	"sideEffects": false
}
```

虽然我们在开发环境下这样配置了，但实际打包后的`js`代码并没有真正剔除没有引用的代码，<font color=#1E90FF>只是在做了Tree-Shaking的文件附近注释了一些说明而已，毕竟开发环境剔除了某些代码会对调试有影响，包括sourceMap的映射也会出现一些问题</font>

## production: Tree-shaking
而对于生产环境，其实当`mode`的值为`production`的时候，我们是不用在`webpack.config.js`当中去配置`optimiazation`的，但是在`package.json`中的配置我们依旧要保留，如果所有模块都要做`Tree-Shaking`，就按照下面这样配置即可：
```javascript
// package.json
{
	"name":"webpack-demo",
	"sideEffects": false
}
```
但是我建议还是在`webpack.config.js`中显式的去配置`optimization`，方便自己学习和理解，同时这个属性里还有很多能配置的东西，我们后面都会用到，所以这里写上最好：
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true
  },
}
```
如果你有其他的文件模块不需要，或者不能做`Tree-Shaking`,你就将它写在`sideEffects`当中，此时`sideEffects`的值就是包含这些不做`Tree-Shaking`的文件类型数组。

## Dev&Pro区分打包
首先分开打包的思想是：<font color=#1E90FF>对于开发环境和生产环境相同的配置单独拿出来放到build/webpack.common.js文件当中，然后开发环境的特有配置放在build/webpack.dev.js文件当中，并与build/webpack.common.js当中的共有配置合并，生产环境的特有配置放在build/webpack.prod.js文件当中，并与build/webpack.common.js当中的共有配置合并</font>

所以我们下载一个第三方模块：
```javascript
npm install webpack-merge -D
```
然后修改`package.json`文件中的启动命令：
```json
// package.json
{
	"scripts": {
    "dev": "webpack-dev-server --config ./build/webpack.dev.js",
    "build": "webpack --config ./build/webpack.prod.js"
  },
}
```
然后下面分别是：<font color=#1E90FF>build/webpack.common.js</font>、<font color=#1E90FF>build/webpack.dev.js</font>、<font color=#1E90FF>webpack.prod.js</font>
```javascript
// build/webpack.common.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
	entry: {
    main: './src/index.js',
	},
	module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        // options相关的配置放在.babelrc文件下
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name]_[hash].[ext]',
            outputPath: 'images/',
            limit: 2048
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'fonts/'
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { 
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: true
            } 
          },
          {
            loader: 'sass-loader',
            options: {}
          },
          {
            loader: 'postcss-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
	},
	plugins: [
    new HtmlWebpackPlugin({
      template:'src/index.html'
    }),
    new CleanWebpackPlugin(),
	],
	output: {
    //publicPath: 'http://cdn.com.cn',
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist') // 这里打包路径稍做修改
  }
}
```
```javascript
// webpack.dev.js
const webpack = require('webpack')
const merge = require('webpack-merge')
const commonConfig = require('./webpack.common.js')

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    contentBase: './dist',
    // open: true,
    port: 8090,
    proxy: {
      '/api': 'http://localhost:3000'
    },
    hot: true,
    hotOnly: true
  },
  
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  optimization: {
    usedExports: true
  }
}

module.exports = merge(commonConfig,devConfig)
```
```javascript
// webpack.prod.js
const merge = require('webpack-merge')
const commonConfig = require('./webpack.common.js')

const prodConfig = {
  mode: 'production',
  devtool: 'cheap-module-source-map',
}

module.exports = merge(commonConfig, prodConfig)
```
到此为止，我们不同环境打包的配置已经完成，可以通过下面的两个命令来执行生产环境和开发环境的打包：
+ <font color=#DD1144>npm run dev</font>
+ <font color=#DD1144>npm run build</font>

**参考资料**

1. [https://www.webpackjs.com/guides/tree-shaking/](https://www.webpackjs.com/guides/tree-shaking/)