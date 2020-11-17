# 项目骨架搭建

初始项目的搭建主要分为三个部分进行:

+ <font color=#1E90FF>路由的配置和应用部分</font>

+ <font color=#1E90FF>公共组件的开发</font>

+ <font color=#1E90FF>redux 的 store 创建和引入</font>


## 路由配置
首先安装依赖；
```javascript
npm install react-router react-router-dom react-router-config --save
```
现在我们在`routes`目录下新建`index.js`文件，利用`react-router-config`来对路由进行配置。
```javascript
// src/routes/index.js
import React from 'react';
import { Redirect } from "react-router-dom";
import Home from '../application/Home';
import Recommend from '../application/Recommend';
import Singers from '../application/Singers';
import Rank from '../application/Rank';

export default [
  {
    path: "/",
    component: Home,
    routes: [
      {
        path: "/",
        exact: true,
        render: () => (
          <Redirect to={"/recommend"}/>
        )
      },
      {
        path: "/recommend",
        component: Recommend
      },
      {
        path: "/singers",
        component: Singers
      },
      {
        path: "/rank",
        component: Rank
      }
    ]
  }
]
```

为了让路由文件生效，必须在`App`根组件下面导入路由配置，现在在`App.js`中:
```javascript
// src/App.js
import React from 'react';
import { GlobalStyle } from  './style';
import { IconStyle } from './assets/iconfont/iconfont';
import { renderRoutes } from 'react-router-config';// 1. renderRoutes 读取路由配置转化为 Route 标签
import routes from './routes/index.js'; // 2. 引入路由配置
import { HashRouter } from 'react-router-dom'; // 3. 使用哈希路由

function App () {
  return (
    <HashRouter>
      <GlobalStyle></GlobalStyle>
      <IconStyle></IconStyle>
      { renderRoutes (routes) } {/*4. 使用方法将我们的配置转换成Router组件*/}
    </HashRouter>
  )
}

export default App;
```

最后我们建立路由中引入的组件：
```javascript
//src/appliction/Home/index.js
import React from 'react';
import { renderRoutes } from "react-router-config";

function Home (props) {
  const { route } = props;

  return (
    <div>
      <div>Home</div>
      { renderRoutes (route.routes) }
    </div>
  )
}

export default React.memo (Home);
```
你可以看到`"home"`已经显示到屏幕，但是这还不够，我们需要展示下面的功能组件，但是你在地址后面加上`/recommend`，却并没有显示`Recommend`组件相应的内容，因为`renderRoutes`这个方法只渲染一层路由，之前`Home`处于数组第一层，后面的功能组件在第二层，当然不能正常渲染啦。其实要解决这个问题也非常简单，只需在`Home`中再次调用`renderRoutes`即可。

::: tip
我们可以看到，上述这种路由的配置和我们之前在[React-Router基本思想](https://taopoppy.cn/react-redux/jiagou_sign_four.html#react-router%E5%9F%BA%E6%9C%AC%E6%80%9D%E6%83%B3)，虽然方式不太一样，最终都是要转换成Router组件的，只不过在这里我们是通过写配置，配置通过react-router-config转换成了Route组件，而在[React-Router基本思想](https://taopoppy.cn/react-redux/jiagou_sign_four.html#react-router%E5%9F%BA%E6%9C%AC%E6%80%9D%E6%83%B3)当中我们是直接写Router组件的
:::

## 公共组件开发
<font color=#1E90FF>**① 全局样式准备**</font>

现在开始写样式了，为了统一风格，需要一些全局样式配置，在`assets`目录下新建`global-style.js`, 内容如下:
```javascript
// src/assets/global-style.js
// 扩大可点击区域
const extendClick = () => {
  return `
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: -10px; bottom: -10px; left: -10px; right: -10px;
    };
  `
}
// 一行文字溢出部分用... 代替
const noWrap = () => {
  return `
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  `
}

export default {
  'theme-color': '#d44439',
  'theme-color-shadow': 'rgba (212, 68, 57, .5)',
  'font-color-light': '#f1f1f1',
  'font-color-desc': '#2E3030',
  'font-color-desc-v2': '#bba8a8',// 略淡
  'font-size-ss': '10px',
  'font-size-s': '12px',
  'font-size-m': '14px',
  'font-size-l': '16px',
  'font-size-ll': '18px',
  "border-color": '#e4e4e4',
  'background-color': '#f2f3f4',
  'background-color-shadow': 'rgba (0, 0, 0, 0.3)',
  'highlight-background-color': '#fff',
  extendClick,
  noWrap
}
```

<font color=#1E90FF>**② 顶部栏开发**</font>

首先，在`Home`目录下新建`style.js`，创建`CSS`样式组件:
```javascript
import styled from'styled-components';
import style from '../../assets/global-style';

export const Top = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px 10px;
  background: ${style ["theme-color"]};
  &>span {
    line-height: 40px;
    color: #f1f1f1;
    font-size: 20px;
    &.iconfont {
      font-size: 25px;
    }
  }
`
export const Tab = styled.div`
  height: 44px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  background: ${style ["theme-color"]};
  a {
    flex: 1;
    padding: 2px 0;
    font-size: 14px;
    color: #e4e4e4;
    &.selected {
      span {
        padding: 3px 0;
        font-weight: 700;
        color: #f1f1f1;
        border-bottom: 2px solid #f1f1f1;
      }
    }
  }
`
export const TabItem = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`
```
然后最终在`Home`组件当中使用；
```javascript
import React from 'react';
import { renderRoutes } from "react-router-config";
import { Top, Tab, TabItem,} from './style';
import { NavLink } from 'react-router-dom'; // 利用NavLink组件进行路由跳转，它比Link组件的好处是能给选中的组件添加class

function Home (props){
  const { route } = props;

  return (
    <div>
      <Top>
        <span className="iconfont menu">&#xe65c;</span>
        <span className="title">Web App</span>
        <span className="iconfont search">&#xe62b;</span>
      </Top>
      <Tab>
        <NavLink to="/recommend" activeClassName="selected"><TabItem><span > 推荐 </span></TabItem></NavLink>
        <NavLink to="/singers" activeClassName="selected"><TabItem><span > 歌手 </span></TabItem></NavLink>
        <NavLink to="/rank" activeClassName="selected"><TabItem><span > 排行榜 </span></TabItem></NavLink>
      </Tab>
      { renderRoutes (route.routes) }
    </div>
  );
}

export default React.memo (Home);
```

## redux 准备
安装相关依赖：
```javascript
npm install redux redux-thunk redux-immutable react-redux immutable --save
```

在`store`文件夹下面新建`index.js`:
```javascript
// src/store/index.js
import { createStore, compose, applyMiddleware } from "redux"
import thunk from 'redux-thunk'
import reducer from './reducer.js'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, composeEnhancers(
	applyMiddleware(thunk)
))

export default store
```

然后在`store`文件夹下面新建`reducer.js`:
```javascript
// src/store/reducer.js
import { combineReducers } from 'redux'

// 测试用的子reducer
const moduleReducer = (state={},action) => {
	return state
}

export default combineReducers({
	// 这里添加子reducer
	moduleReducer
})
```
