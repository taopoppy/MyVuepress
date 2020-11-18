# 轮播图和列表
::: danger
css分析
+ <font color=#9400D3>flex-wrap</font>：指定flex元素单行显示还是多行显示
	+ <font color=#1E90FF>wrap</font>：flex元素被打断到多个行中。cross-start会根据flex-direction的值选择等于start或before。cross-end为确定的 cross-start的另一端。

+ <font color=#9400D3>linear-gradient()</font>：用于创建一个表示两种或多种颜色线性渐变的图片，[MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/linear-gradient())提供了丰富的示例

+ <font color=#9400D3>vertical-align</font>：指定行内元素（inline）或表格单元格（table-cell）元素的垂直对齐方式。<font color=#DD1144>这个非常有用，尤其在文字和图片在一行的时候对其很有用</font>，[MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/vertical-align)给出了丰富的示例

+ <font color=#9400D3>box-sizing</font>：如何计算一个元素的总宽度和总高度。
	+ <font color=#1E90FF>content-box</font>：是默认值。如果你设置一个元素的宽为100px，那么这个元素的内容区会有100px 宽，并且任何边框和内边距的宽度都会被增加到最后绘制出来的元素宽度中
	+ <font color=#1E90FF>boder-box</font>：你想要设置的边框和内边距的值是包含在width内的。也就是说，如果你将一个元素的width设为100px，那么这100px会包含它的border和padding，内容区的实际宽度是width减去(border + padding)的值。大多数情况下，这使得我们更容易地设定一个元素的宽高。但是border-box不包含margin
:::

## 轮播图
现在来开发`recommend`组件，首先进入到`src`目录下`application/Recommend/index.js`中:

```javascript
import React from 'react';
import Slider from '../../components/slider';

function Recommend () {

  //mock 数据
  const bannerList = [1,2,3,4].map (item => {
    return { imageUrl: "http://p1.music.126.net/ZYLJ2oZn74yUz5x8NBGkVA==/109951164331219056.jpg" }
  });

  return (
    <div>
      <Slider bannerList={bannerList}></Slider>
    </div>
  )
}

export default React.memo (Recommend);
```

我们使用`Swiper`轮播图组件：
```javascript
npm install swiper@4.5.0 --save
```

然后来开发轮播图的组件：
```javascript
//components/slider/index.js
import React, { useEffect, useState } from 'react';
import { SliderContainer } from './style';
import "swiper/dist/css/swiper.css";
import Swiper from "swiper";

function Slider (props) {
  const [sliderSwiper, setSliderSwiper] = useState (null);
  const { bannerList } = props;

  useEffect (() => {
    if (bannerList.length && !sliderSwiper){
        let newSliderSwiper = new Swiper(".slider-container", {
          loop: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false,
          },
          pagination: {el:'.swiper-pagination'},
        });
        setSliderSwiper(newSliderSwiper);
    }
  }, [bannerList.length, sliderSwiper]);

  return (
    <SliderContainer>
      <div className="before"></div>
      <div className="slider-container">
        <div className="swiper-wrapper">
          {
            bannerList.map (slider => {
              return (
                <div className="swiper-slide" key={slider.imageUrl}>
                  <div className="slider-nav">
                    <img src={slider.imageUrl} width="100%" height="100%" alt="推荐" />
                  </div>
                </div>
              );
            })
          }
        </div>
        <div className="swiper-pagination"></div>
      </div>
    </SliderContainer>
  );
}

export default React.memo (Slider);
```

对应的`style.js`文件：
```javascript
import styled from'styled-components';
import style from '../../assets/global-style';

export const SliderContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  margin: auto;
  background: white;
  .before {
    position: absolute;
    top: 0;
    height: 60%;
    width: 100%;
    background: ${style["theme-color"]};
  }
  .slider-container {
    position: relative;
    width: 98%;
    height: 160px;
    overflow: hidden;
    margin: auto;
    border-radius: 6px;
    .slider-nav {
      position: absolute;
      display: block;
      width: 100%;
      height: 100%;
    }
    .swiper-pagination-bullet-active {
      background: ${style ["theme-color"]};
    }
  }
`
```

## 推荐列表
首先在`recommend`组件中:
```javascript
import React from 'react';
import Slider from '../../components/slider';
import RecommendList from '../../components/list';

function Recommend () {

  //mock 数据
  const bannerList = [1,2,3,4].map (item => {
    return { imageUrl: "http://p1.music.126.net/ZYLJ2oZn74yUz5x8NBGkVA==/109951164331219056.jpg" }
  });

  const recommendList = [1,2,3,4,5,6,7,8,9,10].map (item => {
    return {
      id: 1,
      picUrl: "https://p1.music.126.net/fhmefjUfMD-8qtj3JKeHbA==/18999560928537533.jpg",
      playCount: 17171122,
      name: "朴树、许巍、李健、郑钧、老狼、赵雷"
    }
  });

  return (
    <div>
      <Slider bannerList={bannerList}></Slider>
      <RecommendList recommendList={recommendList}></RecommendList> 
    </div>
  )
}

export default React.memo (Recommend);
```
然后我们创建`components/list/index.js`,内容如下：
```javascript
// src/components/list/index.js
import React from 'react';
import { getCount } from '../../api/utils.js'
import {
  ListWrapper,
  ListItem,
  List
} from './style';


function RecommendList (props) {
  return (
    <ListWrapper>
      <h1 className="title"> 推荐歌单 </h1>
      <List>
        {
          props.recommendList.map((item, index) => {
            return (
              <ListItem key={item.id + index}>
                <div className="img_wrapper">
                  <div className="decorate"></div>
                    {/* 加此参数可以减小请求的图片资源大小 */}
                  <img src={item.picUrl + "?param=300x300"} width="100%" height="100%" alt="music"/>
                  <div className="play_count">
                    <i className="iconfont play">&#xe885;</i>
                    <span className="count">{getCount(item.playCount)}</span>
                  </div>
                </div>
                <div className="desc">{item.name}</div>
              </ListItem>
            )
          })
        }
      </List>
    </ListWrapper>
  );
  }

export default React.memo (RecommendList);
```
工具函数我们写在`api/utils.js`下面：
```javascript
//src/api/utils.js
export const getCount = (count) => {
  if (count < 0) return;
  if (count < 10000) {
    return count;
  } else if (Math.floor (count / 10000) < 10000) {
    return Math.floor (count/1000)/10 + "万";
  } else  {
    return Math.floor (count / 10000000)/ 10 + "亿";
  }
}
```
对应的样式代码如下：
```javascript
// src/components/list/style.js
import styled from'styled-components';
import style from '../../assets/global-style';

export const ListWrapper = styled.div`
  max-width: 100%;
  .title {
    font-weight: 700;
    padding-left: 6px;
    font-size: 14px;
    line-height: 60px;
  }
`;
export const List = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
`;

export const ListItem = styled.div`
  position: relative;
  width: 32%;

  .img_wrapper {
    .decorate {
      position: absolute;
      top: 0;
      width: 100%;
      height: 35px;
      border-radius: 3px;
      background: linear-gradient (hsla (0,0%,43%,.4),hsla (0,0%,100%,0));
    }
    position: relative;
    height: 0;
    padding-bottom: 100%;
    .play_count {
      position: absolute;
      right: 2px;
      top: 2px;
      font-size: ${style ["font-size-s"]};
      line-height: 15px;
      color: ${style ["font-color-light"]};
      .play {
        vertical-align: top;
      }
    }
    img {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 3px;
    }
  }
  .desc {
      overflow: hidden;
      margin-top: 2px;
      padding: 0 2px;
      height: 50px;
      text-align: left;
      font-size: ${style ["font-size-s"]};
      line-height: 1.4;
      color: ${style ["font-color-desc"]};
    }
`;
```