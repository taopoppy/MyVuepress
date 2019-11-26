# 项目实战

## vue概述
### 1. vue介绍
+ <font color=#DD1144>数据绑定</font>
	+ 通常使用`javascript`来写了一部分数据并且要显示到页面上，做法就是通过`javascript`来操作`DOM`,这种实体操作`DOM`的行为很浪费时间和性能，关键是每一次数据有所改变都要做操作`DOM`的行为。<font color=#1E90FF>数据绑定做的事情就是将数据绑定到html上面，数据的变更会影响html上面的显示</font>
+ <font color=#DD1144>开发方式</font>
	+ 通过`.vue`文件的形式可以很好的利用组件开发的方式，可以很直观的看到一个组件的所有内容，`vue`本身无法很好的支持`jsx`语法，因为在`react`是通过`jsx`这种在`javascript`当中书写`html`方法动态的通过`render`方法生成`html`。每次有数据改变都要去重新执行`render`方法生称`html`
+ <font color=#DD1144>render</font>
	+ <font color=#1E90FF>render方法就是一个组件有数据变化的时候，都会通过render方法产生新的html，以这种方式来更新html，而我们在.vue文件最上面写的template就是render方法中的东西，它是通过createElement方法来一层一层遍历我们书写的节点，生成最终组件所有节点的一个树</font>

### 2. API介绍
+ <font color=#DD1144>生命周期方法</font>
	+ `vue`是借鉴了`react`当中的生命周期方法，在组件从开始创建到销毁的整个过程我们都可以通过`vue`的生命周期方法去做一些事情。
+ <font color=#DD1144>computed</font>
	+ `reactive`的中文名称为<font color=#1E90FF>反应性</font>，也就是说当数据发生改变，和数据相关的所以地方都会随着数据的变化发生变化，而`computed`是`reactive`更深一层的使用，我们在这里就不详细的说明了。

### 3. 配置开发
在正式使用`vue`开发之前我们还需要做一下配置：
```javascript
npm install babel-plugin-transform-vue-jsx@3.5.0 babel-preset-env@1.6.1 --registry=https://registry.npm.taobao.org
```
```javascript
npm install babel-plugin-syntax-jsx@6.18.0 babel-helper-vue-jsx-merge-props@2.0.3 --registry=https://registry.npm.taobao.org
```
然后我们配置`webpack.config.js`
```javascript
// webpack.config.js
module.exports = {
	module: {
		rules: [
						{
				test: /\.styl/,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true //在前者stylus会生成sourceMap,这里可以直接使用前者的sourceMap
						}
					},
					'stylus-loader'
				]
			},
		]
	}
}
```
```javascript
// postcss.config.js
const autoprefixer = require('autoprefixer')

module.exports = {
	plugins: [
		autoprefixer()  // 预加载在生成css的时候去添加厂商前缀
	]
}
```
```javascript
// .babelrc
{
	"presets": [
		"env"
	],
	"plugins": [
		"transform-vue-jsx" //专门处理在vue当中书写jsx的情况
	]
}
```
## TODO应用界面和逻辑实现
为了更好的说明我们这个`TODO`的应用，我们有必要在此前画个流程图来表示一下各个组件之间的关系，以及父子组件的方法交互：
<img :src="$withBase('/vuessr_todo_liuchengtu.png')" alt="todo流程图">

+ <font color=#1E90FF>input框</font>会触发`addTodo`方法，向`todos`数组头部添加元素，导致`todos`数据更新，促使重新渲染<font color=#1E90FF>item组件</font>
+ <font color=#1E90FF>item组件</font>中点击删除会向父组件<font color=#1E90FF>todo组件</font>抛出`del`事件，<font color=#1E90FF>todo组件</font>监听到就会使用本组件当中的`deleteTodo`方法去删除`todos`数组中的某个元素，促使<font color=#1E90FF>item组件</font>重新被渲染。
+ 而`tab`的切换会比较复杂，在子组件<font color=#1E90FF>tabs组件</font>点击切换`tab`的按钮会向父组件抛出`toggle`事件，父组件监听到就会使用`toggleFilter`将`filter`修改为子组件中传递的参数，由于`filter`发生变化，促使<font color=#1E90FF>tabs组件</font>重新渲染。
+ 在子组件<font color=#1E90FF>tabs组件</font>中点击删除所有已完成事件，会向父组件抛出`clearAllCompleted`事件，而父组件监听到会执行`clearAllCompleted`方法修改`todos`数组中的值，而`todos`的变化又促使<font color=#1E90FF>item组件</font>的重新渲染。

```javascript
// app.vue
<template>
  <div id="app">
    <div id="cover"></div>
    <Header></Header>
    <todo></todo>
    <Footer></Footer>
  </div>
</template>

<script>
import Header from './todo/header.vue'
import Footer from './todo/footer.jsx'
import Todo from './todo/todo.vue'

export default {
  components: {
    Header,
    Footer,
    Todo,
  }
}
</script>
```
```javascript
// header.vue
<template>
  <header class="main-header">
    <h1>JTodo</h1>
  </header>
</template>
```
```javascript
// footer.jsx
import '../assets/styles/footer.styl'

export default {
  data() {
    return {
      author: 'taopoppy'
    }
  },
  render() {
    return (
      <div id="footer">
        <span>Written by {this.author}</span>
      </div>
    )
  }
}
```
```javascript
// todo.vue
<template>
  <section class="real-app">
    <input
      type="text"
      class="add-input"
      autofocus="autofocus"
      placeholder="接下去要做什么？"
      @keyup.enter="addTodo"
    >
    <item
      :todo="todo"
      v-for="todo in filteredTodos"
      :key="todo.id"
      @del="deleteTodo"
    />
    <tabs
      :filter="filter"
      :todos="todos"
      @toggle="toggleFilter"
      @clearAllCompleted="clearAllCompleted"
    />
  </section>
</template>

<script>
import Item from './item.vue'
import Tabs from './tabs.vue'
let id = 0
export default {
  data() {
    return {
      todos: [],
      filter: 'all'
    }
  },
  components: {
    Item,
    Tabs,
  },
  computed: {
    filteredTodos() {
      if (this.filter === 'all') {
        return this.todos
      }
      const completed = this.filter === 'completed'
      return this.todos.filter(todo => completed === todo.completed)
    }
  },
  methods: {
    addTodo(e) {
      this.todos.unshift({
        id: id++,
        content: e.target.value.trim(),
        completed: false
      })
      e.target.value = ''
    },
    deleteTodo(id) {
      this.todos.splice(this.todos.findIndex(todo => todo.id === id), 1)
    },
    toggleFilter(state) {
      this.filter = state
    },
    clearAllCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed)
    }
  }
}
</script>
```
```javascript
// item.vue
<template>
  <div :class="['todo-item', todo.completed ? 'completed' : '']">
    <input 
      type="checkbox"
      class="toggle"
      v-model="todo.completed"
    >
    <label>{{todo.content}}</label>
    <button class="destory" @click="deleteTodo"></button>
  </div>
</template>

<script>
export default {
  props: {
    todo: {
      type: Object,
      required: true,
    }
  },
  methods: {
    deleteTodo() {
      this.$emit('del', this.todo.id)
    }
  }
}
</script>
```
```javascript
// tab.vue
<template>
  <div class="helper">
    <span class="left">{{unFinishedTodoLength}} items left</span>
    <span class="tabs">
      <span
        v-for="state in states"
        :key="state"
        :class="[state, filter === state ? 'actived' : '']"
        @click="toggleFilter(state)"
      >
        {{state}}
      </span>
    </span>
    <span class="clear" @click="clearAllCompleted">Clear Completed</span>
  </div>
</template>

<script>
export default {
  props: {
    filter: {
      type: String,
      required: true,
    },
    todos: {
      type: Array,
      required: true,
    }
  },
  data() {
    return {
      states: ['all', 'active', 'completed']
    }
  },
  computed: {
    unFinishedTodoLength() {
      return this.todos.filter(todo => !todo.completed).length
    }
  },
  methods: {
    clearAllCompleted() {
      this.$emit('clearAllCompleted')
    },
    toggleFilter(state) {
      this.$emit('toggle', state)
    }
  }
}
</script>
```
