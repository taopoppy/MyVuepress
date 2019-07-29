# 环境搭建

工欲善其事必先利其器。在开发一个完整项目之前，准备一个完整的开发环境是非常重要的。当然如果你是一个前端大佬，可能这些环境早已用的滚瓜烂熟；但如果你是刚入坑前端，就跟着我一步一步把环境搭建起来：

## 下载代码编辑器Sublinme Text 3
下载地址：[https://www.sublimetext.com/3](https://www.sublimetext.com/3),可以根据自己的操作系统进行安装，我安装的是`windows 64 bit`,注意直接点击`Windows 64 bit`，这个是`exe`文件，后面的`portable version`是`.zip`安装包

当下流行的代码编辑器有`VS code`、`Sublime Text`、`WebStorm`三种，笔者觉得代码编辑器完全由自己的喜好和习惯决定，并没有一个完全正确的答案，正所谓萝卜白菜，各有所爱。从当前的趋势看来，`Visual Studio Code`的使用者更多一些，这可能得益于精美的界面风格和完善的插件生态，笔者之前也是一直用的这款编辑器；`WebStorm` 的功能也很强大，但是太过笨重。这次之所以没有用这两个而是选择`Sublime Text`，是为了体验一下新鲜的事物，总有点喜新厌旧的感觉。从效果上来看，`Sublime Text`更加轻便，如果长时间操作，也不会有卡顿的感觉。

## 下载node.js
下载地址：[Node.js](https://nodejs.org/en/)

安装的时候注意要选择`Add to PATH`，将node添加到环境变量中,这样才能在命令行终端使用`node`命令。

安装完了`Node.js`之后就有了`Npm`包管理工具，但是鉴于国内的一些网络问题，可以选择使用`CNPM`(淘宝NPM镜像)来安装相关的模块，在后面的项目实战中我们会使用

```bash
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

## 下载安装MongoDB
下载地址：[https://www.mongodb.com/download-center](https://www.mongodb.com/download-center),在 Server选项下，选择自己操作系统平台的进行安装。

注意我们选择了`Complete`模式就是默认的模式，它会将`MongoDB`安装在`C:\Program Files\MongoDB\Server\4.0`这个目录下，然后在有个界面最下面会显示`data dictory`和`log dictory`,默认的是`C:\Program Files\MongoDB\Server\4.0\data\db`和`C:\Program Files\MongoDB\Server\4.0\log\mogod.log`,也就是即将要将数据和日志分别放在这两个目录下，但是是在c盘，我们不希望把数据和日志都放在C盘，所以我们修改一下下面两个选项值，改为`D:\MongoDB\Server\4.0\data\db`和`D:\MongoDB\Server\4.0\log\mogod.log`。特别要注意在下载完毕后`D:\MongoDB\Server\4.0\data\db`这个路径中的db文件夹要自己建

接着取消`Install MongoDB Compass`这个选项，开始下载

下载完毕后进入下载目录`C:\Program Files\MongoDB\Server\4.0\bin`,创建一个长期服务
```bash
mongod.exe --dbpath "D:\MongoDB\Server\4.0\data\db" --logpath "D:\MongoDB\Server\4.0\log\mongod.log" --install -serviceName "MongoDB"
```
+ -dbpath: 指定数据库文件的存放路径，之前说过`\data\db`目录要自己新建
+ -logpath: 指定了日志文件的存放路径
+ -install: 指定作为一个Windows服务安装

然后启动命令：net start MongoDB
停止命令：net stop MongoDB

## 下载adminmongo
`adminmongo`是一个`MongoDB`的基于网页版的可视化管理工具，使用方便，安装简单。可以直接在`GitHub`上下载使用:
```bash
git clone https://github.com/mrvautin/adminMongo.git

cd adminMongo

cnpm install
```
启动服务的时候：
```
npm start
```
然后访问<font color=#3eaf7c>http://127.0.0.1:1234</font>即可使用，第一次使用的时候需要配置`MongoDB`数据库`connection`，我们会在后面说明


本章主要讲解了环境准备工作，包括代码编辑器的`Sublime Text`的安装，以及相关编辑器的介绍，`Node.js`安装和`MongoDB`安装和使用方法。到这里我们的开发环境就已经搭建完成了，后面我们来看下屏幕适配方案的选择。