# 实现JWT

## node中使用JWT
### 1. 安装`jsonwebtoken`这个包：
```bash
npm install jsonwebtoken
```
然后我们本次先使用的命令行的方法，打开`vscode`的命令行，在终端的项目路径中输入`node`，我们就在这个环境下测试

### 2. 签名
```javascript
C:\Users\Administrator\Desktop\REST-API>node
> jwt = require('jsonwebtoken')
{ decode: [Function],
  verify: [Function],
  sign: [Function],
  JsonWebTokenError: [Function: JsonWebTokenError],
  NotBeforeError: [Function: NotBeforeError],
  TokenExpiredError: [Function: TokenExpiredError] }
> token = jwt.sign({name:'taopoppy'},'secret')
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGFvcG9wcHkiLCJpYXQiOjE1NjUxNjY1MDl9.6zlun7j_pdLz-PpwhctDpzYSM498A-Y8XiHOdYr1vvM'
>
```
可以看到，我们使用<font color=#CC99CD>jwt.sign</font>方法输入用户信息和秘钥就能生成`token`

### 3. 验证
那么服务端怎么验证呢，必须先验证用户是谁，通过解码的方式,这里有两个方法注意,<font color=#CC99CD>jwt.decode</font>和<font color=#CC99CD>jwt.verify</font>
```javascript
> jwt.decode(token)
{ name: 'taopoppy', iat: 1565166509 }
```
`jwt。decode`只是对令牌进行简单的`base64`的解码，但是不能证明用户信息是否正确，所以我们必须要在解码的同时验证用户信息是否被篡改，所以我们要加上秘钥，使用`jwt.verify`方法
```javascript
> jwt.verify(token,'secret')
{ name: 'taopoppy', iat: 1565166509 }
>
```
虽然上述代码中两个方法结果一样，因为我们只是演示了一下，但是第二个方法`jwt.verify`验证的结果是可靠的，用户信息是没有被篡改过的。如果你使用错误的秘钥和错误的`token`，使用`jwt.verify`就无法验证通过，这就保护了用户信息的安全性

## 实现用户注册
### 1. 设计用户Schema
我们重新设计用户的`Schema`，在`models/users.js`中修改代码：
```javascript
// 定义文档结构
const userSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  password: { type: String, required: true, select: false }
})
```
可以看到我们在`password`字段中使用`select`这个属性，这个属性设置为`false`，则在用户信息中不会显示`password`这个字段，保证了安全性。另外`__v`这个属性也没有啥用，我们也不让其显示了。

添加了`password`这个字段后我们相应的要在新建用户和更新用户的控制器中的检验参数的代码中添加`password`
```javascript
// 新建用户
async create(ctx) {
    // 校验
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true}
    });

    ...
  }

// 更新用户
async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false}
    })
    
    ...
  }
```
可以看到为什么在更新用户`name`和`password`的`require`属性为`false`,因为更新用户，说白了就是编辑用户资料，可以只修改密码，也可以只修改用户名，所以每个字段都是可选的。<font color=#3eaf7c>也正是因为这个原因，我们更新用户的请求方法要变为patch</font>

### 2. 编写保证唯一性的逻辑
下面我们给出新建用户的控制器全部代码，其中包含验证用户唯一性的代码：
```javascript
  /**
   * 新建用户
   */
  async create(ctx) {
    // 校验
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true}
    });
    // 验证用户唯一性
    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({ name })
    if(repeatedUser) {
      ctx.throw(409,'用户已经存在')
    }
    // 新建用户
    const newUser = await new User(ctx.request.body).save(); //数据库会自动帮我们添加ID
    ctx.body = newUser
  }
```
可以看到，我们这里只用简单验证用户名，其实对于邮箱，手机号都是这样的验证方式而已,但是更重要的是<font color=#3eaf7c>409</font>这个状态码，表示冲突的意思。

## 实现登录并获取token
### 1. 登录接口设计
我们在最开始说`github`的时候，它就有一个转移仓库的接口，不属于增删改查中的任何一种，它使用的方式是：<font color=#3eaf7c>post</font> + <font color=#3eaf7c>动词</font>的形式：

所以我们在路由中关于登录接口的名称和方法如下：
```javascript
router.prefix('/users')
...
router.post('/login',login)
```

### 2. 生成token
我们下面展示关于登录控制器的所有代码，注意其中密钥写在`config.js`当中，随意写个字符串即可
```javascript
  // 登录
  async login(ctx) {
    // 检验
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true}
    })
    // 验证用户名和密码是否匹配
    const user = await User.findOne(ctx.request.body)
    if(!user) {
      ctx.throw(401, '用户名或者密码不正确')
    }
    // 生成token并返回
    const { _id, name } = user
    const token = jsonwebtoken.sign({ _id, name }, secret, {
      expiresIn: '1d'
    })
    ctx.body = { token }
  }
}
```
注意我们在生成令牌的方法`sign`中，第一个参数表示用户的信息，我们这里只取`id`和`name`，然后第二个参数是密钥，第三个参数是一个配置对象，我们在这里只简单的配置了过期时间为一天

## 自己编写中间件实现用户认证和授权

### 1. 认证
认证就是告诉服务器你是谁，表现在代码中就是我们写一段代码，从`token`中获取用户信息，这些代码要写在中间件中，因为很多接口都需要认证这个环节

我们首先在这里讲`postman`的小技巧：
  + 因为在登录接口中我们会返回`token`，但是有过期时间，如果每次复制很难受，我们就在`Tests`那一栏中写一个自动化脚本：
  ```javascript
  var jsonData = pm.response.json();
  pm.globals.set("token",jsonData.token);
  ```
  意思就是返回的结果`jsonData`我们先`json`化，然后将结果中的`token`字段的值保存在全局变量`token`中
  + 然后在修改用户接口中我们需要认证就需要在`Authorization`中选择`Bearer Token`,在右边的`Token`的输入框中输入`{{token}}`，意思就是每次请求的时候，会自动帮你在`http`头中添加`Authorization: Bearer token`其中`token`就是全局变量`token`，就是登录的时候返回的一串乱码

我们在`routes/users.js`中添加下面的代码：
```javascript
const auth = async (ctx, next)=> {
  // 根据token取用户信息
  const { authorization = '' } = ctx.request.header   
  const token = authorization.replace('Bearer ','')
  try {
    const user = jsonwebtoken.verify(token, secret)
    // 用户信息保存在ctx.state.user上
    ctx.state.user = user
  } catch (error) {
    ctx.throw(401, error.message)
  }
  await next()
}
```
+ 首先拿到令牌，假如对面没有传，我们给`authorization`赋初值,然后去掉`Bearer `的前缀
+ 使用`verify`拿到并校验用户信息是否被篡改，这里为什么要放到`try catch`中，因为，如果用户信息被篡改，`verify`方法本身会报`500`错，但是我们希望报给用户`401`的错误

然后我们在更新用户和删除用户的路由中添加上述认证的中间件`auth`：
```javascript
router.patch('/:id',auth, update)
router.delete('/:id',auth, deleteById)
```

### 2. 授权
不同的用户有不同的权限，比如自己只能修改自己的用户信息，自己只能删除自己的信息，不能的动别人的信息，所以要保证既是已经认证的用户并且也有相应的权限。我们在`controllsers/users.js`中书写下面代码：
```javascript
  /**
   * 用户授权
   */
  async checkOwn(ctx, next) {
    if(ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403,'该操作没有权限')
    }
    await next()
  }
```
很简单，就是你要修改或者删除的`id`和自己的`id`不一致你就没有权限操作，那这里我们用的状态码<font color=#3eaf7c>403</font>就是表示没有权限的意思。然后在`routes/users.js`路由中添加这个中间件即可：
```javascript
router.patch('/:id', auth, checkOwn, update)
router.delete('/:id', auth, checkOwn, deleteById)
```
## 使用koa-jwt实现用户认证和授权

### 1. 安装koa-jwt
```bash
npm install koa-jwt --save
```
### 2. 认证
因为`koa-jwt`只能做认证，授权依然需要我们上述的方式，所以认证其实是用`koa-jwt`十分简单，只需要一行代码，我们在`routes/users.js`中修改`auth`中间件即可：
```javascript
const jwt = require('koa-jwt')

// 用户认证
const auth = jwt({secret})
```
其他的都不用变，所以其实是用社区第三方包的功能更强大，功能更完善，当然关于`koa-jwt`的配置还有很多，详细的可以查看[github官网](https://github.com/koajs/jwt)
