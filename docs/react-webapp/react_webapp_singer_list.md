# 歌手列表

## 列表样式
### 1. JSX部分
进入`Singers/index.js`, 增加以下代码:
```javascript
// 渲染函数，返回歌手列表
const renderSingerList = () => {
  return (
    <List>
      {
        singerList.map ((item, index) => {
          return (
            <ListItem key={item.accountId+""+index}>
              <div className="img_wrapper">
                <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music"/>
              </div>
              <span className="name">{item.name}</span>
            </ListItem>
          )
        })
      }
    </List>
  )
};
```
然后将返回的`JSX`代码做一些改动：
```javascript
return (
  <div>
    <NavContainer>
      <Horizen
        list={categoryTypes}
        title={"分类 (默认热门):"}
        handleClick={(val) => handleUpdateCatetory (val)}
        oldVal={category}></Horizen>
      <Horizen
        list={alphaTypes}
        title={"首字母:"}
        handleClick={val => handleUpdateAlpha (val)}
        oldVal={alpha}></Horizen>
    </NavContainer>
    <ListContainer>
      <Scroll>
        { renderSingerList () }
      </Scroll>
    </ListContainer>
  </div>
)
```
### 2. CSS部分
然后我们在`Singers/style.js`当中添加如下代码；
```javascript
export const ListContainer = styled.div`
  position: fixed;
  top: 160px;
  left: 0;
  bottom: 0;
  overflow: hidden;
  width: 100%;
`;

export const List = styled.div`
  display: flex;
  margin: auto;
  flex-direction: column;
  overflow: hidden;
  .title {
    margin:10px 0 10px 10px;
    color: ${style ["font-color-desc"]};
    font-size: ${style ["font-size-s"]};
  }
`;
export const ListItem = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  margin: 0 5px;
  padding: 5px 0;
  align-items: center;
  border-bottom: 1px solid ${style ["border-color"]};
  .img_wrapper {
    margin-right: 20px;
    img {
      border-radius: 3px;
      width: 50px;
      height: 50px;
    }
  }
  .name {
    font-size: ${style ["font-size-m"]};
    color: ${style ["font-color-desc"]};
    font-weight: 500;
  }
`;
```

## 数据层开发
### 1. axios请求部分
进入到`api/request.js`中，加入下面的请求代码:
```javascript
// 热门歌手列表
export const getHotSingerListRequest = (count) => {
  return axiosInstance.get(`/top/artists?offset=${count * 50}`);
}

// 获取歌手列表
export const getSingerListRequest= (type, area, alpha, count) => {
  return axiosInstance.get(`/artist/list?type=${type}&area=${area}&initial=${alpha? alpha.toLowerCase(): ''}&offset=${count * 30}`);
}
```
这就是我们目前需要的全部`ajax`请求。

### 2. Redux层开发
在这里我们会添加一些新的业务逻辑，比如上拉/下拉/进场加载动画的控制、列表页数的控制，大家看到不要感到奇怪。

在`Singers`目录下，新建`store`文件夹，然后新建以下文件:
```javascript
actionCreators.js //放不同action的地方
constants.js      //常量集合，存放不同action的type值
index.js          //用来导出reducer，action
reducer.js        //存放initialState和reducer函数
```

<font color=#1E90FF>**① 1.声明初始化state**</font>

初始化`state`在`reducer`中进行:
```javascript
//reducer.js
import { fromJS } from 'immutable';

const defaultState = fromJS({
  singerList: [],
  enterLoading: true,     //控制进场Loading
  pullUpLoading: false,   //控制上拉加载动画
  pullDownLoading: false, //控制下拉加载动画
  pageCount: 0            //这里是当前页数，我们即将实现分页功能
});
```

<font color=#1E90FF>**② 2.定义constants**</font>

```javascript
export const CHANGE_SINGER_LIST = 'singers/CHANGE_SINGER_LIST';
export const CHANGE_PAGE_COUNT = 'singers/PAGE_COUNT';
export const CHANGE_ENTER_LOADING = 'singers/ENTER_LOADING';
export const CHANGE_PULLUP_LOADING = 'singers/PULLUP_LOADING';
export const CHANGE_PULLDOWN_LOADING = 'singers/PULLDOWN_LOADING';
```

<font color=#1E90FF>**③ 3.定义reducer函数**</font>

在`reducer.js`文件中加入以下处理逻辑，由于存放的是`immutable`数据结构，所以必须用`set`方法来设置新状态，同时取状态用`get`方法。
```javascript
export default (state = defaultState, action) => {
  switch(action.type) {
    case actionTypes.CHANGE_SINGER_LIST:
      return state.set('singerList', action.data);
    case actionTypes.CHANGE_PAGE_COUNT:
      return state.set('pageCount', action.data);
    case actionTypes.CHANGE_ENTER_LOADING:
      return state.set('enterLoading', action.data);
    case actionTypes.CHANGE_PULLUP_LOADING:
      return state.set('pullUpLoading', action.data);
    case actionTypes.CHANGE_PULLDOWN_LOADING:
      return state.set('pullDownLoading', action.data);
    default:
      return state;
  }
}
```

<font color=#1E90FF>**④ 编写具体的action**</font>

```javascript
import {
  getHotSingerListRequest,
  getSingerListRequest
} from "../../../api/request";
import {
  CHANGE_SINGER_LIST,
  CHANGE_PAGE_COUNT,
  CHANGE_PULLUP_LOADING,
  CHANGE_PULLDOWN_LOADING,
  CHANGE_ENTER_LOADING
} from './constants';
import {
  fromJS
} from 'immutable';


// 改变歌手列表
const changeSingerList = (data) => ({
  type: CHANGE_SINGER_LIST,
  data: fromJS(data)
});

// 改变页码
export const changePageCount = (data) => ({
  type: CHANGE_PAGE_COUNT,
  data
});

// 进场loading
export const changeEnterLoading = (data) => ({
  type: CHANGE_ENTER_LOADING,
  data
});

// 滑动最底部loading
export const changePullUpLoading = (data) => ({
  type: CHANGE_PULLUP_LOADING,
  data
});

// 顶部下拉刷新loading
export const changePullDownLoading = (data) => ({
  type: CHANGE_PULLDOWN_LOADING,
  data
});

// 第一次加载热门歌手
export const getHotSingerList = () => {
  return (dispatch) => {
    getHotSingerListRequest(0).then(res => {
      const data = res.artists;
      dispatch(changeSingerList(data));
      dispatch(changeEnterLoading(false));
      dispatch(changePullDownLoading(false));
    }).catch(() => {
      console.log('热门歌手数据获取失败');
    })
  }
};

// 加载更多热门歌手
export const refreshMoreHotSingerList = () => {
  return (dispatch, getState) => {
    const pageCount = getState().singers.get('pageCount');
    const singerList = getState().singers.get('singerList').toJS();
    getHotSingerListRequest(pageCount).then(res => {
      const data = [...singerList, ...res.artists];
      dispatch(changeSingerList(data));
      dispatch(changePullUpLoading(false));
    }).catch(() => {
      console.log('热门歌手数据获取失败');
    });
  }
};

// 第一次加载对应类别的歌手
export const getSingerList = (type, area, alpha) => {
  return (dispatch, getState) => {
    getSingerListRequest(type, area, alpha, 0).then(res => {
      const data = res.artists;
      dispatch(changeSingerList(data));
      dispatch(changeEnterLoading(false));
      dispatch(changePullDownLoading(false));
    }).catch(() => {
      console.log('歌手数据获取失败');
    });
  }
};

//加载更多歌手
export const refreshMoreSingerList = (type, area, alpha) => {
  return (dispatch, getState) => {
    const pageCount = getState().singers.get('pageCount');
    const singerList = getState().singers.get('singerList').toJS();
    getSingerListRequest(type, area, alpha, pageCount).then(res => {
      const data = [...singerList, ...res.artists];
      dispatch(changeSingerList(data));
      dispatch(changePullUpLoading(false));
    }).catch(() => {
      console.log('歌手数据获取失败');
    });
  }
};
```

<font color=#1E90FF>**⑤ 将相关变量导出**</font>

```javascript
//index.js
import reducer from './reducer'
import * as actionCreators from './actionCreators'

export { reducer, actionCreators };
```

### 3. 组件连接Redux
首先，需要将`Singers`下的`reducer`注册到全局`store`，在`src`目录下的`store/reducer.js`中，内容如下:
```javascript
import { combineReducers } from 'redux'
import { reducer as recommendReducer } from '../application/Recommend/store/index'
import { reducer as singersReducer } from '../application/Singers/store/index'

export default combineReducers({
	// 这里添加子reducer
	recommend: recommendReducer,
	singers: singersReducer
})

```
最后连接`redux`的代码和联动代码一起列在下面：
```javascript
function Singers(props) {
  let [singertype, setSingerType] = useState('');
  let [singerarea, setSingerArea] = useState('');
  let [alpha, setAlpha] = useState('');

  const { singerList, enterLoading, pullUpLoading, pullDownLoading, pageCount } = props;

  const { getHotSingerDispatch, updateDispatch, pullDownRefreshDispatch, pullUpRefreshDispatch } = props;

  useEffect(() => {
    getHotSingerDispatch();
    // eslint-disable-next-line
  }, []);

  // 选择了字母的处理函数
  let handleUpdateAlpha = useCallback((val) => {
    setAlpha(val);
    updateDispatch(singertype, singerarea, val);
    // eslint-disable-next-line
  },[setAlpha]);

  // 选择了地区的处理函数
  let handleUpdateSingerArea = useCallback((val) => {
    setSingerArea(val);
    updateDispatch(singertype, val, alpha);
    // eslint-disable-next-line
  }, [setSingerArea]);

  // 选择了歌手类型的处理函数
  let handleUpdateSingerType = useCallback((val) => {
    setSingerType(val);
    updateDispatch(val,singerarea, alpha);
    // eslint-disable-next-line
  }, [setSingerType])

  // 底部上拉加载更多
  const handlePullUp = () => {
    let temp_hot = (singertype === '' && singerarea === '' && alpha === '')
    pullUpRefreshDispatch(singertype, singerarea, alpha, temp_hot, pageCount);
  };

  // 顶部下拉重新加载
  const handlePullDown = () => {
    pullDownRefreshDispatch(singertype, singerarea, alpha);
  };

  const renderSingerList = () => {
    const list = singerList ? singerList.toJS(): [];
    return (
      <List>
        {
          list.map((item, index) => {
            return (
              <ListItem key={item.accountId+""+index}>
                <div className="img_wrapper">
                  <LazyLoad placeholder={<img width="100%" height="100%" src={require('./singer.png')} alt="music"/>}>
                    <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music"/>
                  </LazyLoad>
                </div>
                <span className="name">{item.name}</span>
              </ListItem>
            )
          })
        }
      </List>
    )
  };

  return (
    <div>
      <NavContainer>
        <Horizen list={singerType} title={"歌手分类:"} handleClick={ handleUpdateSingerType} oldVal={singertype}></Horizen>
        <Horizen list={singerArea} title={"地区分类:"} handleClick={handleUpdateSingerArea} oldVal={singerarea}></Horizen>
        <Horizen list={alphaTypes} title={"首字母:"} handleClick={handleUpdateAlpha} oldVal={alpha}></Horizen>
      </NavContainer>
      <ListContainer>
        <Scroll
          pullUp={ handlePullUp } // 上拉加载逻辑
          pullDown = { handlePullDown } // 下拉加载逻辑
          pullUpLoading = { pullUpLoading } // 显示上拉loading动画与否
          pullDownLoading = { pullDownLoading } // 显示下拉loading动画与否
          onScroll={forceCheck}
        >
          { renderSingerList() }
        </Scroll>
        <Loading show={enterLoading}></Loading>
      </ListContainer>
    </div>
  )
}

const mapStateToProps = (state) => ({
  singerList: state.singers.get('singerList'),
  enterLoading: state.singers.get('enterLoading'),
  pullUpLoading: state.singers.get('pullUpLoading'),
  pullDownLoading: state.singers.get('pullDownLoading'),
  pageCount: state.singers.get('pageCount')
});

const mapDispatchToProps = (dispatch) => {
  return {
    // 进入页面第一次加载热门歌手
    getHotSingerDispatch() {
      dispatch(getHotSingerList());
    },

    // 进入页面第一次加载有类型的歌手
    updateDispatch(type, area, alpha) {
      dispatch(changePageCount(0));
      dispatch(changeEnterLoading(true));
      dispatch(getSingerList(type, area, alpha));
    },

    // 滑到最底部刷新部分的处理
    pullUpRefreshDispatch(type, area, alpha, hot, count) {
      dispatch(changePullUpLoading(true));
      dispatch(changePageCount(count+1));
      if(hot){
        dispatch(refreshMoreHotSingerList());
      } else {
        dispatch(refreshMoreSingerList(type, area, alpha));
      }
    },

    //顶部下拉刷新
    pullDownRefreshDispatch(type, area, alpha) {
      dispatch(changePullDownLoading(true));
      dispatch(changePageCount(0)); // 重头开始请求
      if(type === '' && area === '' && alpha === ''){
        dispatch(getHotSingerList());
      } else {
        dispatch(getSingerList(type, area, alpha));
      }
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(Singers));
```
