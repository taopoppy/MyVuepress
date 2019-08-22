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
我们下面来实现互斥关系的踩和赞的答案接口设计和实现

## 收藏答案接口