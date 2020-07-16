# Gin初始和模板

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

## Gin返回JSON
### 1. map定义JSON数据

返回`JSON`有两种格式，分别是使用`map`和`struct`,我们来看下面的代码：
```go
package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/json", func(c *gin.Context) {
		// 方法一:使用map来定义json数据
		data := map[string]interface{}{
			"name":    "小王子",
			"age":     18,
			"message": "hello world",
		}
		c.JSON(http.StatusOK, data)
	})
	err := r.Run(":9090")
	if err != nil {
		fmt.Println("server running 9090 failed")
	}
}
```
在`Gin`当中我们之前都是用`gin.H{}`来定义`json`数据，实际上如果你打开源码，你会发现，`gin.H`的定义就是一个`map`：
```go
// H is a shortcut for map[string]interface{}
type H map[string]interface{}
```

### 2. struct定义JSON数据
接着是第二种：
```go
func main() {
	r := gin.Default()
	//1. 定义结构体,并灵活使用tag保证返回json的key为小写
	type msg struct {
		Name    string `json:"name"`
		Message string `json:"message"`
		Age     int `json:"age"`
	}

	r.GET("/struct-json", func(c *gin.Context) {
		// 方法二:使用结构体定义json数据
		data := msg{"小王子", "hello world", 18}
		c.JSON(http.StatusOK, data)
	})

	err := r.Run(":9090")
	if err != nil {
		fmt.Println("server running 9090 failed")
	}
}

```
当然在定义结构体的时候尽量注意两个点：
+ <font color=#1E90FF>结构体尽量定义在函数外部</font>
+ <font color=#1E90FF>结构体名称和字段名称首字母要大写保证可以导出</font>

## Gin获取querystring参数
```go
r.GET("/query-one", func(c *gin.Context) {
	// 获取浏览器那边请求携带的query string

	// 查询具体的某个querystring
	name := c.Query("name")              // 查到返回值，查不到返回空字符串
	age := c.DefaultQuery("age", "25")   // 查到返回值，查不到返回默认值25
	message, ok := c.GetQuery("message") // 查到返回值和true，查不到返回空字符串和false
	if !ok {
		fmt.Println("没有查到message,message为空字符串")
	}
	c.JSON(http.StatusOK, gin.H{
		"name":    name,
		"age":     age,
		"message": message,
	})
})
```
当然出了上述的三个方法，还有<font color=#1E90FF>c.QueryArray()</font>、<font color=#1E90FF>c.QueryMap()</font>、<font color=#1E90FF>c.GetQueryArray()</font>、<font color=#1E90FF>c.GetQueryMap()</font>这些方法，如果你有兴趣，可以研究一下这些方法。

## Gin获取url路径参数
```go
	r.GET("/user/:name/:age", func(c *gin.Context) {
		name := c.Param("name") // 1. 拿到路径参数name
		age := c.Param("age") // 2. 拿到路径参数age
		c.JSON(http.StatusOK, gin.H{
			"name": name,
			"age":  age,
		})
	})
```
当我们访问`http://127.0.0.1:9090/user/taopoppy/25`的时候，就会匹配到这个路由，所以路径参数`name`的值就是`taopoppy`，路径参数`age`的值就是25。

## Gin获取post参数
```go
	// 创建post提交参数结构体，必要的参数需在tag中标识
	type PostMessage struct {
		Name    string `json:"name" binding:"required"`
		Age     int    `json:"age" binding:"required"`
		Message string `json:"message"`
	}

	r.POST("/post", func(c *gin.Context) {
		var params PostMessage   // 1. 设置变量
		err := c.ShouldBindJSON(&params) // 2. 判断请求结构是否满足定义的结构体
		if err == nil {
			c.JSON(http.StatusOK, gin.H{ // 3. 满足返回正确的json
				"status": 0,
				"message": map[string]interface{}{
					"name":    params.Name,
					"age":     params.Age,
					"message": params.Message,
				},
			})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{ // 4. 不满足则返回错误的信息
				"status":  -1,
				"message": err.Error(),
			})
		}
	})
```
注意，实际上在`Gin`当中有很多绑定的方法，有一个通用的方法叫做<font color=#9400D3>c.ShouldBind()</font>，它可以根据你传递参数的方式具体去判断。绑定相关的还有其他方法比如`ShouldBindWith`、`ShouldBindHeader`、`ShouldBindUri`，`ShouldBindQuery`，你可以再研究一下这些方法的用处。

## Gin文件上传
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
</head>
<body>
	<form action="/upload" method="POST" enctype="multipart/form-data">
		<input type="file" name="f1">
		<input type="submit" value="上传">
	</form>
</body>
</html>
```
```go
	r.POST("/upload", func(c *gin.Context) {
		// 1. 从请求中读取名称为f1的文件
		file, err := c.FormFile("f1")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"err": err.Error(),
			})
		} else {
			// 2. 将读取到的内容result保存在目的地,
			dst := path.Join("./", file.Filename)
			err := c.SaveUploadedFile(file, dst)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"err": err.Error(),
				})
			} else {
				c.JSON(http.StatusOK, gin.H{
					"status": "ok",
				})
			}
		}
	})
```
注意，文件的上传还分为单文件上传和多文件上传，那么我们可以参考下面的地址[Gin中文文档](https://gin-gonic.com/zh-cn/docs/examples/upload-file/)

##  Gin重定向
`HTTP`重定向很容易，内部，外部重定向都支持
```go
r.GET("/redirect",func(c *gin.Context) {
	c.Redirect(http.StatusMovedPermanently, "www.baidu.com")
})
```

<font color=#1E90FF>路由重定向可以使用HandleContext</font>：

```go
r.GET("/redirect1", func(c *gin.Context) {
	// 指定重定向的URL
	c.Request.URL.Path = "/redirect2"
	r.HandleContext(c)
})

r.GET("/redirect2", func(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"hello":"world"})
})
```

## Gin路由组
<font color=#1E90FF>**① 普通路由**</font>

```go
r.GET("/index", func(c *gin.Context) {...})
r.GET("/login", func(c *gin.Context) {...})
r.POST("/login", func(c *gin.Context) {...})
```
此外，还有一个可以匹配所有请求方法的Any方法如下：
```go
r.Any("/test", func(c *gin.Context) {...})
```
为没有配置处理函数的路由添加处理程序，默认情况下它返回404代码，下面的代码为没有匹配到路由的请求都返回`views/404.html`页面。
```go

r.NoRoute(func(c *gin.Context) {
	c.HTML(http.StatusNotFound, "views/404.html", nil)
})

```

<font color=#1E90FF>**② 路由组**</font>

我们可以将拥有共同URL前缀的路由划分为一个路由组。习惯性一对{}包裹同组的路由，这只是为了看着清晰，你用不用{}包裹功能上没什么区别。
```go
func main() {
	r := gin.Default()
	userGroup := r.Group("/user")
	{
		userGroup.GET("/index", func(c *gin.Context) {...})
		userGroup.GET("/login", func(c *gin.Context) {...})
		userGroup.POST("/login", func(c *gin.Context) {...})

	}
	shopGroup := r.Group("/shop")
	{
		shopGroup.GET("/index", func(c *gin.Context) {...})
		shopGroup.GET("/cart", func(c *gin.Context) {...})
		shopGroup.POST("/checkout", func(c *gin.Context) {...})
	}
	r.Run()
}
```
路由组也是支持嵌套的，例如：
```go
shopGroup := r.Group("/shop")
	{
		shopGroup.GET("/index", func(c *gin.Context) {...})
		shopGroup.GET("/cart", func(c *gin.Context) {...})
		shopGroup.POST("/checkout", func(c *gin.Context) {...})
		// 嵌套路由组
		xx := shopGroup.Group("xx")
		xx.GET("/oo", func(c *gin.Context) {...})
	}
```
通常我们将路由分组用在划分业务逻辑或划分API版本时。

<font color=#1E90FF>**③ 路由原理**</font>

`Gin`框架中的路由使用的是`httprouter`这个库。其基本原理就是构造一个路由地址的前缀树。

## Gin中间件
`Gin`框架允许开发者在处理请求的过程中，加入用户自己的钩子（Hook）函数。这个钩子函数就叫中间件，中间件适合处理一些公共的业务逻辑，比如登录认证、权限校验、数据分页、记录日志、耗时统计等。

### 1 定义中间件
`Gin`中的中间件必须是一个`gin.HandlerFunc`类型。例如我们像下面的代码一样定义一个统计请求耗时的中间件:
```go
// StatCost 是一个统计耗时请求耗时的中间件
func StatCost() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Set("name", "小王子") // 可以通过c.Set在请求上下文中设置值，后续的处理函数能够取到该值
		// 调用该请求的剩余处理程序
		c.Next()
		// 不调用该请求的剩余处理程序
		// c.Abort()
		// 计算耗时
		cost := time.Since(start)
		log.Println(cost)
	}
}
```

### 2. 注册路由
<font color=#1E90FF>**① 为全局路由注册**</font>

```go
func main() {
	// 新建一个没有任何默认中间件的路由
	r := gin.New()
	// 注册一个全局中间件
	r.Use(StatCost())

	r.GET("/test", func(c *gin.Context) {
		name := c.MustGet("name").(string) // 从上下文取值
		log.Println(name)
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello world!",
		})
	})
	r.Run()
}
```

<font color=#1E90FF>**② 为某个路由单独注册**</font>

```go
// 给/test2路由单独注册中间件（可注册多个）
	r.GET("/test2", StatCost(), func(c *gin.Context) {
		name := c.MustGet("name").(string) // 从上下文取值
		log.Println(name)
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello world!",
		})
	})
```

<font color=#1E90FF>**③ 为路由组注册中间件**</font>

为路由组注册中间件有以下两种写法。
+ 写法1：
	```go
	shopGroup := r.Group("/shop", StatCost())
	{
		shopGroup.GET("/index", func(c *gin.Context) {...})
		...
	}
	```

+ 写法2：
	```go
	shopGroup := r.Group("/shop")
	shopGroup.Use(StatCost())
	{
			shopGroup.GET("/index", func(c *gin.Context) {...})
			...
	}
	```

### 3. 中间件注意事项
<font color=#1E90FF>**① gin默认中间件**</font>

`gin.Default()`默认使用了`Logger`和`Recovery`中间件，其中：

+ <font color=#1E90FF> Logger中间件将日志写入gin.DefaultWriter，即使配置了GIN_MODE=release。</font>
+ <font color=#1E90FF>Recovery中间件会recover任何panic。如果有panic的话，会写入500响应码。</font>

如果不想使用上面两个默认的中间件，可以使用`gin.New()`新建一个没有任何默认中间件的路由。

<font color=#1E90FF>**② gin中间件中使用goroutine**</font>

<font color=#DD1144>当在中间件或handler中启动新的goroutine时，不能使用原始的上下文（c *gin.Context），必须使用其只读副本（c.Copy()）。</font>

我们可以在多个端口启动服务，例如：
```go
package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/sync/errgroup"
)

var (
	g errgroup.Group
)

func router01() http.Handler {
	e := gin.New()
	e.Use(gin.Recovery())
	e.GET("/", func(c *gin.Context) {
		c.JSON(
			http.StatusOK,
			gin.H{
				"code":  http.StatusOK,
				"error": "Welcome server 01",
			},
		)
	})

	return e
}

func router02() http.Handler {
	e := gin.New()
	e.Use(gin.Recovery())
	e.GET("/", func(c *gin.Context) {
		c.JSON(
			http.StatusOK,
			gin.H{
				"code":  http.StatusOK,
				"error": "Welcome server 02",
			},
		)
	})

	return e
}

func main() {
	server01 := &http.Server{
		Addr:         ":8080",
		Handler:      router01(),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	server02 := &http.Server{
		Addr:         ":8081",
		Handler:      router02(),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
   // 借助errgroup.Group或者自行开启两个goroutine分别启动两个服务
	g.Go(func() error {
		return server01.ListenAndServe()
	})

	g.Go(func() error {
		return server02.ListenAndServe()
	})

	if err := g.Wait(); err != nil {
		log.Fatal(err)
	}
}
```


**参考资料**

+ [李文周的博客](https://liwenzhou.com/posts/Go/Gin_framework/)
+ [Gin Web Framework](https://gin-gonic.com/zh-cn/docs/)