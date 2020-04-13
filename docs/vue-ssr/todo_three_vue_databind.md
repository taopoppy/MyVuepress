# Vue数据绑定和监听

## 数据绑定
### 1. 插值的使用
关于数据绑定，在`vue`当中主要的就是<font color=#DD1144>插值</font>的方法，不过要主要的一点就是在整个`{{}}`当中只允许你书写以下类型的东西：
+ `vue`实例当中的数据和属性
+ 部分白名单中的全局变量
+ `javascript`中一次性执行且存在返回值的操作
```javascript
// vue实例当中的数据和属性
new Vue({
	template: `
		<div>{{ msg }}<div>	
	`
})

// 部分白名单中的全局变量
new Vue({
	template: `
		<div>{{ new Date() }}</div>
	`
})

// javascript中一次性执行且存在返回值的操作
new Vue({
	template: `
		<div>{{ isShow ? 'show it': 'hide it' }}</div>
	`
})
```
基本上出了上述的这些用法，其他比如你在`{{}}`去写一些`if...else`这些东西，或者定义一个变量之类的都是不允许的。另外当你在`new Vue({})`的外部定义了一些变量，在`{{}}`同样也是不允许的。

### 2. Class和Style
<font color=#1E90FF>**① 对象语法**</font>

```javascript
new Vue({
	template: `
	<div :class="{ active: isActive }"></div>
	<div :style="styleObject"></div>
	`,
	data: {
		isActive: false,
		styleObject: {
			color: 'red',
			fontSize: '13px'
		}
	}
})
```
这种比较适合单个`class`随着某个属性去做判断的，`div`上是否存在`active`这个`class`取决于`isActive`值的真与否。<font color=#DD1144>一般这种用法多用在某个节点的显示和隐藏，或者某个动画鲜果的显示和隐藏</font>

<font color=#1E90FF>**② 数组语法**</font>

```javascript
new Vue({
	template: `
	<div :class="[activeClass, errorClass]"></div>
	<div :style="[baseStyles, overridingStyles]"></div>
	`,
	data: {
		activeClass: 'active',
		errorClass: 'text-danger',
		baseStyles: { color: 'red' },
		overridingStyles: { fontSize: '13px' }
	}
})
```
这种比较适合多个`class`在同一个节点上变化的，<font color=#1E90FF>比如有多个风格red，green，blue你可以选择，你可以随时修改activeClass中的值，修改activeClass为red就是红色风格，修改activeClass为blue就是蓝色风格</font>

<font color=#1E90FF>**③ 混合语法**</font>

```javascript
new Vue({
	template: `<div :class="[{activeClass: isActive}, errorClass]"></div>`,
	data: {
		isActive: false,
		errorClass: 'text-danger'
	}
})
```
很明显的看到这种就是<font color=#3eaf7c>对象语法</font>和<font color=#3eaf7c>数组语法</font>的混合模式，这种模式比较高级，一般在视图效果极好的项目或者风格多变的视图中会出现。<font color=#1E90FF>比如一个动画的效果同时有隐藏和显示的同时（对象语法），还有风格的选择（数组语法），这种混合语法的使用就恰到好处</font>


## computed
### 1. computed的场景和优势
关于`computed`计算属性的写法我们就不多赘述，我们这里要来用实例说明使用`computed`的好处在哪里：
```javascript
import Vue from 'vue'

new Vue({
  el: '#root',
  template: `
    <div>
      <p>Name:{{ name }}</p>
      <p>Name:{{ getName() }}</p>
      <p>Number: {{ number }}</p>
			<p><input type="text" v-model="number"></p>
      <p>FirstName: <input type="text" v-model="firstName"></p>
      <p>LastName: <input type="text" v-model="lastName"></p>
    </div>
  `,
  data: {
    firstName: 'Tao',
    lastName: 'Poppy',
    number: 0
  },
  computed: {
    name () {
      console.log('computed new name')
      return this.firstName + this.lastName
    }
  },
  methods: {
    getName () {
      console.log('methods new name')
      return this.firstName + this.lastName
    }
  }
})
```
可以很清楚的看到，对于相同的一个表达`name`，我们使用`name`作为`this.firstName`和`this.lastName`的计算属性，同时使用`getName`方法的方式返回了`name`这个属性，两者的的不同体现在哪里，我们可以通过两个操作表现出来。

首先我们要明确<font color=#DD1144>数据的更新会导致视图的重新渲染</font>，
+ 所以我们在绑定`number`的输入框中修改`number`的值会触发视图的渲染，会打印出`methods new name`,也就是说：<font color=#1E90FF>每一次的数据更新导致的视图变化，都会重新去执行getName方法，但是不会重新执行计算属性</font>，<font color=#DD1144>因为计算属性name在组件的created这个生命周期之前就已经完成了计算，并且保存在了缓存中，所以每次视图更新因为计算属性name有缓存，所以不用去重新执行</font>。

+ 当我们在修改绑定了`firstName`或者`lastName`的输入框中的内容就会更新数据，触发视图更新，但是同时会打印出`computed new name`和`methods new name`，后者我们上面已经说过，但是这里打印出`computed new name`说明了计算属性`name`进行了重新的计算。<font color=#1E90FF>这是因为计算属性本身就是根据this.firstName和this.lastName计算出来的，两者发生变化一定会导致计算属性重新计算</font>

根据上面我们的分析就能知道，使用`computed`的场景和好处：
+ <font color=#DD1144>computed通常的使用场景就是我们直接获取的数据并不是我们想直接展示在视图中的数据，我们需要经过对已有数据的处理后得到新的数据，这个数据是我们想展示在页面上的，那这个数据我们通常会设置成为计算属性</font>。
+ <font color=#DD1144>好处在于computed有缓存机制，它不会在根数据（上述示例中计算属性name的根数据就是this.firstName和this.lastName）没有发生变化的时候重新计算，而是利用缓存，这就极大的增强了性能，加快了页面重绘的速度</font>

### 2. computed的拓展
当然了`computed`还有拓展的写法：
```javascript
computed: {
	name: {
		get () {
			console.log('computed new name')
			return this.firstName + this.lastName
		},
		set (name) {
			const ports = name.split(' ')
			this.firstName = ports[0]
			this.lastName = ports[1]
		}
	}
}
```
之前我们的计算属性的写法比较简单，效果也比较简单，那就是<font color=#1E90FF>this.firtName和this.lastName的变化会影响name，但是name的变化影响不了根数据</font>，现在上述这种`get`和`set`的写法就让计算属性和根数据能够双向影响，<font color=#DD1144>但是不到万不得已的时候不推荐这样写，理由很简单，计算属性合成简单，拆分难，如果计算属性是经过很复杂的计算过程得来，为了达到双向对称的影响效果，set里面就必须精确的书写和get中逆序的计算拆分，万一书写不对，就会造成无限的计算和循环</font>

## watch
### 1. watch的使用场景
`watch`是监听的意思，它会监听某个数据的变化，然后去做一些列操作
```javascript
new Vue({
	el:'#root',
	template: `
	<div>
		<p>FullName: {{fullName}}</p>
	</div>	
	`,
	data: {
		firstName: 'Taopoppy',
		fullName: '',
	},
	watch: {
		firstName(newName, oldName) {
			this.fullName = newName + ' ' + this.lastName
		}
	}
})
```
可以看到虽然`computed`和`watch`的比较像，但实际上差别很大，使用场景也完全不同，<font color=#DD1144>watch的使用场景多用于某单个数据的变化造成的影响，比如当某个数据发生了变化，我们就要给后台发一个ajax请求，这种场景是适合于watch的</font>，而这种场景完全不适合`computed`，所以基本上两者不会存在混淆的地方。

上述的这种`watch`写法是简化的写法，它最大的缺点有两个：
+ <font color=#1E90FF>这种简化写法导致watch方法在最开始绑定的时候是不执行的</font>，也就是开始的时候`fullName`在页面上并没有值，还是我们在`data`设置的空值，只有当`firstName`啥时候第一次变化，才会执行`watch`中的`firstName`方法，`this.fullName`才会有值。
+ <font color=#1E90FF>这种简化的写法无法监听包含属性的对象</font>，我们下面在`watch`的扩展中详细说明

### 2. watch的扩展
```javascript
new Vue({
	el:'#root',
	template: `
	<div>{{obj.a}}</div>
	`,
	data: {
		obj: {
			a:'123'
		}
	},
	watch: {
		obj: {
			handler(newObj, oldObj) {
				console.log(newObj, oldObj)
			},
			immediate: true, // 绑定的时候就马上执行一下handler
			deep: true  // 深入监听
		}
	}
})
```
可以看到`watch`的完整写法如上所示：
+ <font color=#1E90FF>handler实际上对应的就是我们默认在监听到数据变化后要执行的函数</font>
+ <font color=#DD1144>immediate可以解决简化写法的第一个缺点，在监听器首次绑定到数据的时候就会主动去执行一次</font>
+ <font color=#DD1144>deep属性的默认值是false，watch在监听像obj这样的一个对象的时候，对象内部的属性变化不会导致视图重绘，在当数据为对象的时候，数据变化的含义就是对象引用的变化，对象内部属性的变化对数据整体来说只能算一次修改，所以obj.a的变化不能导致handler方法的执行</font>，<font color=#1E90FF>但是当我们设置deep为true的时候就是深入监听，对象中的每个属性的变化都能够触发对象的变化监听，handler函数就能执行</font>

上面这还属于简单的情况，如果对象中有很多属性，这些属性经常变化，那么我们设置`deep`是值得的，<font color=#1E90FF>因为deep会让监听器依次遍历对象上所有的属性，会有性能损耗</font>，如果一个对象中只有一个或者几个属性会经常变化，我们推荐下面的这种写法：
```javascript
watch: {
	'obj.a': {
		handler(newObj, oldObj) {
			console.log(newObj, oldObj)
		},
		immediate: true
	}
}
```

<font color=#3eaf7c>总结</font>：
+ <font color=#DD1144>无论我们使用computed还是使用watch都不要去在里面修改值</font>
	+ <font color=#1E90FF>在computed中不要去修改根数据的值，修改不当麻烦大</font>
	+ <font color=#1E90FF>在watch中不要去修改监听数据本身，否则会造成无限循环</font>