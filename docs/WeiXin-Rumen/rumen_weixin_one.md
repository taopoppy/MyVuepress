# 微信小程序概述

## 什么是微信小程序
根据张小龙的定义，微信小程序有下面这些特点：
+ <font color=#1E90FF>不需要下载安装即可使用</font>：这个说话是有点推销的含义，从技术的角度讲不可能存在不下载就可以使用的东西，只不过微信小程序的安装包不允许超过1M，所以下载速度很快，下载时间很短，相对于App,用户几乎感觉不到下载的过程。
+ <font color=#1E90FF>用户用完即走，不用关心是否安装太多应用</font>
+ <font color=#1E90FF>应用无处不在，随时可用</font>

至于微信小程序为什么会横空出世，你必须要知道相对于手机App,它的价值在哪里?
+ <font color=#1E90FF>B2C（人与商品）</font>： 淘宝，京东
+ <font color=#1E90FF>P2P（人与人）</font>：微信，QQ
+ <font color=#DD1144>C2P（人与服务）</font>：微信小程序(小黄车)

微信小程序的特点在哪里？
+ <font color=#1E90FF>业务逻辑简单</font>
+ <font color=#1E90FF>使用频率低</font>
+ <font color=#1E90FF>性能要求低</font>

新版小程序的开发者工具有所变化，工具栏移动了上面，另外要注意的是：<font color=#DD1144>个人开发者需要在下载好开发工具和建立项目后，需要勾选:设置/项目设置/不校验合法域名，web-view(业务域名)，TLS版本及HTTPS证书，或者在下载好源码后，在第一次运行之前就要勾选</font>

## 小程序开发准备
+ <font color=#1E90FF>申请小程序账号（appid）</font>
+ <font color=#1E90FF>下载并安装微信开发者工具</font>

### 1. 申请小程序账号

进入<font color=#9400D3>微信公众平台</font>，点击<font color=#9400D3>立即注册</font>，然后选择<font color=#9400D3>小程序</font>，经过一系列的填写验证，我们最终可以在登录微信公众平台后在小程序的管理页面找到<font color=#9400D3>开发设置</font>，这里找到<font color=#DD1144>小程序的ID</font>

小程序的`AppID`相当于小程序平台的一个身份证，后续你会在很多地方要用到`AppID`

### 2. 微信开发者工具
到[https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)下载适合自己电脑的工具。

打开之后，添加一个程序的项目：
<img :src="$withBase('/weixin_rumen_signin.png')" alt="新建项目">

这里要说的就是小程序云开发是一个对前端工程师比较友好的东西，它无需像`Jave`等后端语言搭建复杂的环境，同时对于数据库的操作也是非常简单好用。这个我们后续还会仔细学习。

进入开发页面后，如下图所示：

<img :src="$withBase('/weixin_rumen_jiemian.png')" alt="开发界面">

+ 主要的四个部分，<font color=#1E90FF>模拟器</font>、<font color=#1E90FF>编辑器</font>、<font color=#1E90FF>调试器</font>、<font color=#1E90FF>云开发</font>都可以在左上角点击显示和隐藏。

+ <font color=#1E90FF>快捷键需要在编辑区域点击F1进行查看和选择</font>

+ <font color=#1E90FF>项目的配置信息可以在设置-> 项目设置中看到，也可以在右上角的详情中看到</font>

+ <font color=#9400D3>小程序的调试可以打印输出，也可以断点调试，特别要说明的断点调试是要在调试面板中的Sources中，在app.js？[sm]中打断点，然后重新点击上面的编译，程序就会停在断点处</font>
  <img :src="$withBase('/weixin_rumen_tiaoshi.png')" alt="断点调试">

+ 然后就是在调试器当中的其他`tab`的作用：
  + <font color=#1E90FF>console</font>：打印
  + <font color=#1E90FF>Sources</font>: 源文件
  + <font color=#1E90FF>Network</font>：监听请求
  + <font color=#1E90FF>Storage</font>：缓存情况