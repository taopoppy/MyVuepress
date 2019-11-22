# Lazy-Loading

## 什么是Lazy-Loading
其实`Lazy-Loading`虽然此时拿出来好像是个新概念，但是我们之前就已经使用到了,比如说我们前面写的两段效果相同的代码：
```javascript
// 同步加载方式
import _ from 'lodash'

var element = document.createElement('div')
element.innerHTML = _.join(['hello ','taopoppy'])
document.body.appendChild(element)

// 异步加载方式
function getComponent() {
	return import(/*webpackChunkName:"lodash"*/'lodash').then(({default: _}) => {
		var element = document.createElement('div')
		element.innerHTML = _.join(['hello ','taopoppy'])
		return element
	})
}

getComponent().then(element => {
	document.body.appendChild(element)
})
```
那么我们为什么要使用这种异步的方式呢？<font color=#1E90FF>因为异步的方式能实现懒加载</font>,比如我们现在修改一下上面的异步加载的代码：
```javascript
async function getComponent() {
	const {default: _} = await import(/*webpackChunkName:"lodash"*/'lodash')
	const element = document.createElement('div')
	element.innerHTML = _.join(['hello ','taopoppy'])
	return element
}

document.addEventListener('click', async ()=> {
	const element = await getComponent()
	document.body.appendChild(element)
})
```
上面的代码就很好理解，因为打包出来的有三个文件：<font color=#1E90FF>index.html</font>、<font color=#1E90FF>main.js</font>、<font color=#1E90FF>vendors~lodash.js</font>,我们打开浏览器加载`index.html`，你会发现它只会加载`index.html`和`main.js`，当我们点击网页任何一处，才会去加载`vendors~lodash.js`文件。所以我们通过这样的简单的例子就能知道懒加载的含义：<font color=#DD1144>懒加载是通过异步加载模块的方式来加载模块，具体的执行时间不确定，依据书写的代码决定</font>

那么懒加载的好处在哪里？ <font color=#1E90FF>减少首页加载文件的数量和大小，减少首页展示的时间，增加访问的速率</font>，这个很好理解，你想，如果按照同步的方式，对于首页来讲要加载3个文件，但是实际上`vendors~lodash.js`是和首页无关的代码，是我们点击操作后才要执行的代码，而异步加载后首页只需要加载首页需要的两个文件即可，加载的文件数量减少了，首页访问速率和加载速率不就提高了么。

再举个例子，在`vue`当中的路由也有懒加载的概念，如果是同步加载，那么首页会将其他详情页，列表页的内容都加载一遍，那么首屏的展示速度会大大降低。所以。<font color=#1E90FF>懒加载的核心思想是将加载时间平均分配到项目的各个地方，实现什么时候需要什么时候加载的目的</font>

那么懒加载和`webpack`有关系么？<font color=#1E90FF>lazy-loading和webpack一点关系都没有，而是es当中的概念，webpack只不过是能识别这样的语法，然后对其代码分割而已。</font>。

## Chunk和打包分析
经过打包后，其实每个`javascript`文件都是一个`chunk`,比如说`main.js`的`Chunk Names`叫做`main`,`vendors~lodash.js`的`Chunk Names`叫做`vendors~lodash`

这里主要要区分的就是，经过上面我们的讲解，很多人会把模块和`Chunk`混淆，因为我们的代码简单，`vendors~lodash`这个`Chunk`里面只有一个模块`lodash`，但其实在正式的项目当中，一个`Chunk`指的就是打包出来的一个单独的`javascript`文件，它可以包含一个或者多个模块。

关于打包后的`Chunk`，我们也可以借助一些专业的工具来分析，进入到[`www.github.com/webpack/analyse`](www.github.com/webpack/analyse)这个仓库，按照它说的，修改我们的启动开发环境的启动命令：
```javascript
// package.json
{
	"script":{
		"dev-build": "webpack --profile --json > stats.json --config ./build/webpack.dev.js "
	}
}
```
这样修改后，我们再启动`npm run dev-build`的时候，会把我们打包的信息和详情打包到一个`stats.json`的文件，然后把这个文件拿到官方提供的分析网站：[http://webpack.github.io/analyse/](http://webpack.github.io/analyse/)，在这里就能得到分析，另外还有几个比较好的分析工具，在官网上也有提及：
+ [https://alexkuz.github.io/webpack-chart/](https://alexkuz.github.io/webpack-chart/)
+ [https://chrisbateman.github.io/webpack-visualizer/](https://chrisbateman.github.io/webpack-visualizer/)
+ [https://github.com/webpack-contrib/webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

## Preloading&&Prefetching
### 1. Preloading
我们之前说代码分割，官方在`splitChunks`中的默认配置有一大堆，其中`chunks`的默认配置是`async`，这个就非常奇怪，为什么？我们会觉得想`jquery`,`lodash`这些第三方包不是分离出去，然后会借助缓存提高第二次访问速率么？虽然是这样，但是我们想一个问题：<font color=#DD1144>提高第二次的访问速率固然重要，但是重要的的是用户第一次访问的时候加载的速率</font>，<font color=#1E90FF>所以在同步的情况下，分割代码只对第二次有效，第一次访问却没有提升</font>，而`webpack`希望你的网页第一次访问就比较快，所以首当其冲的便是不能加载太多文件，所以希望你用异步的方式减少首次加载的文件数量。所以`splitChunks`的默认值是`async`

我们举个例子，在`index.js`当中写这样一段代码：
```javascript
// index.js
document.addEventListener('click', async ()=> {
	const element = document.createElement('div')
	element.innerHTML = 'hello taopoppy'
	document.body.appendChild(element)
})
```
然后打包文成后，去浏览器打开`dist/index.html`，<font color=#1E90FF>打开控制台，按住ctrl + shift + p，输入'coverage'，然后打开show coverage，点击左上角的按钮，等待按钮变成红色，刷新页面</font>，然后就有代码使用率的显示：
<img :src="$withBase('/webpack_three_proloading.png')" alt="代码使用率">

可以很清楚的看到，代码未使用率(红色线)有`74.5%`，首屏加载的时候我们在`index.js`当中写的代码压根就没有用，因为属于交互代码，所以也被加载进去了,所以我们这样写：
```javascript
// index.js
document.addEventListener('click', ()=> {
	import(/*webpackChunkName:"click"*/'./click.js').then(({default: func}) => {
		func()
	}) 
})
```
```javascript
// click.js
function handleClick() {
	const element = document.createElement('div')
	element.innerHTML = 'hello taopoppy'
	document.body.appendChild(element)
}
export default handleClick
```
然后重新打包，按照刚才的顺序测试一下代码使用率，可以看到
<img :src="$withBase('/webpack_three_proloaded.png')" alt="代码使用率">

可以清楚的看到未使用率上升到`78.6`,说明`main.js`又有很多代码没有执行，如图所示的936行到941行是我们交互的代码，在首屏加载的时候并没有执行，这就是对的，因为这段代码不属于首屏加载时的执行代码，而是我们点击交互时执行的代码。

### 2. Prefetching
优化到此结束了吗？没有。<font color=#1E90FF>Preloading能在我们发生交互的时候去重新加载所需要的代码和库，但是这种比起我们不用Proloading的时候，Preloading的首屏有用代码的使用率提高了，可是发生交互的时候再去加载库和文件不是使交互速度变慢了么</font>，<font color=#DD1144>是的，此时就是Prefetching正式出场了</font>

<font color=#DD1144>Prefetching是将我们不在首屏加载的代码偷偷在空闲时间去加载</font>

你可能会疑惑，什么是偷偷？什么又是空闲时间，我们想假如一个页面有个登录按钮，点击会弹出一个登录框，对于首屏加载，肯定不会包含登录按钮的逻辑和登录框里面的样式代码和逻辑代码，<font color=#1E90FF>但是首屏加载完毕后，网络代码空闲了，此时用户在干嘛，其实用户在发呆，发了一会呆，欣赏了半天优美的页面，然后才找到登录按钮，那么在首屏加载完毕和用户点击登录按钮的之间，是用户发呆和欣赏的这段时间，而这段时间，就能用来加载登录按钮的逻辑和登录框的逻辑、样式代码，不是么？</font>，这就是偷偷在空闲时间加载非首屏代码的的含义，这样才能保证点击登录的交互速度和以前一样快。

然后我们保存`click.js`不动，来修改`index.js`中的代码，<font color=#1E90FF>使用魔法注释来帮助我们添加prefetch功能</font>
```javascript
// index.js
document.addEventListener('click', ()=> {
	import(/*webpackChunkName:"click"*//*webpackPrefetch:true*/'./click.js').then(({default: func}) => {
		func()
	}) 
})
```
接着我们到浏览器上看看效果：
<img :src="$withBase('/webpack_three_prefetching.png')" alt="prefetch加载">

可以很清楚的看到，代码使用率没有发生大的改变，在首屏需要的`main.js`和`index.html`加载完毕后，<font color=#DD1144>利用空闲的时间花了26ms加载了click.js，并且保存在浏览器的内存当中，当我们真正点击发生交互的时候，click.js直接从内存中拿了出来，所以只花了1ms</font>。<font color=#1E90FF>假如没有prefetching，发生点击交互的时候一定要花26ms</font>。在复杂的项目当中，利用`Prefetching`的特性可以大大优化交互速率。而且更重要的一点就是：<font color=#DD1144>在项目优化的时候，我们不应该只把眼光放在缓存中来优化项目，更重要的是挺高代码的利用率来优化项目</font>,既然说到了缓存，下面我们就来说一下缓存

## Browser-Caching

**参考资料**

1. [https://www.webpackjs.com/guides/code-splitting/](https://www.webpackjs.com/guides/code-splitting/)
2. [https://www.webpackjs.com/guides/lazy-loading/](https://www.webpackjs.com/guides/lazy-loading/)