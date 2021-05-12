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