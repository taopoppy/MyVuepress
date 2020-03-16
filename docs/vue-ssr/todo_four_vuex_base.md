# Vue-Router(1)

<font color=#1E90FF>传统的单体式项目中的路由是这样：我们点击一个链接，跳转到后端进行模板渲染，产生一个新的html页面返回给浏览器端，浏览器再把页面显示出来</font>

<font color=#DD1144>而单页应用的路由跳转是不经过后端服务的，页面渲染的内容全部来自于javascript</font>

## Vue-router之集成
### 1. 下载和配置
我们首先使用下面的命令来下载`vue-router`:
```javascript
npm i vue-router@3.0.1 -S --registry=https://registry.npm.taobao.org
```
然后在`client`下面创建`client/config/router.js`文件和`client/config/routes.js`文件，<font color=#1E90FF>因为随着项目的增大，我们的路由也会随之增多，我们希望使用routes.js文件来配置单独的路由映射关系，然后使用router.js来管理路由的相关配置和内容</font>:

```javascript
// client/config/routes.js
import Todo from '../views/todo/todo.vue'
import Login from '../views/login/login.vue'

export default [
  {
    path: '/',
    redirect: '/app'
  },
  {
    path: '/app',
    component: Todo
  },
  {
    path: '/login',
    component: Login
  }
]
```
```javascript
// client/config/router.js
import Router from 'vue-router'

import routes from './routes'

export default () => {
  return new Router({
    routes
  })
}
```
<font color=#1E90FF>关于我们为什么在router.js文件当中去导出一个方法，而不是直接将Router导出，涉及到服务端渲染的内存溢出问题，<font color=#DD1144>简单的说就是如果这里只导出一个router，而服务端每次都会产生一个新的app，所有app共用一个router，会导致很多app释放不掉</font></font>

### 2. 导入路由配置
然后我们要让我们的`Router`生效，我们就先修改一下`build/webpack.config.client.js`文件中的`HTML`插件的配置：
```javascript
  new HTMLPlugin({
    template: path.join(__dirname, 'template.html')
  })
```
这样使用了已有的模板，我们就不用在`client/index.js`中新创建`root`的节点了：
```javascript
// client/index.js
import Vue from 'vue'
import VueRouter from 'vue-router' // 引入Vue-Router
import App from './app.vue'

import './assets/styles/global.styl'
import createRouter from './config/router'  // 引入配置

Vue.use(VueRouter)                     // 插件使用
const router = createRouter()          // 创建路由对象

new Vue({
  router,                              // 引入路由对象
  render: (h) => h(App)
}).$mount('#root')
```
我们可以看到：<font color=#DD1144>在根节点的路由实例上面挂载了路由对象，通过provide的广播方式，让我们其他的所有根组件都能拿到这个路由对象</font>

那么我们使用`npm run dev`启动项目后会发现，`url`会自动变成<font color=#1E90FF>http://localhost:8000/#/</font>,<font color=#DD1144>这个是因为我们在vue-router中使用的是哈希，如果我们是单页应用还有服务端渲染的时候，我们会改成history的形式，路由就更合理，对seo也很友好</font>

但是到这里我们的配置还没有生效，因为我们要到`client/app.vue`当中去修改一个东西：
```javascript
  <!-- <todo></todo> -->
  <router-view/>
```
我们将整个页面的中间部分`todo`组件换成`Vue-router`的内置组件，然后整个单页应用中间的部分才能随着我们输入不同的`url`显示不同的内容。

## Vue-router之配置
### 1. history模式
<font color=#1E90FF>作为一个有服务端渲染的应用，我们不希望我们的路由当中存在#这种东西，也就是我们希望路由是localhost:8000/app,而不是localhost:8000/#/app，因为#通常作为定位的，而不是路由状态的记录，哈希路由是不会被搜索引擎解析的，所以我们之前就说过也改这个东西，所以我们要在配置路由的时候配置成为history形式的</font>：

```javascript
export default () => {
  return new Router({
    routes,
    mode: 'history' // 默认是hash，我们需要改成history
  })
}
```

配置了`history`之后有个比较大的问题就是你在浏览器直接输入一个完整的`url`，比如说`localhost:8000/app`，浏览器是不认识的，你必须在`webpack.config.client.js`中`devServer`中配置`historyApiFallback`属性：
```javascript
// build/webpack.config.client.js
const devServer = {
  ...
  historyApiFallback: {
    index: '/public/index.html'
    // index: 'index.html'
  }
}
```
如果你是按照`/public/index.html`的方式配置，你还必须在`webpack.config.base.js`中去配置`output.publicPath`属性，两者要保持一致，如果按照`index.html`配置的，就不需要在`webpack.config.base.js`中去配置`output.publicPath`属性：
```javascript
// build/webpack.config.base.js
const config = {
  output: {
    publicPath: '/public/'
  }
}
```

### 2. 其他配置
<font color=#9400D3>**① base**</font>

会在所有路径前面添加`/base/`，作为整个基路径的一部分,只要通过`VueRouter`的`API`方式跳转的路由，都会添加这个配置，比如`localhost:8000/base/app`。<font color=#1E90FF>但是这个配置不是强制的，也就是localhost:8000/base/app和localhost:8000/app是一样的</font>

<font color=#9400D3>**② linkExactActiveClass和linkActiveClass**</font>

这两个是用来配置我们在`router-link`中的选中和未选中的全局`class`的，<font color=#1E90FF>router-link本质是a标签，或者说链接标签，<font color=#DD1144>我们在页面上可点击的路由都用router-link来做，因为a标签中的href属性有利于做seo的，但是a标签本身是没有前端路由跳转的，router-link实际上是在a标签的基础上添加了事件，点击a标签，根据href属性采用Vue-router的api进行前端路由的跳转</font>，默认的class为router-link-exact-active router-link-active</font>，然后如果我们配置`linkExactActiveClass`和`linkActiveClass`,那么链接标签的`class`名称就会变成我们配置的了：
```javascript
{
  linkActiveClass: 'active-link',
  linkExactActiveClass: 'exact-active-link'
}
```
我们这样配置后就可以通过`active-link`和`exact-active-link`来编写全局的样式，自定义链接被激活的时候的样式。<font color=#1E90FF>两个属性的区别是linkExactActiveClass配置的class只会存在于和当前url完全一致的路由标签中</font>

<font color=#9400D3>**③ scrollBehavior**</font>

<font color=#1E90FF>这个属性是决定在页面跳转的时候页面要不要滚动的问题</font>，接受一个方法:

```javascript
scrollBehavior (to, from, savedPosition) {
  if (savedPosition) {
    return savedPosition
  } else {
    return { x: 0, y: 0 }
  }
}
```
就是说，如果我们从`A`跳转到`B`，但是`B`页面之前我们浏览过，并且滚动到了某个地方，那么这次从`A`跳转到`B`的时候依旧会回到`B`页面之前所处的位置。否则就是页面最顶部。

<font color=#9400D3>**④ fallback**</font>

因为并不是所有浏览器都支持这种`history`的路由方式，所以我们希望通过设置<font color=#1E90FF>fallback: true</font>来让不支持`history`的浏览器自动使用默认的哈希方式即可。

最后我们给出上述所有配置的代码：
```javascript
// client/config/router.js
import Router from 'vue-router'
import routes from './routes'

export default () => {
  return new Router({
    routes,
    mode: 'history',
    base: '/base/',
    linkActiveClass: 'active-link',
    linkExactActiveClass: 'exact-active-link',
    scrollBehavior (to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { x: 0, y: 0 }
      }
    },
    fallback: true
  })
}
```