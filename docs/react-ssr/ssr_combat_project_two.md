# nextjs的基本使用

## 目录结构
在`next`项目当中，`Pages`目录是特别重要的一个目录，<font color=#DD1144>这里面所有的文件都会对应于一个页面，next为我们生成的路由的配置是根据pages文件夹下面的文件目录来产生的</font>，其中的`index.js`文件是默认的访问根路径的页面，也就是说访问`localhost:3000/`和`localhost:3000/index`都访问的是这个页面。还比如访问`localhost:3000/a`这个路径实际上访问的就是项目当中`pages/a.js`当中的内容，还比如访问`localhost:3000/text/b`，实际上访问的就是`pages`文件夹中的`text`文件夹中的`b.js`文件中的内容

但是也有例外，`pages/_app.js`和`pages/_document.js`这两个文件是个例外，这两个文件我们在后面再具体解释它的含义的作用。我们来解释一下项目中其他文件夹的作用：
+ <font color=#9400D3>components</font>：存放公用性的组件
+ <font color=#9400D3>lib</font>：存放其他非组件性的公用性代码，比如一些工具代码，类库代码
+ <font color=#9400D3>static</font>：存放静态资源代码

上面这些我们自己创建的文件夹的名称都可以自定义，因为在`pages`中的`js`文件使用他们都是通过相对路径的方式去引入的，所以比较灵活。还有一些其他的文件：

+ <font color=#9400D3>.next</font>：`next.js`框架自己生成的文件夹，启动服务后`next`编译后的东西都会放在这里，实际上在生产环境的时候也是通过`next build`生成这样一个`.next`的文件夹，通过里面的东西提供服务和页面显示，是根据你自己书写的代码实时改变的，所以我们不应该随便修改它。

## 路由相关
### 1. 页面跳转
<font color=#1E90FF>**① Link组件**</font>

如何进行页面跳转呢，需要使用到`next`提供给我们的一个<font color=#DD1144>Link</font>组件:
```javascript
// pages/index.js
import Link from 'next/link' // 1. 引入Link组件

import { Button } from 'antd'
export default () => (
	<Link href='/a'>
		<Button>index</Button> {/*2. 使用Link组件，Link本身不渲染任何东西*/}
	</Link>
)
```
+ <font color=#DD1144>next当中的页面跳转是没有浏览器重新加载页面的过程的，而是前端跳转</font>
+ <font color=#DD1144>next提供的Link标签本身是不渲染任何内容的，并不是a标签的封装，所以需要制定渲染内容，它自己只负责监听渲染内容的点击事件而已，凡是可以接收onClick事件的组件都可以作为渲染内容传入Link</font>
+ <font color=#DD1144>Link标签只能接受一个根节点内容</font>

<font color=#1E90FF>**② Router模块**</font>

还有一种方式是通过`Router`模块去跳转，<font color=#DD1144>实际上Link的本质也是Router模块方法的封装，隐藏了一些方法的调用，让开发者更方便的使用而已</font>：
```javascript
// pages/index.js
import Link from 'next/link'
import Router from 'next/router' // 1. 引入Router模块

import { Button } from 'antd'
export default () => {
	function gotoTestB() {
		Router.push('/test/b') // 2. 使用Router.push进行路由的跳转
	}

	return (
		<>
			<Link href='/a'>
				<Button>index</Button>
			</Link>
			<Button onClick={gotoTestB}>text b</Button>
		</>
	)
}
```
### 2. 动态路由
在路由跳转的时候，有的时候我们是希望携带一些信息过去的，页面上的信息可以根据路由上携带的信息动态的显示的，所以是动态路由，<font color=#1E90FF>而在next当中想实现路由的信息附带是只能通过query的，而不能像react-router当中可以在路由当中定义params的的。因为next当中的路由实际上是根据pages当中的文件结构生成的，所以无法做到/:id这种parmas形式的路由</font>

```javascript
// pages/index.js
import Link from 'next/link'
import Router from 'next/router'

import { Button } from 'antd'
export default () => {
	function gotoTestB(id) {
		if(id === 'b') Router.push('/test/b?id=b')  // 字符串形式的路由:localhost:3000/test/b?id=b
		if(id === 'c') {
			Router.push({   // 对象形式的路由:localhost:3000/test/b?id=c
				pathname: '/test/b',
				query: {
					id: 'c'
				}
			})
		}
	}

	return (
		<>
			<Link href='/a?id=a'>
				<Button>index</Button>{/*可以直接在Link当中书写完整的路径 */}
			</Link>
			<Button onClick={() => gotoTestB('b')}>text b</Button>
			<Button onClick={() => gotoTestB('c')}>text c</Button>
		</>
	)
}
```
那么跳转的时候携带了信息，到了被跳转的页面中，怎么拿到前页面携带来的信息呢?
```javascript
// pages/a.js
import { withRouter} from 'next/router' // 1. 引入withRouer

const A = ({ router }) => <span> A { router.query.id}</span> // 3. 拿到路由参数并使用

export default withRouter(A) // 2. 用withRouter来给组件导入路由参数
```

### 3. 路由映射
什么是路由映射呢？按照`react`当中的`params`定义的路由，我们定义路由为`localhost:3000/a/:id`，具体访问就是`localhost：3000/a/1`或者`localhost：3000/a/4`这种，但是在`next`当中是无法定义这种`params`的路由的，它显示的就是`query`形式的路由，比如`localhost:3000/a?id=1`，这种不太好看，<font color=#1E90FF>所以我们需要路由映射将next中的localhost:3000/a?id=1映射成为localhost:3000/a/1</font>
```javascript
// pages/index.js
import Link from 'next/link'
import Router from 'next/router'

import { Button } from 'antd'
export default () => {
	function gotoTestB(id) {
		if(id === '2') Router.push('/test/b?id=2','test/b/2') // Router(String): 给push添加第二个参数
		if(id === '3') {
			Router.push({   // Router(Object)：给push添加第二个参数
				pathname: '/test/b',
				query: {
					id
				}
			},'/text/b/3')
		}
	}

	return (
		<>
			<Link href='/a?id=1' as="/a/1" title='AAA'>{/* Link： 通过as属性定义在映射关系，访问的实际上是/a?id=1,映射在浏览器中就显示/a/1 */}
				<Button>index</Button>
			</Link>
			<Button onClick={() => gotoTestB('2')}>text b</Button>
			<Button onClick={() => gotoTestB('3')}>text c</Button>
		</>
	)
}
```
可以看到，通过路由映射，我们在浏览器中路由跳转就能跳转到`localhost:3000/a/1`或者`localhost:3000/test/b/2`，但是有个很大的问题：<font color=#DD1144>当我们从localhost:3000跳转到localhost:3000/a/1是没有问题的，但是在后者页面中刷新页面，页面就变成了404，原因是在页面跳转过程中，走的前端渲染的路线，前端路由做好了映射关系，但是重新刷新localhost:3000/a/1，就走了服务端渲染的路线，会重新请求服务端，而在服务端next当中pages不存在a文件夹，也不存在1.js，从而也就访问不到a/1这个路径的页面</font>

<font color=#9400D3>说白了，终究原因就是服务端渲染只发生在第一次访问页面，所以我们需要在路由映射的情况下处理404的问题，然而next当中确实没有pages/a/1这个文件存在，那么localhost:3000/a/1这个请求发过来怎么处理？好在next是作为koa的中间件使用的，next处理不了，我们可以在koa当中处理</font>

处理的思路是什么呢？实际上想服务器请求`localhost:3000/a/1`实际上还是想访问`localhost:3000/a?id=1`，所以进入服务器的时候，通过`koa`定义的`/a/:id`路由拦截到这个请求，拿到`id`，然后重新用`next`处理`/a?id=1`这个请求即可：
```javascript
// server.js
const Koa = require('koa')
const next = require('next')
const Router = require('koa-router')
const dev = process.env.NODE_ENV !== 'production'

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(()=> {
	const server = new Koa()
	const router = new Router() // 1. 定义路由

	router.get('/a/:id', async (ctx) => {  // 2. 路由定义/a/:id匹配请求
		const id = ctx.params.id
		await handle(ctx.req, ctx.res, { // 3. 重新用next处理/a?id=1的请求
			pathname: '/a',
			query: {
				id
			}
		})
		ctx.respond = false
	})

	server.use(router.routes()) // 4. koa中间件使用koa-router

	server.use(async (ctx, next) => {
		await handle(ctx.req, ctx.res)
		ctx.respond = false
	})

	server.listen(3000, ()=> {
		console.log("koa server listening on 3000")
	})
})
```
至于`ctx.respond=false`，是为了绕过`Koa`的内置`response`处理，想要写入原始的`res` 对象而不是让`Koa`处理你的`response`,<font color=#1E90FF>说白了从始至终都是node中的ctx.res和ctx.req，而不适用koa当中自己的ctx.response和ctx.request</font>，如果有问题，可以到[koa官网](https://koa.bootcss.com/)上查看`ctx.res`和`ctx.response`的区别，以及`ctx.req`和`ctx.request`

### 4. 路由变化的钩子
什么是`router`的钩子呢? <font color=#1E90FF>在router变化的时候，在变化的前中后都会触发一下不同的事件，通过监听事件我们可以做很多事情</font>，我们在`pages/index.js`当中添加下面的代码：
```javascript
// 路由的6个钩子
const events = [
	'routeChangeStart',
	'routeChangeComplete',
	'routeChangeError',
	'beforeHistoryChange',
	'hashChangeStart',
	'hashChangeComplete'
]

function makeEvent(type) {
	return (...args) => {
		console.log(type, ...args)
	}
}

events.forEach(event => {
	Router.events.on(event, makeEvent(event))
})
```
在正常的路由跳转都会执行三个路由的钩子：<font color=#9400D3>routeChangeStart</font>、<font color=#9400D3>beforeHistoryChange</font>、<font color=#9400D3>routeChangeComplete</font>，接收的参数也都只有一个，就是新的路由路径，比如从`localhost:3000`跳转到`localhost:3000/a/1`，则这些钩子函数能接受到的参数就是`/a/1`。

而`routeChangeError`一般是在路由发生错误的时候触发，这个一般也不常用，而哈希路由变化的时候会触发两个钩子，分别是<font color=#9400D3>hashChangeStart</font>、<font color=#9400D3>hashChangeComplete</font>
```javascript
// pages/a.js
import { withRouter} from 'next/router'
import Link from 'next/link'

const A = ({ router }) => <div>
	<Link href="#AAA"><a> AAA {router.query.id}</a></Link>
	<Link href="#BBB"><a> BBB {router.query.id}</a></Link>
</div>

export default withRouter(A)
```
可以看到，哈希实际上是在一个页面用来定位的，当我们点击上面的`Link`标签，就会打印出`hashChangeStart`和`hashChangeComplete`。

## 获取数据
接下来我们来学习一下获取数据，<font color=#DD1144>getInitialProps</font>方法，<font color=#9400D3>getInitialProps方式是挂载在组件上的一个静态的方法，能够帮助我们完成数据获取的工作，我们可以在进入到某个页面中的时候提前通过这个方法获取数据，同时也可以在App当中获取全局的数据</font>

这个方法为什么这么重要，<font color=#DD1144>因为这个方法可以完成客户端和服务端之间数据的同步，这个功能实际上是整个服务端渲染技术当中最大的痛点之一。</font>

所以这个方法实际上是`nextjs`的数据获取规范，我们应该按照规范把数据获取的代码写在这里面。另外`nextjs`还有很多规范在里面，如果你发现按照规范你无法实现你的功能，你可能就要思考换别的框架了，毕竟`nextjs`在众多规范下使用确实比较狭隘。
```javascript
// pages/a.js
import { withRouter} from 'next/router'
import Link from 'next/link'

const A = ({ router,name }) => <div>
	<Link href="#AAA"><a> AAA {router.query.id}</a></Link>
	<Link href="#BBB"><a> BBB {name}</a></Link>
</div>

// 给组件定义getInitialProps方法
A.getInitialProps = async () => {
	const promise = new Promise((resolve)=> {
		setTimeout(()=>{
			resolve({
				name: 'Jokcy'
			})
		},1000)
	})

	return await promise
}


export default withRouter(A)
```
+ <font color=#DD1144>首先要注意的就是getInitialProps方法返回的内容都会作为A组件的props被传入进A组件，可以看到在上述代码当中返回的是一个对象，对象中有name属性，在A中就会拿到name属性</font>

+ <font color=#DD1144>给组件定义getInitialProps方法这种行为只能在pages文件夹中的组件中出现，因为nextjs对pages文件夹下的文件有特殊的路由处理，而在其他文件夹，比如components下的公用组件中定义getInitialProps方法就没啥用</font>

+ <font color=#DD1144>这个方法在服务端和客户端都会执行，当然都会执行的意思是如果当前页面是客户端渲染（通过前端路由跳转进入），那就会在客户端执行了一次。如果是服务端渲染（刷新当前页面），那么在服务端执行一次，在客户端不会执行，会直接复用服务端的数据，所以这也是客户端和服务端数据能够同步的关键。</font>

+ <font color=#1E90FF>另外我们还能获取App全局的数据，这个是什么意思呢，就是在pages/_app.js当中获取，这个文件是个顶层app的组件，所有在pages当中的其他组件都要调用它，至于到底怎么使用我们在下面的自定义app当中会详细介绍</font>

## 自定义

### 1. App自定义
我们在`pages`当中创建一个`_app.js`文件能够覆盖`next`当中的默认的`app.js`文件。那么这个`_app.js`有哪些作用呢？

+ <font color=#9400D3>固定Layout</font>：如果所有页面都有相同的东西或者布局，我们可以在这里进行处理
+ <font color=#9400D3>保持一些公用的状态</font>：使用`redux`的时候，关于初始化和一些数据的处理我们会在`_app.js`当中进行
+ <font color=#9400D3>给页面传入自定义数据</font>：页面在切换的时候都可以给页面传入一些想要传递的数据
+ <font color=#9400D3>自定义错误处理</font>：错误处理的代码也可以在这里书写

<font color=#1E90FF>**① 自定义数据和状态**</font>

我们最开始写的`_app.js`内容如下：
```javascript
// pages/_app.js
import App from 'next/app'
import 'antd/dist/antd.css'

export default App
```
这种写法基本上就是啥作用都没有，和`next.js`当中默认的`app.js`是一模一样的，所以如果我们要自定义的话，就不能直接导出`App`，而要换新的写法：
```javascript
// pages/_app.js
import App, { Container } from 'next/app'
import 'antd/dist/antd.css'

class MyApp extends App {

	static async getInitialProps({Component}) {
		// 1. MyApp.getInitialProps中能通过Component拿到具体要渲染页面的getInitialProps方法
		// 2. 执行具体页面的getInitialProps方法，拿到数据，将数据传入给render当中要渲染的具体页面
		let pageProps
		if(Component.getInitialProps) {
			pageProps = await Component.getInitialProps()
		}
		return {
			pageProps
		}
	}

	// 重新定义render方法
	render(){
		const { Component, pageProps } = this.props // 3. Component实际就是要渲染的页面

		return(
			<Container>
				<Component {...pageProps}/> {/* 4. 将数据传入给要渲染的组件或者页面*/}
			</Container>
		)
	}
}

export default MyApp
```
+ <font color=#DD1144>可以看到我们在代码中的注释，我们自定义App必须要走上面的这4步才能正确的渲染出具体的页面</font>
+ <font color=#DD1144>其次，每次页面的切换都会调用MyApp当中的getInitialProps方法</font>

<font color=#1E90FF>**② 自定义布局**</font>

比如我们要在每个页面都定义一个头部，用于导航，我们可以先`components/layout.jsx`:
```javascript
// components/layout.jsx
import Link from 'next/link'
import { Button } from 'antd'

export default ({children}) => (
	<>
		<header>
			<Link href="/a?id=1" as="/a/1">
				<Button>A</Button>
			</Link>
			<Link href="/test/b">
				<Button>B</Button>
			</Link>
		</header>
		{children}
	</>
)
```
接着我们在`pages/_app.js`当中引入即可：
```javascript
// pages/_app.js
import App, { Container } from 'next/app'
import 'antd/dist/antd.css'
import Layout from '../components/layout'  // 1. 引入Layout组件

class MyApp extends App {
	static async getInitialProps({Component}) {
		let pageProps
		if(Component.getInitialProps) {
			pageProps = await Component.getInitialProps()
		}
		return {
			pageProps
		}
	}
	render(){
		const { Component, pageProps } = this.props
		return (
			<Container>
				<Layout>{/* 2. 使用组件*/}
					<Component {...pageProps}/>
				</Layout>
			</Container>
		)
	}
}

export default MyApp
```


### 2. Document自定义

### 3. 样式自定义

### 4. 继承styled-components

## 异步和组件加载

## 配置项

## nextjs渲染流程