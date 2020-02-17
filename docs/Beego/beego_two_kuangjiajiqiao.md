# 应用框架搭建技巧

## conf配置
首先我们需要一个数据库连接，在项目的`conf/app/conf`中添加数据库的连接设置：
```go
appname = go_web
httpport = 8880
runmode = dev

# MySQL配置
# 主库(write)
db_w_host=127.0.0.1
db_w_port=3306
db_w_username=root
db_w_password=123456
db_w_database=mbook
```
可以看到我们这里只是简单的设置了主数据库的一些配置，因为我们后面从数据库的一些配置，我们到时候还会在这里添加。

## sysinit初始化
并且同时要设置一个<font color=#DD1144>全局初始化的配置</font>，我们在项目根目录下面创建一个`sysinit`的目录，然后创建一个`sysinit/init.go`的全局初始化文件，内容如下：
```go
// sysinit/init.go
package sysinit

func init() {
	sysinit()   // 系统的初始化（包含一些静态路径的设置，一些变量等）
	dbinit("w") // 数据库的初始化
}
```
+ <font color=#1E90FF>每个包下面可以有多个init函数，它是在整个项目的main函数执行前的一个操作。而且在go当中呢，某个init函数在主进程之中只会执行一次</font>，所以，<font color=#DD1144>无论sysinit这个包被调用多少次，这里的init函数只会在整个main函数启动之前执行唯一的一次</font>
+ `sysinit/init.go`中`init`函数是没有参数，也没有返回值的，我们在这里做一个全局的数据库连接

### 1. 系统初配置
我们在`sysinit`目录下面继续新建一个`sysinit.go`的文件，文件内容如下：
```go
// sysinit/sysinit.go
package sysinit

import (
	"path/filepath"
	"strings"
	"github.com/astaxie/beego"
)

// 注册静态路径
func sysinit() {
	uploads := filepath.Join("./", "uploads")
	// 告诉beego这是一个静态资源的路径,访问localhost:8880/uploads就访问这个路径
	beego.BConfig.WebConfig.StaticDir["/uploads"] = uploads

	registerFunctions()
}

// 注册前端调用后端的一些方法（注册进入Beego的funcMap中）
func registerFunctions() {
	beego.AddFuncMap("cdnjs", func(p string) string {
		// 将cdnjs的全路径返回给前端就好了
		// p参数实际上是数据库给定的一个相对目录
		cdn := beego.AppConfig.DefaultString("cdnjs", "")
		if strings.HasPrefix(p, "/") && strings.HasSuffix(cdn, "/") {
			return cdn + string(p[1:])
		}
	})
}
```
上述代码中的`sysinit`方法包含两个大的部分：
+ <font color=#1E90FF>注册静态路径</font>：保证我们通过`localhost:8880/uploads`可以访问到我们项目根路径下的`uploads`文件。
+ <font color=#1E90FF>FuncMap方法注册</font>：然后关于`registerFunctions`的代码我们暂时只是举了一个例子，并不需要特别研究它的意思，我们后面再增加新的`FuncMap`的时候，我们会具体的讲到。

### 2. 数据库配置
接着我们在`sysinit`目录下面来配置数据库的初始化配置，创建`dbinit.go`,内容如下：
```go
// sysint/dbinit.go
package sysinit

import (
	_ "go_web/models"  // 初始化models的init方法
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
)

// 负责建立一个数据库的连接
func dbinit(alias string) {
	dbAlias := alias //beego连接数据库至少需要一个default
	if "w" == alias || len(alias) <= 0 || "default" == alias {
		dbAlias = "default"
		alias = "w"
	}

	// 配置数据库名称
	dbName := beego.AppConfig.String("db_" + alias + "_database")
	// 配置数据库用户名
	dbuser := beego.AppConfig.String("db_" + alias + "_username")
	// 配置数据库密码
	dbPwd := beego.AppConfig.String("db_" + alias + "_password")
	// 配置数据库IP
	dbHost := beego.AppConfig.String("db_" + alias + "_host")
	// 配置数据库端口
	dbPort := beego.AppConfig.String("db_" + alias + "_port")
	// root:123456@tcp(127.0.0.1:3306)/mbook?charset=utf8
	orm.RegisterDataBase(dbAlias, "mysql", dbuser+":"+dbPwd+"@tcp("+dbHost+":"+dbPort+")/"+dbName+"?charset=utf8", 30)

	// 判断是否是开发模式
	isDev := ("dev" == beego.AppConfig.String("runmode"))

	// 主库自动建表
	if "w" == alias {
		orm.RunSyncdb("default", false, isDev)
	}

	if isDev {
		orm.Debug = isDev
	}
}
```
+ 我们知道，`beego`是通过`orm.RegisterDataBase`来通过拼接一个比较长而且复杂的字符串来连接数据库的，我们这个项目有好几个数据库，所以在`sysinit/init.go`中的`init`方法中使用`dbinit("w")`或者`dbinit()`都是在连接主数据库，参数`w`只是初始化主数据库的一个标志而已，后面连接其他的从数据库我们需要调用`dbinit()`并且要传入其他参数来拼接不同的字符串，再使用`orm.RegisterDataBase`去根据不同的字符串来连接不同的数据库
+ 还有一个比较重要的地方就是在初始化数据库的一开始，我们`import`了`_ "go_web/models"`，这个是因为也是和数据库有关，因为`controllers`和数据库之间是`Model`层，我们需要在初始化数据库的一些信息的时候，同时去调用`Model`层中的`init`函数，那`Model`的初始化部分我们下面会讲到，这里先提及一下

### 3. 数据库配置重构
之前我们的`dbinit`是只有一个参数，这个的结果就是如果我们有多个服务器，连接的时候即使有不同的参数，也要在`sysinit`包中的`init`函数中，用不同的参数多次调用`dbinit`，我们希望重构能够达这样的效果，`dbinit`有多个可选参数，根据调用时具体传入的参数来判断连接几个不同的服务器，所以我们重构`sysinit/dbinit.go`的内容如下：
```go
// sysinit/dbinit.go
package sysinit

import (
	_ "go_web/models"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
)

// 负责建立一个数据库的连接
func dbinit(aliases ...string) {
	// 判断是否是开发模式
	isDev := ("dev" == beego.AppConfig.String("runmode"))

	if len(aliases) > 0 {
		for _, alias := range aliases {
			registDatabase(alias)
			// 自动建表
			if "w" == alias {
				orm.RunSyncdb("default", false, isDev)
			}
		}
	} else {
		registDatabase("w")
		orm.RunSyncdb("default", false, isDev)
	}

	if isDev {
		orm.Debug = isDev
	}
}

func registDatabase(alias string) {
	if len(alias) <= 0 {
		return
	}
	dbAlias := alias //beego连接数据库至少需要一个default
	if "w" == alias || "default" == alias {
		dbAlias = "default"
		alias = "w"
	}

	// 配置数据库名称
	dbName := beego.AppConfig.String("db_" + alias + "_database")
	// 配置数据库用户名
	dbuser := beego.AppConfig.String("db_" + alias + "_username")
	// 配置数据库密码
	dbPwd := beego.AppConfig.String("db_" + alias + "_password")
	// 配置数据库IP
	dbHost := beego.AppConfig.String("db_" + alias + "_host")
	// 配置数据库端口
	dbPort := beego.AppConfig.String("db_" + alias + "_port")
	// root:123456@tcp(127.0.0.1:3306)/mbook?charset=utf8
	orm.RegisterDataBase(dbAlias, "mysql", dbuser+":"+dbPwd+"@tcp("+dbHost+":"+dbPort+")/"+dbName+"?charset=utf8", 30)
}
```
经过上面的改造，我们在`sysinit/init.go`中的`init`函数中就可以通过多种灵活的方式来调用`dbinit`方法：
```go
// 第一种，默认初始化主数据库
dbinit()  // 或者dbinit("w")

// 第二种，一次性初始化多个服务器
dbinit("w","r")

// 第三种，和没有重构前一样，根据不同的参数逐个调用
dbinit("w")
dbinit("r")
```

## models配置
前面说过了`models`目录下的文件都是`Model`层的东西，也都是属于`models`这个包，这个包中的`init`函数在数据库初始连接的时候要先调用，所以我们在`models`目录下面创建`init.go`文件，内容如下：
```go
// models/init.go
package models

func init() {
	// 做一些初始化的操作
}
```
当前还没有关于数据库的操作，所以我们等到操作`Model`层的时候我们再来补充这里的东西

## controllers配置
在项目的`controllers`目录下面本身有一个`default.go`文件的，现在我们新建一个`BaseController.go`文件，和`default.go`文件的内容分别如下：
```go
// controllers/BaseController.go
package controllers

import (
	"github.com/astaxie/beego"
)

type BaseController struct {
	beego.Controller
}
```
```go
// controllers/default.go
package controllers

type MainController struct {
	BaseController
}

func (c *MainController) Get() {
	c.Data["Website"] = "beego.me"
	c.Data["Email"] = "astaxie@gmail.com"
	c.TplName = "index.tpl"
}
```
那实际上我们只是在原本`default.go`的基础上将`beego.Controller`这类型单独包装了一下，因为在后面会大量使用到`beego.Controller`这个类型，所以我们为了不写那么多相同的代码，这里就简答的包装一下。

## main.go配置
`main.go`的内容如下：
```go
package main

import (
	_ "go_web/routers"
	_ "go_web/sysinit"
	"github.com/astaxie/beego"
)

func main() {
	beego.Run()
}
```
相比于项目最开始的时候，这里只在`import`当中添加了一个`_ "go_web/sysinit"`,也实现了我们最开始的想法，在执行`main`函数之前我们需要去执行`sysinit`包中的`init`函数，这个函数中同时又初始化了系统和数据库的初始设置，数据库的`dbinit.go`文件中又调用了`Model`层的`init`函数。<font color=#DD1144>所以sysinit包中init函数的初始化引发了一系列的初始化配置</font>。

我们下面由项目的入口文件`main.go`，通过正确的文件引用关系来展示在`main`函数执行前的所有初始化设置和文件：
<img :src="$withBase('/beego_two_initConnect.png')" alt="系统初始化">