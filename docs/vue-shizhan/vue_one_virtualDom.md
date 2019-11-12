# 其他核心概念

## 虚拟DOM和key
<img :src="$withBase('/vue_one_virtualdom.png')" alt="虚拟dom">

从上面的左边图看到我们以前使用`js`或者是`jQuery`都是通过事件`Event`去直接操作`DOM`元素，但是页面复杂和项目不断的更替下，这种开发方式会极其的难受，那么就出现了`react/vue`这种开发方式，这种开发方式如上图右边所示：<font color=#1E90FF>通过引入数据中间层，然后事件并不会直接去操作DOM，而是通过事件去改变数据，数据再去映射到DOM元素</font>

数据的更新会导致`DOM`的更新，操作`DOM`是一件非常消耗性能的事情，我们怎么高效的去操作`DOM`?我们采用的一种原则是：
+ <font color=#DD1144>尽可能的去复用我们之前的DOM，当我们数据更新的时候，此时就引入了虚拟DOM的概念</font>

<img :src="$withBase('/vue_one_state_template.png')" alt="虚拟DOM的结构">

<font color=#1E90FF>虚拟DOM是一种数据状态state和模板template创造出来的DOM节点数据结构，在这个数据结构中，保留着节点的信息，包括类型，属性和事件等等，当数据更新后我们会生成一个新的数据结构，前后的两个数据结构通过算法的对比。比较出不同的节点，然后提升性能</font>

[<font color=#ff6100>思考问题</font>]：为什么不能使用`index`作为`key`

## 如何触发组件的更新
+ 状态是组件自身的数据，属性是来自父组件的数据
+ <font color=#1E90FF>状态的改变未必会触发更新，属性的改变也未必会触发更新</font> 

<img :src="$withBase('/vue_one_update_app.png')" alt="响应式更新">

根据上面的这个图：
+ <font color=#1E90FF>组件在实例化的时候对Data下面的数据会做setter和getter的转化，实际上就是做了一层代理，无论什么操作都会先经过代理。</font>
+ <font color=#1E90FF>组件在渲染的时候会把需要到的Data当中的数据放到Watch中，所以组件当中没有用到的数据发生了更新，不会通知到Watch，也就不会触发组件渲染</font>
```javascript
data() {
  this.name = name;
  return {
    info: {},
    list: [],
    b: ''
  };
},
  handleNameChange() {
    this.name = "vue" + Date.now();
    console.log("this.name 发生了变化，但是并没有触发子组件更新", this.name);
  },
  handleInfoChange() {
    this.info.number = 1;
    // this.$set(this.info, 'number', 1)
    console.log("this.info 发生了变化，但是并没有触发子组件更新", this.info);
  },
  handleListChange() {
    this.list.push(1, 2, 3);
    console.log("this.list 并没有发生变化，但是触发了子组件更新", this.list);
  },
  handlebChange() {
    this.b = 'tao'
    console.log("this.b 发生了变化，但是没有出发子组件的更新")
  }
```
通俗的来讲，就是如果一开始我们没有在`data() {return {... }}`当中写的属性或者状态，都不存在与`Data`当中，比如说上述代码中的<font color=#1E90FF>this.name</font>,<font color=#1E90FF>this.info.number</font>，它们的变化不会通知`Watch`。另外当`this.b`发生变化也不会触发子组件更新，因为它并不是页面渲染需要的到的数据，换句话说`Watch`里面压根就没有它。

[<font color=#ff6100>思考问题</font>]：数组有哪些方法支持响应式更新，如不支持如何处理，底层原理是如果实现的。