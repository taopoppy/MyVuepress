# Vue中的组件-进阶

## Vue组件的双向绑定

### 1. 双向绑定的普通使用
我们之前说`v-model`这个指令的时候，说有两种情况，一种就是在表单元素中使用，一种是在组件当中使用，对于`v-model`的语法糖实质，我们之前在单个组件内部已经演示了，现在我们还是要完整的演示一下`v-model`语法糖在父子组件中的使用：
```javascript
const component = {
  props: ['value'],
  template: `
    <div>
      <input type="text" @input="handleInput" :value="value">
    </div>
  `,
  methods: {
    handleInput (e) {
      this.$emit('input', e.target.value)
    }
  }
}
new Vue({
  components: {
    CompOne: component
  },
  el: '#root',
  data () {
    return {
      value: '1'
    }
  },
  template: `
    <div>
      <comp-one :value="value" @input="value = arguments[0]"></comp-one>
    </div>
	`
})
```
<img :src="$withBase('/vuessr_vue_v-model1.png')" alt="v-model">

所以其实在组件中使用`v-model`实际上和在单个组件内部使用是一样的写法，所以对于上面的这个父组件，下面的两种写法一模一样：
```html
// 完整写法
<comp-one :value="value" @input="value = arguments[0]"></comp-one>

// 简单写法
<comp-one v-model="value"></comp-one>
```

### 2. 双向绑定的特殊使用
我们都知道：<font color=#1E90FF>默认的v-model对应的值和触发的事件分别是value和input，但是像单选框、复选框等类型的输入控件可能会将 value 特性用于不同的目的,所以它们v-model对应的值和触发事件不一定就是value和input。model 选项可以用来避免这样的冲突：</font>
```javascript
import Vue from 'vue'

const component = {
  model: {
    prop: 'value1',    // 将默认的value改成value1
    event: 'change'    // 将默认的input事件改为change事件
  },
  props: ['value1'],
  template: `
    <div>
      <input type="text" @input="handleInput1" :value="value1"> // 子组件中绑定的是value1
    </div>
  `,
  methods: {
    handleInput1 (e) {
      this.$emit('change', e.target.value) // 向父组件发射change事件
    }
  }
}
new Vue({
  components: {
    CompOne: component
  },
  el: '#root',
  data () {
    return {
      value: '1'
    }
  },
  template: `
    <div>
      /* 第一种原始写法*/
      <comp-one :value1="value" @change="value = arguments[0]"></comp-one>
      /* 第二种v-model简单写法*/
      <comp-one v-model="value"></comp-one>
    </div>
  `
})
```
上面你可以看到，如果是其他不默认不是`value`和`input`事件的组件，我们在父组件实现双向绑定的原始写法必须和子组件中的`value1`和`change`事件名称保持一致，<font color=#1E90FF>但是使用v-model就能将这些东西统一，避免了出错的可能，更简化了写法</font>

## 组件通信
### 1. props / $emit
父组件通过`props`的方式向子组件传递数据，而通过`$emit`子组件可以向父组件通信。这种方式是初学者最应该先掌握的，我们在上面的双向绑定中已经很详细的展示了这种方式，这里我们就不做赘述。

<font color=#9400D3>这种方式适用于父子组件的通信</font>

### 2. $children / $parent
+ 子组件中通过`$parent`访问到父组件，<font color=#1E90FF>访问到组件的意思是拿到父组件Vue实例的所有方法和data，所以在react中子组件如果调用父组件的方法必须要求父组件将这个方法通过属性传递的方式给子组件，但是vue中可以通过$parent.xxx()的方式直接调用</font>
+ 父组件中可以通过`$children`访问到保存所有子组件对象组成的数组，<font color=#1E90FF>$children并不保证顺序，也不是响应式的，应该尽量避免使用$children去做数据绑定</font>

### 3. provide / inject
<font color=#DD1144>父组件中通过provide来提供变量, 然后再子组件中通过inject来注入变量,不论子组件嵌套有多深, 只要调用了inject 那么就可以注入provide中的数据，而不局限于只能从当前父组件的props属性中回去数据</font>

但是，从官网的描述来看，通过`provide / inject`简单的使用是不能实现`reactive`动态的效果，也就是父组件提供的`provide`动态的变化是无法引起后辈组件中通过`inject`拿到数据的变化，但是<font color=#9400D3>我们在[组件高级](taopoppy.cn/vue-ssr/todo_three_vue_component_advanced.html)的那一节有详细的讲如何通过Object.defineProperty实现动态绑定的</font>

### 4. ref / $refs
<font color=#1E90FF>ref被用来给元素或子组件注册引用信息。引用信息将会注册在父组件的$refs对象上。如果在普通的DOM元素上使用，引用指向的就是DOM元素；如果用在子组件上，引用就指向组件实例：</font>

```javascript
<!-- `vm.$refs.p`是一个DOM节点 -->
<p ref="p">hello</p>

<!-- `vm.$refs.child`是一个子组件的实例 -->
<child-component ref="child"></child-component>
```

<font color=#DD1144>因为ref本身是作为渲染结果被创建的，在初始渲染的时候你不能访问它们 - 它们还不存在！$refs 也不是响应式的，因此你不应该试图用它在模板中做数据绑定，你应该避免在模板或计算属性中访问$refs</font>

```javascript
// 子组件
export default {
  name: 'baseInput'
  template: `<input ref="input">`,
  methods: {
    // 用来从父级组件聚焦输入框
    focus: function () {
      this.$refs.input.focus()
    }
  }
}

// 父组件
export default {
  template:`<base-input ref="usernameInput"></base-input>`
  mounted() {
    this.$refs.usernameInput.focus()
  }
}
```

<font color=#9400D3>其实$children / $parent 和ref / $refs在父子通信中都不适合做数据的绑定，而是适合在特殊的场景做函数调用</font>

## 插槽
<font color=#DD1144>插槽的作用可以用一句话形容，当父组件调用子组件的时候，子组件中的部分内容需要父组件具体给出</font>，通常这样的情况是这样：<font color=#1E90FF>子组件可能只是个布局组件，不同的父组件都需要这样的子组件，但是子组件中的内容需要父组件具体调用的时候具体给出</font>，这个时候就是插槽发挥作用的时候了

### 1. 具名插槽
<font color=#1E90FF>**① vue 2.5**</font>

具名插槽在`vue 2.5`和`vue 2.6`中有一个语法上的差异：<font color=#DD1144>在旧版本中是可以在template或者任何一个标签中去使用slot="name"这样的写法给插槽起名字</font>：
```javascript
import Vue from 'vue'

const component = {
  template: `
    <div>
      <div class="header">
        <slot name="header"></slot>
      </div>
      <div class="body">
        <slot name="body"></slot>
      </div>
    </div>
  `
}

new Vue({
  components: {
    CompOne: component
  },
  el: '#root',
  data () {
    return {
      value: '123'
    }
  },
  template: `
    <div>
      <comp-one>
        <template slot="header">   // 给template标签添加slot属性
          <p>this is slot</p>
          <p>this is part of header</p>
        </template>
        <p slot="body">this is part of body</p>  // 给具体的p标签添加slot属性
      </comp-one>
    </div>
  `
})
```

<font color=#1E90FF>**② vue 2.6**</font>

在新的版本2.6当中：<font color=#1E90FF>在向具名插槽提供内容的时候，我们可以在一个template元素上使用v-slot指令，并以v-slot的参数的形式提供其名称</font>，<font color=#DD1144>v-slot只能添加在template标签上，除了作用域插槽之外</font>
```javascript
new Vue({
  components: {
    CompOne: component
  },
  el: '#root',
  data () {
    return {
      value: '123'
    }
  },
  template: `
    <div>
      <comp-one>
        <template v-slot:header>   // 给template标签添加插槽名称header
          <p>this is slot</p>
          <p>this is part of header</p>
        </template>
              <comp-one>
        <template v-slot:body>     // 给template标签添加插槽名称body
          <p>this is slot</p>
          <p>this is part of body</p>
        </template>
      </comp-one>
    </div>
  `
})
```

### 2. 作用域插槽
我们首先来看一段代码：
```javascript
const component = {
  template: `
    <div>
      <slot></slot>
    </div>
  `,
}
new Vue({
  components: {
    CompOne: component
  },
  el: '#root',
  data () {
    return {
      value: '123'
    }
  },
  template: `
    <div>
      <comp-one>
        <p>{{value}}</p>  // 我们这里的value引用的是父组件new Vue当中的data；value
      </comp-one>
    </div>
  `
})
```
可以看到，我们在父组件当中引用子组件中的插槽的时候，使用插值的形式传入了`value`，这样的方式传入进去的是<font color=#1E90FF>存在于父组件当中的数据value，如果我们这里想使用子组件本身内部的一些value值，我们就要用到作用域插槽的概念了</font>,插槽的概念在`vue 2.5`的旧版本和`vue 2.6`的新版本中使用语法不同，我们下面来展示一下：

<font color=#1E90FF>**① vue 2.5**</font>

<font color=#1E90FF>就语法当中需要在插槽当中使用`slot-scope`拿到在子组件中传递给插槽的属性集合，然后在插槽中通过集合拿到子组件中的各个属性，并展示</font>

```javascript
const component = {
  template: `
    <div>
      <slot name="one" :sex="sex" ></slot>
      <slot name="two" :msg="msg"></slot>
    </div>
  `,
  data () {
    return {
      msg: 'taopoppy',
      sex: 'man'
    }
  }
}
new Vue({
  components: {
    CompOne: component
  },
  el: '#root',
  data () {
    return {
      value: '123'
    }
  },
  template: `
    <div>
      <comp-one>
        <span slot="one" slot-scope="slotProps1">{{slotProps1.sex}}</span> // 直接给标签添加slot-scope属性
        <template slot="two" slot-scope="slotProps2"> // 直接给template添加slot-scope属性
          <p>{{slotProps2.msg}}</p>
        </template>
      </comp-one>
    </div>
  `
})
```

<font color=#1E90FF>**② vue 2.6**</font>

在新的语法当中，直接可以在插槽当中使用绑定的方法，<font color=#DD1144>新语法中的具名插槽和作用域插槽可以共同使用一个表达式: <font color=#9400D3> v-slot:插槽名称="插槽prop名称"</font></font>，比如下面这样：

```javascript
new Vue({
  components: {
    CompOne: component
  },
  ...
  template: `
    <div>
      <comp-one>
        <span v-slot:one="slotProps1">{{slotProps1.sex}}</span> // 名称为one，prop名称为slotProps1的插槽
        <template v-slot:two="slotProps2">  // 名称为two，prop名称为slotProps2的插槽
          <p>{{slotProps2.msg}}</p>
        </template>
      </comp-one>
    </div>
  `
})
```
有了这样的作用域插槽，我们在父组件中书写插槽的时候既可以拿到通过作用域从自组件中传出的一些`data`，也同时可以拿到父组件中本身的一些`data`,这样的插槽组合起来就特别灵活和方便。


**参考资料**

1. [Vue实践-通过props:$emit:$refs:bus:$attrs:$listeners实现组件传值](https://www.bilibili.com/video/BV1EC4y147xE?from=search&seid=2044743830638220037)
2. [vue中8种组件通信方式, 值得收藏!](https://juejin.im/post/5d267dcdf265da1b957081a3#heading-20)
3. [Vue.js 父子组件通信的十种方式](https://zhuanlan.zhihu.com/p/48090472)