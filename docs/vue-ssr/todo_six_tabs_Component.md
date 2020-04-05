# Tabs组件

组件`Tabs`实际上是一个比较常用的组件，但是真正要实现一个`Tabs`是比较复杂，设计到很多的知识点。而已关键的是我们要想写好一个`Tabs`，我们能想到的使用方法和真正显示在`html`当中的`DOM`结构有很大的区别，我们的使用和实际的`DOM`结构如下：
```html
<!--使用的方法 -->
<tabs>
	<tab>
		<span slot="lable"></slot>
		<p>This is tab content</p>
	</tab>
<tabs>

<!--实际的DOM结构-->
<ul>
	<li>lable</li>
	<li>lable2</li>
</ul>
<div class="tab-container">
	<p>This is tab content</p>
</div>
```

## 组件基本实现
### 1. 实现基本结构
我们创建`client/components/tabs/tabs.vue`和`client/components/tabs/tab.vue`，分别来实现总的内容和单个`tab`的内容：
```javascript
// client/components/tabs/tabs.vue
<script>
export default {
  name: 'Tabs',
  props: {
    // 用于控制显示第几个tab
    value: {
      type: [String, Number],
      required: true
    }
  },
  render () {
    // 直接使用JSX语法
    return (
      <div class="tabs">
        <ul class="tabs-header">
          {this.$slots.default}
        </ul>
      </div>
    )
  }
}
</script>
```
+ <font color=#1E90FF>关于tabs.vue我们就不用template来写了，我们用render Function来写，因为后面有一些东西只能在render当中实现</font>
+ <font color=#9400D3>在render方法当中可以直接使用JSX语法，因为.vue文件处理script使用的是babel，在项目中，我们也在webpack中配置了babel，并且在babel中配置了transform-vue-jsx插件</font>

```javascript
// client/components/tabs/tab.vue
<script>
export default {
  name: 'Tab',
  props: {
    // 用于给当前tab做标记
    index: {
      required: true,
      type: [String, Number]
    },
    // 用于显示tab当中的内容
    label: {
      type: String,
      default: 'tab'
    }
  },
  computed: {
    // 标记当前tab是否是显示状态
    active() {
      return false
    }
  },
  render () {
    const tab = this.$slots.label || <span>{this.label}</span>
    const classNames = {
      tab: true,
      active: this.active
    }
    return (
      <li class={classNames}>{tab}</li>
    )
  }
}
</script>

<style lang="stylus" scoped>
.tab
  list-style none
  line-height 40px
  margin-right 30px
  position relative
  bottom -2px
  cursor pointer
  &.active
    border-bottom 2px solid blue
  &:last-child
    margin-right 0
</style>
```
### 2. 全局注册和使用
创建`client/components/tabs/index.js`,书写全局注册的函数：
```javascript
// client/components/tabs/index.js
import Tabs from './tabs.vue'
import Tab from './tab.vue'

export default (Vue) => {
  Vue.component(Tabs.name, Tabs)
  Vue.component(Tab.name, Tab)
}
```
最后到`clent/create-app.js`当中去注册：
```javascript
// clent/create-app.js
import Tabs from './components/tabs'

Vue.use(Tabs)
```
到目前为止，我们的所有结构就写的差不多了，然后我们去试用一下：
```javascript
// client/views/todo/todo.vue
<div class="tab-container">
	<tabs value="1">
		<tab label="tab1" index="1"/>
		<tab index="2">
			<span slot="label" style="color: red;">tab2</span>
		</tab>
		<tab label="tab3" index="3"/>
	</tabs>
</div>
```
可以看到第一个和第三个`tab`都是一样的，第二个`tab`上是用插槽的方式添加了一个`tab`的按钮内容。

## 组件状态和切换
### 1. 选中状态
判断选中状态，实际上比较简单，就是判断在`Tabs`当中的`value`属性和`Tab`当中的`index`相等，相等，这个`Tab`就是选中的，涉及到在后辈组件中拿到前辈组件中的属性，实际上设计到组件中的通信，<font color=#DD1144>所以你需要好好学习一下组件中的通信（<font color=#1E90FF>包括父子组件，祖孙组件，同级组件</font>），这个对于在设计良好的高级复杂的组件的时候十分重要</font>，这里我们来对比两种情况，我们项目中使用的比较简单的第一种方法：

<font color=#1E90FF>**① this.$parent**</font>

因为如果按照我们之前的写法，`Tabs`组件和`Tab`组件是父子关系，所以实际上在`Tab`中可以直接通过`this.$parent`拿到的，如下：
```javascript
// client/components/tabs/tab.vue
computed: {
	active () {
		return this.$parent.value === this.index
	}
}
```

<font color=#1E90FF>**② provide/inject**</font>

如果做的更复杂一些，用法更灵活一下，实际上`Tab`组件和`Tabs`组件并不一定是父子组件的关系，所以我们可以通过在`Tabs`组件当中声明`provide`其中一个值就是`value`，然后在`Tab`当中通过`inject`拿到`value`,并且做判断。

但是我们之前就说过，单纯的`provide/inject`传递的数据不是`relative`的，所以必须通过我们之前说过的<font color=#9400D3>Object.defineProperty</font>去解决这个问题。

<font color=#DD1144>所以遇到这样的问题，在组件上的通信方式选择上就要多多权衡一下，但是权衡的重点是你对组件的通信方式深入理解和使用</font>

### 2. 点击切换
```javascript
// client/components/tabs/tab.vue
export default {
	methods: {
		handeClick () {
			this.$parent.onChange(this.index) // 发送自己的index值
		}
	},
	render () {
		return (
			<li class={classNames} on-click={this.handeClick}> // 添加点击事件
				{tab}
			</li>
		)
	}
}

```
```javascript
// client/components/tabs/tabs.vue
export default {
	methods: {
		onChange (index) {
			this.$emit('change', index) // 拿到要显示的值，发出去
		}
	}
}
```
```html
// client/views/todo/todo.vue
<template>
  <section class="real-app">
    <div class="tab-container">
      <tabs :value="tabValue" @change="handleChangeTab"> <!-- tabs外部监听修改事件 -->
      </tabs>
    </div>
  </section>
</template>

<script>
export default {
  props: ['id'],
  data () {
    return {
      tabValue: '1' // 显示哪个tab的index，动态的以props形式传到tabs中的value
    }
  },
  methods: {
    handleChangeTab (value) {
      this.tabValue = value  // 根据value切换当前要展示tab
    }
  }
}
</script>
```

## 组件slot渲染
### 1. 完成雏形

最后就是这个`tab`的内容部分了，按照我们最常见的思维，既然是每个`tab`上的内容，自然而然每个`tab`中的`content`应该是写在`tab`组件中，实际上不是，因为你发现在`tab`组件当中只有一个`li`标签，也就是`tab`的标题，<font color=#DD1144>所以实际上不同tab中的content都要写在tabs当中</font>，我们下面来看一下代码：
```javascript
// client/components/tabs/tabs.vue
<script>
export default {
  data () {
    return {
      panes: [] // 记录所有tab中的content
    }
  },
  render () {
    // 从所有的tab中拿出应该显示的tab中的插槽，就是该显示tab中的content
    const contents = this.panes.map(pane => {
      return pane.active ? pane.$slots.default : null
    })

    return (
      <div class="tabs">
        <ul class="tabs-header">
          {this.$slots.default}
        </ul>
        <div class="tab-content"> // 添加content
          {contents}
        </div>
      </div>
    )
  }
}
</script>
```
```javascript
// client/components/tabs/tab.vue
<script>
export default {
  mounted () {
    this.$parent.panes.push(this) // 将自己整个的内容添加到父组件的数组中
  }
}
</script>
```

### 2 bug的解决
我们上面的写法貌似没有啥大问题，但是当你真正实操的时候：<font color=#DD1144>你会发现视图的更新会比数据的更新慢一步</font>这个问题你会经常在书写嵌套组件的时候发现，所以我们现在要这样解决，我们创建一个新的组件`client/components/tabs/tab-container.vue`:
```javascript
// client/components/tabs/tab-container.vue
<script>
export default {
  props: {
    panes: {
      type: Array,
      required: true
    }
  },
  render () {
    const contents = this.panes.map(pane => {
      return pane.active ? pane.$slots.default : null
    })
    return (
      <div class="tab-content">
        {contents}
      </div>
    )
  }
}
</script>
```
然后我们在`client/components/tabs/tabs.vue`中直接引入这个组件作为`tab`的容器即可：
```javascript
// client/components/tabs/tabs.vue
<script>
import TabContainer from './tab-container.vue'
export default {
  components: {
    TabContainer  // 注册
  },
  render () {
    return (
      <div class="tabs">
        <ul class="tabs-header">
          {this.$slots.default}
        </ul>
        <tab-container panes={this.panes}></tab-container> //直接使用
      </div>
    )
  }
}
</script>
```
这个问题大家不需要深究，只需要在出现这种问题的时候去按照上述方法处理即可。