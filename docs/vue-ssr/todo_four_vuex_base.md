# Vue-Router

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