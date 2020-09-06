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

所以我们接下来创建容器性组件。

## 容器性组件
### 1. TodoListContainer

我们需要像下面这样来创建`TodoList`的容器性组件，创建`src/containers/TodoListContainer.js`:
```javascript
// src/containers/TodoListContainer.js
import { connect } from 'redux'
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
import { connect } from 'redux'
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