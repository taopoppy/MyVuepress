# 首页开发-UI

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
