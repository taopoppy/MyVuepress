# Vue实例

## 准备工作
我们在整个`vue`核心知识的学习这一大章都和项目没有多大关系，所以我们首先要在项目当中的`build`目录下单独创建一个关于`webpack`的配置文件，来打包我们的关于`vue`核心知识的`demo`，所以我们先创建`build/webpack.config.practice.js`和`build/template.html`
```javascript
// webpack.config.practice.js
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const baseConfig = require('./webpack.config.base')
const merge = require('webpack-merge')

const defaultPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"development"'
    }
  }),
  new HTMLPlugin({
    template: path.join(__dirname, 'template.html') // 采用同级目录下的template.html作为模板
  })
]

const devServer = {
  port: 8090,          // 开启一个新的端口
  host: '0.0.0.0',
  overlay: {
    errors: true
  },
  hot: true
}
let config

config = merge(baseConfig, {
  entry: path.join(__dirname, '../practice/index.js'),
  devtool: '#cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.styl/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          'stylus-loader'
        ]
      }
    ]
  },
  devServer,
  resolve: {
    alias: {
			'vue': path.join(__dirname, '../node_modules/vue/dist/vue.esm.js')  
			// 这里的配置因为如果有runtime-only的话我们是不能在vue当中写template的 
			// 而且在node_modules中的vue底下有很多版本的vue文件来支持不同的环境
			// 默认情况下我们都import的vue.runtime.xxx.js
			// 所以这里我们使用没有runtime的版本，便于我们写template
    }
  },
  plugins: defaultPlugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ])
})

module.exports = config
```
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

然后我们在`eslint`中配置可以使用`new`：
```javascript
// .eslint
{
  "rules": {
    "no-new": "off"
  }
}
```
并在`package.json`当中配置启动命令：
```json
{
	"script":{
		"practice": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.practice.js",
	}
}
```

最后我们在项目目录下创建一个`practice\index.js`的目录，然后我们后面的代码都会用这个文件来写`Demo`

## Vue实例
