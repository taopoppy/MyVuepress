# Vue的生命周期函数

## 什么是生命周期函数
每个`Vue`实例在被创建时都要经过一系列的初始化过程——例如，需要设置数据监听、编译模板、将实例挂载到`DOM`并在数据变化时更新`DOM`等。同时在这个过程中也会运行一些叫做生命周期钩子的函数，这给了用户在不同阶段添加自己的代码的机会。

比如`created`钩子可以用来在一个实例被创建之后执行代码：
```javascript
new Vue({
  data: {
    a: 1
  },
  created: function () {
    // `this` 指向 app 实例
    console.log('a is: ' + this.a)
  }
})
// => "a is: 1"
```
也有一些其它的钩子，在实例生命周期的不同阶段被调用，如`mounted`、`updated`、`destroyed`。<font color=#1E90FF>生命周期钩子的this上下文指向调用它的Vue实例</font>。因为和`this`相关，我们就不得不去说一下箭头函数，<font color=#DD1144>不要在选项属性或回调上使用箭头函数，比如 created: () => console.log(this.a) 或 app.$watch('a', newValue => this.myMethod())。因为箭头函数并没有 this，this 会作为变量一直向上级词法作用域查找，直至找到为止，经常导致 Uncaught TypeError: Cannot read property of undefined 或 Uncaught TypeError: this.myMethod is not a function 之类的错误。</font>

所以我们在简单的知道了生命周期函数或者生命周期钩子的概念，我们就来用图示告诉大家生命周期钩子在生命周期当中出现的位置和作用：

<img :src="$withBase('/vuessr_vue_lifecycle.png')" alt="生命周期图谱">

## 生命周期钩子详解

### beforeCreate
<font color=#1E90FF>**① 用法**</font>:

在实例初始化之后，数据观测 (data observer)和`event/watcher`事件配置之前被调用。

<font color=#1E90FF>**② 相关**</font>:

+ 这个期间`this.$el`这个属性为`undefined`,因为组件都没造出来，那更没有地方挂载
+ 这个生命周期在整个组件的存活的期间只会经历一次

<font color=#1E90FF>**③ 注意**</font>:

+ <font color=#1E90FF>从生命周期图中可以看到在beforeCreate之前vue内部只是做了一些事件和生命周期相关的东西，并没有和数据有关</font>，<font color=#DD1144>所以如果你想发送ajax请求获取数据并复制给组件中的data，最早也只能在created这个钩子当中</font>

### created
<font color=#1E90FF>**① 用法**</font>:

在实例创建完成后被立即调用。在这一步，实例已完成以下的配置：数据观测 (data observer)，属性和方法的运算，`watch/event`事件回调。然而，挂载阶段还没开始，`this.$el`属性目前不可见。

<font color=#1E90FF>**② 相关**</font>:

+ 这个期间`this.$el`这个属性也为`undefined`,和`beforeCreate`一样，因为组件只是被创造出来，还没有挂载到真实的`DOM`节点上，<font color=#1E90FF>这也告诉我们在beforeCreate和created两个生命周期钩子中是无法进行任何DOM操作的</font>
+ 这个生命周期在整个组件的存活的期间只会经历一次

### beforeMount
<font color=#1E90FF>**① 用法**</font>:

在挂载开始之前被调用：相关的 `render`函数首次被调用,实际上就是说`template`已经通过`render`方法生成了真实的`dom`内容。

<font color=#1E90FF>**② 相关**</font>:

+ 这个生命周期可以看到是在`render`方法已经执行完了之后，已经生成了真实的`dom`内容,但是还没有挂载上去，<font color=#1E90FF>所以此时此刻this.$el为即将被替换掉的原始节点，通常就是&lt;div class='root'&gt;&lt;/div&gt;</font>
+ 这个生命周期在整个组件的存活的期间只会经历一次

<font color=#DD1144>**③ 注意**</font>:

+ <font color=#1E90FF>该钩子在服务器端渲染期间不被调用</font>。
+ <font color=#1E90FF>还有人不懂render函数当中的h参数，h参数就是vue当中的createElement方法，下面两种写法一样</font>
	```javascript
	// template写法（简单明了）
	new Vue({
		template: '<div>{{text}}</div>'
	})

	// render写法（写法抽象）
	new Vue({
		render (h) {
			return h('div', {}, this.text)
		}
	})
	```


### mounted
<font color=#1E90FF>**① 用法**</font>:

`el`被新创建的`vm.$el`替换，并挂载到实例上去之后调用该钩子。如果`root`实例挂载了一个文档内元素，当`mounted`被调用时`vm.$el`也在文档内。

<font color=#1E90FF>**② 相关**</font>:

+ 在这个生命周期的时候，实际上已经完成了通过`render`方法生成的`DOM`替换原始`DOM`的过程，<font color=#DD1144>所以在beforeMount的周期中this.$el的值为&lt;div class='root'&gt;&lt;/div&gt;,在mounted的周期中，this.$el的值就为&lt;div&gt;taopoppy&lt;/div&gt;，这个节点就是真实呈现视图的节点</font>，你可以通过开发者工具看到的节点。
+ 这个生命周期在整个组件的存活的期间只会经历一次

<font color=#DD1144>**③ 注意**</font>:

+ <font color=#1E90FF>该钩子在服务器端渲染期间不被调用</font>。
+ <font color=#1E90FF>注意mounted不会承诺所有的子组件也都一起被挂载。如果你希望等到整个视图都渲染完毕，可以用vm.$nextTick替换掉mounted：</font>
	```javascript
	mounted: function () {
		this.$nextTick(function () {
			// Code that will run only after the entire view has been rendered
		})
	}
	```

<font color=#DD1144>**④ 总结**</font>

其实到这里关键的几个实例创建的生命周期我们都已经学习完了，我们将和组件创建和挂载的几个生命周期用图示来回顾一下各自的重要点：

<img :src="$withBase('/vuessr_vue_lifecycle_short.png')" alt="组件生命周期简单总结">



### beforeUpdate
<font color=#1E90FF>**① 用法**</font>:  

数据更新时调用，发生在虚拟`DOM`打补丁之前。这里适合在更新之前访问现有的`DOM`，比如手动移除已添加的事件监听器。

<font color=#DD1144>**② 注意**</font>:

+ <font color=#1E90FF>该钩子在服务器端渲染期间不被调用，因为只有初次渲染会在服务端进行。</font> 

### updated
<font color=#1E90FF>**① 用法**</font>:

由于数据更改导致的虚拟`DOM`重新渲染和打补丁，在这之后会调用该钩子。当这个钩子被调用时，组件`DOM`已经更新，<font color=#1E90FF>所以你现在可以执行依赖于DOM的操作。然而在大多数情况下，你应该避免在此期间更改状态。如果要相应状态改变，通常最好使用计算属性或 watcher取而代之。</font>

<font color=#DD1144>**② 注意**</font>:

+ <font color=#1E90FF>注意updated不会承诺所有的子组件也都一起被重绘。如果你希望等到整个视图都重绘完毕，可以用vm.$nextTick替换掉updated：</font>
	```javascript
	updated: function () {
		this.$nextTick(function () {
			// 此时组件以及自组件包含在内的整个视图都会被重绘完毕
		})
	}
	```
+ <font color=#1E90FF>该钩子在服务器端渲染期间不被调用。</font>

### activated && deactivated
<font color=#1E90FF>**① 用法**</font>:

`activated`在`keep-alive`组件激活时调用。`deactivated`在`keep-alive`组件停用时调用。这两个生命周期我们在讲解组件时仔细讲解

### beforeDestroy && destroyed
<font color=#1E90FF>**① 用法**</font>:

+ `beforeDestroy`在实例销毁之前调用。在这一步，实例仍然完全可用。
+ `destroyed`在`Vue`实例销毁后调用。调用后，`Vue`实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。

### errorCaptured
<font color=#1E90FF>**① 用法**</font>

当捕获一个来自子孙组件的错误时被调用。此钩子会收到三个参数：错误对象、发生错误的组件实例以及一个包含错误来源信息的字符串。此钩子可以返回`false`以阻止该错误继续向上传播，返回`true`会向上冒泡，并且在正式环境中可用。

<font color=#1E90FF>**② 错误传播规则**</font>

+ 默认情况下，如果全局的`config.errorHandler`被定义，所有的错误仍会发送它，因此这些错误仍然会向单一的分析服务的地方进行汇报。
+ 如果一个组件的继承或父级从属链路中存在多个`errorCaptured`钩子，则它们将会被相同的错误逐个唤起。
+ 如果此`errorCaptured`钩子自身抛出了一个错误，则这个新错误和原本被捕获的错误都会发送给全局的`config.errorHandler`。
+ 一个`errorCaptured`钩子能够返回`false`以阻止错误继续向上传播。本质上是说<font color=#1E90FF>这个错误已经被搞定了且应该被忽略</font>。它会阻止其它任何会被这个错误唤起的`errorCaptured`钩子和全局的`config.errorHandler`。