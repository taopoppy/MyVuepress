# 用户关注话题

## 用户关注多个话题
实现关注话题的逻辑，其实就是<font color=#3eaf7c>用户和话题多对多的关系</font>，因为用户可以关注多个话题，一个话题也会有很多用户关注它

首先用户关注话题，我们肯定要去修改用户的`Schema`，我们在`models/users.js`当中添加一个属性，因为这是个数组，数组里面也都是话题的`id`，和`Topic`是相互关联的
```javascript
// 关注的话题
  followingTopic: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    select: false
  }
```

然后我们去`controllers/topics.js`当中添加一个中间件，校验话题是否存在：
```javascript
  /**
   * 校验话题是否存在
   */
  async checkTopicExist(ctx,next) {
    const topic = await Topic.findById(ctx.params.id)
    if(!topic) { ctx.throw(404, '话题不存在') }
    await next()
  }
```

接着我们去修改控制器当中的东西，我们首先来写一下<font color=#3eaf7c>关注话题</font>、<font color=#3eaf7c>取消关注话题</font>和<font color=#3eaf7c>查询某人的话题列表</font> ，在`controllers/users.js`当中添加：
```javascript
/**
 * 关注话题列表
 */
async listFollowingTopics(ctx) {
  const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
  if(!user) { ctx.throw(404,'用户不存在') }
  ctx.body = user.followingTopics
}
/**
 * 关注话题
 */
async followTopic(ctx) {
  const me = await User.findById(ctx.state.user._id).select('+followingTopics')
  if(!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)){
    me.followingTopics.push(ctx.params.id)
    me.save()
  }
  ctx.status = 204
}

  /**
 * 取消关注话题
 */
async unfollowTopic(ctx) {
  const me = await User.findById(ctx.state.user._id).select('+followingTopics')
  const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id) // 拿到关注话题id在你关注列表中的索引
  if(index > -1){
    me.followingTopics.splice(index,1)
    me.save()
  }
  ctx.status = 204
}
```

可以看到这两段代码和我们之前写的关注用户基本完全一样，然后我们将控制器注册在路由上，在`routes/users.js`当中添加:
```javascript
// 校验话题存在中间件
const { checkTopicExist }  = require('../controllers/topics')
...
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)
router.get('/:id/followingTopics', listFollowingTopics)
```

## 话题拥有多个用户
按照我们的惯性思维，话题拥有多个用户，肯定也应该去修改话题的`Schema`，不是的，这里查找话题拥有的用户和之前用户的粉丝是一样的，实际上是查询用户列表，在配置项中添加条件，比如粉丝是必须用户的`following`属性中包含自己用户的`id`。同样，话题拥有的用户也是去查询用户列表，用户的`followingTopics`中包含该话题的`id`。所以我们去`controllers/topics.js`文件中添加控制器：
```javascript
  /**
   * 话题拥有用户列表
   */
  async listTopicsFollowers(ctx) {
    const user = await User.find({ followingTopics: ctx.params.id })
    ctx.body = user
  }
```
然后添加到路由当中，注意因为我们写了话题校验是否存在的中间件，所以有在`url`包含`id`的我们都需要在路由添加这个中间件：
```javascript
router.get('/:id', checkTopicExist, findById)
router.patch('/:id', auth, checkTopicExist, update)
router.get('/:id/followers', checkTopicExist, listTopicsFollowers)
```
然后我们去`postman`中进行测试即可

到这里我们的<font color=#3eaf7c>话题模块</font>就告一段落，下面我们会来说明<font color=#3eaf7c>问题模块</font>相关的接口和数据库的设计，关于问题模块的数据库设计相对较复杂，希望大家坚持，更加用心学习。