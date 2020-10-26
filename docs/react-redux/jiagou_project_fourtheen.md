# 购买页面开发

## 页面分析和组件划分(重要)
实际上购买页面比较简单，除了顶部的组件是我们之前就定义好的的一个通用组件，实际内部只有一个表单组件`PurchaseForm`，另外有提示购买成功的提示框组件`Tip`，我们会在通用组件当中去定义。

所以我们先来创建`src/containers/Purchase/components/`和`src/containers/Purchase/index.js`，然后我们去路由当前添加一下购买页面的路由：
```javascript
// src/containers/App/index.js
import Purchase from "../Purchase" // 1. 引入

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/user" component={User} />
            <Route path="/detail/:id" component={ProductDetail} />
            <Route path="/search" component={Search} />
            <Route path="/search_result" component={SearchResult} />
            <PrivateRoute path="/purchase/:id" component={Purchase} /> {/*2. 使用*/}
            <Route path="/" component={Home} />
          </Switch>
        </Router>
      </div>
    );
  }
}
```

## 组件UI开发
### 1. 购买表单(PurchaseForm)
创建购买表单组件：`src/containers/Purchase/components/PurchaseForm/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/Purchase/components/PurchaseForm/index.js
import React, { Component } from "react";
import "./style.css";

class PurchaseForm extends Component {
  render() {
    return (
      <div className="purchaseForm">
        <div className="purchaseForm__wrapper">
          <div className="purchaseForm__row">
            <div className="purchaseForm__rowLabel">数量</div>
            <div className="purchaseForm__rowValue">
              <span
                className="purchaseForm__counter--dec"
                onClick={this.handleDecrease}
              >
                -
              </span>
              <input
                className="purchaseForm__quantity"
                onChange={this.handleChange}
                value={0}
              />
              <span
                className="purchaseForm__counter--inc"
                onClick={this.handleIncrease}
              >
                +
              </span>
            </div>
          </div>
          <div className="purchaseForm__row">
            <div className="purchaseForm__rowLabel">小计</div>
            <div className="purchaseForm__rowValue">
              <span className="purchaseForm__totalPrice">¥120.0</span>
            </div>
          </div>
          <div className="purchaseForm__row">
            <div className="purchaseForm__rowLabel">手机号码</div>
            <div className="purchaseForm__rowValue">1101101100</div>
          </div>
        </div>
        <ul className="purchaseForm__remark">
          <li className="purchaseForm__remarkItem">
            <i className="purchaseForm__sign" />
            <span className="purchaseForm__desc">支持随时退</span>
          </li>
          <li>
            <i className="purchaseForm__sign" />
            <span className="purchaseForm__desc">支持过期退</span>
          </li>
        </ul>
        <a className="purchaseForm__submit" onClick={this.handleClick}>
          提交订单
        </a>
      </div>
    );
  }

  handleDecrease = () => {};  // 数量减少

  handleIncrease = () => {};  // 数量增加

  handleChange = () => {};

  handleClick = () => {};
}

export default PurchaseForm;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/Purchase/components/PurchaseForm/style.css)上自行查看。


### 2. 提示组件(Tip)
创建提示组件组件：`src/components/Tip/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/components/Tip/index.js
import React, { Component } from "react";
import "./style.css"

class Tip extends Component {
  render() {
    const { message, onClose } = this.props;
    return (
      <div className="tip">
        <div className="tip__alert">
          <div className="tip__content">{message}</div>
          <div className="tip__btns">
            <a className="tip__btn" onClick={onClose}>
              确定
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default Tip;

```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/components/Tip/style.css)上自行查看。

最后将`PurchaseForm`和`Tip`组件添加到购买页面当中：
```javascript
// src/containers/Purchase/index.js
import React, { Component } from 'react';
import Header from "../../components/Header"
import PurchaseForm from "./components/PurchaseForm"
import Tip from "../../components/Tip"

class Purchase extends Component {
  render() {
    return (
      <div>
        <Header title="下单" onBack={this.handleBack}/>
        <PurchaseForm/>
        <Tip message="购买成功！" onClose={this.handleCloseTip} />
      </div>
    );
  }

  handleBack = () => {
    this.props.history.goBack();
  }

  handleCloseTip = () => {

  }
}

export default Purchase;
```

## 设计State
这里在表单当中的数据有三个：数量，总价格和电话，其中数量是要作为一个`State`的，因为这个是用户可以通过交互修改的，然而总价和电话都是可以根据现有的`State`直接拿到或者计算出来的，不能算`State`，另外还有一个就是提示框的状态。所以总结下来购买页面有两个`State`：
+ 购买数量：`quantity`
+ 提示框显示状态：`showTip`

```javascript
// src/redux/modules/purchase.js
const initialState = {
  quantity: 1,
  showTip: false,
}
```

## 定义Actions
```javascript
export const types = {
	// 设置数量
  SET_ORDER_QUANTITY: "PURCHASE/SET_ORDER_QUANTITY",
	// 关闭提示框
	CLOSE_TIP: "PURCHASE/CLOSE_TIP",
  //提交订单相关
  SUBMIT_ORDER_REQUEST: "PURCHASE/SUBMIT_ORDER_REQUEST",
  SUBMIT_ORDER_SUCCESS: "PURCHASE/SUBMIT_ORDER_SUCCESS",
  SUBMIT_ORDER_FAILURE: "PURCHASE/SUBMIT_ORDER_FAILURE"
}

// action creators
export const actions = {
  //设置下单数量
  setOrderQuantity: quantity => ({
    type: types.SET_ORDER_QUANTITY,
    quantity
  }),
  //关闭提示弹窗
  closeTip: () => ({
    type: types.CLOSE_TIP
  }),
  //提交订单
  submitOrder: productId => {
    return (dispatch, getState) => {
      dispatch({type: types.SUBMIT_ORDER_REQUEST});
      return new Promise((resovle, reject) => {
        setTimeout(() => {
          const product = getProductDetail(getState(), productId);
          const quantity = getState().purchase.quantity;
          const totalPrice = (product.currentPrice * quantity).toFixed(1);
          const text1 = `${quantity}张 | 总价：${totalPrice}`;
          const text2 = product.validityPeriod;
          const order = {
            title: `${product.shop}:${product.product}`,
            orderPicUrl: product.picture,
            channel: '团购',
            statusText: '待消费',
            text: [text1, text2],
            type: AVAILABLE_TYPE
          }
          dispatch(orderActions.addOrder(order)); // 提交增加订单
          dispatch({type: types.SUBMIT_ORDER_SUCCESS}); // 提交订单成功
        }, 500);
      })
    }
  }
}

```

## 定义Reducers
```javascript
const reducer = (state=initialState, action) => {
  switch (action.type) {
    case types.SET_ORDER_QUANTITY:
      return {...state, quantity: action.quantity}
    case types.CLOSE_TIP:
      return {...state, showTip: false}
    case types.SUBMIT_ORDER_SUCCESS:
      return {...state, showTip: true}
    default:
      return state;
  }
}

export default reducer;

//selectors
export const getQuantity = (state) => {
  return state.purchase.quantity
}

export const getTipStatus = (state) => {
  return state.purchase.showTip
}

export const getProduct = (state, id) => {
  return getProductDetail(state, id)
}
```

## 连接Redux和使用
```javascript
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Header from "../../components/Header";
import PurchaseForm from "./components/PurchaseForm";
import Tip from "../../components/Tip";
import {
  actions as purchaseActions,
  getProduct,
  getQuantity,
  getTipStatus
} from "../../redux/modules/purchase";
import { getUsername } from "../../redux/modules/login";
import { actions as detailActions } from "../../redux/modules/detail";

class Purchase extends Component {
  render() {
    const { product, phone, quantity, showTip } = this.props;
    return (
      <div>
        <Header title="下单" onBack={this.handleBack} />
        {product ? (
          <PurchaseForm
            product={product}
            phone={phone}
            quantity={quantity}
            onSubmit={this.handleSubmit}
            onSetQuantity={this.handleSetQuantity}
          />
        ) : null}
        {showTip ? (
          <Tip message="购买成功！" onClose={this.handleCloseTip} />
        ) : null}
      </div>
    );
  }

  componentDidMount() {
    const { product } = this.props;
    if (!product) {
      const productId = this.props.match.params.id;
      this.props.detailActions.loadProductDetail(productId);
    }
  }

  componentWillUnmount() {
    this.props.purchaseActions.setOrderQuantity(1);
  }

  handleBack = () => {
    this.props.history.goBack();
  };

  handleCloseTip = () => {
    this.props.purchaseActions.closeTip();
  };

  // 提交订单
  handleSubmit = () => {
    const productId = this.props.match.params.id;
    this.props.purchaseActions.submitOrder(productId);
  };

  //设置购买数量
  handleSetQuantity = quantity => {
    this.props.purchaseActions.setOrderQuantity(quantity);
  };
}

const mapStateToProps = (state, props) => {
  const productId = props.match.params.id;
  return {
    product: getProduct(state, productId),
    quantity: getQuantity(state),
    showTip: getTipStatus(state),
    phone: getUsername(state)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    purchaseActions: bindActionCreators(purchaseActions, dispatch),
    detailActions: bindActionCreators(detailActions, dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Purchase);
```
