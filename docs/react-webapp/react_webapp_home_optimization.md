# 首页体验优化

::: tip
本小节包含两个技术专题，[图片懒加载](https://taopoppy.cn/react-redux/react_webapp_important_lazyload.html)和[Redux存储](https://taopoppy.cn/react-redux/react_webapp_important_reduxsave.html)，我们会在后续终极优化的时候，使用这两个专题的相关知识来彻底优化本节的代码，请尽请期待
:::

## 图片懒加载
在大量图片加载的情况下，会造成页面空白甚至卡顿，然而我们的视口就这么大，因此<font color=#1E90FF>只需要让视口内的图片显示即可，同时图片未显示的时候给它一个默认的src，让一张非常精简的图片占位</font>。这就是图片懒加载的原理。当然，在本项目中，我们采取一个成熟的方案<font color=#9400D3>react-lazyload</font>库，易上手，效果不错。

```javascript
npm install react-lazyload --save
```
```javascript
//components/list.js
import LazyLoad from "react-lazyload"; // 引入

//img 标签外部包裹一层 LazyLoad
<LazyLoad placeholder={<img width="100%" height="100%" src={require ('./music.png')} alt="music"/>}>
  <img src={item.picUrl + "?param=300x300"} width="100%" height="100%" alt="music"/>
</LazyLoad>
```

现在我们做到了视口内的图片显示真实资源，视口外则显示占位图片，那么当我们滑动的时候，如何让下面相应的图片显示呢？其实也相当简单，在`Recommend/index.js`中:
```javascript
// 引入 forceCheck 方法
import { forceCheck } from 'react-lazyload';

//scroll 组件中应用这个方法
<Scroll className="list" onScroll={forceCheck}>
...
```

## 进场loading效果
`Ajax`请求往往需要一定的时间，在这个时间内，页面会处于没有数据的状态，也就是空白状态，但是用户点击来的时候看见一片空白的时候心里是非常焦灼的，尤其是`Ajax`的请求时间长达几秒的时候，而`loading`效果便能减缓这种焦急的情绪，并且如果`loading`动画做的漂亮，还能够让人赏心悦目，让用户对`App`产生好感。

主要是利用了`CSS3`的`animation-delay`特性，让两个圆交错变化，产生一个涟漪的效果
```javascript
import React from 'react';
import styled, { keyframes } from'styled-components';
import style from '../../assets/global-style';

const loading = keyframes`
  0%, 100% {
    transform: scale(0.0);
  }
  50% {
    transform: scale(1.0);
  }
`
const LoadingWrapper = styled.div`
  >div {
    position: fixed;
    z-index: 1000;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 60px;
    height: 60px;
    opacity: 0.6;
    border-radius: 50%;
    background-color: ${style ["theme-color"]};
    animation: ${loading} 1.4s infinite ease-in;
  }
  >div:nth-child (2) {
    animation-delay: -0.7s;
  }
`

function Loading ()  {
  return (
    <LoadingWrapper>
      <div></div>
      <div></div>
    </LoadingWrapper>
  );
}

export default React.memo (Loading);
```
现在在`Recommend`组件中引入:
```javascript
import Loading from '../../baseUI/loading/index';

// 在返回的 JSX 代码中
<Content>
  ...
  <Loading></Loading>
<Content>
```

现在你可以看到屏幕中间的`loading`。接下来添加`Loading`的控制逻辑。

由于数据是异步获取，异步逻辑全在`redux-thunk`中执行，且`loading`和数据之间是一个联动的关系，因此`loading`的状态应放在`redux`管理。

首先，在`Recommend/store`下的`reducer.js`中:
```javascript
//reducer.js
const defaultState = fromJS ({
  ...
  enterLoading: true
});
```

添加`action`的`type`值常量：
```javascript
//constants.js
...
export const CHANGE_ENTER_LOADING = 'recommend/CHANGE_ENTER_LOADING';
```

添加`reducer`的逻辑:
```javascript
export default (state = defaultState, action) => {
  switch (action.type) {
    ...
    case actionTypes.CHANGE_ENTER_LOADING:
      return state.set ('enterLoading', action.data);
    default:
      return state;
  }
}
```

然后编写`action`：
```javascript
//actionCreators.js
...
export const changeEnterLoading = (data) => ({
  type: actionTypes.CHANGE_ENTER_LOADING,
  data
});
// 另外在获取推荐歌单后，应把 loading 状态改为 false
export const getRecommendList = () => {
  return (dispatch) => {
    getRecommendListRequest ().then (data => {
      dispatch (changeRecommendList (data.result));
      dispatch (changeEnterLoading (false));// 改变 loading
    }).catch (() => {
      console.log ("推荐歌单数据传输错误");
    });
  }
};
```

接下来在组件中应用这个`enterLoading`:
```javascript
//recommend/index.js
const mapStateToProps = (state) => ({
  ...
  enterLoading: state.getIn (['recommend', 'enterLoading'])
});
// 返回的 JSX 代码中应用它
<Content>
  ...
  { enterLoading ? <Loading></Loading> : null }
<Content>
```

## Redux数据缓存
其实还有一个细节需要我们来优化，就是你现在切换到歌手页面，然后切回到推荐页，你在浏览器的`Network`中会看到又发了两次网络请求，而这两次请求是完全没有必要的，纯属浪费性能。

其实操作起来也是非常简单的，只需要做一些小小的改动：
```javascript
//Recommend/index.js
useEffect (() => {
  // 如果页面有数据，则不发请求
  //immutable 数据结构中长度属性 size
  if (!bannerList.size){
    getBannerDataDispatch ();
  }
  if (!recommendList.size){
    getRecommendListDataDispatch ();
  }
}, []);
```

实际情况，关于`redux`的缓存我们会在专门的一个专题去讲：[Redux缓存](https://taopoppy.cn/react-redux/react_webapp_important_reduxsave.html)