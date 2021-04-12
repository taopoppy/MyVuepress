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

```javascript
// routes/pay/mp.js
let express = require('express');
let router = express.Router(); // 路由
let request = require('request');
let config = require('./config');
let util = require('./../../util/util')
let dao = require('./../common/db')
let wxpay = require('./../common/wxpay')

config = Object.assign({}, config.mp);

// 支付回调通知（小程序）
router.get('/pay/callback',function(req,res){
  res.json(util.handleSuc());
})

// 小程序支付（小程序）
router.get('/pay/payWallet',function(req,res){
  // 开始定义公共参数
  let openId = req.query.openId;                      // 用户的openid
  let appId = config.appId;                           // 应用的ID
  let attach = "小程序支付体验";                      // 附加数据
  let body = "taopopy商品支付";                       // 支付主体内容
  let total_fee = req.query.money;                    // 支付总金额，单位是分
  let notify_url = "http://localhost:3000/api/mp/pay/callback" // 支付成功的通知地址，开发可以写localhost，但是上线必须是正式域名地址
  let ip = "61.133.217.141";                           // 请求微信服务器的ip，终端使用curl ipinfo.io可以查看
  wxpay.order(appId,attach,body,openId,total_fee,notify_url,ip).then((result)=>{
    res.json(util.handleSuc(result));
  }).catch((result)=>{
    res.json(util.handleFail(result.toString()))
  });
})
module.exports = router;
```
```javascript
// routes/common/wxpay.js
/**
 * 微信小程序、H5通用支付封装
 */
let config = require('./../pay/config')
let request = require('request')
let util = require('../../util/util')
let createHash = require('create-hash')
let xml = require('xml2js')
config = config.mch; // 商户的信息

module.exports = {
  // 统一下单接口
  order: function (appid,attach, body, openid, total_fee, notify_url, ip){
    return new Promise((resolve,reject)=>{
      let nonce_str = util.createNonceStr(); // 生成随机字符串
      let out_trade_no = util.getTradeId('mp'); // 生成商户订单号
      // 支付前需要先获取支付签名
      let sign = this.getPrePaySign(appid, attach, body, openid, total_fee, notify_url, ip, nonce_str, out_trade_no);
      // 通过参数和签名组装xml数据，用以调用统一下单接口
      let sendData = this.wxSendData(appid, attach, body, openid, total_fee, notify_url, ip, nonce_str, out_trade_no, sign);
      let self = this;
      let url = 'https://api.mch.weixin.qq.com/pay/unifiedorder'; // 微信统一下单地址
      request({
        url,
        method: 'POST',
        body: sendData
      }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
          // 返回的reponse.body是xml的格式，所以要解析
          xml.parseString(body.toString('utf-8'),(error,res)=>{
            if(!error){
              let data = res.xml;
              console.log('data:' + JSON.stringify(data));
              if (data.return_code[0] == 'SUCCESS' && data.result_code[0] == 'SUCCESS'){
                // 获取预支付的ID
                let prepay_id = data.prepay_id || [];
                // 组装要返回给小程序的支付参数
                let payResult = self.getPayParams(appid, prepay_id[0]);
                resolve(payResult);
              }
            }
          })
        } else {
          resolve(util.handleFail(err));
        }
      })
    })
  },
  // 生成预支付的签名
  getPrePaySign: function (appid, attach, body, openid, total_fee, notify_url, ip, nonce_str, out_trade_no) {
    let params = {
      appid,
      attach,
      body,
      mch_id: config.mch_id,
      nonce_str,
      notify_url,
      openid,
      out_trade_no,
      spbill_create_ip: ip,
      total_fee,
      trade_type: 'JSAPI'
    }
    let string = util.raw(params) + '&key=' + config.key; // 按照官网要求要拼接商户key(也叫作商户秘钥)
    let sign = createHash('md5').update(string).digest('hex');
    return sign.toUpperCase();
  },

  // 签名成功后 ，根据参数拼接组装XML格式的数据，调用下单接口
  wxSendData: function (
    appid,        // appid
    attach,       // 附加数据
    body,         // 商品描述
    openid,       // 用户标识
    total_fee,    // 标价金额
    notify_url,   // 通知地址
    ip,           // 微信支付API的机器IP
    nonce_str,    // 随机字符串
    out_trade_no, // 商户订单号（自己服务器生成的要保存在自己数据库的订单号）
    sign          // 预支付的签名 =》 getPrePaySign获得
  ) {
    let data = '<xml>' +
      '<appid><![CDATA[' + appid + ']]></appid>' +
      '<attach><![CDATA[' + attach + ']]></attach>' +
      '<body><![CDATA[' + body + ']]></body>' +
      '<mch_id><![CDATA[' + config.mch_id + ']]></mch_id>' +
      '<nonce_str><![CDATA[' + nonce_str + ']]></nonce_str>' +
      '<notify_url><![CDATA[' + notify_url + ']]></notify_url>' +
      '<openid><![CDATA[' + openid + ']]></openid>' +
      '<out_trade_no><![CDATA[' + out_trade_no + ']]></out_trade_no>' +
      '<spbill_create_ip><![CDATA[' + ip + ']]></spbill_create_ip>' +
      '<total_fee><![CDATA[' + total_fee + ']]></total_fee>' +
      '<trade_type><![CDATA[JSAPI]]></trade_type>' +
      '<sign><![CDATA['+sign+']]></sign>' +
    '</xml>'
    return data;
  },

  // 解析统一下单返回的结果，返回给小程序5个参数，参照https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=7_7&index=5
  getPayParams:function(appId,prepay_id){
    let params = {
      appId,                              // appid
      timeStamp:util.createTimeStamp(),   // 时间戳
      nonceStr:util.createNonceStr(),     // 随机字符串
      package: 'prepay_id=' + prepay_id,  // 数据包
      signType:'MD5'                      // 签名方式
    }
    let paySign = util.getSign(params,config.key);
    params.paySign = paySign; // paySign实际上是对其他所有参数的签名
    return params;  // 返回给小程序，小程序拿这个信息去直接请求微信服务器
  }
}
```

## 接入支付功能
然后我们来看一下前端的接入，前端小程序的接入非常简单，只用使用`wx.requestPayment`调用即可
```html
<!--pages/pay/index.wxml-->
<view>
  <input type="number" bindinput="bindKeyInput" placeholder="请输入支付金额"/>
  <text>您输入的金额为{{inputValue/100}}元</text>
  <button bindtap="pay" type="primary">支付</button>
</view>
```
```javascript
// pages/pay/index.js
const app = getApp()
let Api = app.Api
let store = require('../../utils/store.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: 0
  },
  bindKeyInput:function(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  pay: function() {
    if(this.data.inputValue === 0) {
      wx.showToast({
        title: '请输入正确的金额',
        icon: 'none'
      })
      return
    }
    // 请求Node端，Node端请求微信服务器的统一下单接口
    app.get(Api.payWallet, {
      money: this.data.inputValue,
      openId: store.getItem("openId")
    }).then((res)=> {
      console.log("预支付信息",res)
        wx.requestPayment(
          {
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': 'MD5',
            'paySign': res.paySign,
            'success':function(res){
              console.log("支付成功",res)
              if(res.errMsg === 'requestPayment:ok'){
                wx.showToast({
                  title: '支付成功',
                  icon:'success'
                })
              }
            },
            'fail':function(res){
              console.log("支付失败",res)
              if(res.errMsg === 'requestPayment:fail cancel'){
                wx.showToast({
                  title: '支付失败',
                  icon:'none'
                })
              }
            },
            'complete':function(res){
              console.log("支付完成") // 接口调用结束的回调函数（调用成功、失败都会执行）
              this.setData({
                inputValue: 0
              })
            }
          })
    })
  }
})
```

结合我们前面我们来简单的分析一下整个过程
+ <font color=#1E90FF>用户在点击支付的按钮后，先去请求Node服务端的localhost:3000/api/mp/pay/payWallet接口</font>
+ <font color=#1E90FF>Node服务端去请求微信服务器的统一下单接口，微信服务器会返回给Node服务端一个xml数据，解析后包含一个预支付信息prepay_id</font>
+ <font color=#1E90FF>Node端对prepay_id和其他参数再做签名sign处理，将包括package和sign在内的6个参数全部返回给小程序</font>
+ <font color=#1E90FF>小程序拿到6个参数，使用wx.requestPayment去直接请求微信服务器去支付</font>
+ <font color=#1E90FF>支付成功后，微信服务器会回调一个Node服务端的接口，告知支付成功信息</font>

<img :src="$withBase('/weixin_zhifu_22.png')" alt="">