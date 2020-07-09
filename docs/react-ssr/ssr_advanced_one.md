# 异常问题解决
## 统一管理params
在我们的项目当中，每个组件当中都有这样的一段请求`axiosInstance.get('/api/translations.json?secret=abcd')`，对于大多数情况来讲，`url`当中的参数是会变动的，比如当`secret`变化的时候，我们需要到所有组件当中去修改这个`abcd`参数值，这个是不划算的，<font color=#1E90FF>我们可以借助axios当中的params来统一管理这些参数</font>

首先创建`src/config.js`文件，然后内容如下：
```javascript
// src/config.js
export default {
	secret: 'abcd'
}
```
然后分别到`src/client/request.js`和`src/server/request.js`当中去给`axios`实例添加参数：
```javascript
// src/client/request.js
import config from '../config'  // 1. 引入配置

const instance = axios.create({
	baseURL: '/',
	params: {             // 2. 添加params参数
		secret: config.secret
	}
})
```
```javascript
// src/server/request.js
import config from '../config'  // 1. 引入配置

const createInstance = (req) => axios.create({
	baseURL: 'http://localhost:4000/ssr',
	headers: {
		coodkie: req.get('cookie') || ''
	},
	params: {              // 2. 添加params参数
		secret: config.secret
	}
})
```
这样的话，在使用当前`axios`实例请求数据的时候，会自动在`url`后面添加`?secret=abcd`这样的参数，也方便我们统一管理`secret`

## 借助context实现404
当我们访问一个不存在的页面的时候，我们希望返回404页面，那么我们首先要去书写一个`404`页面并配置在路由当中：
```javascript
// src/containsers/NotFound/index.js
import React from 'react'

class NotFound extends React.Component {
	render() {
		return <div>404，sorry，page not found</div>
	}
}
export default NotFound
```
```javascript
// src/Routes.js
import NotFound from './containers/NotFound/index' // 1. 引入NotFound组件

export default [{
	path: '/',
	component: App,
	loadData: App.loadData,
	routes: [
		...
		{
			component:NotFound   // 2. 配置到路由当中
		}
	]
}]
```
实际上这样配置完也就没啥大的问题，唯一的问题就是访问一个不存在的页面的时候，<font color=#1E90FF>我们看到的页面是404页面，但是我们得到的响应状态码是200，按正常情况我们对此路径的请求响应也应该是404的状态码</font>，所以这个时候我们就需要用到我们之前在服务端渲染时候用到的<font color=#DD1144>context</font>

我们的思路是：<font color=#9400D3>提前设定一个context，在服务端渲染组件的时候将其传入，在NotFound的页面当中将context中的NOT_FOUND属性设置为true，渲染完html页面后，对context.NOT_FOUND属性做判断，如果是true，说明渲染的是404页面，将返回状态码设置成为404，如果不是，渲染的是普通的页面</font>

```javascript
// src/server/index.js
app.get('*',function (req,res) {
	...

	Promise.all(promises).then(()=> {
		const context = {} // 提前设置context
		const html = render(store,routes,req,context) // 将其传入
		if(context.NOT_FOUND) {// 渲染完html后如果context.NOT_FOUND为true，则渲染的是404 页面
			res.status(404) // 设置状态码为404
			res.send(html)
		} else {//  渲染完html后如果context.NOT_FOUND为false，则渲染的是普通页面
			res.send(html)
		}
	})
})
```
```javascript
// src/server/utils.js
export const render = (store,routes,req,context) => { // 1. 接收context
		const content = renderToString((
			<Provider store={store}>
				<StaticRouter location={req.path} context={context}> {/* 2. 将context传入实际要渲染的组件  */}
					<div>
						{renderRoutes(routes)}
					</div>
				</StaticRouter>
			</Provider>
		))
}
```
```javascript
// src/containers/NotFound/index.js
import React from 'react'

class NotFound extends React.Component {
	componentWillMount() {
		const { staticContext } = this.props // staticContext就是服务端渲染传入的context
		staticContext && (staticContext.NOT_FOUND = true)
		// 上面的代码和下面的代码效果一样
		// if(this.props.staticContext) {
		// 	this.props.staticContext.NOT_FOUND = true
		// }
	}

	render() {
		return <div>404，sorry，page not found</div>
	}
}
export default NotFound
```
这里要注意的是：
+ <font color=#DD1144>我们修改状态码为404是只发生在服务端渲染的时候，也就是你在浏览器直接输入一个不存在的路径，然后服务器会返回404页面和404状态码，一般不会存在你在前端路由跳转到一个404页面的，毕竟开发人员不会这样做，另外即便是从前端路由跳转到404页面也是客户端渲染，会返回404页面，但是不会存在404状态码，因为是客户端渲染，又不会向服务端发请求</font>

+ <font color=#9400D3>另外一个就是为什么在NotFound/index.js当中要将给NOT_FOUND赋值的代码写在componentWillMount当中，实际上写在render当中也可以，但是不能写在componentDidMount当中，因为componentDidMount在服务端是不执行的，所以我们需要将赋值语句写在服务端和客户端都执行的地方，render或者componentWillMount。但是实际上客户端是不执行的这个赋值代码的，因为有判断语句，在服务端的路由中会将context传入组件，最终返回html，客户端重新再次渲染此页面的时候，前端路由BrowserRouter中可没有传入context，所以前端渲染404页面的时候拿不到staticContext。所以需要对staticContext是否存在做必要的判断，区分客户度渲染和服务端渲染</font>

## 服务器301重定向
之前在`translation`页面当中，我们定义的逻辑是：如果进入该页面发现是未处于登录状态的时候，就重定向到首页，在`src/containers/Translation/index.js`当中是这样写的：
```javascript
// src/containers/Translation/index.js
import { Redirect } from 'react-router-dom' // 1. 引入重定向组件

class Translation extends React.Component {
	render() {
		if(this.props.login) {
			...
		}else {
			return <Redirect to='/'/> // 2. 未登录时跳转到首页
		}
	}
}
```
但是有个大的问题就是`Redirect`组件只能针对客户端渲染，什么意思，<font color=#1E90FF>Redirect这个组件在服务端的时候是不起作用的，当我们在未登录的时候去直接访问/translation，服务端依旧返回的是/translation对应的页面，但是为什么我们看到是首页，就是因为客户端重新渲染的时候Redirect组件又起作用了，所以是在客户端帮助我们重定向到了首页，而非服务端重定向到首页返回首页代码</font>

好在`Redirect`这个组件虽然不能直接在服务端发挥作用，但是可以在`context`当中添加一下信息，根据这些信息，我们可以来做重定向，这些信息如下：
```javascript
{
	action:'REPLACE',
	location: { pathname: '/', search: '', hash: '', state: undefined}
	url: '/'
}
```
因为整个操作还是和`context`有关，所以我们还是要到`src/server/index.js`当中去修改代码：
```javascript
// src/server/index.js
app.get('*',function (req,res) {
	...
	Promise.all(promises).then(()=> {
		const context = {}
		const html = render(store,routes,req,context)
		// console.log(context)

		if(context.action === 'REPLACE') { // 服务端重定向
			res.redirect(301, context.url)
		} else if(context.NOT_FOUND) {
			res.status(404)
			res.send(html)
		} else {
			res.send(html)
		}
	})
})
```
按照上面的代码执行程序，我们就能实现服务端的重定向，而不是客户度的重定向。<font color=#1E90FF>另外实际上是使用了StaticRouter这个组件向context当中注入了一些关于重定向的参数，我们才能根据信息做服务端的重定向，这些工作是StaticRouter帮助我们做的</font>

## 请求失败的promise处理
我们原本在`src/server/index.js`当中有这样一段代码：
```javascript
// src/server/index.js
matchedRoutes.forEach(item => {
	if (item.route.loadData) {
		promises.push(item.route.loadData(store))
	}
});

Promise.all(promises).then(()=> {
	...
})
```
我们试着想一个场景，当一个页面需要加载`A`,`B`,`C`,`D`四个组件的时候，每个组件都有自己的`loadData`方法，且在`loadData`方法中都会去向服务器请求数据，但是假如`A`的请求发生了错误，类似于服务器响应出错，或者请求`url`出错，那么`item.route.loadData(store)`返回的就是个要执行`reject`的`Promise`,显然，只要`A`,`B`,`C`,`D`当中有一个组件的请求发生错误，`Promise.all`就不会执行`then`方法。

所以我们的想法是，<font color=#1E90FF>应该让请求无论成功或者失败都能走到Promise.all().then()方法里面，所以我们可以在item.route.loadData(store)外层再包裹一个promise，无论item.route.loadData(store)这个内部的promise成功与否，我们都用外部的promise.resolve方法去处理结果即可，那么无论内部promise是成功或者失败，外层promise总是成功的，总能走到Promise.all().then()方法里面</font>

```javascript
// src/server/index.js
matchedRoutes.forEach(item => {
	if (item.route.loadData) {
		const promise = new Promise((resolve,reject)=> { // 1. 外层套一个promise
			item.route.loadData(store).then(resolve).catch(resolve)
		})
		promises.push(promise) // 2. 将外层promise添加到数组
	}
});

Promise.all(promises).then(()=> {
...
})
```
