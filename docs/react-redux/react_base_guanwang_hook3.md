# 使用Effect Hook

## 初识Effect Hook
```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```
之前我们说：<font color=#1E90FF>Effect Hook是帮助我们在函数组件中实现和类组件生命周期效果的一系列函数</font>，但是这种理解只能断章取义的理解一部分的`Effect Hook`，真正全面理解`Effect Hook`只有一句话：<font color=#DD1144>Effect Hook是能给函数组件增加操作副作用能力的函数</font>

而副作用的概念就比较广了，<font color=#DD1144>因为react的本质是数据渲染视图，而数据获取，设置订阅和手动修改DOM等等都和数据渲染视图没有直接联系，所以称之为副作用</font>

官网给我们一个更好理解的概念就是：<font color=#DD1144>如果你熟悉React class的生命周期函数，你可以把useEffect Hook看做componentDidMount，componentWillUnmount、componentDidUpdate、ComponentWillUpdate和这四个函数之间不同的组合</font>

在`React`组件中有两种常见副作用操作：需要清除的和不需要清除的。我们来更仔细地看一下他们之间的区别。

## 无需清除的Effect
什么是无需清除的`Effect`: <font color=#9400D3>我们只想在 React 更新 DOM 之后运行一些额外的代码。比如发送网络请求，手动变更 DOM，记录日志，这些都是常见的无需清除的操作。因为我们在执行完这些操作之后，就可以忽略他们了。</font>

然后官网提供了一个例子，我在这里拓展了一下
```javascript
import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  componentDidMount() {
    console.log("componentDidMount");
    document.title = `You clicked ${this.state.count} times`;
  }
  componentDidUpdate() {
    console.log("componentDidUpdate");
    document.title = `You clicked ${this.state.count} times`;
  }

  render() {
    console.log("render");
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}

export default App;
```
通过这个例子，我们首先看出两个问题：
+ 生命周期的执行顺序：`render` -> `componentDidMount` -> `render` -> `componentDidUpdate`
+ 实现修改`document.title`的功能，我们需要在两个不同的生命周期当中书写代码

尤其是问题二的本质是：<font color=#1E90FF>我们只是想在组件每次渲染完毕，根据count的最新值去更新document.title</font>，使用类组件就要考虑组件第一次渲染和以后每次渲染两种不同的情况，我们来看看函数组件怎实现
```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

	// 下面这种写法和上面效果一样
	// useEffect(() => {
  //   document.title = `You clicked ${count} times`;
  // },[count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

<font color=#1E90FF>**① useEffect做了什么**</font>

通过使用这个`Hook`，<font color=#DD1144>你可以告诉React组件需要在渲染后执行某些操作</font>。`React`会保存你传递的函数（我们将它称之为 “effect”），<font color=#DD1144>并且在执行DOM更新之后调用effect函数</font>。在这个`effect`中，我们设置了`document`的`title`属性，不过我们也可以执行数据获取或调用其他命令式的`API`。


<font color=#1E90FF>**② 为什么在组件内部调用useEffect**</font>

<font color=#DD1144>将useEffect放在组件内部让我们可以在effect中直接访问count state变量（或其他 props）</font>。我们不需要特殊的`API`来读取它 —— 它已经保存在函数作用域中。<font color=#DD1144>Hook使用了JavaScript的闭包机制</font>，而不用在`JavaScript`已经提供了解决方案的情况下，还引入特定的`React API`。


<font color=#1E90FF>**③ useEffect 会在每次渲染后都执行吗**</font>

是的，默认情况下，它在第一次渲染之后和每次更新之后都会执行。你可能会更容易接受`effect`发生在“渲染之后”这种概念，不用再去考虑“挂载”还是“更新”。<font color=#DD1144>React保证了每次运行effect的同时，DOM都已经更新完毕。</font>

<font color=#1E90FF>但是如果你在彻底学会useEffect的用法之后，你就会知道useEffect并非都会在每次渲染之后执行，能否执行取决于useEffect的第二个参数</font>


现在我们回头看看我们之前在类组件中遇到的两个问题有没有解决
+ <font color=#DD1144>复杂的生命周期</font>：函数组件没有生命周期，使用hook我们不需要组件第一次挂载和后续更新的不同场景
+ <font color=#DD1144>功能代码的碎片化</font>：函数组件中使用hook避免了在类组件中实现相关功能要在不同的地方书写逻辑，<font color=#1E90FF>而在类组件当中，使用生命周期函数迫使我们拆分这些逻辑代码，即使这两部分代码都作用于相同的副作用。</font>

## 需要清除的Effect
什么是需要清除的`effect`：<font color=#9400D3>一些副作用是需要清除的。例如订阅外部数据源。这种情况下，清除工作是非常重要的，可以防止引起内存泄露！</font>

官网给出了一个和在在类组件中`componentDidMount`和`componentWillUnmount`效果相同的代码：
```javascript
import React, { useState, useEffect } from 'react';

function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    // 清除操作：执行上一个effect中的cleanup
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```

<font color=#1E90FF>**① 为什么要在effect中返回一个函数**</font>

这是`effect`可选的清除机制。每个`effect`都可以返回一个<font color=#9400D3>清除函数</font>。如此可以将添加和移除订阅的逻辑放在一起。它们都属于`effect`的一部分。

<font color=#1E90FF>**② React 何时清除 effect？**</font>

<font color=#1E90FF>React会在组件卸载的时候执行清除操作。正如之前学到的，effect在每次渲染的时候都会执行。这就是为什么<font color=#9400D3>React会在执行当前effect之前对上一个effect进行清除，对上一个effect进行清除的做法就是执行上一个effect的返回函数</font></font>


## Effect Hook重点
### 1. 多个Effect实现关注点分离
使用`Hook`其中一个目的就是要解决`class`中生命周期函数经常包含不相关的逻辑，但又把相关逻辑分离到了几个不同方法中的问题。

`Hook`允许我们按照代码的用途分离他们， 而不是像生命周期函数那样。

### 2. 每次更新的时候都要运行Effect


并不需要特定的代码来处理更新逻辑，因为`useEffect`默认就会处理。它会在调用一个新的`effect`之前对前一个`effect`进行清理。此默认行为保证了一致性，避免了在`class`组件中因为没有处理更新逻辑而导致常见的`bug`。

### 3. 跳过Effect进行性能优化

如果我们在每次更新的时候都去执行`effect`都会导致一些没有发生变化的状态相关的代码也也重复执行，就好比父组件重新渲染，而子组件并没有变化，但是也必须要随着父组件重新渲染一样，有着严重的性能问题。

这个时候:<font color=#DD1144>我们就可以使用useEffect的第二个参数来告诉什么时候可以跳过effect的调用</font>，我们来举个简单的例子：
```javascript
import React, { useState, useEffect } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("taopoppy");

  useEffect(() => {
    console.log("exec effect count", count);
    return () => {
      console.log("clear effect count", count);
    };
  });

  useEffect(() => {
    console.log("exec effect name", name);
    return () => {
      console.log("clear effect name", name);
    };
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(preCount => preCount + 1)}>
        Click me
      </button>
      <p>You clicked {name} times</p>
      <button onClick={() => setName(preName => preName + "1")}>
        Click me
      </button>
    </div>
  );
}

export default App;
```
针对上面的这个例子，我们来说三种不同的情况，正儿八经的说清楚，第二个参数到底有啥用：

<font color=#1E90FF>**① 无第二参数**</font>

```javascript
useEffect(() => {
	console.log("exec effect count", count);
	return () => {
		console.log("clear effect count", count);
	};
});

useEffect(() => {
	console.log("exec effect name", name);
	return () => {
		console.log("clear effect name", name);
	};
});

// 第一次挂载
// exec effect count 0
// exec effect name taopoppy

// 点击第一个按钮
// clear effect count 0
// clear effect name taopoppy
// exec effect count 1
// exec effect name taopoppy

// 点击第二个按钮
// clear effect count 1
// clear effect name taopoppy
// exec effect count 1
// exec effect name taopoppy1

// 组件卸载时
// clear effect count 1
// clear effect name taopoppy1
```
<font color=#9400D3>这样的写法就是每次渲染完都要去执行effect</font>，所以这样是毫无性能优化的作用，有很大的性能上的损失。效果等价于`componentDidMount` + `ComponentWillUpdate` + `componentDidUpdate` + `componentWillUnmount`


<font color=#1E90FF>**② 第二参数为空数组**</font>

```javascript
useEffect(() => {
	console.log("exec effect count", count);
	return () => {
		console.log("clear effect count", count);
	};
},[]);

useEffect(() => {
	console.log("exec effect name", name);
	return () => {
		console.log("clear effect name", name);
	};
},[]);

// 第一次挂载
// exec effect count 0
// exec effect name taopoppy

// 点击第一个按钮
// 不执行effect

// 点击第二个按钮
// 不执行effect

// 组件卸载时
// clear effect count 1
// clear effect name taopoppy1
```
<font color=#9400D3>这种写法就是effect的执行不依赖任何状态和组件变化，其effect的执行只发生在组件挂载的时候，effect的清除只发生在组件卸载的时候</font>，这种写法有着特殊的使用场景，和普遍的性能优化无关，其效果等价于：`componentDidMount` + `componentWillUnmount`

<font color=#1E90FF>**③ 有明确的第二参数**</font>

```javascript
useEffect(() => {
	console.log("exec effect count", count);
	return () => {
		console.log("clear effect count", count);
	};
},[count]);

useEffect(() => {
	console.log("exec effect name", name);
	return () => {
		console.log("clear effect name", name);
	};
},[name]);

// 第一次挂载
// exec effect count 0
// exec effect name taopoppy

// 点击第一个按钮
// clear effect count 0
// exec effect count 1

// 点击第二个按钮
// clear effect name taopoppy
// exec effect name taopoppy1


// 组件卸载时
// clear effect count 1
// clear effect name taopoppy1
```
<font color=#9400D3>这种写法就是effect的执行取决于传入第二个参数数组中的元素是否发生了变化，而且传入第二个参数数组中的元素不仅可以是组件的State，还可以是props</font>，所以这种写法是有性能优化的，等价于我们在类组件中父组件在`componentDidUpdate`生命周期里对`prevState`和`this.state`做对比，以及在子组件中`shouldComponentUpdate`中对`nextProps`和`this.props`做对比

```javascript
// 父组件
componentDidUpdate(prevProps, prevState) {
  if (prevState.count !== this.state.count) {
    document.title = `You clicked ${this.state.count} times`;
  }
}

// 子组件
shouldComponentUpdate(nextProps,nextState){
	if(nextState.Number == this.state.Number){
		return false
	}
}
```

<font color=#DD1144>希望你在学完之后，回过头思考一下，在学习Hook动机的时候，复杂组件为什么变得难以理解</font>

