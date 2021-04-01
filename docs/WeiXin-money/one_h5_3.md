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