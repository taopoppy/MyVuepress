# React的生命周期

## React中的ref
我们可以使用`ref`来操作`DOM`,比如这样：
```javascript
// TodoList.js
class TodoList extends Component {
  handleInputChange(e) {
    const value = this.input.value  // 现在的写法
    // const value = e.target.value // 以前的写法
  }
  render() {
    return (
      <input
        onChange={this.handleInputChange}
        ref={(input) => {this.input = input}} // 通过this.input可以直接访问到input这个DOM元素
      />
    )
  }
}
```
但是我们不太推荐直接使用`ref`去操作元素：
+ <font color=#DD1144>react希望我们尽量通过修改数据的方式来修改视图，而不是直接使用ref的方式去修改DOM</font>
+ <font color=#DD1144>通过修改数据的方式通常都是异步的，直接修改DOM的ref方法是同步的，两者一起使用经常会出现时差的bug，对新手不太友好</font>

## React的生命周期
<img :src="$withBase('/react_redux_lifecycle.png')" alt="">

什么是生命周期函数？<font color=#DD1144>生命周期函数指的是在某一个时刻组件会自动执行的函数</font>,关于生命周期的图谱，可以参展上面的这个图，也可以到这个[官网](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)去查看

按照上面对于生命周期的定义，我们首先要来讲一下<font color=#1E90FF>render函数</font> 和 <font color=#1E90FF>constructor函数</font>，render函数属于生命周期函数，因为它在`props`和`state`发生变化的时候会被自动调用执行，但是`constructor`函数虽然也在组件一开始被创建的时候会被调用，但是它并不是`react`中独有的，属于`ES6`中的内容，我们不把`constructor`归类为`react`当中的生命周期函数。

按照上面给出的生命周期图谱，我们知道组件从生到死大概有这么几个重要的阶段：<font color=#1E90FF>Initialzation</font>、<font color=#1E90FF>Mounting</font>、<font color=#1E90FF>Updation</font>、<font color=#1E90FF>Unmounting</font>

### 1. Initialzation
<img :src="$withBase('/react_redux_lifecycle1.png')" alt="组件生命周期">

如图，图中灰色部分表示了在初始化阶段，<font color=#1E90FF>组件会先进行类型检查，然后初始化自己的一些数据，初始化数据发生在constructor当中，会从外接收props，会初始化一些states</font>


### 2. Mounting
组件在初始化完毕之后需要被渲染并且挂载到页面之上，这个阶段我们称之为`Mounting`

<font color=#9400D3>**① componentWillMount**</font>

在组件即将被挂载到页面的时刻自动执行

<font color=#9400D3>**② render**</font>

`render`方法就是组件渲染的方法，在`render`方法中返回的是`jsx`语法，关于`JSX`语法我们之前就说过，它会通过`Babel`编译成为`React.createElement`方法，`React.createElement`方法执行返回的就是虚拟`DOM`,所以你应该明白了，<font color=#DD1144>render方法最终返回的就是虚拟DOM这个javascript对象</font>。

<font color=#9400D3>**③ componentDidMount**</font>

<font color=#1E90FF>组件已经被渲染到页面中后触发：此时页面中有了真正的DOM的元素，可以进行DOM相关的操作, 依赖于 DOM 节点的初始化应该放在这里。如需通过网络请求获取数据，此处是实例化请求的好地方，原因有两个：</font>：
+ <font color=#DD1144>componentDidMount的时候，真实的DOM才被挂载上去，也就是说这时候才有了真的DOM，然后ajax技术就是动态操作DOM交互显示，如果现在DOM都还没有挂载到上面，请求的数据用来动态显示和操作谁呢</font>
+ <font color=#DD1144>componentDidMount这个生命周期无论在服务端渲染，还是fiber架构当中，都只会确定的执行一次，而其他的生命周期就不一定了，所以为了保证不会重复请求，只能放在componentDidMount当中请求一次</font>


### 3. Updation
可以看到,在组件中的`props`和`states`发生变化的时候，情况略微不一样，`props`比`states`多了一个`componentWillReceiveProps`方法，这个方法我们最后再讲，我们先来说`props`和`states`共有的几个生命周期方法：

<font color=#9400D3>**① shouldComponentUpdate**</font>

组件被更新之前，他会自动被执行，<font color=#1E90FF>根据 shouldComponentUpdate() 的返回值，判断 React 组件的输出是否受当前 state 或 props 更改的影响。默认行为是 state 每次发生变化组件都会重新渲染。大部分情况下，你应该遵循默认行为</font>。

<font color=#DD1144>当 props 或 state 发生变化时，shouldComponentUpdate() 会在渲染执行之前被调用。返回值默认为 true。首次渲染或使用 forceUpdate() 时不会调用该方法</font>

<font color=#9400D3>**② componentWillUpdate**</font>

组件即将被更新时触发，在`shouldComponentUpdate`之后被执行，如果`shouldComponentUpdate`返回的是`false`，后面的所有生命周期都不会被执行。

<font color=#9400D3>**③ render**</font>

组件在更新的时候会重新执行`render`方法返回一个新的虚拟`DOM`，然后将新旧虚拟`DOM`进行比对。

<font color=#9400D3>**④ componentDidUpdate**</font>

组件被更新完成后触发。页面中产生了新的`DOM`的元素，可以进行`DOM`操作

<font color=#9400D3>**⑤ componentWillReceiveProps**</font>

<font color=#1E90FF>当一个组件要从父组件接收参数，只要父组件的render函数被执行了，子组件的这个生命周期函数就会被执行，除了父组件render函数第一次执行，因为父组件render函数第一次执行在Mounting阶段，不在Updation阶段</font>，组件接收到属性时触发。

### 4. Unmounting
<font color=#9400D3>**① componentWillUnmount**</font>

组件被销毁时触发。这里我们可以进行一些清理操作，例如清理定时器，取消`Redux`的订阅事件等等。


## 生命周期的使用场景
### 1. shouldComponentUpdate
我们书写的`TodoList`代码中，你会发现，在每次的输入框当中去输入内容的时候，已存在的所有的子组件`TodoItem`都会被刷新（之前已经下载过react的插件，在开发者工具当中直接有react的工具，打开`Highlight updates when components render`的开关，组件更新会高亮显示），因为输入框中的内容会修改父组件的`state`,从而执行父组件的`render`函数，从而子组件的`render`函数也会被执行，输入多少个字符就会更新多少遍，非常消耗性能，此时我们可以利用<font color=#DD1144>shouldComponentUpdate</font>生命周期函数帮助我们优化代码：
```javascript
// TodoItem.js
class TodoItem extends React.Component {
	constructor(props) {
		super(props)
		this.handleClick = this.handleClick.bind(this)
	}
  // 使用shouldComponentUpdate生命周期来减少无谓的render函数执行
	shouldComponentUpdate(nextProps,nextState) {
		if(nextProps.content !== this.props.content) {
			return true
		} else {
			return false
		}
	}
	render() {
		const { content } = this.props
		return (
			<div onClick={this.handleClick}>
				{ content }
			</div>
		)
	}
}

export default TodoItem
```
为什么按照上面的书写会提高性能？因为`shouldComponentUpdate`函数接收了两个参数，分别是组件下次被更新的`nextProps`和`nextState`, <font color=#DD1144>我们将下一次组件的状态和当前组件的状态做对比，如果没有发生变化，shouldComponentUpdate函数返回false，接下来的componentWillUpdate、render、componentDidUpdate这些生命周期都不会被执行。既然render函数不会被执行，那么就不会产生虚拟DOM，从而也就不存在新旧DOM的比对，也就提高了性能</font>

<font color=#1E90FF>实际上在性能优化的方面,shouldComponentUpdate和setState都是以减少虚拟DOM的比对次数来提高性能，只不过前者是减少相同虚拟DOM比对的操作，后者是通过异步和合并虚拟DOM比对次数</font>，这里也是一个面试的点。

### 2. componentDidMount
很多人都知道在`react`组件当中发送`ajax`请求应该放在`componentDidMount`函数当中去写，但是很多人不知道原因。

<font color=#1E90FF>对于组件来说，组件获取ajax数据只需要执行一次，所以我们只需要把请求代码放在只执行一次的生命周期函数当中，那么像constructor，componentWillMount这些生命周期都只执行一次，为何不能放在这里</font>

+ `constructor`中可以书写，但是由于特别要注意`ajax`的返回数据一般要去修改组件状态，而`constructor`是组件状态定义的地方，不利于逻辑的梳理，对新手不太友好
+ `componentWillMount`首先这个生命周期可以书写`ajax`请求，但是在`react native`和同构当中会出问题，其次这个生命周期在新的版本已经不推荐使用了，所以无论什么情况，将`ajax`请求写在`componentDidMount`生命周期函数当中都是最保险的。

## charles的使用
上面说过了前端需要发送`ajax`请求，因为在前后端分离的开发当中，后端无法及时给前端提供真实的数据和接口，但是前端又需要请求一些接口上的数据，所以我们需要设置一些假的数据，此时就用到了<font color=#DD1144>Charles</font>这个工具。

这个工具到[官网](https://www.charlesproxy.com/latest-release/download.do)去下载。

下载好之后我们进入工具按照下面的步骤进行设置：
+ <font color=#1E90FF>点击Tools/Map Local Setting进入设置</font>
+ <font color=#1E90FF>选中Enable Map Local，点击Add按钮</font>
+ <font color=#1E90FF>比如我们访问http://localhost:3000/api/todolist的时候，返回桌面上一个json文件，我们设置如下</font>

	<img :src="$withBase('/react_redux_charles.png')" alt="">

+ <font color=#1E90FF>点击OK生效</font>

<font color=#DD1144>Charles这个工具的作用就是能够抓到浏览器向外发送的请求，并根据你自己的设置对部分的请求进行特殊的处理，说白了就是一个中间代理服务器，可以实现本地前端接口的模拟</font>

```javascript
	componentDidMount() {
		axios.get('/api/todolist')
		.then((res)=> {
			this.setState(()=> ({
				list: [...res.data]
			}))
		})
		.catch(()=> {alert('error')})
	}
```

**参考资料**

+ [图解ES6中的React生命周期](https://juejin.im/post/5a062fb551882535cd4a4ce3#heading-10)