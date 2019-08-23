# 答案模块

## 需求分析
+ 答案有<font color=#3eaf7c>用户</font>，<font color=#3eaf7c>富文本</font>，下面还有<font color=#3eaf7c>赞同和踩</font>，<font color=#3eaf7c>评论和收藏</font>
+ 在用户的主页当中有多个回答，所以<font color=#3eaf7c>用户和回答的关系是一对多的关系</font>
+ <font color=#3eaf7c>问题和回答之间也是一对多的关系</font>，一个问题可以有多个回答，但一个回答只能对应一个问题

所以我们下面要实现的功能点如下：
+ 答案的增删改查
+ 问题-答案（一对多）
+ 用户-答案（一对多）
+ 赞和踩的功能
+ 收藏

## 二级嵌套的增删改查接口
因为问题和答案这两个模块属于从属关系，所以我们设计`url`的时候应该是`/questions/:id/answers`这种二级嵌套的`url`设计，所以我们先亮出我们的答案的`Schema`：
```javascript
const mongoose = require('mongoose')
const { Schema, model } = mongoose  // Schema和model是个类

// 定义文档结构
const answerSchema = new Schema({
  // 干扰字段
  __v: { type: Number, select: false },
  // 内容
  content: { type: String, required: true},
  // 回答问题者
  answerer: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false },
  // 属于哪个问题
  questionId: { type: String, required: true }
})

// 创建用户模型
module.exports = model('Answer', answerSchema)
```
然后我们下面亮出我们关于二级嵌套的`url`设计，也就是我们的答案路由的主要部分：
```javascript
router.prefix('/questions/:questionId/answers')   // 二级设置

// 用户认证
const auth = jwt({secret})

router.get('/', find)             
router.get('/:id', checkAnswerExist, findById)
router.post('/', auth, create)
router.delete('/:id',auth, checkAnswerExist, checkAnswerer, deleteById)
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)

module.exports = router
```
可以看到，我们在路由部分的二级设置，因为首先答案是属于问题的，我们在能够找到问题的前提下在去找答案的`id`,然后要注意的就是在修改和删除的时候中间件的先后顺序如下：
+ <font color=#3eaf7c>auth</font> (用户是否登录) -> 
+ <font color=#3eaf7c>checkAnswerExist</font> (答案和问题是否存在并相互匹配) -> 
+ <font color=#3eaf7c>checkAnswerer</font> (答案的回答者是否是当前用户) ->
+ <font color=#3eaf7c>控制器</font>

然后我们就可以书写一下控制器，那实际上控制器基本上和答案的差不多，稍有修改，我们在下面的代码中都有注释
```javascript
const Answer = require('../models/answers')

class AnswersCtl {
   /**
   * 获取答案列表（查）
   */
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)     // 单独拿出正则
    ctx.body = await Answer
    .find({ content: q, questionId: ctx.params.questionId }) //必须是给定的questionId下的答案类表
    .limit(perPage)
    .skip( page * perPage )
  }

  /**
   * 校验答案是否存在
   */
  async checkAnswerExist(ctx,next) {
    const answer = await Answer.findById(ctx.params.id).select('+answerer')
    if(!answer) { ctx.throw(404, '答案不存在') }
    if(answer.questionId !== ctx.params.questionId){
      ctx.throw(404, '该问题下不存在此答案')
    }
    ctx.state.answer = answer  // 将答案保存在state当中
    await next()
  }

  /**
   * 检查问题中的回答者是不是当前用户，否则无法删除或者修改
   */
  async checkAnswerer(ctx,next) {
    const { answer } = ctx.state
    if(answer.answerer.toString() !== ctx.state.user._id){
      ctx.throw(403,'没有权限进行该操作')
    }
    await next()
  }

  /**
   * 查询特定的答案（查）
   */
  async findById(ctx) {
    const { fields='' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer')
    ctx.body = answer
  }

  /**
   * 创建一个答案（增）
   */
  async create(ctx) {
    // 1.检验参数
    ctx.verifyParams({
      content: { type: 'string', required: true }
    })
    // 2.创建一个答案保存
    const answer = await new Answer({
      ...ctx.request.body, 
      answerer: ctx.state.user._id, 
      questionId: ctx.params.questionId
    }).save() // 自动帮助我们创建一个问题ID
    ctx.body = answer
  }

  /**
   * 修改一个答案（改）
   */
  async update(ctx) {
    // 1.校验参数
    ctx.verifyParams({
      content: { type: 'string', required: false },
    })
    // 2. 修改并保存
    await ctx.state.answer.updateOne(ctx.request.body)
    ctx.body = ctx.state.answer
  }

  /**
   * 删除一个问题(删)
   */
  async deleteById(ctx) {
    await Answer.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new AnswersCtl();
```
## 互斥关系踩/赞接口
我们下面来实现互斥关系的踩和赞的答案接口设计和实现,关于互斥接口有6个接口，分别是<font color=#3eaf7c>踩</font>和<font color=#3eaf7c>赞</font>，然后是<font color=#3eaf7c>取消赞</font>和<font color=#3eaf7c>取消踩</font>，最后是<font color=#3eaf7c>获取用户赞过的答案列表</font>和<font color=#3eaf7c>用户踩过的答案列表</font>，除了这6个接口我们还要重点实现的一个功能是互斥关系，就是如果已经踩了一个答案，在赞的时候要同时取消踩，反过来也一样
### 1. 设计数据库Schema
我们需要在用户的`Schema`下面增加两个列表，分别是赞过的答案列表和踩过的答案列表，除此之外我们还要在答案的`Schema`当中添加一个投票数的字段，记录赞或者踩的数量。所以我们先在`model/users.js`当中添加字段：
```javascript
  // 赞过的答案列表
  likingAnswers: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    select: false
  },

  // 踩过的答案列表
  dislikingAnswers: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    select: false
  }
```
然后在`model/answers.js`当中添加字段：
```javascript
  // 被赞过的投票数
  voteCount: { type: Number, required: true, default: 0 }
```
### 2. 实现接口
我们到`controller/users.js`当中去添加这样6个控制器：
```javascript
  /**
   * 赞过的答案列表
   */
  async listLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
    if(!user) { ctx.throw(404,'用户不存在') }
    ctx.body = user.likingAnswers
  }
  /**
   * 赞一个答案
   */
  async likeAnswer(ctx,next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    if(!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)){
      me.likingAnswers.push(ctx.params.id)  // 1. 把赞过的答案添加到用户赞过的答案列表中
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id,{ $inc: { voteCount: 1 }}) // 2. 赞的投票数加1
    }
    ctx.status = 204
    await next()
  }
  /**
   * 取消赞一个答案
   */
  async unlikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if(index > -1){
      me.likingAnswers.splice(index,1) // 1. 将答案从用户赞的答案列表中删除
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id,{ $inc: { voteCount: -1 }}) // 2. 答案赞的投票数减1
    }
    ctx.status = 204
  }
  /**
   * 踩过的答案列表
   */
  async listDisLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
    if(!user) { ctx.throw(404,'用户不存在') }
    ctx.body = user.dislikingAnswers
  }
  /**
   * 踩一个答案
   */
  async dislikeAnswer(ctx,next) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    if(!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)){
      me.dislikingAnswers.push(ctx.params.id)  // 1. 把踩过的答案添加到用户赞过的答案列表中
      me.save()
    }
    ctx.status = 204
    await next()
  }
  /**
   * 取消踩一个答案
   */
  async undislikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if(index > -1){
      me.dislikingAnswers.splice(index,1) // 1. 将答案从用户踩的答案列表中删除
      me.save()
    }
    ctx.status = 204
  }
```
上述我们特别要注意的一个`mongoose`的用法是`$inc: { voteCount: -1 }`表示增加的意思，具体的用法说明到[mongoose中文网](http://www.mongoosejs.net/)查看，最后我们来修改一下路由,到`route/users.js`当中添加路由
```javascript
// 赞的三个接口
router.get('/:id/likingAnswers', listLikingAnswers)
router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer)
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer)
// 踩的三个接口
router.get('/:id/dislikingAnswers', listDisLikingAnswers)
router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer)
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer)
```
注意的是：在赞和踩分别的三个接口中`get`方法中的路由参数`id`是用户的`id`，而`put`和`delete`方法对应的路由参数的`id`是答案的`id`，不要搞混淆了，其中<font color=#3eaf7c>赞和踩的互斥关系</font>我们也有所体现，可以看到在赞和踩的`put`方法中我们有两个控制器，如果是赞，我们先赞然后再取消踩，如果是踩，我们先踩然后取消赞。

因为上述代码的检查答案存在的逻辑只是单纯看答案是否存在，但是我们之前在`controllers/answers.js`当中写的`checkAnswerExist`是要将答案和路由中的`questionId`匹配的，我们也去修改一下它，在`controllers/answers.js`中修改`checkAnswerExist`中间件
```javascript
  /**
   * 校验答案是否存在
   */
  async checkAnswerExist(ctx,next) {
    const answer = await Answer.findById(ctx.params.id).select('+answerer')
    if(!answer) { ctx.throw(404, '答案不存在') }
    // 只有在删改查的时候才会去检查路由是否包含此逻辑，其余赞和踩单纯只检查答案的存在性是不含此逻辑的
    if(ctx.params.questionId && answer.questionId !== ctx.params.questionId){
      ctx.throw(404, '该问题下不存在此答案')
    }
    ctx.state.answer = answer  // 将答案保存在state当中
    await next()
  }
```

## 收藏答案接口
这里有三个接口我们需要实现，<font color=#3eaf7c>收藏答案</font>，<font color=#3eaf7c>取消收藏答案</font>，<font color=#3eaf7c>用户的收藏答案的列表</font>，我们这里有一个<font color=#3eaf7c>RESTful</font>的最佳实践：<font color=#3eaf7c>在url中使用资源名称而不是动词</font>

### 1. 设计Schema
首先到`model/users.js`当中设计收藏列表的属性：
```javascript
  // 收藏的答案
  collectingAnswers: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    select: false
  }
```

### 2. 实现接口
基本上这三个接口和上面我们写的赞或者踩的三个接口差不多，我们只需要粘贴复制然后修改一下即可，我们到`controller/users.js`当中添加三个控制器：
```javascript
  /**
   * 收藏的答案列表
   */
  async listCollectingAnswers(ctx) {
    const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers')
    if(!user) { ctx.throw(404,'用户不存在') }
    ctx.body = user.collectingAnswers
  }
  /**
   * 收藏一个答案
   */
  async collectAnswer(ctx,next) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
    if(!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)){
      me.collectingAnswers.push(ctx.params.id)  // 把收藏的答案添加到用户收藏过的答案列表中
      me.save()
    }
    ctx.status = 204
    await next()
  }
  /**
   * 取消收藏一个答案
   */
  async uncollectAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
    const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    if(index > -1){
      me.collectingAnswers.splice(index,1) // 1将答案从用户收藏的答案列表中删除
      me.save()
    }
    ctx.status = 204
  }
```
然后我们到路由当中注册,我们到`routes/uesrs.js`当中添加三个路由：
```javascript
// 收藏的三个接口
router.get('/:id/collectingAnswers', listCollectingAnswers)
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer)
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, uncollectAnswer)
```
最后我们到`postman`当中去测试，这样我们整个答案模块的内容就到此为止，我们最后要说的就是评论模块，是比较复杂的数据库设计，希望大家认真巩固之前的知识。