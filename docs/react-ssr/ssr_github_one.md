# 项目整体设计

## 页面整体布局Layout组件
我们重新创建一个`pages`文件夹，将原来的修改为`pages-test`，然后创建`pages/_app.js`和`pages/index.js`，其中`pages/_app.js`是复用了之前的一部分代码：
```javascript
// pages/_app.js
import App, { Container } from 'next/app'
import Head from 'next/head'
import 'antd/dist/antd.css'
import Layout from '../components/layout'
import { Provider } from 'react-redux'
import testHoc from '../lib/with-redux.js'

class MyApp extends App {

	static async getInitialProps(ctx) {
		const { Component } = ctx
		let pageProps
		if(Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx)
		}
		return {
			pageProps
		}
	}

	render(){
		const { Component, pageProps,reduxStore } = this.props
		return (
			<Container>
				<Head>
					<title>Taopoppy</title>
				</Head>
				<Layout>
					<Provider store={reduxStore}>
						<Component {...pageProps}/>
					</Provider>
				</Layout>
			</Container>
		)
	}
}

export default testHoc(MyApp)
```
然后我们去修改关于之前我们写的`layout`布局代码：
```javascript
// components/layout.jsx
import { useState, useCallback } from 'react'
import { Layout, Icon, Input, Avatar } from 'antd'

const {Header, Content, Footer} = Layout

// 4. 顶部导航栏github的图标的样式，写在组件外部，始终是一个对象，不会造成样式的重新渲染
const githubIconStyle = {
	color: 'white',
	fontSize: 40,
	display: 'block',
	paddingTop: 10,
	marginRight: 20
}

// 6. 底部导航栏的样式
const footerStyle = {
	textAlign: 'center'
}



export default ({children}) => {
	const [search, setSearch] = useState('')

	const handleSearchChange = useCallback((event)=> {
		setSearch(event.target.value)
	}, [setSearch])

	const handleOnSearch = useCallback(() => {}, [])

	return (
		<Layout>
			<Header>
				<div className="header-inner">
					<div className="header-left">
						<div className="logo">
							<Icon type="github" style={githubIconStyle}></Icon> {/* 3. Icon因为是从头到尾都不会样式变化，所以样式我们写在外部一个固定的对象上*/}
						</div>
						<div>
							<Input.Search
								placeholder="搜索仓库"
								value={search}
								onChange={handleSearchChange} // 1. 输入框输入数据变化
								onSearch={handleOnSearch} // 2. 输入框敲回车键，或者输入框中的放大镜按钮
							></Input.Search>
						</div>
					</div>
					<div className="header-right">
						<div className="user">
							<Avatar size={40} icon="user"/>
						</div>
					</div>
				</div>
			</Header>
			<Content>{children}</Content>
			<Footer style={footerStyle}> {/* 5. 底部的样式也是如此*/}
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
```
要注意的我们这里使用的是`jsx`的`css-in-js`的方案，这种写法如果你在`vscode`当中可以下载一个<font color=#9400D3>vscode-styled-jsxx</font>插件，它可以把这种字符串的样式显示成为`css`的样式，会更好看，也不如意我们写错。我们可以看一下最终的显示效果：

<img :src="$withBase('/react_ssr_github_index.png')" alt="布局">

## cloneElement扩展组件
接下来我们说一个小技巧，对有强迫症的同学十分友好，并且对削减页面上的标签数量也有用处，我们首先来创建`components/Container.jsx`文件：
```javascript
// components/Container.jsx
import { cloneElement } from 'react'

const style = {
	width: '100%',
	maxWidth: 1200,
	marginLeft: 'auto',
	marginRight: 'auto',
	paddingLeft: 20,
	paddingRight: 20
}

// 1. renderer属性默认值是div组件
export default ({children,renderer=<div /> }) => {
	const newElement = cloneElement(renderer, {
		style: Object.assign({}, renderer.props.style, style), // 2. 将renderer属性中的组件的style和这里的style合并
		children
	})
	return newElement
}
```
首先我们先说一下`style`样式的作用，它的作用是当屏幕小于1200px的时候，是充满显示的，当大于1200px,是居中显示，并且两边会均匀的拉开。然后我们到`components/layout.jsx`中去添加一些代码：
```javascript
// 1. 创建一个临时的组件
const Comp = ({color, children ,style}) => <div style={{color, ...style}}>{children}</div>

export default ({children}) => {
	return (
		<Layout>
			<Header>
				<Container renderer={<div className="header-inner" />}> {/* 3.使用Container去改写，使其和Content中的内容保持同样的宽度和变化*/}
					<div className="header-left">
						...
					</div>
				</Container>
			</Header>
			<Content>
				<Container renderer={<Comp color="red" />}> {/* 2. 将组件作为renderer参数传入Container组件中*/}
					{children}
				</Container>
			</Content>
			<Footer style={footerStyle}>...</Footer>
		</Layout>
	)
}
```
我们来说一下效果：<font color=#DD1144>效果就是整个Container组件以及自组件渲染出来的东西，将是一个Comp组件渲染出来的效果。或者说传入Container组件renderer属性的是一个什么组件，组件就以什么组件来包裹children，并且传入renderer属性的这个组件上的属性也有效</font>，所以整个`Container`组件最终展示到页面的就是：`<div style="color: red; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto;">{children}</div>`，因为`Comp`本质是`div`么，另外，`style`样式和我们单独写在`Comp`组件上的`color`样式都生效了。

所以这样说来，传入`renderer`属性的组件可以是一个自己自定义的组件，比如上述代码`Comp`就是我们自己定义的组件，也可以是一个普通的`html`标签，比如下面这样，那最终的效果就是`<span style="color: red; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto;">{children}</span>`，当然我们一般不会用`span`来包裹，这里只是举个例子。
```javascript
<Content>
	<Container renderer={<span color="red" />}>
		{children}
	</Container>
</Content>
```

那么接下来我们就要说说这个`cloneElement`是什么作用了：
+ <font color=#9400D3>首先传入renderer属性的是一个jsx对象，一个jsx对象，我们知道最终通过React.CreateElement方法获得都是一个Element的对象</font>。
+ <font color=#9400D3>而cloneElement(renderer, {style,children})的意思就是克隆renderer这个Element对象，并且在克隆的副本上添加style和children属性，所以获得副本将是对原来Element的一个扩展</font>
+ <font color=#DD1144>所以cloneElement是一个可以轻松帮助我们扩展节点的方法</font>


## SSR同步用户信息