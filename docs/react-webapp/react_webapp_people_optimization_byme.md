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
