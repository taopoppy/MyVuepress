# 升级为正式项目

## 改造webpack配置

创建`build`目录，然后创建`build/webpack.config.base.js`作为基础配置，创建`build/webpack.config.client.js`作为额外配置，然后下载一个第三方合并的库：
```javascript
npm install webpack-merge@4.1.1 --registry=https://registry.npm.taobao.org
```
```javascript
// webpack.config.base.js
const path = require('path')

const config = {
  target: 'web',
  entry: path.join(__dirname, '../client/index.js'),
  output: {
    filename: 'bundle.[hash:8].js',
    path: path.join(__dirname, '../dist') // 我们将webpack的配置放在build当中后，生成的dist路径应该在build外面
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
				test: /.\js$/,
				loader: 'babel-loader',
				exclude: /node_modules/    // node_modules当中的文件已经做过babel转义了，不需要在这里多做一次
			},
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              name: 'resources/[path][name].[hash:8].[ext]' // 这些图片按照它们在源码中的路径方式放在reaources当中
            }
          }
        ]
      }
    ]
  },
}
module.exports = config
```
```javascript
// webpack.config.client.js
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const ExtractPlugin = require('extract-text-webpack-plugin')
const baseConfig = require('./webpack.config.base')
const merge = require('webpack-merge')

const isDev = process.env.NODE_ENV === 'development'

const defaultPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: isDev ? '"development"' : '"production"'
    }
  }),
  new HTMLPlugin()
]

const devServer = {
  port: 8000,
  host: '0.0.0.0',
  overlay: {
    errors: true,
  },
  hot: true
}
let config // 声明新的最终导出去的config

if (isDev) {
  config = merge(baseConfig, {
    devtool: '#cheap-module-eval-source-map',
    module:{
      rules: [
        {
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
        }
      ]
    },
    devServer,
    plugins: defaultPlugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ])
  })
} else {
  config = merge(baseConfig, {
    entry: {
      app: path.join(__dirname, '../client/index.js'),
      vendor: ['vue']
    },
    output: {
      filename: '[name].[chunkhash:8].js'
    },
    module: {
      rules: [
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
        }
      ]
    },
    plugins: defaultPlugins.concat([
      new ExtractPlugin('styles.[contentHash:8].css'),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor'
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'runtime'
      })
    ])
  })
}

module.exports = config
```
## 改造package.json

`webpack`进行这样的配置后，我们要去`package.json`当中去修改一下启动命令：
```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "cross-env NODE_ENV=production webpack --config build/webpack.config.client.js",
    "dev": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.client.js"
  }
}
```
同时我们在之前的项目当中都没有将生产依赖和开发依赖分开，所以我们到`package.json`将所有的内容移入到`devDependencies`当中，只留一个`vue`在`dependencies`当中。

## 改造项目目录
为了我们后面更好的开发项目，我们修改项目的目录如此：
<img :src="$withBase('/vuessr_project_direactory.png')" alt="项目升级目录">

我们主要的改造思路就是:
+ <font color=#1E90FF>将src修改为client</font>：因为后面还有些服务端的代码
+ <font color=#1E90FF>添加views文件</font>：这里放置所有的页面，每个页面都是一个文件，包含所有页面用到的组件
+ <font color=#1E90FF>创建layout文件</font>：这个文件当中放置公共的页面，如`footer.jsx`和`header.vue`

## 打包后的文件分析
按照上面这样的配置，我们使用`npm run build`后打包出来的`dist`目录如下：
```javascript
dist
	- resources	
		- client
			- assets
				- images
					- bg.55db3d93.jpeg
	index.html
	app.4e618f0a.js
	runtime.8a0f6103.js
	vendor.5e22675c.js
	styles.4201be35.css
```
上述的打包结果是符合我们的要求的。因为如下
+ `runtime.8a0f6103.js`是`webpack`处理各个模块之间关系的代码
+ `vendor.5e22675c.js`基本是我们的第三方引入的代码，现在来看大部分都是`vue`的代码
+ `app.4e618f0a.js`就是我们的业务代码
+ `index.html`当中也是按照上面这个三个`js`文件的介绍顺序加载的。
+ `bg.55db3d93.jpeg`是因为我们的配置，原本在代码中的路径就是：`client/assets/images/bg.55db3d93.jpeg`,按照这样的路径，原原本本放在了`dist/resources`文件下。

<font color=#DD1144>总结</font>:   
我们做项目的时候一定会面临项目的改造和升级的，上面也简单的介绍了一个项目怎么由`Demo`去升级到正式项目的过程，后面我们还会对`webpack`进行升级，那个时候就能学习到项目升级时各个插件和第三方包是如何升级和处理的，同时也能学到`webpack`升级的时候配置上的改变。