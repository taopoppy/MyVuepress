# Session和JWT

## Session简介
`Session`是一种非常流行的用户认证和授权的方式，在此之前我们先说说什么是用户认证和授权
+ <font color=#3eaf7c>认证</font>：简单的说就是让服务器知道你是谁
+ <font color=#3eaf7c>授权</font>：就是让服务器知道什么你能干什么你不能干

下面说一下`Session`的工作原理：
<img :src="$withBase('/session.png')" height="500px" width="500px" alt="session">

+ 当用户使用用户名和密码登录后，在服务端会生成用户的`session`数据，并存放在缓存数据库中
+ 然后给客户端响应的时候会通过`Set-Cookie`这样的头向客户端种植`cookie`，内容就是`session`的ID
+ 客户端下一次请求的时候会在`http`请求头中携带`Cookie`数据
+ 服务端拿到请求，解析出`session`的Id，并出缓存数据库当中进行对照，如果有表明你已经登录，正确返回你请求的数据，没有就需要你登录
+ 退出登录要么主动清除客户端中的`cookie`,服务端如果想强制前端认证，可以清除缓存数据库中的`session`数据即可

`Session`的优势：
+ <font color=#3eaf7c>相比JWT,最大的优势就在于可以主动清除session,而JWT它的用户信息则以令牌的方式保存在客户端，只要没有过期，就能一直拿着token进行用户授权和认证</font>
+ <font color=#3eaf7c>session保存在服务端，相对比较安全</font>
+ <font color=#3eaf7c>结合cookie使用，较为灵活。兼容性好</font>

`Session`的劣势：
+ <font color=#3eaf7c>cookie + session在跨域场景表现并不好,因为cookie具有不可跨域性，是因为设置cookie的时候不光有sessionID，还有domain变量，表示生效的域名，默认只在这个域名条件下cookie才生效</font>
+ <font color=#3eaf7c>分布式部署，需要做多机共享session机制</font>
+ <font color=#3eaf7c>基于cookie的机制很容易被CSRF</font>
+ <font color=#3eaf7c>查询seesion信息可能会有数据库查询操作</font>

`Session`相关概念的介绍
+ <font color=#3eaf7c>SessionStorage</font>: 存储在客户端，仅在当前会话下有效，关闭页面或者浏览器就会被清除
+ <font color=#3eaf7c>LocalStorage</font>：存储在客户端，除非手动清除，否则永久保存（后面的`JWT`基本都用`LocalStorage`来保存令牌）

## JWT简介
`JWT`的全称为<font color=#3eaf7c>JSON Web Token</font>,是一个开发的标准（RFC 7519）

### 1. JWT的概念：
+ <font color=#3eaf7c>定义了一种紧凑却独立的方式，可以将各方之间的信息作为JSON对象进行安全传输</font>
+ <font color=#3eaf7c>该信息可以验证和信任，因为是经过数字签名的</font>

### 2. JWT的构成：

`JWT`有三个部分组成，分别如下，但是由于最后被`base64URL`编码简化了，所以是一段很简介的乱码，我们用不同地颜色表示：

<font color=#3eaf7c>eyhbGciOiAiSFMyNTYiLCAidHlwIjopIkpXVCJ9</font>.<font color=#CC99CD>eyJ1c2vYX2lkIjoiemhhbmdzYW4ifQ</font>.<font color=#f08d49>5EECrcdrr43Rtvtysres9RrER94re</font>

**1. <font color=#3eaf7c>头部(Header)</font>**：

头部的本质是个`json`,里面有两个字段如下：
  + **typ**: `token`的类型，或者令牌的类型，这里固定为JWT
  + **alg**: 使用的`hash`算法，例如`HMAC`,`SHA256`或者`RSA`

我们可以看一下`Header`编码的前后样子是什么样子的：
  + 编码前：`{"alg":"HS256","typ":"JWT"}`
  + 编码后：`eyhbGciOiAiSFMyNTYiLCAidHlwIjopIkpXVCJ9`

**2. <font color=#3eaf7c>有效载荷(Payload)</font>**：

有效载荷的内容：
  + `JWT`中的`Payload`就是真实存储我们需要传递信息的这部分，比如用户ID，用户名等等
  + 另外还包括元数据，如过期时间，发布人等
  + 与`Header`不同，这里的`Payload`是可以加密的

有效载荷的编码前后：
  + 编码前：`{"user_id":"zhangsan"}`
  + 编码后（base64）：`eyJ1c2vYX2lkIjoiemhhbmdzYW4ifQ==`
  + 编码后（base64URL）：`eyJ1c2vYX2lkIjoiemhhbmdzYW4ifQ`

**3. <font color=#3eaf7c>签名(Signature)</font>**：

签名的内容：
  + 对`Header`和`Payload`部分进行签名
  + 保证`token`在传输过程中没有被篡改或者破坏

算法的完整过程：
  + `Signature = HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`
  + 生成的签名依旧需要`base64URL`编码

### 3. JWT的工作原理
<img :src="$withBase('/jwt.jpg')" alt="jwt">

+ 首先前端通过用户名和密码进行`post`请求
+ 然后服务端对用户名和密码核对后，将用户id和其他信息作为有效载荷`Payload`,然后三个部分的编码加起来形成`JWT`,类似我们前面三个不同颜色组合的一段乱码.将`JWT`作为登录成功的返回结果，比如`token: '...JWT...'`
+ 客户端拿到这个`token`将其保存在`SessionStorage`或者`LocalStorage`当中，前端退出就删除客户端中的这个`token`即可
+ 客户端下次请求的时候会将`token`加上`Bearer`作为`HTTP`头中`Authorization`的内容发出去，比如`Authorization: Bearer...JWT...`
+ 后端检查是否存在，存在则验证`JWT`字符串的有效性，例如签名是否正确，令牌是否过期等
+ 后端验证通过后，使用`JWT`当中包含的用户信息并返回正确的结果

## JWT对session

### 1. 可拓展性
随着用户的增加，我们必然要扩展程序，<font color=#3eaf7c>垂直扩展</font>就是要增加服务器。<font color=#3eaf7c>横向拓展</font>就是要增强硬件性能，比如磁盘，内存等等。那么如果是`session`你就必须建议很系统的`session`存储系统，否则没有办法共享在不同地服务器和线程之间

而`JWT`这种身份验证是<font color=#CC99CD>无状态的</font>，不需要在服务端存储用户信息

### 2. 安全性
+ `XSS攻击`，我们需要利用加密和签名这两个关键点
+ `CSRF`，我们需要有响应的防范措施
+ `中间人攻击`，使用`HTTPS`协议

### 3. RESTful
`REST`要求软件架构是无状态的，所以`session`这种在服务端存放状态的显然不能出现在`RESTful`风格的软件当中，因为违反了六个限制之一

### 4. 性能
首先`JWT`的性能和`Session`各有利弊：
+ 因为<font color=#3eaf7c>在http请求中会携带大量的用户信息，会产生大量的开销，而session只需要一个id</font>，从<font color=#CC99CD>空间</font>的角度来说，`JWT`要弱一些
+ 但是<font color=#3eaf7c>session用户信息存放在服务端，会有一个查询的过程</font>，所以从<font color=#CC99CD>时间</font>的角度讲，`session`要弱一些

### 5.时效性
这方面讲`JWT`要差一些，因为只能等到过期，而`session`可以在服务端主动去销毁用户登录的信息