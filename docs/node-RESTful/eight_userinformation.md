# 个人资料

## 个人资料需求分析
我们可以去知乎的个人主页上看看，借鉴一下知乎的个人主页的那个信息，首先我们一个个分析，资料里这些属性的本质
+ 图片：本质就是一个字符串，记录的值图片的链接
+ 姓名：字符串
+ 性别：可枚举的字符串
+ 一句话介绍：字符串
+ 居住地：数组，数组里的每个元素是个字符串
+ 所在行业：可枚举的字符串
+ 职业经历：数组，数组里每个元素是个对象，对象有两个字段，其中公司必填，职位选填
+ 教育经历：数组，数组里每个元素是个对象，对象有很多字段
+ 个人简介：字符串

可以看到我们在用户列表，或者用户信息中有很多字段和子字段，按照`RESTful`最佳实践我们不会返回所有字段，我们后面要用到<font color=#3eaf7c>字段过滤</font>

## 个人资料的Schema设计
我们知道`MongoDB`是`Schema free`的，所以这里的`Schema`就是`json`的数据结构,我们更具上面需求分析的来重写一下`Schema`
```javascript
const userSchema = new Schema({
  // 干扰字段
  __v: { type: Number, select: false },
  // 姓名
  name: { type: String, required: true },
  // 密码
  password: { type: String, required: true, select: false },
  // 头像
  avatar_url: { type: String },
  // 性别(可枚举的字段，使用enum规定可枚举的值，使用default属性设置默认值)
  gender: { type: String, enum: ['male','famale'], default: 'male', required: true },
  // 一句话介绍
  headline: { type: String},
  // 居住地(字符串数组)
  locations: { type: [{type: String}] },
  // 所在行业
  business: { type: String },
  // 职业经历（数组，数组里每个元素是个对象，对象有两个字段，其中公司必填，职位选填）
  employments: { 
    type: [{
      company: { type: String },
      job: { type: String }
    }]
  },
  // 教育经历（数组，数组里每个元素是个对象，对象有很多字段）
  educations: {
    type: [{
      school: { type: String },
      major: { type: String },
      diploma: { type: Number,enum: [1,2,3,4,5]},
      entrance_year: { type: Number },
      graduation_year: { type: Number }
    }]
  }
})
```
以上就是关于文档结构的设计，更多文档结构的写法可以去官网上学习更多

## 个人资料的参数校验
虽然用户的`Schema`我们改的比较复杂，但是参数的校验我们只会在更新用户的接口中出现，因为新建用户就只需要用户名和密码，不可能让用户在新建用户的时候填写那么多资料,所以我们只需要修改`controllers/users.js`中更新的接口：
```javascript
  /**
   * 更新用户
   */
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false },
    })
    const updateUser = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if(!updateUser){
      ctx.throw(404,'更新用户不存在')
    }
    ctx.body = updateUser
  }
```
然后我们就可以在`postman`上面去测试一下，我们需要先去登录一下，然后去修改用户信息，我们下面给出向修改用户接口提交的`json`结构，然后提交
```javascript
{
	"name":"李雷",
	"avatar_url":"http://localhost:3001/uploads/upload_512f9dc45d3980b12d5bd46df6d9971c.png",
	"gender":"male",
	"headline":"我是李雷我怕谁",
	"locations": ["杭州","北京"],
	"business": "互联网",
	"employments": [
		{
			"company":"阿里巴巴",
			"job":"前端工程师"
		},
		{
			"company":"华为",
			"job":"资深前端专家"
		}
	],
	"educations": [
		{
			"school": "清华大学",
    		"major": "计算机",
    		"diploma": 3,
    		"entrance_year": 2013,
    		"graduation_year": 2017
		}
	]
}
```

## 字段过滤
+ <font color=#3eaf7c>RESTful最佳实践一</font>：<font color=#CC99CD>我们在请求某个特定对象接口的时候，可以通过查询字符串上的一些字段来选择性的选择那些字段显示，哪些字段不显示</font> 
+ <font color=#3eaf7c>RESTful最佳实践二</font>：<font color=#CC99CD>在请求资源列表的时候我们往往不在列表的每个字段中显示大量字段，只显示一小部分字段，只有请求特定资源时，才会显示大量字段，而且有些字段还会被用户过滤掉</font>

### 1. 设计Schema默认隐藏部分字段
当你去看知乎的`API`你会发现在用户列表只有姓名，性别，头像和一句话简介，所以我们在上面设计的其他比如像教育经历和职业经历都应该在列表这种场景中不显示，所以我们通过` select: false`这个配置将其隐藏掉即可
```javascript
const userSchema = new Schema({
  // 干扰字段
  __v: { type: Number, select: false },
  // 姓名
  name: { type: String, required: true },
  // 密码
  password: { type: String, required: true, select: false },
  // 头像
  avatar_url: { type: String },
  // 性别(可枚举的字段，使用enum规定可枚举的值，使用default属性设置默认值)
  gender: { type: String, enum: ['male','famale'], default: 'male', required: true },
  // 一句话介绍
  headline: { type: String},
  // 居住地(字符串数组)
  locations: { type: [{type: String}], select: false },
  // 所在行业
  business: { type: String, select: false },
  // 职业经历（数组，数组里每个元素是个对象，对象有两个字段，其中公司必填，职位选填）
  employments: { 
    type: [{
      company: { type: String },
      job: { type: String }
    }],
    select: false
  },
  // 教育经历（数组，数组里每个元素是个对象，对象有很多字段）
  educations: {
    type: [{
      school: { type: String },
      major: { type: String },
      diploma: { type: Number,enum: [1,2,3,4,5]},
      entrance_year: { type: Number },
      graduation_year: { type: Number }
    }],
    select: false
  }
})
```
此时我们请求用户列表就只会显示姓名性别，用户头像和一句话简介，还有存于数据库中的`id`了，当我们请求特定用户的时候也是这样。

### 2. 通过查询字符串显示隐藏字段
如果我们在请求特定用户，需要显示一些被隐藏的字段，我们在最佳实践中使用的通过查询字符串，比如我们还想查看`locations`和`business`这两个字段，我们就在`url`后面添加这样的查询字符串：`?fields=locations;business`，然后我们回到`controllser/users.js`修改查询特定用户的控制器代码：
```javascript
  /**
   * 查询特定用户

   */
  async findById(ctx) {
    const { fields } = ctx.query      // 获取查询字符串中的fields
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')  // 形成+locations+business这种形式
    const user = await User.findById(ctx.params.id).select(selectFields)
    if(!user){
      ctx.throw(404,'用户不存在')
    }
    ctx.body = user
  }
```
然后我们就能通过这种方式去查询特定用户的其他隐藏字段`locations`,`business`，`educations`，访问的`url`:`http://localhost:3001/users/5d4b7bdb456c9d155caff755?fields=locations;business;educations`,当然我们也可以通过下面两种方式只查询默认字段：
+ `http://localhost:3001/users/5d4b7bdb456c9d155caff755?fields=`
+ `http://localhost:3001/users/5d4b7bdb456c9d155caff755?fields=;`

当然上面代码可能还有欠缺，因为并没有做`fields`的存在校验，如果没有写查询字符串，访问的地址直接就是`http://localhost:3001/users/5d4b7bdb456c9d155caff755`，那么代码肯定就报状态码为500的错误，因为`fields`的值就是`undefined`，相关的字符串和数组的方法也都不存在了。所以我们可以给`fields`设置默认值如下：
```javascript
const { fields='' } = ctx.query 
```
