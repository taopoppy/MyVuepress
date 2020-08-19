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

+ <font color=#1E90FF>项目的配置信息可以在设置-> 项目设置中看到，也可以在右上角的详情中看到，在新版的小程序当中我们要特别注意勾选下面三个选项</font>
  + <font color=#DD1144>增强编译</font>：帮助小程序使用一些更高阶的ES语法
  + <font color=#DD1144>使用npm模块</font>：现在小程序可以使用npm包
  + <font color=#1E90FF>不校验合法域名，TLS版本以及HTTPS证书</font>：小程序上线是一定要用`https`的`api`接口，但是在开发阶段一般都是`http`的接口用于测试，所以要勾选
  <img :src="$withBase('/weixin_shezhi.png')" alt="小程序项目设置">

+ <font color=#9400D3>小程序的调试可以打印输出，也可以断点调试，特别要说明的断点调试是要在调试面板中的Sources中，在app.js？[sm]中打断点，然后重新点击上面的编译，程序就会停在断点处</font>
  <img :src="$withBase('/weixin_rumen_tiaoshi.png')" alt="断点调试">

+ 然后就是在调试器当中的其他`tab`的作用：
  + <font color=#1E90FF>console</font>：打印
  + <font color=#1E90FF>Sources</font>: 源文件
  + <font color=#1E90FF>Network</font>：监听请求
  + <font color=#1E90FF>Storage</font>：缓存情况

关于编辑器的其他功能，我们在后面学习的时候再具体的介绍。

## 小程序的基本结构

### 1. 小程序的基本单位-Page
按照约定俗称，小程序是由一个个的页面组成的，这些页面的文件都放在`pages`文件夹当中，但是也并非页面的文件只能放在`pages`当中，什么文件是页面需要看配置，在<font color=#DD1144>app.json</font>文件当中，所以的页面都要写在`pages`这个选项当中，才能成为小程序的页面：
```javascript
// app.json
{
  "pages":[
    "pages/index/index",
    "pages/logs/logs"
  ],
  "window":{
    "backgroundTextStyle":"light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "Weixin",
    "navigationBarTextStyle":"black"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

<font color=#DD1144>虽然页面是小程序一个非常重要的组件，但是实际上在小程序当中，一切都是组件，这个概念非常重要</font>，接着可以看到，每个页面都是一个文件夹，下面有四个不同类型的文件，分别是 

+ <font color=#1E90FF>.js</font>：页面行为（英雄的技能）
+ <font color=#1E90FF>.json</font>：页面配置（英雄的天赋和符文）
+ <font color=#1E90FF>.wxml</font>：页面骨架（不同的英雄）
+ <font color=#1E90FF>.wxss</font>： 页面样式（英雄的皮肤）

和`web`开发大体是一样的，只不过多了一个页面的配置，页面在小程序这个容器当中处于什么状态，如何显示都可以通过页面的`json`文件进行配置。当然这四种文件在不同的页面也不一定都需要，这些文件也不需要想`web`开发一样互相引入才能使用，只需要保证都是同一个文件名即可。

### 2. 全局配置
+ `app.js`、`app.json`、`app.wxss`是三个程序级别的文件，不能修改名称，比如`app.json`和`app.wxss`当中的配置会在所有的页面生效，有点类似于我们在`web`开发当中写页面样式和全局样式一样，只不过对于相同的属性，程序会采用就近原则，即页面样式会覆盖全局样式中相同的配置。

+ `app.js`当中包含了应用程序的很多声明周期，这个和`react`或者`vue`当中的组件声明周期有点类似，这个我们后面会详细讲解。

+ `project.config.json`是项目的配置文件，比如你设置了使用`npm`，增强编译等项目设置，都会保存在文件当中，该项目在别的地方打开，会按照该文件中的设置启动，运行。有点类似于`.vscode`，项目在任何电脑上的`vscode`打开都是相同的方式和配置。

+ `sitemap.json`是关于搜索的配置文件，有兴趣可以在文件中给出的地址参阅文档。