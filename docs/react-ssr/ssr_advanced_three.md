# SEO技巧

## SSR和SEO
`SEO`的全称为`Search engine optimization`，中文叫做搜索引擎优化，意思就是：<font color=#1E90FF>通过一些手段让我们的网站在搜索引擎的搜索结果中排名靠前</font>，那么为什么服务端渲染为什么对`SEO`友好呢，因为在搜索引擎爬取网站内容的时候，绝大多数的搜索引擎是不认识`js`渲染出来的东西的，换句话说它们只认识`html`中原有的`DOM`结构。

## Title和Desciption
很多同学会觉得一个网站只要有<font color=#DD1144>Title</font>和<font color=#DD1144>Description</font>就可以做好`SEO`的优化，<font color=#1E90FF>但是实际上，Title和Description对网站的SEO优化的作用并没有想象的那么大，两个html标签的真正作用实际上另有他用</font>

首先来说为什么`Title`和`Description`对`SEO`用处不大？<font color=#DD1144>实际上也不能说两者一点作用都没有，多多少少是有作用的，只不过对于现在的搜索引擎是一个全文搜索引擎，什么意思，就是会将网站所有的内容进行分析，然后得出几个和网站内容相关的关键字，比如你在百度搜索外卖，不一定排名靠前的几个网站的Title和Description当中会有外卖这两个字，搜索引擎是综合判断网站的作用就是订餐，外卖</font>

那么`Title`和`Description`和真正作用是什么呢？首先对于搜索结果来说，结果的标题就是网站的`Title`，标题下面的介绍一般是`Description`，<font color=#DD1144>两者真正的作用是帮助提高网站的转化率，说白了也就是用户点击进入的机会</font>，举个例子来说，搜索`慕课网`这三个关键字，排名第二的是`慕课网-程序员的梦工厂`，排名第三的是`慕课网`，对于用户来说，更愿意点击第二个，因为第二个网站的`Titie`更丰富，介绍更全面，用户也就更愿意点击去看，所以这就提高了网站转换率，<font color=#1E90FF>用户看到了但不愿意点击去看，转换率为0，用户看到了而且点进去看了，转换率为1</font>

## 如何做好SEO
知道了`seo`的一些基础知识后，我们来说说怎么做能让网站的`seo`变的好一些。

首先一个网站无非就是三部分组成；<font color=#9400D3>文字</font>、<font color=#9400D3>多媒体（图片，视频等）</font>、<font color=#9400D3>链接</font>，所以搜索引擎判断一个网站的好坏也无非是这三个方面入手

<font color=#1E90FF>**① 文字**</font>

对于现在自媒体的时代，实际上<font color=#9400D3>原创</font>是一个非常重要的指标，<font color=#DD1144>如果网站有很多自己原创的文字，网站访问量应该会指日可待</font>

<font color=#1E90FF>**② 链接**</font>

<font color=#DD1144>链接的文字和地址如果和本网站的内容有联系，链接的价值就越大，所以链接出去的网站应该尽量和本网站相关</font>

+ 对于内部链接：<font color=#9400D3>提高链接和网站内部的相关性</font>
+ 对于外部链接：<font color=#9400D3>想办法在外部的网站上加入本网站的链接，提高本网站的知名度和影响力</font>

<font color=#1E90FF>**③ 图片**</font>

网站的图片也应该保持原创和高清，这样在其他相同的情况下，有图要比没图好，高清图要比普清图要好。

## React-Helmet的使用
虽然在很多时候，在框架下开发项目，文字图片和链接有时候并不能任意控制，但是我们可以控制`Titie`和`Description`来提高网站转换率，我们下面就来用<font color=#DD1144>React-Helmet</font>来定制网站的`Title`和`Description`

首先我们来安装它:
```javascript
npm install react-helmet@5.2.0 -S
```
然后我们直接到具体的页面去使用：
```javascript
// src/containers/Home/index.js
import React,{Fragment} from 'react'  // 1. 引入Fragment
import { Helmet } from 'react-helmet' // 2. 引入Helmet

class Home extends React.Component {
	render() {
		return (
			<Fragment>
				<Helmet> {/* 3. 在render函数当中直接使用Helmet来定制title和description */}
					<title>这是taopoppy的SSR的home页面-丰富多彩的资讯</title>
					<meta name="description" content="这是taopoppy的SSR的home页面-丰富多彩的资讯" ></meta>
				</Helmet>
				<div className={style.container}>
					{
						this.getHomeList()
					}
				</div>
			</Fragment>
		)
	}
}
```
可是这个第三方组件是只在客户端渲染的时候起作用，对于`SSR`框架来说，我们所做的所有东西都要满足客户度和服务端都能实现，好在`React-Helmet`也提供了服务端的配置，使用起来非常简单，我们直接看一下`github`上的示例：
```javascript
ReactDOMServer.renderToString(<Handler />);
const helmet = Helmet.renderStatic();

const html = `
    <!doctype html>
    <html ${helmet.htmlAttributes.toString()}>
        <head>
            ${helmet.title.toString()}
            ${helmet.meta.toString()}
            ${helmet.link.toString()}
        </head>
        <body ${helmet.bodyAttributes.toString()}>
            <div id="content">
                // React stuff here
            </div>
        </body>
    </html>
`;
```
所以它就是在`renderToString`方法之后生成一个`helmet`常量，然后将其中的`title`和`meta`属性以字符串的方式加入了`html`字符串当中，所以我们直接到`src/server/utils.js`当中去修改代码：
```javascript
// src/server/utils.js
import { Helmet } from 'react-helmet' // 1. 引入Helmet

export const render = (store,routes,req,context) => {
	const content = renderToString((
		...
	))
	const helmet = Helmet.renderStatic();  // 2. 生成helmet对象

	return `
		<html>
			<head>
				${helmet.title.toString()}    // 3. 将helmet.title.toString()加入head标签当中
				${helmet.meta.toString()}			// 4. 将helmet.meta.toString()加入head标签当中
				<style>${cssStr}</style>
			</head>
			<body>
				<div id="root">${content}</div>
				<script>
						window.context = {
							state: ${JSON.stringify(store.getState())}
						}
				</script>
				<script src='/index.js'></script>
			</body>
		</html>
	`
}
```

## 使用预渲染
从文章的开始到现在，我们已经差不多学习完毕了，能明显的就是使用这种服务端渲染确实非常麻烦而且难搞，难搞并不是单纯的框架变的复杂，很多时候要考虑客户端和服务端两种情况，而且在出错的时候你有时候很难知道到底是客户端还是服务端出现了问题，所以有没有在不使用这种复杂的框架的情况下也能做好`SEO`呢？我们来说一下<font color=#DD1144>预渲染来实现普通react框架的seo优化</font>

`prerender`这个框架是用来在现有`react`项目之外给这个项目做服务端渲染的，比如我们已经有了一个跑在`localhost:4000`的`react`项目，我们可以重新创建一个`prerender`项目：
```javascript
npm install prerender
```
```javascript
// prerender/index.js
const prerender = require('prerender');
const server = prerender();
server.start();
```
然后启动`prerender`项目在`localhost:3000`，当我们直接访问`localhost:4000`是普通`react`项目的客户端渲染，但是访问` http://localhost:3000/render?url=https://localhost:4000`就能通过`prerender`拿到`react`完整的页面返回给用户，所以我们可以用下面这幅图来概况一下：

<img :src="$withBase('/react_ssr_end.png')" alt="ssr结构图">

使用`nginx`来做一层代理，对搜索引擎的爬虫返回`prerender`的项目，对普通用户返回`react`项目。