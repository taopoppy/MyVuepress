# koa路由与RESTful API

## 路由简介
### 1. 路由是什么
<font color=#3eaf7c>路由决定了不同URL是如何被不同地执行的</font> ，在`Koa`当中，路由的本质是一个中间件

### 2. 为什么要用路由

+ **如果没有路由**

  如果没有路由，所有请求都做了相同的事情，都会返回相同的结果
+ **路由存在的意义**

  处理不同地`url`,处理不同地`HTTP`方法，解析`URL`上的参数

## 自己编写Koa路由中间件
之前说过中间件就是函数，那么路由中间件就是去处理不同的请求`url`,我们下面去写一个简单的路由中间件
```javascript
// index.js
const koa = require('koa'); 
const app = new koa();

app.use(async (ctx, next) => {
  if(ctx.url === '/') {
    ctx.body = "这是首页"
  } else if(ctx.url === '/users') {
    if(ctx.method === 'GET') {
      ctx.body = "这是用户列表"
    } else if(ctx.method === 'POST') {
      ctx.body = "创建用户"
    } else {
      ctx.status = 405
    }
    ctx.body = "这是用户列表"
  } else if(ctx.url.match(/\/users\/\w+/)){
    const userId = ctx.url.match(/\/users\/(\w+)/)[1]
    ctx.body = `这是用户 ${userId}`
  } else {
    ctx.status = 404 
  }
})

app.listen(3000)
```
很明显，我们自己写的这种中间件太多简陋，而且使用`if-else`的方式去判断`url`和`method`实在太愚蠢，所以接下来我们会使用社区标准的`koa-router`中间件

## 使用koa-router实现路由

下载`koa-router`中间件
```bash
npm i koa-router --save
```
然后我们在代码中演示一下使用：
```javascript
// index.js
const koa = require('koa'); 
const Router = require('koa-router')                       // 引入中间件
const app = new koa();
const router1 = new Router()                              // 创建实例
const router2 = new Router({prefix:'/user'})              // 创建实例

router1.prefix('/home')
router1.get('/homepage', async (ctx) => {     // 编写路由
  ctx.body = "这是主页"
})
router1.get('/homeusers', async (ctx) => {    // 编写路由
  ctx.body = "这里是用户列表"
})
router1.post('/homedelete', async (ctx) => {
  ctx.body = "这里是主页推退出界面"
})


router2.post('/warehouse', async (ctx) => {   // 编写路由
  ctx.body = "创建用户列表"
})
router2.get('/warehouse/:id', async (ctx) => { // 编写路由
  ctx.body = `这是用户 ${ctx.params.id}`
})

app.use(router1.routes(),router1.allowedMethods()) // 注册
app.use(router2.routes(),router2.allowedMethods()) // 注册

app.listen(3001)
```
要注意的是：
+ 我们一般在大型项目中编写路由的代码都会单独拿出去写，只在`app.js`当中注册而已
+ 注册的时候，必须使用路由对象的`routes`方法进行注册，而`allowedMethods()`方法的作用是当所有路由中间件执行完成之后,若`ctx.status`为空或者`404`的时候,丰富`response`对象的`header`头，这个方法我们还会在后续进行讲解
+ 上述提供了两种使用前缀的方法，`const router2 = new Router({prefix:'/user'})` 和 `router1.prefix('/home')`
+ 新创建的路由都必须使用`app.use()`方法进行注册

另外这种路由还能使用多个中间件，特别在鉴权的时候使用的最多
```javascript
const auth = async(ctx,next) => {
  if(ctx.url === '/home/homepage') {
    ctx.throw(401)
  }
  await next()
}

router1.prefix('/home')
router1.get('/homepage', auth, async (ctx) => {   // 在访问前会先执行auth这个中间件去判断有没有权限
  ctx.body = "这是主页"
})
```

## 从options到allowedMethods
了解options方法的意图在于理解跨域和理解`koa-router`中的`allowedMethods`的作用

### 1. options的作用
**<font color=#CC99CD>options可以检测服务器所支持的请求方法</font>**

比如我们使用`options`去请求一个接口，在返回的数据中有个字段叫做`Allow`,这个字段中会包含该接口所支持的所有请求方法的名称

**<font color=#CC99CD>CROS中的预检请求</font>**

因为在跨域中服务器如果设置了跨域，对于跨域的请求会进行方法的限制，所以请求之前会发一个`method`为`options`的预请求，看自己的请求方法是否在服务器跨域关于`methods`设置当中，如果在，立马会正确的发送原本的请求。假如你发了一个`DELETE`的请求，但在服务器的`Access-Control-Allow-Methods`设置中没有，所以关于`DELETE`请求就会失败

### 2. allowedMethods方法的作用
前面我们说过：<font color=#3eaf7c>allowedMethods() 方法的作用是当所有路由中间件执行完成之后,若 ctx.status 为空或者 404的时候,丰富 response 对象的 header 头</font> 。这种是官网的一种说法，那到底什么意思，我们下面有两种经常出现的写法，我们分别看看`allowedMethods`的作用
```javascript
// index.js
...
router2.post('/warehouse', async (ctx) => {   
  ctx.body = "创建用户列表"
})
router2.get('/warehouse/:id', async (ctx) => {
  ctx.body = `这是用户 ${ctx.params.id}`
})

app.use(router2.routes())
...

```
上面这里例子，当你使用`postman`去测试`http://localhost:3001/warehouse/taopoppy`这个接口时你会发现除了使用`GET`方法之外，其余所有的`Methods`返回的都是`404`，但是实际上站在返回码的角度上，返回码是应该能最直接的返回响应信息的，如果全是`404`,开发者其实获取不到任何信息，我们应该尽量多的使用丰富的状态码去告诉开发者响应到底是什么类型的信息。

<font color=#CC99CD>第一种写法</font>
```javascript
app.use(router2.routes())
app.use(router2.allowedMethods())
```
这样写了后，我们使用除了`GET`、`HEAD`、`OPTIONS`的其他方法会返回`405`（不允许）或者`501`（没实现）状态码：
+ 因为像`POST`,`PUT`,`PATCH`,`DELETE`等方法我们并没有去写，所以不允许通过这些方法去访问我们的接口，所以我们用`405`来表示。
+ 另外`koa-router`这个中间件只支持一般的请求方法，像`LOCK`,`UNLOCK`,`LINK`这些我们可能都没有见到过的请求方法`postman`就没有实现，所以使用`501`来表示。

所以我们总结一下`405`和`501`的区别就是：<font color=#3eaf7c>有能力没写用405，没能力管你写没写都是501</font> 

<font color=#CC99CD>第二种写法</font>
```javascript
app.use(router2.routes(),router2.allowedMethods())
```
这种写法的效果和`app.use(router2.routes())`基本一样，区别在于只对你已书写的方法和理论上的方法去添加状态码，就是除了`GET`和`HEAD`其他方法都是`404`

## 增删改查的响应最佳实践
+ <font color=#CC99CD>增</font>：返回当前增加的数据，通常是一个对象
+ <font color=#CC99CD>删</font>：返回204状态码，表示成功了但是没有内容
+ <font color=#CC99CD>改</font>：返回当前增加的数据，通常是一个对象
+ <font color=#CC99CD>查</font>：查列表就返回数组，查单个信息就返回数组中某一项

**参考资料**
1. [koa的allowedMethods是什么意思](https://segmentfault.com/q/1010000008703786)
2. [koa-router allowedMethods](https://www.jianshu.com/p/fef91266a44c)
3. [编写Node.js Rest API的10个最佳实践](https://juejin.im/entry/58bad680128fe1007e4fcf3b)