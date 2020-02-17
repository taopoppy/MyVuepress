#　Beego入门案例（二-1）

## 项目分析

### 1. 需求分析和技术选型
<font color=#1E90FF>**① 需求分析**</font>

关于`CMS`系统基本上有这么三个必不可少的模块，分别是<font color=#1E90FF>登录模块</font>、<font color=#1E90FF>用户管理&权限验证</font>、<font color=#1E90FF>内容管理</font>。

关于我们的内容管理，因为不同的模块实际上都有相同的操作，编辑，添加，删除等等，但是对于每个模块内容又不一样，所以我们希望对所有的模块进行<font color=#DD1144>操作上的统一格式化处理</font> 和 <font color=#DD1144>内容上的编辑处理</font>，具体什么意思，我们后面开发的时候就会知道。

<font color=#1E90FF>**② 技术选型**</font>

关于技术选型，主要有两个考虑的方面：<font color=#DD1144>存储选型</font> 和 <font color=#DD1144>开发语言选择</font>

存储选型无非就是在`NoSQL`和`SQL`中选择了：
+ <font color=#3eaf7c>NoSQL</font>:`Key-Value`的存储优点和缺点都很明显:
  + <font color=#1E90FF>优点</font>：详情字段灵活
  + <font color=#1E90FF>缺点</font>：排序不灵活，无法关联查询
+ <font color=#3eaf7c>SQL</font>:和`NoSQL`的优缺点基本上是相反的：
  + <font color=#1E90FF>优点</font>：排序灵活，关联查询
  + <font color=#1E90FF>缺点</font>：字段修改不灵活

虽然各有各的优缺点，但是在整个互联网，还是比较推荐`SQL`数据库，那么对于传统的`SQL`我们怎么克服整个字段修改不灵活的问题呢？
+ <font color=#3eaf7c>传统的关系型数据库</font>:

  | id            | 姓名          | 性别   | 班级     |
  | ------------- |:-------------:| -----:|--------:|
  | 1             | 小明          | 男     | one     |
  | 2             | 小红          | 女     | one     |

+ <font color=#3eaf7c>优化后的设计</font>

  | id            | 学生信息          | 班级     |
  | ------------- |:------------------:|--------:|
  | 1             | {“name”:"小明","sex":"男"}  | one     |
  | 2             | {“name”:"小红","sex":"女"}  | one     |

因为`Mysql`在`5.7`之后出现了`json`的数据格式，所以像关于学生的这些信息我们都可以放在一个`json`数据类型的字段当中，不过如果`mysql`比较旧的话可以将里面的内容保存成一个比较大的字符串，然后取出来进行`JSON`解析即可，所以这样我们就能比较完美的规避`SQL`的缺点了。

### 2. CMS系统设计
在设计之前的时候，我们需要好好的回顾一下整个项目的功能模块：<font color=#3eaf7c>用户管理</font>、<font color=#3eaf7c>菜单管理</font>、<font color=#3eaf7c>登录和权限管理</font>、<font color=#3eaf7c>内容管理（通用化设计）</font>

<font color=#1E90FF>**① 数据库设计**</font>

  | id     | parent_id | content                                     |col_order  |col_search |
  | ------ |:---------:|:-------------------------------------------:|:---------:|:---------:|
  | 1      | 3         | {“name”:"温泉物语","icon":"gameIconUrl"...}  |col_order  |col_search |
  | 2      | 0         | {“name”:"航海日记","icon":"gameIconUrl1"...} |col_order  |col_search | 
  | 3      | 0         | {“class”:"单机游戏","banner":"gameIconUrl2"...} |col_order  |col_search | 

可以看到的就是，`id`为1和2的都是游戏类型内容，但是`id`为3的是游戏分类内容，所以这就是`json`类型数据的优化设计的好处，那么`id`为1和2的单机游戏都是属于`id`为3的游戏分类，所以他们的`parent_id`的字段内容就是3，所以这个基本上是个我们的数据库数据表的设计思路。

<font color=#1E90FF>**② 系统设计**</font>

关于系统设计，我们需要走这样的一套流程：`信息采集`-> `内容编辑` -> `格式化`，也就是先定义数据的格式，按照这种格式去采集信息：

<img :src="$withBase('/beego_one_systemdesign.png')" alt="系统设计">

所以这里的系统设计的亮点就是：<font color=#DD1144>内容管理是一个可配置化的通用性的设计</font>，这样在处理不同数据的业务上呢，可以很大程度的减少我们的编码量。

## Beego快速入门

### 1. 搭建环境和MVC实践
关于环境的搭建，我们可以参考下面两个部分，分别是`go`环境的安装和`Beego`框架的安装：
+ [Go的安装](taopoppy.cn/go/#什么是go语言)
+ [Beego环境搭建](taopoppy.cn/Beego/beego_two_jiagouzhilu.html#架构思考) 
### 2. MYSQL基础操作
`mysql`的`CURD`操作，基本上是在`Models`目录下面做的，我们可以先来创建一个`page.go`，然后来做一些增删改查的操作：
```go
// helloworld/models/page.go
package models

import (
	"fmt"

	"github.com/astaxie/beego/orm"
  _ "github.com/go-sql-driver/mysql"   // 初始化mysql的驱动
)

// 创建和数据表page中一样字段的结构（注意这里的都要首字母大写）
type Page struct {
	Id      int
	Website string
	Email   string
}

func init() {
	// 注册数据库
	orm.RegisterDataBase("default", "mysql", "root:123456@tcp(127.0.0.1:3306)/test?charset=utf8")
	// 注册对象
	orm.RegisterModel(new(Page))
}

// 数据库的查操作
func GetPage() Page {
	o := orm.NewOrm()
	p := Page{Id: 2}
	err := o.Read(&p)
	fmt.Println(err)
	return p
}

// 数据库的改操作
func UpdatePage() {
	o := orm.NewOrm()
	p := Page{Id: 1, Email: "myemail_updated"}
	// o.Update(&p) // 这种写法就是全部替换
	o.Update(&p, "Email") // 这种写法就是只更新Email的字段
}

// 数据库的增操作
func InsertPage() {
	o := orm.NewOrm()
	var p Page
	p.Website = "taopopy.cn"
	p.Email = "taopoppy@gmail.com"

	id, err := o.Insert(&p)
	if err == nil {
		fmt.Println(id)
	}
}

// 数据库的删操作
func DeletePage() {
	o := orm.NewOrm()
	if num, err := o.Delete(&Page{Id: 1}); err == nil {
		fmt.Println(num)
	}
}
```
上面的这些函数写好之后，我们只需要在`controllers`中去引入`models`这个包，然后去调用这些函数即可：
```go
// helloworld/controllers/default.go
package controllers

import (
	"helloworld/models"

	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
}

func (c *MainController) Get() {
	models.UpdatePage()   // 更新数据
	models.InsertPage()   // 插入数据
	m := models.GetPage() // 获取数据
	models.DeletePage()   // 删除数据
	c.Data["Website"] = m.Website
	c.Data["Email"] = m.Email
	c.TplName = "index.tpl"
}
```

### 3. 用户和日志实践
<font color=#1E90FF>**① session控制**</font>

`beego`内置了`session`模块,我们只需要通过在`conf/app.conf`中添加下面的配置就能够开启`session`的功能：
```go
// conf/app.conf

sessionon = true
```

关于`session`的几个最常用的方法，都是在`MainController`这个结构中定义过的，
+ `SetSession(name string, value interface{})`: 设置`session`
+ `GetSession(name string) interface{}`： 获取`session`
+ `DelSession(name string)`:删除`session`

所以我们可以在`controllers/default`简单的使用一下上面几个方法：
```go
// controllers/default.go
package controllers

import (
	"fmt"
	"helloworld/models"

	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
}

func (c *MainController) Get() {
  // 设置session
  c.SetSession("username", "taopoppy")     
  // 获取session
  user := c.GetSession("username")
  fmt.Println(user)  // taopoppy
  // 删除session
  c.DelSession("username")
  user1 := c.GetSession("username")
  fmt.Println(user1) // nil
  
  m := models.GetPage()
  c.Data["Website"] = m.Website
  c.Data["Email"] = m.Email
  c.TplName = "index.tpl"
}
```

<font color=#1E90FF>**② 日志处理**</font>

+ 我们首先要去下载一下`beego`中的`logs`这个模块：
  ```go
  go get github.com/astaxie/beego/logs
  ```

+ 然后在`main.go`中去定义日志的一些等级和写入文件的名称等信息：
  ```go
  // mian.go
  package main

  import (
    _ "helloworld/routers"

    "github.com/astaxie/beego"
    "github.com/astaxie/beego/logs" // 引入包
  )

  func main() {
    logs.SetLevel(beego.LevelInformational)                // 设置打印日志的等级
    logs.SetLogger("file", `{"filename":"logs/test.log"}`) // 设置日志输出的文件
    beego.Run()
  }
  ```

+ 最后我们在其他`controllers`的文件下使用的时候就可以这样：
  ```go
  // controllers/default.go
  package controllers

  import (
    "helloworld/models"

    "github.com/astaxie/beego"
    "github.com/astaxie/beego/logs"   // 引入包
  )

  type MainController struct {
    beego.Controller
  }

  func (c *MainController) Get() {
    c.SetSession("username", "taopoppy")
    user := c.GetSession("username")
    logs.Informational("user taopoppy loged in")  // 将这段日志写入logs/test.log文件中

    c.Data["Website"] = m.Website
    c.Data["Email"] = m.Email
    c.TplName = "index.tpl"
  }
  ```
  

**参考资料**

1. [session控制](https://beego.me/docs/mvc/controller/session.md)
2. [日志处理](https://beego.me/docs/mvc/controller/logs.md)