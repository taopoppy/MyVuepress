# Redux的中间器件

## 什么是中间件
中间件，顾名思义是在某两者中间，那我们来看看下面这个图好好分析一下<font color=#DD1144>什么是redux的中间件</font>

<img :src="$withBase('/react_redux_zhongjianjian.png')" alt="redux中间件">

<font color=#9400D3>从上图可以看出，中间件处于action和store之间，而且一开始action只能是一个对象，在有了中间件之后，action就可以成为一个函数了</font>

<font color=#9400D3>因为redux的中间件就是对dispatch方法的一个升级，之前dispatch方法接收到action这个对象，就会直接把action对象给store，现在使用redux中间件对dispatch方法升级，dispatch方法还可以接收一个函数，所以action现在可以写成一个函数，dispatch接收到action如果是一个函数的话，就会在此处执行action这个函数，所以我们可以在action函数中去写一个写异步请求的方法，从而实现把组件中componentDidMount中的异步请求操作的抽离</font>

<img :src="$withBase('/react_redux_thunk.png')" alt="redux_thunk的本质">

## redux-thunk
### 1. redux-thunk的创建
知道了中间件的原理之后，我们下面就使用`redux-thunk`这个中间件来在`action`当中实现异步请求，首先我们要安装`redux-thunk`:
```javascript
npm install redux-thunk --save
```
然后，<font color=#1E90FF>我们需要在创建store的时候去添加我们的中间件，由于我们之前使用了window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__，实际它也是个中间件，当和redux-thunk同时使用的时候，我们可以这样书写</font>：
```javascript
// store/index.js
import { createStore,applyMiddleware,compose } from 'redux'
import reducer from './reducer'
import thunk from 'redux-thunk';

const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(thunk),
);

const store = createStore(
	reducer,
	enhancer
)

export default store
```
上面这种写法来自于[redux-devtools的github](https://github.com/zalmoxisus/redux-devtools-extension#12-advanced-store-setup)

### 2. redux-thunk的使用
创建好了中间件后，我们就可以将在组件`TodoList.js`当中的`ComponentDidMount`中的异步请求数据的代码移动到`action`当中去了。

对比上一节的`redux`中的异步请求，现在我们修改`TodoList.js`和`actionCreators.js`文件如下：
```javascript
//  TodoList.js
import {
	getTodoList
} from './store/actionCreators' // 1. 引入action函数

class TodoList extends Component {
	componentDidMount() {
		const action = getTodoList() // 2. 此时是action函数
		store.dispatch(action) // 3. 在redux-thunk中执行action方法
	}
}

export default TodoList;
```
```javascript
// actionCreators.js
import axios from 'axios'

export const initListAction = (data) => ({
	type: INIT_LIST_ACTION,
	data
})

export const getTodoList = () => {
	// 返回的action是个函数
	return (dispatch)=>{
		axios.get('http://localhost:4000/list?media=blog&media=wechat&media=taopoppy').then((res)=>{
			const data = res.data
			// 异步请求完毕后再次dispatch一个action对象
			const action = initListAction(data)
			dispatch(action)
		})
	}
}
```
实际上虽然过程好像更复杂了，走了两边`action`,第一遍是函数`action`，在函数`action`执行的时候又走了第二遍对象`action`，这样做的好处是：
+ <font color=#1E90FF>抽离了组件中异步请求的代码</font>
+ <font color=#1E90FF>方面自动化测试，因为测试一个普通的函数比测试一个生命周期函数要简单的多</font>

## redux-saga
### 1. redux-saga的安装使用
首先我们要去下载`redux-saga`:
```javascript
npm install --save redux-saga
```
然后我们创建`store/sagas.js`，然后修改它和`store/index.js`文件：
```javascript
// store/sagas.js
function* mySaga() {

}

export default mySaga;
```
```javascript
// store/index.js
import { createStore,compose, applyMiddleware } from 'redux'
import reducer from './reducer'
import createSagaMiddleware from 'redux-saga' // 引入saga
import sagas from './sagas' // 引入sagas的配置文件

const sagaMiddleware = createSagaMiddleware() // 创建中间件

const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

const enhancer = composeEnhancers(
	applyMiddleware(sagaMiddleware) // 使用中间件
);


const store = createStore(
	reducer,
	enhancer
)

sagaMiddleware.run(sagas) // sagas的配置文件生效

export default store
```

### 2. redux-saga的异步请求
`redux-saga`的使用实际上远比`redux-thunk`复杂，里面包含了很多`api`，而是它的原理是一种捕获,我们就现在来一步步看看怎么使用的：
```javascript
// TodoList.js
import {
	getInitList // 调用actionCreators.js
} from './store/actionCreators'

class TodoList extends Component {
	componentDidMount() {
		const action = getInitList() // 生成action
		store.dispatch(action) // 派发action
	}
}

export default TodoList;
```
```javascript
// store/actionCreators.js
import {
	INIT_LIST_ACTION,
	GET_INIT_LIST
} from './actionTypes'

export const initListAction = (data) => ({
	type: INIT_LIST_ACTION,
	data
})

export const getInitList = () => ({
	type: GET_INIT_LIST
})
```
```javascript
// actionTypes.js
export const INIT_LIST_ACTION = 'init_list_action'
export const GET_INIT_LIST = 'get_init_list'
```
```javascript
// store.jsimport { takeEvery,put } from 'redux-saga/effects'
import {
	GET_INIT_LIST
} from './actionTypes'
import axios from 'axios'
import { initListAction } from './actionCreators'

function* getInitList() {
	try {
		const res = yield axios.get('http://localhost:4000/list?media=blog&media=wechat&media=taopoppy')
		const action = initListAction(res.data)
		yield put(action) // put方法代替了store.dispatch
	} catch (error) {
		console.log('api request is wrong')
	}
}

function* mySaga() {
	// takeEvery捕获到GET_INIT_LIST这个action，执行getInitList方法
	yield takeEvery(GET_INIT_LIST ,getInitList)
}

export default mySaga;
```
其实这个流程的主要思想是这样：<font color=#1E90FF>在组件当中派发了GET_INIT_LIST这个action,而使用了redux-saga这个中间件之后，不仅仅reducer能接收到action，在中间件当中redux-saga当中也能接收到action，所以你会看到在sagas.js文件中，捕获到GET_INIT_LIST这个action，在对应的getInitList方法中做了异步请求，然后重新派发了一个INIT_LIST_ACTION这样的action，这个action才是会派发到reducer中去修改数据的action</font>

<img :src="$withBase('/react_redux_saga.png')" alt="redux-saga中间件">