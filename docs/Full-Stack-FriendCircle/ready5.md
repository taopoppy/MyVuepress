# 初始化后端项目

## 初始化后端项目
首先需要安装`express-generator`这个脚手架工具来生成`Express`，它是一个简洁灵活的`node.js Web`应用框架，提供了一系列强大特性帮助我们创建各种Web应用和丰富的HTTP工具，使用Express可以快速帮助我们搭建一个完整功能的网站。
```bash
npm install express-generator -g
```
安装完成之后就可以执行命令，初始化后端项目：
```bash
express wecircleServer --no-view
```
`--no-view` 即不需要模版引擎这些工具。这里我们采用它主要是我们是一个前后端分离的项目，我们的后端项目只负责提供对应的`API`接口，所有页面渲染由前端的vue来完成，当然在初始化项目的时候可以选择其他的配置，参考下面这些文档
```javascript
$ express -h

  Usage: express [options] [dir]

  Options:

    -h, --help          输出使用方法
        --version       输出版本号
    -e, --ejs           添加对 ejs 模板引擎的支持
        --hbs           添加对 handlebars 模板引擎的支持
        --pug           添加对 pug 模板引擎的支持
    -H, --hogan         添加对 hogan.js 模板引擎的支持
        --no-view       创建不带视图引擎的项目
    -v, --view <engine> 添加对视图引擎（view） <engine> 的支持 (ejs|hbs|hjs|jade|pug|twig|vash)
     （默认是 jade 模板引擎）
    -c, --css <engine>  添加样式表引擎 <engine> 的支持 (less|stylus|compass|sass) （默认是普通的 css 文件）
        --git           添加 .gitignore
    -f, --force         强制在非空目录下创建
```
创建之后我们看见的项目目录如下：
```javascript
├── bin
│   └── www                //项目启动脚本
├── public                 //存放静态资源，后续我们的前端dist打包的项目会存放在此
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes                  //每个模块的路由文件
│   ├── index.js
│   └── users.js
├── app.js                //项目的主入口文件，负责路由的配置，数据库初始化
└── package.json
```
这样看起来也很清爽有木有，其中`routes`这个文件夹主要用来存放一些路由文件，并且到时会区分模块来写，即用户模块，消息模块，私信聊天模块等等。

其中路由也是负责`API`接口的主要职责，包括`post`和`get`这些方法。`public`这个文件夹存放的都是静态资源文件，我们后面的前端项目打包完成后会放在这个文件里面。

## 启动后端项目
```bash
cd wecircleServer

npm install

npm run start
```
程序启动之后默认监听3000端口，我们可以试一下，浏览器输入http://localhost:3000会看到内容

其中的静态资源文件已经可以通过`localhost:3000/javascripts/xxx.js`访问到了，证明我们的服务已经启动成功。

## 总结
本章节主要讲解了`Express`，以及使用`Express Generator`生成我们的后端项目，并介绍了后端的目录结构，为后续的后端开发做准备。