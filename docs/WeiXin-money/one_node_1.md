# 微信授权

## Express项目
在书写微信后端代码的时候，我们还是先来创建一下项目，初始化`Express`项目呢我们需要下面这几步：
```javascript
npm install express-generator@4.16.0 -g  // 创建express项目生成器
express -h // 使用该命令查看怎么使用这个框架
express imooc_pay_server // 创建项目
npm i & node bin/www || pm2 start bin/www // 使用npm i 下载依赖，使用node bin/www 去运行或者pm2去启动bin/www文件
```
具体的使用，我们都在项目当中做了注释，请直接上[github](https://github.com/taopoppy/weixin-fullstack/tree/main/imooc_pay_server)查看即可。我们的重点还是放在如何在后端解决微信授权，分享，支付的一系列问题。

## 微信用户授权
我们使用插件`memory-cache`这个插件，来代替`redis`来做一些数据缓存和存储的工作。我们首先来看看整个流程是什么样的：

<img :src="$withBase('/weixin_zhifu_14.png')" alt="">

上图中红色的部分和我们在[微信开发文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)当中的关键步骤是一样的：
+ 第一步：用户同意授权，获取code
+ 第二步：通过code换取网页授权access_token
+ 第三步：拉取用户信息(需scope为 snsapi_userinfo)
+ 附：检验授权凭证（access_token）是否有效

接着我们罗列一下关键代码，注释都很详细：
```javascript
// routes/pay/wx.js
let cache = require('memory-cache'); // 代替redis来做一些辅助性的存储

// 用户授权重定向
router.get('/redirect',function (req,res) {
  let redirectUrl = req.query.url          // 前端发来的微信授权完毕后的跳转回去的地址（前端已经加密）
  let scope = req.query.scope              // 获取用户信息的scope
  let callback = 'http://m.abcd.com/api/wechat/getOpenId'; // 微信授权完毕后暂时回调的地址
  cache.put('redirectUrl', redirectUrl);
  let authorizeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appId}&redirect_uri=${callback}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`;
  res.redirect(authorizeUrl);              // 重定向到微信授权的地址
})

// 根据code获取用户的OpenId
router.get('/getOpenId',async function(req,res){
  let code = req.query.code;                                     // 1. 微信授权后会在跳回http://m.abcd.com/api/wechat/getOpenId 的时候加上code参数
  console.log("code:"+code);
  if(!code){
    res.json(util.handleFail('当前未获取到授权code码'));
  }else{
    let result = await common.getAccessToken(code);              // 2. 通过code换取网页授权access_token
    if(result.code == 0){
      let data = result.data;
      let expire_time = 1000 * 60 * 60 * 2;                      // 设置有效时间2个小时,微信官网返回的只有两个小时有效期
      cache.put('access_token', data.access_token, expire_time); // 缓存网页授权access_token(正式开发这里不应该缓存到后端)
      cache.put('openId', data.openid, expire_time);             // 缓存用户openid(正式开发这里不应该缓存到后端)
      res.cookie('openId', data.openid, { maxAge: expire_time });// 将用户的openid放在将要返回个前端的cookie当中
      let redirectUrl = cache.get('redirectUrl');
      res.redirect(redirectUrl); // 重定向到前端
    }else{
      res.json(result); // 错误时微信会返回JSON数据包如下（示例为Code无效错误）:
    }
  }
})

// 获取用户信息
router.get('/getUserInfo',async function(req,res){
  // 正式开发这里的access_token和openId应该从前端的cookie当中拿
  let access_token = cache.get('access_token'), openId = cache.get('openId');
  let result = await common.getUserInfo(access_token, openId);
  res.json(result);
})
module.exports = router;
```
```javascript
// routes/commen/index.js
let request = require('request');
let config = require('./../pay/config');
let util = require('./../../util/util')
config = config.wx;

// 获取网页授权access_token
exports.getAccessToken = function(code){
  let token_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appId}&secret=${config.appSecret}&code=${code}&grant_type=authorization_code`;
  return new Promise((resolve, reject) => {
    request.get(token_url, function (err, response, body) {
      let result = util.handleResponse(err, response, body);
      resolve(result);
    })
  });
}

// 获取用户信息
exports.getUserInfo = function (access_token,openId){
  let userinfo = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openId}&lang=zh_CN`;
  return new Promise((resolve,reject)=>{
    request.get(userinfo, function (err, response, body) {
      let result = util.handleResponse(err, response, body);
      resolve(result);
    })
  })
}
```
```html
<!--src/pages/index.vue-->
<template>
	<div class="index">
		<img src="../assets/img/header.png" class="header" alt="">
		<div class="nickname" v-if="userInfo" v-text="userInfo.nickname"></div>
		<div class="btn-group">
			<button class="btn">分享</button>
			<button class="btn btn-primary">充值</button>
			<button class="btn">活动详情</button>
		</div>
	</div>
</template>

<script>
import API from '../api/index'
export default {
  name: 'index',
	data() {
		return {
			userInfo: ''
		}
	},
	mounted() {
		if(this.$cookie.get('openId')){
			// 如果已经授权完成，我们就去获取获取用户信息
			this.getUserInfo()
		}
	},
	methods: {
		getUserInfo() {
			this.$http.get(API.getUserInfo).then((response) => {
				let res = response.data
				// eslint-disable-next-line no-console
				console.log('res'+ JSON.stringify(res))
				this.userInfo = res.data
			})
		}
	}
}
</script>
```
最后，我们语言描述一下，详细的代码可以在[github](https://github.com/taopoppy/weixin-fullstack)上看到：

+ 前端进入`http://m.abcd.com/#/index/`后就进入到`App.vue`当中去，在`mounted`当中会去检查当前`cookie`中是否包含`openid`，没有说明没有授权，重定向到`/api/wechat/redirect`，但是这个地址是`api`打头的，会代理到后端`localhost:3000/api/wechat/redirect`

+ 在后端`/redirect`处理器当中，我们保存一下最终跳回的地址`http://m.abcd.com/#/index`,先去请求微信授权地址，把自己的`/getOpenId`地址作为临时跳转地址传给微信服务器，微信服务器接收授权，并且跳转回后端的`/getOpenId`，并且携带`code`

+ 在后端`getOpenId`处理器当中，我们拿到`code`，就去请求微信服务器，拿到`openId`和`access_token`，然后把`openId`和`access_token`保存在`cookie`当中，一并重定向到最终跳回的地址`http://m.abcd.com/#/index`

+ 在前端拿到`cookie`的情况下，就会去重新请求后端去拿用户信息，同时传递参数`openId`和`access_token`，获取用户信息需要这两个参数，后端拿到两个参数就去请求微信服务器，微信服务器返回用户信息给后端，后端再返回给前端

## JS-SDK签名算法
值得注意的是，获取用户信息这个步骤是附加的，对于微信分享和支付，不是硬性的要求，<font color=#1E90FF>因为微信分享和支付只需要openid即可</font>。

下面我们说一下什么是签名算法：<font color=#DD1144>签名算法就是通过算法去计算一堆参数最后获取的一个签名，开发微信公众号，微信提供了很多能力，但是不允许你随意使用，你必须有安全的通行证</font>

所以实现`JS-SDK签名算法`的目的就是使用微信分享、扫一扫、卡券、支付等微信特有的能力，关于`JSSDK`的使用步骤，我们前面也已经讲过了
+ 步骤一：绑定域名
+ 步骤二：引入JS文件
+ 步骤三：通过config接口注入权限验证配置
+ 步骤四：通过ready接口处理成功验证

那我们的`JSSDK`签名算法就是要在步骤三当中完成，我们边参照[附录1-JS-SDK使用权限签名算法](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62)边来开发，实际上总体来说有三个步骤：
+ <font color=#1E90FF>获取普通的access_token</font>：文档地址：[获取access_token](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)
+ <font color=#1E90FF>根据access_token获取jsapi_ticket</font>:文档地址：[附录1-JS-SDK使用权限签名算法](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62)
+ <font color=#1E90FF>执行签名算法</font>：文档地址：[附录1-JS-SDK使用权限签名算法](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62)

按照这三步，我们先去获取普通的`access_token`，一定要记住，这里是普通的`access_token`，我们之前在网页授权那里拿到的是网页授权的`access_token`
```javascript
// routes/common/index.js
// 获取基础接口的Token
// （有效期7200秒，开发者必须在自己的服务全局缓存access_token）
// 所以我们应该第一次获取的时候将access_token保存在redis当中2小时，取得时候直接从redis当中取，然后redis当中取不到，说明过期了，重新请求微信服务器，重新再保存到redis当中两个小时
exports.getToken = function(){
  let token = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`;
  return new Promise((resolve, reject)=>{
    request.get(token, function (err, response, body) {
      let result = util.handleResponse(err, response, body);
      resolve(result);
    })
  })
}
```
然后再根据`access_token`去获取`jsap_ticket`：
```javascript
// routes/common/index.js
// 根据Token获取Ticket
// 频繁刷新jsapi_ticket会导致api调用受限，影响自身业务，开发者必须在自己的服务全局缓存jsapi_ticket
// 建议也是两个小时，和access_token一样，因为jsapi_ticket由access_token决定
exports.getTicket = function (token) {
  let tokenUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`;
  return new Promise((resolve, reject) => {
    request.get(tokenUrl, function (err, response, body) {
      let result = util.handleResponse(err, response, body);
      resolve(result);
    })
  })
}
```

最后我们去实现签名：
```javascript
// 获取jssdk签名
router.get('/jssdk',async function(req,res){
  let url = req.query.url;
  let result = await common.getToken(); // 1. 获取普通的access_token
  if (result.code == 0){
    let token = result.data.access_token;
    cache.put('token', token);
    let result2 = await common.getTicket(token); // 2. 根据access_token去获取jsapi_ticket
    if (result2.code == 0){
      let data = result2.data;
      let params = {
        noncestr:util.createNonceStr(),   // 随机字符串（开发者自己定义）
        jsapi_ticket: data.ticket,        // jsapi_ticket
        timestamp:util.createTimeStamp(), // 时间戳（开发者自己定义）
        url                               // url（当前网页的URL，不包含#及其后面部分）
      }
      let str = util.raw(params);         // ASCII 码从小到大排序
      console.log('str:::' + JSON.stringify(params))
      let sign = createHash('sha1').update(str).digest('hex'); // 3. sha1方法加密，最终生成签名
      res.json(util.handleSuc({
        appId: config.appId,              // 必填，公众号的唯一标识
        timestamp: params.timestamp,      // 必填，生成签名的时间戳
        nonceStr: params.noncestr,        // 必填，生成签名的随机串
        signature: sign,                  // 必填，签名
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'onMenuShareQZone',
          'chooseWXPay'
        ] // 必填，需要使用的JS接口列表，这个是要根据自己的需求，比如我们要使用分享和支付功能，就去JS-SDK说明文档中找这个接口名称即可
      }))
    }
  }
})
```
我们这里对`access_token`和`jsap_ticket`的存取都是一次性的，正式开发的时候应该进行缓存，也就是获取到放在`redis`当中，取的时候也从`redis`中取，如果取不到，说明`redis`当中的值已经过期，应该重新去微信服务器获取，获取后继续放在`redis`当中，过期时间依旧为两个小时。

```javascript
/**
 * 公共函数定义
 */
let createHash = require('create-hash');
module.exports = {
  // 生成随机数（分享）
  createNonceStr(){
    // toString(36)转化成为36进制的，substr(2,15)截取2-15位
    return Math.random().toString(36).substr(2,15);
  },
  // 生成时间戳（分享）
  createTimeStamp(){
    // getTime()/1000转换成秒
    return parseInt(new Date().getTime() / 1000) + ''
  },
  // Object 转换成json并排序（分享）
  // {c:3, b:2, d:4, a:1} => 'a=1&b=2&c=3&d=4'
  raw(args){
    let keys = Object.keys(args).sort();
    let obj = {};
    keys.forEach((key)=>{
      obj[key] = args[key];
    })
    // {a:1,b:2} =>  &a=1&b=2
    // 将对象转换为&分割的参数
    let val = '';
    for(let k in obj){
      val += '&' + k + '=' +obj[k];
    }
    return val.substr(1);
  }
}
```

最后我们来强调几个点：

因为分享功能和支付功能，都需要我们配置正确的`JS接口安全域名`，所以我们需要将其修改正确：

<img :src="$withBase('/weixin_zhifu_15.png')" alt="">

接着，如果我们怀疑自己签名签出来不正确，我们可以到[微信JS接口签名检验工具](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=jsapisign)去验证一下，看看结果是否一致，如果不一致，说明自己的加密方法写的有问题。

最后JS接口列表里的接口名称要和你所在前端使用的`weixin-js-sdk`要保持一致，因为版本的问题，所以有的废弃的接口在新的`weixin-js-sdk`是没有的，新的接口也可能在旧的`weixin-js-sdk`当中没有，所以要保证两者都是最新。