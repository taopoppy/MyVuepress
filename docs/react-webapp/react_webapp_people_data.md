# 数据层开发

## axios请求准备
```javascript
//api/request.js
export const getSingerInfoRequest = id => {
  return axiosInstance.get (`/artists?id=${id}`);
};
```

## redux层开发
### 1. reducer
```javascript
// application/Singer/store/reducer.js
import * as actionTypes from './constants';
import { fromJS } from 'immutable';

const defaultState = fromJS({
  artist: {},
  songsOfArtist: [],
  loading: true
});

export default (state = defaultState, action) => {
  switch(action.type) {
    case actionTypes.CHANGE_ARTIST:
      return state.set('artist', action.data);
    case actionTypes.CHANGE_SONGS_OF_ARTIST:
      return state.set('songsOfArtist', action.data);
    case actionTypes.CHANGE_ENTER_LOADING:
      return state.set('loading', action.data);
    default:
      return state;
  }
}
```
### 2. index
```javascript
// application/Singer/store/index.js
import reducer from './reducer'
import * as actionCreators from './actionCreators'
import * as constants from './constants'

export { reducer, actionCreators, constants };
```

### 3. actionTypes
```javascript
// application/Singer/store/constants.js
export const CHANGE_ARTIST = 'singer/CHANGE_ARTIST';
export const CHANGE_SONGS_OF_ARTIST = 'singer/CHANGE_SONGS_OF_ARTIST';
export const CHANGE_ENTER_LOADING = 'singer/CHNAGE_ENTER_LOADING';
```

### 4. actionCreators
```javascript
// application/Singer/store/actionCreators.js
import { CHANGE_SONGS_OF_ARTIST, CHANGE_ARTIST, CHANGE_ENTER_LOADING } from './constants';
import { fromJS } from 'immutable';
import { getSingerInfoRequest } from './../../../api/request';

const changeArtist = (data) => ({
  type: CHANGE_ARTIST,
  data: fromJS(data)
});

const changeSongs = (data) => ({
  type: CHANGE_SONGS_OF_ARTIST,
  data: fromJS(data)
})
export const changeEnterLoading = (data) => ({
  type: CHANGE_ENTER_LOADING,
  data
})

export const getSingerInfo = (id) => {
  return dispatch => {
    getSingerInfoRequest(id).then(data => {
      dispatch(changeArtist(data.artist));
      dispatch(changeSongs(data.hotSongs));
      dispatch(changeEnterLoading(false));
    })
  }
}
```

## 组件连接Redux
首先，需要将`Singer`下的`reducer`注册到全局`store`，在`src`目录下的`store/reducer.js`中，内容如下:
```javascript
import { combineReducers } from 'redux-immutable';
import { reducer as recommendReducer } from '../application/Recommend/store/index';
import { reducer as singersReducer } from '../application/Singers/store/index';
import { reducer as rankReducer } from '../application/Rank/store/index';
import { reducer as albumReduimport { reducer as singerInfoReducer } from "../application/Singer/store/index";
import { reducer as singerInfoReducer } from "../application/Singer/store/index";

export default combineReducers ({
  recommend: recommendReducer,
  singers: singersReducer ,
  rank: rankReducer,
  album: albumReducer,
  singerInfo: singerInfoReducer
});
```
现在在`Singer/index.js`中，准备连接`Redux`。增加代码：
```javascript
import { connect } from 'react-redux';
import { getSingerInfo, changeEnterLoading } from "./store/actionCreators";

// 组件代码省略

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = state => ({
  artist: state.getIn (["singerInfo", "artist"]),
  songs: state.getIn (["singerInfo", "songsOfArtist"]),
  loading: state.getIn (["singerInfo", "loading"]),
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = dispatch => {
  return {
    getSingerDataDispatch (id) {
      dispatch (changeEnterLoading (true));
      dispatch (getSingerInfo (id));
    }
  };
};

// 将 ui 组件包装成容器组件
export default connect (mapStateToProps,mapDispatchToProps)(React.memo (Singer));
```
同时组件代码做如下添加:
```javascript
// 记得删除 mock 数据

const {
  artist: immutableArtist,
  songs: immutableSongs,
  loading,
} = props;

const { getSingerDataDispatch } = props;

const artist = immutableArtist.toJS ();
const songs = immutableSongs.toJS ();
```

最后请求数据的代码，我们和初始化布局的代码写在一起，并且增加`loading`：
```javascript
import Loading from "./../../baseUI/loading/index";

function Singer(props) {
	useEffect (() => {
		const id = props.match.params.id;
		getSingerDataDispatch (id);
		// 之前写的 UI 处理逻辑省略
	}, []);

	return (
		//Container 组件下面
		{ loading ? (<Loading></Loading>) : null}
	)
}
```
