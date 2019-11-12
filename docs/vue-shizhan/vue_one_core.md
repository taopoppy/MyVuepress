# Vue的核心概念

我们在了解三个重要的核心概念之前，还是要重新温习一下什么是组件：<font color=#DD1144>组件就是一个个独立的，可复用的UI模块</font>

所以`Vue`中的组件就是一个个的<font color=#1E90FF>Vue实例</font>，`Vue`实例就是通过<font color=#1E90FF>new Vue(options)</font>创造出来的东西，所以我们写`Vue`组件实际做的工作就是去配置一个个实例组件要传入的 <font color=#1E90FF>options</font>
+ <font color=#DD1144>Vue组件</font> = <font color=#DD1144>Vue实例</font> = <font color=#DD1144>new Vue(<font color=#3eaf7c>options</font>)</font>

## 属性
### 1. 自定义属性props
自定义属性就是：<font color=#DD1144>组件props中声明的属性</font>

<font color=#1E90FF>**① props的用法**</font>

那基本上官网给的例子已经是我们写`props`所有可能的用法了
```javascript
Vue.component('my-component', {
  props: {
    // 基础的类型检查 (`null` 和 `undefined` 会通过任何类型验证)
    propA: Number,
    // 多个可能的类型
    propB: [String, Number],
    // 必填的字符串
    propC: {
      type: String,
      required: true
    },
    // 带有默认值的数字
    propD: {
      type: Number,
      default: 100
    },
    // 带有默认值的对象
    propE: {
      type: Object,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function () {
        return { message: 'hello' }
      }
    },
    // 自定义验证函数
    propF: {
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return ['success', 'warning', 'danger'].indexOf(value) !== -1
      }
    }
  }
})
```
<font color=#1E90FF>**② 单项数据流**</font>

官网是这样介绍`props`和单项数据流的：<font color=#1E90FF>所有的 prop 都使得其父子 prop 之间形成了一个单向下行绑定：父级 prop 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外改变父级组件的状态，从而导致你的应用的数据流向难以理解。额外的，每次父级组件发生更新时，子组件中所有的 prop 都将会刷新为最新的值。这意味着你不应该在一个子组件内部改变 prop。如果你这样做了，Vue 会在浏览器的控制台中发出警告。</font>

[<font color=#ff6100>思考问题</font>]：自组件为何不可以修改父组件传递的`Prop`，如果修改了，`Vue`是如何监控到属性的修改并给出警告的。

### 2. 原生属性attrs
原生属性就是： <font color=#DD1144>没有声明的属性，默认自动挂载到组件根元素上，设置inheritAttrs为false可以关闭的自动挂载</font>

### 3. 特殊属性class等
+ 特殊属性就是：<font color=#DD1144>挂载到组件根元素上，支持字符串，对象，数组等多种语法</font>
+ 特殊属性有：<font color=#1E90FF>class</font>、<font color=#1E90FF>style</font>、<font color=#1E90FF>ref</font>、<font color=#1E90FF>key</font>等等

## 事件
### 1.普通事件
普通事件是指：<font color=#DD1144>@click、@input、@change、@xxx等事件，通过this.$emit('xxx',...)触发</font> 

### 2. 修饰符事件
修饰符事件指：<font color=#DD1144>@input.trim、@click.stop、@submit.prevent等等，一般用于原生HTML元素，自定义组件需要自定义</font>

[<font color=#ff6100>思考问题</font>]：`this.$emit`的返回值是什么

## 插槽
### 1. 普通插槽
+ 2.5旧式写法：`<template slot="xxx">...</template>`
+ 2.6新式写法：`<template v-slot:"xxx">...</template>`

### 2.作用域插槽
+ 2.5旧式写法：`<template slot="xxx" slot-scope="props">...</template>`
+ 2.6新式写法：`<template v-slot:"xxx"="props">...</template>`

## 双向绑定和单项数据流
+ <font color=#DD1144>双向绑定</font>：`model`更新`view`,反过来`view`也能更新`model`
+ <font color=#DD1144>单项数据流</font>：`model`更新`view`，但是`view`的更新和`model`没有啥关系

那么我们常常说的`vue`到底是双向绑定还是单项数据流？因为这两者并不可能共存，那实际真相是：<font color=#1E90FF>vue是单向数据流，并不是双向绑定，人们通常说的Vue的双向绑定只不过是一中语法糖</font>
```html
    <PersonalInfo 
      v-model="phoneInfo" 
      :zip-code.sync="zipCode"
    />
    <PersonalInfo
      :phone-info="phoneInfo"
       @change="val => { phoneInfo = val }"
      :zip-code="zipCode"
      @update:zipCode="val => { zipCode =val }"
    />
```

所以通常面试当中的关于`Vue`的双向绑定会说和`Object.defineProperty`有关，但是实际上，<font color=#1E90FF>Object.defineProperty是用来做响应式更新的，和双向绑定没有什么关系</font>