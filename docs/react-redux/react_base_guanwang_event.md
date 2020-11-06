# 事件和条件渲染

## 事件处理
### 1. 事件绑定写法
`React`元素的事件处理和`DOM`元素的很相似，但是有一点语法上的不同：

+ <font color=#1E90FF>React事件的命名采用小驼峰式（camelCase），而不是纯小写。</font>
+ <font color=#1E90FF>使用JSX语法时你需要传入一个函数作为事件处理函数，而不是一个字符串。</font>

```html
<!--传统的html-->
<button onclick="activateLasers()">
  Activate Lasers
</button>

<!--react写法-->
<button onClick={activateLasers}>
  Activate Lasers
</button>
```

### 2. 阻止默认行为
<font color=#DD1144>在React中另一个不同点是你不能通过返回false的方式阻止默认行为。你必须显式的使用preventDefault</font>

```html
<!--传统的html-->
<a href="#" onclick="console.log('The link was clicked.'); return false">
  Click me
</a>

<!--react写法-->
<script>
	function ActionLink() {
		function handleClick(e) {
			e.preventDefault(); // 阻止默认行为
			console.log('The link was clicked.');
		}

		return (
			<a href="#" onClick={handleClick}>
				Click me
			</a>
		);
	}
</script>
```
<font color=#1E90FF>在这里，e是一个合成事件。React根据W3C规范来定义这些合成事件，所以你不需要担心跨浏览器的兼容性问题</font>

### 3. 声明类的方法
我们在组件或者父组件当中都会遇到绑定事件和传递事件的情况，一般我们都推荐这样一种处理方式：<font color=#9400D3>将事件处理函数声明为class中的方法，在有传递参数的时候直接使用箭头函数</font>

```javascript
class Toggle extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this); // 绑定为父组件的方法
  }

  handleClick(index) {
		if(!argument[0]) index=1
		console.log(index,this) // 无论什么用法，这里打印的this都指向父组件
  }

  render() {
    return (
			<button onClick={this.handleClick}>1</button> {/*普通的用法*/}
			<button onClick={() => {this.handleClick(2)}}>2</button> {/*带参数的用法*/}
			<Child handleClick={this.handleClick} /> {/*传递给子组件*/}
    );
  }
}

class Child extends React.Component {
	constructor(props) {
    super(props)
	}
	render() {
		return (
			<button onClick={this.props.handleClick}>3</button> {/*子组件普通的用法*/}
			<button onClick={() => { this.props.handleClick(4) }}>4</button> {/*子组件带参数的用法*/}
		)
	}
}
```
如上代码所示，将函数声明为`class`中的函数有这么几个好处：
+ <font color=#9400D3>class的方法默认不会绑定this。如果你忘记绑定this.handleClick并把它传入了onClick，当你调用这个函数的时候this的值为undefined。所以尤其在子组件中调用父组件传递来的方法就必须要绑定，确保子组件调用父组件中的方法中的this指向父组件</font>

+ <font color=#9400D3>如果该回调函数作为prop传入子组件时，我们通常建议在构造器中绑定或使用 箭头函数语法来避免组件可能会进行额外的重新渲染</font>

当然了，向事件处理程序传递参数实际上也有两种方法：
```javascript
<button onClick={(e) => this.deleteRow(id, e)}>Delete Row</button>
<button onClick={this.deleteRow.bind(this, id)}>Delete Row</button>
```
上述两种方式是等价的，分别通过<font color=#DD1144>箭头函数</font> 和 <font color=#DD1144>Function.prototype.bind</font>来实现。

在这两种情况下，`React`的事件对象`e`会被作为第二个参数传递。如果通过箭头函数的方式，事件对象必须显式的进行传递，而通过`bind`的方式，事件对象以及更多的参数将会被隐式的进行传递

关于这种事件的写法我们在[this写法略讲](taopoppy.cn/react-redux/jiagou_sign_one.html#this写法略讲)有对绑定写法和箭头函数写法更细致的分析。

## 条件渲染
没啥可用的信息，初学者可以到官网上[条件渲染](https://zh-hans.reactjs.org/docs/conditional-rendering.html)通读一遍即可。

## 列表&Key
关于在渲染列表的时候为什么要提供`key`值，我们之前就在[Diff算法](taopoppy.cn/react-redux/react_advanced_one.html#_3-diff算法)简单的讲解过。

## 表单
和表单相关的[受控组件](https://zh-hans.reactjs.org/docs/forms.html#controlled-components)和[非受控组件](https://zh-hans.reactjs.org/docs/uncontrolled-components.html)可以直接在官网上看。