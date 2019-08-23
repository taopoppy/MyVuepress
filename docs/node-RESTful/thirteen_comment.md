# 评论模块

## 需求分析
+ 评论的增删改查
+ 答案-评论（一对多）
+ 问题-评论（一对多）
+ 用户-评论（一对多）
+ 一级评论和二级评论

## 问题-答案-评论模块三级嵌套增删改查接口
按照`RESTful`嵌套的最佳实践，我们应该按照<font color=#3eaf7c>/:问题/:答案/:评论</font>这样的嵌套方式去设计我们的路由，具体我们就开始写代码：

### 1. 设计Schema
我们首先到`model/comments.js`当中书写评论的`Schema`:
```javascript
const mongoose = require('mongoose')
const { Schema, model } = mongoose  // Schema和model是个类

// 定义文档结构
const commentSchema = new Schema({
  // 干扰字段
  __v: { type: Number, select: false },
  // 内容
  content: { type: String, required: true},
  // 评论者
  commentator: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false },
  // 属于哪个问题
  questionId: { type: String, required: true },
  // 属于哪个答案
  answerId: { type: String, required: true },
})

// 创建用户模型
module.exports = model('Comment', commentSchema)
```
### 2. 实现接口
接着我们来快速来实现接口，我们直接复制粘贴`answer`控制器的内容到`controller/comments.js`当中，然后对其修改：
```javascript
const Comment = require('../models/comments')

class CommentCtl {
   /**
   * 获取评论列表（查）
   */
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)     // 单独拿出正则
    const { questionId, answerId } = ctx.params
    ctx.body = await Comment
    .find({ content: q, questionId, answerId }) // 我们查找的必须是指定问题（questionId）下面的指定答案（answerId）下的评论
    .limit(perPage).skip( page * perPage )
    .populate('commentator')
  }

  /**
   * 校验评论是否存在
   */
  async checkCommentExist(ctx,next) {
    const comment = await Comment.findById(ctx.params.id).select('+commentator')
    if(!comment) { ctx.throw(404, '评论不存在') }
    if(ctx.params.questionId && comment.questionId !== ctx.params.questionId){
      ctx.throw(404, '该问题下不存在此答案')
    }
    if(ctx.params.answerId && comment.answerId !== ctx.params.answerId){
      ctx.throw(404, '该评论下不存在此答案')
    }
    ctx.state.comment = comment  // 将答案保存在state当中
    await next()
  }

  /**
   * 检查评论人是不是当前用户，否则无法修改和删除
   */
  async checkCommentator(ctx,next) {
    const { comment } = ctx.state
    if(comment.commentator.toString() !== ctx.state.user._id){
      ctx.throw(403,'没有权限进行该操作')
    }
    await next()
  }

  /**
   * 查询特定的评论（查）
   */
  async findById(ctx) {
    const { fields='' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator')
    ctx.body = comment
  }

  /**
   * 创建一个评论（增）
   */
  async create(ctx) {
    // 1.检验参数
    ctx.verifyParams({
      content: { type: 'string', required: true }
    })
    // 2.创建一个评论保存
    const comment = await new Comment({
      ...ctx.request.body, 
      commentator: ctx.state.user._id, 
      questionId: ctx.params.questionId,
      answerId: ctx.params.answerId
    }).save() // 自动帮助我们创建一个问题ID
    ctx.body = comment
  }

  /**
   * 修改一个评论（改）
   */
  async update(ctx) {
    // 1.校验参数
    ctx.verifyParams({
      content: { type: 'string', required: false },
    })
    // 2. 修改并保存
    await ctx.state.comment.updateOne(ctx.request.body)
    ctx.body = ctx.state.comment
  }

  /**
   * 删除一个问题(删)
   */
  async deleteById(ctx) {
    await Comment.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new CommentCtl();
```
然后我们去`routes/comments.js`当中去添加路由，特别注意我们路由前缀是怎么设计的，我们会在下面代码中注释出来：
```javascript
router.prefix('/questions/:questionId/answers/:answersId/comments')  // 三级嵌套的路由

// 用户认证
const auth = jwt({secret})

router.get('/', find)             
router.get('/:id', checkCommentExist, findById)
router.post('/', auth, create)
router.delete('/:id',auth, checkCommentExist, checkCommentator, deleteById)
router.patch('/:id', auth, checkCommentExist, checkCommentator, update)

```
基本上增删改查的接口我们都不用管太多，因为基本都和前面差不多，但是尤其要注意的就是路由代码中我们使用注释标注出来的<font color=#3eaf7c>三级嵌套的路由</font>，特别重要。

## 一级和二级评论接口
我们首先要搞清楚两个概念，就是什么一级和二级评论：<font color=#3eaf7c>一级评论是答案的评论，二级评论是评论的评论</font>，然后我们下面使用代码来实现

### 1. 修改Schema
我们先想想怎么实现评论的评论，我们需要在评论的`Schema`当中添加一个属性`rootCommentId`，来标识根评论的`id`,然后还要添加一个属性`replyTo`来表述这个评论是回复那个用户的，我们现在就到`model/comments.js`当中去添加：
```javascript
  // 根评论的id (非必选，一级评论无此属性)
  rootCommentId: { type: String },
  // 回复的用户id（非必选，一级评论无此属性）
  replyTo: { type: Schema.Types.ObjectId, ref: 'User' }
```

### 2. 修改控制器
我们到`controller/comments.js`当中去修改几个控制器：我们首先要修改的就是获取评论列表
```javascript
   /**
   * 获取评论列表（查）
   */
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)     // 单独拿出正则
    const { questionId, answerId } = ctx.params
    const { rootCommentId } = ctx.query   // 查询字符串
    ctx.body = await Comment
    .find({ content: q, questionId, answerId, rootCommentId }) // 我们查找的必须是指定问题（questionId）下面的指定答案（answerId）下的评论
    .limit(perPage).skip( page * perPage )
    .populate('commentator replyTo')
  }
```
可以看出我们之前只能查到一个答案的所有一级评论，现在我们可以通过在`url`添加查询字符串来查找某个一级评论下的所有二级评论，比如`?rootCommentId=5d5f96b9cebcdf376c269a9e`。然后我们还需要修改的两个控制器如下，一个是新建，因为如果是新建二级评论需要有根评论和回复者，另外一个是更新，我们只允许更新内容
```javascript
 /**
   * 创建一个评论（增）
   */
  async create(ctx) {
    // 1.检验参数
    ctx.verifyParams({
      content: { type: 'string', required: true },
      rootCommentId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false },
    })
    // 2.创建一个评论保存
    const comment = await new Comment({
      ...ctx.request.body, 
      commentator: ctx.state.user._id, 
      questionId: ctx.params.questionId,
      answerId: ctx.params.answerId
    }).save() // 自动帮助我们创建一个问题ID
    ctx.body = comment
  }

  /**
   * 修改一个评论（改）
   */
  async update(ctx) {
    // 1.校验参数
    ctx.verifyParams({
      content: { type: 'string', required: false },
    })
    // 2. 修改并保存
    const { content } = ctx.request.body   // 只允许修改内容
    await ctx.state.comment.updateOne({ content })
    ctx.body = ctx.state.comment
  }
```
然后我们去`postman`中测试，首先我们添加一个二级评论必须提交这样一个格式的`json`:
```json
{
	"content":"我是韩梅梅，李雷你真是个马屁精",
	"rootCommentId":"5d5f96b9cebcdf376c269a9e",
	"replyTo":"5d4b7bdb456c9d155caff755"
}
```
也就是表示我这个二级评论是回复`5d5f96b9cebcdf376c269a9e`这个一级评论，回复的也是这个一级评论的用户`5d4b7bdb456c9d155caff755`,当然从内容开得出，是韩梅梅回复李雷的。我们想要获取李雷这个一级评论下的所有二级评论就必须在获取评论列表的`url`添加查询字符串`?rootCommentId=5d5f96b9cebcdf376c269a9e`。

## 添加日期
我们知道在评论的时候都是带时间的，我们这里直接会在数据库这一层面解决问题，因为按照常理我们知道在新建一个评论和更新评论我们一般自己要计算时间，然后把时间存进去，但是`mongoose`有大量的`API`给我们使用，我们只需要在设计`Schema`的时候带上时间戳即可，在`model/comments.js`当中修改一下：
```javascript
const commentSchema = new Schema({
  ...
}, { timestamps: true})   // 添加时间戳
```
就是这么简单，这样我们的数据当中就会包含`createdAt`和`updatedAt`两个字段，分别代表创建和更新时间，我们这里顺便给其他所有`Schema`都加上这样的设计。