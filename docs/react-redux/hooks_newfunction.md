# React新特性概述

在此之前，我们要具备一些`React`的基础知识，然后我们再来看看`React`的新特性，<font color=#1E90FF>Context 这个API给人一种全局对象的感觉，ContextType实际上是Context的补充，或者说是语法糖；Lazy允许我们懒加载指定的组件，一般独自使用或者和Supense配合使用，mome用来优化渲染性能</font>

## Context
我们首先来说：<font color=#1E90FF>Context实现跨层级的组件数据传递</font>

`Context`的定义是：<font color=#DD1144>Context提供了一种方式，能够让数据在组件树中传递而不必一级一级手动传递</font>

`Context`怎么工作的？<font color=#1E90FF>首先我们需要一个Context实例对象，这个对象可以派生出两个React组件，一个是Provider，并且携带一个变量值。另一个是Consumer，用来接收前者提供的变量值。对于同一个Context对象，Consumer一定是Provider后面的元素</font>

`Context`相关`API`:
<font color=#1E90FF>createContext(defaultValut?)</font>：用于创建`Context`对象

```javascript
import React from "react";

// 1. 创建一个Context对象
const ThemeContext = React.createContext(90);
// 1. 创建一个Context对象
const OnlineContext = React.createContext();

class App extends React.Component {
  state = {
    value: 60,
    online: false
  };
  render() {
    return (
      <ThemeContext.Provider value={this.state.value}>
        <OnlineContext.Provider value={this.state.online}>
          {/*2. 使用provider*/}
          <Toolbar />
          <button
            onClick={() => this.setState({ value: this.state.value - 1 })}
          >
            click
          </button>
          <button onClick={() => this.setState({ online: !this.state.online })}>
            click
          </button>
        </OnlineContext.Provider>
      </ThemeContext.Provider>
    );
  }
}

// 3. 中间的组件再也不必指明往下传递 theme 了。
function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class ThemedButton extends React.Component {
  render() {
    return (
      <button>
        <ThemeContext.Consumer>
          {/*4. 使用consumer */}
          {(value) => (
            <OnlineContext.Consumer>
              {(online) => (
                <p>
                  Value：{value}, Online: {String(online)}
                </p>
              )}
            </OnlineContext.Consumer>
          )}
        </ThemeContext.Consumer>
      </button>
    );
  }
}

export default App;
```
上述就是`Context`的最基本的用法:
+ <font color=#DD1144>Context不仅仅能实现跨层级实现属性值的传递，还能在属性变化的时候重新渲染consumer下面的元素</font>
+ <font color=#DD1144>Context还能使用多个，多个互相嵌套，写法略微麻烦一点</font>

## ContextType
现在来说：<font color=#1E90FF>静态属性ContextType访问跨层级组件的数据</font>

前面我们学习了`Context`可以自动在跨层级组件之间传递数据，<font color=#1E90FF>但是Context会让组件变的不纯粹，因为要依赖全局变量，所以不应该被大规模的使用</font>

而且由于`Consumer`的写法必须是包含一个函数，这样的写法非常不工整，我们希望在书写`jsx`之前就可以获取到`Consumer`应该拿到的值，这个时候<font color=#9400D3>ContextType</font>就派上用场了

```javascript
class ThemedButton extends React.Component {
  static contextType = ThemeContext;
  render() {
    const theme = this.context;
    return (
      <button>
        <p>Value：{theme}</p>
      </button>
    );
  }
}
```
<font color=#1E90FF>可以在只有一个Context的情况下，使用ContextType要比使用Context.Consumer要方便的多</font>

## Lazy与Suspense
下面来说：<font color=#1E90FF>Lazy和Suspense实现延迟加载</font>

无论是`MPA`还是`SPA`，对于同一个页面堆砌的很多功能，实际在用户使用的时候并不会都激活，这就导致很多没有被激活的功能相关的代码也会被下载到用户的浏览器当中，这有很大的优化空间。

<font color=#9400D3>延迟加载</font>最广泛的用法就是我们在浏览一些网站，尤其是电商或者论坛的网站，有一些图片是只有在滑动到图片的位置才会去加载，否则就是一个占位而已。

<font color=#9400D3>webpack</font>提供了`Code Splitting`这样一种代码拆分的能力，把一个页面所有`js`模块人为的划分。

<font color=#9400D3>import</font>这个关键字是我们经常用的，而`import from`这种是我们每天都在用的<font color=#DD1144>静态模块导入方法</font>，`imporr`还有另外的功能，就是	<font color=#DD1144>动态的导入功能，返回一个Promise</font>，所以<font color=#DD1144>使用import做的动态导入，webpack就会做一次代码拆分，把import要导入的模块及其依赖打成一个独立的js文件，默认情况下页面是不会主动加载的，只有在用到的时候才会加载</font>

<font color=#1E90FF>对于React怎么才算用到？当然就是渲染的时候，React提供Lazy函数，用来将指定模块的导入行为封装成React组件，一旦封装后的组件渲染，即意味着要去加载被封装的组件，<font color=#9400D3>注意封装的是模块的导入行为，而不是模块本身</font>，导入本身意味着网络请求</font>

```javascript
import React, { lazy, Suspense } from "react";

// 1. 使用Lazy组件封装About模块的导入
const About = lazy(() => import(/*webpackChunkName: "about"*/"./About.js"));

class App extends React.Component {
  render() {
    return (
      <ErrorBoundary>
         {/* 2. 使用Suspense来设置异步请求About模块的空档期要显示的内容（fallback属性）*/}
        <Suspense fallback={<div>loading...</div>}>
          <About></About>
        </Suspense>
      </ErrorBoundary>
    );
  }
}
export default App;
```
`Lazy`和`Suspense`只不过是<font color=#9400D3>React代码分割</font>这个话题中的一部分，关于代码分割，在[React官网](https://reactjs.bootcss.com/docs/code-splitting.html)有详细的说明。

其次`ErrorBoundary`是根据错误边界定义的一个组件，<font color=#9400D3>错误边界</font>也可以在[React官网](https://reactjs.bootcss.com/docs/error-boundaries.html)查看，<font color=#1E90FF>错误边界可以捕获并打印发生在其子组件树任何位置的JavaScript错误，并且，它会渲染出备用UI。多数情况下, 你只需要声明一次错误边界组件, 并在整个应用中使用它。</font>

## Memo
最后来说：<font color=#1E90FF>Memo实现指定组件进行渲染</font>

使用`Lazy`和`Suspense`能解决页面首次加载的性能问题，接下来我们要使用`Memo`来解决`React`在运行时的效率问题。

我们之前知道，优化子组件避免重复渲染有这么几个方法：<font color=#9400D3>shouldComponentUpdate</font>和<font color=#9400D3>PurComponent</font>

```javascript
class Foo extends React.Component {
	// 1. 通过添加shouldComponents生命周期的方法避免无改变的重复渲染
	shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.name === this.props.name) {
      return false;
    }
  }
  render() {
    console.log("Foo render");
    return null;
  }
}


import React, { PureComponent } from "react";
class Foo extends PureComponent { // 2. 通过继承PureComponent来实现shouldComponentUpdate中的对比效果
  render() {
    console.log("Foo render");
    return null;
  }
}
```
但是呢，对于`PurComponent`是有局限性的，<font color=#1E90FF>PureComponent只对比props当中所有属性本身的变化或者说属性第一层级的变化，如果属性本身是对象，对象内部的属性值的变化是无效果的。另外对于属性为函数的情况也不统一，对于内敛函数和bind函数，PurComponent统一认为是新的函数，对于箭头函数的类成员函数都无判断效果</font>

总之呢，<font color=#DD1144>PureComponent是只提供的简单的对比方法，适用场景比较狭隘，而且只能用在类组件</font>

为什么会有`mome`呢？<font color=#9400D3>一个组件如果的显示只取决于外部的props，那么就可以改写成为函数式的组件，而函数式组件无法使用shouldComponentUpdate和PureComponent，所以出现了memo，memo和PureComponent类似，默认也使用的浅层对比的方式</font>

```javascript
import React, { memo } from "react";
const Foo = memo(function Foo(props) {
	return <div>{props.persion.age}</div>
})
```

当然了，`memo`也可以通过自定义对比函数来进行复杂的对比：
```javascript
function MyComponent(props) {
  /* 使用 props 渲染 */
}

function areEqual(prevProps, nextProps) {
  /*
  如果把nextProps传入render方法的返回结果与
  将prevProps传入render方法的返回结果一致则返回 true，
  否则返回 false
  */
}

export default React.memo(MyComponent, areEqual);
```

总结：
+ 类组件的浅层对比：`PurComponent`、`shouldComponentUpdate`
+ 类组件的深层对比：`shouldComponentUpdate`
+ 函数组件浅层对比：`memo(component)`
+ 函数组件深层对比：`memo(component,areEqual)`

## Memo拓展数据流
`memo`本身是和优化有关的，我们来说说从过去到现在优化的方式和顺序

+ <font color=#1E90FF>PureComponent</font>：类组件的浅层对比
+ <font color=#1E90FF>ShouldComponentUpdate(SCU)</font>：类组件的深层、浅层对比，深层对比不太好写，容易发生极端情况，消耗性能
+ <font color=#1E90FF>memo</font>：函数组件当中的浅对比
+ <font color=#1E90FF>immutable.js数据结构+PurComponent/memo </font>：较好的方式
+ <font color=#1E90FF>immer.js</font>：更简单的方式