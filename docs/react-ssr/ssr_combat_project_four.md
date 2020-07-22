# 引入Redux

`Redux`是一个单项数据流的状态管理工具，在之前的基础原理部分我们已经详细的说明了`Redux`的使用，那么我们现在来重新复习一下，并且学习如何在`nextjs`当中去集成`redux`

## 创建一个store
首先，我们使用`Redux`就要先去安装它：
```javascript
yarn add redux@4.0.1
```
然后我们创建`store/store.js`
```javascript
// store/store.js
import { createStore } from 'redux' // 引入创建store的createStore方法

// 初始化默认的store的数据
const initialState = {
	count : 0
}

const ADD = 'ADD'
// 创建reducer
function reducer(state = initialState,action) {
	console.log(state,action)
	switch (action.type) {
		case ADD:
			return { count: state.count + 1} // 必须返回一个新的对象
		default:
			return state
	}
}

// 创建store
const store = createStore(reducer,initialState)

// 订阅store中数据的变化，执行回调
store.subscrube(()=> {
	console.log('changed',store.getState())
})

// store.getState()获取store当中的数据
console.log(store.getState()) // {count : 0}

// 派发一个action，reducer修改后返回给store新的数据
store.dispatch({ type: ADD })
console.log(store.getState()) // {count : 1}


export default store
```
最后我们在项目当中去引入即可
```javascript
// pages/index.js
import store from '../store/store.js'
```
注意，实际上`redux`并非必须要依赖`UI`框架的一个库，它是独立的，只不过我们在`react`当中去引入`store`的时候，启动项目后`reducer`会被执行一遍，所以我们上面的关于`redux`的简单测试都可以放在`store/store.js`文件中。

## redux中的reducer
按照之前说的，`reducer`应该是一个纯粹的方法，不应该有任何的副作用，在每次有数据更新都应该返回给`store`一个新的对象，关于`store`、`reducer`之间的关系，我们在`react`的基础知识讲解中已经详细的介绍了

<font color=#1E90FF>reducer可以进行模块拆分，然后通过combineReducers这个方法进行合并</font>

```javascript
// store/store.js
import { createStore,combineReducers } from 'redux'// 1. 引入combineReducers

// 2. counter模块
const initialState = {
	count : 0
}

const ADD = 'ADD'
function countReducer(state = initialState,action) {
	switch (action.type) {
		case ADD:
			return { count: state.count + 1}
		default:
			return state
	}
}

// 3. user模块
const userInitialState = {
	age :25,
	username: 'taopoppy'
}

const UPDATE_USERNAME = 'UPDATE_USERNAME'
function userReducer(state = userInitialState,action) {
	switch (action.type) {
		case UPDATE_USERNAME:
			return {
				...state,
				username: action.name
			}
		default:
			return state
	}
}

// 4. 合并不同模块的reducer
const allReducers = combineReducers({
	counter: countReducer,
	user: userReducer
})

// 5. 创建模块化的store
const store = createStore(allReducers,{
	counter: initialState,
	user:userInitialState
})


console.log(store.getState()) // { counter: { count: 0 },user: { age: 25, username: 'taopoppy' } }
store.dispatch({ type: ADD })
console.log(store.getState()) // { counter: { count: 1 },user: { age: 25, username: 'taopoppy' } }

console.log(store.getState()) // { counter: { count: 1 },user: { age: 25, username: 'taopoppy' } }
store.dispatch({ type:UPDATE_USERNAME,name:'wanglu' })
console.log(store.getState()) // { counter: { count: 1 }, user: { age: 25, username: 'wanglu' } }


export default store
```

## redux中的action
### 1. 同步的action
说起`action`，其本质就是一个对象，业界规范是在`action`对象当中需要有`type`属性和参数属性，`type`用来在`reducer`当中用来判断如何修改`store`中的数据的，修改数据的时候可能需要其他的数据作为计算依旧，这些其他的数据都可以作为参数属性放在`action`对象当中。

通常如果我们自己去书写`action`对象难免会有些麻烦和臃肿，我们希望通过`actionCreator`这种函数来帮我们创建`action`：
```javascript
// store/store.js
import { createStore,combineReducers } from 'redux'
const initialState = {
	count : 0
}

const ADD = 'ADD'

// 1. 创建一个名为add的actionCreator
function add(num) {
	return {
		type: ADD,
		num
	}
}

function countReducer(state = initialState,action) {
	switch (action.type) {
		case ADD:
			return { count: state.count + (action.num || 1) } // 2. 当action.type为ADD的时候count修改的数据依赖于action.num
		default:
			return state
	}
}


const allReducers = combineReducers({
	counter: countReducer,
})

const store = createStore(allReducers,{
	counter: initialState,
})

store.dispatch({ type: ADD })  // 3. 旧的写法也支持，每次count增加1
store.dispatch(add(4))         // 4. 新的写法也支持，每次count增的数取决于你给add的参数值

export default store
```

### 2. 异步的action
通过派发一个`action`，将`type`属性和参数属性传入去修改`store`中的数据是一般的`redux`的用法，但是在项目当中，我们通常修改`store`中的数据是需要通过请求API来获取数据的，也就是`action`当中的参数属性不是我们自己定义的，这就涉及到<font color=#9400D3>异步请求数据</font>和<font color=#9400D3>异步action的使用</font>

我们需要去安装`redux-thunk`来帮助我们通过中间件的形式去扩展`action`，
<font color=#DD1144>通过使用redux-thunk，我们就可以创建函数类型的action，在函数当中去执行异步请求逻辑，从而实现异步action的创建</font>

```javascript
yarn add redux-thunk@2.3.0
```
然后我们去使用:

```javascript
// store/store.js
import { createStore,combineReducers,applyMiddleware } from 'redux' // 1. 引入applyMiddleware
import ReduxThunk from 'redux-thunk' // 2. 引入ReduxThunk

const initialState = {
	count : 0
}

const ADD = 'ADD'

// 同步action（对象action）
function add(num) {
	return {
		type: ADD,
		num
	}
}

// 3. 异步action（函数action）
function addAsync(num) {
	return (dispatch) =>{
		setTimeout(() => {
			dispatch(add(num)) // 派发对象的action
		},500)
	}
}

function countReducer(state = initialState,action) {
	switch (action.type) {
		case ADD:
			return { count: state.count + (action.num || 1) }
		default:
			return state
	}
}

const allReducers = combineReducers({
	counter: countReducer,
})

const store = createStore(
	allReducers,
	{
		counter: initialState,
	},
	applyMiddleware(ReduxThunk) // 4. applyMiddleware(ReduxThunk)作为createStore的第三个参数传入
)

store.dispatch(add(4))
store.dispatch(addAsync(9))  // 5. 派发异步的action

export default store
```

## react-redux
`react`和`redux`是独立的两个框架，对于在`react`中集成`redux`是比较麻烦的，需要你在自己的组件当中去订阅`redux`，去分散的书写关于`redux`的代码，为了更好的同时使用`react`和`redux`，官方为我们推荐了<font color=#9400D3>react-redux</font>来作为桥梁帮助我们更直观，更清晰的使用两者，我们下面来使用，首先来安装：
```javascript
yarn add react-redux@6.0.1
```
然后我们需要使用`react-redux`当中提供的`Provider`来包裹我们的具体组件，让组件可以使用到我们`store`当中的内容：
```javascript
// pages/_app.js

import { Provider } from 'react-redux' // 1. 引入Provider
import store from '../store/store.js' // 2. 引入store

class MyApp extends App {
	render(){
		const { Component, pageProps } = this.props

		return (
			<Container>
				<Head>
					<title>Taopoppy</title>
				</Head>
				<Layout>
					<Provider store={store}> {/* 3. 使用Privider包裹组件，并且传入redux当中的store*/}
						<MyContext.Provider value="test context">
							<Component {...pageProps}/>
						</MyContext.Provider>
					</Provider>
				</Layout>
			</Container>
		)
	}
}

export default MyApp
```
这样之后，我们来看在具体的组件当中怎么使用：
```javascript
// pages/index.js
import Router from 'next/router'
import store from '../store/store.js'
import { connect } from 'react-redux';   // 1. 引入connect

const Index = ({counter,username,rename,addcount}) => {  // 5. 组件可以通过props拿到被挂载的东西
	return (
		<>
			<span>Index</span>
			<a>Class A</a>
			<p>Count: {counter}</p>
			<p>Username: {username}</p>
			<input value={username} onChange={(e) => rename(e.target.value)}/><br/>  {/* 6. 使用store中的数据和能修改store当中数据的方法*/}
			<button onClick={() => addcount(counter)}>add counter</button>
		</>
	)
}

// 4. mapStateToProps是把redux中的state(mapStateToProps函数参数)变成组件当中的props
const mapStateToProps = (state) => {
	return {
		counter: state.counter.count,  // 把store当中counter模块中的count数据传入到了Index组件中的props.counter中
		username: state.user.username  // 把store当中user模块中的username数据传入到了Index组件中的props.username中
	}
}

// 3. mapDispatchToProps是把store.dispatch方法挂载到组件的props上
const mapDispatchToProps  = (dispatch) => {
	return {
		addcount: (num)=> dispatch({type: 'ADD', num}),
		rename:(name) => dispatch({type: 'UPDATE_USERNAME',name})
	}
}


export default connect(mapStateToProps,mapDispatchToProps)(Index)  // 2. 传入mapStateToProps和mapDispatchToProps两个映射方法，和Index组件连接
```

## redux-devtool
首先在`chrome`当中去安装`Redux DevTools`，然后在项目当中安装`redux-devtools-extension`:
```javascript
yarn add redux-devtools-extension@2.13.8
```
然后集成到项目即可：
```javascript
// store/store.js
import { composeWithDevTools } from 'redux-devtools-extension' // 1. 引入composeWithDevTools

...

const store = createStore(
	...
	composeWithDevTools(applyMiddleware(ReduxThunk)) // 2. 包裹applyMiddleware(ReduxThunk)即可
)
```

## nextjs中的HOC
<font color=#DD1144>HOC是react社区长期积累的一种开发模式，即接收组件作为参数并返回新的组件</font>

我们在上述代码中使用的`react-redux`当中的`connect`函数就是一种`HOC`的开发模式，接收`mapStateToProps`和`mapDispatchToProps`之后依旧返回一个函数，函数接收`React`组件这个参数，返回一个新的组件，我们在`lib/test-hoc.js`当中先写一段简单的`demo`：
```javascript
// TestHocComp组件接收Comp这个组件，然后对某一些传入的属性，比如name做特殊的处理，其他属性原封不动的传入Comp
export default (Comp) => {
	return function TestHocComp({name, ...rest}) {
		const name = name  + '123'

		return <Comp {...rest} name={name}/>
	}
}
```
相同的道理，现在我们要去对`pages/_app.js`当中的`MyApp`组件使用`HOC`模式，我们就要先写一段针对`MyApp`组件进行`HOC`扩展的代码：
```javascript
// lib/test-hoc.js
export default (Comp) => {
	// Component, pageProps是原本MyApp中的prop属性
	function TestHocComp({Component, pageProps, ...rest}) {
		console.log(Component, pageProps)

		if (pageProps) {
			pageProps.test = '123' // 向MyApp当中的props上添加test属性
		}

		return <Comp Component={Component} pageProps={pageProps} {...rest}/>
	}

	TestHocComp.getInitialProps = Comp.getInitialProps
	return TestHocComp

}
```
然后我们就去`pages/_app.js`去对`MyApp`使用`HOC`:
```javascript
// pages/_app.js
...
import testHoc from '../lib/test-hoc.js' // 1. 引入testHoc

class MyApp extends App {
	...
	render(){
		const { Component, pageProps } = this.props

		return (
			<Container>
				<Head>
					<title>Taopoppy</title>
				</Head>
				<Layout>
					<Provider store={store}>
						<MyContext.Provider value="test context">
							<Component {...pageProps}/> {/* 3. text属性随着pagesProps.text进入了要显示的组件中*/}
						</MyContext.Provider>
					</Provider>
				</Layout>
			</Container>
		)
	}
}

export default testHoc(MyApp) // 2. 对MyApp使用HOC模式
```
通过这种方式，我们就将`test`属性添加到了要显示的组件上面，比如我们访问`a`页面，在`a`页面就能拿到`test`的值，<font color=#DD1144>这种就是一种很高妙的封装模式，比如我们在使用react-redux当中使用的connect就将store当中的数据和dispatch方法以props的方式传入了组件，如果没有HOC模式，组件当中和redux相关的代码全部要写在组件的内部，这就让组件无论是看上去还是读起来都非常复杂，在多种框架集成的时候，代码就非常难以维护</font>

<font color=#1E90FF>所以我们会使用HOC模式来在next当中去集成redux，这样react的代码和redux的代码就不会混杂写在一起，也十分利于其他功能集成在项目当中，将不同的功能拆分到不同的HOC当中，一层层去包含App组件，以这种方式扩展整个app的功能</font>

## next集成redux