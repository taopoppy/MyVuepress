# 登录页面开发

## 页面分析和组件划分(重要)
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
## 组件UI开发
### 1. 登录头部的开发(LoginHeader)
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

### 2. 登录表单的开发(LoginForm)
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

## 设计State
<img :src="$withBase('/react_redux_jiagou_signinui.png')" alt="登录页面">

首先分析这个页面的`State`，我们就要使用一下之前的`State`两步灵魂质问法，首先对于表单组件，表单组件的显示有两个地方,手机号和密码，这两个地方的显示是要依据手机`State`和密码`State`的，其次，下面按钮，点击了之后，会影响登录状态，所以登录状态是一个`State`，最后按钮点击会发送请求，在后端对手机号和密码进行校验，所以少不了请求状态，所以根据上述分析，我们的登录页面的`State`有下面四个：
```javascript
// src/redux/modules/login.js
const initialState = {
  username: "",
  password: "",
  isFetching: false,
  status: false //登录态标识
};
```

## 定义Actions
```javascript
// src/redux/modules/login.js
// action types
export const types = {
	// 请求登录
	LOGIN_REQUEST: "LOGIN/LOGIN_REQUEST",
  LOGIN_SUCCESS: "LOGIN/LOGIN_SUCCESS",
	LOGIN_FAILURE: "LOGIN/LOGIN_FAILURE",
	// 登录退出登录
	LOGOUT: "LOGIN/LOGOUT",
	// 输入手机号
  SET_USERNAME: "LOGIN/SET_USERNAME",
	// 输入密码
	SET_PASSWORD: "LOGIN/SET_PASSWORD"
};

// action creators
export const actions = {
  // 异步action, 执行登录
  login: () => {
    return (dispatch, getState) => {
      const { username, password } = getState().login;
      if (
        !(username && username.length > 0 && password && password.length > 0)
      ) {
        return dispatch(loginFailure("用户名和秘密不能为空！"));
      }
      dispatch(loginRequest());
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          dispatch(loginSuccess());
          resolve();
        }, 1000);
      });
    };
  },
  logout: () => ({
    type: types.LOGOUT
  }),
  setUsername: username => ({
    type: types.SET_USERNAME,
    username
  }),
  setPassword: password => ({
    type: types.SET_PASSWORD,
    password
  })
};

const loginRequest = () => ({
  type: types.LOGIN_REQUEST
});

const loginSuccess = () => ({
  type: types.LOGIN_SUCCESS
});

const loginFailure = error => ({
  type: types.LOGIN_FAILURE,
  error
});
```

## 定义Reducers
```javascript
// src/redux/modules/login.js
// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_REQUEST:
      return { ...state, isFetching: true };
    case types.LOGIN_SUCCESS:
      return { ...state, isFetching: false, status: true };
    case types.LOGIN_FAILURE:
      return { ...state, isFetching: false };
    case types.LOGOUT:
      return { ...state, status: false, username: "", password: "" };
    case types.SET_USERNAME:
      return { ...state, username: action.username };
    case types.SET_PASSWORD:
      return { ...state, password: action.password };
    default:
      return state;
  }
};

export default reducer;
```

最后我们将登录页面的`reducer`加入到总的`reducer`当中：
```javascript
// src/redux/modules/index.js
import login from "./login" // 1. 引入

//合并成根reducer
const rootReducer = combineReducers({
	...
  login // 2.使用
})

export default rootReducer
// selectors
export const getUsername = state => state.login.username;

export const getPassword = state => state.login.password;

export const isLogin = state => state.login.status;
```

## 连接redux和使用
我们在登录页来连接`redux`:
```javascript
// /src/containers/Login/index.js
import React, { Component } from "react";
import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";
import {
  getUsername,
  getPassword,
  isLogin,
  actions as loginActions
} from "../../redux/modules/login";
import { bindActionCreators } from "redux";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

class Login extends Component {
  render() {
    const { username, password, login } = this.props;
    if (login) {
      return <Redirect to="/user" />;
    }
    return (
      <div>
        <LoginHeader />
        <LoginForm
          username={username}
          password={password}
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }

  // input元素改变的响应函数
  handleChange = e => {
    if (e.target.name === "username") {
      this.props.loginActions.setUsername(e.target.value);
    } else if (e.target.name === "password") {
      this.props.loginActions.setPassword(e.target.value);
    }
  };

  // 登录
  handleSubmit = () => {
    this.props.loginActions.login();
  };
}

const mapStateToProps = (state, props) => {
  return {
    username: getUsername(state),
    password: getPassword(state),
    login: isLogin(state)
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    loginActions: bindActionCreators(loginActions, dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
```
最后我们回到登录页面的所有子组件，将静态页面进行修改即可。代码可以在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/Login/components)当中查看。

## 使用路由校验页面登录状态(重要)
有些页面是必须要在用户登录后才能进行访问的，比如说个人中心页面，还是购买页面等等，<font color=#1E90FF>所以我们需要在react router之上做一层封装</font>

我们创建<font color=#9400D3>PrivateRotue</font>组件，内容如下：
```javascript
// src/containers/PrivateRoute/index.js
import React, { Component } from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { isLogin } from "../../redux/modules/login";

class PrivateRoute extends Component {
  render() {
    const { component: Component, login, ...rest } = this.props;
    return (
      <Route
        {...rest}
        render={
					props => {
					return login ? ( <Component {...props} />) :
					(
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location } // 向登录页传递当前页面，以便登录成功后能返回到该页面
              }}
            />
          );
        }}
      />
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    login: isLogin(state)
  };
};

export default connect(
  mapStateToProps,
  null
)(PrivateRoute);
```
然后我们在之前书写的登录页面的逻辑就要稍微修改，在登录状态`login`为`true`的时候，如果组件有别的页面传递来的`state.from`属性我们就重定向回去，否则我们就重定向到个人中心：
```javascript
// src/containers/Login/index.js
class Login extends Component {
  render() {
    const { username, password, login, location: {state} } = this.props;
    if (login) {
      if(state && state.from) {
        return <Redirect to={state.from} /> {/*1. 重定向到需要登录的页面*/}
      }
      return <Redirect to="/user" />; {/* 2. 重定向到个人中心页面*/}
    }
    return (
			...
    );
  }
}

```

最后我们引入自定义的`PrivateRotue`:
```javascript
import PrivateRoute from "../PrivateRoute"; // 1. 引入
import User from "../User";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/user" component={User} /> {/* 2. 使用*/}
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

## 登录状态持久化(重要)
我们现在的登录状态只是保存在了`redux`当中，页面刷新之后，`redux`中的状态就被清空了，所以我们需要持久化存储，我们在`redux`当中修改一下登录模块的部分逻辑即可；
```javascript
// src/redux/modules/login.js
const initialState = {
  username: localStorage.getItem('username') || '', // 1. 获取用户名初始值的时候先看看localStorage当中有没有
  password: "",
  isFetching: false,
  status: localStorage.getItem('login') || false // 2. 登录态标识也是先从localStorage当中看看有没有
};

export const actions = {
  login: () => {
    return (dispatch, getState) => {
      const { username, password } = getState().login;
      if (
        !(username && username.length > 0 && password && password.length > 0)
      ) {
        return dispatch(loginFailure("用户名和秘密不能为空！"));
      }
      dispatch(loginRequest());
      return new Promise((resolve, reject) => {
        setTimeout(() => {
					dispatch(loginSuccess());
					// 3. 登录成功就将用户名和登录状态保存在localStorage当中
          localStorage.setItem('username', username);
          localStorage.setItem('login', true);
          resolve();
        }, 1000);
      });
    };
  },
  logout: () => {
		// 4. 退出登录的时候就从localStorage当中删除用户名和登录状态即可
    localStorage.removeItem('username');
    localStorage.removeItem('login');
    return {
      type: types.LOGOUT
    };
  },
};
```
在真实的开发当中，持久化存储要看是什么登录方式了，如果是后端也保存有登录状态，那就必须让前端登录状态和后端要保持一致。

## Redux DevTools
最后我们用合成的一张图来展示每次请求派发的`action`和对应`redux`中数据相应的变化：

<img :src="$withBase('/react_redux_login_reduxdev.png')" alt="">

