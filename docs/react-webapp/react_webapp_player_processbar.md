# 进度条开发

## 环形进度条组件
环形主要用于迷你播放器上，简单地运用`svg`来进行实现。不过在正式使用`svg`开发之前，我们需要使用一个简单的案例来讲解一下需要用到的`svg`的知识。

### 1. SVG相关
<font color=#1E90FF>SVG 意为可缩放矢量图形（Scalable Vector Graphics），使用 XML 格式定义图像。</font>

在`svg`当中可以使用不同的标签来描述不同的图形，比如我们使用`svg`来描述一个圆形，就可以通过`circle`标签来描述，我们简单来看下面的这个例子
```html
<!DOCTYPE html>
<html>
<body>
<style>
	.progress-background{
      transform: scale(0.9);
      stroke: green;
	}
	.progress-bar{
      transform: scale(0.9) rotate(-90deg);
      stroke: red;
    }
	circle {
		stroke-width: 8px;
		transform-origin: center;
	}
</style>
 <svg width=64 height=64 viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
	<circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
		<circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" 
			 stroke-dasharray="314"
			 stroke-dashoffset="100"/>
</svg>

</body>
</html>
```
从`svg`看起，我们依次来看看属性都是什么意思：
+ <font color=#1E90FF>width</font>：最终的`svg`图像的宽度
+ <font color=#1E90FF>height</font>：最终的`svg`图像的高度
+ <font color=#1E90FF>viewBox(minWidth,minHeight,maxWidth,maxHeight)</font>：允许指定一个给定的一组图形伸展以适应特定的容器元素，在上述示例的意思就是，`svg`虽然最终宽高是64px，但是你在开发的时候可以抛开这个约束，在0-100的范围进行开发，进行布局，进行分布，然后成品按照比例自动缩放至64
+ <font color=#1E90FF>circle</font>：`svg`绘制圆形需要的标签
	+ <font color=#1E90FF>r</font>：半径
	+ <font color=#1E90FF>cx</font>：圆点的x坐标
	+ <font color=#1E90FF>cy</font>：圆点的y坐标
	+ <font color=#1E90FF>fill</font>：填充
	+ <font color=#1E90FF>stroke</font>：定义了给定图形元素的外轮廓的颜色
	+ <font color=#1E90FF>stroke-width</font>：指定了当前对象的轮廓的宽度
	+ <font color=#1E90FF>stroke-dasharray</font>：控制用来描边的点划线的图案范式，意思就是如果`svg`当中如果使用的`line`画直线，指定`stroke-dasharray`为`5,5,5,5,5,5`，会按照直线的方向先画5px，然后隔段距离再画5px,以此类推最终就是个虚线，至于中间空白的距离是自动计算的，和`svg`总长度有关，(100-5*6)/5 = 14px。再例如如果我们给`circle`的`stroke-dasharray`指定周长长度的值，就是沿着圆形又画了一圈。
	+ <font color=#1E90FF>stroke-dashoffset</font>：属性指定了`dash`模式到路径开始的距离

所以理解了上面的这个例子，我们看一下上述例子的最终的效果图：

<img :src="$withBase('/react_webapp_svg_demo.png')" alt="">

### 2. 环形进度条
看完上面这个`demo`，我们再来开发真正的环形进度条就简单很多：
```javascript
//baseUI/progress-circle.js
import React from 'react';
import styled from'styled-components';
import style from '../../assets/global-style';

const CircleWrapper = styled.div`
  position: relative;
  circle {
    stroke-width: 8px;
    transform-origin: center;
    &.progress-background {
      transform: scale (0.9);
      stroke: ${style ["theme-color-shadow"]};
    }
    &.progress-bar {
      transform: scale (0.9) rotate (-90deg);
      stroke: ${style ["theme-color"]};
    }
  }
`

function ProgressCircle (props) {
  const {radius, percent} = props;
  // 整个背景的周长
  const dashArray = Math.PI * 100;
  // 没有高亮的部分，剩下高亮的就是进度
  const dashOffset = (1 - percent) * dashArray;

  return (
    <CircleWrapper>
      <svg width={radius} height={radius} viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle className="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
        <circle className="progress-bar" r="50" cx="50" cy="50" fill="transparent" 
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}/>
      </svg>
      {props.children}
    </CircleWrapper>
  )
}

export default React.memo(ProgressCircle);
```
然后将`ProgressCircle`组件应用到`miniPlayer`组件当中：
```javascript
// 将原来的暂停按钮部分修改
<div className="control">
  <ProgressCircle radius={32} percent={0.5}>
    <i className="icon-mini iconfont icon-pause">&#xe650;</i>
  </ProgressCircle>
</div>
```
上述的`percent`属性暂时是写死了，后续我们还会修改，结果就是下面这个样子：

<img :src="$withBase('/react_webapp_pause_svg.png')" alt="">

## 线性进度条组件
### 1. UI构建
```javascript
//baseUI/progressBar/index.js
import React, {useEffect, useRef, useState } from 'react';
import styled from'styled-components';
import style from '../../assets/global-style';
import { prefixStyle } from './../../api/utils';

const ProgressBarWrapper = styled.div`
  height: 30px;
  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba (0, 0, 0, .3);
    .progress {
      position: absolute;
      height: 100%;
      background: ${style["theme-color"]};
    }
    .progress-btn-wrapper {
      position: absolute;
      left: -15px;
      top: -13px;
      width: 30px;
      height: 30px;
      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 2px solid ${style["border-color"]};
        border-radius: 50%;
        background: ${style["theme-color"]};
      }
    }
  }
`

function ProgressBar (props) {
  return (
    <ProgressBarWrapper>
      <div className="bar-inner">
        <div className="progress"></div>
        <div className="progress-btn-wrapper">
          <div className="progress-btn"></div>
        </div>
      </div>
    </ProgressBarWrapper>
  )
}
```
有关细微的布局，为何是16,13,15我们使用下面的图来演示一下，结合下图你应该可以细致的了解布局，
+ 其中白色部分为`ProgressBarWrapper`
+ 绿色的部分为`bar-inner`
+ 淡黄色的部分为`progress-btn-wrapper`
+ 蓝色的部分为`progress-btn`
+ 中间红色的点是淡黄色部分和蓝色部分需要做绝对定位依赖的定点。

<img :src="$withBase('/react_webapp_progressline.png')" alt="">

为了能及时看到效果，我们在 normalPlayer 中来引入这个组件。
```javascript
import ProgressBar from "../../../baseUI/progress-bar/index";

<ProgressWrapper>
  <span className="time time-l">0:00</span>
  <div className="progress-bar-wrapper">
    <ProgressBar percent={0.2}></ProgressBar>
  </div>
  <div className="time time-r">4:17</div>
</ProgressWrapper>
```
现在，就可以看到基本的进度条的样子了。

<img src="https://user-gold-cdn.xitu.io/2019/10/26/16e07f7fe62849f4?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" alt="">

### 2. 交互逻辑开发
```javascript
import React, {useEffect, useRef, useState, memo} from 'react';
import styled from'styled-components';
import style from '../../assets/global-style';
import { prefixStyle } from '../../api/utils';

const ProgressBarWrapper = styled.div`
  height: 30px;
  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, .3);
    .progress {
      position: absolute;
      height: 100%;
      background: ${style["theme-color"]};
    }
    .progress-btn-wrapper {
      position: absolute;
      left: -15px;
      top: -13px;
      width: 30px;
      height: 30px;
      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 1px solid ${style["border-color"]};
        border-radius: 50%;
        background: ${style["theme-color"]};
      }
    }
  }
`

function ProgressBar(props) {
  const { percentChange } = props // 进度条进度发生变化所要调用的父组件传递的回调函数

  const progressBar = useRef()
  const progress = useRef()
  const progressBtn = useRef()
  const [ touch, setTouch ] = useState({})

  const _changePercent = () => {
    const barWidth = progressBar.current.clientWidth; // 拿到纯进度条的长度
    const curPercent = progress.current.clientWidth/barWidth; // 新的进度百分比计算
    percentChange(curPercent);// 把新的进度传给回调函数并执行
  }



  // 根据偏移量修改进度条和按钮的位置
  const _offset = (offsetWidth) => {
    progress.current.style.width = `${offsetWidth}px` // 进度条的宽度随着参数变化
    progressBtn.current.style.transform = `translate3d(${offsetWidth}px, 0, 0)`
  }

  // 手指触摸屏幕时触发的函数
  const progressTouchStart = (e) => {
    const startTouch = {};
    startTouch.initiated = true;             //initial为true表示滑动动作开始了
    startTouch.startX = e.touches[0].pageX;  // 滑动开始时横向坐标
    startTouch.left = progress.current.clientWidth; // 当前progress长度
    setTouch(startTouch);
  }

  // 滑动触发的函数
  const progressTouchMove = (e) => {
    if (!touch.initiated) return;
    // 滑动距离
    const deltaX = e.touches[0].pageX - touch.startX;
    const barWidth = progressBar.current.clientWidth; // 进度部分的长度是包含了进度条的长度和按钮的长度，因为按钮本身是16px，按钮在最左边的时候会超出进度条左方向8px，按钮在最右边的时候hi超出进度条右方向8px，所以需要减去16px才能得到纯进度条的长度
    const offsetWidth = Math.min(Math.max(0, touch.left + deltaX), barWidth); // 如果滑动超过了进度条，偏移量就取到进度条的最大值即可
    _offset(offsetWidth); // 根据偏移量修改进度条和按钮的位置
  }

  // 滑动结束触发的函数
  const progressTouchEnd = (e) => {
    const endTouch = JSON.parse(JSON.stringify(touch)); // 简单的深拷贝
    endTouch.initiated = false;
    setTouch(endTouch);

    // 通知父组件
    _changePercent()
  }


  // 进度条的点击事件
  const progressClick = (e) => {
    const rect = progressBar.current.getBoundingClientRect(); // Element.getBoundingClientRect()方法返回元素的大小及其相对于视口的位置。
    const offsetWidth = e.pageX - rect.left; // 计算出偏移量
    console.log(offsetWidth)
    // 如果偏移量没有超过进度条的总长度，就可以继续进行
    if(offsetWidth <= rect.width) {
      _offset(offsetWidth);

      // 通知父组件
      _changePercent()
    }
  };

  return (
    <ProgressBarWrapper>
      <div className="bar-inner" ref={progressBar} onClick={progressClick}>
        <div className="progress" ref={progress}></div> {/* 进度条 */}
        <div className="progress-btn-wrapper"
          ref={progressBtn}
          onTouchStart={progressTouchStart} // touchstart 手指触摸屏幕时触发，即使已经有手指在屏幕上也会触发。
          onTouchMove={progressTouchMove} // touchmove 手指在屏幕滑动时触发。
          onTouchEnd={progressTouchEnd} // touchend 手指从屏幕时移开时触发。
        >
          <div className="progress-btn"></div>
        </div>
      </div>
    </ProgressBarWrapper>
  )
}

export default memo(ProgressBar)
```
我们首先做的第一步就是处理滑动事件的逻辑，`_offset`、`progressTouchStart `、`progressTouchMove `、`progressTouchEnd `帮助我们处理滑动相关的事件

只不过对于用来来讲，还希望存在点击事件，我们实际上直接绑定点击事件即可：`progressClick`是用来处理点击事件的函数

现在可以顺利的滑动进度条，点击进度条，然后我们需要在进度条变化的时候使用父组件传递来的函数，通知父组件进度条怎么变化了，使用`props._changePercent`在进度条滑动完毕或者点击完毕的最后进行调用，如上代码所示。

<img src="https://user-gold-cdn.xitu.io/2019/10/26/16e07f85d22ce04d?imageslim" alt="">