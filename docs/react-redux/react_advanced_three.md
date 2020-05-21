# React的动画效果

## CSS过渡动画
### 1. CSS的简单动画
我们首先来实现一个通过点击按钮实现`div`的显示和隐藏，并且在显示和隐藏切换之间加入渐隐渐现的`css`动画
```javascript
// App.js
import React, {Component,Fragment} from 'react'
import './style.css'

class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			show: true
		}
		this.handleToggle = this.handleToggle.bind(this)
	}
	handleToggle() {
		this.setState({
			show: this.state.show ? false: true
		})
	}

	render() {
		return (
			<Fragment>
				<div className={this.state.show? 'show': 'hide'}>hello</div>
				<button onClick={this.handleToggle}>toggle</button>
			</Fragment>
		)
	}
}

export default App
```
```css
.show {
	opacity: 1; /*透明度变为1*/
	transition: all 1s ease-in; /*变为透明度为1的过程为1秒的动画*/
}

.hide {
	opacity: 0; /*透明度变为0*/
	transition: all 1s ease-in;/*变为透明度为0的过程为1秒的动画*/
}
```
通过上面的代码我们可以实现点击按钮实现`div`的显示和隐藏，都是1s的动画时间。

### 2. CSS的过渡动画
<font color=#1E90FF>css的过渡动画指的是通过@keyframes来定义一些动画效果</font>

```css
.show {
	animation: show-item 2s ease-in forwards; /*使用show item动画，2s执行完毕，过渡平滑使用ease-in forwards表示最后要保存最后一帧的效果*/
}
@keyframes show-item {
	0% { /*动画执行到0%的时候，透明度为0，颜色为蓝色*/
		opacity: 0;
		color: blue;
	}
	50% { /*动画执行到50%的时候，透明度为0.5，颜色为绿色*/
		opacity: 0.5;
		color: green;
	}
	100% { /*动画执行到100%的时候，透明度为1，颜色为红色*/
		opacity: 1;
		color: red;
	}
}

.hide {
	animation: hide-item 2s ease-in forwards;
}
@keyframes hide-item {
	0% {
		opacity: 1;
		color: red;
	}
	50% {
		opacity: 0.5;
		color: green;
	}
	100% {
		opacity: 0;
		color: blue;
	}
}
```
上面这种`CSS`过渡动画也是一种比较简单的效果，要想实现复杂的效果我们需要借助`javascript`，后面我们来借助`react-transition-group`这个动画库来实现以下复杂的动画

## react-transition-group
### 1. 动画库的使用
我们首先到`github`上看一下这个动画库的说明，地址为[https://reactcommunity.org/react-transition-group/](https://reactcommunity.org/react-transition-group/)

上面首先是安装这个库的命令：
```bash
# npm
npm install react-transition-group --save

# yarn
yarn add react-transition-group
```
安装好这个库之后，这个库提供了四个内容：`Transition`、`CSSTransition`、`SwitchTransition`、`TransitionGroup`,我们重点来看<font color=#DD1144>CSSTransition</font>

之前我们实现动画是通过给`react`中的`show`这个`state`修改值来动态的给`div`添加`show`或者`hide`这些`class`，现在有了`CSSTransition`我们可以通过在需要动画的标签外层添加一个`CSSTransition`这个标签来自动实现：
```javascript
// App.js
import React, {Component,Fragment} from 'react'
import './style.css'
import { CSSTransition } from 'react-transition-group'; // 引入动画库


class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			show: true
		}
		this.handleToggle = this.handleToggle.bind(this)
	}
	handleToggle() {
		this.setState({
			show: this.state.show ? false: true
		})
	}

	render() {
		return (
			<Fragment>
				<CSSTransition
					in={this.state.show} // 动画的状态
					timeout={1000}       // 动画的执行时间
					classNames="fade"    // 动画css的前缀，默认是fade
					unmountOnExit        // 隐藏的时候还可以消除DOM
					appear={true}        // 页面第一次显示的时候也要动画效果
					onEntered={(el)=> {el.style.color = "red"}} // 动画钩子
				>
					<div>hello</div>
				</CSSTransition>
				<button onClick={this.handleToggle}>toggle</button>
			</Fragment>
		)
	}
```
我们简单的说一下给`CSSTransition`整个动画标签上添加的属性：
+ <font color=#9400D3>in</font>：通过传入`true`或者`false`来定义当前执行出场动画还是入场动画
+ <font color=#9400D3>timeout</font>：动画的执行时间
+ <font color=#9400D3>classNames</font>：动画css的前缀，默认是fade，假如定义成为`"test"`，那么`css`中`className`也都必须以`test`为前缀，如`test-enter`、`test-enter-active`等
+ <font color=#9400D3>unmountOnExit</font>:出场动画结束后同时消除DOM
+ <font color=#9400D3>appear</font>：第一次进入页面，或者页面刷新的时候也要执行一次出场动画，此时`CSSTransition`标签给执行入场动画的标签添加的`className`就不是`fade-enter`等，而是`fade-appear`、`fade-appear-active`、`fade-appear-done`
+ <font color=#9400D3>onEntered</font>: 动画钩子，还有其他的动画钩子，onEntered表示在入场动画结束后可以执行的函数，el参数表示被`CSSTransition`包裹的DOM标签
### 2. 动画库的原理
然后我们说一下这个动画库的原理：<font color=#DD1144>在需要动画效果的标签外层包裹CSSTransition这个标签后，在动画出场和入场的的过程，动画库会自动给被包裹的标签添加一些css的class</font>：
+ <font color=#9400D3>入场动画</font>：
	+ <font color=#1E90FF>入场动画开始前一帧:.fade-enter</font>
	+ <font color=#1E90FF>入场动画整个过程：.fade-enter-active</font>
	+ <font color=#1E90FF>入场动画完毕的后一帧：.fade-enter-done</font>
+ <font color=#9400D3>出场动画</font>：
	+ <font color=#1E90FF>出场动画开始前一帧:.fade-exit</font>
	+ <font color=#1E90FF>出场动画整个过程：.fade-exit-active</font>
	+ <font color=#1E90FF>出场动画完毕的后一帧：.fade-exit-done</font>
+ <font color=#9400D3>第一次入场动画</font>：
	+ <font color=#1E90FF>入场动画开始前一帧:.fade-appear</font>
	+ <font color=#1E90FF>入场动画整个过程：.fade-appear-active</font>
	+ <font color=#1E90FF>入场动画完毕的后一帧：.fade-appear-done</font>

所以这些`css`的`class`我们需要自己去定义：
```css
/*style.css*/
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

### 3. 多元素动画
多个元素，尤其是列表动画，我们都可以使用另一个包裹标签：<font color=#DD1144>TransitionGroup</font>
```javascript
import React, {Component,Fragment} from 'react'
import './style.css'
import { CSSTransition,TransitionGroup } from 'react-transition-group'; // CSSTransition和TransitionGroup同时引入


class App extends Component {
	render() {
		return (
			<Fragment>
				<TransitionGroup> {/*多个元素外部要包裹TransitionGroup*/}
					{
						this.state.list.map((item,index)=> {
							return (
								{/*每单个元素外部要包裹CSSTransition*/}
								<CSSTransition key={index} timeout={1000} unmountOnExit appear={true}>
									<div>{item}</div>
								</CSSTransition>
							)
						})
					}
				</TransitionGroup>
				<button onClick={this.handleToggle}>toggle</button>
			</Fragment>
		)
	}
}

export default App
```
按照上面的写法我们就能实现多个元素都使用动画效果了。

到这里为止，我们并不会停止`react`的学习，因为无论你前面学习的多么好，理解的多么透彻，这些东西都只是冰山一角，我们希望通过阅读`react`官网来扩展视角，并且系统的了解`react`的方方面面，这样才会走后面进阶的路上走的更顺。