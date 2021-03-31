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
值得注意的是，代码当中的关于监听手机旋转和手机窗口变化的代码是可选的，要根据你自己的业务和项目来判断是否需要监听。

## 还原设计稿