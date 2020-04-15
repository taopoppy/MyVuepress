# React实践

## 编写一个完整的TodoList
### 1. 响应式和事件绑定
如果你学习过`Vue`你会知道使用一个`input`框，数据和输入框中的数据相互绑定使用`v-model`即可，但是`v-model`是一种语法糖，完整的写法比较难懂，但是在`React`当中，数据的绑定就需要完整的书写，我们先来从书写一个输入框的内容和组件数据绑定的代码开始:
```javascript
import React, {Component, Fragment} from 'react'

class TodoList extends Component {
	constructor(props) {
		super(props);
		// 定义组件的状态
		this.state = {
			inputValue: '',
			list: []
		}
	}
	handleInputChange(e) {
		// 修改组件状态
		this.setState({
			inputValue: e.target.value
		})
	}
	render() {
		return (
			<Fragment>
				<div>
					<input
						value={this.state.inputValue}
						onChange={this.handleInputChange.bind(this)}
					/>
					<button>提交</button>
				</div>
			</Fragment>
		)
	}
}
export default TodoList
```
我们先来搞清楚<font color=#9400D3>用户输入</font>、<font color=#9400D3>组件状态</font>、<font color=#9400D3>输入框中的内容</font>之间的关系，通常按照一般的理解，用户输入什么，输入框中显示什么，这样的理解会误导<font color=#DD1144>用户输入</font>和<font color=#DD1144>输入框中的内容</font>是一个因果关系，但是实际的情况是：<font color=#1E90FF><font color=#DD1144>用户输入</font>只会触发一个事件，事件当中会通过参数拿到用户输入的值，根据这个值来修改<font color=#DD1144>组件的状态</font>，组件的状态会导致<font color=#DD1144>输入框中的内容</font>一起变化</font>。

了解清楚这个过程之后，我们再来说一说上面代码的一些注意的点：
+ <font color=#1E90FF>React规定组件最外层只能有一个包裹标签，Fragment占位符组件可以帮助我们解决这个问题</font>

+ <font color=#1E90FF>JSX当中使用JavaScript的表达式一点要使用中括号进行包裹，并且事件绑定要使用驼峰命名的方法，比如onClick，onChange	等等</font>

+ <font color=#1E90FF>在React的组件中，render函数当中的this是指向组件本身的，其他的就未必，比如在handleInputChange中想让this指向TodoList组件本身，就必须在调用的时候通过bind来修改this的指向</font>

+ <font color=#1E90FF>组件状态的修改不能通过this.state = xxx直接修改，必须通过React.Component.setState()方法来修改</font>

+ <font color=#DD1144>this.setState()方法有两个参数，第二个参数是一个callback回调，因为this.setState是一个异步方法，不能在外部直接拿到通过this.setState()修改后的值，只能在回调中去操作被修改后的数据</font>,所以这里有两种写法：
	```javascript
	// 第一种写法
	handleInputChange(e) {
		this.setState({
			inputValue: e.target.value
		},()=> {
			console.log(this.state.inputValue)
		})
	}
	// 第二种写法
	async handleInputChange(e) {
		await this.setState({
			inputValue: e.target.value
		})
		console.log(this.state.inputValue)
	}
	```

### 2. 实现新增删除功能
下面我们来实现以下`TodoList`的新增和删除，对事件绑定和数据响应再次巩固一下：
```javascript
import React, {Component, Fragment} from 'react'

class TodoList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inputValue: '',
			list: []
		}
	}
	handleInputChange(e) {
		this.setState({
			inputValue: e.target.value
		})
	}
	// TodoList新增的方法
	handleButtonClick() {
		this.setState({
			list: [...this.state.list, this.state.inputValue],
			inputValue: ''
		})
	}
	// TodoList删除的方法
	handleItemDelete(index) {
		const list = [...this.state.list] // 创造副本
		list.splice(index, 1)             // 修改副本
		this.setState({
			list
		})
	}
	render() {
		return (
			<Fragment>
				<div>
					<input
						value={this.state.inputValue}
						onChange={this.handleInputChange.bind(this)}
					/>
					<button onClick={this.handleButtonClick.bind(this)}>提交</button>
				</div>
				<ul>
					{
						this.state.list.map((item, index) => {
							return (
								<li
									key={index}
									onClick={this.handleItemDelete.bind(this, index)}
								>
									{item}
								</li>
							)
						})
					}
				</ul>
			</Fragment>
		)
	}
}
export default TodoList
```
通过上面的代码我们说两个比较重要的点:
+ <font color=#1E90FF>注意ES6方法的使用，第一个就是扩展运算符，第二个就是属性和属性值的名称相同时，可以简写</font>
+ <font color=#DD1144>在React当中有一种immutable的说法，我们不能直接去修改state的值，必须通过修改副本的方式来通过this.setState()给state赋新值</font>

### 3. 拆分组件和组件传值
+ <font color=#DD1144>父组件给子组件传值通过属性的方式。子组件通过props来拿到父组件传的值</font>
+ <font color=#DD1144>子组件给父组件传值实际上是父组件将自己的方法通过属性传递的方式传给子组件去调用</font>
```javascript
// TodoList.js
import React, {Component, Fragment} from 'react';
import TodoItem from './TodoItem'

class TodoList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inputValue: '',
			list: []
		}
	}
	handleInputChange(e) {
		this.setState({
			inputValue: e.target.value
		})
	}
	handleButtonClick() {
		this.setState({
			list: [...this.state.list, this.state.inputValue],
			inputValue: ''
		})
	}
	handleItemDelete(index) {
		const list = [...this.state.list]
		list.splice(index, 1)
		this.setState({
			list
		})
	}
	render() {
		return (
			<Fragment>
				<div>
					<input
						value={this.state.inputValue}
						onChange={this.handleInputChange.bind(this)}
					/>
					<button onClick={this.handleButtonClick.bind(this)}>提交</button>
				</div>
				<ul>
					{
						this.state.list.map((item, index) => {
							return (
								<TodoItem
									content={item} // 传递属性
									key={index}
									index={index}
									deleteItem={this.handleItemDelete.bind(this)} // 传递方法
								/>
							)
						})
					}
				</ul>
			</Fragment>
		)
	}
}

export default TodoList
```
```javascript
// TodoItem.js
import React from 'react'

class TodoItem extends React.Component {
	constructor(props) {
		super(props)
		// 提前将handleClick函数的this绑定在TodoItem
		this.handleClick = this.handleClick.bind(this)
	}
	handleClick() {
		// 调用父组件传递来的方法
		// deleteItem就是TodoItem中的handleItemDelete方法
		// deleteItem中的this指的就是父组件TotoList
		this.props.deleteItem(this.props.index)
	}
	render() {
		return (
			<div onClick={this.handleClick}>
				{this.props.content}
			</div>
		)
	}
}

export default TodoItem
```
要注意两点：
+ <font color=#1E90FF>render方法中的组件方法绑定this的操作放在constructor有助于组件性能提升</font>
+ <font color=#1E90FF>父组件传递给子组件方法的时候，这个方法中的this一定要指向父组件，不然子组件中执行该方法的时候，方法中的this就是undefined</font>

### 4. 代码优化
虽然我们已经完成了一个`TodoList`的功能，但是我们还有很多优化的地方和新写法
+ <font color=#9400D3>解构赋值</font>：在`React`的`JSX`中如果包含太多的`this.state.xxx`、`this.props.xxx`,会显得有点冗余
+ <font color=#9400D3>函数替换对象</font>：在`this.setState`的第一参数中，新版的可以写成一个函数的方式，通过存在`prevState`来表示旧的`state`
+ <font color=#9400D3>ES6新写法</font>：比如解构赋值，属性名称和值相同时简写，箭头函数返回值简写等等：
```javascript
// TodoItem.js
import React from 'react'

class TodoItem extends React.Component {
	constructor(props) {
		super(props)
		// 提前将handleClick函数的this绑定在TodoItem
		this.handleClick = this.handleClick.bind(this)
	}
	handleClick() {
		// 调用父组件传递来的方法
		// deleteItem就是TodoItem中的handleItemDelete方法
		// deleteItem中的this指的就是父组件TotoList
		const { deleteItem, index } = this.props // 解构赋值
		deleteItem(index)
	}
	render() {
		return (
			<div onClick={this.handleClick}>
				{this.props.content}
			</div>
		)
	}
}

export default TodoItem
```
```javascript
// TodoList.js
import React, {Component, Fragment} from 'react';
import TodoItem from './TodoItem'

class TodoList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inputValue: '',
			list: []
		}
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleButtonClick = this.handleButtonClick.bind(this)
		this.handleItemDelete = this.handleItemDelete.bind(this)
	}
	handleInputChange(e) {
		// 3. 新版函数的ES6简写
		const value = e.target.value
		this.setState(() => ({
			inputValue: value
		}))

		// // 2. 新版函数的写法
		// this.setState(()=> {
		// 	return {
		// 		inputValue: e.target.value
		// 	}
		// })

		// // 1.最古老的写法
		// this.setState({
		// 	inputValue: e.target.value
		// })
	}
	handleButtonClick() {
		this.setState((prevState)=> ({
			list: [...prevState.list,prevState.inputValue],
			inputValue: ''
		}))

		// // 1. 最古老的写法
		// this.setState({
		// 	list: [...this.state.list, this.state.inputValue],
		// 	inputValue: ''
		// })
	}
	handleItemDelete(index) {
		this.setState((prevState)=> {
			const list = [...prevState.list]
			list.splice(index, 1)
			return {
				list
			}
		})

		// // 1.最古老的写法
		// const list = [...this.state.list]
		// list.splice(index, 1)
		// this.setState({
		// 	list
		// })
	}
	getTodoItem() {
		return this.state.list.map((item, index) => {
			return (
				<TodoItem
					content={item} // 传递属性
					key={index}
					index={index}
					deleteItem={this.handleItemDelete} // 传递方法
				/>
			)
		})
	}
	render() {
		return (
			<Fragment>
				<div>
					<label htmlFor="insertArea"></label>
					<input
						id="insertArea"
						value={this.state.inputValue}
						onChange={this.handleInputChange}
					/>
					<button onClick={this.handleButtonClick}>提交</button>
				</div>
				<ul>
					{this.getTodoItem()}
				</ul>
			</Fragment>
		)
	}
}
export default TodoList
```