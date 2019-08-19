# 分页和搜索

## 分页
分页我们是怎么做的？在`RESTful`最佳实践中：<font color=#3eaf7c>分页是通过在querystring中设置per_page和page等参数配置了当前页数和页面数据条数这些查询字符串</font>，所以我们这部分先对话题进行分页，然后将这个逻辑照搬到用户列表的身上。

之前我们在`controllers/topics.js`中的获取话题列表中只有简单的一行代码，那个是实现不了分页功能的，我们下面在此基础上来实现分页，首先我们要介绍在`mongoose`中的两个方法：<font color=#3eaf7c>limit</font>和<font color=#3eaf7c>skip</font>
```javascript
ctx.body = await Topic.find().limit(10).skip(10)
```
`limit(10)`其实很好理解，就是我们返回的数据有10项，然后`skip`实际上是跳跃的意思,`skip(10)`的意思就是我们跳过前10项，也就是从第11项开始取数据，所以上述代码的意思就是从第11项开始取10项数据，假如我们每页是10条数据，上述代码不就是第二页么，所以分页简单来说就是数学题
```javascript
/**
   * 获取话题列表
   */
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1)   // 第几页
    const perPage = Math.max(per_page * 1, 1)          // 每页展示多少条数据
    ctx.body = await Topic.find().limit(perPage).skip( (page - 1) * perPage )
  }
```
上述代码你就应该看的懂了，首先我们会默认的设置每页的数据有10条，因为对于页数和每页的数据条数都不会为负数或者0，所以我们使用`Math.max`方法去强壮代码，然后按照我们上面讲述的`limit`和`skip`方法去分页就可以了，然后我们访问的`url`可以如下：
+ `http://localhost:3001/topics`: 默认第一页的10条数据
+ `http://localhost:3001/topics?page=2&per_page=5`: 第二页，每页有5条数据 

按照这样的修改方法我们同样去修改一下之前写过的`User`模块，基本代码都是一样的：
```javascript
  /**
   * 查询用户列表
   */
  async find(ctx) {
    const { per_page = 10 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    let result  = await User.find().limit(perPage).skip(page * per_page)
    ctx.body = result
  }
```

## 模糊搜索
<font color=#3eaf7c>模糊搜索</font>我们也可以叫做关键词搜索，就是我们在`querystring`查询字符串中加上我们要搜索的关键字，就能根据关键字去查询和过滤。现在我们就要介绍无论是模糊搜索还是精确搜索，<font color=#3eaf7c>只要在mongoose当中提供的find方法当中添加参数即可</font>,比如之前我们在粉丝列表中写的代码是这样的：
```javascript
const user = await User.find({ following: ctx.params.id })
```
它其实就是一个条件，所有查询出来的数据中必须`following`这个属性为`ctx.params.id`才会被过滤出来，不满足这条件的统统都被过滤掉了，所以比如我们<font color=#3eaf7c>精准查询</font>在`find`方法中就要写一个很固定的条件，比如：
```javascript
let result  = await User.find({name: "上海"}).limit(perPage).skip(page * per_page)
```
但是如果是<font color=#3eaf7c>模糊查询</font>，我们其实将`find`当中的条件写成正则即可,所以我们只需要修改一行代码：
```javascript
    ctx.body = await Topic
    .find({name: new RegExp(ctx.query.q)})     // 将搜索的内容添加到正则表达式当中
    .limit(perPage).skip( page * perPage )
```

同样的修改我们也在`controllers/users.js`当中的查询用户列表中添加即可，然后我们在请求`url`的时候后面要添加上`q`参数。比如：`http://localhost:3001/topics?page=1&per_page=10&q=大学`,这样既有模糊搜索，又能将搜索后的结果进行分页

## 用户属性中的话题引用
这个问题我们在最开始就说过，之前我们在用户的资料中，地址，公司等一些资料都是字符串，但是在真实的场景中这些都是话题，这样其实是为了方便数据格式化，相同地址，相同行业的用户可以在统计的时候做分组，方便分析和推荐。

所以现在我们开始操作：<font color=#3eaf7c>话题引用代替部分用户属性</font>，这个操作之前我们在用户中的关注部分就已经做过了，保存的实际上是`ID`,本质上是某个`Schema`的引用：
```javascript
// 居住地(字符串数组)
  locations: { type: [{type: Schema.Types.ObjectId, ref: 'Topic'}], select: false },
  // 所在行业
  business: { type: Schema.Types.ObjectId, ref: 'Topic', select: false },
  // 职业经历（数组，数组里每个元素是个对象，对象有两个字段，其中公司必填，职位选填）
  employments: { 
    type: [{
      company: { type: Schema.Types.ObjectId, ref: 'Topic'},
      job: { type: Schema.Types.ObjectId, ref: 'Topic' }
    }],
    select: false
  },
  // 教育经历（数组，数组里每个元素是个对象，对象有很多字段）
  educations: {
    type: [{
      school: { type: Schema.Types.ObjectId, ref: 'Topic' },
      major: { type: Schema.Types.ObjectId, ref: 'Topic' },
      diploma: { type: Number,enum: [1,2,3,4,5]},
      entrance_year: { type: Number },
      graduation_year: { type: Number }
    }],
    select: false
  },
```
你可以对照之前的代码看看我们怎么替换，实际就是`type: String`改为了`type: Schema.Types.ObjectId, ref: 'Topic'`。

接着我们要想想，这样修改完，我们在请求用户列表是不会显示这些`select: false`的属性，但是在请求特定用户的时候，我们需要更多的资料，所以我们需要根据保存的`id`去填充他们的`Topic`,也就是完整的话题内容，之前这些都只是字符串。所以我们在`controllers/users.js`当中的`findById`方法做个简单的修改：
```javascript
  /**
   * 查询特定用户
   */
  async findById(ctx) {
    const { fields='' } = ctx.query      // 获取查询字符串中的fields
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')  // 形成+locations+business这种形式
    const populateStr = fields.split(';').filter(f => f).map(f => {
      if(f === 'employments'){
        return 'employments.company employments.job'
      }
      if(f === 'educations') {
        return 'educations.school educations.major'
      }
      return f
    }).join(' ')
    const user = await User.findById(ctx.params.id).select(selectFields).populate(populateStr)
    if(!user){
      ctx.throw(404,'用户不存在')
    }
    ctx.body = user
  }
```
上述代码可能有复杂，我们要来做个系统的分析，保持我们的思路清晰：
+ 首先访问特定用户，在不加查询字符串的情况下只显示`select: true`的属性，在查询字符串添加了你要查询的属性。比如`fields=following;locations;educations`我们要分情况
  + 假如查询的属性不是引用，我们就不用填充
  + 但是`following`和`locations`分贝是`User`和`Topic`的引用，所以我们要用`populate`方法填充这些属性
+ 当我们使用`populate`方法填充的的时候，参数是类似与`'following locations educations.major'`这种用空格分开的字符串，但也分两种情况
  + 因为`following`和`locations`本身整体是个引用，所以直接写`following locations`
  + 但是像`educations`和`employments`其中只有部分属性是引用，必须用点的方式，类似于`'employments.company employments.job'`
+ 最后根据我们在查询字符串中的需求来选择性的填充，所以代码当中`populateStr`这个参数不能写死。

**postman测试** :
+ 首先我们要创建好这样几个话题：阿里巴巴，华为，清华大学，计算机科学，北京，杭州，互联网，然后记住相应的id（在`postman`中请求我们之前写的新建话题那个接口，参数就这个这几个话题的名称）
+ 接着去修改某个用户的信息，我们之前修改用户信息都是字符串，比如`"locations": ["杭州","北京"]`
+ 我们刚刚不是创建了话题么，现在这些字符串全部替换为话题对应的id，如下：
  ```javascript
  {
    "name":"李雷",
    "avatar_url":"http://localhost:3001/uploads/upload_512f9dc45d3980b12d5bd46df6d9971c.png",
    "gender":"male",
    "headline":"我是李雷我怕谁",
    "locations": ["5d5a4ac6fb30e043b4b139cf","5d5a4acbfb30e043b4b139d0"],
    "business": "5d5a4ad8fb30e043b4b139d1",
    "employments": [
      {
        "company":"5d5a0a8728b4013b207b2353",
        "job":"5d5a0aa628b4013b207b2354"
      },
      {
        "company":"5d5a4b5afb30e043b4b139d2",
        "job":"5d5a0aa628b4013b207b2354"
      }
    ],
    "educations": [
      {
        "school": "5d5a0ab328b4013b207b2355",
          "major": "5d5a0abd28b4013b207b2356",
          "diploma": 3,
          "entrance_year": 2013,
          "graduation_year": 2017
      }
    ]
  }
  ```
+ 接着我们就能去查询特定用户了，我们就访问`http://localhost:3001/users/5d4b7bdb456c9d155caff755?fields=following;locations;educations;employments`，用户id用你自己创建的用户id，后面的`querystring`部分是一样的，这样我们就表示在查询用户信息的时候，返回的用户信息就会携带`following`,`locations`,`educations`,`employments`想关的完整信息，因为你修改的时候这些信息里保存着的是话题的id，此时是整个完整的话题的内容，因为我们使用引用和`Topic`这个`Schema`关联了，我下面展示一下我返回的个人信息：
```javascript
{
    "gender": "male",
    "locations": [
        {
            "_id": "5d5a4ac6fb30e043b4b139cf",
            "name": "杭州"
        },
        {
            "_id": "5d5a4acbfb30e043b4b139d0",
            "name": "北京"
        }
    ],
    "following": [
        {
            "gender": "male",
            "_id": "5d4b7a9ce7df852ac4ad7ef1",
            "name": "李雷3"
        },
        {
            "gender": "male",
            "_id": "5d4b7a80e7df852ac4ad7ef0",
            "name": "韩梅梅3"
        }
    ],
    "_id": "5d4b7bdb456c9d155caff755",
    "name": "李雷",
    "avatar_url": "http://localhost:3001/uploads/upload_512f9dc45d3980b12d5bd46df6d9971c.png",
    "educations": [
        {
            "_id": "5d5a4eb4bb250043b4c4e6ab",
            "school": {
                "_id": "5d5a0ab328b4013b207b2355",
                "name": "清华大学"
            },
            "major": {
                "_id": "5d5a0abd28b4013b207b2356",
                "name": "计算机科学"
            },
            "diploma": 3,
            "entrance_year": 2013,
            "graduation_year": 2017
        }
    ],
    "employments": [
        {
            "_id": "5d5a4eb4bb250043b4c4e6aa",
            "company": {
                "_id": "5d5a0a8728b4013b207b2353",
                "name": "阿里巴巴",
                "avatar_url": "http://localhost:3001/uploads/upload_512f9dc45d3980b12d5bd46df6d9971c.png"
            },
            "job": {
                "_id": "5d5a0aa628b4013b207b2354",
                "name": "前端专家"
            }
        },
        {
            "_id": "5d5a4eb4bb250043b4c4e6a9",
            "company": {
                "_id": "5d5a4b5afb30e043b4b139d2",
                "name": "华为"
            },
            "job": {
                "_id": "5d5a0aa628b4013b207b2354",
                "name": "前端专家"
            }
        }
    ],
    "headline": "我是李雷我怕谁"
}
```
