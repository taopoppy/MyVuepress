# Vue当中的指令详解
指令是`vue`当中的很特殊的一个东西，我们有很多指令，有的指令很简单，我们一带而过，有的有复杂，我们必须单独拿出来讲讲，但是无论怎么样，既然是学习，我们就需要系统的全面的来逐个说明每个指令，<font color=#DD1144>程序员解决问题的能力不光来源于实践的多少，更多的需要系统全面的知识体系中去寻求最合理有效的方法</font>

## Vue中的原生指令

### 1. v-text
更新元素的`textContent`。如果要更新部分的 `textContent`，需要使用插值。
```javascript
// 插值语法
new Vue({
	template: `
    <div>{{text}}</div>
  `,
})

// v-text
new Vue({
	template:`
		<div v-text="text"></div>
	`
})
```
所以基本上这个指令没多大用，都是数据绑定，使用插值的方式看起来更熟悉和方便一点，<font color=#1E90FF>而且重要的是使用插值的语法可以在标签内写很多东西，使用v-text后标签内的全部东西都只能是v-text绑定的值，灵活性太差</font>

### 2. v-html
更新元素的`innerHTML`。注意：内容按普通`HTML` 插入 - 不会作为`Vue`模板进行编译 。如果试图使用`v-html`组合模板，可以重新考虑是否通过使用组件来替代。
```javascript
new Vue({
	template:`
		<div v-html="html"></div>
	`,
	data: {
		html:`<span>this is html</span>`
	}
})
```
<font color=#1E90FF>这个指令的实际作用就是将变量的值作为html进行插入，它的作用和原生中的innerHtml差不多</font>

### 3. v-show
根据表达式之真假值，切换元素的`display CSS`属性。当条件变化时该指令触发过渡效果。
```javascript
new Vue({
	template:`
		<div v-show="active">hello</div>	
	`,
	data: {
		active: false
	}
})
```
<font color=#1E90FF>这个指令的原理是通过添加或者删除标签中的style="display:none"属性来控制显示与否</font>

### 4. v-if
根据表达式的值的真假条件渲染元素。在切换时元素及它的数据绑定 / 组件被销毁并重建。如果元素是 `<template>`，将提出它的内容作为条件块。当条件变化时该指令触发过渡效果。
```javascript
new Vue({
  template: `
    <div v-if="active">{{text}}</div>
  `,
  data: {
    text: 0,
    active: true
  }
})
```
+ <font color=#1E90FF>当和v-if一起使用时，v-for的优先级比v-if更高</font>
+ <font color=#DD1144>在单纯的控制元素的显示和隐藏方面其实v-show会更加的高效，因为v-if会真实的动态增删节点，会引起整个DOM的重绘和排版，这会非常耗时</font>

### 5. v-for（核心）
基于源数据多次渲染元素或模板块。此指令之值，必须使用特定语法`alias in expression`，为当前遍历的元素提供别名

<font color=#1E90FF>**① 用v-for把一个数组对应为一组元素**</font>

我们可以用`v-for`指令基于一个数组来渲染一个列表。`v-for`指令需要使用`item in items`形式的特殊语法，其中`items`是源数据数组，而`item`则是被迭代的数组元素的别名。
```javascript
new Vue({
  el: '#root',
  template: `
    <div>
      <ul v-for="(item, key) in arr" :key="item.id">
        <li>{{item.message}}-{{key}}</li>
      </ul>
    </div>
  `,
  data: {
    arr: [
      { message: 'taopoppy', id: '85954' },
      { message: 'throwcd', id: '77484' }
    ]
  }
})

// taopoppy-0
// throwcd-1
```
<font color=#1E90FF>基本上上面这就是一个最标准的数组写法，item和key分别就是数组的每个元素和元素在数组中的顺序</font>，但是，<font color=#DD1144>但是最重要的是:key,因为循环的每个元素都需要用key来标注它是独一无二的值，这样的属性实际上主要用在Vue的虚拟DOM算法，在新旧nodes对比时辨识VNodes。如果不使用key，Vue会使用一种最大限度减少动态元素并且尽可能的尝试修复/再利用相同类型元素的算法。使用key，它会基于key的变化重新排列元素顺序，并且会移除key不存在的元素</font>。<font color=#3eaf7c>所以有相同父元素的子元素必须有独特的key。重复的key会造成渲染错误，所以这就是不用数组中的key（元素在数组中的顺序）来作为子元素的key的原因，因为数组中的key在对元素删除或者调整中一定会变化，而使用有独特key标记的元素后，在重新渲染的时候会从缓存中复用这个元素，而不用重新生成一个节点再去渲染，这样提高了效率</font>

<font color=#1E90FF>**② 在v-for里使用对象**</font>

我们可以用`v-for`指令基于一个对象来渲染一个列表。`v-for`指令需要使用`item in items`形式的特殊语法，其中`value`是对象属性的值，而`name`则是对象属性的名称，`index`是这个属性在遍历的时候的顺序。
```javascript
new Vue({
  el: '#root',
  template: `
    <div>
      <ul v-for="(value, name, index) in obj">
        <li>{{index}}: {{name}}-{{value}}</li>
      </ul>
    </div>
  `,
  data: {
    obj: {
      name: 'taopoppy',
      age: 19,
      sex: 'man'
    }
  }
})
```
<font color=#1E90FF>基本上上述就是一个标准的对象属性遍历的写法，只不过在对象上使用v-for不需要使用:key来进行标注，因为对象中不会存在相同属性的这种情况</font>

### 6. v-on（核心）
<font color=#1E90FF>**① 修饰符**</font>

+ <font color=#3eaf7c>.stop</font>  - 调用`event.stopPropagation()`。
+ <font color=#3eaf7c>.prevent</font> - 调用`event.preventDefault()`。
+ <font color=#3eaf7c>.capture</font> - 添加事件侦听器时使用`capture`模式。
+ <font color=#3eaf7c>.self</font> - 只当事件是从侦听器绑定的元素本身触发时才触发回调。
+ <font color=#3eaf7c>.{keyCode | keyAlias}</font> - 只当事件是从特定键触发时才触发回调。
+ <font color=#3eaf7c>.native</font> - 监听组件根元素的原生事件。
+ <font color=#3eaf7c>.once</font> - 只触发一次回调。
+ <font color=#3eaf7c>.left </font>- (2.2.0) 只当点击鼠标左键时触发。
+ <font color=#3eaf7c>.right</font> - (2.2.0) 只当点击鼠标右键时触发。
+ <font color=#3eaf7c>.middle</font> - (2.2.0) 只当点击鼠标中键时触发。
+ <font color=#3eaf7c>.passive</font> - (2.3.0) 以`{ passive: true }`模式添加侦听器

<font color=#1E90FF>**② 用法**</font>

+ 绑定事件监听器。事件类型由参数指定。表达式可以是一个方法的名字或一个内联语句，如果没有修饰符也可以省略。
+ <font color=#1E90FF>用在普通元素上时，只能监听原生 DOM 事件。用在自定义元素组件上时，也可以监听子组件触发的自定义事件。</font>
+ 在监听原生`DOM`事件时，方法以事件为唯一的参数。如果使用内联语句，语句可以访问一个`$event`属性：`v-on:click="handle('ok', $event)"`。
+ 从 2.4.0 开始，`v-on`同样支持不带参数绑定一个事件/监听器键值对的对象。注意当使用对象语法时，是不支持任何修饰器的。

```html
<!-- 方法处理器 -->
<button v-on:click="doThis"></button>
<!-- 动态事件 (2.6.0+) -->
<button v-on:[event]="doThis"></button>
<!-- 内联语句 -->
<button v-on:click="doThat('hello', $event)"></button>
<!-- 缩写 -->
<button @click="doThis"></button>
<!-- 动态事件缩写 (2.6.0+) -->
<button @[event]="doThis"></button>
<!-- 停止冒泡 -->
<button @click.stop="doThis"></button>
<!-- 阻止默认行为 -->
<button @click.prevent="doThis"></button>
<!-- 阻止默认行为，没有表达式 -->
<form @submit.prevent></form>
<!--  串联修饰符 -->
<button @click.stop.prevent="doThis"></button>
<!-- 键修饰符，键别名 -->
<input @keyup.enter="onEnter">
<!-- 键修饰符，键代码 -->
<input @keyup.13="onEnter">
<!-- 点击回调只会触发一次 -->
<button v-on:click.once="doThis"></button>
<!-- 对象语法 (2.4.0+) -->
<button v-on="{ mousedown: doThis, mouseup: doThat }"></button>
```

### 7. v-model（核心）
首先，对于`v-model`,它的作用就只有一个：<font color=#DD1144>在表单控件或者组件上创建双向绑定</font>，所以对于这个指令的用法有两种，第一就是在表单控件上，另个一就是在组件上。所以这个指令的用处有限，对于表单控件只能用于<font color=#1E90FF>input</font>、<font color=#1E90FF>select</font>、<font color=#1E90FF>textarea</font>这几个表单控件上。

<font color=#1E90FF>**① v-model在表单控件上的使用**</font>

关于`v-model`在在表单控件上的使用，[官网](https://cn.vuejs.org/v2/guide/forms.html)上有很详细的介绍使用，我们这里就不做赘述。

<font color=#1E90FF>**② v-model在输入组件中的使用**</font>

关于`v-model`在输入组件中的使用，[官网](https://cn.vuejs.org/v2/guide/components-custom-events.html)上也有很详细的介绍，我们后面再组件的学习中会详细介绍。

<font color=#1E90FF>**③ v-model的实质**</font>

`v-model`仅仅是一个语法糖，也就是说下面两种写法是一样的：
```javascript
<input v-model="something">
<input v-bind:value="something" v-on:input="something = $event.target.value">
```
在组件中的使用，相当于下面的简写：
```javascript
<custom-input v-bind:value="something" v-on:input="something = argument[0]" />
```
<img :src="$withBase('/vuessr_vue_v-model.png')" alt="v-mode">

所以根据图示，我们应该完全能理解，<font color=#1E90FF>在初始阶段，是something的值决定了input当中的value值。但当我们修改input中的value值的时候，并不是直接修改了value，会走这样一个间接的流程：会先触发事件修改something，而something的变动又影响了input中的value值，是一个典型的借刀杀人的案例</font>

### 8. v-slot（核心）
`v-slot`这个指令和组件的结构和使用有密不可分的关系，所以单独拿这个指令出来将没有什么意义，所以这部分内容我们将在后面组件的时候会仔细讲解。

### 9. v-once
只渲染元素和组件一次。随后的重新渲染，元素/组件及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能。

## Vue中的自定义指令
关于自定义指令的知识，是拓展的知识，在[官网](https://cn.vuejs.org/v2/guide/custom-directive.html)也有详细的说明,如果你有兴趣可以先去看一下，后面如果我们有机会会在这里详细的介绍。