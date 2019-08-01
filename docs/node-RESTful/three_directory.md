# REST合理的目录

## 路由
### 1. 路由格式
在`RESTful`风格中我们希望这样处理路由：<font color=#3eaf7c>**将路由单独放在一个目录**</font>

我们需要单独创建一个`routes`的文件夹，然后将路由的`.js`文件全部放进来，比如`routes/home.js`文件中的内容如下：
```javascript
const Router = require('koa-router');
const router = new Router();

router.get('/',(ctx) => {
  ctx.body = '<h1>这里是主页</h1>'
})

module.exports = router
```
基本上所有的路由文件都是这样，需要我们将每个文件中的`router`导出，在项目启动文件`index.js`当中去导入并使用`app.use()`的方法去注册，但是这样不是很麻烦么，我们下面就来写一个自动化脚本来帮助我们去自动将`routes`文件中的所有路由文件读取。

### 2. 批量读取和注册
首先在`routes`文件中创建`index.js`文件来书写自动化脚本的代码，代码如下：
```javascript
const fs = require('fs')
module.exports = (app) =>{
  fs.readdirSync(__dirname).forEach(file => {
    if(file === 'index.js') { return; }
    const route = require(`./${file}`)
    app.use(route.routes()).use(route.allowedMethods())
  })
}
```
上面这些代码的意思就是我们依次读取`routes`文件夹下的所有文件，从这些文件中拿到路由，并注册到app上面，就是这么的简单。当然`routes`文件夹中还有`index`本身，我们要剔除

然后在项目启动文件`index.js`中引入并使用即可
```javascript
// index.js
...
const routing = require('./routes/index') //引入
...
routing(app) // 批量注册路由 

```

## 控制器
在`RESTful`风格中我们希望这样<font color=#CC99CD>处理</font>控制器：<font color=#3eaf7c>**将控制器单独放在一个目录**</font>

在`routes`文件夹的同级新建一个文件夹`controllers`，然后创建与路由文件中相同的文件名，比如`users.js`，`home.js`等等。那我们知道控制器本身是中间件，中间件本身又是函数，所以我们在控制器`controllers`文件夹中的文件中导出一堆函数即可，下面我们会演示怎么使用<font color=#3eaf7c>类方法</font>去书写控制器

在`controllers/home.js`中书写下面的代码:
```javascript
class HomeCtl {
  index(ctx) {
    ctx.body = '<h1>这里是主页</h1>'
  }
}
module.exports = new HomeCtl();
```
这样我们写的方法都在一类当中，然后导出一个类实例，我们在路由部分`routes/home.js`就可以像下面这样去书写：
```javascript
...
const { index } = require('../controllers/home')  //导入控制器
router.get('/', index) // 使用控制器
...
```

## 类方法
在`RESTful`风格中我们希望这样<font color=#CC99CD>组织</font>控制器：<font color=#3eaf7c>**使用类 + 类方法的方式组织控制器**</font>

在上面其实已经展示了类方法去实现控制器，我们下面把`route/users.js`和`controllers/users.js`的代码也贴出来
+ `route/users.js`文件中的代码如下：
```javascript
const Router = require('koa-router');
const router = new Router();
const { 
  find,
  findById,
  create,
  update,
  deleteById
} = require('../controllers/users')
router.prefix('/users')

router.get('/', find)

router.post('/', create)
router.get('/:id', findById)
router.put('/:id', update)
router.delete('/:id', deleteById)

module.exports = router
```
+ `controllers/users.js`文件中的代码如下：
```javascript
const db = [{name: "李雷"}]
class UsersCtl {
  find(ctx) {
    ctx.body = db
  }
  findById(ctx) {
    ctx.body = db[ctx.params.id * 1];
  }
  create(ctx) {
    db.push(ctx.request.body);
    ctx.body = ctx.request.body
  }
  update(ctx) {
    dbp[ctx.params.id * 1] = ctx.request.body
    ctx.body = ctx.request.body
  }
  deleteById(ctx) {
    db.slice(ctx.params.id * 1, 1)
    ctx.status = 204
  }
}

module.exports = new UsersCtl();
```

这样的代码其实很有层次感而且维护起来也很容易，后面我们会来看看错误处理这一个难点。