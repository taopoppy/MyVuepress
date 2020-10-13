# React架构设计高级思想

## Immutable.js

### 1. Immutable的常规使用
<font color=#DD1144>Immutable.js是用来操作不可变对象的js库</font>

一般当我们在`reducer`当中根据`action.type`的不同要返回新的`state`的时候，我们通常会使用`Object.assign`或者`ES6`的扩展语法，这些方法在处理层级比较复杂的`state`对象的时候，效率是比较低下的，要对每一层级的属性进行递归和拷贝，<font color=#1E90FF>而Immutable.js内部做了很多的优化，简化的操作并且提高了效率</font>

`Immutable`中最常用的就是`Map`和`List`，下面是官方的示例
```javascript
const { Map, List } = require('immutable');
const map1 = Map({ a: 1, b: 2, c: 3 });
const map2 = map1.set('b', 50);
map1.get('b') + " vs. " + map2.get('b'); // 2 vs. 50

const {  } = require('immutable');
const list1 = List([ 1, 2 ]);
const list2 = list1.push(3, 4, 5);
const list3 = list2.unshift(0);
const list4 = list1.concat(list2, list3);
assert.equal(list1.size, 2);
assert.equal(list2.size, 5);
assert.equal(list3.size, 6);
assert.equal(list4.size, 13);
assert.equal(list4.get(0), 1);
```

我们现在就来更改我们之前书写的`reducer`：
```javascript
// src/reducer/todos.js
import { ADD_TODO,TOGGLE_TODO,FETTH_TODOS_FAILURE,FETTH_TODOS_SUCCESS,FETTH_TODOS_REQUEST } from '../actions/actionTypes'
import Immutable from 'immutable'

const initialState = {
	isFetching: false,
	error: null,
	data: []
}

const reducer = (state = Immutable.fromJS(initialState), action) => {
	switch (action.type) {
		case FETTH_TODOS_REQUEST:
			// 旧式的写法
			// return { ...state, isFetching:true }
			// 新式的写法
			return state.set("isFetching", true)
		case FETTH_TODOS_SUCCESS:
			// 旧式的写法
			// return { ...state, isFetching: false, data: action.data }
			// 新式的写法
			return state.merge({
				isFetching: false,
				data: Immutable.fromJS(action.data) // 因为action.data是一个数组，不是Immutable数据类型的对象，需要先转换成为不可变对象
			})
		case FETTH_TODOS_FAILURE:
			// 旧式的写法
			// return {...state, isFetching: false, error: action.error}
			// 新式的写法
			return state.merge({
				isFetching: false,
				error: action.error  // action.error属于字符串，字符串还有布尔值等本身就是不可变对象
			})
		default:
			// 旧式的写法
			// return { ...state, data: todos(state.data, action)}
			// 新式的写法
			const data = state.get("data")
			return state.set("data",todos(data, action))
	}
}

const todos = (state = Immutable.fromJS([]), action) => {
	switch(action.type) {
		case ADD_TODO:
			// 旧式的写法
			// return [...state, { id: action.id, text: action.text, completed: false }]
			// 新式的写法
			const newTodo = Immutable.fromJS({
				id: action.id,
				text: action.text,
				completed: false
			})
			return state.push(newTodo)
		case TOGGLE_TODO:
			// 旧式的写法
			// return state.map(todo => {
			// 	return todo.id === action.id ? {...todo, completed: !todo.completed } : todo
			// })
			// 新式的写法
			return state.map(todo => { // state是不可变对象，其遍历的每一项也是不可变对象
				return todo.get("id") === action.id ? todo.set("completed",!todo.get("completed")):todo
			})
		default:
			return state
	}
}

export default reducer
```
而在`src/reducers/filter.js`和`src/reducers/text`当中`state`是字符串类型，本身就是不可变对象类型，所以不需要做改变。而修改完所有的`reducer`的子模块，我们每个`reducer`的子模块返回的都是不可变类型的对象，或者说`Immutable`类型的对象，那么`redux`当中的`combineReducers`方法就不起作用了，我们需要使用第三方包<font color=#9400D3>redux-immutable</font>当中的`combineReducers`去合并：
```javascript
import { combineReducers } from 'redux-immutable' // 使用redux-immutable中的combineReducers

export default combineReducers({ todos, filter, text })
```

那么修改完整个`reducer`之后，我们`store`当中的状态都变成了不可变对象，那么我们在`selectors`当中按照js对象的方式取数据的方式也就不能用了，我们要去顺便改造`selectors`:
```javascript
// 旧式的写法
// src/selectors/index.js
// export const getText = (state) => state.text
// export const getFilter = (state) => state.filter

// export const getVisibleTodos = ( state ) => {
// 	const { filter, todos: { data } } = state
// 	switch (filter) {
// 		case "all":
// 			return data
// 		case "completed":
// 			return data.filter(t => t.completed)
// 		case "active":
// 			return data.filter(t => !t.completed)
// 		default:
// 			return new Error("Unknown filter", filter)
// 	}
// }

// 新式的写法
export const getText = (state) => state.get("text")
export const getFilter = (state) => state.get("filter")

export const getVisibleTodos = ( state ) => {
	const data = state.getIn(["todos","data"]) // 因为data并不在state的第一层级，所以要先找到state.todos,在找到state.todos.data
	const filter = state.get("filter")
	switch (filter) {
		case "all":
			return data
		case "completed":
			return data.filter(t => t.get("completed"))
		case "active":
			return data.filter(t => !t.get("completed"))
		default:
			return new Error("Unknown filter", filter)
	}
}
```
由此呢，通过`selectors`返回的也都`Immutable`类型的`state`，这种类型的对象也是无法在`react`的容器型组件使用的，我们需要使用`Immutable`类型对象的`toJS()`方法转换成普通的`js`对象，这样UI组件才能正确显示
```javascript
// src/containers/TodoListContainer.js
const mapStateToProps = (state) => ({
	todos: getVisibleTodos(state).toJS() // 使用toJS转换
})
```

### 2. Immutable的优化
虽然我们在前面已经完成的介绍了`Immutable`的时候，也对我们的`TodoList`项目进行了修改，但我们会发现一个比较严重的问题，<font color=#1E90FF>当我们在输入框当中去输入东西的时候，我们会发现每次的输入都会导致Todolist组件的重新渲染</font>

这个我们要简单分析一下流程：<font color=#DD1144>我们修改了输入框中的内容，每次的修改都会去派发新的action然后修改store当中的数据，当store当中数据被修改之后，是先经过react-redux传递过来，进入到每个容器性组件，也就是说store变化会引起所有容器性组件的mapStateToProps的重新执行，一旦发现UI组件需要的props有发生改变变成了新的对象，就会去重新渲染连接的UI组件</font>

所以我们之前的`TodoListContainer`中的写法是这样：
```javascript
// src/containers/TodoListContainer.js
const mapStateToProps = (state) => ({
	todos: getVisibleTodos(state).toJS()
})
```
因为`toJS`就是将`Immutable`类型的数据转换成普通`JS`类型数据的方法，所以它每次重新执行都返回的是新的`JS`对象，即使对象的内容没有发生变化，但是实际上已经是一个新的引用地址，所以`react-redux`认为`TodoListContainer`容器型组件中的`mapStateToProps`中的状态已经发生了改变，就会重新渲染`TodoList`UI组件。

<font color=#9400D3>所以你会发现在容器型组件和UI展示型组件当中去完成Immutable类型到JS类型数据的转换都不是好的选择，前者就会发生重复渲染的问题，后者会发生UI组件的侵入问题，最好的方法就是在一个高阶组件HOC当中完成Immutable类型到JS类型数据的转换</font>

在书写高阶组件之前，我们来看一下`Immutable`数据类型下的`data`的结构：

<img :src="$withBase('/react_redux_jiagou_immutable.png')" alt="">

然后我们来写一个高阶组件`toJS`：
```javascript
// src/HOSs/toJS.js
import React from "react";
import { Iterable } from "immutable";

// 下面那种写法相当于
// export const toJS = (WrappedComponent) => {
// 	return (wrappedComponentProps) => {
// 	}
// }
export const toJS = WrappedComponent => wrappedComponentProps => {
  const KEY = 0;
  const VALUE = 1;
  const propsJS = Object.entries(wrappedComponentProps).reduce(
    (newProps, wrappedComponentProp) => {
      newProps[wrappedComponentProp[KEY]] = Iterable.isIterable(
        wrappedComponentProp[VALUE]
      )
        ? wrappedComponentProp[VALUE].toJS()
        : wrappedComponentProp[VALUE];
      return newProps;
    },
    {}
  );
  return <WrappedComponent {...propsJS} />;
};
```
然后我们去修改一下`TodoListContainer`:
```javascript
// src/containers/TodoListContainer.js
import { toJS } from '../HOCs/toJS' // 1. 引入高阶组件

const mapStateToProps = (state) => ({
	// todos: getVisibleTodos(state).toJS()
	todos: getVisibleTodos(state)     //2. 依旧传入Immutable类型的数据
})
export default connect(mapStateToProps, mapDispatchProps)(toJS(TodoList)) //3. 在高阶组件内部将todos从immutable类型转化成为普通的js类型
```
通过高阶组件的使用，我们就既正常引入了`Immutable.js`，也同时防止了它对UI组件的侵入，<font color=#DD1144>但是你会发现使用了这个库，它对项目的整体侵入性很强，我们需要改的地方很多，如果你的项目不是很大，且store当中的数据层级不是很多，结构不复杂，不推荐使用的，我们一定要根据需求去搭建架构，去决定是否使用某些工具</font>

## Reselect
<font color=#DD1144>Reselect的作用是减少重复性的计算</font>

因为我们之前写的`selectors`代码是这样：
```javascript
// src/selectors/index.js
export const getText = (state) => state.text
export const getFilter = (state) => state.filter

export const getVisibleTodos = ( state ) => {
	const { filter, todos: { data } } = state
	switch (filter) {
		case "all":
			return data
		case "completed":
			return data.filter(t => t.completed)
		case "active":
			return data.filter(t => !t.completed)
		default:
			return new Error("Unknown filter", filter)
	}
}
```
而这些`selectors`函数我们都在容器型组件的`mapStateToProps`当中使用了，<font color=#1E90FF>也就是说当我们store当中的state发生了变化，每个容器型组件的mapStateToProps都要重新执行，产生的结果就是上述的这些selectors函数也要重复执行，也就导致了重复计算</font>

所以尤其当`selectors`函数的逻辑很复杂的时候，重复的计算量就变的很大，比如我们修改`text`，就会导致`getVisibleTodos`重新执行来计算`todos`，这个就没有必要。为了节约这个开销，我们可以使用`Reselect`避免这个问题，<font color=#1E90FF>使用Reselect创建的selectors函数，只要使用到的state没有发生变化，这个selectors函数就不会去重新计算，比如getVisibleTodos函数使用到了state.filter和state.todos，修改state.text并不会影响state.filter和state.todos，所以getVisibleTodos函数也就不会重复执行</font>

我们看一下官网的两种效果相同的写法：
```javascript
const mySelector = createSelector(
  state => state.values.value1, // 获取value1的函数
	state => state.values.value2, // 获取value2的函数
	// 最后一个函数的参数是前面函数获取的结果
  (value1, value2) => value1 + value2
)

// You can also pass an array of selectors
const totalSelector = createSelector(
  [
    state => state.values.value1,
    state => state.values.value2
  ],
  (value1, value2) => value1 + value2
)
```

当然也并不是我们写的所有`selectors`函数都要使用`Reselect`去重写，像`text`和`filter`这种是直接从`state`层级当中拿到的，没有任何计算，就不需要重写。所以我们来改造一下`selectors`：
```javascript
// src/selectors/index.js
import { createSelector } from 'reselect'

export const getText = (state) => state.text
export const getFilter = (state) => state.filter
export const getTodos = (state) => state.todos.data

export const getVisibleTodos = createSelector(
	[getTodos, getFilter],
	(todos, filter) => {
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
)
```
通过这样的改造，我们去修改`text`是不会造成`getVisibleTodos`的重新计算的，你可以通过在`getVisibleTodos`函数当中打印日志或者在浏览器当中打断点来测试一下。<font color=#DD1144>更关键的是像immutable和reselect都并不是redux必须需要的，都是在redux的性能感觉明显有问题的才会用到，像我们这个Demo实际压根都用不到这些，在复杂的项目当中也要根据需求去具体使用和集成</font>

## 结构流程图
经过整个`TodoList`的架构思路整理，我们可以总结出下面这幅图:

<img :src="$withBase('/react_redux_jiagou_finish.png')" alt="">

另外，我们整个`React`架构设计理论相关的知识点，我们也使用图来表述一下：（友情提示，相关知识点会不断补充，所以最新的图可以到[mindmaster官网](https://mm.edrawsoft.cn/store)搜索`React架构设计理论概图`，第一个结果就是最新的图）

<img :src="$withBase('/react_redux_jiagou_zongjie.png')" alt="">