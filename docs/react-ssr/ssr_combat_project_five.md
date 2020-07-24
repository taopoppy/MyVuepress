# OAuth接入

## 认证和授权
认证（`Authentication`）是什么？<font color=#DD1144>通俗的来说就是：你怎么证明你是你自己，证明自己是某种身份</font>，比如身份证是用来帮助你证明你是中华人民共和国公民，学生证证明你是某个大学的学生，在互联网当中，用户名和密码可以代表你是网站中的已注册过的用户。

当然互联网中的认证有<font color=#1E90FF>用户名和密码</font>、<font color=#1E90FF>邮箱发送登录连接</font>、<font color=#1E90FF>手机号接收验证码</font>，完成一个高可用的认证系统是很难的，考虑的问题很多，比如让用户设置高强度的密码、密码存储进行加密、使用`https`保证客户端和服务端进行安全通行，防止密码被中间人获取等等，所以这都是很复杂的东西

但是使用`OAuth`就可以很方便的避免考虑这些问题，<font color=#DD1144>OAuth帮助我们实现了认证，我们只需要等待授权</font>

授权（`Authorization`）,<font color=#1E90FF>通俗的来说就是你有做哪些事情的权利</font>，比如在安装手机应用的时候会询问你应用是否可以访问手机的某些功能，还比如操作系统有很多用户，除了root用户有所有的操作的权利，其他用户只有部分权利。同理在`OAuth`后，被授权方会收获一定的权限。

在网页当中，最直观的授权就是`cookie`，比如我们登陆`github`的时候，使用密码登录到`github`服务器实现了对用户的认证，然后`github`服务器会给你所使用的当前的浏览器一些权利，权利的容器实际上就是`cookie`，所以你在后面去做其他事情的时候浏览器向`github`服务器发送请求的时候会携带这个`cookie`，表示我有你给我权利去做这个事情。

<font color=#DD1144>但是授权并不一定要先认证</font>、比如发放优惠券，商家是不知道这些优惠券最终会在谁的手上，但是只要你持有优惠券就可以享受优惠，<font color=#9400D3>OAuth就是授权的一种方式，通过token的方式进行权限的授予的</font>

## 什么是OAuth
<font color=#9400D3>OAuth是一种行业标准的授权方式</font>，在这种方式当中存在了三个角色，分别是<font color=#1E90FF>客户端</font>、<font color=#1E90FF>服务端</font>、<font color=#1E90FF>授权服务器</font>，基本就是围绕在这三个角色中进行的。

<font color=#DD1144>OAuth有多种授权方式</font>，比如

+ `Authorization Code`（最好用，学习重点）
+ `Refresh Token`（不常用的协议）
+ `Device Code`（不常用）
+ `Password`（不太安全）
+ `Implicit`（不安全）
+ `Client Credentials`（客户端的相关权限，和用户无关）

要注意的时候，虽然`OAuth`有这么多的授权方式，但是每个`OAuth`提供商并不一定提供这么多的方式，有的可能只支持其中的一种授权方式，具体的要看提供商怎么提供的

<img :src="$withBase('/react_ssr_oauth_one.png')" alt="Authorization Code">

+ <font color=#9400D3>网站使用OAuth需要到github上去申请，申请之后会获得client_id和client_secret</font>

+ <font color=#9400D3>首先要在我们的网页上发起一个redirect，并携带上client_id，让github知道用户现在要给哪个客户端授权</font>

+ <font color=#9400D3>github跳出认证，就是用户名和密码的输入框。</font>

+ <font color=#9400D3>认证完毕后会redirect一个url，并携带上code参数，虽然重定向是在客户端的，但是客户端要请求到服务器，所以code主要是在服务端用的</font>

+ <font color=#9400D3>服务端拿到code会结合client_secret请求github的某个api来获取token</font>

+ <font color=#9400D3>拿到这个token就可以通过tokne和github的api进行交互，因为github会询问用户是否要开放一些权限给token，所以这个token会携带一些权限信息</font>

## OAuth的认证流程
<img :src="$withBase('/react_ssr_oauth_two.png')" alt="oauth认证流程">


+ <font color=#9400D3>跳转认证(1)</font>：在网页上点击某个按钮，比如常常出现在登录界面下方的第三方登录的微信图标、qq图标，依旧`github`的图标，然后会跳转到`Github OAuth`的认证界面（比如从我们自己的网站`http://nextjs.w2deep.com`跳转到`github`的`OAuth`的地址：`https://github.com/login/oauth/authorize?client_id=b197d1e973afb0bc9a00&redirect_url=http://nextjs.w2deep.com/auth&scope=user`,后者地址中的client_id就携带在其中，还有scope=user就表示我们想获取用户的信息权限）

+ <font color=#9400D3>完成认证(2)</font>：在`Github OAuth`的认证界面输入用户名和密码完成登录，并且用户要在授权窗口中点击确认后进行跳转

+ <font color=#9400D3>跳转连接(3)</font>：跳转到浏览器中的某个链接，并携带`code`（比如`github`服务器跳回到我们自己的网站，并携带`code`，如`http://nextjs.w2deep.com/auth?code`=a4e2898b223e6a144f，这个`code`是一次性的，不能通过这个`code`去第二次获取`token`）

+ <font color=#9400D3>服务器拿到code(4)</font>：浏览器向服务端发送请求，服务端拿到跳转中携带的`code`

+ <font color=#9400D3>服务器请求access_token(5)</font>：拿到`code`会结合`clien_secret`去向`github`的服务器请求`access_token`

+ <font color=#9400D3>github返回token(6)</font>：`github`服务器根据服务器发来的`code`和`clien_secret`生成`access_token`返回给服务器

+ <font color=#9400D3>服务器返回响应(7.8)</font>：服务器拿到`access_token`存储到`session`当中，然后返回请求，写入浏览器的`cookie`当中。

## 注册github-OAuth-App
进入你自己的`github`，选择你右上角的头像，选择`setting`,在左边的导航列表当中选择`Developer settings`，然后再在左边的导航列表中选择`OAuth Apps`,选择`New OAuth App`进入创建页面，在创建页面中有很多选项

<img :src="$withBase('/react_ssr_oauth_three.png')" alt="注册oauth apps">

+ <font color=#9400D3>Application name</font>：名称，可以随便填，我填的是`imooc-taopoppy`
+ <font color=#9400D3>Homepage URL</font>：这个虽然是必填，但是在整个流程中不重要，我们在开发阶段写成`http://localhost:3001`即可，一般来说后面都会改成项目上线的地址
+ <font color=#9400D3>Authorization callback URL</font>：这个地址就是`github`在用户认证和授权完后跳转的地址，会携带`code`的地址，我们填`http://localhost:3000/auth`,项目上线的时候是要填对应的域名和对应的路由地址的。

然后点击最下面的`Register application`之后，就会显示出`Client_id`和`Clien_secret`，如下图：

<img :src="$withBase('/react_ssr_oauth_four.png')" alt="id和密码">

注意的是`clien_secret`可以通过点击`Reset client secret`这个按钮去重置，`Client ID`是没有必要去重置的，因为本身就是要暴露给外部的。然后`Revoke all user tokens`是清除所有这个`app`上的授权成功的用户的`token`的按钮。在这个网页的下面还可以手动修改`Application name`、`Homepage URL`、`Authorization callback URL`。

那这两个东西当然非常重要了，所以我们需要在项目当中去创建`config.js`去保存它们：
```javascript
// nextjs-project/config.js
module.exports = {
	github: {
		client_id: 'bc3225e59db1965fbeb4',
		client_secret: 'a2e086590fc4233f71bcf069d6d89818bc23185a'
	}
}
```

## OAuth字段讲解
### 1. 跳转字段
当我们要从自己的网站上跳转到`github`的授权网站时，可以带很多的参数，具体有哪些参数，以及这些参数的作用，我们可以到[官网](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/)参考.

下面这个字段为例：`https://github.com/login/oauth/authorize?client_id=b197d1e973afb0bc9a00&redirect_url=http://nextjs.w2deep.com/auth&scope=user`我们来简单介绍一下：

+ <font color=#9400D3>client_id</font>：（必带）在注册`OAuth Apps`时候的那个`client_id`。
+ <font color=#9400D3>scope</font>：（选带）代表我们希望获得的授权有哪些，比如`user`、`repo`等，这些可以使用逗号分开写在`scope=`后面，具体参考[官网](https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/)
+ <font color=#9400D3>redirect_uri</font>：（选带）就是认证授权成功后要返回能携带`code`的网址
+ <font color=#9400D3>login</font>：（选带）是否允许用户登录，默认为`true`，如果用户没有在浏览器中登录`github`，可以允许先通过用户名和密码进行登录。
+ <font color=#9400D3>state</font>：（选带）我们自己要用到的字段，我们在跳转和`github`返回的`code`的时候都带上`state`，确保两次是相同的，来保证安全性
+ <font color=#9400D3>allow_signup</font>：（选带）代表是否允许用户在没有`github`账号的时候先走注册，再登录授权

所以实际上现在我们知道只要带上`client_id`，就已经能跳转到`github`认证的页面了，我们来访问`https://github.com/login/oauth/authorize?client_id=bc3225e59db1965fbeb4`就能看到浏览器显示的界面：

<img :src="$withBase('/react_ssr_oauth_five.png')" alt="授权">

当然上面是没有带`scope`参数的，所以它只会显示`Public data only`，代表只给你最简单的权限。我们要带点参数，比如访问下面这个地址：`https://github.com/login/oauth/authorize?client_id=bc3225e59db1965fbeb4&scope=user,repo,gist`，它就会授权用户，仓库以及`gist`的权限。

<img :src="$withBase('/react_ssr_oauth_six.png')" alt="多种授权">

当然如果你仔细看[官网](https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/)，`user`、`repo`这些都是大的权限，里面包含好多小的权限，比如`user`包含`read:user`，`user:email`、`user:follow`这些，这些小权限也可以单独拿出来，直接写`user`就相当于包含了所有小的权限。

然后授权后`github`就会跳转到`redirect_url`指定的那个地址并带上`code`，我们在注册的时候`redirect_url`指定的是`http://localhost:3001/auth`，所以它最终跳转的地址就是`http://localhost:3001/auth?code=93d84b9041add8c47824`

### 2. 请求token字段
