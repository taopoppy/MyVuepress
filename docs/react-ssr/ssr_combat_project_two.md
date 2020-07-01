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

## 获取数据

## 自定义

### 1. App自定义

### 2. Document自定义

### 3. 样式自定义

### 4. 继承styled-components

## 异步和组件加载

## 配置项

## nextjs渲染流程