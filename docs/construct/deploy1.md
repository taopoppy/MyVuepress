# 线上部署

## 线上部署流程
我们首先上到阿里云，需要注册一个账户，我的账户是`taopoppy`
+ 然后进入[云服务器ECS](https://www.aliyun.com/product/ecs?spm=5176.19720258.J_2686872250.1.54212c4agkrW2E)
+ 然后进入我们的[管理控制台](https://ecs.console.aliyun.com/?spm=5176.8789780.J_1092585.3.4e122fa16roFqx#/home)
+ 在界面的右上角有个[回到旧版](https://ecs.console.aliyun.com/?spm=5176.8789780.J_1092585.3.4e122fa16roFqx#/home)
+ 在界面的中间有个[创建实例](https://ecs-buy.aliyun.com/wizard/#/prepay/cn-qingdao)


接下来就是购买的过程，购买的过程我们后面再仔细讲，总之这里先要通过阿里云要去买一个服务器。

然后我们有了服务器我们需要在服务器上安装哪些东西呢？
+ <font color=#1E90FF>node环境</font>：项目是运行在`node`环境当中的
+ <font color=#1E90FF>Git</font>：我们需要通过`Git`来拉取我们在远程仓库的代码
+ <font color=#1E90FF>Nginx</font>：前端代码会打包放在`Nginx`当中
+ <font color=#1E90FF>MySQL</font>：数据库必须要安装

当然了如果你开发小程序的话，后端一定是`https`的协议，<font color=#1E90FF>阿里云提供免费的https证书申请，首先要申请域名，并完成域名实名认证</font>

完成了环境的搭建，我们就可以把代码运行在服务器上，让我们在外网可以访问到。<font color=#DD1144>我们前端的项目是放在Nginx上面的，比如我们访问www.taopoppy.com/admin，说明我们就将前端代码打包放在了Nginx根目录下面的admin文件夹当中</font>


## 开通ECS服务器
进入界面，我们先选择`cpu`：

<img :src="$withBase('/bushu-1.png')" alt="">

可以看到当我们选择`2vCPU`和`4GiB`的时候，最下面给出一个`ecs.g6.large`的默认选项，但是在蓝色方框中还有好多其他同级别的选项，你也可以选择


继续往下我们可以选择镜像和存储空间

<img :src="$withBase('/bushu-2.png')" alt="">

一般我们都是选择`centos`来下来，然后我们选择版本和内存即可。

未完待续...

## Node环境搭建

## Nginx环境搭建

## git部署

## MySQL环境搭建

## 域名解析和备案

## 前端打包
前端项目为什么要打包，这是废话：
+ <font color=#1E90FF>因为浏览器只认识html,js和css，你写的jsx或者vue浏览器当然识别不出来，所以通过打包要让项目文件转化成浏览器可以识别的文件类型</font>
+ <font color=#1E90FF>其次，react或者vue当中书写的大部分语法可能浏览器不识别，所以要通过babel或者其他工具进行转换。</font>

我们在不同项目当中有不同的打包方式，比如我们打包`Vue`项目后，是全部在`dist`文件下，然后我们特别要主要测试一下，`index.html`引入资源文件的路径是否正确，比如我们一般都要在`vue.config.js`当中去修改`publicPath`的值从`'/'`修改为`'.'`。这样直接在本地去打开`index.html`就可以打开。<font color=#1E90FF>同时也可以拿到本地的Nginx上面去测试一下</font>

## 前端部署

## 后端部署

## FileZilla工具