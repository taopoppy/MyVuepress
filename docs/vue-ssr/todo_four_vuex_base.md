# Vuex(1)

## Vuex之集成
### 1. 下载和配置
`store`这个概念最先是由`react`提出来的，是一种`flux`的<font color=#DD1144>单向数据流结构</font>，将应用中的所有数据结构放在这里单独维护和管理，由`store`中的数据的变化来促使`view`层的视图更新，通过这种方式的好处就是无法随意的修改数据，提高了规范性。

使用下面的命令来下载`Vuex`:
```javascript
npm i vuex@3.0.1 -S --registry=https://registry.npm.taobao.org
```
接着在创建`store`的入口文件：`client/store/store.js`:
```javascript
// client/store/store.js
import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

const store = new Vuex.Store({
	// 项目初始化state中含有的数据
  state: {
    count: 0
	},
	// 更新数据的方法
  mutations: {
    updateCount (state, num) {
      state.count = num
    }
  }
})

export default store
```
然后我们需要在我们应用中去导入我们下载和配置好的`Vuex`,我们直接到`client/index.js`当中去集成：
```javascript
// client/index.js
import store from './store/store' // 引入store

new Vue({
  router,
  store,                         // 集成
  render: (h) => h(App)
}).$mount('#root')
```
接着我们就能在应用当中去使用`Vuex`的相关功能了。

### 2. Vuex的简单使用
<img :src="$withBase('/vuessr_vuex_liuchengtu.png')" alt="vuex流程图">

通过上面的配置后，<font color=#1E90FF>我们就直接能在组件当中去使用store的对象，通过在组件当中使用this.$store来使用store这个对象</font>:
```javascript
// client/app.vue
<template>
  <div id="app">
    <p>{{count}}</p>
  </div>
</template>

<script>
export default {
  mounted () {
    console.log(this.$store)
    let i = 1
    setInterval(() => {
      this.$store.commit('updateCount', i++) // commit（提交）一个mutation（修改）
    }, 1000)
  },
  computed: {
    count () {
      return this.$store.state.count // 直接拿到store中state中的数据
    }
  }
}
</script>
```

### 3. 服务端渲染的配置
后面我们要使用服务端渲染，我们同样和`vue-router`一样来导出一个方法来创建`Vuex`,<font color=#1E90FF>每次服务端渲染的过程都要新生成一个store，不能每次都使用同一个store，会有内存溢出的问题</font>,所以我们导入`Vuex`的代码如下：
```javascript
// client/store/store.js
import Vuex from 'vuex'

export default () => {
  return new Vuex.Store({
    state: {
      count: 0
    },
    mutations: {
      updateCount (state, num) {
        state.count = num
      }
    }
  })
}
```
```javascript
// client/index.js 部分代码
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import createRouter from './config/router'
import createStore from './store/store'

Vue.use(VueRouter)
Vue.use(Vuex)

const router = createRouter()
const store = createStore()
```

## state和getters
### 1. state的概念和使用
上面我们在`client/store/store.js`中直接写了`state`和`mutations`，但是实际上我们都会把这些东西单独拿出去书写，当然这些东西单独拿出去写还能分模块，我们现在就按照一个模块来学习，创建`client/store/state/state.js`和`client/store/mutations/mutations.js`：
```javascript
// client/store/state/state.js
export default {
  count: 0
}
```
实际上，对于项目初始化的`state`，就是一个`js`对象，<font color=#DD1144>对于我们一开始用不到的字段或者数据，我们都建议声明一个默认的或者初始值，因为这样数据才是reactive的</font>
```javascript
// client/store/mutations/mutations.js
export default {
  updateCount (state, num) {
    state.count = num
  }
}
```
然后集成在`client/store/store.js`当中：
```javascript
// client/store/store.js
import Vuex from 'vuex'
import defaultState from './state/state'
import mutations from './mutations/mutations'

export default () => {
  return new Vuex.Store({
    state: defaultState,
    mutations
  })
}
```
<font color=#DD1144>我们这里之所有用defaultState是因为服务端渲染的时候，有一部分的数据会从服务端传到客户端，会用拿到的数据去覆盖defaultState的数据，它只是默认值，并不是真正的状态</font>

### 2. getters的概念和使用
<font color=#DD1144>getters的概念你可以完全理解为组件中的computed，getters的作用就是方便生成我们可以在应用当中直接用的数据</font>，什么意思呢？<font color=#1E90FF>后端传来的一些数据实际上很多时候是不适合直接放在页面展示的，需要我们前端去组装和过滤，当有很多页面都要用到这些改造后的数据时，我们不需要在每个组件中写computed，有了store后，我们使用getters统一处理一次，就能在所有需要的组件中拿到</font>。

创建`client/store/getters/getters.js`：
```javascript
// client/store/getters/getters.js
export default {
  fullName (state) {
    return `${state.firstName} ${state.lastName}`
  }
}
```
然后集成到`client/store/store.js`中：
```javascript
// client/store/store.js
import getters from './getters/getters' // 导入

export default () => {
  return new Vuex.Store({
    state: defaultState,
    mutations,
    getters   // 集成
  })
}
```
然后就能直接在所有组件中拿到这个处理后的`fullName`：
```javascript
// client/app.vue
<template>
  <div id="app">
    <p>{{count}}</p>
    <p>{{fullName}}</p>
  </div>
</template>

<script>
export default {
  computed: {
    count () {
      return this.$store.state.count // 拿原始的数据
    },
    fullName () {
      return this.$store.getters.fullName // 拿改造后的数据
    }
  }
}
</script>
```
### 3. mapState和mapGetters
通过上面我们发现，通过`this.$store.state.count`和`this.$store.getters.fullName`这种方式实在是太过麻烦，所以`vuex`提供了我们<font color=#DD1144>mapState</font>和<font color=#DD1144>mapGetters</font>来简化我们从`store`拿数据的方式：

<font color=#9400D3>**① mapState**</font>

<font color=#1E90FF>第一种写法，就是在组件中使用的数据名称和从store中拿到的数据名称一致</font>

```javascript
// client/app.vue
<template>
  <div id="app">
    <p>{{count}}</p> // 组件里用的count
  </div>
</template>
export default {
  computed: {
    ...mapState(['count']) // 从store中拿出来的也是count
  }
}
```

<font color=#1E90FF>第二种写法，就是在组件中使用的数据名称和从store中拿到的数据名称不一致</font>

```javascript
// client/app.vue
<template>
  <div id="app">
    <p>{{counter}}</p> // 组件里用的counter
  </div>
</template>
export default {
	computed: {
    ...mapState({
      counter: 'count' // 从store中拿出来的也是count
    })
  }
}
```

<font color=#1E90FF>第三种写法，就是组件中使用的数据还要在从store拿出的数据基础上继续改造</font>

```javascript
// client/app.vue
<template>
  <div id="app">
    <p>{{counter}}</p> // 组件里用的counter
  </div>
</template>
export default {
  computed: {
    ...mapState({
      counter: (state) => { return state.count + 1 } // 在store基础上继续改造
    })
  }
}
```

<font color=#1E90FF>**② mapGetters**</font>

基本上`mapGetters`和`mapState`的三种写法一致，我们这里就不都列举了，只列举一个最简单的：
```javascript
// client/app.vue
<template>
  <div id="app">
    <p>{{count}}</p>
    <p>{{fullName}}</p>  // 组件中直接使用
  </div>
</template>

<script>
export default {
  computed: {
    ...mapState(['count']),
    ...mapGetters(['fullName']) // 从store.getters中取出fullName
  }
}
</script>
```
不过如果你的版本比较低，使用`...`的语法可能需要安装<font color=#9400D3>babel-preset-stage-1</font>：
```javascript
npm i babel-preset-stage-1@6.24.1 -D --registry=https://registry.npm.taobao.org
```
然后在`.babelrc`当中添加一下这个`preset`：
```javascript
// .babelrc
{
  "presets": [
    "stage-1" // 添加
  ]
}
```

## mutation和action
### 1. mutation的配置和用法
关于`mutations`我们之前就已经说过了，我们这里要强调的是，通过`commit`提交一个`mutations`的时候，`commit`方法只能接受两个参数，如果你要提交多个值，你可以将第二个参数写成一个对象的形式：
```javascript
// 错误的写法
this.$store.commit('updateCount', num1, num2)

// 正确的写法
this.$store.commit('updateCount', {num1, num2})
```

另外，官网推荐我们在`mutations`当中去修改`state`，但是实际上可以直接在组件中通过`this.$store.state.count = 3`这种方式去修改，为了防止这种写法，我们可以在创建`Store`的时候配置<font color=#DD1144>strrct</font>属性：
```javascript
// client/store/store.js
let isDev = process.env.NODE_ENV === 'development'

export default () => {
  return new Vuex.Store({
    strict: isDev
  })
}
```
<font color=#1E90FF>因为正式环境不能使用这个属性，所以我们只在开发环境去规范开发人员的写法</font>。

### 2. action的配置和用法
`action`看上去和`mutations`其实差不多，创建`client/store/actions/actions.js`：
```javascript
// client/store/actions/actions.js
export default {
  updateCountSync (store, data) {
    setTimeout(() => {
      store.commit('updateCount', data.num)
    }, data.time)
  }
}
```
```javascript
// client/store/store.js
import actions from './actions/actions' // 导入

export default () => {
  return new Vuex.Store({
    actions                             // 集成
  })
}
```
既然差不多，<font color=#DD1144>actions和mutations的区别是哈？</font>：<font color=#1E90FF>因为mutations是必须要同步操作的，也就说你不能有异步的代码写在mutations当中，如果是异步代码，只能放在actions当中</font>, <font color=#DD1144>所以actions就是来处理一些异步修改数据的方法的</font>，所以我们在组件当中直接可以这样写：
```javascript
// client/app.vue
  mounted () {
    // actions的写法
    this.$store.dispatch('updateCountAsync', {
      num: 5,
      time: 2000
    })
   // mutations的写法
    let i = 1
    setInterval(() => {
      this.$store.commit('updateCount', {
        num: i++,
        num2: 2
      })
    }, 1000)
  },
```
<font color=#DD1144>实际上actions更大的作用是用来请求数据，尤其在ajax发送异步请求的时候非常有用，我们在最前面的图中也能看到</font>

### 3. mapActions和mapMutations
因为`actions`和`mutations`都是操作方面的事情，我们要写在`methods`当中：
```javascript
// client/app.vue
export default {
  mounted () {
    // 原始actions写法
    this.$store.dispatch('updateCountAsync', {
      num: 5,
      time: 2000
    })
    // 新的mapActions写法
    this.updateCountAsync({
      num: 5,
      time: 2000
    })


    let i = 1
    setInterval(() => {
      // 原始mutations写法
      this.$store.commit('updateCount', {
        num: i++,
        num2: 2
      })
      // 新的mapMutations写法
      this.updateCount({
        num: i++,
        num2: 2
      })
    }, 1000)
  },
  methods: {
    ...mapActions(['updateCountAsync']),
    ...mapMutations(['updateCount'])
  }
}
```
这种写法实际上就大大减少了书写的代码量，理解起来也更简单。

**参考资料**

1. [vuex最简单、最详细的入门文档](https://segmentfault.com/a/1190000009404727)