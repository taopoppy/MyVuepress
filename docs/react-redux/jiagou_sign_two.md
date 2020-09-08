# Redux基本思想

## Redux概念

首先我们要彻底搞清楚一个问题，就是为什么要引入`Redux`?

<font color=#DD1144>因为前端应用的本质是数据驱动视图，随着项目越来越复杂，包含复杂的数据状态，包括`API`数据，本地数据，`UI`状态等等，我们不希望把这么多复杂的状态管理和`UI`组件的逻辑放在一起，所以我们需要将视图和状态管理解耦，防止状态管理失控</font>

<img :src="$withBase('/react_redux_sixiang_redux.png')" alt="流程图">

围绕上面的这幅图你就能清楚的明白: <font color=#1E90FF>Redux的核心是Store，其中包含了State，State会指导UI，或者说定义UI的显示，UI层可以随着用户的操作和网络请求去触发一个改变某个State的Action动作，这个动作会被Reducers识别和执行，然后结果会被Store收录并且修改自身Store当中的State，结果就是新的结果又会定义出新的UI，这就是Redux的数据流</font>

## Redux-State
我们这里说的`State`是`Redux`中的`State`，和`React`中的`state`有很多区别，`Redux`中的`State`有下面几个特点：
+ <font color=#1E90FF>集中管理，全局唯一</font>：而`React`每个组件都可以定义属于自己的`State`，属于分散管理。
+ <font color=#1E90FF>不可变性</font>：不能在原有的`State`对象上修改，而是要创建一个新的`State`进行修改
+ <font color=#1E90FF>定义原则和React State类似</font>

那么就前面我们书写的`Todo`的小项目怎么定义`Redux`的`State`呢？只需要一步：<font color=#9400D3>就是将React State从不同的组件拿出来统一放到一个地方管理即可</font>

也就是说之前在`AddTodo`组件中的`text`，以及`App`组件中的`todos`和`filter`直接拿到一起管理就成为了`Redux`中的`state`：
```javascript
// Redux中的State
{
	text: '',
	todos: [
		{
			id: 1,
			text: 'learn redux',
			compoleted: true
		}
	],
	filter: 'all'
}
```

## Redux-Action
<font color=#DD1144>Action是一个JSON对象，描述如何修改状态</font>，一个`Action`就描述了`Redux State`的一种修改方式，<font color=#1E90FF>Action这个JSON对象当中type属性是必须的，其他属性可以根据业务特性进行定义，其必须通过store.dispatch来进行发送</font>

虽然`Action`是一个`JSON`对象，但是通常我们不会自己手写定义，我们会通过`actionCreator`来返回一个特定结构的`Action`，那`actionCreator`是一类特殊函数的统称而已。

```javascript
// src/actions/index.js
import { ADD_TODO, TOGGLE_TODO, SET_FILTER, SET_TODO_TEXT } from './actionTypes'
let nextTodoId = 0

/**
 * 新增代办事项
 * @param {string} text 待办内容
 */
export const addTodo = (text) => {
	return { type: ADD_TODO, id: nextTodoId++, text }
}


/**
 * 更改某个id为id的待办事项状态
 * @param {int} id id值
 */
export const toggleTodo = (id) => {
	return { type: TOGGLE_TODO, id }
}


/**
 * 设置过滤状态
 * @param {string} filter 切换状态
 */
export const setFilter = (filter) => {
	return { type: SET_FILTER, filter }
}

/**
 * 设置新增待办事项的文本
 * @param {string} text 输入框中的内容
 */
export const setTodoText = text => {
	return { type: SET_TODO_TEXT, text }
}
```
```javascript
// src/actions/actionTyp.js
```


## Redux-Reducer
<font color=#1E90FF>Reducer说白了就是一个函数而已，它会根据Store传来的一个旧数据的副本和action，然后去根据action的type修改副本，将新的副本返回给Store，让他自己修改自己的State</font>

```javascript
// src/reducers/index.js
import { ADD_TODO, TOGGLE_TODO, SET_FILTER, SET_TODO_TEXT } from '../actions/actionTypes'

const initialState = { filter: "all", text: "", todos: []}

export default todoApp = (state = initialState, action) => {
	switch(action.type) {
		case ADD_TODO:
			return {
				...state,
				todos: [ ...state.todos, { id: action.id, text: action.text, completed: false } ]
			}
		case TOGGLE_TODO:
			return {
				...state,
				toods: state.todos.map(todo => {
					return todo.id === action.id ? {...todo, completed: !todo.completed } : todo
				})
			}
		case SET_FILTER:
			return { ...state, filter: action.filter }
		case SET_TODO_TEXT:
			return { ...state, text: action.text }
		default:
			return state
	}
}
```
虽然这样写没啥问题，但是呢，如果我们的`action`有很多，都要写在这里就不是一个好的选择，我们需要对当前的`Reducer`进行拆分。<font color=#DD1144>拆分Reducer的目的就是为了便于扩展和维护，合并的API是：<font color=#9400D3>combineReducers</font></font>

`Reducer`常见的拆分逻辑是根据`State`进行拆分，也就是每个`State`对应一个`Reducer`，该`Reducer`中的修改都只针对这一个`State`
```javascript
// src/reducers/todos.js
import { ADD_TODO,TOGGLE_TODO } from '../actions/actionTypes'

// 这里todos这个state的初始值应该是[]
const todos = (state = [], action) => {
	switch(action.type) {
		case ADD_TODO:
			return [...state,
				{
					id: action.id,
					text: action.text,
					completed: false
				}
			]
		case TOGGLE_TODO:
			return state.map(todo => {
				return todo.id === action.id ? {...todo, completed: !todo.completed } : todo
			})
		default:
			return state
	}
}

export default todos
```
```javascript
// src/reducers/filter.js
import { SET_FILTER } from '../actions/actionTypes'

// filter这个state的初始值是"all"
const filter = (state ="all", action) =>  {
	switch (action.type) {
		case SET_FILTER:
			return action.filter
		default:
			return state
	}
}
export default filter
```
```javascript
// src/reducer/text.js
import { SET_TODO_TEXT } from '../actions/actionTypes'

// text这个state的初始值是""
const text = (state = "", action) =>  {
	switch (action.type) {
		case SET_TODO_TEXT:
			return action.text
		default:
			return state
	}
}
export default text
```
```javascript
// src/reducers/index.js
import todos from './todos'
import filter from './filter'
import text from './text'
import { combineReducers } from 'redux'

export default combineReducers({
	todos,
	filter,
	text
})
```

## Redux-store
<img :src="$withBase('/react_redux_sixiang_store.png')" alt="store">

其实`store`的创建比较简单，我们在创建的时候验证一下:
```javascript
// src/store.js
import { createStore } from 'redux'
import rootReducer from './reducers/index'
import { addTodo, toggleTodo, setFilter, setTodoText} from './actions/index'
const store = createStore(rootReducer)

// 初始State
console.log(store.getState())

// 订阅state的变化
const unsubscribe = store.subscribe(() => {
	console.log(store.getState())
})

// 发生action
store.dispatch(addTodo('learn about redux'))
store.dispatch(toggleTodo(0))
store.dispatch(setFilter('active'))
store.dispatch(setTodoText('learn'))

// 取消订阅
unsubscribe()

export default store
```
```javascript
// src/index.js
import store from './store'
```
上面我们写的这些代码实际上单纯只是`redux`的代码，和`React`没有什么关系，<font color=#DD1144>我们之前说Redux和React分开能让项目的视图层和状态管理层解耦，这是没有错的，但是如果你看过我们之前的代码，你就会发现，视图层和状态管理层只是在逻辑上分开了，在代码层面还没有分开，因为一个组件内的React代码和Redux代码还在耦合，所以我们后面需要使用react-redux来在代码层面上将其分开</font>

<font color=#9400D3>所以React，Redux，React-Redux三者使用好了能在逻辑上和代码上让视图层和状态管理层彻底解耦</font>

## Redux-异步Action
异步`Action`的概念我们在之前也说了，但是我们这里来在之前的基础上拓展一下，看一下<font color=#1E90FF>怎么创建异步Action</font>和<font color=#1E90FF>拓展reducer</font>

### 1. 创建异步Action

```javascript
// src/action/index.js
import {
	FETTH_TODOS_REQUEST,
	FETTH_TODOS_SUCCESS,
	FETTH_TODOS_FAILURE
} from './actionTypes'

// 开始请求的action
const fetchTodosRequest = () => ({
	type: FETTH_TODOS_REQUEST
})
// 请求成功的action
const fetchTodosSuccess = (data) => ({
	type: FETTH_TODOS_SUCCESS,
	data
})
// 请求失败的action
const fetchTodosFailure = (error) => ({
	type: FETTH_TODOS_FAILURE,
	error
})

// 请求数据的异步Action
export const fetchTodos = () => {
	return (dispatch) => {
		dispatch(fetchTodosRequest()) // 请求开始
		return fetch("./mock/todos.json").then(
			response => {
				response.json().then(data => {
					dispatch(fetchTodosSuccess(data)) // 请求成功
				})
			},
			error => {
				dispatch(fetchTodosFailure(error)) // 请求失败
				console.log("An error occurred" + error)
			}
		)
	}
}

```
可以看到，我们请求的过程和请求成功和请求失败这三个过程都有对应的不同的`action`。

### 2. 拓展reducer

之前我们在`reducer/todos.js`当中默认的`todos`是个数组，但是如果数组中的数据是通过发送请求得来的，<font color=#1E90FF>我们想通过特定的数据结构来知道请求到底进行的如果</font>，现在我们修改一下结构，然后根据这个结构去修改：
```javascript
// src/reducers/todos.js
import { ADD_TODO,TOGGLE_TODO,FETTH_TODOS_FAILURE,FETTH_TODOS_SUCCESS,FETTH_TODOS_REQUEST } from '../actions/actionTypes'
// 数据结构
const initialState = {
	isFetching: false,
	error: null,
	data: []
}

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case FETTH_TODOS_REQUEST:
			return {
				...state,
				isFetching:true // isFetching为true可以知道当前正在请求中
			}
		case FETTH_TODOS_SUCCESS:
			return {
				...state,
				isFetching: false, // isFetching为false可以知道当前请求结束
				data: action.data  // data有数据表示现在请求成功
			}
		case FETTH_TODOS_FAILURE:
			return {
				...state,
				isFetching: false,// isFetching为false可以知道当前请求结束
				error: action.error, //error有数据表示请求失败，可以通过error值知道如何失败
			}
		default:
			return {
				...state,
				data: todos(state.data, action) // 我们将之前的todos这个reducer作为子reducer包含在内
			}
	}
}

const todos = (state = [], action) => {
	switch(action.type) {
		case ADD_TODO:
			return [...state,
				{
					id: action.id,
					text: action.text,
					completed: false
				}
			]
		case TOGGLE_TODO:
			return state.map(todo => {
				return todo.id === action.id ? {...todo, completed: !todo.completed } : todo
			})
		default:
			return state
	}
}

export default reducer
```
这样修改之后，我们在`TodoListContainer.js`当中就要修改一下代码，因为现在数据结构变化了，我们之前可以通过`state.todos`直接拿到数组，现在通过`state.todos`拿到的是个对象，我们还要进入这个对象拿到数组：
```javascript
// src/containers/TodoListContainer.js
const mapStateToProps = (state) => ({
	// todos: getVisibleTodos(state.todos, state.filter) // 修改前
	todos: getVisibleTodos(state.todos.data, state.filter) // 修改后
})
```

### 3. 集成redux-thunk
首先下载`redux-thunk`:
```javascript
npm install redux-thunk@2.3.0
```

接着我们集成到`redux`当中：
```javascript
// src/store.js
import { createStore, applyMiddleware } from 'redux' // 1. 引入applyMiddleware
import rootReducer from './reducers/index'
import thunkMiddleware from 'redux-thunk' // 2. 引入redux-thunk

const store = createStore(rootReducer,applyMiddleware(thunkMiddleware)) // 3. 作为中间件集成在redux当中

export default store
```

### 4. 使用异步Action
因为请求数据的代码我们已经从组件的`componentDidmount`当中抽离到异步`Action`当中，所以我们只需要将异步的`action`传入到组件当中即可：
```javascript
// src/containers/TodoListContainer.js
import { fetchTodos } from '../actions' // 1. 引入异步action

// TodoList组件中可以拿到this.props.fetchTodos
const mapDispatchProps = (dispatch) => ({
	fetchTodos: () => dispatch(fetchTodos()) // 2. 传入展示型组件当中
})
```
```javascript
// src/components/TodoList.js
class TodoList extends Component {
	componentDidMount(){
		this.props.fetchTodos() // 展示型组件当中使用容器性组件传来的action
	}
}
```

<font color=#9400D3>现在你可以清楚的看到我们使用react、redux、redux-thunk、react-redux这些东西清楚的搭建了一个TodoList的应用，redux在逻辑上解耦了视图层和状态层，react-redux也在代码层面解耦了视图层和状态层，redux-thunk抽离了组件中的数据请求，所有的东西都让react组件的代码更加简单和单纯</font>

## Redux调试工具
有两种方式来使用`Redux`的调试工具，两种方式的使用前提都是要在浏览器中安装`redux-devtools`扩展工具。

### 1. 浏览器插件
参考地址：[https://github.com/zalmoxisus/redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)

关于这种用法我们在之前就用过，可以参考之前的文档[redux-thunk的创建](www.taopoppy.cn/react-redux/react_redux_advanced_two.html#_1-redux-thunk的创建)


### 2. 项目依赖库
参考地址：[https://github.com/reduxjs/redux-devtools](https://github.com/reduxjs/redux-devtools)

这种我们在`nextjs`当中使用过：[redux-devtool](www.taopoppy.cn/react-ssr/ssr_combat_project_four.html#redux-devtool)