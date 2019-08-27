# 云数据库

## 数据库基础
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
  
## 数据库操作

### 1.  插入数据（增）
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

### 2. 更新数据（改）
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

### 3. 查找数据（查）
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

### 4. 删除数据（删）
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