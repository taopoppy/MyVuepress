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

## 维持OAuth之前页面访问