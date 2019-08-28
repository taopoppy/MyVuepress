# 云函数
<font color=#3eaf7c>云函数就运行在云端的代码，相当于小程序后台服务的代码</font>，我们不需要去管理服务器，只需要在小程序当中编写代码，然后一键上传和部署就能运行代码。云函数的运行时需要`node`环境的，我们只需要安装`node`即可。

我们将在下面去写几个例子，我们就能知道怎么创建和调用云函数

## 求和函数sum()
### 1. 创建云函数
首先我们要创建云函数，在项目中有个`cloudfunctions`的文件夹，我们创建云函数之前要去指定一下环境，然后我们点击右键-> <font color=#3eaf7c>创建node.js云函数</font>，在创建的过程中，这个云函数也会同时上传到云服务，我们可以在云开发控制台的云函数中刷新，就能看到我们刚才创建的云函数`sum`

如果在此期间或者调用云函数的期间遇到了`wx-server-sdk`的问题，我们就去下载即可，右键点击`cloudfunctions`-> 在终端打开，然后输入下面的命令来安装服务的sdk包：
```bash
npm install --save wx-server-sdk@latest
```

当我们创建了云函数，下面会有两个文件：
+ <font color=#3eaf7c>index.js</font>：入口文件
+ <font color=#3eaf7c>package.json</font>：包含了云函数所需要的模块和云函数的配置信息

然后我们在`index.js`当中编写最简单的求和函数：
```javascript
exports.main = async (event, context) => {
  // event：表示小程序端传来的参数
  // context：表示上下文，包含当前用户的信息
  return {
    sum: event.a + event.b
  }
}
```
特别要注意: <font color=#3eaf7c>每次云函数有发生改动，必须手动的去上传和部署云函数</font>，方式就是右键点击当前云函数，选择上传并部署，但是有两个选项我们解释一下区别：
+ <font color=#3eaf7c>上传并部署：云端安装依赖（不上传node_modules）</font>: 会在云函数端安装对应依赖的包
+ <font color=#3eaf7c>上传并部署：所有文件</font>: 将本地的依赖包也上传到云端
一般我们点击第一个就可以了。

### 2. 调用云函数
我们在小程序端调用云函数，是这样的：通过`wx.cloud.callFunction`去调用云函数，然后传递相应的配置
```javascript
  /**
   * 调用云函数sum
   */
  sum: function () {
    wx.cloud.callFunction({
      name: 'sum',  // 云函数的名称
      data: {       // 云函数所需要的参数
        a:2,
        b:3
      }
    }).then(res => {
      console.log(res)
    }).catch(err =>{
      console.log(err)
    })
  },
```
调用完成我们可以去云控制台上查看调用的日志，同时我们还可以通过直接使用云控制台上的<font color=#3eaf7c>云端测试</font>直接去测试云函数，直接输入对应的参数即可运行测试。<font color=#3eaf7c>利用云端测试我们可以在调用之前去检查云函数的正确性</font>

## 获取当前用户的openid
### 1. 传统VS云开发
我们在使用云函数获取用户`openid`之前先来说一下传统微信登录和云开发登录的区别：

**1.传统微信登录**（比较麻烦复杂）

<img :src="$withBase('/weixin_chuantonglogin.png')" alt="微信传统登录">

+ 调用`wx.login`获取`code`（用户小程序-微信服务器）
+ 调用`wx.request`将`code`传递给后端服务器（用户小程序-后端服务器）
+ 后台服务器使用`code`换取`openid`和`session_key`（后端服务器-微信服务器）
+ 后台服务器将用户标识发送给小程序本地存储（后端服务器-用户小程序）

**2.云开发登录**（流程简单）

<img :src="$withBase('/weixin_cloudlogin.png')" alt="微信传统登录">

+ 用户点击获取用户信息（用户-用户小程序）
+ 小程序从云函数中获取用户信息（用户小程序-云函数）
+ 云函数返回用户信息（云函数-用户小程序）
+ 小程序将用户信息存储到云数据库（用户小程序-云数据库）

### 2. 获取用户信息
实际上在我们项目当中的`cloudfuncitons`当中有个`login`这样的云函数，是专门用来获取用户信息的，所以我们要做的就是两步：
+ 将已有的`login`云函数上传部署（<font color=#3eaf7c>切记要先进行这一步</font>）
+ 在自己的代码中使用云函数`login`

下面我们给出实例代码：
```javascript
  /**
   * 获取用户openid
   */
  getOpenid: function () {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      console.log(res)
      this.setData({
        userOpenid: res.result.openid
      })
    }).catch(err => {
      console.log(err)
    })
  },
```

## 批量删除云数据库的数据
之前我们说过删除一条数据其实在小程序中直接调用数据库操作即可，但是批量删除数据必须要通过云函数的方式，也就是说步骤如下：
<font color=#3eaf7c>小程序</font> -> <font color=#3eaf7c>云函数</font> -> <font color=#3eaf7c>云数据库</font>
### 1. 创建云函数
所以我们首先在`cloudfuncitons`当中创建一个`batcaDelete`的云函数，书写响应的代码：
```javascript
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database() // 云数据库

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('user').where({
      name: 'jerry'
    }).remove()
  }catch(e) {
    console.log(e)
  }
}
```
### 2. 调用云函数
特别要注意，<font color=#3eaf7c>数据库的操作是异步的</font>，所以不知道什么时候它自己能删除完毕，所以我们使用的`async`和`await`的写法，并使用`try catch`的方式捕获数据库执行错误，然后在小程序端就能直接调用云函数来批量的删除数据了，小程序的代码如下：
```javascript
  /**
   * 调用云函数batchDelete批量删除jerry
   */
  batchDelete: function () {
    wx.cloud.callFunction({
      name:'batchDelete'
    }).then(res=> {
      console.log(res)
    }).catch(err => {
      console.error(err)
    })
  },
```
当然了在执行之前，我们一定要记住一个必要的步骤：<font color=#3eaf7c>修改或者刚写的云函数要上传和部署</font>