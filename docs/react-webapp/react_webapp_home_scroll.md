# Scroll组件封装

## better-scroll
有关使用`better-scroll`的介绍我们推荐这个[博客](https://better-scroll.github.io/docs/zh-CN/guide/)，下面我们根据这个博客当中的一些内容来先介绍一下：

### 1. BetterScroll
`BetterScroll`是一款重点解决移动端（已支持 PC）各种滚动场景需求的插件。它的核心是借鉴的`iscroll`的实现，它的 API 设计基本兼容`iscroll`，在`iscroll`的基础上又扩展了一些`feature`以及做了一些性能优化。

`BetterScroll`是使用纯`JavaScript`实现的，这意味着它是无依赖的

### 2. 滚动原理
`BetterScroll`最常见的应用场景是列表滚动，我们来看一下它的`html`结构。
```javascript
<div class="wrapper">
  <ul class="content">
    <li>...</li>
    <li>...</li>
    ...
  </ul>
  <!-- 这里可以放一些其它的 DOM，但不会影响滚动 -->
</div>
```

上面的代码中`BetterScroll`是作用在外层`wrapper`容器上的，滚动的部分是`content`元素。这里要注意的是，`BetterScroll`默认处理容器（`wrapper`）的第一个子元素（`content`）的滚动，其它的元素都会被忽略。

最简单的初始化代码如下：
```javascript
import BScroll from '@better-scroll/core'
let wrapper = document.querySelector('.wrapper')
let scroll = new BScroll(wrapper)
```
<font color=#1E90FF>BetterScroll提供了一个类，实例化的第一个参数是一个原生的DOM对象。当然，如果传递的是一个字符串，BetterScroll内部会尝试调用querySelector去获取这个DOM对象。</font>

浏览器的滚动原理是这样的：

<font color=#9400D3> 浏览器的滚动条大家都会遇到，当页面内容的高度超过视口高度的时候，会出现纵向滚动条；当页面内容的宽度超过视口宽度的时候，会出现横向滚动条。也就是当我们的视口展示不下内容的时候，会通过滚动条的方式让用户滚动屏幕看到剩余的内容。</font>

`BetterScroll`也是一样的原理，我们可以用一张图更直观的感受一下：

<img src="https://better-scroll.github.io/docs/assets/images/schematic.png" alt="" class="medium-zoom-image">

<font color=#9400D3>绿色部分为 wrapper，也就是父容器，它会有固定的高度。黄色部分为 content，它是父容器的第一个子元素，它的高度会随着内容的大小而撑高。那么，当 content 的高度不超过父容器的高度，是不能滚动的，而它一旦超过了父容器的高度，我们就可以滚动内容区了，这就是 BetterScroll 的滚动原理</font>

关于`BetterScroll`的使用和配置，我们可以继续参照上面那个[博客](https://better-scroll.github.io/docs/zh-CN/guide/)或者[github](https://github.com/ustbhuangyi/better-scroll)

## Scroll组件
根据上面对`BetterScroll`组件的原理讲解后，我们现在来封装自己的`Scroll`组件：

### 1. Scroll轮廓
首先我们来下载`better-scroll`：
```javascript
// 安装 better-scroll
npm install better-scroll@next --save
```
我们依然采用函数式组件的形式进行开发，不过作为一个通用组件，`scroll`组件在业务中会被经常取到原生`DOM`对象，而函数式组件天生不具备被上层组件直接调用`ref`的条件，因此需要用`React`当中一些特殊的方式来处理，即使用`forwardRef`进行包裹。

```javascript
const Scroll = forwardRef ((props, ref) => {
  // 编写组件内容
})
```

至于它需要哪些`props`，我们要根据自己的业务，结合`better-scroll`的部分必要配置参数，一起来决定一下：
```javascript
Scroll.propTypes = {
  direction: PropTypes.oneOf (['vertical', 'horizental']),// 滚动的方向
  click: PropTypes.bool,// 是否支持点击
  refresh: PropTypes.bool,// 是否刷新
  onScroll: PropTypes.func,// 滑动触发的回调函数
  pullUp: PropTypes.func,// 上拉加载逻辑
  pullDown: PropTypes.func,// 下拉加载逻辑
  pullUpLoading: PropTypes.bool,// 是否显示上拉 loading 动画
  pullDownLoading: PropTypes.bool,// 是否显示下拉 loading 动画
  bounceTop: PropTypes.bool,// 是否支持向上吸顶
  bounceBottom: PropTypes.bool// 是否支持向下吸底
};
```
相对应的我们给这些参数赋予默认值：
```javascript
Scroll.defaultProps = {
  direction: "vertical",
  click: true,
  refresh: true,
  onScroll:null,
  pullUpLoading: false,
  pullDownLoading: false,
  pullUp: null,
  pullDown: null,
  bounceTop: true,
  bounceBottom: true
};
```
同时，我们直接在组件内部解构出`props`:
```javascript
const { direction, click, refresh, pullUpLoading, pullDownLoading, bounceTop, bounceBottom } = props;
const { pullUp, pullDown, onScroll } = props;
```

上面关于静态类型检查，可以参照[静态类型检查](https://taopoppy.cn/react-redux/react_base_guanwang_typecheck.html#propstypes)去学习。

### 2. Scroll内核
首先我们根据`better-scroll`官网的写法，我们知道需要在组件当中去拿到一个`DOM`对象，作为`better-scroll`实例对象的第一个参数，父组件或者去子组件，而且子组件必须是`DOM`对象，就必须用到`useRef`，而且`better-scroll`实例对象还整个组件过程中需要用到它的好多属性和方法，我们需要保存；

```javascript
//better-scroll 实例对象
const [bScroll, setBScroll] = useState ();
//current 指向初始化 bs 实例需要的 DOM 元素 
const scrollContaninerRef = useRef ();
```

接着就是按照`better-scroll`官网写法创建一个实例，并且配置它：
```javascript
useEffect (() => {
  const scroll = new BScroll (scrollContaninerRef.current, {
    scrollX: direction === "horizental",
    scrollY: direction === "vertical",
    probeType: 3,
    click: click,
    bounce:{
      top: bounceTop,
      bottom: bounceBottom
    }
  });
  setBScroll (scroll);
  return () => {
    setBScroll (null);
  }
}, []);
```

每次重新渲染都要刷新实例，防止无法滑动:
```javascript
useEffect (() => {
  if (refresh && bScroll){
    bScroll.refresh ();
  }
});
```

给实例绑定`scroll`事件，
```javascript
useEffect (() => {
  if (!bScroll || !onScroll) return;
  bScroll.on ('scroll', (scroll) => {
    onScroll (scroll);
  })
  return () => {
    bScroll.off ('scroll');
  }
}, [onScroll, bScroll]);
```

进行上拉到底的判断，调用上拉刷新的函数
```javascript
useEffect (() => {
  if (!bScroll || !pullUp) return;
  bScroll.on ('scrollEnd', () => {
    // 判断是否滑动到了底部
    if (bScroll.y <= bScroll.maxScrollY + 100){
      pullUp ();
    }
  });
  return () => {
    bScroll.off ('scrollEnd');
  }
}, [pullUp, bScroll]);
```

进行下拉的判断，调用下拉刷新的函数
```javascript
useEffect (() => {
  if (!bScroll || !pullDown) return;
  bScroll.on ('touchEnd', (pos) => {
    // 判断用户的下拉动作
    if (pos.y > 50) {
      pullDown ();
    }
  });
  return () => {
    bScroll.off ('touchEnd');
  }
}, [pullDown, bScroll]);
```

最后我们封装一个组件，必须向外暴露组件的方法和组件内部的一些重要的实例：
```javascript
// 一般和 forwardRef 一起使用，ref 已经在 forWardRef 中默认传入
useImperativeHandle(ref, () => ({
  // 给外界暴露 refresh 方法
  refresh () {
    if (bScroll) {
      bScroll.refresh ();
      bScroll.scrollTo (0, 0);
    }
  },
  // 给外界暴露 getBScroll 方法，提供 bs 实例
  getBScroll () {
    if (bScroll) {
      return bScroll;
    }
  }
}));
```
按照这样的写法，`Scroll`的父组件通过给`Scroll`组件传递`ref`属性，就能使用子组件`Scroll`的方法：
```javascript
// 上层组件代码
function FatherComp(props) {
  const scrollRef = useRef ();

  const refreshScroll = useCallBack(()=> {
    scrollRef.current.refresh() // 父组件可以直接通过ref调用子组件暴露出的方法
  },[])

  return (
    <Scroll ref={scrollRef}></Scroll>
  )

}
```
+ 关于上述`useRef`和`useImperativeHandle`的使用方法请参照[Hook API](https://taopoppy.cn/react-redux/react_base_guanwang_hook5.html)
+ 而`forWardRef`和`useImperativeHandle`涉及到`ref`转发的知识，请参照[Refs](https://taopoppy.cn/react-redux/react_base_guanwang_refs.html)

最后是UI的渲染工作：
```javascript
return (
  <ScrollContainer ref={scrollContaninerRef}>
    {props.children}
  </ScrollContainer>
);


// 样式
const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`
```

### 3. Scroll应用
`scroll`组件已经初步实现。但是，这还不够。还有一些细节，比如防抖，`loading` 控制等等，后期会一步一步完善。更重要的是，我们还需要将它运用到项目中，进入到`Recommend`目录下的`index.js`，函数返回的`JSX`代码变化如下：
```javascript
<Content>
  <Scroll className="list">
    <div>
      <Slider bannerList={bannerList}></Slider>
      <RecommendList recommendList={recommendList}></RecommendList>
    </div>
  </Scroll>
</Content>
```
在`Recommend`目录下的`style.js`当中添加代码：
```javascript
import styled from'styled-components';

export const Content = styled.div`
  position: fixed;
  top: 90px;
  bottom: 0;
  width: 100%;
`
```

::: danger
这里要说明两点：
+ <font color=#DD1144>需要Content的原因就是better-scroll的原理并不复杂，就是在容器元素高度固定，当子元素高度超过容器元素高度时，通过 transfrom 动画产生滑动效果，因此它的使用原则就是外部容器必须是固定高度，不然没法滚动。所以这里的Content可以看得到实际上是固定高度，因为除了我们之前在Home定义的Top和Tab组件之外，Content组件就占了剩下视口剩余的部分，所以其实是定长。而Scroll就在Content这个定长的父组件当中展示滑动效果</font>

+ <font color=#DD1144>Slider轮播图和RecommendList推荐组件两者外部要用一个div来包裹，整体作为Scroll组件内部的第一个元素，这个在better-scroll原理当中我们已经说了，这个它规定的</font>
:::

关于下拉的时候，我们希望中间的一段空白能变成默认的背景颜色，比较简单的做法就是将`Slider`组件中的红色背景向上拉长，这样顶部下拉会展示被遮住的红色背景，红色背景从而遮住了白色，我们修改一下：`src/components/slider/style.js`
```css
.before {
  position: absolute;
  top: -300px;
  height: 400px;
  width: 100%;
  background: ${style["theme-color"]};
}
```
这样下拉间隙就变成了主题色了，至于原因，我们用下面的这个图来说明一下：

<img :src="$withBase('/react_webapp_before.png')" alt="图解">

我们可以看到左边是从最大的角度分析的`Home`首页的组件分布，右边是`Recommend`组件当中组件的分布，按照一比一的对应关系，你可以看到`before`的高度是有400px的,上面的300px是不在`Content`组件内的，所以看不见，你一开始能看见的只是下面露出来的100px，而这100px还只是充当了`Slider`的部分背景。但是往下滑动的时候，你看到的红色部分实际就是上面一开始看不到的那300px的`before`，也就是图中用虚线框住的部分。