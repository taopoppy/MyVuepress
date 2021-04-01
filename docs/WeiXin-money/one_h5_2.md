# H5设计和还原

## 响应式设计概述
响应式设计分为<font color=#9400D3>PC端</font>和<font color=#9400D3>H5</font>，其中，PC端的响应式设计关乎到不同大小的浏览器的显示和同一个浏览器在宽度缩放时候的显示两个问题，H5主要是应用在移动设备上，包括微信公众号，原生APP内嵌的WebView，以及移动设备自带的手机浏览器当中显示的网站。<font color=#DD1144>所以这里你可以明白，H5就是使用写网页的方式去书写APP页面的技术或者方案，H5会运用在很多地方，只不过在手机浏览器打开的H5，我们叫它webapp而已。好比教书育人的都是老师，只不过在幼儿园的我们称之为幼师，在大学的老师称之为教授</font>

## 响应式方案
PC端的响应式主要有这么几个方案：
+ <font color=#1E90FF>媒体查询</font>：使用`@media`去书写不同的代码，根据不同的媒体选择不同的执行代码：
  ```css
  @media screen and (max-width:768px) { ... }
  @media screen and (min-width:768px) and (max-width:1280px) { ... }
  @media screen and (min-width:1281px) and (max-width:1600px) { ... }
  @media screen and (min-width:1600px) { ... }
  ```
+ <font color=#1E90FF>Flex自适应布局</font>

H5端的响应式主要要考虑下面这些东西，实际这些东西几乎涵盖了整个页面的所有，也就是说H5的响应式要更全面一些
+ <font color=#1E90FF>字体大小</font>
+ <font color=#1E90FF>元素大小，布局</font>
+ <font color=#1E90FF>元素边距，内填充</font>

H5响应式的方案有很多，但是我们现在最好的方案就是<font color=#9400D3>rem + flex</font>这种相对布局和响应式布局的综合方案。理解`Rem`我们首先要理解下面三个概念：
+ <font color=#1E90FF>viewport</font>
+ <font color=#1E90FF>物理像素和网页像素</font>
+ <font color=#1E90FF>设计尺寸和开发尺寸</font>

<font color=#1E90FF>**① viewport**</font>

中文简称视口，也就是设备屏幕用来展示网页的可视化区域，主要使用的是`meta`标签：
```html
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-acalable=no"/> 
```
上面这个代码的意思就是`viewport`的`width`宽度和屏幕的宽度`device-width`是一样的。网页的初始化放大倍数`initial-scale`是1，也就是原始宽高。`viewport`还有其他的属性设计，我们来看一下：
<img :src="$withBase('/weixin_zhifu_3.png')" alt="">

但是我们现在使用`Rem`的方式，我们就必须将上述这些缩放比全部设置为1。

<font color=#1E90FF>**② 物理像素和网页像素**</font>

<img :src="$withBase('/weixin_zhifu_4.png')" alt="">

对于上面的图，我们不需要知道到底什么是物理像素或者到底什么是独立像素，我们只需要知道<font color=#1E90FF>UI设计是根据真实的手机尺寸设计的，所以他参照的是物理像素，程序员是开发网页的，肯定是参照的是逻辑像素，所以两者之间有某种倍数的关系，比如在phone6上面就是两倍的关系，在iphone8上面就是3倍的关系，简而言之，如果UI设计一个button为90px（物理像素），那么我们使用iphone6去实现就应该使用45px（逻辑像素）去定义这个button的宽度</font>

可是这种倍数关系怎么在我们写程序的时候知道呢? <font color=#1E90FF>在微信小程序当中有了很好的解决方案，就是rpx</font>，下面我们看看微信小程序的`rpx`方法的转换图，微信小程序帮你搞定了`rpx`和所有真机之间的比例关系，只不过在`iphone6`上的比例恰好是2这个整数，所以你搞定了`iphone6`下的微信小程序当中的开发，程序跑到其他真机中会按照不同的比例关系，重新将你写的rpx进行转换。所以才会所有的真机中的比例保持一致。

<img :src="$withBase('/weixin_zhifu_5.png')" alt="">

那么问题来了，微信小程序使用`rpx`帮我们搞定了所有比例关系，在移动设备中的`H5`我们怎么自己搞定这个比例关系，`Rem`就此诞生了。
+ <font color=#1E90FF>动态改变html的font-size值，页面元素使用rem布局，html默认的大小是16px，也就是说rem布局是基于网页的根元素，即rem = html font-size的值，默认就是1rem = 16px</font>
+ <font color=#1E90FF>屏幕宽度/750 * 10 = html font-size</font>

这样设计的原理实际上就是<font color=#DD1144>先找到比例，然后将比例和网页的某个固定的变量挂钩，这样我们就可以通过那个变量来实现比例</font>，我们想要实现响应式，实际上就是找到这个值在屏幕宽度当中占得比例即可，按照上面说的`屏幕宽度/750 * 10`就是说<font color=#DD1144>1rem = 屏幕的75分之一</font>，下面我们用代码演示一下：
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title>imooc_pay_front_h5</title>
    <script>
      function initHtmlFontSize() {
        console.log("正在初始化rem比例")
        let screenWidth = document.documentElement.clientWidth // document.documentElement返回的是html文档对象
        let fontSize = screenWidth / 750 * 10 // 计算出rem的比例
        document.documentElement.style.fontSize = fontSize + "px" // 现在1rem为屏幕宽度的1/75
      }　 
      initHtmlFontSize() // 首次加载应用，设置一次
      window.addEventListener('orientationchange', initHtmlFontSize)// 监听手机旋转的事件的时机，重新设置
      window.addEventListener('resize', initHtmlFontSize) // 监听手机窗口变化，重新设置
      
    </script>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but imooc_pay_front_h5 doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>
```
值得注意的是，代码当中的关于监听手机旋转和手机窗口变化的代码是可选的，要根据你自己的业务和项目来判断是否需要监听。我们下面给出代码的专业版本：
```javascript
//严谨版
<script>
  !(function (n) {
    var e = n.document, // 获取DOM
      t = e.documentElement, // 获取html
      i = 750, // 设计稿尺寸
      d = i / 100, // 设置比例
      o = "orientationchange" in n ? "orientationchange" : "resize", // 横屏orientationchange，竖屏resize
      a = function () {
        var n = t.clientWidth || 375; // 屏幕宽度
        n > 750 && (n = 750); // 屏幕宽度大于750 强制等于750
        t.style.fontSize = n / d + "px"; // 设置转化后的html字体
      };

    e.addEventListener && // 监听
      (n.addEventListener(o, a, !1), // !1为false，在冒泡过程中捕获
        e.addEventListener("DOMContentLoaded", a, !1));// 网页加载完成后 绑定的一个事件
  })(window);
</script>
```

## 还原设计稿
一般UI设计师设计出来就会将作品上传到<font color=#9400D3>蓝湖</font>当中，我们工程师就会使用在线工具去看这个UI设计稿。因为蓝湖在给出物理像素的同时能在右侧给出在web下面所有的逻辑像素的值。

现在比如说设计稿给出的一张图片是`750px * 624px`(物理像素)的宽高，我们怎么换算成`rem`? 在`iphone6`下面，我们知道现在计算出来的`html`中的`font-size`的值为`50px`(逻辑像素)，那么图片的的物理像素`750px * 624px`在`iphone6`下转换成逻辑像素是`375px * 312px`，375/50= 7.5，312/50=6.24，所以最终是`7.5rem * 6.24rem`, <font color=#DD1144>这个时候你应该很敏感的发现7.5rem * 6.24rem 不就是原来的UI设计稿给出的750px * 624px这个值的基础上除了100而已么</font>，所以你想清楚了整个过程，你就可以直接在UI稿给出的任何物理像素下直接除以100就是你要写在程序当中的`rem`值。

到这里我们就给出完整的代码，要学习一下怎么搭架子，还有怎么书写简单的样式：
```javascript
// src/main.js
/**
 * @author taopoppy
 * @description 项目入口执行文件
 */
import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios' // 帮助将axios挂载到vue上，每个页面通过this.axios请求
import router from './router/index' // 引入路由文件
import './assets/css/base.css' // 引入清除默认样式文件
import './assets/css/commen.css' // 引入全局通用样式
Vue.config.productionTip = false

axios.interceptors.request.use(function(){
  // 请求地址的处理（修改替换），请求loading的处理都可以在这里进行
})

axios.interceptors.response.use(
  function(response){// 请求响应的处理,请求成功了，但是请求结果出错
    let res = response.data
    if(res.code != 0) {
      // 统一处理
      alert(res.message)
    }
  },
  function(error){ // 网络请求发生错误,这样可以通过catch捕获到组件通过this.axios请求的异常
    return Promise.reject(error)
  }
)

Vue.use(VueAxios, axios)
new Vue({
  router, // 进行路由配置
  render: h => h(App),
}).$mount('#app')
```
```javascript
// src/App.vue
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
}
</script>

<style>
</style>
```
```javascript
// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'
import index from '../pages/index.vue'
import pay from '../pages/pay.vue'
import activity from '../pages/activity.vue'

Vue.use(Router)

const routes = [
	{
		path: '/index',
		name: 'index',
		component: index,
		meta: { title: '首页'}
	},
	{
		path: '/pay',
		name: 'pay',
		component: pay,
		meta: { title: '充值'}
	},
	{
		path: '/activity',
		name: 'activity',
		component: activity,
		meta: { title: '活动'}
	}
]

const router = new Router({
	routes
})

export default router
```
```javascript
// src/pages/index.js
<template>
	<div class="index">
		<img src="../assets/img/header.png" class="header" alt="">
		<div class="btn-group">
			<button class="btn">分享</button>
			<button class="btn-primary">充值</button>
			<button class="btn">活动详情</button>
		</div>
	</div>
</template>

<script>
export default {
  name: 'index',
}
</script>

<style scoped>
.index {
	height: 100vh;
	background-color: #ffc93a;
}
.btn-group {
	padding-top: .34rem;
	text-align: center;
}

</style>
```
```css
/* src/assets/css/commen.css */
#app {
	margin: 0 auto;
	max-width: 750px;
}

.header {
	width: 100%;
	height: 6.24rem;
}

.btn {
	border: none;
	border-radius: .5rem;
	width: 5.4rem;
	height: 1rem;
	background-color: #fff;
	line-height: 1rem;
	text-align: center;
	font-size: .34rem;
	color: #ff3184;
}

.btn-primary {
	background-color: #ff3184;
	color: #fff;
}
```
```css
/* src/assets/css/base.css */
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
```
