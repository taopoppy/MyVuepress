# 排行榜模块

::: danger
css分析
+ <font color=#9400D3>  &::after</font>：伪元素`after`可以在元素的内容之后插入新内容。
	+ 本节当中使用伪元素的原因是因为在`flex`布局当中，最后一行如果有两个元素，按照`space-between`的分布，会在两边存在元素，中间留出空白，所以通过伪元素，给最后一行再添加一个元素，这样最后一样实际就是三个元素，依旧按照3个均匀排列
:::

## 数据层开发
### 1. axios请求代码
在`api/request.js`中，添加以下代码:
```javascript
export const getRankListRequest = () => {
  return axiosInstance.get (`/toplist/detail`);
};
```

### 2. redux层开发
排行榜单可以说是整个应用中就数据层而言最简单的一个组件。因此`redux`的代码我们集中在一个文件中。
```javascript
//rank/store/index.js
import { fromJS } from 'immutable';
import { getRankListRequest } from '../../../api/request';

//constants
export const CHANGE_RANK_LIST = 'home/rank/CHANGE_RANK_LIST';
export const CHANGE_LOADING = 'home/rank/CHANGE_LOADING';

//actionCrreator
const changeRankList = (data) => ({
  type: CHANGE_RANK_LIST,
  data: fromJS (data)
})

export const getRankList = () => {
  return dispatch => {
    getRankListRequest ().then (data => {
      let list = data && data.list;
      dispatch (changeRankList (list));
      dispatch (changeLoading (false));
    })
  }
}

const changeLoading = (data) => ({
  type: CHANGE_LOADING,
  data
})

//reducer
const defaultState = fromJS ({
  rankList: [],
  loading: true
})

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case CHANGE_RANK_LIST:
      return state.set ('rankList', action.data);
    case CHANGE_LOADING:
      return state.set ('loading', action.data);
    default:
      return state;
  }
}

export { reducer };
```

### 3. 组件连接redux
先在全局`store`注册:
```javascript
//src/store/reducer.js
import { combineReducers } from 'redux-immutable';
import { reducer as recommendReducer } from '../application/Recommend/store/index';
import { reducer as singersReducer } from '../application/Singers/store/index';
import { reducer as rankReducer } from '../application/Rank/store/index';

export default combineReducers ({
  // 之后开发具体功能模块的时候添加 reducer
  recommend: recommendReducer,
  singers: singersReducer ,
  rank: rankReducer
});
```
然后让`rank`组件连接`redux`:
```javascript
import React, { useEffect } from 'react';
import { connect } from 'react-redux';

function Rank (props) {

}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
  rankList: state.getIn (['rank', 'rankList']),
  loading: state.getIn (['rank', 'loading']),
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    getRankListDataDispatch () {
      dispatch (getRankList ());
    }
  }
};

export default connect (mapStateToProps, mapDispatchToProps)(React.memo (Rank));
```

## Rank组件开发
### 1. JSX部分
组件样式和逻辑的开发都比较简单，只不过其中对于官方榜和全球榜的数据是在一个接口当中，我们需要做一下区分而已：
```javascript
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getRankList } from './store/actionCreators.js'
import Loading from '../../baseUI/loading';
import {
  List,
  ListItem,
  SongList,
  Container
} from './style';
import Scroll from '../../baseUI/scroll/index';
import { EnterLoading } from './../Singers/style';
import { filterIndex, filterIdx } from '../../api/utils';
import { renderRoutes } from 'react-router-config';
function Rank(props) {
  const { rankList:list, loading } = props;

  const { getRankListDataDispatch } = props;

  let rankList = list ? list.toJS() : [];

  useEffect(() => {
    if(!rankList.length){
      getRankListDataDispatch();
    }
    // eslint-disable-next-line
  }, []);

  let globalStartIndex = filterIndex(rankList);
  let officialList = rankList.slice(0, globalStartIndex);
  let globalList = rankList.slice(globalStartIndex);

  const enterDetail = (name) => {
      const idx = filterIdx(name);
      if(idx === null) {
        alert("暂无相关数据");
        return;
      }
  }
  const renderSongList = (list) => {
    return list.length ? (
      <SongList>
        {
          list.map((item, index) => {
            return <li key={index}>{index+1}. {item.first} - {item.second}</li>
          })
        }
      </SongList>
    ) : null;
  }
  const renderRankList = (list, global) => {
    return (
      <List globalRank={global}>
       {
        list.map((item) => {
          return (
            <ListItem key={item.coverImgId + item.coverImgUrl} tracks={item.tracks} onClick={() => enterDetail(item.name)}>
              <div className="img_wrapper">
                <img src={item.coverImgUrl} alt=""/>
                <div className="decorate"></div>
                <span className="update_frequecy">{item.updateFrequency}</span>
              </div>
              { renderSongList(item.tracks)  }
            </ListItem>
          )
       })
      }
      </List>
    )
  }

  let displayStyle = loading ? {"display":"none"}:  {"display": ""};
  return (
    <Container>
      <Scroll>
        <div>
          <h1 className="offical" style={displayStyle}>官方榜</h1>
            { renderRankList(officialList) }
          <h1 className="global" style={displayStyle}>全球榜</h1>
            { renderRankList(globalList, true) }
          { loading ? <EnterLoading><Loading></Loading></EnterLoading> : null }
        </div>
      </Scroll>
      {renderRoutes(props.route.routes)}
    </Container>
    );
}
```
### 2. CSS部分
`style.js`中:
```javascript
import styled from'styled-components';
import style from '../../assets/global-style';

// Props 中的 globalRank 和 tracks.length 均代表是否为全球榜

export const Container = styled.div`
  position: fixed;
  top: 90px;
  bottom: 0;
  width: 100%;
  .offical,.global {
    margin: 10px 5px;
    padding-top: 15px;
    font-weight: 700;
    font-size: ${style["font-size-m"]};
    color: ${style["font-color-desc"]};
  }
`;
export const List = styled.ul`
  margin-top: 10px;
  padding: 0 5px;
  display: ${props => props.globalRank ? "flex": "" };
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  background: ${style ["background-color"]};
  &::after {
    content:"";
    display:block;
    width: 32vw;
  }
`
export const ListItem = styled.li`
  display: ${props => props.tracks.length ? "flex": ""};
  padding: 3px 0;
  border-bottom: 1px solid ${style ["border-color"]};
  .img_wrapper {
    width:  ${props => props.tracks.length ? "27vw": "32vw"};
    height: ${props => props.tracks.length ? "27vw": "32vw"};
    border-radius: 3px;
    position: relative;
    .decorate {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 35px;
      border-radius: 3px;
      background: linear-gradient (hsla (0,0%,100%,0),hsla (0,0%,43%,.4));
    }
    img {
      width: 100%;
      height: 100%;
      border-radius: 3px;
    }
    .update_frequecy {
      position: absolute;
      left: 7px;
      bottom: 7px;
      font-size: ${style["font-size-ss"]};
      color: ${style["font-color-light"]};
    }
  }
`;
export const SongList = styled.ul`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 10px 10px;
  >li {
    font-size: ${style["font-size-s"]};
    color: grey;
  }
`;
```

### 3. 工具部分
相关的工具函数我们在`api/utils.js`当中提供；
```javascript
// 处理数据，找出第一个没有歌名的排行榜的索引
export const filterIndex = rankList => {
  for (let i = 0; i < rankList.length - 1; i++) {
    if (rankList[i].tracks.length && !rankList[i + 1].tracks.length) {
      return i + 1;
    }
  }
};

//找出排行榜的编号
export const filterIdx = name => {
  for (var key in RankTypes) {
    if (RankTypes[key] === name) return key;
  }
  return null;
};
```
