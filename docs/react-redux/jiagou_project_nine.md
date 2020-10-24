# 搜索结果页面开发-State

由于搜索结果也和搜索页的数据有强相关的联系，所以关于搜索结果页面的数据信息我们就和搜索页的数据放在一起。

## 设计State
<img :src="$withBase('/react_redux_jiagou_search_result.png')" alt="搜索结果页">

可以看到这个页面中展示的状态需要两个，一个是关键词组件当中的关键词，这个是`State`。这个实际上不需要单独建立状态，可以直接从历史关键词中抓取。另外就是列表当中的数据，列表中的数据是`State`，但是商户信息是领域实体信息，所以在搜索结果列表中的列表信息的数据结构和之前在搜索页中的`relatedKeywords`是类似的：
```javascript
// src/redux/modules/search.js
const initialState = {
  ...
  /**
   * searchedShopsByKeywords结构
   * {
   *   'keywordId': {
   *       isFetching: false,
   *       ids: []
   *    }
   * }
   */
  searchedShopsByKeyword: {}
};
```

## 定义Action
`Actions`实际
```javascript
// src/redux/modules/search.js
export const types = {
  ...
  // 根据关键词查询结果
  FETCH_SHOPS_REQUEST: "SEARCH/FETCH_SHOPS_REQUEST",
  FETCH_SHOPS_SUCCESS: "SEARCH/FETCH_SHOPS_SUCCESS",
  FETCH_SHOPS_FAILURE: "SEARCH/FETCH_SHOPS_FAILURE",
};

export const actions = {
	...
  // 获取查询到的店铺列表
  loadRelatedShops: keyword => {
    return (dispatch, getState) => {
      const { searchedShopsByKeyword } = getState().search;
      if(searchedShopsByKeyword[keyword]) {
        return null
      }
      const endpoint = url.getRelatedShops(keyword);
      return dispatch(fetchRelatedShops(keyword, endpoint));
    }
  },
};

const fetchRelatedShops = (text, endpoint) => ({
  [FETCH_DATA]: {
    types: [
      types.FETCH_SHOPS_REQUEST,
      types.FETCH_SHOPS_SUCCESS,
      types.FETCH_SHOPS_FAILURE
    ],
    endpoint,
    schema: shopSchema
  },
  text
})
```

## 定义Reducers
```javascript
// // src/redux/modules/search.js
const searchedShopsByKeyword = (state = initialState.searchedShopsByKeyword, action) => {
  switch (action.type) {
    case types.FETCH_SHOPS_REQUEST:
    case types.FETCH_SHOPS_SUCCESS:
    case types.FETCH_SHOPS_FAILURE:
      return {
        ...state,
        [action.text]: searchedShops(state[action.text], action)
      };
    default:
      return state;
  }
};

const searchedShops = (
  state = { isFetching: false, ids: [] },
  action
) => {
  switch (action.type) {
    case types.FETCH_SHOPS_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_SHOPS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        ids: action.response.ids
      };
    case types.FETCH_SHOPS_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

const reducer = combineReducers({
	...
  searchedShopsByKeyword
})

// Selector
// 获取店铺列表
export const getSearchedShops = state => {
  const keywordId = state.search.historyKeywords[0];
  if(!keywordId) {
    return [];
  }
  const shops = state.search.searchedShopsByKeyword[keywordId];
  return shops.ids.map(id => {
    return getShopById(state, id);
  })
}

// 获取当前关键词
export const getCurrentKeyword = state => {
  const keywordId = state.search.historyKeywords[0];
  if(!keywordId) {
    return ""
  }
  return getKeywordById(state, keywordId).keyword;
}
```

## 连接Redux和使用
搜索结果页基本属于展示页面，没有交互的逻辑，所以链接`redux`比较简单：
```javascript
// src/containers/SearchResult/index.js
import React, { Component } from 'react';
import { connect } from "react-redux";
import ShopList from "./components/ShopList"
import SearchHeader from "./components/SearchHeader"
import KeywordBox from "./components/KeywordBox"
import Banner from "../../components/Banner"
import { getSearchedShops, getCurrentKeyword } from '../../redux/modules/search';

class SearchResult extends Component {
  render() {
    const { shops, currentKeyword} = this.props;
    return (
      <div>
        <SearchHeader onBack={this.handleBack} onSearch={this.handleSearch}/>
        <KeywordBox text={currentKeyword}/>
        <Banner dark />
        <ShopList data={shops}/>
      </div>
    );
  }

  handleBack = () => {
    this.props.history.push('/')
  }

  handleSearch = () => {
    this.props.history.push('/search')
  }
}

const mapStateToProps = (state, props) => {
  return {
    shops: getSearchedShops(state),
    currentKeyword: getCurrentKeyword(state)
  }
}


export default connect(mapStateToProps, null)(SearchResult);
```
最后我们回到搜索结果页中的每个组件，将`Mock`数据全部改为传递进入组件的`props`，代码可以在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/SearchResult/components)当中查看。

## Redux DevTools
我们下面要将首页的请求的真实数据和最终数据保存在`redux`的形式展示给大家，首先是我们在首页请求的`Mock`的格式：
+ [related.json](https://github.com/taopoppy/fontdemo/blob/master/dianping-react/public/mock/shops/related.json)

最后我们用合成的一张图来展示每次请求派发的`action`和对应`redux`中数据相应的变化：

<img :src="$withBase('/react_redux_searchdetail_reduxdev.png')" alt="">

值得一提的是在上图中剩下的五个`action`都是在搜索页面中发生的，而不是在搜索结果页，但是我们将搜索页和搜索结果页当中的`state`和`action`写在了一起，所以会有交织的情况发生。