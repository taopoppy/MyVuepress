# Webpackdevserver

## Webpackdevserver请求转发
### 1. 开发环境的配置
我们在前端会经常写这样的`Ajax`的请求：比如这样：
```javascript
import React, { Component } from 'react'
import ReactDom from 'react-dom'
import axios from 'axios'

class App extends Component {
	componentDidMount() {
		axios.get('http://www.dell-lee.com/react/api/header.json')
			.then((res) => {
				console.log(res)
			})
	}
	render() {
		return <div>hello world</div>
	}
} 

ReactDom.render(<App />, document.getElementById('root'))
```
但实际上这样写会有问题，因为我们开发环境和生产环境请求的接口一般域名是不一样的，或者说`ip`不一样，但是按照上面这样的写法，就把请求接口写死了，<font color=#DD1144>所以我们通常在前端写这种Ajax请求不会写上面这种绝对路径的接口地址，而是会写相对路径的接口地址</font>

<font color=#1E90FF>**① 接口转发**</font>

所以我们在请求的时候经常这样写：
```javascript
axios.get('/react/api/header.json')
```
然后在`webpack.dev.js`中配置`devServer`中的代理功能：
```javascript
const devConfig = {
  devServer: {
    proxy: {
      '/react/api': 'http://www.dell-lee.com'
    },
  },
}
```
这样配置之后，<font color=#1E90FF>我们请求的实际上是localhost:8080/react/api/header.json,但是通过webpack中的devServer的代理，就请求到了http://www.dell-lee.com/react/api/header.json</font>

<font color=#1E90FF>**② 接口替换**</font>

还有一种情况就是说在后端的某些接口没有数据，但是会有一些临时的接口给你，但是路径不一样，比如`/react/api/header.json`这个接口没有数据，但是`/react/api/demo.json`当中有数据，我们就可以这样配置：
```javascript
// webpack.dev.js
const devConfig = {
  devServer: {
    proxy: {
      '/react/api': {
        target: 'http://www.dell-lee.com',
        pathRewrite: {
          'header.json': 'demo.json'
        }
      }
    },
  },
}
```
上面的配置的意思就是：<font color=#1E90FF>你访问/react/api下的资源我依然给你代理到http://www.dell-lee.com上去，但是通过pathRewrite设置一些规则，我们将header.json替换为demo.js</font>,也就是说你在业务中访问的是`localhost:8080/react/api/header.json`，但是通过上述配置，你实际访问的是`http://www.dell-lee.com/react/api/demo.js`。

这样配置的好处是在业务中的代码和请求路径你不用改，也不会因为修改了路径后因为后端接口地址发生变化又导致项目上线后发生错误。

### 2. 生产环境的配置
那当然了，我们刚才都是在开发环境下的配置，正式上线的代码中就没有`devServer`了，连`webpack`都没有，所以正式环境中的代码你写的时候就写好就完事了。<font color=#1E90FF>以笔者的经验，如果想一劳永逸，那就使用环境变量，然后根据环境变量去判断请求，比如下载了cross-env这个包</font>,
```javascript
npm install cross-env -D
```

然后修改`package.json`当中的启动项：
```javascript
// package.json
{
  "scripts": {
    "start": "http-server dist",
    "dev": "cross-env NODE_ENV=development webpack-dev-server --config ./build/webpack.dev.js",
    "build": "cross-env NODE_ENV=production webpack --config ./build/webpack.prod.js"
  },
}
```
因为在这里配置了`process.env.NODE_ENV`，只能在`webpack`的相关的几个配置文件中使用，我们要想让业务代码中也能使用`process.env.NODE_ENV`，我们要在`webpack.common.js`当中通过`webpack.DefinePlugin`这个插件去配置一下（这个操作我们也在vue服务端渲染原理的时候讲过）: 
```javascript
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: process.env.NODE_ENV === 'development'? '"development"' : '"production"'
      }
    }),
  ]
}
```
然后在业务代码中直接这样写：
```javascript
// index.js
class App extends Component {
	componentDidMount() {
		axios.get(process.env.NODE_ENV === 'development'?'/react/api/header.json': 'http://www.dell-lee.com/react/api/header.json')
			.then((res) => {
				console.log(process.env.NODE_ENV)
				console.log(res)
			})
	}
	render() {
		return <div>hello world</div>
	}
} 
ReactDom.render(<App />, document.getElementById('root'))
```
这样写虽然看上去有点麻烦，但是无论开发或者生产，业务代码都不用改。还能把`process.env.NODE_ENV`提到最前面，让代码看上去更简练。



## Webpackdevserver单页路由
我们写三个文件，展示一下单页路由的实现：首先我们要去下载插件：
```javascript
npm install react-router-dom --save
```
然后编写一下`react`的代码：
```javascript
// index.js
import React, { Component } from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Route} from 'react-router-dom'
import Home from './home.js'
import List from './list.js'

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<div>
					<Route path='/' exact component={Home}></Route>
					<Route path='/list' component={List}></Route>
				</div>
			</BrowserRouter>
		)
	}
} 
ReactDom.render(<App />, document.getElementById('root'))
```
```javascript
// list.js
import React, { Component } from 'react'
class List extends Component {
	render() {
		return <div>ListPage</div>
	}
}
export default List
```
```javascript
// home.js
import React, { Component } from 'react'
class Home extends Component {
	render() {
		return <div>HomePage</div>
	}
} 
export default Home
```
然后我们在`webpack.dev.js`中配置一个关键的属性：<font color=#DD1144>historyApiFallback</font>
```javascript
// webpack.dev.js
const devConfig = {
  devServer: {
    historyApiFallback: true,
  },
}

```
这样之后我们启动项目`npm run dev`，然后输入`localhost:8080`就能显示出`Home`组件中的内容，然后输入`localhost:8080/list`就能显示出`List`组件中的内容。那么这样配置的背后的原理是什么？

<font color=#DD1144>因为单页应用只有index.html这一个页面，所以所有的请求地址都会帮你转发到index.html，也就是说你访问根路径'/'或者访问'/list'进到的页面都是index.html,只不过因为index.js当中会根据当前路径的不同会去加载不同的组件到当前的index.html中，所以才有的单页的效果。这就是historyApiFallback: true的作用，它等价于下面的写法：</font>  
```javascript
// webpack.dev.js
module.exports = {
	devServer: {
		historyApiFallback: {
			rewrites: [{
				from: /\.*\/,
				to: '/index.html'
			}]
		}
	}
}
```
这样你就明确的知道了<font color=#1E90FF>historyApiFallback</font>这个属性配置的作用了，当然了`historyApiFallback`还能配置的东西有好多，如果你感兴趣，你可以到官网上去看看。因为这里的配置底层应用了<font color=#1E90FF>connect-history-api-fallback</font>这个第三方包，所以至于怎么配置也可以到这个包的`github`上查看。

**参考资料**

1. [https://www.webpackjs.com/configuration/dev-server/#devserver-proxy](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)
2. [https://www.webpackjs.com/configuration/dev-server/#devserver-historyapifallback](https://www.webpackjs.com/configuration/dev-server/#devserver-historyapifallback)
3. [https://github.com/bripkens/connect-history-api-fallback](https://github.com/bripkens/connect-history-api-fallback)
