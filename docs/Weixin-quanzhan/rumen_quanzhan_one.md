# 小程序基础组件

## Icon
小程序原生的`Icon`组件只支持不到10个类型，而阿里巴巴图标库中有很多免费可以试用的`Icon`组件，可以拿到小程序当中使用，<font color=#1E90FF>使用Icon组件比使用图片组件的好处有很多，首先图片组件不方便布局，大小不能随意伸缩，而且图片属于资源文件，需要存储</font>

### 1. 自定义图标的原理
下面我们来看看如何实现自定义图标，并了解图标的其他自定义方案

原生小程序当中的`Icon`的颜色设置需要我们注意：<font color=#DD1144>给Icon设置颜色实际上给像素点设置颜色，并不包括中间镂空的部分</font>，这个理解起来很简单，就是说`Icon`中间的图像部分实际上是没有像素点的，所以这个镂空的部分的颜色实际上是和背景色是一个颜色

<font color=#1E90FF>**① 图标能否和文本同行放在段落当中**</font>

答案是可以的，图标作为独立的组件存在，就是方便和文本放在一起布局

<font color=#1E90FF>**② 实现Icon图标的方案有哪些，原理是什么**</font>

在`Html`当中是没有`icon`标签的，小程序基于浏览器引擎渲染，那么它的`icon`是怎么实现的？现阶段有这么5种方案：

+ <font color=#9400D3>使用图片</font>
+ <font color=#9400D3>使用精灵图</font>
+ <font color=#9400D3>使用CSS样式</font>
+ <font color=#9400D3>使用SVG</font>
+ <font color=#9400D3>使用矢量字体</font>

使用图片有比较大的缺点，比如图标很多会造成大量的`HTTP`请求，不方便修改颜色，图标放大会变虚等缺点。使用精灵图和`CSS`样式，都不算一个好的解决方案，

使用`svg`技术一般是在使用矢量字体出现兼容性问题实在无法解决的情况下才使用的，可以在`iconfont`图标网站上直接下载`SVG`文件，然后找一个`image2base64`的[工具](www.sojson.com/image2base64.html)，将文件内容转换成为`base64`的字符串，然后在小程序当中使用这个`base64`的字符串作为图片源
```css
.svg-icon {
  display: block;
  width: 200px;
  height: 200px;
  background-repeat: no-repeat;
  background: url("data:image/svg+xml;base64,PHZ...Zz4=");
}
```
然后在小程序当中使用:
```html
<icon class="svg-icon"/>
```
但是这种方式好像在大小的时候一开始下载的时候就要确定，否则无法通过`.svg-icon`这种`css`样式中整体修改大小的。

我们下面重点说一下使用矢量字体，这个是最简单也是我们在小程序中经常使用的一种方案：

<font color=#1E90FF>浏览器去渲染一个汉字或者英文字符的时候，首先看font-family样式，确定使用的字体名，由字体名确定使用电脑里哪一个字体文件渲染，接着以汉字的Unicode在字体文件里查找对应的字符信息，每个Unicode编码在字体文件中都有一个唯一对应的字符描述信息</font>

<font color=#1E90FF>字体类型有两类，点阵字体和矢量字体，矢量字体又分为三类：Type1、TrueType、OpenType。在矢量字体文件中，每一个Unicode仅是编码的索引，每个字符描述信息是一个几何矢量绘图描述信息。因为是绘制出来的，所以可以实时填充任何颜色。所以我们可以定义任何一个矢量图形和一个Unicode对应，只要使用的是这个字体，这个文件渲染出来的就是我们提交的矢量图形效果</font>

```css
@font-face {
  font-family: 'iconfont';
  src url('//at.alicdn.com/t/font_1716930_3m30jvz589y.eot');
  src url('//at.alicdn.com/t/font_1716930_3m30jvz589y.eot?#iefix')
    format('embedded-opentype'),
  url('//at.alicdn.com/t/font_1716930_3m30jvz589y.woff2') format('woff2'),
  url('//at.alicdn.com/t/font_1716930_3m30jvz589y.woff') format('woff'),
  url('//at.alicdn.com/t/font_1716930_3m30jvz589y.ttf') format('truetype'),
  url('//at.alicdn.com/t/font_1716930_3m30jvz589y.svg#iconfont') format('svg');
}
.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.icon-sun:before {
  content: "\e603";
  color: red;
  font-size: 20px;
}
```
上面的代码中，`@font-face`是一个`css`模块，可以将我们定义的`web`字体嵌入到应用当中，然后`font-family`指定了字体名，当然字体名是我们可以自定义的，申明了类样式，在整个类中指定使用新声明的`iconfont`这个字体。`.icon-sun`是我们借助伪元素`before`实现的图标样式，应用这个样式，代表使用自定义字体文件里的`Unicode`为`e603`的字符信息进行渲染，而`e603`对应的字符是我们在`iconfont`网站上自定义设置的。

另外在`@font-face`当中链接了好多字体文件源，为了兼容不同的浏览器宿主环境，在小程序当中，建议使用`ttf`和`woff`格式。接着我们在小程序当中使用的时候就是下面的代码：
```html
<icon class="iconfont icon-sun" />
```

<font color=#1E90FF>**③ 真机有时icon显示空白是什么原因**</font>

有人认为这个是因为安全域名导致的，就是说字体文件中的`URL`没有位于安全域名内，访问被拒绝，<font color=#1E90FF>其实不是的，因为WXSS内加载图片和字体文件资源是允许使用外域的地址的，可能是因为兼容性导致的，建议使用ttf和woff格式的字体</font>，如果不行就使用`SVG`的方法。

### 2. 自定义图标的实现
首先到`iconfont`阿里图标官网上去搜索几个图标，然后在将每个图标加入购物车，然后在购物车中选择添加到项目，随便哪个项目都行，接着就跳转到这个项目中，接着我们点击<font color=#DD1144>查看在线链接</font>，如下图：

<img :src="$withBase('/weixinxiaochengxu_font_one.png')" alt="字体">

然后就会帮助我们自动生成一段关于`@font-face`的代码,另外在每个图标下面也有属于该字体的`Unicode`码，这个码在小程序中定义字体的时候，用来区别每个不同的图标。

<img :src="$withBase('/weixinxiaochengxu_font_two.png')" alt="face_font">

如果你要在整个当中定义所有的图标，可以在`app.wxss`当中添加下面代码：
```css
@font-face {
  font-family: 'taopoppy';  /* 给字体定义名称taopoppy */
  src: url('//at.alicdn.com/t/font_1085003_jp62blmupcc.eot');
  src: url('//at.alicdn.com/t/font_1085003_jp62blmupcc.eot?#iefix') format('embedded-opentype'),
  url('//at.alicdn.com/t/font_1085003_jp62blmupcc.woff2') format('woff2'),
  url('//at.alicdn.com/t/font_1085003_jp62blmupcc.woff') format('woff'),
  url('//at.alicdn.com/t/font_1085003_jp62blmupcc.ttf') format('truetype'),
  url('//at.alicdn.com/t/font_1085003_jp62blmupcc.svg#iconfont') format('svg');
}

.iconfont {
  font-family: 'taopoppy'; /*这里的font-family的值和上面的@font-face中的font-family的值保持一致*/
  color:red; /*默认的图标颜色*/
  font-size: 40px; /*默认的图标大小*/
}

.icon-taiyang::before {
  content: '\e635'; /* Uncode之前已经说过在哪里找*/
}

.icon-cloth::before {
  content: '\e631';
}
```
有了上面的字体和不同图标的样式定义，我们在任何`.wxml`当中使用这些图标，并且依旧可以定义颜色，大小等属性覆盖在`app.wxss`当中定义的默认样式。
```html
<icon class="iconfont icon-taiyang" style="color:green;font-size:80px"></icon>
<icon class="iconfont icon-cloth"></icon>
```
