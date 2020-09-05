# React思想

现在我们来培养我们中小项目的前端架构思维。

## 前置准备
### 1. 创建项目
在`vscode`编辑器当中下载一些插件方便我们来更好的，高效的开发`react`项目
+ <font color=#1E90FF>Prettier-Code formatter</font>：格式化代码
+ <font color=#1E90FF>Reactjs code snippets</font>：方便生成React代码,快捷键<font color=#9400D3>rcc</font>
+ <font color=#1E90FF>Auto Rename Tag</font>：同时修改前置标签和闭合标签

接下来我们就可以正式创建项目，在创建项目的时候一般使用脚手架工具`create-react-app`,不过一般我们需要先修改一下`npm`的下载地址为国内的镜像：
```javascript
npm config set registry https://registry.npm.taobao.org
```
接着创建一个`hello-world`的项目：
```javascript
npx create-react-app hello-world
```

对于创建出来的目录我们就不再详细说明了，要说的一点就是：<font color=#1E90FF>src目录是会在打包的时候参与到构建当中，而public目录下的资源文件不参与构建的，只参与打包，也就是原原本本的移动到打包文件中</font>

另外对于`package.json`当中只有三个依赖，主要的三个是`react`、`react-dom`、`react-scripts`，其中需要的其他依赖比如`webpack`、`bebal`等都被封装到了`react-scripts`这个当中，所以你会看到在`scripts`当中的所有命令都是使用`react-scripts`下的命令启动的，<font color=#1E90FF>你可以通过npm run eject来弹射出webpack的配置</font>

### 2. mock数据
有两种使用`mock`数据的方式：

<font color=#1E90FF>**① 代理到mock服务器**</font>

<font color=#DD1144>在正规的前端开发当中，我们应该开启一台mock服务器，将mock数据定义在mock服务器上，然后将前端http请求发送到这个mock服务器上面，从而模拟真实的数据请求的过程</font>

我们使用<font color=#9400D3>serve</font>这个`mock`的服务器，首先下载它：
```javascript
npm install -g serve
```
然后使用非常简单，<font color=#1E90FF>在某个路径下直接执行serve命令，就会将该路径下的资源作为web资源托管到serve服务器上面</font>，比如说我们有个文件夹`test`，然后里面有个`api`文件夹，里面有个`data.json`的文件，在`test`中启动`serve`命令，然后通过访问`localhost:5000/api/data.json`就可以拿到`json`数据。

在`react`项目当中，有两种方法来设置代理，在[create-react-app官网](https://create-react-app.dev/docs/proxying-api-requests-in-development/#configuring-the-proxy-manually)上有两种设置代理的方式：
+ <font color=#9400D3>package.json中设置proxy</font>
+ <font color=#9400D3>http-proxy-middleware</font>

两种方式有所不同，详细请看[create-react-app官网](https://create-react-app.dev/docs/proxying-api-requests-in-development/#configuring-the-proxy-manually)，我们这里采用第二种方式，直接创建`src/setupProxy.js`，内容如下：
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
```
对应下载`http-proxy-middleware`即可：
```javascript
npm install http-proxy-middleware --save
```
这样配置完毕，我们访问`localhost:3000/api/data.json`就有数据了，因为访问的路径以`/api`开头，所以自动代理到了`localhost:5000/api/data.json`。


<font color=#1E90FF>**② 将mock数据直接放在项目public文件夹**</font>

这种方式在使用`create-react-app`脚手架的方式创建项目是很适用的,创建一个`public/mock/data.json`文件夹，然后直接可以通过`localhost:3000/mock/data.json`去访问的，因为在`public`文件中的内容之前就说过，是原封不动的进入打包文件的，不需要构建，并且作为静态资源存在的。

## React思维实战

### 1. 组件划分原则
+ <font color=#9400D3>解耦</font>：降低单一模块/组件的复杂度
+ <font color=#9400D3>复用</font>：保证组件的一致性，提高开发效率
+ <font color=#9400D3>适度</font>：组件颗粒度需要避免过大或者过小

<img :src="$withBase('/react_jiagou_huafen.png')" alt="">

### 2. 编写静态组件
+ <font color=#9400D3>开发过程解耦</font>：<font color=#DD1144>静态页面（页面结构，样式）</font>和<font color=#DD1144>动态交互（通讯，事件处理）</font>
+ <font color=#9400D3>组件开发顺序</font>：自上而下或者其他（App->TodoList-> Todo -> AddTodo -> Footer）

下面我们就列出书写的代码，代码很简单，但是要注意代码的书写顺序和整个开发逻辑的梳理：
```javascript
// App.js
import React, { Component } from 'react';
import AddTodo from './AddTodo'
import TodoList from './TodoList'
import Footer from './Footer'

// 2. 定义相关的模拟数据
const todos = [
	{ id: 1, text: "学习react", completed: true },
	{ id: 2, text: "学习redux", completed: false },
	{ id: 3, text: "学习router", completed: false }
]

const filter = "all"

class App extends Component {
	render() {
		return (
			{/* 1. 定义所以要显示的组件*/}
			<div>
				<AddTodo />
				<TodoList todos={todos}/>
				<Footer filter={filter}/>
			</div>
		);
	}
}

export default App;
```
```javascript
// TodoList.js
import React, { Component } from 'react';
import Todo from './Todo'

class TodoList extends Component {
	render() {
		// 1. 拿到props属性
		const { todos } = this.props
		return (
			<ul>
				{
					todos.map(todo => {
						// 2. 这里使用了Todo子组件
						return <Todo key={todo.id} {...todo} />
					})
				}
			</ul>
		);
	}
}

export default TodoList;
```
```javascript
// Todo.js
import React, { Component } from 'react';

class Todo extends Component {
	render() {
		// 1. 拿到props属性
		const { text, completed } = this.props

		return (
			<li style={{
				// 2. 定义了显示样式
				textDecoration: completed ? "line-through":"none"
			}}>
				{ text }
			</li>
		);
	}
}

export default Todo;
```
```javascript
// AddTodo.js
import React, { Component } from 'react';

class AddTodo extends Component {
	render() {
		return (
			<div>
				{/* 1. 简单的写好显示的组件即可*/}
				<input />
				<button>Add</button>
			</div>
		);
	}
}

export default AddTodo;
```
```javascript
// Footer.js
import React, { Component } from 'react';

class Footer extends Component {
	render() {
		const { filter } = this.props

		return (
			<div>
				<span>show:</span>
				<button disabled={filter === "all"}>All</button>
				<button disabled={filter === "active"}>Active</button>
				<button disabled={filter === "completed"}>Completed</button>
			</div>
		);
	}
}

export default Footer;
```

<font color=#DD1144>很多人写程序写多了就会一头雾水，写程序其实是有层次有顺序的微重构，很多人比如说写这个TodoList，一开始就把一个组件写完整，这是不对的，从大局观来看，写一个完整的Demo就应该像我们上面这样，先把所有相关页面的静态页面写好，不要急于写交互逻辑，一步一步来</font>

### 3. 分析State
<font color=#1E90FF>**① 如何设计State**</font>

<font color=#DD1144>State是代表UI的完整却最小状态的集合</font>，最重要的就是`state`是一个可以变化的状态，我们如何来分析哪些变量是`state`呢？

+ <font color=#1E90FF>是否通过父组件props传入</font>：通过父组件的`props`传入的肯定不是`state`，因为无法变化，`props`是直接取到并使用的。
+ <font color=#1E90FF>是否不会随时间，交互操作变化</font>：不随时间和交互操作变化的大概率是常量，而不是变量，不是变量就不是`state`
+ <font color=#1E90FF>是否可以通过其他state或者props计算得到</font>：如果可以就不属于state，这实际上属于冗余的状态，不应该属于`state`这个最小状态的集合

根据上面的分析，对于一个`TodoList`，其实有三个`state`，分别是
+ 输入框中的值（随用户输入交互而变化）
+ 列表数据（随用户点击添加或者删除而变化）
+ 底部筛选条件状态（随用户点击按钮进行切换而变化）

<font color=#1E90FF>**② State保存位置**</font>

如何分析`State`的保存位置?
+ <font color=#1E90FF>状态只在某个组件当中使用，保存位置肯定在组件内部</font>
+ <font color=#DD1144>多个组件使用相同的state的时候，先确定依赖state的每一个组件，然后寻找这些组件的共同的父组件，并将state保存在这里（<font color=#9400D3>状态上移</font>）</font>
（依赖这个词有两种情况，第一种就是组件中的交互操作会改变state，第二种就是组件的渲染结果受state变化的影响）

首先我们从上到下来看：

<font color=#DD1144>AddTodo这个组件依赖我们前面说的输入框中的文本这个state，而其他组件没有用到这个state,所以我们就可以直接将这个state定义在AddTodo组件当中</font>：

```javascript
// AddTodo.js
class AddTodo extends Component {
	constructor(props) {
		super(props)
		// 1. 定义状态
		this.state = {
			text: ''
		}
	}
	render() {
		return (
			<div>
				{/*2. 使用状态*/}
				<input value={this.state.text}/>
				<button>Add</button>
			</div>
		);
	}
}

export default AddTodo;
```

<font color=#DD1144>然后我们来看TodoList组件，这个组件当中使用到了列表数据这个state，但是，TodoList的功能是点击列表本身会删除对应数据，在input当中输入，并点击添加按钮会向列表中添加数据，所以AddTodo组件和TodoList组件这两个组件中操作都会改变列表数据这个state（依赖的第一层含义：组件中的交互操作会改变state），也称两个组件都依赖列表数据这个state。那么这个state就不能定义在TodoList中了，需要状态上移</font>

```javascript
// App.js
class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			// 1. 定义state
			todos: []
		}
	}
	render() {
		const { todos } = this.state // 2. 拿到state

		return (
			<div>
				<AddTodo />
				<TodoList todos={todos}/> {/* 3. 使用state*/}
				<Footer filter={filter}/>
			</div>
		);
	}
}

export default App;
```

<font color=#DD1144>最后我们看看这个筛选状态state，虽然别的组件中没有直接能操作筛选状态state，但是这个state的切换会影响TodoList组件中的列表显示，也就是说Footer组件的交互会改变筛选状态state，但是筛选状态state的改变也会影响到TodoList渲染的结果（依赖的第二层含义：组件的渲染结果受state变化的影响），所以Footer组件和TodoList组件都依赖筛选状态state，也要状态上移</font>

```javascript
// App.js
class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			todos: [],
			filter: "all" // 1. 添加state
		}
	}
	render() {
		const todos = this.getVisibleTodos() // 4. 根据filter过滤todos
		const { filter } = this.state // 2. 拿到state

		return (
			<div>
				<AddTodo />
				<TodoList todos={todos}/>
				<Footer filter={filter}/> {/*3. Footer组件使用state*/}
			</div>
		);
	}

	getVisibleTodos = () => {
		const currentFilter = this.state.filter // 5. filter这个state变化会影响TodoList列表的渲染结果
		return this.state.todos.filter(item => {
			if (currentFilter === 'active') {
				return !item.completed
			} else if(currentFilter === 'completed') {
				return item.completed
			} else {
				return true
			}
		})
	}
}

export default App;
```

### 4. 添加交互行为
前面我们通过`props`实现父组件向子组件向下传递数据，实际上实现交互行为，也需要借助`props`,要将父组件的提供的方法向下传递，对于`TodoList`这个`demo`我们需要实现三个交互行为，分别是<font color=#1E90FF>新增todo</font>、<font color=#1E90FF>修改todo状态</font>、<font color=#1E90FF>过滤显示</font>

<font color=#1E90FF>**① 新增todo**</font>

```javascript
// App.js
class App extends Component {
	constructor(props) {
		this.nextTodoId = 0 // 1. 定义一个组件中维护的变量来给每个todo不同的id
	}
	render() {
		return (
			<div>
				<AddTodo addTodo={this.addTodo}/> {/* 3. 向下传递方法*/}
			</div>
		);
	}

	// 2. 定义addTodo方法来向todos中添加新的todo
	addTodo = (text) => {
		const todo = {
			id: this.nextTodoId++,
			text,
			completed: false
		}
		const newTodos = [todo, ...this.state.todos]
		this.setState({
			todos: newTodos
		})
	}
}
```
修改`todos`中的数据，那修改`todos`的方法要定义在`todos`这个`state`定义的组件内，也就是`App.js`当中，然后将修改方法一层层向下传递，传递给`AddTodo`组件使用。

```javascript
// AddTodo.js
class AddTodo extends Component {
	render() {
		const { addTodo } = this.props // 1. 拿到addTodo方法
		return (
			<div>
				<input value={this.state.text} onChange={this.handleChange}/> {/* 4. 给输入框添加onChange事件*/}
				<button onClick={()=> addTodo(this.state.text)}>Add</button> {/* 2. 使用addTodo方法*/}
			</div>
		);
	}
	// 3，定义input框内容修改的方法
	handleChange = (e) => {
		this.setState({
			text: e.target.value
		})
	}
}
```
<font color=#DD1144>特别要注意，子组件当中调用父组件传递的函数，并且要传递参数的时候，需要使用箭头函数，因为onClick={()=> addTodo(this.state.text)}这样写，addTodo执行的时候函数中的this依旧指向App.js，如果直接写onClick={addTodo(this.state.text)}，那addTodo函数中的this就执行AddTodo自己了</font>


<font color=#1E90FF>**② 修改todo的状态**</font>

```javascript
// App.js
class App extends Component {
	render() {
		return (
			<div>
				<TodoList todos={todos} toggleTodo={this.toggleTodo}/> {/* 2. 修改方法向下传递*/}
			</div>
		);
	}
	// 1. 定义toggleTodo修改状态的函数
	toggleTodo = (id) => {
		const newTodos = this.state.todos.map(item => {
			return item.id === id ? {...item, completed:!item.completed}:item
		})
		this.setState({
			todos: newTodos
		})
	}
```
```javascript
// TodoList.js
class TodoList extends Component {
	render() {
		const { todos, toggleTodo } = this.props // 1. 拿到修改状态的方法toggleTodo
		return (
			<ul>
				{
					todos.map(todo => {
						return <Todo key={todo.id} {...todo} onClick={()=> {toggleTodo(todo.id)}}/> {/*2. 使用该方法，传递参数*/}
					})
				}
			</ul>
		);
	}
}
```
```javascript
// Todo.js
class Todo extends Component {
	render() {
		const { text, completed, onClick } = this.props // 1. 拿到点击事件onClick

		return (
			<li
				style={{ textDecoration: completed ? "line-through":"none" }}
				onClick={onClick} {/* 2. 添加点击事件*/}
			>
				{ text }
			</li>
		);
	}
}
```
由此可以看出，一个`state`的修改方法要传递到那个最小的组件上面，或者说是真正操作`DOM`层面的元素上面。

<font color=#1E90FF>**③ 过滤显示**</font>

```javascript
// App.js
class App extends Component {
	render() {
		return (
			<div>
				<Footer filter={filter} setVisibilityFilter={this.setVisibilityFilter}/> {/* 2. 向下传递该方法*/}
			</div>
		);
	}
	// 1. 定义修改筛选条件的方法
	setVisibilityFilter = (filter) => {
		this.setState({
			filter
		})
	}
}
```
```javascript
// Footer.js

class Footer extends Component {
	render() {
		const { filter,setVisibilityFilter } = this.props // 1. 拿到方法

		return (
			<div>
				<span>show:</span>
				<button
					disabled={filter === "all"}
					// 2. 使用箭头函数来使用方法修改筛选条件，并传递参数
					onClick={()=> {setVisibilityFilter("all")}}
				>All</button>
				<button
					disabled={filter === "active"}
					// 2. 使用箭头函数来使用方法修改筛选条件，并传递参数
					onClick={()=> {setVisibilityFilter("active")}}
				>Active</button>
				<button
					disabled={filter === "completed"}
					// 2. 使用箭头函数来使用方法修改筛选条件，并传递参数
					onClick={()=> {setVisibilityFilter("completed")}}
				>Completed</button>
			</div>
		);
	}
}
```

## this写法略讲
在我们本节最后有个比较有趣的技巧介绍一下，对比下面的代码，其中两处不同的地方我们已经标注出来
```javascript
import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: ''
    }
	}
	// 2. 第二处不同
  handleChange=(e)=>{
    this.setState({
      text: e.target.value
    })
  }
  render() {
    return (
      <div>
        <input
          value={this.state.text}
          onChange={this.handleChange} /> {/* 1. 第一处不同*/}
        {this.state.text}
      </div>
    );
  }
}

export default App
```
<font color=#DD1144>handleChange是成员函数，类的每个成员函数在执行时的this并不是和类实例自动绑定的，而contructor和render函数在react中是自动和组件保持同一个this的。但是handleChange箭头函数的this和外层是相关的，所以handleChange当中的this和组件内部的环境是一致的，所以在箭头函数中调用this.setState就相当于调用App.setState，所以正确</font>

```javascript
import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: ''
    }
	}
	// 2. 第二处不同
  handleChange(e){
    this.setState({
      text: e.target.value
    })
  } 
  render() {
    return (
      <div>
        <input
          value={this.state.text}
          onChange={this.handleChange.bind(this)} />{/* 1. 第一处不同*/}
        {this.state.text}
      </div>
    );
  }
}

export default App
```
<font color=#DD1144>上面这种写法也是正确的，因为在调用handleChange之前，提前使用bind将handleChange函数内部的this绑在了render函数中的this，因为render函数中的this就是组件App本身，所以正确。而且contructor函数的this也和组件App的this保持一致，所以你也会通常看见别人在contructor中提前书写下面的代码，效果和上面是一样的</font>

```javascript
constructor(props) {
	super(props)
	...
	this.handleChange = this.handleChange.bind(this)
}
```
所以上面两种写法都是正确的，唯一错误的写法就是下面这种，因为这种`handleChange`中的`this`是自己函数的`this`，自己函数上又没有`setState`这个方法 ，所以会出现错误提示，提示你`setState`是不存在的。
```javascript
class App extends React.Component {
  handleChange(e){
    this.setState({ // 这里的this就是handleChange自己的this，不是App的this，没有setState这个属性，所以报错
      text: e.target.value
    })
  } 
  render() {
    return (
      <div>
        <input
          value={this.state.text}
          onChange={this.handleChange} /> {/* 1. 调用成员函数handleChange*/}
        {this.state.text}
      </div>
    );
  }
}

export default App
```
