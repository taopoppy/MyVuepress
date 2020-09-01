# 小程序云开发

## 小程序云开发介绍 
小程序云开发是腾讯云和微信团队深度合作推出的小程序的解决方案，提供<font color=#3eaf7c>云函数</font>、<font color=#3eaf7c>云数据库</font>、 <font color=#3eaf7c>云存储</font>三大技术能力，有个这些东西我们服务端的部署和运维进行托管给腾讯云管理，不需要在运维和管理上花费很多精力

### 1. 传统开发和小程序开发
传统开发我们要有这么几样东西：
<img :src="$withBase('/weixin_chuantong.png')" alt="微信传统">

+ <font color=#3eaf7c>客户端</font>
+ <font color=#3eaf7c>服务端（后端代码和数据库）</font>
+ <font color=#3eaf7c>域名和服务器（备案等等）</font>
+ <font color=#3eaf7c>运维（DB运维，文件存储，内容加速，网络防护，容器服务，负载均衡，安全加固）</font>

在开发过程中实际上前后端开发成本是比较大的，容易产生扯皮，运维成本实际上更大

下面说一下小程序云开发：

<img :src="$withBase('/weixin_yunkaifa.png')" alt="微信云开发">

+ <font color=#3eaf7c>客户端</font>
+ <font color=#3eaf7c>云开发（云函数，云数据库，云存储）</font>

客户端可以直接调用云数据库，也可以调用云函数，在云函数中调用和使用云数据库，另外客户端可以直接上传文件到云存储，也能够直接从云存储中下载文件到客户端，这都是可以的。

另外整个项目都是部署在腾讯云上的，所以我们不需要额外的运维人员去维护。极大的降低了运维的成本，另外云函数是使用的`node.js`。所以基本上`node`已经是前端不可或缺的知识了，而且云数据库是`mongodb`的，所以基本上不需要`sql`的知识就能实现增删改查的操作。

小程序开发使用的是<font color=#3eaf7c>Serverless</font>的开发模式，我们稍微说一下什么是`Serverless`,无服务并不是字面意思，而是<font color=#3eaf7c>我们不在考虑硬件的基础设施，依赖的是现有的云服务提供商，</font>比如你要开一个服装店，你要做的应该是先找个门面，然后装修，水电，然后把衣服挂在店里卖。现在云开发好比你在一个已经装修且有水电的商场中租了一个门面。所以这种方式比自己干所有的事情要轻松，简单的多。而<font color=#3eaf7c>无服务</font>就是这种概念：<font color=#3eaf7c>通过云开发商提供的这种不需要维护，扩展的服务，让开发者将所有精力都投入到业务逻辑上面</font>

### 2. 云开发的开通
在小程序开发工具的左上角有个云开发的按钮，点击并同意协议，然后进入新建环境的界面，<font color=#3eaf7c>每个小程序账号可以免费提供两个环境，建议创建开发和生产环境</font>，因为每一套环境对应的独立的开发资源，环境之间也是独立的。

另外使用云开发，真个项目调试基础库的版本不能低于<font color=#3eaf7c>2.2.3</font>，这个设置是开发工具-> 详情-> 本地设置 -> 调试基础库的版本

只要开通了云开发，点击左上角的云开发按钮就能进入到当前云开发控制台。

### 3. 三大基础能力支持
<font color=#1E90FF>**① 云函数**</font>

<font color=#3eaf7c>云函数为用户提供了在云端运行代码的能力，同时支持微信私有协议的天然鉴权</font>，就是更方便获取用户的信息和`openid`，还有`openid`,生成分享图，调用腾讯云SDK,这些功能都能在云函数当中完成

<font color=#1E90FF>**② 云数据库**</font>

云数据库是`NoSql`的数据库，里面实际上就是`MongoDB`,有两种方法可以调用数据库，实现增删改查：
+ 通过云函数调用云数据库
+ 在客户端直接调用云数据库

<font color=#1E90FF>**③ 云存储**</font>

云存储能让我们直接在客户端对文件进行下载和上传，同时支持在我们控制台对文件进行可视化操作

## 云数据库

### 1. 数据库基础
云开发提供了一个`JSON`数据库，提供2GB免费存储空间，我们可以在此之前说一下关系型数据库和文档型数据库的区别：
| 关系型数据库     | 文档型数据库    | 
| :-------------: |:--------------:|
| 数据库database   | 数据库database |
| 表 table         | 集合collection |
| 行 row          | 记录record /doc |
| 列 column       | 字段 field      |

我们来说明一下在`MongoDB`中的数据类型：
+ <font color=#3eaf7c>String</font>：字符串
+ <font color=#3eaf7c>Number</font>：数字
+ <font color=#3eaf7c>Object</font>：对象
+ <font color=#3eaf7c>Array</font>：数组
+ <font color=#3eaf7c>Bool</font>：布尔值
+ <font color=#3eaf7c>GeoPoint</font>：地理位置点（用经纬度唯一标记一个点）
+ <font color=#3eaf7c>Date</font>：时间（客户端的时间）
+ <font color=#3eaf7c>Null</font>

操作云数据库的三个方法:
+ <font color=#3eaf7c>小程序控制</font>：读写数据库受权限控制限制
+ <font color=#3eaf7c>云函数控制</font>：拥有所有读写数据库的权限
+ <font color=#3eaf7c>控制台控制</font>：拥有所有读写数据库的权限

云数据库权限管理
+ 仅创建者可写，所有人可读（比如文章之类的）
+ 仅创建者可读写（比如私密相册等等）
+ 仅管理端可写（商品信息）
+ 仅管理端可读写（后台敏感数据）

数据库初始化
+ 初始化：
  ```javascript
  const db = wx.cloud.database()
  ```
+ 切换环境
  ```javascript
  const testDB = wx.cloud.database({ env: 'test' })
  ```
  
### 2. 数据库操作-插入数据（增）
我们在进行数据库操作之前要做的两件事：
+ 打开云开发控制台，在数据库中添加新的`collection`
+ 在`.js`文件的最上面初始化数据库

**1. 我们首先展示的是回调函数的写法**
```javascript
const db = wx.cloud.database(); // 初始化数据库
Page({
  /**
   * 数据库插入操作
   */
  insert: function () {
    db.collection('user').add({   // 先搜索到集合，然后使用add函数
      data: {
        name:'jerry',
        age: 20
      },
      success: res => {
        console.log(res) // 添加成功
      },
      fail: err => {
        console.log(err)  // 添加失败
      }
    })
  },
})
```
当我们以这种方式插入数据后，返回的除了我们自己写的数据，还有两个东西：<font color=#3eaf7c> _id </font>和<font color=#3eaf7c> _openid </font>,前者代表这个`record`唯一的标识，后者代表插入这条数据的用户。

**2. promise的写法**
```javascript
insert: function () {
  db.collection('user').add({
    data: {
      name:'jack',
      age: 18
    },
  }).then(res=>{
    console.log(res)
  }).catch(err=>{
    console.log(err)
  })
}
```
这种写法和上面回调的写法返回的结果是一样的。选择什么样的写法由你自己决定

### 3. 数据库操作-更新数据（改）
更新操作的步骤是我们先要根据这个`doc`的唯一`id`拿到数据然后通过`update`这个函数去更新它，另外我们直接使用`promise`的写法，这样比较简单，也更容易看的懂。
```javascript
  /**
   * 数据库更新操作
   */
  update:function () {
    db.collection('user').doc('5d262bd45d64d8050ab5da8c6061ae83').update({
      data: {
        age: 21
      }
    }).then(res=> {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
  },
```
如果成功的话会返回一个对象，属性`errMsg: "document.update:ok", stats:{updated: 1}`

### 4. 数据库操作-查找数据（查）
数据库查找操作我们首先要使用`.where()`这个方法去匹配我们书写的条件，然后通过`.get()`方法拿到数据
```javascript
  /**
   * 数据库查找操作
   */
  search: function () {
    db.collection('user').where({
      name: 'jerry'
    }).get().then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
  },
```
这里要注意的是，因为添加数据库的数据可以直接在云开发控制台操作的，但是通过这种方法操作的数据没有`_openid`这属性，假如我们向其中添加一条已经有过的数据，通过小程序查找是找不到这个数据的，因为小程序对数据库的读写操作受权限的限制，我们在云开发控制台的数据库的权限设置当中默认的是`仅创建者可读`，也就是按照这样方式去查找数据，会将当前管理者的`openid`和数据当中的`_openid`进行对照，如果不一样或者数据本身没有`_openid`这个属性，小程序操作数据库就没有权限查到这个数据。

所以我们在云开发控制台当中选择`所有用户可读，仅管理者读写`,这样相同的数据也都能被读出来

### 5. 数据库操作-删除数据（删）
删除一条数据我们同样也要先通过`.doc()`方法拿到这则数据，然后通过`.remove()`方法删除：
```javascript
  /**
   * 数据库删除操作
   */
  deleteOne: function () {
    db.collection('user').doc('5d262bd45d64d8050ab5da8c6061ae83').remove()
    .then(res => {
      console.log(res)
    })
    .catch(err=> {
      console.log(err)
    })
  },
```
特别要注意的是，因为只是一条数据的删除，所以小程序可以直接操作数据库进行删除，<font color=#3eaf7c>但是如果要批量进行删除，必须通过云函数来操作数据库</font>，云函数的知识我们将在下面一个章节进行学习。那么这一章更多的知识和数据库操作我们可以去下面列出的官网进行详细的学习和了解：
+ [https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)

## 云函数
<font color=#3eaf7c>云函数就运行在云端的代码，相当于小程序后台服务的代码</font>，我们不需要去管理服务器，只需要在小程序当中编写代码，然后一键上传和部署就能运行代码。云函数的运行时需要`node`环境的，我们只需要安装`node`即可。

我们将在下面去写几个例子，我们就能知道怎么创建和调用云函数

### 1. 求和函数sum()
<font color=#1E90FF>**① 创建云函数**</font>

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

<font color=#1E90FF>**② 调用云函数**</font>

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

### 2. 获取当前用户的openid
<font color=#1E90FF>**① 传统VS云开发**</font>

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

<font color=#1E90FF>**② 获取用户信息**</font>

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

### 3. 批量删除云数据库的数据
之前我们说过删除一条数据其实在小程序中直接调用数据库操作即可，但是批量删除数据必须要通过云函数的方式，也就是说步骤如下：
<font color=#3eaf7c>小程序</font> -> <font color=#3eaf7c>云函数</font> -> <font color=#3eaf7c>云数据库</font>

<font color=#1E90FF>**① 创建云函数**</font>

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
<font color=#1E90FF>**② 调用云函数**</font>

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

## 云存储
在免费的基础版当中，有5GB的内存供我们使用，并且我们可以通过相应的`API`去实现存储的功能
+ <font color=#3eaf7c>wx.cloud.uploadFile</font>：上传文件
+ <font color=#3eaf7c>wx.cloud.downloadFile</font>：下载文件
+ <font color=#3eaf7c>wx.cloud.deleteFile</font>：删除文件
+ <font color=#3eaf7c>wx.cloud.getTempFileURL</font>:获取临时链接

### 1. 文件上传
我们先用一张图来搞清楚微信上传文件的流程，然后我们用代码来演示：

<img :src="$withBase('/weixin_uploadFile.png')" alt="微信文件上传">

+ 首先我们选择图片或者拍照（用户-用户小程序）
+ 通过小程序上传所选的图片到云存储（用户小程序-云存储）
+ 云存储存好后把`fileId`返回给小程序（云存储-用户小程序）
+ 小程序拿着这`fileId`存储到云数据库当中（用户小程序-云数据库）

下面我们用代码来演示一下图片上传的步骤：
```javascript
/**
   * 上传图片
   */
  uploadFile: function () {
    // 1. 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths // 拿到临时路径
        console.log(tempFilePaths)
        // 2. 上传图片 
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + '.png', // 上传至云端的路径
          filePath: tempFilePaths[0], // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            console.log(res.fileID)
            // 3. 将fileID存储到云数据库当中
            db.collection('image').add({
              data: {
                fileID: res.fileID
              }
            }).then(res => {
              console.log(res)
            }).catch(err => {
              console.error(err)
            })
          },
          fail: console.error
        })
      }
    })
  },
```
关于文件上传的代码，实际上都是从下面两个官网中拷贝来并做修改的，我们可以参考下面给出的官网地址：
+ [https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.chooseImage.html](https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.chooseImage.html)
+ [https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/api.html](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/api.html)

### 2. 获取文件
我们前面已经将这个图片保存在了云存储，然后相关的`fileID`放在了云数据库当中，只要我们拿到这个`fileID`就能展示在小程序当中。我们直接亮出代码：
```javascript
  /**
   * 获取图片
   */
  getFile: function () {
    // 1.登录
    wx.cloud.callFunction({
      name: 'login'
    }).then(res =>{
      console.log(res)
      // 2. 获取图片
      db.collection('image').where({
        _openid: res.result.openid
      }).get().then(res2=> {
        console.log(res2)
        this.setData({
          images:res2.data
        })
      }).catch(err2=> {
        console.error(err2)
      })
    }).catch(err => {
      console.error(err)
    })
  },
```

### 3. 文件下载
首先我们先来看看文件下载的流程，然后我们使用代码去展示：

<img :src="$withBase('/weixin_downloadFile.png')" alt="微信文件上传">

+ 首先小程序要到云存储上面去获取文件的`fileID`（用户小程序-云存储）
+ 用户点击下载（用户-用户小程序）
+ 小程序给云数据库发送文件下载请求 （用户小程序-云数据库）
+ 云数据库给小程序返回文件信息 （云数据库-用户小程序）
+ 小程序将文件保存在手机相册（用户小程序-手机相册）

我们下面给出实例代码，先给出我们前端的代码，前端在渲染图片列表的时候是拿到了`fileID`的，所以我们这里直接可以拿到，我们先看前端代码：
```html
<block wx:for="{{images}}" wx:key="{{index}}">
  <image src="{{item.fileID}}"></image>
  <button size="mini" data-fileid="{{item.fileID}}" bindtap="downloadFile">文件下载</button>
</block>
```
我们下面给出后端代码：
```javascript
  /**
   * 下载图片
   */
  downloadFile: function (event) {
    // 1.给云数据库发送下载请求
    wx.cloud.downloadFile({
      fileID: event.target.dataset.fileid, // 文件 ID
      success: res => {
        // 返回临时文件路径
        console.log(res.tempFilePath)
        // 2. 保存到系统相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title:'保存成功'
            })
          },
          fail: console.error
        })
      },
      fail: console.error
    })
  },
```
相关的方法我们都能在官网找到，我们这里给出官网下载文件和保存到系统相册两个方法的查询地址： 
+ [https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.saveImageToPhotosAlbum.html](https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.saveImageToPhotosAlbum.html)
+ [https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/api.html](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/api.html)