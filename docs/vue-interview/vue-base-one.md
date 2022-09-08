# vue3旧语法回顾

## 基础语法回顾
这里我们不会再一点一滴的书写`vue`的语法，我们直接就列举一些比较重点的点，然后新语法我们会在后面详细的说明

### 1. mvvm
`mvvm`设计模式，`m`就是`model`数据，`v`就是`view`视图，`vm`就是`viewModel`视图数据连接层, <font color=#3eaf7c>所以我们书写vue实际上data是我们要书写的数据层，template是我们要书写的视图层，而vm是vue帮助我们做的，这才是我们应该正确理解vue和mvvm的一部分</font>
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<script src="https://unpkg.com/vue@next"></script>
</head>
<body>
	<div id="root"></div>
</body>
<script>
	// createApp 表示创建一个vue应用，存储到app变量当中去
	// 传入的参数表示，这个应用最外层的组件，应该如何展示
	const app = Vue.createApp({
		data() {
			return {
				message: 'hello world'
			}
		},
		template:`
			<div>{{message}}</div>
		`
	})

	// vm 就代表了vue应用的根组件
	// vm.$data 可以获取到数据
	const vm = app.mount('#root')

</script>
</html>
```


### 2. 生命周期函数
首先，生命中周期函数的意思就是在某一个时刻会自动执行的函数
<img src="https://cn.vuejs.org/assets/lifecycle.16e4c08e.png" alt="生命周期">

+ `beforeCreate`: 是在创建`Vue`对象之前
+ `created`: 是创建好了`Vue`对象之后
+ 中间有一层将数据和`template`进行结合的过程，<font color=#1E90FF>实际就是执行了render函数</font>， 这里有一个判断，`Vue`当中有`template`属性就拿`template`作为模板，没有的话就拿正式`dom`的`root`根节点下的内容做模板。
+ `beforeMount`: 将render生成好的虚拟`dom`往真实的`dom`挂载之前
+ `Mounted`: 已经将虚拟`dom`代替了网页上真实的`dom`之后
+ `beforeUpdate`: 在`data`数据发生变化的时候会自动执行，但是页面还没有变化
+ `updated`: 页面随着`data`变化完毕之后自动执行
+ `beforeUnmount`: `Vue`应用失效的时候立即执行的函数，此时页面展示的东西还没变
+ `unmounted`: `Vue`应用失效，且`dom`完全销毁之后，自动执行的函数

### 3. 属性
+ 计算属性`computed`, 方便对固定的属性进行计算，带有缓存的效果，<font color=#3eaf7c>使用的比较广泛</font>
+ 监听属性`watch`方便在监听的属性变化后做对应的一系列改变，比如某个值改变了要去发送`http`请求就可以使用监听`watch`属性。


### 4. 事件绑定
+ <font color=#3eaf7c>点击事件同时传递参数和原生事件</font>:
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<script src="https://unpkg.com/vue@next"></script>
</head>
<body>
	<div id="root"></div>
</body>
<script>
	Vue.createApp({
		template: `
			<div>
				<button @click="handleAddBtnClick0">button</button>
				<button @click="handleAddBtnClick1(2, $event)">button</button>
			</div>
		`,
		methods: {
			// 没有参数，默认只有原生事件对象
			handleAddBtnClick0(event) {}
			// 同时传递参数和原生事件对象
			handleAddBtnClick1(num, event) {}
		}
	}).mount('#root')
</script>
</html>
```

+ <font color=#3eaf7c>点击事件绑定多个函数</font>
```html
<div>
	<button @click="handleClick1(), handleClick2()">button</button>
</div>
```

+ <font color=#3eaf7c>修饰符，阻止默认行为</font>
```html
<div>
	<button @click.prevent="handleClick1">button</button>
</div>
```

+ <font color=#3eaf7c>修饰符，阻止事件冒泡</font>
```html
<div>
	<button @click.stop="handleClick1">button</button>
</div>
```

+ <font color=#3eaf7c>修饰符，自身触发</font>
```html
<div>
	<div @click.self="handleClick">
		{{counter}}
		<button @click="handleClick1">button</button>
	</div>
</div>
```
点击子元素`button`不会触发`handleClick`,点击`counter`才可以触发。也就是说点击自己内部所有的html标签子元素，都不会触发`handleClick`,只有点击自己的内容元素才会触发`handleClick`

+ <font color=#3eaf7c>按键修饰符</font>
```html
<input @keydown.enter="handleKeyDown"/>
```
除了`enter`，还有`tab`、`delete`、`esc`、`down`等等

+ <font color=#3eaf7c>鼠标修饰符</font>
```html
<div @click.right="handleClick"></div>
```
鼠标的修饰符有`left`、`right`、`middle`等等

+ <font color=#3eaf7c>精确修饰符</font>
```html
<!-- 当按下 Ctrl 时，即使同时按下 Alt 或 Shift 也会触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 仅当按下 Ctrl 且未按任何其他键时才会触发 -->
<button @click.ctrl.exact="onCtrlClick">A</button>

<!-- 仅当没有按下任何系统按键时触发 -->
<button @click.exact="onClick">A</button>
```
允许控制触发一个事件所需的确定组合的系统按键修饰符。

### 5.双向绑定
+ <font color=#1E90FF>input</font>
```html
<script>
	Vue.createApp({
		data() {
			return {
				message: '',
			}
		},
		template: `
			<div>
				{{message}}
				<input v-model.lazy="message"/>
				<input v-model.number="message"/>
				<input v-model.trim="msg" />
			</div>
		`,
		methods: {
			handleAddBtnClick(num, event) {}
		}
	}).mount('#root')
</script>
```
`v-model.lazy`这个修饰符的意思就是输入框输入完毕，焦点失去的时候，才会去修改`message`,同时，输入完毕点击回车的时候，也会触发事件，不需要去书写`@keydown.enter`事件。
`v-model.number`这个修饰符的意思就是输入数字，将会以数字形式保存在`message`。如果你想要默认自动去除用户输入内容中两端的空格，你可以在`v-model`后添加`.trim`修饰符


+ <font color=#1E90FF>checkbox（多选）</font>
```html
<script>
	Vue.createApp({
		data() {
			return {
				message: [], // checkbox是多选，所以需要原始数据是个数组
			}
		},
		template: `
			<div>
				{{message}}
				jack <input type="checkbox" v-model="message" value="jack">
				dell <input type="checkbox" v-model="message" value="dell">
				lee <input type="checkbox" v-model="message" value="lee">
			</div>
		`,
		methods: {
			handleAddBtnClick(num, event) {}
		}
	}).mount('#root')
</script>
```

+ <font color=#1E90FF>radio（单选）</font>
```html
<script>
	Vue.createApp({
		data() {
			return {
				message: '', // radio是单选，所以需要原始数据是个字符串
			}
		},
		template: `
			<div>
				{{message}}
				jack <input type="radio" v-model="message" value="jack">
				dell <input type="radio" v-model="message" value="dell">
				lee <input type="radio" v-model="message" value="lee">
			</div>
		`,
		methods: {
			handleAddBtnClick(num, event) {}
		}
	}).mount('#root')
</script>
```

+ <font color=#1E90FF>select（下拉选择）</font>
```html
<script>
	Vue.createApp({
		data() {
			return {
				message: 'A', // select是单选，所以需要原始数据是个字符串
			}
		},
		template: `
			<div>
			{{message}}
			<select v-model="message">
				<option value="A">A</option>
				<option value="B">B</option>
				<option value="C">C</option>
			</select>
			</div>
		`,
		methods: {
			handleAddBtnClick(num, event) {}
		}
	}).mount('#root')
</script>
```
```html
<script>
	Vue.createApp({
		data() {
			return {
				message: [], // select也可以是多选，所以初始数据是个数组
				options:[
					{ text: 'A', value: 'A'},
					{ text: 'B', value: 'B'},
					{ text: 'C', value: 'C'},
				]
			}
		},
		template: `
			<div>
			{{message}}
			<select v-model="message" mutiple>
				<option v-for="item in options" :value="item.value">{{item.text}}</option>
			</select>
			</div>
		`,
		methods: {
			handleAddBtnClick(num, event) {}
		}
	}).mount('#root')
</script>
```


## 组件语法回顾
### 1. 全局和局部组件
+ <font color=#3eaf7c>全局组件</font>：只要定义了处处可以使用，<font color=#DD1144>性能不高，使用简单</font>
	+ 一般使用`app.component()`方式创建的都是全局组件
+ <font color=#3eaf7c>局部组件</font>：定义之后需要注册到被使用的组件当中，<font color=#DD1144>性能比较高，使用略麻烦</font>
	+ 直接通过定义变量的方式去定义，比如`const counter = {}`这种是属于局部组件，必须通过注册才能使用
	+ `.vue`类型的文件本质都是局部组件，调用必须要引用外加注册。
	+ 局部组件一般起名字要大写，与驼峰的JS变量区分，组件为`HelloWorld`，JS变量为`helloWorld`

### 2. Non-props
之前我们说父组件给子组件传递属性的时候，子组件通过`props`属性接收。
+ <font color=#1E90FF>但是如果子组件没有接收，则传递给子组件的属性会挂载到子组件当中最外层的标签上</font>
+ <font color=#1E90FF>如果想取消这样的行为，就使用`inheritAttrs:false`去取消即可,这样的话子组件没有通过props接收属性，这些属性也就不会挂载到子组件最外层的标签上</font>。

这个属性在修改样式的时候比较有用，比如修改子组件的最外层组件的大小之类的

如果子组件当中某个标签要继承父组件传来的所有`Non-props`属性，要使用<font color=#DD1144>$attrs</font>:
```html
<script>
	const app = Vue.createApp({
		template: `
			<div>
				<counter msg="hello" msg1="hello1"/>
				<counter1 msg="hello" msg1="hello1"/>
			</div>
		`
	})

	// 拿到所有Non-Props属性
	app.component('counter', {
		// inheritAttrs: false,
		template:`
			<div>Counter</div>
			<div v-bind="$attrs">Counter</div>
			<div>Counter</div>
		`
	})

	// 拿到部分Non-Props属性
	app.component('counter1', {
		// inheritAttrs: false,
		template:`
			<div v-bind:msg="$attrs.msg">Counter</div>
		`
	})

</script>
```

### 3. 父子组件通信
```html
<script>
	const app = Vue.createApp({
		data() {
			return {
				count: 0
			}
		},
		// 2. 父组件监听父组件addCount事件，但是要写成add-count的方式，并使用handleAdd函数处理
		handleAdd(params) {
			this.count += params
		},
		template: `
			<div>
				<counter :count="count" @add-count="handleAdd"/>
			</div>
		`
	})

	app.component('counter', {
		props: ['count']
		methods: {
			handleItemClick() {
				this.$emit('addCount', 2) // 1. 向父组件发射addCount事件,参数为2
			}
		}
		template:`
			<div @click="handleItemClick">{{count}}</div>
		`
	})

</script>
```
除了上面简单的用法，还可以在子组件对事件做判断，写法也有两种：
```html
<script>
	app.component('counter', {
		props: ['count'],
		emits: ['add'], // 第一种写法没啥作用，就能直观的告诉阅读代码的人子组件向外触发了多少个事件
		methods: {
			handleItemClick() {
				this.$emit('add', 2)
			}
		}
		template:`
			<div @click="handleItemClick">{{count}}</div>
		`
	})

</script>
```
```html
<script>
	app.component('counter', {
		props: ['count'],
		emits: {
			add:(count) => {
				return count > 0
			}
		} // 第二种写法是对子组件向外触发事件的参数判断，和props的对象写法类似，有判断作用，返回true，判断通过，返回false，判断不通过，就不会向外触发add事件
		methods: {
			handleItemClick() {
				this.$emit('add', 2)
			}
		}
		template:`
			<div @click="handleItemClick">{{count}}</div>
		`
	})

</script>
```

### 4. 双向绑定高级用法 - 父子组件通信
```html
<script>
	const app = Vue.createApp({
		data() {
			return {
				count: 0,
				count1: 0,
			}
		},
		template: `
			<div>
				<counter v-model:count="count" v-model:count1="count1"/>
			</div>
		`
	})

	app.component('counter', {
		props: ['count','count1'],
		methods: {
			handleItemClick() {
				// 发射更新count的事件，并且传递更新的值
				this.$emit('update:count', this.count + 1)
			},
			handleItemClick1() {
				this.$emit('update:count1', this.count1 + 2)
			},
		},
		template:`
			<div @click="handleItemClick">{{count}}</div>
			<div @click="handleItemClick1">{{count1}}</div>
		`
	})
	app.mount('#root')
</script>
```
上面这种写法注意一下，双向绑定就是互相影响，互相更新，上面这种写法也在实践的过程中经常使用到。而且代码量减少了很多。

### 5. 插槽
插槽要解决的问题就是：<font color=#DD1144>当你使用某个组件间，组件内部某个部分需要开发者在开发的时候自己定义，这时候你需要使用插槽，将自定义的部分书写在组件的标签里面</font>。

所以正确理解插槽可以这样理解：<font color=#1E90FF>父组件可以给子组件传递属性或者DOM节点，其中传递属性可以使用props，传动DOM节点可以使用slot</font>

+ <font color=#3eaf7c>默认插槽</font>

就是在你没有传递插槽内容的时候，子组件将使用默认的插槽内容：即子组件中`<slot>xxxxx</slot>`里面`xxxxxx`的内容。

+ <font color=#3eaf7c>具名插槽</font>

插槽可以写多个，通过给插槽命名，让其显示在子组件规定的位置，如下是子组件`base-layout`的内容：
```javascript
<div class="container">
  <header> <slot name="header"></slot> </header>
  <main>   <slot></slot> </main>
  <footer> <slot name="footer"></slot> </footer>
</div>
```
如下是父组件的内容：
```javascript
<base-layout>
  <template v-slot:header>
    <h1>这里会替换name为header的插槽</h1>
  </template>

  <p>这里会替换默认的插槽</p>
  <p>这里也是</p>

  <template v-slot:footer>
    <p>这里会替换name为footer的插槽</p>
  </template>
</base-layout>
```

+ <font color=#3eaf7c>作用域插槽</font>

作用域插槽的作用实际是：<font color=#DD1144>当父组件写插槽的时候，需要对子组件内部的数据做布局的时候，就需要使用作用域插槽拿到子组件内部的数据,否则如果直接在父组件的插槽里写{{item}},实际上用的是父组件中的item</font>。
```javascript
const app = Vue.createApp({
	// 2. 父组件从子组件拿到item和index属性，然后对这两个属性做布局
	template: `
		<list v-slot="{item, index}">
			<div>{{item}}</div>
			<div>{{index}}</div>
		</list>
	`
})
```
下面是子组件的内容：
```javascript
	app.component('list', {
		data() {return { list: [1,2,3]}},
		// 1. 子组件通过绑定把item和index传给父组件
		template: `
			<div>
				<slot v-for="(item, index) in list" :item="item" :index="index">
			</div>
		`
	})
```

### 6. provide/inject
<font color=#1E90FF>使用这个的场景是解决多层父子组件之间传值的问题</font>：

```javascript
// 父组件
const app = Vue.createApp({
	data() {
		return { count: 1}
	},
	provide() {
		return {
			count: this.count // 1. 提供
		}
	}
})

// 子组件
app.component('child',{
	template: `<child-child />`
})

// 孙子组件
app.component('child-child',{
	inject: ['count']  // 2. 注入
	template: `<div>{{count}}</div>`
})
```
但是要特别注意：<font color=#DD1144>provide/inject是一次性的，没法像props那种实现响应式</font>，孙子组件当中的`count`是没有办法随着父组件的`count`变化而变化的，但是`Vue3`当中有新的语法会帮助你解决。

## 高级语法回顾
### 1. Mixin
```javascript
const myMixin = {
	data() {
		return {
			number: 2,
			count: 1
		}
	},
	created() {
		console.log('mixin created')
	},
	methods: {
		handleClick() {
			console.log("mixin handleClick")
		}
	}
}

const app = Vue.createApp({
	data() {
		return {
			number: 1,
		}
	},
	created() {
		console.log("created")
	},
	mixins: [myMixin], // 1. 混入myMixin
	methods: {
		handleClick() {
			console.log("handleClick")
		}
	},
	template: `
		<div>{{number}}</div>
		<div>{{count}}</div>
	`
})
```
关于`mixin`混入的总结：
+ <font color=#1E90FF>组件的data、methods以及自定义属性的优先级高于mixin中data、methods和自定义属性的优先级</font>
+ <font color=#1E90FF>生命周期函数，先执行minxin里面的，再执行组件里面的</font>
+ <font color=#DD1144>上面说的都是局部mixins，全局的mixins不太推荐使用，会影响每个组件，所以维护性不太好</font>
+ <font color=#DD1144>如果想修改自定义的属性的mixins优先级，要这样做：</font>

```javascript
const myMixin = {
	number: 1, // 1. number是除了data，methods等等之外的自定义属性
}

const app = Vue.createApp({
	mixins: [myMixin],
	number: 2,
	// 2. 显示自定义属性使用this.$options.xxx
	template: `
		<div>
			<div>{{this.$options.number}}</div>
		</div>
	`
})

// 3. 使用app.config.optionMergeStragies这个方法对number的mixins优先级做修改
// 4. mixinVal表示mixin中的number值，appValue表示组件当中number值
app.config.optionMergeStrategies.number = (mixinVal, appValue) => {
	return mixinVal || appValue // 5. mixin当中的number值优先
}
```
在新版的`vue3`当中，已经不推荐使用`mixin`属性了，代替的是`composition API`将会有更好的维护性。因为这种混入不仅会增加查错的成本，更会增加代码阅读性的难度。

### 2. 自定义指令
自定义指令这块虽然不是很难，但是在我自己的实际项目当中几乎没有使用过，这块的知识也可以看官网，官网说的比较清晰和简单。

### 3. teleport
这个传送门的功能主要作用就是把一个组件里面的某些元素或者某些组件挂载到其他`DOM`的位置上。
```html
<script>
	const app = Vue.createApp({
		data(){
			return {
				show:false
			}
		},
		methods: {
			handleBtnClick() {
				this.show = true
			}
		}

		template: `
			<div class="area">
				<button @click="handleBtnClick">按钮</button>
				<teleport to="body">    <!-- 放在body标签下-->
					<div class="mask" v-show="show"></div>
				</teleport>
				<teleport to="#hello">   <!-- 放在id为hello的节点下-->
					<div class="mask" v-show="show"></div>
				</teleport>
			</div>
		`
	})
</script>
```
尤其一些需要蒙层的组件，需要在使用的时候在全屏幕展示蒙层，此时就可以将蒙层的`div`传送到`body`上面去。或者传送到指定`DOM`,比如`id`为`hello`的`	DOM`节点上去。

### 4. render函数
在`react`当中我们对`render`函数有所了解，实际上在`vue`当中`template`最后也会编译成为`render`函数，`render`函数当中是调用`Vue`当中的`h`函数（`const { h } = Vue`），虚拟函数返回的是个虚拟`DOM`,虚拟`DOM`就是能够描述`DOM`结构的`JS`对象。
+ `template` -> `render` -> `h` -> `虚拟DOM(JS对象)` -> `真实DOM`

### 5. 插件
`plugins`插件，也是把通用性的功能封装起来。了解插件的写法也方便去读像`vuex`或者`vue-router`的一些源码：

```javascript
// 1. 书写插件
const myPlugin = {
	// install函数是固定写法，表示初始化的函数，app就是创建的Vue实例，options是app注册插件时候传递的第二个参数
	install(app, options) {
		app.provide('name',options.name) // 3. 向全局提供name属性
		app.direcive('focus', {          // 4. 向全局提供自定义指令
			mounted(el) {
				el.focus()
			}
		}),
		app.mixin({
			mounted(){
				console.log("每个组件被调用都会打印一下") // 5. 向全局组件提供mixin
			}
		}),
		app.config.globalProperties.$sayHello = 'hello world' // 6. 添加Vue底层全局的属性
	}
}

const app = Vue.createApp({
	template: `
		<my-title />
	`
})

app.component('my-title', {
	inject: ['name'], // 7-4. 在任何组件当中使用插件提供的功能
	mounted() {
		console.log(this.$sayHello) // 7-6. 在任何组件当中使用插件提供的功能
	},
	// 7-3. 在任何组件当中使用插件提供的功能
	template: `
		<div>
			{{name}}
			<input v-focus />
		</div>
	`
})

// 2. 注册插件（第二个参数会在插件的install函数当中使用options接收）
app.use(myPlugin, {name: 'taopoppy'})
```

因为插件还是使用比较广泛，所以我们需要自己再写一个来掌握一下：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>lesson 33</title>
  <script src="https://unpkg.com/vue@next"></script>
</head>
<body>
  <div id="root"></div>
</body>
<script>
  // 1. 对数据做校验的插件
  const app = Vue.createApp({
    data() {
      return { name: 'dell', age: 23}
    },
    // 2. rules会被插件识别
    rules: {
      age: {
        validate: age => age > 25,
        message: 'too young, to simple'
      },
      name: {
        validate: name => name.length >= 4,
        message: 'name too short'
      }
    },
    template: `
      <div>name:{{name}}, age:{{age}}</div>
    `
  });

  // 3. 插件
  const validatorPlugin = (app, options) => {
    app.mixin({
      created() {
        for(let key in this.$options.rules) {
          const item = this.$options.rules[key];
          this.$watch(key, (value) => {
            const result = item.validate(value);
            if(!result) console.log(item.message);
          })
        }
      }
    })
  }

  app.use(validatorPlugin);
  const vm = app.mount('#root');
</script>
</html>
```