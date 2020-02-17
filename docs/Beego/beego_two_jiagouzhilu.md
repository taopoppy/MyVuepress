# 环境搭建（一）

## 架构思考
开发到架构中间总是隔着一层鸿沟，看不见摸不着，很难跨越，通常对于普通的软件工作人员，<font color=#DD1144>这道鸿沟实际上是能真实参与到架构设计和实现的机会，也就是实际业务场景的挑战和不失时机的引导</font>

而立体化项目开发的过程并不是一蹴而就的，有下面几个重要的开发过程：
+ <font color=#DD1144>业务快速搭建</font>
  + 提高读业务代码的能力
+ <font color=#DD1144>数据层优化</font>
  + 与开发相关的数据层基础优化
  + `MySQL binlog`与主从分离实现
  + 针对业务场景进行分表分库
  + 搜索模块接入`Elasticsearch`
+ <font color=#DD1144>缓存层优化</font>
  + 页面静态化
  + 基于`Redis`的动态缓存实现
  + `CDN`下载优化
+ <font color=#DD1144>服务层优化</font>
  + 代理和反向代理
  + 无状态服务与服务平行扩展
  + 负载均衡原理及其基于`Nginx`实践
  + 多机部署之`Session`同步问题

这几个步骤是我们业务的发展过程，也是架构的变迁历史

## Go开发环境搭建
<font color=#1E90FF>当我们的项目在线上运行的时候，是不需要运行环境的，只需要将我们编译好的二进制文件执行起来就行，所以在开发机上装一个编译环境就好了</font>

### 1. 下载Go的安装包

+ 下载`Go`在无法科学上网的情况下直接上国内的镜像网站[studygolang.com](studygolang.com)即可，然后下载对应平台的安装包下载即可，下载完重点是在下载的目录下的`\bin\go.exe`（`mac`或者`linux`系统下没有`.exe`后缀的）文件，这个文件就是<font color=#DD1144>编译的可执行文件，俗称go的编译工具</font>。
+ 三大平台下载安装完都要做的一个事情就是添加环境变量，就是这个安装包中的`bin`文件的路径（`mac`和`windows`好像是自动添加环境变量，`linux`可能需要手动配置一下）

### 2. 下载称手的ide

`Go`的开发工具很多，`VsCode`、`Goland`、`IDEA`、`liteide`,我们这里就使用`liteide`,到它的官网[http://liteide.org/cn/](http://liteide.org/cn/)中找[发行版](https://sourceforge.net/projects/liteide/files/)，选择`DownloadLatest Version`下载最新版的即可，它会根据你的电脑系统自行判断系统版本。下载下来是个压缩包，然后解压找到里面的可执行文件`liteide.exe`即可。

## Beego框架下载和使用
### 1. Beego框架初体验
`Beego`这个框架在平时用的比较多的是这个构建`RESTful`风格的`api`比较多一些，`Beego`框架的开发方式和风格和传统的`Java`或者`php`很相似，<font color=#DD1144>特点就是在MVC和数据库的ORM的访问上面封装的很漂亮</font>

根据`Beego`官网提供的下载命令，我们在下载好了`Beego`之后呢，就可以在任意命令行当中去执行下面的安装`Beego`的命令：
```bash
go get github.com/astaxie/beego
```
这里就有个很大的问题摆在我们面前，下载的`Beego`框架的文件在哪里？
+ <font color=#DD1144>**GOPATH**</font>: <font color=#1E90FF>当你还使用GOPATH的方式去管理工作区的时候，你会发现假如你最开始下载Go语言之后默认的GOPATH路径是：<font color=#3eaf7c>C:\Users\Administrator\go</font>，这个文件中有三个文件分别是bin、pkg、src，这三个文件属于一个工作区，bin放的是可执行文件，pkg放的是归档文件，也成为链接文件，一些库下载下来编译好是生成了能给别人用的链接文件，放在这里。src就是源码文件，你下载了Beego后，Beego就保存在了src源码文件中，整个完整的路径是： <font color=#3eaf7c>C:\Users\Administrator\go\src\github.com\astaxie\beego@v1.12.0</font></font>

+ <font color=#DD1144>**GO mod**</font>：<font color=#1E90FF>因为在新版本的Go语言当中有了GoMod的管理方式，如果你下载Go之后立刻修改了GO111MODULE=on这个选项，说明整个电脑的管理Go项目的方式就成为了模块化的方式，此时此刻你下载的Beego文件的路径是这样的：<font color=#3eaf7c>C:\Users\Administrator\go\pkg\mod\github.com\astaxie\beego@v1.12.0</font></font>

整个关于`GOPAHT`工作区和`GoMod`依赖管理的知识我们在[Go核心语法夯实](https://www.taopoppy.cn/go/gocore_one_learn.html)中有详细的介绍和使用分析。

那么使用`Beego`框架开发最简单的的程序就是这样：
```go
package main

import "github.com/astaxie/beego"

func main() {
	beego.BConfig.Listen.HTTPPort = 8090
	beego.Run()
}
```

### 2. Beego搭建Web应用
为了使用`Beego`框架，我们需要使用一个<font color=#DD1144>Bee</font>的工具，我们使用下面的命令来安装这个工具：
```go
go get github.com/beego/bee
```
然后可以通过在命令行上输入`bee`来查看它的所有命令，但是这里又有问题，就是`Beego`本身是不支持`Go Mod`方式的，所以有下面这两种情况：

<font color=#1E90FF>**① GOPAHT方式**</font>

使用传统的方式,`Bee`直接就会下载到`$GOPAHT`下面中的`src`目录中，不过`bee.exe`你要在`$GOPAHT`的`bin`下面找到，将`$GOPAHT/bin`添加到环境变量。然后通过`bee new`或者`bee api`的方式去创造项目。

<font color=#1E90FF>**② GoMod方式**</font>

对于`GoMod`,比较复杂，或者你可以直接到本章的参考资料的地方阅读原始参考资料，但是我们下面还是会罗列每个具体的操作步骤，
+ <font color=#DD1144>准备工作</font>：
  + 先去下载`git`,因为需要`gitbash`,其次需要一个`github`的账号
+ <font color=#DD1144>创建项目文件夹</font>：
  + 打开`gitbash`,然后执行下面的代码
    ```go
    mkdir go_web
    cd go_web
    go env -w GOPROXY=https://goproxy.cn,direct
    ```
+ <font color=#DD1144>初始化项目并替换Bee源</font>：
  + 为了防止版本的更新的影响，首先将`github.com/beego/bee`通过`fork`到自己的仓库下
+ <font color=#DD1144>初始化项目</font>：
  + 接着上面的`gitbash`,执行下面的命令
    ```go
    go mod init go_web
    ```
+ <font color=#DD1144>修改go.mod文件</font>：
  + 经过上面的初始化，在`go_web`文件夹下产生了一个`go.mod`的文件，因为经过`fork`之后，我们自己的`github`仓库下面就有了`bee`的项目，这样就防止的更新对我们项目的影响，我们修改内容如下（我的`github`是`taopoppy`,你要修改成为你的名称）：
    ```go
    module go_web

    replace github.com/beego/bee v1.10.0 => github.com/taopoppy/bee v1.10.0

    go 1.13
    ```
+ <font color=#DD1144>安装beego和bee</font>：
  + 依旧接着上面`gitbash`中的操作，执行下面的命令分别安装`beego`和`bee`:
    ```go
    go get -u github.com/astaxie/beego
    export GO111MODULE=off && go get -u github.com/beego/bee
    ```
  + <font color=#1E90FF>第一点就是注意必须在gitbash中进行，其他可能不认识export命令</font>
  + <font color=#1E90FF>第二点就是bee无法在GoMod下面执行下载，所以我们要通过export临时改变GO111MODULE=off，注意这是临时改变，过了这一次，全局的GO111MODULE依旧为on</font>
+ <font color=#DD1144>添加环境变量</font>：
  + 经过上述的安装，`Beego`是按照全局`GoMod`的方式安装在了`$GOPAHT\pkg\mod\github.com\astaxie\beego@v1.12.1`这个里面了，但是`Bee`工具却是以`GOPAHT`方式安装在了`$GOPAHT\src\github.com\beego\bee`下面
  + 而且对于这些第三方包,安装会进行两个步骤，第一就是从网上拉取源代码，第二就是编译这些文件,编译完如果是链接文件都会放在`$GOPAHT\pkg`目录下，如果编译完是可执行文件，就会放在`$GOPATH\bin`目录下
  + 所以实际上`bee`安装包整个下载编译完成你会在`$GOPAHT\bin`路径下面发现一个`bee.exe`（`windows`下是这样）的可执行文件，所以为了能使用`bee`命令，我们需要将`$GOPAHT\bin`目录添加到环境变量中
+ <font color=#DD1144>创建项目</font>：
  + <font color=#1E90FF>切换到cmd命令行，进入刚才go_web项目，使用bee命令创建项目</font>
  + 可以使用`bee api xxx`创建`api`后端项目，也可以使用`bee new xxx`创建单体式的项目，创建的项目会存储在`$GOPAHT/src/xxx`。（当然你也可以通过多级目录的方式创建项目，比如`bee new github.com/taopoppy/hello`,那么项目文件就会在`$GOPAHT/src/github.com/taopoppy/hello`下面。）
  
    <img :src="$withBase('/beego_one_createproject.png')" alt="项目的创建">

+ <font color=#DD1144>启动项目</font>：
  + 前面已经说了项目是存储在`$GOPAHT/src/go_web`下面，我们要启动必须经历两个步骤：<font color=#1E90FF>项目模块化</font>和<font color=#1E90FF>启动项目</font>
    ```go
    go mod init go_web
    bee run
    ```
    <img :src="$withBase('/beego_one_start.png')" alt="项目启动">

  + 然后就可以打开[localhost:8080](localhost:8080)查看项目了

    <img :src="$withBase('/beego_one_projectline.png')" alt="浏览器打开项目">

### 3. Beego项目概述
现在我们要对`beego`框架的项目来做个整体的了解，首先来看下`beego`的目录：

<img :src="$withBase('/beego_two_mulu.png')" alt="beego项目的目录">

+ <font color=#DD1144>main.go</font>：
  ```go
  package main

  import (
    _ "go_web/routers"
    "github.com/astaxie/beego"
  )

  func main() {
    beego.Run()
  }
  ```
  可以看到，实际上内容和我们之前写的最简单的一个`beego`的应用没有多大区别，只是引用了一个`go_web/routers`,<font color=#1E90FF>这是因为实际的作用就是调用一下routers/router.go文件中的init方法</font>，所以这里有一个特别要注意的点就是：<font color=#DD1144>当导入一个包时，该包下的文件里所有init()函数都会被执行，然而，有些时候我们并不需要把整个包都导入进来，仅仅是是希望它执行init()函数而已。这个时候就可以使用 import _ 引用该包。即使用[import _ 包路径]只是引用该包，仅仅是为了调用init()函数，所以无法通过包名来调用包中的其他函数。</font>

+ <font color=#DD1144>routers/router.go</font>
  ```go
  package routers

  import (
    "go_web/controllers"
    "github.com/astaxie/beego"
  )

  func init() {
      beego.Router("/", &controllers.MainController{})
      beego.Router("/hi", &controllers.MainController{}, "get:Hi")
  }
  ```
  这个的`init`方法就是来设置一些路由信息的,上面简答的解释一下`init`中的代码，当你的项目启动起来,默认是在`localhost:8080`端口启动，此时就相当于访问`localhost:8080/`这个路由，则使用从`controllers`文件中的`MainController`这个类的默认方法`Get`来处理。而访问`localhost:8080/hi`这个路由的时候，则使用`MainController`类中的`Hi`方法来作为控制器处理。

+ <font color=#DD1144>controllers/default.go</font>
  ```go
  package controllers
  import (
    "fmt"
    "github.com/astaxie/beego"
  )

  type MainController struct {
    beego.Controller
  }

  func (c *MainController) Get() {
    c.Data["Website"] = "beego.me"
    c.Data["Email"] = "astaxie@gmail.com"
    c.TplName = "index.tpl"
  }

  func (c *MainController) Hi() {
    fmt.Printf("hello beego")
    c.TplName = "index.tpl"
  }
  ```
  可以看到，每一个`MainController`的方法都是一个控制器，通过`c.TplName`来设置返回的页面模版，通过`c.Data`来设置向模版中输入的信息，这基本上就是传统单体式开发页面的一个方法： <font color=#1E90FF>模版 + 数据 = 真实的页面</font>  

+ <font color=#DD1144>static && view/index.tpl</font>

  基本上`static`就是`MVC`视图层展示的页面所需要的全部静态文件,`view`文件中就全部是模版，对于这两个文件暂时要说的有下面两个关键的点：
  + <font color=#1E90FF>模版当中采用双括号的方式来与传入模版中的数据相结合，如下：</font>
    ```html
    <div class="author">
      Official website:
      <a href="http://{{.Website}}">{{.Website}}</a> /
      Contact me:
      <a class="email" href="mailto:{{.Email}}">{{.Email}}</a>
    </div>
    ```
  + <font color=#DD1144>因为静态文件static和模版views文件都在项目的根目录下面，所以在模版文件.tpl中引入外部文件直接使用static的路径，如下：</font>
    ```html
    <script src="/static/js/reload.min.js"></script>
    ```
    


**参考资料**

1. [go mod方式下载Beego以及Bee(windows和linux都差不多)](https://blog.csdn.net/zhetmdoubeizhanyong/article/details/101050310)