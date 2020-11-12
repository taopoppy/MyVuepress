# Refs

## Refs概述
<font color=#9400D3>Refs 提供了一种方式，允许我们访问DOM节点或在render方法中创建的React元素。</font>

<font color=#1E90FF>**① 何时使用Refs**</font>

但是，在某些情况下，<font color=#1E90FF>你需要在典型数据流之外强制修改子组件</font>。被修改的子组件可能是一个`React`组件的实例，也可能是一个`DOM`元素。比如下面这些情况都适合使用`Refs`来解决：
+ 管理焦点、文本选择和媒体播放
+ 触发强制动画
+ 集成第三方`DOM`库

<font color=#1E90FF>**② Refs的变化**</font>

在`React 16.3`版本引入的<font color=#9400D3>React.createRef()</font>的`API`。如果你正在使用一个较早版本的`React`，我们推荐你使用[回调形式的refs](https://zh-hans.reactjs.org/docs/refs-and-the-dom.html#callback-refs)。

## 创建Refs
### 1. React.createRef
`Refs`是使用`React.createRef()`创建的，并通过`ref`属性附加到`React`元素。<font color=#1E90FF>在构造组件时，通常将 Refs 分配给实例属性，以便可以在整个组件中引用它们。</font>

```javascript
import React from "react";
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef(); // 组件当中都可以使用this.myRef
  }

  componentDidMount() {
    console.log(Object.prototype.toString.call(this.myRef) === "[object Object]"); // true
    console.log(Object.prototype.toString.call(this.myRef.current) ==="[object HTMLDivElement]"); // true
    console.log(this.myRef); // {current: <div></div>}
  }

  render() {
    return <div ref={this.myRef} />;
  }
}

export default MyComponent;
```
<font color=#DD1144>我们可以清晰的看到，this.myRef是个普通的JS对象，其中的current的属性的属性值就是那个具体的DOM节点，current属性值是Node类型。</font>

::: tip
<font color=#3eaf7c>React 会在组件挂载时给ref.current 属性传入 DOM 元素，并在组件卸载时传入 null 值。ref 会在 componentDidMount 或 componentDidUpdate 生命周期钩子触发前更新。所以是可以在componentDidMount 或 componentDidUpdate当中拿到最新的ref</font>
:::

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
    console.log(Object.prototype.toString.call(this.textInput) ==="[object HTMLInputElement]"); // true
    console.log(this.textInput); // <input type="text"></input>
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
<font color=#DD1144>可以清晰的看到，和React.createRef()创建的ref有很大区别，通过回调refs创建的ref的类型直接就是Node节点类型</font>

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
<font color=#1E90FF>这里要注意一个调用顺序的问题：AutoFocusTextInput.textInput的结构是普通的JS对象，结构是{current: CustomTextInput}, CustomTextInput当中有focusTextInput类方法，在这个方法当中通过CustomTextInput.textInput这个ref调用到了真正的input那个DOM节点，所以顺序是：父组件AutoFocusTextInput -> (调用ref) -> CustomTextInput -> (调用ref) -> input元素</font>，<font color=#DD1144>所以你可以看到实际上对于自定义的子组件来说，父组件无法直接拿到子组件中的DOM元素的，必须要跨过子组件本身，这也为我们后面的Refs转发埋下了伏笔</font>

经过上面的一系列学习，我们需要通过一个逻辑图来理清一下思路，下面这张图展示的就是使用不同的`refs`创建方法，针对不同类型的子组件，最终创建的`refs`的数据结构（<font color=#1E90FF>需要说明的是，其实组件实例对象就是虚拟DOM，虚拟DOM不过是用来描述DOM结构的普通JS对象</font>）

<img :src="$withBase('/react_guanwang_refs.png')" alt="refs使用">


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

对于自定义组件而言，但这不是一个理想的解决方案，因为你只能获取组件实例而不是DOM节点。并且，它还在函数组件上无效。所以如果你使用16.3或更高版本的React, 这种情况下我们推荐使用`ref`转发。

<font color=#9400D3>Ref转发使组件可以像暴露自己的ref一样暴露子组件的ref，解决我们在自定义组件当中的缺憾（类组件添加ref只能获取到组件实例而不是DOM节点，函数组件无法使用添加的ref属性），这就是使用Refs的原因</font>

### 2. refs转发的定义
<font color=#9400D3>Ref 转发是一项将ref自动地通过组件传递到其一子组件的技巧。对于大多数应用中的组件来说，这通常不是必需的。但其对某些组件，尤其是可重用的组件库是很有用的。Ref 转发是一个可选特性，其允许某些组件接收 ref，并将其向下传递（换句话说，“转发”它）给子组件。</font>

### 3. 转发refs到DOM 组件
```javascript
import React, { useEffect, useRef } from "react";

function App() {
  // 1. 父组件创建refs
  const fancyButton_button = useRef(null);

  useEffect(() => {
    // 4. 这样父组件就可以直接拿到子组件中的底层DOM节点
    console.log(fancyButton_button.current); // <button class="FancyButton">CLICK</button>
    console.log(Object.prototype.toString.call(fancyButton_button.current)); // [object HTMLButtonElement] 
  }, []); 

  return (
    <>
      <FancyButton ref={fancyButton_button}>CLICK</FancyButton> {/* 2. ref传递给子组件*/}
    </>
  );
}

// 3. 子组件使用React.forwardRef包装，把父组件传递来的ref挂载到了底层DOM节点button上
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

export default App;
```
上述代码的最终结果就是：父组件的`ref`挂载完成后，`ref.current`就指向子组件`FancyButton`中的`button`这个底层`DOM`节点。<font color=#DD1144>所以直观的去理解Refs转发，实际上更像Refs穿透，传统的ref使用是App -> FancyButton -> button，对FancyButton使用React.forwardRef后，结果变成了App -> button</font>

::: warning
注意

第二个参数 ref 只在使用 React.forwardRef 定义组件时存在。常规函数和 class 组件不接收 ref 参数，且 props 中也不存在 ref。

Ref 转发不仅限于 DOM 组件，你也可以转发 refs 到 class 组件实例中。
:::


### 4. 在高阶组件中转发refs
我们上面说到了：<font color=#9400D3>Refs转发理解为Refs穿透会更贴近于直观感受，这种理解也更有助于我们明白为什么转发Refs在高阶组件HOC当中使用是极其方便和有用的</font>

```javascript
import React, { useEffect, useRef } from "react";

function App() {
  const fancyButton_button = useRef(null);

  useEffect(() => {
    console.log(fancyButton_button.current); // HocbuttonOne
    console.log(Object.prototype.toString.call(fancyButton_button.current)); // 【object Object】
  }, []);

  const HocFancyButton = hocButtonone(FancyButton);

  return <HocFancyButton ref={fancyButton_button} />;
}

function hocButtonone(Component) {
  class HocButtonOne extends React.Component {
    render() {
      const { ref, ...rest } = this.props;

      return <Component ref={ref} {...rest} />;
    }
  }
  return HocButtonOne; // 直接返回包装组件
}

class FancyButton extends React.Component {
  render() {
    return (
      <>
        <button>{this.props.children}</button>
      </>
    );
  }
}

export default App;
```
通过上面的例子，我们比较容易看出来，因为子组件`FancyButton`外部用了`Hoc`组件包裹，当我们在父组件`App`当中想通过传递`ref`属性拿到`FancyButton`就基本是不可能了，只能拿到最外层包裹的`Hoc`的实例。<font color=#1E90FF>但是我们有了Refs转发，我们就可以穿透Hoc拿到真正的子组件</font>

```javascript
import React, { useEffect, useRef } from "react";

function App() {
  const fancyButton_button = useRef(null);

  useEffect(() => {
    console.log(fancyButton_button.current); // FancyButton
    console.log(Object.prototype.toString.call(fancyButton_button.current)); // 【object Object】
  }, []);

  const HocFancyButton = hocButtonone(FancyButton);

  return <HocFancyButton ref={fancyButton_button} />;
}

function hocButtonone(Component) {
  class HocButtonOne extends React.Component {
    render() {
      const { forwardedRef, ...rest } = this.props;

      return <Component ref={forwardedRef} {...rest} />;
    }
  }
  // 返回React.forwardRef包装组件
  // 然后将ref作为普通forwardedRef这种普通的props属性传递下去
  return React.forwardRef((props, ref) => {
    return <HocButtonOne {...props} forwardedRef={ref} />;
  });
}

class FancyButton extends React.Component {
  render() {
    return (
      <>
        <button>{this.props.children}</button>
      </>
    );
  }
}

export default App;
```
通过上面的`React.forwardRef`的学习，我们好像发现了点东西：<font color=#DD1144>ref并不是一个props属性，React对其有着特殊的处理，而React.forwardRef实际是一种可以拿到ref，并且可以将其作为props处理的一种方式，使得ref可以像props一样继续向下传递，所以从直观的感觉就是ref穿透了，实际上是refs继续向下传递了</font>

::: tip
<font color=#1E90FF>那如此说来，就要两种写法出现：</font>

+ <font color=#9400D3>在多个高阶组件包裹的组件当中，我们只需要从一开始就将其所为普通的props传递，传递到最里面的子组件时，再用ref接收，父组件不就穿过层层HOC拿到了子组件或者子组件当中的DOM了么(下面的第一个例子)。</font>

+ <font color=#9400D3>或者在每个HOC当中都使用React.forwardRef继续拿到ref并向下传递，父组件也可以穿过层层HOC拿到了子组件或者子组件当中的DOM(下面的第二个例子)</font>
:::

```javascript
// 第一种改法
import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.fancyButton_button = React.createRef();
  }

  componentDidMount() {
    console.log(this.fancyButton_button.current); // 5. 拿到DOM节点 <button></button>
    console.log(
      Object.prototype.toString.call(this.fancyButton_button.current)
    ); // [object Object]
  }

  render() {
    const HocFancyButton = hocButtontwo(hocButtonone(FancyButton));
    // 1. ref作为普通的forwardedRef这种props进行传递
    return <HocFancyButton forwardedRef={this.fancyButton_button} />;
  }
}

// hoc组件1
function hocButtonone(Component) {
  class HocButtonOne extends React.Component {
    componentDidMount() {
      console.log("hocButtonone");
    }

    render() {
      // 2. 继续将forwardedRef传递
      return <Component {...this.props} />;
    }
  }
  return HocButtonOne;
}

function hocButtontwo(Component) {
  class HocButtonTwo extends React.Component {
    componentDidMount() {
      console.log("hocButtontwo");
    }
    render() {
      // 3. 继续将forwardedRef传递
      return <Component {...this.props} />;
    }
  }
  return HocButtonTwo;
}

class FancyButton extends React.Component {
  render() {
    return (
      <>
        {/* 4. 最终将forwardedRef赋值给某个DOM节点的ref上*/}
        <button ref={this.props.forwardedRef}>{this.props.children}</button>
      </>
    );
  }
}

export default App;
```
```javascript
// 第二种改法
import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.fancyButton_button = React.createRef();
  }

  componentDidMount() {
    console.log(this.fancyButton_button.current); // 4. 拿到实例对象FancyButton
    console.log(
      Object.prototype.toString.call(this.fancyButton_button.current)
    ); // [object Object]
  }

  render() {
    const HocFancyButton = hocButtontwo(hocButtonone(FancyButton));
    // 1. 直接传递ref
    return <HocFancyButton ref={this.fancyButton_button} />;
  }
}

// hoc组件1
function hocButtonone(Component) {
  // 2. 拿到ref继续向下传递
  const HocButtonOne = React.forwardRef((props, ref) => {
    return <Component {...props} ref={ref} />;
  });

  return HocButtonOne;
}

function hocButtontwo(Component) {
  // 3. 拿到ref继续向下传递
  const HocButtonTwo = React.forwardRef((props, ref) => {
    return <Component {...props} ref={ref} />;
  });

  return HocButtonTwo;
}

class FancyButton extends React.Component {
  render() {
    return (
      <>
        <button>{this.props.children}</button>
      </>
    );
  }
}

export default App;
```
