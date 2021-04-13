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


