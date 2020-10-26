# 个人中心页面开发

## 页面分析和组件划分(重要)

<img :src="$withBase('/react_redux_jiagou_personal.png')" alt="">

根据设计图和组件划分的原则，我们将个人中心页面划分为三个组件：`UserHeader`、`UserMain`和`OrderItem`。

所以我们先来个人中心页面的组件文件，创建`src/containers/User/index.js`和`src/containers/User/components/`

然后关于将个人中心的路由添加到路由系统中，我们之前通过开发路由校验登录已经实现了，这里就展示一下之前的代码：
```javascript
// src/containers/App/index.js
import PrivateRoute from "../PrivateRoute"; // 1. 引入
import User from "../User";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/user" component={User} /> {/* 2. 使用*/}
            <Route path="/detail/:id" component={ProductDetail} />
            <Route path="/search" component={Search} />
            <Route path="/search_result" component={SearchResult} />
            <Route path="/" component={Home} />
          </Switch>
        </Router>
      </div>
    );
  }
}
```
## 组件UI开发
### 1. 订单展示页组件(UserMain)
创建订单展示页组件：`src/containers/User/components/UserMain/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/User/components/UserMain/index.js
import React, { Component } from "react";
import OrderItem from "../OrderItem"
import "./style.css"

const tabTitles = ["全部订单", "待付款", "可使用", "退款/售后"];

class UserMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0
    };
  }

  render() {
    const { currentTab } = this.state;
    return (
      <div className="userMain">
        <div className="userMain__menu">
          {tabTitles.map((item, index) => {
            return (
              <div key={index} className="userMain__tab" onClick={this.handleClickTab.bind(this, index)}>
                <span
                  className={
                    currentTab === index
                      ? "userMain__title userMain__title--active"
                      : "userMain__title"
                  }
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
        <div className="userMain__content">
          {data && data.length > 0
            ? this.renderOrderList(data)
            : this.renderEmpty()}
        </div>
      </div>
    );
  }

  renderOrderList = data => {
    return data.map(item => {
      return (
        <OrderItem key={item.id} data={item}/>
      )
    })
  }

  renderEmpty = () => {
    return (
      <div className="userMain__empty">
        <div className="userMain__emptyIcon"/>
        <div className="userMain__emptyText1">您还没有相关订单</div>
        <div className="userMain__emptyText2">去逛逛看有哪些想买的</div>
      </div>
    )
  } 

  handleClickTab = (index) => {
    this.setState({
      currentTab: index
    })
  }
}

export default UserMain;

```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/User/components/UserMain/style.css)上自行查看。

最后将订单展示页组件`UserMain`添加到个人中心页面当中：
```javascript
// src/containers/User/index.js
import React, { Component } from 'react';
import UserMain from "./components/UserMain" // 1. 引入

class User extends Component {
  render() {
    return (
      <div>
        <UserMain/> {/* 2. 使用*/}
      </div>
    );
  }
}

export default User;
```

### 2. 订单展示项组件(OrderItem)
创建订单展示项组件：`src/containers/User/components/OrderItem/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/User/components/OrderItem/index.js
import React, { Component } from "react";
import "./style.css"

class OrderItem extends Component {
  render() {
    const {
      data: { title, statusText, orderPicUrl, channel, text, type }
    } = this.props;
    return (
      <div className="orderItem">
        <div className="orderItem__title">
          <span>{title}</span>
        </div>
        <div className="orderItem__main">
          <div className="orderItem__imgWrapper">
            <div className="orderItem__tag">{statusText}</div>
            <img alt="" className="orderItem__img" src={orderPicUrl} />
          </div>
          <div className="orderItem__content">
            <div className="orderItem__line">{text[0]}</div>
            <div className="orderItem__line">{text[1]}</div>
          </div>
        </div>
        <div className="orderItem__bottom">
          <div className="orderItem__type">{channel}</div>
          <div>
            {type === 1 ? <div className="orderItem__btn">评价</div> : null}
            <div className="orderItem__btn">删除</div>
          </div>
        </div>
      </div>
    );
  }
}

export default OrderItem;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/User/components/OrderItem/style.css)上自行查看。

### 3. 个人中心头部组件(UserHeader)
创建个人中心头部组件：`src/containers/User/components/UserHeader/index.js`，然后按照惯例，我们需要先书写静态的页面：
```javascript
// src/containers/User/components/UserHeader/index.js
import React, { Component } from "react";
import "./style.css"

class UserHeader extends Component {
  render() {
    const { onBack, onLogout } = this.props;
    return (
      <header className="userHeader">
        <div className="userHeader__back" onClick={onBack}>
          首页
        </div>
        <div className="userHeader__list">
          <span className="userHeader__item userHeader__item--selected">
            订单
          </span>
          <span className="userHeader__item">抵用券</span>
        </div>
        <div className="userHeader__right" onClick={onLogout}>
          注销
        </div>
      </header>
    );
  }
}

export default UserHeader;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/containers/User/components/UserHeader/style.css)上自行查看。

最后将个人中心头部组件`UserHeader`添加到个人中心页面当中：
```javascript
// src/containers/User/index.js
import React, { Component } from 'react';
import UserMain from "./components/UserMain"
import UserHeader from "./components/UserHeader" // 1. 引入

class User extends Component {
  render() {
    return (
      <div>
        <UserHeader onBack={this.handleBack} onLogout={this.handleLogout}/> {/* 2. 使用*/}
        <UserMain/>
      </div>
    );
  }

  handleBack = () => {
    // todo
  }

  handleLogout = () => {
    // todo
  }
}

export default User;
```

### 4. 订单删除和评论
点击订单的删除按钮，会弹出一个确认删除的按钮，所以我们将创建一个公用的弹出组件`Confirm`：
```javascript
// src/components/Confirm/index.js
import React, { Component } from "react";
import "./style.css";

class Confirm extends Component {
  render() {
    const {
      content,
      cancelText,
      confirmText,
      onCancel,
      onConfirm
    } = this.props;
    return (
      <div className="confirm">
        <div className="confirm__alert">
          <div className="confirm__content">{content}</div>
          <div className="confirm__btns">
            <a className="confirm__btn" onClick={onCancel}>
              {cancelText}
            </a>
            <a className="confirm__btn" onClick={onConfirm}>
              {confirmText}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default Confirm;
```
然后相关的`css`内容请在[github](https://github.com/taopoppy/fontdemo/tree/master/dianping-react/src/components/Confirm/style.css)上自行查看。

然后评价功能我们需要在点击的时候去展开一个输入框，然后输入信息，这样的话，我们的`UserMain`组件就变的复杂了，我们这里直接给出`OrderItem`和`UserMain`的完整代码：
```javascript
// src/containers/User/components/OrderItem/index.js
import React, { Component } from "react";
import "./style.css";

class OrderItem extends Component {
  render() {
    const {
      data: { title, statusText, orderPicUrl, channel, text, type, commentId },
      isCommenting
    } = this.props;
    return (
      <div className="orderItem">
        <div className="orderItem__title">
          <span>{title}</span>
        </div>
        <div className="orderItem__main">
          <div className="orderItem__imgWrapper">
            <div className="orderItem__tag">{statusText}</div>
            <img alt="" className="orderItem__img" src={orderPicUrl} />
          </div>
          <div className="orderItem__content">
            <div className="orderItem__line">{text[0]}</div>
            <div className="orderItem__line">{text[1]}</div>
          </div>
        </div>
        <div className="orderItem__bottom">
          <div className="orderItem__type">{channel}</div>
          <div>
            {type === 1 && !commentId ? (
              <div className="orderItem__btn" onClick={this.handleComment}>
                评价
              </div>
            ) : null}
            <div className="orderItem__btn" onClick={this.handleRemove}>
              删除
            </div>
          </div>
        </div>
        {isCommenting ? this.renderEditArea() : null}
      </div>
    );
  }

  //渲染订单评价区域的DOM
  renderEditArea() {
    return (
      <div className="orderItem__commentContainer">
        <textarea
          className="orderItem__comment"
          onChange={this.handleCommentChange}
          value={this.props.comment}
        />
        {this.renderStars()}
        <button
          className="orderItem__commentBtn"
          onClick={this.props.onSubmitComment}
        >
          提交
        </button>
        <button
          className="orderItem__commentBtn"
          onClick={this.props.onCancelComment}
        >
          取消
        </button>
      </div>
    );
  }

  renderStars() {
    const { stars } = this.props;
    return (
      <div>
        {[1, 2, 3, 4, 5].map((item, index) => {
          const lightClass = stars >= item ? "orderItem__star--light" : "";
          return (
            <span
              className={"orderItem__star " + lightClass}
              key={index}
              onClick={this.props.onStarsChange.bind(this, item)}
            >
              ★
            </span>
          );
        })}
      </div>
    );
  }

  //评价按钮点击事件
  handleComment = () => {
    const {
      data: { id }
    } = this.props;
    this.props.onComment(id);
  };

  //评价信息发生变化
  handleCommentChange = e => {
    this.props.onCommentChange(e.target.value);
  };

  //删除订单
  handleRemove = () => {
    this.props.onRemove();
  };
}

export default OrderItem;

```
```javascript
// src/containers/User/containers/UserMain/index.js
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  actions as userActions,
  getCurrentTab,
  getDeletingOrderId,
  getCurrentOrderComment,
  getCurrentOrderStars,
  getCommentingOrderId
} from "../../../../redux/modules/user";
import OrderItem from "../../components/OrderItem";
import Confirm from "../../../../components/Confirm";
import "./style.css";

const tabTitles = ["全部订单", "待付款", "可使用", "退款/售后"];

class UserMain extends Component {
  render() {
    const { currentTab, data, deletingOrderId } = this.props;
    return (
      <div className="userMain">
        <div className="userMain__menu">
          {tabTitles.map((item, index) => {
            return (
              <div
                key={index}
                className="userMain__tab"
                onClick={this.handleClickTab.bind(this, index)}
              >
                <span
                  className={
                    currentTab === index
                      ? "userMain__title userMain__title--active"
                      : "userMain__title"
                  }
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
        <div className="userMain__content">
          {data && data.length > 0
            ? this.renderOrderList(data)
            : this.renderEmpty()}
        </div>
        {deletingOrderId ? this.renderConfirmDialog() : null}
      </div>
    );
  }

  renderOrderList = data => {
    const { commentingOrderId, orderComment, orderStars } = this.props;
    return data.map(item => {
      return (
        <OrderItem
          key={item.id}
          data={item}
          isCommenting={item.id === commentingOrderId}
          comment={item.id === commentingOrderId ? orderComment : ""}
          stars={item.id === commentingOrderId ? orderStars : 0}
          onCommentChange={this.handleCommentChange}
          onStarsChange={this.handleStarsChange}
          onComment={this.handleComment.bind(this, item.id)}
          onRemove={this.handleRemove.bind(this, item.id)}
          onSubmitComment={this.handleSubmitComment}
          onCancelComment={this.handleCancelComment}
        />
      );
    });
  };

  renderEmpty = () => {
    return (
      <div className="userMain__empty">
        <div className="userMain__emptyIcon" />
        <div className="userMain__emptyText1">您还没有相关订单</div>
        <div className="userMain__emptyText2">去逛逛看有哪些想买的</div>
      </div>
    );
  };

  //删除对话框
  renderConfirmDialog = () => {
    const {
      userActions: { hideDeleteDialog, removeOrder }
    } = this.props;
    return (
      <Confirm
        content="确定删除该订单吗？"
        cancelText="取消"
        confirmText="确定"
        onCancel={hideDeleteDialog}
        onConfirm={removeOrder}
      />
    );
  };

  // 评价内容变化
  handleCommentChange = comment => {
    const {
      userActions: { setComment }
    } = this.props;
    setComment(comment);
  };

  // 订单评级变化
  handleStarsChange = stars => {
    const {
      userActions: { setStars }
    } = this.props;
    setStars(stars);
  };

  //选中当前要评价的订单
  handleComment = orderId => {
    const {
      userActions: { showCommentArea }
    } = this.props;
    showCommentArea(orderId);
  };

  //提交评价
  handleSubmitComment = () => {
    const {
      userActions: { submitComment }
    } = this.props;
    submitComment();
  };

  //取消评价
  handleCancelComment = () => {
    const {
      userActions: { hideCommentArea }
    } = this.props;
    hideCommentArea();
  };

  handleRemove = orderId => {
    this.props.userActions.showDeleteDialog(orderId);
  };

  handleClickTab = index => {
    this.props.userActions.setCurrentTab(index);
  };
}

const mapStateToProps = (state, props) => {
  return {
    currentTab: getCurrentTab(state),
    deletingOrderId: getDeletingOrderId(state),
    commentingOrderId: getCommentingOrderId(state),
    orderComment: getCurrentOrderComment(state),
    orderStars: getCurrentOrderStars(state)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    userActions: bindActionCreators(userActions, dispatch)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserMain);

```

## 设计State
<img :src="$withBase('/react_redux_jiagou_personal.png')" alt="">

根据前面的分析，我们首先来进行实体领域的分析，因为这个页面展示的都是订单的信息，所以属于<font color=#1E90FF>订单领域</font>，我们之前在`redux`中已经定义过了`order`的订单领域实体，我们现在去完善一下：
```javascript
// src/redux/modules/entities/orders.js
import createReducer from "../../../utils/createReducer"

export const schema = {
  name: 'orders',
  id: 'id',
} 

export const USED_TYPE = 1; // 已消费
export const TO_PAY_TYPE = 2; //待付款
export const AVAILABLE_TYPE = 3; //可使用
export const REFUND_TYPE = 4; //退款

export const types = {
  //删除订单
  DELETE_ORDER: "ORDERS/DELETE_ORDER",
  //新增评价
  ADD_COMMENT: "ORDERS/ADD_COMMENT"
}

export const actions = {
  //删除订单
  deleteOrder: (orderId) => ({
    type: types.DELETE_ORDER,
    orderId
  }),
  //新增评价
  addComment: (orderId, commentId) => ({
    type: types.ADD_COMMENT,
    orderId,
    commentId
  })
}


const normalReducer = createReducer(schema.name)

const reducer = (state = {}, action) => {
  if(action.type === types.ADD_COMMENT) {
    return {
      ...state,
      [action.orderId]: {
        ...state[action.orderId],
        commentId: action.commentId
      }
    }
  } else if(action.type === types.DELETE_ORDER) {
    const {[action.orderId]: deleteOrder, ...restOrders} = state;
    return restOrders;
  } else {
    return normalReducer(state, action)
  }
}

export default reducer;

// selectors
export const getOrderById = (state, id) => {
  return state.entities.orders[id]
}
```

针对每个组件进行灵魂质问法，我们可以知道全部订单属于一个`State`，而代付款，已消费这些都是全部订单中可以筛选出的数据不属于单独的一个`State`。另外关于`UI`的切换状态也是一个`State`。最后我们在这些列表当中会进行操作，所以当前订单也属于一个`State`，我们整个个人中心页面的`State`有下面三个：
```javascript
const initialState = {
	// 订单
  orders: {
    isFetching: false,
    ids: [],
    toPayIds: [], //待付款的订单id
    availableIds: [], //可使用的订单id
    refundIds: [] //退款订单id
	},
	// 切换状态
	currentTab: 0,
	// 当前正在操作的订单
  currentOrder: {
    id: null,
    isDeleting: false,
    isCommenting: false,
    comment: "",
    stars: 0
  }
};
```

## 定义Actions
```javascript
export const types = {
  //获取订单列表
  FETCH_ORDERS_REQUEST: "USER/FETCH_ORDERS_REQUEST",
  FETCH_ORDERS_SUCCESS: "USER/FETCH_ORDERS_SUCCESS",
  FETCH_ORDERS_FAILURE: "USER/FETCH_ORDERS_FAILURE",
  //设置当选选中的tab
  SET_CURRENT_TAB: "USER/SET_CURRENT_TAB",
  //删除订单
  DELETE_ORDER_REQUEST: "USER/DELETE_ORDER_REQUEST",
  DELETE_ORDER_SUCCESS: "USER/DELETE_ORDER_SUCCESS",
  DELETE_ORDER_FAILURE: "USER/DELETE_ORDER_FAILURE",
  //删除确认对话框
  SHOW_DELETE_DIALOG: "USER/SHOW_DELETE_DIALOG",
  HIDE_DELETE_DIALOG: "USER/HIDE_DELETE_DIALOG",
  //评价订单编辑
  SHOW_COMMENT_AREA: "USER/SHOW_COMMENT_AREA",
  HIDE_COMMENT_AREA: "USER/HIDE_COMMENT_AREA",
  //编辑评价内容
  SET_COMMENT: "USER/SET_COMMENT",
  //打分
  SET_STARS: "USER/SET_STARS",
  //提交评价
  POST_COMMENT_REQUEST: "USER/POST_COMMENT_REQUEST",
  POST_COMMENT_SUCCESS: "USER/POST_COMMENT_SUCCESS",
  POST_COMMENT_FAILURE: "USER/POST_COMMENT_FAILURE"
};

export const actions = {
  // 获取订单列表
  loadOrders: () => {
    return (dispatch, getState) => {
      const { ids } = getState().user.orders;
      if (ids.length > 0) {
        return null;
      }
      const endpoint = url.getOrders();
      return dispatch(fetchOrders(endpoint));
    };
  },
  // 切换tab
  setCurrentTab: index => ({
    type: types.SET_CURRENT_TAB,
    index
  }),
  //删除订单
  removeOrder: () => {
    return (dispatch, getState) => {
      const { id } = getState().user.currentOrder;
      if (id) {
        dispatch(deleteOrderRequest());
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            dispatch(deleteOrderSuccess(id));
            dispatch(orderActions.deleteOrder(id));
            resolve();
          }, 500);
        });
      }
    };
  },
  //显示删除对话框
  showDeleteDialog: orderId => ({
    type: types.SHOW_DELETE_DIALOG,
    orderId
  }),
  //隐藏删除对话框
  hideDeleteDialog: () => ({
    type: types.HIDE_DELETE_DIALOG
  }),
  //显示订单评价编辑框
  showCommentArea: orderId => ({
    type: types.SHOW_COMMENT_AREA,
    orderId
  }),
  //显示订单评价编辑框
  hideCommentArea: () => ({
    type: types.HIDE_COMMENT_AREA
  }),
  //设置评价信息
  setComment: comment => ({
    type: types.SET_COMMENT,
    comment
  }),
  // 设置评级等级
  setStars: stars => ({
    type: types.SET_STARS,
    stars
  }),
  // 提交评价
  submitComment: () => {
    return (dispatch, getState) => {
      dispatch(postCommentRequest());
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const {
            currentOrder: { id, stars, comment }
          } = getState().user;
          const commentObj = {
            id: +new Date(),
            stars: stars,
            content: comment
          };
          dispatch(postCommentSuccess());
          dispatch(commentActions.addComment(commentObj));
          dispatch(orderActions.addComment(id, commentObj.id));
          resolve();
        });
      });
    };
  }
};

const deleteOrderRequest = () => ({
  type: types.DELETE_ORDER_REQUEST
});

const deleteOrderSuccess = orderId => ({
  type: types.DELETE_ORDER_SUCCESS,
  orderId
});

const postCommentRequest = () => ({
  type: types.POST_COMMENT_REQUEST
});

const postCommentSuccess = () => ({
  type: types.POST_COMMENT_SUCCESS
});

const fetchOrders = endpoint => ({
  [FETCH_DATA]: {
    types: [
      types.FETCH_ORDERS_REQUEST,
      types.FETCH_ORDERS_SUCCESS,
      types.FETCH_ORDERS_FAILURE
    ],
    endpoint,
    schema
  }
});
```

## 定义Reducers
```javascript
// reducers
const orders = (state = initialState.orders, action) => {
  switch (action.type) {
    case types.FETCH_ORDERS_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_ORDERS_SUCCESS:
      const toPayIds = action.response.ids.filter(
        id => action.response.orders[id].type === TO_PAY_TYPE
      );
      const availableIds = action.response.ids.filter(
        id => action.response.orders[id].type === AVAILABLE_TYPE
      );
      const refundIds = action.response.ids.filter(
        id => action.response.orders[id].type === REFUND_TYPE
      );
      return {
        ...state,
        isFetching: false,
        ids: state.ids.concat(action.response.ids),
        toPayIds: state.toPayIds.concat(toPayIds),
        availableIds: state.availableIds.concat(availableIds),
        refundIds: state.refundIds.concat(refundIds)
      };
    case orderTypes.DELETE_ORDER:
    case types.DELETE_ORDER_SUCCESS:
      return {
        ...state,
        ids: removeOrderId(state, "ids", action.orderId),
        toPayIds: removeOrderId(state, "toPayIds", action.orderId),
        availableIds: removeOrderId(state, "availableIds", action.orderId),
        refundIds: removeOrderId(state, "refundIds", action.orderId)
      };
    default:
      return state;
  }
};

const removeOrderId = (state, key, orderId) => {
  return state[key].filter(id => {
    return id !== orderId;
  });
};

const currentTab = (state = initialState.currentTab, action) => {
  switch (action.type) {
    case types.SET_CURRENT_TAB:
      return action.index;
    default:
      return state;
  }
};

const currentOrder = (state = initialState.currentOrder, action) => {
  switch (action.type) {
    case types.SHOW_DELETE_DIALOG:
      return {
        ...state,
        id: action.orderId,
        isDeleting: true
      };
    case types.SHOW_COMMENT_AREA:
      return {
        ...state,
        id: action.orderId,
        isCommenting: true
      };
    case types.HIDE_DELETE_DIALOG:
    case types.HIDE_COMMENT_AREA:
    case types.DELETE_ORDER_SUCCESS:
    case types.DELETE_ORDER_FAILURE:
    case types.POST_COMMENT_SUCCESS:
    case types.POST_COMMENT_FAILURE:
      return initialState.currentOrder;
    case types.SET_COMMENT:
      return { ...state, comment: action.comment };
    case types.SET_STARS:
      return { ...state, stars: action.stars };
    default:
      return state;
  }
};

const reducer = combineReducers({
  currentTab,
  orders,
  currentOrder
});

export default reducer;

// selectors
export const getCurrentTab = state => state.user.currentTab;

export const getOrders = state => {
  const key = ["ids", "toPayIds", "availableIds", "refundIds"][
    state.user.currentTab
  ];
  return state.user.orders[key].map(id => {
    return getOrderById(state, id);
  });
};

// 获取正在删除的订单id
export const getDeletingOrderId = state => {
  return state.user.currentOrder && state.user.currentOrder.isDeleting
    ? state.user.currentOrder.id
    : null;
};

// 获取正在评价的订单id
export const getCommentingOrderId = state => {
  return state.user.currentOrder && state.user.currentOrder.isCommenting
    ? state.user.currentOrder.id
    : null;
};

// 获取评论信息
export const getCurrentOrderComment = state => {
  return state.user.currentOrder ? state.user.currentOrder.comment : "";
};

// 获取订单评级/打分
export const getCurrentOrderStars = state => {
  return state.user.currentOrder ? state.user.currentOrder.stars : 0;
};
```
然后将`user`个人中心的`redux`模块合并到根`reducer`中即可。

## 连接Redux和使用
```javascript
import React, { Component } from 'react';
import UserMain from "./containers/UserMain"
import UserHeader from "./components/UserHeader"
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import { actions as userActions, getOrders, getCurrentTab} from "../../redux/modules/user"
import { actions as loginActions } from "../../redux/modules/login"

class User extends Component {
  render() {
    const {orders} = this.props
    return (
      <div>
        <UserHeader onBack={this.handleBack} onLogout={this.handleLogout}/>
        <UserMain data={orders} />
      </div>
    );
  }

  componentDidMount() {
    this.props.userActions.loadOrders()
  }

  handleBack = () => { // 返回
    this.props.history.push("/")
  }

  handleLogout = () => { // 注销
    this.props.loginActions.logout();
  }

  handleSetCurrentTab = (index) => {
    this.props.userActions.setCurrentTab(index)
  }
}

const mapStateToProps = (state, props) => {
  return {
    orders: getOrders(state),
    currentTab: getCurrentTab(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    userActions: bindActionCreators(userActions, dispatch), // 使用redux的user模块的action
    loginActions: bindActionCreators(loginActions, dispatch) // 使用redux的login模块的action
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
```
