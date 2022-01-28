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
  // created 实例被完全初始化之前
  setup(props, context) {
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
				nameObj.name = "lee"
				copyNameObj.name = "taopoppy"
			},2000)
			return { nameObj, copyNameObj }
		}
	})
	app.mount("#root")
</script>
```

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

我们这里结合上面已有的知识，来写一个新版的`TodoList`：
