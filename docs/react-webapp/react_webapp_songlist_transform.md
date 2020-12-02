# 切页动画

## 构建路由
### 1. 路由配置
榜单详情页面在这里我们需要构建一个专门的路由，目前我们就以推荐歌单的数据来完成详情页开发。

我们先在`routes/index.js`中：
```javascript
import Album from '../application/Album';

// 在 /recommend 后面加上子路由
{
  path: "/recommend",
  component: Recommend,
  routes: [
    {
      path: "/recommend/:id",
      component: Album
    }
  ]
},
```

然后在`Recommend`组件当中加入子路由的渲染逻辑：
```javascript
import { renderRoutes } from 'react-router-config';

// 返回的 JSX
<Content>
  // 其他代码
  // 将目前所在路由的下一层子路由加以渲染
  { renderRoutes(props.route.routes) }
</Content>
```

### 2. 跳转配置
我们首先在`component/list/index.js`中设置跳转：
```javascript
const enterDetail = (id) => {
  props.history.push(`/recommend/${id}`)
}
// 加入事件绑定逻辑
<ListItem key={item.id} onClick={() => enterDetail(item.id)}>
//...
```

注意，这里`List`组件作为`Recommend`的子组件，并不能从`props`拿到`history`变量，无法跳转路由。有两种解决方法：
+ <font color=#1E90FF>将Recommend组件中props对象中的history属性传给List组件</font>
+ <font color=#1E90FF>将List组件用withRouter包裹</font>

这里我们用第二种方式:
```javascript
//List/index.js
import { withRouter } from 'react-router-dom';

// 省略组件代码

// 包裹
export default React.memo(withRouter(RecommendList));
```

### 3. Album组件开发
但是，`Album`组件现在并没有编写。简单来写一下:
```javascript
//src/application/Album/index.js
import React from 'react';
import {Container} from './style';

function Album (props) {
  return (
    <Container>
    </Container>
  )
}

export default Album;
```
在同目录下的`style.js`：
```javascript
import styled from'styled-components';
import style from '../../assets/global-style';

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: #fff;
`
```

## 动画实现
本项目所有的过渡动画采用成熟的第三方库`react-transition-group`。首先安装:
```javascript
npm install react-transition-group --save
```
接下来我们来初步地使用:
```javascript
//Album/index.js
import React, {useState} from 'react';
import {Container} from './style';
import { CSSTransition } from 'react-transition-group';

function Album (props) {
  const [showStatus, setShowStatus] = useState (true);

  return (
    <CSSTransition
      in={showStatus}
      timeout={500}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={props.history.goBack}
    >
      <Container>
      </Container>
    </CSSTransition>
  )
}

export default React.memo (Album);
```
<font color=#1E90FF>关于react-transition-group的使用在我们最前面也讲到过，具体参照</font>[React的动画效果](https://taopoppy.cn/react-redux/react_advanced_three.html#react-transition-group)

然后在相应的`style.js`中:
```javascript
import styled from'styled-components';
import style from '../../assets/global-style';

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: ${style ["background-color"]};
  // 动画样式代码
  transform-origin: right bottom;
  &.fly-enter, &.fly-appear {
    transform: rotateZ (30deg) translate3d (100%, 0, 0);
  }
  &.fly-enter-active, &.fly-appear-active {
    transition: transform .3s;
    transform: rotateZ (0deg) translate3d (0, 0, 0);
  }
  &.fly-exit {
    transform: rotateZ (0deg) translate3d (0, 0, 0);
  }
  &.fly-exit-active {
    transition: transform .3s;
    transform: rotateZ (30deg) translate3d (100%, 0, 0);
  }
`
```

这个切入的动画就完成了。同样离开页面的时候，也有切出的动画。要检验整个效果，我们先来准备好路由的跳转。

## Header组件开发
由于比较简单，就直接贴上`Header`组件的代码了。
```javascript
//baseUI/header/index.js
import React from 'react';
import styled from'styled-components';
import style from '../../assets/global-style';
import PropTypes from "prop-types";

const HeaderContainer = styled.div`
  position: fixed;
  padding: 5px 10px;
  padding-top: 0;
  height: 40px;
  width: 100%;
  z-index: 100;
  display: flex;
  line-height: 40px;
  color: ${style ["font-color-light"]};
  .back {
    margin-right: 5px;
    font-size: 20px;
    width: 20px;
  }
  >h1 {
    font-size: ${style ["font-size-l"]};
    font-weight: 700;
  }
`
// 处理函数组件拿不到 ref 的问题，所以用 forwardRef
const Header = React.forwardRef ((props, ref) => {
  const { handleClick, title} = props;
  return (
    <HeaderContainer ref={ref}>
      <i className="iconfont back"  onClick={handleClick}>&#xe655;</i>
      <h1>{title}</h1>
    </HeaderContainer>
  )
})

Header.defaultProps = {
  handleClick: () => {},
  title: "标题",
};

Header.propTypes = {
  handleClick: PropTypes.func,
  title: PropTypes.string,
};

export default React.memo(Header);
```
现在在`Album`组件中直接使用:
```javascript
// 先引入
import  Header  from './../../baseUI/header/index';
const handleBack = () => {
  setShowStatus (false);
};

//Container 组件下声明 Header
// 前面代码省略
<Header title={"返回"} handleClick={handleBack}></Header>
```

<font color=#9400D3>这里有个特别要注意的点就是：当我们通过点击返回按钮的时候，先触发的动画效果，动画完毕之后触发钩子函数onExited，然后进行路由跳转，返回到Recommend组件页面。但是如果在真机上，你如果直接使用手机上的返回键，就没有动画效果，当前组件会被直接卸载，所以要注意这个区别</font>

<font color=#DD1144>可以对于css知识比较匮乏的同学，如果自己来写这种动画效果会比较吃力，实话说，我也不太会，所以我会在专题当中来讲解如果将react-transition-group和animate.css做结合</font>