# Beego入门案例（二-3）

## 用户管理功能
用户信息编辑功能，我们需要定于用户的`model`,在`models`文件夹下面创建`UserModel.go`,内容如下：
```go
// models/UserModel.go
package models

import (
	"github.com/astaxie/beego/orm"
)

type UserModel struct {
	UserId   int    `orm:"pk;auto"`
	UseKey   string `orm:"size(64);unique"`
	UserName string `orm:"size(64)"`
	AuthStr  string `orm:"size(512)"`
	PassWord string `orm:"size(128)"`
	IsAdmin  int8   `orm:"default(0)"`
}

func (m *UserModel) TableName() string {
	return "xcms_user"
}

// 取得用户列表的操作
func UserList(pageSize, page int) ([]*UserModel, int64) {
	query := orm.NewOrm().QueryTable("xcms_user")
	total, _ := query.Count()

	offset := (page - 1) * pageSize
	data := make([]*UserModel, 0)
	query.OrderBy("-user_id").Limit(pageSize, offset).All(&data)

	return data, total
}
```
接着我们在`controllers`中创建一个`UserController.go`函数，添加下面的函数：
```go
// controllers/UserController.go
// 编辑要获取的用户的信息
func (c *UserController) Edit() {
	userId, _:=c.GetInt("userid")
	o:=orm.NewOrm()
	var user = models.UserModel{UserId:userid}
	o.Read(&user)
	user.PassWord = ""
	c.Data["User"] = user
	
	authmap:=make(map[int]bool)
	if len(user.AuthStr)> 0 {
		var authobj []int
		json.Unmarshal([]byte(user.AuthStr),&authobj)
		for _,v :=range authobj {
			authmap[v] = true
		}
	}
	
	type Menuitem struct {
		Name string
		Ischeck bool
	}
	menu :=models.ParentMenuList()  // 获取父节点的列表
	menus := make(map[int]Menuitem)
	for _,v :=range menu {
		menu[v.Mid] = Menuitem{v.Name,authmap[v.Mid]}
	}
	c.Data["Menu"] = menus
	c.LayoutSections=make(map[string]string)
	c.LayoutSections["footerjs"] = "user/footerjs_edit.html"
	c.setTpl("user/edit.html","common/layout_edit.html")
}
```
其中获取父节点的列表的`ParentMenuList`函数我们需要到`models/MenuModel.go`文件中定义：
```go
// models/MenuModel.go
// 取得父级节点的列表
func ParentMenuList() []*MenuModel {
	query := orm.NewOrm().QueryTable("xcms_menu").Filter("parent", 0)  // 过滤出父节点di为0的所有的父节点
	data := make([]*MenuModel, 0)
	query.OrderBy("-seq").All(&data) // 查询出来保存在整个MenuModel的切片中
	return data
}
```
## 用户登录功能
+ 现在我们登陆，首先我们需要这样，先在创建路由，在`routers/router.go`中的`init`方法中添加如下代码：
  ```go
  // routers/router.go
  package routers

  func init() {
    //login
    beego.Router("/login", &controllers.LoginController{}, "*:Index") // 登录的路由
  }
  ```

+ 接着我们在路由中说明要在`LoginController`结构的`Index`方法中处理用户的登陆请求，所以我们在`controllers`文件夹下面创建`LoginController.go`文件，内容如下：
  ```go
  package controllers
  import (
    "helloworld/models"
    "helloworld/utils"
    "strings"
    "github.com/astaxie/beego"
  )

  type LoginController struct {
    beego.Controller
  }

  func (c LoginController) Index() {
    if c.Ctx.Request.Method == "POST" { // 如果是post请求的话
      userkey := strings.TrimSpace(c.GetString("username"))  // 拿到表单中的username的值
      password := strings.TrimSpace(c.GetString("password")) // 拿到表单中的password的值

      if len(userkey) > 0 && len(password) > 0 {
        password := utils.Md5([]byte(password)) // 将用户的密码加密
        user := models.GetUserByName(userkey)
        // 将数据库中保存的加密密码和用户输入的密码转换做比对
        if password == user.PassWord {
          c.SetSession("xcmsuser", user) // 保存在session中
          c.Redirect("/", 302) // 重定向到首页
          c.StopRun() // beego中的停止方法
        }
      }
    }

    c.TplName = "login/index.html"
  }
  ```

+ 其中用到的根据`userkey`查找用户对象的`GetUserByName`方法我们需要到`models/UserModel.go`中去定义一下：
  ```go
  // models/UserModel.go
  // 根据userkey查找用户对象
  func GetUserByName(userkey string) UserModel {
    user := UserModel{UserKey: userkey} // 创建一个UserModel的结构
    o := orm.NewOrm()                   // 创建查询实例
    o.Read(&user)                       // 查询结果放在user结构中
    return user                         //返回
  }
  ```
  
## 用户权限验证
<font color=#1E90FF>前面在用户登录的使用已经将用户放入到session当中了，所以所有登录以后的权限控制都是基于这个session来做的</font>，所以我们的思路就是从`session`取出用户信息，根据用户信息判断权限

```go
// controllers/BaseController.go
// 实现左侧菜单的选择项
func (c *BaseController) Prepare() {
	c.controllerName, c.actionName = c.GetControllerAndAction()
	beego.Informational(c.controllerName, c.actionName)

	user := c.auth() // 每个页面都也调用Prepare方法，在这里做鉴权
	c.Data["Menu"] = models.MenuTreeStruct(user)
}

// 权限验证的私有方法
func (c *BaseController) auth() models.UserModel {
	user := c.GetSession("xcmsuser")
	if user == nil {
		c.Redirect("/login", 302) // 如果session中没有，就跳转到登录页面
		c.StopRun()
		return models.UserModel{}
	} else {
		return user.(models.MenuModel) // 将user强制转换为models.UserModel的类型
	}
}
```
