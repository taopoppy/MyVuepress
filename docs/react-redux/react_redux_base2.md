# Redux的使用重构

## 1. ActionType的拆分
之前我们的创建的`action`是长这个样子的：
```javascript
const action = {
	type: 'change_input_value',
	value: e.target.value
}
```
实际上无论是这里的`type`直接写成字符串的类型，还是别的地方，我们都要特别注意一点：<font color=#DD1144>尽量不要在代码中直接使用常量，尽量用变量代替常量</font>

<font color=#1E90FF>原因也非常简单，如果这里的常量，我们书写错误一个字母，代码不会报错，但是程序运行不了，而且在网页上也没有错误显示，这不利于我们寻找bug。但是使用变量来代替，变量的名称写错，编译器就找不到变量的定义位置，自动就会报错提示</font>

所以我们创建`store/actionTypes.js`：
```javascript
// store/actionTypes.js
export const CHANGE_INPUT_VALUE = 'change_input_value'
export const ADD_TODO_ITEM = 'add_todo_item'
export const DELETE_TODO_ITEM = 'delete_todo_item'
```
然后我们把`TodoList.js`和`reducer.js`中的所有常量换成变量，避免单词出错的问题：
```javascript
// import {
	CHANGE_INPUT_VALUE,
	ADD_TODO_ITEM,
	DELETE_TODO_ITEM
} from './actionTypes' // 引入变量

const defaultState = {
	inputValue: 'start input',
	list: []
}

export default (state = defaultState,action)=> {
	if (action.type === CHANGE_INPUT_VALUE) { // 使用变量
		const newState = JSON.parse(JSON.stringify(state))
		newState.inputValue = action.value
		return newState
	}
	if (action.type === ADD_TODO_ITEM) { // 使用变量
		const newState = JSON.parse(JSON.stringify(state))
		newState.list.push(newState.inputValue)
		newState.inputValue = ''
		return newState
	}
	if (action.type === DELETE_TODO_ITEM) { // 使用变量
		const newState = JSON.parse(JSON.stringify(state))
		newState.list.splice(action.index,1)
		return newState
	}
	return state
}
```
`TodoList.js`也是如此，这里我们就不展示代码了，`TodoList.js`代码比较多。

## 2. 使用actionCreator
在简单的项目当中，我们在需要的时候手动去创建一个`action`是没有问题的，但是在大型项目当中，为了提高可维护性，我们需要将创建`action`的工作放在同一个地方，所以我们创建`store/actionCreators.js`:
```javascript
// store/actionCreators.js
import {
	CHANGE_INPUT_VALUE,
	ADD_TODO_ITEM,
	DELETE_TODO_ITEM
} from './actionTypes'

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
```
然后我们在`TodoList.js`当中去直接使用这些函数创建`action`即可：
```javascript
// TodoList.js
import React, { Component } from 'react'
import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';
import store from './store/index.js'
import {
	getInputChangeAction,
	getAddItemAction,
	getDeleteItemAction
} from './store/actionCreators' // 使用actionCreator.js


class TodoList extends Component {
	constructor(props) {
		super(props)
		this.state = store.getState()
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleStoreChange = this.handleStoreChange.bind(this)
		this.handleBtnClick = this.handleBtnClick.bind(this)
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
					renderItem={(item,index) => (<List.Item onClick={this.hanleItemDelete.bind(this,index)}>{item}</List.Item>)}
				/>
			</div>
		)
	}
  handleStoreChange() {
		this.setState(store.getState())
	}

	handleInputChange(e) {
		const action = getInputChangeAction(e.target.value) // 创建action
		store.dispatch(action) // 派发action
	}

	handleBtnClick() {
		const action = getAddItemAction() // 创建action
		store.dispatch(action) // 派发action
	}

	hanleItemDelete(index){
		const action = getDeleteItemAction(index) // 创建action
		store.dispatch(action) // 派发action
	}
}

export default TodoList;
```
这种写法会让你对`redux`整个工作流程更加清晰，也方便后续的自动化测试。



## 3. 其他补充
学习的`redux`的使用之后，我们来看看`redux`的一些设计原则：

<font color=#9400D3>**① Store是唯一的**</font>

这一点比较好理解，相对于`vue`当中的`store`模块化，`react`当中的`store`显的更单一，更简单。

<font color=#9400D3>**② 只有Store能改变自己的内容**</font>

这一点比较好理解，很多人会认为是`reducer`去改变了`store`的内容，但是实际上，`reducer`并没有直接改变`store`，只是根据`store`中的数据生成了一个副本，把这个副本发给`store`，`store`自己用副本`newState`替换了自己的旧数据`previousState`,所以还是`store`自己改变了自己。

<font color=#9400D3>**③ Reducer必须是纯函数**</font>

<font color=#1E90FF>纯函数指的是给定固定的输入，就一定会有固定的输出，而且不会有任何副作用</font>，所以如果函数当中包含了和异步或者时间相关的返回值，都不是纯函数，因为异步和时间都可能是变化的，和输入可能并不是一一对应。

什么是副作用呢，比如参数是一个引用类型的对象，你修改了这个对象中的属性值，这就是副作用，<font color=#1E90FF>纯函数是只能利用参数，不能修改参数</font>

到目前为止，我们再回顾一下几个比较重要的`redux`的API:
+ <font color=#DD1144>createStore</font>：创建一个`store`
+ <font color=#DD1144>store.dispatch</font>：派发一个`action`
+ <font color=#DD1144>store.getState</font>：从`store`中获取数据
+ <font color=#DD1144>store.subscribe</font>：订阅`store`的数据变化