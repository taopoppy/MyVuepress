# 话题模块

## 话题模块的需求分析
+ 话题的增改查（没有删，话题的依赖很多，不建议轻易删除话题）
+ 分页和模糊搜索
+ 用户属性中的话题引用（其实在真实的个人资料中，你的居住地，公司还有职位等都是话题，并不是简单的字符串，这样其实格式化的好处在于数据处理）
+ 关注和取消关注话题，用户关注的话题列表

## 话题增改查接口

### 1. 设计Schema
我们在`model/topics`文件中创建话题模型：
```javascript
const mongoose = require('mongoose')
const { Schema, model } = mongoose  // Schema和model是个类

// 定义文档结构
const topicSchema = new Schema({
  // 干扰字段
  __v: { type: Number, select: false },
  // 名称
  name: { type: String, required: true},
  // 图标
  avatar_url: { type: String },
  // 简介
  introduction: { type: String, select: false },
})

// 创建用户模型
module.exports = model('Topic', topicSchema)
```
### 2. 增改查接口
我们在`controllers/topics.js`中添加控制器的代码,基本上和`users`是很类似的，所以就直接上代码，不会做详细的解释：
```javascript
const Topic = require('../models/topics')

class TopicsCtl {
  /**
   * 获取话题列表
   */
  async find(ctx) {
    ctx.body = await Topic.find();
  }

  /**
   * 查询特定的话题
   */
  async findById(ctx) {
    const { fields='' } = ctx.query      // 获取查询字符串中的fields
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')  // 形成+locations+business这种形式
    const topic = await Topic.findById(ctx.params.id).select(selectFields)
    ctx.body = topic
  }

  /**
   * 创建一个话题
   */
  async create(ctx) {
    // 1.检验参数
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    // 2.创建一个话题保存
    const topic = await new Topic(ctx.request.body).save() // 自动帮助我们创建一个话题ID
    ctx.body = topic
  }
  
  /**
   * 修改一个话题
   */
  async update(ctx) {
    // 1.校验参数
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    // 2. 修改并保存
    const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    ctx.body = topic
  }
}

module.exports = new TopicsCtl();
```

### 3. 添加路由
我们依旧是要在`routes/topics.js`创建话题相关的路由,这样基本上话题的增改查接口我们就写完了，然后我们去`postman`中测试即可,
```javascript
const jwt = require('koa-jwt')
const { secret } = require('../config')
const Router = require('koa-router');
const router = new Router();
const { 
  find,
  findById,
  create,
  update
} = require('../controllers/topics')
router.prefix('/topics')

// 用户认证
const auth = jwt({secret})

router.get('/', find)             
router.post('/', auth, create)
router.get('/:id', findById)
router.patch('/:id', auth, update)

module.exports = router
```
特别要注意的就是在话题的创建和修改，我们都是需要用户登录的，也就是你在`postman`当中测试的时候需要在`Authorzation`中添加全局变量`token`