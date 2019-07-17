# RESTful API简介和实践

## RESTful API简介

### 1. 什么是RESTful API
首先`REST`是个单词，`ful`是形容词，`API`是软件编程接口，`RESTful API`就是符合`REST`架构风格的`API`

### 2. RESTful API长什么样
前面我们在`REST和它的6个限制`这专题中通过统计接口限制讲述了`RESTful API`应该长什么样子，下面我们会具体的说一下包含的部分：
+ 基本的URI：比如`https://api.github.com/users`
+ 标准的HTTP方法：比如`GET`,`POST`,`PUT`,`PATCH`,`DELETE`
+ 传输的数据媒体类型：比如`JSON`,`XML`

我们拿`github`上面仓库的增删改查来说明一下，具体可查看[github接口说明文档](https://developer.github.com/v3/repos/)
+ 查看仓库列表： `GET /user/repos`
+ 创建一个仓库： `POST /user/repos`(个人)，`POST /orgs/:org/repos`(组织)
+ 更新一个仓库： `PATCH /repos/:owner/:repo`（这里的`PATCH`表示部分更新，一般`PUT`表示整体替换）
+ 删除一个仓库：`DELETE /repos/:owner/:repo`
+ 转移一个仓库：`POST /repos/:owner/:repo/transfer`(不属于增删改查的特例)

## RESTful API最佳实践

### 1. 请求设计规范

+ `URI`使用名词，尽量用复数，比如`/users`
+ `URI`使用嵌套表示关联关系，比如`/users/12/repos/5`(表示用户`id`为`12`的编号为`5`的仓库)
+ 使用正确的`HTTP`方法：`GET`,`POST`,`PUT`,`DELETE`
+ 不符合`CURD`(增删改查)的情况：
  + （推荐）`POST`方式 + 动词: 前面在github中的转移仓库就用这种方法（`POST /repos/:owner/:repo/transfer`）
  + 使用`action`：在查询字符串中添加`action=xxx`
  + 设计成子资源

### 2. 响应设计规范
下面我们会列举响应的设计规范，并拿github的实际例子来说明一下：
+ 查询: 每一个响应都能被查询，被过滤的，加上限制条件，就只能返回符合这些条件的响应值
+ 分页: 响应信息过多，我们应该添加分页信息，比如第几页，有多少条信息等等
+ 字段过滤: 这个和查询不一样，返回的字段只能是你指定的字段
+ 状态码：比如2开头表示正确，3开头表示重定向，4开头表示错误，5开头表示服务端错误
+ 错误处理：请求是错的，尽量按照规范的，或者通用的格式去返回错误信息

<font color=#3eaf7c>查询</font>来讲，比如请求`'https://api.github.com/users?since=5000'`,如果没有`since`查询参数，返回的列表是从id为1的用户开始的1万条数据，但是有了`since`参数，我们就过滤掉了1到5000的数据，返回的数据是从5001开始的后面5000条数据，具体参照[官网说明](https://developer.github.com/v3/users/#parameters-2)

<font color=#3eaf7c>分页</font>来讲, 比如请求`'https://api.github.com/user/repos?page=2&per_page=100'`,通过查询参数中的`page`来表示页数，通过`per_page`来表示每页有100条数据，具体参照[官网说明](https://developer.github.com/v3/#pagination)

<font color=#3eaf7c>字段过滤</font>来讲，`github`好像没有这个功能，但是我们可以通过比如`'https://api.github.com/user/les150?fileds=name'`这种方式选择响应的数据中只有`name`字段

<font color=#3eaf7c>错误处理</font>来讲，`github`是用json类型的数据返回错误信息，具体参照[官网说明](https://developer.github.com/v3/#client-errors)

### 3. 安全
+ <font color=#3eaf7c>HTTPS</font>: 采用`HTTPS`协议进行数据传输
+ <font color=#3eaf7c>用户鉴权</font>: 用户登录后才能去访问某些接口，防止用户数据泄露，具体参照[官网说明](https://developer.github.com/v3/#authentication)
+ <font color=#3eaf7c>限流</font>: 防止故意攻击网址的人不停请求接口，让服务器炸掉，在分层系统中添加限流层,具体参照[官网说明](https://developer.github.com/v3/#rate-limiting)

## 开发者友好
+ 文档：健全的接口文档说明会让开发者更加友好的使用你的接口
+ 超媒体：善用链接