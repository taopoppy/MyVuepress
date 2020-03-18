# Vuex(2)

## Vuex模块
### 1. state和mapState
<font color=#9400D3>**① state**</font>

但我们的应用越来越大的时候，将所有的数据放在一个`store`当中就会很麻烦，`Vuex`模块的用法实际上和直接使用`Vuex`差不多，但是有很多细节的地方需要注意,我们首先来展示一个最简单的`modules`的使用：
```javascript
// client/store/store.js
export default () => {
  return new Vuex.Store({
    modules: {
      a: {
        state: {
          text: 1
        }
      },
      b: {
        state: {
          text: 2
        }
      }
    }
  })
}
```
```javascript
// client/app.vue
<template>
  <div id="app">
    <p>{{textA}}</p>
    <p>{{textB}}</p>
  </div>
</template>

<script>
export default {
  computed: {
    textA () {
      return this.$store.state.a.text  // 从模块A中拿出数据
    },
    textB () {
      return this.$store.state.b.text// 从模块B中拿出数据
    }
  },
}
</script>
```
<font color=#9400D3>**① mapState**</font>

如果是使用`mapState`的方式，不能通过最简单的名称对应的写法，<font color=#1E90FF>必须是名称映射的方式</font>：
```javascript
// client/app.vue
computed: {
	...mapState({
		textA: (state) => state.a.text,
		textB: (state) => state.b.text
	})
}
```
### 2.getters和mapGetters
<font color=#9400D3>**① 获取module内部的state**</font>

要想在组件中使用`modules`中的`getters`中的数据，<font color=#1E90FF>必须使用namespaced：true将其规范化</font>：
```javascript
// client/store/store.js
export default () => {
  return new Vuex.Store({
    modules: {
      a: {
        namespaced: true, // 必须要设置
        state: {
          text: 1
        },
        getters: {
          textPlus (state) {
            return state.text + 1
          }
        },
      }
    }
  })
}
```
```javascript
// client/app.vue
<template>
  <div id="app">
    <p>{{textplusB}}</p>
  </div>
</template>

<script>
export default {
  computed: {
    ...mapGetters({
      'textPlusB': 'b/textPlus'
    })
  }
}
</script>
```

<font color=#1E90FF>**② 获取全局和其他模块中的state**</font>

实际上在`modules`当中的`getters`方法的参数不仅仅只有一个，实际上有三个:
```javascript
/*
* state 本模块中的state
* getters 本模块中的getters
* rootState 全局的state
*/
textPlus (state, getters, rootState) 
```
所以可以使用到本模块中的其他`getters`,也可以使用到全局的`state`，以及使用其他模块中的`state`:
```javascript
// 使用到本模块中的其他getters
getters: {
	textPlus (state, getters, rootState) {
		return state.text + getters.textPlusPlus
	},
	textPlusPlus (state) {
		return state.text + 1
	}
}
// 使用到全局的state
getters: {
	textPlus (state, getters, rootState) {
		return state.text + rootState.count
	}
}

// 使用其他模块中的state
getters: {
	textPlus (state, getters, rootState) {
		return state.text + rootState.b.text
	}
}
```

### 3. mutations和mapMutations
<font color=#9400D3>**① 全局性的mutations**</font>

<font color=#DD1144>默认Vuex中的所有mutations都会被放在全局的命名空间中，所以，你在模块中书写的这些mutation的方法名称不能相同</font>：

```javascript
// client/store/store.js
export default () => {
  return new Vuex.Store({
    modules: {
      a: {
        state: { text: 1 },
        mutations: {
          update_A_Text (state, text) { // update_A_Text是全局性的
            console.log('a.text', state) // 这里的state默认就是模块中的state
            state.text = text
          }
        }
      },
      b: {
        state: { text: 2 },
        mutations: {
          update_B_Text (state, text) { // update_B_Text是全局性的
            state.text = text
          }
        }
      }
    }
  })
}
```
```javascript
// client/app.vue
export default {
  mounted () {
    this.updateCountAsync({
      num: 5,
      time: 2000
    })
    this.update_A_Text('123') // 直接调用模块中的mutations的方法
    this.update_B_Text('456') // 直接调用模块中的mutations的方法
  },
  computed: {
    ...mapState({
      textA: (state) => state.a.text,
      textB: (state) => state.b.text
    }),
  },
  methods: {
		// 模块中的mutations和全局的mutations可以一起拿
    ...mapMutations(['updateCount', 'update_A_Text', 'update_B_Text'])
  }
}
```

<font color=#9400D3>**② 局域性的mutations**</font>

当项目越来越大，尤其是在分工合作的时候，不一定能保证所有模块中的`mutations`中的方法名称都不一样，所以这个时候可以用到<font color=#DD1144>局域性的mutations</font>：
```javascript
// client/store/store.js
export default () => {
  return new Vuex.Store({
    modules: {
      a: {
        namespaced: true,   // 设置成为局域性
        state: { text: 1 },
        mutations: {
          updateText (state, text) {
            console.log('a.text', state)
            state.text = text
          }
        }
      },
    }
  })
}
```
```javascript
// client/app.vue
export default {
  mounted () {
    this['a/updateText']('123') // 局域性a模块的mutations的写法
    this.updateText('456') // 全局性b模块的mutations的写法
  },
  computed: {
    ...mapState({
      textA: (state) => state.a.text,
      textB: (state) => state.b.text
    }),
  },
  methods: {
		// 通过 module名称/mutations名称
		// 比如a/update_A_Text来获取a模块中的update_A_Text这个mutations方法
    ...mapMutations(['updateCount', 'a/updateText', 'updateText'])
  }
}
```

### 4. actions和mapActions
<font color=#9400D3>**① 提交本模块的mutations**</font>

首先注意，每个`actions`方法的参数都是一个对象ctx，但这个对象当中有很多东西，包括本模块的`state`,`commit`方法，还有`rootState`等等，我们可以直接解构：
```javascript
// client/store/store.js
export default () => {
  return new Vuex.Store({
    modules: {
      a: {
        namespaced: true,
        state: {  text: 1 },
        actions: {
          add ({state, commit, rootState}) { // 解构
            commit('update_A_Text', rootState.count) // 提交本模块的update_A_Text这个mutations的方法
          }
        },
        mutations: {
          update_A_Text (state, text) {
            console.log('a.text', state)
            state.text = text
          }
        }
      },
    }
  })
}
```
```javascript
// client/app.vue
export default {
  mounted () {
    this['a/add']()  // 使用

  },
  methods: {
    ...mapActions(['a/add']) // 拿到a模块中actions方法add
  }
}
```

<font color=#9400D3>**② 提交全局和其他模块的mutations**</font>

<font color=#1E90FF>触发全局或者其他模块的mutations，我们需要写清楚其他模块名称和其他模块中的mutations的名称，以及设置{root: true}这样的参数</font>

```javascript
// client/store/store.js
export default () => {
  return new Vuex.Store({
    modules: {
			namespaced: true,
      a: {
        namespaced: true,
        state: { text: 1},
        actions: {
          // 提交全局的mutations方法updateCount
          addCount ({state, commit, rootState}) {
            commit('updateCount', 59666, {root: true})
          },
          // 提交B模块的mutations方法update_B_Text
          add_B_Text ({state, commit, rootState}) {
            commit('b/update_B_Text', 88888, {root: true})
          }
        }
      }
    }
  })
}
```
那实际上的情况还比较复杂：<font color=#1E90FF>如果a模块中没有设置namespaced: true这样的参数，提交B模块中的mutations的时候也不需要{root: true}，所以为了方便，我觉得统一大家用的时候都给模块设置命名空间</font>

## 动态注册模块
我们有的时候使用了`vue-router`的异步加载功能，`vuex`中有一个`modules`只有在那个异步加载的`router`当中才有使用，我们怎么实现让`store`当中的这个`modules`也是随着`router`中那个异步加载的组件一起异步加载，并不是项目一开始就随着`store`全部加载？<font color=#1E90FF>这里就需要store本身能提供动态注册modules的功能</font>：
```javascript
// client/index.js
const store = createStore()

store.registerModule('c', {  // 注册一个新的vuex的modules，名称为c
	state: {
		text: 3
	}
})
```
这个`c`和其他我们在`store`当中创建的`modules`用法是一样的。

## 热重载
我们修改`vuex`后都是要刷新页面的,我们需要在`client/store/store.js`当中添加一段`webpack`热更新普遍适用的代码,它需要的`api`，在`vuex`中都有所支持：
```javascript
// client/store/store.js
import Vuex from 'vuex'
import defaultState from './state/state'
import mutations from './mutations/mutations'
import getters from './getters/getters'
import actions from './actions/actions'

let isDev = process.env.NODE_ENV === 'development'

export default () => {
	//创建store
  const store = new Vuex.Store({
    strict: isDev,
    state: defaultState,
    mutations,
    getters,
    actions
  })

	// 给store添加热重载的功能
  if (module.hot) {
    module.hot.accept([
      './state/state',
      './mutations/mutations',
      './getters/getters',
      './actions/actions'
    ], () => {
      const newState = require('./state/state').default
      const newMutations = require('./mutations/mutations').default
      const newGetters = require('./getters/getters').default
      const newActions = require('./actions/actions').default

      store.hotUpdate({
        state: newState,
        mutations: newMutations,
        getters: newGetters,
        actions: newActions
      })
    })
  }
  return store
}
```
这样给`store`添加上热重载的功能，然后修改`vuex`中的内容，页面就不会重新刷新了，直接热重载出功能。

## 其他API和配置
### 1. store.subscribe
`store.subscribe`能够拿到所有`mutations`的变化，每一次`mutation`执行之后，这里书写的回调就会被触发。
```javascript
// client/index.js
store.subscribe((mutation, state) => {
	console.log(mutation.type) // mutation的类型
	console.log(mutation.payload) // mutation的参数
})
```

### 2. store.subscribeAction
`store.subscribeAction`就是监听`actions`了，没当某个`actions`被调用后，你能通过回调看到这个过程，你这里在这里进行监控，记录等操作，也有助于你查错。
```javascript
store.subscribeAction((action, state) => {
	console.log(action.type) // action的类型
	console.log(action.payload) // action的参数
})
```

那实际上，到这里我们就讲清楚了一些关于`vue-router`和`vuex`的东西，我们通过一张图来总结整个应用接入`vuex`和`vue-router`后的样子：

<img :src="$withBase('/vuessr_vuex_vue_router.png')" alt="项目全貌">