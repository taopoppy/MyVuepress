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

另外要说几个点，打开微信开发公众号后台
+ <font color=#1E90FF>基本配置</font>
	这里有公众号开发信息，比如<font color=#1E90FF>开发者ID</font>、<font color=#1E90FF>开发者密码</font>、<font color=#DD1144>IP白名单</font>(服务号中使用支付功能的时候会用到)

+ <font color=#1E90FF>公众号设置 > 功能设置</font>
	+ <font color=#1E90FF>业务域名</font>：
	+ <font color=#1E90FF>js接口安全域名</font>：分享和支付的时候必须使用的域名
	+ <font color=#1E90FF>网页授权域名</font>：网页用户头像授权，授权成功会有回调，回调的就是这个域名

## 微信授权流程讲解