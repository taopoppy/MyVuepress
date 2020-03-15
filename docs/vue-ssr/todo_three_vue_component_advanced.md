# Vue中的组件-高级

## provide/inject方法
<font color=#DD1144>在不是父子关系，而是跨层级关系（比如子孙组件关系或者曾子孙组件关系）当中提供一个上下文关系的时候，我们需要provide来帮助我们让跨层级之间的组件进行沟通</font>

下面我们来实现一个父组件和子组件和孙子组件同时实现`value`绑定的效果：
```javascript
// 孙子组件
const ChildComponent = {
  template: '<div>child component {{data.value}}</div>',
  inject: ['yeye', 'data'],
  mounted () {
    //
  }
}

// 子组件
const component = {
  name: 'comp',
  components: {
    ChildComponent
  },
  props: ['value'],
  template: `
    <div :style="style">
      <p>component {{value}}</p>
      <slot :value="value" aaa="111" ></slot>
      <child-component/>
    </div>
  `,
  data () {
    return {
      style: {
        width: '200px',
        height: '200px',
        border: '1px solid #aaa'
      },
      value: 'taopoppy'
    }
  }
}

// 父亲组件
new Vue({
  components: {
    CompOne: component
  },
  provide () {
    const data = {}
    // 给data的value属性创造get方法，每次调用都能重新去拿this.value，这也是vue中数据reactive的基础
    Object.defineProperty(data, 'value', {
      get: () => this.value,
      enumerable: true // 可读
    })
    return {
      yeye: this,
      data
    }
  },
  el: '#root',
  data () {
    return {
      value: '123'
    }
  },
  template: `
  <div>
    <comp-one v-model="value">
      <span slot-scope="slotProps1">{{slotProps1.value}} {{slotProps1.aaa}}</span>
    </comp-one>
    <input type="text" v-model="value"/>
  </div>
  `
})
```
父子组件的绑定我们已经在`v-model`中说的不爱说了，现在想想父组件和孙子组件怎么进行沟通？<font color=#1E90FF>实际上在组件渲染的时候是一个树状的结构，先渲染父组件，然后渲染所有的子组件，然后渲染所有的孙子组件</font>，<font color=#DD1144>在这样一个树状渲染过程中，父组件可以将自己通过provide方法将自己或者自己的数据广播出去，所有的后辈组件都可以通过inject拿到父组件广播出来的数据</font>

<font color=#DD1144>但是通过一般的广播，父组件和后辈组件传播的数据不是动态的，或者说不是reactive的，当父组件的数据变化时，后辈组件通过广播拿到的数据不会随之变化，要想达到reactive的效果，就必须按照上述代码通过Object.defineProperty给数据设置get方法</font>

<font color=#1E90FF>设置get方法的效果就是，每次父组件中的数据变化后，后辈组件中的数据是通过这个get方法重新来拿数据的，那就达到了reactive的效果，看起来就是绑定在一起的</font>

## render方法
我们在`vue`实例当中书写`template`的时候，它并不是真正会显示到浏览器中的`Dom`节点，而是按照你写的`template`的模板通过`render`方法进行编译，我们可以直接在`vue`实例中去写render方法来代替`template`，这不过很麻烦：
```javascript
import Vue from 'vue'

const component = {
  name: 'comp',
  props: ['props1'],
  // template: `
  //   <div :style="style">
  //     <slot></slot>
  //   </div>
  // `,
  render (createElement) {
    return createElement(
      // 第一个参数是个字符串，表示创建元素标签的名称
      'div',
      // 第二个参数是个对象，表示这个标签上的属性
      {
        style: this.style,
        on: {
          click: () => { this.$emit('click') }
        }
      },
      // 第三个参数，如果是slot，直接使用this.$slots.具名插槽的名称
      [
        this.$slots.default,
        this.props1
      ]
    )
  },
  data () {
    return {
      style: {
        width: '200px',
        height: '200px',
        border: '1px solid #aaa'
      },
      value: 'taopoppy'
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
  methods: {
    handClick () {
      console.log('Cliked')
    }
  },
  mounted () {
    console.log(this.$refs.comp.value, this.$refs.span.value)
  },
  // template: `
  //   <comp-one ref="comp">
  //     <span ref="span">{{value}}</span>
  //   </comp-one>
  // `,
  render () {
    return this.$createElement(
      // 第一个参数是个字符串，表示创建元素标签的名称
      'comp-one',
      // 第二个参数是个对象，表示这个标签上的属性
      {
        ref: 'comp',
        props: {
          props1: this.value
        },
        on: {
          click: this.handClick
        }
      },
      // 第三个参数，如果标签中还有子节点，就是个数组，如果是值，就直接写值
      [
        this.$createElement('span', {
          ref: 'span'
        }, this.value)
      ]
    )
  }
})
```
关于`createElement`方法，涉及到虚拟`Dom`的概念：<font color=#1E90FF>通过createElement方法创造出来并不是一个真正的html节点，而是一个Vnode的一个类，它是存储在内存中的一个类似于Dom结构的对象，当着Vnode更新后，会和真正的Dom结构对比，将变化的部分转换成真正的Dom节点，并填入真正的html结构中去</font>。

通过上面的代码我们就能清楚的知道一些东西：
+ <font color=#DD1144>我们书写的template和render方法中的这些东西没有区别，只不过用template书写更简单，更方便，更直观，本质还是通过render去编译成为一个vue中的调用方法，所以如果你在template中书写有错误，实质上就是调用createElement函数传的参数有问题</font>
+ <font color=#1E90FF>上述关于createElement的两种使用方法效果一样，可以直接在render中使用this.$createElement，也可以将createElement作为参数传给render方法使用</font>