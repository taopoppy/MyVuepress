# 支付功能

微信支付有小程序支付，小程序云支付，还有H5支付，其中，云支付是最简单的，不需要配置服务和运维，最复杂的就是H5需要我们自己配置很多东西。

无论是什么，微信支付涉及到的三个最重要的东西如下：
+ <font color=#DD1144>微信认证</font>
+ <font color=#DD1144>微信支付认证</font>
	+ <font color=#1E90FF>注册商户号/关联商户号</font>：在`微信支付`当中有`接入微信支付`，可以选择申请接入。如果有商户号可以关联，没有就要`注册微信支付商户号	`
	+ <font color=#1E90FF>H5-配置支付授权目录</font>:在`微信商户平台`的`开发配置`当中去设置公众号支付的`支付授权目录`，否则会提示签名错误或者授权目录不存在等错误
	+ <font color=#1E90FF>非H5-授权AppID</font>
	+ <font color=#1E90FF>设置API秘钥</font>：在商户平台的`账户设置`的`API安全`当中，选择`API秘钥`进行设置。
+ <font color=#DD1144>https证书</font>

## 支付流程
<img :src="$withBase('/weixin_zhifu_19.png')" alt="">

<font color=#1E90FF>JSAPI</font>：我们在微信里面打开浏览器，微信向浏览器注入了一个对象，叫做`JSAPI`，<font color=#1E90FF>JSSDK</font>：微信提供的软件开发工具包，辅助我们做一些支付分享的功能，相当于帮助我们做了一层封装，只需要关注核心逻辑即可

+ <font color=#DD1144>统一下单接口</font>：三者在底层都是要去调用相同的统一下单接口，因为用户对于不同的公众号或者小程序都有唯一的`openId`。
+ <font color=#DD1144>调起数据签名</font>：三者是一样的
+ <font color=#DD1144>调起支付页面协议</font>：只有小程序只能调用`HTTPS`
+ <font color=#DD1144>支付目录</font>：注册完毕商户平台后要配置支付目录和授权域名

现在公众号多半都是使用`JSSDK`，而不是`JSAPI`了，小程序自己有一套自己的`SDK`

## 支付实现
后端支付流程：
+ <font color=#1E90FF>拼接常规参数</font>
+ <font color=#1E90FF>生成签名</font>
+ <font color=#1E90FF>拼接xml数据</font>
+ <font color=#1E90FF>调用统一下单接口</font>
+ <font color=#1E90FF>获取预支付ID：prepay_id</font>
+ <font color=#1E90FF>生成支付SDK</font>
+ <font color=#1E90FF>定义回调接口，接收微信支付消息</font>

我们再将微信官网的流程图展示一下：
<img :src="$withBase('/weixin_zhifu_21.png')" alt="">

<img :src="$withBase('/weixin_zhifu_20.png')" alt="">

## 接入支付功能
