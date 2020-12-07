# 个人优化

## 封装UI代码
现在`Album`里面的`JSX`过于庞大，影响可读性，可以做一下封装。

将复杂渲染的代码拆解如下:
```javascript
const renderTopDesc = () => {
  return (
    <TopDesc background={currentAlbum.coverImgUrl}>
      <div className="background">
        <div className="filter"></div>
      </div>
      <div className="img_wrapper">
        <div className="decorate"></div>
        <img src={currentAlbum.coverImgUrl} alt="" />
        <div className="play_count">
          <i className="iconfont play">&#xe885;</i>
          <span className="count">{getCount (currentAlbum.subscribedCount)}</span>
        </div>
      </div>
      <div className="desc_wrapper">
        <div className="title">{currentAlbum.name}</div>
        <div className="person">
          <div className="avatar">
            <img src={currentAlbum.creator.avatarUrl} alt="" />
          </div>
          <div className="name">{currentAlbum.creator.nickname}</div>
        </div>
      </div>
    </TopDesc>
  )
}

const renderMenu = () => {
  return (
    <Menu>
      <div>
        <i className="iconfont">&#xe6ad;</i>
        评论
      </div>
      <div>
        <i className="iconfont">&#xe86f;</i>
        点赞
      </div>
      <div>
        <i className="iconfont">&#xe62d;</i>
        收藏
      </div>
      <div>
        <i className="iconfont">&#xe606;</i>
        更多
      </div>
    </Menu>
  )
};

const renderSongList = () => {
  return (
    <SongList>
      <div className="first_line">
        <div className="play_all">
          <i className="iconfont">&#xe6e3;</i>
          <span > 播放全部 <span className="sum">(共 {currentAlbum.tracks.length} 首)</span></span>
        </div>
        <div className="add_list">
          <i className="iconfont">&#xe62d;</i>
          <span > 收藏 ({getCount (currentAlbum.subscribedCount)})</span>
        </div>
      </div>
      <SongItem>
        {
          currentAlbum.tracks.map ((item, index) => {
            return (
              <li key={index}>
                <span className="index">{index + 1}</span>
                <div className="info">
                  <span>{item.name}</span>
                  <span>
                    {getName (item.ar)} - {item.al.name}
                  </span>
                </div>
              </li>
            )
          })
        }
      </SongItem>
    </SongList>
  )
}

return (
  <CSSTransition
    in={showStatus}
    timeout={300}
    classNames="fly"
    appear={true}
    unmountOnExit
    onExited={props.history.goBack}
  >
    <Container>
      <Header ref={headerEl} title={title} handleClick={handleBack} isMarquee={isMarquee}></Header>
      {!isEmptyObject (currentAlbum) ?
        (
          <Scroll
            bounceTop={false}
            onScroll={handleScroll}
          >
            <div>
              { renderTopDesc () }
              { renderMenu () }
              { renderSongList () }
            </div>
          </Scroll>
        )
        : null
      }
      { enterLoading ? <Loading></Loading> : null}
    </Container>
  </CSSTransition>
)
```

## useCallback优化function props
将传给子组件的函数用`useCallback`包裹，这也是`useCallback`的常用场景。
```javascript
const handleBack = useCallback (() => {
  setShowStatus (false);
}, []);

const handleScroll = useCallback ((pos) => {
  //xxx
}, [currentAlbum]);
```
以此为例，如果不用`useCallback`包裹，父组件每次执行时会生成不一样的`handleBack`和`handleScroll`函数引用，那么子组件每一次`memo`的结果都会不一样，导致不必要的重新渲染，也就浪费了`memo`的价值。

因此`useCallback`能够帮我们在依赖不变的情况保持一样的函数引用，最大程度地节约浏览器渲染性能。

## 跳转优化
之前我们在`actionCreators`当中有一个`delectAlbumCacheFromRedux`，这个我们后来优化添加上去的，因为之前的效果是这样：<font color=#1E90FF>从主页点击某个推荐列表，会进入到详情页面，但是从详情页面返回去，再从主页进入另外一个详情页面，就会先显示之前那个详情页，然后瞬间变成当前的详情页，原因也很简单，前一个详情页的数据在当前详情页的数据还没有请求到的时候是一直存在的，等当前详情页的数据请求到之后瞬间在redux中代替之前的数据</font>

我们希望；<font color=#DD1144>在从某个详情页退出的时候，删除对于在redux当中的Album中的currentAlbum数据，这样进入一个新的详情页的时候，能正常的从进场动画开始到显示当前详情页的数据</font>

```javascript
useEffect(() => {
	getAlbumDataDispatch(id);
	// 组件卸载的时候去清空redux当中Album的
	return () => {
		deleteAblumCacheFromRedux()
	}
}, [getAlbumDataDispatch, id, deleteAblumCacheFromRedux]);
```

<font color=#9400D3>这里每进入一个详情页都要重新请求，哪怕你连续进了两次同样的歌单，这并不是什么错误，因为歌单很多，没有必须对每个详情都进行缓存，浏览器会根据地址自动缓存内容，所以我们这里只是从视觉的角度去优化了用户体验而已</font>