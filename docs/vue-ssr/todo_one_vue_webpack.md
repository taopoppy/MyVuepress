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

## Webpack配置优化
<font color=#1E90FF>**① css单独分离**</font>

首先我们要下载插件：
```javascript
npm install extract-text-webpack-plugin@3.0.2 --registry=https://registry.npm.taobao.org
```
我们需要到我们`webpack.config.js`当中去配置生产环境的配置：
```javascript
// wepback.config.js
if(isDev) {

}else{
	  config.output.filename = '[name].[chunkhash:8].js'
  config.module.rules.push(
    {
      test: /\.styl/,
      use: ExtractPlugin.extract({
        fallback: 'style-loader',
        use: [
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            }
          },
          'stylus-loader'
        ]
      })
    },
  )
  config.plugins.push(
    new ExtractPlugin('styles.[contentHash:8].css'),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'runtime'
    })
  )
}
```
这样打包之后我们的`css`代码就会被分离出来，但是我们这样配置并没有将在`vue`中写的`css`代码打包出去，因为`vue-loader`是在加载组件的时候才去加载样式的，也就是组件中的样式和组件其实是一体的。

<font color=#1E90FF>**② 类库打包和hash优化**</font>

```javascript
//webpack.config.js
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin') // 在dist目录下创建html的插件
const webpack = require('webpack')
const ExtractPlugin = require('extract-text-webpack-plugin') // 单独分离css的插件

const isDev = process.env.NODE_ENV === 'development'

const config = {
  target: 'web',
  entry: path.join(__dirname, 'src/index.js'),
  output: {
    filename: 'bundle.[hash:8].js',    // 开发环境下的文件名命名方案
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              name: '[name]-aaa.[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: isDev ? '"development"' : '"production"' // 通过设置火环境变量让业务代码中也能使用procss.env.NODE_ENV
      }
    }),
    new HTMLPlugin()
  ]
}

if (isDev) {
  config.module.rules.push({
    test: /\.styl/,
    use: [
      'style-loader',
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
        }
      },
      'stylus-loader'
    ]
  })
  config.devtool = '#cheap-module-eval-source-map'
  config.devServer = {
    port: 8000,
    host: '0.0.0.0',
    overlay: {
      errors: true,
    },
    hot: true
  }
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
} else {
  config.entry = {
    app: path.join(__dirname, 'src/index.js'), // 生产环境下的键重新命名为app
    vendor: ['vue']                            // 单独分离第三方包的内容
  }
  config.output.filename = '[name].[chunkhash:8].js' // 生产环境下的文件名要根据内容变化
  config.module.rules.push(
    {
      test: /\.styl/,
      use: ExtractPlugin.extract({   // 单独分离css的文件
        fallback: 'style-loader',
        use: [
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            }
          },
          'stylus-loader'
        ]
      })
    },
  )
  config.plugins.push(
    new ExtractPlugin('styles.[contentHash:8].css'), // 单独分离css文件的命名方案
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'                                 // 单独分离类库文件
    }),
    new webpack.optimize.CommonsChunkPlugin({        // 单独分离webpack的文件
      name: 'runtime'
    })
  )
}

module.exports = config
```
