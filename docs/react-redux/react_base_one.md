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

关于`JSX`更多的内容我们将在后面的[React文档](taopoppy.cn/react-redux/react_base_guanwang1.html)中更详细的说明

**参考资料**

1. [JSX 简介](https://zh-hans.reactjs.org/docs/introducing-jsx.html)