# React的核心原理

## 属性和数据驱动
### 1. Reactdevelopertools的使用
+ 打开`chrome`浏览器，点击右上角的按钮（<font color=#1E90FF>自定义和控制Google Chrome</font>）
+ 选择<font color=#1E90FF>更多工具/扩展程序</font>，进入到`chrome://extensions`
+ 选择左上角的按钮（扩展程序），然后选择底部的按钮（<font color=#1E90FF>打开Chrome网上应用店</font>）
+ 左侧的搜索框中搜索`react`,会出现很多搜索结果
+ 点击第一个搜索结果<font color=#1E90FF>React Developer Tools</font>后面的按钮（<font color=#1E90FF>添加至Chrome</font>）

简单的几步就已经将扩展程序添加到浏览器当中，它的用处是这样的
+ <font color=#DD1144>在浏览器右上角出现一排图标，图标中多出一个react Devloper Tools的按钮，当前网页如果是react编写的，开发环境这个按钮会自动呈现红色，线上环境这个按钮会自动呈现黑色，否则是灰色</font>
+ <font color=#1E90FF>这个工具在开发的时候，能实时监控组件的所有状态，帮助我们很好的做调试</font>
每个组件都有自己的`props`参数，这些参数是从父组件接收的一些属性，我们这里来说<font color=#DD1144>如何给参数做校验(PropTypes)</font>和<font color=#DD1144>如何定义参数的默认值(DefaultProps)</font>

### 2. PropTypes
有的时候，组件对于父组件传递过来的参数有值和类型的要求，我们就需要定义给组件做参数类型和参数必要性的校验：
```javascript
// TodoItem.js
import React from 'react'
import PropTypes from 'prop-types' // 引入包

class TodoItem extends React.Component {
	// 这里是组件本身的代码，请忽略
}

// TodoItem这个组件做属性校验
TodoItem.propTypes = {
	test: PropTypes.string.isRequired, // 类型和必要性同时检测
	content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // content既可以是string类型也可以是number类型
	deleteItem: PropTypes.func,
	index: PropTypes.number
}

export default TodoItem
```
+ <font color=#DD1144>参数校验的类型校验必须通过引入prop-types这个包</font>，这个包是在`create-react-app`脚手架中自带的包
+ <font color=#1E90FF>参数校验的必要性校验可以在类型后面添加.isRequired</font>，表示父组件使用这个组件的时候必须要传递这个参数，否则会报错
+ 关于参数的校验我们可以参照[官网](https://react.caibaojian.com/docs/typechecking-with-proptypes.html)再去学习，因为官网给出的实例和类型都很全面


### 3. DefaultProps
有时候，组件需要父组件传递一些参数，这些参数是可选的，所以在组件内部需要给参数一个默认值，<font color=#1E90FF>如果父组件不传递就使用这个默认值，父组件传递这个参数，参数就会覆盖默认值</font>
```javascript
// TodoItem.js
import React from 'react'
import PropTypes from 'prop-types'

class TodoItem extends React.Component {
	// 这里是组件本身的代码，请忽略
}

TodoItem.propTypes = {
	test: PropTypes.string.isRequired,
}
// TodoItem这个组件做属性默认值的设置
TodoItem.defaultProps = {
	test: 'hello world'  // 给props.test设置一个默认值
}

export default TodoItem
```

### 4. props和state和render函数
`react`是由数据驱动的框架，当数据变化，视图就会随着变化，背后的原理是什么呢？我们下面来讲解：<font color=#DD1144>props,state和render函数之间存在什么样的关系，从而导致了数据驱动的效果</font>

其实就是一句特别简单的话：<font color=#DD1144>当组件的satate或者props发生改变的时候，render函数就会重新执行</font>

## 虚拟DOM和Diff算法
### 1. React中的虚拟DOM
我们知道虚拟`DOM`在数据驱动视图更新中有着至关重要的作用，但是我们如果直接理解虚拟`DOM`可能有有点费劲，我们现在来思考一个问题，来逐步思考虚拟`DOM`到底怎么来的又解决了什么问题。我们现在思考如果是你，实现一个数据更新驱动视图更新的功能，怎么做？

<font color=#1E90FF>**① 完整替换**</font>

+ `state`数据
+ `JSX`模板
+ 数据 + 模板 结合，生成真实的`DOM`，来显示
+ `state`发生改变
+ 数据 + 模板 结合，生成真实的`DOM`，替换原始的`DOM`

缺陷：
+ 第一次生成了完整的`DOM`片段
+ 第二次生成了完整的`DOM`片段
+ 第二次的`DOM`替换第一次的`DOM`,非常耗性能

<font color=#1E90FF>**② 寻找差异**</font>

+ `state`数据
+ `JSX`模板
+ 数据 + 模板 结合，生成真实的`DOM`，来显示
+ `state`发生改变
+ 数据 + 模板 结合，生成真实的`DOM`，并不直接替换原始的`DOM`
+ 新的`DOM`(`DocumentFragment`)和原始的`DOM`做比对，找差异
+ 找出变化的`DOM`节点
+ 只用新的`DOM`中的变化的元素替换老的`DOM`中的变化的元素

缺陷；
+ 由于虽然减少了部分无变化的`DOM`的替换，但是也增加了新旧`DOM`比对的过程，性能提升并不明显

<font color=#1E90FF>**③ react的做法**</font>

+ `state`数据
+ `JSX`模板
+ 数据 + 模板 结合生成虚拟`DOM`(<font color=#DD1144>虚拟DOM就是一个JS对象，用它来描述真实DOM的结构</font>)
	+ （比如虚拟`DOM`是`['div',{id: 'abc'},['span', {}, 'hello world']]`）
+ 用虚拟`DOM`的结构来生成真实的`DOM`来显示
	+ （比如真实的`DOM`是 `<div id='abc'><span>hello world</span></div>`）
+ `state`发生改变
+ 数据 + 模板 结合生成新的虚拟`DOM`
	+ （比如虚拟`DOM`是`['div',{id: 'abc'},['span', {}, 'bye bye']]`）
+ 比较新旧虚拟`DOM`，找到存在区别的元素内容
+ 直接操作`DOM`，修改变化的部分

通过了解react中组做法你就能够明白，react使用虚拟`DOM`能提升性能的两个地方在于
+ <font color=#DD1144>数据发生变化，不再生成新的DOM，而是虚拟DOM这种js对象，用js生成DOM远比用js生成js对象代价高的多</font>
+ <font color=#DD1144>不再是新旧DOM之间的比对，而是虚拟DOM之间的比对，使用js比对DOM消耗性能远比用js比对js对象要高的多，</font>

总结两点就是：<font color=#9400D3>生成DOM变生成JS对象</font> 和 <font color=#9400D3>DOM比对变成JS对象比对</font>

### 2. 深入理解虚拟DOM
现在我们需要搞清楚一个问题就是，我们使用`JSX`语法来书写代码，最终生成了真实的`DOM`,那么这个过程是怎么样的？

+ <font color=#DD1144>JSX语法会通过Babel编译成为React.createElement方法</font>
+ <font color=#DD1144>React.createElement方法执行返回的就是一个JS对象，俗称虚拟DOM</font>
+ <font color=#DD1144>虚拟DOM描述了真实DOM的结构，通过React中的ReactDOM.render()函数再生成真实的DOM并挂载到浏览器中</font>

<img :src="$withBase('/react_redux_jsx.png')" alt="JSX的本质">

通过上面这张流程图，你知道了`React`使用虚拟`DOM`的流程，但是`React`为什么要使用虚拟`DOM`，使用它有什么好处呢？

+ <font color=#DD1144>性能提升</font>（两个性能提升的点上面已说明）
+ <font color=#DD1144>使得跨端应用得以实现，比如React Native，虚拟DOM在浏览器通过React被转化成为了真实的DOM，但是在移动端虚拟DOM也可以通过其他东西被转化成为原生的组件</font>，如上图所示

### 3. Diff算法
关于`Diff`算法，我们肯定不会深入讲其中的原理，我们只是来简单的介绍一下：<font color=#1E90FF>Diff算法是用来帮助我们比对两个虚拟DOM区别的算法</font>，因为`Diff`的全程就是`Diffrence`，找不同的意思。

<font color=#1E90FF>**① setState为什么是异步的**</font>

我们思考一下，两个虚拟`DOM`之间产生不同的原因归咎于数据发生了变化，无论是单个组件中数据变化，还是父子组件中的`prop`发生了变化，都是<font color=#DD1144>调用了setState方法修改了state</font>，而`setState`这个方法是异步的，我们来想一下，<font color=#1E90FF>为什么setState是异步的</font>：

+ <font color=#DD1144>异步的原因肯定是为了提高性能，如果setState是同步的，连续多次调用这个方法，就会产生多个虚拟DOM ，从而造成多次新旧虚拟DOM之间的比对</font>
+ <font color=#DD1144>但如果是异步的，按照异步事件循环的规则，多次异步方法会在下一次循环中执行，那么就可以将其何并，只做一次最后一次虚拟DOM的比对，提高性能</font>

<font color=#1E90FF>**② Diff比较的方式**</font>

<font color=#9400D3>Diff算法中两个虚拟DOM的比对方式是同级比对，而且某一级如果不同，就不会再继续比对下去</font>，也就是说如果第一层都不一样，就不会比比较第二层，第三层，哪怕后面的所有都一样，也会全部重新替换，<font color=#DD1144>虽然同层比对可能会造成一些性能的损耗，但是这样的方式速度最快</font>

<img :src="$withBase('/react_advanced_tongjibijiao.png')" alt="同级比对">

<font color=#1E90FF>**③ Key的终极解析**</font>

知道了`Diff`是同层比对之后，现在再来彻底说明<font color=#DD1144>为什么在循环中要带key，并且key为什么不能用index</font>

<img :src="$withBase('/react_advanced_key.png')" alt="key的比较">

如上图，假如在一个循环中旧的虚拟DOM有4个节点，数据更新后，在数组的最中间插入另一个节点：
+ <font color=#DD1144>在无key或者key为index的时候，因为Diff算法是同层比对，一样的会复用，所以导致的结果就是在真实操作DOM的时候，它认为旧23变成了新234，所以就会先把旧的23的DOM删掉，然后生成新的234,再添加到DOM中。包含了删除2个节点的真实DOM操作，生成3个节点的真实DOM操作，将3个节点加入文档的真实DOM操作</font>

+ <font color=#DD1144>但是在有key的情况下，因为有key做标志，新的虚拟DOM中c和d通过key知道自己和旧的虚拟DOM中的c和d描述的是真实DOM中同一段位置的东西，比对之后发现并无变化，所以在真实的DOM操作中只需要生成新的e节点并加入DOM中。只包含了生成1个节点的真实DOM操作和将1个节点加入文档的真实DOM操作</font>

所以对比一下，你就能看出，在循环中，每个节点有固定且唯一的`key`能省略点多少真实的`DOM`操作，所以这就是设置正确的`key`是真的能提高性能的原因，而且数组中循环的元素越多，性能提升的越明显。