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

+ <font color=#9400D3>跳转连接(3)</font>：跳转到浏览器中的某个链接，并携带`code`（比如`github`服务器跳回到我们自己的网站，并携带`code`，如`http://nextjs.w2deep.com/auth?code=a4e2898b223e6a144f`，这个`code`是一次性的，不能通过这个`code`去第二次获取`token`）

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
服务器拿到了`code`之后，需要结合一些参数去`github`服务器上请求`access_token`，请求的相关参数包含下面几个：
+ <font color=#9400D3>client_id和client_secret</font>：这两个是必须的，表示我们拥有客户端权限
+ <font color=#9400D3>code</font>：`code`本身也是必须的，表示用户给我们授权了
+ <font color=#9400D3>redirect_uri和state</font>：和上面的是一样的

下面我们来使用<font color=#DD1144>restlet client</font>这个浏览器插件来发送一下`post`请求来获取一下`access_token`：
<img :src="$withBase('/react_ssr_oauth_seven.png')" alt="">

可以看到返回给我们的一串字符串`access_token=2429eeb510c604997db54f251c3f88152d81f4b0&scope=gist%2Crepo%2Cuser&token_type=bearer`，其中就包含了`access_token`还有授权的信息，和`token`的类型。<font color=#1E90FF>要注意的是，这个code是一次性的，之前就说过，不能用它来第二次请求access_token，当然它也是有过期时间的，如果已经使用不了就必须到github的授权页面重新授权，让github重新跳转并携带新的code</font>

然后保存一下这个`access_token`，去请求一下`github`用户的信息
+ 请求的地址：`https://api.github.com/user`
+ 请求的头部：`Authorization： token 2429eeb510c604997db54f251c3f88152d81f4b0`

<img :src="$withBase('/react_ssr_oauth_eight.png')" alt="">

## OAuth-code认证和安全
这种方式保证安全的策略有下面这几个：
+ <font color=#DD1144>一次性的code</font>，因为是一次性`code`，所以即便是泄露了也不会有影响，应该只能用一次
+ <font color=#DD1144>id+secret</font>：这种验证方式就保证了即使`code`被别人先拿到了，别人也不知道`clien_secret`，因为`clien_secret`是保存在我们自己的服务器上的，是不向外暴露的。
+ <font color=#DD1144>redirect_uri</font>：如果参数中的`redirect_uri`和我们一开始注册`OAuth Apps`的时候在`Authorization callback URL`中填的不一样，那么直接就会报错，`code`都不会返回。

## cookie和session
首先我们创建`server/session-store.js`,书写`session`和`redis`之间相关的方法：
```javascript
// server/session-store.js
// 统一在和session的redis中的数据前面添加一个前缀
function getRedisSessionId(sid) {
  return `ssid:${sid}`
}

class RedisSessionStore {
  // 接收一个redis的client去操作redis
  constructor(client) {
    this.client = client
  }

  // 获取Redis中存储的session数据
  async get(sid) {
    console.log('get session', sid)
    const id = getRedisSessionId(sid)
    const data = await this.client.get(id)
    if (!data) {
      return null
    }
    try {
      const result = JSON.parse(data)
      return result
    }catch (err) {
      console.error(err)
    }
  }

  // 存储session数据到redis(ttl为过期时间)
  // 外界使用应该使用毫秒，而redis中需要传入秒
  async set(sid, sess, ttl) {
    console.log('set session', sid)
    const id = getRedisSessionId(sid)
    if(typeof ttl === 'number') {
      ttl = Math.ceil(ttl / 1000)
    }
    try {
      const sessStr = JSON.stringify(sess)
      if(ttl) { // 有过期时间
        await this.client.setex(id, ttl, sessStr)
      } else { // 无过期时间
        await this.client.set(id, sessStr)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 从redis当中删除某个session
  async destroy(sid) {
    console.log('destroy session', sid)
    const id = getRedisSessionId(sid)
    await this.client.del(id)
  }
}

module.exports = RedisSessionStore
```
然后我们到服务端来书写代码：
```javascript
// server.js

const session = require('koa-session')  // 1. 引入session
const RedisSessionStore = require('./server/session-store.js') // 2. 引入RedisSessionStore
const Redis = require('ioredis') // 3. 引入Redis

// 3. 创建redis的client（全部使用默认配置）
const redis = new Redis()

app.prepare().then(()=> {
	...

	server.keys = ['Taopoppy develop Github App'] // 4. 设置一个给cookie加密的字符串
	// 5. 配置session的配置
	const SESSION_CONFIG = {
		key: 'jid', // cookie的key
		// maxAge: 60*1000, // 一分钟的过期时间（默认是86400000为一天）
		store: new RedisSessionStore(redis)
	}

	// 6. 中间件使用
	server.use(session(SESSION_CONFIG,server))

	// 7.1. 通过访问localhost:3001/set/user可以设置cookie
	// 7.2  cookie的key是jid，值是通过server.keys加密{name:"taopoppy",age: 18}这个对象的结果：比如155dew51re51vw1erw55gw-Udklsjsg-wdfjg12fd94
	// 7.3 session在redis存储的的key就是155dew51re51vw1erw55gw-Udklsjsg-wdfjg12fd94，value是"{\"user\"：{\"name\":\"taopoppy\",\"age\": 18,\"_exprie\":155505366755,\"_maxAge\":86400000}"
	router.get('/set/user', async (ctx) => {
		ctx.session.user = {
			name:"taopoppy",
			age: 18
		}
		ctx.body = 'set session success'
	})

	// 8. 通过访问localhost:3001/delete/user可以删除cookie
	router.get('/delete/user', async (ctx) => {
		ctx.session = null // 设置为null为自动将之前保存的和session相关的数据从redis中删除掉
		ctx.body = 'destroy session success'
	})
	...
})
```

<img :src="$withBase('/react_ssr_cookie_session.png')" alt="cookie_session">

可以看到当通过`ctx.session.xxx=yyy`设置的时候，服务端会自动在`ctx.body`的返回值中给浏览器种植`cookie`

## Github OAuth接入
接下来我们就要正式将其接入，我们分几步去具体实现：

### 1. 创建第三方登录链接
因为第三方授权的跳转实际上是链接的跳转，我们必须先去拼接一个我们需要的链接：
```javascript
// next.config.js
const withCss = require('@zeit/next-css')
const config = require('./config.js')   //  1. 引入config，包含client_id和client_server

if (typeof require !== 'undefined') {
	require.extensions['.css'] = file => {}
}

// 2. github授权链接的根地址
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'
// 3. 定义权限(当前只需要user，后续可以写成'user,repo,gits')
const SCOPE = 'user'

module.exports = withCss({
	// 4. 在这里写所有的配置项，publicRuntimeConfig可以在客户度和服务端同时拿到
	publicRuntimeConfig: {
		GITHUB_OAUTH_URL,
		OAUTH_URL: `${GITHUB_OAUTH_URL}?client_id=${config.github.client_id}&scope=${SCOPE}`
	}
})
```
然后我们有了自己拼接的链接，显示在页面上即可
```javascript
// pages/index.js
import getConfig from 'next/config'  // 1. 引入getConfig
const { publicRuntimeConfig } = getConfig() // 2. 拿到publicRuntimeConfig


const Index = ({counter,username,rename,addcount}) => {
	return (
		<>
			...
			<a href={publicRuntimeConfig.OAUTH_URL}>去登录</a> {/* 3. 显示到页面上*/}
		</>
	)
}
```
这样当我们点击登录的链接，就会去`github`上面授权，不过授权完毕后跳转回来的是`http://localhost:3001/auth?code=5b5c56d8d1ee54eb6327`，这个地址我们是没有的，我们需要去创建这样一个路由

### 2. 创建路由
创建一个`/auth`的路由来处理授权之后`github`跳转来的的地址，当然我们先下载个东西：
```javascript
yarn add axios@0.18.0
```
```javascript
// server/auth.js
const axios = require('axios')
const config = require('../config.js')
const { client_id, client_secret,request_token_url } = config.github

module.exports =  (server) => {
  server.use( async (ctx, next)=> {
    if(ctx.path === '/auth') { // 如果是localhost:3001/auth就处理
      const code = ctx.query.code
      if(!code) {
        ctx.body = 'code not exist'
        return
      }
      // code如果存在就要去根据code和client_id、client_secret去请求github生成tokne
      const result = await axios({
        method: 'POST',
        url: request_token_url,
        data: {
          client_id,
          client_secret,
          code
        },
        headers: {
          'Accept': 'application/json'
        }
      })
      console.log(result.status,result.data)

      // 判断请求token是否成功
      // 如果code二次使用，github也会返回200，所以要排除这种情况
      if(result.status === 200 &&(result.data &&!result.data.error)) {
        ctx.session.githubAuth = result.data

        // 拿到token我们就用token去请求一下用户信息
        const {token_type, access_token } = result.data

        const userInfoResp = await axios({
          method: 'GET',
          url:'https://api.github.com/user',
          headers: {
            'Authorization': `${token_type} ${access_token}`
          }
        })
        // console.log(userInfoResp.data)
				// 将用户信息保存在session当中
        ctx.session.userInfo = userInfoResp.data


        ctx.redirect('/')
      } else {
        const errorMsg = result.data && result.data.error
        ctx.body = `request token failed ${result.message}`
      }


    } else {
      await next()  // 其他不是/auth不经过这层处理
    }
  })
}
```
有了这样一个函数之后，`http://localhost:3001/auth?code=5b5c56d8d1ee54eb6327`这个地址的访问就会经过上面这个中间件，并且结合`code`以及`clien_secret`和`client_id`到`github`服务器请求到`token`，我们使用该`token`获取了用户的信息，并直接保存在`redis`当中，我们到`server.js`当中去使用一下：
```javascript
// nextjs-project/server.js
const auth = require('./server/auth.js')  // 1. 引入auth

app.prepare().then(()=> {
	...
	server.use(session(SESSION_CONFIG,server))

	// 2. 配置github OAuth登录，其auth函数必须在session后面
	auth(server)

	// 3. 编写测试路由
	router.get('/api/user/info',async(ctx)=> {
		// 4. 直接从redis当中取出用户信息返回
		const user = ctx.session.userInfo
		if(!user) {
			ctx.status = 401
			ctx.body = 'Need Login'
		} else {
			ctx.body = user
			ctx.set('Content-Type', 'application/json')
		}
	})

```
然后我们到`pages/index.js`当中去测试一下这个路由
```javascript
// pages/index.js
import { useEffect } from 'react' // 1. 引入useEffect这个钩子
import axios from 'axios' // 2. 引入axios

const Index = ({counter,username,rename,addcount}) => {

	// 3. 进入组件
	// 如果在没有登录的情况下请求localhost:3001/api/user/info是请求不成功的
	// 如果在登录的情况下请求localhost:3001/api/user/info是成功的
	useEffect(()=> {
		axios.get('/api/user/info').then(resp => console.log(resp))
	},[])


}

```
所以当我们没有登录，访问`localhost:3001/`就请求不到用户信息，因为`redis`当中没有，登录之后，回到首页`localhost:3001`，则就会在控制台当中打印出用户信息，到这里为止，整个`Github OAuth`就算接入完成了。

当然，使用用户信息并没有这么简单，而是要走服务端的流程，并且一开始用户信息就存在，我们就应该放在`redux`当中去。