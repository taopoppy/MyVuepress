# React-Redux基本思想

## 概述
前面我们使用了`React`和`Redux`，但我们还没有在`React`连接`Redux`，在之前我们已经知道，实际上可以通过在`React`当中调用`Redux`当中的`store.dispatch`和`store.subscibe`方法来连接`Redux`，<font color=#1E90FF>但是这样就将redux的相关的逻辑代码都冗杂在了React组件代码之中，为了链接React和Redux，又不让他们两个的代码进行糅合，我们需要借助React-Redux</font>

`React-Redux`有哪些功能帮助我们呢？
+ <font color=#1E90FF>向根组件注入Store</font> -> <font color=#9400D3>Provider组件</font>
+ <font color=#1E90FF>连接Reac组件和Redux状态层</font> -> <font color=#9400D3>connect高阶组件(HOC)</font>
+ <font color=#1E90FF>获取React组件所需的State和Actions</font> -> <font color=#9400D3>map api</font>

由于`React-Redux`的引入，将`React`当中的组件划分为两种：<font color=#9400D3>展示型组件</font>和<font color=#9400D3>容器型组件</font>

|    						       | 展示型组件         | 容器型组件            |
| -------------------- |:------------------:| :--------------------:|
| 关注点               | UI的展现           | 逻辑（取数据更新状态） |
| 对Redux层是否有感知  | 否                 | 是                     |
| 读数据               | 从props中获取      | 从Redux store中获取    |
| 写数据               | 调用props传递的回调|  发送Redux actions     |
| 如何创建             | 手写               |  通过react-redux创建   |

那么有一个特别重要的问题就是：我们之前写的`TodoList`组件当中，哪些组件可以作为容器性组件和`Redux`进行数据联系呢？

<font color=#DD1144>我们前面定义了三个State：text，todos，filter，然后按照组件和State的依赖关系进行State的定义位置的判断，组件和State依赖关系有两种，分别是<font color=#9400D3>组件中的用户操作会修改State</font>和<font color=#9400D3>组件的UI渲染受State的影响</font>，现在哪些组件可以作为容器性的组件也是这个判断依据，AddTodo组件可以修改text，而且输入框中的显示受text的影响；TodoList组件的展示受todos和filter影响，起修改也会影响todos；Footer组件中的点击操作会影响filter，所以这三个组件都应该作为容器性组件进行和Redux中的数据交互</font>

所以我们接下来创建容器性组件。不过首先要先下载：
```javascript
npm install react-redux@5.0.7
```


## 容器性组件
### 1. TodoListContainer

我们需要像下面这样来创建`TodoList`的容器性组件，创建`src/containers/TodoListContainer.js`:
```javascript
// src/containers/TodoListContainer.js
import { connect } from 'react-redux'
import TodoList from '../components/TodoList'
import { toggleTodo } from '../actions'

const getVisibleTodos = (todos, filter ) => {
	switch (filter) {
		case "all":
			return todos
		case "completed":
			return todos.filter(t => t.completed)
		case "active":
			return todos.filter(t => !t.completed)
		default:
			return new Error("Unknown filter", filter)
	}
}
// TodoList组件中可以拿到this.props.todos
const mapStateToProps = (state) => ({
	todos: getVisibleTodos(state.todos, state.filter)
})
// TodoList组件中可以拿到this.props.toggleTodo
const mapDispatchProps = (dispatch) => ({
	toggleTodo: id => dispatch(toggleTodo(id))
})

export default connect(mapStateToProps, mapDispatchProps)(TodoList)
```

### 2. AddTodoContainer
同样，创建`src/containers/AddTodoContainer.js`:

```javascript
// src/containers/AddTodoContainer.js
import { connect } from 'react-redux'
import AddTodo from '../components/AddTodo'
import { addTodo, setTodoText } from '../actions'

// AddTodo组件中可以拿到this.props.text
const mapStateToProps = (state) => ({
	text: state.text
})
// AddTodo组件中可以拿到this.props.addTodo
// AddTodo组件中可以拿到this.props.setTodoText
const mapDispatchProps = (dispatch) => ({
	setTodoText: text => dispatch(setTodoText(text)),
	addTodo: text => dispatch(addTodo(text))
})


export default connect(mapStateToProps, mapDispatchProps)(AddTodo)
```

### 3. FooterContainer
创建`src/containers/FooterContainer.js`编写内容如下

```javascript
// src/containers/FooterContainer.js
import { connect } from 'react-redux'
import Footer from '../components/Footer'
import { setFilter } from '../actions'

// Footer组件中可以拿到this.props.filter
const mapStateToProps = (state) => ({
	filter: state.filter
})

// Footer组件中可以拿到this.props.setFilter
const mapDispatchProps = (dispatch) => ({
	setFilter: filter => dispatch(setFilter(filter))
})


export default connect(mapStateToProps, mapDispatchProps)(Footer)
```

### 4. 整合容器性组件
上面写好了三个容器性组件，我们需要做两件事情，<font color=#1E90FF>将容器性组件整合到App.js当中</font>和<font color=#1E90FF>修改原来的UI型组件</font>

<font color=#1E90FF>**① 将容器性组件整合到App.js当中**</font>

我们将上面三个容器型组件整合到`App.js`当中，可以看到，相比于我们之前的在`App.js`当中定义很多状态，这个`App.js`就非常简洁和简单了。
```javascript
// src/components/App.js
import React, { Component } from 'react';
import AddTodoContainer from '../containers/AddTodoContainer'
import TodoListContainer from '../containers/TodoListContainer'
import FooterContainer from '../containers/FooterContainer'

class App extends Component {
	render() {

		return (
			<div>
				<AddTodoContainer />
				<TodoListContainer />
				<FooterContainer />
			</div>
		);
	}
}
export default App;
```

然后我们将`Redux`中的`store`通过`react-redux`中的`Provider`组件注入到`App.js`组件中：
```javascript
// src/store.js
import { createStore } from 'redux'
import rootReducer from './reducers/index'
const store = createStore(rootReducer)
export default store
```
```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import store from './store'
import { Provider } from 'react-redux'


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

```




<font color=#1E90FF>**② 修改原来的UI型组件**</font>

```javascript
// src/components/AddTodo.js
import React, { Component } from 'react';
class AddTodo extends Component {
	render() {

		return (
			<div>
				{/* 1. 简约写法*/}
				{/* <input value={this.props.text} onChange={(e)=> this.props.setTodoText(e.target.value) }/> */}
				{/* <button onClick={()=> this.props.addTodo(this.props.text)}>Add</button> */}
				<input value={this.props.text} onChange={this.handleChange }/>
				<button onClick={this.handleClick}>Add</button>
			</div>
		);
	}

	handleChange = (e) => {
		this.props.setTodoText(e.target.value)
	}

	handleClick = () => {
		this.props.addTodo(this.props.text)
	}
}

export default AddTodo;
```
可以看到，我们注释当中给了一种比较简约的写法，但是我们还是推荐非注释的写法，这样`UI`层面上的代码就比较简单，不要将事件处理的函数都写在`render`函数当中的`UI`代码当中。

```javascript
// src/components/Footer.js
import React, { Component } from 'react';

class Footer extends Component {
	render() {
		// 这种写法是给this.props.setFilter起了个别名setVisibilityFilter，代码中可以使用别名
		// const { filter, setFilter: setVisibilityFilter } = this.props
		const { filter, setFilter } = this.props

		return (
			<div>
				<span>show:</span>
				<button disabled={filter === "all"} onClick={()=> {setFilter("all")}}>All</button>
				<button disabled={filter === "active"} onClick={()=> {setFilter("active")}}>Active</button>
				<button disabled={filter === "completed"} onClick={()=> {setFilter("completed")}}>Completed</button>
			</div>
		);
	}
}
export default Footer;
```
因为我们之前写的方法是`setVisibilityFilter`，但是我们在`FooterContainer`中传来的是`setFilter`，所以你可以像上面注释中给`this.props.setFilter`起了个别名`setVisibilityFilter`，代码中可以使用`setVisibilityFilter`。也可以像我上面非注释的代码一样，统统改为和`FooterContainer`传来的`setFilter`，比较好理解一点

## 使用总结
我们使用了`react-redux`后将组件分为了容器性组件和展示型组件
+ <font color=#1E90FF>展示型组件负责UI的展示，它不关心数据从哪里来，也不关心数据怎么修改</font>
+ <font color=#1E90FF>而容器性组件关心数据从何而来以及怎么修改数据</font>

整个我们这个`TodoList`使用`Redux`、`React`、`react-redux`的流程如下：

<img :src="$withBase('/react_redux_jiagou_react_redux.png')" alt="react-redux流程图">

但是我们还有两个特别重要点：

<font color=#DD1144>**① 我们应该尽量在较低级别的组件中使用react-redux去连接redux**</font>

这个就是我们之前说的如果在父组件`App.js`当中链接了`redux`，那么`App`就要将从`redux`当中拿到的所有数据以`props`的方式向下传递，这就有性能的问题，如果不使用`shouldupdateprops`这种生命周期函数来优化相关的所有子组件，那么就会有重复渲染的问题。<font color=#1E90FF>所以我们尽量在较低级别的组件中使用react-redux去连接redux，保证最小程度state的修改导致最小数量的组件渲染</font>

<font color=#1E90FF>**② 容器性组件和展示型组件的合并**</font>

对于一些不需要复用的组件，我们是可以将展示型组件和容器性组件进行合并的，后续我们会展示这样的一些信息。