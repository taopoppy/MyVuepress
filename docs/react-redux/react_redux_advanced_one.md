# Redux的组件请求

## 组件分类
### 1. UI和容器
在`react`中，组件可以分为<font color=#9400D3>UI组件</font>和<font color=#9400D3>容器组件</font>，前者也叫作傻瓜组件，后者也叫作聪明组件,当在大型项目当中一个组件复杂的时候，我们需要将它的UI和逻辑进行拆分，拆分成为UI组件和容器组件，前者负责页面的渲染，后者只负责组件的逻辑处理。现在我们以`TodoList.js`为例子，我们先看一下之前的`TodoList.js`是什么样子的：
```javascript
// TodoList.js
import React, { Component } from 'react'
import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';
import store from './store/index.js'
import { getInputChangeAction,getAddItemAction,getDeleteItemAction } from './store/actionCreators'

class TodoList extends Component {
	constructor(props) {
		super(props)
		this.state = store.getState()
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleStoreChange = this.handleStoreChange.bind(this)
		this.handleBtnClick = this.handleBtnClick.bind(this)
		this.hanleItemDelete = this.hanleItemDelete.bind(this)
		store.subscribe(this.handleStoreChange)
	}

	render(){
		return (
			<div style={{marginTop:'10px',marginLeft:'10px'}}>
				<div>
					<Input
						value={this.state.inputValue}
						placeholder="todo info"
						style={{width: '300px',marginRight:'10px'}}
						onChange={this.handleInputChange}
					/>
					<Button
						type="primary"
						onClick={this.handleBtnClick}
					>Commit</Button>
				</div>
				<List
					style={{marginTop:'10px',width: '300px'}}
					bordered
					dataSource={this.state.list}
					renderItem={(item,index) => (
						<List.Item
							onClick={()=> {this.hanleItemDelete(index)}}
						>{item}</List.Item>
					)}
				/>
			</div>
		)
	}

	handleInputChange(e) {
		const action = getInputChangeAction(e.target.value)
		store.dispatch(action)
	}

	handleStoreChange() {
		this.setState(store.getState())
	}

	handleBtnClick() {
		const action = getAddItemAction()
		store.dispatch(action)
	}

	hanleItemDelete(index){
		const action = getDeleteItemAction(index)
		store.dispatch(action)
	}
}

export default TodoList;
```
现在我们将这个文件拆分成为UI组件(`TodoListUI.JS`)和容器组件(`TodoList.js`):
```javascript
// TodoListUI.jsimport React, {Component} from 'react'
import { Input, Button, List } from 'antd';

class TodoListUI extends Component {
	render(){
		return (
			<div style={{marginTop:'10px',marginLeft:'10px'}}>
				<div>
					<Input
						value={this.props.inputValue}
						placeholder="todo info"
						style={{width: '300px',marginRight:'10px'}}
						onChange={this.props.handleInputChange}
					/>
					<Button
						type="primary"
						onClick={this.props.handleBtnClick}
					>Commit</Button>
				</div>
				<List
					style={{marginTop:'10px',width: '300px'}}
					bordered
					dataSource={this.props.list}
					renderItem={(item,index) => (
						<List.Item
							// 调用有传递参数的函数，外层包裹一层箭头函数
							onClick={()=> {this.props.hanleItemDelete(index)}}
						>{item}</List.Item>
					)}
				/>
			</div>
		)
	}
}
export default TodoListUI
```
UI组件中的没有任何逻辑，只有页面渲染的部分，其中所有的数据和调用的函数都在`props`上面，特别注意调用有参数的函数的写法，我们在上面代码中已经标识出来
```javascript
// TodoList.js
import React, { Component } from 'react'
import 'antd/dist/antd.css';
import store from './store/index.js'
import { getInputChangeAction,getAddItemAction,getDeleteItemAction } from './store/actionCreators'
import TodoListUI from './TodoListUI'

class TodoList extends Component {
	constructor(props) {
		super(props)
		this.state = store.getState()
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleStoreChange = this.handleStoreChange.bind(this)
		this.handleBtnClick = this.handleBtnClick.bind(this)
		this.hanleItemDelete = this.hanleItemDelete.bind(this)
		store.subscribe(this.handleStoreChange)
	}

	render(){
		return (
			// 调用UI组件
			<TodoListUI
				inputValue={this.state.inputValue}
				list={this.state.list}
				handleInputChange={this.handleInputChange}
				handleBtnClick={this.handleBtnClick}
				hanleItemDelete={this.hanleItemDelete}
			/>
		)
	}

	handleInputChange(e) {
		const action = getInputChangeAction(e.target.value)
		store.dispatch(action)
	}

	handleStoreChange() {
		this.setState(store.getState())
	}

	handleBtnClick() {
		const action = getAddItemAction()
		store.dispatch(action)
	}

	hanleItemDelete(index){
		const action = getDeleteItemAction(index)
		store.dispatch(action)
	}
}

export default TodoList;
```
容器组件只负责组件中的逻辑部分，使用到的数据和函数都以`props`的方式传递给UI组件。

### 2. 无状态组件
我们之前的`UI`组件十分特殊，里面只有页面渲染的部分，只有`render`函数，所以<font color=#DD1144>UI组件是一种class组件的写法，当我们用function的方式去写组件的时候，UI组件就变成了一个无状态组件</font>

因为也很好理解，我们很早之前就说过，<font color=#1E90FF>react组件的本质就是一个函数，接收props参数，返回JSX对象</font>，所以我们前面在`TodoListUI.js`当中的代码改写成下面这种就实现了UI组件到无状态组件的转换，本质就是`class`组件写法换成`function`组件的写法：
```javascript
// TodoListUI.js
import React from 'react'
import { Input, Button, List } from 'antd';

// 无状态组件（fuction组件写法）
const TodoListUI = (props) => {
	return (
		<div style={{marginTop:'10px',marginLeft:'10px'}}>
			<div>
				<Input
					value={props.inputValue}
					placeholder="todo info"
					style={{width: '300px',marginRight:'10px'}}
					onChange={props.handleInputChange}
				/>
				<Button
					type="primary"
					onClick={props.handleBtnClick}
				>Commit</Button>
			</div>
			<List
				style={{marginTop:'10px',width: '300px'}}
				bordered
				dataSource={props.list}
				renderItem={(item,index) => (
					<List.Item
						onClick={()=> {props.hanleItemDelete(index)}}
					>{item}</List.Item>
				)}
			/>
		</div>
	)
}
export default TodoListUI
```
无状态组件的和UI组件比较起来，优势到底在哪里？<font color=#9400D3>无状态组件就是一个函数，执行起来并不包含react中的生命周期函数等之类的东西</font>，所以如果一个组件当中只有`render`函数的时候，我们完全可以改造成为无状态组件，提高性能。

## 异步请求
在`redux`中的异步请求比较简单，我们直接上代码：
```javascript
// TodoList.js
class TodoList extends Component {
	componentDidMount() {
		axios.get('http://localhost:4000/list?media=blog&media=wechat&media=taopoppy').then((res)=>{
			const data = res.data
			const action = initListAction(data)
			store.dispatch(action)
		})
	}
}

export default TodoList;
```
```javascript
// store/actionTypes.js
export const INIT_LIST_ACTION = 'init_list_action'
```
```javascript
// store/actionCreators.js
import { INIT_LIST_ACTION } from './actionTypes'

export const initListAction = (data) => ({
	type: INIT_LIST_ACTION,
	data
})
```
```javascript
// store/reducer.js
import { INIT_LIST_ACTION } from './actionTypes'

export default (state = defaultState,action)=> {
	if (action.type === INIT_LIST_ACTION) {
		const newState = JSON.parse(JSON.stringify(state))
		newState.list = action.data
		return newState
	}
	return state
}
```
上面就是一个最基本的在组件当中获取数据，然后保存在`redux`中的基础写法。