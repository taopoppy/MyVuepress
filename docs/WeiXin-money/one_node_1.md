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
我们使用插件`memory-cache`这个插件，来代替`redis`来做一些数据缓存和存储的工作。