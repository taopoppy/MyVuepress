# Redux的使用初探

## Redux是什么
`React`只是一个视图层的轻量级的框架，当我们项目变的的越来越复杂，组件之间的通信也越来越难以维护，<font color=#DD1144>我们需要在视图层的React框架上去配套一个数据层的Redux框架，才能hold住大型项目</font>

首先来说一下什么是`Redux`，来看下面这个图：

<img :src="$withBase('/react_redux_whatredux.png')" alt="什么是redux">

<font color=#1E90FF>引入了Redux，所有组件中的数据都放在Redux中的Store中，这里是一个公用的存储空间</font>，假如蓝色的组件要给很多灰色的组件传值，只需要在`Store`当中去修改对应的数据，灰色的所有组件会自动感应到`Store`中数据的变化，就会去`Store`当中重新取值，这个就间接实现了蓝色组件中的数据轻松传递给多个灰色组件。


## Redux的工作流程
<img :src="$withBase('/react_redux_flow.png')" alt="Redux Flow">

这个图我们分成两个部分来理解，首先我们按照一个图书馆借书的流程来理解：
+ <font color=#1E90FF>React Components(学生)</font>
+ <font color=#1E90FF>Action Creators(要借的书)</font>
+ <font color=#1E90FF>Store(图书馆管理人员)</font>
+ <font color=#1E90FF>Reducers(记录册)</font>

一个学生(`React Components`)来借书，把要借的书(`Action Creators`)给图书馆管理人员(`Store`)说了一下，图书馆管理人员从记录册(`Reducers`)中找到书的位置，然后拿到手给了学生。

<font color=#9400D3>同样的道理，在代码当中组件要去修改或者获取数据都要走这样的一个流程，Components要修改和要获取的数据都是一种行为，这种都是通过Action Creators创建出来的一种Action行为，Store只是中间商，拿到Action要告诉Reducers具体去实现，Reducers实现完毕回复给Store，Store再把结果告诉Component</font>

## Redux改造TodoList
### 1. Antd实现布局
下载`antd`这个UI库：
```javascript
npm install antd@3.26.16 --save
```
然后重写`TodoList.js`：
```javascript
// TodoList.js
import React, { Component } from 'react'
import 'antd/dist/antd.css'; // 引入样式文件
import { Input, Button, List } from 'antd'; // 引入需要的组件

const data = [
	'1','2','3'
]

class TodoList extends Component {
	render(){
		return (
			<div style={{marginTop:'10px',marginLeft:'10px'}}>
				<div>
					<Input placeholder="todo info" style={{width: '300px',marginRight:'10px'}}/>
					<Button type="primary">Commit</Button>
				</div>
				<List
					style={{marginTop:'10px',width: '300px'}}
					bordered
					dataSource={data}
					renderItem={item=> (<List.Item>{item}</List.Item>)}
				/>
			</div>
		)
	}
}

export default TodoList;
```
### 2. Store的创建（获取数据）
安装`Redux`:
```javascript
npm install redux@4.0.0 --save 
```
然后创建`store/index.js`和`store/reducer.js`
```javascript
// store/index.js
import { createStore } from 'redux'
import reducer from './reducer'

// 创建一个公共管理仓库store，参数为reducer
const store = createStore(reducer) 

export default store
```
```javascript
// store/reducer.js
const defaultState = {
	inputValue: 'start input',
	list: ['1','2','3']
}

export default (state = defaultState,action)=> {
	return state
}
```
然后我们可以在组件当中直接使用`store`中的数据：
```javascript
// src/TodoList.js
import React, { Component } from 'react'
import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';
import store from './store/index.js'

class TodoList extends Component {
	constructor(props) {
		super(props)
		this.state = store.getState() // 从store中获取了数据
	}

	render(){
		return (
			<div style={{marginTop:'10px',marginLeft:'10px'}}>
				<div>
					{/**使用 this.state.inputValue */}
					<Input value={this.state.inputValue} placeholder="todo info" style={{width: '300px',marginRight:'10px'}}/>
					<Button type="primary">Commit</Button>
				</div>
				<List
					style={{marginTop:'10px',width: '300px'}}
					bordered
					dataSource={this.state.list} // 使用this.state.list
					renderItem={item=> (<List.Item>{item}</List.Item>)}
				/>
			</div>
		)
	}
}

export default TodoList;
```

### 3. Reducer的编写（修改数据）
安装`redux devtools`的`chrome`的插件，安装完成之后，根据[官网](https://github.com/zalmoxisus/redux-devtools-extension#usage)说明，需要在项目当中使用`createStore`去创建`store`的时候，在第二个参数添加这样一个函数：
```javascript
 const store = createStore(
   reducer,
+  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
 );
```
然后我们打开浏览器的调试工具后，就能看到这样的图像：
<img :src="$withBase('/react_redux_devtools.png')" alt="redux_devtools">

安装好之后我们来继续思考我们修改数据应该走一个什么流程：

<img :src="$withBase('/react_redux_flow.png')" alt="Redux Flow">

继续看上面这个图，我们修改数据需要走这么几步：
+ <font color=#9400D3>创建action，然后通过store.dispatch方法去向Store调度这个action</font>
+ <font color=#9400D3>在Store当中把旧的所有数据previusState和收到的action一起发给Reducers（<font color=#DD1144>注意：这一步是Store自己做的，我们不需要手动发送</font>）</font>
+ <font color=#9400D3>Reducers根据发来的action去修改previousState，形成新的newState返回给Store</font>
+ <font color=#9400D3>Store当中会将新数据newState替换掉旧数据previousState（<font color=#DD1144>注意：这一步是Store自己做的，我们不需要手动替换</font>）</font>
+ <font color=#9400D3>组件当中要主动去订阅Store中数据的变化，重新取数据</font>

<font color=#1E90FF>**① 第一遍流程**</font>

所以我们先来实现输入框输入内容改变，走`redux`的流程：
```javascript
// TodoList.js
import React, { Component } from 'react'
import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';
import store from './store/index.js'

class TodoList extends Component {
	constructor(props) {
		super(props)
		this.state = store.getState()
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleStoreChange = this.handleStoreChange.bind(this)
		// 5. 订阅到Store的变化
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
						onChange={this.handleInputChange} // 1. 输入框监听到输入
					/>
					<Button type="primary">Commit</Button>
				</div>
			</div>
		)
	}

	handleInputChange(e) {
		// 2. 创建action
		const action = {
			type: 'change_input_value',
			value: e.target.value
		}
		// 3. dispatch调度一个action
		store.dispatch(action)
	}

	handleStoreChange() {
		// 6. 重新取一遍数据
		this.setState(store.getState())
	}
}

export default TodoList;
```
```javascript
// store/reducer.js
const defaultState = {
	inputValue: 'start input',
	list: []
}

export default (state = defaultState,action)=> {
	// 4. reducer中根据action的type类型进行不同的处理，返回newState
	if (action.type === 'change_input_value') {
		const newState = JSON.parse(JSON.stringify(state))
		newState.inputValue = action.value
		return newState
	}
	return state
}
```
可以根据上面两段代码中的数字注释来清晰的看一下流程，只不过我们要在`reducer`中处理的时候注意两点：
+ <font color=#DD1144>reducer可以接收state，但是不能修改state，所以创建newState对state进行简单的深拷贝</font>
+ <font color=#DD1144>reducer处理后要将新的数据返回给Store</font>

<font color=#1E90FF>**② 第二遍流程**</font>

现在我们实现点击提交，将输入框中的内容加到列表中，并清空输入框
```javascript
// TodoList.js
import React, { Component } from 'react'
import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';
import store from './store/index.js'

class TodoList extends Component {
	constructor(props) {
		super(props)
		this.state = store.getState()
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleStoreChange = this.handleStoreChange.bind(this)
		this.handleBtnClick = this.handleBtnClick.bind(this)
		// 5. 订阅到Store的变化
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
						onClick={this.handleBtnClick} // 1. 点击提交按钮
					>Commit</Button>
				</div>
				<List
					style={{marginTop:'10px',width: '300px'}}
					bordered
					dataSource={this.state.list}
					renderItem={item=> (<List.Item>{item}</List.Item>)}
				/>
			</div>
		)
	}
	handleStoreChange() {
		// 6. 重新取一遍数据
		this.setState(store.getState())
	}

	handleBtnClick() {
		// 2. 创建action
		const action = {
			type: 'add_todo_item'
		}
		// 3. dispatch调度一个action
		store.dispatch(action)
	}
}

export default TodoList;
```
```javascript
// store/reducer.js
const defaultState = {
	inputValue: '',
	list: []
}

export default (state = defaultState,action)=> {
	// 4. reducer中根据action的type类型进行不同的处理，返回newState
	if (action.type === 'add_todo_item') {
		const newState = JSON.parse(JSON.stringify(state))
		newState.list.push(newState.inputValue)
		newState.inputValue = ''
		return newState
	}
	return state
}
```

### 4. 列表删除（删除数据）
```javascript
// TodoList.js
import React, { Component } from 'react'
import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';
import store from './store/index.js'

class TodoList extends Component {
	constructor(props) {
		super(props)
		this.state = store.getState()
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleStoreChange = this.handleStoreChange.bind(this)
		this.handleBtnClick = this.handleBtnClick.bind(this)
		// 5. 订阅到Store的变化
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
					// 1. 点击要删除的item
					renderItem={(item,index) => (<List.Item onClick={this.hanleItemDelete.bind(this,index)}>{item}</List.Item>)}
				/>
			</div>
		)
	}
	handleStoreChange() {
		// 6. 重新取一遍数据
		this.setState(store.getState())
	}


	hanleItemDelete(index){
		// 2. 创建action
		const action = {
			type: 'delete_todo_item',
			index
		}
		// 3. dispatch调度一个action
		store.dispatch(action)
	}
}

export default TodoList;
```
```javascript
// store/reducer.js
const defaultState = {
	inputValue: '',
	list: []
}

// 4. reducer中根据action的type类型进行不同的处理，返回newState
export default (state = defaultState,action)=> {
	if (action.type === 'delete_todo_item') {
		const newState = JSON.parse(JSON.stringify(state))
		newState.list.splice(action.index,1)
		return newState
	}
	return state
}
```
