# Node作为数据获取的中间层

## proxy和中间层获取数据
<img :src="$withBase('/react_ssr_middleware.png')" alt="中间层">

这个图是我们之前讲的，我们说想让`node`来做中间层，浏览器发出的所有请求都会经过`node`层，可是我们之前写的代码表面是没有问题的，但是实际上存在<font color=#DD1144>部分中间层的缺失</font>，为什么，<font color=#1E90FF>因为服务端渲染只有在第一次访问的时候才有的，所以正常的情况是你访问localhost:3000，然后node去访问java接口，返回完整的html网页，但是当react接管代码后，如果组件当中还有直接向java接口发送的ajax请求，那么就发生了node中间层的缺失</font>

所以我们的目的是：<font color=#9400D3>客户端做什么事情都通过node中间层去请求，实际上就是想让我们的node服务变成一个proxy代理服务器</font>

我们先来下载一个`express-http-proxy`的插件，这个插件可以方便的在`express`当中去搭建一个`proxy`服务器：
```javascript
npm install express-http-proxy@1.2.0 --save
```
然后我们修改一下`src/containers/Home/store/action.js`：
```javascript
// src/containers/Home/store/action.js
export const getHomeList = () => {
	return (dispatch)=> {
		return axios.get('/api/news.json?secret=abcd') // 请求localhost:3000/api/news.json?secret=abcd
		.then((res)=>{
			const list = res.data
			dispatch(changeList(list))
		})
		.catch((err)=> {
			console.log(err)
		})
	}
}
```
然后我们修改服务端的代码，利用`express-http-proxy`插件将服务器作为一个代理服务器：
```javascript
// src/server/index.js
import express from 'express'
import proxy from 'express-http-proxy' // 引入express-http-proxy

const app = express()
app.use(express.static('public'))

// 用户请求http://localhost:3000/api/news.json?secret=abcd
// req.url = /news.json?secret=abcd （注意，不包含api）
// proxyReqPathResolver方法返回的是/ssr/api/news.json?secret=abcd
// proxy（http://localhost:4000） + proxyReqPathResolver（/ssr/api/news.json?secret=abcd） = 完整的地址
// 最终代理到http://localhost:4000/ssr/api/news.json?secret=abcd
app.use('/api',proxy('http://localhost:4000', {
	proxyReqPathResolver: function (req) {
		return '/ssr/api'+ req.url
	}
}));

app.get('*',function (req,res) {
	// 先忽略服务端渲染的代码
	res.send(render(store,routes,req))
})

var server = app.listen(3000, function() {
	var host = server.address().address
	var port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)
})
```
我们同时可以可以书写一个`proxyServer.js`来模拟`java`的服务器的接口：
```javascript
// proxyServer.js
const http = require('http')

http.createServer(function(req,res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.setHeader("X-Powered-By",' 3.2.1')
	res.setHeader("Content-Type", "application/json;charset=utf-8");
	if(req.url === '/ssr/api/news.json?secret=abcd' && req.method ==='GET') {
		let result = [
			{ "id": 1, "title": "this is first data","hash":"R59cdr"},
			{ "id": 2, "title": "this is second data","hash":"re58dr"},
			{ "id": 3, "title": "this is third data","hash":"OVk8rR"},
			{ "id": 4, "title": "this is fourth data","hash":"04C84R"},
			{ "id": 5, "title": "this is fifth data","hash":"Mkr90f"}
		]
		res.end(JSON.stringify(result))
	}
}).listen(4000)
console.log("server is running on 4000")
```

## 前后端请求的不同处理
上面我们完成了，客户端请求`node`中间层，中间层将请求代理到4000端口模拟的`java`服务，但是上面的代码我们没有开启服务端的代码，如果你开启服务端的代码，你会发现程序就报错了，原因是：<font color=#1E90FF>axios.get('/api/news.json?secret=abcd')这段代码在客户端运行的时候，实际上请求的是localhost:3000/api/news.json?secret=abcd,但是在服务端运行的时候，实际上请求的是服务器根目录下api/news.json?secret=abcd，但是服务器压根来拿api这个文件都没有</font>

所以实际上我们在请求的时候需要清楚的知道请求发生在客户端还是服务端，实际上在组件`componentDidMount`里面调用请求是客户端发起的请求，在组件的`loadData`方法中发起的请求是服务端发起的请求，所以调用同一个`ajax`方法的时候传递不同的标志参数即可：
```javascript
// src/containers/Home/store/action.js
export const getHomeList = (server) => {
	let url = ''
	server ?
		url = 'http://localhost:4000/ssr/api/news.json?secret=abcd' : // 服务端请求地址
		url = '/api/news.json?secret=abcd' // 客户端请求地址

	return (dispatch)=> {
		return axios.get(url)
		.then((res)=>{
			const list = res.data
			dispatch(changeList(list))
		})
		.catch((err)=> {
			console.log(err)
		})
	}
}
```
然后我们在组件当中这样传递参数：
```javascript
// src/containsers/Home/index.js
class Home extends React.Component {
	componentDidMount() {
		if(!this.props.list.length) {
			this.props.getHomeList(false) // 传递false，客户端请求的标志
		}
	}
}

Home.loadData = (store) => {
	return store.dispatch(getHomeList(true)) // 传递true，服务端请求的标志
}
```
到这里你应该明白了两个不同的流程：
+ <font color=#DD1144>如果直接访问localhost:3000</font> -> <font color=#DD1144>此时是服务端渲染</font> -> <font color=#DD1144>服务端向localhost:4000/ssr/api/news.json请求数据，返回完整的html给浏览器</font>
+ <font color=#DD1144>如果先访问localhost:3000/login</font> -> <font color=#DD1144>此时是服务端渲染</font> -> <font color=#DD1144>然后路由跳转到localhost:3000</font> -> <font color=#DD1144>这个时候就是客户端渲染</font> -> <font color=#DD1144>客户度向localhost:3000/api/news.json发送请求</font> -> <font color=#DD1144>node服务器把浏览器的请求代理到localhost:4000/ssr/api/news.json</font> -> <font color=#DD1144>数据返回给浏览器显示。</font>

这两个流程非常重要，只有清楚的搞清楚流程才能正确解决出现的问题。

## axios的instance的使用
其实按照上面的写法每个组件当中都要对请求地址做判断是一种很low的做法，对项目的维护性不好。在`axios`当中有两个比较重要的概念分别是<font color=#DD1144>instance</font> 和 <font color=#DD1144>interceptors</font>，在一些比较高级的代码处理的时候非常好用,我们创建`src/client/request.js`和`src/server/request.js`:
```javascript
// src/client/request.js
import axios from 'axios'

const instance = axios.create({
	baseURL: '/'
})

export default instance
```
```javascript
// src/server/request.js
import axios from 'axios'

const instance = axios.create({
	baseURL: 'http://localhost:4000/ssr'
})

export default instance
```
然后我们在`src/containers/Home/store/action.js`当中改写一下代码：
```javascript
// src/containers/Home/store/action.js
import clientAxios from '../../../client/request'
import serverAxios from '../../../server/request'

export const getHomeList = (server) => {
	const request = server? serverAxios: clientAxios

	return (dispatch)=> {
		return request.get('/api/news.json?secret=abcd')
		.then((res)=>{
			const list = res.data
			dispatch(changeList(list))
		})
		.catch((err)=> {
			console.log(err)
		})
	}
}
```
可以看到我们分别在`serverAxios`和`clientAxios`当中定义了`baseURL`，分别使用他们请求的时候会在请求地址前面自动拼接上`baseURL`的地址，这样书写方便了不少，代码也更优雅。

## redux-thunk的withExtraArgument
由于`withExtraArgument`方法的存在，我们在创建`store`的时候可以携带一个参数进入，这样的话，我们可以携带不同的`axiosInstance`实例进入，这样在客户端请求的时候只能通过`getClientStore`创建`store`，我们就传入`clientAxios`，在服务端请求的时候只能通过`getStore`去创建`store`，我们就传入`serverAxios`,这个参数可以在`actionCreators`的时候作为第三个参数拿到：
```javascript
// src/store/index.js

import clientAxios from '../client/request' // 引入clientAxios
import serverAxios from '../server/request' // 引入serverAxios

const reducer = combineReducers({
	home: homeReducer
})


export const getStore = ()=> {
	return createStore(reducer,applyMiddleware(thunk.withExtraArgument(serverAxios))) // 服务端渲染携带serverAxios
}

export const getClientStore = () => {
	const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

	const enhancer = composeEnhancers(
		applyMiddleware(thunk.withExtraArgument(clientAxios)), // 客服端渲染携带clientAxios
	);


	const defaultState = window.context.state
	return createStore(reducer,defaultState,enhancer)
}
```
```javascript
// src/containers/Home/store/action.js
export const getHomeList = () => {
	return (dispatch, getState, axiosInstance)=> {
		// 如果是客户端请求，客户端创建store的时候携带的是axiosInstance = clientStore
		// 如果是服务端请求，服务端创建store的时候携带的是axiosInstance = serverStore
		return axiosInstance.get('/api/news.json?secret=abcd')
		.then((res)=>{
			const list = res.data
			dispatch(changeList(list))
		})
		.catch((err)=> {
			console.log(err)
		})
	}
}
```

## renderRoutes支持多级路由
我们知道，在`Home`和`Login`都有一个头部的组件，我们分别要在两个组件内部都引入这样的组件，这样有点麻烦，我们可以使用多级路由的写法，在一个地方书写，所有组件内部都含有头部的组件`Header`

首先创建一个`src/App.js`：
```javascript
// src/App.js
import React from 'react'
import Header from './components/Header'
import { renderRoutes } from 'react-router-config'

// 渲染一级路由的内容
const App = (props) => {
	return (
		<div>
			<Header />
			{renderRoutes(props.route.routes)} {/*渲染二级路由的内容*/}
		</div>
	)
}

export default App
```
然后我们修改一下路由条目：
```javascript
// src/Routes.js
import App from './App' // 引入App

export default [{
	path: '/',
	component: App, // 一级路由
	routes: [  // 二级路由
		{
			path: '/',
			component: Home,
			exact: true,
			loadData: Home.loadData,
			key: 'home'
		},
		{
			path: '/login',
			component: Login,
			exact:true,
			key: 'login'
		},
	]
}]
```
+ <font color=#DD1144>这种路由的写法，一级路由是一种模糊匹配，意思就是凡事以 / 这中路由开头都能匹配到 App 组件，然后二级路由是精确匹配，因为有 exact 属性为 true ,所以访问 localhost:3000/login ，首先匹配到一级路由的 App 组件，然后精确匹配到二级路由的 login 组件，所以在 App 组件中会包含 Login 组件的显示内容。</font>

+ <font color=#DD1144>而且二级路由是写在一级路由的routes属性下面，所以二级路由会作为进入到一级路由对应的组件当中，作为组件的props.route属性存在，所以你在App组件当中，renderRoutes渲染二级路由直接渲染的是props.route.routes</font>,，所有有了这样的特性，你可以在二级路由对应的组件当中继续延伸三级路由等等

然后我们需要同时修改客户度和服务端的路由写法：
```javascript
// src/server/utils.js
import { renderRoutes } from 'react-router-config' // 引入renderRoutes

export const render = (store,routes,req) => {
		const content = renderToString((
			<Provider store={store}>
				<StaticRouter location={req.path} context={{}}>
					<div>
						{renderRoutes(routes)} {/*修改写法*/}
					</div>
				</StaticRouter>
			</Provider>
		))
}
```
```javascript
// src/client/index.js
import routes from '../Routes'
import { renderRoutes } from 'react-router-config' // 引入renderRoutes

const store = getClientStore()

const App = () => {
	return (
		<Provider store={store}>
			<BrowserRouter>
				<div>
					{renderRoutes(routes)} {/*修改写法*/}
				</div>
			</BrowserRouter>
		</Provider>
	)
}
ReactDom.hydrate(<App />,document.getElementById('root'))
```
此时我们就可以删除我们在`Home`和`Login`组件当中引入的`Header`组件了