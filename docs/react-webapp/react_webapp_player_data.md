# 数据层开发

播放器是一个比较特别的组件，里面并没有涉及到`Ajax`的操作，反而全程都在依赖`store`里面的数据。因从，我们从数据层开始准备是一个比较明智的选择。

`application`目录下新建`Player`文件夹，然后新建`store`目录，开始`redux`层的开发。

## Redux层开发
### 1. actionCreators
```javascript
//store/actionCreators.js
import { SET_CURRENT_SONG, SET_FULL_SCREEN, SET_PLAYING_STATE, SET_SEQUECE_PLAYLIST, SET_PLAYLIST, SET_PLAY_MODE, SET_CURRENT_INDEX, SET_SHOW_PLAYLIST, DELETE_SONG, INSERT_SONG } from './constants';
import { fromJS } from 'immutable';

export const changeCurrentSong = (data) => ({
  type: SET_CURRENT_SONG,
  data: fromJS (data)
});

export const changeFullScreen =  (data) => ({
  type: SET_FULL_SCREEN,
  data
});

export const changePlayingState = (data) => ({
  type: SET_PLAYING_STATE,
  data
});

export const changeSequecePlayList = (data) => ({
  type: SET_SEQUECE_PLAYLIST,
  data: fromJS (data)
});

export const changePlayList  = (data) => ({
  type: SET_PLAYLIST,
  data: fromJS (data)
});

export const changePlayMode = (data) => ({
  type: SET_PLAY_MODE,
  data
});

export const changeCurrentIndex = (data) => ({
  type: SET_CURRENT_INDEX,
  data
});

export const changeShowPlayList = (data) => ({
  type: SET_SHOW_PLAYLIST,
  data
});
```

### 2. actionTypes
```javascript
//store/constants.js
export const SET_CURRENT_SONG = 'player/SET_CURRENT_SONG';
export const SET_FULL_SCREEN = 'player/SET_FULL_SCREEN';
export const SET_PLAYING_STATE = 'player/SET_PLAYING_STATE';
export const SET_SEQUECE_PLAYLIST = 'player/SET_SEQUECE_PLAYLIST';
export const SET_PLAYLIST = 'player/SET_PLAYLIST';
export const SET_PLAY_MODE = 'player/SET_PLAY_MODE';
export const SET_CURRENT_INDEX = 'player/SET_CURRENT_INDEX';
export const SET_SHOW_PLAYLIST = 'player/SET_SHOW_PLAYLIST';
```

### 3. reducers
```javascript
import * as actionTypes from './constants';
import {fromJS} from 'immutable';
import { playMode } from './../../../api/config';

const defaultState = fromJS ({
  fullScreen: false,// 播放器是否为全屏模式
  playing: false, // 当前歌曲是否播放状态
  sequencePlayList: [], // 顺序列表 (因为之后会有随机模式，列表会乱序，因从拿这个保存顺序列表)
  playList: [], // 播放列表
  mode: playMode.sequence,// 播放模式
  currentIndex: -1,// 当前歌曲在播放列表的索引位置
  showPlayList: false,// 是否展示播放列表
  currentSong: {} // 当前播放的歌曲
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_SONG:
      return state.set('currentSong', action.data);
    case actionTypes.SET_FULL_SCREEN:
      return state.set('fullScreen', action.data);
    case actionTypes.SET_PLAYING_STATE:
      return state.set('playing', action.data);
    case actionTypes.SET_SEQUECE_PLAYLIST:
      return state.set('sequencePlayList', action.data);
    case actionTypes.SET_PLAYLIST:
      return state.set('playList', action.data);
    case actionTypes.SET_PLAY_MODE:
      return state.set('mode', action.data);
    case actionTypes.SET_CURRENT_INDEX:
      return state.set('currentIndex', action.data);
    case actionTypes.SET_SHOW_PLAYLIST:
      return state.set('showPlayList', action.data);
    default:
      return state;
  }
}
```
其中`playMode`对象应该在`api/config.js`中定义:
```javascript
// 播放模式
export const playMode = {
  sequence: 0,
  loop: 1,
  random: 2
};
```

### 4. index
```javascript
//store/index.js
import reducer from './reducer'
import * as actionCreators from './actionCreators'
import * as constants from './constants'

export { reducer, actionCreators, constants };
```
然后在全局`store`当中去注册：
```javascript
// store/reducer.js
import { reducer as playerReducer } from "../application/Player/store/index";

export default combineReducers ({
  //...
  player: playerReducer
});
```

## 连接组件
```javascript
//Player/index.js
import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen
} from "./store/actionCreators";

function Player (props) {
  return (
    <div>Player</div>
  )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = state => ({
  fullScreen: state.getIn (["player", "fullScreen"]),
  playing: state.getIn (["player", "playing"]),
  currentSong: state.getIn (["player", "currentSong"]),
  showPlayList: state.getIn (["player", "showPlayList"]),
  mode: state.getIn (["player", "mode"]),
  currentIndex: state.getIn (["player", "currentIndex"]),
  playList: state.getIn (["player", "playList"]),
  sequencePlayList: state.getIn (["player", "sequencePlayList"])
});

// 映射 dispatch 到 props 上
const mapDispatchToProps = dispatch => {
  return {
    togglePlayingDispatch (data) {
      dispatch (changePlayingState (data));
    },
    toggleFullScreenDispatch (data) {
      dispatch (changeFullScreen (data));
    },
    togglePlayListDispatch (data) {
      dispatch (changeShowPlayList (data));
    },
    changeCurrentIndexDispatch (index) {
      dispatch (changeCurrentIndex (index));
    },
    changeCurrentDispatch (data) {
      dispatch (changeCurrentSong (data));
    },
    changeModeDispatch (data) {
      dispatch (changePlayMode (data));
    },
    changePlayListDispatch (data) {
      dispatch (changePlayList (data));
    }
  };
};

// 将 ui 组件包装成容器组件
export default connect (
  mapStateToProps,
  mapDispatchToProps
)(React.memo (Player));
```
对于这个组件来说，我们希望是一个全局的组件，所以我们应该将其放在一级路由对应的组件当中，也就是`Home`组件：
```javascript
import Player from '../Player';

return (
  //...
  //renderRoute 下面
  <Player></Player>
)
```

下一节我们就来完成动画相关的东西