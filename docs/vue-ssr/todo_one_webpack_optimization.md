# Webpack优化

## css单独分离
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
## 类库打包和hash优化
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
