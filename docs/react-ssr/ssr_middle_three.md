# SSR中的数据问题

## 流程和问题分析
按照之前的过程分析，我们在`react`中的`redux`当中去获取数据，相当于还是在客户端获取的数据，并没有在服务端获取数据，为了更好的学习整个服务端的知识，我们现在继续来巩固一下流程：
+ <font color=#DD1144>服务器接收到请求，这个时候store是空的</font>
+ <font color=#DD1144>componentDidMount在服务端渲染的时候不执行</font>
+ <font color=#DD1144>客户端代码执行，这个时候store依旧是空的</font>
+ <font color=#DD1144>客户端执行componentDidMount，列表数据获取</font>
+ <font color=#DD1144>store中的列表数据被更新</font>
+ <font color=#DD1144>客户端渲染除store中的list数据对应的列表内容</font>

所以我们下面实际上要解决的问题就是让服务端的`componentDidMount`也去执行，在服务端也能异步的获取到数据，<font color=#1E90FF>不过当然了，服务端始终是没有办法去执行componentDidMount方法的，我们可以通过别的方法在服务端实现类似的效果</font>

## loadData方法和路由重构
我们首先要理清解决问题的思路，既然服务端无法执行`componentDidMount`方法，而且`store`一直是空的，那我们的解决问题的思路就是：<font color=#9400D3>在服务端提前让store当中存在需要的数据即可</font>

但是服务端渲染只有一次，第一次渲染的组件也不确定，怎么确定`store`当中提前有被渲染组件的数据呢? <font color=#DD1144>方法就是根据用户输入的地址，结合路由条目查出服务端第一次要渲染的组件</font>

查到组件之后，我们需要在组件渲染之前就加载好它所需要的数据，这个问题在[react-router-dom](https://reacttraining.com/react-router/web/guides/server-rendering/data-loading)当中已经有解决方法，就是<font color=#DD1144>loadData方法，而且下面的代码修改都是根据这个网址当中的解决方法</font>

所以我们再来整理一下，<font color=#1E90FF>用户在浏览器中输入地址，向服务端发送请求，然后服务端拿到请求路径，结合路由条目分析出服务端要渲染的组件，执行组件的loadData方法获取数据，然后将数据注入到store当中，然后将有数据的store传入Provider当中</font>

首先我们来给组件添加一个`loadData`方法,我们暂时还不去实现它，先写上：
```javascript
// src/comtainers/Home/index.js
Home.loadData = () => {
	// 这个函数，负责在服务器渲染之前，把这个路由需要的数据提前加载好
}
```

接着将路由条目修改成为数组写法：
```javascript
// src/Routes.js
import Home from './containers/Home/index.js'
import Login from './containers/Login/index.js'

export default [
	{
		path: '/',
		component: Home,
		exact: true,
		loadData: Home.loadData,
		key: 'home',
		// routes: [{
		// 	path: '/ttt',
		// 	component: Login,
		// 	exact: true,
		// 	key: 'login'
		// }]
	},
	{
		path: '/login',
		component: Login,
		exact:true,
		key: 'login'
	},
]
```

接着我们来下载：
```javascript
npm install --save react-router-config@1.0.0-beta.4
```
然后开始修改`src/server/utils.js`
```javascript
// src/server/utils.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter,Route } from 'react-router-dom' // 引入Route
import { matchRoutes } from 'react-router-config' // 引入matchRoutes实现多级路由匹配
import routes from '../Routes' // 拿到路由条目
import { Provider } from 'react-redux'
import getStore from '../store/index.js'

export const render = (req) => {
	const store = getStore()
	// 这里获取异步数据，并填充到store当中
	// store里面填充很什么，我们不知道，需要结合当前用户请求地址，和路由做判断
	// 如果用户访问 / 路径，我们就拿home组件的异步数据
	// 如果用户访问 /login 路径，我们就拿login组件的异步数据
	// 总结：根据路由的路径，来往store里面加载数据

	const matchedRoutes = matchRoutes(routes, req.path) // 根据路径匹配路由条目

	const content = renderToString((
		<Provider store={store}>
			<StaticRouter location={req.path} context={{}}>
				<div>
					{routes.map(route => (
						<Route {...route} />  {/*路由条目已经变成数组写法*/}
					))}
				</div>
			</StaticRouter>
		</Provider>
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
+ `react-router-dom`是依赖于`react-router-config`的，而且多级路由匹配必须依赖于`react-router-config`当中的`matchRoutes`方法，而不是`react-router-dom`当中默认的`matchPath`方法，比如我们访问`localhost:3000/ttt`，`matchPath`方法只能匹配到`/ttt`，而`matchRoutes`方法能匹配到`/`和`/ttt`两个路径，如果两个路径对应的组件都要异步加载数据，那么显然就只能使用`matchRoutes`方法。


既然路由条目当中的写法发生了变化，我们就要去`src/client/index`当中也要修改一下写法：
```javascript
// src/client/index.js
import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter,Route } from 'react-router-dom' // 引入Route
import routes from '../Routes' // 引入路由条目
import { Provider } from 'react-redux'
import getStore from '../store/index.js'

const App = () => {
	return (
		<Provider store={getStore()}>
			<BrowserRouter>
				<div>
					{routes.map(route => (
						<Route {...route} /> {/*路由条目已经变成数组写法*/}
					))}
				</div>
			</BrowserRouter>
		</Provider>
	)
}

ReactDom.hydrate(<App />,document.getElementById('root'))
```

## 服务端渲染获取数据
到上面为止，我们只是做了一些服务端获取数据的准备，现在我们来真正的从服务端获取数据,我们依旧按照从服务端请求入口的顺序来说明：
```javascript
// src/server/index.js
import express from 'express'
import { render } from './utils'
import getStore from '../store/index.js'
import routes from '../Routes' // 路由条目
import { matchRoutes } from 'react-router-config' // 匹配方法


const app = express()
app.use(express.static('public'))

app.get('*',function (req,res) {
	const store = getStore()              // 生成新的store
	const matchedRoutes = matchRoutes(routes, req.path) // 根据请求地址匹配路由
	const promises = []

	matchedRoutes.forEach(item => {
		if (item.route.loadData) { // 如果路由对应的组件包含loadData方法
			promises.push(item.route.loadData(store))  // 可能请求地址对应多个组件，多个组件就有多个loadData异步请求
		}
	});

	Promise.all(promises).then(()=> {
		res.send(render(store,routes,req)) // 把有数据的store返回给render
	})
})

var server = app.listen(4000, function() {
	var host = server.address().address
	var port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)
})
```
```javascript
// src/server/utils.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter,Route } from 'react-router-dom'
import { Provider } from 'react-redux'

export const render = (store,routes,req) => {
		// 等到异步加载完毕，store中有数据再执行后面
		const content = renderToString((
			<Provider store={store}>
				<StaticRouter location={req.path} context={{}}>
					<div>
						{routes.map(route => (
							<Route {...route} />
						))}
					</div>
				</StaticRouter>
			</Provider>
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
```javascript
// src/containers/Home/index.js
Home.loadData = (store) => {
	// 这个函数，负责在服务器渲染之前，把这个路由需要的数据提前加载好
	return store.dispatch(getHomeList())
}
```
```javascript
// src/comtainers/Home/store/action.js
export const getHomeList = () => {
	return (dispatch)=> {
		return axios.get('http://localhost:4000/newsList.json')
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
注意，因为请求数据是异步的，所以我们这里必须将`axios.get()`方法这种`promise`返回回去。

## 数据的脱水和注水
实际上我们上面已经完成了一个比较完成的服务端渲染了，但是你会发现一个问题，<font color=#DD1144>在进入浏览器的时候，页面上的会闪一下，然后在显示</font>

这个问题很简单，<font color=#9400D3>虽然服务端渲染出了数据，但是服务端渲染完，客户端还要渲染，客户端，渲染的时候一开始store依旧是空的，客户端还要重新请求一遍数据，重新渲染一遍，也导致了服务端返回了有数据的html，客户客户端渲染开始一瞬间客户端中的store是空了，页面数据就没了，客户端重新请求重新渲染，页面数据又有了，这个过程虽然短暂，但是也会有闪烁的过程</font>

所以为了解决这个问题，<font color=#DD1144>我们需要将客户端的store中的数据和服务端保持统一，这就涉及到了数据的脱水和注水</font>

我们在服务端返回`html`的时候将`store`中的内容赋值给`window.context`：
```javascript
// src/server/utils.js
return `
	<html>
		<head>
			<title>ssr</title>
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
```
这个过程就叫做<font color=#DD1144>数据的注水</font>，接着我们在客户端渲染的时候从`window.context`，然后作为数据的默认值重新创建一个新的`store`：
```javascript
// src/store/index.js
import { createStore, applyMiddleware,combineReducers,compose  } from 'redux'
import thunk from 'redux-thunk'
import { reducer as homeReducer } from '../containers/Home/store/index.js'

// 组合各个组件中的reducer
const reducer = combineReducers({
	home: homeReducer
})


export const getStore = ()=> {
	return createStore(reducer,applyMiddleware(thunk))
}

export const getClientStore = () => {
	// 在浏览器打开redux插件
	const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

	const enhancer = composeEnhancers(
		applyMiddleware(thunk),
	);


	const defaultState = window.context.state
	// 把从服务端哪来的store作为第二个参数
	return createStore(reducer,defaultState,enhancer)
}
```
```javascript
// src/client/index.js
import { getClientStore } from '../store/index.js' // 引入创建客户端store的方法

const store = getClientStore() // 创建有数据的store

const App = () => {
	return (
		<Provider store={store}> {/*使用和服务端数据一样的store*/}
			<BrowserRouter>
				<div>
					{routes.map(route => (
						<Route {...route} />
					))}
				</div>
			</BrowserRouter>
		</Provider>
	)
}

ReactDom.hydrate(<App />,document.getElementById('root'))
```
这种客户端渲染的时候直接从`window.context`中拿出数据使用的方式就叫做<font color=#DD1144>数据的脱水</font>，但是你想想，既然可以直接从服务端拿到数据，我们是不是在`react`组件当中的`componentDidMount`就没有必要写了呢？

<font color=#9400D3>当然不行，我们说服务端渲染只有第一次访问的时候，所以假如你第一次进入的组件中没有异步请求，比如第一次先进入localhost:3000/login，那么服务端也不会请求数据，那么store就是空，在客户端的路由从'/login'跳转到'/','/'对应的组件Home没有componentDidMount发异步请求,Home页面也就没有数据。但是第一次从服务端取了数据，再在客户端取一次，第一次就比较消耗性能，我们可以在组件的componentDidMount当中做个判断</font>：

```javascript
// src/containers/Home/index.js
class Home extends React.Component {
	componentDidMount() {
		if(!this.props.list.length) { // 如果store当中没有数据，我们就去请求
			this.props.getHomeList()
		}
	}
}
```

最后我们来使用做一个图示，帮助你理解到底是怎么让服务端在渲染页面之前`store`中就有了数据和客户端的`clientStore`怎么在创建的时候和`serverStore`保持一致的：

<img :src="$withBase('/react_ssr_clientstore.png')" alt="数据问题解决">