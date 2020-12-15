# CSS-animation高级动画

## animation&&transition

`animation`和`transition`比较，两者有什么区别呢？

+ <font color=#DD1144>transition只能定义开始状态和结束状态，不能定义中间状态，也就是说只有两个状态。而动画可以是多个状态 间的变化。</font>
+ <font color=#DD1144>动画还有一点不同，它可以自动开始。过渡一般需要通过添加样式类或更改状态（如悬停）来触发，但动画可以在页面加载时自动启动。</font>
+ <font color=#DD1144>animation更加复杂一些，它允许你按照实际需求添加很多的keyframes来创建动画。它可以自动触发，并且可以循环。</font>

关于`animation`有很多基本的属性语法：
+ <font color=#1E90FF>animation-name</font>：需要`keyfranmes`的名字来描述动画
+ <font color=#1E90FF>animation-duration</font>：元素动画过程持续时间。例如，1s。
+ <font color=#1E90FF>animation-timing-function</font>：元素动画时的速率函数。例如, `linear`、 `ease-in`、`steps`动画分段函数或自定义的`cubic-bezier`函数。
+ <font color=#1E90FF>animation-delay</font>：元素动画延迟的时间。例如，300ms。
+ <font color=#1E90FF>animation-direction</font>：设置动画播放方向。`normal`,`reverse`,`alternate`,`alternate-reverse`
+ <font color=#1E90FF>animation-iteration-count</font>：这是动画播放的次数。默认情况下，它将播放一次。也可以指定一个数字，或指定`infinite`以使其永久循环。
+ <font color=#1E90FF>animation-fill-mode</font>：默认情况下，动画播放完成元素返回其正常状态。使用`animation-fill-mode`，我们可以定义元素在动画结束或开始前的状态。
+ <font color=#1E90FF>animation-play-state</font>：暂停或恢复动画。值为`running`或`paused`，默认为`running`。可以使用`JavaScript`设置此值，控制动画播放状态。


上述这些属性我们会在下面一一介绍

## keyframes
+ <font color=#1E90FF>给元素添加animation和添加transition类似。不过它还需要keyframes。并且animation拥有一些transition没有的属性。</font>

+ <font color=#1E90FF>transition需要指定一个目标属性，例如background或all，animation则需要带keyframes的名字来描述动画。</font>


所以，我们总结一句话：<font color=#9400D3>keyframes是用来描述动画过程中一系列变化的。</font>

我们来举个例子，将百分比按照keyframes的规则去写并命名，结果如下：
```css
@keyframes change-background {
  0% {
    background: blue;
  }
  50% {
    background: green;
  }

  100% {
    background: orange;
  }
}
```
这个动画名字叫`change-background`，我们定义开始、中间和结束时的颜色，在这些状态之间变化时，浏览器会自动去计算颜色值的插值。如下图：

<img src="https://user-gold-cdn.xitu.io/2019/12/29/16f51b0eb0980f1b?imageslim" alt="">

下面是一个简写方式，只有两个状态，初始状态和终止状态，与0% 和100%的写法是等价的。
```css
@keyframes name {
  from {
    ...
  }
  to {
    ...
  }
}
```

## animation-name
`animation-name`指的是动画使用的`keyframes`的名字。
```css
div {
  animation: foo 3s linear 1s;
}
@keyframes foo {
  ...
}
```

## animation-duration
完成一个动画所需的时间。类似于`transition-duration` ，以秒或毫秒计，如1s 、200ms。

## animation-timing-function
这个属性与`transition`过渡中定时函数属性的值用法基本相同，但效果上会略有不同。<font color=#DD1144>在transition里时间函数（例如ease-out）是作用于整个transition，但animation里是作用于关键帧之间：</font>

所以，<font color=#9400D3>timing-function是用在每一个的keyframe，并不是整个的 keyframes</font>。通常在创建关键帧动画时，选择`linear`会比较好一些，用使用 `keyframes`控制动画的节奏。我们可以将动画的计时功能定义为`linear`，然后在每个关键帧的上控制速度，比较更细粒度的来控制动画

```css
@keyframes my-animation {
  0%{
  ...
    animation-timing-function: linear;
  }
  50%{
  ...
    animation-timing-function: ease-out;
  }
}
```
<img src="https://user-gold-cdn.xitu.io/2019/12/29/16f511bb9b3bcbb4?imageslim" alt="">

## animation-delay
+ `animation-delay`与`transition-delay`类似，此属性表示在开始之前动画的等待时间。如果定义的动画是不断循环的，只有第一次循环前会有等待时间。

+ `animation-delay`可以给这个属性一个负值，比如-3s。动画会直接从第3s开始执行，仿佛已经运行过了3s一样。

## animation-direction
动画通常从0% 开始，到100%结束。`animation-direction`使用`normal`，`reverse`，`alternate`和`alternate-reverse`来控制动画变化的方向。

`animation-direction`四个值的介绍：

+ <font color=#1E90FF>normal</font>：按顺序播放，也是默认值。是指从0%开始，到100%结束。
+ <font color=#1E90FF>reverse</font>：按反方向播放，是指从100%播放（或循环）到 0%
+ <font color=#1E90FF>alternate</font>：动画轮流反复播放，即从 0% 播放到 100% 然后再播放到 0%。
+ <font color=#1E90FF>alternate-reverse</font>：指动画轮流反方向反复播放，即从 100%播放到0%然后再播放到100%。

## animation-iteration-count
动画播放的次数。默认情况下，它将播放一次。也可以指定一个数字，或指定`infinite`以使其永久循环。

## animation-fill-mode
`animation-fill-mode`使用`none`,`forwards`，`backwards`和`both`定义元素在动画结束或开始前的状态。`animation-fill-mode`四个值的介绍：
+ <font color=#1E90FF>none</font>：动画播放完成元素返回其正常状态，也是默认值。
+ <font color=#1E90FF>forwards</font>：表示当动画完成后，元素状态保持最后一个关键帧的值。
+ <font color=#1E90FF>backwards</font>：有动画延迟时，动画开始前，元素状态保持为第一帧的状态。
+ <font color=#1E90FF>both</font>：表示`forwards`和`forwards`效果都有。

## animation-play-state
如果需要暂停或恢复动画，则可以使用此属性执行操作。值为`running`或`paused`，默认为`running`。可以使用`JavaScript`设置此值，控制动画播放状态。
```css
div:hover {
  animation-play-state: paused;
}
```

## animation的简写和本质
+ 如果提供多组属性值，以逗号进行分隔。
+ 如果只提供一个`time`参数，则为`animation-duration`的值定义。
+ 如果提供二个`time`参数，则第一个为`animation-duration`的值定义，第二个为`animation-delay`的值定义。
```css
div {
  animation-name: foo;
  animation-duration: 3s;
  animation-timing-function: linear;
  animation-delay: 1s;
  animation-iteration-count: infinite;
  animation-direction: reverse;
  animation-fill-mode: forwards;
  animation-play-state: pause;
}

div {
  animation: foo 3s liner 1s infinite reverse forwards pause;
}
```

`animation`动画的本质就是：<font color=#DD1144>自发的运动状态，可以写在初始状态当中，也可以写在状态改变之后</font>

## 实例
### 1. shaking button
第一个实例是摇晃的实例：
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<style>
		.button {
			width: 100px;
			height: 100px;
			font-size: 20px;
			padding: 10px 20px;
			background: #3C3C3C;
			color: #fff;
			display: flex;
			justify-content: center;
			align-items: center;
			border-top: 3px solid orange;
			border-radius: 0 0 5px 5px;
			animation: wiggle 1s;
		}
		@keyframes wiggle{
			0%,7%{transform: rotateZ(0);}
			15%{transform: rotateZ(-15deg);}
			20%{transform: rotateZ(10deg);}
			25%{transform: rotateZ(-10deg);}
			30%{transform: rotateZ(6deg);}
			35%{transform: rotateZ(-4deg);}
			40%,100%{transform: rotateZ(0);}
		}
	</style>
</head>
<body>
	<div class="button">保存</div>
</body>
</html>
```
<img src="https://user-gold-cdn.xitu.io/2019/12/29/16f51a6627d58b3e?imageslim" alt="">

### 2. loading animate
第二个实例是加载动画；
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<style>
		.load {
			display: inline-block;
			width: 50px;
			height: 50px;
			background: orange;
			border-radius: 50%;
			margin: 0 20px;
			animation: loading 1s linear infinite;
		}
		.two {animation-delay: 0.2s;}
		.three {animation-delay: 0.4s;}
		@keyframes loading{
			0%{
				transform: scale(1);
				opacity: 0.5;
			}
			50%{
				transform: scale(1.5);
				opacity: 1;
			}
			100%{
				transform: scale(1);
				opacity: 0.5;
			}
		}
	</style>
</head>
<body>
	<div class="load"></div>
	<div class="load two"></div>
	<div class="load three"></div>
</body>
</html>
```

<img src="https://user-gold-cdn.xitu.io/2019/12/29/16f5209173d727eb?imageslim" alt="">