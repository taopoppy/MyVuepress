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

## redux-thunk的withExtraArgument

## renderRoutes支持多级路由

## 登录功能制作

## 登录接口打通

## 登录状态切换

## 解决登录cookie传递的问题

## 翻译列表页面制作