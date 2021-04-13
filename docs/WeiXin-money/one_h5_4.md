# H5支付功能

## 支付资源准备
我们首先来看看支付条件:
+ <font color=#1E90FF>H5支付后台可以是http/https，需要配置支付授权目录</font>
+ <font color=#1E90FF>小程序所有的接口都必须是https,无需配置授权目录</font>
+ <font color=#1E90FF>小程序云开发只有云函数，无需配置授权目录</font>

然后我们再来看看支付准备
+ <font color=#1E90FF>域名</font>、<font color=#1E90FF>服务器</font>、<font color=#1E90FF>证书准备</font>
+ <font color=#1E90FF>微信认证</font>、<font color=#1E90FF>企业/个人主体认证</font>
+ <font color=#1E90FF>支付认证</font>、<font color=#1E90FF>开通商户平台</font>
+ <font color=#1E90FF>公众号</font>、<font color=#1E90FF>小程序</font>、<font color=#1E90FF>小程序云绑定商户号</font>

公众号支付必须有两个认证，<font color=#9400D3>微信认证</font>和<font color=#9400D3>微信支付认证</font>，两个认证可以参考下面的网址：
+ [微信认证申请流程（企业类型）](https://www.imooc.com/article/281154)
+ [微信公众号申请开通微信支付](https://www.imooc.com/article/280958)

接下来，我们先说<font color=#9400D3>微信商户平台</font>、<font color=#9400D3>微信小程序</font>以及<font color=#9400D3>微信公众号</font>三者本质是没有关系的，但是涉及到支付就有关系了，我们需要进入到微信商户平台，然后在<font color=#DD1144>开发配置</font>当中去设置支付目录，在<font color=#DD1144>APPID授权管理</font>当中去给需要支付功能的小程序和公众号授权。

## 完善配置
到这里我们之前开发的微信公众号都使用的测试号，但是支付这里，我们就没有办法使用测试号了，你要自己整就必须有一个真实的开通了微信认证和微信支付认证的公众号，还要做几个事情
+ 将真实的公众号的`appId`和`appSecret`配置到项目当中，另外还必须有真实的域名，而且域名和服务器ip已经绑定好，不能再是`m.abcd.com`。前后端的`m.abcd.com`都要换成真的域名。
+ 在微信公众号当中配置好那几个`业务域名`、`JS接口安全域名`、`网页授权域名`
+ <font color=#DD1144>微信白名单设置</font>：在微信公众号当中找到`基本配置`,然后找到`IP白名单`，这个是用来通过开发者ID和密码调用获取`access_token`接口时，需要将设置访问来源IP设置为白名单，说白了就是将我们`Node`后台服务器的`IP`，`IP`一般是不一定的，你在家在公司，项目上线`IP`都不一样，所以只要`IP`有变就要进行添加。

如何知道自己的`IP`呢，在我们的代码中是可以找到的：
```javascript
// routes/pay/wx.js
// 获取jssdk签名
router.get('/jssdk',async function(req,res){
  let url = req.query.url;
  let result = await common.getToken(); // 1. 获取普通的access_token
  if (result.code == 0){
   ...
  } else {
    // 没有拿到access_token，多半是因为没有设置IP白名单
    // 这里result当中包含了无效的ip地址,会有提示result {"code":"40164",data:"",message:"invalid ip xxx.xxx.xxx.xxx,not in whitelist"}
    res.json(result)
  }
})
```
如上所示，你就应该要把`xxx.xxx.xxx.xxx`添加进微信公众号里的白名单了

## 前端实现
首先要说明的就是，微信公众号没有办法像小程序或者小程序云在本地进行支付测试，它必须要部署到线上去测试，所以这一点我们要记住。我们直接来看前端的代码即可:
```vue
<template>
	<div>
		<h4>支付页面</h4>
		<input type="number" v-model="money"/>
		<span style="font-size:20px">{{money/100}}元</span>
		<button v-on:click="pay">支付</button>
	</div>
</template>

<script>
import API from '../api/index.js'
import wx from 'weixin-js-sdk'
export default {
  name: 'pay',
	data() {
		return {
			money: 0
		}
	},
	methods: {
		pay() {
			// H5支付
			if(this.money === 0 || this.money === undefined || this.money ===null) {
				alert("请输入正确得金额")
			}
			this.$http.get(API.payWallet, {
				params: {
					money: this.money
				}
			}).then((response)=> {
				let result = response.data
				if(result && result.code === 0) {
					// 请求成功就支付
					// 通过微信得JS-AP拉起微信支付
					let res = result.data
					wx.chooseWXPay({
						timestamp: res.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
						nonceStr: res.nonceStr, // 支付签名随机串，不长于 32 位
						package: res.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
						signType: res.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
						paySign: res.paySign, // 支付签名
						success: function (res) {
							// 支付成功后的回调函数，支付成功和取消都算成功
							if(res.errMsg === 'chooseWXPay:ok') {
								// 用户端的支付成功，真正成功的表现时微信服务器去调用我们Node的回调地址
								alert('支付成功')
							} else if(res.errMsg === 'chooseWXPay:fail'){
								alert('支付取消')
							}
						},
						cancel: function() {
							alert("支付取消")
						},
						fail: function(res) {
							// 正儿八经得请求支付失败了
							alert("支付失败", res.errMsg)
						}
					});
				} else {
					alert(result.message)
				}
			})
		}
	}
}
</script>

<style scoped>

</style>
```

## 后端实现
```javascript
// routes/pay/wx.js
// 微信支付（H5）
router.get('/pay/payWallet', function (req, res) {
  let openId = req.cookies.openId; // 拿到前端h5得cookie中得openId
  let appId = config.appId;
  // 商品简单描述
  let body = "H5请求支付taopoppy";
  // 如果是post请求，则用req.body获取参数
  let total_fee = req.query.money;
  // 微信支付成功回调地址，用于保存用户支付订单信息
  let notify_url = "http://m.abcd.com/api/wechat/pay/callback";
  // 通过微信支付认证的商户ID
  let mch_id = config.mch_id;
  // 附加数据
  let attach = "微信支付课程体验";
  // 调用微信支付API的机器IP
  let ip = '61.133.217.141';
  // 封装好的微信下单接口，统一下单接口
  wxpay.order(appId, attach, body, mch_id, openId, total_fee, notify_url, ip).then(function (result) {
    res.json(util.handleSuc(result));
  }).catch((result) => {
    res.json(util.handleFail(result));
  })
})


/**
 * 此接口主要用于支付成功后的回掉，用于统计数据
 * 此处需要再app.js中设置请求头的接收数据格式
 */
router.post('/pay/callback', function (req, res) {
  xml.parseString(req.rawBody.toString('utf-8'), async (error, xmlData) => {
    if (error) {
      logger.error(error);
      res.send('fail')
      return;
    }
    let data = xmlData.xml;
    // data当中有很多信息，从中挑除自己要存到数据库里的即可
    // data当中有哪些数据，参照https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_7&index=8
    let order = {
      openId: data.openid[0],                // 用户标识
      totalFee: data.total_fee[0],           // 订单金额
      isSubscribe: data.is_subscribe[0],     // 是否关注公众账号
      orderId: data.out_trade_no[0],         // 商户订单号
      transactionId: data.transaction_id[0], // 微信支付订单号
      tradeType: data.trade_type[0],         // 交易类型
      timeEnd: data.time_end[0]              // 支付完成时间
    }
    // 插入订单数据
    let result = await dao.insert(order, 'orders');
    if (result.code == 0) {
      // 向微信发送成功数据
      let data = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
      res.send(data);
    } else {
      res.send('FAIl');
    }
  });
})
```

你会发现整个过程和微信小程序支付几乎是一样的过程，如下所示
<img :src="$withBase('/weixin_zhifu_23.png')" alt="">
