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
首先我们来安装几个工具：
```javascript
yarn add @zeit/next-bundle-analyzer
yarn add cross-env@5.2.0
```
然后我们去修改`next.config.js`:
```javascript
// next.config.js
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer')  // 1. 引入withBundleAnalyzer


if (typeof require !== 'undefined') {
	require.extensions['.css'] = file => {}
}

// 2. 外层包裹
module.exports = withBundleAnalyzer(withCss({
	publicRuntimeConfig: {
		GITHUB_OAUTH_URL:config.GITHUB_OAUTH_URL,
		OAUTH_URL: config.OAUTH_URL
	},
	// 3. 下面全是相关配置
	// analyzeServer: ["server", "both"].includes(process.env.BUNDLE_ANALYZE), // 4. 我们这里不去看服务端的js依赖关系，不需要配置这项
  analyzeBrowser: ["browser", "both"].includes(process.env.BUNDLE_ANALYZE),
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: 'static',
      reportFilename: '../bundles/server.html'
    },
    browser: {
      analyzerMode: 'static',
      reportFilename: '../bundles/client.html'
    }
  }
}))
```
然后在`package.json`当中去配置一个命令：
```javascript
// package.json
{
  "scripts": {
    "analyze:browser": "cross-env BUNDLE_ANALYZE=browser next build"
  },
}
```
接着使用下面的命令来生成依赖图：
```javascript
npm run analyze:browser
```

<img :src="$withBase('/react_ssr_github_analyze.png')" alt="分析图">

这个图上面可以看到左边黄色的部分就是整个项目的公用的打包文件，然后右侧是我们写的几个页面的相关打包的文件依赖图

### 1. dynamic
我们针对`detail`这个页面进行组件的异步加载，然后看看在依赖图上有什么不同的地方:
```javascript
// pages/detail/index.js
// 同步加载
// import MDRenderer from '../../components/MarkdownRenderer'

// 异步加载
import dynamic from 'next/dynamic'
const MDRenderer = dynamic(
	()=> import('../../components/MarkdownRenderer'),
	{
		loading: () => <p>loading</p>
	}
)
```
接着我们重新分析，执行`npm run analyze:browser`

然后我们分析使用同步加载的时候的依赖图和使用异步加载的依赖图，先看同步加载的依赖图：

<img :src="$withBase('/react_ssr_github_detail.png')" alt="detail分析图">

<font color=#DD1144>当我们同步加载的时候，访问/detail/xxx页面的时候就会去请求detail.js这个js文件，而这个文件包含了两个大部分的内容，如上图第一大部分就是左边红框中的node_modules部分，第二部分就是右侧红框中的pages部分，因为之前我们以HOC的方法使用with-repo-basic的东西包裹了detail部分，所以基本上右侧红框中的上半部分就是with-repo-basic的内容，然后下半部分就是detail一些其他部分，相关大小在上面的图中都可以看到</font>

<font color=#DD1144>另外，我们在dynamic方法中提供的第二个参数loading是个函数，函数的返回值将作为异步加载中给用户显示的临时组件，一般我们这里都会写一个什么等待中，或者等待的动画组件，避免在异步加载的过程中给用户显示一片空白</font>

接着我们来分析使用异步加载的时候的依赖图；

<img :src="$withBase('/react_ssr_github_dynamic.png')" alt="异步加载分析图">

<font color=#DD1144>当我们使用了异步加载MDRenderer这个组件，访问/detail/xxx页面的时候就会去请求detail.js和1.js两个文件，也就是变成了两个http的请求，增加请求数量当然是不好的，但是好的一点是，因为上图左边青绿色部分基本都是node_module部分的东西，所以在请求的时候哈希值不会变，就会在浏览器中进行长缓存</font>

### 2. 剔除moment多余的locale
在上面的图中，无论是异步加载或者同步加载，在左侧黄色部分中的`moment.js`当中存在很多不需要`locale`，这个如果你做过多语言你就知道，这个是和不同国家语言相关的东西，在我们这个项目中是不需要的，所以我们需要修改一下配置：
```javascript
// next.config.js
const webpack = require('webpack') // 1. 引入webpack

module.exports = withBundleAnalyzer(withCss({
	webpack(config) { // 2. 配置去除locale不需要的语言文件
		config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/,/moment$/))
		return config
	},
	...
}))
```
然后我们重新分析，就会发现`moment.js`的大小一下从500多k变成了100多k。