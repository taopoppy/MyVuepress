# Plugins

插件的作用：<font color=#1E90FF>可以在webpack运行到某个时刻的时候，帮你做一些事情</font>。这种作用类似于我们在`react/vue`当中使用的生命周期函数。

## htmlWebpackPlugin
我们之前的工作是这样的，在打包完成了后的`dist`目录当中手动创建`index.html`文件，每次打包都这样做，就很麻烦，我们要利用这样一个插件：<font color=#1E90FF>htmlWebpackPlugin</font>

<font color=#1E90FF>**① 安装**</font>  

```javascript
npm install --save-dev html-webpack-plugin
```
<font color=#1E90FF>**② 使用**</font>

```javascript
var HtmlWebpackPlugin = require('html-webpack-plugin'); // 引入
var path = require('path');

module.exports = {
  entry: 'index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js'
  },
   plugins: [
    new HtmlWebpackPlugin({
      template:'src/index.html'
    })
  ], // 使用
};
```
<font color=#1E90FF>htmlWebpackPlugin插件的作用</font>:<font color=#DD1144>htmlWebpackPlugin会在打包结束后，自动在打包文件中生成一个html文件，并将打包生成的js自动引入到这个html当中</font>

上述代码当中我们使用了`htmlWebpackPlugin`插件当中的参数`template`,可以指定我们生成`html`文件的模板，只不过打包后的`js`文件依旧会挂载到以这个`html`模板文件生成的真正的`index.html`文件当中。

## cleanWebpackPlugin
实际上在打包的过程中，我们会多次打包，在每一次打包之前，我们上一次打包的`dist`文件不会被删除，如果是相同的文件名会进行覆盖，但是当我们上一次设置打包的文件叫做`bundle.js`，这次打包设置的文件叫做`main.js`，那么上一次打包遗留在文件中的`bundle.js`并不会被删除，所以我们希望在每次打包之前都能先清空`dist`目录下的东西，然后重新将打包后的文件放在里面，这时就用到了:<font color=#1E90FF>cleanWebpackPlugin</font>

<font color=#1E90FF>**① 安装**</font>

```javascript
npm install clean-webpack-plugin -D
```

<font color=#1E90FF>**② 使用**</font>

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // 安装

module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js'
  },
  module: {
    rules: [
  },
  plugins: [
    new HtmlWebpackPlugin({
      template:'src/index.html'
    }),
    new CleanWebpackPlugin()  // 使用
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}
```
<font color=#1E90FF>cleanWebpackPlugin会在打包之前帮助你去清理dist目录，但是这里要注意的是：</font><font color=#DD1144>cleanWebpackPlugin不是官方推荐的plugin，所以它的用法不固定，需要在使用的时候到npm上去查看</font>

## Entry和Output
我们首先来说一个比较简单的东西，之前我们的代码是在`Entry`中是通过键值对的方式书写的，其实那个键就是我们打包后输出文件的<font color=#1E90FF>chunk name</font>,而且键值对的写法是一种完整的写法，可以有更简单的写法：
```javascript
module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist')
	}
}
```
上面这样写法就是当我们只有一个入口的时候最简单的写法，在`entry`中默认的键名就是`main`,相应的在`output`当中默认的`filename`也就是`main.js`。


但是当我们如果有多个入口文件的话，我们就需要完整的书写配置：
```javascript
module.exports = {
  entry: {
    main: './src/index.js',
    sub: './src/entry.js'
  },
  output: {
	publicPath: 'http://cdn.com.cn',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
}
```
通过这样打包后，通过在`output`当中使用占位符，通过键名`main`生成的`main.js`和键名`sub`生成的`sub.js`会通过`htmlWebpackPlugin`这个插件先后被放入`dist/index.html`当中。

但是比如我们会将这些静态的打包`js`文件上传到cdn上面，我们这样使用<font color=#1E90FF>publicPath</font>来给所有打包文件添加前缀路径，打包后注入到`html`的结果就是如下：
```html
<body>
	<div id="root"></div>
	<script type="text/javascript" src="http://cdn.com.cn/main.js"></script>
	<script type="text/javascript" src="http://cdn.com.cn/sub.js"></script>
</body>
```

## SourceMap
### 1. 相关配置
首先我们来说`sourceMap`的概念：<font color=#1E90FF>sourceMap是一种映射关系，它知道开发文件中的代码和打包后的代码之间的映射关系，通过生成ma文件帮助我们在打包后文件运行存错的提示映射到原始开发文件错误对应的具体地方，提高开发改错效率</font>

通过在`webpack.config.js`文件当中进行配置<font color=#DD1144>devtool</font>这个属性来配置`sourceMap`的相关属性，这个属性的配置选项有很多，还能自由通过添加前缀的方式来组合选项：
+ <font color=#3eaf7c>inline</font>：将生成的映射map文件放在生成的`js`文件中
+ <font color=#3eaf7c>cheap</font>：错误提示只精确到行，不精确到列,只负责业务错误，不负责`loader`打包错误。
+ <font color=#3eaf7c>module</font>：配置不光涉及到业务代码，`loader`相关的第三方模块的代码也考虑在内。
+ <font color=#3eaf7c>eval</font>：通过`eval`的语法将代码和文件之间做了映射关系，效率最高

### 2. 最佳实践
+ 开发环境:
	```javascript
	module.exports = {
		mode: 'development',
  	    devtool: 'cheap-module-eval-source-map',
	}
	```
+ 生产环境：
	```javascript
	module.exports = {
		mode: 'production',
		devtool: 'cheap-module-source-map',
	}
	```

**参考资料**

1. [https://webpack.docschina.org/guides/output-management/](https://webpack.docschina.org/guides/output-management/)
2. [https://webpack.docschina.org/plugins/html-webpack-plugin/](https://webpack.docschina.org/plugins/html-webpack-plugin/)
3. [https://www.npmjs.com/package/clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin)
4. [https://webpack.docschina.org/configuration/](https://webpack.docschina.org/configuration/)
5. [https://webpack.docschina.org/configuration/entry-context/](https://webpack.docschina.org/configuration/entry-context/)
6. [https://webpack.docschina.org/configuration/output/](https://webpack.docschina.org/configuration/output/) 