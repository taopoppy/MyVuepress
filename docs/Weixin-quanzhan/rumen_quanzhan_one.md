# 微信小程序概述

## 微信小程序的出现
+ 相对于传统的APP，小程序不需要花费很长的时间和内存去安装，搜索或者扫码打开即可使用
+ 相对于H5页面，具有启动优势，因为H5每次打开页面都需要重新下载和渲染，小程序可以在前后台之间切换，而且可以做到局部渲染
+ 小程序和H5同样有缓存的作用，但是比H5更有类APP的效果
+ 从商户运营的角度，基本上所有APP都可以拥有小程序的版本，尤其是高频低时长和低频低时长的这类APP，更适合小程序，也方便从小程序向APP引流

<font color=#DD1144>微信小程序是HyBrid技术的更进一层，HyBrid技术的原理是Native通过JSBridge提供统一的底层API，然后使用HTML和CSS实现界面，JS写业务逻辑，最终的页面在WebView中展示，这种技术下，Android和IOS的底层API一般具有一致性，所以HyBird具有跨平台开发的优势</font>

<font color=#9400D3>微信小程序除了跨平台的优势，还具有额外的优势，比如审核周期短，而且借助微信的产业链，微信小程序都走在了技术的前沿</font>

学习一门技术的关键在于实践。

## 微信小程序的学习顺序
+ <font color=#1E90FF>工具，原理和框架</font>
  + <font color=#DD1144>第一章</font>：重新认识微信小程序，及新功能的介绍
  + <font color=#DD1144>第九章</font>：小程序的第三方开发框架与使用
+ <font color=#1E90FF>基础</font>
  + <font color=#DD1144>第二章</font>：微信小程序组件介绍及使用
  + <font color=#DD1144>第三章</font>：开发常用的API介绍及使用
+ <font color=#1E90FF>实战</font>
  + <font color=#DD1144>第四章</font>：快速构建商家小程序前端页面
  + <font color=#DD1144>第五章</font>：node语言打造后端接口，及公众号页面管理后台
  + <font color=#DD1144>第六章</font>：云开发常用功能
  + <font color=#DD1144>第七章</font>：添加广告，实现流量变现
  + <font color=#DD1144>第八章</font>：添加日常运营插件，组件用户长期留存和高频互动

## 小程序的特点和开发能力
### 1. 小程序的特点
和传统应用相比，有下面的这些特点：
+ <font color=#1E90FF>于Web项目，入口不同</font>：`web`是用`url`来标识自身，依托于搜索引擎，而<font color=#DD1144>线下小程序码</font>和<font color=#DD1144>微信</font>是小程序的入口。

+ <font color=#1E90FF>都是js语言为主，相对于App而言，学习门槛和成本都比较低</font>

+ <font color=#1E90FF>和H5相比，小程序受限于微信运营规范，不像H5页面那么灵活，但是可以做一些H5做不到的事，比如消息订阅，直接转发给好友等</font>

### 2. 开发能力
依托于微信的宿主环境，除了常用的UI组件和网络API之外，在设备能力上，凡是微信有的能力，比如震动，监听网络状态，罗盘，小程序都有，此外，在运营上开放的能力有下面一下关注的点：
+ <font color=#1E90FF>小程序和公众号可以重名</font>
+ <font color=#1E90FF>小程序开放群相关的能力</font>：小程序可以获取微信群的ID，限制某些功能只能由群友使用
+ <font color=#1E90FF>小程序"附近小程序"功能</font>：只能企业使用，要求商家主体和小程序主体保持一致
+ <font color=#1E90FF>小程序"星号"标志</font>:点击小程序的五角星号，优先在我的小程序中展示
+ <font color=#1E90FF>小程序可以关联500个公众号</font>：这500个公众号都可以在文章中插入小程序的卡片，帮助宣传，不要求主体一致
+ <font color=#1E90FF>可以直接打开网页</font>：在后台配置了业务域名后，可以直接打开已经有的网页，对于已经有海量内容的网站十分有用，直接绑定在小程序中，页面即可展示
+ <font color=#1E90FF>小程序的灰度更新和线上版本的回退功能</font>：发布可以全量，也可以部分，也可以回退版本
+ <font color=#1E90FF>小程序客服能力配置</font>：在客服串口中可以发送小程序卡片，配置了服务器，客服消息由服务器接管。在公众号后台绑定好后台的接口和域名，用户发送的消息传送到后台，后台通过接口对不同的消息进行不同的回复

### 3. 2020年新特性
+ 搜索能力
  + 开放小程序页面结构化数据接入
  + 对小众的长尾小程序有利；功能直达
+ 附近的小程序
  + 引入评价，商品等信息的展示；强调附近小程序的发现
+ 订阅消息
+ 封面广告等广告能力
+ 直播组件
+ 小程序框架 kbone，脱离微信客户端环境
+ 基础商业场景能力
  + 品牌认证，物流工具，商业交易场景；目标推出**电商平台**
  +  一物一码；商品，带参数的二维码
    + 扫码进店，挑选商品
    + 用小程序支付，买完即走的商品交易


## 小程序的运行机制
在小程序之前，最流行的技术是`HyBird`混合开发技术，它有两个优势， <font color=#DD1144>跨平台</font>和<font color=#DD1144>热更新</font>，微信小程序，相当于运行在微信这个特定环境之下的`HyBird`技术，关于小程序的运行机制，我们可以从下面4个方面来谈谈它的创新点：

### 1.启动机制
小程序启动有两种：<font color=#9400D3>热启动</font>和<font color=#9400D3>冷启动</font>

<img :src="$withBase('/weixinxiaochengxu_qidong.png')" alt="启动种类">

<font color=#1E90FF>小程序既然从缓存中读取代码包，什么时候去更新版本呢，小程序在冷启动的时候去检查版本，然后异步下载新版本的安装包，并且同时用客户端本地的代码包进行启动，新版本的小程序需要等待下一次冷启动时才会用上，如果想立马使用新的版本，可以使用wx.getUpdateManager来进行处理</font>

小程序的启动场景有三种：

<img :src="$withBase('/weixinxiaochengxu_qidong_way.png')" alt="三种启动方式">

+ <font color=#DD1144>第一种情况：首次打开小程序的时候，从微信云端下载小程序代码包并且运行下载</font>

+ <font color=#DD1144>第二种情况：最近如果启动过还在后台运行着，直接将小程序从后台状态切换到前台状态</font>

+ <font color=#DD1144>第三种情况：长时间未运行，或者被微信主动销毁以后再打开，此时就是冷启动，从本地缓存中读取代码包，同时从微信云端检测新版本，如果有更新就异步下载</font>

微信主动销毁小程序有两种情况，分别是小程序进入后台维持运行超过5分钟，和在5秒之内连续两次收到系统内容的警告，我们就会收到"运行内存不足，请重新打开小程序"，后者我们可以使用`wx.onMemoryWarning`接口去监听内存警告事件，提前做一些处理

### 2. 状态
小程序的状态有<font color=#9400D3>前台状态</font>和<font color=#9400D3>后台状态</font>，<font color=#DD1144>请注意，两种状态都是小程序运行的状态，前台状态是小程序页面展示在客户面前的情况，后台是用户点击了右上角的胶囊按钮以及直接点击了HOME键的情况，但是两种情况小程序都还在运行，没有被销毁，这种就类似于浏览器中的tab在短时间内的切换</font>

### 3. 双线程架构
为了安全和管控，小程序使用双线程执行：分别是<font color=#DD1144>View视图线程</font>和<font color=#DD1144>逻辑线程</font>，<font color=#1E90FF>两者都是通过底层的WeixinJSBridge进行通讯的</font>

+ 视图线程负责的是视图层，主要提供各种组件，渲染界面
+ 逻辑线程主要提供各种API来处理业务逻辑

<img :src="$withBase('/weixinxiaochengxu_xiancheng.png')" alt="线程结构图">

小程序的主要能力就是上面这两大块，<font color=#9400D3>两者都是通过底层的WeixinJSBridge与底层的native进行交互，在事件Event与数据Data的交互处理上，逻辑层把数据变化通知到视图层，触发视图的更新，视图层再把触发的事件通知到逻辑层，进行业务逻辑的处理</font>

### 4. 运行原理
<font color=#1E90FF>**① 视图的持续更新是怎么实现的**</font>

通过`setData`来实现的，看下面的`HyBird`代码
```javascript
webView.evaluateJavascript("javascript:方法名()",
  new ValueCallback<String>() {
    @Override
    public void onReceiveValue(String value) {
      ...
    }
  }
)
```
`HyBird`是通过`evaluateJavascript`执行一个`javascript`函数去执行，并且通过`onReceiveValue`拿到代码执行的结果。

<font color=#1E90FF>小程序中的setData也是通过evaluateJavascript方法实现的，视图层和逻辑层之间的数据传输都是WeixinJSBridge通过原生的evaluateJavascript实现的，setData要更新的数据，首先将这个数据转换为字符串，接着将这个字符串与代码拼接成一个javascript脚本，然后传给evaluateJavascript方法执行，当然小程序也做了一些虚拟DOM的优化，所以从逻辑层到视图层的更新并不是实时进行的</font>



<font color=#1E90FF>**② 使用setData会遇到哪些问题**</font>

由于视图层和逻辑层是两个线程，通过前置的`setData`方法进行数据驱动，通过`WeixinJSBridge`进行中转，中转效率比较低下，所以页面滑动的时候会感觉到卡，因为视图线程一直在努力更新，卡顿和更新的频率和数据量都有关系。

<font color=#1E90FF>**③ 微信为什么要造一个WXS语言**</font>

`WXS`结合`WXML`可以构建出页面的组件结构，适用于任何小程序的版本，虽然它和`javascript`很像，但是也不完全一致。我们来看下面的代码：
```javascript
// js
const app = getApp()
Page({
  data: {
    motto:'Hello World',
    userInfo: {},
    hasUserInfo: false
  },
  ...
})

// WXML
<view>
  <view>
    <text>{{tools.bar(motto)}}</text>
    <text>{{tools.foo}}</text>
  </view>
  <wxs module="tools">
    var foo = "'hello world' from comm.wxs";
    var bar = function(d) {
      return 'hi' + d
    }
    module.exports = {
      foo: foo,
      bar: bar
    }
  </wxs>
</view>
```

在上述代码中，`WXML`中可以直接使用`tools`模块的变量和方法，同时视图中还可以绑定`javascript`代码中的数据变量，<font color=#1E90FF>WXS会比javascript快2-20倍，因为WXS虽然也是代码，但是并不运行在小程序的逻辑线程之内，运行在视图线程中，直接操作视图数据，避免了跨线程的开销，因为小程序的双线程架构在数据更新上有瓶颈</font>

当然`WXS`也有很多缺陷：
+ <font color=#1E90FF>WXS运行环境与其他JS代码是隔离的，WXS并不能调用其他Javascript代码当中定义的函数，也不能调用wx开头的API接口</font>

+ <font color=#1E90FF>WXS函数不能作为视图模板中的事件回调句柄</font>

+ <font color=#1E90FF>在安卓和IOS平台上速率不同，在IOS明显要比JS快2-20倍，而安卓上基本没有差异</font>

## 视图线程的实现
<img :src="$withBase('/weixinxiaochengxu_shituxiancheng.png')" alt="视图线程">

与小程序视图线程有关的编译器一共有两个，分别是<font color=#9400D3>wcc</font>  和 <font color=#9400D3>wcsc</font>：
+ <font color=#1E90FF>wcc是WXML的编译器，用于将WXML文件编译成为Javascript代码</font>
+ <font color=#1E90FF>wcsc是WXSS编译器，负责将WXSS文件编译成为Javascript代码</font>

小程序的视图层是在`Polymer`框架的基础之上，基于`web component`标准实现的