# Vue中的组件-基础

## Vue组件的注册

### 1. 全局注册
```javascript
const component = {
  template: `
    <div>this is component</div>
  `
}
Vue.component('CompOne', component)

new Vue({
  el: '#root',
  template: `<comp-one></comp-one>`
})
```
+ <font color=#1E90FF>首先对于组件名的命名我们推荐使用kebab-case和PascalCase的方式，这种方式的写法就是上面的这种写法，给组件起名字的时候使用PascalCase的方式，首字母全部大写，当在父组件中使用子组件的时候使用kebab-case横杠连接的这种方式</font>
+ 这些组件是全局注册的。也就是说它们在注册之后可以用在任何新创建的`Vue`根实例(`new Vue`)的模板中。

### 2. 局部注册
全局注册往往是不够理想的。比如，如果你使用一个像`webpack`这样的构建系统，全局注册所有的组件意味着即便你已经不再使用一个组件了，它仍然会被包含在你最终的构建结果中。这造成了用户下载的`JavaScript`的无谓的增加。

在这些情况下，你可以通过一个普通的`JavaScript`对象来定义组件：
```javascript
// 普通的js对象
const component = {
  template: `
    <div>this is component</div>
  `
}

new Vue({
  el: '#root',
  components: {
    CompOne: component    // 注册进入某个vue实例
  },
  template: `<comp-one></comp-one>`
})
```
+ 对于父组件中的`components`对象中的每个属性来说，其属性名就是自定义元素的名字，其属性值就是这个组件的选项对象。<font color=#1E90FF>这样书写之后，component这个普通的对象就可以作为父组件的子组件在父组件中使用了</font>
+ <font color=#DD1144>注意局部注册的组件在其子组件中不可用，也就是说无论哪里需要将这个component普通的js对象作为子组件来使用，都要在自己的components对象中注册这个js对象成为子组件</font>。

### 3. data核心
<font color=#1E90FF>**① data必须是一个函数**</font>

<font color=#DD1144>当我们书写一个要复用的组件或者使用Vue.component去申明一个子组件的时候，组件的data选项必须是一个函数，因此每个实例可以维护一份返回对象的独立的拷贝</font>

<font color=#1E90FF>**② data函数中必须返回新的对象**</font>

```javascript
// 错误的写法
const count = 0
Vue.component('CampOne', {
	data() { return count }
})
Vue.component('CampTwo', {
	data() { return count }
})

// 正确的写法
Vue.component('CampOne', {
	data() {
		return {
			count: 0
		}
	}
})
Vue.component('CampTwo', {
	data() {
		return {
			count: 0
		}
	}
})
```
因为对于每个组件来说，都应该维护一份独立的数据，如果直接`return count`，那么对于`CampOne`和`CampTwo`两个独立的组件来说他们的数据就绑定在了一起，两个组件相互影响，这个就肯定不对的，<font color=#1E90FF>所以一定要在data函数当中返回一个新的对象</font>

## Props
<font color=#DD1144>props是用来定义组件被外部使用的时候，组件内部一些可变的行为。或者说props是外部组件来约束这个组件的展示行为的</font>

### 1. Prop的大小写
<font color=#DD1144>Prop的书写方式和组件类似，只不过在定义的时候使用
camelCase驼峰命名，在使用的时候依旧使用kebab-case的连接方式</font>

```javascript
Vue.component('blog-post', {
  props: ['postTitle'],   // 定义的时候是camelCase驼峰
  template: '<h3>{{ postTitle }}</h3>'
})

// 在使用的时候是kebab-case横线连接
<blog-post post-title="hello!"></blog-post>
```
### 2. props类型和校验

对于`props`的类型和校验在官网上有详细的说明，对于每种类型的传递和校验，以及自定义的验证函数都有非常好的实例，这里我们就不过多说明：
+ [https://cn.vuejs.org/v2/guide/components-props.html#Prop-%E7%B1%BB%E5%9E%8B](https://cn.vuejs.org/v2/guide/components-props.html#Prop-%E7%B1%BB%E5%9E%8B)
+ [https://cn.vuejs.org/v2/guide/components-props.html#%E4%BC%A0%E9%80%92%E9%9D%99%E6%80%81%E6%88%96%E5%8A%A8%E6%80%81-Prop](https://cn.vuejs.org/v2/guide/components-props.html#%E4%BC%A0%E9%80%92%E9%9D%99%E6%80%81%E6%88%96%E5%8A%A8%E6%80%81-Prop)
+ [https://cn.vuejs.org/v2/guide/components-props.html#Prop-%E9%AA%8C%E8%AF%81](https://cn.vuejs.org/v2/guide/components-props.html#Prop-%E9%AA%8C%E8%AF%81)

### 3. 单向数据流
<font color=#DD1144>所有的prop都使得其父子prop之间形成了一个单向下行绑定：父级prop的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外改变父级组件的状态，从而导致你的应用的数据流向难以理解。</font>

<font color=#1E90FF>额外的，每次父级组件发生更新时，子组件中所有的prop都将会刷新为最新的值。这意味着你不应该在一个子组件内部改变prop。如果你这样做了，Vue 会在浏览器的控制台中发出警告。</font>

这里有两种常见的试图改变一个`prop`的情形：

<font color=#1E90FF>**① 这个prop用来传递一个初始值**</font>

这个子组件接下来希望将其作为一个本地的`prop`数据来使用。在这种情况下，最好定义一个本地的`data`属性并将这个 `prop`用作其初始值：
```javascript
props: ['initialCounter'],
data: function () {
  return {
    counter: this.initialCounter
  }
}
```

<font color=#1E90FF>**② prop以一种原始的值传入且需要进行转换**</font>

在这种情况下，最好使用这个`prop`的值来定义一个计算属性：
```javascript
props: ['size'],
computed: {
  normalizedSize: function () {
    return this.size.trim().toLowerCase()
  }
}
```
<font color=#DD1144>注意在JavaScript中对象和数组是通过引用传入的，所以对于一个数组或对象类型的prop来说，在子组件中改变这个对象或数组本身将会影响到父组件的状态。所以尽量减少修改props的操作</font>

## extend
关于组件的继承涉及到两个比较重要的`API`：<font color=#DD1144>Vue.extend</font> 和 <font color=#DD1144>extends</font>，两个`API`实际上作用一样，只不过用在不同开发模式下，一般在`.vue`文件的开发模式下更多的在组件内部使用属性`extend`，在`.js`文件开发的模式下会使用全局API`Vue.extend`来实现继承，我们来看一下两个`API`在官网上的说明：
+ <font color=#3eaf7c>Vue.extend( options )</font>：使用基础`Vue`构造器，创建一个“子类”。参数是一个包含组件选项的对象。<font color=#1E90FF>需要注意在Vue.extend()中data必须是函数</font> 
+ <font color=#3eaf7c>extends</font>: 允许声明扩展另一个组件(可以是一个简单的选项对象或构造函数)，而无需使用`Vue.extend`。<font color=#1E90FF>这主要是为了便于扩展单文件组件</font>。

<font color=#1E90FF>**① 用法（一）**</font>

```javascript
const component = {
  props: {
    active: {
      required: true
    }
  },
  template: `
    <div v-show="active">{{text}}</div>
  `,
  data () {
    return {
      text: 123
    }
  }
}
const CompVue = Vue.extend(component)
new CompVue({
  el: '#root',
  propsData: {// 这里就必须使用propsData，而不是props
    active: true
  },
  data: {// data如果和component中的data有重复就会覆盖
    text: 234
  }
})
```
这种用法怎么理解呢？<font color=#1E90FF>首先使用Vue.extend方法去以component作为模板创建一个Vue的子类CompVue，通过CompVue来创建一个Vue的实例，其中data和生命周期相关的方法都会和模板中定义的进行合并，相同的的内容覆盖，不同的进行合并</font>，<font color=#1E90FF>但是特殊的就是这个props，它在书写的使用必须使用propsData来向模板component中传递值，如上代码所示</font>。

<font color=#1E90FF>**② 用法（二）**</font>

```javascript
const component = {
  props: {
    active: Boolean
  },
  template: `
    <div v-show="active">{{text}}</div>
  `,
  data () {
    return {
      text: 123
    }
  }
}
const component2 = {
  extends: component,
  data () {
    return {
      text: 234
    }
  }
}

new Vue({
  el: '#root',
  components: {
    Comp: component2
  },
  template: `
    <comp :active="true"></comp>
  `
})
```
上述的这是第二种方法，这种方法就是：<font color=#1E90FF>component作为一个公共的模板，component2在此模板的基础上进行了其他的配置和加工就成为了一个可以复用在其他模块中的组件</font>，由此，我们也能看出`extends`继承的使用场景：<font color=#DD1144>假如我们有一个公用的组件，里面有很多比较泛的功能，使用起来有很多的配置项，但是在业务开发中可能压根用不到那么多的配置项，很多配置项都可以设置为默认值，而你所需要的功能又要做扩展，此时extends就有很大的用途了</font>。

说到这里，很多人保包括我自己在内很迷惑，组件继承的使用场景我还是没有搞明白，因为很容易和在父组件中使用子组件这种情况混淆。<font color=#1E90FF>其实你在父组件A中使用子组件B基本上处于B的功能完全符合A中使用的场景，但是通常如果B是别人写的，你想在A中使用会发现B中有70%的功能是满足的，但是30%是不满足我的需求的，此时你就可以写个C，继承B中70%的功能，然后剩下30%的功能进行重写，这就是继承。否则你还要完全重写一个D在A中使用，会浪费时间，D也会出现很多和B一样的代码</font>。