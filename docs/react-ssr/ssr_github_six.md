# 仓库-Readme页面
+ <font color=#9400D3>GET /repos/:owner/:repo</font>：根据owner和repos来获取仓库信息（[Get a repository](https://developer.github.com/v3/repos/#get-a-repository))）

## 提取布局成为HOC
那对于`detail/index`和`detail/issues`两个页面都包含相同的布局，都是在顶部有仓库的基础信息的展示，下面才是页面不同的内容，那显然把这种在多个页面都相同的布局提取出来是正确的做法，下面就来提取

创建`components/with-repo-basic.jsx`文件，用来提取仓库`index`和`issues`两个页面的共同布局：
```javascript
// components/with-repo-basic.jsx
import Repo from './Repo'
import Link from 'next/link'
import api from '../lib/api'
import { withRouter } from 'next/router'

function makeQuery(queryObject) {
	const query = Object.entries(queryObject)
	.reduce((result, entry) => {
		result.push(entry.join('='))
		return result
	}, []).join('&')

	return `?${query}`
}

function withRepoBasic (Comp,type='index') {
	// 4. repoBasic和router作为本身withDetail这个HOC组件要用到的属性，其他属性统统是具体的Comp组件要用到的属性
	function withDetail({repoBasic,router, ...rest}) {
		const query = makeQuery(router.query)

		return (
			<div className="root">
				{/* 基础信息*/}
				<div className="repo-basic">
					<Repo repo={repoBasic}/>
					<div className="tabs">
						{
							type === 'index'? <span className="tab">Readme</span>:
							<Link href={`/detail${query}`}><a className="tab index">Readme</a></Link>
						}
						{
							type === 'issues'? <span className="tab">Issues</span>:
							<Link href={`/detail/issues${query}`}><a className="tab issues">Issues</a></Link>
						}
					</div>
				</div>

				{/* 具体Read页面*/}
				<div><Comp {...rest}/></div> {/* 5. 除了withDetail本身的一些属性，其他全部要传入具体的组件Comp当中*/}
				<style jsx>{`
					.root {
						padding-top: 20px;
					}
					.repo-basic {
						padding: 20px;
						border: 1px solid #eee;
						margin-bottom: 20px;
						border-radius: 5px;
					}
					.tab + .tab {
						margin-left: 20px;
					}
				`}</style>
			</div>
		)
	}

	withDetail.getInitialProps = async (context) => {
		const { ctx } = context
		const { owner, name } = ctx.query

		const repoBasic = await api.request({
			url: `/repos/${owner}/${name}`
		},ctx.req, ctx.res)

		// 1.如果传入HOC的具体组件有getInitialProps方法就要执行
		let pageData = {}
		if (Comp.getInitialProps) {
			// 2. 注意这里传入的是完整的context
			pageData = await Comp.getInitialProps(context)
		}

		return {
			repoBasic: repoBasic.data,
			...pageData // 3. 然后拿到数据，作为withRepoBasic组件的getInitialProps方法返回数据的一部分
		}
	}

	return withRouter(withDetail)
}

export default withRepoBasic
```
关于`HOC`组件之前也说过了，无论是`react-redux`还是`withRouter`都是使用的这种方法，但是我们还是要在这里就拿这个例子，让大家更加透彻搞懂`HOC`的内部流程，基本的五个步骤在上面的代码注释当中已经清清楚楚展示给大家了。

然后是`pages/detail/index`和`pages/detail/issues`两个页面的雏形：
```javascript
// pages/datil/index.js
import withRepoBasic from '../../components/with-repo-basic'

function Detail({text}){
	return <span>Detail index {text}</span>
}

Detail.getInitialProps = async () => {
	return {
		text:123
	}
}

export default withRepoBasic(Detail,'index')
```
```javascript
// pages/detail/issues
import withRepoBasic from '../../components/with-repo-basic'

function Issues({text}){
	return <span>Detail index {text}</span>
}

Issues.getInitialProps = async () => {
	return {
		text:456
	}
}

export default withRepoBasic(Issues,'issues')
```

## 仓库基础信息缓存
之前我们在`pages/index`做过缓存，同样在这里也会出现类似的问题，就是在访问`/detail/`或者访问`/detail/issues`两个页面的时候都要去请求关于这个仓库的信息，导致页面反应就比较慢，因为`github`的请求速度你是知道的，所以我们下面来做优化：

我们首先创建一个`lib/repo-basic-cache.js`文件：
```javascript
// lib/repo-basic-cache.js
import LRU from 'lru-cache'

const REPO_CACHE = new LRU({
	maxAge: 1000 * 60 * 60 // 100毫秒*60*60 = 1小时,仓库的基本信息一般不会修改，仓库一般修改的是里面的文件内容
})

export function cache(repo) {
	const full_name = repo.full_name
	REPO_CACHE.set(full_name, repo)
}

// full_name: facebook/react
export function get(full_name) {
	return REPO_CACHE.get(full_name)
}

// 对数组中的每项都进行缓存
export function cacheArray(repos) {
	repos.forEach(repo => {
		cache(repo)
	});
}
```
有了这样的缓存，我们可以在`search`页面搜索到的数据进行缓存：
```javascript
// pages/search.js
import { memo,isValidElement,useEffect } from 'react' // 1. 引入useEffect
import { cacheArray } from '../lib/repo-basic-cache' // 2. 引入cacheArray缓存数组中每个仓库的基本信息
const isServer = typeof window === 'undefined' // 3. 判断是否在客户端
function Search({router,repos}) {

	useEffect(()=> {
		if(!isServer) cacheArray(repos.items) // 4. 客户端的时候我们才去缓存
	})
}
```
缓存信息有了之后，我们进入到仓库详情页的时候，基本信息就可以直接从缓存中拿：
```javascript
// components/with-repo-basic.jsx
import { get,cache } from '../lib/repo-basic-cache' // 1. 引入获取缓存和设置缓存的方法

const isServer = typeof window === 'undefined' // 2. 判断是否是客户端

export default function(Comp,type = 'index') {
	function withDetail({repoBasic, router, ...rest}) {
		const query = makeQuery(router.query)

		// 5. 进入客户端渲染的时候,才去缓存
		// 6. 如果是从search页面经过路由进来，一般是有search，再缓存一次无妨，只会延长缓存时间而已
		// 7. 如果是服务端直接进来，那么就要将信息缓存在客户端的cache当中
		useEffect(()=> {
			if(!isServer) {
				cache(repoBasic)
			}
		})

		return (...)
	}

	withDetail.getInitialProps = async (context) => {
		const { ctx } = context
		const { owner, name } = ctx.query

		const full_name = `${owner}/${name}`

		let pageData = {}
		if (Comp.getInitialProps) {
			pageData = await Comp.getInitialProps(context)
		}
		// 3. 在客户端路由跳转的时候，如果缓存中有信息，直接拿出使用
		if(get(full_name)) {
			return {
				repoBasic: get(full_name),
				...pageData
			}
		}
		// 4. 如果没有（服务端渲染的时候），我们就要去请求数据了
		const repoBasic = await api.request({
			url: `/repos/${owner}/${name}`
		},ctx.req, ctx.res)

		return {
			repoBasic: repoBasic.data,
			...pageData
		}
	}

	return withRouter(withDetail)
}
```
同样的道理，也可以在`pages/index.js`当中将自己的仓库和关注的仓库做一个缓存，我们从`/index`页面进入`/detail/`的时候，也就没有请求，直接使用的就是在`index`页面缓存的仓库信息：
```javascript
// pages/index.js
import { cacheArray } from '../lib/repo-basic-cache'	// 1. 引入cacheArray方法
function Index({userRepos, userStaredRepos,user,router}) {
	// 2. 将自己的仓库和关注的仓库列表都缓存
	useEffect(()=> {
		if(!isServer) {
			cacheArray(userRepos)
			cacheArray(userStaredRepos)
		}
	})
}
```

## 制作Readme页面
关于请求到一个仓库的`Readme`信息后，信息以`base64`的字符串保存在返回信息的`content`当中，我们首先要将其通过`atob`这个全局方法解码正确的`markdown`字符串，然后再通过将`markdown-it`转换成为`html`并显示在网页上

但是对于服务端渲染来说：没有`window`对象，自然就没有`atob`方法，我们可以通过在`nodejs`全局添加`atob`方法来实现，下载`atob`,顺便也把`markdown-it`和`github-markdown-css`也下载了
```javascript
yarn add atob@2.1.2
yarn add markdown-it@8.4.2
yarn add github-markdown-css@3.0.1
```
```javascript
// server.js
const atob = require('atob') // 1. 引入atob

// 2. 设置node.js全局有atob方法
global.atob = atob
```
接着我们就来编写`pages/detail/index.js`页面：
```javascript
// pages/detail/index.js
import withRepoBasic from '../../components/with-repo-basic'
import api from '../../lib/api'
import MDRenderer from '../../components/MarkdownRenderer' // 1. 引入markdown组件

function Detail({readme}){
	return <MDRenderer content={readme.content}  isBase64={true}/> // 2. 传入字符串
}

Detail.getInitialProps = async ({ctx}) => {
	const { owner, name } = ctx.query

	const readmeResp = await api.request({
		url: `/repos/${owner}/${name}/readme`
	},ctx.req, ctx.res)

	return {
		readme: readmeResp.data
	}

}

export default withRepoBasic(Detail,'index')
```
那么我们来看具体的我们自定义的`MDRenderer`组件是什么样子，我们创建`components/MarkdownRenderer.jsx`:
```javascript
// components/MarkdownRenderer.jsx
import { memo, useMemo} from 'react' // 7 因为MarkdowRenderer只依赖props，所以使用memo优化
import MarkdownIt from 'markdown-it' // 1. 引入MarkdownIt
import 'github-markdown-css'  // 2. 引入github-markdown-css样式，markdown-body包含在其中

const md = new MarkdownIt({
	html:true, // 3. markdown当中html语法直接生成html代码
	linkify: true // 4. markdown中的网站链接是一个真的链接，而不是一个字符串
})


// 5. 因为atob直接转换中文会出问题，需要将base64转换成为utf8
function b64_to_utf8(str) {
	return decodeURIComponent(escape(atob(str)))
}

export default memo(function MarkdowRenderer({ content, isBase64}) {
	// 6. 是base64的字符串就进行转换
	const markdown = isBase64 ? b64_to_utf8(content): content
	// 8. markdown不发生变化，html就不变化
	const html = useMemo(() => md.render(markdown), [markdown])

	return <div className="markdown-body">
		<div dangerouslySetInnerHTML={{__html:html}} /> {/* 9.展示html*/}
</div>
})
```
## 打包分析