# H5接入公众号

## 公众号准备
公众号其实有分类，分为
+ <font color=#9400D3>服务号</font>：为企业服务的
+ <font color=#9400D3>订阅号</font>：为媒体和个人使用的
+ <font color=#9400D3>小程序</font>：企业和个人都可以使用的一种开放能力

服务号和订阅号有哪些差异?
+ <font color=#1E90FF>服务号侧重于服务，订阅号侧重于咨询</font>
+ <font color=#1E90FF>订阅号每天可以群发一次，服务号每月可以发表4次</font>
+ <font color=#1E90FF>服务号主要适用于媒体，企业和政府，订阅号还适用于个人</font>
+ <font color=#1E90FF>订阅号不支持支付，服务号可申请支付</font>
+ <font color=#1E90FF>订阅号无论认证与否都不能使用支付，服务号先要认证，才能申请支付</font>

### 1. 申请公众号
所以个人创建公众号就是创建订阅号，可以参照[个人创建微信公众号步骤](https://www.imooc.com/article/279586)，企业创建公众号就是创建服务号，要先认证，参照[微信认证申请流程（企业类型）](https://www.imooc.com/article/281154)，然后申请开通微信支付，参照[微信公众号申请开通微信支付](https://www.imooc.com/article/280958)

<font color=#DD1144>对于很多功能，认证和未认证有很大的区别，我们可以到[接口权限说明](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Explanation_of_interface_privileges.html)去看，其中分享功能必须是要认证，无论是订阅号还是服务号，但是订阅号是认证不了的，哈哈</font>

我们先要去注册一个一个订阅号
+ 注册新邮箱
+ 使用新的邮箱注册一个订阅号

如果你要开发服务号，就要去拿公司的邮箱和公司的资质去注册。但是呢，我们在无法完成认证的时候，我们需要注册一个<font color=#9400D3>测试号</font>，下面我们来说如何注册一个测试号。

+ 登录[微信公众平台接口测试账号申请](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)，进行扫码登录。
+ 登录之后就会给你一个测试号的信息：`appID:wx1c9b84a50e29f2af`,`appsecret:bd41eec9cbc1bc7a9ce9fb428a784ed3`

<img :src="$withBase('/weixin_zhifu_6.png')" alt="">

+ <font color=#1E90FF>测试号信息</font>，最关键的部分，只有利用这两者才能拿到用户信息
+ <font color=#1E90FF>接口配置信息</font>：暂时不用，功能是用户发送给服务号或者订阅号的信息会转发到这个服务器上面去进行处理，然后去响应用户
+ <font color=#1E90FF>JS接口安全域名</font>：做微信支付和分享，必须有一些微信的安全域名，这里可以搞一个虚拟域名，因为服务器并不会校验，后面再说。
+ <font color=#1E90FF>最后你要记得下面还有个测试号二维码，记得扫描一下关注一下</font>


### 2. 申请成为开发者
我们在`开发` > `开发者工具` > `Web开发者工具` 当中添加开发者的微信号，那么开发者微信号可以在web开发者工具当中进行本公众号的开发和调试。

<img :src="$withBase('/weixin_zhifu_8.png')" alt="">

然后下载[web开发者工具](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Web_Developer_Tools.html)，这个不是开发小程序的那个微信开发工具，而是`Web开发者工具`，如下图所示，用来开发订阅号或者服务号，而`微信开发工具`是用来开发微信小程序的。如下图所示，只要你已经被添加到订阅号或者服务号的开发者列表中，你就可以扫码对该订阅号或者服务号进行开发。

<img :src="$withBase('/weixin_zhifu_7.png')" alt="">

但是旧版本的`Web开发者工具`和`微信开发工具`是分开的，新版的`1.x`版本已经和`微信开发工具`合并了，也就是说下载`微信开发者工具`，里面既能开发小程序，也能开发公众号网页。


另外要说几个点，打开微信开发公众号后台
+ <font color=#1E90FF>基本配置</font>
	这里有公众号开发信息，比如<font color=#1E90FF>开发者ID</font>、<font color=#1E90FF>开发者密码</font>、<font color=#DD1144>IP白名单</font>(服务号中使用支付功能的时候会用到)

+ <font color=#1E90FF>公众号设置 > 功能设置</font>
	+ <font color=#1E90FF>业务域名</font>：
	+ <font color=#1E90FF>js接口安全域名</font>：分享和支付的时候必须使用的域名
	+ <font color=#1E90FF>网页授权域名</font>：网页用户头像授权，授权成功会有回调，回调的就是这个域名

## 微信授权流程讲解
### 1. 核心概念
微信授权一般大家可能会不知道是什么概念，实际上有一些H5的页面，比如砍价活动，分享活动和抽奖活动，通过微信打开的时候都要去授权，这样才能获取到头像和名称用于社交传播，商户获取`open-id`去存入库内，在搞清楚微信授权流程之前，我们必须要搞清楚一些概念：

+ <font color=#1E90FF>业务域名</font>：我们的业务，或者我们的H5背后的域名，其实可以不设置，但是设置后，在微信内访问该域名下的页面后，不会被重新排版，也不会出现用户输入时候的安全提示。

+ <font color=#1E90FF>JS接口安全域名</font>：微信提供了一系列的js-sdk，就是很多功能接口，你要使用这些接口就必须要添加JS接口安全域名，才能使用js-sdk	

+ <font color=#1E90FF>网页授权域名</font>：过去我们在手机原生APP上有微信登陆，会跳转到微信APP授权，然后再跳回原生APP。H5也一样，需要用户登陆授权的时候，会从H5页面跳出，跳转到微信授权页面，然后再跳回到H5，跳回到的地址就是我们要设置的网页授权域名，其实就是H5的域名。

+ <font color=#1E90FF>开发者工具（添加开发者微信号）</font>：这个之前我们已经说过了，有些H5的用途就仅限于在微信使用，所以不需要再浏览器中调试H5，作为开发者可以使用`微信开发者工具`，来调试我们H5网页，看它再微信当中的效果即可。

+ <font color=#1E90FF>人员设置（添加运营者微信号）</font>：在人员设置当中可以通过运营者管理去添加运营者的微信号，因为服务号或者订阅号当中有一些运营的工作，比如自动回复，投票管理，发表文章等等，包括一个服务号有可能有多个不同部门的人使用，所以都需要通过密码并且扫描才能进入该服务号进行操作

+ <font color=#1E90FF>网页授权access_token</font>：网页授权的时候获取用户的基本信息，是通过`网页授权access_token`去获取的。只再网页授权这一步进行使用。

+ <font color=#1E90FF>普通access_token</font>：用途广泛，可以在除了网页授权之外所有的微信提供的接口中去使用。

+ <font color=#1E90FF>UnionID</font>：一个人如果在微信公众平台申请了公众号，移动应用，小程序，那么相互之间进行绑定的时候，微信公众平台就知道实际上同一个主体，会在每个应用中去添加相同的UnionID去标识同一个人的身份。通常的时候公众号，小程序单个应用的时候只需要open-id即可。同时这个机制也说明，同一个用户在同一个微信开放平台下的不同应用当中的open-id都不一样，但是他们的unionid是一样的。

### 2. 微信授权流程
授权分为<font color=#9400D3>静默授权</font>和<font color=#9400D3>用户信息授权</font>

+ 静默授权是用户没有感知的，自动就获取了用户的open-id，不需要用户同意。
+ 用户信息授权是需要用户同意的，因为要获取用户的头像，名称等信息。

授权的流程如下：
+ <font color=#DD1144>用户同意授权，从微信获取code</font>
+ <font color=#DD1144>通过code换取网页授权access_token</font>
+ <font color=#DD1144>拉取用户信息（需scope设置为snsapi_userinfo，也就是从静默授权变为用户信息授权）</font>

详细的过程我们参考[网页授权](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)，每一步都有详细的说明，我们后面还会在开发`node`的时候详细来演示这个过程。


JSSDK调用流程：
+ <font color=#DD1144>绑定域名（前面说的业务域名，JS接口安全域名，网页授权域名）</font>
+ <font color=#DD1144>引入JS文件（调用什么功能，就要引入那个功能的js文件）</font>
+ <font color=#DD1144>通过config接口注入权限验证配置（接口签名）</font>
+ <font color=#DD1144>通过ready接口处理成功验证</font>

### 3. 用户同意授权
现在我们比如说来在`App.vue`当中来做一个授权流程，怎么做呢?

第一步就是用户同意授权，从微信获取`code`

在确保微信公众账号拥有授权作用域（scope参数）的权限的前提下（服务号获得高级接口后，默认拥有scope参数中的snsapi_base和snsapi_userinfo），引导关注者打开如下页面：[https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect](https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect)

上面这个是个模板，我们需要去将`APPID`、`REDIRECT_URI`、`SCOPE`、`STATE`换成我们需要的
+ `APPID`：真实开发直接去微信公众号后台拿，开发的时候使用测试号（我们这里是`wx1c9b84a50e29f2af`）
+ `REDIRECT_URI`：授权后的回调地址，<font color=#1E90FF>这个地址需要使用encodeURIComponent这个方法去进行一下编码才能放到这里</font>，<font color=#DD1144>还有最重要的就是前提是先要配置好公众号的那三个域名，这里的地址和配置好的域名要一致，比如配置的是m.51purse.com，那这里的地址就可以是http://m.51purse.com/#/index</font>，如果是测试号，可以在测试号的配置页面找到`网页账号`（网页授权获取用户基本信息），在这里修改一下，保持和`REDIRECT_URI`一致。
+ `SCOPE`: 值为`snsapi_base` （不弹出授权页面，直接跳转，只能获取用户openid），值为`snsapi_userinfo`（弹出授权页面，可通过openid拿到昵称、性别、所在地。并且， 即使在未关注的情况下，只要用户授权，也能获取其信息 ）

所以我们已经有了测试号`wx1c9b84a50e29f2af`,然后在测试号的下面去修改一下一个假的授权域名：

<img :src="$withBase('/weixin_zhifu_9.png')" alt="">

<img :src="$withBase('/weixin_zhifu_10.png')" alt="">

然后我们去修改一下我们之前的代码：
```javascript
<!--App.vue-->
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  mounted() {
    let APPID = "wx1c9b84a50e29f2af"
    let REDIRECT_URI = encodeURIComponent("http://m.imooc.com/#/index") // 地址也要为m.imooc.com下的
    let SCOPE = "snsapi_userinfo"
    window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APPID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&state=STATE#wechat_redirect`
  }
}
</script>

<style>
</style>
```
回到微信开发者工具，输入`localhost:8081/#/index`，执行到`App.vue`，就会跳转到授权页面，你点击同意，或者第二次及以后会自动授权，如下所示：

<img :src="$withBase('/weixin_zhifu_11.png')" alt="">

然后就调回到`http://m.imooc.com/#/index`,如果我们能在本地将`m.imooc.com`和`localhost:8081`做个绑定，然后实际的情况就是从`localhost:8081/#/index`跳到微信授权，授权完毕又跳转到`/m.imooc.com/#/index`,而`/m.imooc.com/#/index`就是`localhost:8081/#/index`。<font color=#DD1144>所以整个过程就是从index页面跳到微信授权，再调回到index页面，只有理解了这个过程，才可以在正式开发的时候不会迷惑</font>


### 4. 接口代理和域名解析
接口代理包括：
+ <font color=#1E90FF>配置主机</font>
+ <font color=#1E90FF>设置端口</font>
+ <font color=#1E90FF>拦截请求</font>

Host域名解析
+ <font color=#DD1144>修改本地host文件</font>
	+ <font color=#1E90FF>Window</font>：修改地址为`C:\Windows\System32\drivers\etc\hosts`
	+ <font color=#1E90FF>Mac</font>：`vi /etc/hosts`
+ <font color=#1E90FF>通过软件修改</font>

在此之前，我们还是把前面我们设置的`m.imooc.com`修改为`m.abcd.com`，因为前者是个真实的域名，后者是个假的，我们在本地将假的`m.abcd。com`和`localhost:8081`绑定，模拟真实的场景。

现在我们首先去修改一下host文件，按照上面的地址，我们在`hosts`文件中添加这么一句：
```javascript
127.0.0.1 m.abcd.com
```
这样的话，我们就可以将`127.0.0.1`映射到`m.abcd.com`，在本地中访问`m.abcd.com`就相当于在访问`127.0.0.1`


接着我们在H5项目当中创建`vue.config.js`文件，内容如下：
```javascript
module.exports = {
	devServer: {
		host: 'm.abcd.com', // 设置主机地址
		port: 80, // 设置默认端口
		proxy: {
			'/api': {
				// 设置目标API地址
				target: 'http://localhost:5000',
				// 如果要代理websockets
				ws:false,
				// 将主机标头的原点改为目标URL
				// changeOrigin:true表示比如我们访问/api/test,实际访问的是localhost:5000/test
				// changeOrigin:false表示比如我们访问/api/test,实际访问的是localhost:5000/api/test
				changeOrigin:false
			}
		}
	}
}
```
然后特别要注意，我们必须通过管理员打开命令行，然后启动项目，这样，项目就可以启动到`m.abcd.com:80`上了，如下图所示：
<img :src="$withBase('/weixin_zhifu_12.png')" alt="">

此时此刻，我们打开微信开发工具，然后访问`http://m.abcd.com/#/index`，就可以访问到，我们开发的首页，然后首页会跳转到微信授权，点击同意之后，就会跳转回来，并且携带上`code`信息，如下所示，拿到`code`，我们再去做别的事情。

<img :src="$withBase('/weixin_zhifu_13.png')" alt="">

虽然前面我们在前端进行了授权演示，但是授权我们还要到后端完成，所以我们会在后面书写`node`的时候去完成全流程。

## h5接入微信分享
+ <font color=#1E90FF>定义请求地址</font>
+ <font color=#1E90FF>微信授权，注入openId</font>
+ <font color=#1E90FF>获取签名信息配置config</font>
+ <font color=#1E90FF>定义分享公共信息</font>

+ <font color=#1E90FF>**① 绑定域名**</font>

先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。（备注：登录后可在“开发者中心”查看对应的接口权限。）

<font color=#1E90FF>**② 引入JS文件**</font>

可以支持引入文件的方式，也可以通过使用包管理工具去引入

<font color=#1E90FF>**③ 通过config接口注入权限验证配置**</font>

所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用，官网给出的实例如下
```javascript
wx.config({
  debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
  appId: '', // 必填，公众号的唯一标识
  timestamp: , // 必填，生成签名的时间戳
  nonceStr: '', // 必填，生成签名的随机串
  signature: '',// 必填，签名
  jsApiList: [] // 必填，需要使用的JS接口列表
});
```

<font color=#1E90FF>**④ 通过ready接口处理成功验证**</font>

```javascript
wx.ready(function(){
  // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
});
```

大概了解后我们来<font color=#1E90FF>先从前端入手接入H5的分享</font>，先定义前端要请求后端的一些接口：
```javascript
// src/api/index.js
export default {
	wechatRedirect: '/wechat/redirect?url=http%3A%2F%2Fm.abcd.com%2F%23%2Findex&scope=snsapi_userinfo', // 重定向
	wechatConfig: '/wechat/jssdk', // 获取config信息
	getUserInfo:'/wechat/getUserInfo', // 获取用户信息
	payWallet: '/wechat/pay/payWallet'//获取支付
}
```

第二步就是<font color=#DD1144>进入页面先判断是否授权过了，没有授权就重定向去后端授权，已经授权就获取配置信息，然后在前端需要使用wx.config进行注入，最后通过wx.ready去注入分享功能</font>。整个过程我们也可以参照[官网](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html)

```javascript
// App.vue
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import API from './api/index'
import wx from 'weixin-js-sdk'
import util from './util/index'
export default {
  name: 'app',
  mounted() {
    this.checkUserAuth()
  },
  methods: {
    // 判断用户是否授权
    checkUserAuth() {
      // 第一次进来的时候需要授权，后面再进来就不需要了
      let openId = this.$cookie.get('openId') // 在node当中注入一个openId，写库
      if(!openId) {
        // 如果没有获取到openId,服务端会做重定向，进行微信授权，同时获取openid
        window.location.href = API.wechatRedirect
      } else {
        // 如果有openid，直接去获取配置
        this.getWechatConfig()
      }
    },
    // 获取微信的配置信息
    getWechatConfig() {
      // 请求后端地址，后端使用我们携带的query url进行签名，然后请求微信的配置，返回给我们
      let url = API.wechatConfig + '?url=' + location.href.split('#')[0]
      this.$http.get(url)
      .then((response)=> {
        let res = response.data
        if(res.code == 0) {
          let data = res.data

          // 成功返回配置，我们使用wx.config进行注入
          wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: data.appId, // 必填，公众号的唯一标识
            timestamp: data.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.nonceStr, // 必填，生成签名的随机串
            signature: data.signature,// 必填，签名
            jsApiList: data.jsApiList // 必填，需要使用的JS接口列表
          })

          // 注入后通过ready接口处理成功验证
          wx.ready(()=> {
            util.initShareInfo()
          })
        }
      })
    }
  }
}
</script>

<style>
</style>
```
```javascript
// src/util/index.js
import wx from 'weixin-js-sdk'

export default {
	// 定义分享功能
	initShareInfo() {
		let shareInfo = {
			title: '支付和分享课程', // 分享标题
			desc: '欢迎学习', // 分享描述
			link: 'http://m.abcd.com/#/index', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: '', // 分享图标
		}
		wx.onMenuShareTimeline(shareInfo)
		wx.onMenuShareAppMessage(shareInfo)
		wx.onMenuShareQQ(shareInfo)
		wx.onMenuShareQZone(shareInfo)
		wx.updateAppMessageShareData(shareInfo) // 分享给朋友，分享给QQ
		wx.updateTimelineShareData(shareInfo) // 分享到朋友圈，分享到QQ空间
	}
}
```
到这里我们分享功能的前端部分就结束了，我们在下面来开发后端的部分。