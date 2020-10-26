# 优化和部署

## 集成Reselect
我们集成`Reselect`并不是所有的`Selectors`都要使用`Reselect`去代替，只有存在复杂计算，比较消耗性能的`Selectors`我们才有必要去集成`Reselect`，我们来对每个模块进行分析：

### 1. 购买模块(purchase)
```javascript
// src/redux/modules/purchase.js
//selectors
export const getQuantity = state => {
  return state.purchase.quantity;
};

export const getTipStatus = state => {
  return state.purchase.showTip;
};

export const getProduct = (state, id) => {
  return getProductDetail(state, id);
};
// Reselect
export const getTotalPrice = createSelector(
  [getProduct, getQuantity],
  (product, quantity) => {
    if (!product) {
      return 0;
    }
    return (product.currentPrice * quantity).toFixed(1);
  }
);
```
可以看到像`getQuantity`、`getTipStatus`等这种直接从`state`当中拿状态的`Selectors`没有必要修改，像计算总价是要根据购买数量`count`和单价来计算的，我们可以使用`Reselect`去优化。

### 2. 个人中心模块(user.js)
```javascript
import { getAllOrders } from "./entities/orders";
// selectors
export const getCurrentTab = state => state.user.currentTab;

const getUserOrders = state => state.user.orders;

// Reselect
export const getOrders = createSelector(
  [getCurrentTab, getUserOrders, getAllOrders],
  (tabIndex, userOrders, orders) => {
    const key = ["ids", "toPayIds", "availableIds", "refundIds"][tabIndex];
    const orderIds = userOrders[key];
    return orderIds.map(id => {
      return orders[id];
    });
  }
);
```

至于其他模块当中的`Reselect`我们就不一一展示了，这样要强调的两点就是，集成Reselect对性能的提升和两个方面有关
+ <font color=#DD1144>计算逻辑的复杂性</font>
+ <font color=#DD1144>相关状态的变更频率</font>

可以说：<font color=#1E90FF>计算逻辑的复杂性越高，相关状态的变更频率越快，集成Reselect给项目带来的优化就越明显</font>

## 组件按需加载(dynamic import)
组件按需加载是个老生常谈的问题了，不过我们还是要说一下，<font color=#1E90FF>我们通常使用的import，实际上不能算一个函数，可以算作一个运算符，通过提供的路径去异步加载内容，返回一个Promise，等待加载内容完成，Promise的状态就变成了完成</font>

我们可以对`import`进行进一步的封装，封装在一个函数当中，然后在项目当中不同的时候通过调用我们封装的函数，就能完成按需加载的需求。

```javascript
// src/utils/AsyncComponent.js
import React, {Component} from "react"

export default function asyncComponent(importComponent) {
  class AsyncComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        component: null
      }
    }

    componentDidMount() {
      importComponent().then((mod) => {
        this.setState({
          component: mod.default
        })
      })
    }

    render() {
      const C = this.state.component;
      return C ? <C {...this.props} /> : null
    }
  }

  return AsyncComponent
}
```
```javascript
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import ErrorToast from "../../components/ErrorToast";
import { actions as appActions, getError } from "../../redux/modules/app";
import AsyncComponent from "../../utils/AsyncComponent";
import PrivateRoute from "../PrivateRoute";

// 组件的按需加载
const Home = AsyncComponent(() => import("../Home"));
const ProductDetail = AsyncComponent(() => import("../ProductDetail"));
const Search = AsyncComponent(() => import("../Search"));
const SearchResult = AsyncComponent(() => import("../SearchResult"));
const Login = AsyncComponent(() => import("../Login"));
const User = AsyncComponent(() => import("../User"));
const Purchase = AsyncComponent(() => import("../Purchase"));

class App extends Component {
  render() {
    const {
      error,
      appActions: { clearError }
    } = this.props;
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/user" component={User} />
            <Route path="/detail/:id" component={ProductDetail} />
            <Route path="/search" component={Search} />
            <Route path="/search_result" component={SearchResult} />
            <PrivateRoute path="/purchase/:id" component={Purchase} />
            <Route path="/" component={Home} />
          </Switch>
        </Router>
        {error ? <ErrorToast msg={error} clearError={clearError} /> : null}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    error: getError(state)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    appActions: bindActionCreators(appActions, dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
```

之前我们访问首页的时候就会请求`bundle.js`，这里面包含所有`js`代码，而进行按需加载之后，每次访问一个新的页面就会重新加载想对应的`js`代码，而`bundle.js`实际上在按需加载的情况下就是项目的骨架代码而已。

我们现在对修改后的代码进行编译：

<img :src="$withBase('/react_redux_jiagou_build.png')" alt="">

可以看到对每个页面都进行的分片操作，也就是说每个页面都对对应对加载对应的`js`和`css`文件。所以说<font color=#DD1144>分片操作并不一定只能使用在路由划分不同的url的时候，实际上对于在同一个页面中我们可以对子组件进行按需加载，尤其是在滑动页面当中或者存在动态显示和隐藏组件的情况的时候，都可以分片</font>

## 本地部署
### 1. 根路径
+ 使用`npm run build`打包编译文件到`build`文件夹当中
+ 然后打开`nginx`的配置文件，添加一个服务：
	```javascript
	server {
		listen         8000;       // 8000端口
		server_name    localhost;  // 这里如果有域名，就写域名代替localhost
		location / {
			root         /user/local/var/web;   // 我们把前面build文件夹中的内容拷贝到该路径下
			index        index.html;  // /user/local/var/web/index.html
		  try_files    $uri /index.html; // 找不到路由的情况下匹配到index.html下，由路由在前端做重定向
		}
	}
	```

### 2. 子路径
要想将项目部署在某个子路径，比如`localhost:8000/dianping`这样的路径下，需要对项目本身做一些修改，对`nginx`也要做一下修改；
+ 我们打包出来的`build/index.html`当中，对静态资源的引用地址是以`/static`打头的，现在我们需要修改为以`/dianping/static`打头的地址，所以我们要做的第一个修改就是在`package.json`当中添加`homepage`这个配置项,注意要书写完成的前缀地址，如果是正式有域名，这里就要写正式的地址：
	```javascript
	"homepage": "http://localhost:8000/dianping"
	```

+ 另外我们在路由当中需要在每个路由前面添加`/dianping`前缀，我们可以这样修改：
	```javascript
	<Router basename="/dianping">
		<Switch>
		</Switch>
	</Router>
	```

+ 使用`npm run build`打包编译文件到`build`文件夹当中
+ 之前将`build`中的内容全部放在`/user/local/var/web`这个路径下，现在需要将`build`的内容放在`/user/local/var/web/dianping`目录下
+ `nginx`内容也需要改变：
	```javascript
	server {
		listen         8000;       // 8000端口
		server_name    localhost;  // 这里如果有域名，就写域名代替localhost
		location /dianping {
			root         /user/local/var/web;   // 我们把前面build文件夹中的内容拷贝到该路径下
			index        index.html;  // /user/local/var/web/index.html
		  try_files    $uri /dianping/index.html; // 找不到路由的情况下匹配到index.html下，由路由在前端做重定向
		}
		location /mock {
			root         /user/local/var/web/dianping;
		}
	}
	```
