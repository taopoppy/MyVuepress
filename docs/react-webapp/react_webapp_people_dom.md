# DOM交互逻辑

## 初始化布局
由于歌曲列表是相对于`Container`绝对定位且`top`为 0，因此初始化时，我们将歌曲列表的`top`设置为整个图片的高度，这样上面就是图片，下面就是歌曲列表，歌曲列表正好处在图片下方，不然列表就会与图片重叠。
```javascript
// 记得引入相关 hooks 函数，下不赘述

//...

const collectButton = useRef ();
const imageWrapper = useRef ();
const songScrollWrapper = useRef ();
const songScroll = useRef ();
const header = useRef ();
const layer = useRef ();
// 图片初始高度
const initialHeight = useRef (0);

// 往上偏移的尺寸，露出圆角
const OFFSET = 5;

useEffect (() => {
  let h = imageWrapper.current.offsetHeight;
  songScrollWrapper.current.style.top = `${h - OFFSET} px`;
  initialHeight.current = h;
  // 把遮罩先放在下面，以裹住歌曲列表
  layer.current.style.top = `${h - OFFSET} px`;
  songScroll.current.refresh ();
  //eslint-disable-next-line
}, []);

const setShowStatusFalse = useCallback (() => {
  setShowStatus (false);
}, []);

//JSX
<Container>
  <Header
    handleClick={setShowStatusFalse}
    title={artist.name}
    ref={header}
  ></Header>
  <ImgWrapper ref={imageWrapper} bgUrl={artist.picUrl}>
    <div className="filter"></div>
  </ImgWrapper>
  <CollectButton ref={collectButton}>
    <i className="iconfont">&#xe62d;</i>
    <span className="text"> 收藏 </span>
  </CollectButton>
  <BgLayer ref={layer}></BgLayer>
  <SongListWrapper ref={songScrollWrapper}>
    <Scroll ref={songScroll}>
      <SongsList
        songs={artist.hotSongs}
        showCollect={false}
      ></SongsList>
    </Scroll>
  </SongListWrapper>
</Container>
```

## 交互逻辑实现
`JS`交互主要是滑动屏幕时的逻辑，现在有了`scroll`基础组件，我们可以直接写在`onScroll`的回调中。
```javascript
<Scroll onScroll={handleScroll} ref={songScroll}>
//...
```
这里面需要一些`DOM`操作，我们先把`DOM`对象取出来。
```javascript
import { HEADER_HEIGHT } from "./../../api/config";
const handleScroll = pos => {
    let height = initialHeight.current;
    const newY = pos.y;
    const imageDOM = imageWrapper.current;
    const buttonDOM = collectButton.current;
    const headerDOM = header.current;
    const layerDOM = layer.current;
    const minScrollY = -(height - OFFSET) + HEADER_HEIGHT;

    // 指的是滑动距离占图片高度的百分比
    const percent = Math.abs (newY /height);
}
```
在歌手页的布局中，歌单列表其实是没有自己的背景的，`layerDOM`其实是起一个遮罩的作用，给歌单内容提供白色背景 因此在处理的过程中，随着内容的滚动，遮罩也跟着移动。

滑动主要分三种情况:
### 1. 下拉
处理往下拉的情况，效果：图片放大，按钮跟着偏移
```javascript
if (newY > 0) {
  imageDOM.style ["transform"] = `scale (${1 + percent})`;
  buttonDOM.style ["transform"] = `translate3d (0, ${newY}px, 0)`;
  layerDOM.style.top = `${height - OFFSET + newY}px`;
}
```

### 2. 上拉（1）
往上滑动，但是遮罩还没超过`Header`部分:
```javascript
else if (newY >= minScrollY) {
  layerDOM.style.top = `${height - OFFSET - Math.abs (newY)}px`;
  // 这时候保证遮罩的层叠优先级比图片高，不至于被图片挡住
  layerDOM.style.zIndex = 1;
  imageDOM.style.paddingTop = "75%";
  imageDOM.style.height = 0;
  imageDOM.style.zIndex = -1;
  // 按钮跟着移动且渐渐变透明
  buttonDOM.style ["transform"] = `translate3d (0, ${newY}px, 0)`;
  buttonDOM.style ["opacity"] = `${1 - percent * 2}`;
}
```

### 3. 上拉（2）
往上滑动，但是遮罩超过`Header`部分
```javascript
else if (newY < minScrollY) {
  // 往上滑动，但是超过 Header 部分
  layerDOM.style.top = `${HEADER_HEIGHT - OFFSET}px`;
  layerDOM.style.zIndex = 1;
  // 防止溢出的歌单内容遮住 Header
  headerDOM.style.zIndex = 100;
  // 此时图片高度与 Header 一致
  imageDOM.style.height = `${HEADER_HEIGHT}px`;
  imageDOM.style.paddingTop = 0;
  imageDOM.style.zIndex = 99;
}
```

但是别忘了，`handleScroll`作为一个传给子组件的方法，我们需要用`useCallback`进行包裹，防止不必要的重渲染
```javascript
const handleScroll = useCallback (pos => {
  // 具体代码
}, []);
```

