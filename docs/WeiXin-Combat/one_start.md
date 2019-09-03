# 项目构建

## 从0构建项目
### 1. 创建项目
我们直接去微信公众平台上注册账号，然后登录，在登录后的开发面板中的找到`开发`，在开发中的`开发设置`当中就能找到我们小程序唯一的标识符`AppID`,然后我们打开小程序开发工具，然后创建项目即可，但是注意两个点：
+ `项目路径`必须是个空文件夹
+ `开发模式` 选择`小程序云开发`

### 2.开通云服务
其实创建好项目后会提示你：`cloud init error:  Error: invalid scope 没有权限，请先开通云服务`,所以我们下面来为该项目创建云开发服务。

点击左上角的`云开发`，然后点击开通，创建环境名称为`test`的环境，在后面我们正式上线的时候还会创建一个正式环境，当然一个程序只能最多创建两个环境。

开通了云开发一般要等待10-30分钟，因为我们创建好项目后你会发现项目中的`cloudFuntions`这个文件夹后面显示`未指定环境`，所以等候足够的时间后我们再重新打开开发者工具，就会在`cloudFunctions`后面显示`test`，当然这个也可以点击手动设置环境。

### 3. 代码结构概述
重新打开项目，基本的我们就不说了，可以到之前的[微信小程序入门和云开发](https://www.taopoppy.cn/WeiXin/weixin_sign.html#%E5%88%9B%E5%BB%BA%E5%92%8C%E4%BB%A3%E7%A0%81%E6%9E%84%E6%88%90)当中去了解一下项目初始化的目录结构.

我们这里先说`miniprogram/app.js`：
```javascript
//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {}
  }
})
```

+ 里面有段中文，显示`请使用2.2.3或者以上的基础库以使用云能力`，我们就点击小程序开发工具右上角的`详情`，然后点击`本地设置`，选择基础库的版本为最新即可。
+ `env`这个字段就是我们设置环境的，特别要注意，我们最开始创建的`test`环境，其实`test`只是名称，这里要填的是环境的`id`。还有后面我们还可以创建一个正式上线的环境，然后在这里修改`env`的值就能改变环境，因为每个环境都使用的是独立的资源。所以我们这里修改`env`为我们自己创建的环境`id`即可。
+ `traceUser`这个字段指的是有人如果访问你的小程序，就会在云开发控制台当中显示出来
+ `this.globalData`就是一些全局的变量和函数，我们后面也会使用到这个东西。

然后我们在`miniprogram/app.json`当中：
```javascript
{
  "pages": [
  ],
  "window": {
    "backgroundColor": "#F6F6F6",
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#F6F6F6",
    "navigationBarTitleText": "云开发 QuickStart",
    "navigationBarTextStyle": "black"
  },
  "sitemapLocation": "sitemap.json"
}
```
+ `pages`: 就是指页面路由的部分
+ `window`: 就是指小程序界面的一些设置
+ `sitemapLocation`: 这是新属性是<font color=#3eaf7c>小程序内部开发的一些搜索</font>，我们后面在优化部分还会涉及到这个东西

### 4. 代码初始化
我们首先要删除掉所有`miniprogram/images`和`miniprogram/pages`当中所有的文件，然后我们要去`iconfont`上面选择底部导航图标，并放在`miniprogram/images  `文件夹下面，删除`miniprogram/style/guide.wxss`和`miniprogram/app.wxss`中的样式代码,然后修改`miniprogram/app.json`中的内容如下：
```javascript
    "pages/playlist/playlist",
    "pages/blog/blog",
    "pages/profile/profile"
  ],
  "window": {
    "backgroundColor": "#F6F6F6",
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#d43c33",
    "navigationBarTitleText": "音乐",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "color": "#474747",
    "selectedColor": "d43c43",
    "list": [{
      "pagePath": "pages/playlist/playlist",
      "text": "音乐",
      "iconPath": "images/music.png",
      "selectedIconPath": "images/music-actived.png"
    },{
      "pagePath": "pages/blog/blog",
      "text": "发现",
      "iconPath": "images/blog.png",
      "selectedIconPath": "images/blog-actived.png"
    },{
      "pagePath": "pages/profile/profile",
      "text": "我的",
      "iconPath": "images/profile.png",
      "selectedIconPath": "images/profile-actived.png"
    }]
  },
  "sitemapLocation": "sitemap.json"
}
```
基本上就是创建了三个页面和底部的导航栏的按钮部分，然后修改了顶部的颜色和文字，至于每个设置中的字段是神作用，建议到官网去查询一下，我们这里给出官网查询地址：
+ [https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html)

## 代码规范
我们要遵循的代码规范我们可以去参考下面的`github`网址：
+ [https://github.com/airbnb/javascript](https://github.com/airbnb/javascript)

在这里我们简单的说几条规则：
+ 定义变量尽量用`let`,`const`，尽量不要使用`var`
+ 定义对象数组，直接使用字面量的方式，不要使用`new`方法
+ 定义对象中的方法尽量使用`funtionName() {}`这种写法，而不是`functionName: function() {}`
+ 对象中的属性和值一样的条件下使用简写方式
+ 使用箭头函数避免`this`指向错误，箭头函数的参数尽量使用小括号括起来
+ 项目中不使用分号作为代码结尾