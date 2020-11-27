# 滑动组件优化

## 上拉/下拉加载更多实现
在这里`Scroll`基础组件的作用就展现出来了。之前我们封装了`Scroll`组件，监听上拉 / 下拉刷新的功能已编写完成，但是相应的`loading`效果并没有考虑。现在，我们就来先完善 `loading`效果。

```javascript
import Loading from '../loading/index';
```

将`return`部分的代码修改为:
```javascript
const PullUpdisplayStyle = pullUpLoading ? {display: ""} : { display:"none" };
const PullDowndisplayStyle = pullDownLoading ? { display: ""} : { display:"none" };
return (
  <ScrollContainer ref={scrollContaninerRef}>
    {props.children}
    {/* 滑到底部加载动画 */}
    <PullUpLoading style={ PullUpdisplayStyle }><Loading></Loading></PullUpLoading>
    {/* 顶部下拉刷新动画 */}
    <PullDownLoading style={ PullDowndisplayStyle }><LoadingV2></LoadingV2></PullDownLoading>
  </ScrollContainer>
);
```

注意`PullUpdisplayStyle`和`PullDowndisplayStyle`都是外部传入的，这就方便了我们控制`loading`的显示和隐藏。

其中`Loading`组件即之前编写的两圆交错的涟漪效果组件，但`LoadingV2`并没有编写，现在就花一点时间来开发第二个`Loading`效果。
```javascript
//baseUI/loading-v2/index.js
import React from 'react';
import styled, {keyframes} from'styled-components';
import style from '../../assets/global-style'

const dance = keyframes`
    0%, 40%, 100%{
      transform: scaleY (0.4);
      transform-origin: center 100%;
    }
    20%{
      transform: scaleY (1);
    }
`
const Loading = styled.div`
    height: 10px;
    width: 100%;
    margin: auto;
    text-align: center;
    font-size: 10px;
    >div {
      display: inline-block;
      background-color: ${style ["theme-color"]};
      height: 100%;
      width: 1px;
      margin-right:2px;
      animation: ${dance} 1s infinite;
    }
    >div:nth-child (2) {
      animation-delay: -0.4s;
    }
    >div:nth-child (3) {
      animation-delay: -0.6s;
    }
    >div:nth-child (4) {
      animation-delay: -0.5s;
    }
    >div:nth-child (5) {
      animation-delay: -0.2s;
    } 

`

function LoadingV2 () {
  return (
    <Loading>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <span > 拼命加载中...</span>
    </Loading>
  );
}

export default React.memo (LoadingV2);
```
现在在`scroll`组件中引入。
```javascript
//scroll/index.js
import Loading2 from '../loading-v2/index';
```

接下来，我们在`Singers/index.js`中，传入相应的参数即可。
```javascript
<Scroll
  pullUp={ handlePullUp }
  pullDown = { handlePullDown }
  pullUpLoading = { pullUpLoading }
  pullDownLoading = { pullDownLoading }
>
  { renderSingerList () }
</Scroll>
```

现在`handlePullUp`和`handlePullDown`两个方法，我们也在之前定义过了，在上一小节看即可。

## 防抖处理
当你频繁地下拉时，事实上事件回调函数也会被频繁触发，导致发送很多无意义的请求。因此这里对 `Scroll`基础组件做一下防抖处理。

防抖函数写在`api/utils.js`中:
```javascript
// 防抖函数
export const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    if (timer) {
      clearTimeout (timer);
    }
    timer = setTimeout (() => {
      func.apply(this, args);
      clearTimeout(timer);
    }, delay);
  }
}
```

然后在`scroll/index.js`当中：
```javascript
import { debounce } from "../../api/utils";

//...

let pullUpDebounce = useMemo(() => {
  return debounce(pullUp, 300)
}, [pullUp]);
// 千万注意，这里不能省略依赖，
// 不然拿到的始终是第一次 pullUp 函数的引用，相应的闭包作用域变量都是第一次的，产生闭包陷阱。下同。

let pullDownDebounce = useMemo (() => {
  return debounce (pullDown, 300)
}, [pullDown]);
// ...
// 之后直接调用 useMemo 返回的函数
// 滑动到底部
useEffect(() => {
    if(!bScroll || !pullUp) return;
    const handlePullUp = () => {
      //判断是否滑动到了底部
      if(bScroll.y <= bScroll.maxScrollY + 100){
        pullUpDebounce();
      }
    };
    bScroll.on('scrollEnd', handlePullUp);
    // 解绑
    return () => {
      bScroll.off('scrollEnd', handlePullUp);
    }
}, [pullUp, pullUpDebounce, bScroll]);

// 判断用户的下拉动作
useEffect(() => {
    if(!bScroll || !pullDown) return;
    const handlePullDown = (pos) => {
      //判断用户的下拉动作
      if(pos.y > 50) {
        pullDownDebounce();
      }
    };
    bScroll.on('touchEnd', handlePullDown);
    return () => {
      bScroll.off('touchEnd', handlePullDown);
    }
}, [pullDown, pullDownDebounce, bScroll]);
```
