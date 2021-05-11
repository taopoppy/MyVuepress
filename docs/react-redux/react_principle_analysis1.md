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

<img :src="@withBase('/react_yuanli_2.png')" alt="">

## ReactDOM.render
