# Gin模板基础

## Web服务器
使用原生的`Go`来实现一个基本的服务器：
```go
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func sayHello(w http.ResponseWriter, r *http.Request) {
	b, _ := ioutil.ReadFile("./hello.txt") // 3. 读取hello.txt文件
	_, _ = fmt.Fprintln(w, string(b)) //4. 将文件返回内容转换成为字符串赋值给w

}

func main() {
	http.HandleFunc("/hello", sayHello) // 1. 访问127.0.0.1：9090/hello sayHello函数为处理器
	err := http.ListenAndServe(":9090", nil) // 2. 监听9090端口
	if err != nil {
		fmt.Printf("http serve failed, err:%v\n", err)
		return
	}
}

```

## Gin概述
首先我们来下载`Gin`框架：
```go
go get -u github.com/gin-gonic/gin
```
然后在项目当中使用需要将`Gin`引入到代码当中：
```go
package main

import "github.com/gin-gonic/gin" // 0. 引入gin框架

func main() {
	r := gin.Default() // 1. 创建一个默认的路由引擎
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{ // 2. 返回一个json格式的响应
			"message": "pong",
		})
	})
	r.Run(":9090") // 3. 监听并在 0.0.0.0:9090 上启动服务
}
```


## template初识

Go语言模板引擎的使用可以分为三部分：<font color=#1E90FF>定义模板文件</font>、<font color=#1E90FF>解析模板文件</font>和<font color=#1E90FF>模板渲染</font>.

<font color=#1E90FF>**① 定义模板文件**</font>

其中，定义模板文件时需要我们按照相关语法规则去编写，后文会详细介绍。

<font color=#1E90FF>**② 解析模板文件**</font>

上面定义好了模板文件之后，可以使用下面的常用方法去解析模板文件，得到模板对象：
```go
func (t *Template) Parse(src string) (*Template, error)
func ParseFiles(filenames ...string) (*Template, error)
func ParseGlob(pattern string) (*Template, error)
```

<font color=#1E90FF>**③ 模板渲染**</font>

渲染模板简单来说就是使用数据去填充模板，当然实际上可能会复杂很多
```go
func (t *Template) Execute(wr io.Writer, data interface{}) error
func (t *Template) ExecuteTemplate(wr io.Writer, name string, data interface{}) error
```

接着我们来写一个完整且简单的`demo`：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Hello</title>
</head>
<body>
    <p>Hello {{.}}</p>
</body>
</html>
```
```go
// main.go

func sayHello(w http.ResponseWriter, r *http.Request) {
	// 解析指定文件生成模板对象
	tmpl, err := template.ParseFiles("./hello.tmpl")
	if err != nil {
		fmt.Println("create template failed, err:", err)
		return
	}
	// 利用给定数据渲染模板，并将结果写入w
	tmpl.Execute(w, "沙河小王子")
}
func main() {
	http.HandleFunc("/", sayHello)
	err := http.ListenAndServe(":9090", nil)
	if err != nil {
		fmt.Println("HTTP server failed,err:", err)
		return
	}
}
```
实际上模板引擎就是一个字符串替换的过程，在`html`当中定义了特殊字符`{{ . }}`，它就会用你传入的参数`沙河小王子`去替换整个特殊的字符串。另外上述代码比如先编译成可执行文件，在执行，因为解析的模板文件的路径是相对路径，所以必须执行`go build`来在当前目录生成可执行文件，这样才能按照相对路径找到`hello.tmpl`，如果你直接执行`go run main.go`，可能就找不到模板文件了

## 模板语法详解
