# 注册和工具

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