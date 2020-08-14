# 用户系统完善

## 完善登录功能
我们之前设计的是点击右上角的头像就会进行登录，那么说明右上角的头像应该是链接到`github`授权的页面，这个我们就直接来做：
```javascript
// components/layout.jsx
import { useState, useCallback } from 'react'
import { Layout, Icon, Input, Avatar,Tooltip,Dropdown, Menu } from 'antd' // 1. 引入Tooltip、Dropdown、Menu这三个组件
import Container from './Container.jsx'

const {Header, Content, Footer} = Layout

import { connect } from 'react-redux'  // 2. 引入redux，因为要从redux中读取用户信息显示在页面上
import getConfig from 'next/config'  // 3.1 引入nextjs配置中的内容
const { publicRuntimeConfig } = getConfig() // 3.2 主要引入github授权的网址链接

const githubIconStyle = {
	color: 'white',
	fontSize: 40,
	display: 'block',
	paddingTop: 10,
	marginRight: 20
}

const footerStyle = {
	textAlign: 'center'
}

function MyLayout ({children, user}) { // 9. 拿到user信息
	const [search, setSearch] = useState('')

	const handleSearchChange = useCallback((event)=> {
		setSearch(event.target.value)
	}, [setSearch])

	const handleOnSearch = useCallback(() => {}, [])

  // 6. 退出的逻辑我们后面再实现
	const userDropDown = (
		<Menu>
			<Menu.Item>
				<a href="javascript:void(0)">
					登出
				</a>
			</Menu.Item>
		</Menu>
	)

	return (
		<Layout>
			<Header>
				<Container renderer={<div className="header-inner" />}>
					<div className="header-left">
						<div className="logo">
							<Icon type="github" style={githubIconStyle}></Icon>
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
					<div className="header-right">
						<div className="user">
							{
								user && user.id ? (
                  // 5. redux中有用户信息，说明已经登录，显示用户的头衔
									<Dropdown overlay={userDropDown}>
										<a href="/">
											<Avatar size={40} src={user.avatar_url}/> {/* 10. 从user信息中取到user的头像*/}
										</a>
									</Dropdown>
								) : (
                  // 4. redux中没有user信息就显示为登录，Tooltip是一个移动上去有提示的组件
									<Tooltip title="登录">
										<a href={publicRuntimeConfig.OAUTH_URL}>
											<Avatar size={40} icon="user"/>
										</a>
									</Tooltip>
								)
							}
						</div>
					</div>
				</Container>
			</Header>
			<Content>
				<Container>
					{children}
				</Container>
			</Content>
			<Footer style={footerStyle}>
				Develop by Taopoppy @<a href="mailto:taopoppy@63.com">taopoppy@63.com</a>
			</Footer>
			<style jsx>{`
				.header-inner {
					display: flex;
					justify-content: space-between;
				}
				.header-left {
					display: flex;
					justify-content: flex-start;
				}
			`}</style>
			<style jsx global>{`
				#__next {
					height: 100%;
				}
				.ant-layout {
					height: 100%;
				}
				.ant-layout-header {
					padding-left: 0;
					padding-right: 0;
				}
			`}</style>
		</Layout>
	)
}

// 8. 从rendux中拿到user的信息，以props的形式传入MyLayout组件中
const mapStateToProps = (state) => {
	return {
		user: state.user
	}
}

// 7. 引入redux
export default connect(mapStateToProps)(MyLayout)
```
当然了，我们在`Layout`当中去获取`store`中的数据，我们就必须在`pages/_app.js`当中去调换一下`Provider`和`Layout`的包裹顺序：
```javascript
// pages/_app.js
return (
  <Container>
    <Head>
      <title>Taopoppy</title>
    </Head>
    <Provider store={reduxStore}> {/* 1. Provider在外面 */}
      <Layout> {/* 2. Layout在里面 */}
          <Component {...pageProps}/>
      </Layout>
    </Provider>
  </Container>
)
```


## 用户登出功能
用户登出功能要有两个步骤：
+ <font color=#9400D3>首先在页面上我们要通过修改store中的数据来清空客户端store的中user模块中的数据</font>
+ <font color=#9400D3>然后我们需要通过POST请求到后端来清除保存在session当中的用户数据</font>

我们先来为之前登出的按钮添加点击事件：
```javascript
// components/layout.jsx
import { logout } from '../store/store.js'

function MyLayout ({children, user, logout}) { // 3. 引入logout函数
	...

	// 2. 在点击事件当中去执行props.logout函数
	const handleLogout = useCallback(() => {
		logout()
	}, [logout])

	const userDropDown = (
		<Menu>
			<Menu.Item>
				<a href="javascript:void(0)" onClick={handleLogout}> {/*1. 给登出添加点击事件*/}
					登出
				</a>
			</Menu.Item>
		</Menu>
	)

	return (
		...
	)
}

// 5. 在MyLayout.props.logout函数当中去dispatch一个名字叫做logout的异步action
const mapDispatchToProps = (dispatch) => {
	return {
		logout: () => {
			dispatch(logout())
		}
	}
}

// 4. 添加mapDispatchToProps
export default connect(mapStateToProps,mapDispatchToProps)(MyLayout)
```

然后我们去定义这个异步的`action`：
```javascript
// store/store.js
import axios from 'axios'

const userInitialState = {}
const LOGOUT = 'LOGOUT'  // 3. 定义个actionType

function userReducer(state = userInitialState,action) {
	switch (action.type) {
		// 4. 当action.type为LOGOUT的时候，我们清空store中的user模块的数据即可
		case LOGOUT: {
			return {}
		}
		default:
			return state
	}
}

// 1. 定义一个异步的action，名字叫做logout
export function logout() {
	return dispatch => {
		axios.post('/logout').then(resp => {
			if (resp.status === 200) {
				// 2. 请求成功，就dispatch一个对象类型的action，type为LOGOUT，value为空
				dispatch({
					type: LOGOUT
				})
			} else {
				console.log('logout failed', resp)
			}
		}).catch(err=> {
			console.log('logout failed catch', err)
		})
	}
}
```
然后页面上的事情做完后，我们来书写服务端的代码，应该只有清空了服务端的`session`，才算登出：
```javascript
// server/auth.js
module.exports = (server) => {
	...

  server.use( async (ctx, next)=> {
    const path = ctx.path
    const method = ctx.method
    if(path === '/logout' && method === 'POST') {
      ctx.session = null
      ctx.body = `logout success`
    } else {
      await next()
    }
  })
}
```


## 维持OAuth之前页面访问
我们在前面书写的代码，你可以看到，当我们登录成功后，我们的代码是：`ctx.redirect('/')`，也就是说无论我们从哪个路径去登录，登录之后都会跳转到根路径，<font color=#1E90FF>我们要实现的功能是从哪个页面登录的，在登录后就跳转回那个网页</font>

我们首先来创建一个`pages/detail.js`用来等会验证从`locahost:3000/detail`登录后，如果能跳转回`locahost:3000/detail`，说明我们代码是正确的，
```javascript
// pages/detail.js
export default () => <span>detail</span>
```
我们的思路是:

1. 点击登录后先请求后端`/prepare-auth?url=当前客户度的路径`这个api
2. 在后端处理器中拿到`url`这个`query`参数的值，保存在`session`中
3. 前端跳转`github`，然后跳转回`/auth`路径的时候，后端处理器从`session`拿出前面保存的`url`值，从`/auth`跳转过去

<img :src="$withBase('/react_ssr_return_page.png')" alt="">

按照这个思路我们先去修改登录按钮：
```javascript
// components/layout.jsx
import axios from 'axios' // 1. 引入axios
import { withRouter } from 'next/router' // 2.引入withRouter，可以在组件内拿到router属性

// 7. withRouter将router作为参数传给组件
function MyLayout ({children, user, logout, router}) {
	// 4. 定义handleGotoOAuth事件
	const handleGotoOAuth = useCallback((e)=> {
		e.preventDefault() // 5. 取消a标签的默认行为
		// 8. 请求/prepare-auth并携带当前路由信息
		axios.get(`/prepare-auth?url=${router.asPath}`)
			.then(resp=> {
				if(resp.status === 200) {
					// 9. 请求/prepare-auth成功后github授权
					location.href = publicRuntimeConfig.OAUTH_URL
				} else {
					console.log('prepare auth failed', resp)
				}
			})
			.catch(err=> {
				console.log('prepare auth failed', err)
			})
	},[])

	return (
		<Layout>
			<Header>
				<Container renderer={<div className="header-inner" />}>
					<div className="header-right">
						<div className="user">
							{
								user && user.id ? (
									...
								) : (
									<Tooltip title="登录">
										{/*3. 给a标签添加点击事件handleGotoOAuth*/}
										<a href={publicRuntimeConfig.OAUTH_URL} onClick={handleGotoOAuth}>
											<Avatar size={40} icon="user"/>
										</a>
									</Tooltip>
								)
							}
						</div>
					</div>
				</Container>
			</Header>
		</Layout>
	)
}

// 6. withRouter包裹组件，组件能拿到路由信息router
export default connect(mapStateToProps,mapDispatchToProps)(withRouter(MyLayout))
```
然后我们需要在后端做两件事，就是书写`/prepare-auth`的处理器，并在`/auth`的处理器中最终跳转回去：
```javascript
// server/auth.js
module.exports = (server) => {
  server.use( async (ctx, next)=> {
		if(ctx.path === '/auth') {
			...
      if(result.status === 200 &&(result.data && !result.data.error)) {
				// ctx.redirect('/')
				// 3. 等授权完毕，如果session.urlBeforeOAuth有值，就从/auth跳转到session.urlBeforeOAuth的值当中去
        ctx.redirect((ctx.session && ctx.session.urlBeforeOAuth) || '/')
				// 4. 清除session.urlBeforeOAuth
				ctx.session.urlBeforeOAuth = ''
      }
  })

	// 1. 创建/prepare-auth的路由处理器
  server.use( async (ctx, next)=> {
    const path = ctx.path
    const method = ctx.method
    if(path === '/prepare-auth' && method === 'GET') {
      const { url } = ctx.query
      ctx.session.urlBeforeOAuth = url // 2. 将路由信息保存在session.urlBeforeOAuth中
      ctx.body = 'ready'
    } else {
      await next()
    }
  })
}
```

那其实通过上面的这几步，我们已经实现了我们最开始的需求，但是可以更简单一点，因为`/prepare-auth`是个`GET`请求，所以可以直接将`a`标签的连接修改一下，在`/prepare-auth`
```javascript
// components/layout.jsx
{/*<a href={publicRuntimeConfig.OAUTH_URL} onClick={handleGotoOAuth}>*/}
<a href={`/prepare-auth?url=${router.asPath}`}>
		<Avatar size={40} icon="user"/>
	</a>
```
```javascript
// server/auth.js
if(path === '/prepare-auth' && method === 'GET') {
	const { url } = ctx.query
	ctx.session.urlBeforeOAuth = url
	// ctx.body = 'ready'
	ctx.redirect(config.OAUTH_URL)
}
```
如果这样改了，就要修改一下`config.js`和`next.config.js`，因为`github`的授权网址我们一开始是在`next.config.js`配的，服务端`koa`中是拿不到的，下面代码直接复制就好了，只是调整了一下两个文件中部分变量的位置而已:
```javascript
// config.js
// github授权链接
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize'
// 定义权限(当前只需要user，后续可以写成'user,repo,gits')
const SCOPE = 'user'
const client_id = 'bc3225e59db1965fbeb4'

module.exports = {
	github: {
		request_token_url: 'https://github.com/login/oauth/access_token',
		client_id,
		client_secret: 'a2e086590fc4233f71bcf069d6d89818bc23185a'
	},
	GITHUB_OAUTH_URL,
	OAUTH_URL: `${GITHUB_OAUTH_URL}?client_id=${client_id}&scope=${SCOPE}`
}
```
```javascript
// next.config.js
const withCss = require('@zeit/next-css')
const config = require('./config.js')

if (typeof require !== 'undefined') {
	require.extensions['.css'] = file => {}
}

module.exports = withCss({
	// 在这里写所有的配置项
	publicRuntimeConfig: {
		GITHUB_OAUTH_URL:config.GITHUB_OAUTH_URL,
		OAUTH_URL: config.OAUTH_URL
	}
})
```

## 全局页面切换的loading效果
首先我们需要去一个遮罩层，在遮罩层上面有转动动画的组件，我们创建一个`PageLoading.jsx`：
```javascript
// components/PageLoading.jsx
import { Spin } from 'antd'

export default () => (
	<div className="root">
		<Spin />
		<style jsx>{`
			.root {
				position: fixed;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				background: rgba(255,255,255,0.3);
				z-index: 10001;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		`}</style>
	</div>
)
```
讲一下`css`样式：`position: fixed;`是相对于浏览器屏幕进行绝对定位，`	left: 0;right: 0;top: 0;bottom: 0;`实际上是让遮罩层和屏幕一样大，`z-index: 10001;`是设置z轴优先级，让遮罩层悬浮，`display: flex;align-items: center;justify-content: center;`是让`Spin`组件居中显示。

然后我们的思路是通过在`_app.js`当中去监听路由的钩子函数，去控制`PageLoading`组件的显示与否：
```javascript
// pages/_app.js
import PageLoading from '../components/PageLoading' // 1、引入PageLoading组件
import Router from 'next/router' // 2. 引入Router

class MyApp extends App {
	state = {
		loading: false // 3. 设置控制遮罩层的显示的state
	}

	// 4. this.startLoading控制遮罩层显示
	startLoading = () => {
		this.setState({
			loading: true
		})
	}
	// 5. this.stopLoading控制遮罩层消失
	stopLoading = () => {
		this.setState({
			loading: false
		})
	}

	// 6. 添加监听函数
	componentDidMount() {
		// 7. 在路由跳转前启动loading动画
		Router.events.on('routeChangeStart',this.startLoading)
		// 8. 在路由跳转后和路由跳转错误时关闭loading动画
		Router.events.on('routeChangeComplete',this.stopLoading)
		Router.events.on('routeChangeError',this.stopLoading)
	}
	// 9. 组件卸载的时候卸载对路由的监听
	componentWillUnmount() {
		Router.events.off('routeChangeStart',this.startLoading)
		Router.events.off('routeChangeComplete',this.stopLoading)
		Router.events.off('routeChangeError',this.stopLoading)
	}


	render(){
		return (
			<Container>
				<Provider store={reduxStore}>
					{/* 10. 根据state的值去控制loading动画的显示与否*/}
					{this.state.loading? <PageLoading />: null}
					<Layout>
							<Component {...pageProps}/>
					</Layout>
				</Provider>
			</Container>
		)
	}
}

export default testHoc(MyApp)
```
这样就完成了全局对路由跳转的时候动画的控制，可以直接复制下面的代码去测试一下：
```javascript
// pages/index.js
import Link from 'next/link'
function Index() {
	return (
		<Link href="/detail">
			<a>Index</a>
		</Link>
	)
}
Index.getInitialProps = () => {
	return new Promise(resolve => {
		setTimeout(()=> {
			resolve({})
		},1000)
	})
}
export default Index
```
```javascript
// pages/detail.js
import Link from 'next/link'
function Detail() {
	return (
		<Link href="/">
			<a>Detail</a>
		</Link>
	)
}
Detail.getInitialProps = () => {
	return new Promise(resolve => {
		setTimeout(()=> {
			resolve({})
		},2000)
	})
}
export default Detail
```

