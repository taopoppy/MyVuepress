# 错误处理

## 错误处理简介
什么是<font color=#3eaf7c>错误处理</font>：
+ 编程语言或者计算机硬件里的一种机制
+ 处理软件或者信息系统中出现的异常状态

<font color=#3eaf7c>异常状况</font>有哪些？
+ 运行时错误，返回<font color=#CC99CD>500</font>: `javascript`语法没有错误，但是在运行的时候出了错，比如说求某个变量的属性，结果在运行的时候这个变量为`undefined`
+ 逻辑错误，返回<font color=#CC99CD>404</font>: 比如你请求的网页不存在
+ 先决条件错误，返回<font color=#CC99CD>412</font>: 比如你请求特定用户，而你写的用户id不存在或者就是瞎胡写的
+ 无法处理的实体，返回<font color=#CC99CD>422</font>: 比如参数格式不对

为什么要用错误处理？
+ 防止程序挂掉: `javascript`中防止程序挂掉的语法就是`try...catch...`,包括`koa`的源码也是用`catch`的一个`promise`
+ 告诉用户错误信息
+ 便于开发者调试

## koa自带错误处理
制造`404`,`412`,`500`三种错误，然后看看`koa`自带的错误处理做了什么

### 1. 404错误
模拟`404`错误非常简单，因为`404`错误是客户端的问题，比如我们请求了一个不存的`url`,或者我们对存在的`url`使用了不存在请求方法，都会返回`404`状态码，而且返回体是个`Not Found`的文本。

### 2. 412错误
`412`错误表示的先决条件失败，我们在`controllers/users.js`中添加一些代码:
```javascript
const db = [{name: "李雷"}]
class UsersCtl {
  findById(ctx) {
    if(ctx.params.id * 1 >= db.length){
      ctx.throw(412,'先决条件失败，用户id不存在，因为id大于等于数组长度')  // 手动抛错
    }
    ctx.body = db[ctx.params.id * 1];

module.exports = new UsersCtl();
```
当先决条件不符合的时候我们就要手动去抛出错误`ctx.throw(412)`,然后返回结果是`412`的状态码和`先决条件失败，用户id不存在，因为id大于等于数组长度`的文本。当然第二个参数不填的话就返回`Precondition Failed`的文本，意思也是先决条件失败。

### 3. 500错误
一般都是运行时错误，我们依然在`controllers/users.js`中添加一些代码:
```javascript
const db = [{name: "李雷"}]
class UsersCtl {
  find(ctx) {
    a.b                       // 发生运行时错误
    ctx.body = db
  }
module.exports = new UsersCtl();
```
上述代码语法没有问题，运行的时候就有问题，在`postman`会报状态码为`500`的错误，返回文本为`Internal Server Error`，然年在程序的命令行我们会发现`ReferenceError: a is not defined`的错误提示，下面会有错误堆栈的提示，我们只要按住`ctrl`点击错误提示路径，就能直接跳转到错误代码的地方。

这个就是`koa`自带的错误处理，但是虽然`koa`自带的错误处理在很多时候够用了，但是对于`RESTful`最佳实践我们希望返回的是`json`,而上述都是文本，下面我们还会去自己写中间件和使用社区优秀的第三方插件。

## 自己编写中间件
错误处理和中间件有什么关系？

如果<font color=#3eaf7c>你想自定义错误逻辑处理，那就要写一个中间件，并将中间件放再中间件链条的最前面，然后使用一个try catch语法，将next函数放在try语法当中，这样所有中间件的错误都能在try中捕获到</font>

开始编写中间件，我们在``index.js`启动文件中写下面的这样一段代码：
```javascript
// index.js
...
// 错误处理中间件
app.use(async (ctx,next) => {
  try {
    await next()
  } catch (error) {
    ctx.status = error.status || error.statusCode || 500
    ctx.body = {
      message: error.message
    }
  }
})

...
app.listen(3001,()=>{console.log('启动到了3001端口')})
```
<img :src="$withBase('/errorhand1.png')" alt="错误处理">

我们访问`http://localhost:3001/users/2`，然后在`controllers/users.js`中通过`ctx.thorw(412)`抛出了错误，在这里通过错误处理中间件捕获到错误，并以json形式返回。通过上图你可以看到`error`本身有`massage`,`name`,`stack`三个属性，然后继承自`HttpError`的三个属性`expose`，`status`，`statusCode`，所以我们返回`json`形式中`message`和`status`都是从`error`这个错误对象上拿到的，不是瞎编的。

所以我们手动写的这个错误处理实际已经能捕获到<font color=#3eaf7c> 手动抛出的错误</font> 和 <font color=#3eaf7c>运行时错误 </font>了，十分强大。但是值得注意的是：404错误是不走我们自己写的这个错误处理的中间件的

## koa-json-error
真实开发中，重复造轮子是不可取的，在众多错误处理的轮子中，`koa-json-error`是比较优秀的一款插件，因为这个插件专门针对`json`的，很符合`RESTful`的最佳实践的要求，另外还有很多丰富的功能，比如返回错误的堆栈信息到客户端，方便调试、还可以配置返回信息、还能在`400`,`404`的时候也返回json。

### 1. 安装
```bash
npm i koa-json-error --save
```

### 2. 使用默认配置
接着我们将使用`koa-json-error`的默认配置处理错误,在`index.js`文件中引入中间件并注册
```javascript
const error = require('koa-json-error')   // 引用

app.use(error()) // 注册
```
使用默认配置就是这么简单，下面我们将看看使用中间件后的错误返回都返回什么：
+ <font color=#3eaf7c>status</font>：状态码
+ <font color=#3eaf7c>name</font>：错误类型的名称
+ <font color=#3eaf7c>message</font>：错误信息
+ <font color=#3eaf7c>stack</font>：错误的堆栈信息
```javascript
// 测试404的返回结果
{
    "message": "Not Found",
    "name": "NotFoundError",
    "stack": "NotFoundError: Not Found\n    at Object.throw (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa\\lib\\context.js:97:11)\n    at next.then (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\_koa-json-error@3.1.2@koa-json-error\\lib\\middleware.js:52:58)\n    at process._tickCallback (internal/process/next_tick.js:68:7)",
    "status": 404
}
// 测试412的返回结果
{
    "message": "先决条件失败，用户id不存在，因为id大于等于数组长度",
    "name": "PreconditionFailedError",
    "stack": "PreconditionFailedError: 先决条件失败，用户id不存在，因为id大于等于数组长度\n    at Object.throw (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa\\lib\\context.js:97:11)\n    at findById (C:\\Users\\Administrator\\Desktop\\REST-API\\app\\controllers\\users.js:16:16)\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:44:32)\n    at next (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:45:18)\n    at C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\lib\\router.js:346:16\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:44:32)\n    at C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:36:12\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\lib\\router.js:351:31)\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-compose\\index.js:42:32)\n    at allowedMethods (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\lib\\router.js:407:12)",
    "status": 412
}
// 测试500的返回结果
{
    "name": "ReferenceError",
    "message": "a is not defined",
    "stack": "ReferenceError: a is not defined\n    at find (C:\\Users\\Administrator\\Desktop\\REST-API\\app\\controllers\\users.js:4:5)\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:44:32)\n    at next (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:45:18)\n    at C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\lib\\router.js:346:16\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:44:32)\n    at C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:36:12\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\lib\\router.js:351:31)\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-compose\\index.js:42:32)\n    at allowedMethods (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\lib\\router.js:407:12)\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-compose\\index.js:42:32)",
    "status": 500
}
// 测试422的返回结果
{
    "message": "Unprocessable Entity",
    "name": "UnprocessableEntityError",
    "stack": "UnprocessableEntityError: Unprocessable Entity\n    at Object.throw (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa\\lib\\context.js:97:11)\n    at create (C:\\Users\\Administrator\\Desktop\\REST-API\\app\\controllers\\users.js:15:16)\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:44:32)\n    at next (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:45:18)\n    at C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\lib\\router.js:346:16\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:44:32)\n    at C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\node_modules\\koa-compose\\index.js:36:12\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\lib\\router.js:351:31)\n    at dispatch (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-compose\\index.js:42:32)\n    at allowedMethods (C:\\Users\\Administrator\\Desktop\\REST-API\\node_modules\\koa-router\\lib\\router.js:407:12)",
    "status": 422
}
```

### 3. 修改配置
关于`koa-json-error`中间件的更多配置和学习参考[官网](https://www.npmjs.com/package/koa-json-error)或者[github](https://github.com/koajs/json-error)
最后我们来修改配置使其在生产环境下禁用错误堆栈的返回，因为可以从上述的返回结果中看见错误堆栈信息字段`stack`实际上有好多，我们在生产环境中不需要这个字段，所以我们想让其在生产环境中启动的时候去掉该字段,所以我们修改`index.js`中的代码如下：
```javascript
...
const error = require('koa-json-error')

app.use(error({
  postFormat: (e,{stack,...rest}) => process.env.NODE_ENV === 'production'? rest : {stack,...rest}
}))
...
```
上面这段代码啥意思，就是说我们是通过`postFormat`这个参数去配置返回信息的格式，返回信息是个对象，有四个参数，就是我们上面说的`message`,`name`,`stack`,`status`,只是我们把除了`stack`其他三个参数解构到一起。我们在生产环境的时候不需要`stack`，所以我们判断为生产环境的时候就只返回其他三个参数，开发环境就都返回，便于调试。

当然由于`windows`平台不能直接在`package.json`文件中的`scripts`中写`NODE_DEV=production`,所以我们又需要一个新的插件<font color=#3eaf7c>cross-env来帮助我们跨平台设置环境变量</font>,下载和使用如下：
```javascript
// 下载
npm install cross-env --save-dev

// 使用在package.json
 "scripts": {
    "start": "cross-env NODE_ENV=production pm2 app/index.js",
    "dev": "cross-env NODE_ENV=dev nodemon app/index.js"
  },
```
 
## koa-parameter参数校验
前面我们讲到`422`这个无法处理实体的错误，一般都是请求体的格式或者参数格式不对导致的，那么我们怎么判断参数格式正确的呢？

我们首先想到的就是`if-else`来对`ctx.request.body`中的参数的类型和是否必选都写一遍，但是很累赘，比如这样：
```javascript
 create(ctx) {
    if(typeof ctx.request.body.name !== 'string'){
      ctx.throw(422,'姓名必须为string类型')
    }
    if(typeof ctx.request.body.age !== 'number'){
      ctx.throw(422,'年龄必须为number类型')
    }

    .....
  }
```
所以我们选择更加优雅的`koa-parameter`

### 1. 安装koa-parameter
```bash
npm install koa-parameter --save
```
然后引入和注册
```javascript
const parameter = require('koa-parameter')

app.use(error({
  postFormat: (e,{stack,...rest}) => process.env.NODE_ENV === 'production'? rest : {stack,...rest}
}))
app.use(bodyparser()) // 注册body解析器
app.use(parameter(app)) // 注册参数校验中间件
```
+ 特别注意我们这个参数校验注册的顺序，<font color=#3eaf7c>错误处理中间件一定在最前面，参数校验一点在body解析器的后面</font>，因为对于请求体一定要先解析拿到手，再去校验其中参数的正确与否
+ 另外要注意，参数`app`不能忘记写，因为这个中间件是往`ctx`上面添加了一些方法来帮助校验的，后面你就能看到了

### 2. 检验测试
现在我们使用`post`请求`http://localhost:3001/users`，也就是新建用户，然后我们校验的代码是下面这样：
```javascript
//controllers/users.js
 create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      age: { type: 'number', required: false }
    })
    db.push(ctx.request.body);
    ctx.body = ctx.request.body
  }
```
我们校验了`name`和`age`字段，然后我们提交{ "name": 123}这样的错误格式来看看返回结果：
```javascript
{
    "message": "Validation Failed",
    "errors": [
        {
            "message": "should be a string",
            "code": "invalid",
            "field": "name"
        }
    ],
    "params": {
        "name": 123
    }
}
```
+ <font color=#3eaf7c>message</font>：错误信息类型名称
+ <font color=#3eaf7c>errors</font>：错误的具体信息
+ <font color=#3eaf7c>params</font>：错误的具体字段

上述错误我们就很能清楚的看到是`name`这个字段应该是`string`类型，但是你提交的是数字类型的

我们再提交{"age": 123}这样的缺失必要数据来看看返回结果：
```javascript
{
    "message": "Validation Failed",
    "errors": [
        {
            "message": "required",
            "field": "name",
            "code": "missing_field"
        }
    ],
    "params": {
        "age": 123
    }
}
```
上述错误就很清晰的看出`name`这个字段是必须要的，但是你没有传，关于`koa-parameter`中间件更多的配置和学习请参照[官网](https://www.npmjs.com/package/koa-parameter)或者[github](https://github.com/koajs/parameter)