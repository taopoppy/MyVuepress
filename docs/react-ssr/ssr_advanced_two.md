# SSR中的CSS样式

## 支持CSS样式修饰
如果在某个组件当中直接去引入`css`文件是会报错的，因为在`webpack`当中是没有关于`css`的配置的，所以我们需要的到`webpack`当中去配置一下打包`css`文件的`rule`。

首先要去下载两个比价重要的`loader`：
```javascript
npm i style-loader@0.22.1 css-loader@1.0.0 -D
```
```javascript
// webpack.client.js
module.exports = {
	module: {
		rules: [
			...
			{
			test: /\.css?$/,
			use: [
				'style-loader',
				{
					loader:'css-loader',
					options: {
						importLoaders:1,
						modules: true,
						localIdentName: '[name]_[local]_[hash:base64:5]'
					}
				}
			]
		}]
	}
}
```
上面这段代码就不具体解释了，它是关于`webpack`打包的知识，但是这段代码并不能直接放在`webpack.base.js`当中，因为并不是客户端和服务端都能跑的通这段代码，我们说`style-loader`实际上是往`window`对象上挂载样式，但是呢，服务端打包的时候压根就没有`window`这个对象，所以上面这段代码只能添加到`webpack.client.js`当中，而在`webpack.server.js`当中我们需要重新去改一下写法：

在服务端打包`css`实际上我们就不能用`style-loader`，我们需要使用一个新的第三方包，叫做<font color=#DD1144>isomorphic-style-loader</font>，我们首先来下载：
```javascript
npm install isomorphic-style-loader@4.0.0 --save-dev
```

它的用法基本上和`style-loader`是一样的，所以直接就可以使用
```javascript
// webpack.server.js
module: {
	rules: [
		...
		{
			test: /\.css?$/,
			use: [
				'isomorphic-style-loader', // 直接将style-loader替换即可
				{
					loader:'css-loader',
					options: {
						importLoaders:1,
						modules: true,
						localIdentName: '[name]_[local]_[hash:base64:5]'
					}
				}
			]
		}
	]
}
```
这样配置了之后，在客户端使用`css-loader`和`style-loader`来打包样式文件，在服务端使用`css-loader`和`isomorphic-style-loader`来打包样式文件，此时我们就能直接引入`css`样式文件了：
```css
/* src/containers/Home/style.css */
body {
	background: green;
}
.test {
	background: red;
}
```
```javascript
// src/containers/Home/index.js
import style from './style.css'  // 1. 引入样式文件

class Home extends React.Component {
	render() {
		return (
			<div className={style.test}> {/* 2. 添加class样式名*/}
				...
			</div>
		)
	}
}
```
但是这样配置好后有一个很大的问题，当我们访问`localhost:3000`后，<font color=#DD1144>虽然你能看到样式存在，但是实际上存在一个抖动。也就是css样式的名称class="style_test_d3nG6" 已经是在html的标签当中，但是css样式实际上是通过js来加载的，所以一开始服务端返回的html文件中存在css名称，但是没有css效果，加载完毕js才会有css效果，假如js当中的css有比较多的位置样式，布局样式，抖动效果就会愈发明显</font>

为了解决服务端并没有真正渲染出样式的问题，我们将在下面来继续说明。

## CSS样式服务端渲染
首先我们要来分析一波`style-loader`和`isomorphic-style-loader`的区别，<font color=#1E90FF>两者实际上首先都会干同一件事，就是将css-loader打包出来的css样式进行分析，将css样式名称加入到html的标签当中，但是style-loader还做了第二件事，就是将css样式加入到了html当中的head中的style标签中，但是isomorphic-style-loader没有做这件事，所以导致前者不存在抖动，后者虽然html上有css名称，但是需等到js加载完毕才有css效果，所以有抖动</font>

虽然`isomorphic-style-loader`没有将`css`内容挂载到`html`当中，但是在服务端渲染的时候，我们可以打印一下我们通过`import`引入的样式：
```javascript
// src/containers/Home/index.js
class Home extends React.Component {
	componentWillMount() {
		console.log(style)
		if(style._getCss){
			console.log(style._getCss())
		}
	}
}

// 打印结果:style
{
	test: 'style_test_BV3D0',
  _getContent: [Function],
  _getCss: [Function],
  _insertCss: [Function] 
}

// 打印结果：style._getCss()
body {
        background: green;
}
.style_test_BV3D0 {
        background: red;
}

```
可以看到，其中`style._getCss()`返回的就是完整的`css`样式文件当中的内容，那么有了这个内容，我们把这个内容加到服务端返回的`html`字符串中不就完事了么，怎么加呢？我们的思路和之前判断`404`页面是一样的，<font color=#DD1144>服务端渲染的时候可以拿到context，在组件当中将拿到的css内容挂载到context上面的某个属性带出去，然后加入到返回的html字符串当中</font>

```javascript
// src/containers/Home/index.js
class Home extends React.Component {
	componentWillMount() {
		if(this.props.staticContext){ // 1. 判断是服务端渲染
			this.props.staticContext.css = style._getCss() // 2. 将css内容赋值给context.css
		}
	}
}
```
```javascript
// src/server/utils.js
export const render = (store,routes,req,context) => {
	const content = renderToString((
		<Provider store={store}>
			<StaticRouter location={req.path} context={context}>
				<div>
					{renderRoutes(routes)}
				</div>
			</StaticRouter>
		</Provider>
	))

	const cssStr = context.css? context.css : '' // 1. 拿到css内容

	return `
		<html>
			<head>
				<title>ssr</title>
				<style>${cssStr}</style>               // 2. 添加到html字符串当中
			</head>
			<body>
				<div id="root">${content}</div>
				<script>
						window.context = {
							state: ${JSON.stringify(store.getState())}
						}
				</script>
				<script src='/index.js'></script>
			</body>
		</html>
	`
}
```
## 多组件中的样式整合
前面我们以`Home`组件为例，展示了如何唉服务端渲染出`css`，现在我们在`Header`组件当中去按照前面的方式去书写一些样式：
```css
/* src/components/Header/style.css*/
.test {
	background: pink;
}
```
```javascript
// src/components/Header/index.js
import style from './style.css' // 1. 引入样式

class Header extends React.Component {
	componentWillMount() {  // 2. 样式内容赋值给staticContext.css
		if(this.props.staticContext){
			this.props.staticContext.css = style._getCss()
		}
	}

	render() {
		return (
			<div className={style.test}> {/* 3. 使用样式*/}
				...
			</div>
		)
	}
}
```
但是你会发现，这样书写代码之后，`Header`当中样式并不起作用，<font color=#1E90FF>因为在Header当中压根没有拿到this.props.staticContext这个属性，你可以在路由当中去找到一些线索，我们访问localhost:3000实际上按照路由的写法分别要渲染App组件和Home组件，所以context分别会进入到App组件和Home组件，而Header组件虽然在App组件当中使用，但是并不在路由匹配集当中，所以我们必须手动将其staticContext传入Header组件中</font>
```javascript
// src/App.js
const App = (props) => {
	return (
		<div>
			<Header staticContext={props.staticContext}/>{/*手动将staticContext传入*/}
			{renderRoutes(props.route.routes)}
		</div>
	)
}
```
但是这样写完之后，你会发现，样式依旧没有效果，这是因为：<font color=#DD1144>context按照路由进入的App，经我们手动进入了Header，其css属性被赋值，然后进入Home组件其css属性又被赋值，给context.css赋值赋了两遍，显然第一遍的赋值就被覆盖了，所以为了能在context.css上面添加到要渲染的所有组件当中的样式，只能将context.css作为数组来收集所有要渲染组件的样式内容</font>

```javascript
// src/server/index.js
Promise.all(promises).then(()=> {
	const context = {
		css: []   // 1. 将context.css设置为一个数组
	}
	const html = render(store,routes,req,context)
}
```
```javascript
// src/components/Header/index.js
class Header extends React.Component {
	componentWillMount() {
		if(this.props.staticContext){
			this.props.staticContext.css.push(style._getCss()) // 1. 将样式内容push到staticContext.css这个数组当中
		}
	}
}
```
```javascript
// src/containers/Home/index.js
class Home extends React.Component {
	componentWillMount() {
		if(this.props.staticContext){
			this.props.staticContext.css.push(style._getCss())// 1. 将样式内容push到staticContext.css这个数组当中
		}
	}
}
```
```javascript
// src/server/utils.js
export const render = (store,routes,req,context) => {
	...

	const cssStr = context.css.length ? context.css.join('\n') : ''  // 1. 将数组所有元素连接在一起就是整个页面所有组件的css内容
	return `
		<html>
			<head>
				<title>ssr</title>
				<style>${cssStr}</style>                                  // 2. 将css样式添加进入html
			</head>
			<body>
				<div id="root">${content}</div>
				<script>
						window.context = {
							state: ${JSON.stringify(store.getState())}
						}
				</script>
				<script src='/index.js'></script>
			</body>
		</html>
	`
}
```

## 使用高阶组件
可以看到在上面，如果每个组件当中都要在`componentWillMount`当中书写同样的代码来实现服务端渲染`css`样式，势必会造成重复，所以我们可以使用高阶组件来精简我们的代码，创建`src/withStyle.js`
```javascript
// src/withStyle.js
import React from 'react'

// 这个函数，是生成高阶组件的函数
// 这个函数返回一个组件
export default (DecoratedComponent,style) => {
	// 返回的这个组件，叫做高阶组件
	return class NewComponent extends React.Component {
		componentWillMount() {
			if(this.props.staticContext){
				this.props.staticContext.css.push(style._getCss())
			}
		}

		render() {
			return <DecoratedComponent {...this.props}/>
		}
	}
}
```
有了这样的高阶函数，其实所有组件当中相同的代码都可以统一在这里实现，然后我们就可以删除之前在`Home`和`Header`组件当中的`componentWillMount`生命周期函数了：
```javascript
// src/componnents/Header/index.js

import style from './style.css'   // 1. 引入样式
import withStyles from '../../withStyle' // 2. 引入高阶组件生成器

class Header extends React.Component {
	...
}

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(Header, style)) // 3. 生成新的组件
```
```javascript
// src/containers/Home/index.js
import style from './style.css'// 1. 引入样式
import withStyles from '../../withStyle'// 2. 引入高阶组件生成器

class Home extends React.Component {
	...
}

const ExportHome = connect(mapStateToProps,mapDispatchToProps)(withStyles(Home, style)) // 3. 生成新的组件

ExportHome.loadData = (store) => {
	return store.dispatch(getHomeList())
}

export default ExportHome
```




## LoadData方法的问题
我们之前在`Home`组件当中是这样写的：
```javascript
// src/containers/Home/index.js
Home.loadData = (store) => {
	return store.dispatch(getHomeList())
}

export default connect(mapStateToProps,mapDispatchToProps)(Home)
```
这样写实际上是没有问题的，因为`connect`方法比较智能，它发现`Home`组件上有`loadData`方法，它会其挂载到自己生成的组件当中，但是为了更加直观准确我们最好改成下面这样的写法：
```javascript
// src/containers/Home/index.js
const ExportHome = connect(mapStateToProps,mapDispatchToProps)(Home)

ExportHome.loadData = (store) => {
	return store.dispatch(getHomeList())
}

export default ExportHome
```
同理，在`Translation`组件当中我们也做相同的修改即可。
