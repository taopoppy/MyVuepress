# 搜索页面开发-UI

## 页面分析和组件划分(重要)
<img :src="$withBase('/react_redux_jiagou_searchui.png')" alt="搜索页面UI">

可以看到，我们的搜索页面大概分为三个组件，分别是`SearchBox`、`PopularSearch`和`SearchHistory`

分析一下状态：
+ <font color=#1E90FF>SearchBox</font>：搜索框中的输入内容肯定是`State`，其他输入完毕后根据输入内容得到的相关内容列表数据也是`State`
+ <font color=#1E90FF>PopularSearch</font>: 热门搜索中的数据肯定是`State`
+ <font color=#1E90FF>SearchHistory</font>：搜索记录当中的数据肯定也是`State`

接着我们来创建整个关于搜索页面的文件：`src/containers/Search/index.js`和`src/containers/Search/components/`，前者内容如下：
```javascript
import React, { Component } from 'react';

class Search extends Component {
  render() {
    return (
      <div>
      </div>
    );
  }
}

export default Search;
```

最后我们将新创建的`Search`组件添加到路由当中：
```javascript
import Search from "../Search"; // 1. 引入

class App extends Component {
  render() {
    const {
      error,
      appActions: { clearError }
    } = this.props;
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/detail/:id" component={ProductDetail} />
            <Route path="/search" component={Search} /> {/* 2. 使用*/}
            <Route path="/" component={Home} />
          </Switch>
        </Router>
      </div>
    );
  }
}
```

## 搜索框组件(SearchBox)
创建团购基本信息组件：`src\containers\Search\components\SearchBox\index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src\containers\Search\components\SearchBox\index.js
import React, { Component } from 'react';
import './style.css'

const data = [
  { id: 1, keyword: "火锅", quantity: 8710 },
  { id: 2, keyword: "火锅自助", quantity: 541 },
  { id: 3, keyword: "火锅 三里屯", quantity: 65 },
  { id: 4, keyword: "火锅 望京", quantity: 133 },
  { id: 5, keyword: "火锅家常菜", quantity: 179 }
];

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
    }
  }

  render() {
    return (
      <div className="searchBox">
        <div className="searchBox__container">
          <input className="searchBox__text" value={this.state.inputText} onChange={this.handleChange}/>
          <span className="searchBox__clear" onClick={this.handleClear}></span>
          <span className="searchBox__cancel" onClick={this.handleCancel}>取消</span>
        </div>
        {this.state.inputText.length > 0 ? this.renderSuggestList() : null}
      </div>
    );
  }

  renderSuggestList() {
    return (
      <ul className="searchBox__list">
        {
          data.map(item => {
            return (
              <li className="searchBox__item">
                <span className="searchBox__itemKeyworkd">{item.keyword}</span>
                <span className="searchBox__itemQuantity">约{item.quantity}个结果</span>
              </li>
            )
          })
        }
      </ul>
    )
  }

  handleChange = (e) => {
    this.setState({
      inputText: e.target.value
    })
  }

  handleClear = () => {
    this.setState({
      inputText: ''
    })
  }

  handleCancel = () => {

  }
}

export default SearchBox;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/Search/components/SearchBox/style.css)上自行查看。

最后将搜索框组件`SearchBox`添加到搜索页面当中：
```javascript
// src/containers/Search/index.js
import React, { Component } from 'react';
import SearchBox from './components/SearchBox' // 1. 引入

class Search extends Component {
  render() {
    return (
      <div>
        <SearchBox/> {/* 2. 使用*/}
      </div>
    );
  }
}

export default Search;
```

## 热门搜索词组件(PopularSearch)
创建热门搜索词组件：`src\containers\Search\components\PopularSearch\index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src\containers\Search\components\PopularSearch\index.js
import React, { Component } from 'react';
import "./style.css"

const data = ['三里屯','朝阳大悦城','西单','海底捞','星巴克','局气','火锅','温泉','烤鸭']

class PopularSearch extends Component {
  render() {
    return (
      <div className="popularSearch">
        {
          data.map((item,index) => {
            return (
              <span key={index} className="popularSearch__item">{item}</span>
            )
          })
        }
      </div>
    );
  }
}

export default PopularSearch;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/Search/components/PopularSearch/style.css)上自行查看。

最后将热门搜索词组件`PopularSearch`添加到搜索页面当中：
```javascript
// src/containers/Search/index.js
import PopularSearch from './components/PopularSearch' // 1. 引入

class Search extends Component {
  render() {
    return (
      <div>
        <SearchBox/>
        <PopularSearch/> {/* 2. 使用*/}
      </div>
    );
  }
}

export default Search;
```

## 搜索历史组件(SearchHistory)
创建搜索历史组件：`src\containers\Search\components\SearchHistory\index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src\containers\Search\components\SearchHistory\index.js
import React, { Component } from 'react';
import "./style.css"

class SearchHistory extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: ["烤鸭", "火锅", "面条"]
    }
  }

  render() {
    return (
      <div className="searchHistory">
        <div className="searchHistory__header">搜索记录</div>
        <ul className="searchHistory__list">
          {
            this.state.data.map((item, index) =>{
              return <li key={index} onClick={this.handleClick}className="searchHistory__item">
                {item}
              </li>
            })
          }
        </ul>
        <div className="searchHistory__clear" onClick={this.handleClear}>清除搜索记录</div>
      </div>
    );
  }

  handleClick = () => {

  }

  handleClear = () => {
    this.setState({
      data: []
    })
  }

}

export default SearchHistory;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/Search/components/SearchHistory/style.css)上自行查看。

最后将搜索历史组件`SearchHistory`添加到搜索页面当中：
```javascript
// src/containers/Search/index.js
import SearchHistory from './components/SearchHistory' // 1. 引入

class Search extends Component {
  render() {
    return (
      <div>
        <SearchBox/>
        <PopularSearch/>
        <SearchHistory/> {/* 2.使用*/}
      </div>
    );
  }
}

export default Search;
```