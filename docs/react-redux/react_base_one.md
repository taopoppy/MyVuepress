# react初探

## 开发环境配置
<font color=#1E90FF>直接使用react来编写的代码是无法直接在浏览器当中运行的，所以必须通过Babel语法编译并且通过类似于webpack，grant这种打包工具进行打包编译，在没有强大的webpack的基础的时候我们需要借助脚手架工具来帮助我们生成一个强大的开发环境</font>
```javascript
// 全局安装脚手架
npm install -g create-react-app
// 创建一个todolist项目
create-react-app todolist
// 启动项目
yarn start || npm run start
```

我们实际要看两个比较重要的文件就是`todolist/src/index.js`和`todolist/src/App.js`:
```javascript
//todolist/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
serviceWorker.unregister();
```
```javascript
// todolist/src/App.js
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
export default App;
```
实际上这种是我们使用最新的脚手架工具生成的代码，其中已经包含了<font color=#9400D3>React Hook</font>的新特性，还有<font color=#9400D3>Jest</font>自动化测试的内容，包括其中的`manifest.json`是帮助我们来启动<font color=#9400D3>PWA</font>的。我们化简一个最简单的入口文件和组件文件，帮助我们入门`React`

## React中的组件
我们修改如下；
```javascript
// todolist/src/App.js
import React, { Component } from 'react';

class App extends Component {
  render() {
    return (
      <div>
       hello world
      </div>
    );
  }
}
export default App;
```
在上面，我们已经显示了一个最基础最简单的组件的定义，就是`todolist/src/App.js`的内容，我们先来分析一下内容：
+ <font color=#DD1144>创建一个组件，实际上就是让它继承React.Component这个基类来实现的</font>
+ <font color=#DD1144>render方法是用来定义组件上面要渲染什么内容的函数</font>

```javascript
// todolist/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```
我们分析一下：
+ 上面这个入口文件最重要的就是`ReactDOM.render`方法，它的作用就是：<font color=#DD1144>将某个组件挂载到DOM节点下</font>，这里我们要注意一个区别：<font color=#1E90FF>在vue中，使用vue.$mount()方法挂载是一种替换的动作，App的代码会替换掉root的div，在react中，这里我们看到的ReactDOM.render()是一种比较真实的挂载动作，App代码就被包含在root的div标签中</font>
+ <font color=#1E90FF>文件中没有直接用到React，为什么要引入React</font>：<font color=#DD1144>我们在两个文件中都使用到了JSX语法，它必须通过React来编译，否则会提示你<font color=#3eaf7c>'React' must be in scope when using JSX</font></font>

## React中的JSX
什么是`JSX`语法，要知道，<font color=#1E90FF>我们最原始书写标签的方式是在.html文件中去书写的，现在使用和以前相同的方式方法来在.js文件中去书写这些标签的方式就是JSX语法</font>

<font color=#DD1144>JSX语法不仅仅能正常使用我们在html当中规定的标签，还能使用我们自己定义的标签</font>，我们在`todolist/src/index.js`中书写的`<App/>`就是典型的自定义的组件标签。

<font color=#9400D3>React中规定如果使用自己定义的组件标签，开头必须大写</font>,所以一般是可以通过`JSX`语法中组件开头字母大小写来判断它是个自定义的组件还是一个标准的`H5`的标签。

### 1. 在JSX中嵌入表达式
<font color=#9400D3>在 JSX 语法中，你可以在大括号内放置任何有效的 JavaScript 表达式</font>，这个的有效，我们之前也说过，就是存在有标准返回结果的`JavaScript`代码而已，无论是个判断式还是函数都是可以的。

```javascript
const name = 'Taopoppy'
const element = <h1>hello, { name }</h1>

ReactDOM.render(element, document.getElementById('root'))
```

### 2. JSX也是一个表达式
<img :src="$withBase('/react_redux_jsx.png')" alt="JSX的本质">

+ <font color=#9400D3>JSX表达式会被转为普通JavaScript函数调用，并且对其取值后得到JavaScript对象</font>，既然`JSX`最终转换成`JavaScript`对象，`JSX`就能赋值给变量，作为参数传入，甚至作为函数的返回值返回。
+ <font color=#9400D3>JSX本质就是一种语法糖，Babel会把JSX 转译成一个名为React.createElement()函数调用</font>，所以下面两种代码完全等效：
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
	`React.createElement()`会预先执行一些检查，以帮助你编写无错代码，但实际上它创建了一个这样的`javascript`对象：
	```javascript
	// 注意：这是简化过的结构
	const element = {
		type: 'h1',
		props: {
			className: 'greeting',
			children: 'Hello, world!'
		}
	};
	```
	<font color=#DD1144>这些对象被称为“React元素”。它们描述了你希望在屏幕上看到的内容。React通过读取这些对象，然后使用它们来构建DOM以及保持随时更新</font>。

### 3. JSX 特定属性
<font color=#9400D3>你可以通过使用引号，来将属性值指定为字符串字面量;也可以使用大括号，来在属性值中插入一个JavaScript表达式。但是对于同一属性不能同时使用这两种符号</font>

```javascript
const element = <div tabIndex="0"/>
const element = <img src={user.avatarUrl}/>
```
<font color=#1E90FF>因为JSX语法上更接近JavaScript而不是HTML，所以React DOM使用camelCase（小驼峰命名）来定义属性的名称，而不使用HTML属性名称的命名约定。例如，JSX 里的class变成了 className，而tabindex则变为tabIndex</font>。


**参考资料**

1. [JSX 简介](https://zh-hans.reactjs.org/docs/introducing-jsx.html)