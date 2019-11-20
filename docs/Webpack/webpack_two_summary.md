# 核心概念总结
在开始新的`webpack`高级概念之前，我们对本大节关于`webpack`的配置再做个归纳：
```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'development', // 开发模式不压缩打包文件体积，生产模式下会压缩体积
  devtool: 'cheap-module-eval-source-map', // 配置sourceMap方便将打包文件中的错误映射到源码
  entry: {
    main: './src/index.js', // 入口文件，main为默认的键
  },
  devServer: {
    contentBase: './dist',  // 在dist目录下默认开启一个8080的服务器
    // open: true, // 启动的同时顺便帮我们打开浏览器
    port: 8090,  // 修改服务器端口为8090
    proxy: {
      '/api': 'http://localhost:3000' // webpack底层就有实现跨域代理，请求localhost:8090/api相当于请求了http://localhost:3000
    },
    hot: true, // 开启热更新
    hotOnly: true // 热更新无效的时候不会去刷新浏览器
  },
  module: {
    rules: [
      {
				test: /\.js$/,
        exclude: /node_modules/,  // node_modules下的文件不会做处理
        loader: "babel-loader",
        // options相关的配置放在.babelrc文件下
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name]_[hash].[ext]', // 占位符给打包的图片文件起了新名字
            outputPath: 'images/',  // 打包后的文件放在dist/images文件中
            limit: 2048        // 小于2048字节（2kb）的图片按照url-loader方式打包，否则按照file-loader打包
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'fonts/' // 对字体文件的打包放在dist/fonts/当中
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
              importLoaders: 2, // 必须之前两个loader
              modules: true // 开启模块化
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
      template:'src/index.html'    // 自动按照template生成模板
    }),
    new CleanWebpackPlugin(),      // 自动打包之前对dist目录进行清除
    new webpack.HotModuleReplacementPlugin() // 热更新插件
  ],
  output: {
    //publicPath: 'http://cdn.com.cn',  // 公共地址，会作为打包文件的前缀
    filename: '[name].js',              // 占位符，按照入口文件的键来命名
    path: path.resolve(__dirname, 'dist') // 打包文件所在目录为dist文件
  }
}
```
关于`babel-loader`的`options`配置我们全部放在`.babelrc`文件下面：
```javascript
// .babelrc
{
	"presets": [
		[
			"@babel/preset-env", // 负责将ES6装换成为ES5
			{
				"useBuiltIns":"usage",  // 按需对@babel/polyfill中的东西加载
				"targets": {
					"edge": "17",           // edge17以上的不用加载@babel/polyfill
					"firefox": "60",        // firefox60以上的不用加载@babel/polyfill
					"chrome": "67",         // chrome67以上的不用加载@babel/polyfill
					"safari": "11.1"        // safari11.1以上的不用加载@babel/polyfill
				}
			}
	  ],
		[
			"@babel/preset-react",
			{
				// 可以配置一些@babel/preset-react的参数
			}
		]
	]
}
```
