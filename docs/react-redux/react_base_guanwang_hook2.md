# 使用State Hook

## 声明State
```javascript
import React, { useState } from "react";
import "./style.css";

function MyFunction() {
	// 声明一个叫count的state变量
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>you click {count} times</p>
      <button onClick={() => setCount(preCount => preCount + 1)}>click</button>
    </div>
  );
}

export default MyFunction;
```

<font color=#3eaf7c>我们声明了一个叫count的state变量，然后把它设为0。React会在重复渲染时记住它当前的值，并且提供最新的值给我们的函数。我们可以通过调用setCount来更新当前的count。</font>


<font color=#1E90FF>**① 调用useState方法的时候做了什么**</font>

它定义一个<font color=#9400D3>State变量</font>。我们的变量叫`count`， 但是我们可以叫他任何名字，比如`banana`。这是一种在函数调用时保存变量的方式 —— `useState`是一种新方法，它与`class`里面的`this.state`提供的功能完全相同。<font color=#DD1144>一般来说，在函数退出后变量就会”消失”，而state中的变量会被React保留。</font>

<font color=#1E90FF>**② useState需要哪些参数**</font>

<font color=#DD1144>useState()方法里面唯一的参数就是初始 state</font>。不同于`class`的是，我们可以按照需要使用数字或字符串对其进行赋值，而不一定是对象。在示例中，只需使用数字来记录用户点击次数，所以我们传了0作为变量的初始`state`。（如果我们想要在`state`中存储两个不同的变量，只需调用`useState()`两次即可。）

<font color=#1E90FF>**③ useState 方法的返回值是什么？**</font>

返回值为：<font color=#DD1144>当前state以及更新state的函数</font>。这就是我们写`const [count, setCount] = useState()`的原因。这与`class`里面 `this.state.count`和`this.setState`类似，唯一区别就是你需要成对的获取它们。

你可能想知道：为什么叫 useState 而不叫 createState?，<font color=#9400D3>“Create” 可能不是很准确，因为 state 只在组件首次渲染的时候被创建。在下一次重新渲染时，useState 返回给我们当前的 state。</font>否则它就不是 “state”了！这也是 Hook 的名字总是以 use 开头的一个原因。

## 读取State
当我们想在`class`中显示当前的`count`，我们读取`this.state.count`：
```javascript
<p>You clicked {this.state.count} times</p>
```

在函数中，我们可以直接用`count`:
```javascript
<p>You clicked {count} times</p>
```

## 更新State
在`class`中，我们需要调用`this.setState()`来更新`count`值：
```javascript
<button onClick={() => this.setState({ count: this.state.count + 1 })}>
	Click me
</button>
```

在函数中，我们已经有了`setCount`和`count`变量，所以我们不需要`this`:
```javascript
<button onClick={() => setCount(preCount => preCount + 1)}>
	Click me
</button>
```

最后我们说一些之前我们在`React`服务端提到的一些`useState`的相关知识：

`setCount`这个修改状态的函数有两种用法
+ `setCount(1)`: <font color=#1E90FF>直接将最终的count值传入setCount即可，这种用法一般是count修改的值和之前count的值之间没有直接的关系</font>
+ `setCount((c) => c + 1)`: <font color=#1E90FF>传入一个函数，函数的参数是count之前的值，函数返回的值作为count更新后的值，这种用法一般是基于旧的值来修改成新的值，新旧值之间有计算关系</font>

<font color=#DD1144>切记是不能通过setCount(count + 1)这种方式，这种写法会造成闭包陷阱，也就是count的值永远都是外层函数调用的一瞬间调用的值，如果在定时器或者计时器当中使用修改状态的函数，那么这个状态值永远都是定值。</font>