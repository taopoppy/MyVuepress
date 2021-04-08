# 小程序授权和登录

## 注册和介绍
小程序的注册有两种方式
+ <font color=#1E90FF>官网通过邮箱注册</font>
+ <font color=#1E90FF>通过公众号进行快速注册</font>

两种方式都可以，但是后者可以复用公众号的资质，尤其是可以省去在小程序进行认证的300元手续费。


## 公共机制
公共机制听起来很高大上，其实就是抛出业务后，给整个项目搭一个架子，无论是请求方式，还是目录结构，在小程序当中，我们关注的模块就是<font color=#9400D3>资源	</font>、<font color=#9400D3>环境变量</font>、<font color=#9400D3>网络请求</font>、<font color=#9400D3>工具</font>、<font color=#9400D3>路由</font>、<font color=#9400D3>存储</font>等等，所以我们首先的主要文件夹和文件的目录结构如下：
```javascript
+ assets // 资源模块
	+ images
	+ wxss
+ env    // 环境变量
	+ index.js
+ http   // 网络请求
	+ api.js
	+ request.js
+ pages // 小程序页面
+ utils
	+ routes.js // 路由模块
	+ store.js  // 存储模块
	+ util.js   // 工具模块
```
下面我们来展示一下这些主要模块文件当中的内容，以后的小程序也都可以按照这样的方式去开发：