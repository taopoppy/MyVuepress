# 团购详情页开发

## 页面分析和组件划分(重要)
<img :src="$withBase('/react_redux_jiagou_tuangouxiangqingye.png')" alt="">

我们可以从上往下看到：
+ <font color=#1E90FF>Header</font>：头部组件
+ <font color=#1E90FF>Product Overview</font>：团购中产品基本信息
+ <font color=#1E90FF>ShopInfo</font>: 团购中商户基本信息
+ <font color=#1E90FF>Detail</font>：团购详情信息
+ <font color=#1E90FF>Remark</font>: 团购需知信息
+ <font color=#1E90FF>BuyButton</font>：按钮信息

拆分完毕之后，我们先来做一些基本的准备工作：

<font color=#1E90FF>**① 配置路由**</font>

```javascript
// src/containers/App/index.js
import ProductDetail from '../ProductDetail/index' // 1. 引入团购详情页组件


class App extends React.Component {
	render() {
		...
		return (
			<div className="App">
				<Router>
					<Switch>
						<Route path="/detail/:id" component={ProductDetail} /> {/* 2. 添加匹配项*/}
						<Route path="/" component={Home} />
					</Switch>
				</Router>
				...
			</div>
		);
	}
}
```

<font color=#1E90FF>**② 创建组件文件**</font>

创建`src/containers/ProductDetail/index.js`文件以及`src/containers/ProductDetail/components`，前者内容如下：
```javascript
// src/containers/ProductDetail/index.js
import React, { Component } from 'react';

class ProductDetail extends Component {
  render() {
    return (
      <div>
      </div>
    );
  }
}

export default ProductDetail;
```
后续编写的组件会逐个向里面添加。



## 组件UI开发
### 1. 团购基本信息(ProductOverview)
创建团购基本信息组件：`src\containers\ProductDetail\components\ProductOverview\index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src\containers\ProductDetail\components\ProductOverview\index.js
import React, { Component } from "react";
import "./style.css";

class ProductOverview extends Component {
  render() {
    return (
      <div className="productOverview">
        <div className="productOverview__header">
          <div className="productOverview__imgContainer">
            <img
              alt=""
              className="productOverview__img"
              src="https://p0.meituan.net/deal/e6864ed9ce87966af11d922d5ef7350532676.jpg@450w_280h_1e_1c_1l|watermark=1&&r=1&p=9&x=2&y=2&relative=1&o=20"
            />
          </div>
          <div className="productOverview__baseInfo">
            <div className="productOverview__title">院落创意菜</div>
            <div className="productOverview__content">
              仅售19.9元！价值48元的百香果（冷饮）1扎，提供免费WiFi。
            </div>
          </div>
        </div>
        <div className="productOverview__purchase">
          <span className="productOverview__symbol">¥</span>
          <span className="productOverview__price">19.9</span>
          <span className="productOverview__price--old">¥48</span>
          <a className="productOverview__btn">立即购买</a>
        </div>
        <ul className="productOverview__remark">
          <li className="productOverview__remarkItem">
            <i className="productOverview__sign1" />
            <span className="productOverview__desc">随时可退</span>
          </li>
          <li className="productOverview__remarkItem">
            <i className="productOverview__sign2" />
            <span className="productOverview__desc">过期自动退</span>
          </li>
        </ul>
      </div>
    );
  }
}

export default ProductOverview;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/ProductDetail/components/ProductOverview/style.css)上自行查看。

最后将团购基础信息组件`ProductOverview`添加到团购详情页组件中：
```javascript
// src/containers/ProductDetail/index.js
import React, { Component } from 'react';
import ProductOverview from "./components/ProductOverview" // 1. 引入

class ProductDetail extends Component {
  render() {
    return (
      <div>
        <ProductOverview /> {/* 2. 使用*/}
      </div>
    );
  }
}

export default ProductDetail;
```

### 2. 商户基本信息(ShopInfo)
创建商户基本信息组件：`src\containers\ProductDetail\components\ShopInfo\index.js`，按照惯例，我们先来写静态页面：
```javascript
// src\containers\ProductDetail\components\ShopInfo\index.js
import React, { Component } from 'react';
import "./style.css"

class ShopInfo extends Component {
  render() {
    return (
      <div className="shopInfo">
        <div className="shopInfo__header">
          使用商户（4）
          <span className="shopInfo__arrow"></span>
        </div>
        <div className="shopInfo__middle">
          <div className="shopInfo__middleLeft">
            <div className="shopInfo__shopName">
            院落创意菜
            </div>
            <div className="shopInfo__starsWrapper">
              <span className="shopInfo__stars">
              <i className="shopInfo__stars--red" style={{"width": "100%"}}></i>
              </span>
              <span className="shopInfo__distance">>100km</span>
            </div>
          </div>
          <div className="shopInfo__middleRight">
            <i className="shopInfo__phoneIcon"></i>
          </div>
        </div>
        <div className="shopInfo__bottom">
          <i className="shopInfo__locationIcon"></i>北京朝阳区
        </div>
      </div>
    );
  }
}

export default ShopInfo;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/ProductDetail/components/ShopInfo/style.css)上自行查看。

最后将团购商户基本信息组件`ShopInfo`添加到团购详情页组件中：
```javascript
// src/containers/ProductDetail/index.js
import React, { Component } from 'react';
import ShopInfo from "./components/ShopInfo"  // 1. 引入

class ProductDetail extends Component {
  render() {
    return (
      <div>
        <ProductOverview />
        <ShopInfo /> {/* 2. 使用*/}
      </div>
    );
  }
}

export default ProductDetail;
```

### 3. 团购详情(Detail)
创建团购详情的组件：`src\containers\ProductDetail\components\Detail\index.js`，按照惯例，我们先来写静态页面：
```javascript
// src\containers\ProductDetail\components\Detail\index.js
import React, { Component } from 'react';
import "./style.css"

class Detail extends Component {
  render() {
    return (
      <div className="detail">
        <div className="detail__header">
          <span>团购详情</span>
          <i className="detail__headerIcon"></i>
        </div>
        <table cellPadding="0" cellSpacing="0" className="detail__table">
          <tbody>
            <tr className="detail__row">
              <th colSpan="3" className="detail__category">
                饮品
              </th>
            </tr>
            <tr className="detail__row">
              <td>白果香（冷饮）</td>
              <td className="detail__td--alignRight">
              1扎
              </td>
              <td className="detail__td--alignRight">
              48元
              </td>
            </tr>
            <tr className="detail__row">
              <td/>
              <td className="detail__td--price">
                最高价值
                <br/>
                <strong className="detail__td--priceNew">
                  团购价
                </strong>
              </td>
              <td className="detail__td--price">
                48元
                <br/>
                <strong className="detail__td--priceNew">
                  19.9元
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="detail__remark">
          免费提供餐巾纸
        </div>
        <div className="detail__more">
          <span>更多图文详情</span>
          <span className="detail__notice">(建议Wifi环境下打卡，土豪请随意)</span>
          <i className="detail__arrow"/>
        </div>
      </div>
    );
  }
}

export default Detail;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/ProductDetail/components/Detail/style.css)上自行查看。

最后将团购详情信息组件`Detail`添加到团购详情页组件中：
```javascript
// src/containers/ProductDetail/index.js
import React, { Component } from 'react';
import Detail from "./components/Detail"  // 1. 引入

class ProductDetail extends Component {
  render() {
    return (
      <div>
        <ProductOverview />
        <ShopInfo />
        <Detail /> {/* 2. 使用*/}
      </div>
    );
  }
}

export default ProductDetail;
```

### 4. 购买须知(Remark)
创建购买须知的组件：`src\containers\ProductDetail\components\Remark\index.js`，按照惯例，我们先来写静态页面：
```javascript
// src\containers\ProductDetail\components\Remark\index.js
import React, { Component } from "react";
import "./style.css";

class Remark extends Component {
  render() {
    return (
      <div className="remark">
        <div className="remark__header">
          购买须知
          <i className="remark__icon" />
        </div>
        <div className="remark__list">
          <dl className="remark__item">
            <dt className="remark__itemTitle">有效期</dt>
            <dd className="remark__itemDesc">2018-10-20至2019-09-15</dd>
          </dl>
          <dl className="remark__item">
            <dt className="remark__itemTitle">除外日期</dt>
            <dd className="remark__itemDesc">有效期内周末、法定节假日可用</dd>
          </dl>
          <dl className="remark__item">
            <dt className="remark__itemTitle">使用时间</dt>
            <dd className="remark__itemDesc">团购券使用时间：11:00-22:00</dd>
          </dl>
          <dl className="remark__item">
            <dt className="remark__itemTitle">预约提醒</dt>
            <dd className="remark__itemDesc">
              无需预约，消费高峰时可能需要等位
            </dd>
          </dl>
          <dl className="remark__item">
            <dt className="remark__itemTitle">规则提醒</dt>
            <dd className="remark__itemDesc">每张团购券建议2人使用</dd>
          </dl>
        </div>
      </div>
    );
  }
}

export default Remark;

```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/ProductDetail/components/Remark/style.css)上自行查看。

最后将购买须知组件`Remark`添加到团购详情页组件中：
```javascript
// src/containers/ProductDetail/index.js
import React, { Component } from 'react';
import Remark from "./components/Remark" // 1. 引入

class ProductDetail extends Component {
  render() {
    return (
      <div>
        <ProductOverview />
        <ShopInfo />
        <Detail />
        <Remark /> {/*2.使用*/}
      </div>
    );
  }
}

export default ProductDetail;
```

### 5. 其他组件
购买按钮是比较简单的，我们创建一个购买按钮的组件：`src\containers\ProductDetail\components\BuyButton\index.js`，按照惯例，先来书写静态页面：
```javascript
// src\containers\ProductDetail\components\BuyButton\index.js
import React, { Component } from 'react';
import './style.css'

class BuyButton extends Component {
  render() {
    return (
      <a className="buyButton">
        立即购买
      </a>
    );
  }
}

export default BuyButton;
```

然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/ProductDetail/components/BuyButton/style.css)上自行查看。

然后头部组件是因为好多页面都会使用到，而且是只有背景和标题的区别，所以抽象为一个通用组件；`src\components\Header\index.js`，内容如下：
```javascript
// src\components\Header\index.js
import React, { Component } from 'react';
import "./style.css"

class Header extends Component {
  render() {
    const { grey, title, onBack } = this.props;
    const backgroundColor = grey ?'#f0f0f0': '#fff';
    return (
      <header className="header" style={{'backgroundColor':backgroundColor }}>
        <div className="header__back" onClick={onBack}>
          返回
        </div>
        <div className="header__title">{title}</div>
      </header>
    );
  }
}

export default Header;
```

然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/components/Header/style.css)上自行查看。

最后将组件`BuyButton`和`Header`添加到团购详情页组件中：
```javascript
// src/containers/ProductDetail/index.js
import React, { Component } from "react";
import ProductOverview from "./components/ProductOverview";
import ShopInfo from "./components/ShopInfo";
import Detail from "./components/Detail";
import Remark from "./components/Remark";
import BuyButton from "./components/BuyButton"; // 1. 引入
import Header from "../../components/Header"; // 1. 引入

class ProductDetail extends Component {
  render() {
    return (
      <div>
        <Header title="团购详情" onBack={this.handleBack} grey /> {/*2. 使用 */}
        <ProductOverview />
        <ShopInfo />
        <Detail />
        <Remark />
        <BuyButton /> {/*2. 使用 */}
      </div>
    );
  }

  handleBack = () => {};
}

export default ProductDetail;
```

## 设计State
<img :src="$withBase('/react_redux_jiagou_tuangouxiangqingye.png')" alt="">

<font color=#1E90FF>领域实体</font>分析：有<font color=#1E90FF>商品的详情信息</font>、<font color=#1E90FF>商户的详情信息</font>，所以我们首先就要准备的`Mock`数据，就有两个,一个是[product_detail](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/public/mock/product_detail)，另一个是[shop](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/public/mock/shops)

然后我们需要到`redux`当中去定义关于`shops`的模型对象和`reducer`，代码如下：
```javascript
// src/redux/modules/entities/shops.js
const schema = {
  name: 'shops',
  id: 'id'
}

const reducer = (state = {}, action) => {
	if(action.response && action.response.shops) {
		return {...state, ...action.response.shops}
	}
	return state
}

export default reducer;
```
但是你也会发现，实际上在`shop.js`和`products.js`两个文件中的中间关于`reducer`的代码是差不多一样的，<font color=#DD1144>所以展现架构思维的地方就到了</font>，我们可以将其抽象成一个公用函数放在`utils`文件中：
```javascript
// src/utils/createReducer.js
const createReducer = (name) => {
  return (state = {}, action) => {
    if(action.response && action.response[name]) {
      return {...state, ...action.response[name]}
    }
    return state;
  }
}

export default createReducer
```
然后在领域实体中的代码就会简单很多：
```javascript
// src/redux/modules/entities/shops.js
import createReducer from "../../../utils/createReducer";

const schema = {
  name: "shops",
  id: "id"
};

const reducer = createReducer(schema.name);

export default reducer;

// selectors
export const getShopById = (state, id) => {
  const shop = state.entities.shops[id];
  return shop;
};
```
同样的关于`products`这个模块也可以和上面一样的进行改造。
```javascript
// src/redux/modules/entities/products.js
import createReducer from "../../../utils/createReducer"

export const schema = {
  name: 'products',
  id: 'id',
}

const reducer = createReducer(schema.name)

export default reducer;

//selectors
export const getProductDetail = (state, id) => {
  const product = state.entities.products[id];
  return product && product.detail && product.purchaseNotes ? product :  null;
}

export const getProductById = (state, id) => {
  return state.entities.products[id]
}
```

整理好了之后，我们就来分析在团购详情页当中，需要什么`State`，需要请求的当然只有两个，一个是关于商品的详细信息，还有商户的详细信息，两种信息都需要通过各自的`id`去请求，所以这个页面中的状态就分两个：
```javascript
// src/redux/modules/detail.js
const initialState = {
  product: {
    isFetching: false,
    id: null,
  },
  relatedShop: {
    isFetching: false,
    id: null,
  }
}

const reducer = (state = {}, action) => {
  return state;
}

export default reducer;
```

## 定义Actions
```javascript
import { combineReducers } from "redux";
import url from "../../utils/url";
import { FETCH_DATA } from "../middleware/api";
import { schema as shopSchema, getShopById } from "./entities/shops";
import { schema as productSchema, getProductDetail, getProductById } from "./entities/products";


// actionTypes
export const types = {
  // 获取产品详情
  FETCH_PRODUCT_DETAIL_REQUEST: 'DETAIL/FETCH_PRODUCT_DETAIL_REQUEST',
  FETCH_PRODUCT_DETAIL_SUCCESS: 'DETAIL/FETCH_PRODUCT_DETAIL_SUCCES',
  FETCH_PRODUCT_DETAIL_FAILURE: 'DETAIL/FETCH_PRODUCT_DETAIL_FAILURE',
  // 获取关联店铺信息
  FETCH_SHOP_REQUEST: 'DETAIL/FETCH_SHOP_REQUEST',
  FETCH_SHOP_SUCCESS: 'DETAIL/FETCH_SHOP_SUCCESS',
  FETCH_SHOP_FAILURE: 'DETAIL/FETCH_SHOP_FAILURE',
}

// actionCreator（异步action）
export const actions = {
  //获取商品详情
  loadProductDetail: id => {
    return (dispatch, getState) => {
			// 检查是否有缓存
      const product = getProductDetail(getState(),id);
      if(product) {
        return dispatch(fetchProductDetailSuccess(id))
      }
			// 没有缓存就请求
      const endpoint = url.getProductDetail(id);
      return dispatch(fetchProductDetail(endpoint, id));
    }
  },
  // 获取店铺信息
  loadShopById: id => {
    return (dispatch, getState) => {
			// 检查是否有缓存
      const shop = getShopById(getState(),id);
      if(shop) {
        return dispatch(fetchShopSuccess(id))
      }
			// 没有缓存就请求
      const endpoint = url.getShopById(id);
      return dispatch(fetchShopById(endpoint, id));
    }
  }
}

const fetchProductDetail = (endpoint, id) => ({
  [FETCH_DATA]: {
    types: [
      types.FETCH_PRODUCT_DETAIL_REQUEST,
      types.FETCH_PRODUCT_DETAIL_SUCCESS,
      types.FETCH_PRODUCT_DETAIL_FAILURE,
    ],
    endpoint,
    schema: productSchema
  },
  id
})

const fetchShopById = (endpoint, id) => ({
  [FETCH_DATA]: {
    types: [
      types.FETCH_SHOP_REQUEST,
      types.FETCH_SHOP_SUCCESS,
      types.FETCH_SHOP_FAILURE,
    ],
    endpoint,
    schema: shopSchema
  },
  id
})

const fetchProductDetailSuccess = (id) => ({
  type: types.FETCH_PRODUCT_DETAIL_SUCCESS,
  id,
})

const fetchShopSuccess = (id) => ({
  type: types.FETCH_SHOP_SUCCESS,
  id,
})
```

## 定义Reducers
`reducer`我们可以分成两个部分，针对商品详情的`reducer`和商户详情的`reducer`：
```javascript
// 商品详情reducer
const product = (state = initialState.product, action) => {
  switch (action.type) {
    case types.FETCH_PRODUCT_DETAIL_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_PRODUCT_DETAIL_SUCCESS:
      return { ...state, id: action.id, isFetching: false };
    case types.FETCH_PRODUCT_DETAIL_FAILURE:
      return { ...state, isFetching: false, id: null };
    default:
      return state;
  }
};

// 店铺reducer
const relatedShop = (state = initialState.relatedShop, action) => {
  switch (action.type) {
    case types.FETCH_SHOP_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_SHOP_SUCCESS:
      return { ...state, id: action.id, isFetching: false };
    case types.FETCH_SHOP_FAILURE:
      return { ...state, isFetching: false, id: null };
    default:
      return state;
  }
};

const reducer = combineReducers({
  product,
  relatedShop
});

export default reducer;

// selectors
//获取商品详情
export const getProduct = (state, id) => {
  return getProductDetail(state, id)
}

//获取管理的店铺信息
export const getRelatedShop = (state, productId) => {
  const product = getProductById(state, productId);
  let shopId = product ? product.nearestShop : null;
  if(shopId) {
    return getShopById(state, shopId);
  }
  return null;
}
```
关于整个团购详情页相关的`detail.js`的代码，我们可以查看[github源码](https://github.com/taopoppy/fontdemo/blob/master/dianping-react/src/redux/modules/detail.js)

## 连接Redux和使用
回到容器性组件当中去连接`redux`：
```javascript
import {
  actions as detailActions,
  getProduct,
  getRelatedShop
} from "../../redux/modules/detail"; // 1. 引入redux相关


class ProductDetail extends Component {
	// 5. 编写交互行为
  render() {
    const { product, relatedShop } = this.props;
    return (
      <div>
        <Header title="团购详情" onBack={this.handleBack} grey />
        {product && <ProductOverview data={product} />}
        {relatedShop && (
          <ShopInfo data={relatedShop} total={product.shopIds.length} />
        )}
        {product && (
          <div>
            <Detail data={product} />
            <Remark data={product} />
            <BuyButton productId={product.id} />
          </div>
        )}
      </div>
    );
  }

	// 4. 组件挂载完毕
  componentDidMount() {
    const { product } = this.props;
    if (!product) {
			// 4.1 如果redux没有该产品的详情信息，就要重新请求
      const productId = this.props.match.params.id;
      this.props.detailActions.loadProductDetail(productId);
    } else if (!this.props.relatedShop) {
      this.props.detailActions.loadShopById(product.nearestShop);
    }
  }

  componentDidUpdate(preProps) {
    // 5. 第一次获取到产品详情时，需要继续获取关联的店铺信息
    if (!preProps.product && this.props.product) {
      this.props.detailActions.loadShopById(this.props.product.nearestShop);
    }
  }

	// 6. 返回按钮
  handleBack = () => {
    this.props.history.goBack();
  };
}

// 2. 创建mapStateToProps
const mapStateToProps = (state, props) => {
  const productId = props.match.params.id; // 2.1 从路由中拿到商品id
  return {
    product: getProduct(state, productId),
    relatedShop: getRelatedShop(state, productId)
  };
};

// 3. 创建mapDispatchToProps
const mapDispatchToProps = dispatch => {
  return {
    detailActions: bindActionCreators(detailActions, dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductDetail);
```

连接成功`redux`之后，按照传给每个组件的就是实际的数据了，我们只需要回到前面每个组件当中修改静态数据为`props`传入组件的数据即可。这里就不再展示，具体代码可以到[github仓库](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/ProductDetail/components)中仔细查看。

## Redux DevTools
我们下面要将首页的请求的真实数据和最终数据保存在`redux`的形式展示给大家，首先是我们在首页请求的`Mock`的格式：
+ [p-i00.json](https://github.com/taopoppy/fontdemo/blob/master/dianping-react/public/mock/product_detail/p-100.json)
+ [s-10.json](https://github.com/taopoppy/fontdemo/blob/master/dianping-react/public/mock/shops/s-10.json)

最后我们用合成的一张图来展示每次请求派发的action和对应redux中数据相应的变化：

<img :src="$withBase('/react_redux_detail_reduxdev.png')" alt="">