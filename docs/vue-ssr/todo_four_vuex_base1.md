# Vue-Router(2)

## Vue-router之路由参数传递
### 1. 路由的配置属性
<font color=#9400D3>**① name**</font>

我们可以给路由起一个名称，这个名称和`path`可以没有任何关系，只不过在`router-link`中的用法就会发生一些改变：
```javascript
// client/config/routes.js
export default [
  {
    path: '/app',
    component: Todo
  }
]

// client/app.vue
<router-link to="/app">app</router-link>
```
```javascript
// client/config/routes.js
export default [
  {
    path: '/app',
    component: Todo,
    name: 'app'
  }
]

// client/app.vue
<router-link :to="{name: 'app'}">app</router-link>
```
两种写法的效果是一样的，只不过使用路由命名在`router-link`使用的时候要使用绑定解析`json`的写法，稍微麻烦了一些。

<font color=#9400D3>**② meta**</font>

<font color=#1E90FF>meta属性是用来保存路由信息的</font>，我们在写`html`的时候，在`header`标签当中会写一些`meta`，称为页面的元信息，这些信息有利于帮助我们处理`seo`的东西，<font color=#1E90FF>而我们在写vue组件的时候是很难将meta写在组件中的，所以在路由配置中添加</font>

但是也并不是所有的写在路由对象中的属性都能拿到，关于`meta`的具体使用我们会在后面的路由守卫去详细操作。

<font color=#9400D3>**③ children**</font>

<font color=#1E90FF>children属性其实和外层的路由列表一样，也是个数组，包含着当前路由下的子路由</font>,这里要特别注意的是：<font color=#DD1144>并不是你写了children这个属性，就会生效，因为路由的配置必须和router-view一一对应，就比如说我们在client/config/routes.js中配置关于/app的路由对象如下，但是只有在Todo这个组件中存在router-view这个标签，才会在输入/app/test的时候，Login组件才会去替换router-view所在的位置，所以说白了router-view就是这些子路由的占位符而已</font>

```javascript
//client/config/routes.js
export default [
  {
    path: '/app',
    component: Todo,
    name: 'app',
    meta: {
      title: 'this is app',
      description: 'the main page of application'
    },
    children: [
      {
        path: 'test',
        component: Login
      }
    ]
  },
]
```
所以上面就展示的是一个嵌套路由的概念，然后下面我们来说一个过渡动画的概念。

### 2. transition过渡
通过在`router-view`外层包裹一个`transition`的标签可以实现我们组件显示和消失的动画：
```javascript
// client/app.vue
<transition name="fade">
  <router-view/>
</transition>
```
然后我们可以在`client/assets/styles/glbal.styl`中去定义过渡动画的效果,下面的动画是一个渐入渐出的效果：
```css
.fade-enter-active, .fade-leave-active
  transition: opacity .5s
.fade-enter, .fade-leave-to
  opacity: 0
```
<font color=#DD1144>如果我们对router-view包裹了transition,那么实际上router-view对应的所有的子组件都会产生这样的动画效果，如果只想对某个组件使用动画效果，只需要在组件内部对整个tempalte包裹transition即可</font>

### 3. 动态路由和查询参数
<font color=#9400D3>**① $route的方式**</font>

```javascript
// client/config/routes.js
export default [
  {
    path: '/app/:id', // 动态参数
    component: Todo,
    name: 'app',
    meta: {
      title: 'this is app',
      description: 'the main page of application'
    }
  }
]
```
动态路由的写法如上，它的含义就是：<font color=#DD1144>通过在路由当中输入不同的值，这个值将以参数的形式输入到这个路由即将进入的组件当中</font>，比如上面这个你输入`localhost:8000/app/999`,那么`999`就作为`id`参数的值传入了`Todo`组件中，在`Todo`组件中可以通过<font color=#DD1144>this.$route拿到所有路由的信息</font>，如下所示：
<img :src="$withBase('/vuessr_todo_routerimg.png')" alt="路由信息">

动态路由的作用一般都用在可复用组件上比较多，比如商品的详情页面，只要传递来的`id`是不一样的，根据不同的商品`id`显示不同的商品信息即可。

同样<font color=#DD1144>查询参数</font>也可以通过<font color=#DD1144>this.$route</font>拿到，比如我们输入`localhost:8000/app/999?a=123456&b=765432`,那么通过 <font color=#1E90FF>this.$route.query.a</font>和<font color=#1E90FF>this.$route.query.b</font>就能分别拿到123456和765432两个值了。

<font color=#9400D3>**② props的方式**</font>

实际上我们上面的那种通过`this.$route`拿到动态路由和查询参数的方式有很多大的局限性：<font color=#1E90FF>就是这个组件只能作为router当中的component使用，不能作为普通的可复用的组件</font>，因为这个组件内部使用`this.$route`，它就强制了一定要从路由当中去找参数，如果我们想让它更灵活的使用，就必须将这个<font color=#DD1144>组件</font>和<font color=#DD1144>当前路由</font>两者解耦，我们可以采用`props`的方式：
```javascript
export default [
  {
    path: '/app/:id',
    props: true,  // props的方式
    component: Todo,
    name: 'app',
    meta: {
      title: 'this is app',
      description: 'the main page of application'
    }
  }
]
```
这样实际上：<font color=#1E90FF>url上的id的值就作为了Todo这个组件的props属性传递进去了，我们在Todo组件中就不需要通过this.$route来拿到这个id值，直接通过this.id直接拿到</font>
```javascript
// client/views/todo/todo.vue
export default {
  props: ['id'],
  mounted () {
    console.log(this.id)
  }
}
```
<font color=#DD1144>这种方式实际上是更合理，也是提高组件可复用性的一个方法，我们可以通过props的方式直接传值来使用这个组件，它不需要从路由上去读取相关属性值</font>，而且`props`的属性写法也很灵活，还可以写成一个方法：

```javascript
export default [
  {
    props: (route) => ({ id: route.query.b})
    // 其中参数route实际上和我们在组件中使用的this.$route是一个东西
  }
]

```
## Vue-router之导航守卫