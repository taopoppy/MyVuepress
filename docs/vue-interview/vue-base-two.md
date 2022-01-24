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
