# React动画实践

## react-transition-group
我们知道在`React`当中经常使用`react-transition-group`这个库来做动画，但是这个库需要我们自己去写动画的效果，而我们希望使用`animate.css`这个动画库中的某些效果，两者在工程上并没有直接的兼容的方法，我下面就介绍一种自己使用的方式：

我们首先使用`react-transition-group`这个库是这样使用的：
```javascript
import { CSSTransition } from 'react-transition-group' // 引入react-transition-group

function Album(props) {
	return(
		<CSSTransition
          in={showStatus}  // 动画的状态
          timeout={500}    // 动画的时间
          classNames="fade" // 动画css的前缀，默认是fade
          appear={true}    // 页面第一次也会出现动画
          unmountOnExit    // 隐藏的时候消除DOM
          onExited={props.history.goBack} // 退出的时候执行返回前一个页面
		>
			...
		</CSSTransition>
	)
}
```

然后我们需要通过`fade-`前缀打头的一些列`classNames`当中书写效果，比如这样：
```css
.fade-enter, .fade-appear {
	opacity: 0;
}

.fade-enter-active, .fade-appear-active {
	opacity: 1;
	transition: opacity 1s ease-in;
}

.fade-enter-done,.fade-appear-done {
	opacity: 1;
}

.fade-exit {
	opacity: 1;
}

.fade-exit-active {
	opacity: 0;
	transition: opacity 1s ease-in;
}

.fade-exit-done {
	opacity: 0;
}
```
这种进入和退出的动画都需要我们自己写，显然我不会写，我就到[Animate.css官网](https://animate.style/)上找点好的动画效果，比如说`lightSpeedInLeft`作为入场动画，`lightSpeedOutRight`作为出场动画，我们怎么使用呢？

## animate源码
首先到`github`上找到这两个动画的源码，分别是[lightSpeedInLeft](https://github.com/animate-css/animate.css/blob/main/source/lightspeed/lightSpeedInLeft.css)和[lightSpeedOutRight ](https://github.com/animate-css/animate.css/blob/main/source/lightspeed/lightSpeedOutRight.css)

两者的源码我们在下面列出来：
```css
@keyframes lightSpeedInLeft {
  from {
    transform: translate3d(-100%, 0, 0) skewX(30deg);
    opacity: 0;
  }

  60% {
    transform: skewX(-20deg);
    opacity: 1;
  }

  80% {
    transform: skewX(5deg);
  }

  to {
    transform: translate3d(0, 0, 0);
  }
}

.lightSpeedInLeft {
  animation-name: lightSpeedInLeft;
  animation-timing-function: ease-out;
}
```
```css
@keyframes lightSpeedOutRight {
  from {
    opacity: 1;
  }

  to {
    transform: translate3d(100%, 0, 0) skewX(30deg);
    opacity: 0;
  }
}

.lightSpeedOutRight {
  animation-name: lightSpeedOutRight;
  animation-timing-function: ease-in;
}
```

## 合并
### css module
`Album/index.js`内容如下：
```javascript
import './style.css'
import { CSSTransition } from 'react-transition-group' // 引入react-transition-group

function Album(props) {
	return(
		<CSSTransition
			in={showStatus}  // 动画的状态
			timeout={500}    // 动画的时间
      classNames="fade" // 动画css的前缀，默认是fade
      appear={true}    // 页面第一次也会出现动画
      unmountOnExit    // 隐藏的时候消除DOM
      onExited={props.history.goBack} // 退出的时候执行返回前一个页面
		>
			...
		</CSSTransition>
	)
}
```
`Album/style.css`内容如下：
```css
@keyframes lightSpeedInLeft {
  from {
    transform: translate3d(-100%, 0, 0) skewX(30deg);
    opacity: 0;
  }

  60% {
    transform: skewX(-20deg);
    opacity: 1;
  }

  80% {
    transform: skewX(5deg);
  }

  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes lightSpeedOutRight {
  from {
    opacity: 1;
  }

  to {
    transform: translate3d(100%, 0, 0) skewX(30deg);
    opacity: 0;
  }
}

.fade-enter-active, .fade-appear-active {
	animation-name: lightSpeedInRight;
	animation-timing-function: ease-out;
}

.fade-exit-active {
	animation-name: lightSpeedOutRight;
	animation-timing-function: ease-in;
}
```

### 1. style-components
`Album/index.js`内容如下：
```javascript
import { Container } from './style.js'
import { CSSTransition } from 'react-transition-group'

function Album(props) {
	return(
		<CSSTransition
			in={showStatus}  // 动画的状态
			timeout={500}    // 动画的时间
      classNames="fly" // 动画css的前缀，默认是fade
      appear={true}    // 页面第一次也会出现动画
      unmountOnExit    // 隐藏的时候消除DOM
      onExited={props.history.goBack} // 退出的时候执行返回前一个页面
		>
			<Container>
				...
			</Container>
		</CSSTransition>
	)
}
```
`Album/style.css`内容如下：
```javascript
import styled, { keyframes } from'styled-components';

const lightSpeedInRight = keyframes`
 from {
    transform: translate3d(-100%, 0, 0) skewX(30deg);
    opacity: 0;
  }

  60% {
    transform: skewX(-20deg);
    opacity: 1;
  }

  80% {
    transform: skewX(5deg);
  }

  to {
    transform: translate3d(0, 0, 0);
  }
`

const lightSpeedOutRight = keyframes`
 	from {
    opacity: 1;
  }

  to {
    transform: translate3d(100%, 0, 0) skewX(30deg);
    opacity: 0;
  }
`

export const Container = styled.div`
  &.fly-enter-active, &.fly-appear-active {
		animation-name: ${lightSpeedInRight};
		animation-timing-function: ease-out;
  }
  &.fly-exit-active {
		animation-name: ${lightSpeedOutRight};
		animation-timing-function: ease-in;
  }
`
```

总结一句话，就是：<font color=#DD1144>原封不动从animate.css源码当中抄过来，并且将keyframes的名称写在react-transition-group给我们规定的className当中</font>

## 优化
::: danger
<font color=#DD1144>值得注意的是，使用动画效果最主要的是要流畅，如果在使用动画的过程中出现了闪动和抖动的问题出现，基本上是动画开始和结束的那一帧出了问题，所以我们在上面的代码只写了fly-enter-active, fly-appear-active, fly-exit-active这几个动画过程，还有fade-enter、fade-appear、fade-enter-done、fade-appear-done、fade-exit和fade-exit-done这些关键的开始和结尾帧，需要在这些里面添加对应的css代码</font>
:::

比如说我们前面在`style-components`当中提供的动画实际上就有闪动效果，我们需要根据`animate.css`源码当中的`keyframes`当中的关键的`from`、`to`、`0%`、`100%`找到对应的`css`代码，粘贴到这里来测试一下。

```javascript
export const Container = styled.div`
  &.fly-enter-active, &.fly-appear-active {
		animation-name: ${backInDown};
		animation-timing-function: ease-out;
		animation-duration: 300ms;
  }
  // 经过测试发现在backOutDown出场动画的第一帧添加初始效果会避免闪动效果
  &.fly-exit {
    transform: translateY(700px) scale(1);
    opacity: 0;
  }
  &.fly-exit-active {
		animation-name: ${backOutDown};
		animation-timing-function: ease-in;
		animation-duration: 300ms;
  }
`
```

这种优化不是特定的，不同的动画有不同的效果，也可能有不同的问题，所以我们需要自己进行测试才能找到最优的效果