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




## 核心构造函数
### 1. FiberRootNode
### 2. FiberNode

## effectTag