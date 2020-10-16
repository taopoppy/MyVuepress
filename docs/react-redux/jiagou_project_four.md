# 团购详情页开发-UI

## 页面分析和组件划分
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

## 团购基本信息
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

## 商户基本信息
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

## 团购详情
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

## 购买须知
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

## 其他组件
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