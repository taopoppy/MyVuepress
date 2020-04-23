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

动态路由的作用一般都用在可复用组件上比较多，比如商品的详情页面，只要传递来的`id`是不一样的，根据不同的商品`id`显示不同的商品信息即可，<font color=#DD1144>这里就有一个非常重要的问题，关于组件复用的问题，比如从localhost:8000/app/999通过&lt;router-link&gt;路由方式跳转到localhost:8000/app/888的时候，Todo组件会被复用，涉及到页面数据重新渲染的问题，有两种方法，第一种通过watch($router)监听路由，根据$router.params中的id重新请求，第二种就是在组件的路由守卫beforeRouterUpdate中根据$router.params中的id重新请求，两种方法推荐后者</font>。

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

### 4. 命名式router-view
在我们的一个页面中比如有两个`router-view`，而且在不同的路由下还要显示不同的组件，
<font color=#DD1144>我们可以给不同的router-view添加name属性，并在路由映射文件中修改component属性为components属性</font>:

```javascript
// client/app.vue
  <router-view/>
  <router-view name="foot"/>
```
```javascript
// client/config/routes.js
export default [
  {
    path: '/app',
    components: {
      default: Todo,   // 没有name属性的router-view的名称默认是default
      foot: Login      // 有name属性的router-view的名称
    },
    name: 'app',
    meta: {
      title: 'this is app',
      description: 'the main page of application'
    }
  }
]
```
这种<font color=#1E90FF>命名式的router-view</font>通常用在传统的三栏布局之上，顶部的`tab`有切换，左侧的菜单栏就有一个大的切换，而右边的显示栏是随着左侧的菜单栏切换而变换的

### 5. Vue-Router参数传递
<font color=#DD1144>声明式的导航</font>（&lt;router-link :to="..."&gt;）和<font color=#DD1144>编程式的导航</font>（router.push(...)）都可以传参

<font color=#9400D3>**① 声明式的导航**</font>

无论是声明式的导航还是编程式的导航，参数的传递都有这么四个参数：<font color=#1E90FF>name</font>、<font color=#1E90FF>path</font>、<font color=#1E90FF>params</font> 和 <font color=#1E90FF>query</font>，其中`name`和`path`都代表路径的意思，<font color=#DD1144>name代表路径别名，可以和params搭配组成完整的路径，但是path不能和params同时存在，因为path本身就代表一个完整的路径</font>。

```html
<!--第一种方式  访问 /xxx/value?name=taopoppy  （前提是路由设置是： path: '/xxx/:key'）--> 
<router-link :to="{name:xxx,params:{key:value},query:{name:'taopoppy'}}">valueString</router-link>

<!--第二种方式  访问 /xxx/value?name=taopoppy-->
<router-link :to="{path: 'xxx/value',query:{name:'taopoppy'}}">valueString</router-link>
```
<font color=#9400D3>**② 编程式的导航**</font>

编程式的导航和声明式的差不多，其实参数的形式都是差不多的
```javascript
// 访问/user
router.push('user')

// 访问 /user/123（前提是路由设置是： path: '/user/:userId'）
const userId = '123'
router.push({ name: 'user', params: { userId: userId }})
router.push({ path: `user/${userId}`})

// 访问register/taopoppy?plan=private （前提是路由设置是： path: '/register/:registerName'）
const name = 'taopoppy'
router.push({ name: 'register', params: { registerName: name }, query: { plan: 'private' }})
router.push({ path: `register/${name}`, query: { plan: 'private' }})
```

### 6. $route和$router
+ <font color=#DD1144>$route 是“路由信息对象”，包括 path，params，hash，query，fullPath，matched，name 等路由信息参数。</font>
+ <font color=#DD1144>$router 是“路由实例”对象，即使用 new VueRouter创建的实例，包括了路由的跳转方法，钩子函数等。</font>

路由的常见跳转方法如下：
```javascript
  this.$router.go(-1)                       //跳转到上一次浏览的页面
  this.$router.replace('/menu')             //指定跳转的地址
  this.$router.replace({name:'menuLink'})   //指定跳转路由的名字下
  this.$router.push('/menu')                //通过push进行跳转
  this.$router.push({name:'menuLink'})      //通过push进行跳转路由的名字下
```

`$router.push`和`$router.replace`的区别：
+ <font color=#1E90FF>使用push方法的跳转会向 history 栈添加一个新的记录，当我们点击浏览器的返回按钮时可以看到之前的页面。</font>
+ <font color=#1E90FF>使用replace方法不会向 history 添加新记录，而是替换掉当前的 history 记录，即当replace跳转到的网页后，‘后退’按钮不能查看之前的页面。</font>

## Vue-router之导航守卫

### 1. 全局导航守卫
<font color=#DD1144>全局导航守卫</font>是在每个页面跳转都会触发的钩子，<font color=#1E90FF>是在Vue导入使用Vue-router之前就要去注册的</font>，所以我们在`client/index.js`当中去注册：

```javascript
// client/index.js
const router = createRouter()

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('before each invoked')
  next()
})

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  console.log('before resolve invoked')
  next()
})

// 全局后置守卫
router.afterEach((to, from) => {
  console.log('after resolve invoked')
})
```
基本上全局的守卫就这么三个，然后每个函数当中的`to`,`from`都代表跳转后的路由对象和跳转前的路由对象，`next`代表跳转的动作，<font color=#1E90FF>一般router.beforeEach这个钩子就是用来做用户登录校验的，在每次路由跳转之前要看看用户是否登录，没有登录就跳转到login页面</font>

### 2. 路由导航守卫
<font color=#DD1144>路由导航守卫</font>是在路由对象当中配置的钩子：<font color=#1E90FF>它是发生在全局前置守卫之后，进入组件之前</font>。

```javascript
// client/config.routes.js
export default [
  {
    path: '/app',
    component: Todo,
    name: 'app',
    meta: {
      title: 'this is app',
      description: 'the main page of application'
    },
    // 路由独享钩子
    beforeEnter (to, from, next) {
      console.log('app route before enter')
      next()
    }
  }
]
```

### 3. 组件导航守卫
<font color=#DD1144>组件导航守卫</font>顾名思义就是在组件内部的导航守卫，一共有三个，如下代码所示：

```javascript
// client/views/todo/todo.vue
export default {
  beforeRouteEnter (to, from, next) {
    console.log('todo before enter')
    next()
  },
  beforeRouteUpdate (to, from, next) {
    console.log('todo update enter')
    next()
  },
  beforeRouteLeave (to, from, next) {
    console.log('todo leave enter')
    next()
  },
}
```
<font color=#9400D3>**① beforeRouteEnter**</font>

<font color=#1E90FF>这里首先要说明的是beforeRouterEnter当中是拿不到组件的this的，因为此时组件还没有被创建，关于组件的创建和路由的执行顺序，我们后面会说。那么我们有时候依然会在这里去获取数据，并将数据塞到组件中，我们可以这样做</font>：<font color=#DD1144>在next函数当中传入一个回调函数，函数的参数就是组件本身</font>

```javascript
beforeRouteEnter (to, from, next) {
  console.log('todo before enter')
  next(vm => {
    console.log('after enter vm.id is', vm)
  })
},
```
至于为什么这里能将取的数据塞到还没有创建的组件当中，我们后面会解释

<font color=#9400D3>**② beforeRouterUpdate**</font>

<font color=#1E90FF>beforeRouterUpdate的使用情况经常是这样的，<font color=#DD1144>在动态路由之间进行跳转并且要复用同一个组件的时候，具体钩子调用顺序请继续往下看</font></font>

+ <font color=#3eaf7c>比如在我们的案例中由localhost:8000/app/123由路由链接（注意不是在浏览器重新输入url）跳转到localhost:8000/app/456,大家都用Todo组件，这个时候，重新进入组件beforeRouterUpdate就会被触发，并且可以根据动态路由中的参数456重新请求数据，修改组件中显示的信息</font>
```html
  <!-- 这才是路由链接跳转 -->
  <router-link to="/app/123">app123</router-link>
  <router-link to="/app/456">app456</router-link>
```
+ <font color=#3eaf7c>还比如一般我们在京东，淘宝中看一个商品的详情，同时下面还有好多相关商品，点击这些商品的链接，实际上也是一次组件中beforeRouterUpdate钩子被触发的场景，这也是我们前面在讲watch($router)和beforeRouterUpdate都能解决相同组件复用时相互跳转数据更新的问题</font>
+ <font color=#DD1144>特别注意，如果由localhost:8000/app/123由路由链接跳转到localhost:8000/app/456，是不能在mounted当中去根据路由参数值更新数据，因为是组件的复用，不需要重新创造新组件，也就不会重新执行那些生命周期函数，自然mounted也是不会执行第二次的，只能使用beforeRouteUpdate去更新数据</font>


<font color=#9400D3>**③ beforeRouteLeave**</font>

这个钩子的作用一般在于提醒人们是否要离开这里，比如此时正在提交表单，你不小心点了别的链接，我们可以在这里书写一个判断的逻辑，防止误操作：

```javascript
beforeRouteLeave (to, from, next) {
  console.log('todo before enter')
  if (global.confirm('are you sure?')) {
    next()
  }
}
```

### 4. 守卫执行的顺序
在说明守卫执行顺序之前，我们捋清楚一下所有的导航守卫的分类：
+ <font color=#3eaf7c>全局路由钩子</font>：<font color=#1E90FF>beforeEach(to,from, next)</font>、<font color=#1E90FF>beforeResolve(to,from, next)</font>、<font color=#1E90FF>afterEach(to,from)</font>；

+ <font color=#3eaf7c>独享路由钩子</font>：<font color=#1E90FF>beforeEnter(to,from, next)</font>；

+ <font color=#3eaf7c>组件内路由钩子</font>：<font color=#1E90FF>beforeRouteEnter(to,from, next)</font>、<font color=#1E90FF>beforeRouteUpdate(to,from, next)</font>、<font color=#1E90FF>beforeRouteLeave(to,from, next)</font>

<font color=#9400D3>**① url输入**</font>

我们先要说直接在浏览器当中去输入`url`的情况，这种情况<font color=#1E90FF>实际上是不涉及到组件内部导航守卫的触发</font>

<img :src="$withBase('/vuessr_vuerouter_url.png')" alt="url输入">

<font color=#9400D3>**② 不同组件之间跳转**</font>

不同组件之间跳转是最常见的跳转，<font color=#1E90FF>基本上除了组件中的beforeRouteUpdate钩子不触发，其他所有的钩子全部都参与</font>

<img :src="$withBase('/vuessr_vuerouter_component.png')" alt="不同组件之间跳转">

<font color=#9400D3>**③ 相同组件复用**</font>

这里最主要就是`beforeRouteUpdate`的使用，我们来看一下：<font color=#1E90FF>基本上因为组件的复用，一直在组件内部，所以既没有用到路由导航守卫，组件内部的beforeRouteEnter和beforeRouteLeave都没有用到</font>

<img :src="$withBase('/vuessr_vuerouter_update.png')" alt="组件复用情况">

<font color=#9400D3>**④ 总结**</font>

<img :src="$withBase('/vuessr_vuerouter_zongjie.jpg')" alt="总结">

看完这个图，你现在也许能明白为什么前面我们说的:<font color=#DD1144>在beforeRouteEnter中使用next的回调也能将数据塞给组件，因为next的回调函数在组件生命周期mounted后才执行的，mounted的时候都能开始取数据了，next回调自然能够取数据啊，这里的重点就是<font color=#CC99CD>next回调的执行时机</font></font>

## 异步组件
### 1. 异步的写法
我们的路由如果在非常多的情况之下，一次性通过`webpack`将代码全部打包进去`js`文件就会非常大，而且在进入一个页面将其他页面的全部代码也执行一遍是比较浪费的行为，所以<font color=#DD1144>异步组件就是显示某个页面我们只需要加载本页面的组件代码和核心代码即可</font>
```javascript
// client/config/routes.js
export default [
  {
    path: '/',
    redirect: '/app'
  },
  {
    path: '/app/:id',
    component: () => import('../views/todo/todo.vue'),
    name: 'app',
    meta: {
      title: 'this is app',
      description: 'the main page of application'
    },
    beforeEnter (to, from, next) {
      console.log('beforeEnter')
      next()
    }
  },
  {
    path: '/login',
    component: () => import('../views/login/login.vue')
  }
]
```
### 2. babel的配置
当然如果使用这样的写法，我们必须下载一个能识别这样使用`import`语法的插件：<font color=#DD1144>babel-plugin-syntax-dynamic-import</font>：
```javascript
npm i babel-plugin-syntax-dynamic-import@6.18.0 -D --registry=https://registry.npm.taobao.org
```
然后我们去修改一下`.babelrc`文件，将插件添加进去
```javascript
// .babelrc
{
  "presets": [
    "env"
  ],
  "plugins": [
    "transform-vue-jsx",
    "syntax-dynamic-import" // 这里添加
  ]
}
```
另外我们还要在`client/app.vue`中`import Todo from './views/todo/todo.vue'`去掉，因为全部都由`router-view`替代了，最后重启服务即可。

<font color=#DD1144>原始的项目打包后，只有一个js文件，然后首屏会加载所有的js，但是异步组件的好处就是将Todo和Login组件的内容抽离出来单独打包成两个js文件，并且在访问这两个组件的时候再去请求相关的js文件</font>

**参考资料**

1. [vue-router导航守卫，不懂的来](https://zhuanlan.zhihu.com/p/54112006)
2. [从头开始学习vue-router](https://juejin.im/post/5b0281b851882542845257e7#heading-15)