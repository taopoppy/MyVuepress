# 数据库简介

## NoSQL介绍
`NoSQL`:<font color=#3eaf7c>对不同于传统的关系型数据库的数据库管理系统的统称</font>

`NoSQL`有那些呢？
+ 列存储（`HBase`）: 按列存储
+ 文档存储（`MongoDB`）: 就是`json`存储，一段`json`就是一篇文档
+ Key-Value存储（`Redis`）
+ 图存储（`FlockDB`）
+ 对象存储（`db4o`）
+ XML存储（`BaseX`）

为什么要使用`NoSQL`?
+ 简单（没有原子性，一致性，隔离性等复杂规则）
+ 便于横向拓展
+ 适合超大规模数据的存储
+ 很灵活的存储复杂解构的数据（schema free）

## MongoDB简介
`MongoDB`来自于英文单词`Homongous`，中文含义是<font color=#3eaf7c>庞大</font>的意思，这也意味着它能存储大量的数据。

`MongoDB`是面向文档存储的开源数据库，说白了就是当`json`存储，<font color=#3eaf7c> 一个文档就一段`json`，多个文档就构成了集合</font>，比如说一个用户列表就是一个集合，而某个特定用户就是其中一段文档。同时`MongoDB`是由`C++`编写的，支持多种语言进行操作，`MongoDB`的本地安装我们可以参考[文章](https://www.taopoppy.cn/Full-Stack-FriendCircle/ready2.html#%E4%B8%8B%E8%BD%BD%E5%AE%89%E8%A3%85mongodb),但是我们下面会使用`云MongoDB`

为什么要用`MongoDB`
+ 性能好（内存计算）
+ 大规模的数据存储（可拓展性）
+ 可靠安全（本地复制，自动故障转移）
+ 方便存储复杂的数据结构（schema Free）

`云MongoDB`
+ 概念：就是将`MongoDB`安装在远程的服务器上，是那种服务商家提供的服务器，并向外暴露一个链接地址，我们通过链接地址连接数据库并进行操作
+ 好处：数据存储的规模更大，而且更安全，因为有很多节点和集群，如果安装到自己的服务器，服务器一坏，数据库的数据也没有了，而且也不用我们自己维护
+ 种类：国内有阿里云和腾讯云，都是收费的，我们这里使用`MongoDB Atlas`（免费+收费）

## MongoDB Atlas

### 1. 注册用户
+ 打开[MongoDB官网](https://www.mongodb.com)然后点击顶部导航栏中的`Product`，选择第一个`MongoDB Atlas`
+ 进入页面点击`start free`，然后页面会自动移动到底部让你填邮箱，姓名和密码，你如实注册即可
+ 然后点击`get started free`就会跳转到创建`cluster`界面，如果你不是第一次，它会跳转到管理界面，在管理界面左下角的`Get Started`的按钮中也能找到`Build your first cluster`的选项

### 2. 创建集群
可以将集群理解成为一个虚拟的服务器，上面已经安装好了一个`MongoDB`
+ 进入到创建集群的页面后，我们点击`Build my frist cluster`
+ 选择`aws`亚马逊，然后选择新加坡`Singapore`,最后在`Cluster Name`那一栏中修改集群名称，点击`Create Cluster`即可
+ 创建集群大概需要7分钟左右的时间，另外这个是外国的官网，速度很慢，你可能需要翻墙，翻墙的教程我也在博客中有提到，你可以点击[这里](https://www.taopoppy.cn/construct/science_online.html)查看

### 3. 添加数据库用户
+ 集群创建完毕后悔到管理界面，我们在左下角点击`Get Started`，进行其中的第二部，`Create your first database user`，也就是创建数据库用户。
+ 点击了之后它会给你提示，你就按照提示的点击响应的内容，最后会让你点击`ADD NEW USER`
+ 然后在添加用户的面板中填写`username`和密码，在下面的`User Privileges`（权限）中选择第二个读写权限，然后选择添加

### 4. 设置IP地址白名单
+ 添加了数据库用户后会在左下角弹出第三步`Whitelist you IP address`，就是将你的IP地址添加到白名单，点击它
+ 根据提示一步一步点击到最后点击的按钮是`ADD IP ADDRESS`
+ 在弹出的面板中选择`ALLOW ACCESS FROM ANYWHERE`,就是可以从任何地址访问，因为如果你的IP地址经常变动，最好选择这个，不要选择第一个`ADD CURRENT IP ADDRESS`（当前IP）
+ 添加后下一步是`Load Sample Data`,这个是可选的，我们可以跳过

### 5. 获取连接地址
+ 点击`Connect to your cluster`,选择`connect Your Application`
+ 在`Connection String Only`中的那个地址就是我们后面要在`mongoose`中连接的地址：我们暂时要将其记住：（我这里记住我的，你们记住你们的）`mongodb+srv://taopoppy:<password>@zhihu-2kvxj.mongodb.net/test?retryWrites=true&w=majority`

## Mongoose连接MongoDB
实际上`MongoDB`有`node`的驱动的，但是原生的驱动用起来不方便，而`mongoose`能使`node`连接`MongoDB`数据库变得非常生动和简单，我们下面就来说说操作步骤

安装`mongoose`
```bash
npm install mongoose --save
```
然后引入并使用：
```javascript
const mongoose = require('mongoose')     // 引入
const { connenctionStr } = require('./config') // 引入地址

mongoose.connect(connenctionStr,{ 
  useNewUrlParser: true,
  useFindAndModify: false
},()=>console.log(`MongoDB连接成功`))
mongoose.connection.on('error',(error)=>console.error)
```
上面代码总的`connenctionStr`就是我们上面在`MongoDB Atlas`中获取的连接地址，然后关于`useNewUrlParser`和`useFindAndModify`的配置都是后面我们在测试的时候`MongoDB`给我们提示的，最后启动

## 设计用户的Schema
我们这里的`Schema`指的是`json`的结构，而且设计和编写的`Schema`都是写在代码当中的，不用对数据库进行设置

### 1. 分析用户模块的属性
比如现在我们认为用户只有简单的`name`和`age`属性，这样就足够了，因为分析就是思考的过程

### 2. 用户模块的Schema和Model
`mongoose`提供了一系列的方法，我们只要往里填就行了，我们在`app/modules`下面新建`users.js`文件，写如下代码
```javascript
const mongoose = require('mongoose')
const { Schema, model } = mongoose  // Schema和model是个类

// 定义文档结构
const userSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: false, default: 0}
})

// 创建用户模型
module.exports = model('User', userSchema)
```

## MongoDB实现增删改查
我们这里直接上传控制器的代码：
```javascript
const User = require('../models/users')

class UsersCtl {
  /**
   * 查询用户列表
   */
  async find(ctx) {
    ctx.body = await User.find()
  }

  /**
   * 查询特定用户

   */
  async findById(ctx) {
    const user = await User.findById(ctx.params.id)
    if(!user){
      ctx.throw(404,'用户不存在')
    }
    ctx.body = user
  }

  /**
   * 新建用户
   */
  async create(ctx) {
    // 校验
    ctx.verifyParams({
      name: { type: 'string', required: true }
    })
    const newUser = await new User(ctx.request.body).save(); //数据库会自动帮我们添加ID
    ctx.body = newUser
  }

  /**
   * 更新用户
   */
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true }
    })
    const updateUser = await User.findByIdAndDelete(ctx.params.id, ctx.request.body)
    if(!updateUser){
      ctx.throw(404,'更新用户不存在')
    }
    ctx.body = updateUser
  }

  /**
   * 删除用户
   */
  async deleteById(ctx) {
    const deleteUser = await User.findByIdAndRemove(ctx.params.id)
    if(!deleteUser){
      ctx.throw(404,'删除用户不存在')
    }
    ctx.status = 204
  }
}

module.exports = new UsersCtl();
```
然后我们去`postman`中测试，测试都没有问题