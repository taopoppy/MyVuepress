# 环境搭建（二）

## mysql的安装
### 1. mysql的安装
关于`mysql`的安装，我们这里只说一下`windows`的安装，其实很简单，我们参考这个链接即可：[Win10安装MySQL5.7.26](https://blog.csdn.net/weixin_43611145/article/details/90648751)

如果你想在`linux`系统下面最新的`mysql8.0`，可以参考一下这个链接即可：[部署Mysql数据库
](https://www.taopoppy.cn/Mysql/mysql_one_download.html#%E9%83%A8%E7%BD%B2mysql%E6%95%B0%E6%8D%AE%E5%BA%93)
### 2. mysql_workbench的安装
关于`mysql`的图形化工具有很多，我们这里推荐官方的工具`mysql_workbench`，具体点击这里的[官网](https://downloads.mysql.com/archives/workbench/)就能去下载。有了上面的这些准备工作，我们就可以开始我们`Beego`框架对数据库操作的学习了。

## Beego之ORM初实践
当我们已经下载好上面的东西之后，我们使用`mysql_workbench`链接到我们本地的`3306`的`mysql`的服务，然后创建一个`test`的测试数据库（`Charset/Collation`分别是`utf8/Default Collation`），然后创建一个`uesr`的表（`id`,`name`,`sex`）,然后添加几条数据，我们下面来演示如何使用`beegp`的`ORM`来操作数据库。

### 1. 常规数据库操作
我们首先在之前的项目当中的`models`下面创建`testuser.go`来取出刚才在数据库中建立的几个数据：
```go
// go_web/models/testuser.go
package models

import (
	"database/sql" // 这个包下面可以使用多个数据库的引擎
	"fmt"
	_"github.com/go-sql-driver/mysql" // 初始化一个mysql
)

fun PrintUsers() {
	// 建立与数据库的链接
	db,err := sql.Open("mysql","root:123456@tcp(127.0.0.1:3306)/test?charset=utf8") // 第二个参数是根据用户名密码生成链接字符串
	defer db.Close()
	if err!=nil {
		return
	}
	
	// 查询结果
	stmt,err := db.Prepare("select * from user limit 10")
	defer stmt.Close()
	if err!=nil {
		return
	}
	
	// 返回结果
	rows,err:=stmt.Query()
	defer rows.Close()
	if err!=nil{
		return
	}
	
	// 处理结果
	for rows.Next() {
		var id int
		var name string
		var sex int8
		rows.Scan(&id,&name,&sex)
		fmt.Println(id,name,sex)
	}
}
```

然后我们要在控制器当中去通过执行`models`当中的函数去拿到数据库中的数据，并且打印出来，我们在`controllers/default.go`文件修改一下代码：
```go
// go_web/controllers/default.go
package controllers

import (
	"fmt"
	"go_web/models" // 注意这里要引入models的文件
	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
}

func (c *MainController) Hi() {
	models.PrintUsers()     // 调用models中定义的函数
	c.TplName = "index.tpl"
}
```

接着我们在项目的路径下面使用`bee run`来启动项目，然后打开浏览器访问`localhost:8080/hi`我们在命令行中就能看到我们从数据库中取到的数据:
<img :src="$withBase('/beego_two_qidong.png')" alt="项目启动显示">

### 2. ORM数据库操作
从常规的数据库操作来看还是比较麻烦，我们现在使用`ORM`的方式,那么`ORM`全称叫做<font color=#DD1144>对象关系映射</font>,主要的座作用是: <font color=#1E90FF>在我们使用和描述的对象与数据库中的数据表或者数据之间进行映射,使我们能通过操作对象来实际的操作到底层的数据库中去</font>,但是实际上通过上面的操作来看,常规的数据库操作都要经过链接,写具体的`sql`语句，然后执行，对取出的数据还要进一步做封装，那实际现在对于这些每个步骤都有很好的中间件来进行封装了，我们使用`ORM`之类的中间件,虽然是比较抽象的操作,但是提高了效率和安全性。

首先我们需要通过下面这个命令来安装`ORM`:
```go
go get github.com/astaxie/beego/orm
```

然后我们在之前的项目当中的`models`下面创建`testorm.go`来取出刚才在数据库中建立的几个数据：
```go
// go_web/models/testorm.go
package models

import (
	"fmt"
	"github.com/astaxie/beego/orm"  // 可以使用很多数据库的引擎
	_ "github.com/go-sql-driver/mysql" // 主要调用mysql这个包中的init方法，初始化一个mysql引擎
)

// 结构体和结构对应起来
type User struct {
	Id   int     // 注意这里的都要大些，至于原因我猜和go语言中公有变量和私有变量有关
	Name string
	Sex  int8
}

func init() {
	// 注册mysql数据库
	orm.RegisterDataBase("default", "mysql", "root:123456@tcp(127.0.0.1:3306)/test?charset=utf8", 30)
	// 注册模型
	orm.RegisterModel(new(User))
}

func PrintUserByORM() {
	o := orm.NewOrm()   // 创建一个查询对象
	user := User{Id: 3} // 创建查询条件
	o.Read(&user)       // 将查询结果写入user变量中
	fmt.Println(user)
}
```
```go
// go_web/controllers/default.go
package controllers

import (
	"go_web/models"
	"github.com/astaxie/beego"
)

type MainController struct {
	beego.Controller
}

func (c *MainController) Hi() {
	models.PrintUserByORM()  // 调用方法
	c.TplName = "index.tpl"
}
```
<img :src="$withBase('/beego_two_ormdiaoyong.png')" alt="orm调用">

上面这种写法就是最简单的`ORM`查询数据的使用,关于`ORM`更多使用,我们在后面的实战中会具体说到。关于`ORM`创建结构体的写法需要注意下面两点:
+ <font color=#1E90FF>结构体和数据表要对应,其中的属性都是首字母大写</font>
+ <font color=#1E90FF>数据库带有下划线的字段（比如`last_name`）,在结构中统统使用驼峰的形式（比如`LastName`）</font>

## ORM应用小结
`Beego ORM`是一个使用便捷,有助于快速开发的`ORM`框架,其使用流程比较简洁,我们一起来看一下使用的几个环节:

### 1. ORM初始化过程
+ 先注册一个别名为`default`的`DataBase`，调用函数：
  ```go
  orm.RegisterDataBase(aliasName, driverName, dataSource string, params ...int) 
  ```
  函数名参数含义如下：
  + <font color=#1E90FF>aliasName</font>: 数据库别名。同一进程中可以注册多个数据库，这个参数用来在`ORM`中切换数据库使用，多个别名中必须有一个缺省的`"default"`
  + <font color=#1E90FF>driverName</font>:驱动名，可以取`"mysql"`,`"sqlite"`等
  + <font color=#1E90FF>dataSource</font>:数据库源配置链接字符串，和`Go`的`database/sql`包打开数据库连接时传入的参数一样。如`"username:password@tcp(127.0.0.1:3306)/db_name?charset=utf8"`
  + <font color=#1E90FF>params</font>:这是个变长参数，`params[0]`:设置最大空闲连接 ,`params[1]`:设置最大数据库连接

+ 注册`model`,调用函数：
  ```go
  orm.(models ...interface{})
  ```
  参数含义如下：
  + <font color=#1E90FF>models</font>:变长参数，这里可传入一个或多个`model`实例，如: `orm.RegisterModel(new(Book), new(User))`

+ 根据`Model`定义，自动创建数据表：
  ```go
  orm.RunSyncdb(name string, force bool, verbose bool)
  ```
  参数含义如下：
  + <font color=#1E90FF>name</font>：数据库别名
  + <font color=#1E90FF>force</font>：`true`:发生错误时，继续执行下一条`sql`
  + <font color=#1E90FF>verbose</font>：true:打印详细信息 
  
上面三个步骤，在实际应用中可能如下：
```go
// 注册 default database，并设置数据库连接池最大空闲连接数为30
orm.RegisterDataBase("default", "mysql", "username:password@tcp(127.0.0.1:3306)/db_name?charset=utf8", 30)

//注册 model
orm.RegisterModel(new(User))

// 自动建表（我们在上面是通过mysql_workbench来在mysql中添加的表）
orm.RunSyncdb("default", false, true)
```

### 2. ORM数据读写
我们这里只举一个综合的例子，具体的每个函数的使用和参数的含义到[官网](https://beego.me/docs/mvc/model/object.md)查询，上面写的非常清楚。
```go
o := orm.NewOrm()
o.Using("default") // 默认使用 default，你可以指定为其他数据库

user := User{Id: 1}
user.Nickname = "admin"
o.Insert(&user)  // 增加一个`ID`为1,`Nickname`为admin的用户

user.Phone="18001010101"
o.Update(&user)        // 更新这个用户的属性
o.Read(&user,"phone")  // 查询phone="18001010101"的用户信息

o.Delete(&User{Id: 1})  // 删除Id为1的用户
```

### 3. 其他
+ `Beego ORM`还有很多特性,比如高级查询,原生`sql`查询啊,构造查询啊,事务处理等等,我们可以看到，`Beego ORM`的基本使用还是相当便捷的，可以很好帮助我们提升开发效率。但也并非十全十美，比如：原生并不支持分表。

+ 想要了解更多`Beego ORM`的内容,请到[官网](https://beego.me/docs/mvc/model/overview.md)仔细阅读文档

**参考资料**
1. [https://beego.me/docs/mvc/model/overview.md](https://beego.me/docs/mvc/model/overview.md)
2. [Win10安装MySQL5.7.26](https://blog.csdn.net/weixin_43611145/article/details/90648751)
3. [性能优化+架构迭代升级Go读书社区web开发与架构优化](https://coding.imooc.com/class/403.html)