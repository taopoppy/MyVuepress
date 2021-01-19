# CSS-Transition过渡动画

`css`动画是每个高级前端工程师应该学习的内容，我们下面主要学习的就是这些：
+ <font color=#1E90FF>transition过渡动画</font>
+ <font color=#1E90FF>transfore变换动画</font>
+ <font color=#1E90FF>关键帧动画keyframes</font>
+ <font color=#1E90FF>Animation动画</font>

## 什么是过渡动画
<font color=#9400D3>通常，当一个元素的样式属性值发生变化时，我们会立即看到页面元素发生变化，也就是页面元素从旧的属性值立即变成新的属性值的效果。css属性transition能让页面元素不是立即的、而是慢慢的从一种状态变成另外一种状态，从而表现出一种动画过程。</font>

## transition属性语法介绍
<font color=#1E90FF>**① transition-property**</font>

元素的哪一个属性将用过渡表现。例如, `opacity`,`color`。默认值是`all`。

<font color=#1E90FF>**② transition-duration**</font>

元素过渡过程持续时间。例如，1s。默认值是0s。

<font color=#1E90FF>**③ transition-timing-function**</font>

元素过渡时的速率函数。例如, `linear`、 `ease-in`、`steps`动画分段函数或自定义的 `cubic-bezier`函数。默认值是`ease`，中间快，两头慢。

<font color=#1E90FF>**④ transition-delay**</font>

元素过渡延迟的时间。例如，1s。默认值是0s

<font color=#1E90FF>transition-property、transition-duration、transition-delay这三个transition属性中的每个属性都支持多个参数值，参数值之间用逗号分隔，这样能够用一个样式规则制定多种CSS属性的变化。需要注意的是，每个transition属性中的多个参数值的顺序一定要一致。比如：</font>

```css
div {
  transition-property: opacity, left;
  transition-duration: 2s, 4s;
  transition-delay: 1s, 0s;
}
```
意思就是`opacity`属性的动画延迟是1s，过渡时间是2s，`left`属性的动画延迟是0s，过渡时间是4s


### 1. transition-property
+ <font color=#1E90FF>允许值</font>：`none` | `all` | <属性名>
+ <font color=#1E90FF>初始值</font>：`all`

描述: <font color=#1E90FF>指明什么属性将触发过渡动画效果。none值表示没有变化。all值表示所有可以动画演示的属性都可以触发动画效果。否则，只有指定的属性值方式变化才能触发动画效果。</font>

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<style>
		* { padding: 0;margin: 0;box-sizing: border-box;}
		.t-demo pre {
			position: relative;
			left: 0;
			width: 100px;
			height: 100px;
			margin: 20px 0;
      border-radius: 50%;
			font-size: 18px;
			text-align: center;
			line-height: 100px;
			background: #82B600;
			color:#fff;
		}
		.t-demo pre:nth-child(1) {
			transition-duration: 2s;
			transition-property: none;
		}
		.t-demo pre:nth-child(2) {
			transition-duration: 2s;
			transition-property: all;
		}
		.t-demo pre:nth-child(3) {
			transition-duration: 2s;
			transition-property: left;
		}
		.t-demo pre:nth-child(4) {
			transition-duration: 2s;
			transition-property: left, color;
			line-height: 30px;padding: 20px 0;
		}
		.t-demo:hover pre{
			left: 500px;
			color: red;
		}
	</style>
</head>
<body>
	<div class="t-demo">
		<pre>none</pre>
		<pre>all</pre>
		<pre>left</pre>
		<pre>left,<br>color</pre>
	</div>
</body>
</html>
```

可以看到：<font color=#DD1144>过渡动画的原始属性的值和过渡属性全部是写在初始的样式当中，所以样式变化后会按照规定的过渡规则进行过渡</font>

<img src="https://user-gold-cdn.xitu.io/2019/12/15/16f05e8db31090f2?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" alt="">

+ 第一个`pre`没有过渡动画，所以瞬间，位置和颜色都变化了
+ 第二个`pre`是所有属性都有过渡效果，所以在2秒内，位置和颜色是过渡的变化
+ 第三个`pre`是只有位置有过渡效果，所以颜色在一瞬间就变色了，但是位置是过渡了2秒


### 2. transition-duration
+ <font color=#1E90FF>允许值</font>：时间
+ <font color=#1E90FF>初始值</font>：0s

描述：指明元素过渡持续的时间长度。
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<style>
		* { padding: 0;margin: 0;box-sizing: border-box;}
		.t-demo pre {
			position: relative;
			left: 0;
			width: 100px;
			height: 100px;
			margin: 20px 0;
      border-radius: 50%;
			font-size: 18px;
			text-align: center;
			line-height: 100px;
			background: #82B600;
			color:#fff;
		}
		.t-demo pre:nth-child(1) {
			transition-duration: 0s;
		}
		.t-demo pre:nth-child(2) {
			transition-duration: 1s;
		}
		.t-demo pre:nth-child(3) {
			transition-duration: 2s;
		}
		.t-demo pre:nth-child(4) {
			transition-duration: 3s;
		}
		.t-demo:hover pre{
			left: 500px;
			color: red;
		}
	</style>
</head>
<body>
	<div class="t-demo">
		<pre>0s</pre>
		<pre>1s</pre>
		<pre>2s</pre>
		<pre>3s</pre>
	</div>
</body>
</html>
```

<img src="https://user-gold-cdn.xitu.io/2019/12/15/16f05f5ed42aadea?imageslim" alt="">

### 3. transition-timing-function
+ <font color=#1E90FF>允许值</font>：`ease` | `linear` | `ease-in` | `ease-out` | `ease-in-out` | `cubic-bezier(x1, y1, x2, y2)` | `step-start` | `step-end` | `[, [ start | end ] ]`?
+ <font color=#1E90FF>初始值</font>：`ease`

描述：<font color=#1E90FF>transition-timing-function属性描述了动画随着时间运动的速度-时间函数。可以使用几种常见的元素过渡时的速率函数，也可以使用贝塞尔(cubic-bezier)函数加控制点来自定义动画的变换速度方式。</font>

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<style>
		* { padding: 0;margin: 0;box-sizing: border-box;}
		.t-demo pre {
			position: relative;
			left: 0;
			width: 100px;
			height: 100px;
			margin: 20px 0;
      border-radius: 50%;
			font-size: 18px;
			text-align: center;
			line-height: 100px;
			background: #82B600;
			color:#fff;
		}
		.t-demo pre:nth-child(1) {
			transition-duration: 2s;
			transition-timing-function: ease;
		}
		.t-demo pre:nth-child(2) {
			transition-duration: 2s;
			transition-timing-function: linear;
		}
		.t-demo pre:nth-child(3) {
			transition-duration: 2s;
			transition-timing-function: ease-out;
		}
		.t-demo pre:nth-child(4) {
			transition-duration: 2s;
			transition-timing-function: cubic-bezier(0.8, 0,0,0.8);
		}
		.t-demo pre:nth-child(5) {
			transition-duration: 2s;
			transition-timing-function: steps(3, start);
		}
		.t-demo:hover pre{
			left: 500px;
			color: red;
		}
	</style>
</head>
<body>
	<div class="t-demo">
		<pre>ease</pre>
    <pre>linear</pre>
    <pre>ease-out</pre>
    <pre>cubic-bezier</pre>
    <pre>steps(3,start)</pre>
	</div>
</body>
</html>
```

<img src="https://user-gold-cdn.xitu.io/2019/12/15/16f060cfcc016c5b?imageslim" alt="">

关于时间函数每个都有不同的含义，你需要去[MDN](https://developer.mozilla.org/zh-CN/)查看，包含自定义的动画函数你也需要自己去研究

### 4. transition-delay
+ <font color=#1E90FF>允许值</font>: <时间>
+ <font color=#1E90FF>初始值</font>: 0

描述: <font color=#1E90FF>元素过渡动画开始延迟的时间</font>。


## transition的注意事项
### 1. 简写形式
+ <font color=#1E90FF>transition = property duration timing-function delay</font>

其中如果是默认值的话，可以不写，下面是一个例子：
```javascript
div {
    /*
        transition-property:left;
        transition-duration: 2s;
        transition-timing-function: ease;
        transition-delay: 1s;
     */
    transition: left 2s ease 1s;

    /*
        transition-property:left;
        transition-timing-function: ease;
        transition-duration: 2s;
     */
    transition: color 2s;

     /*
        transition-property:all;
        transition-duration: 2s;
        transition-timing-function: ease;
        transition-delay: 0s;
     */
     transition: 2s;
}
```

### 2. 明确状态
<font color=#9400D3>transition需要明确知道，开始状态和结束状态的具体数值，才能计算出中间状态</font>。

比如，`height`从0px变化到100px，`transition`可以算出中间状态。但是，`transition`没法算出0px到auto的中间状态，也就是说，如果开始或结束的设置是height: auto，那么就不会产生动画效果。

类似的情况还有，`display`: `none`到`block`，`background`: `url(foo.jpg)`到`url(bar.jpg)`等等。


**参考资料**
+ [CSS3Transition过渡动画用法介绍](https://juejin.cn/post/6844904020729921543)
+ [CSS3animation动画用法介绍](https://juejin.cn/post/6844904034126528520)