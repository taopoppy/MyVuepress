# koa 来说 Hello World

## koa简介
`koa`官网一句话的简介：<font color=#3eaf7c>基于Node.js的下一代Web框架</font>

`koa`官网还有更详细的介绍：`Koa`是一个新的`web`框架，由`Express`幕后的原班人马打造， 致力于成为`web`应用和`API`开发领域中的一个更小、更富有表现力、更健壮的基石。 通过利用 `async`函数，`Koa`帮你丢弃回调函数，并有力地增强错误处理。`Koa`并没有捆绑任何中间件， 而是提供了一套优雅的方法，帮助您快速而愉快地编写服务端应用程序。

我们要从这段简介当中找出我们要理解`Koa`的几个关键点：
+ 首先相比`Express`,`Koa`的代码更轻量，只有大概500多行，它更容易让人看懂
+ 其次因为使用`async`函数代替回调函数，让异步代码更加同步化，使得我们可以用`try catch`去增强错误处理
+ 最后，单独使用`koa`其实任何事情都做不了，甚至不能创建服务器，但是由于社区存在大量的中间件，可以结合`koa`做任何事情，所以单独显得`koa`就更加轻量和简介

## 安装搭建第一个Koa程序
在PC端安装`Git`前提下，在桌面创建新的文件`REST-API`:
```bash
mkdir REST-API
```

然后使用`VScode`打开这个文件:
```bash
code REST-API
```
初始化项目：根据提示填写响应信息
```bash
npm init
```

下载`koa`
```bash
npm i koa --save
```

然后创建`index.js`文件,创建最简单的`web`服务,如果你使用原生或者`Express`开发过服务端你就知道使用`koa`是多么简单了
```javascript
// index.js
const koa = require('koa'); 
const app = new koa();

app.use((ctx)=> {
  ctx.body = 'hello world'
})

app.listen(3000)
```

下载`nodemon`方便我们重启
```bash
npm i nodemon --save-dev
```

在`package.json`中添加`start`命令：
```json
// package.json
{
  ...
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon index.js"   // 添加这一行
  },
  ...
}
```

## koa中间件和洋葱模型
### 1. async和await
首先我们在浏览器中去写这样一段代码:
```javascript
fetch('//api.github.com/users').then(res => res.json()).then(json => {
  console.log(json)
  fetch('//api.github.com/users/taopoppy').then(res => res.json()).then(json => {
    console.log(json)
  })
})
```
上面代码非常的丑陋，而且如果是多个异步请求，能无限嵌套下去，下面我们使用`async await`的方式去重写上面这段代码
```javascript
(async () => {
  const res = await fetch('//api.github.com/users')
  const json = await res.json()
  console.log(json)
  const res1 = await fetch('//api.github.com/users/taopoppy')
  const json1 = await res.json()
  console.log(json)
})()
```
### 2. 编写Koa中间件
我们每次使用`app.use`就是在使用一个中间件，一个中间件的本质就是一个`async`修饰的函数。因为中间件是用`async`来修饰的，所以返回的是个`Promise`，所以对于`next`表示下一个中间件函数的额时候，它的执行需要使用`await`来等待。
```javascript
// index.js
const koa = require('koa'); 
const app = new koa();

app.use(async (ctx, next) => {
  console.log(1)
  await next()
  console.log(2)
  ctx.body = 'hello RESTful API'
})

app.use(async (ctx, next) => {
  console.log(3)
  await next()
  console.log(4)
})

app.use(async (ctx, next) => {
  console.log(5)
})
app.listen(3000)
```
上述代码的请求在控制台打印的结果是 13542

### 3. 洋葱模型
<img :src="$withBase('/onion.png')" alt="onion">

每一个中间件对应的就是洋葱的一层皮，请求进来会按照中间书写的顺序一层一层经过，当请求被处理为响应后，它会倒序沿着中间层再出来。