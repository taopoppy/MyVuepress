# Webpack安装和配置

## Webpack环境搭建
我们要知道：<font color=#1E90FF>webpack是基于node开发的，所以我们需要node环境和node相关的基础知识</font>

<font color=#1E90FF>**① node安装**</font>
+ <font color=#3eaf7c>下载地址</font>：[https://nodejs.org/zh-cn/download/](https://nodejs.org/zh-cn/download/)
+ <font color=#3eaf7c>版本选择</font>：下载node版本下载最高的稳定版本(LTS)，这样能提高`webpack`的打包速率

<font color=#1E90FF>**② webpack全局安装**</font>
+ <font color=#3eaf7c>npm install webpack webpack-cli -g --registry=https://registry.npm.taobao.org</font>（全局下载）
+ <font color=#3eaf7c>webpack -v</font>（检查安装）

虽然`webpack`全局安装很简单，但是我们不推荐，我们还是推荐在项目当中安装`webpack`,所以我们可以删除全局的`webpack`
+ <font color=#3eaf7c>npm uninstall webpack webpack-cli -g</font>

<font color=#1E90FF>**③ webpack局部安装**</font>
+ <font color=#3eaf7c>npm install webpack webpack-cli -D --registry=https://registry.npm.taobao.org
</font>（项目内部安装）
+ <font color=#3eaf7c>webpack -v（这种是全局检查的方式，是无效的）</font>
+ <font color=#3eaf7c>npx webpack -v（正确的项目内部webpack的版本检查方式,）</font>

`npx`是`node`给我们提供的一个命令，可以在项目当中的`node_module`目录下去执行相关的命令。比如`npx webpack -v`意思就是到当前项目的`node_module`目录下去寻找`webpack`这个包，然后查看它的版本。

## webpack配置文件
我们需要通过`webpack`的配置文件来规定不同文件的打包方式，因为不同文件的打包方式是一定不同的，虽然`webpack`有很丰富的默认配置文件，但是我们还是大多的时候需要通过自己配置`webpack.config.js`来丰富我们的打包流程和规则。
```javascript
// webpack.config.js
const path = require('path')

module.exports = {
  mode: 'production',   // 打包环境为生产模式（默认压缩打包文件）
  entry: {
    main: './src/index.js'
  },                    // 入口文件（可以简写为entry: './src/index.js'）
  output: {
    filename: 'bundle.js', // 打包后的js文件名
    path: path.resolve(__dirname, 'dist') // 打包后文件存放的目录（默认就是dist）
  }
}
```
然后我们介绍一下几个常用的`webpack`启动命令的区别：
+ <font color=#1E90FF>npx webpack index.js</font>
  + 明确告诉`webpack`入口文件为`index.js`,因为`webpack`有默认配置，按照默认配置会默认将打包后的文件放在`dist/main.js`当中

+ <font color=#1E90FF>npx webpack</font>
  + 启动命令，但是如果没有`webpack.config.js`就会报错，因为`webpack.config.js`是默认的配置文件名

+ <font color=#1E90FF>npx webpack --config rule.js</font>
  + 启动命令，但是将`rule.js`作为`webpack`的配置文件进行启动，不推荐这样用，老老实实创建默认的文件名`webpack.config.js`最好

+ <font color=#1E90FF>npm run bundle</font>
  + 启动命令，只不过我们在`package.json`文件中配置了`script: { "bundle": "webpack" }`,本质上还是在使用`webpack`命令

这里有个问题，为什么能直接在命令行中使用`webpack`的命令，计算机为什么能识别它？
+ <font color=#DD1144>这就是webpack-cli的作用：能让我们在命令行中正确的使用webpack命令</font>

## 浅析打包出的内容
当我们执行打包命令，会在命令行当中输入以下结果，我们来分析以下结果的含义：
```javascript
Hash: eb7f39ba7fb263ae1f22
Version: webpack 4.26.0
Time: 92ms
Built at: 2019-11-13 11:15:23
    Asset      Size  Chunks             Chunk Names
bundle.js  1.33 KiB       0  [emitted]  main
Entrypoint main = bundle.js
[0] ./src/index.js + 3 modules 836 bytes {0} [built]
    | ./src/index.js 207 bytes [built]
    | ./src/header.js 205 bytes [built]
    | ./src/sidebar.js 212 bytes [built]
    | ./src/content.js 212 bytes [built]
```
+ <font color=#3eaf7c>Hash</font>：本次打包唯一对应的一个哈希值
+ <font color=#3eaf7c>Version</font>：本次打包使用的`webpack`的版本
+ <font color=#3eaf7c>Time</font>：本次打包所使用的总时间
+ <font color=#3eaf7c>Asset</font>：本次打包后的文件名称
+ <font color=#DD1144>Chunks</font>：本次打包`bundle.js`和其它存在引用关系文件的`id`组合
+ <font color=#DD1144>Chunk Names</font>：本次打包`bundle.js`对应的id的名称（对应于entry中的配置）


**参考资料**

1. [https://webpack.js.org/guides/getting-started/](https://webpack.js.org/guides/getting-started/)