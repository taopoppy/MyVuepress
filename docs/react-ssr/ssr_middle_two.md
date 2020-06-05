# SSR与Redux整合

## 什么是中间层
在做`react`服务端渲染的时候，我们常常会听到中间层这个概念，什么是中间层，我们来看下面这个图：
<img :src="$withBase('/react_ssr_middleware.png')" alt="中间层">

我们之前讲的同构的整个流程是只发生在浏览器和`node server`之间的，但是在大型项目的时候一般会涉及到数据库的查询和数据库的计算，这种东西我们一般不会放在`node`服务器上去做，而是放在更加底层的服务器上去做，比如`java server`,<font color=#DD1144>因为我们之前就讲过Node由于本身的设计机制更适合做I/O密集的操作，像JAVA和C++更适合做CPU密集的操作</font>。

像上面这种存在于`node`中间层的好处是什么？
+ <font color=#9400D3>java服务器只需要专注于数据的获取和计算</font>
+ <font color=#9400D3>node服务器只需要专注于拼装页面</font>

这种架构各个层级职责清晰，只不过职责越清晰，对前端人员的要求就越高，因为`node`服务器的部署和运维的知识你也要涉及到。

## 同构中引入Redux
引入`Redux`和之前路由的思路基本上是差不多的，需要在服务端和客户度同时引入，我们首先来下载`redux`:
```javascript
// 下载redux
npm install redux@4.0.0 --save

// 下载react-redux
npm install react-redux@5.0.7 --save

// 下载redux-thunk
npm install redux-thunk@2.3.0 --save
```
我们首先先简单的在`react`组件当中使用一下`Redux`：
```javascript
// src/containers/Home/index.js
import React from 'react'
import Header from '../../components/Header'
import {  connect } from 'react-redux' // 引入react-redux

const Home = (props) => {
	return (
		<div>
			<Header />
			<div>this is {props.name}</div>{/*直接使用props.name*/}
			<button onClick={()=> {alert('click')}}>click</button>
		</div>
	)
}

// 添加mapStateToProps
const mapStateToProps = (state) => ({
	name: state.name
})

// 最终导出容器组件
export default connect(mapStateToProps,null)(Home)
```
然后我们创建`src/store/index.js`：
```javascript
// src/store/index.js
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

const reducer = (state={name:"taopoppy"},action) => {
	return state
}
// 返回创建store的函数
const getStore = ()=> {
	return createStore(reducer,applyMiddleware(thunk))
}

export default getStore
```
这里就有个大坑，<font color=#DD1144>我们思考一下为什么要返回一个创建store的函数，而不是直接返回store，因为如果直接返回store，所有的用户通过服务端拿到的store是同一个store，当某个用户修改store，所有用户的store都变了，而我们希望每个用户都有自己的store，所以每个用户访问的时候都通过getStore方法去重新创建一个store，这才是正确的做法</font>

然后我们分别在客户端和服务端分别加入`store`即可

<font color=#1E90FF>**① 客户端引入Redux**</font>

```javascript
// src/client/index.js
import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Routes from '../Routes'
import { Provider } from 'react-redux' // 引入包装器
import getStore from '../store/index.js' // 引入创建store的函数

const App = () => {
	return (
		<Provider store={getStore()}> {/*使用包装器接入store*/}
			<BrowserRouter>
				{ Routes }
			</BrowserRouter>
		</Provider>
	)
}

ReactDom.hydrate(<App />,document.getElementById('root'))
```


<font color=#1E90FF>**② 服务端引入Redux**</font>

```javascript
// src/server/utils.js
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Routes from '../Routes'
import { Provider } from 'react-redux' // 引入包装器
import getStore from '../store/index.js' // 引入创建store的函数

export const render = (req) => {
	const content = renderToString((
		<Provider store={getStore()}> {/*使用包装器接入store*/}
			<StaticRouter location={req.path} context={{}}>
				{Routes}
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
其实你会发现，在客户端和服务端的代码根本就是一模一样的。所以实际上我们可以把公用的创建`store`的过程和`store`中的数据单独拿出去，做一下复用。如果上面的代码你有任何的看不懂，你都需要到我们之前的那个[React + Redux入门详解](taopoppy.cn/react-redux/)中学习，或者[github](https://github.com/taopoppy/MyVuepress/tree/master/docs/react-ssr)上也是一样的。


## 构建Redux代码结构
实际上，在大型项目当中，`Redux`的使用远远没有这么简单，我们下面来说怎么构建一个项目使用`Redux`的规范，由于我们肯定要发送数据，所以我们先来安装`axios`：
```javascript
npm install axios@0.18.0 --save
```

实际上在大型项目当中使用`Redux`应该使用`Redux`中的模块，为了展示模块的时候，实际上每个大页面组件都应该有自己的`store`，这些`store`就是整个`Redux`的`store`模块，我们应该将其合并：
```javascript
// store/index.js
import { createStore, applyMiddleware,combineReducers } from 'redux' // 引入合并工具
import thunk from 'redux-thunk'
import { reducer as homeReducer } from '../containers/Home/store/index.js' // 引入Home组件的reduer模块

// 组合各个组件中的reducer
const reducer = combineReducers({
	home: homeReducer
})

const getStore = ()=> {
	return createStore(reducer,applyMiddleware(thunk))
}

export default getStore
```

然后我们来看怎么在一个组件中创建模块`store`：
```javascript
// src/containers/Home/store/index.js
import reducer from './reducer'

export { reducer }
```
```javascript
// src/containers/Home/store/action.js
import axios from 'axios'
import {
	CHANGE_LIST
} from './constants'

const changeList = (list) => {
	return {
		type: CHANGE_LIST,
		list
	}
}

export const getHomeList = () => {
	return (dispatch)=> {
		axios.get('http://localhost:4000/newsList.json')
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
```javascript
// src/containers/Home/store/constants.js
export const CHANGE_LIST = 'HOME/CHANGE_LIST'
```
```javascript
// src/containers/Home/store/reducer.js
import {
	CHANGE_LIST
} from './constants'

const defaultState = {
	newsList: []
}

export default (state = defaultState,action) => {
	switch(action.type) {
		case CHANGE_LIST:
			const newState = {...state,newsList:action.list}
			return newState
		default:
			return state
	}
}
```
所以`Home`组件的`store`相关的四个文件内容如上所示，有了组件自己的`store`模块，我们在组件中也方便使用，实际上如果你看过之前的我写的[React+Redux入门详解](https://github.com/taopoppy/MyVuepress/tree/master/docs/react-ssr)，你就知道这几个文件是怎么意思了，其中`action.js`相当于`actionCreators`,`constants.js`相当于`actionTypes`

```javascript
// src/containers/Home/index.js
import React from 'react'
import Header from '../../components/Header'
import {  connect } from 'react-redux'
import { getHomeList } from './store/action' // 相当于actionCreators

class Home extends React.Component {
	componentDidMount() {
		this.props.getHomeList() // 发送异步请求，并保存到store
	}
	getHomeList() {
		const { list } = this.props
		return list.map(item => <div key={item.hash}>{item.title}</div>)
	}
	render() {
		return (
			<div>
				<Header />
				{
					this.getHomeList()
				}
				<button onClick={()=> {alert('click')}}>click</button>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	list: state.home.newsList,
})

const mapDispatchToProps = (dispath) => ({
	getHomeList() {
		dispath(getHomeList())
	}
})

export default connect(mapStateToProps,mapDispatchToProps)(Home)
```
虽然到这里好像没有问题，但是实际上有个很大的问题，<font color=#DD1144>我们异步代码请求实际上是在react的Home组件的生命周期componentDidMount当中写的，所以我们获取的数据依旧是客户端渲染出来的，服务端对于React组件的生命周期函数压根不渲染，所以我们实际要考虑在服务端获取数据</font>。

这个问题我们在下一节中详细解释。