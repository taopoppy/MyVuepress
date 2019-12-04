# 核心概念总结
## shimming
`webpack`编译器(compiler)能够识别遵循`ES2015`模块语法、`CommonJS`或`AMD`规范编写的模块。然而，一些第三方的库(`library`)可能会引用一些全局依赖（例如`jQuery`中的`$`）。这些库也可能创建一些需要被导出的全局变量。这些“不符合规范的模块”就是`shimming`发挥作用的地方。

<font color=#1E90FF>我们不推荐使用全局的东西！在webpack 背后的整个概念是让前端开发更加模块化。也就是说，需要编写具有良好的封闭性(well contained)、彼此隔离的模块，以及不要依赖于那些隐含的依赖模块（例如，全局变量）。请只在必要的时候才使用本文所述的这些特性。</font>

`shimming`另外一个使用场景就是，当你希望`polyfill`浏览器功能以支持更多用户时。在这种情况下，你可能只想要将这些`polyfills`提供给到需要修补(patch)的浏览器（也就是实现按需加载）。

总上所述，`shimming`不推荐使用，理由和上述管方说明一致，所以如果你想了解它，直接去官网上学习即可：[https://www.webpackjs.com/guides/shimming/](https://www.webpackjs.com/guides/shimming/)

## 环境变量
要在开发和生产构建之间，消除`webpack.config.js`的差异，你可能需要环境变量。`webpack`命令行环境配置中，通过设置`--env`可以使你根据需要，传入尽可能多的环境变量。在`webpack.config.js` 文件中可以访问到这些环境变量。例如，`--env.production`或`--env.NODE_ENV=local`（NODE_ENV 通常约定用于定义环境类型）。
```javascript
// package.json
{
	  "scripts": {
    "dev": "webpack --env.NODE_ENV=development --config ./build/webpack.dev.js",
  },
}
```
不过这种方式我们还是后面不用，我们因为在配置当中添加太多的环境变量的判断不太好，我们还是希望按照先前的方式，不同的环境的不同配置分配到不同的文件，相同的配置放在`webpack.common.js`当中，生产环境的配置放在`webpack.prod.js`文件当中，开发环境的配置放在`webpack.dev.js`文件当中，生产和开发环境的打包命令分开

## 核心概念总结
所以到目前为止，我们需要将`webpack`的配置拿出来再总结一下：
```javascript
//webpack.common.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');  // css代码分割需要的插件
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
          {
            loader: MiniCssExtractPlugin.loader, // 替换style-loader
            options: {
              publicPath: '../' // webpack.output中的publicPath存在才有效
            },
          },
          { 
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: true,
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
          {
            loader: MiniCssExtractPlugin.loader, // 替换style-loader
            options: {
              publicPath: '../' // webpack.output中的publicPath存在才有效
            },
          },
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
    new MiniCssExtractPlugin({              // 这部分可以单独拿到webpack.dev.js和webpack.prod.js中单独做配置，在开发环境中可以省略contenthash占位符
			filename: '[name].[contenthash].css', // 直接在html中引入的css做分割的命名方案
      chunkFilename: '[name].[contenthash].css', // 间接引入的css做分割的命名方案
    })
  ],
  optimization: {
    usedExports: true,  // 开启Tree-Shaking
    splitChunks: {
      chunks: "all",  // 同步异步都要做代码分割
      minSize: 30000, // 大于30000字节的引入文件要做分割
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {                 // 符合test的要求会被缓存到vendors组中
          test: /[\\/]node_modules[\\/]/, // vendors组的条件
          priority: -10,                  // 优先级
          // name: 'vendors'
        },
        default: {
          minChunks: 2,            // 无test条件，满足引用两次就分割的条件
          priority: -20,           // 优先级
          reuseExistingChunk: true // 避免重复加载
        }
      }
    }
  },
	output: {
    //publicPath: 'http://cdn.com.cn',
    path: path.resolve(__dirname, '../dist') // 路径写对
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
  devServer: {                       // 开发环境配置dev-server
    contentBase: './dist',           // dist目录下开启服务器
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
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',    
  }
}

module.exports = merge(commonConfig,devConfig)
```
```javascript
// webpack.prod.js
const merge = require('webpack-merge')
const commonConfig = require('./webpack.common.js')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // css分割的代码需要压缩

const prodConfig = {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin({})], // css代码压缩插件
  },
  output: {
    filename: '[name].[contenthash].js',  // 根据文件内容的不同命名，入口的js文件命名方案
    chunkFilename: '[name].[contenthash].js',  // 间接引入的js文件命名方案
  }
}

module.exports = merge(commonConfig, prodConfig)
```
```javascript
// .babelrc
{
	"presets": [
		[
			"@babel/preset-env",
			{
				"useBuiltIns":"usage", 
				"targets": {
					"edge": "17",
					"firefox": "60",
					"chrome": "67",
					"safari": "11.1"
				}
			}
	  ],
		[
			"@babel/preset-react",
			{
				// 可以配置一些@babel/preset-react的参数
			}
		]
	],
	"plugins": [
		"@babel/plugin-syntax-dynamic-import"
	]
}
```
```json
// package.json
{
  "name": "webpack-demo",
  "sideEffects": [
    "*.css"
  ],
  "version": "1.0.0",
  "description": "",
  "private": true,
  "scripts": {
    "dev-build-analyse": "webpack --profile --json > stats.json --config ./build/webpack.dev.js",
    "dev-build": "webpack --config ./build/webpack.dev.js",
    "dev": "webpack-dev-server --config ./build/webpack.dev.js",
    "build": "webpack --config ./build/webpack.prod.js"
  },
  "author": "Taopoppy",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.7.2",
    "@babel/plugin-syntax-dynamic-import": "^7.2.0",
    "@babel/preset-env": "^7.7.1",
    "@babel/preset-react": "^7.7.0",
    "autoprefixer": "^9.7.1",
    "babel-loader": "^8.0.6",
    "babel-plugin-dynamic-import-webpack": "^1.1.0",
    "clean-webpack-plugin": "^3.0.0",
    "css-loader": "^3.2.0",
    "file-loader": "^4.2.0",
    "html-webpack-plugin": "^3.2.0",
    "mini-css-extract-plugin": "^0.8.0",
    "node-sass": "^4.13.0",
    "optimize-css-assets-webpack-plugin": "^5.0.3",
    "postcss-loader": "^3.0.0",
    "sass-loader": "^8.0.0",
    "style-loader": "^1.0.0",
    "url-loader": "^2.2.0",
    "webpack": "^4.41.2",
    "webpack-cli": "^3.3.10",
    "webpack-dev-server": "^3.9.0",
    "webpack-merge": "^4.2.2"
  },
  "dependencies": {
    "@babel/polyfill": "^7.7.0",
    "core-js": "^3.4.1",
    "lodash": "^4.17.15",
    "react": "^16.12.0",
    "react-dom": "^16.12.0"
  }
}

```
