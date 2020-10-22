# 登录页面开发-UI

## 页面分析和组件划分
<img :src="$withBase('/react_redux_jiagou_signinui.png')" alt="登录页面">

根据设计图和组件划分的原则，我们将登录页面划分为两个组件：`LoginHeader`和`LoginForm`

所以我们先来创建登录页面的组件文件，创建`src/containers/Login/components`和`src/containers/Login/index.js`

然后我们将登录页面加入路由：
```javascript
// src/containers/App/index.js
import Login from "../Login" // 1. 引入

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
          	<Route path="/login" component={Login} /> {/* 2. 使用*/}
            <Route path="/detail/:id" component={ProductDetail} />
            <Route path="/search" component={Search} />
            <Route path="/search_result" component={SearchResult} />
            <Route path="/" component={Home} />
          </Switch>
        </Router>
      </div>
    );
  }
}
```

## 登录头部的开发(LoginHeader)
创建登录头部组件：`src/containers/Login/components/LoginHeader/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/Login/components/LoginHeader/index.js
import React, { Component } from 'react';
import {Link} from "react-router-dom"
import "./style.css"

class LoginHeader extends Component {
  render() {
    return (
      <div className="loginHeader">
        <Link to='/' className="loginHeader__back"></Link>
        <div className="loginHeader__title">账号秘密登录</div>
      </div>
    );
  }
}

export default LoginHeader;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/Login/components/LoginHeader/style.css)上自行查看。

最后将搜索列组件`ShopList`添加到登录页面当中：
```javascript
// src/containers/Login/index.js
import React, { Component } from 'react';
import LoginHeader from "./components/LoginHeader" // 1. 引入

class Login extends Component {
  render() {
    return (
      <div>
        <LoginHeader/> {/*2. 使用*/}
      </div>
    );
  }
}

export default Login;
```

## 登录表单的开发(LoginForm)
创建登录表单组件：`src/containers/Login/components/LoginForm/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/Login/components/LoginForm/index.js
import React, { Component } from 'react';
import "./style.css"

class LoginForm extends Component {
  render() {
    return (
      <div className="loginForm">
        <div className="loginForm__inputContainer">
          <div className="loginForm__row">
            <label className="loginForm__mobileLabel">86</label>
            <input className="loginForm__input"
              name="username"
            ></input>
          </div>
          <div className="loginForm__row">
            <label className="loginForm__passwordLabel">密码</label>
            <input className="loginForm__input"
              name="password"
              type="password"
            ></input>
          </div>
        </div>
        <div className="loginForm__btnContainer">
          <button className="loginForm__btn">
            登录
          </button>
        </div>
      </div>
    );
  }
}

export default LoginForm;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/Login/components/LoginForm/style.css)上自行查看。

最后将登录表单组件`LoginForm`添加到登录页面当中：
```javascript
// src/containers/Login/index.js
import React, { Component } from 'react';
import LoginHeader from "./components/LoginHeader"
import LoginForm from "./components/LoginForm" // 1. 引入

class Login extends Component {
  render() {
    return (
      <div>
        <LoginHeader/>
        <LoginForm/> {/* 2. 使用*/}
      </div>
    );
  }
}

export default Login;
```
