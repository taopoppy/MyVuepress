# 登录和列表

## 登录功能制作
首先我们修改一下`server/proxyServer.js`当中的内容：
```javascript
// src/proxyServer.js
const http = require('http')

let islogin = false

http.createServer(function(req,res) {
	// 跨域设置
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.setHeader("X-Powered-By",' 3.2.1')
	res.setHeader("Content-Type", "application/json;charset=utf-8");

	// 列表接口
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

	// 判断是否登录
	if(req.url === '/ssr/api/isLogin.json?secret=abcd'&& req.method ==='GET') {
		res.end(JSON.stringify(
			{
				"success": true,
				"data": {
					"login":islogin
				}
			}
		))
	}
	// 登录
	if(req.url === '/ssr/api/login.json?secret=abcd'&& req.method ==='GET') {
		islogin = true
		res.end(JSON.stringify(
			{
				"success": true,
				"data": {
					"login": true
				}
			}
		))
	}
	// 退出登录
	if(req.url === '/ssr/api/logout.json?secret=abcd'&& req.method ==='GET') {
		islogin = false
		res.end(JSON.stringify(
			{
				"success": true,
				"data": {
					"logout": true
				}
			}
		))
	}

	// 翻译列表
	if(req.url === '/ssr/api/translations.json?secret=abcd'&& req.method ==='GET') {
		if(islogin === false) {
			res.end(JSON.stringify({"success":false}))
		} else {
			res.end(JSON.stringify(
				{
					"success": true,
					"data": [
						{ "id":1, "title":"男孩落入洛杉矶污水系统后获救" },
						{ "id":2, "title":"独立厨师交流点子" },
						{ "id":3, "title":"移民者关注墨西哥边境政策" },
						{ "id":4, "title":"成千上万的美国教师罢工要求加薪" },
						{ "id":5, "title":"五年前，马丁-路德遇刺身亡" },
					]
				}
			))
		}
	}
}).listen(4000)
console.log("server is running on 4000")
```
上面的代码你可以直接复制，只需要记住：
+ 访问`localhost:4000/ssr/api/isLogin.json?secret=abcd`可以根据返回结果判断是否登录
+ 访问`localhost:4000/ssr/api/login.json?secret=abcd`是进行登录
+ 访问`localhost:4000/ssr/api/logout.json?secret=abcd`是退出登录
+ 访问`localhost:4000/ssr/api/translations.json?secret=abcd`根据登录状态返回不同的内容


## 登录接口打通
我们首先来实现以下项目能够从`localhost:4000`当中获取当前登录状态，显示到页面上的功能，因为我们之前在所有页面上都实现了加载`Header`组件的功能，所以我们希望在`Header`组件加载的时候就去异步获取登录状态：
```javascript
// src/components/Header/index.js
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {  connect } from 'react-redux'

const Header = (props) => {
	return (
		<div>
			<Link to='/'>首页</Link><br/>
			{
				props.login ?
					<Fragment>
						<Link to='/login'>翻译列表</Link>
						<Link to='/login'>退出</Link>
					</Fragment>:
					<Link to='/login'>登录</Link>
			}
		</div>
	)
}

const mapStateToProps = (state) => ({
		login: state.header.login
})

export default connect(mapStateToProps,null)(Header)
```
```javascript
// src/components/Header/store/reducer.js
import { CHANGE_LOGIN } from './constants'

const defaultState = {
	login: true
}

export default (state=defaultState, action) => {
	switch(action.type) {
		case CHANGE_LOGIN:
			const newState = {...state,login:action.value}
			return newState
		default:
			return state
	}
}
```
```javascript
// src/components/Header/store/index.js
import reducer from './reducer'
import * as actions from './actions'

export { reducer, actions }
```
```javascript
// src/components/Header/store/constants.js
export const CHANGE_LOGIN = 'HOME/CHANGE_LOGIN'
```
```javascript
// src/components/Header/store/actions.js
import { CHANGE_LOGIN } from './constants'

export const changeLogin = (value) => ({
	type: CHANGE_LOGIN,
	value
})

export const getHeaderInfo = () => {
	return (dispatch, getState, axiosInstance)=> {
		return axiosInstance.get('/api/isLogin.json?secret=abcd')
		.then((res)=>{
			const isLogin = res.data.data.login
			dispatch(changeLogin(isLogin))
		})
		.catch((err)=> {
			console.log(err)
		})
	}
}
```
上面这些内容基本上就是一个组件的`UI`内容，和组件的`Redux`内容，所以有了这些内容，我们需要将其合并到总的`store`当中:
```javascript
// src/store/index.js
import { reducer as headerReducer } from '../components/Header/store/index.js'

const reducer = combineReducers({
	home: homeReducer,
	header: headerReducer
})
```
<font color=#1E90FF>然后我们思考，既然我们希望你无论访问任何页面，都会发送异步请求去请求是否登录这个状态，所以我们要看在路由条目当中实际上你无论访问什么页面都会先匹配到App这个组件，所以服务端渲染都会渲染App，所以我们把异步请求的代码放在App.loadData当中</font>：

```javascript
// src/Routes.js
export default [{
	path: '/',
	component: App,
	loadData: App.loadData, // 添加方法
	...
}]
```

```javascript
// src/App.js
import { actions } from './components/Header/store/index.js'

App.loadData = (store) => {
	return store.dispatch(actions.getHeaderInfo())
}
```
但是你要注意，在`App`组件当中去派发的是`Header`组件当中的`action`，然后去重启项目，你会发现，我们一开始在`Header`当中`reducer`定义的`login`是`true`，经过异步请求，请求来的实际上是`false`，所以你可以在页面上看到只有登录按钮，而不是退出按钮，另外在源码当中`windows.context`中的数据也是`"header":{"login":false}`,这就说明我们确实在服务端渲染中请求到了登录状态，并且保存在了`redux`当中。

## 登录状态切换
登录状态切换无非就是在登录和点击的时候去请求`localhost:4000/ssr/api/login.json?secret=abcd`进行登录，和`localhost:4000/ssr/api/logout.json?secret=abcd`退出登录，分别在请求完成后去修改`redux`当中的值即可，所以：
```javascript
// src/components/Header/index.js
import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { actions } from './store/index.js'

class Header extends React.Component {
	render() {
		const { login, handleLogin, handleLogout } = this.props
		return (
			<div>
				<Link to='/'>首页</Link><br/>
				{
					login ?
						<Fragment>
							<Link to='/translation'>翻译列表</Link>
							<div onClick={handleLogout}>退出</div>
						</Fragment>:
						<div onClick={handleLogin}>登录</div>
				}
			</div>
		)
	}
}
const mapStateToProps = (state) => ({
	login: state.header.login
})

const mapDispatchToProps = (dispatch) => ({
	handleLogin() {
		dispatch(actions.login())  // 登录
	},
	handleLogout() {
		dispatch(actions.logout()) // 退出登录
	}
})

export default connect(mapStateToProps,mapDispatchToProps)(Header)
```
```javascript
// src/components/Header/store/actions.js

export const login = () => {
	return (dispatch, getState, axiosInstance)=> {
		return axiosInstance.get('/api/login.json?secret=abcd')
		.then((res)=>{
			dispatch(changeLogin(true)) // 修改store当中的值为true
		})
		.catch((err)=> {
			console.log(err)
		})
	}
}

export const logout = () => {
	return (dispatch, getState, axiosInstance)=> {
		return axiosInstance.get('/api/logout.json?secret=abcd')
		.then((res)=>{
			dispatch(changeLogin(false))// 修改store当中的值为false
		})
		.catch((err)=> {
			console.log(err)
		})
	}
}
```

## 解决登录cookie传递的问题
虽然我们解决的登录和退出的问题，但是你会发现在你有时候登录完成之后，刷新页面，页面会展示给你的是没有登录的页面，因为，<font color=#1E90FF>登录之后重新刷新页面的时候，浏览器给node服务器发送了cookie，但是node把请求代理的时候没有携带浏览器传来的cookie</font>

所以我们需要这样做，在服务端拿到浏览器请求的时候去创建`store`的时候传入`req`:
```javascript
// src/server/index.js
app.get('*',function (req,res) {
	const store = getStore(req)  // 传入req
})
```
```javascript
// src/store/index.js
export const getStore = (req)=> {
	return createStore(reducer,applyMiddleware(thunk.withExtraArgument(serverAxios(req))))
}
```
我们都知道之前`serverAxios`是个`axios`的实例，现在变成了一个方法，所以我们需要修改一下原来的写法：
```javascript
// src/server/request.js
import axios from 'axios'

const createInstance = (req) => axios.create({
	baseURL: 'http://localhost:4000/ssr',
	headers: {
		coodkie: req.get('cookie') || ''
	}
})

export default createInstance
```
所以现在你会发现，当我们在未登录的时候发请求给服务器的时候携带的是空字符串的`cookie`，在登录之后，我们发请求给服务器的时候携带的就是有值的`cookie`

## 翻译列表页面制作
翻译列表的制作实际上和之前的那些组件写法一模一样，我们这里直接列出代码，就不详细解释了：
```javascript
// src/Routes.js
import Translation from './containers/Translation/index.js' // 引入组件
export default [{
	path: '/',
	component: App,
	loadData: App.loadData,
	routes: [
		// 配置路由
		{
			path: '/translation',
			component: Translation,
			exact: true,
			loadData: Translation.loadData,
			key: 'translation'
		},
	]
}]
```
```javascript
// src/containers/Translation/index.js
import React from 'react'
import {  connect } from 'react-redux'
import { getTranslationList } from './store/action'
import { Redirect } from 'react-router-dom'

class Translation extends React.Component {
	componentDidMount() {
		if(!this.props.list.length) {
			this.props.getTranslationList()
		}
	}
	getList() {
		const { list } = this.props
		return list.map(item => <div key={item.id}>{item.title}</div>)
	}
	render() {
		if(this.props.login) {
			return (
				<div>
					{
						this.getList()
					}
					<button onClick={()=> {alert('click')}}>click</button>
				</div>
			)
		}else {
			return <Redirect to='/'/> // 跳转到首页
		}
	}
}
Translation.loadData = (store) => {
	return store.dispatch(getTranslationList())
}

const mapStateToProps = (state) => ({
	list: state.translation.translationList,
	login: state.header.login // 拿到登录状态
})

const mapDispatchToProps = (dispatch) => ({
	getTranslationList() {
		dispatch(getTranslationList())
	}
})

export default connect(mapStateToProps,mapDispatchToProps)(Translation)
```
```javascript
// src/containers/Translation/store/action.js
import {
	CHANGE_LIST
} from './constants'

const changeList = (list) => {
	return {
		type: CHANGE_LIST,
		list
	}
}

export const getTranslationList = () => {
	return (dispatch, getState, axiosInstance)=> {
		return axiosInstance.get('/api/translations.json?secret=abcd')
		.then((res)=>{
			if (res.data.success) {
				const list = res.data.data
				dispatch(changeList(list))
			} else {
				const list = []
				dispatch(changeList(list))
			}
		})
		.catch((err)=> {
			console.log(err)
		})
	}
}
```
```javascript
// src/containers/Translation/store/constants.js
export const CHANGE_LIST = 'TRANSLATION/CHANGE_LIST'
```
```javascript
// src/containers/Translation/store/index.js
import reducer from './reducer'

export { reducer }
```
```javascript
// src/containers/Translation/store/reducer.js
import {
	CHANGE_LIST
} from './constants'

const defaultState = {
	translationList: []
}

export default (state = defaultState,action) => {
	switch(action.type) {
		case CHANGE_LIST:
			const newState = {...state,translationList:action.list}
			return newState
		default:
			return state
	}
}
```
最后我们把`store`进行合并即可：
```javascript
import { reducer as translationReducer } from '../containers/Translation/store/index.js' // 引入

const reducer = combineReducers({
	...
	translation:translationReducer // 合并
})
```
