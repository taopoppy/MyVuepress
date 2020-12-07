# 歌单数据层

## axios请求准备
在`api/request.js`中加入:
```javascript
export const getAlbumDetailRequest = id => {
  return axiosInstance.get (`/playlist/detail?id=${id}`);
};
```

## redux层开发
```javascript
// Album/store/actionCreators.js
import { CHANGE_CURRENT_ALBUM, CHANGE_ENTER_LOADING, DELETE_CURRENT_ALBUM } from './constants';
import { getAlbumDetailRequest } from '../../../api/request';
import { fromJS } from 'immutable';


// 修改歌单数据
const changeCurrentAlbum = (data) => ({
  type: CHANGE_CURRENT_ALBUM,
  data: fromJS(data)
});

// 修改歌单页面进入状态
export const changeEnterLoading = (data) => ({
  type: CHANGE_ENTER_LOADING,
  data
});

// 清除当前关于Album在Redux中缓存
export const delectAlbumCacheFromRedux = () => ({
	type: DELETE_CURRENT_ALBUM,
	data: fromJS({})
});

export const getAlbumList = (id) => {
  return dispatch => {
    getAlbumDetailRequest(id).then (res => {
      let data = res.playlist;
      dispatch(changeCurrentAlbum(data));
      dispatch(changeEnterLoading(false));
    }).catch (() => {
      console.log("获取album数据失败！")
    });
  }
};
```
```javascript
// Album/store/constants.js
export const CHANGE_CURRENT_ALBUM = 'album/CHANGE_CURRENT_ALBUM';
export const CHANGE_ENTER_LOADING = 'album/CHANGE_ENTER_LOADING';
export const DELETE_CURRENT_ALBUM = 'album/DELETE_CURRENT_ALBUM'
```
```javascript
// Album/store/index.js
import reducer from './reducer'
import * as actionCreators from './actionCreators'

export { reducer, actionCreators };
```

```javascript
// Album/store/reducer.js
import * as actionTypes from './constants';
import { fromJS } from 'immutable';

const defaultState = fromJS({
  currentAlbum: {},
  enterLoading: false,
})

export default (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.CHANGE_CURRENT_ALBUM:
      return state.set('currentAlbum', action.data);
    case actionTypes.CHANGE_ENTER_LOADING:
			return state.set('enterLoading', action.data);
		case actionTypes.DELETE_CURRENT_ALBUM:
			return state.set('currentAlbum',action.data)
    default:
      return state;
  }
};
```

## 组件连接Redux
首先，需要将`Album`下的`reducer`注册到全局`store`，在`src`目录下的`store/reducer.js`中，内容如下:
```javascript
import { combineReducers } from 'redux-immutable';
import { reducer as recommendReducer } from '../application/Recommend/store/index';
import { reducer as singersReducer } from '../application/Singers/store/index';
import { reducer as rankReducer } from '../application/Rank/store/index';
import { reducer as albumReducer } from '../application/Album/store/index';

export default combineReducers ({
  recommend: recommendReducer,
  singers: singersReducer ,
  rank: rankReducer,
  album: albumReducer
});

```

现在在`Album/index.js`中，准备连接`Redux`。 增加代码:
```javascript
import { connect } from 'react-redux';

// 组件代码

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
  currentAlbum: state.getIn (['album', 'currentAlbum']),
  enterLoading: state.getIn (['album', 'enterLoading']),
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    getAlbumDataDispatch (id) {
      dispatch (changeEnterLoading (true));
      dispatch (getAlbumList (id));
    },
  }
};

// 将 ui 组件包装成容器组件
export default connect (mapStateToProps, mapDispatchToProps)(React.memo (Album)
```

## 组件对接真实数据
在组件代码当中：
```javascript
import React, {useState, useCallback, useRef, useEffect} from 'react';
import { getAlbumList, changeEnterLoading } from './store/actionCreators';

// 从路由中拿到歌单的 id
const id = props.match.params.id;

const { currentAlbum:currentAlbumImmutable, enterLoading } = props;
const { getAlbumDataDispatch } = props;

useEffect (() => {
  getAlbumDataDispatch (id);
}, [getAlbumDataDispatch, id]);

// 同时将 mock 数据的代码删除
let currentAlbum = currentAlbumImmutable.toJS ();
```

最后我们添加进场动画：
```javascript
import Loading from '../../baseUI/loading/index';

// 在 Container 样式组件中添加
{ enterLoading ? <Loading></Loading> : null}
```

## 榜单详情复用
榜单详情页基本上可以复用`Album`，所以我们直接去申明路由：
```javascript
//rank 部分 
{
  path: "/rank/",
  component: Rank,
  key: "rank",
  routes: [
    {
      path: "/rank/:id",
      component: Album
    }
  ]
},
```
在`Rank/index.js`当中：
```javascript
// 实现跳转路由函数
const enterDetail = (detail) => {
  props.history.push (`/rank/${detail.id}`)
}

// 绑定事件
<ListItem key={item.coverImgId} tracks={item.tracks} onClick={() => enterDetail (item)}>
```

