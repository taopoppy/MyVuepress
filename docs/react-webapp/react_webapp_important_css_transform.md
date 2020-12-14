# CSS-tansform变形动画

## 什么是变形
自层叠样式表诞生以来，元素始终是矩形的，而且只能沿着横轴和纵轴放置。有些技巧能让元素看起来是倾斜的，但是底层的坐标方格并没有变形。`CSS`变形功能改变了这一现状，能以不同的方式改变对象的形态，而且还不只限于二维。
### 1. 功能
<font color=#1E90FF>css变形功能包括</font>:
+ <font color=#9400D3>移动（translate）</font>
+ <font color=#9400D3>缩放（scale）</font>
+ <font color=#9400D3>旋转（rotate）</font>
+ <font color=#9400D3>倾斜（skew）</font>

<img src="https://user-gold-cdn.xitu.io/2019/6/24/16b866e737f0433e?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" alt="">

### 2. 坐标轴
变形离不来一个东西，叫做<font color=#DD1144>坐标系</font>

<img src="https://user-gold-cdn.xitu.io/2019/6/24/16b8640f0bea8dc6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" alt="">

<font color=#1E90FF>x轴的正值在右侧，负值在左侧。y轴的正值沿纵轴向下，负值沿纵轴向上。z轴的正值在靠近人的一侧，负值在远离人的一侧</font>

回想一下定位元素的`top`属性：值为正数时元素下移，值为负数时元素上移，如果想把元素向左下方移动，要把`x`值设为负数，把`y`值设为正数：
```javascript
	transform: translateX(-5em) translateY(50px);
```

### 3. 参照物
<font color=#DD1144>每个元素都有自己的参照物，各轴都相对自身而动。如果旋转了元素，轴也随之旋转。旋转之后再变形，是相对旋转后的轴计算的，而不是显示器的轴。</font>

<img src="https://user-gold-cdn.xitu.io/2019/6/24/16b86913200777a7?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" alt="">


### 4. 注意事项
我们先来看看关于变形的注意事项：
+ 范围框：元素边框的外边界。也就是说，计算范围框时，轮廓和外边距不算在内。

+ 变形的元素有自己的堆叠上下文。经过缩放的元素可能比变形前小或大，不过<font color=#1E90FF>元素在页面上所占的空间与变形前保持不变。对所有变形函数都成立</font>。

+ `<transform-list>` | `none` 表示一个或多个变形函数，中间以空格分隔。如：`transform: rotate(30deg) skewX(-25deg) scaleY(2)`;

+ 变形函数一次只处理一个，从最左边第一个开始，一直到最后一个。<font color=#1E90FF>从头到尾的处理顺序很重要。顺序变了，得到的结果就有可能会不同</font>。

+ 有多个变形函数时，每个都要设置正确，要确保全部有效。如果有一个函数是无效的，整个值都将失效。

变形通常不叠加。如果改变了元素的形态，而后再想添加一种变形，那么要在原变形基础上修改。就像你在一个地方声明了字号，又在另一个地方为元素声明了不同的字号一样，字号是不叠加的。只有其中一个字号起作用。不过动画变形除外，不管使用过渡还是真正的动画，效果是叠加的。

+ 变形现在还不能应用到基元行内框上。基元行内框指`span`，超链接等行内框。这些元素可以随着块级父元素一起变形，但是不能直接旋转。除非把它们的显示方式改为`display:block`，`display:inline-block`等。

### 5. 本质
变形的本质：<font color=#DD1144>就是一种状态的改变，和颜色，大小，位置是一个道理，元素从一个状态到一个状态的过程，想要看到动画的效果，也必须依赖过渡和动画才能看到变换的过程。</font>

<img :src="$withBase('/react_webapp_css_transform.png')" alt="">

<font color=#1E90FF>即使不显式使用过渡或动画，也能通过用户交互伪类（如:hover）实现叠加变形。这是因为悬停等效果就是一种过渡，只不过不是由过渡属性触发的。因此可以向上面这样声明变形属性进行效果叠加。</font>

我们这里实现一个简单的例子，希望你可以将<font color=#9400D3>过渡动画transition</font>和<font color=#9400D3>transform变形动画</font>联系起来：

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<style>
		* { padding: 0;margin: 0;box-sizing: border-box;}
		.t-demo {
			background-color: purple;
			width: 100px;
			height: 100px;
			transition: 1s ease;
			transform: rotate(45deg);
		}
		.t-demo:hover {
			transform: translateX(200px) rotate(165deg);
		}
		.ts {
			transform: translateX(200px) rotate(165deg);
		}
	</style>
</head>
<body>
	<div id="t-demo" class="t-demo"></div>
	<button id="button">click</button>
	<script>
		const button = document.getElementById("button")
		const demo = document.getElementById("t-demo")
		button.onclick = function() {
			demo.classList.add("ts")
		}
	</script>
</body>
</html>
```

在上面这个例子当中，点击`button`按钮会，方块会从原始的状态`transform: rotate(45deg)`变化到最终的状态`translateX(200px) rotate(165deg)`，动画的过程是由过渡属性`transition: 1s ease;`来操纵的。当然鼠标移动到上面也有同样的效果，原因我们之前就说了：悬停等效果就是一种过渡。

变形其实只有一个属性，但是有几个辅助属性用于控制如何变形，这些属性称为：<font color=#DD1144>变形函数</font>，变形函数当前一共有21个：
+ translate()
+ translate3d()
+ translateX()
+ translateY()
+ translateZ()
+ scale()
+ scale3d()
+ scaleX()
+ scaleY()
+ scaleZ()
+ rotate()
+ rotate3d()
+ rotateX()
+ rotateY()
+ rotateZ()
+ skew()
+ skewX()
+ skewY()
+ matrix()
+ matrix3d()
+ perspective()


## 移动原点transform-origin
<font color=#1E90FF>目前所见的变形有个共同点，都以元素的绝对中心为变形的原点。例如，旋转元素时，是绕着中心旋转的，而不是绕着某一角度旋转的。这是默认行为，不过可以使用transform-origin属性修改。</font>

取值语法看似复杂，但是实际使用起来还是不难的。transform-origin初始值为：50%，50%，属性的值为两个或三个关键字，用于定义相对哪个点变形。第一个值针对横向，第二个值针对纵向，可选的第三个值是z轴上的长度。

<font color=#DD1144>横轴和纵轴可以使用英语关键字，百分数，长度。而z轴不能使用英语关键字或百分数。不过可以使用长度值。目前像素值是最常用的。</font>

<img src="https://user-gold-cdn.xitu.io/2019/6/25/16b8d7cc058e63f6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" alt="">

加入我们把一个元素向右旋转45度，通过设置变形原点的位置，那么元素的最终位置取决于变形原点。下图展示了不同的变形原点得到的结果。

<img src="https://user-gold-cdn.xitu.io/2019/6/25/16b8d7f20b6a7bc6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" alt="">

变形原点对其他变形类型也有影响，比如倾斜和缩放。如下图：

<img src="https://user-gold-cdn.xitu.io/2019/6/25/16b8d8073ec5bbaf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" alt="">

<font color=#9400D3>有种变形不怎么受变形原点的影响——平移。使用translate()移动元素，不管元素变形原点在哪，元素最终都被移动到相同的位置。</font>


最后这里附上一个小例子，可以试试看看效果：
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<style>
		* { padding: 0;margin: 0;box-sizing: border-box;}
		.t-demo {
			background-color: purple;
			width: 100px;
			height: 100px;
			transition: 1s ease;
			transform: rotate(45deg);
			transform-origin: center bottom;
		}
		.t-demo:hover {
			transform: rotate(165deg);
		}
		.ts {
			transform: rotate(165deg);
		}
	</style>
</head>
<body>
	<div id="t-demo" class="t-demo"></div>
	<button id="button">click</button>
	<script>
		const button = document.getElementById("button")
		const demo = document.getElementById("t-demo")
		button.onclick = function() {
			demo.classList.add("ts")
		}
	</script>
</body>
</html>
```



## 变形方式transform-style
<font color=#1E90FF>如果在一个三维空间中改变元素的形态，例如使用translate3d()，或许希望在3D空间中呈现元素。然而，这不是默认行为。默认情况下，不管怎么变形，得到的结果都是扁平的。但是可以使用transform-style修改。</font>

## 处理背面backface-visibility
在3D变形中，`backface-visibility`属性可以看到元素的背面。

关于`transform`有很多的东西要讲，但是作为一个不是要天天写`css`的人来说，我认为首先要搞清楚动画的基本概念和一些基本的动画基础，关于复杂的变化函数都可以具体写的时候再来找，查询。轮子，有时候，也可以不用真的造。

**参考资料**
+ [学会使用CSS3transform变形](https://juejin.cn/post/6844903874579578887)