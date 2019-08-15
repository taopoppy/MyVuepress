# 关注和粉丝

## 功能点分析
+ 关注、取消关注
+ 获取关注人列表，粉丝列表（用户-用户多对多的关系：数据库中就是A可以同时对应多个B，B也可以同时有多个A）

## Schema设计
`Schema`设计说白了就是`json`结构的设计，我们首先分析一下关注和粉丝的数据结构，因为关注列表和粉丝列表都是隶属于用户，所以和我们之前设计的姓名性别没有啥区别，但是如果一个人有很多粉丝，比如一百万个，那么我们不能将一百万个数据都存在一行吧，肯定会爆掉，因为在`MongoDB`中如果一行的存储超过4M，就说明设计有问题，所以我们正确的做法是：
+ <font color=#3eaf7c>关注设置为用户的一个属性</font>
+ <font color=#3eaf7c>粉丝列表我们请求用户列表，顺便添加一个限制条件为关注我</font>

下面我们就到`models/users.js`当中去添加关于关注的`Schema`设计：
```javascript
 // 关注
  following: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    select: false
  } 
```
上述代码虽然不多，但是我们要明白，关注属性本身是一个数组，这数组里面每个元素就是一个用户对象，但是不可能一个用户对象会保存用户的所有信息，只会保存`id`，这个`id`就是我们在代码中写的`Schema.Types.ObjectId`这个专有类型，后面的`ref`就是引用的意思，意思就是这个`id`和`User`这个`Schema`相关联，能通过这个`id`查询到相关联`User`的其他属性，这样实际就是间接的完成了数组元素是个完整的对象。

## 接口的实现

### 1. 关注列表
关注列表我们首先来想怎么写，关注列表肯定是可以查看自己的关注列表，也能查看别人的关注列表，所以不管自己或者别人肯定是<font color=#3eaf7c>拿到用户id，查询这个用户的following属性</font>，我们先到`routes/users.js`去添加路由
```javascript
router.get('/:id/following',listFollowing)
```

然后我们到`controllers/users.js`去添加接口：
```javascript
  /**
   * 关注列表
   */
  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if(!user) { ctx.throw(404,'用户不存在') }
    ctx.body = user.following
  }
```
上述代码首先我们要根据`url`上的参数`id`去查询用户，并携带`following`属性，但是`following`属性是一个只包含`id`号的数组，我们需要根据`id`去填补其他用户信息，<font color=#3eaf7c>正应为我们在Schema中设计了type: [{ type: Schema.Types.ObjectId, ref: 'User' }]，所以这里能根据id去填补其他用户的姓名性别头像等基本信息，这些基本信息都是在`Schema`中`select`不为`false`的属性</font>。

### 2.粉丝列表
粉丝列表我们之前说过，就是查询用户列表，只不过要加限制条件，你关注了我，才是粉丝,所以首先是到`routes/users.js`去添加路由：
```javascript
router.get('/:id/followers', listFollowers)
```
然后我们到`controllers/users.js`去添加接口：
```javascript
  /**
   * 粉丝列表
   */
  async listFollowers(ctx) {
    const user = await User.find({ following: ctx.params.id })
    ctx.body = user
  }
```
粉丝列表貌似很难，因为要去每个用户的`following`属性中查找有没有自己的用户`id`,但是代码很简单，就是在查询用户列表的基础上去添加条件，这个条件就是`{ following: ctx.params.id }`,就是说满足`following`中包含`id`的用户会被返回，当然返回的也都是基本信息，姓名性别头像之类的。

### 3. 关注
首先我们要想一下关注是怎么样的，首先关注肯定需要被关注者的`id`,其次需要认证，我们的目的最终是将`id`添加到用户的`following`属性中，然后将修改后的`following`属性保存在数据库中，所以我们在路由的设计中我们要认证，还要使用`put`方法，还要将要关注的那个人的`id`传过去
```javascript
router.put('/following/:id',auth,follow)
```

接着我们到`controllers/users.js`中添加关注的控制器：
```javascript
  /**
   * 关注
   */
  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following') // 拿到包含following属性的用户信息  
    if(!me.following.map(id => id.toString()).includes(ctx.params.id)){   // 避免重复添加
      me.following.push(ctx.params.id)
      me.save()            // save方法保存在数据库当中
    }
    ctx.status = 204
  }
```
上述代码注意的就是`MongoDB`中的<font color=#3eaf7c>includes</font>方法和<font color=#3eaf7c>save</font>方法，新用到的方法我都会在这里单独提醒

### 4.取消关注
取消关注和关注基本上市一样的，我们在这这里就不重复讲解思路了，直接上代码，代码中也有部分注释，首先是路由部分：
```javascript
router.delete('/following/:id',auth,unfollow)
```

接着我们到`controllers/users.js`中添加取消关注的控制器：
```javascript
  /**
   * 取消关注
   */
  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id) // 拿到关注者id在你关注列表中的索引
    if(index > -1){
      me.following.splice(index,1) // 删除索引对应的的元素即可
      me.save()
    }
    ctx.status = 204
  }
```

## 校验用户是否存在的中间件
因为我们关注或者取消关注中的代码中并没有对`id`对应的用户的存在性检验，所以我们要写一个检验用户的中间件，到`controllers/users.js`中添加代码：
```javascript
  /**
   * 校验用户是否存在
   */
  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id)
    if(!user){ ctx.throw(404, '用户不存在') }
    await next()
  }
```
然后我们在关注和取消关注的路由上添加这个中间件，来健壮我们的程序：
```javascript
router.put('/following/:id', auth, checkUserExist, follow)
router.delete('/following/:id', auth, checkUserExist, unfollow)
```
