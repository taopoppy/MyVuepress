# 上传图片

## 上传图片需求分析
我们先看看<font color=#3eaf7c>上传图片的场景</font>：
+ 用户头像
+ 主页最上方的封面图片
+ 问题和回答中的图片（富文本中的图片）
+ 话题图片

可见上传图片的场景还是很多，而切很有必要，现在我们看看<font color=#3eaf7c>上传图片的功能点</font>：
+ 基础功能：上传图片，生成图片链接
+ 附加功能，限制上传图片的大小与类型，生成高中低三种分辨率的图片链接，生成`CDN`(内容分发链接)

上传图片的技术方案：
+ 阿里云OSS等云服务，推荐在生产环境下使用
+ 直接上传到服务器，不推荐在生产环境下中使用

## koa-body获取上传文件
首先我们要去安装`koa-body`用来替换`koa-bodyparser`，因为`koa-bodyparser`只支持`json`和`form`两种文件模式，而`koa-body`还能支持文件格式
```bash
npm install koa-body --save

npm uninstall koa-bodyparser --save
```

接着我们设置图片上传目录，在`index.js`中修改原有的代码，删除掉`koa-bodyparser`相关代码
```javascript
const KoaBody = require('koa-body')
const path = require('path')

app.use(KoaBody({
  multipart: true,  // 因为文件的Content-Type就是multipartFormdata
  formidable: {
    uploadDir: path.join(__dirname,'/public/uploads'), // 文件保存目录
    keepExtensions: true,                              // 保持文件的拓展名
  }
})) // 注册body解析器
```
然后我们去编写控制器模块,在`home`的模块中去添加控制器`upload`,并在路由中添加`post`方法
```javascript
  // 控制器
  upload(ctx) {
    const file = ctx.request.files.file
    ctx.body = { path: file.path }
  }
  // 路由
  const { index, upload } = require('../controllers/home')
  router.post('/upload', upload)
```

最后我们使用`postman`来测试一下，使用`postman`测试上传图片应该这样测试
+ 在`Body`中选择`form-data`，因为是文件格式
+ 在`Key`的一栏的最右边选择`file`选项，然后在`VALUE`那一栏中点击`Select File`按钮选择图片
+ 点击测试，如果测试成功，按照我们之前写的逻辑会返回图片上传到服务端保存的文件路径

## koa-static生成图片链接
首先我们要去安装`koa-static`，这个中间件可以帮助我们生成一个静态的服务，指定了一个文件夹，文件夹中所有的内容都可以通过`http`来访问
```bash
npm install koa-static --save

```

然后我们设置静态文件目录，在`index.js`文件中设置
```javascript
const KoaStatic = require('koa-static')

app.use(KoaStatic(path.join(__dirname,'public'))) // 写在所有中间件最前面，因为静态文件一般在最前面
```
这样写完后我们只要访问`http://localhost:3001/uploads/upload_e362dbc265681e1a6912017814e52034.png`就能访问到这个图片，因为上述代码已经将`public`文件下所有内容都设置为静态服务了，所以都能通过`http`协议访问。

最后我们在控制器中生成图片链接，也就是在控制器中生成`http://localhost:3001/uploads/upload_e362dbc265681e1a6912017814e52034.png`这样一个链接返回回去，所以我们在控制器（controllers/home.js）中去修改原本的代码：
```javascript
 upload(ctx) {
    const file = ctx.request.files.file
    const baseName = path.basename(file.path)  // 完整的图片名称
    ctx.body = { url: `${ctx.origin}/uploads/${baseName}`}  //  ctx.originb表示获取请求源 URL，包括协议和主机
  }
```
## 编写前端页面上传文件
关于上传文件的前端代码我们在这里简单的说一下：在`public`目录下创建一个`upload.html`文件，然后代码如下：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <form action="/upload" enctype="multipart/form-data" method="POST">
  <input type="file" name="file" accept="image/*">
  <button type="submit">上传文件</button>
  </form>
</body>
</html>
```
关于`input`标签中的`accept`属性，还有多种写法，你可以上网进行查阅
