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
