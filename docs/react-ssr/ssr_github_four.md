# 首页开发
+ <font color=#9400D3>GET /users/repos</font>：获取用户创建的仓库列表信息（[List repositories for a user](https://developer.github.com/v3/repos/#list-repositories-for-a-user)）
+ <font color=#9400D3>GET /user/starred</font>：获取当前用户关注的仓库列表信息（[List repositories starred by the authenticated user](https://developer.github.com/v3/activity/starring/#list-repositories-starred-by-the-authenticated-user)）

## 联调主页数据
根据我们上面提供的两个API接口，我们现在去在`pages/index.js`当中去书写代码：
```javascript
// pages/index.js
import Link from 'next/link'
import api from '../lib/api.js'

function Index({userRepos, userStaredRepos,isLogin}) {
	return (
		<>
			<Link href="/detail">
				<a>Detail的链接</a>
			</Link>
			<p>Index</p>
		</>
	)
}


Index.getInitialProps = async ({ctx, reduxStore}) => {

	// 1. 判断用户是否登录，未登录直接返回isLogin为false
	const user = reduxStore.getState().user
	if (!user || !user.id) {
		return {
			isLogin:false
		}
	}

	// 2. 用户登录的话：获取用户创建的仓库信息
	const userRepos = await api.request({
		url: '/user/repos'
	},ctx.req, ctx.res)

	// 3. 用户登录的话：获取用户关注的仓库信息
	const userStaredRepos = await api.request({
		url: '/user/starred'
	},ctx.req, ctx.res)

	// 4. 将请求的数据以props的形式给组件
	return {
		isLogin: true,
		userRepos: (userRepos && userRepos.data)? userRepos.data: {},
		userStaredRepos: (userStaredRepos && userStaredRepos.data)? userStaredRepos.data: {},
	}
}

export default Index
```

## 展示用户数据
在能够正确的访问到`github`的api接口的数据之后，我们就来将数据展示在页面上：
```javascript
// pages/index.js
import api from '../lib/api.js'
import { Button, Icon,Tabs } from 'antd'
import getConfig from 'next/config'
import { connect } from 'react-redux'
import Repo from '../components/Repo'
import Router, { withRouter } from 'next/router'

const { publicRuntimeConfig } = getConfig()

function Index({userRepos, userStaredRepos,user,router}) {

	// 1. 定义tab对应当前展示tab也的key
	const tabKey = router.query.key || "1"
	// 2. 切换路由会进行路由跳转
	const handletabChange = (activeKey) => {
		Router.push(`/?key=${activeKey}`)
	}


	// 3. 没有登录的显示界面
	if (!user || !user.id) {
		return <div className="root">
			<p>还没有登录哦，请登录</p>
			<Button type="primary" href={publicRuntimeConfig.OAUTH_URL}>点击登录</Button>
			<style jsx>{`
				.root {
					height:400px;
					display:flex;
					flex-direction: column;
					justify-content:center;
					align-items: center;
				}
			`}</style>
		</div>
	}

	// 4. 登录后的显示界面
	return (
		<div className="root">
			<div className="user-info">
				<img src={user.avatar_url} alt="user avatar" className="avatar"/>
				<span className="login">{user.login}</span>
				<span className="name">{user.name}</span>
				<span className="bio">{user.bio || '暂无'}</span>
				<p className="email">
					<Icon type="mail" style={{marginRight:10}}></Icon>
					<a href={`mailto:${user.email}`}>{user.email || '暂无'}</a>
				</p>
			</div>
			<div className="user-repos">
				{/* 5. tabs切换*/}
				<Tabs defaultActiveKey={tabKey} onChange={handletabChange} animated={false}>
					<Tabs.TabPane	tab="你的仓库" key="1">
						{
							(userRepos && userRepos.length)?userRepos.map(repo => <Repo key={repo.id} repo={repo}/>): null
						}
					</Tabs.TabPane>
					<Tabs.TabPane	tab="你关注的仓库" key="2">
						{
							(userStaredRepos && userStaredRepos.length)?userStaredRepos.map(repo => <Repo key={repo.id} repo={repo}/>): null
						}
					</Tabs.TabPane>
				</Tabs>
			</div>
			<style jsx>{`
				.root {
					display: flex;
					align-items: flex-start;
					padding: 20px;
				}
				.user-info {
					width: 200px;
					margin-right: 40px;
					flex-shrink: 0;
					display: flex;
					flex-direction: column;
				}
				.login {
					font-weight: 800;
					font-size: 20px;
					margin-top:20px;
				}
				.name {
					font-size: 16px;
					color: #777;
				}
				.bio {
					margin-top: 20px;
					color: #333;
				}
				.avatar {
					width: 100%;
					border-radius:5px;
				}
				.user-repos {
					flex-grow: 1;
				}
			`}</style>
		</div>
	)
}


Index.getInitialProps = async ({ctx, reduxStore}) => {

	const user = reduxStore.getState().user
	if (!user || !user.id) {
		return {}
	}

	// 6.用户创建的仓库信息
	const userRepos = await api.request({
		url: '/user/repos'
	},ctx.req, ctx.res)

	// 7. 用户关注的仓库信息
	const userStaredRepos = await api.request({
		url: '/user/starred'
	},ctx.req, ctx.res)


	return {
		userRepos: (userRepos && userRepos.data)? userRepos.data: {},
		userStaredRepos: (userStaredRepos && userStaredRepos.data)? userStaredRepos.data: {},
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.user
	}
}
export default connect(mapStateToProps)(withRouter(Index))
```
然后每个数据，我们都用一个组件去展示，我们创建`components/Repos.jsx`:
```javascript
// components/Repos.jsx
import Link from "next/link";
import { Icon } from "antd";
import moment from 'moment'

function getLicense(license) {
  return license ? `${license.spdx_id} license` : "";
}

// 1.时间处理的函数，将时间展现为多久之前
function getLastUpdated(time) {
	return moment(time).fromNow()
}

export default ({ repo }) => {
  return (
    <div className="root">
      <div className="basic-info">
        <h3 className="repo-title">
          <Link href={`/detail?owner=${repo.owner.login}&name=${repo.name}`}>
            <a>{repo.full_name}</a>
          </Link>
        </h3>
        <p className="repo-desc">{repo.description}</p>
        <p className="other-info">
          {
						repo.license? <span className="license">{getLicense(repo.license)}</span>: null
					}
          <span className="last-updated">{getLastUpdated(repo.updated_at)}</span>
          <span className="open-issues">{repo.open_issues_count} open issues</span>
        </p>
      </div>
      <div className="lang-star">
        <span className="lang">{repo.language}</span>
        <span className="stars">
          {repo.stargazers_count} <Icon type="star" theme="filled" />
        </span>
      </div>
      <style jsx>{`
				.root	{
					display: flex;
					justify-content: space-between;
				}
				.other-info > span + span{
					margin-left: 10px;
				}
				.root + .root {
					border-top: 1px solid #eee;
					padding-top:20px;
				}
				.repo-title {
					font-size:20px;
				}
				.lang-star {
					display: flex;
				}
				.lang-star > span {
					width: 120px;
					text-align: right;
				}
				.repo-desc {
					width: 400px;
				}
			`}</style>
    </div>
  );
};
```
我们实现的页面如下：

<img :src="$withBase('/react_ssr_github_home.png')" alt="">

## 数据缓存
现在有一个比较大的问题，<font color=#9400D3>当我们切换Tab的时候,或者从其他页面通过路由跳转进入index，实际上每次都要重新执行Index.getInitialProps方法，也要去重新到github上请求数据，而用户创建的仓库和用户关注的仓库的信息实际上是可以缓存复用的，在短暂的时间内不会有太大的变动，但是这部分数据又不是全局其他页面会用到的数据，所以也不能放在redux当中</font>

```javascript
// pages/index.js
import Router, { withRouter } from 'next/router'
import { useEffect } from 'react'

let cachedUserRepos, cachedUserStatedRepos // 1. 创建两个缓存变量

const isServer = typeof window === 'undefined' // 2. 用于判断是否是服务端

function Index({userRepos, userStaredRepos,user,router}) {

	const tabKey = router.query.key || "1"
	const handletabChange = (activeKey) => {
		Router.push(`/?key=${activeKey}`)
	}

	// 3. 在客户端重新渲染的时候，将userRepos和userStaredRepos赋值给cachedUserRepos和cachedUserStatedRepos
	useEffect(()=> {
		if(!isServer) {
			cachedUserRepos = userRepos
			cachedUserStatedRepos = userStaredRepos
		}
	}, [userRepos,userStaredRepos])
}

Index.getInitialProps = async ({ctx, reduxStore}) => {

	const user = reduxStore.getState().user
	if (!user || !user.id) {
		return {}
	}

	// 4. 只有客户端的时候才会执行，当cachedUserRepos和cachedUserStatedRepos有值的时候进行复用
	if (!isServer) {
		if (cachedUserRepos && cachedUserStatedRepos) {
			return {
				userRepos:cachedUserRepos,
				userStaredRepos: cachedUserStatedRepos
			}
		}
	}

	const userRepos = await api.request({url: '/user/repos'},ctx.req, ctx.res)
	const userStaredRepos = await api.request({url: '/user/starred'},ctx.req, ctx.res)

	return {
		userRepos: (userRepos && userRepos.data)? userRepos.data: {},
		userStaredRepos: (userStaredRepos && userStaredRepos.data)? userStaredRepos.data: {},
	}
}
// 5. 将withRouter写在外面，强制路由变化的时候，组件重新渲染
export default withRouter(connect(mapStateToProps)(Index))
```
上面这个过程可能有些同学反应不过来，我们来具体解释一下两个过程：
+ <font color=#DD1144>服务端渲染的时候，先执行Index.getInitialProps方法，会去发送github的api的请求，然后渲染好页面返回给客户端，但是注意这个过程cachedUserRepos，cachedUserStatedRepos是没有值的，它在服务端作为nestjs中的公共变量是不能有值，否则会被所有用户公用，这个特别要注意</font>
+ <font color=#DD1144>客户端拿到页面后，组件中的userRepos和userStaredRepos是有值的，我们就把两个值缓存在cachedUserRepos和cachedUserStatedRepos当中，也就是上述代码中的第三步。注意这个时候cachedUserRepos和cachedUserStatedRepos是跑在浏览器中的变量，对于每个用户就是独特的变量，所以可以作为缓存的容器</font>，<font color=#1E90FF>另外要注意，Index.getInitialProps方法只在服务端渲染的时候和前端路由跳转的时候执行，在服务端渲染返回给客户端的时候，客户端重新再渲染一遍的时候是不执行的</font>
+ <font color=#DD1144>最后客户端在路由跳转的过程中，进入Index页面，执行Index.getInitialProps的时候，发现cachedUserRepos和cachedUserStatedRepos是有值的，就赋值给userRepos和userStaredRepos，也就是上述代码的第四步，这样客户端就不用重新请求了</font>

<img :src="$withBase('/react_ssr_github_cache.png')" alt="缓存策略">

## 更新策略
当然，数据作为缓存是一定要有过期时间的，按照上面的思路，我们实际上只需要在`useEffect`中给`cachedUserRepos`给`cachedUserStatedRepos`设置一个过期时间即可，简单的说就是使用`setTimeout`在一定时间后将两个缓存内容设置为`null`即可。

但是我们有更好的工具选择，就是<font color=#DD1144>lru-cache</font>，帮助我们缓存某个页面的数据：
```javascript
// pages/index.js

import LRU from 'lru-cache' // 1. 引入LRU

const cache = new LRU({
	maxAge:1000 * 60 * 5  // 2. 设置过期时间，5分钟
})

function Index({userRepos, userStaredRepos,user,router}) {
	// 3. 在客户端渲染的时候，将userRepos和userStaredRepos保存在LRU中5分钟
	useEffect(()=> {
		if(!isServer) {
			if (userRepos) { // 3.1 有值才保存
				cache.set('userRepos',userRepos)
			}
			if (userStaredRepos) { // 3.1 有值才保存
				cache.set('userStaredRepos',userStaredRepos)
			}
		}
		// 4. 当userRepos和userStaredRepos有变化，会重新延迟缓存时间
	}, [userRepos,userStaredRepos])
}

Index.getInitialProps = async ({ctx, reduxStore}) => {
	// 5. 在客户端路由跳转的时候，再从LRU中将userRepos和userStaredRepos拿出来
	if (!isServer) {
		if (cache.get('userRepos') && cache.get('userStaredRepos')) {
			return {
				userRepos:cache.get('userRepos'),
				userStaredRepos: cache.get('userStaredRepos')
			}
		}
	}

	...
}
```
特别注意第四步，`userRepos`和`userStaredRepos`作为`useEffect`的第二个参数后，只有两个状态有变化，`lru`中的缓存就重新定义时间，说白了就是继续将缓存时间延长5分钟，所以只有你一直在这个页面，缓存就永远不会消失。但是只要离开这个野蛮5分钟，缓存就消失了，再进入到页面，就要重新请求数据了，这个大家要注意。