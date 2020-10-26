# 首页开发

## 页面分析和组件划分(重要)
<font color=#DD1144>一个页面要进行组件的划分，基本上是根据功能模块的划分和UI展示区域的不同来进行的</font>

<img :src="$withBase('/react_redux_jiagou_shouye.png')" alt="组件划分">

<font color=#1E90FF>分析好了之后我们就在src/containers/Home/components下面创建一系列的组件文件夹，除了Footer文件夹需要创建在src/components目录下，因为别的页面也需要这个组件</font>，<font color=#DD1144>这一步组件划分和创建文件夹的步骤就是转型架构师思维的第一步，因为大多数人都是一个个组件的写，而架构师则要有大局观</font>

## 组件UI开发

### 1. 分类菜单(Category)
像轮播图或者走马灯的效果，我们可以借助第三方组件<font color=#9400D3>react-slick</font>来实现，首先引入样式文件在`public/index.html`当中：
```html
<link rel="stylesheet" type="text/css" charset="UTF-8" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
```
然后去下载`react-slick`:
```javascript
npm install react-slick@0.23.2
```
然后我们就来开发
```javascript
// src/containers/Home/components/Category/index.js
import React, { Component } from "react";
import Slider from "react-slick";
import './style.css'

class Category extends Component {
  render() {
    const settings = {
      dots: true, // 显示下方小圆点
      arrows: false, // 去除两边的箭头
      slidesToShow: 1, // 主屏显示1屏的信息
      swipeToSlide: true, // 可以滑动
      autoplay: true // 自动滑动
    };

    return (
      <div className="category">
        <Slider {...settings}>
          {dataSource.map((section, index) => {
            return (
              <div key={index}>
                {section.map((item, i) => {
                  return (
                    <div className="category__section" key={i}>
                      <img className="category__icon" src={item.src} />
                      <div>
                        <span className="category__text">{item.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Slider>
      </div>
    );
  }
}

export default Category;
```

### 2. 点评头条(HeadLine)
这个组件是一个从上到下翻滚的效果，类似于我们上面的那个走马灯的效果，所以我们可以使用相同的东西组件库去书写，只需要修改一下配置而已：
```javascript
// src/containers/Home/components/Headline/index.js
import React, { Component } from "react";
import Slider from "react-slick";
import './style.css'

class Headline extends Component {
  render() {
    const settings = {
      slidesToShow: 1,
      swipeToSlide: true,
      autoplay: true,
      vertical: true
    };

    return (
      <div className="headline">
        <div className="headline__logo" />
        <div className="headline__slider">
          <Slider {...settings}>
            {dataSource.map((item, index) => {
              return (
                <a
                  key={index}
                  className="headline__sliderInner"
                  href={item.url}
                >
                  <div className="headline__sliderTitle">{item.title}</div>
                  <div className="headline__sliderImgWrapper">
                    <img className="headline__sliderImg" src={item.pic} />
                  </div>
                </a>
              );
            })}
          </Slider>
        </div>
      </div>
    );
  }
}

export default Headline;
```

### 3. 超值特惠(Discount)
```javascript
import React, { Component } from "react";
import "./style.css"

class Discount extends Component {
  render() {
    const data = dataSource;
    return (
      <div className="discount">
        <a className="discount__header">
          <span className="discount__title">超值特惠</span>
          <span className="discount__more">更多优惠</span>
          <span className="discount__arrow" />
        </a>
        <div className="discount__content">
          {data.map((item, index) => {
            return (
              <a key={item.id} className="discount__item" href={item.url}>
                <div className="discount__itemPic">
                  <img width="100%" height="100%" src={item.picture} />
                </div>
                <div className="discount__itemTitle">{item.shop}</div>
                <div className="discount__itemPriceWrapper">
                  <ins className="discount__itemCurrentPrice">
                    {item.currentPrice}
                  </ins>
                  <del className="discount__itemOldPrice">{item.oldPrice}</del>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Discount;

```

### 4. 猜你喜欢(LikeList)
这个是列表。列表我们需要一个列表的组件和列表每个`item`的组件：
```javascript
// src/containers/Home/components/LikeList/index.js
import React, { Component } from 'react';
import LikeItem from "../LikeItem"
import "./style.css"

class LikeList extends Component {
  render() {
    const data = dataSource
    return (
      <div className="likeList">
        <div className="likeList__header">猜你喜欢</div>
        <div className="likeList__list">
          {
            data.map((item, index) => {
              return <LikeItem key={item.id} data={item}/>
            })
          }
        </div>
      </div>
    );
  }
}

export default LikeList;
```
```javascript
// src/containers/Home/components/LikeItem/index.js
import React, { Component } from "react";
import "./style.css"

class LikeItem extends Component {
  render() {
    const {
      shop,
      tag,
      picture,
      product,
      currentPrice,
      oldPrice,
      saleDesc
    } = this.props.data;
    return (
      <a className="likeItem">
        <div className="likeItem__picContainer">
          <div className="likeItem__picTag">{tag}</div>
          <img className="likeItem__pic" src={picture} />
        </div>
        <div className="likeItem__content">
          <div className="likeItem__shop">{shop}</div>
          <div className="likeItem__product">{product}</div>
          <div className="likeItem__detail">
            <div className="likeItem__price">
              <ins className="likeItem__currentPrice">{currentPrice}</ins>
              <del className="likeItem__oldPrice">{oldPrice}</del>
            </div>
            <div className="likeItem__sale">{saleDesc}</div>
          </div>
        </div>
      </a>
    );
  }
}

export default LikeItem;
```
### 5. 其他组件
其他的组件都比较简单，属于静态组件，我们就不在这里赘述，指的注意的就是顶部的那个组件，实际上也是一个静态的组件，你会认为头部包含的输入框应该是一个动态，实际不是，<font color=#1E90FF>如果你仔细观察比如像慕课网，京东这些App的话，输入框实际上都是一个链接而已，要么做成了输入框的样子，有的还做成了轮播图的样子，实际上你点击之后会跳转到真正的搜索页面</font>

## 加载更多(重要)
<font color=#DD1144>加载更多的功能效果是这样的：滑动屏幕到底部的时候，会自动加载数据拼接到当前的数据列表当中，但是不会无限制的下拉加载，会在下拉两次之后，滑动的底部显示查看更多的按钮，点击按钮才会跳转到其他页面</font>

<img :src="$withBase('/react_redux_jiagou_scroll.png')" alt="滑动距离">

可以看到，我们计算的过程是这样的：<font color=#1E90FF>LikeList顶部距离页面顶部的距离 + LikeList内容区域高度 - 屏幕可视区域高度 = 滑动距离</font>

```javascript
import React, { Component } from 'react';
import LikeItem from "../LikeItem"
import Loading from "../../../../components/Loading"
import "./style.css"

class LikeList extends Component {
  constructor(props) {
    super(props)
    this.myRef = React.createRef(); // 7 .使用react中的ref属性
    this.state = {
      data: dataSource, // 1. 初始列表数据
      loadTimes: 1,    // 2. 当前加载次数
    }
    this.removeListener = false; // 15. 标记对scroll的监听函数是否被移除
  }

  render() {
    const {data, loadTimes} = this.state;
    return (
      // 8. 获取likeList最外层的div的ref
      <div ref={this.myRef} className="likeList">
        <div className="likeList__header">猜你喜欢</div>
        <div className="likeList__list">
          {
            data.map((item, index) => {
              return <LikeItem key={index} data={item}/>
            })
          }
        </div>
        {
          loadTimes < 3 ?
          ( // 3. 当加载次数小于3的时候，我们会自动加载数据，这里展示一个加载的组件
            <Loading/>
          ):
          ( // 4. 当加载次数> 3的时候，我们就展示查看更多的连接
            <a className="likeList__viewAll">
              查看更多
            </a>
          )
        }
      </div>
    );
  }

  componentDidMount() {
    // 5. 添加对滚动事件的监听，处理函数是handleScroll
    document.addEventListener("scroll", this.handleScroll);
  }

  componentDidUpdate() {
    // 14. 如果已经自动加载了两次，就应该解除对scroll的监听
    if(this.state.loadTimes >=3 && !this.removeListener) {
      document.removeEventListener("scroll", this.handleScroll);
      this.removeListener = true;
    }
  }

  componentWillUnmount() {
    // 16. 当监听没有被移除的时候，我们就要去移除，如果已经移除，就不需要重复移除了
    if(!this.removeListener) {
      document.removeEventListener("scroll", this.handleScroll)
    }
  }

  // 6. 处理屏幕滚动事件，实现加载更多的效果
  handleScroll = () => {
    // 9，scrollTop为页面滚动的距离（兼容）
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    // 10. screenHeight为屏幕可视高度
    const screenHeight = document.documentElement.clientHeight;
    // 11. likeList组件距离顶部的距离
    const likeListTop = this.myRef.current.offsetTop;
    // 12. likeListHeight为组件内容的高度
    const likeListHeight = this.myRef.current.offsetHeight;
    // 13. 滑动距离如果超过了我们计算出来的滑动距离，说明已经滑动到当前LikeList的底部了
    if(scrollTop >= likeListHeight + likeListTop - screenHeight) {
      const newData = this.state.data.concat(dataSource);
      const newLoadTimes = this.state.loadTimes + 1;
      setTimeout(() => {
        this.setState({
          data: newData,
          loadTimes: newLoadTimes
        })
      }, 1000)
    }
  }
}

export default LikeList;
```
接着我们定义一个公用的`Loading`组件：
```javascript
// components/Loading
import React, { Component } from 'react';
import "./style.css"
class Loading extends Component {
  render() {
    return (
      <div className="loading">
        <div className="loading__img"/>
        <span>正在加载...</span>
      </div>
    );
  }
}
export default Loading;
```

## 设计State
我们分析的步骤是：<font color=#1E90FF>先搞清楚哪些模块需要数据，其次这些数据是什么领域的数据</font>

首页的超值特惠和猜你喜欢两个模块需要数据，而且这些数据都是属于商品领域的数据，关于商品领域的状态我们之前在`src/redux/modules/entities/products`当中书写了一些代码，现在我们需要在`home`的状态文件中定义关于超值特惠和猜你喜欢两个模块的数据状态的结构：
```javascript
// src/redux/modules/home.js
const initialState = {
  // 猜你喜欢模块
  likes: {
    isFetching: false, // 是否正在请求
    pageCount:0, // 分页标记
    ids:[] // 商品id数组
  },
  // 超值特惠模块
  discounts: {
    isFetching: false,
    ids:[]
  }
}
```

## 定义Actions
关于`actions`我们之前就写过猜你喜欢的请求`action`，下面我们将超值特惠的请求`action`相关的东西也书写上
```javascript
// src/redux/modules/home.js
export const types = {
  //获取猜你喜欢请求
  FETCH_LIKES_REQUEST: "HOME/FETCH_LIKES_REQUEST",
  //获取猜你喜欢请求成功
  FETCH_LIKES_SUCCESS: "HOME/FETCH_LIKES_SUCCESS",
  //获取猜你喜欢请求失败
  FETCH_LIKES_FAILURE: "HOME/FETCH_LIKES_FAILURE",
  //获取超值特惠请求
  FETCH_DISCOUNTS_REQUEST: "HOME/FETCH_DISCOUNTS_REQUEST",
  //获取超值特惠请求成功
  FETCH_DISCOUNTS_SUCCESS: "HOME/FETCH_DISCOUNTS_SUCCESS",
  //获取超值特惠请求失败
  FETCH_DISCOUNTS_FAILURE: "HOME/FETCH_DISCOUNTS_FAILURE",
}
// 定义请求参数使用到的常量
export const params = {
  PATH_LIKES: "likes", // 猜你喜欢的标识
  PATH_DISCOUNTS: "discounts", //超值特惠的标识
  PAGE_SIZE_LIKES: 5, // 猜你喜欢每次加载的数据量
  PAGE_SIZE_DISCOUNTS: 3 // 超值特惠加载的数据量
}

export const actions = {
  // 加载猜你喜欢的数据
  loadLikes: () => {
    return (dispatch, getState) => {
      const { pageCount } = getState().home.likes
      const rowIndex = pageCount * params.PAGE_SIZE_LIKES
      const endpoint = url.getProductList(params.PATH_LIKES, rowIndex, params.PAGE_SIZE_LIKES)
      return dispatch(fetchLikes(endpoint))
    }
  },
  // 加载超值特惠商品的数据
  loadDiscounts: () => {
    return (dispatch, getState) => {
      // 判断是否有缓存
      const { ids } = getState().home.discounts
      if (ids.length > 0) {
        return null
      }
      const endpoint = url.getProductList(params.PATH_DISCOUNTS, 0, params.PAGE_SIZE_DISCOUNTS)
      return dispatch(fetchDiscounts(endpoint))
    }
  }
}

const fetchDiscounts = (endpoint) => ({
  [FETCH_DATA]: {
    types: [
      types.FETCH_DISCOUNTS_REQUEST,
      types.FETCH_DISCOUNTS_SUCCESS,
      types.FETCH_DISCOUNTS_FAILURE
    ],
    endpoint,
    schema
  }
})

const fetchLikes = (endpoint) => ({
  [FETCH_DATA]: {
    types: [
      types.FETCH_LIKES_REQUEST,
      types.FETCH_LIKES_SUCCESS,
      types.FETCH_LIKES_FAILURE
    ],
    endpoint,
    schema
  }
})
```
上述代码实际上具体的细节你可以不必研究那么清楚，因为猜你喜欢的数据请求涉及到分页加载，然后要注意的就是我们在传递请求参数的时候，<font color=#DD1144>我们使用的变量代替常量，这个也不算技巧，应该是更合理的做法，无论从代码正确性和维护性来看，都是你应该学习的地方</font>
```javascript
// src/utils/url.js
export default {
	getProductList: (path, rowIndex, pageSize) => `/mock/products/${path}.json?rowIndex=${rowIndex}&pageSize=${pageSize}`
}
```

## 定义Reducers
定义`reducer`，我们可以继续分模块，因为有关于猜你喜欢和超值特惠两个模块，代码如下：
```javascript
// src/redux/modules/home.js
// 猜你喜欢reducer
const likes = (state= initialState.likes, action) => {
  switch (action.type) {
    case types.FETCH_LIKES_REQUEST:
      return {
        ...state,
        isFetching:true
      }
    case types.FETCH_LIKES_SUCCESS:
      return {
        ...state,
        isFetching:false,
        pageCount: state.pageCount + 1,
        ids: state.ids.concat(action.response.ids)
      }
    case types.FETCH_LIKES_FAILURE:
      return {
        ...state,
        isFetching:false,
      }
    default:
      return state;
  }
}

// 超值特惠reducer
const discounts = (state= initialState.discounts, action) => {
  switch (action.type) {
    case types.FETCH_DISCOUNTS_REQUEST:
      return {
        ...state,
        isFetching:true
      }
    case types.FETCH_DISCOUNTS_SUCCESS:
      return {
        ...state,
        isFetching:false,
        ids: state.ids.concat(action.response.ids)
      }
    case types.FETCH_DISCOUNTS_FAILURE:
      return {
        ...state,
        isFetching:false,
      }
    default:
      return state;
  }
}

const reducer = combineReducers({
  likes,
  discounts
})
```
要强调的是，上述代码当中没有对请求错误做特殊处理，因为我们将请求错误视为通用错误，在前面架构设计的时候我们有通用的错误处理，如果你对这里的错误有更特殊的处理，<font color=#DD1144>就需要在定义状态结构的时候，添加error属性，然后在这里对错误进行你自己的处理</font>

## 定义Selectors
```javascript
// src/redux/modules/home.js
// 获取猜你喜欢state
export const getLikes = state => {
  return state.home.likes.ids.map(id => {
    return state.entities.products[id]
  })
}

// 获取猜你喜欢当前页码
export const getPageCountOfLikes = state => {
  return state.home.likes.pageCount
}


// 获取超值特惠
export const getDiscounts = state => {
  return state.home.discounts.ids.map(id => {
    return state.entities.products[id]
  })
}
```

## 连接redux和使用
我们到首页的`index`文件中去修改代码：
```javascript
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  actions as homeActions,
  getLikes,
  getDiscounts,
  getPageCountOfLikes
} from '../../redux/modules/home'

class Home extends Component {
  render() {
    const { likes, discounts, pageCount } = this.props

    return (
      <div>
        <HomeHeader/>
        <Banner/>
        <Category/>
        <Headline/>
        <Activity/>
        <Discount data={discounts}/>
        <LikeList
          data={likes}
          pageCount={pageCount}
          fetchData={this.fetchMoreLikes}
        />
        <Footer/>
      </div>
    );
  }
  componentDidMount() {
    this.props.homeActions.loadDiscounts()
  }

  fetchMoreLikes = () => {
    this.props.homeActions.loadLike()
  }
}

const mapStateToProps = (state, props) => {
  return {
    likes: getLikes(state),
    discounts: getDiscounts(state),
    pageCount: getPageCountOfLikes(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    homeActions: bindActionCreators(homeActions,dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
```
然后我们到之前的`LikeList`和`Discount`组件当中将之前的假数据全部换为由`redux`当中传来的`props`的数据，具体代码可以在[github仓库](https://github.com/taopoppy/fontdemo/tree/master/dianping-react)中查看。

下面我们要说说`redux`作为数据缓存层的作用：

<font color=#1E90FF>**① 超值特惠的缓存**</font>

<font color=#DD1144>前面我们已经讲过，Redux作为有数据缓存的作用，具体表现在哪里呢？对于特惠商品这个首页当中的模块，你仔细想一下，它并不是变化频率很快的数据，根据生活实践，特惠商品不说一段时间，至少在一个小时内不会变的吧，所以在你从首页调到某个商品详情页再跳回来，基本上这个超值特惠的模块数据是不会变的，所以我们将其存储到redux中，根据业务场景的不同作为条件，判断是否使用redux的缓存，比如我们之前的代码如下</font>

```javascript
// 判断是否有缓存
const { ids } = getState().home.discounts
if (ids.length > 0) {
	return null
}
```
<font color=#1E90FF>这个代码是最简单的判断是否使用redux已有的缓存的代码，实际上我们的请求不会这么简单，通常会根据业务场景的不同，比如第一种是向redux保存的时候附带一个时间戳，每次判断的时候使用当前的时间和redux中该数据的时间戳进行对比。第二种就是数据从服务端请求来的，服务器返回值当中会有标识用来给前端判断是否返回的数据已经改变。</font>

<font color=#1E90FF>**② 猜你喜欢的缓存**</font>

实际上在有着高级算法支撑的背后，猜你喜欢这个模块的功能是随时改变的，如果你仔细观察过淘宝还有京东之类的`app`，从首页跳转到别的页面再跳到首页后，首页的内容就已经变化了，所以理论上我们不应该在`redux`存太久的猜你喜欢的数据。所以比较建议的是这些数据应该在加载的时候就重新请求，但是我们这里就在`LikeList`组件当中做个简单的判断即可：
```javascript
componentDidMount() {
	if (this.props.pageCount < 3) {
		document.addEventListener("scroll", this.handleScroll);
	} else {
		this.removeListener = true
	}
	if (this.props.pageCount === 0) {
		this.props.fetchData()
	}
}
```

## 集成React-Router
集成`react-router`我们之前也讲过，这里就直接列举代码：
```javascript
// src/containers/App/index.js
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom' // 1. 引入

class App extends React.Component {
	render() {
		const { error, appActions: { clearError }} = this.props
		return (
			<div className="App">
				<Router> {/* 2. 集成*/}
					<Switch>
						<Route path="/" component={Home} />
					</Switch>
				</Router>
				<Home />
				{  error ? <ErrorToast msg={error} clearError={clearError}/> : null}
			</div>
		);
	}
}
```
然后我们到首页的组件当中将之前的需要的`a`标签全部换成`Link`即可，这部分就不列举了，具体代码可以在[github仓库](https://github.com/taopoppy/fontdemo/tree/master/dianping-react)中查看

## Redux DevTools展示
我们下面要将首页的请求的真实数据和最终数据保存在`redux`的形式展示给大家，首先是我们在首页请求的`Mock`的格式：
+ [discounts.json](https://github.com/taopoppy/fontdemo/blob/master/dianping-react/public/mock/products/discounts.json)
+ [likes.json](https://github.com/taopoppy/fontdemo/blob/master/dianping-react/public/mock/products/likes.json)


最后我们用合成的一张图来展示每次请求派发的`action`和对应`redux`中数据相应的变化：

<img :src="$withBase('/react_redux_home_reduxdev.png')" alt="">