# 开发准备

## 编辑器准备
对于`vscode`的调试呢，我们有下面几个步骤
+ 在程序当中打断点
+ 点击`vscode`左侧的小虫子按钮，选择`运行和调试`，就让你选择环境，有`chrome`，`node`等等
+ 在下拉框中有`添加配置`，会让你配置一个`lanuch.json`的文件，这个文件中的配置就是调试配置

## 真机调试
### 1. ios+Safari
+ 找一个`iphone`手机然后连接电脑
+ `Safari`浏览器 > 偏好设置 > 高级 > 选择`在菜单栏中显示"开发"菜单`，然后顶部就会多出一个`开发`的选项
+ 开发 > 显示网页检查器
+ 手机 > 设置 > `Safari`浏览器 > 高级 > 打开`Web检查器`
+ 回到浏览器，在开发菜单中的`MBA`上面就出现了你的手机设备，比如`taopoppy's phone`
+ 通过在`ifconfig`在苹果电脑上查看`ip`，比如说`192.168.31.109`
+ 然后回到手机，通过`Safari`浏览器中输入`192.168.31.109:xxx`就能访问到你在电脑上开启在`xxx`端口的项目
+ 然后回到电脑，在开发 >`taopoppy's phone` > `192.168.31.109`, 选择之后，就又弹出一个检查器，这个是手机真机调试的检查器

如果你没有苹果电脑，可以下载`windows`中的`Safari`浏览器，或者下载黑苹果系统

### 2. android+Chrome
+ 在`android`手机上打开开发者模式，打开`USB调试`，连接到电脑会弹出`是否允许USB调试`，点击确定
+ 在`chrome`浏览器中打开：[chrome://inspect/#devices](chrome://inspect/#devices)，就会显示连接的设备
+ 通过`ipconfig`查看电脑的`ip`
+ 打开手机进入手机浏览器（好像只能用手机`chrome`），打开`192.168.31.109:xxx`
+ 回到电脑，在`chrome://inspect/#devices`会有自己的手机设备，还有打开的项目，项目下有`inspect`
+ 点击`inspect`就可以开始调试项目（确保电脑和手机上的浏览器的版本都是最新的，否则点了`inspect`可能会白屏）

<img :src="$withBase('/bigfrontend-devop-11.png')" alt="">

+ 标记1的地方就是检查到手机浏览器访问的项目
+ 标记2的地方就是`inspect`，点击之后就会弹出图中的`DevTools`
+ 标记3的地方就是和手机浏览器共享的部分，在手机端操作，标记3的部分同步手机的屏幕，右侧可以和`chrome`一样进行检查和调试


### 3. Fiddler&&Charles
+ `Fiddler`是`windows`上的一个拦截请求的工具，可以帮助我们进行拦截
+ `Charles`是`Mac`上的一个拦截请求的工具，也是可以帮助拦截手机发出的请求

### 4. Weinre, Spy-Debugger,vConsole
三者都是类似的工具，都是远程调试工具，<font color=#1E90FF>都用来解决移动web的调试难题</font>，我们这里只介绍第一种，<font color=#1E90FF>因为这类工具不论是是android还是mac还是ios都可以进行，只要有nodejs，就可以全局安装</font>

`Weinre`的`github`地址是[https://github.com/nupthale/weinre](https://github.com/nupthale/weinre)

+ 电脑全局安装：`npm -g install weinre`
+ 启动：`weinre -httpPort=10000 --boundHost=-all-`
+ 打开浏览器，输入`localhost:10000`，就可以看到`weinre`的客户端
+ 将下面这样一段代码，粘贴到我们项目的合适的位置处，我的本地`ip`比如为`192.168.11.75`，`demoProject`是指定的一个项目名称而已
  ```html
  <script src="http://192.168.11.75:10000/target/target-script-min.js#demoProject"></script>
  ```
+ 重启我们的项目
+ 访问`http://localhost:10000/client/#demoProject`，就可以在这里进行调试（里面的`Elements`、`Resoureces`都类似于`chrome`中的调试工具一样）
+ 调试的时候，无论是`android`或者`ios`，它都能支持

值得注意的是，上线的时候，上面粘贴到项目中的测试代码`script`要删除。

## 接口测试和工具
在开发准备这一章我们要说下面这些东西：

<img :src="$withBase('/devtools-ready.png')" alt="">

关于什么是`Restful API`的定义和特点，我们可以在之前的博客[node与Restful](https://www.taopoppy.cn/node-RESTful/)

常见的终端类的测试工具，我们这里只说两个，一个是<font color=#DD1144>postman</font>，一个是<font color=#DD1144>DOClever</font>，后者是使用`Electron`技术实现的

## Mock
什么是`Mock`服务？
+ <font color=#1E90FF>模拟真实的接口</font>：实现效率开发，前后台同步，特别是分布式的系统
+ <font color=#1E90FF>虚拟业务场景</font>：某些开发场景非常难触发，还有一些异常逻辑和交互逻辑
+ <font color=#1E90FF>压力测试</font>：主要一般用于性能测试和压力测试（比如一下收到很多数据，前端的速率和性能）


使用`Mock`数据的开发流程呢如下：
+ 前端定义接口
+ 完成静态页面
+ 完成UI交互
+ 对接真实接口
+ 页面逻辑测试
+ 线上部署

我们现在来搭建一个`DOClever`的服务，在我们之前搭建的虚拟机上，搭建教程参照[github](https://github.com/sx1989827/DOClever/tree/master/docker)官网的教程，使用`docker-compose`来搭建，原始官网给出的配置如下：
```yml
version: "2"
services:
  DOClever:
    image: lw96/doclever
    restart: always
    container_name: "DOClever"
    ports:
    - 10000:10000
    volumes:
    - /本地路径/file:/root/DOClever/data/file
    - /本地路径/img:/root/DOClever/data/img
    - /本地路径/tmp:/root/DOClever/data/tmp
    environment:
    - DB_HOST=mongodb://mongo:27017/DOClever
    - PORT=10000
    links:
    - mongo:mongo

  mongo:
    image: mongo:latest
    restart: always
    container_name: "mongodb"
    volumes:
    - /my/own/datadir:/data/db
```

我们根据之前的`docker-compose`来修改一下：
```yml
version: "2"
services:
  DOClever:
    image: lw96/doclever
    restart: always
    container_name: "DOClever"
    ports:
    - 20080:10000
    volumes:
    - /srv/doclever/file:/root/DOClever/data/file
    - /srv/doclever/img:/root/DOClever/data/img
    - /srv/doclever/tmp:/root/DOClever/data/tmp
    environment:
    - DB_HOST=mongodb://mongo:27017/DOClever
    - PORT=10000
    links:
    - mongo:mongo

  mongo:
    image: mongo:latest
    restart: always
    container_name: "mongodb"
    volumes:
    - /srv/doclever/db:/data/db
```
我们只修改了`volumes`的部分和端口的部分，`volumes`这个代表数据挂载到本地的路径，我们统统放在`srv`的目录下面。

然后我们进入终端工具，执行下面的命令：
```javascript
cd /home/      // 进入home目录
ls
mkdir doclever // 创建一个doclever文件夹
cd doclever/
ls
vi docker-compose.yml // 创建并且编辑一个docker-compose.yml
```
然后把上面的配置内容加入到这个文件当中，然后`:wq`进行保存，然后再终端进行`docker-compose up -d`，`docker-compose`就会在后台开始运行和拉取镜像。<font color=#1E90FF>前提是你已经开始打开了docker服务，如果没有打开，请使用service docker start 打开</font>

下载完毕，启动完毕，就可以使用`docker ps -a`或者`docker ps | grep doclever`去查看一下进程。然后因为`DOClever`是运行在20080端口的，我们要将虚拟机的20080端口进行放行，我们可以先使用命令来查看一下防火墙的放行端口有哪些：
```js
firewall-cmd --list-all
```
然后通过下面的命令来永久打开20080端口
```js
firewall-cmd --add-port=20080/tcp --zone=public --permanent  // 添加20080
firewall-cmd --reload // 使其生效
```
最后使用`firewall-cmd --list-all`查看一下结果，就会在`ports`当中看到`10022/tcp`，`22/tcp`，`20080/tcp`这三个我们放行的端口。

因为我们虚拟机的`ip`为：172.17.72.171，那么我们在本地浏览器就可以打开`172.17.72.171:20080`就可以看到下面的这样的`DOClever`的服务了

<img :src="$withBase('/bigfrontend-devop-12.png')" alt="">

在登陆->管理总后台，进行管理员登陆，用户名和密码都是`DOClever`

## DOClever中的Mock开发
我们登陆到虚拟机之后，使用`docker-compose`打开了`DOClever`之后，然后可以创建一个新的用户，我的新用户就是`taopoppy`，然后我们开始新建一个项目`test`，然后创建接口：

<img :src="$withBase('/bigfrontend-devop-13.png')" alt="">

然后在上图中的左上角有个设置，设置中有个`Mock`选项，会告诉你下面这些话：
```javascript
Mock Server地址：http://192.168.12.229:20080/mock/60534c27adfc8d000c418744
Mock Js文件：net.js（和内网测试是同一个文件，需要安装node环境，安装包点击下载：window  mac）
使用方法：在本地用node运行net.js ,加上mock server地址和你需要请求的真实地址的根地址，当您的接口文档的状态为开发完成的时候，net.js不会去请求mock server地址而去请求真实地址（举例：node net.js http://192.168.12.229:20080/mock/60534c27adfc8d000c418744 http://localhost:8081) ,然后将您开发工程下的根地址替换为localhost:36742即可开启您的Mock之旅
```
意思就是，我们在本地去下载`net.js`，解压到某个目录，然后再此目录执行`node net.js http://192.168.12.229:20080/mock/60534c27adfc8d000c418744 http://localhost:8081`，就可以将刚才的`mock`设置启动在一个服务中，执行之后会告诉你：`内网测试，Mock数据正在监听端口：36742`，说明，`mock`服务已经启动到`localhost:36742`。

至于这个命令的含义：
+ `http://192.168.12.229:20080/mock/60534c27adfc8d000c418744`是虚拟机上面的`DOClever`的地址
+ `http://localhost:8081`是替代`Mock`数据地址的真实线上地址，现在我们也没有真实线上地址，就写个假的即可

最后我们去使用`postman`去`get`请求一下`localhost:36742`，这样就能获取到我们在`DOClever`中自己设置的`Mock`数据。

<font color=#1E90FF>但是我不推荐这样的Mock开发方式，第一太麻烦，第二对于虚拟机的ip有时候不是固定的，那么我们每次去请求都要换，第三就是开发的时候真实的请求地址一般还没有，所以得一直使用mock</font>

## Mock.js
如果你在内网环境，或者想使用一种更加轻量的`Mock`方法，我们更推荐[mock.js](http://mockjs.com/)

可以通过`npm install mockjs -D`的方式去下载，然后`Mock.js`的语法规范包括两部分：
+ <font color=#1E90FF>数据模板定义规范（Data Template Definition，DTD）</font>
+ <font color=#1E90FF>数据占位符定义规范（Data Placeholder Definition，DPD）</font>

具体的可以在官网进行学习，而且官网给出了很多的示例，不怕不会写。

`Mockjs`还有个功能就是拦截，所以综合上面的所学，我们自己可以这样去打造`Mock`服务：
+ 使用`DOClever`，然后将域名作为环境变量，开发环境为`localhost:36742`，正式为正式的
+ 使用`Mockjs`，在项目中自己拦截自己，结合`process.ENV_NODE`去书写一个文件，里面全是对接口的拦截函数
+ 使用`Mockjs`，自己写个服务器，返回`Mock`数据，相当于`服务器 + Mockjs = DOClever`