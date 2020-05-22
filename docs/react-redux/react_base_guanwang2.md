# 元素和组件

## 元素
### 1. 元素的概念
<font color=#1E90FF>元素是构成 React 应用的最小砖块。元素描述了你在屏幕上想看到的内容。</font>

虽然这里是官网的介绍，但是我个人认为需要将<font color=#DD1144>React元素</font>、<font color=#DD1144>React组件</font>、<font color=#DD1144>React DOM</font>以及真实的<font color=#DD1144>浏览器DOM</font>这几个概念一起介绍，你才能知道在整个流程当中，每种概念都处于什么阶段。

<font color=#9400D3>**① React元素**</font>

<font color=#DD1144>React元素的本质就是一个JSX对象</font>，比如下面这样一个`React`元素，它描述的就是最终想要在浏览器中表现的东西：

```javascript
const element = <h1>Hello, world</h1>;
```

<font color=#9400D3>**② React组件**</font>

<font color=#DD1144>React组件的本质就是一个Javascript函数</font>，下面两种写法都是组件的写法，因为它接收唯一带有数据的 `“props”`（代表属性）对象与并返回一个React 元素。这类组件被称为“函数组件”

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```
```javascript
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```
到这里你应该明白了<font color=#1E90FF>React组件</font>和<font color=#1E90FF>React元素</font>之间的关系，<font color=#DD1144>React组件是一个函数，函数的返回值是React元素</font>

<font color=#9400D3>**③ React DOM**</font>

<font color=#DD1144>React DOM俗称虚拟DOM，它的本质就是一个正儿八经的javascript对象</font>，这个`javascript`对象描述的是真实能显示在浏览器中的`DOM`树的结构

<font color=#1E90FF>因为React元素虽然描述想要在浏览器中表现的东西，但是能直接被浏览器识别的是真实的浏览器DOM，所以在React元素和浏览器DOM之间存在一系列的转换关系，其中React DOM(或者虚拟DOM)就是在这一系列的转换过程中的临时产物</font>


### 2. 元素的特征
<font color=#1E90FF>我们已经知道，想要将一个React元素渲染到根DOM节点中，只需把它们一起传入ReactDOM.render()</font>

<font color=#DD1144>但是React元素是<font color=#9400D3>不可变对象</font>。一旦被创建，你就无法更改它的子元素或者属性。一个元素就像电影的单帧：它代表了某个特定时刻的 UI，所以组件状态更新会重新执行render方法，render方法会创建一个全新的React元素，传入ReactDOM.render()方法后会产生新的虚拟DOM，与旧的虚拟DOM对比后会修改真实的DOM</font>

所以我们来用图示理清整个过程：
<img :src="$withBase('/react_redux_render.png')" alt="">

我们配合一段最简单的代码来说明：
```javascript
import React from 'react';
import ReactDOM from 'react-dom';

// 组件
class App extends React.Component {
	constructor(props){
		super(props)
		this.state ={
			time:''
		}
	}
	componentDidMount() {
		setInterval(() => {
			this.setState({
				time: new Date().toLocaleTimeString()
			})
		}, 1000);
	}
  render() {
    return (
      <div>
       {this.state.time}
      </div>
    );
  }
}

// 渲染并挂载
ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```
通过上面的图示和代码，我们现在能够更清晰的理解这一段代码了

## 组件
组件的概念我们已经说过了，通过直接书写`function`书写的叫做<font color=#DD1144>函数组件</font>、通过`class`方式继承`React.Component`的书写叫做<font color=#DD1144> class组件</font>

那么我们现在要讲解一下在组件中比较特有的属性

## 组件的props
<font color=#DD1144>当一个React元素是一个用户自定义的组件，JSX中所接收的属性（attributes）和子组件（children）会一起转换成为单个对象传递给组件，这个对象称之为<font color=#9400D3>Props</font></font>

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

class App extends React.Component {
  render() {
		console.log(this.props) // name、div
    return ();
  }
}
const element = <App name="taopoppy"><div>hello</div></App>

// 渲染并挂载
ReactDOM.render(
  <App />,
  document.getElementById('root')
);

```
按照`Props`的定义，我们就知道`element`是一个`React`元素，对于`App`组件来说，通过`<App name="taopoppy"><div>hello</div></App>`这种写法，属性`name`和`div`会合并成为一个对象，这个对象就叫做`Props`，在`App`组件当中可以打印出来。

总结： <font color=#9400D3>Props就是通过JSX语法调用组件时给组件传递的attributes和children</font>

当你了解了什么是`Props`后，还要记住它非常重要的一个特性：<font color=#DD1144>组件无论是使用函数声明还是通过 class 声明，都决不能修改自身的props</font>

## 组件的state