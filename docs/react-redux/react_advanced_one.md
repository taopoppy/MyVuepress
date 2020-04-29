# React的原理

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
	content: PropTypes.arrayOf(PropTypes.string, PropTypes.number), // content既可以是string类型也可以是number类型
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

### 2. 深入理解虚拟DOM

### 3. Diff算法