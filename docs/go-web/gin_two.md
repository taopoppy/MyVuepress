# Gin数据库操作

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


**参考资料**

+ [李文周的博客](https://www.liwenzhou.com/posts/Go/gorm/)
+ [Gin Web Framework](https://gin-gonic.com/zh-cn/docs/)