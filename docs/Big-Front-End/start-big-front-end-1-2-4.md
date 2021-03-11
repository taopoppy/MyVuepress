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

我们现在来搭建一个`DOClever`的服务，在我们之前搭建的虚拟机上