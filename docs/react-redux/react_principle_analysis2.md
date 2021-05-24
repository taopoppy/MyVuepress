# Fiber架构核心思想

## Fiber概述
我们首先要明白的第一个问题：<font color=#DD1144>React引入fiber架构主要的目标是要解决什么</font>

答案是：<font color=#9400D3>主要目标是解决应用程序的更新任务与外部其他任务（如动画渲染）在CPU资源分配方面的问题</font>

第二个问题：<font color=#DD1144>React Fiber的本质是什么</font>

答案是：<font color=#9400D3>从概念上将React Fiber是一种程序架构，但是在React应用程序运行过程中它实际体现是一个JS对象，该对象主要是由两个构造函数的实例层层引用组成，两个构造函数分别是FiberRootNode和FiberNode</font>

第三个问题：<font color=#DD1144>虚拟DOM和Fiber节点是一回事么</font>

答案是：<font color=#9400D3>并不是，虽然虚拟DOM和Fiber节点的本质都是JS对象，但是从来源和描述内容来说，两者都不一样</font>
+ <font color=#1E90FF>虚拟DOM是React元素也就是JSX对象经过Babel转义成为React.createElement函数，函数执行后返回的JS对象，其中属性包含type，prop等属性，主要用于描述应用程序的UI部分</font>
+ <font color=#1E90FF>而Fiber节点是由React将虚拟DOM转换来的，在虚拟DOM的基础上，有更加丰富的属性，它包含了stateNode、child、sibling、return以及updateQueue等属性，每个Fiber结点通过child，sibling，return分别指向了孩子结点，兄弟节点和父结点，最终形成了一个闭环（也是一种树形结构），React可以在这个Fiber树上面轻松找到任意一个需要更新的结点，然后对其进行"创建更新"以及"将更新渲染到屏幕"等渲染工作</font>

下图为`React`元素树结构：
<img :src="$withBase('/react_yuanli_9.png')" alt="">

下图是`Fiber`架构实体：
<img :src="$withBase('/react_yuanli_10.png')" alt="">

面我们说到，`React Fiber`架构的实体由两个构造函数的实例构成，`fiberRoot`对象是整个`Fiber`架构的入口对象，在应用程序的更新过程中，`React`都会以这个对象为根基，查找到对应的`Fiber`结点，调用生命周期函数以及标记对应的`effectTag`等

## 为何是fiber
问题一：<font color=#1E90FF>使用fiber架构的主要解决问题手段是什么</font>

回答是：<font color=#DD1144>React将新的架构取名为Fiber是要表达新的架构会将（更像）任务拆分为最小的单元进行执行。</font>

我们简单了解一下`React15`的问题原因：`React Fiber`之前的调度策略`Stack Reconciler`，这个策略像函数调用栈一样，递归遍历所有的`Virtual DOM`结点进行 `diff`，一旦开始无法被中断，要等整棵`Virtual DOM`树计算完成之后，才将任务出栈释放主线程。而浏览器中的渲染引擎是单线程的，除了网络操作，几乎所有的操作都在这个单线程中执行，此时如果主线程上的用户交互、动画等周期性任务无法立即得到处理，就会影响体验


浏览器是多线程的，它包括<font color=#9400D3>GUI（渲染）线程</font>，<font color=#9400D3>JS引擎线程</font>，<font color=#9400D3>事件触发线程</font>，<font color=#9400D3>定时触发线程</font>和<font color=#9400D3>异步网络请求线程</font>。<font color=#1E90FF>其中GUI（渲染）线程，JS 引擎线程 分别用于浏览器页面的渲染和 JS 的执行。如果 JS 引擎线程执行时间过长（超过 16.5ms），长期占用CPU，就到导致 GUI（渲染）线程无法及时工作，就会使页面更新产生视觉上的时间差，也就是卡顿现象</font>。

所以在`React16`当中：`React`在执行整个任务时，会将整个任务拆分成若干子任务来执行，每次执行自认为都要检查是否拥有执行权，具体的逻辑如下：
+ 将任务按照单个`Fiber`结点为单位，拆分成细小的单元。
+ 重写`render`和`commit`两阶段的逻辑，`render`阶段的任务每次在执行前先请求任务体系获得执行权。
+ 对任务建立优先级体系，高优先级任务优于低优先级工作执行


## Fiber整体渲染流程
基于`React Fiber`架构的应用程序运行过程可以分为`prerender`,`render`和`commit`三个阶段，其中只有应用程序首次渲染时才经历`prerender`阶段。事实上，`React`应用程序内部运行阶段的划分并没有特别明确的界定，运行阶段划分只是为了方便我们对应用程序的运行机制有个整体的认知，我们要记住：<font color=#DD1144>prerender阶段需要做的是准备工作，render阶段是计算更新，commit阶段的工作是将更新映射到屏幕</font>

### 1. prerender阶段
该阶段的目标： <font color=#9400D3>构建fiberRoot对象，做好Fiber架构的基建工作</font>。该阶段的工作内容有：
+ <font color=#1E90FF>检查容器(container)是否有效</font>
+ <font color=#1E90FF>实例化fiberRoot对象，该对象是整个Fiber树的入口</font>

<img :src="$withBase('/react_yuanli_11.png')" alt="">

### 2. render阶段
该阶段的目标： <font color=#9400D3>确定需要在屏幕中更新的UI内容</font>，该阶段的工作内容有：
+ <font color=#1E90FF>构建 workInProgress 对象树，收集副作用</font>
+ <font color=#1E90FF>得到标记了副作用的 Fiber 结点树（一个链表，需要在 commit 阶段重点处理的信息）。</font>

我们之前说过，使用`fiber`架构的任务就是将更新任务拆解为更小的单元进行执行，而关键步骤就在`render`阶段：<font color=#9400D3>在render阶段，React 通过时间分片的方式来处理一个或多个Fiber结点的更新任务，每次更新Fiber结点时会先向调度器请求任务执行权，如果有更高优先级的任务（如动画）则等它们执行完成之后再执行自己的更新任务，得到任务执行权后，React将每个Fiber结点作为最小工作单位，通过自顶向下逐个遍历Fiber结点，构建workInProgress树（一颗新的Fiber树，更新的计算、调用部分生命周期函数等会在这个过程中完成）。这一过程总是从顶层的 HostRoot 结点开始遍历，直到找到未完成工作或者需要处理的结点</font>

<img :src="$withBase('/react_yuanli_12.png')" alt="">

`render`阶段执行完成后，`FiberRoot`对象上面的`current`属性指向了一颗`「Fiber 树」`，我们称它为 `current`树，`current`树上面的`alternate`属性指向了另一颗`「Fiber 树」`也就是后面要讲的`workInProgress `树。这两颗`Fiber`树通过`alternate`属性形成了一个闭环(<font color=#DD1144>图中灰色的节点连接起来为current树，图中蓝色节点连接起来为workInProgress树</font>)。此外

<font color=#1E90FF>上图展示了应用程序首次渲染时在 render 阶段结束时 fiberRoot 对象的内部结构。此时的副作用列表（Effect List）就是整个workInProgress树。如果是更新渲染，那么副作用列表（Effect List）就会是 workInProgress树中包括HostRoot结点在内的那些需要更新的Fiber结点集合（一般是 workInProgress 树的子集）</font>

### 3. commit阶段
该阶段目标： <font color=#9400D3>将render阶段得到的副作用列表中的更新信息渲染到屏幕</font>。要执行的工作是：<font color=#1E90FF>通过遍历副作用列表根据副作用类型提交具体的副作用，包括 DOM 更新、调用生命周期函数、ref 更新等一系列用户可见的 UI 变化</font>

进入`commit`阶段时，`fiberRoot`对象上面的<font color=#DD1144>current树反应当前屏幕上UI的状态</font>，<font color=#DD1144>workInProgress 树反映 未来 需要映射到屏幕上 UI 的状态</font>。副作用列表来描述需要实际做的操作，比如`DOM`的更新与增删，调用生命周期函数等等,<font color=#DD1144>commit过程不可中断，必须一直执行直到更新完成</font>。

## 核心构造函数
### 1. FiberRootNode
### 2. FiberNode

## effectTag