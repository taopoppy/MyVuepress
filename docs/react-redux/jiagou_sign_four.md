# React-Router基本思想

## 路由概述
<font color=#1E90FF>**① MPA vs SPA**</font>

我们首先来介绍两个比较大的概念：<font color=#9400D3>MPA</font>和<font color=#9400D3>SPA</font>：
+ <font color=#DD1144>MPA</font>；`multiple page app`，多页面应用
+ <font color=#DD1144>SPA</font>：`sinple page app` 单页面应用

<font color=#1E90FF>**② 服务端路由和客户端路由**</font>

+ <font color=#DD1144>服务端路由</font>：访问`http://a`就返回`a.html`，访问`http://b`就返回`b.html`，是服务器根据不同的路由返回不同的页面
+ <font color=#DD1144>客户端路由</font>：无论访问什么路径，返回的页面信息都是相同的，是通过`js`通过判断路径的不同来渲染不同的组件而已，所以叫做客户端路由

## Router相关库
`React Router`实际上包含了三个部分: <font color=#9400D3>rect-router</font>、<font color=#9400D3>react-router-dom</font>、<font color=#9400D3>react-router-native</font>

+ `react-router`实现了路由的核心功能
+ `react-router-dom`是在`react-router`上的一层封装，将`react-router`功能和`web-api`进行绑定，可以在`web`项目当中使用`react-router`
+ `react-router-native`主要是在`react native`当中使用

所以我们可以直接使用`react-router-dom`就可以完成路由的集成：
```javascript
npm install react-router-dom@4.3.0
```
要保证`react-router`的正常使用，我们需要在所有的`UI`组件的外层包裹一层`Router`的组件，它会创建一个上下文，保证路由的正常工作。在浏览器当中常见的路由实现有两个，分别是：<font color=#9400D3>BrowserRouter</font>和<font color=#9400D3>HashRouter</font>

### 1. BrowserRouter

之前说`react-router-dom`是将`react-route`和`web-api`做绑定，这些`web-api`具体指的就是<font color=#9400D3>HTML5 history API</font>，利用这些`pushState`、`replaceState`等方法实现在客户端实现路由的操作。

先看一个简单的示例：
```javascript
// App.js
import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom"; // 1、引入react-router-dom
import Home from "./Home";
import About from "./About";
import Contact from "./Contact";
import Nav from "./Nav";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Nav />
          <Route path="/" exact component={Home} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
        </div>
      </Router>
    );
  }
}

export default App;
```
```javascript
// Nav.js
import React, { Component } from 'react';
import { Link } from "react-router-dom";

class Nav extends Component {
  render() {
    return (
      <div>
        <nav>
            <ul>
      				<li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>
      </div>
    );
  }
}
export default Nav;
```
上面这个实际上就是最简单的使用，我们清楚的明白`react-router-dom`的工作原理：<font color=#1E90FF>无论你请求什么地址，返回的都是同一个html，其中携带了额外的js，当中就包含了react-router-dom的代码，它会拦截到当前路由，根据路由的不同决定显示什么组件</font>

### 2. HashRouter

<font color=#DD1144>哈希路由是使用url的hash部分作为路由信息，是通过使用页面不同的哈希和不同的组件之间做映射来完成的</font>，<font color=#1E90FF>哈希的出现主要为了兼容老版本浏览器，因为老版本的浏览器不支持history的API，所以通过哈希的变化来实现路由的变化。但是这样的情况在现在已经很少了，而且哈希的本身含义就是页面的定位，其逻辑也不符合路由的需求</font>

## 路由配置
<font color=#DD1144>这里我们需要分清楚，Router组件和Route组件是不同的</font>，从上面的代码我们也看到了，在所有组件的外部需要通过`Router`组件来包裹，<font color=#DD1144>但是Route组件是用来定义具体的路由信息的，而且你所定义的所有的Route都会与路径进行匹配，谁成功的显示谁</font>

### 1. Route组件
`Route`组件上有喝很多可以配置的重要属性，我们来看看

<font color=#1E90FF>**① path**</font>

`path`属性用于定义该`Route`组件生效的条件

<font color=#1E90FF>**② component**</font>

`component`属性定义`Route`组件生效的时候对应的显示的组件

<font color=#1E90FF>**③ match**</font>

`match`属性用于拿到动态路由当中的动态信息，并以`props`的一部分传入组件当中
```javascript
// App.js
<Route path="/user/:userid" component={User} />
```
```javascript
// User.js
class User extends Component {
	render() {
		const { match } = this.props // 拿到match信息
		return <div>{match.params.userid}</div> // 通过match拿到具体的动态路由信息
	}
}
```

<font color=#1E90FF>**④ exact**</font>

我们说路由匹配，<font color=#DD1144>通常指的是包含关系</font>，什么意思，就是说你访问`/`路径，在`Route`的`path`中，对应的`/about`、`/contact`、`/user`都会显示，因为这些也都是以`/`开头的，这就是包含关系。

所以如果我们想让浏览器的路由和我们`Route`组件中的`path`属性定义的路由一一独家对应，就要用到这个<font color=#9400D3>exact</font>属性，也就是说，使用了`exact`属性，路由完全一致才会使该`Route`组件生效。


### 2. Switch组件
<font color=#DD1144>Switch组件和Route组件中的exact效果差不过，只不过它的作用是只会去匹配第一个被匹配的Route</font>

```javascript
import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"; // 1、引入Switch
import Home from "./Home";
import About from "./About";
import Contact from "./Contact";
import Nav from "./Nav";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Nav />
					<Switch>
						<Route path="/about" component={About} />
						<Route path="/contact" component={Contact} />
						<Route path="/" component={Home} />
					</Switch>
        </div>
      </Router>
    );
  }
}

export default App;
```
虽然`Switch`组件也能解决类似的匹配问题，但是匹配的规则还是包含关系，所以必须通过修改`Route`的书写顺序来解决问题，所以`Route`的顺序通常是越复杂的越写在前面，如上代码所示，`/`就必须写在最后，写在最前面就会导致任何路由都第一个就匹配成功了，因为任何路由都是以`/`开头的。

## 路由渲染组件的方式
`Route`组件渲染组件有三种方式，我们前面都只是用的第一种：
+ `Route component`
+ `Route render`
+ `Route children`

这三个方式都可以拿到`this.props`，里边会有这样一堆属性：<font color=#9400D3>history</font>、<font color=#9400D3>location</font>、<font color=#9400D3>match</font>

### 1. component
这个是我们前面一直将的方法，这种方式有两种用法；
```javascript
// 第一种
<Route path="/" exact component={Home} />

// 第二种
<Route path="/" exact component={() => <Home />} />
```
但是不推荐使用第二种，因为第二种使用箭头函数每次都会重新去执行`React.createElement(Home)`，这就会导致`Home`组件中的状态丢失，还会导致`Home`组件的重复卸载和挂载。那如何解决这个问题呢？`render`方法就登场了。

### 2. render
```javascript
<Route path="/" exact render={(props) => <Home {...props} {...extraProps}>} />
```
`render`属性就很好的避免了`component`属性的问题，而且传入的`props`对象包含了`match`、`history`、`location`等属性，包括可以在这里传入额外的其他属性，能让我们开发出更强大的组件，应对更复杂的业务逻辑。

### 3. children
`children`的用法和`render`类似，<font color=#DD1144>chilren和render的区别在于match状态，当我们使用children属性去渲染组件，这个Route不管是否匹配成功都会显示对应的组件，只不过匹配不成功props.match是不存在的，匹配成功，则props.match是存在的</font>

```javascript
class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Nav />
          <Route path="/" exact component={Home} />
          <Route path="/about" render={props => <About {...props} />} />
          <Route path="/contact" children={props => <div>{props.match ? "active": "inactive"}</div>} />
        </div>
      </Router>
    );
  }
}
```

## 全新的思维
<font color=#1E90FF>**① 一切皆组件**</font>

`React-router`遵循了`react`一切皆组件的思想，在`react-router 4`之前，`Route`组件的`render`函数并没有任何实现，而且这个库自己封装了一套和`react`不同的生命周期。<font color=#DD1144>所有在4的大版本之内，每个Route组件都有了render方法，所以每个Route组件都会被渲染，但是被渲染不代表路由会被匹配，匹配成功则渲染出对应路由的组件，匹配失败渲染出空组件</font>

<font color=#1E90FF>**② 动态路由的离散式声明方法**</font>

之前的写法都是将所有的路由组件写在一个文件当中，这些静态路由在加载阶段，就会解析所有的路由规则，<font color=#1E90FF>但是当Route变成了一个纯正的react组件的时候，可以在任意文件当中声明路由</font>，举个例子，之前我们有个动态的路由是：
```javascript
// App.js
<Route path="/user/:userid" component={User} />
```
我们现在将动态路由拆分到`App.js`和`User.js`两个部分：
```javascript
// App.js
<Route path="/user" component={User} /> // 1. 只有静态路由
```
```javascript
// User.js
import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import UserDetail from './UserDetail.js'

class User extends Component {
	render() {
		const { match } = this.props  // 2. 拿到match信息
		return (
			<div>
				{/* 3. 定义动态路由，match.path的值就是/user*/}
				<Route path={`${match.path}/:userid`} component={UserDetail.js}>
			</div>
		)
	}
}
```
```javascript
// UserDetail.js
class UserDetail extends Component {
	render() {
		const { match } = this.props // 4. 拿到match信息
		return <div>{match.params.userid}</div> // 5. 通过match拿到具体的动态路由信息
	}
}
```
