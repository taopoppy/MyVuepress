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

## 目录讲解
```javascript
+ bin
  + WWW  // 启动文件
+ node_modules   // 依赖文件夹
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