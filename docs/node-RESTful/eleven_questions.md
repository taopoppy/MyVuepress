# 问题模块

## 需求分析
+ 首先问题模块首先要和用户还有话题一样有<font color=#3eaf7c>增删改查</font>的功能，方便我们测试用
+ 然后我们可以看到<font color=#3eaf7c>一个问题可能会包含多个话题</font>，通俗的说就是一个问题在学术上属于这些话题的范畴
+ 然后问题还有<font color=#3eaf7c>标题</font>，<font color=#3eaf7c>描述</font>部分，当然回答部分是我们在后面回答模块要搞得东西
+ 问题和话题功能一样，还有<font color=#3eaf7c>关注者</font>，也就是关注这个问题的用户
+ 还有就是用户在自己的模块当中还有提问这个东西，也就是用户也有自己的提问列表，这是一个<font color=#3eaf7c>一对多的问题</font>，因为一个用户可以提出多个问题，但是一个问题只能被一个用户提出
+ <font color=#3eaf7c>问题和话题是多对多的关系</font>，一个话题可以包含多个问题，一个问题也会属于多个话题的范畴

综上所述，我们要去完成的功能就是下面四个：
+ 问题的增删改查
+ 用户的问题列表（用户-问题：一对多的关系）
+ 话题的问题列表 + 问题的话题列表（话题-问题：多对多的关系）
+ 关注/取消关注问题

## 问题的增删改查
首先我们需要去`models/questions.js`当中去创建问题模型：
```javascript
const mongoose = require('mongoose')
const { Schema, model } = mongoose  // Schema和model是个类

// 定义文档结构
const questionSchema = new Schema({
  // 干扰字段
  __v: { type: Number, select: false },
  // 标题
  title: { type: String, required: true},
  // 描述
  description: { type: String },
  // 提问者
  questioner: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false },
})

// 创建用户模型
module.exports = model('Question', questionSchema)
```
接着我们去`controllers/questions.js`当中去写控制器：
```javascript
const Question = require('../models/questions')

class QuestionsCtl {
   /**
   * 获取问题列表（查）
   */
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)     // 单独拿出正则
    ctx.body = await Question
    .find({ $or: [{ title: q},{description: q}] }) // 同步可以匹配在标题或者描述中包含关键字的问题
    .limit(perPage)
    .skip( page * perPage )
  }

  /**
   * 校验问题是否存在
   */
  async checkTopicExist(ctx,next) {
    const question = await Question.findById(ctx.params.id).select('+questioner')
    if(!question) { ctx.throw(404, '问题不存在') }
    ctx.state.question = question  // 将问题保存在state当中
    await next()
  }

  /**
   * 校验用户必须是问题的提问者
   */
  async checkQuestioner(ctx,next) {
    const { question } = ctx.state
    if(question.questioner.toString() !== ctx.state.user._id){
      ctx.throw(403,'没有权限进行该操作')
    }
    await next()
  }

  /**
   * 查询特定的问题（查）
   */
  async findById(ctx) {
    const { fields='' } = ctx.query      // 获取查询字符串中的fields
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('') 
    const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner')
    ctx.body = question
  }

  /**
   * 创建一个问题（增）
   */
  async create(ctx) {
    // 1.检验参数
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
    })
    // 2.创建一个问题保存
    const question = await new Question({...ctx.request.body, questioner: ctx.state.user._id}).save() // 自动帮助我们创建一个问题ID
    ctx.body = question
  }

  /**
   * 修改一个问题（改）
   */
  async update(ctx) {
    // 1.校验参数
    ctx.verifyParams({
      title: { type: 'string', required: false },
      description: { type: 'string', required: false },
    })
    // 2. 修改并保存
    await ctx.state.question.update(ctx.request.body)
    ctx.body = ctx.state.question
  }

  /**
   * 删除一个问题(删)
   */
  async delete(ctx) {
    await Question.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new QuestionsCtl();
```
上述代码你可以看见基本和`controllers/topic`当中的代码差不多，因为写的时候也是直接拷贝的，并做了相应的业务逻辑修改，接下来我们去路由当中添加东西，我们到`routes/questions.js`当中创建代码：
```javascript
router.get('/', find)             
router.get('/:id', checkQuestionExist, findById)
router.post('/', auth, create)
router.delete('/:id',auth, checkQuestionExist,checkQuestioner, deleteById)
router.patch('/:id', auth, checkQuestionExist,checkQuestioner, update)
```
上述代码只展现了最核心的代码，其他导入导出的代码基本和其他路由一致，只需要稍作修改即可，我们特别要注意的是我们对问题的修改和删除两个操作比较特殊，中间件执行的顺序是：<font color=#3eaf7c>用户登录</font>-> <font color=#3eaf7c>问题是否存在</font>-> <font color=#3eaf7c>用户是否是问题的提问者</font>-> <font color=#3eaf7c>控制器</font>

## 用户的问题列表
我们想想用户的问题列表实际上就是问题列表中筛选出问题的提问者是用户自己的所有问题，所以就很简单，我们直接去`controllers/users.js`当中添加控制器：
```javascript
  /**
   * 用户的问题列表
   */
  async listQuestions(ctx) {
    const questions = await Question.find({ questioner: ctx.params.id })
    ctx.body = questions
  }
```
然后到`routes/users.js`当中添加路由即可：
```javascript
router.get('/:id/questions',listQuestions)
```
然后我们使用`postman`去一个一个测试我们书写的接口

## 问题的话题列表接口
为了建立问题的话题的列表，我们需要到`models/questions.js`当中给`Questions`的`Schema`添加这样一个属性：
```javascript
  // 涉及到的话题
  topics: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Topic'}],
    select: false
  }
```
这样其实就可以了，然后我们到`controllers/questions.js`中，修改一下查询特定问题的接口：
```javascript
  async findById(ctx) {
    const { fields='' } = ctx.query 
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics') // 我们在这里populate方法中添加topics
    ctx.body = question
  }
```
这样查询特定接口也就能查到问题涉及到的所有话题了

## 话题的问题列表接口
然后我们开始想想这个话题的问题列表是不是应该也在话题的`Schema`当中添加一个`questions`的属性呢？其实不对，为什么能在问题的`Schema`当中添加话题，而不在话题的`Schema`中添加问题呢？ <font color=#3eaf7c>因为一个问题涉及到的话题按照常理也不超过10个，可以一个话题的问题可能有成千上万个，我们怎么可能保存的下？</font>，所以依旧是我们的老办法，直接访问问题列表，问题当中包含该话题的我们筛选出来即可

所以我们到`controllers/topics.js`当中添加控制器：
```javascript
  /**
   * 话题拥有的问题列表
   */
  async listQuestions(ctx) {
    const questions = await Question.find({ topics: ctx.params.id})
    ctx.body = questions
  }
```
然后我们添加路由，到`routes/topics.js`当中添加即可：
```javascript
router.get('/:id/questions', checkTopicExist, listQuestions)
```
然后我们去`postman`进行测试即可，关于问题模块相关的东西我们就写完了，在这其中的一对多和多对多的关系，我们要好好去理理思路和理解这些关系