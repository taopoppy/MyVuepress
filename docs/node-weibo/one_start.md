# 开始项目

## 项目创建
<font color=#1E90FF>**① 安装koa-generator**</font>

`koa-generator`是用来搭建`koa2`项目的一个脚手架，我们直接到[npm官网](https://www.npmjs.com/package/koa-generator)上去找到全局安装命令并在任意目录下执行即可：
```javascript
npm install -g koa-generator
```

<font color=#1E90FF>**② 创建项目**</font>

因为全局安装了脚手架，现在我们的命令行当中就有`koa2`这个命令了，因为我们需要通过`ejs`模块引擎来渲染前端页面，所以我们的创建命令如下：
```javascript
koa2 -e koa2-weibo-code
```

接着它会提示你要进入目录并且安装依赖，我们就继续执行命令：
```javascript
cd koa2-weibo-code && npm install
```

如果网络比较差，建议使用`cnpm`或者在后面添加淘宝镜像参数，命令如下：
```javascript
npm install --registry=https://registry.npm.taobao.org
```

## 提交代码和迭代
下面所有的命令我们都在刚才创建的`koa2-weibo-code`项目文件中执行
<font color=#1E90FF>**① 初始化一个git仓库**</font>  
```javascript
git init
```

<font color=#1E90FF>**② 添加远程仓库源**</font>  
```javascript
git remote add origin git@e.coding.net:taopoppy/koa2-weibo-code.git
```

添加完成可以使用`git status`来查看本地仓库的状态

<font color=#1E90FF>**③ 拉取远程仓库内容**</font>  
```javascript
git pull origin master
```
拉取后就会将远程仓库中的`.gitIgnore`或者`READM.md`拉取到本地，当然取决于你在`github`或者`coding.net`上面的创建方式了。

<font color=#1E90FF>**④ 提交**</font>  
```javascript
git add .
git commit -m "init project"
git push origin master
```

## 完善其他
下面讲两个需要注意的问题：
+ 第一个就是如果你从远程拉取下来的是`.gitIgnore`,你只需要添加`README.md`文件即可，如果拉取的是`README.md`，你需要自己添加`.gitIgnore`文件
+ 下载`cross-env`用于设置环境变量的插件
  ```javascript
  npm i cross-env -D
  ```
  然后在`package.json`当中修改启动命令： 
  + `"dev": "cross-env NODE_ENV=dev ./node_modules/.bin/nodemon bin/www"`,
  + `"prd": "cross-env NODE_ENV=production pm2 start bin/www"`,

## 项目结构讲解
整个项目在创建完毕和提交完毕后，我们就先来看看原始的目录结构，并简单了解一下，由于原始文件太裸露，通常我们在企业项目中业务的代码都会放在一个`src`文件夹下面，所以我们先修改一下结构：
+ <font color=#DD1144>在项目的目录下创建一个src目录</font>
+ <font color=#DD1144>将public文件夹、routes文件夹、views文件夹和app.js文件全部移动到我们新创建的src文件夹下面</font>
+ <font color=#DD1144>对应着改变一下路由的引入（我这里只修改了WWW里面对app的引用路由，因为app现在移动了到src里面）</font>
```javascript
+ bin
  + WWW  // 启动文件
+ node_modules   // 依赖文件夹
+ src // 业务代码文件
  + public // 静态资源文件夹
    + images
    + javascripts
    + stylesheets
  + routes // 路由文件夹
    + index.js
    + users.js
  + views  // ejs模板文件夹
    + error.ejs
    + index.ejs
  + app.js  // 实际启动文件
+ package-lock.json // 包锁文件
+ package.json // 包管理配置文件
```
+ 我们首先来看`WWW`文件，因为往往我们启动的文件应该是`index.js`或者是`app.js`，但是在真正的企业级开发的时候：<font color=#3eaf7c>业务app和server app应该是分开的</font>，所以你看到`app.js`当中有很多路由注册还有中间件的添加都是和业务有关系的，<font color=#3eaf7c>而WWW是将创建http服务的这个创建server的代码从app当中抽离了出来</font>，所以这个文件你也不需要改，也不用管太多。

+ 而`app.js`这个文件只是返回了一个`Koa`的实例而已，这样的拆分也比较符合开放封闭原则，而里面的内容我们需要详细讲解一下
```javascript
// error handler
onerror(app)    // 处理错误的，发生了错误会在页面显示出来

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))             // 负责解析post请求中发送的json数据、form数据等等
app.use(json()) // 通过bodyparser解析出来是字符串形式的，通过json解析成为对象格式的
app.use(logger()) // 日志功能
app.use(require('koa-static')(__dirname + '/public')) // 将public这个目录注册为静态资源，通过http://localhost:3000/stylesheets/style.css可以直接访问css文件

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))    // 注册ejs，能让ejs正常编译

// routes
app.use(index.routes(), index.allowedMethods()) // 注册路由
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});     // 控制台打印错误，和前面的onerror(app)是不一样的，前面的onerror(app)是在客户端页面上显示错误的
```

然后我们提交一下代码：
```javascript
git add .
git commit -m 'refactor: 调整目录结构'
git push origin master
```

## 路由粗解
<font color=#1E90FF>**① 路由参数**</font>

```javascript
router.get('/profile/:userName', async (ctx, next) => {
  const { userName } = ctx.params
  ctx.body = {
    title: 'this is profile page',
    userName
  }
})
```
+ 通过这种书写`:userName`这个来实现动态路由参数的使用
+ 在服务端通过`ctx.params`拿到前端传来的具体参数值  
比如我们在前端输入`http://localhost:3000/profile/zhangsan`,那么我们在页面得到的服务端的返回值如下：
```javascript
{
  "title": "this is profile page",
  "userName": "zhangsan"
}
```
动态参数可以写多个，都可以通过`ctx.params`对象中解构出来

<font color=#1E90FF>**② Post参数**</font>

```javascript
router.post('/login', async (ctx, next) => {
  const { userName, password } = ctx.request.body
  ctx.body = {
    userName,
    password
  }
})
```

+ 因为前端发来的数据通过我们之前引用的中间件`koa-bodparser`和`json`已经解析成为了一个对象，并且绑定在了`ctx.request.body`上面，然后我们就能对拿到的数据做校验等操作了
+ 至于为什么绑定在`ctx.request.body`上面，因为`ctx.body`已经被占用了
+ 除了`get`请求，其他请求我们需要借助`PostMan`来测试，这个我们在这里就不仔细说了，相信你肯定会。

最后我们提交一下代码：
```javascript
git add .
git commit -m "feat：路由演示"
git push origin master
```
