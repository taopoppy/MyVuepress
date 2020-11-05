# Hook新特性

## 什么是Hooks
<font color=#DD1144>Hooks实际上能让函数组件具有类组件能力的这样的一个功能</font>，我们首先按照旧的类写法去书写一个有状态，并且能保存状态和修改状态的`React`组件：

```javascript
// pages/b.js

import React from 'react'

class MyCount extends React.Component {
	state = {
		count : 0
	}

	componentDidMount() {
		this.interval = setInterval(()=> {
			this.setState({
				count: this.state.count + 1
			})
		}, 1000)
	}

	componentWillUnmount() {
		if(this.interval) {
			clearInterval(this.interval)
		}
	}

	render() {
		return(
			<span>{this.state.count}</span>
		)
	}
}
export default MyCount
```
这样的类写法是无法在函数组件中实现的，因为函数组件当中没有`this`的，但是好在有`Hooks`，能让我们在函数组件当中实现和类组件一样的功能：
```javascript
// pages/b.js
import React,{ useState, useEffect } from 'react'

function MyCountFunc() {
	const [count, setCount] = useState(0)  // 1. 定义初始状态、修改状态的方法,以及默认值
	const [name, setName] = useState('taopoppy')

	useEffect(()=> {                       // 2. 组件更新完成之后去执行回调
		const interval = setInterval(()=> {
			setCount(c=> c + 1)
			setName(c => c + '1')
		}, 1000)

		return () => clearInterval(interval) // 3. 组件卸载的时候去执行回调函数当中返回的回调函数
	}, [])  // 4. 空数组作为useEffect的第二个参数

	return(
		<>
			<span>{count}</span>
			<span>{name}</span>
		</>
	)
}
export default MyCountFunc
```
这里就是完完全使用`React Hooks`来替换类组件的一个小示例，希望能帮助你简单的入门`React Hooks`

## State-Hooks
在对`React Hook`有了一个大致的了解之后，我们就来针对每种`Hooks`的`API`进行仔细的讲解，首先和`State`有关的两个`API`分别是<font color=#9400D3>useState</font>和<font color=#9400D3>useReducer</font>

`useState`本身实际上是基于`useReducer`实现的`Hook`，只不过使用比较多而且使用方法比较简单，而`useReducer`才是真正状态管理的`Hook`

### 1. useState
我们在前面是这样使用`useState`这个钩子的：
```javascript
const [count, setCount =] = useState(0)
```
+ <font color=#1E90FF>count是状态名称，setCount是用来修改状态的函数，useState当中的参数0是count的默认值，注意默认值只在第一次有效，在组件进入到更新的阶段，默认值就已经变化了</font>

+ <font color=#1E90FF>setCount这个修改状态的函数有两种用法</font>
	+ <font color=#DD1144>setCount(1)</font>: 直接将最终的`count`值传入setCount即可，<font color=#9400D3>这种用法一般是count修改的值和之前count的值之间没有直接的关系</font>
	+ <font color=#DD1144>setCount((c) => c + 1)</font>: 传入一个函数，函数的参数是`count`之前的值，函数返回的值作为`count`更新后的值，<font color=#9400D3>这种用法一般是基于旧的值来修改成新的值，新旧值之间有计算关系</font>

+ <font color=#DD1144>切记是不能通过setCount(count + 1)这种方式，这种写法会造成闭包陷阱，也就是count的值永远都是外层函数调用的一瞬间调用的值，如果在定时器或者计时器当中使用修改状态的函数，那么这个状态值永远都是定值。</font>

### 2. useReducer
`useReducer`是一种类似于`redux`使用方式的一种`Hook`，它的具体用法如下：
```javascript
// pages/b.js
// 3. countReducer有点类似于redux当中的action，根据action.type来修改state
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


function MyCountFunc() {
	// 1. dispatchCounter这个修改状态的方法有点类似于派发action的dispatch方法
	const [count, dispatchCounter] = useReducer(countReducer, 0)


	useEffect(()=> {
		const interval = setInterval(()=> {
			// 2. 派发action对象
			dispatchCounter({type: 'add'})
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	return(<><span>{count}</span></>)
}
```

## Effect-Hooks

### 1. useEffect
`useEffect`我们在之前已经简单的说过，`useEffect`的回调函数的作用有点类似于`componentDidMount`，其回调函数返回的函数的作用有点类似于`ComponentWillUnmount`，<font color=#DD1144>但是实际上useEffect的精髓在于它的第二个参数</font>，我们来看下面的代码：

```javascript
function MyCountFunc() {
	const [count, dispatchCounter] = useReducer(countReducer, 0)
	const [name, setName] = useState('taopoppy')

	// 第一种写法
	useEffect(()=>{
		console.log('effect invoked')
		return ()=> console.log('effect deteched')
	})

	// 第二种写法
	useEffect(()=>{
		console.log('effect invoked')
		return ()=> console.log('effect deteched')
	},[count])

	return(
		<>
			<button onClick={()=> dispatchCounter({type: 'add'})}>{count}</button>
			<input value={name} onChange={(e)=>setName(e.target.value)}></input>
		</>
	)
}
```
+ <font color=#DD1144>第一种写法没有第二个参数，这种写法和第二个参数为空数组是一个效果，就是useEffect的回调会在组件一开始的时候执行，回调函数返回的函数会在组件卸载的时候执行，所以这种useEffect的效果就是ComponentDidMount和ComponentWillUnmount</font>

+ <font color=#DD1144>第二种写法的效果就更丰富，不但会在组件一开始的时候执行，回调函数返回的函数会在组件卸载的时候执行，而且会监控你在数组当中书写的元素，因为数组中的元素都是组件的状态名称，一旦这个状态在组件更新的时候发生了变化，useEffect也同样会执行一次回调，而回调函数返回的函数会在组件下一次更新之前执行，所以此时的useEffect的回调函数就像ComponentDidUpdate，而回调函数返回的函数就像ComponentWillUpdate</font>

+ <font color=#DD1144>useEffect的这种第二个参数的写法的意思就是：一个组件当中有很多state，只要出现在第二个参数数组中的state，当其发生变化的时候就会触发useEffect的回调，比如上述代码中的count发生变化就会触发useEffect的回调。没有出现在第二个参数数组中的state，发生变化的时候不会触发useEffect的回调，比如上述代码中的name。react官方建议，凡是在useEffect的回调当中用到的任何一个state，都应该作为元素包含在第二个参数的数组当中，说白了按照上面的代码就是你在useEffect的回调当中用到了count，那么count就应该写在useEffect的第二个参数数组当中，比如name在useEffect的回调当中没有用到，那就不用在useEffect的第二个参数数组当中写name这个元素</font>

### 2. useLayoutEffect
```javascript
useLayoutEffect(()=>{
	console.log('layout effect invoked')
	return ()=> console.log('layout effect deteched')
},[count])
```
和`useEffect`类似的有一个`useLayoutEffect`，它的用法和`useEffect`是一样的，但是它永远是在`useEffect`之前执行的，这并不是他们之间的主要区别，区别在于：<font color=#DD1144>useLayoutEffect的执行是在真实DOM更新之前，而useEffect的执行是在真实DOM更新之后，所以不经常使用useLayoutEffect，尤其如果在useLayoutEffect加载的代码时间过程，就会到时页面渲染变慢，降低用户体验</font>

## Context-Hooks
首先我们创建`lib/my-context.js`
```javascript
// lib/my-context.js
import React from 'react'

export default React.createContext('') // 空字符串
```
接着我们到`pages/_app.js`当中去添加这个`Context`:
```javascript
// pages/_app.js
import MyContext from '../lib/my-context' // 1. 引入自己定义的Context

class MyApp extends App {
	render(){
		return (
			<Container>
				<Head>
					<title>Taopoppy</title>
				</Head>
				<Layout>
					<MyContext.Provider value="test"> {/* 2. 使用MyContext.Provider提供整个应用的context*/}
						<Component {...pageProps}/>
					</MyContext.Provider>
				</Layout>
			</Container>
		)
	}
}
```
这样书写之后，在整个应用所有的组件当中都可以使用到`MyContext.Provider`提供的这个`value`了，我们到`pages/b.js`当中去使用一下：
```javascript
// pages/b.js
import React,{ useContext } from 'react'  // 1. 引入useContext这个api
import MyContext from '../lib/my-context' // 2. 引入我们定义的context

function MyCountFunc() {
	const context = useContext(MyContext)   // 3. 获取我们定义的context

	return(
		<>
			<p>{context}</p>  {/*4. 直接使用这个context*/}
		</>
	)
}
```
这样之后我们就可以在网页上看到，我们在`pages/_app.js`当中使用`MyContext.Provider`提供的`value`值为`test`这四个字母了。不过我们要考虑一个问题，在上述代码的第三步当中：<font color=#DD1144>为什么不可以直接使用引入的Context，必须要用useContext方法来处理呢</font>？
+ <font color=#1E90FF>首先MyContext是一个React.createContext对象，React并没有提供相关的api来处理</font>
+ <font color=#1E90FF>只有通过useContext这个Hook去处理我们定义的MyContext，当MyContext.Provider提供的value值发生变化，才能让组件重新渲染，显示更新后的值</font>


## Ref-Hooks
当然，在函数式的组件当中也可以使用`ref`:
```javascript
// pages/b.js
import React,{ useRef } from 'react' // 1. 引入useRef


function MyCountFunc() {
	const inputRef = useRef() // 2. 创建useRef对象

	useEffect(()=>{
		console.log(inputRef)  // 4. 使用ref的DOM节点
		return ()=> console.log('effect deteched')
	},[count])

	return(
		<>
			<input ref={inputRef}></input> {/* 3. 通过ref指定DOM节点*/}
		</>
	)
}
```

## Hooks渲染优化
在过去的`React`的生命周期当中，我们知道有个跟重要的钩子是用来帮助我们做优化的，叫做`shouldComponentUpdate`，它可以帮助我们判断父组件的更新是否会影响子组件的更新，从来控制子组件是否需要重新渲染。在函数式组件当中，我们也有对应的优化，我们先来看一个例子：
```javascript
// pages/text/b.js
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

	const config = {
		text: `count is ${count}`,
		color: count > 3 ? 'red' : 'blue',
	}

	return(
		<div>
			<input value={name} onChange={e => setName(e.target.value)} />
			<Child
				config={config}
				onButtonClick={()=>dispatchCounter({type:'add'})}
			/>
		</div>
	)
}

function Child({onButtonClick, config}) {
	console.log('child render')
	return (
		<button onClick={onButtonClick} style={{color:config.color}}>
			{config.text}
		</button>
	)
}

export default TextB
```
可以看到，父组件的`count`这个`state`会影响子组件，但是`name`这个`state`不会影响子组件，但是呢，表现在网页端的时候，你会发现，无论触发父组件任何属性的更新都会导致子组件重新渲染，这就造成了性能的损耗，那么为什么会有这种情况发生，我们来说明一下：

<font color=#DD1144>因为当触发了TextB这个组件，或者这个函数当中的任何state发生变化，TextB这个函数就会重新执行，同时，config这个对象也会被重新声明，尽管它和之前的config值一模一样，但是存在于两个不同的新旧闭包当中，所以是两个不同的对象，所以子组件就会认为拿到的是一个新的值，从而触发子组件的重新渲染</font>

<font color=#1E90FF>所以我们优化就是当count没有变化的时候，我们希望config是原来的config，并且onButtonClick依旧是原来的匿名函数</font>

```javascript
// pages/text/b.js
import React, {
	useReducer,
	useState,
	memo,
	useMemo,
	useCallback,
} from 'react'  // 1. 引入memo、useMemo、useCallback

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

	// 3. 当count没有发生变化的时候，使用useMemo记录原来的config
	const config = useMemo(()=> ({
		text: `count is ${count}`,
		color: count > 3 ? 'red' : 'blue',
	}), [count])

	// 4. 当dispatchCounter不发生变化的时候，使用useCallback记录原来的匿名函数
	// 第一种写法
	const handleButtonClick = useCallback(
		()=>dispatchCounter({type:'add'}),
		[dispatchCounter]
	)

	// 第二种写法
	// const handleButtonClick = useMemo(
	// 	() => ()=>dispatchCounter({type:'add'}),
	// 	[dispatchCounter]
	// )

	return(
		<div>
			<input value={name} onChange={e => setName(e.target.value)} />
			<Child
				config={config}
				onButtonClick={handleButtonClick}
			/>
		</div>
	)
}

// 2. 使用memo方法包裹子组件
const Child = memo(function Child({onButtonClick, config}) {
	console.log('child render')
	return (
		<button onClick={onButtonClick} style={{color:config.color}}>
			{config.text}
		</button>
	)
})

export default TextB
```
经过上面几步的改造，当我们修改父组件的`name`属性的时候，没有修改`count`属性，其子组件使用的`config`和`onButtonClick`均是在父组件中通过`memo`相关的函数记录的旧对象和旧函数，所以子组件不会重新渲染。

## 闭包陷阱
我们在前面的代码当中新加入一些东西来说明：
```javascript
// pages/text/b.js
function TextB() {
	...
	const handleAlertButtonClick = function(){ // 2. 给新的button添加点击事件
		setTimeout(() => {
			alert(count)
		}, 2000);
	}

	return(
		<div>
			...
			<button onClick={handleAlertButtonClick}>alert count</button> {/* 1. 添加新的button*/}
		</div>
	)
}
```
我们在前面的代码的基础上添加上面的新代码，然后我们在网页端执行这样一系列操作：<font color=#1E90FF>点击Child组件中的按钮三次，此时count为3，然后点击alert count按钮之后立刻点击Child组件中的按钮两次，等到提示框出现的时候，我们发现显示的是3，而不是5</font>

上述这种情况就称作<font color=#9400D3>闭包陷阱</font>，<font color=#DD1144>首先函数内部实际上是一个闭包，每次更新组件，函数就重新执行一次，每次都是新的闭包，所以当你点击3次的时候，执行handleAlertButtonClick的时候使用的count就是count为3时候的那个函数闭包，所以显示的也就是3</font>

<img :src="$withBase('/react_ssr_bibao.png')" alt="闭包图">

你也许会疑问，如果在过去的写法当中，我们会书写`alert(this.state.count)`，这种为什么显示的就是5呢？<font color=#DD1144>因为在过去的React写法当中，闭包是this，从头到尾都在一个闭包当中，所以代码执行到alert(this.state.count)就会到当前this当中去找值，此时值早就更新了</font>，我们用一个图来解释：

<img :src="$withBase('/react_ssr_bibao1.png')" alt="闭包图2">

更合理的解释是官网在介绍组件的`state`的时候提到的：<font color=#DD1144>每只要在相同的DOM节点中渲染&lt;Clock /&gt; ，就仅有一个Clock组件的class实例被创建使用</font>，所以，<font color=#1E90FF>正是因为这个class的实例在相同的DOM节点中渲染存在唯一性，所以class中的this无论组件更新多少次，都指向唯一的class实例，所以this从头到尾是不变的。</font>

那么这种在函数编程的世界里，这种现象是正确的，但是与我们通常的业务是不符合的，我们尽量规避，或者经过上面两种写法的对比，我们就知道：<font color=#9400D3>如果想实时的用到最新的值，就应该在每次新的闭包当中将变化的对象赋值给同一个对象，和以前的this一样，从头到尾this对象本身不变，变的只是对象当中的属性而已</font>，按照这样的思路我们可以这样解决：

```javascript
const countRef = useRef() // 1. useRef()每次返回的都是同一个对象
countRef.current = count  // 2. 每次函数重新执行将count的值给countRef.current

const handleAlertButtonClick = function(){
	setTimeout(() => {
		alert(countRef.current) // 3. 显示的就是5
	}, 2000);
}
```

<img :src="$withBase('/react_ssr_bibao2.png')" alt="闭包图2">

