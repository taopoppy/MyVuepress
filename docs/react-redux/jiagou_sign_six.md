# React架构设计进阶思想

## selector函数
<font color=#DD1144>select函数也叫作选择器函数，它的作用就是从Redux的State当中读取部分数据，然后给Components或者Container使用</font>

这里就要说`selector`函数的具体作用是啥，<font color=#1E90FF>它的作用就是将Containers和Redux彻底解耦</font>，那你会比较疑惑，在之前的讲解当中，不是已经解耦了么，使用`React-Redux`已经做到了代码层面上的解耦，`selector`又解耦什么，我们来举个例子：

如果有多个容器型组件都要用`store`当中的同一个`state`，在不同的容器型组件当中都会存在这样一段代码：
```javascript
const mapStateToProps = state = ({
	text: state.text
})
```
现在因为`text`作为`state`整个结构当中的一级状态，可以这样拿，如果随着项目的更改，`state`当中的结构发生了变化，`text`不再是一级状态，而是作为二级状态保存在`app`当中，那么所有使用到`state.text`的容器型组件全部都要修改，这就是耦合的状态。

现在我们创建一个`src/selectors/index.js`：
```javascript
// src/selectors/index.js
export const getText = (state) => state.text
```
然后在有使用到`state.text`的容器型组件当中这样修改：
```javascript
// src/containers/AddTodoContainers.js
import { getText } from '../selectors/index'

const mapStateToProps = (state) => ({
	text: getText(state)
})
```
<font color=#DD1144>这样我们就实现了通过selectors函数来解耦的效果，有四点好处</font>

+ <font color=#9400D3>使用selectors这样接口的方式，当Redux当中的数据结构发生变化，只需要去修改selectors函数，而不用到处修改使用text的容器型组件</font>

+ <font color=#9400D3>这样的selectors是作为不同层级之间的接口存在，层级之间使用接口发生交互和通讯才是真正的解耦，所以现在你可以有点真正理解，解耦是某个层级内部的变化的影响范围最多到和其他层级的接口，而不能延伸到别的层级</font>，就像上面的`state.text`假如变成了`state.app.text`，我们只需修改到`selector`这个接口，而不需要修改到容器型组件这个UI层级。

+ <font color=#9400D3>不同层级之间封闭性更强，按照之前的写法state.text，说明UI层级是知道状态层级内部的数据结构，这个就既不安全，也不方便重构</font>

+ <font color=#9400D3>所有需要通过计算和过滤的state，这些过程都可以全部拿到selectors选择器函数当中去做</font>

我们根据上面这四点好处来改造之前的`TodoList`：
```javascript
// src/selectors/index.js
export const getText = (state) => state.text
export const getFilter = (state) => state.filter

export const getVisibleTodos = ( state ) => {
	const { filter, todos: { data } } = state // 从state解构出filter和todos，然后再从todos解构出data
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
```javascript
// src/containers/AddTodoContainers.js
import { getText } from '../selectors/index'

const mapStateToProps = (state) => ({
	text: getText(state)
})
```
```javascript
// src/containers/FooterContainer.js
import { getFilter } from '../selectors/index'

const mapStateToProps = (state) => ({
	filter: getFilter(state)
})
```
```javascript
// src/containers/TodoListContainer.js
import { getVisibleTodos } from '../selectors/index'

const mapStateToProps = (state) => ({
	todos: getVisibleTodos(state)
})
```
所以，现在我们按照之前的流程图又要新增一个`redux`和`react`两个不同层级之间的接口`selectors`

<img :src="$withBase('/react_redux_jiagou_selectors.png')" alt="selectors">

## 前端管理状态
现在我们来聊聊前端管理状态，我们从<font color=#DD1144>前端应用的复杂性</font>和<font color=#DD1144>软件架构</font>两个方面去解释，<font color=#1E90FF>为什么要使用状态管理</font>

<font color=#1E90FF>**① 前端应用的复杂性**</font>

<font color=#DD1144>传统的前端大多只负责展示，没有太多的逻辑处理，多半以调用API的方式负责呈现数据，随着业务逻辑的复杂，前端不能仅仅通过使用API的方式来完成逻辑的处理，需要加入更多的状态管理来分担对数据的处理和封装</font>


<font color=#1E90FF>**② 软件管理**</font>

<img :src="$withBase('/react_redux_jiagou_jiagou.png')" alt="">

+ 在前后端一体的项目当中，实际不存在纯前端的概念，前端页面都是通过后端使用模板渲染出来的
+ 在前后端分离的项目中，后端需要根据前端业务提供高度定制的`API`，前端只需要根据不同的`API`完成逻辑的处理。
+ 随着业务的复杂，后端渐渐演化成为微服务的架构，不同的微服务共同提供能力给前端，但是因为微服务提供的接口太细颗粒度，属于具体某个领域，这些服务无法直接给前端使用，这个时候就有了中台层，或者说`API`网关层，对微服务提供的接口进行聚合，再次包装提供给前端。但是在整个软件领域，前端的变化太快，迭代速度受限于中台层。为了解决这种问题，前端状态管理层就出现了，说白了是基于中台层和整个软件架构延伸出的一层。

## Middleware
我们都知道`Redux`的中间件的本质就是：<font color=#DD1144>提高store dispatch的能力，原本只能派发对象action的dispatch方法经过redux-thunk的增强后可以派发一个函数类型的action</font>

<img :src="$withBase('/react_redux_giagou_zhongjianjian.png')" alt="中间件的本质">

<font color=#1E90FF>Redux是可以使用多个中间件的，中间件以串联的形式进行连接，而每个中间件内部最后都需要处理action，并且需要使用下一个中间件的next函数来传递action，所以如此说来dispatch和next都能传递action，但是前者作为增强版的dispatch，会将action沿着串联的中间件一个个的处理，而next会将action从当前中间件向下传递</font>


`Redux`的中间件本质是个函数，它的签名是上图中的形式：<font color=#1E90FF>接收一个对象参数，然后返回一个新的函数，新的函数又会接收next作为参数，然后再返回另外一个函数，最后这个函数接收一个action为参数</font>

我们现在来书写一个简单的中间件，如果下面的代码你看不懂，你也可以记住先记住它的写法，然后我们后面有机会来手写一个`Redux`来帮助你彻底理解`Redux`和`Redux`的中间件，创建`src/middlewares/logger.js`
```javascript
// 打印派发的action和下一次的state
// next方法实际就是下一个中间件的dispatch方法
const logger = ({getState, dispatch}) => next => action => {
	console.group(action.type)
	console.log('dispatching:', action)
	const result = next(action)
	console.log('next state',getState())
	console.groupEnd()
	return result
}

export default logger;
```
然后我们集成一下我们自定义的中间件：
```javascript
// src/store.js
import loggerMiddleware from './middlewares/logger' // 1. 引入

// 添加在applyMiddleware当中
const store = createStore(rootReducer,applyMiddleware(thunkMiddleware,loggerMiddleware))

export default store
```
然后我们启动程序，在每一次有`action`派发出去，都会在浏览器的打印台上看到打印的`action`的内容：

<img :src="$withBase('/react_redux_jiagou_logger.png')" alt="">

## store-enhancer
<font color=#DD1144>store-enhancer是用来增强redux store的功能的</font>

在`createStore`当中以第三个参数出现
```javascript
crateStore(reducer, [proloadedState],[enhancer])
```
一般`store Enhancer`的结构是这样的：
```javascript
function enhancerCreator() {
	return createStore => (..args) => {
		// do something based old store
		// return a new enhanced store
	}
}
```

所以如果我们自己书写一个`enhancer`，我们可以创建`src/enhancers/logger.js`:
```javascript
// src/enhancers/index.js
const logger = createStore => (...args) => {
	const store = createStore(...args)
	const dispatch = (action) => {
		console.group(action.type)
		console.log('dispatching:', action)
		const result = store.dispatch(action)
		console.log('next state',store.getState())
		console.groupEnd()
		return result
	}
	return {...store, dispatch}

}
export default logger
```
然后做一下集成，<font color=#1E90FF>使用compose将多个enhancer进行组合</font>：
```javascript
// src/store.js
import loggerEnhancer from './enhancers/logger'

const store = createStore(rootReducer,compose(applyMiddleware(thunkMiddleware),loggerEnhancer));
```
然后你会看到和上面一模一样的打印效果，<font color=#1E90FF>那么Store Enhancer和Middleware有什么关系呢？</font>

<font color=#DD1144>实际上middleware是store enhancer的一种，因为applyMiddleware的源码和enhancer的写法是一样的</font>：

```javascript
function applyMiddleware(...middlewares) {
	return createStore => (..args) => {
		// 省略
		return {...store,dispatch}
	}
}
```
所以你也可以看到在上面使用`compose`将多个`enhancer`组合的时候，`applyMiddleware`和`loggerEnhancer`是并列的，所以它俩属于一个类型，都是`enhancer`，所以也证明了<font color=#DD1144>redux的中间件只是一种特殊的redux增强器</font>

<font color=#9400D3>但是在日常生活中我们更推荐使用中间件，因为中间件虽然比较低阶，但是它约束了我们的行为，而增强器enhancer虽然更加灵活，但是破坏redux底层结构的风险更大，所以如果你对redux整体的结构和逻辑都不是太熟悉，尽量就别用</font>


**参考资料**
+ [简单实现Redux](http://www.cxymsg.com/guide/redux.html#%E7%AE%80%E5%8D%95%E5%AE%9E%E7%8E%B0redux)
+ [Redux中间件原理详解](https://segmentfault.com/a/1190000016668365)
+ [学习redux源码整体架构，深入理解redux及其中间件原理](https://segmentfault.com/a/1190000022930478?utm_source=sf-related)