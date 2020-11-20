# Hook API

基础Hook
+ <font color=#1E90FF>useState</font>
+ <font color=#1E90FF>useEffect</font>
+ <font color=#1E90FF>useContext</font>

额外的Hook

+ <font color=#1E90FF>useReducer</font>
+ <font color=#1E90FF>useCallback</font>
+ <font color=#1E90FF>useMemo</font>
+ <font color=#1E90FF>useRef</font>
+ <font color=#1E90FF>useImperativeHandle</font>
+ <font color=#1E90FF>useLayoutEffect</font>
+ <font color=#1E90FF>useDebugValue</font>

## useState
### 1. initialState

<font color=#1E90FF>**① 直接赋值**</font>

```javascript
const [state, setState] = useState(initialState)
```
返回一个`state`，以及更新`state`的函数。
+ <font color=#1E90FF>返回的状态(state)与传入的第一个参数(initialState)值相同。在后续的重新渲染中，useState返回的第一个值将始终是更新后最新的state。</font>
+ <font color=#1E90FF>setState函数用于更新state。它接收一个新的state值并将组件的一次重新渲染加入队列。setState函数的标识是稳定的，并且不会在组件重新渲染时发生变化。</font>

<font color=#1E90FF>**② 函数计算**</font>

`initialState`参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。如果初始`state`需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的`state`，<font color=#DD1144>此函数只在初始渲染时被调用</font>：

```javascript
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});

```

### 2. setState
```javascript
function App({initialCount}) {
	const [state, setState] = useState(initialCount);
	function one() {
		// 1. 初级用法
		setState(1)
	}

	function two() {
		// 2. 中级用法
		setState(preState => preState + 1)
	}

	function three(updateValues) {
		// 与class组件中的setState方法不同，useState不会自动合并更新对象。
		// 你可以用函数式的setState结合展开运算符来达到合并更新对象的效果。
		// 3. 高级用法
		setState(preState => {
			return {...preState, ...updateValues}
		})
	}

	return (
    <>Count: {count}</>
  );
}
```

### 3. 跳过state更新
<font color=#DD1144>调用State Hook的更新函数并传入当前的state时，React将跳过子组件的渲染及effect的执行。</font>

<font color=#DD1144>需要注意的是，React可能仍需要在跳过渲染前渲染该组件。不过由于React不会对组件树的“深层”节点进行不必要的渲染，所以大可不必担心。如果你在渲染期间执行了高开销的计算，则可以使用useMemo来进行优化。</font>

## useEffect
### 1. 清除effect
清除`effect`这个我们在之前就已经详细的说明了：<font color=#1E90FF>通常情况下，组件多次渲染时，每次渲染的时候执行当前effect之前会清除上一次渲染时的effect</font>

### 2. effect的条件执行
`effect`的执行条件和`useEffect`的第二个参数有很紧密的关系，第二个参数的三种写法我们在`Effect Hook`那一章就详细的进行了说明。

官网推荐的做法是：<font color=#DD1144>所有effect函数中引用的值都应该出现在依赖项数组中。</font>

## useContext
### 1. useContext的本质
```javascript
const value = useContext(MyContext);
```
接收一个`context`对象（`React.createContext`的返回值,必须是`context`对象本身，不能是`context.Consumer`，也不能是`context.Provider`）并返回该`context`的当前值。当前的`context`值由上层组件中距离当前组件最近的`<MyContext.Provider>` 的`value`这个`prop`决定。

当组件上层最近的`<MyContext.Provider>`更新时，该`Hook`会触发重渲染，并使用最新传递给`MyContext provider`的`context value`值。即使祖先使用`React.memo`或 `shouldComponentUpdate`，也会在组件本身使用`useContext`时重新渲染。

总结：<font color=#DD1144>useContext实际上就是在函数组件中的作用等价于类组件中的static contextType = MyContext或者 <MyContext.Consumer>，相同之处就是仍然需要在上层组件树中使用<MyContext.Provider>来为下层组件提供context</font>

### 2. useContext的用法
`useContext`的用法极其简单，只要你熟悉类组件中的`context API`，`useContext`的用法比之前更简单。

```javascript
const themes = {
  light: { foreground: "#000000", background: "#eeeeee"},
  dark: { foreground: "#ffffff", background: "#222222" }
};

const ThemeContext = React.createContext(themes.light);

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
	// hooks当中的useContext使用起来更简单
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

## useReducer
### 1. useReducer的用法场景
```javascript
const [state, dispatch] = useReducer(reducer, initialArg, init);
```
`useState`的替代方案。它接收一个形如`(state, action) => newState`的`reducer`，并返回当前的`state`以及与其配套的`dispatch`方法。（如果你熟悉`Redux`的话，就已经知道它如何工作了。）

在某些场景下，`useReducer`会比`useState`更适用，例如:
+ <font color=#9400D3>state逻辑较复杂且包含多个子值</font>
+ <font color=#9400D3>或者下一个state依赖于之前的state，同时state的变化模式固定在某几种变化之间</font>。

<font color=#9400D3>并且，使用useReducer还能给那些会触发深更新的组件做性能优化，因为你可以向子组件传递dispatch而不是回调函数，使得子组件可以轻松调用父组件中的dispatch方法去修改父组件的state，因为React会确保dispatch函数的标识是稳定的，并且不会在组件重新渲染时改变。</font>

```javascript
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```

### 2. state的初始化
<font color=#1E90FF>**① 指定初始state**</font>

有两种不同初始化`useReducer state`的方式，你可以根据使用场景选择其中的一种。将初始 `state`作为第二个参数传入`useReducer`是最简单的方法：
```javascript
const [state, dispatch] = useReducer(
	reducer,
	{count: initialCount}
);
```

<font color=#1E90FF>**② 惰性初始化**</font>

你可以选择惰性地创建初始`state`。为此，需要将`init`函数作为`useReducer`的第三个参数传入，这样初始`state`将被设置为`init(initialArg)`。

<font color=#DD1144>这么做可以将用于计算state 的逻辑提取到 reducer 外部，这也为将来对重置state的action做处理提供了便利</font>

```javascript
// 重置数据的函数
function init(initialCount) {
  return {count: initialCount};
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Counter({initialCount}) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({type: 'reset', payload: initialCount})}>
        Reset
      </button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}

```

## useCallback
### 1. useCallback官网介绍
```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```
<font color=#9400D3>返回一个memoized回调函数。useCallback(fn, deps) 相当于 useMemo(() => fn, deps)</font>

把内联回调函数及依赖项数组作为参数传入`useCallback`，它将返回该回调函数的`memoized`(记忆)版本，该回调函数仅在某个依赖项改变时才会更新。当你把回调函数传递给经过优化的并使用引用相等性去避免非必要渲染（例如`shouldComponentUpdate`）的子组件时，它将非常有用。

### 2. useCallback的本质
当然了，以上是官网的描述，让我来告诉你`useCallback`到底能干什么：
```javascript
import React, {useReducer,useState} from 'react'

function countReducer(state, action) {
	switch (action.type) {
		case 'add':
			return state + 1
		case 'minus':
			return state - 1
		default:
			return state
	}
}

function TextB() {
	const [count, dispatchCounter] = useReducer(countReducer, 0)
	const [name, setName] = useState('taopoppy')

	return(
		<div>
			<input value={name} onChange={e => setName(e.target.value)} />
			<Child
				onButtonClick={()=>dispatchCounter({type:'add'})}
			/>
			<span>{count}</span>
		</div>
	)
}

function Child({onButtonClick}) {
	console.log('child render')
	return (
		<button onClick={onButtonClick} style={{color:"red"}}>
			click
		</button>
	)
}

export default TextB
```
<font color=#DD1144>可以清楚的看到，在我们修改input当中的值的时候，实际上只修改了name这个State状态，但是对于Child组件，传入的onButtonClick属性是个内敛函数()=>dispatchCounter({type:'add'})，这个内敛函数在每次TextB重新渲染的时候都会重新生成，作为新的函数再次传递给Child，所以会导致Child认为父组件传入的props发生了变化，致使Child也发生渲染，所以发生性能损耗。所以我们才要使用useCallback告诉子组件传递给你的props实际上在逻辑上没有变化，不需要你重新渲染，所以我们useCallback改写如下</font>：

```javascript
// 当dispatchCounter不发生变化的时候，使用useCallback记录原来的匿名函数
// 第一种写法
const handleButtonClick = useCallback(
	()=>dispatchCounter({type:'add'}),
	[dispatchCounter]
)

// 第二种写法
const handleButtonClick = useMemo(
	() => ()=>dispatchCounter({type:'add'}),
	[dispatchCounter]
)
```
<font color=#DD1144>值得注意的是如果，第二个参数数组当中如果有依赖useState或者useReducer返回的第二个参数，例如setState或者dispatchState，就可以省略不写，因为setState这些修改状态的函数标识是不会变的</font>，比如下面的例子

```javascript
import React, { useState, useCallback, memo } from "react";

const Child = memo(function Child({ handleClick }) {
  console.log("child");
  return (
    <>
      <button onClick={handleClick}>click</button>
    </>
  );
});

function App() {
  const [count, setCount] = useState(0);
  const [name, dispatchName] = useReducer(nameReducer, "1");


  const handleClick = useCallback(() => {
    setCount((preCount) => preCount + 1);
  }, []);

  // 这种写法和上面是一样效果
  // const handleClick = useCallback(() => {
  //   setCount((preCount) => preCount + 1);
  // }, [setCount]);

  const handleClick1 = useCallback(() => {
    dispatchName({type: "add"})
  },[])

  // 这种写法和上面是一样的效果
  // const handleClick1 = useCallback(() => {
  //   dispatchName({type: "add"})
  // },[dispatchName])

  return (
    <>
      <p>{count}</p>
      <Child handleClick={handleClick} />
      <Child handleClick={handleClick1} />
    </>
  );
}

export default App;
```

同时我们依然需要使用`memo`来包裹子组件：
```javascript
const Child = memo(function Child({ onButtonClick }) {
  console.log("child render");
  return (
    <button onClick={onButtonClick} style={{ color: "red" }}>
      click
    </button>
  );
});
```

## useMemo
### 1. useMemo的含义
```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```
<font color=#9400D3>返回一个memoized值。</font>

把“创建”函数和依赖项数组作为参数传入`useMemo`，它仅会在某个依赖项改变时才重新计算 `memoized`值。这种优化有助于避免在每次渲染时都进行高开销的计算。

### 2. useMemo的使用注意

+ 记住，<font color=#9400D3>传入useMemo的函数会在渲染期间执行，因为useMemo是有返回值，返回值会参与渲染，useEffect是在渲染完毕之后执行的</font>。请不要在这个函数内部执行与渲染无关的操作，诸如副作用这类的操作属于`useEffect`的适用范畴，而不是`useMemo`。

+ <font color=#1E90FF>如果没有提供依赖项数组，useMemo在每次渲染时都会计算新的值</font>。

你可以把`useMemo`作为性能优化的手段，但不要把它当成语义上的保证。将来，React 可能会选择“遗忘”以前的一些`memoized`值，并在下次渲染时重新计算它们，比如为离屏组件释放内存。先编写在没有`useMemo`的情况下也可以执行的代码 —— 之后再在你的代码中添加`useMemo`，以达到优化性能的目的。

我们来举个例子：
```javascript
import React, { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("taopoppy");

	// config是由count衍生出的变量
  const config = {
    text: `count is ${count}`,
    color: count > 3 ? "red" : "blue"
  };

  return (
    <div>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <Child config={config} />
    </div>
  );
}

// 使用了memo包裹子组件
const Child = memo(function Child({ config }) {
  console.log("child render");
  return <button style={{ color: config.color }}>{config.text}</button>;
});


export default App;
```
<font color=#DD1144>可以清楚的看到，config是由count计算出来的一个值，当我们修改输入框的值的时候修改的是name，没有修改count，但是在组件重新渲染的时候，config就会重新生成和计算，导致即使Child被memo包裹，Child也认为每次传入的config这个props属性是个新值，Child就会重新渲染，但实际上config值没有发生变化</font>

所以同样，我们要使用`memo`和`useMemo`去优化：
```javascript
import React, { useState, memo, useMemo } from "react"; // 1. 引入memo、useMemo、useCallback

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("taopoppy");

  // 3. 当count没有发生变化的时候，使用useMemo记录原来的config
  const config = useMemo(
    () => ({
      text: `count is ${count}`,
      color: count > 3 ? "red" : "blue"
    }),
    [count]
  );

  return (
    <div>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <Child config={config} />
    </div>
  );
}

// 2. 使用memo方法包裹子组件
const Child = memo(function Child({ config }) {
  console.log("child render");
  return <button style={{ color: config.color }}>{config.text}</button>;
});

export default App;
```

## useRef
### 1. useRef的本质
```javascript
const refContainer = useRef(initialValue);
```
<font color=#9400D3>useRef返回一个可变的ref对象，其.current 属性被初始化为传入的参数（initialValue）。返回的ref对象在组件的整个生命周期内保持不变。</font>

<font color=#DD1144>本质上，useRef就像是可以在其.current属性中保存一个可变值的“盒子”。它可以很方便地保存任何可变值，其类似于在class中使用实例字段的方式。这是因为它创建的是一个普通Javascript对象。而useRef()和自建一个{current: ...}对象的唯一区别是，useRef会在每次渲染时返回同一个ref对象。</font>

### 2. useRef的用途
<font color=#1E90FF>**① 获取子组件或者DOM节点的句柄**</font>

一个常见的用例便是命令式地访问子组件：
```javascript
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```
你应该熟悉`ref`这一种访问`DOM`的主要方式。如果你将`ref`对象`<div ref={myRef} />`形式传入组件，则无论该节点如何改变，`React`都会将`ref`对象的`.current`属性设置为相应的`DOM`节点。

当`ref`对象内容发生变化时，`useRef`并不会通知你。变更`.current`属性不会引发组件重新渲染。如果想要在`React`绑定或解绑`DOM`节点的`ref`时运行某些代码，则需要使用回调`ref`来实现。

<font color=#1E90FF>**② 渲染周期之间共享数据的存储**</font>

```javascript
import React, { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  const handleSetTime = () => {
    console.log("handleSetTime");
    setTimeout(() => {
      alert(count);
    }, 3000);
  };

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <button onClick={handleSetTime}>setTime</button>
    </>
  );
}

export default App;
```
我们给出了一个比较经典的定时器例子，点击第二个`button`开始计时三秒，在三秒之内连续点击3次第一个按钮，但是三秒之后，`alert`显示的`count`是0，但是实际上`count`已经变成了3。

我们这样解释：<font color=#DD1144>点击第二按钮的时候，组件没有重新渲染，所以handleSetTime中调用的count就是本次闭包当中的count，但是连续点击3次第一个按钮，每点一次，组件就重新渲染，就会产生新的闭包，新的闭包当中就包含新的count值，可是定时器从头到尾使用的都是第一个闭包的count，所以导致三秒之后alert的是第一个闭包当中的count</font>

如果我们想让定时器显示的是最新的`count`，我们需要将每次闭包当中变化的`count`保存在一个固定的对象，这个固定的对象就是`ref`
```javascript
import React, { useEffect, useRef, useState } from "react";

function App() {
  const ref = useRef(0); // 1. 每次都获取同一个对象
  const [count, setCount] = useState(0);
  ref.current = count;  // 2. 把每次count的变化新值记录在current属性当中

  const handleSetTime = () => {
    setTimeout(() => {
      alert(ref.current); // 3. 最终打印的就是最后一个闭包当中的count值
    }, 3000);
  };

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <button onClick={handleSetTime}>setTime</button>
    </>
  );
}

export default App;

```

关于`useRef`实际上涉及到的是一个<font color=#9400D3>闭包陷阱</font>的问题，我们在`react`服务端渲染的时候讲过，所以可以到[闭包陷阱](https://www.taopoppy.cn/react-ssr/ssr_combat_project_three.html#%E9%97%AD%E5%8C%85%E9%99%B7%E9%98%B1)仔细体会一下。


## useImperativeHandle
```javascript
useImperativeHandle(ref, createHandle, [deps])
```
<font color=#9400D3>useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值</font>。在大多数情况下，应当避免使用`ref`这样的命令式代码。`useImperativeHandle`应当与`forwardRef`一起使用：

```javascript
const FancyInput = forwardRef((props, ref)=> {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />;
})

export default FancyInput;
```
在本例中，渲染`<FancyInput ref={inputRef} />`的父组件可以调用`inputRef.current.focus()`。