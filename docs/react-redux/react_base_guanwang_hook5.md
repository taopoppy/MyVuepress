# Hook API&FAQ

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