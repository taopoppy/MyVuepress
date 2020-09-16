# 前端架构设计

## 概念与案例分析
### 1. 架构的概念
什么是软件架构，包含三个层次：<font color=#9400D3>抽象</font>、<font color=#9400D3>解耦</font>、<font color=#9400D3>组合</font>

<font color=#DD1144>我们需要将来源于正式业务场景的需求进行抽象，然后需要对整个系统进行解耦，也就是将其模块化，然后根据业务场景的功能，将各个模块按照接口规范组合到一起，这样就有了不同的业务功能的体现。所以这三者就一般意义的构成了我们的架构。</font>

<font color=#1E90FF>架构是最高层次的抽象，先有架构然后再去选取不同的框架和设计模式来实现架构，最后使用具体的代码来实现框架和设计模式</font>

### 2. 前端架构
前端架构有比较大的特殊性
+ 因为前端不是一个独立的子系统，但是整个系统当中每个子系统中都会包含前端，所以前端又横跨整个系统

+ 前端在整个架构中具有<font color=#9400D3>分散性</font>的特点，所以需要前端工程化来解决这类问题，前端工程化需要我们做到下面这些事情
	+ <font color=#DD1144>可控</font>：脚手架，开发规范等
	+ <font color=#DD1144>高效</font>：框架，组件库，Mock平台，构建部署工具等

+ 前端的架构更多的是<font color=#9400D3>页面</font>的抽象，解耦和组合
	+ <font color=#1E90FF>抽象</font>
		+ <font color=#1E90FF>页面UI抽象</font> -> <font color=#1E90FF>组件</font>
		+ <font color=#1E90FF>通用逻辑抽象</font> -> <font color=#1E90FF>状态模块，网络请求，异常处理等</font>

<img :src="$withBase('/react_redux_jiagou_shizhan_jiagoutu.png')" alt="架构图">

所以像我们在一个复杂的页面当中进行分析，解耦出通用组件的过程，我们就是在做前端架构的事情，还有对通用的网络请求抽离封装，这也是前端架构的事情，<font color=#DD1144>所以如何进行架构设计呢？理解和梳理业务是架构的第一步，通常会根据需求文档和原型图来进行梳理，当然了没有这些你只能根据功能点来分析</font>
+ 展示：首页-> 详情页
+ 搜索：搜索页 -> 结果页
+ 购买：登录 -> 下单 -> 我的订单 -> 注销

## 工程化准备
### 1. 技术选型和项目脚手架
技术选型考虑的三要素
+ <font color=#1E90FF>业务满足程度</font>
+ <font color=#1E90FF>技术栈的成熟度(使用人数，周边生态，仓库维护等)</font>
+ <font color=#1E90FF>团队的熟悉度</font>

我们的技术选型基本都是最成熟和最常用的
+ <font color=#1E90FF>脚手架</font>：`create-react-app`
+ <font color=#1E90FF>UI层</font>：`React`
+ <font color=#1E90FF>路由</font>：`React Router`
+ <font color=#1E90FF>状态管理</font>：`Redux`

### 2. 基本规范
使用脚手架创建完项目，有了初始化的所有东西，我们就应该来考虑三个东西：<font color=#9400D3>目录结构</font>、<font color=#9400D3>构建体系</font>、<font color=#9400D3>Mock数据</font>

<font color=#1E90FF>**① 目录结构**</font>

+ <font color=#1E90FF>node_modules/</font>
+ <font color=#1E90FF>public/</font>
	+ <font color=#1E90FF>mock/</font>（Mock文件）
		+ <font color=#1E90FF>products/</font>（和产品相关的Mock数据）
			+ <font color=#9400D3>likes.json</font>
+ <font color=#1E90FF>src/</font>
	+ <font color=#1E90FF>utils/</font>（工具类文件夹）
	+ <font color=#1E90FF>images/</font>（图片文件夹）
	+ <font color=#1E90FF>redux/</font>
		+ <font color=#1E90FF>middleware/</font>（redux中间件文件夹）
		+ <font color=#1E90FF>modules/</font>（redux模块文件夹）
	+ <font color=#1E90FF>components/</font>（全局通用性展示型组件文件夹）
		+ <font color=#1E90FF>Header/</font>
			+ <font color=#9400D3>index.js</font>（Header通用组件的js代码文件）
			+ <font color=#9400D3>style.css</font>（Header通用组件的css代码文件）
	+ <font color=#1E90FF>containers/</font>（全局通用性容器型组件文件夹）
		+ <font color=#1E90FF>App/</font>
			+ <font color=#9400D3>index.js</font>
			+ <font color=#9400D3>style.css</font>
		+ <font color=#1E90FF>Home/</font>
			+ <font color=#1E90FF>components/</font>（Home容器型组件中用到的私有展示型组件文件夹）
			+ <font color=#9400D3>index.js</font>
			+ <font color=#9400D3>style.css</font>
+ <font color=#9400D3>.gitignore</font>
+ <font color=#9400D3>package.json</font>
+ <font color=#9400D3>README.md</font>

基本上这个目录结构是一个比较好的结构了。关于最终的目录我们会在最后进行展示。

<font color=#1E90FF>**② 构建体系**</font>

关于构建，其实使用到的命令就两个`npm start`和`npm build`，因为脚手架已经封装了`webpack`的配置，我们通常直接用即可。

<font color=#1E90FF>**③ Mock数据**</font>

之前我们说的两个`Mock`的方法，我们这里直接采用第二种比较方便的方法，如果你想使用第一种，也可以参考我们前面讲的内容。

## 状态模块定义
### 1. Redux模块两层化概念
我们知道<font color=#DD1144>状态是决定整个前端应用的展示以及前端数据流正常工作的核心</font>，我们前面已经说过前端架构的抽象大多是页面的抽象，页面UI的抽象就是组件，这是不需要我们抽象的，使用`react`本身就是组件化的抽象，那我们通用逻辑的抽象就有下面这些：
+ <font color=#DD1144>领域实体</font>：商品，店铺，订单，评论等信息
+ <font color=#DD1144>各个页面的UI状态（普通的UI状态）</font>：多选框，输入框的内容等
+ <font color=#DD1144>前端基础状态（特殊的UI状态）</font>：登录态，全局异常信息，各个页面共享的UI状态，俗称通用前端状态

对于上面这三个状态，我们在`redux`状态设计的时候又可以将领域实体单独分一层，然后普通的UI状态和特殊的UI状态合并一层，统称UI状态层，这就是我们俗称的<font color=#9400D3>Redux模块两层化</font>

<img :src="$withBase('/react_redux_jiagou_state.png')" alt="">

+ <font color=#1E90FF>容器组件可以根据页面状态和通用的前端状态获取到需要的状态信息，而页面状态又可以根据领域状态获取到领域信息，所以容器型组件只需要和第一层（页面状态和通用前端状态）交互即可</font>

+ <font color=#DD1144>容器型组件需要的领域状态的信息就通过页面状态去获取即可，这样领域状态可以在各个页面之间进行复用，并且在页面状态调用领域状态的时候可以对领域状态进行一些预处理，比如说数据结构的转化等，获得符合容器组件显示规范的领域状态</font>

### 2. Redux模块两层化实现
下面我们使用代码来实现`Redux`模块两层化，首先我们要来创建目录结构，这里只针对于`src/redux`进行目录的创建：
+ <font color=#1E90FF>redux/</font>
	+ <font color=#1E90FF>middleware/</font>
	+ <font color=#9400D3>store.js</font> （<font color=#DD1144>redux核心store总文件</font>）
	+ <font color=#1E90FF>modules/</font> （状态模块总文件）
		+ <font color=#9400D3>index.js</font>  （UI状态层级和领域实体层级reducer合并文件）
		+ <font color=#9400D3>app.js</font> 	 （<font color=#1E90FF>通用前端状态总文件</font>）
		+ <font color=#9400D3>detail.js</font> （<font color=#1E90FF>详情页页面状态文件</font>）
		+ <font color=#9400D3>home.js</font> 	 （<font color=#1E90FF>首页页面状态文件</font>）
		+ <font color=#1E90FF>entities/</font> （<font color=#1E90FF>领域实体层级总文件</font>）
			+ <font color=#9400D3>index.js</font>    （领域实体reducer合并文件）
			+ <font color=#9400D3>comments.js</font> （<font color=#3eaf7c>评论模块状态</font>）
			+ <font color=#9400D3>orders.js</font>   （<font color=#3eaf7c>订单模块状态</font>）
			+ <font color=#9400D3>products.js</font> （<font color=#3eaf7c>商品模块状态</font>）
			+ <font color=#9400D3>shops.js</font>    （<font color=#3eaf7c>店铺模块状态</font>）

然后我们从大到小的来看看相关的文件内容，这些代码和之前我们介绍的时候基本一样，所以就不做过多的注释和说明：
```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from './redux/store.js'
import App from './containers/App';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```
```javascript
// src/redux/store.js
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './modules'

let store

if (process.env.NODE_ENV !== "production" && window.__REDUX_DEVTOOLS_EXTENSION__) {
	// 开发环境
	const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
	store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))
} else {
	// 生产环境
	store = createStore(rootReducer, applyMiddleware(thunk))
}
export default store
```
```javascript
// src/redux/modules/index.js
import { combineReducers } from 'redux'
import entities from './entities'
import app from './app'
import detail from './detail'
import home from './home'

const rootReducer = combineReducers({
	entities,
	app,
	detail,
	home
})
export default rootReducer
```
```javascript
// src/redux/modules/entities/index.js
import { combineReducers } from 'redux'
import products from './products'
import shops from './shops'
import orders from './orders'
import comments from './comments'

const rootReducer = combineReducers({
	products,
	shops,
	orders,
	comments
})
export default rootReducer
```
其余具体的`redux`状态文件，全部用下面代码所谓临时填充：
```javascript
const reducer = (state ={}, action) => {
	return state
}
export default reducer
```

## 网络请求层封装
### 1. 请求方法和URL
<font color=#1E90FF>**① 请求方法**</font>

我们首先会对请求方法和`URL`进行封装，创建`src/utils/request.js`：
```javascript
// 请求头对象
const headers = new Headers({
	"Accept": "application/json",
	"Content-Type": "application/json"
})

// GET方法封装
function get(url) {
	return fetch(url, {
		method: "GET",
		headers: headers
	}).then(response => {
		handleResponse(url, response)
	}).catch(err => {
		console.error(`Request failed. Url = ${url}. Message=${err}`)
		return Promise.reject({
			error: {
				message: "Request failed."
			}
		})
	})
}
// POST方法封装
function post(url, data) {
	return fetch(url, {
		method: "POST",
		headers: headers,
		body: data
	}).then(response => {
		handleResponse(url, response)
	}).catch(err => {
		console.error(`Request failed. Url = ${url}. Message=${err}`)
		return Promise.reject({
			error: {
				message: "Request failed."
			}
		})
	})
}

// 请求处理方法
function handleResponse(url, response) {
	if (response.status === 200) {
		return response.json()
	} else {
		console.error(`Request failed. Url = ${url}`)
		return Promise.reject({
			error: {
				message: "Request failed due to server error"
			}
		})
	}
}

export {get, post}
```
这里我们就要好好研究一下封装网络请求的思路：<font color=#DD1144>网络请求首先从大体上分为两个情况，第一种就是请求发出去并且受到了响应，这成为请求成功，这种是宏观意义的成功，就是说先不管响应内容是啥，总之一来一回的路是走通了。第二种就是请求出问题，例如网络问题，被拦截，总之是服务器没有受到，这称为宏观意义上的失败。两种情况可以看到前者是使用fetch.then处理的，后者是用fetch.catch处理的，<font color=#9400D3>但是切记两者是都有返回值的，很多人这里都是只写打印log没有返回值导致通常程序到这里报错，页面整体显示不了，这不是一种良好的错误处理的方式</font></font>

<font color=#1E90FF>接着在宏观意义的成功请求下，又分为微观的请求成功和微观的请求失败，这两者的定义不是规定死的，是需要我们和后端工程师进行约定的。如果按照自定义的方式，比如上面代码中的handleResponse处理函数中：一般来说返回码为200的才叫成功，哪怕响应错误信息都是写在200状态码的响应内容中，其他的状态码统统为失败，那么不成功的我们要打印出来并且也要有返回值。可是这套理论在restful风格的接口下就不成立，因为在restful风格的api当中，不同的错误由不同的状态码所标志，所以我们就需要在handleResponse函数当中根据不同的状态码来判断到底是失败还是成功</font>

<img :src="$withBase('/react_redux_jiagou_fetch.png')" alt="网络请求逻辑图">

当然了关于请求方式还有很多库，比如说`axios`，那么在`axios`之上进行二次封装，这又是比较大的学问，这里我们就不展开来讲，感兴趣的看看这个[文章](https://mp.weixin.qq.com/s/xLQs63RSQk9Uy3LlhGXYdA)，或者上网查查其他的资料。

<font color=#1E90FF>**② Url**</font>

然后创建`src/utils/url.js`:
```javascript
export default {
	getProductList: (rowIndex, pageSize) => `/mock/products/likes.json?rowIndex=${rowIndex}&pageSize=${pageSize}`
}
```
其他的请求`url`也会在后续按照上面这种方式进行添加。

按照这样的请求方式的封装，我们来简单的写一个在首页要展示的猜你喜欢的数据获取的异步`action`：
```javascript
// src/redux/modules/home.js
import { get } from '../../utils/request'
import url from '../../utils/url'

// actionTypes
export const types = {
	// 获取猜你喜欢请求
	FETCH_LIKE_REQUEST: "HOME/FETCH_LIKE_REQUEST",
	// 获取猜你喜欢请求成功
	FETCH_LIKE_SUCCESS: "HOME/FETCH_LIKE_SUCCESS",
	// 获取猜你喜欢请求失败
	FETCH_LIKE_FAILURE: "HOME/FETCH_LIKE_FAILURE",
}

// actionCreators
export const actions = {
	loadLikes: () => {
		return (dispatch, getState) => {
			dispatch(fetchLikesRequest())
			return get(url.getProductList(0,10)).then(
				data => {
					dispatch(fetchLikesSuccess(data))
				},
				error => {
					dispatch(fetchLikesFailure(error))
				}
			)
		}
	}
}

const fetchLikesRequest = () => ({
	type: types.FETCH_LIKE_REQUEST
})
const fetchLikesSuccess = (data) => ({
	type: types.FETCH_LIKE_REQUEST,
	data
})
const fetchLikesFailure = (error) => ({
	type: types.FETCH_LIKE_FAILURE,
	error
})

const reducer = (state ={}, action) => {
	switch (action.type) {
		case types.FETCH_LIKE_REQUEST:
			// todo
			break;
		case types.FETCH_LIKE_SUCCESS:
			// todo
			break;
		case types.FETCH_LIKE_FAILURE:
			// todo
			break;
		default:
			return state
	}
}
export default reducer
```

### 2. redux中间件
可以看到啊，这只是首页的一个请求，我们就要写这么多的代码，试想，首页如果有10多个乃至20多个请求，这些代码要重复写20遍，整个`redux`所有的代码加起来估价要上万了。<font color=#1E90FF>但是你可以看到这个一个请求的代码实际有点类似于模板，所有的请求几乎都是这个模式，所以我们需要将这种模板似的代码进行抽象，用一个action去描述，并且在中间件当中去处理呢</font>

我们使用一个`action`来描述对这种数据请求的处理，它的结构应该是这样的：
```javascript
{
	FETCH_DATA: {
		types: ['request','success','fail'],
		endpoint: url,
		schema: {
			id: "product_id",
			name: "products"
		}
	}
}
```
`FETCH_DATA`是用来表示获取数据的，`types`数据中的三个元素分别代表请求中，请求成功，请求失败的`action`,`endpoint`表示请求的`url`地址是什么,`schema`是代表领域实体的结构，因为领域实体的数据需要做偏平化的处理，比如数组转化成`key-value`的数据结构,`id`就代表了在领域数据中哪个属性能够代表这个数据的`id`值，`name`表示当前处理的是哪个领域实体，所以这些`schema`应该定义在每个领域实体状态文件当中，比如商品领域：
```javascript
// src/redux/modules/entities/products.js
export const schema = {
	name: "products",
	id: "id"
}
```

然后我们来使用代码实现对`get`方法请求的实现，创建`src/redux/middleware/api.js`
```javascript
// src/redux/middleware/api.js
import { get } from '../../utils/request'

// 凡是action当中有这个属性的都要经过中间件的处理
export const FETCH_DATA = "FETCH DATA"

export default store => next => action => {
	const callAPI = action[FETCH_DATA]
	if (typeof callAPI === undefined) {
		// 说明不是请求数据的action，放过处理
		return next(action)
	}

	const { endpoint, schema, types } = callAPI
	if (typeof endpoint !== "string") {
		throw new Error("endpoint必须为字符串类型的URL")
	}
	if (!schema) {
		// schema属性也是必须的，否则不知道怎么做扁平化处理
		throw new Error("必须指定领域实体的schema")
	}
	if (!Array.isArray(types) && types.length !== 3) {
		throw new Error("需要指定一个包含3个action type的数组")
	}

	if (!types.every(type => typeof type === "string")) {
		throw new Error("action type必须为字符串类型")
	}

	// 增强版的action,确保除了FETCH_DATA的其他属性可以传递下去
	const actionWith = data => {
		const finalAction = {...action, ...data}
		delete finalAction[FETCH_DATA] // 删除掉FETCH_DATA属性
		return finalAction
	}

	const [requestType, successType, failureType] = types


	next(actionWith({type: requestType}))
	return fetchData(endpoint, schema).then(
		response => next(actionWith({
			type: successType,
			response
		})),
		error => next(actionWith({
			type: failureType,
			error: error.message || "获取数据失败"
		}))
	)
}

//执行网络请求
const fetchData = (endpoint, schema) => {
  return get(endpoint).then(data => {
    return normalizeData(data, schema)
  })
}

//根据schema, 将获取的数据扁平化处理
const normalizeData = (data, schema) => {
  const {id, name} = schema
  let kvObj = {} // 用于存储扁平化数据的变量
  let ids = [] // 保存每个数据当中的id，维护有序性
  if(Array.isArray(data)) {
    data.forEach(item => {
      kvObj[item[id]] = item
      ids.push(item[id])
    })
  } else {
    kvObj[data[id]] = data
    ids.push(data[id])
  }
  return {
    [name]: kvObj,
    ids
  }
}
```
接着我们按着封装的情况修改之前的`home.js`:
```javascript
// src/redux/modules/home.js
import url from "../../utils/url"
import { FETCH_DATA } from "../middleware/api"
import { schema } from "./entities/products"

export const types = {
  //获取猜你喜欢请求
  FETCH_LIKES_REQUEST: "HOME/FETCH_LIKES_REQUEST", 
  //获取猜你喜欢请求成功
  FETCH_LIKES_SUCCESS: "HOME/FETCH_LIKES_SUCCESS", 
  //获取猜你喜欢请求失败
  FETCH_LIKES_FAILURE: "HOME/FETCH_LIKES_FAILURE", 
}

export const actions = {
  loadLikes: () => {
    return (dispatch, getState) => {
      const endpoint = url.getProductList(0, 10)
      return dispatch(fetchLikes(endpoint))
    }
  },
}

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

const reducer = (state = {}, action) => {
  switch (action.type) {
    case types.FETCH_LIKES_REQUEST:
    // todo
    case types.FETCH_LIKES_SUCCESS:
    // todo
    case types.FETCH_LIKES_FAILURE:
    // todo
    default:
      return state;
  }
}

export default reducer;
```
在首页请求到了数据后也应该保存在`products`领域的状态文件当中：
```javascript
// src/redux/modules/entities/products.js
export const schema = {
	name: "products",
	id: "id"
}

const reducer = (state ={}, action) => {
	if(action.response && action.res.products) {
		return {
			...state,
			...action.response.products
		}
	}
	return state
}

export default reducer
```
最后，集成中间件：
```javascript
// src/redux/store.js
import api from './middleware/api.js' // 引入中间件

let store

if (process.env.NODE_ENV !== "production" && window.__REDUX_DEVTOOLS_EXTENSION__) {
	const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
	store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk, api))) // 2. 在thunk中间件之后
} else {
	store = createStore(rootReducer, applyMiddleware(thunk,api)) // 3. 在thunk中间件之后
}
```

## 通用错误处理
