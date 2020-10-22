# 搜索结果页面开发-UI

## 页面分析和组件划分
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

## 搜索结果列(ShopList)
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

## 其他组件
### 1. 头部组件(SearchHeader)
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

### 2. 关键词组件(KeywordBox)
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