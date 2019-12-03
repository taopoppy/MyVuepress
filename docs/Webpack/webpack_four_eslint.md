# Eslint

## Eslint为何物
`Eslint`是团队开发规范中的利器，我们现在直接去下载它；
```javascript
npm install eslint eslint-loader --save-dev
```
下载好了之后我们有几种简单的方式去配置`eslint`,因为我们下载好了`eslint`,现在我们直接在项目中使用命令：<font color=#1E90FF>npx eslint --init</font>,然后会问你一大堆问题，让你去回答，然后下载相对应的第三方包，然后在我们的项目目录下就会产生一个<font color=#DD1144>.eslintrc.js</font>的配置文件。这里面就有很多的配置规则。我们根据自身需求去修改一下即可。

默认的是`erpm`的解析器。但是一般我们都使用<font color=#DD1144>babel-eslint</font>来作为解析器，所以我们就在`.eslintrc.js`中配置解析器的设置：
```javascript
// .eslintrc.js
module.exports = {
	"parser": "babel-eslint",
}
```
然后去下载`babel-eslint`:
```javascript
npm install babel-eslint --save-dev
```
这样都配置好了之后，其实使用`eslint`来检查错误有两个方法：
+ <font color=#3eaf7c>npx eslint src</font>：这样检查出来的src目录下的错误就直接显示在命令行，然后一个个改
+ <font color=#3eaf7c>vscode中下载eslint插件</font>：自动在文件中高亮的显示错误

所以第二种更常用一些，当然如果不使用的一些规则我们可以在`.eslintrc.js`的`rules`中去掉即可。但是第二种方法仅仅局限于你使用的`vscode`,如果你使用的其他编辑器下载不了`eslint`的插件，我们就只能使用第一种方法了，但是第一种方法太笨了。我们就想到在`Webpack`当中去配置`eslint`,这样无论你使用什么编辑器，都能很直观的去看到自己规范上的错误。

所以实际上，<font color=#1E90FF>eslint本身和webpack并没有关系，只不过在webpack中配置一下也能帮助我们更好的，更方便的利于eslint的功能</font>
<img :src="$withBase('/webpack_four_eslint_ways.png')" alt="ellint">

## Webpack&&Eslint 
首先下载<font color=#1E90FF>eslint-loader</font>,然后修改`webpack.common.js`中的内容：
```javascript
// webpack.common.js
module.exports = {
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: ['babel-loader', 'eslint-loader']
					// options相关的配置放在.babelrc文件下
				},
			]
		}
}
```
当然了我们现在写代码都是在`vue`或者`react`这种框架中书写代码，不仅要对`js`文件做校验，还要对`vue`,或者`jsx`文件做校验，但是不同的文件都已经有不同的`loader`了，我们要对这些统一处理，你可以这样做：
```javascript
// webpack.common.js
module.exports = {
	module: {
		rules: [
			{
				test: /\.(vue|js|jsx)$/,
				loader: 'eslint-loader',
				exclude: /node_modules/,
				enforce: 'pre'
			},
		]
	}
}
```
那么`enforce`就是说在这些文件对应的`loader`解析之前，我们使用`eslint-loader`先对其进行检查，然后再用对应的`loader`去打包，因为规范检查一定要在最前面，不然就失去了检查的意义。然后我们在`webpack.dev.js`中添加一个配置：
```javascript
// webpack.dev.js
const devConfig = {
  devServer: {
    overlay: true,
  },
```
这样我们启动`npm run dev`之后，就会将`eslint`中的规范问题全部显示在浏览器中，以浮层的形式。然后根据说明一个个改，改完是否改正确也能随时在浏览器中的浮层中显示出来即可。

<font color=#DD1144>当然了因为代码规范校验是一定会减慢打包速度的，一般我们不想减慢打包速度来实现代码校验，我们会在团队的git提交之前去检查，具体的实现可以参照vue服务端渲染的笔记</font>
