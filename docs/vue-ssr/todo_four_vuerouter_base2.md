# Vue-Router(3)

## vue-router实现原理
### 1. SPA的核心
要想清楚的理解路由的核心就要先知道`SPA`是什么：<font color=#1E90FF>SPA(single page application)单页应用是只有一个完整的页面，加载页面的时候不会加载整个页面，<font color=#DD1144>而是只更新某个指定的容器（组件）的内容</font>，所以单页面应用的核心之一是：<font color=#DD1144>更新视图而不重新请求页面</font></font>，`vue-router`在实现单页面前端路由的时候，提供了两种方式，<font color=#3eaf7c>Hash模式</font> 和 <font color=#3eaf7c>History模式</font>，两种默认根据在`Vue-Router`的`mode`参数来决定采用哪一种方式。

### 2. Hash模式
<font color=#9400D3>**① Hash原理**</font>

+ <font color=#1E90FF><font color=#DD1144>hash（#）是URL的锚点，代表的是网页中的一个位置，单单改变#后的部分，浏览器只会滚动到相应位置，不会重新加载网页，所以说Hash模式通过锚点值的改变，根据不同的值，渲染指定DOM位置的不同数据</font>，也就是说hash 出现在 URL 中，但不会被包含在 http 请求中，对后端完全没有影响，因此改变 hash 不会重新加载页面；同时每一次改变#后的部分，都会在浏览器的访问历史中增加一个记录，使用”后退”按钮，就可以回到上一个位置；<font color=#DD1144></font></font>

+ <font color=#DD1144>hash模式的原理是onhashchange事件(监测hash值变化)，可以在window对象上监听这个事件</font>

<font color=#9400D3>**② Vue-Router中的Hash**</font>

+ `vue-router`默认`hash`模式 —— 使用`URL`的`hash`来模拟一个完整的`URL`，于是当URL改变时，页面不会重新加载

### 3. History模式
由于`hash`模式会在`url`中自带`#`，这种路由很丑，而且样子也不符合我们去做一个正规网站的需求，我们可以用路由的`history`模式，只需要在配置路由规则时，加入`"mode: 'history'"`。

<font color=#9400D3>**① History原理**</font>

+ <font color=#DD1144>这种模式充分利用了html5 history interface 中新增的pushState()和replaceState()方法。这两个方法应用于浏览器记录栈，在当前已有的back、forward、go基础之上，它们提供了对历史记录修改的功能。只是当它们执行修改时，虽然改变了当前的URL，但浏览器不会立即向后端发送请求</font>

<font color=#9400D3>**② Vue-Router中的History**</font>

+ 在`Vue-Router`中使用`history`模式时，`URL`就像正常的`url`，<font color=#DD1144>你要在服务端增加一个覆盖所有情况的候选资源：如果URL匹配不到任何静态资源，则应该返回同一个index.html页面，这个页面就是你app依赖的页面，否则就会返回 404，这就不好看了</font>
	```javascript
	 export const routes = [
		{path: "/", name: "homeLink", component:Home}
		{path: "/register", name: "registerLink", component: Register},
		{path: "/login", name: "loginLink", component: Login},
		{path: "*", redirect: "/"}
	]
	```

+ 使用路由模块来实现页面跳转有三种方式
	+ <code>直接修改地址栏</code>
	+ <code>this.$router.push(‘路由地址’)</code>
	+ <code>&lt;router-link to="路由地址"&gt;&lt;/router-link&gt;</code>

**参考资料**

1. [vue-router原理剖析](https://juejin.im/post/5b08c9ccf265da0dd527d98d)
2. [你需要知道的单页面路由实现原理](https://juejin.im/post/5ae95896f265da0b84553bd7)
3. [如何用js来实现hash和history路由](https://coding.imooc.com/class/419.html?mc_marking=4cd147ccf2ff2ca7d226ce6dc286e465&mc_channel=syszxl)
4. [带你全面分析vue-router源码（万字长文）](https://juejin.im/post/5e456513f265da573c0c6d4b)