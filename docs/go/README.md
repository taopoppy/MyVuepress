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

**参考资料**

1. [Go语言四十二章经](https://github.com/ffhelicopter/Go42/blob/master/SUMMARY.md)
2. [Google资深工程师深度讲解Go语言](https://coding.imooc.com/class/chapter/180.html#Anchor)