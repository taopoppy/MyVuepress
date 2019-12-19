# Vue中的组件-进阶

## Vue组件的双向绑定
<font color=#1E90FF>**① 普通使用**</font>

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
所以其实在组件中使用`v-model`实际上和在单个组件内部使用是一样的写法，所以对于上面的这个父组件，下面的两种写法一模一样：
```html
// 完整写法
<comp-one :value="value" @input="value = arguments[0]"></comp-one>

// 简单写法
<comp-one v-model="value"></comp-one>
```

<font color=#1E90FF>**② 拓展使用**</font>
我们都知道：<font color=#1E90FF>默认的v-model对应的值和触发的事件分别是value和input，但是像单选框、复选框等类型的输入控件可能会将 value 特性用于不同的目的。model 选项可以用来避免这样的冲突：</font>
