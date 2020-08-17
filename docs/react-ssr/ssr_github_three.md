# Github接口代理

## Github接口代理
现在我们来学习在页面上请求`github`的数据，实际上可以直接在页面上通过`axios`来获取数据，<font color=#1E90FF>但是对于github的api是有限制的，比如像搜索的api就有在未登录的时候每分钟只能针对特定的IP请求10次，而登录会有每个用户都有每分钟30次的请求机会。而其他的api都必须携带用户的token才能进行请求</font>

所以我们的想法是：<font color=#9400D3>将对gitub的请求发向自己的服务，然后服务代理到github，根据用户是否在我们自己的服务商登录来在github的请求中携带token，这样的想法是基于token是一个比较敏感的信息，不应该在客户端拿到</font>

另外我们通过统一接口，访问我们自己的`/github/...`这个`api`，把请求到这些`api`上的请求全部代理到`github`,简单的说我们的代码要做下面的修改：
```javascript
// pages/_app.js
componentDidMount() {
	// 修改前
	axios.get('https://api.github.com/search/repositories?q=react')

	// 修改后
	axios.get('/github/search/repositories?q=react')
}
```
那么这样修改后，我们就需要到服务端去书写一个处理`/github/xxx`的处理器，创建`server/api.js`,内容如下
```javascript
// server/api.js
const axios = require('axios')

const github_base_url = 'https://api.github.com'

module.exports = (server) => {
	server.use( async (ctx,next) => {
		const path = ctx.path
		if (path.startsWith('/github/')) { // 1. 判断请求来的地址是否是`/github/`打头的
			const githubAuth = ctx.session.githubAuth // 2. 在session中拿到用户授权的token信息
			const githubPath =`${github_base_url}${ctx.url.replace('/github/','/')}`  // 3. 拼接完整的github请求地址

			const token = githubAuth && githubAuth.access_token
			let headers = {}

			if (token) {
				headers['Authorization'] = `${githubAuth.token_type} ${token}`  // 4. 在github的请求中携带用户信息在头部
			}

			try {
				const result = await axios({
					method: 'GET',
					url:githubPath,
					headers
				})

				if(result.status === 200) { // 5. 请求成功就返回github的api的返回结果
					ctx.body = result.data
					ctx.set('Content-Type', 'application/json')
				} else { // 6. 失败就返回简单的{success；false}对象
					ctx.status = result.status
					ctx.body = {
						success: false
					}
					ctx.set('Content-Type', 'application/json')
				}

			} catch (error) {
				console.error(error)
				ctx.body = {
					success: false
				}
				ctx.set('Content-Type', 'application/json')
			}
		} else {
			await next()
		}
	})
}
```
然后将这个中间件加入到`koa`当中：
```javascript
// server.js
const githubapi = require('./server/api.js') // 1. 引入中间件

app.prepare().then(()=> {
	auth(server)

	// 2. 配置github代理请求
	githubapi(server)

})
```

## 完善整体布局
晚上整体布局，要做下面几件事“
+ <font color=#1E90FF>点击layout左上角的Icon会跳转到首页</font>
+ <font color=#1E90FF>完善输入框搜索逻辑</font>
+ <font color=#1E90FF>样式调整</font>
+ <font color=#1E90FF>创建search页面</font>
+ <font color=#1E90FF>页面中输入框中的内容和url中的query保持一致</font>

```javascript
// components/layout.jsx

import Link from "next/link"; //1 引入路由

function MyLayout ({children, user, logout, router}) {
	// 5. 输入框中的内容和url中的query参数保持一致
	const urlQuery = router.query && router.query.query
	const [search, setSearch] = useState(urlQuery || '')

	// 3. 完善输入框搜索逻辑：跳转到search页面，并携带query
	const handleOnSearch = useCallback(() => {
		router.push(`/search?query=${search}`)
	}, [search])

	return (
		<Layout>
			<Header>
				<Container renderer={<div className="header-inner" />}>
					<div className="header-left">
						<div className="logo">
							<Link href="/"> {/*2. 包裹Icon*/}
								<Icon type="github" style={githubIconStyle}></Icon>
							</Link>
						</div>
						<div>
							<Input.Search
								placeholder="搜索仓库"
								value={search}
								onChange={handleSearchChange}
								onSearch={handleOnSearch}
							></Input.Search>
						</div>
					</div>
				</Container>
			</Header>
			...
			{/* 4. 样式调整*/}
			<style jsx global>{`
				.ant-layout {
					min-height: 100%;
				}
				.ant-layout-content {
					background: #fff
				}
			`}</style>
		</Layout>
	)
}
```
```javascript
// pages/search.js
import { withRouter } from "next/router";

function Search({router}) {
	return <span>Search {router.query.query}</span>
}

export default withRouter(Search)
```

## Github接口代理完善
虽然，我们通过上面的代码都基本上完成了对`github`接口的请求，但是有个特别大的问题存在，这个就是服务端中最典型的几个问题之一：

<font color=#DD1144>服务端和客户端的请求地址不同，在客户端请求/github/xxx，浏览器会自动带上当前域名，也就是http://localhost:3001/github/xxx，但是服务端就不一样了，服务端携带的是http:127.0.0.1:80，携带的是80端口，这个就不对了，服务端应该请求的是个完整的https://api.github.com/xxx</font>

所以针对上面的问题，我们需要来改造一下我们的请求架构，我们要做的只有两件事，就是：
+ <font color=#1E90FF>写一份代码同时符合客户端和服务端请求的情况</font>
+ <font color=#1E90FF>针对客户端请求到服务端的github开头的api处理器稍微改造</font>

创建`lib/api.js`
```javascript
// lib/api.js
const axios = require('axios')

const github_base_url = 'https://api.github.com'

// 3. 直接向github的api完整的地址发送请求
async function requestGithub(method, url, data,headers) {
	return await axios({
		method,
		url:`${github_base_url}${url}`,
		data,
		headers
	})
}


const isServer = typeof window === 'undefined'
// 1. 无论服务端还是客户端都用request这个函数去请求数据
async function request({method = 'GET', url, data={} }, req ,res) {
	if(!url) {
		throw Error('url must provide')
	}

	// 2. 服务端直接向github发送请求
	if (isServer) {
		const session  = req.session
		const githubAuth = session.githubAuth || {}
		const headers = {}
		if (githubAuth.access_token) {
			headers['Authorization'] = `${githubAuth.token_type} ${githubAuth.access_token}`
		}
		return await requestGithub(method,url,data,headers)
	} else {
		// 4.客户端的情况直接向自己的服务器发送github开头的api请求地址
		return await axios({
			method,
			url: `/github${url}`,
			data,
		})
	}
}

module.exports = {
	request,
	requestGithub
}
```
然后我们改造一下前面写的服务端关于`/github/`开头的api处理器
```javascript
// server/api.js
const axios = require('axios')

const github_base_url = 'https://api.github.com'

const { requestGithub } = require('../lib/api')

module.exports = server => {
	server.use(async (ctx, next)=> {
		const path = ctx.path
		const method = ctx.method
		if (path.startsWith('/github/')) {
			console.log(ctx.request.body)
			const session = ctx.session
			const githubAuth = session && session.githubAuth
			const headers = {}
			if (githubAuth && githubAuth.access_token) {
				headers['Authorization'] = `${githubAuth.token_type} ${githubAuth.access_token}`
			}

			const result = await requestGithub(
				method,
				ctx.url.replace('/github/','/'),
				ctx.request.body|| {}, // ctx.request.body需要通过使用koa-body这个第三方包来拿到
				headers
			)

			ctx.status = result.status
			ctx.body = result.data

		} else {
			await next()
		}
	})
}
```
当然其中我们使用的`ctx.request.body`需要下载`koa-body`来拿到`post`的请求：
```javascript
yarn add koa-body@4.1.0
```
然后作为`koa`的中间件使用即可：
```javascript
// server.js
const koaBody = require('koa-body') // 1. 引入

app.prepare().then(()=> {
	const server = new Koa()
	const router = new Router()

	server.use(koaBody()) // 2. 使用
	...
```

经过上面的完善之后，我们在页面中直接使用`lib/api`中的`request`函数即可，我们在`pages/index.js`中测试一下
```javascript
// pages/index.js
import Link from 'next/link'
import api from '../lib/api.js' // 1. 引入api

function Index() {

	return (
		<>
			<Link href="/detail">
				<a>Detail的链接</a>
			</Link>
			<p>Index</p>
		</>
	)
}


Index.getInitialProps = async ({ctx}) => {
	// 2. 通过api.request请求，至于到底走服务端流程还是客户端流程，api.request函数中会自有判断
	const result = await api.request({
		url: '/search/repositories?q=react'
	},ctx.req, ctx.res)

	return {
		// 3. 有时候github的api也不一定请求的成功，稍作判断即可
		data: (result && result.data)? result.data: {}
	}
}

export default Index
```

我们现在用一个简单的图来描述一下两种请求情况:

<img :src="$withBase('/react_ssr_github_search.png')" alt="请求">

+ <font color=#DD1144>第一种情况是客户端渲染，也就是前端路由跳转，比如从localhost:3001/detail通过路由跳转到localhost:3001，则在Index中执行getInitialProps方法，方法请求的是'/search/repositories?q=react'这个路由，因为是浏览器发起请求，经过api.request处理后，完整路径是http://localhost:3001/github/search/repositories?q=react'，这个请求到后端，后端通过处理'/github/'的处理器处理，直接拿到ctx.path的一部分/search/repositories?q=react，并和'https://api.github.com'拼接，向完整的地址'https://api.github.com/search/repositories?q=react'发起请求，拿到data，并原样返回给客户端</font>

+ <font color=#DD1144>第二种情况是服务端渲染，用户第一次访问localhost:3001，则在后端执行Index中getInitialProps方法，方法请求的是'/search/repositories?q=react'这个地址，因为是node端发起的，经过api.request处理后，直接和'https://api.github.com'拼接，向完整的地址'https://api.github.com/search/repositories?q=react'发起请求，拿到data，并保存在组件的属性当中，客户端拿到的就是带有data的组件或者页面</font>



