# 搜索结果页面开发

## 页面分析和组件划分(重要)
<img :src="$withBase('/react_redux_jiagou_search_result.png')" alt="搜索结果页">

根据上述结果分析，我们的搜索结果页面应该有这么四个大组件：`SearchHeader`、`KeywordBox`、`Banner`、`ShopList`,在列表当中的每一项又是一个小的组件`ShopItem`

首先来创建目录结构，创建`src/containers/SearchResult/components`和`src/containers/SearchResult/index.js`

接着我们来添加路由：
```javascript
import SearchResult from "../SearchResult" // 1. 引入

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/detail/:id" component={ProductDetail} />
            <Route path="/search" component={Search} />
            <Route path="/search_result" component={SearchResult} /> {/* 2. 使用*/}
            <Route path="/" component={Home} />
          </Switch>
        </Router>
      </div>
    );
  }
}
```

## 组件UI开发
### 1. 搜索结果列(ShopList)
创建搜索列组件：`src/containers/SearchResult/components/ShopList/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/SearchResult/components/ShopList/index.js
import React, { Component } from "react";
import ShopItem from "../ShopItem"
import "./style.css"

class ShopList extends Component {
  render() {
    return (
      <div className="shopList">
        <div className="shopList__filter">
          <span className="shopList__filterItem">全部商区</span>
          <span className="shopList__filterItem">全部分类</span>
          <span className="shopList__filterItem">智能排序</span>
        </div>
        <div className="shopList__list">
          {dataSource.map((item, index) => {
            return (
              <div key={item.id}>
                <ShopItem data={item} />
                {index < dataSource.length - 1 ? (
									{/*分割线*/}
									<div className="shopList__divider" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ShopList;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/SearchResult/components/ShopList/style.css)上自行查看。

最后将搜索列组件`ShopList`添加到搜索结果页面当中：
```javascript
// src/containers/SearchResult/index.js
import React, { Component } from 'react';
import ShopList from "./components/ShopList" // 1. 引入

class SearchResult extends Component {
  render() {
    return (
      <div>
        <ShopList/> {/*2.使用*/}
      </div>
    );
  }
}

export default SearchResult;
```

接着我们创建搜索结果具体项组件：`src/containers/SearchResult/components/ShopItem/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/SearchResult/components/ShopItem/index.js
import React, { Component } from "react";
import "./style.css"

class ShopItem extends Component {
  render() {
    const {
      url,
      pic,
      shop,
      star,
      price,
      quantity,
      region,
      category
    } = this.props.data;
    return (
      <a className="shopItem" href={url}>
        <div
          className="shopItem__pic"
          style={{ backgroundImage: "url(" + pic + ")" }}
        />
        <div className="shopItem__content">
          <div className="shopItem__title">{shop}</div>
          <div className="shopItem__comment">
            <span className={"shopItem__star shopItem__star--" + star} />
            <span className="shopItem__quantity">{quantity}</span>
            <span className="shopItem__price">{price}/人</span>
          </div>
          <div className="shopItem__info">
            <span className="shopItem__region">{region}</span>
            <span className="shopItem__category">{category}</span>
          </div>
        </div>
      </a>
    );
  }
}

export default ShopItem;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/SearchResult/components/ShopItem/style.css)上自行查看。

### 2. 头部组件(SearchHeader)
创建搜索头部组件：`src/containers/SearchResult/components/SearchHeader/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/SearchResult/components/SearchHeader/index.js
import React, { Component } from 'react';
import "./style.css"

class SearchHeader extends Component {
  render() {
    const { onBack, onSearch} = this.props;
    return (
      <header className="searchHeader">
        <div className="searchHeader__back" onClick={onBack}></div>
        <div className="searchHeader__list">
          <span className="searchHeader__item searchHeader__item--selected">商户</span>
          <span className="searchHeader__item">闪惠团购</span>
        </div>
        <div className="searchHeader__icon" onClick={onSearch}></div>
      </header>
    );
  }
}

export default SearchHeader;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/SearchResult/components/SearchHeader/style.css)上自行查看。

最后将搜索头部组件`SearchHeader`添加到搜索结果页面当中：
```javascript
// src/containers/SearchResult/index.js
import SearchHeader from "./components/SearchHeader" // 1. 引入

class SearchResult extends Component {
  render() {
    return (
      <div>
        <SearchHeader onBack={this.handleBack} onSearch={this.handleSearch}/> {/* 2. 使用*/}
        <ShopList/>
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

export default SearchResult;
```

### 3. 关键词组件(KeywordBox)
创建关键词组件：`src/containers/SearchResult/components/KeywordBox/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/SearchResult/components/KeywordBox/index.js
import React, { Component } from "react";
import { Link } from "react-router-dom";
import './style.css'

class KeywordBox extends Component {
  render() {
    const { text } = this.props;
    return (
      <div className="keywordBox">
        <Link to="/search" className="keywordBox__text">
          {text}
        </Link>
      </div>
    );
  }
}

export default KeywordBox;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/SearchResult/components/KeywordBox/style.css)上自行查看。

最后将关键词组件`KeywordBox`添加到搜索结果页面当中：
```javascript
// src/containers/SearchResult/index.js
import KeywordBox from "./components/KeywordBox" // 1. 引入
import Banner from "../../components/Banner"

class SearchResult extends Component {
  render() {
    return (
      <div>
        <SearchHeader onBack={this.handleBack} onSearch={this.handleSearch}/>
        <KeywordBox text="text"/> {/* 2. 使用*/}
        <Banner dark />
        <ShopList/>
      </div>
    );
  }
}

export default SearchResult;
```
然后`Banner`组件在首页我们就开发过了，是个静态组件，所以我们直接把`Banner`移动到全局的组件文件夹`src/components`当中，源码在[github](https://github.com/taopoppy/fontdemo/blob/master/dianping-react/src/components/Banner/index.js)可以直接查看。

## 设计State

由于搜索结果也和搜索页的数据有强相关的联系，所以关于搜索结果页面的数据信息我们就和搜索页的数据放在一起。

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