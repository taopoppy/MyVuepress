# vue3新语法特性

## data属性
之前的版本在`data`当中如果有数组或者对象的时候，修改数组里面的元素或者对象的属性的时候，是不会触发`render`函数重新执行，换句话说，这种改变，`vue`不认为是变化。

但是在新版`vue3`的时候，这种变化会改变`data`，我们下面有一段测试代码，可以直接使用浏览器打开：
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
				<div v-for="(value, key, index) in obj" :key="index">
					{{value}}  --- {{key}}
				</div>
				<div v-for="(item, index) in list" :key="index">
					{{item}}  --- {{index}}
				</div>
				<button @click="handleAddBtnClick">button</button>
			</div>
		`,
		data() {
			return {
				list: ['111','2222','333'],
				obj: {
					name: "taopoppy",
					sex: "man"
				}
			}
		},
		methods: {
			handleAddBtnClick() {
				this.list[0] = '0000'
				this.obj.work = 'siqi'
			}
		}
	}).mount('#root')
</script>
</html>
```

## Teleport传送门
<font color=#DD1144>teleport的作用是在当前组件内，将一部门的UI渲染到别的地方，但是UI逻辑是当前逻辑操作的</font>

比如我们现在有这样一个例子，当前组件点击按钮后，要在全局渲染一个蒙层，所以蒙层就不能渲染到当前组件下，要渲染到`body`下面，所以代码如下：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>lesson 30</title>
  <style>
    .area {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 300px;
      background: green;
    }
    .mask {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: #000;
      opacity: 0.5;
      color: #fff;
      font-size: 100px;
    }
  </style>
  <script src="https://unpkg.com/vue@next"></script>
</head>
<body>
  <div id="root"></div>
  <div id="hello"></div>
</body>
<script>
  // teleport 传送门
  const app = Vue.createApp({
    data() {
      return {
        show: false,
        message: 'hello'
      }
    },
    methods: {
      handleBtnClick() {
        this.show = !this.show;
      }
    },
    template: `
      <div class="area">
        <button @click="handleBtnClick">按钮</button>
        <teleport to="#hello">
          <div class="mask" v-show="show" @click="handleBtnClick">{{message}}</div>
        </teleport>
      </div>
    `
  });

  const vm = app.mount('#root');
</script>
</html>
```

## compositionAPI
### 1. setup初体验
```javascript
// 对数据做校验的插件
const app = Vue.createApp({
  template: `
    <div @click="handleClick">{{name}}</div>
  `,
	methods: {
		test() {
			console.log(this.$options.setup()) // 但是setup的外部可以调用setup以及返回的东西
		}
	}
  // created 实例被完全初始化之前
  setup(props, context) {
    // setup是在实例完全初始化之前，所以无法调用methods里的东西
    // this.test()   // 错误实例
    return {
      name: 'taopoppy',
      handleClick: () => {
        name = "taozhenchuan"
      }
    }
  }
})
```
特别要注意的一点，<font color=#DD1144>setup里面没有办法使用this，因为setup执行的时候实例还没有初始化完成，所以setup没有办法调用外部的东西，但是外部的东西却可以调用setup返回的内容</font>

### 2. reactive和ref
按照上面的`setup`的写法，返回的`name`并不是响应式的，也就是`name`发生变化，并不会展示在页面上，所以需要`ref`和`reactive`将其做成响应式的：

<font color=#DD1144>响应式的原理是：ref底层通过proxy对数据进行封装，当数据发生变化的时候，对模板内容进行更新,之前name是个普通的值，通过ref修饰，就变成了proxy({value: 'taopoppy'})这样的响应式引用</font>，<font color=#1E90FF>特别要注意的就是：ref只能处理基础类型的数据</font>
```javascript
<script>
	const app = Vue.createApp({
		template: `
			<div @click="handleClick">{{name}}</div>
		`,
		methods: {
			handleClick() {
				this.name = "de"
			}
		},
		// created 实例被完全初始化之前
		setup(props, context) {
			const { ref } = Vue
			let name = ref("taopoppy") // taopoppy 变成proxy({value: 'taopoppy'})这样的响应式引用
			return {
				name
			}
		}
	})
	app.mount("#root")
</script>
```

<font color=#DD1144>而reactive是可以帮助处理对象，数组这些数据类型的</font>，同时`readonly`修饰的对象是不可以响应式的修改的。
```javascript
<script>
	const app = Vue.createApp({
		template: `
			<div @click="handleClick">{{nameObj.name}}</div>
		`,
		methods: {
			handleClick() {
				this.nameObj.name = "de"
			}
		},
		// created 实例被完全初始化之前
		setup(props, context) {
			const { reactive, readonly } = Vue
			const nameObj = reactive({ name: 'dell'}) // {name:"dell"}变成proxy({name:'dell'})这样响应式的引用
			const copyNameObj = readonly(nameObj)
			setTimeout(()=> {
				nameObj.name = "lee"  // reactive修饰的会响应式修改
				copyNameObj.name = "taopoppy" // readonly不允许响应式修改
			},2000)
			return { nameObj, copyNameObj }
		}
	})
	app.mount("#root")
</script>
```
在`vue2`当中修改数组或者对象当中的元素时，`vue`并不认为数组或者对象本身改变，所以不会响应，在`vue3`当中就会认为数组或者对象是响应式修改了。

### 3. toRefs
<font color=#1E90FF>toRefs的作用就是将rective修饰的proxy对象转换成为ref修饰的proxy对象，简单的说如果一个reactive对象的单个属性拿出来并不是响应式的，必须通过toRefs才能将其变成响应式的</font>

```javascript
setup(props, context) {
  const { reactive, toRefs } = Vue
  const nameObj = reactive({ name: 'dell', age: 18})
  setTimeout(()=> {
    nameObj.name = "lee"
    nameObj.age = 20
  },2000)
  // proxy({name:'dell', age: 18}) 一个reactive修饰的对象变成两个ref修饰的对象
  // { name: proxy({value: 'dell'}), age: proxy({value: 18}) }
  const { name, age } = toRefs(nameObj)
  return { name, age }
}
```

### 4. toRef
<font color=#DD1144>toRef的作用是解决toRefs无法给找不到的属性赋空值的问题</font>，什么意思，看下面的代码：

```javascript
setup(props, context) {
  const { reactive, toRefs } = Vue
  const nameObj = reactive({ name: 'dell'})
  const { age } = toRefs(nameObj) // nameObj本身里面没有age，所以age取出来不是空对象，而是undefined，undefined.value是不存在的
  setTimeout(()=> {
    age.value = 20
  },2000)
  return { age }
}
```
所以我们需要使用`toRef`，语法和`toRefs`稍微有所区别：
```javascript
setup(props, context) {
  const { reactive, toRef } = Vue
  const nameObj = reactive({ name: 'dell'})
  const age = toRef(nameObj, 'age') // 即使nameObj当中没有age，那么也会给age赋值为空的响应式数据
  setTimeout(()=> {
    age.value = 20
  },2000)
  return { age }
}
```
<font color=#DD1144>当然我们不太推荐这样写，即使没有age这种属性，我们还是尽量提前在nameObj当中赋一个空值即可,即`const nameObj = reactive({ name: 'dell',age: ''})`</font>

### 5. context
`context`里面包含的三个内容分别是`attrs`、`slots`、`emit`，分别就是`Non-Props`属性，插槽，还有父子组件通信方法`emit`：
```javascript
setup(props, context) {
  const { attrs, slots, emit} = context
  console.log(attrs.app) // 拿到父组件传过来的但子组件未接收的Non-Props属性
  console.log(slots.default()) // 拿到父组件传递来的插槽内容
  function handleClick() {
    emit("change")
  }
  return {
    handleClick
  }
}
```

### 6. 功能分离
我们这里结合上面已有的知识，来写一个新版的`TodoList`：
```javascript
<script>
	const app = Vue.createApp({
		setup() {
			const { ref,reactive } = Vue
			const inputValue = ref('')
			const list = reactive([])

			const handleInputValueChange = (e) => {
				inputValue.value = e.target.value
			}
			const handleSubmit = () => {
				list.push(inputValue.value)
				inputValue.value = ''
			}

			return {
				inputValue,
				list,
				handleInputValueChange,
				handleSubmit
			}
		},
		template: `
			<div>
				<div>
					<input @keydown.enter="handleSubmit" :value="inputValue" @input="handleInputValueChange"/>
					<button @click="handleSubmit">提交</button>
				</div>
				<ul>
					<li v-for="(item, index) in list" :key="index">{{item}}</li>
				</ul>
			</div>
		`
	})
	app.mount("#root")
</script>
```
如果仅仅是这样，你会觉的没啥改变，反而数据的定义和函数的定义都写在了同一个`setup`当中，会很臃肿，所以我们要进行分离:
```html
<script>
	// 关于list 操作的内容进行了封装
	const listRelativeEffect = () => {
		const { reactive } = Vue
		const list = reactive([])
		const addItemToList = (item) => {
			list.push(item)
		}
		return {
			list, addItemToList
		}
	}

	// 关于inputValue操作的内容进行了封装
	const inputRelativeEffect = () => {
		const { ref } = Vue
		const inputValue = ref('')
		const handleInputValueChange = (e) => {
			inputValue.value = e.target.value
		}
		return {
			inputValue, handleInputValueChange
		}
	}

	const app = Vue.createApp({
		// 相当于流程中转调度
		setup() {
			const { list, addItemToList } = listRelativeEffect()
			const { inputValue, handleInputValueChange } = inputRelativeEffect()
			return {
				inputValue,
				list,
				handleInputValueChange,
				addItemToList
			}
		},
		template: `
			<div>
				<div>
					<input @keydown.enter="() => addItemToList(inputValue)" :value="inputValue" @input="handleInputValueChange"/>
					<button @click="() => addItemToList(inputValue)">提交</button>
				</div>
				<ul>
					<li v-for="(item, index) in list" :key="index">{{item}}</li>
				</ul>
			</div>
		`
	})
	app.mount("#root")
</script>
```
关于`reactive`还有一个比较重要的问题就是，<font color=#DD1144>reactive修饰的数据无法通过直接赋值的方式去赋值</font>,比如下面这段代码就不起作用：
```html
<script>
	const list = reactive([])
	const clearAll = () => {
		list = []  // 不起作用，无法通过直接给reactive类型直接赋值
	}
</script>
```
有下面三种方式去解决，个人认为第一种最简单，最后一种最合理：
```html
<script>
	// 第一种，改为ref定义（虽然说前面我们说ref只能定义基础类型，但是实战里面定义对象也可以）
	const list = ref([])
	const clearAll = () => {
		list.value = []
	}

	// 纯粹通过数组方式去解决(有些场景用起来比较方便，比如删除数组某个元素，list.splice(index, 1))
	const list = reactive([])
	const clearAll = () => {
		if(list.length ! == 0) {
			list.pop()
		}
	}

	// 再封装一层数据（合理）
	// 这种使用起来就需要使用list.data了
	// 如果想让data成为响应性的，可通过toRefs()方法再转换成ref类型
	const list  = reactive({
		data: []
	})
	const clearAll = () => {
		list.data = []
	}

</script>
```



### 7. computed
`setup`当中的计算属性和旧的语法并不相同，我们来看：
```html
<script>
	const app = Vue.createApp({
		// 相当于流程中转调度
		setup() {
			const { ref, computed } = Vue // 1. 引入computed
			const count = ref(0)
			// 2. computed的简单用法
			const countAddFive = computed(() => {
				return count.value + 5
			})
			// 3. computed的高级复杂写法，同样可以直接修改computed属性
			const countAddSix = computed( {
				get: () => { return count.value + 6 },
				set: (params) => { count.value = params -6 }
			})

			const handleClick = () => {
				count.value +=1
			}
			const handleClick1 = () => {
				countAddSix.value = 10
			}

			return {
				count,
				countAddFive,
				countAddSix,
				handleClick,
				handleClick1
			}
		},
		template: `
			<div>
				<div>
					<div @click="handleClick">{{count}}--{{countAddFive}}</div>
					<div @click="handleClick1">{{count}}--{{countAddSix}}</div>
				</div>
			</div>
		`
	})
	app.mount("#root")
</script>
```

### 8. watch和watchEffect
`watch`可以监听`ref`和`reactive`修饰的对象，如下：
```html
<script>
	const app = Vue.createApp({
		setup() {
			const { ref, reactive, watch } = Vue
			const name = ref("taopoppy")

			// 使用watch监听name属性，具有一定惰性（第一次页面渲染的时候不会执行，只有数据变化的时候才执行）
			// currentValue为当前改变后的值，prevValue为改变之前的值
			watch(name, (currentValue, prevValue)=> {
				console.log(currentValue, prevValue)
			})

			return { name }
		},
		template: `
			<div>
				<div> Name: <input v-model="name"/> </div>
				<div> Name is {{name}} </div>
			</div>
		`
	})
	app.mount("#root")
</script>
```
修饰`reactive`的对象的时候，写法稍有不同：
```html
<script>
	const app = Vue.createApp({
		setup() {
			const { reactive, watch } = Vue
			const nameObj = reactive({name: "dell"})

			// 这里要书写一个函数，返回nameObj.name，这种一种getter的写法
			watch(() => nameObj.name, (currentValue, prevValue)=> {
				console.log(currentValue, prevValue)
			})
			const { name } = toRefs(nameObj)

			return { name }
		},
		template: `
			<div>
				<div> Name: <input v-model="name"/> </div>
				<div> Name is {{name}} </div>
			</div>
		`
	})
	app.mount("#root")
</script>
```
`watch`不仅可以监听一个属性，也可以同时监听多个属性，写法就变成了数组，这种写法可以在(官网)[https://v3.cn.vuejs.org/api/computed-watch-api.html#%E4%B8%8E-watcheffect-%E7%9B%B8%E5%90%8C%E7%9A%84%E8%A1%8C%E4%B8%BA]看到。

上面我们说了`watch`监听基础类型的数据其实很简单，但是对于`watch`监听引用类型的数据其实比较复杂：下面是参考[Vue3中watch的最佳实践](https://juejin.cn/post/6980987158710452231)的一段代码：
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




	const app = Vue.createApp({
		template:`
		<div>
			<div>ref定义数组：{{arrayRef}}</div>
			<div>reactive定义数组：{{arrayReactive}}</div>
		</div>
		<div>
			<button @click="changeArrayRef">改变ref定义数组第一项</button>
			<button @click="changeArrayReactive">改变reactive定义数组第一项</button>
		</div>
		<div>
			<div>ref定义object：{{objectRef}}</div>
			<div>reactive定义object：{{objectReactive}}</div>
		</div>
		<div>
			<button @click="changeObjectRef">改变ref定义对象的name</button>
			<button @click="changeObjectReactive">改变reactive定义对象的name</button>
		</div>
		`,
		setup() {
			const {ref, reactive, watch} = Vue

			const arrayRef = ref([1, 2, 3, 4])
			const arrayReactive = reactive([1, 2, 3, 4])
			const objectRef = ref({name:'preName'})
			const objectReactive = reactive({name:'preName'})

			// ref not deep, 不能深度侦听
			const arrayRefWatch = watch(arrayRef, (newValue, oldValue) => {
				console.log('newArrayRefWatch', newValue, 'oldArrayRefWatch', oldValue)
			})

			// ref deep， 深度侦听，新旧值一样
			const arrayRefDeepWatch = watch(arrayRef, (newValue, oldValue) => {
				console.log('newArrayRefDeepWatch', newValue, 'oldArrayRefDeepWatch', oldValue)
			}, {deep: true})

			// ref deep, getter形式 ， 新旧值不一样
			const arrayRefDeepGetterWatch = watch(() => [...arrayRef.value], (newValue, oldValue) => {
				console.log('newArrayRefDeepGetterWatch', newValue, 'oldArrayRefDeepGetterWatch', oldValue)
			})

			// reactive，默认深度监听，可以不设置deep:true, 新旧值一样
			const arrayReactiveWatch = watch(arrayReactive, (newValue, oldValue) => {
				console.log('newArrayReactiveWatch', newValue, 'oldArrayReactiveWatch', oldValue)
			})

			// reactive，getter形式 ， 新旧值不一样
			const arrayReactiveGetterWatch = watch(() => [...arrayReactive], (newValue, oldValue) => {
				console.log('newArrayReactiveFuncWatch', newValue, 'oldArrayReactiveFuncWatch', oldValue)
			})

			// ref not deep, 不能深度侦听
			const objectRefWatch = watch(objectRef, (newValue, oldValue) => {
				console.log('newObjectRefWatch', newValue, 'oldObjectRefWatch', oldValue)
			})

			// ref deep， 深度侦听，新旧值一样
			const objectRefDeepWatch = watch(objectRef, (newValue, oldValue) => {
				console.log('newObjectRefDeepWatch', newValue, 'oldObjectReDeepWatch', oldValue)
			},{deep: true})

			// ref deep, getter形式 ， 新旧值不一样
			const objectRefDeepGetterWatch = watch(() => { return {...objectRef.value} }, (newValue, oldValue) => {
				console.log('newObjectRefDeepGetterWatch', newValue, 'oldObjectRefDeepGetterWatch', oldValue)
			})

			// reactive，默认深度监听，可以不设置deep:true, 新旧值一样
			const objectReactiveWatch = watch(objectReactive, (newValue, oldValue) => {
				console.log('newObjectReactiveWatch', newValue, 'oldObjectReactiveWatch', oldValue)
			})

			// reactive，getter形式 ， 新旧值不一样
			const objectReactiveGetterWatch = watch(() => { return {...objectReactive} }, (newValue, oldValue) => {
				console.log('newObjectReactiveFuncWatch', newValue, 'oldObjectReactiveFuncWatch', oldValue)
			})


			const changeArrayRef = () => { arrayRef.value[0] = 3 }
			const changeArrayReactive = () => { arrayReactive[0] = 6 }
			const changeObjectRef = () => { objectRef.value.name = "NextName" }
			const changeObjectReactive = () => { objectReactive.name = "NextName" }

			return {
				arrayRef,
				arrayReactive,
				objectRef,
				objectReactive,
				changeArrayRef,
				changeArrayReactive,
				changeObjectRef,
				changeObjectReactive
			}

		}
	})

	const vm = app.mount('#root')
</script>

</html>
```
现象：当将引用对象采用`ref`形式定义时，如果不加上`deep:true`，`watch`是侦听不到值的变化的；而加上`deep:true`，`watch`可以侦听到数据的变化，但是当前值和先前值一样，即不能获取先前值。当将引用对象采用`reactive`形式定义时，不作任何处理，`watch`可以侦听到数据的变化，但是当前值和先前值一样。两种定义下，把`watch`的数据源写成`getter`函数的形式并进行深拷贝返回，可以在`watch`回调中同时获得当前值和先前值。

结论：当我们使用watch侦听引用对象时
+ <font color=#1E90FF>若使用ref定义的引用对象：</font>
	+	<font color=#DD1144>只要获取当前值，watch第一个参数直接写成数据源，另外需要加上deep:true选项</font>
	+ <font color=#DD1144>若要获取当前值和先前值，需要把数据源写成getter函数的形式，并且需对数据源进行深拷贝</font>
+ <font color=#1E90FF>若使用reactive定义的引用对象</font>：
	+ <font color=#DD1144>只要获取当前值，watch第一个参数直接写成数据源，可以不加deep：true选项</font>
	+	<font color=#DD1144>若要获取当前值和先前值，需要把数据源写成getter函数的形式，并且需对数据源进行深拷贝</font>


下面我们来说`watchEffect`, <font color=#DD1144>watchEffect是没有惰性的，是立即执行的，它不需要传递你要侦听的参数，会自动感知代码依赖，但是watchEffect无法获取之前数据的值</font>：
```javascript
// watchEffect的执行依赖于传递给watchEffect的函数里用到了那些响应式变量
// 比如你修改了nameObj.name,watchEffect发现函数内部用到了nameObje.name，所以会去执行，但是你要修改了其他响应式变量，,watchEffect发现函数内部没有用到，就不会执行
watchEffet(() => {
	console.log(nameObj.name) // 当且仅当nameObj.name变化，这个函数才会执行
})

// 可以取消watchEffect侦听器
const stop = watchEffect(() => {
	setTimeout(()=> {
		stop()
	}, 5000)
})
```
我们之前说`watch`是惰性的，但是实际上`watch`默认是惰性的，可以通过`watch`的第三个参数进行配置。

### 9. 新版生命周期
+ <font color=#1E90FF>setup的执行是在beforeCreate和created之间，所以beforeCreate和created之间的代码可以直接写在setup当中，也正是因为如此，setup当中没有提供onBeforeCreate和onCreated这两个生命周期函数</font>
+ <font color=#1E90FF>onRenderTracked在每次渲染后重新收集响应式依赖的时候</font>
+ <font color=#1E90FF>onRenderTriggered在每次触发页面重新渲染时自动执行</font>

具体的`setup`当中生命周期的用法请参考[官网](https://cn.vuejs.org/api/composition-api-lifecycle.html#onmounted)

### 10. Provide/inject
```html
<script>
  // provide, inject
  const app = Vue.createApp({
    setup() {
      const { provide, ref, readonly } = Vue;
      const name = ref('dell');
      provide('name', readonly(name)); // 1. 向子组件们提供只读的属性
      provide('changeName', (value) => { // 2. 向子组件提供修改属性的函数，保证在父组件修改属性
        name.value = value;
      });
      return { }
    },
    template: `
      <div>
        <child />
      </div>
    `,
  });

  app.component('child', {
    setup() {
      const { inject } = Vue;
      const name = inject('name');  // 3. 拿到name属性
      const changeName = inject('changeName'); // 4. 拿到修改name的函数
      const handleClick = () => {
        changeName('lee');  // 5. 利用父组件提供的函数修改属性，保证数据单向数据流
      }
      return { name, handleClick }
    },
    template: '<div @click="handleClick">{{name}}</div>'
  })
  const vm = app.mount('#root');
</script>
```
前面我们就说了在`vue2`当中是`project/inject`是一次性的，但是在`vue3`当中是可以试想响应式的，但是也要符合单向数据流的思想，通过调用祖辈的方式去修改数据值。


### 11. ref
```javascript
const app = Vue.createApp({
	setup() {
		const { ref, onMounted } = Vue;
		const hello = ref(null);
		onMounted(() => {
			console.log(hello.value);
		})
		return { hello } // 这里的hello里面保存的就是DOM元素的应用
	},
	template: `
		<div>
			<div ref="hello">hello world</div>
		</div>
	`,
});
```