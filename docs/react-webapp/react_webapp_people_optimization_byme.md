# 个人优化

## 跳转优化
和歌单详情页一样，每次进入的时候会闪现上一次进入的歌单详情页，原因我们这里再说一下：<font color=#1E90FF>进入歌手主页的时候，由于需要请求数据，请求数据后会将数据保存在redux当中，然后页面会根据redux当中的数据变化来进行UI渲染。但是在请求数据的期间，这个时候redux会保存上次歌手主页的内容，所以一进入就会有旧的内容，我们还是希望不要有这样的用户体验，我们希望每次进入都是一个加载过程和显示过程，这样比较正常</font>

至于歌手主页的内容缓存也没有必要，因为正常人进入歌手主页不会反复。

所以我们在`Singer/store`当中去添加一下内容：
```javascript
// Singer/store/actionCreator.js
// 清除redux当中关于Singer页面的歌手信息
export const deleteArtist = () => ({
  type: DELETE_ARTIST,
  data: fromJS({})
})

// 清除redux当中关于Singer页面的歌手歌曲信息
export const deleteSongs = () => ({
  type: DELETE_SONGS_OF_ARTIST,
  data: fromJS([])
})
```
```javascript
// Singer/store/constants.js
export const DELETE_ARTIST = 'singer/DELETE_ENTER_LOADING'
export const DELETE_SONGS_OF_ARTIST = 'singer/DELETE_SONGS_OF_ARTIST'
```
```javascript
// Singer/store/reducer.js
export default (state = defaultState, action) => {
  switch(action.type) {
		...
    case actionTypes.DELETE_ARTIST:
      return state.set('artist', action.data);
    case actionTypes.DELETE_SONGS_OF_ARTIST:
			return state.set('songsOfArtist', action.data);
		...
  }
}
```

然后我们在`UI`组件当中去传入：
```javascript
// Singer/index.js

function Singer(props) {
  const { deleteSingerCacheFromRedux } = props;
  useEffect(() => {
    ...

    // 组件卸载的时候删除redux中的数据
    return ()=> {
      deleteSingerCacheFromRedux()
    }
  }, []);
}


const mapDispatchToProps = dispatch => {
  return {
    ...
    // 添加清除缓存的方法
    deleteSingerCacheFromRedux() {
      dispatch(deleteSongs())
      dispatch(deleteArtist())
      dispatch(changeEnterLoading(true));
    }
  };
};
```

## 播放按钮优化
我们看网易云手机端，有个比较好的功能，歌曲列表最顶部的播放列表滑动到顶部的时候会固定在顶部，随着列表顶部脱离`header`的时候又能随着歌曲列表向下滑动，所以我们用一个最简单的方法，或者也是最笨的方式去实现：<font color=#1E90FF>将播放全部按钮部分抽象出来作为playAll组件，然后在SongsList组件和Singer组件当中分别引入，在Singer当中引入的playAll组件就固定在header组件的下方，然后根据SongsList组件的滑动情况去控制Singer中playAll的显示和消失即可</font>

### 1. playAll组件
首先将之前`SongsList`关于播放按钮相关的部分取出，进行抽象为`playAll`组件：
```javascript
// baseUI/playall/index.js
import React, { memo } from 'react'
import PropTypes from "prop-types"
import styled from 'styled-components';
import style from '../../assets/global-style';

const PlayAllWrapper = styled.div`
	box-sizing: border-box;
	padding: 10px 0;
	margin-left: 10px;
	position: relative;
	justify-content: space-between;
	border-bottom: 1px solid ${style["border-color"]};
	.play_all{
		display: inline-block;
		line-height: 24px;
		color: ${style["font-color-desc"]};
		.iconfont {
			font-size: 24px;
			margin-right: 10px;
			vertical-align: top;
		}
		.sum{
			font-size: ${style["font-size-s"]};
			color: ${style["font-color-desc-v2"]};
		}
		>span{
			vertical-align: top;
		}
	}
	.add_list,.isCollected {
		display: flex;
		align-items: center;
		position: absolute;
		right: 0; top :0; bottom: 0;
		width: 130px;
		line-height: 34px;
		background: ${style["theme-color"]};
		color: ${style["font-color-light"]};
		font-size: 0;
		border-radius: 3px;
		vertical-align: top;
		.iconfont {
			vertical-align: top;
			font-size: 10px;
			margin: 0 5px 0 10px;
		}
		span{
			font-size: 14px;
			line-height: 34px;
		}
	}
	.isCollected{
		display: flex;
		background: ${style["background-color"]};
		color: ${style["font-color-desc"]};
	}
`

function PlayAll(props) {
	const { totalCount, showCollect, collectCount } = props
	const { selectItem } = props

	const collect = (count) => {
    return  (
      <div className="add_list">
        <i className="iconfont">&#xe62d;</i>
        <span>收藏({Math.floor(count/1000)/10}万)</span>
      </div>
    )
  };

	return (
		<PlayAllWrapper>
			<div className="play_all" onClick={(e) => selectItem(e, 0)}>
				<i className="iconfont">&#xe6e3;</i>
				<span>播放全部 <span className="sum">(共{totalCount}首)</span></span>
			</div>
			{ showCollect ? collect(collectCount) : null}
		</PlayAllWrapper>
	)
}

PlayAll.propTypes = {
	selectItem: PropTypes.func,
	totalCount: PropTypes.number,
	showCollect: PropTypes.bool,
	collectCount: PropTypes.number
}

PlayAll.defaultProps = {
	selectItem: null,
	totalCount: 0,
	showCollect: false,
	collectCount: 0
}

export default memo(PlayAll)
```

### 2. 引入playAll组件
首先在`SongsList`组件当中进行引入：
```javascript
// application/SongsList/index.js
const SongsList = React.forwardRef((props, refs)=> {
  ...
  const selectItem = useCallback((e, index) => {
    console.log(index);
  }, [])

  useImperativeHandle(refs, () => ({
    // 向外暴露Singlist的selectItem方法
    playAllButtonClick(e) {
      selectItem(e, 0)
    }
  }));
  return (
    <SongList ref={refs} showBackground={props.showBackground}>
      <PlayAll
        totalCount={totalCount}
        showCollect={showCollect}
        collectCount={collectCount}
        selectItem={selectItem}
      />
      <SongItem>
        { songList(songs) }
      </SongItem>
    </SongList>
  )
});
```

然后在`Singer`组件当中去引入：
```javascript
function Singer(props) {
  const playAllButtonClick = useCallback((e)=> {
    songList.current.playAllButtonClick(e)
  },[])

  return (
    <CSSTransition>
      <Container>
        <Header></Header>
        {/* 放在header组件下方 */}
        <PlayAllPartWrapper ref={playAllParyWrapper}>
          <PlayAll
            showCollect={false}
            songs={songs}
            totalCount={songs.length}
            selectItem={playAllButtonClick}
          />
        </PlayAllPartWrapper>
        ...
      </Container>
    </CSSTransition>
  )
}
```
然后对应的`style.js`添加下面的代码：
```javascript
export const PlayAllPartWrapper = styled.div`
  position: fixed;
  top: 42px;
  z-index: 100;
  width: 100%;
  background: white;
  display: none;
`
```

### 3. 编写滑动逻辑
```javascript
function Singer(props) {
  // 拿到Singer组件中的playAll组件和SongsList组件
  const playAllParyWrapper = useRef()
  const songList = useRef()

  const handleScroll = useCallback(pos => {
    ...
    // 拿到DOM元素
    const playAllParyWrapperDOM = playAllParyWrapper.current

    if (newY > 0) {
      // 处理往下拉的情况，Singer组件当中的playAll组件不显示
      playAllParyWrapperDOM.style.display = 'none'
      ...
    } else if (newY >= minScrollY) {
      // 往上滑动，但是遮罩还没超过Header部分，Singer组件当中的playAll组件也不显示
      playAllParyWrapperDOM.style.display = 'none'
      ...
    } else if (newY < minScrollY) {
      //往上滑动，但是超过Header部分，Singer组件当中的playAll组件就要显示
      playAllParyWrapperDOM.style.display = 'block'
      ...
    }
  }, [])
}
```
