# 团购详情页开发-State

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