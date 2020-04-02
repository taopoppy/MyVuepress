# Notification组件

现在我们来讲一下怎么写一些全局的通用性组件，这些组件当中会用到我们平时不怎么用的`vue`开发的技巧和知识点。

## 组件基本实现
我们首先创建`client/components/notification`文件夹来放我们的`notification`组件的代码，我们先来实现组件的基本样式和里面的一些内容，那我们开发的这个组件有什么特点呢？<font color=#1E90FF>vue当中基本是通过组件开发的形式去使用组件的，要在模板当中去声明，然后才能使用，这种形式不太适合notification，<font color=#DD1144>我们要通过使用调用API形式的方法去调用这样的组件</font></font>

### 1. 基本代码的编写
我们创建`client/components/notification/notification.vue`:
```html
// client/components/notification/notification.vue
<template>
  <transition name="fade">
    <div
      class="notification"
      :style="style"
      v-show="visible"
    >
      <span class="content">{{ content }}</span>
      <a class="btn" @click="handleClose">{{ btn }}</a>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    content: {
      type: String,
      required: true
    },
    btn: {
      type: String,
      default: '关闭'
    }
  },
  data () {
    return {
      visible: true
    }
  },
  computed: {
    style () {
      return {}
    }
  },
  methods: {
    handleClose (e) {
      e.preventDefault() // 阻止默认事件
      this.$emit('close') // 向外部触发close事件，外部监听到close事件可以做自己的事情
    }
  }
}
</script>

<style lang="stylus" scoped>
.notification
  display: inline-flex
  background-color #303030
  color rgba(255, 255, 255, 1)
  align-items center
  padding 20px
  min-width 280px
  box-shadow 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)
  flex-wrap wrap
  transition all .3s
.content
  padding 0
.btn
  color #ff4081
  padding-left 24px
  margin-left auto
  cursor pointer
</style>
```

### 2. Vue.component+插件法全局注册组件
对于这样一个能全局使用，并且需要能够发布到第三方的组件，<font color=#CC99CD>我们要给他提供一个类似于插件的使用方法，我们可以在全局注册这个组件，这样每个业务组件中都能用到这个组件</font>,我们创建一个`client/components/notification/index.js`的文件：
```javascript
// client/components/notification/index.js
import Notification from './notification.vue'

export default (Vue) => {
  Vue.component(Notification.name, Notification)
}
```
上面提供了一个全局注册`Notification`组件的方法，那么我们只需要在`client/create-app.js`文件当中用使用插件的方式去使用这个方法即可：
```javascript
// client/create-app.js
import Notification from './components/notification'

Vue.use(Notification)
```
然后我们就能在任意的组件当中直接使用`Notification`这个组件，不需要在`components`当中先注册才能使用，因为`Notification`组件已经被注册到了全局。
```javascript
// client/app.vue
<template>
	<div>
		<notification content="test notify" />
	</div>
</template>
```

## 组件方法调用
### 1. 扩展组件
创建`client/components/notification/func-notification.js`文件，这个组件实际上是我们前面写的那个组件的扩展，通过扩展这个组件能达到通过调用API方式来调用组件的目的：
```javascript
// client/components/notification/func-notification.js
import Notification from './notification.vue'

export default {
  extends: Notification,
  // 覆盖extends的组件当中的computed中的属性
  computed: {
    style () {
      return {
        position: 'fixed',
        right: '20px',
        bottom: `${this.verticalOffset}px`
      }
    }
  },
  mounted () {
    this.createTimer()
  },
  methods: {
    createTimer () {
      if (this.autoClose) {
        this.timer = setTimeout(() => {
          this.visible = false
        }, this.autoClose)
      }
    },
    clearTimer () {
      if (this.timer) {
        clearTimeout(this.timer)
      }
    }
  },
  beforeDestory () {
    this.clearTimer()
  },
  data () {
    return {
      verticalOffset: 0,
      autoClose: 3000
    }
  }
}
```

### 2. Vue.prototype+插件法全局注册组件
组件扩展完毕还没有结束，要想以`API`调用的方式去调用组件，那么就要有生成组件的方法，我们创建一个`client/component/notification/function.js`
```javascript
// client/component/notification/function.js
import Vue from 'vue'
import Component from './func-notification'

// 因为是方法调用组件，所以通过js去创建Vue组件
const NotificationConstructor = Vue.extend(Component)

const instances = [] // 记录生成instance的数量
let seed = 1 // 生成组件的id

// 用来升成一个NotificationConstructor
const notify = (options) => {
  if (Vue.prototype.$isServer) return

  // autoClose我们希望在组件中以data的方式传入，其他以props传入即可
  const {
    autoClose,
    ...rest
  } = options

  const instance = new NotificationConstructor({
    // 创建实例时传递 props。只用于 new 创建的实例中。
    propsData: {
      ...rest
    },
    data: {
      autoClose: autoClose === undefined ? 3000 : autoClose
    }
  })

  const id = `notification_${seed++}`
  instance.id = id
  instance.vm = instance.$mount() // 先不挂载，先不插入到DOM中，只生成一个$el的对象，或者只生成一个节点
  document.body.appendChild(instance.vm.$el) // 把节点假如到整个body当中，因为是个通知组件

  // 计算一个高度
  let verticalOffset = 0
  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 16
  })
  verticalOffset += 16
  instance.verticalOffset = verticalOffset
  instances.push(instance)
  // 返回这个Vue实例
  return instance.vm
}

export default notify
```
有了这样的一个生成组件的方法，我们只需要在`Vue.prototype`上添加这个方法即可，那么所有的组件都能够通过调用`this`来调用这个方法来显示要调用的组件，从而起到了通过`API`调用组件的效果：
```javascript
// client/components/notification/index.js
import Notification from './notification.vue'
import notify from './function'

export default (Vue) => {
  // 全局注册组件的方法一，使用Vue.component
  Vue.component(Notification.name, Notification)
  // 全局注册组件的方法二，在Vue.prototype上添加的属性，在组件中直接可以通过this.xxx使用
  Vue.prototype.$notify = notify
}
```
无论是使用`Vue.component`还是`Vue.prototype`，我们最后都要通过`Vue.use`使用插件的方式来调用上述注册组件的方法，所以到目前为止，我们来总结一下引用全局组件的三种方式：
+ <font color=#1E90FF>普通的组件，引入要先在组件的components中声明，再使用</font>
+ <font color=#1E90FF>普通的组件，使用Vue.component()方法注册到全局</font>
+ <font color=#1E90FF>js创建的组件，使用Vue.prototype方法将创建组件的函数挂载到全局</font>

## 组件最终优化
### 1. 消除组件的优化
通过上面的几步，可能大家觉的没有问题了，但是我们要知道，我们在显示和隐藏`Notification`组件的时候使用的`v-show`，但是`v-show`大家都知道，是通过控制`css`的`display`属性来控制显示的，实际上的`DOM`依旧存在于内存当中，我们现在的优化就要让`Notification`组件在消失的时候也从内存中去掉。
```javascript
// client/components/notification/notification.vue
<template>
  <transition name="fade" @after-leave="afterLeave">
  </transition>
</template>

<script>
export default {
  methods: {
    // transition动画结束的时候
    afterLeave () {
      this.$emit('closed')
    }
  }
}
</script>
```
如上代码所示，我们在组件的动画结束的时候，监听了`@after-leave`事件，向外触发了一个`closed`的事件，也就是外部可以通过监听`closed`事件来真正的消除这个组件，我们在`client/components/notification/function.js`中添加下面的代码：
```javascript
// client/components/notification/function.js
const notify = (options) => {
  // 监听点击关闭按钮的close事件
  instance.vm.$on('close', () => {
    instance.vm.visible = false
  })

  // 监听transition动画已经结束的closed事件
  instance.vm.$on('closed', () => {
    // 进行删除节点的操作
    removeInstance(instance) // 删除在数组中的位置
    document.body.removeChild(instance.vm.$el) // 删除DOM节点
    instance.vm.$destroy() // 删除vm对象
  })
  // 返回这个Vue实例
  return instance.vm
}

const removeInstance = (instance) => {
  if (!instance) return
  // const len = instances.length
  // 找到实例在数组中的位置
  const index = instances.findIndex(inst => instance.id === inst.id)
  instances.splice(index, 1)
}
```

### 2. 调整其他instance高度
在我们出现多个`Notification`的时候，我们希望关闭其中一个`Notification`的时候其他`Notification`的高度会自动变化，<font color=#1E90FF>所以我们需要在删除某一个Notification的时候去调整其他Notification的高度</font>。

首先要去原始组件当中在`transition`完全渲染的时候拿到回调函数：
```javascript
// client/components/notification/notification.vue
<template>
  <transition name="fade"
    @after-enter="afterEnter"
   >
  </transition>
</template>

<script>
export default {
  methods: {
    // 完全渲染成功，即已经插入到DOM当中了
    afterEnter() { }
  }
}
</script>
```
然后我们到扩展组件当中去覆盖`afterEnter`，在这个方法中实际的拿到`Notification`的高度：
```javascript
// client/components/notification/func-notification.js
export default {
  methods: {
    afterEnter () {
      this.height = this.$el.offsetHeight
    }
  },
  data () {
    return {
			height: 0 // 记录实际的notification的高度,
			visible: false // 覆盖原始组件一开始就显示的bug
    }
  }
}
```
接着我们就能在删除这个`Notification`的时候去计算其他`Notification`的高度了：
```javascript
// client/components/notificaiton/funciton.js
const notify = (options) => {
  instance.vm.visible = true // instance的visible属性从false变成true才会致使transition有作用，同时相关的监听事件才有用
}

const removeInstance = (instance) => {
	// 计算其他notification的高度
  if (len <= 1) return
  const removeHeight = instance.vm.height // 拿到Notification的高度
  for (let i = index; i < len - 1; i++) {
    instances[i].verticalOffset = parseInt(instances[i].verticalOffset) - removeHeight - 16
  }
}
```

### 3. 焦点的时候不会消失
我们现在还有一个功能，就是我们的鼠标移动上去的时候，`Notification`是不会执行等3秒消失的函数，我们鼠标移除的时候才开始消失,所以我们需要在原始的组件上添加两个监听事件，分别是<font color=#1E90FF>鼠标移入</font>和<font color=#1E90FF>鼠标移出</font>：
```html
// client/components/notification/notification.vue
<template>
  <transition >
    <div
      @mouseenter="clearTimer"
      @mouseleave="createTimer"
    >
    </div>
  </transition>
</template>

<script>
export default {
  methods: {
    clearTimer () { }, // 该方法已经在扩展组件当中被重写覆盖
    createTimer () { }  // 该方法已经在扩展组件当中被重写覆盖
  }
}
</script>
```
