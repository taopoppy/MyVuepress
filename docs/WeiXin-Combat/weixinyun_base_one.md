# 小程序基础

## 小程序注册
打开小程序的官网[https://mp.weixin.qq.com/](https://mp.weixin.qq.com/),点击右上角的<font color=#3eaf7c>立即注册</font>，然后按照流程去注册，我们注册的类型是个人，但是个人没有办法使用支付还有卡包的功能，注册完成之后会直接跳转到微信公众号平台

在首页我们可以编辑我们的小程序信息，作为个体开发，我们可以在成员管理界面添加开发人员和体验人员，然后下面我们要说最重要的东西，就是<font color=#3eaf7c>小程序的ID</font>，这个是小程序的唯一标识，差不多和人的身份证一样。<font color=#3eaf7c>我们可以在开发中的开发设置查找到小程序ID这个唯一标识</font>

注册注意事项：
+ 使用邮箱注册时一个邮箱只能申请一个小程序
+ 邮箱不能使用注册过公众号，开发平台，企业号以及绑定过个人号的邮箱
+ 主体信息一旦确定不能修改
+ 上传企业基本资料时需要签名加公章，保证图片清晰度，不然审核不会通过
+ 已经申请微信公众号的企业可以在首页中点击小程序进入下一步

## 小程序开发工具介绍
我们可以在[https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)小程序官网去下载专业的开发工具，选择稳定版，一路下一步，打开的时候需要通过微信扫码进行登录，然后我们在最上面从左到右来依次说明每个按钮的作用

+ 开发者头像 
+ 模拟器：显示模拟的窗口
+ 编辑器：显示编辑代码的窗口
+ 调试器：显示类似chrome的调试窗口
+ 云开发：云开发的界面，需要进行开通
+ 模式：小程序模式和插件模式
+ 编译：小程序默认编译会进行到第一个界面，可以添加新的编译，然后指定页面
+ 预览：上传到腾讯云然后显示一个二维码，通过真机扫描进行测试 
+ 真机调试：是通过网络连接，直接对真机当中的小程序进行调试
+ 切后台：模拟小程序进入后台的作用
+ 清缓存：对小程序当中的数据进行缓存的清除
+ 上传：生成体验版本
+ 版本管理：类似于git，可以更好进行版本的管理
+ 详情：显示小程序的详情

## 创建和代码构成
进入小程序开发工具，然后扫码进入，点击空白处的加号，然后填写项目的信息，包括名称，目录（必须是空文件夹），AppId(之前已经说过)，开发模式等等，然后创建好了我们会有4个文件或者文件夹
+ `cloudfunctions`（指定腾讯云项目的目录）
+ `miniprogram`（小程序项目）
+ `READMD.md`（项目描述文件）
+ `project.config.json`（小程序的配置文件）

然后在`miniprogram`文件下都是页面相关的文件，但是每个文件夹下面都有四中文件`.js`,`.json`,`.wxml`,`wxss`，这四个文件的作用分别如下：
+ `.json`：配置文件，以`json`格式配置，在小程序中有三种配置：<font color=#3eaf7c>全局配置</font>，<font color=#3eaf7c>页面配置</font>，<font color=#3eaf7c>项目配置</font>
+ `.wxml`:模板文件，描述页面的结构，相当于`HTML`
+ `.wxss`:样式文件，调整页面样式，相当于`CSS`
+ `.js`：脚本逻辑文件，页面和用户的交互逻辑

## 配置文件
我们在小程序当中有三种配置文件类型，分别是：
+ <font color=#3eaf7c>project.config.js</font>:项目配置
+ <font color=#3eaf7c>app.json</font>:全局配置
+ <font color=#3eaf7c>page.json</font>:页面配置

### 1.project.config.json
我们首先来看一下项目配置文件的内容：
```json
{
	"miniprogramRoot": "miniprogram/",   //小程序源代码的文件夹名称
	"cloudfunctionRoot": "cloudfunctions/",  // 小程序云开发的文件目录
	"setting": {
		"urlCheck": true,  // 是否检查安全域名和 TLS 版本
		"es6": true,       // 是否启用 es6 转 es5 
		"postcss": true,   // 上传代码时样式是否自动补全
		"minified": true,  // 上传代码时是否自动压缩
		"newFeature": true
	},
	"appid": "wxc5cf9761cb48be77",
	"projectname": "movieTest",
	"libVersion": "2.2.5",
	"simulatorType": "wechat",
	"simulatorPluginLibVersion": {},
	"condition": {
		"search": {
			"current": -1,
			"list": []
		},
		"conversation": {
			"current": -1,
			"list": []
		},
		"plugin": {
			"current": -1,
			"list": []
		},
		"game": {
			"list": []
		},
		"miniprogram": {
			"current": 0,
			"list": [
				{
					"id": -1,
					"name": "db guide",
					"pathName": "pages/databaseGuide/databaseGuide"
				}
			]
		}
	}
}
```
其他的配置项我们都可以在下面列出的官网去查阅到
+ [https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html](https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html)

### 2. app.json
关于全局配置文件在`miniprogram/app.json`当中，我们来看一下有哪些参数和设置：
```json
{
  "pages": [  
    //  用于描述当前小程序所有页面路径，这是为了让微信客户端知道当前你的小程序页面定义在哪个目录
  ],
  "window": {
    // 定义小程序所有页面的顶部背景颜色，文字颜色定义等
  },
  "sitemapLocation": "sitemap.json"
}
```
关于更多的全局配置我们可以去下面列出的官网查询，上面都有详细的参数说明
+ [https://developers.weixin.qq.com/miniprogram/dev/framework/config.html#全局配置](https://developers.weixin.qq.com/miniprogram/dev/framework/config.html#全局配置)
+ [https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html)

那么我们现在来修改一下这个配置如下：
```json
{
  "pages": [
    "pages/base/base",
    "pages/cloud/cloud"
  ],
  "window": {
    "backgroundColor": "#F6F6F6",
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#1afa29",
    "navigationBarTitleText": "入门微信小程序和云开发",
    "navigationBarTextStyle": "black"
  },
  "sitemapLocation": "sitemap.json",
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/base/base",
        "text": "基础",
        "iconPath": "images/base_icon.png",
        "selectedIconPath": "images/base_selectedicon.png"
      },
      {
        "pagePath": "pages/cloud/cloud",
        "text": "云开发",
        "iconPath": "images/cloud_icon.png",
        "selectedIconPath": "images/cloud_selectedicon.png"
      }
    ]
  }
```
我们在这里配置了两个底部导航栏，然后创建了两个导航栏，分别将他们的图片保存在`images`文件夹下面，然后如果我们想让具体的页面有不同于全局的配置，我们每个页面都有自己的`json`文件，我们可以去单独设置

### 3. page.json
上面说到页面的单独样式设置，比如我们去`pages/base/base.json`当中单独设置基础页面的样式如下：
```json
{
  "usingComponents": {},
  "navigationBarBackgroundColor": "#000000",
  "navigationBarTextStyle": "white",
  "navigationBarTitleText": "云开发"
}
```
这样我们的云开发页面就会变成顶部是黑色背景，白色的文字，标题也是我们设置的云开发，这也就能区分和全局配置了，关于更多页面配置的内容我们可以去下面列出的官网中查询
+ [https://developers.weixin.qq.com/miniprogram/dev/framework/config.html#页面配置](https://developers.weixin.qq.com/miniprogram/dev/framework/config.html#页面配置)
+ [https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/page.html](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/page.html)


## WXML
`WXML`的全称是`WeiXin Markup Language`，是小程序框架设计的一套标签语言，结合小程序的基础组件，事件系统，可以构建出页面的结构，充当的就是类似`HTML`的角色。在微信当中有自己的一套组件库，我们可以在下面列出的官网地址去查看组件用法和属性信息：
+ [https://developers.weixin.qq.com/miniprogram/dev/component/view.html](https://developers.weixin.qq.com/miniprogram/dev/component/view.html)

### 1. 数据绑定
+ 小程序中的数据一般情况下需要动态的从服务端获取，然后再渲染输出到视图中显示。
+ `WXML`中的动态数据均来自对应的`Page`的`data`
+ 数据绑定使用`Mustache`语法（双大括号）将变量包起来

### 2. 条件渲染
+ 使用下面这种方式来判断是否需要渲染改代码块，也可以用`wx:elif`和`wx:else`来添加一个`else`块
  ```javascript
  wx:if = "{{ condition }}"
  ```
+ 使用`hidden`来控制组件的显示与否
+ `wx:if`和`hidden`的区别就是前者条件为真就会显示到`wxml`当中，条件为否就不会出现在`wxml`当中，后者是无论条件为真或者为假都会显示到`wxml`当中，只是通过`hidden`控制页面的显示与否，这个和`Vue`中的`v-if`,`v-else`,`v-show`的区别差不多
+ 所以我们如果会频繁的变更显示与否应该使用`hidden`,否则使用`wx:if`

## WXSS
`WXSS`全称是`WeiXin Styles Sheets`，是一套用于小程序的样式语言，用于描述WXML的组件样式，也是视觉上的效果。它有两个要注意的点，如下：
+ 尺寸单位：<font color=#3eaf7c>rpx</font>可以根据屏幕宽度进行自适应，适配不同宽度的屏幕
+ 引入外部`wxss`: <font color=#3eaf7c>`@import './test_0.wxss'`</font>

### 1. 尺寸单位
我们首先要说的是官网上关于`rpx`的一段解释：
`rpx（responsive pixel）: 可以根据屏幕宽度进行自适应。规定屏幕宽为750rpx。如在 iPhone6 上，屏幕宽度为375px，共有750个物理像素，则750rpx = 375px = 750物理像素，1rpx = 0.5px = 1物理像素`

上面这段解释简单的就是说: <font color=#3eaf7c>使用rpx就表示无论什么宽度的屏幕都分为750rpx，也就是分为750份</font>，而且通常我们都是建议按照iphone6去做像素稿单位，因为iphone的像素是`375`，这样和`750`好换算，非常方便。

### 2. 引入样式
基本上我们都会在项目的`Styles`目录下面去写一些公共的样式，所以我们假如页面中需要，就在`.wxss`文件中使用`@import '../../style/common.wxss'`这种方式去引入样式，但是特别要注意的是这个路径是<font color=#3eaf7c>相对路径</font>，相对路径指的就是相对自己当前文件，引入的文件的路径地址。

除此之外我们通常会引入第三方的样式库，我们下面列举一下比较好的样式库：
+ <font color=#3eaf7c>WeUI</font>: 同微信原生视觉效果体验一致的基础样式库
+ <font color=#3eaf7c>iView</font>: 除了有微信的组件库还有PC端的组件库，还有后端管理系统
+ <font color=#3eaf7c>Vant</font>： 除了有微信的组件库还有PC端的组件库，轻量可靠

## JS
首先事件处理我们可以在下面列出的官网地址去学习一下：简单的说和Vue当中的差不多，通过在组件上绑定相应事件的处理函数，然后在`js`文件中写处理函数即可
+ [https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html)

### 1. 事件机制
比如在`.wxml`文件中有一端这样的函数：
```html
<button size="mini" bindtap="onTapHandlerAdd">点我+1</button>
<button size="mini" bindtap="onTapHandlerSub">点我-1</button>
<view>{{count}}</view>
```
然后我们在`.js`文件中添加两个处理函数: <font color=#3eaf7c>特别要注意修改数据要通过this.setData</font>，这一点和`React`是十分相似的
```javascript
  /**
   * 计数器点击+1事件
   */
  onTapHandlerAdd: function () {
    this.setData({
      count: this.data.count + 1
    })
  },
  /**
 * 计数器点击-1事件
 */
  onTapHandlerSub: function () {
    this.setData({
      count: this.data.count -1
    })
  }
```

### 2. bind VS catch
首先我们知道<font color=#3eaf7c>事件是对用户的交互操作行为的响应</font>，事件绑定我们在上面只说了`bind`,还有一种`catch`,我们在前端开发之中学到过<font color=#3eaf7c>事件冒泡</font>，最简单的例子就是子元素触发了点击事件，事件会冒泡到父元素，也就是父元素的点击事件也会被触发，那么我们在前端可以通过`e.stopPropagation()`阻止事件冒泡，但是在小程序当中很简单，<font color=#3eaf7c>我们可以通过catch阻止事件冒泡</font>，如下
```javascript
// 事件冒泡
<view class="box" bindtap="boxTap">
  <view class="childbox" bindtap="childrenboxTap"></view>
</view>

// 阻止事件冒泡
<view class="box" catchtap="boxTap">
  <view class="childbox" catchtap="childrenboxTap"></view>
</view>
```

### 3. 事件对象
总的来说：<font color=#3eaf7c>事件对象就是事件的状态</font>，当组件绑定的事件被触发后，就会传递这样一个事件对象到事件触发处理函数当中，我们在处理函数当中可以打印出事件对象有哪些属性：
```javascript
changedTouches: [{…}]
currentTarget: {id: "", offsetLeft: 0, offsetTop: 510, dataset: {…}}  // 当前组件属性集合
detail: {x: 149, y: 545}
target: {id: "", offsetLeft: 0, offsetTop: 510, dataset: {…}} // 触发事件的组件的属性的集合
timeStamp: 2479  // 事件戳
touches: [{…}]
type: "tap"    // 事件类型
_requireActive: true
__proto__: Object
```

然后比如我们要自定义一个属性在组件当中，比如`data-id="1234"`，我们在触发事件的处理函数中，这个自定义属性的值我们能在`target/dataset/id`当中找到`"1234"`这个值，如下：在`.wxml`中设置自定义属性`data-id`
```html
<view catchtap="boxTap" data-id="1234">
</view>
```
然后在`.js`文件的`boxTap`事件触发处理函数当中通过`event`对象可以拿到自定义属性的值：
```javascript
  boxTap: function (event) {
    console.log(event.target.dataset.id) // 1234
  },
```