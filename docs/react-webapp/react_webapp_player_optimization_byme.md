# 个人优化

## mini播放器底部遮挡

当`mini`播放器不出现的时候，还能够正常看到底部，但一出现，最下面就被遮住了，每个页都是如此。为什么？因为之前布局都是用`bottom: 0`，但是在`mini`播放器出现后我们需要 改变这个`bottom`值，`miniPlayer`高度为`60px`，我们把`bottom`设为`60px`，等于把下面的`60px`高度留给播放器。

因此对于每个页面`Container`的`bottom`值有无播放器需要分开处理。那怎么判断有无播放器出现呢？

有一个很简单的方式，就是判断当前`playList`的长度，如果大于0则正在播放，等于0则没有。

以`Recommend`组件为例:
```javascript
function Recommend (props){
  const { songsCount } = props;
  //...

  <Content play={songsCount}>
  //...
}

const mapStateToProps = (state) => ({
  //...
  songsCount: state.getIn (['player', 'playList']).size,// 尽量减少toJS操作，直接取 size属性就代表了list的长度
});
//...
```
相应`style.js`中:
```javascript
import styled from'styled-components';

export const Content = styled.div`
  position: fixed;
  top: 90px;
  bottom: ${props => props.play > 0?"60px": 0};  // 显示mini播放器的时候底部bottom就要上提60px
  width: 100%;
`
```

然后在`Singer`、`Singers`、`Rank`、`Album`组件中也是相同的操作。

## 频繁切歌导致的异常
如果频繁切换歌曲，会出现<font color=#DD1144>Uncaught (in promise) DOMException</font>这样的异常：

解决的原理：其实从`audio`标签拿到`src`加载到能够播放之间有一个缓冲的过程，只有当控件能够播放时才能够切到下一首。如果在这个缓冲过程中切歌就会报错。现在就来具体地来解决这个问题:

```javascript
//Player/index.js
const songReady = useRef(true);

useEffect(() => {
  if (
    !playList.length ||
    currentIndex === -1 ||
    !playList [currentIndex] ||
    playList [currentIndex].id === preSong.id ||
    !songReady.current// 标志位为 false
  )
    return;
  let current = playList [currentIndex];
  setPreSong (current);
  songReady.current = false; // 把标志位置为 false, 表示现在新的资源没有缓冲完成，不能切歌
  changeCurrentDispatch (current);// 赋值 currentSong
  audioRef.current.src = getSongUrl (current.id);
  setTimeout(() => {
    // 注意，play 方法返回的是一个 promise 对象
    audioRef.current.play ().then(() => {
      songReady.current = true;
    });
  });
  togglePlayingDispatch (true);// 播放状态
  setCurrentTime (0);// 从头开始播放
  setDuration ((current.dt/ 1000) | 0);// 时长
}, [playList, currentIndex]);
```
同时再做一下异常处理:

```javascript
const handleError = () => {
  songReady.current = true;
  alert ("播放出错");
};

<audio
  //...
  onError={handleError}
></audio>
```
这样就能放心切歌，不会有报错啦！
