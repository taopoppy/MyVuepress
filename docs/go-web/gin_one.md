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
