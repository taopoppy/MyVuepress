# Refs

## Refs概述
<font color=#9400D3>Refs 提供了一种方式，允许我们访问DOM节点或在render方法中创建的React元素。</font>

<font color=#1E90FF>**① 何时使用Refs**</font>

但是，在某些情况下，<font color=#1E90FF>你需要在典型数据流之外强制修改子组件</font>。被修改的子组件可能是一个`React`组件的实例，也可能是一个`DOM`元素。比如下面这些情况都适合使用`Refs`来解决：
+ 管理焦点、文本选择和媒体播放
+ 触发强制动画
+ 集成第三方`DOM`库

<font color=#1E90FF>**② Refs的变化**</font>

在`React 16.3`版本引入的<font color=#9400D3>React.createRef()</font>的`API`。如果你正在使用一个较早版本的`React`，我们推荐你使用[回调形式的refs](taopoppy.cn/react-redux/react_base_guanwang_refs.html)。

## 创建Refs
### 1. React.createRef
`Refs`是使用`React.createRef()`创建的，并通过`ref`属性附加到`React`元素。<font color=#1E90FF>在构造组件时，通常将 Refs 分配给实例属性，以便可以在整个组件中引用它们。</font>

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef(); // 组件当中都可以使用this.myRef
  }
  render() {
    return <div ref={this.myRef} />;
  }
}
```

### 2. Refs Callback
<font color=#9400D3>回调Refs</font>是另外一种设置`refs`的方式，使用它的原因是：<font color=#1E90FF>它能助你更精细地控制何时refs被设置和解除，尤其是想要在React绑定或解绑DOM节点的ref时运行某些代码的时候</font>

不同于传递`createRef()`创建的`ref`属性，你会传递一个函数。这个函数中接受`React`组件实例或`HTML DOM`元素作为参数，以使它们能在其他地方被存储和访问。下面的例子描述了一个通用的范例：使用`ref`回调函数，在实例的属性中存储对`DOM`节点的引用。

```javascript
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = null;

    // 2. ref回调函数
    this.setTextInputRef = element => {
      this.textInput = element;
    };

    this.focusTextInput = () => {
      // 3. 使用原生DOM API使text输入框获得焦点
      if (this.textInput) this.textInput.focus();
    };
  }

  componentDidMount() {
    // 4. 组件挂载后，让文本框自动获得焦点
    this.focusTextInput();
  }

  render() {
    // 1. 使用ref的回调函数setTextInputRef将输入框DOM节点的引用存储到React实例的属性上（比如 this.textInput）
    return (
      <div>
        <input
          type="text"
          ref={this.setTextInputRef}
        />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}
```

::: tip
<font color=#3eaf7c>React 将在组件挂载时，会调用 ref 回调函数并传入 DOM 元素，当卸载时调用它并传入 null。在 componentDidMount 或 componentDidUpdate 触发前，React 会保证 refs 一定是最新的。比如下面这个例子</font>
:::

```javascript
class Parent extends React.Component {
	constructor(props) {
		super(props)
		this.textInput = null
	}
	getCustomTextInput = (element) => {
		if(element !== null) {
			// 如果是null，说明组件要卸载，准备解绑DOM节点了
		} else {
			// 如果不是null，说明组件马上要挂载了，准备绑定DOM元素了
			this.textInput = element
		}
	}

  render() {
    return (
      <CustomTextInput
        inputRef={this.getCustomTextInput}
      />
    );
  }
}

function CustomTextInput(props) {
  return (
    <div>
      <input ref={props.inputRef} />
    </div>
  );
}
```
在上面的例子中，`Parent`把它的`refs`回调函数当作`inputRef props`传递给了`CustomTextInput`，而且`CustomTextInput`把相同的函数作为特殊的`ref`属性传递给了`input`。结果是，<font color=#1E90FF>在Parent中的this.inputElement会被设置为与CustomTextInput中的input元素相对应的DOM节点</font>

## 访问Refs
<font color=#DD1144>当ref被传递给render中的元素时，对该节点的引用可以在ref的current属性中被访问。</font>

```javascript
const node = this.myRef.current;
```

`ref`的值根据节点的类型而有所不同：

+ <font color=#1E90FF>当ref属性用于HTML元素时，构造函数中使用React.createRef()创建的ref接收底层DOM元素作为其current属性。</font>
+ <font color=#1E90FF>当ref属性用于自定义class组件时，ref对象接收组件的挂载实例作为其current属性。</font>
+ <font color=#9400D3>你不能在函数组件上使用ref属性，因为他们没有实例</font>

我们下面来说明不同的节点使用`ref`的差异：

### 1. Dom元素
```javascript
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);
    // 创建一个 ref 来存储 textInput 的 DOM 元素
    this.textInput = React.createRef();
    this.focusTextInput = this.focusTextInput.bind(this);
  }

  focusTextInput() {
    // 直接使用原生 API 使 text 输入框获得焦点
    // 注意：我们通过 "current" 来访问 DOM 节点
    this.textInput.current.focus();
  }

  render() {
    // 告诉 React 我们想把 <input> ref 关联到
    // 构造器里创建的 `textInput` 上
    return (
      <div>
        <input
          type="text"
          ref={this.textInput} />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}
```
::: tip
React 会在组件挂载时给current 属性传入 DOM 元素，并在组件卸载时传入 null 值。ref 会在 componentDidMount 或 componentDidUpdate 生命周期钩子触发前更新。
:::


### 2. 类组件
如果我们想包装上面的`CustomTextInput`，<font color=#1E90FF>来模拟它挂载之后立即被点击的操作</font>，我们可以使用`ref`来获取这个自定义的`input`组件并手动调用它的`focusTextInput`方法：

```javascript
class AutoFocusTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }

  componentDidMount() {
		// this.textInput.current就代表CustomTextInput组件的实例
    this.textInput.current.focusTextInput();
  }

  render() {
    return (
      <CustomTextInput ref={this.textInput} />
    );
  }
}
```

### 3. 函数组件
<font color=#9400D3>你不能在函数组件上使用ref属性，但是可以在函数组件内部使用ref属性，只要它指向一个DOM元素或class组件</font>

```javascript
function CustomTextInput(props) {
  // 这里必须声明textInput，这样ref才可以引用它
  const textInput = useRef(null);

  function handleClick() {
    textInput.current.focus();
  }

  return (
    <div>
      <input
        type="text"
        ref={textInput} />
      <input
        type="button"
        value="Focus the text input"
        onClick={handleClick}
      />
    </div>
  );
}
```

::: warning
<font color=#DD1144>请记住，当 ref 对象内容发生变化时，useRef 并不会通知你。变更 .current 属性不会引发组件重新渲染。如果想要在React绑定或解绑DOM节点的ref时运行某些代码，则需要使用[回调形式的refs](taopoppy.cn/react-redux/react_base_guanwang_refs.html)来实现。</font>
:::

## Refs转发
### 1. 为什么需要Refs转发
在极少数情况下，<font color=#DD1144>你可能希望在父组件中引用子节点的DOM节点。通常不建议这样做，因为它会打破组件的封装，但它偶尔可用于触发焦点或测量子DOM节点的大小或位置</font>。

对于自定义组件而言，但这不是一个理想的解决方案，因为你只能获取组件实例而不是DOM节点。并且，它还在函数组件上无效。所以如果你使用16.3或更高版本的React, 这种情况下我们推荐使用ref转发。

<font color=#9400D3>Ref转发使组件可以像暴露自己的ref一样暴露子组件的ref，解决我们在自定义组件当中的缺憾（类组件添加ref只能获取到组件实例而不是DOM节点，函数组件无法使用添加的ref属性），这就是使用Refs的原因</font>


### 2. 转发refs到DOM 组件
未完待续...

### 3. 在高阶组件中转发refs
未完待续...
