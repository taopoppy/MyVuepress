# SSR引入路由机制

## 服务端渲染中的路由
之前我们通过图示的方式展示了同构的过程，那只是最简单的流程而是，当我们切换地址的时候，我们就需要进一步扩展我们的流程，我们来看一下如果在同构中引入路由，完整的流程应该是什么：
+ <font color=#9400D3>服务端运行React代码渲染出HTML</font>
+ <font color=#9400D3>服务器发送HTML给浏览器</font>
+ <font color=#9400D3>浏览器接收到内容并展示</font>
+ <font color=#9400D3>浏览器想服务器请求js文件并加载</font>
+ <font color=#9400D3>JS中的React代码在浏览器端重新执行</font>
+ <font color=#9400D3>JS中的React代码接管页面操作</font>
+ <font color=#DD1144>JS代码拿到浏览器上的地址</font>
+ <font color=#DD1144>JS代码根据地址返回不同地路由内容</font>

但是客户端的路由和服务端的路由还有所不同，<font color=#1E90FF>客户端使用的路由是BrowserRouter，服务端使用的路由是StaticRouter</font>,下面我们先来下载`react-router-dom`：
```javascript
npm install react-router-dom@4.3.1 --save
```
然后创建`src/Routes.js`，在里面创建路由条目:
```javascript
// src/Routes.js
import React from 'react'
import { Route } from 'react-router-dom'
import Home from './containers/Home/index.js'
import Login from './containers/Login/index.js'

export default (
	<div>
		<Route path='/' exact component={Home}></Route>
		<Route path='/login' exact component={Login}></Route>
	</div>
)
```
我们知道：<font color=#DD1144>在同构当中使用路由，路由要在服务端跑一遍，也要在客户端跑一遍，提高用户体验</font>，首先在客户端跑一遍路由和我们之前写`react`项目没啥区别：
```javascript
// src/client/index.js
import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter } from 'react-router-dom' // 引入BrowserRouter
import Routes from '../Routes' // 引入路由条目

const App = () => {
	return (
		<BrowserRouter>
			{ Routes }
		</BrowserRouter>
	)
}

ReactDom.hydrate(<App />,document.getElementById('root'))
```
在服务端跑一遍路由要和客户端渲染的内容保持统一：
```javascript
// src/server/index.js
import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Routes from '../Routes'

const app = express()
app.use(express.static('public'))

app.get('*',function (req,res) {
	const content = renderToString((
		<StaticRouter location={req.path} context={{}}>
			{Routes}
		</StaticRouter>
	))

	res.send(
		`<html>
			<head>
				<title>ssr</title>
			</head>
			<body>
				<div id="root">${content}</div>
				<script src='/index.js'></script>
			</body>
		</html>`
	)
})

var server = app.listen(3000, function() {
	var host = server.address().address
	var port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)
})
```
如上代码所示，我们注释掉之前组件的写法，然后在服务端使用`StaticRouter`来作为`renderToString`的参数，但是注意三点：
+ <font color=#1E90FF>由于StaticRouter是在服务端，它不能像BrowserRouter直接拿到浏览器的地址，所以必需给传递location参数，而且要写法后端路由处理函数当中，才能拿到req.path</font>
+ <font color=#1E90FF>context属性是在书写StaticRouter时必需要写的，关乎于数据的处理，这个我们后面再说</font>
+ <font color=#1E90FF>后端路由为了能走react的路由，必需将app.get('/')改成app.get('*')</font>

此时我们再次访问`localhost:3000`或者`localhost:3000/login`都是没有问题的。

## 多页面路由跳转
实际上我们上面已经完整了多页面路由的跳转，因为我们可以在浏览器中输入不同的路由都能正确的跳转，下面我们就简单的优化一下`server`当中的代码：
```javascript
// src/server/index.js
import express from 'express'
import { render } from './utils' // 引入render

const app = express()
app.use(express.static('public'))

app.get('*',function (req,res) {
	res.send(render(req))
})

var server = app.listen(3000, function() {
	var host = server.address().address
	var port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)
})
```
```javascript
// src/server/utils.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Routes from '../Routes'

export const render = (req) => {
	const content = renderToString((
		<StaticRouter location={req.path} context={{}}>
			{Routes}
		</StaticRouter>
	))
	return `
	<html>
		<head>
			<title>ssr</title>
		</head>
		<body>
			<div id="root">${content}</div>
			<script src='/index.js'></script>
		</body>
	</html>
	`
}
```
实际上我们把服务端生成`html`的工作都交给了`utils`当中的`render`函数。代码看起来更加简洁

## 使用Link标签串联路由流程
我们创建一个`src/components/Header.js`：
```javascript
// src/componnets/Header.js
import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
	return (
		<div>
			<Link to='/'>Home</Link>
			<Link to='/login'>Login</Link>
		</div>
	)
}
export default Header
```
然后我们在其他页面上引入这个公用组件：
```javascript
// src/containers/Home/index.js
import React from 'react'
import Header from '../../components/Header'

const Home = () => {
	return (
		<div>
			<Header />
			<div>this is home</div>
			<button onClick={()=> {alert('click')}}>click</button>
		</div>
	)
}

export default Home
```
```javascript
// src/containers/Login/index.js
import React from 'react'
import Header from '../../components/Header'

const Login = () => {
	return (
		<div>
			<Header />
			<div>this is Login page</div>
		</div>
	)
}

export default Login
```
无论我们在哪个页面都可以通过`Link`的链接来完成页面之间的跳转，但是有个特别有趣的现象，当我们在页面之间跳转的时候，我们会发现后端服务器不再接受任何请求，也就是说除了刷新页面和第一次进入页面会向服务端请求`html`和`js`文件，之后无论在页面上进行任何操作，浏览器都不会再向服务器发送请求，这是什么原因？

<font color=#DD1144>因为服务端渲染只发生在第一次进入页面的时候</font>，<font color=#1E90FF>第一次进入页面浏览器会向服务器发送请求，服务器把渲染好的页面返回给浏览器，同时浏览器也请求到了js文件，但是执行完毕js文件后，页面就被js，或者说被react接管了，所有之后页面的交互和页面跳转都是js当中的react代码执行的效果而已</font>，<font color=#9400D3>可以理解为服务端渲染只渲染第一个页面，其他都是客户端渲染</font>

举两个例子：
+ 当你第一次直接输入`localhost:3000`，`localhost:3000/`这个页面时服务端渲染出来的，从`/`通过页面跳转到`/Login`，`localhost:3000/Login`这个页面是客户端渲染的
+ 当你第一次直接输入`localhost:3000/login`，`localhost:3000/Login`这个页面时服务端渲染出来的，从`/Login`通过页面跳转到`/`，`localhost:3000/`这个页面是客户端渲染的

所以再次强调：<font color=#1E90FF>服务端只发生在第一次进入页面的时候，这个<font color=#3eaf7c>第一次</font>的含义包含你直接在浏览器中输入地址的情况，也包括你刷新浏览器当前网页的情况</font>