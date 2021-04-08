# 后端存储

## Mongodb下载
首先到[官网](https://www.mongodb.com/try/download/community)下载，比如我是`windows`，我们下载`msi`文件，下载程序傻瓜式安装即可
<img :src="$withBase('/weixin_zhifu_16.png')" alt="">

安装的过程我们可以参照下面两篇文章：
+ [菜鸟教程（稍微有点旧）](https://www.runoob.com/mongodb/mongodb-window-install.html)
+ [如何在Windows上下载和安装MongoDB（有点新）](https://mongoing.com/archives/docs/mongodb%E5%88%9D%E5%AD%A6%E8%80%85%E6%95%99%E7%A8%8B/%E5%A6%82%E4%BD%95%E5%9C%A8windows%E4%B8%8A%E4%B8%8B%E8%BD%BD%E5%92%8C%E5%AE%89%E8%A3%85mongodb)

最好是按照后面一篇，这样`mongodb`就会变成`Window`上的一个服务存在。

## Node连接Mongodb
我们这里是使用`Node`原生操作了`mongodb`，当然你还可以使用`mongoose`去`ORM`式的去操作数据库`mongodb`:
```javascript
// routes/common/db.js
let MongoClient = require('mongodb').MongoClient;
let util = require('./../../util/util')
let url = "mongodb://127.0.0.1:27017/imooc_pay"

// 查询数据
exports.query = function (data,table) {
  return new Promise((resolve,reject)=>{
    connect(function(dbase,db){
      dbase.collection(table).find(data).toArray(function(err,res){
        if(err){
          throw err;
        }else{
          db.close();
          resolve(util.handleSuc(res))
        }
      })
    })
  })
}

// 插入数据
exports.insert = function (data, table) {
  return new Promise((resolve, reject) => {
    connect(function (dbase, db) {
      dbase.collection(table).insertOne(data,function (err, res) {
        if (err) {
          throw err;
        } else {
          db.close();
          resolve(util.handleSuc(res))
        }
      })
    })
  })
}

// 数据库连接
function connect(callbck){
  MongoClient.connect(url,function (err,db) {
    if(err) throw err;
    let dbase = db.db('imooc_pay');
    // dbase用来操作集合，db用来操作数据库
    callbck(dbase,db);
  })
}
```
所以这个时候我们去`MongoDB Campass`下面创建一个`imooc_pay`的数据库，然后创建一个`users`的`collection`,新增加一条数据，然后我们在代码中书写一个测试接口：
```javascript
var express = require('express');
var router = express.Router();
var dao = require('./common/db')

// 测试接口
router.get('/query',async function (req,res,next) {
  let data = await dao.query({id:1},'users');
  res.json(data);
})

module.exports = router;
```
然后去浏览器访问`localhost:3000/query`就能看到我们从数据库当中查出来的一条数据了。

## 存储用户信息
存储用户信息这一步应该在微信返回`openid`和网页授权`access_token`的时候我们就去请求用户信息，如下代码所示：
```javascript
// routes/pay/wx.js
router.get('/getOpenId',async function(req,res){
  let code = req.query.code;
  console.log("code:"+code);
  if(!code){
    res.json(util.handleFail('当前未获取到授权code码'));
  }else{
    let result = await common.getAccessToken(code);access_token
    if(result.code == 0){
      let data = result.data;
      let expire_time = 1000 * 60 * 60 * 2;
      cache.put('access_token', data.access_token, expire_time);
      cache.put('openId', data.openid, expire_time);
      res.cookie('openId', data.openid, { maxAge: expire_time });

      // 下面全部是将用户信息写入数据库的操作
      let openId = data.openid;
      let userRes = await dao.query({ 'openid': openId },'users');
      if (userRes.code == 0){
        // 查到用户
        if (userRes.data.length>0){
          let redirectUrl = cache.get('redirectUrl');
          res.redirect(redirectUrl);                            // 最终要跳转到前端的那个页面
        }else{
          // 没有查到用户，说明是新用户，就要往数据库里存储一下
          let userData = await common.getUserInfo(data.access_token, openId); // 3. 拉取用户信息(需scope为 snsapi_userinfo)
          let insertData = await dao.insert(userData.data,'users');
          if (insertData.code == 0){
            let redirectUrl = cache.get('redirectUrl');
            res.redirect(redirectUrl);                          // 最终要跳转到前端的那个页面
          }else{
            res.json(insertData);
          }
        }
      }else{
        res.json(userRes);
      }
    }else{
      res.json(result); // 错误时微信会返回JSON数据包如下（示例为Code无效错误）:
    }
  }
})
```

我们看一下用户存储信息的流程，如下图蓝色粗线所示，所以这种方式很隐晦，因为用户的`openid`是固定的，以后我们只要知道一个用户的`openid`，就可以知道他的所有信息。

<img :src="$withBase('/weixin_zhifu_17.png')" alt="">