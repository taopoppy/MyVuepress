# 学习go语言

## 什么是go语言

`Go`语言的设计初衷是这样的：
+ <font color=#1E90FF>针对其他语言的痛点进行设计</font>
+ <font color=#1E90FF>并加入并发编程</font>
+ <font color=#1E90FF>为大数据，为服务，并发而生的通用编程语言</font>

`Go`语言很特别：
+ <font color=#DD1144>没有对象，没有继承多态，没有泛型，没有try/catch</font>
+ <font color=#DD1144>有接口，函数式变成，`csp`并发模型（`goroutine` + `channel`）</font>
+ <font color=#3eaf7c>学习go语言重要的不是语法，而是改变三观</font>

`Go`语言的学习路线：
+ <font color=#3eaf7c>基本语法</font>：变量，选择，循环等
+ <font color=#3eaf7c>面向接口</font>：结构体，`duck typing`的概念，组合的思想
+ <font color=#3eaf7c>函数式编程</font>：比如闭包的概念
+ <font color=#3eaf7c>工程化</font>：资源管理，错误处理，测试和文档，性能调优
+ <font color=#3eaf7c>并发编程</font>：`goroutine`和`channel`，理解调度器

实战项目的架构图：
<img :src="$withBase('/go_one_prpject_jiagou.png')" alt="项目架构图">

## Go的安装
登录到[https://studygolang.com/dl](https://studygolang.com/dl)然后下载对应系统的文件，然后傻瓜式的一步步安装即可。

安装完后可以在命令行中使用`go`或者`go version`来查看`go`的安装是否成功和具体的下载版本。

<font color=#1E90FF>我们强调要使用1.13.3以后的版本，因为在这个版本后面会有一个对国内的用户非常好的功能，就是镜像功能</font>，<font color=#DD1144>通过go env命令来查看go的一些设置，可以看到GOPROXY=https://proxy.golang.org,direct</font>，这个配置就是帮助我们拉取一些依赖的时候直接从`https://proxy.golang.org`这个网址拉取，如果不行，就重定向到原本的地址中去拉取。

### 1. 修改镜像
但是`https://proxy.golang.org`在国内连接依旧比较困难，我们可以使用一个国内的镜像：<font color=#DD1144>goproxy.cn</font>,所以我们可以在终端执行命令：
```go
go env -w GOPROXY=https://goproxy.cn,direct
```

### 2. 修改模块
做过`Go`项目的同学应该知道`GOPATH`是个比较烦人的东西，在新版本当中我们需要设置一个<font color=#DD1144>GO111MODULE</font>的东西，<font color=#1E90FF>这个东西好比一个开关，在GOPATH路径下面GO111MODULE的值就是on，否则就是off，为来避免不必要的坑，统一设置为on</font>:
```go
go env -w GO111MODULE=on
```

### 3. 下载goimports
在你的命令行中执行：
```go
go get -v golang.org/x/tools/cmd/goimports
```

### 4. 配置IDE
+ <font color=#3eaf7c>GoLand</font>
	+ `Goland`自身就包含`go`的插件和`file watcher`插件，所以我们不需要下载。我们打开`File/setting`查询修改`parameter hint`为`off`，取消参数提醒

	<img :src="$withBase('/go_one_golandconifg1.png')" alt="配置1">

	+ 并且查询修改`file watcher`,点击加号，添加`goimports`，然后点击`ok`即可，这样保存之后就能执行`goimports`之前那个下载的插件的功能了，格式化代码。

	<img :src="$withBase('/go_one_golandconfig2.png')" alt="配置2">

+ <font color=#3eaf7c>idea + Go插件</font>
	+ 如果你使用这种方式需要在打开编辑器的时候通过`configure/plugins`去下载`Go`的插件和`file watcher`插件，后者是能利用之前我们下载的`goimports`来在保存文件的时候去格式化代码的。然后创建这个项目的时候需要选择`Go Modules`，然后修`Proxy`为`https://goproxy.cn,direct`,然后创建一个项目。
	+ 创建一个`hello`的文件，然后书写一段简单的代码：
	```go
	package main

	import "fmt"

	func main() {
		fmt.Println("hello world")
	}
	```
	点击`func`左边的小绿点执行即可
	+ 我们打开`File/setting`查询修改`parameter hint`为`off`，取消参数提醒，并且查询修改`file watcher`,添加`goimports`，这样保存之后就能执行`goimports`之前那个下载的插件的功能了，格式化代码。
+ <font color=#3eaf7c>VS code</font>
	+ `vscode`虽然没有创建项目的能力，但是有扩展提示，但是使用了`go`语言，它会提示你去下载`go`文件的相关扩展。
	+ <font color=#1E90FF>然后我们启动项目都需要使用go run hello.go这样的命令</font>
	+ 另外`go.mod`在`vs code`也需要使用命令行手动生成：<font color=#DD1144>go mod init learngo</font>，`learngo`是名字，你可以自己取。

## Go的依赖管理
什么叫做依赖？<font color=#1E90FF>依赖就是我们在书写项目的时候不可能任何功能都要我们自己写，会大量的引入第三方库，将代码创建在别人的基础设施之上</font>

依赖管理经历了三个阶段：<font color=#DD1144>GOPATH</font>、<font color=#DD1144>GOVENDOR</font>、<font color=#DD1144>go mod</font>，所以对于当前的我们学习的重点就是简单的了解一下前两个的流程，重点学习`go mod`的依赖管理，因为`go mod`是真正将`go`的依赖做进了`go`的命令当中。

### 1. GOPATH
`GOPATH`说白了就是一个目录的路径，默认都是计算机的`/go`目录下面，然后所有的依赖都会放在这目录下，也就是所有的项目的依赖，反正你只要引入第三方，我就去`GOPATH`找，那这样的坏处当然就是体积会越来越大，如果你做的项目多了，时间也很久，这个目录的体积差不多和镜像一样了。当然了这还不是重要的问题，因为所有的项目的所有的依赖都是放在`GOPATH`对应的目录下，那么问题就来了：<font color=#1E90FF>两个项目如果使用的是不同版本的第三方依赖</font>，此时`GOPATH`对应的第三方依赖只有一个版本，怎么解决？

### 2. GOVENDOR
`GOVENDOR`就是解决不同项目对相同依赖不同版本的问题的，每个项目目录下会创建一个`vandor`的目录，放一些第三方依赖，当项目中引入了第三方依赖，会优先到这个目录下寻找是否有该库，找不到在到外面的`GOPATH`中找,但是通过`go get`下载下来的默认都在这个`GOPATH`对应的目录下，我们不想手动将其拷贝到项目中的`vendor`目录，就产生了大量的依赖管理工具:`glide`、`dep`,`go dep`等等，通过配置它们给出的配置文件来管理依赖。

但是通过上面`GOPATH`和`GOVENDOR`外加上依赖管理工具，这一套下来简直就像在打补丁，越来越难，所以在现在的版本.终于通过`go mod`来原生的管理依赖

### 3. go mod
使用`go mod`后,(通过在idea中创建`go module`的项目)，然后会将所有依赖的信息放在`go.mod`文件中，并且产生一个`go.sum`文件来记录各个依赖和版本的以及哈希的详情，如果要更新版本，直接下载新的版本，然后使用<font color=#DD1144>go mod tidy</font> 这个命令来清理不用的第三方依赖

如果你使用的`idea`或者`goland`，那么这些东西可以在创建项目的时候直接使用`go(module)`创建项目，之前我们在最前面就说过，然后如果使用`vscode`，我们需要这样来操作：<font color=#1E90FF>创建一个空的文件（比如test），然后通过cd进入test，使用命令go mod init test</font>,但是代理好像就不用设置了，因为最开始我们就已经设置过了。

如果你还有不懂的，可以参照这个下面两个网址：
+ [https://www.mogublog.net/post/2295.html](https://www.mogublog.net/post/2295.html)
+ [https://www.liwenzhou.com/posts/Go/00_go_in_vscode/](https://www.liwenzhou.com/posts/Go/00_go_in_vscode/)

下载第三方依赖基本就使用<font color=#DD1144>go get</font>命令就可以，但是我推荐你下载一个依赖的时候，最好去`github`上使用正规的人家给出的下载命令

如果有旧的项目要迁移到`go mod`上，基本上两个命令就能搞定：
```go
go mod init xxx
go build ./...
```
`go mod init xxx`很好理解，就是当前文件创建`go mod`的依赖管理的方式，`go build ./...`就当前项目根目录和子目录都去编译一遍，看看有没有出错，这个命令如果项目中有两个以上的`module`是不会产生可执行文件的，如果你想产生可执行文件，你需要使用这个命令：<font color=#DD1144>go install ./...</font>,会将所有产生的结果放在`go/bin`的目录下。

<font color=#DD1144>go mod总结</font>：
+ <font color=#1E90FF>由go命令统一的管理，用户不必关心目录结构</font>
+ <font color=#1E90FF>初始化：go mod init</font>
+ <font color=#1E90FF>更新依赖：go get [@v]; go mod tidy</font>
+ <font color=#1E90FF>迁移旧项目：go mod init，go build ./...</font>

### 4.  目录结构
对于目录结构，尤其对于`main`来讲，必须单独放在一个目录中，同一个目录下不能有多个文件中都包含`main`函数，这些文件都必须通过单独创建一个目录来存放。

**参考资料**

1. [Go语言四十二章经](https://github.com/ffhelicopter/Go42/blob/master/SUMMARY.md)
2. [Google资深工程师深度讲解Go语言](https://coding.imooc.com/class/chapter/180.html#Anchor)
3. [深入解析Go](https://www.ctolib.com/docs/sfile/go-internals/index.html)
4. [Go语言核心36讲](https://time.geekbang.org/column/intro/112)
5. [Go语言标准库实践](https://books.studygolang.com/The-Golang-Standard-Library-by-Example/chapter03/03.1.html)