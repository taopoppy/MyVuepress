# vue3旧语法回顾

## 基础语法回顾
这里我们不会再一点一滴的书写`vue`的语法，我们直接就列举一些比较重点的点，然后新语法我们会在后面详细的说明

### 1. mvvm
`mvvm`设计模式，`m`就是`model`数据，`v`就是`view`视图，`vm`就是`viewModel`视图数据连接层, <font color=#3eaf7c>所以我们书写vue实际上data是我们要书写的数据层，template是我们要书写的视图层，而vm是vue帮助我们做的，这才是我们应该正确理解vue和mvvm的一部分</font>

### 2. 生命周期函数
+ `beforeCreate`: 是在创建`Vue`对象之前
+ `created`: 是创建好了`Vue`对象之后
+ 中间有一层将数据和`template`进行结合的过程，<font color=#1E90FF>实际就是执行了render函数</font>， 这里有一个判断，`Vue`当中有`template`属性就拿`template`作为模板，没有的话就拿正式`dom`的`root`根节点下的内容做模板。
+ `beforeMount`: 将render生成好的虚拟`dom`往真实的`dom`挂载之前
+ `Mounted`: 已经将虚拟`dom`代替了网页上真实的`dom`之后
+ `beforeUpdate`: 在`data`数据发生变化的时候会自动执行，但是页面还没有变化
+ `updated`: 页面随着`data`变化完毕之后自动执行
+ `beforeUnmount`: `Vue`应用失效的时候立即执行的函数
+ `unmounted`: `Vue`应用失效，且`dom`完全销毁之后，自动执行的函数

### 3. 属性
+ 计算属性`computed`, 方便对固定的属性进行计算，带有缓存的效果，<font color=#3eaf7c>使用的比较广泛</font>
+ 监听属性`watch`方便在监听的属性变化后做对应的一系列改变，比如某个值改变了要去发送`http`请求就可以使用监听`watch`属性。


### 4. 事件绑定
+ <font color=#1E90FF>点击事件同时传递参数和原生事件</font>:
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
				<button @click="handleAddBtnClick(2, $event)">button</button>
			</div>
		`,
		methods: {
			handleAddBtnClick(num, event) {}
		}
	}).mount('#root')
</script>
</html>
```

+ <font color=#1E90FF>点击事件绑定多个函数</font>
```html
<div>
	<button @click="handleClick1(), handleClick2()">button</button>
</div>
```

+ <font color=#1E90FF>修饰符，阻止事件冒泡</font>
```html
<div>
	<button @click.stop="handleClick1">button</button>
</div>
```

+ <font color=#1E90FF>修饰符，自身触发</font>
```html
<div>
	<div @click.self="handleClick">
		{{counter}}
		<button @click="handleClick1">button</button>
	</div>
</div>
```
点击子元素`button`不会触发`handleClick`,点击`counter`才可以触发。

+ <font color=#1E90FF>按键修饰符</font>
```html
<input @keydown.enter="handleKeyDown"/>
```
除了`enter`，还有`tab`、`delete`、`esc`、`down`等等

+ <font color=#1E90FF>鼠标修饰符</font>
```html
<div @click.right="handleClick"></div>
```
鼠标的修饰符有`left`、`right`、`middle`等等

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
			</div>
		`,
		methods: {
			handleAddBtnClick(num, event) {}
		}
	}).mount('#root')
</script>
```
`v-model.lazy`这个修饰符的意思就是输入框输入完毕，焦点失去的时候，才会去修改`message`
`v-model.number`这个修饰符的意思就是输入数字，将会以数字形式保存在`message`

+ <font color=#1E90FF>checkbox</font>
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

+ <font color=#1E90FF>radio</font>
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

+ <font color=#1E90FF>select</font>
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


## 组件语法回顾
### 1. 全局和局部组件
+ <font color=#3eaf7c>全局组件</font>：只要定义了处处可以使用，<font color=#DD1144>性能不高，使用简单</font>
+ <font color=#3eaf7c>局部组件</font>：定义之后需要注册到被使用的组件当中，<font color=#DD1144>性能比较高，使用略麻烦</font>

