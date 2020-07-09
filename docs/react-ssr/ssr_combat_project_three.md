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
	const [count, setCount] = useState(0)  // 1. 定义初始状态、修改状态的方法
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

## Effect-Hooks

## Context-Hooks

## Ref-Hooks

## Hooks渲染优化

## 闭包陷阱