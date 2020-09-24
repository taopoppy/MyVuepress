# 首页开发-State

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
