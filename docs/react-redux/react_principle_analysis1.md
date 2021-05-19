# 基础思想

## React架构概述

研究`React`的内部运行机制，我们到底在研究什么？我们实际在研究： <font color=#DD1144>React如何将组件映射屏幕，以及组件中是state和prop发生变化之后React如何将这些变化更新到屏幕上</font>

研究的问题涉及到两个方面的认知：
+ <font color=#9400D3>React首次渲染</font>：<font color=#1E90FF>通过ReactDom.render()开始首次渲染流程，开始做Fiber架构的基建工作，构建fiberRoot对象</font>
+ <font color=#9400D3>React更新渲染</font>：<font color=#1E90FF>通过setState({...})开始更新渲染流程，Fiber架构实体已经存在</font>

<font color=#1E90FF>应用程序首次渲染时 React 会做一些基建工作，比如 将组件转化为元素，构建更新队列，构建 workInProgress 对象树以及构建 Effect list（副作用列表） 等。这些基建工作是构建 React Fiber 架构的关键环节。而在应用程序更新渲染时，React Fiber 架构的实体— <font color=#DD1144>fiberRoot对象</font>已经存在于内存中，此时，React 更加关心的是 计算出 Fiber 架构中各个结点的前后变化，并将【变化部分】更新到屏幕。</font>

<img :src="$withBase('/react_yuanli_1')" alt="">

<font color=#1E90FF>**① React应用程序首次渲染时的关键环节解析**</font>

+ 构建`fiberRoot`对象（`FiberRootNode`构造函数的实例）,`fiberRoot`对象是整个`Fiber`架构的根结点对象。
+ 将更新加入到更新队列，此时的更新内容为应用程序的根组件。
+ 应用程序进入`render`阶段，在该阶段`React`的主要工作是构建 `workInProgress`树（一颗 Fiber 树）。
+ 构建`workInProgress`树的过程中会做一些重要的工作，如为结点标记`effectTag`，对结点进行`diff`处理，收集`Effect List`（副作用列表），调用生命周期函数等。
+ 当收集好`Effect List`后则进入`commit`阶段，在该阶段`React`主要工作就是将`Effect List`更新到屏幕，然后渲染结束。

<font color=#1E90FF>**② React 应用程序更新渲染时的关键环节解析**</font>

+ 相对于应用程序的首次渲染，更新渲染流程的主要区别有，不再重新构建`fiberRoot`对象，因为该对象已经存在于内存中。
+ 此时的更新内容一般为组件内部发生变化的`state`和`props`。
+ 在进入`render`阶段前要进行任务调度，申请过的更新执行权后才能进行后续渲染工作。
+ 此时构建`workInProgress`树时也会尽可能的复用上一次创建的`Fiber`结点，同时对需要更新的结点标记对应的`effectTag`。
+ 在`commit`阶段得到的`Effect List`是被标记了`effectTag`的`Fiber`结点集合（一个链表），其一般是`workInProgress`树的子集。

<img :src="$withBase('/react_yuanli_2.png')" alt="">

## ReactDOM.render
`ReactDOM.render`函数是整个`React`应用程序首次渲染的入口函数，我们最重要的是理解`ReactDOM.render`函数的三个参数，其源码和基本用法如下：
```javascript
// 源码位置：packages/react-dom/src/client/ReactDOM.js
const ReactDOM = {
  findDOMNode: function(...) { ... },
  hydrate: function(...) { ... },
  render: function (element, container, callback) {
    // 会先检验container是否有效，无效则停止执行且抛出错误
    // ...
    return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
  },
  unstable_renderSubtreeIntoContainer: function(...) {},
  unmountComponentAtNode: function(...) {}
  // ...
}
```
```javascript
mport React from 'react';
import ReactDOM from 'react-dom';
import UpdateCounter from './pages/UpdateCounter';

ReactDOM.render(<UpdateCounter name="Taylor" />, document.getElementById('root'));
```
可以看到`ReactDOM.render`函数的第一个参数是一个<font color=#DD1144>React元素</font>，第二个参数是<font color=#DD1144>DOM元素</font>，<font color=#DD1144>ReactDOM.render函数的返回值是当前应用程序根组件的实例</font>

## 组件和元素
这里我们要分清楚`React`元素和`React`组件的概念区别：
+ <font color=#9400D3>React组件</font>：`React`组件是一个类，本质是一个函数
+ <font color=#9400D3>React元素</font>：本质是一个标签，`React`组件 + `JSX`语法 = `React`元素（或者也叫作JSX对象，本质是一个用来描述DOM结构的JS对象）

那实际上，开发者多半时间都会去书写组件，也就是类或者函数，那么为什么渲染的时候会以`React`元素的形式传递到渲染函数当中去呢，此时我们有必要对组件和元素进行深入了解：

+ <font color=#9400D3>组件</font>：可以是一个函数或一个类。
+ <font color=#9400D3>生命周期函数</font>：在应用程序运行的特定阶段执行对应的函数。
+ <font color=#9400D3>元素</font>：一个普通`JS`对象，由组件转化而来，在运行时再转化为`React fiber`对象。
+ <font color=#9400D3>组件实例</font>：类组件实例化后的对象，主要作用是返回组件元素、响应事件等。
+ <font color=#9400D3>更新（update）</font>：一个`JS`对象，包含过期时间（expirationTime）和更新内容（payload）等。
+ <font color=#9400D3>更新队列（updateQueue）</font>：一个`JS`对象，是更新（update）的集合，链表结构。
+ <font color=#9400D3>React Fiber</font>：`React v16`版本开始引入的架构。

这些重要概念之间的关系如下：
<img :src="$withBase('/react_yuanli_3.png')" alt="">

`React`通过组件实例调用组件的`render`函数获取到该组件内部的元素。在`render`阶段`React`将元素逐个转换为对应类型的`Fiber`结点（最终形成`workInProgress`树）。


## 组件的设计思想
`React`组件有这么三个类型：<font color=#1E90FF>类组件</font>、<font color=#1E90FF>函数组件</font>、<font color=#1E90FF>高阶组件</font>，其中函数组件作为编程的大趋势，实际上相对于类组件，有这么几个特点：
+ 函数组件不会被实例化，整体渲染性能得到提升
+ 函数组件不能访问`this`对象
+ 函数组件无法继承`React.Component`上的属性，因此无法访问生命周期的方法；
+ 无状态函数组件只能访问输入的`props`

高阶组件的本质就是：<font color=#DD1144>一个包装了另外一个 React 组件的 React 组件，其本质就是函数，因为Javascript支持高阶函数，所以高阶组件就是高阶函数的上层拓展</font>

组件的设计思想就两个重点：
+ <font color=#DD1144>数据驱动更新</font>：当一个组件内部的数据发生变化时，组件中返回的 UI 也随之变化并更新到屏幕
+ <font color=#DD1144>单向数据流</font>：数据和UI的关系只能是数据改变UI，不能UI改变数据

那么数据驱动，这个数据具体指的是什么？就是<font color=#1E90FF>props</font>和<font color=#1E90FF>state</font>，`React`使用`state`为组件维护了自己的内部状态，使用`props`为组件维护了自己的外部状态。`state`和`props`的变化意味着组件的`UI`需要更新，这里的`UI`就是`JSX`对象，所以组件的设计思想可以使用一句话来说明：<font color=#DD1144>组件的state或者props发生变化会导致render函数重新执行，导致返回新的JSX对象</font>

## 生命周期
关于生命周期，实际上在几个版本当中都有个大幅度的变化，我们首先看看`react v16.3`之前的生命周期：

<img :src="$withBase('/react_yuanli_4.png')" alt="">

分别以组件的首次渲染和更新渲染流程为主线描绘其生命周期函数的调用时机与方式，调用组件的生命周期函数前必须取得组件实例。首次渲染时以`instance = new component(...)`的方式创建并获得组件实例。更新渲染时以`instance = workInProgress.stateNode`的方式获得组件实例。

可以在`16.3`之后有了新的变化:
<img :src="$withBase('/react_yuanli_5.png')" alt="">

从`React v16.3`版本开始，React 建议使用`getDerivedStateFromProps`和`getSnapshotBeforeUpdate`两个生命周期函数替代`componentWillMount`，`componentWillReceiveProps`和`componentWillUpdate`三个生命周期函数。这里需要注意的是 <font color=#1E90FF>新增的两个生命周期函数和原有的三个生命周期函数必须分开使用，不能混合使用</font>。所以，这就是新版本的生命周期的变化，在官网的图也应该迎刃而解：

<img :src="$withBase('/react_yuanli_6.png')" alt="">

接下来，我们就说说为什么产生了新的生命周期：

<font color=#1E90FF>**① componentWillMount函数的问题**</font>

函数本身没有啥问题，只是有些开发者觉得首次渲染页面的时候没有获取到数据，导致白屏，所以会把异步请求代码写在这里，但是实际上，<font color=#DD1144>componentWillMount执行的时候第一次渲染已经开始了，数据还是没有没有请求过来，所以无论从哪里请求，都无法避免首次渲染没有异步数据的问题，除非你写在constructor里面</font>

<font color=#1E90FF>**② componentWillReceiveProps**</font>

如果组件自身的某个`state`跟其`props`密切相关（指`state`值可能受到`props`的影响 ）的话，一直都没有一种很优雅的处理方式去更新`state`，一般的做法是在 `componentWillReceiveProps`函数中判断前后两个`props`是否相同，如果不同再将新的`props`更新到相应的`state`上去
```javascript
componentWillReceiveProps(nextProps) {
  // 如果nextProps.a传递的是基本数据类型，可以直接进行相等判断
  if (nextProps.isLogin !== this.props.isLogin) {
    this.setState({ 
      isLogin: nextProps.isLogin,   
    });
  }
  if (nextProps.isLogin) {
    this.handleClose();
  }
}
// 如果nextProps.a传递的是一个引用类型，一般是先将它们转换成字符串，然后进行相等判断
componentWillReceiveProps(nextProps) {
  if (JSON.stringify(nextProps.a) !== JSON.stringify(this.props.a)) {
    this.setState({ 
      ...  
    });
  }
}
```
<font color=#DD1144>在componentWillReceiveProps函数将props映射为对应为state一方面会破坏state数据的单一数据源，导致组件状态变得不可预测，另一方面也会增加组件的重绘次数</font>

<font color=#1E90FF>**③ componentWillUpdate**</font>

与`componentWillReceiveProps`类似，许多开发者也会在`componentWillUpdate`中根据`props`的变化去触发一些回调。但不论是`componentWillReceiveProps`还是`componentWillUpdate`，都有可能在一次更新中被调用多次，也就是说写在这里的回调函数也有可能会被调用多次，这显然是不可取的。


<font color=#1E90FF>**④ getDerivedStateFromProps**</font>

`React`生命周期函数的命名一直都非常语义化，`getDerivedStateFromProps`的意思就是从`props`中获取`state`，换句话说就是将传入的`props`映射（赋值）到`state`中。`getDerivedStateFromProps`函数的使用方式如下。

```javascript
// 使用getDerivedStateFromProps替换componentWillReceiveProps
static getDerivedStateFromProps(nextProps, prevState) {
  if (nextProps.isLogin !== prevState.isLogin) {
    // 注意这里的写法
    return {
      isLogin: nextProps.isLogin,
    };
  }
  return null;
}

componentDidUpdate(prevProps, prevState) {
  if (!prevState.isLogin && this.props.isLogin) {
    // 这里this.props已经是最新的props，prevState是上一版本的state
    this.handleClose();
  }
}
```

通常来讲，在`componentWillReceiveProps`中我们一般会做以下两件事。一是根据`props`来更新`state`，二是触发一些回调，如动画或页面跳转等。在`React v16.3`版本之前，这两件事都需要在`componentWillReceiveProps`中去做。而在新版本中，官方将更新`state`与触发回调分配到了`getDerivedStateFromProps`与`componentDidUpdate`中，使得组件整体的更新逻辑更为清晰。在`getDerivedStateFromProps`中禁止了组件访问`this.props`，强制让开发者去比较`nextProps`与`prevState`中的值，以确保程序在调用 `getDerivedStateFromProps`这个生命周期函数时是根据当前的`props`来更新组件的 `state`，而不是去做其他一些让组件自身状态变得更加不可预测的事情。

<font color=#1E90FF>**⑤ getSnapshotBeforeUpdate**</font>

`getSnapshotBeforeUpdate`函数在（DOM）更新之前被调用（获取一个快照），在该函数中可以访问更新前`DOM`的属性，其返回值将作为第三个参数传递给componentDidUpdate函数，这就保证了在两个函数中可以访问同一个值
```javascript
// 针对上面第3个问题使用getSnapshotBeforeUpdate替换componentWillUpdate
class ScrollingList extends React.Component {

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return (
      // 这里可以访问更新前的DOM元素属性
      return this.rootNode.scrollHeight
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // snapshot值是在getSnapshotBeforeUpdate函数中返回
    if (snapshot !== null) {
      const curScrollTop= this.rootNode.scrollTop;
			this.rootNode.scrollTop = curScrollTop + (this.rootNode.scrollHeight - snapshot);
    }
  }

  render() {
    return (
      <div>
        {/* ...contents... */}
      </div>
    );
  }
}
```

## 组件实例
### 1. 组件继承原理
我们首先来讲组件继承原理：首先来看两段代码：
```javascript
class UpdateCounter extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
			count: 0,
			text: '点击计数'
		};
		this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    // case1 setState入参类型为function，函数必须有返回值
    this.setState((state) => {
      return {count: state.count + 1};
    });
    
    // case2 setState入参类型为object
	this.setState({
	  count: this.state.count + 1
	});
  }
  
  render() {
    return (
    	<div className="wrap-box">
    	  <button key="1" onClick={this.handleClick}>点击计数</button>
    	  <span key="2" id="spanText" className="span-text">{this.state.count}</span>
    	</div>
    )
  }
}

```
```javascript
// 源码位置：packages/react/src/ReactBaseClasses.js
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
// 部分属性定义在原型上
Component.prototype.setState = function (partialState, callback) {
  // 执行setState时会先校验入参的类型是否正确，入参类型必须是object或function
  (function () {
    if (!(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null)) {
      {
        throw ReactError(Error('setState(...): 参数类型必须是object或者function'));
      }
    }
  })();

  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
```

<img :src="$withBase('/react_yuanli_7.png')" alt="">

上图当中的黑色线条是不需要过多解释的，这个关于函数原型的知识：
+ <font color=#1E90FF>构造函数的prototype属性指向原型对象</font>
+ <font color=#1E90FF>实例对象的_proto（[[Prototype]]）也指向原型对象</font>
+ <font color=#1E90FF>原型对象的constructor属性指向构造函数</font>

关于红色线条，特别要强调一下，因为这个是`class`继承的知识：
+ <font color=#DD1144>子类的_proto_属性表示对父类构造函数的继承，总是指向父类</font>
+ <font color=#DD1144>子类prototype属性的_proto_属性表示方法的继承，总是指向父类的prototype属性</font>

（<font color=#9400D3>简单的总结：构造函数的_proto指向父类构造函数，原型对象的_proto_指向父类原型对象</font>）

当然，`UpdateCounter`组件也并不是通过显示手写`new UpdateCounter`去实例化的，而是在源码当中通过`constructClassInstance`去帮助我们实例化的，但本质还是`new UpdateCounter`:
```javascript
// 源码位置：packages/react-reconciler/src/ReactFiberClassComponent.js
function constructClassInstance(workInProgress, ctor, props, renderExpirationTime) {
  ...
  // ctor是定义的组件类
  var instance = new ctor(props, context);
  ...
}
```

关于上面的图示，可能还有人比较迷惑，说`React`当中书写的不都是类么，怎么到图里面都变成了函数了？ <font color=#9400D3>实际上class在es6当中是一种语法糖，本质就是函数，因为class的写法更贴近面向对象，更好理解，而函数及相关的原型本身是不好理解的</font>，好比下面的两个代码本质是一模一样，你更喜欢哪种写法？
```javascript
// 函数原型的写法
function Person() {}
Person.prototype.name = "taopoppy"
Person.prototype.sex = "man"
Person.prototype.speak = function() {console.log("hello")}
let xiaoming = new Person()
console.log(xiaoming.name) // "taopoppy"
console.log(xiaoming.sex) // "man"

// class类写法
class Person {
  constructor() {
    this.name = "taopoppy"
    this.sex = "man"
  }
  speak() {
    console.log("hello")
  }
}
let xiaoming = new Person()
console.log(xiaoming.name) // "taopoppy"
console.log(xiaoming.sex) // "man"
```

### 2. 组件实例运行
现在我们要搞清楚组件实例在`React`应用程序运行时的作用，有三个小步骤，分别是：<font color=#9400D3>返回组件元素与状态</font>、<font color=#9400D3>调用生命周期函数</font>、<font color=#9400D3>setState触发更新</font>

<font color=#1E90FF>**① 返回组件元素与状态（state）**</font>

```javascript
// 源码位置：packages/react-reconciler/src/ReactFiberBeginWork.js
function finishClassComponent(current$$1, workInProgress, Component, shouldUpdate, hasContext, renderExpirationTime) {
  ...
  // instance.render()返回当前组件的元素
  var nextChildren = instance.render();
  ...
  // 开始执行协调算法，返回下一个 Fiber 结点
  reconcileChildren(current$$1, workInProgress, nextChildren, renderExpirationTime);
  ...
  // 使用组件实例值来记忆当前 Fiber 结点状态，可用于后续 diff
  workInProgress.memoizedState = instance.state;
}
```

<font color=#1E90FF>**② 调用生命周期函数**</font>

组件的生命周期函数是在组件实例上面进行调用的:
```javascript
// 源码位置：packages/react-reconciler/src/ReactFiberCommitWork.js
// 调用commit完成后的生命周期函数
function commitLifeCycles(finishedRoot, current$$1, finishedWork, committedExpirationTime) {
  // tag标识了当前Fiber节点的类型，包括FunctionComponent，ClassComponent，HostComponent等
  switch (finishedWork.tag) {
      ...
      case ClassComponent:
      	...
        instance.componentDidMount();
      	...
  }
}
// 调用组件被卸载前的生命周期函数
var callComponentWillUnmountWithTimer = function (current$$1, instance) {
  ...
  instance.componentWillUnmount();
  ...
};
```

<font color=#1E90FF>**③ setState触发更新**</font>

<font color=#1E90FF>应用程序首次渲染时会为组件实例绑定对应的更新器，当组件接收到事件触发更新时，通过组件实例上面的更新器执行更新流程</font>

```javascript
// 源码位置：packages/react-reconciler/src/ReactFiberClassComponent.js
// 应用程序首次渲染时会为组件实例绑定更新器
function adoptClassInstance(workInProgress, instance) {
  instance.updater = classComponentUpdater;
  workInProgress.stateNode = instance;
}
// 组件更新器
var classComponentUpdater = {
  enqueueSetState: function (inst, payload, callback) {
    // 创建更新对象
    var update = createUpdate(expirationTime, suspenseConfig);
    // 为更新对象赋值更新内容
    update.payload = payload;
    ...
    // 将更新对象加入更新队列
    enqueueUpdate(fiber, update);
    // 开始（更新）调度工作
    scheduleWork(fiber, expirationTime);
    ...
  }
  ...
}
```

总结：<font color=#DD1144>组件实例是 React 应用程序运行时组件被实例化后的状态，每一个组件实例都拥有自身的属性和继承于React.Component的属性。应用程序首次渲染时通过调用组件实例的instance.render()返回 React 元素，用于构建页面（UI）。当应用程序被（事件）触发更新时，组件实例调用自身的更新器（updater）进入更新渲染流程。此外，在应用程序渲染的 render 或者 commit 阶段（前后）中会通过组件实例调用对应的生命周期函数。</font>

## 元素的设计思想
关于元素的设计思想，我们之前就提过了，<font color=#1E90FF>React元素，本质就是JSX对象，JSX对象是语法糖，Babel会把JSX转义成为React.createElement()函数的调用，函数执行后返回的就是虚拟DOM，一个用来描述真实DOM结构和内容的普通JS对象</font>，下面两段代码效果相同:
```javascript
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
```
```javascript
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
```

总结：<font color=#DD1144>React用元素来描述DOM结构的优点在于它们很容易遍历，不需要解析，并且它们比实际的DOM元素轻量得多！React组件是由UI部分加逻辑部分组成，其中UI部分就是React元素，元素在render会被转换成React Fiber 对象（结点）。Fiber对象的层层嵌套形成了应用程序的Fiber树，所有更新的处理都在这颗「树」中计算。React 中组件和元素的根本区别就是：<font color=#9400D3>元素普通对象</font>，<font color=#9400D3>组件是类和函数</font>，元素是组件的一部分。</font>

## 更新队列
面试官经常问到的一个问题就是：<font color=#DD1144>在一段代码中连续使用多个setState(...)时 React 的处理方式是什么</font>

实际上，本身`setState`处理是异步的，但是如果多个`this.setState`都处于同一个循环，那就属于<font color=#9400D3>同步更新</font>，比如下面这样：
```javascript
// 同步更新
handleClick() {
  this.setState({
			count: this.state.count + 1
		});
  this.setState({
    text: '点击计数' + this.state.count
  });
}
```
如果多个`this.setState`在写法上是连续的，但是在实际执行的时候不属于同一个循环，就属于<font color=#9400D3>异步更新</font>，如下：
```javascript
// 异步更新
handleClick() {
  this.setState({
			count: this.state.count + 1
		});
  setTimeout(() => {
    this.setState({
      text: '点击计数' + this.state.count
    });
  }, 1000);
}
```
所以总结：
+ <font color=#1E90FF>多个同步setState操作，React会将它们的更新先后加入到更新队列，队列在被处理的时候将所有更新合并，合并原则是相同属性的更新取最后一次的值</font>
+ <font color=#1E90FF>而异步setState操作，也同样式先进行同步更新，后按照EventLoop原理后续处理</font>


下面我们来具体说一下如何将更新加入到更新队列的：<font color=#DD1144>要明确的是在组件首次渲染的时候，在adoptClassInstance函数当中就为组件的实例添加了更新器updater，然后this.setState触发更新的时候，就调用updater当中的enqueueSetState函数去执行更新</font>，这个就是最宏观的更新步骤和逻辑。
```javascript
// 源码位置：packages/react-reconciler/src/ReactFiberClassComponent.js
// 应用程序首次渲染时会为组件实例绑定更新器
function adoptClassInstance(workInProgress, instance) {
  instance.updater = classComponentUpdater;
  workInProgress.stateNode = instance;
}
// 组件更新器
var classComponentUpdater = {
  enqueueSetState: function (inst, payload, callback) {
    // 创建更新对象
    var update = createUpdate(expirationTime, suspenseConfig);
    // 为更新对象赋值更新内容
    update.payload = payload;
    ...
    // 将更新对象加入更新队列
    enqueueUpdate(fiber, update);
    // 开始（更新）调度工作
    scheduleWork(fiber, expirationTime);
    ...
  }
  ...
}
```

现在我们要研究一下具体`updater`当中的`enqueueSetState`函数怎么去执行更新的：<font color=#DD1144>简单的说就是使用setState触发更新后，在enqueueSetState函数当中，首先第一步为当前的更新创建了一个更新update对象，第二步通过enqueueUpdate函数将其加入到了更新队列，更新队列并非有新更新加入就会立即处理，而是第三步要等到render阶段使用processUpdateQueue函数集中处理</font>

<font color=#1E90FF>**① 创建更新对象**</font>

`React`对更新对象`update`的定义如下：
```javascript
// 源码位置：packages/react-reconciler/src/ReactUpdateQueue.js
function createUpdate(expirationTime, suspenseConfig) {
  var update = {
    // 过期时间与任务优先级相关联
    expirationTime: expirationTime,
    suspenseConfig: suspenseConfig,
		// tag用于标识更新的类型如UpdateState，ReplaceState，ForceUpdate等
    tag: UpdateState,
    // 更新内容
    payload: null,
    // 更新完成后的回调
    callback: null,
		// 下一个更新（任务）
    next: null,
    // 下一个副作用
    nextEffect: null
  };
  {
    // 优先级会根据任务体系中当前任务队列的执行情况而定
    update.priority = getCurrentPriorityLevel();
  }
  return update;
}
```
每一个更新对象都有自己的过期时间（expirationTime）、更新内容（payload），优先级（priority）以及指向下一个更新的引用（next）。其中当前更新的优先级由任务体系统一指定。

<font color=#1E90FF>**① 加入队列Queue**</font>

`React`对更新队列的定义如下：
```javascript
// 源码位置：packages/react-reconciler/src/ReactUpdateQueue.js
function createUpdateQueue(baseState) {
  var queue = {
    // 当前的state
    baseState: baseState,
    // 队列中第一个更新
    firstUpdate: null,
    // 队列中的最后一个更新
    lastUpdate: null,
    // 队列中第一个捕获类型的update
    firstCapturedUpdate: null,
    // 队列中第一个捕获类型的update
    lastCapturedUpdate: null,
    // 第一个副作用
    firstEffect: null,
    // 最后一个副作用
    lastEffect: null,
    firstCapturedEffect: null,
    lastCapturedEffect: null
  };
  return queue;
}
```
值得注意的是，更新队列的数据结构不是数组，而是一个普通对象（一个单向链表结构）。要想实现数据驱动页面更新，更新内容需要加入到更新队列，这个过程的逻辑是什么样的呢？

<font color=#1E90FF>在enqueueUpdate函数中，React将更新加入到更新队列时会同时维护两个队列对象queue1和queue2，其中queue1是应用程序运行过程中current树上当前Fiber结点最新队列，queue2是应用程序上一次更新时（workInProgress 树）Fiber 结点的更新队列</font>，它们之间的相互逻辑是下面这样的
+ `queue1`取的是`fiber.updateQueue`，`queue2`取的是`fiber.alternate.updateQueue`；
+ 如果两者均为`null`，则调用`createUpdateQueue(...)`获取初始队列；
+ 如果两者之一为`null`，则调用`cloneUpdateQueue(...)`从对方中获取队列；
+ 如果两者均不为`null`，则将`update`作为`lastUpdate`加入多`queue1` 中。

所以更新队列的结构如下：
<img :src="$withBase('/react_yuanli_8.png')" alt="">

值得注意的是，整个更新队列对象通过`firstUpdate`属性和更新对象的`next`属性层层引用形成了链表结构。同时更新队列对象中也可以通过`lastUpdate`属性直接连接到最后一个更新对象，即`updateQueue.firstUpdate.next...next`的值会一直和`updateQueue.lastUpdate`执行的更新对象相同

而将更新对象加入更新队列的函数`enqueueUpdate`源码如下所示：
```javascript
// 源码位置：packages/react-reconciler/src/ReactUpdateQueue.js
// 每次setState都会创建update并入updateQueue
function enqueueUpdate(fiber, update) {
  // 每个Fiber结点都有自己的updateQueue，其初始值为null，一般只有ClassComponent类型的结点updateQueue才会被赋值
  // fiber.alternate指向的是该结点在workInProgress树上面对应的结点
  var alternate = fiber.alternate;
  var queue1 = void 0;
  var queue2 = void 0;
  if (alternate === null) {
    // 如果fiber.alternate不存在
    queue1 = fiber.updateQueue;
    queue2 = null;
    if (queue1 === null) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
    }
  } else {
    // 如果fiber.alternate存在，也就是说存在current树上的结点和workInProgress树上的结点都存在
    queue1 = fiber.updateQueue;
    queue2 = alternate.updateQueue;
    if (queue1 === null) {
      if (queue2 === null) {
        // 如果两个结点上面均没有updateQueue，则为它们分别创建queue
        queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
        queue2 = alternate.updateQueue = createUpdateQueue(alternate.memoizedState);
      } else {
        // 如果只有其中一个存在updateQueue，则将另一个结点的updateQueue克隆到该结点
        queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
      }
    } else {
      if (queue2 === null) {
        // 如果只有其中一个存在updateQueue，则将另一个结点的updateQueue克隆到该结点
        queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
      } else {
        // 如果两个结点均有updateQueue，则不需要处理
      }
    }
  }
  if (queue2 === null || queue1 === queue2) {
    // 经过上面的处理后，只有一个queue1或者queue1 == queue2的话，就将更新对象update加入到queue1
    appendUpdateToQueue(queue1, update);
  } else {
    // 经过上面的处理后，如果两个queue均存在
    if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
      // 只要有一个queue不为null，就需要将将update加入到queue中
      appendUpdateToQueue(queue1, update);
      appendUpdateToQueue(queue2, update);
    } else {
      // 如果两个都不是空队列，由于两个结构共享，所以只在queue1加入update
      appendUpdateToQueue(queue1, update);
      // 仍然需要在queue2中，将lastUpdate指向update
      queue2.lastUpdate = update;
    }
  }
  ...
}
  
function appendUpdateToQueue(queue, update) {
  if (queue.lastUpdate === null) {
    // 如果队列为空，则第一个更新和最后一个更新都赋值当前更新
    queue.firstUpdate = queue.lastUpdate = update;
  } else {
    // 如果队列不为空，将update加入到队列的末尾
    queue.lastUpdate.next = update;
    queue.lastUpdate = update;
  }
}
```

<font color=#1E90FF>**③ 处理更新队列**</font>

处理更新队列的函数是`processUpdateQueue`，源码如下：
```javascript
// 源码位置：packages/react-reconciler/src/ReactUpdateQueue.js
function processUpdateQueue(workInProgress, queue, props, instance, renderExpirationTime) {
  ...
  // 从队列中取出第一个更新
  var update = queue.firstUpdate;
  var resultState = newBaseState;
  // 遍历更新队列，处理更新
  while (update !== null) {
    ...
    // 如果第一个更新不为空，紧接着要遍历更新队列
    // getStateFromUpdate函数用于合并更新，合并方式见下面函数实现
    resultState = getStateFromUpdate(workInProgress, queue, update, resultState, props, instance);
    ...
    update = update.next;
  }
  ...
  // 设置当前fiber结点的memoizedState
  workInProgress.memoizedState = resultState;
  ...
}

// 获取下一个更新对象并与现有state对象合并
function getStateFromUpdate(workInProgress, queue, update, prevState, nextProps, instance) {
  switch (update.tag) {
      case UpdateState:
      	{
        	var _payload2 = update.payload;
        	var partialState = void 0;
        	if (typeof _payload2 === 'function') {
          	// setState传入的参数_payload2类型是function
          	...
         	 partialState = _payload2.call(instance, prevState, nextProps);
          	...
        	} else {
          	// setState传入的参数_payload2类型是object
          	partialState = _payload2;
        	}
        	// 合并当前state和上一个state.
       	 return _assign({}, prevState, partialState);
      }
  }
}
```
<font color=#1E90FF>processUpdateQueue函数用于处理更新队列，在该函数内部使用循环的方式来遍历队列，通过update.next依次取出更新（对象）进行合并</font>，合并更新对象的方式是：

+ 如果`setState`传入的参数类型是`function`，则通过`payload2.call(instance, prevState, nextProps)`获取更新对象；
+ 如果`setState`传入的参数类型是`object`，则可直接获取更新对象；
+ 最后通过使用<font color=#9400D3>Object.assign()</font>合并两个更新对象并返回，如果属性相同的情况下则取最后一次值。
