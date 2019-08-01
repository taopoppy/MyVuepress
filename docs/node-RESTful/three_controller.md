# 控制器

## 什么是控制器
前面我们讲路由是根据不同地`url`分配不同地任务，<font color=#3eaf7c>控制器就是拿到不同地任务并执行</font>，前面我们在路由当中注册的那个中间件就是控制器，所以在`Koa`当中控制器也是一个中间件

### 1. 为什么要使用控制器
我们使用控制器是由于它的作用，那么控制器有什么作用呢？

**1. 控制器的作用一**：<font color=#3eaf7c>获取HTTP请求参数</font> :
  + `Query String`,中文名叫做查询字符串，如?q=keyword(比如谷歌的搜索url就是讲搜索的内容放在q参数后面，比如q=what is rest),当然`Query String`是可选的，如果是必选的我们应该使用下面这种
  + `Router params`,如/users/id，这种是<font color=#3eaf7c>路由参数</font>
  + `Body`,如 `{ name: '李磊' }`,在`RESTful`中，通常使用`json`来表示`Body`的部分
  + `Header`,如`Accept`,`Cookie`等等

**2. 控制器的作用二**：<font color=#3eaf7c>处理业务逻辑</font>

**3. 控制器的作用三**：<font color=#3eaf7c>发送HTTP响应</font>
  + 发送`Status`,如200、400等
  + 发送`Body`,如`{code:200, msg: '失败'}`，这个是响应的响应体，不是请求体
  + 发送`Header`,如`Allow`、`Content-Type`

### 2. 编写控制器最佳实践
+ <font color=#3eaf7c>每个资源的控制器放在不同文件中</font>（用户相关的控制器放在用户的文件中，话题的相关控制器放在话题的文件中）
+ <font color=#3eaf7c>尽量使用类+类方法的形式编写控制器</font>（写一个类，将这些方法写成类的类方法，提高可读性，共享类的某些变量）
+ <font color=#3eaf7c>严谨的错误处理</font>

## 获取HTTP请求参数
### 1. 学习断点调试
开始断点调试的步骤：
+ 打开需要调试的文件，点击F5开启测试
+ 到达断点后自动从`postman`调回到`vscode`中的断点处
+ 在左边变量栏中会有你需要的变量，如果你有几个经常要监视的变量，可以在变量栏下面的监视栏中看到

### 2. 获取query
通过<font color=#3eaf7c>**ctx.query**</font>即可拿到整个`url`问号后面的东西

### 3. 获取router params
通过<font color=#3eaf7c>**ctx.params**</font>即可拿到路由参数

### 4. 获取body
我们需要先安装<font color=#3eaf7c>koa-bodyparser</font>去拿到和解析请求体
```bash
npm i koa-bodyparser --save
```
然后引入并注册到app上
```javascript
const bodyparser = require('koa-bodyparser') // 引入
...
app.use(bodyparser())
```
通过<font color=#3eaf7c>**ctx.request.body**</font>即可拿到请求体部分

### 5. 获取header
通过<font color=#3eaf7c>**ctx.header**</font>即可拿到请求体部分

## 发送HTTP响应

### 1. 发送status
通过<font color=#3eaf7c>**ctx.status = 200**</font>即可设置`Status`

### 2. 发送body
通过<font color=#3eaf7c>**ctx.body = xxx**</font>即可设置返回体

### 3. 发送header
通过<font color=#3eaf7c>**ctx.set('Allow','GET,POST')**</font>这种方式去设置消息头