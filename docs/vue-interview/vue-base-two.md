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