# Gin数据库操作(一)

## 增加记录
### 1. 普通的增加记录
```go
package main

import (
	"fmt"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

// 1. 定义结构体
type User struct {
	Id   int64
	Name string `gorm:"default:'no_name'"`
	Age  int64
}

func main() {
	db, err := gorm.Open("mysql", "root@tcp(127.0.0.1:3307)/users?charset=utf8mb4&parseTime=True&loc=Local")
	if err != nil {
		panic(err.Error())
	} else {
		fmt.Println("连接成功")
	}
	defer db.Close()
	db.SingularTable(true)
	db.AutoMigrate(&User{})

	// 2. 创建记录
	u := User{Name: "taopoppy", Age: 25} // 3. 创建一条记录
	fmt.Println(db.NewRecord(&u))        // 4.  判断主键是否为空 true 说明和数据库所有数据比较起来，这条数据中的主键和其他所有数据的主键都不同，所以这是一条新的数据
	db.Create(&u)                        // 5. 写入数据库
	fmt.Println(db.NewRecord(&u))        // 6. 判断主键是否为空 false 说明和数据库所有数据比较起来，这条数据中的主键和数据库中已存在的某条数据的主键相同，所以这不是一条新的数据
}
```

### 2. 默认值的解决方法
看懂上面的代码后，我们来讲一个和默认值有关的问题，当我们结构体当中的`tag`当中定义`default`后，假如我们现在创建的一条记录如下：
```go
u := User{Name: "", Age: 25}
```
此时`Name`为空值，那么数据库就会按照默认值的方式向数据库中存入`no_name`<font color=#DD1144>所以一个模型中的字段定义了默认值，那么gorm的默认行为是模型对象中的字段没有写或者为零值（如空字符串，0，false等），数据库会写入你在tag中定义的默认值</font>

但是一般我们通常的思维是：<font color=#1E90FF>我不写才传默认值，我写了啥就传啥，即便我写的零值，你也传入零值</font>，所以有两种方式：

<font color=#1E90FF>**① 使用指针的方式将零值存入数据库**</font>

```go
type User struct {
	ID int64
	Name *string `gorm:"default:'no_name'"`  // 使用指针
	Age int64
}

user :=User{Name: new(string), Age:18}
db.Create(&user) // 此时数据库中记录name字段值就是''
```

<font color=#1E90FF>**② 使用Scanner/Valuer**</font>

```go
type User struct {
	ID int64
	Name sql.NullString `gorm:"default:'no_name'"` // 使用Scanner/Valuer
	Age int64
}

user :=User{Name: sql.NullString{"",true}, Age:18} // sql.NullString{"",true}的第二个字段为true表示第一个字段是什么存在数据库的就是什么，哪怕是空字符串
db.Create(&user) // 此时数据库中记录name字段值就是''
```

## 查询记录
### 1. 一般查询

```go
// 根据主键查询第一条记录,注意，只有id为数字类型的时候才能用这个方法
var user User
db.First(&user)
//// SELECT * FROM users ORDER BY id LIMIT 1;

// 随机获取一条记录
var user User
db.Take(&user)
//// SELECT * FROM users LIMIT 1;

// 根据主键查询最后一条记录
var user User
db.Last(&user)
//// SELECT * FROM users ORDER BY id DESC LIMIT 1;

// 查询所有的记录
var users []User
db.Find(&users)
//// SELECT * FROM users;

// 查询指定的某条记录(仅当主键为整型时可用)
var user User
db.First(&user, 10)
//// SELECT * FROM users WHERE id = 10;
```

### 2. 普通查询
```go
// 获得第一条匹配的记录
var user User
db.Where("name = ?", "jinzhu").First(&user)
//// SELECT * FROM users WHERE name = 'jinzhu' limit 1;

// 获得所有匹配的记录
var users []User
db.Where("name = ?", "jinzhu").Find(&users)
//// SELECT * FROM users WHERE name = 'jinzhu';

// 获取字段不为指定值的所有记录
var users []User
db.Where("name <> ?", "jinzhu").Find(&users)
//// SELECT * FROM users WHERE name <> 'jinzhu';

// 获取符合范围条件的所有记录
var users []User
db.Where("name IN (?)", []string{"jinzhu", "jinzhu 2"}).Find(&users)
//// SELECT * FROM users WHERE name in ('jinzhu','jinzhu 2');

// 模糊查询，获取名字包含jin的所有记录
var users []User
db.Where("name LIKE ?", "%jin%").Find(&users)
//// SELECT * FROM users WHERE name LIKE '%jin%';

// 获取满足多个条件的所有记录
var users []User
db.Where("name = ? AND age >= ?", "jinzhu", "22").Find(&users)
//// SELECT * FROM users WHERE name = 'jinzhu' AND age >= 22;

// 获取满足时间条件的所有记录
var users []User
db.Where("updated_at > ?", lastWeek).Find(&users)
//// SELECT * FROM users WHERE updated_at > '2000-01-01 00:00:00';

// BETWEEN
var users []User
db.Where("created_at BETWEEN ? AND ?", lastWeek, today).Find(&users)
//// SELECT * FROM users WHERE created_at BETWEEN '2000-01-01 00:00:00' AND '2000-01-08 00:00:00';
```

### 3. Struct & Map查询
```go
// Struct：查询符合条件的第一条记录数据
var user User
db.Where(&User{Name: "jinzhu", Age: 20}).First(&user)
//// SELECT * FROM users WHERE name = "jinzhu" AND age = 20 LIMIT 1;

// Map：查询符合条件的所有记录
var users []User
db.Where(map[string]interface{}{"name": "jinzhu", "age": 20}).Find(&users)
//// SELECT * FROM users WHERE name = "jinzhu" AND age = 20;

// 主键的切片: 查询符合条件的所有记录
var users []User
db.Where([]int64{20, 21, 22}).Find(&users)
//// SELECT * FROM users WHERE id IN (20, 21, 22);
```

提示：<font color=#DD1144>当通过结构体进行查询时，GORM将会只通过非零值字段查询，这意味着如果你的字段值为0，''，false或者其他零值时，将不会被用于构建查询条件</font>，例如：
```go
db.Where(&User{Name: "jinzhu", Age: 0}).Find(&users)
//// SELECT * FROM users WHERE name = "jinzhu";
```
你可以使用指针或实现 `Scanner/Valuer` 接口来避免这个问题.

```go
// 使用指针
type User struct {
  gorm.Model
  Name string
  Age  *int
}

// 使用 Scanner/Valuer
type User struct {
  gorm.Model
  Name string
  Age  sql.NullInt64  // sql.NullInt64 实现了 Scanner/Valuer 接口
}
```

### 4. Not 条件
```go
// 查询第一个不满足条件的数据
var user User
db.Not("name", "jinzhu").First(&user)
//// SELECT * FROM users WHERE name <> "jinzhu" ORDER BY id LIMIT 1;

// 查询不满足条件的所有数据
var users []User
db.Not("name", []string{"jinzhu", "jinzhu 2"}).Find(&users)
//// SELECT * FROM users WHERE name NOT IN ("jinzhu", "jinzhu 2");

// 查询不在主键切片中的第一个数据
var user User
db.Not([]int64{1,2,3}).First(&user)
//// SELECT * FROM users WHERE id NOT IN (1,2,3) ORDER BY id LIMIT 1;

// 查询不在主键切片中的第一个数据
var user User
db.Not([]int64{}).First(&user)
//// SELECT * FROM users ORDER BY id LIMIT 1;

// 普通 SQL：查询第一个满足条件的数据
var user User
db.Not("name = ?", "jinzhu").First(&user)
//// SELECT * FROM users WHERE NOT(name = "jinzhu") ORDER BY id LIMIT 1;

// Struct：查询第一个不满足条件的数据
var user User
db.Not(User{Name: "jinzhu"}).First(&user)
//// SELECT * FROM users WHERE name <> "jinzhu" ORDER BY id LIMIT 1;

```

### 5. Or条件
```go
// 查询满足两者条件之一的所有记录
db.Where("role = ?", "admin").Or("role = ?", "super_admin").Find(&users)
//// SELECT * FROM users WHERE role = 'admin' OR role = 'super_admin';

// Struct
// 查询满足两者条件之一的所有记录
db.Where("name = 'jinzhu'").Or(User{Name: "jinzhu 2"}).Find(&users)
//// SELECT * FROM users WHERE name = 'jinzhu' OR name = 'jinzhu 2';

// Map
// 查询满足两者条件之一的所有记录
db.Where("name = 'jinzhu'").Or(map[string]interface{}{"name": "jinzhu 2"}).Find(&users)
//// SELECT * FROM users WHERE name = 'jinzhu' OR name = 'jinzhu 2';
```



### 6. FirstOrInit（Attrs & Assign）
```go
// 未找到
db.FirstOrInit(&user, User{Name: "non_existing"})
//// user -> User{Name: "non_existing"}

// 找到
db.Where(User{Name: "Jinzhu"}).FirstOrInit(&user)
//// user -> User{Id: 111, Name: "Jinzhu", Age: 20}
db.FirstOrInit(&user, map[string]interface{}{"name": "jinzhu"})
//// user -> User{Id: 111, Name: "Jinzhu", Age: 20}
```
<font color=#1E90FF>**① Attrs**</font>

如果记录未找到，`Attrs`中的参数会附加在初始化的结构体当中。
```go
// 未找到(按照where当中的参数来初始化结构体)
db.Where(User{Name: "non_existing"}).FirstOrInit(&user)
//// user -> User{Name: "non_existing", Age: 0}

// 未找到(按照where和attrs的条件去初始化结构体)
db.Where(User{Name: "non_existing"}).Attrs(User{Age: 20}).FirstOrInit(&user)
//// user -> User{Name: "non_existing", Age: 20}

// 找到（找到的情况下attrs和where中的条件都不起作用）
db.Where(User{Name: "Jinzhu"}).Attrs(User{Age: 30}).FirstOrInit(&user)
//// SELECT * FROM USERS WHERE name = jinzhu';
//// user -> User{Id: 111, Name: "Jinzhu", Age: 20}
```

<font color=#1E90FF>**② Assign**</font>

```go
// 未找到
db.Where(User{Name: "non_existing"}).Assign(User{Age: 20}).FirstOrInit(&user)
//// user -> User{Name: "non_existing", Age: 20}

// 找到
db.Where(User{Name: "Jinzhu"}).Assign(User{Age: 30}).FirstOrInit(&user)
//// SELECT * FROM USERS WHERE name = jinzhu';
//// user -> User{Id: 111, Name: "Jinzhu", Age: 30}
```

### 7. FirstOrCreate（Attrs & Assign）
获取匹配的第一条记录, 否则根据给定的条件创建一个新的记录 (仅支持`struct` 和 `map` 条件)
```go
// 未找到
db.FirstOrCreate(&user, User{Name: "non_existing"})
//// INSERT INTO "users" (name) VALUES ("non_existing");
//// user -> User{Id: 112, Name: "non_existing"}

// 找到
db.Where(User{Name: "Jinzhu"}).FirstOrCreate(&user)
//// user -> User{Id: 111, Name: "Jinzhu"}
```

<font color=#1E90FF>**① Attrs**</font>

如果记录未找到，将使用参数创建 struct 和记录.

```go
 // 未找到
db.Where(User{Name: "non_existing"}).Attrs(User{Age: 20}).FirstOrCreate(&user)
//// SELECT * FROM users WHERE name = 'non_existing';
//// INSERT INTO "users" (name, age) VALUES ("non_existing", 20);
//// user -> User{Id: 112, Name: "non_existing", Age: 20}

// 找到
db.Where(User{Name: "jinzhu"}).Attrs(User{Age: 30}).FirstOrCreate(&user)
//// SELECT * FROM users WHERE name = 'jinzhu';
//// user -> User{Id: 111, Name: "jinzhu", Age: 20}
```
<font color=#1E90FF>**② Assign**</font>

不管记录是否找到，都将参数赋值给`struct`并保存至数据库.
```go
// 未找到
db.Where(User{Name: "non_existing"}).Assign(User{Age: 20}).FirstOrCreate(&user)
//// SELECT * FROM users WHERE name = 'non_existing';
//// INSERT INTO "users" (name, age) VALUES ("non_existing", 20);
//// user -> User{Id: 112, Name: "non_existing", Age: 20}

// 找到
db.Where(User{Name: "jinzhu"}).Assign(User{Age: 30}).FirstOrCreate(&user)
//// SELECT * FROM users WHERE name = 'jinzhu';
//// UPDATE users SET age=30 WHERE id = 111;
//// user -> User{Id: 111, Name: "jinzhu", Age: 30}
```



### 8. 高级查询

<font color=#1E90FF>**① 选择字段**</font>

`Select`，指定你想从数据库中检索出的字段，默认会选择全部字段。
```go
db.Select("name, age").Find(&users)
//// SELECT name, age FROM users;

db.Select([]string{"name", "age"}).Find(&users)
//// SELECT name, age FROM users;

db.Table("users").Select("COALESCE(age,?)", 42).Rows()
//// SELECT COALESCE(age,'42') FROM users;
```

<font color=#1E90FF>**② 排序**</font>

`Order`，指定从数据库中检索出记录的顺序。设置第二个参数 `reorder` 为 `true` ，可以覆盖前面定义的排序条件。
```go
db.Order("age desc, name").Find(&users)
//// SELECT * FROM users ORDER BY age desc, name;

// 多字段排序
db.Order("age desc").Order("name").Find(&users)
//// SELECT * FROM users ORDER BY age desc, name;

// 覆盖排序
db.Order("age desc").Find(&users1).Order("age", true).Find(&users2)
//// SELECT * FROM users ORDER BY age desc; (users1)
//// SELECT * FROM users ORDER BY age; (users2)
```

<font color=#1E90FF>**③ 数量**</font>

`Limit`，指定从数据库检索出的最大记录数。
```go
db.Limit(3).Find(&users)
//// SELECT * FROM users LIMIT 3;

// -1 取消 Limit 条件
db.Limit(10).Find(&users1).Limit(-1).Find(&users2)
//// SELECT * FROM users LIMIT 10; (users1)
//// SELECT * FROM users; (users2)
```

<font color=#1E90FF>**④ 偏移**</font>

`Offset`，指定开始返回记录前要跳过的记录数
```go
db.Offset(3).Find(&users)
//// SELECT * FROM users OFFSET 3;

// -1 取消 Offset 条件
db.Offset(10).Find(&users1).Offset(-1).Find(&users2)
//// SELECT * FROM users OFFSET 10; (users1)
//// SELECT * FROM users; (users2)
```

<font color=#1E90FF>**⑤ 总数**</font>

`Count`，该`model`能获取的记录总数
```go
db.Where("name = ?", "jinzhu").Or("name = ?", "jinzhu 2").Find(&users).Count(&count)
//// SELECT * from USERS WHERE name = 'jinzhu' OR name = 'jinzhu 2'; (users)
//// SELECT count(*) FROM users WHERE name = 'jinzhu' OR name = 'jinzhu 2'; (count)

db.Model(&User{}).Where("name = ?", "jinzhu").Count(&count)
//// SELECT count(*) FROM users WHERE name = 'jinzhu'; (count)

db.Table("deleted_users").Count(&count)
//// SELECT count(*) FROM deleted_users;

db.Table("deleted_users").Select("count(distinct(name))").Count(&count)
//// SELECT count( distinct(name) ) FROM deleted_users; (count)
```