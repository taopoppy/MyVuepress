# Beego入门案例（二-2）

## 菜单model初始化

### 1. 初始化Model层

首先我们要对菜单的`model`来分析一下，定义它的`model`:
|数据库列  | 说明   |
|:-------|:------|
|菜单ID|菜单项标识ID,主键|
|菜单Name| 菜单名|
|父级菜单ID|上级菜单ID，自联表|
|排序|调整菜单显示功能|
|格式Json| Json格式字符串，关联数据的格式表达|

按照这样的需求我们来定义一个菜单的`model`,我们在`Models`下面创建`MenuModel.go`文件，然后内容如下：
```go
// models/MenuModel.go
package models

// 定义一个菜单模块的结构
type MenuModel struct {
	Mid    int    `orm:"pk;auto"` // 定义主键属性和自增的特性
	Parent int    // 父级菜单ID
	Name   string `orm:"size(45)"` // 定义它是长度为45，在数据库中属于VARCHAR(45)
	Seq    int    // 排序
	Format string `orm:"size(2048);default({})"` // Json
}

// 定义一个菜单树状的结构
type MenuTree struct {
	MenuModel
	Child []MenuModel
}

// 通过这个方法定义数据表名（这个方法的名称是固定的）
func (m *MenuModel) TableName() string {
	return "xcms_menu"
}
```
这样的一个`model`怎么在整个`Model`层去初始化呢，我们依旧来在`models`文件夹下面创建一个`init.go`来连接数据库的时候初始化所有的`model`:
```go
// models/init.go
package models

import (
	"github.com/astaxie/beego/orm"
)

func init() {
	// 注册对象(在sysinit/initDB中设置了自动建表，在数据库中就会根据mode中的struct自动建表)
	orm.RegisterModel(new(MenuModel))
}
```

### 2. 连接数据库
这样好了之后，我们刚才说：<font color=#DD1144>我们需要在真个main函数执行之前要去连接数据库，在连接数据库之前要初始化整个Models层</font>，所以现在我们要做的事情就是在`main`函数执行之前去连接或者初始化数据库。

我们首先创建一个`sysinit`目录，然后创建两个文件，分别是`initDB.go`和`sysinit.go`文件，内容如下：
```go
// sysinit/sysinit.go
package sysinit

func init() {
	// init db
	initDB()
}
```
```go
// sysinit/initDB.go
package sysinit

import (
	_ "helloworld/models"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
)

// 负责建立一个数据库的连接
func initDB() {
	// 连接名称
	dbAlias := beego.AppConfig.String("db_alias")
	// 配置数据库名称
	dbName := beego.AppConfig.String("db_name")
	// 配置数据库用户名
	dbUser := beego.AppConfig.String("db_user")
	// 配置数据库密码
	dbPwd := beego.AppConfig.String("db_pwd")
	// 配置数据库IP
	dbHost := beego.AppConfig.String("db_host")
	// 配置数据库端口
	dbPort := beego.AppConfig.String("db_port")
	// root:123456@tcp(127.0.0.1:3306)/mbook?charset=utf8
	orm.RegisterDataBase(dbAlias, "mysql", dbUser+":"+dbPwd+"@tcp("+dbHost+":"+dbPort+")/"+dbName+"?charset=utf8", 30)

	// 判断是否是开发模式
	isDev := ("dev" == beego.AppConfig.String("runmode"))

	// 主库自动建表
	orm.RunSyncdb("default", false, isDev)

	if isDev {
		orm.Debug = isDev
	}
}
```

### 3. 系统配置和入口
既然想连接数据库，我们就需要将数据库的信息都在`conf/app.conf`中配置好，所以我们在`conf/app.conf`配置数据库的信息：
```go
// conf/app.conf
appname = helloworld
httpport = 8090
runmode = dev

sessionon = true

#mysql
db_alias = "default"
db_name = "xcms"
db_user = "root"
db_pwd = "123456"
db_host = "localhost"
db_port = 3306
db_charset = "utf8"
```

最后我们在`main.go`文件中引入`sysinit`包中的初始化函数：
```go
// main.go
package main

import (
	_ "helloworld/routers"
	_ "helloworld/sysinit"  // 在main函数执行之前执行sysinit包中的init函数
	"github.com/astaxie/beego"
)

func main() {
	beego.Run()
}
```
所以整个项目现在关于数据库和`Models`层的初始化流程现在是这样，如图所示：

## 菜单列表开发
### 1. 系统菜单的实现
关于菜单列表，我们是要从数据库中取出来一个个的菜单模块的数据，并且根据他们是子节点还是父节点，进行组合，形成一个个的`MenuTree`的结构，返回给前端，前端拿到这个东西，就循环展示即可：
```go
// models/MenuModel.go中MenuStruct方法
// 从数据库xcms_menu表中取出所有的数据并改造成为我们需要的MenuTree结构的map返回
func MenuStruct() map[int]MenuTree {
	query := orm.NewOrm().QueryTable("xcms_menu") // 查询xcms_menu这个表
	data := make([]*MenuModel, 0)                 // 定义一个保存MenuModel结构的指针切片
	query.OrderBy("parent", "-seq").All(&data)    // 查询按照parent的顺序和seq的倒叙查询

	var menu = make(map[int]MenuTree) // 创建整个菜单
	if len(data) > 0 {
		for _, v := range data {
			if 0 == v.Parent {
				// 此时的节点是父节点
				var tree = new(MenuTree)
				tree.MenuModel = *v
				menu[v.Mid] = *tree
			} else {
				// 此时的节点是子节点
				if tmp, ok := menu[v.Parent]; ok { // 如果子菜单的父级ID是存在于menu中的
					tmp.Child = append(tmp.Child, *v) // 子节点就加入这父级菜单
					menu[v.Parent] = tmp              // 重新保存整个新的父级菜单
				}
			}
		}
	}
	return menu
}
```
### 2. 菜单管理列表页的实现
请求管理列表相当于发送一个`ajax`的请求到后端服务，后端服务从数据库取到数据要以`json`的格式进行返回，然后我们就来看请求`localhost:8090/menu/list`这样一个接口都经历了哪些代码
+ 首先定义路由信息：
	```go
	// routers/router.go
	package routers

	func init() {
		//home
		beego.Router("/", &controllers.HomeController{}, "Get:Index")
		//menu的路由信息
		beego.Router("/menu/list", &controllers.MenuController{}, "*:List")
	}
	```
+ 然后根据对应的`controller`到控制器中书写代码：
	```go
	// controllers/MenuController.go
	// 访问localhost:8090/menu/list的api接口
	func (c *MenuController) List(){
		data,total := models.MenuList()
		type MenuEx struct {
			models.MenuModel
			ParentName string
		}
		var menu = make(map[int]string)
		for _,v = range data {
			menu[v.Mid] = v.Name
		}
		
		var dataEx []MenuEx
		for _,v = range data {
			dataEx = append(dataEx,MenuEx{*v,menu[v.Parent]})
		}
		c.jsonResult(consts.JRCodeSucc,"ok",total,dataEx)
	}
	```
+ 通过`Model`层和数据库进行交互拿到数据库返回给控制层
	```go
	// models/MenuModel.go
	// 取具体的菜单数据的方法
	func MenuList() ([]*MenuModel, int64) {
		query := orm.NewOrm().QueryTable("xcms_menu")
		total, _ = query.Count()
		data := make([]*MenuModel, 0)
		query.OrderBy("parent", "-seq").All(&data) // 这种从数据库取数据库的方式很特别，取出的结果往data里放
		return data, total
	}
	```
	

## 菜单编辑功能
编辑主要涉及到数据库的一些读取和更新的操作，我们需要在`controllers/MenuController.go`中添加如下的代码：
```go
// 编辑数据的控制器
func (c *MenuController) Edit() {
	c.Data["Mid"] = c.GetString("mid")
	c.Data["Parent"] = c.GetInt("parent")
	c.Data["Seq"] = c.GetString("seq")
	c.Data["Name"] = c.GetString("name")
	
	var pMenus []models.MenuModel
	
	data,_:=models.MenuList()
	for _,v :=range data {
		if 0==v.Parent {
			pMenus = append(pMenus,*v)
		}
	}
	c.Data["PMenus"] = pMenus
	c.LayoutSections=make(map[string]string)
	c.LayoutSections["footerjs"] = "menu/footerjs_edit.html"
	c.setTpl("menu/edit.html","common/layout_edit.html")
}

// 提交编辑的内容
func (c *MenuController) EditDo() {
	var m models.MenuModel
	if err:=c.ParseForm(&m);err == nil {
		orm.NewOrm().Update(&m)
	}
}
```
