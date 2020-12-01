# 个人优化

::: danger
css分析
+ <font color=#9400D3>&:active</font>：元素在被激活的链接样式
:::

关于优化，我们这里会在开发过程中随时随地进行，有的优化可以立刻做，有的优化需要大面积的重构，我们最后都会做；
+ <font color=#1E90FF>切换种类置顶</font>
+ <font color=#1E90FF>回到顶部</font>
+ <font color=#1E90FF>记录滑动点</font>

## 切换种类置顶
我们优化的原因是因为：<font color=#1E90FF>我们之前开发的时候会发现，在点击不同种类近些切换歌手列表的时候，如果之前列表有滑动，重新刷新的时候列表依旧处于之前的滑动的地方，我们希望我们在看完男歌手的列表的时候，切换到女歌手的时候能回到列表顶部</font>

因为我们在之前的`src/baseUI/scroll/index.js`当中书写过这么一段代码：
```javascript
  useImperativeHandle(ref, () => ({
    refresh() {
      if(bScroll) {
        bScroll.refresh();
        bScroll.scrollTo(0, 0);
      }
    },
    getBScroll() {
      if(bScroll) {
        return bScroll;
      }
    }
  }));
```
其中的`refresh`函数可以被`scroll`组件的父组件拿去使用，因为`useImperativeHandle`可以让你在使用`ref`时自定义暴露给父组件的实例值，这些`Ref`和`useImperativeHandle`相关的知识，这里不做赘述。所以我们可以在`scr/application/Singers/index.js`当中去在切换列表数据的时候去使用这个`refresh`函数回到列表顶部：
```javascript
function Singers(props) {
	...
  const scrollContaninerRef = useRef() // 1. 使用useRef

  let handleUpdateAlpha = useCallback((val) => {
    dispatch({type: CHANGE_ALPHA, data: val})
    updateDispatch(singertype, singerarea, val);
    scrollContaninerRef.current.refresh() // 3. 回到顶部
  },[dispatch,singertype, singerarea]);

  let handleUpdateSingerArea = useCallback((val) => {
    dispatch({type: CHANGE_AREA, data: val})
    updateDispatch(singertype, val, singeralpha);
    scrollContaninerRef.current.refresh() // 3. 回到顶部
  }, [dispatch,singertype,singeralpha]);

  let handleUpdateSingerType = useCallback((val) => {
    dispatch({type: CHANGE_TYPE, data: val})
    updateDispatch(val,singerarea, singeralpha);
    scrollContaninerRef.current.refresh() // 3. 回到顶部
    // eslint-disable-next-line
  }, [dispatch,singerarea,singeralpha])

	...
  return (
    <div>
      ...
      <ListContainer>
        <Scroll
          ref={scrollContaninerRef} // 2. 拿到scroll实例
          pullUp={ handlePullUp }
          pullDown = { handlePullDown }
          pullUpLoading = { pullUpLoading }
          pullDownLoading = { pullDownLoading }
          onScroll={forceCheck}
        >
          { renderSingerList() }
        </Scroll>
        <Loading show={enterLoading}></Loading>
      </ListContainer>
    </div>
  )
}
```
这样整了之后，切换列表的时候是先回到顶部，然后重新请求数据。

## 回到顶部
<font color=#1E90FF>因为歌手列表是一个不断能加载新数据的列表，为了丰富功能，我们希望在列表的右下角有个按钮，可以点击帮助我们回到顶部，另外我们还希望在0.5秒左右回到顶部，整个过程是滑动的动画</font>。

首先我们在`scroll/index.js`当中添加下面的代码：
```javascript
useImperativeHandle(ref, () => ({
    ...
    // 动画回到顶部
    backtopWithAnimition() {
      if(bScroll) {
        let nowY = bScroll.y
        let step = nowY / 50
        let scrollInterval = setInterval(() => {
          nowY = nowY - step
          // console.log(nowY)
          if(nowY < 0) {
            bScroll.scrollTo(0, nowY)
          } else {
						bScroll.scrollTo(0, 0)
            clearInterval(scrollInterval)
          }
        }, 10)
      }
    },
  }));
```
我们在`useImperativeHandle`这个`hook`当中添加了`backtopWithAnimition`回到顶部的方法，这个方法中我们希望执行的间隔为10毫秒，然后执行50次，这样就是500毫秒，也就是0.5秒。然后执行50次，每次滑动的距离就是总距离/50，在代码中也就是`step`这个变量。

最后我们到歌手列表当中去使用：
```javascript
// src/application/Singers/index.js
function Singers(props) {
  ...
  // 点击函数
  const goBackTop = useCallback(() => {
    scrollContaninerRef.current.backtopWithAnimition()
  }, [scrollContaninerRef])


  return (
    <div>
      ...
      <BackTop onClick={ goBackTop }><span>︽</span></BackTop> {/* 点击按钮 */}
    </div>
  )
}
```
样式我们在`style.js`当中添加即可：
```javascript
export const BackTop = styled.div`
  position: fixed;
  bottom: 30px; right: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin: auto;
  font-size: larger;
  font-weight: bolder;
  color: ${style["font-color-light"]};
  background-color: ${style["theme-color"]};
  box-shadow: ${style["theme-color-shadow"]};
  &:active {
    color: ${style["font-color-desc"]};
  }
  >span {
    position:relative;
    top: -5px;
  }
`
```

## 记录滑动点
<font color=#1E90FF>在切换推荐、歌手、排行榜的时候会发现一个问题，就是在每切换到一个新的tab的时候都会处于列表顶部，我们希望处于推荐页的时候滑动了一段距离，切换到歌手页后再切换回来希望依旧处于推荐页之前滑动的地方，而且我们希望这种行为是短暂的，因为如果你仔细去看虾米，网易云你就会发现，在短时间当中切换tab是会保存每个tab的状态，包括滑动的距离，而如果处于某个tab页很久后，再切换到另一个tab，另一个tab之前的状态都不存在了，而是重新请求，刷新最新的数据</font>

未完待续...