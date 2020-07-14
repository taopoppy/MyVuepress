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
`useEffect`我们在之前已经简单的说过，`useEffect`的回调函数的作用有点类似于`componentDidMount`，其回调函数返回的函数的作用有点类似于`componentWillUpdate`，<font color=#DD1144>但是实际上useEffect的精髓在于它的第二个参数</font>，我们来看下面的代码：

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

## Ref-Hooks

## Hooks渲染优化

## 闭包陷阱