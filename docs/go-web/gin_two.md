# Gin数据库概述

## GORM连接MySQL

### 1. 什么是ORM
什么是`ORM`，说白了就是帮助我们来写`sql`的框架

<img :src="$withBase('/gin_gorm_one.png')" alt="">

正常的数据库操作需要程序员会写`SQL`语句，比如插入一条数据，我们在传统的后端操作需要在程序当中书写这样的`SQL`语句：
```sql
insert int userinfo values(1, "1.8米", "man", "篮球")
```
但是有了一些`ORM`的框架，可以帮助那些不怎么精通`SQL`的同学也可以顺利操作数据库，只需要正确使用方法即可，方法会根据我们传入的参数来映射成为对应的`SQL`语句：
```go
type UserInfo struct {
	ID uint
	Name string
	Gender string
	Hobby string
}

func main() {
	u1 := UserInfo{1, "1.8米", "man", "篮球"}
	orm.Create(&u1)
}
```

那么数据库中的结构和程序中的结构是如何一一对应的呢？

<img :src="$withBase('/gin_gorm_two.png')" alt="">

### 2. GORM的基本使用
首先我们需要下载`gorm`：
```go
go get -u github.com/jinzhu/gorm
```
因为可以使用很多种类的数据库，连接不同的数据库需要导入对应的数据库驱动程序，`GORM`已经为我们包装了一些驱动程序，只需要按照下面的方式进行导入即可，需要什么导入什么：
```go
import _ "github.com/jinzhu/gorm/dialects/mysql"
// import _ "github.com/jinzhu/gorm/dialects/postgres"
// import _ "github.com/jinzhu/gorm/dialects/sqlite"
// import _ "github.com/jinzhu/gorm/dialects/mssql"
```

接着我们来看一下如何连接`MySQL`：
```go
package main

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

func main() {
	db, err := gorm.Open("mysql", "user:password@(localhost)/dbname?charset=utf8mb4&parseTime=True&loc=Local")
	// 比如说我现在的使用的mysql用户名为root，但是没有密码，在3307端口，使用的数据库名称为users，则连接代码如下
	// 	db, err := gorm.Open("mysql", "root@tcp(127.0.0.1:3307)/users?charset=utf8mb4&parseTime=True&loc=Local")
	if err != nil {
		panic(err)
	}
	defer db.Close()
}
```
当前前提是你需要自己安装`Mysql`，并且在数据库当中有`users`这样名称的数据库，`gorm`是没有办法帮你建立数据库的，另外注意连接的时候`charset=utf8mb4`是编码方式，而`parseTime=True&loc=Local`是帮助我们解析时间类型数据的。

另外如果数据库连接不成功还有可能是没有权限的问题，可以使用下面的方式去修改一下`mysql`的权限：
```sql
--给予权限： 
grant all privileges on *.* to 'root'@'%'identified by '密码' with grant option;
-- 权限生效：
FLUSH PRIVILEGES;
```

连接成功之后，我们先来试试最简单的增删改查：
```go
package main

import (
	"fmt"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

// 0.对应数据库表
type UserInfo struct {
	ID     uint
	Name   string
	Gender string
	Hobby  string
}

func main() {
	// 1. 连接数据库
	db, err := gorm.Open("mysql", "root@tcp(127.0.0.1:3307)/users?charset=utf8mb4&parseTime=True&loc=Local")
	if err != nil {
		fmt.Println(err.Error())
	} else {
		fmt.Println("连接成功")
	}
	defer db.Close()

	// 2. 自动迁移，就是把结构体和数据表进行对应
	db.AutoMigrate(&UserInfo{})

	// 3. 创建数据行
	u1 := UserInfo{Name: "taopoppy", Gender: "men", Hobby: "篮球"}  // 可以不添加ID，id是默认自增的
	db.Create(&u1)

	// 4. 查询
	var result UserInfo
	db.First(&result) // 查询数据表中第一条数据
	fmt.Printf("u:%#v\n", result)

	// 5 更新
	db.Model(&result).Update("hobby", "跳舞")

	// 6 删除
	db.Delete(&result)
}
```
如果你按照上面的程序去编写代码，可能会出现中文字符无法写入数据库的问题出现，直接表现在`mysql`当中就是1366的问题，我们可以参考下面的博客中的简单方法，来直接修改`mysql`的编码方式，让`mysql`识别中文字符：
+ [完美解决mysql保存中文出现1366错误](https://blog.csdn.net/qq_36523839/article/details/80638663)


## GORM模型定义
### 1. gorm.Model
在使用`ORM`工具时候，通常我们需要在代码中定义模型与数据库中的数据表进行映射，在`gorm`模型`Models`通常是正常定义的结构体，基本的`go`类型或者它们的指针，同时也支持`sql.Scanner`和`driver.Valuer`接口。

<font color=#1E90FF>为了方便模型定义，GORM内置了一个gorm.Model结构体。gorm.Model是一个包含了ID, CreatedAt, UpdatedAt, DeletedAt四个字段的Golang结构体</font>

```go
// gorm.Model 定义
type Model struct {
  ID        uint `gorm:"primary_key"`
  CreatedAt time.Time
  UpdatedAt time.Time
  DeletedAt *time.Time
}
```

你可以将它嵌入到你自己的模型中：
```go
// 将 `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt`字段注入到`User`模型中
type User struct {
  gorm.Model
  Name string
}
```

当然你也可以完全自己定义模型：
```go
// 不使用gorm.Model，自行定义模型
type User struct {
  ID   int
  Name string
}
```

### 2. 模型和标记
模型定义示例：
```go
type User struct {
  gorm.Model                              // 内嵌结构体
  Name         string                     // 字符串类型
  Age          sql.NullInt64 `gorm:"column:user_age"` // 零值类型,在数据库中的列名为user_age
  Birthday     *time.Time                 // 时间类型
  Email        string  `gorm:"type:varchar(100);unique_index"` // unique_index表示唯一索引，在数据库中不能重复
  Role         string  `gorm:"size:255"` // 设置字段大小为255
  MemberNumber *string `gorm:"unique;not null"` // 设置会员号（member number）唯一并且不为空
  Num          int     `gorm:"AUTO_INCREMENT"` // 设置 num 为自增类型
  Address      string  `gorm:"index:addr"` // 给address字段创建名为addr的索引
  IgnoreMe     int     `gorm:"-"` // 忽略本字段
}
```
关于模型中的一些东西我们需要注意一些东西

<font color=#9400D3>**① 主键**</font>

<font color=#DD1144>GORM 默认会使用名为ID的字段作为表的主键。</font>

```go
type User struct {
	ID   string // 名为`ID`的字段会默认作为表的主键
	Name string
}

// 如果不想使用id作为主键，可以设置别的主键，比如使用`AnimalID`作为主键
type Animal struct {
	AnimalID int64 `gorm:"primary_key"`
	Name     string
	Age      int64
}
```

<font color=#9400D3>**② 表名**</font>

<font color=#DD1144>表名默认就是结构体名称的复数，我们可以通过设置禁用复数来禁用这种默认的配置</font>

```go
db, err := gorm.Open("xxx","yyy")
defer db.Close()

// 禁用默认表名的复数形式，如果置为 true，则 `User` struct 的默认表名是 `user`
db.SingularTable(true)
db.AutoMigrate(&User{})
```

当然有的时候我们不希望根据结构体的名称来定义表的名称，我们希望自定义，有两种方法

<font color=#DD1144>第一种方法可以通过下面的设置自定义表名称</font>

```go
// 1. 定义结构体
type User struct {}

// 2. 将 User结构体对应的数据库表名设置为 `person`
func (User) TableName() string {
	return "person"
}

func main() {
	db, err := gorm.Open("xxx", "yyy")
	defer db.Close()
	// 3. 自动迁移，并且不会重复创建person数据表
	db.AutoMigrate(&User{})
}
```

<font color=#DD1144>第二种方法比较麻烦，不推荐使用，但是其中的api可以学习使用一下</font>

```go
// 1. 定义结构体
type User struct {}

func main() {
	db, err := gorm.Open("xxx", "yyy")
	defer db.Close()
	// 2. 判断person表是否存在
	if !db.HasTable("person") {
		fmt.Println("person表不存在")
		// 3. 不存在的时候依据User结构体创建名称为person的数据表
		db.Table("person").CreateTable(&User{})
	} else {
		fmt.Println("person表存在")
	}
}
```

最后我们来看一下一个比较完整的`demo`：
```go
package main

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

type User struct {
	gorm.Model                 // 内嵌结构体
	Name         string        `gorm:"not null"`  // 字符串类型,不能为空
	Age          sql.NullInt64 `gorm:"default:0"` // 零值类型
	Birthday     *time.Time    // 时间类型
	Email        string        `gorm:"type:varchar(100);unique_index;not null"` // unique_index表示唯一索引，在数据库中不能重复
	Role         string        `gorm:"size:255;default:'none'"`                 // 设置字段大小为255
	MemberNumber *string       `gorm:"unique;not null"`                         // 设置会员号（member number）唯一并且不为空
	Address      string        `gorm:"index:addr"`                              // 给address字段创建名为addr的索引
	IgnoreMe     int           `gorm:"-"`                                       // 忽略本字段
}

// 将 User 的表名设置为 `person`
func (User) TableName() string {
	return "person"
}

func main() {
	db, err := gorm.Open("mysql", "root@tcp(127.0.0.1:3307)/users?charset=utf8mb4&parseTime=True&loc=Local")
	if err != nil {
		panic(err.Error())
	} else {
		fmt.Println("连接成功")
	}
	defer db.Close()
	db.AutoMigrate(&User{})

	birthday, _ := time.Parse("2006-01-02 15:04:05", "2019-01-01 15:22:22")
	merber := "9527"
	u1 := User{Name: "xiaohong", Birthday: &birthday, Email: "7889@163.com", MemberNumber: &merber}
	db.Create(&u1)

}
```







**参考资料**

+ [李文周的博客](https://www.liwenzhou.com/posts/Go/gorm/)
+ [Gin Web Framework](https://gin-gonic.com/zh-cn/docs/)