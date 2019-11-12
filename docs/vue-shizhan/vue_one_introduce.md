# Vue概述

一款渐进式`JavaScript`，数据驱动避免直接操作`DOM`，这个框架有下面这些特点：
+ <font color=#3eaf7c>更加轻量</font>： 通过`gzip`压缩之后只有20kb
+ <font color=#3eaf7c>渐进式框架</font>： 不需要学完所有的东西再去开发，它能保证你学习一部分就能用一部分
+ <font color=#3eaf7c>响应式的更新机制</font>： 数据的改变会导致视图的刷新
+ <font color=#3eaf7c>学习成本低</font>： 基于`html`的模板语法

## 第一个程序
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    .item {
      color: red;
    }
  </style>
</head>
<body>
  <div id="app">
    {{ msg }}
    <div>
      <input type="text" v-model="info">
      <button @click="handClick">添加</button>
    </div>
    <ul>
      <todo-item v-for="item in list" :item="item"></todo-item>
    </ul>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/vue@2.6.0"></script>
  <script>
    Vue.component('todo-item', {
      props: ['item'],
      template: '<li class="item">{{item}}</li>',
    })
    new Vue({
      el: '#app',
      data() {
        return {
          msg: 'hello geektime',
          info: '',
          list: [],
        }
      },
      methods: {
        handClick(){
          this.list.push(this.info)
          this.info = ''
        }
      }
    }) 
  </script>
</body>
</html>
```
基本上这个结构的`html`就是我们学习`vue`入门的这样一个程序，你也能够看到这样写`vue`有很多缺点：
+ <font color=#3eaf7c>这样定义的组件todo-item是全局的组件</font>
+ <font color=#3eaf7c>组件中的template是没有高亮效果的</font>
+ <font color=#3eaf7c>然后在组件当中书写的样式item是全局生效的，比较容易和其他class冲突</font>
+ <font color=#3eaf7c>没有构建步骤，没有热更新，还有预处理器，babel等等</font>

## 单文件组件
我们为了提高开发环境的舒适度就需要使用官方的脚手架工具：
+ <font color=#DD1144>npm install -g @vue/cli</font>
+ <font color=#DD1144>vue create my-app</font>
+ <font color=#DD1144>cd my-app</font>
+ <font color=#DD1144>npm run serve</font>

实际你无论是初学者还是已经学习了一段时间的`vue`,此时你拿到这样的项目目录你都要问问自己是不是懂这样的目录，哪个文件的作用是什么？
+ <font color=#1E90FF>public/index.html</font>：单页应用的载体，如果你亲手写了本小节最上面的第一个程序，你就知道在这个文件中的那个&lt;div id="app"&gt;&lt;/div&gt;是什么作用了，因为作为单页应用，外层最大的那个`Vue`实例是要挂载到这个`div`上面的。
+ <font color=#1E90FF>src/main.js</font>: 将最外层`Vue`实例挂载到`class="app"`那个`div`上面的具体程序文件
+ <font color=#1E90FF>src/App.vue</font>: 整个单页应用的首页

现在我们使用单文件的方法来改写第一个程序，其中还会讲解一下具名插槽和作用域插槽的使用方法
```html
<!-- App.vue-->
<template>
  <div id="app">
    {{ msg }}
    <div>
      <input type="text" v-model="info">
      <button v-on:click="handClick">添加</button>
    </div>
    <ul>
      <todo-item v-for="item in list" :key="item">
        <template v-slot:item="itemProps"><!--itemProps是子组件在slot中向父组件传递出来的一个对象{ checked：checked }-->
          <span :style="{fontSize: '20px', color:itemProps.checked ? 'red': 'blue'}">{{ item }}</span>
        </template>
      </todo-item>
    </ul>
  </div>
</template>

<script>
import TodoItem from './components/TodoItem'
export default {
  name: 'app',
  data() {
    return {
      msg: 'hello geektime',
      info: '',
      list: [],
    }
  },
  methods: {
    handClick(){
      this.list.push(this.info)
      this.info = ''
    }
  },
  components: {
    TodoItem
  },
}
</script>

<style>
#app {

}
</style>

```
```html
<!--TodoItem.vue -->
<template>
  <li class="item">
    <input type="checkbox" name="" id="" v-model="checked">
    <slot name="item" v-bind="{checked}"></slot>
  </li>
</template>>

<script>
export default {
  props: ['item'],
  data() {
    return {
      checked: false
    }
  }
}
</script>

<style scoped>
.item {
  color: red;
}
</style>
```
通过上面的代码演示，你可以看到我们使用了<font color=#DD1144>具名插槽</font>和<font color=#DD1144>作用域插槽</font>，现在来看你可以这样理解这两样东西
+ <font color=#1E90FF>插槽就是父组件希望给子组件传递一些样式和结构，让子组件用这种表现方法来展示数据</font>： 因为如果父组件只给子组件传递数据只需要用到属性和绑定即可
+ <font color=#1E90FF>作用域插槽就是子组件会在插槽当中向父组件传递一些状态</font>：提供状态被父组件拿到可以通过状态的不同，在插槽中传递不同的样式和结构

上述是我们初探`Vue`的一些代码和体验，有了这些细微的概念，我们下面就会去讲解一下核心的概念