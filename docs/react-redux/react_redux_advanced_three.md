# Redux的扩展模块

## React-Redux
### 1. React-Redux的安装使用
<font color=#1E90FF>React-Redux是一个第三方模块，它是帮助我们更好的在react中去使用redux的第三方模块</font>，首先我们安装`React-Redux`:
```javascript
npm install --save react-redux@5.0.7
```

下载好之后我们要开始使用了，我们从头来使用`react-redux`来写一遍`Todolist`，首先我们要`index.js`当中去嵌入`react-redux`:
```javascript
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import TodoList from './TodoList';
import { Provider } from 'react-redux'  // 引入react-redux
import store from './store/index.js'    // 引入redux中的store

const App = (
  <Provider store={store}> {/*包装器Provider*/}
    <TodoList />
  </Provider>
)

ReactDOM.render(
  App,
  document.getElementById('root')
);
```
与之前不同的就是我们使用了`Provider`包装器来包装组件，并且给包装器假如`store`属性，这样写的意思就是：<font color=#DD1144>在包装器当中的子组件都能够直接使用到store当中的数据</font>

当然我们还是要创建一个最简单的`store/index.js`和`store/reducer.js`：
```javascript
// store/index.js
import { createStore } from 'redux'
import reducer from './reducer'
const store = createStore(reducer);

export default store
```
```javascript
// store/reducer.js
const defaultState = {
	inputValue: '',
	list: []
}

export default (state=defaultState,action) => {
	if(action.type === 'change_input_value') {
		const newState = JSON.parse(JSON.stringify(state))
		newState.inputValue = action.value
		return newState
	}
	return state
}
```


### 2. React-Redux的输入功能
我们现在使用`React-Redux`来完成一个输入框输入的功能：
```javascript
// Todolist.js
import React from 'react'
import { connect } from 'react-redux'

const TodoList = (props) => {
		const { inputValue, changeInputValue, handleClick, list} = props
		return(
			<div>
				<div>
					<input
						value={inputValue}
						onChange={changeInputValue}
					/>
					<button
						onClick={handleClick}
					>commit</button>
				</div>
				<ul>
					{
						list.map((item,index) => {
							return <li key={index}>{item}</li>
						})
					}
				</ul>
			</div>
		)
}

// mapStateToProps是把redux中的state(mapStateToProps函数参数)变成组件当中的props
const mapStateToProps = (state) => {
	return {
		inputValue:state.inputValue,// 把redux中的state.inputValue变成组件中的this.props.inputValue
		list:state.list // 把redux中的state.list变成组件中的this.props.list
	}
}

// mapDispatchToProps是把store.dispatch方法挂载到组件的props上
const mapDispatchToProps = (dispatch) => {
	return {
		changeInputValue(e) {
			const action = {
				type: 'change_input_value',
				value: e.target.value
			}
			dispatch(action)
		},

		handleClick() {
			const action = {
				type: 'add_item'
			}
			dispatch(action)
		}
	}
}

// 通过connect方法连接TodoList和redux，连接的规则在mapStateToProps当中
// TodoList是UI组件，通过connect方法执行后成为了容器组件
// 所以导出的结果就是一个容器组件
export default connect(mapStateToProps,mapDispatchToProps)(TodoList)
```

## React-Redux完成TodoList
现在我们就来使用`React-Redux`结合`React-thunk`来实现一个完整的`TodoList`,基本上重要的代码我们就在之前讲过，如有不懂的地方可以回头温习一下：
```javascript
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import TodoList from './TodoList';
import { Provider } from 'react-redux'
import store from './store/index.js'

const App = (
  <Provider store={store}>
    <TodoList />
  </Provider>
)

ReactDOM.render(
  App,
  document.getElementById('root')
);
```
```javascript
// TodoList.js
import React from 'react'
import { connect } from 'react-redux'
import {
	getInputChangeAction,
	getAddItemAction,
	getDeleteItemAction,
	getInitList
} from './store/actionCreators'
import store from './store/index.js'

// 这里的getInitList之前放在组件的ComponentDidMount中
// 因为只执行一次，所以不能放在UI组件中，否则会死循环
const action = getInitList()
store.dispatch(action)

const TodoList = (props) => {
		const { inputValue, changeInputValue, handleClick, list,handleDeleteItem} = props
		return(
			<div>
				<div>
					<input
						value={inputValue}
						onChange={changeInputValue}
					/>
					<button
						onClick={handleClick}
					>commit</button>
				</div>
				<ul>
					{
						list.map((item,index) => {
							return <li key={index} onClick={()=>{ handleDeleteItem(index) }} >{item}</li>
						})
					}
				</ul>
			</div>
		)
}

// 函数参数为redux中的state，映射成为组件的props
const mapStateToProps = (state) => {
	return {
		inputValue:state.inputValue,
		list:state.list
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		// 输入框输入处理
		changeInputValue(e) {
			const action = getInputChangeAction(e.target.value)
			dispatch(action)
		},
		// 提交按钮点击处理
		handleClick() {
			const action = getAddItemAction()
			dispatch(action)
		},
		// 点击item删除
		handleDeleteItem(index) {
			const action = getDeleteItemAction(index)
			dispatch(action)
		}
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(TodoList)
```
```javascript
// store/actionCreators.js
import {
	CHANGE_INPUT_VALUE,
	ADD_TODO_ITEM,
	DELETE_TODO_ITEM,
	INIT_LIST_ACTION,
} from './actionTypes'
import axios from 'axios'

export const getInputChangeAction = (value) => ({
	type: CHANGE_INPUT_VALUE,
	value
})

export const getAddItemAction = () => ({
	type: ADD_TODO_ITEM,
})

export const getDeleteItemAction= (index) => ({
	type: DELETE_TODO_ITEM,
	index
})

export const initListAction = (data) => ({
	type: INIT_LIST_ACTION,
	data
})

export const getInitList = () => {
	// 返回的action是个函数
	return async (dispatch)=>{
		const res = await axios.get('http://localhost:4000/list?media=blog&media=wechat&media=taopoppy')
		const data = res.data
		// 异步请求完毕后再次dispatch一个action对象
		const action = initListAction(data)
		dispatch(action)
	}
}
```
```javascript
// store/actionTypes.js
export const CHANGE_INPUT_VALUE = 'change_input_value'
export const ADD_TODO_ITEM = 'add_todo_item'
export const DELETE_TODO_ITEM = 'delete_todo_item'
export const INIT_LIST_ACTION = 'init_list_action'
export const GET_INIT_LIST = 'get_init_list'
```
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
```javascript
//store/reducer.js
import {
	CHANGE_INPUT_VALUE,
	ADD_TODO_ITEM,
	DELETE_TODO_ITEM,
	INIT_LIST_ACTION
} from './actionTypes'

const defaultState = {
	inputValue: '',
	list: []
}

export default (state=defaultState,action) => {
	if(action.type === CHANGE_INPUT_VALUE) {
		const newState = JSON.parse(JSON.stringify(state))
		newState.inputValue = action.value
		return newState
	}
	if(action.type === ADD_TODO_ITEM ) {
		const newState = JSON.parse(JSON.stringify(state))
		newState.list.push(newState.inputValue)
		newState.inputValue = ''
		return newState
	}
	if(action.type === DELETE_TODO_ITEM){
		const newState = JSON.parse(JSON.stringify(state))
		newState.list.splice(action.index,1)
		return newState
	}
	if (action.type === INIT_LIST_ACTION) {
		const newState = JSON.parse(JSON.stringify(state))
		newState.list = action.data
		return newState
	}
	return state
}
```
