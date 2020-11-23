# 数据层的开发

## Ajax请求处理
首先安装:
```javascript
npm install axios --save
```
现在在`src/api`目录下新建`config.js`文件，里面编写`axios`的配置:
```javascript
import axios from 'axios';

export const baseUrl = 'http://xxx自己填';

//axios 的实例及拦截器配置
const axiosInstance = axios.create ({
  baseURL: baseUrl
});

axiosInstance.interceptors.response.use (
  res => res.data,
  err => {
    console.log (err, "网络错误");
  }
);

export {
  axiosInstance
};
```
然后在同一个目录下新建`request.js`用来封装不同的网络请求，内容如下:
```javascript
import { axiosInstance } from "./config";

export const getBannerRequest = () => {
  return axiosInstance.get ('/banner');
}

export const getRecommendListRequest = () => {
  return axiosInstance.get ('/personalized');
}
```

## Redux操作
在`Recommend`目录下，新建`store`文件夹，然后新建以下文件
```javascript
在 Recommend 目录下，新建 store 文件夹，然后新建以下文件

actionCreators.js// 放不同 action 的地方
constants.js      // 常量集合，存放不同 action 的 type 值
index.js          // 用来导出 reducer，action
reducer.js        // 存放 initialState 和 reducer 函数
```

### 1. actionType
```javascript
//constants.js
export const CHANGE_BANNER = 'recommend/CHANGE_BANNER';

export const CHANGE_RECOMMEND_LIST = 'recommend/RECOMMEND_LIST';
```

### 2. reducer
```javascript
//reducer.js
import * as actionTypes from './constants';
import { fromJS } from 'immutable';// 这里用到 fromJS 把 JS 数据结构转化成 immutable 数据结构

const defaultState = fromJS ({
  bannerList: [],
  recommendList: [],
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.CHANGE_BANNER:
      return state.set ('bannerList', action.data);
    case actionTypes.CHANGE_RECOMMEND_LIST:
      return state.set ('recommendList', action.data);
    default:
      return state;
  }
}
```

### 3. actionCreators
```javascript
//actionCreators.js
import * as actionTypes from './constants';
import { fromJS } from 'immutable';// 将 JS 对象转换成 immutable 对象
import { getBannerRequest, getRecommendListRequest } from '../../../api/request';

export const changeBannerList = (data) => ({
  type: actionTypes.CHANGE_BANNER,
  data: fromJS (data)
});

export const changeRecommendList = (data) => ({
  type: actionTypes.CHANGE_RECOMMEND_LIST,
  data: fromJS (data)
});

export const getBannerList = () => {
  return (dispatch) => {
    getBannerRequest ().then (data => {
      dispatch (changeBannerList (data.banners));
    }).catch (() => {
      console.log ("轮播图数据传输错误");
    }) 
  }
};

export const getRecommendList = () => {
  return (dispatch) => {
    getRecommendListRequest ().then (data => {
      dispatch (changeRecommendList (data.result));
    }).catch (() => {
      console.log ("推荐歌单数据传输错误");
    });
  }
};
```

### 4. index
```javascript
//index.js
import reducer from './reducer'
import * as actionCreators from './actionCreators'

export { reducer, actionCreators };
```

### 5. connect
首先，需要将`recommend`下的`reducer`注册到全局`store`，在`store/reducer.js` 中，内容如下:

```javascript
import { combineReducers } from 'redux-immutable';
import { reducer as recommendReducer } from '../application/Recommend/store/index';

export default combineReducers ({
  recommend: recommendReducer,
});
```

现在在`Recommend/index.js`中，准备连接`Redux`。组件代码更新如下:
```javascript
import React, { useEffect, memo} from 'react';
import Slider from '../../components/slider/';
import { connect } from "react-redux";
import * as actionTypes from './store/actionCreators';
import RecommendList from '../../components/list/';
import Scroll from '../../baseUI/scroll/index';
import { Content } from './style';

function Recommend(props) {
  const { bannerList, recommendList} = props
  const { getBannerDataDispatch, getRecommendListDataDispatch } = props

  useEffect(()=> {
    if(!bannerList.size) {
      getBannerDataDispatch()
    }
    if(!recommendList.size) {
      getRecommendListDataDispatch()
    }
  },[])


  const bannerListJS = bannerList ? bannerList.toJS(): []
  const recommendListJS = recommendList ? recommendList.toJS() : []

	return(
    <Content>
      <Scroll
        className="list"
      >
        <div>
          <Slider bannerList={bannerListJS}></Slider>
          <RecommendList recommendList={recommendListJS}></RecommendList>
        </div>
      </Scroll>
    </Content>
	)
}

const mapStateToProps = (state) => ({
  // 这里没有使用toJS，不然每次diff比对props的时候都是不一样的引用，还是导致不必要的重渲染，属于滥用 immutable
  bannerList: state.recommend.get('bannerList'),
  recommendList: state.recommend.get('recommendList'),
})

const mapDispatchToProps = (dispatch) => {
  return {
    getBannerDataDispatch() {
      dispatch(actionTypes.getBannerList())
    },
    getRecommendListDataDispatch() {
      dispatch(actionTypes.getRecommendList());
    },
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(memo(Recommend))
```
