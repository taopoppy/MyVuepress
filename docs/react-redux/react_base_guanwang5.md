# 动态分割

## 代码分割
### 1. 什么是代码分割
打包是个非常棒的技术，但随着你的应用增长，你的代码包也将随之增长。尤其是在整合了体积巨大的第三方库的情况下。你需要关注你代码包中所包含的代码，以避免因体积过大而导致加载时间过长。

<font color=#1E90FF>为了避免搞出大体积的代码包，在前期就思考该问题并对代码包进行分割是个不错的选择</font>。 代码分割是由诸如 `Webpack`，`Rollup`和`Browserify（factor-bundle）`这类打包器支持的一项技术，能够创建多个包并在运行时动态加载。

<font color=#1E90FF>对你的应用进行代码分割能够帮助你“懒加载”当前用户所需要的内容</font>，能够显著地提高你的应用性能。尽管并没有减少应用整体的代码体积，但你可以避免加载用户永远不需要的代码，并在初始加载的时候减少所需加载的代码量。

### 2. 代码分割的最佳方式
<font color=#9400D3>在你的应用中引入代码分割的最佳方式是通过动态import()语法。</font>

```javascript
import("./math").then(math => {
  console.log(math.add(16, 26));
});
```

当`Webpack`解析到该语法时，会自动进行代码分割。如果你使用`Create React App`，该功能已开箱即用，你可以立刻使用该特性。`Next.js`也已支持该特性而无需进行配置。

如果你没有使用脚手架，而是自己在配置，需要在`webpack`和`babel`两个方面都要做工作，请仔细查阅[官网](https://zh-hans.reactjs.org/docs/code-splitting.html#import)的提示。

### 3. React的分割写法
前面我们说代码分割的最佳方式是动态的`import`语法，但是如果在`React`当中直接使用这种写法大概会是这样：
```javascript
class App extends React.Component {
  render() {
    return (
      <>
      {
        import("./TodoList.js").then(TodoList=> {
          return <TodoList />
        })
      }
      </>
    )
  }
}
```

这种写法一看就不正常，所以出现了<font color=#9400D3>React.lazy</font>和<font color=#9400D3>Suspense</font>，<font color=#DD1144>函数能让你像渲染常规组件一样处理动态引入</font>

```javascript
import React, { Suspense } from 'react';

const OtherComponent = React.lazy(() => import('./OtherComponent'));
const AnotherComponent = React.lazy(() => import('./AnotherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <section>
          <OtherComponent />
          <AnotherComponent />
        </section>
      </Suspense>
    </div>
  );
}
```
+ `React.lazy`接受一个函数，这个函数需要动态调用`import()`。它必须返回一个`Promise`，该`Promise`需要`resolve`一个`default export`的`React`组件。
+ 然后应在`Suspense`组件中渲染`lazy`组件，如此使得我们可以使用在等待加载`lazy`组件时做优雅降级（如`loading`指示器等）。
+ `fallback`属性接受任何在组件加载过程中你想展示的`React`元素。你可以将`Suspense`组件置于懒加载组件之上的任何位置。你甚至可以用一个`Suspense`组件包裹多个懒加载组件。

### 4. 异常捕获边界
<font color=#1E90FF>异常捕获边界</font>也称<font color=#9400D3>错误边界</font>，<font color=#1E90FF>如果模块加载失败（如网络问题），它会触发一个错误。你可以通过异常捕获边界（Error boundaries）技术来处理这些情况，以显示良好的用户体验并管理恢复事宜。</font>

未完待续...

## 路由分割
决定在哪引入代码分割需要一些技巧。你需要确保选择的位置能够均匀地分割代码包而不会影响用户体验。

一个不错的选择是从路由开始。大多数网络用户习惯于页面之间能有个加载切换过程。你也可以选择重新渲染整个页面，这样您的用户就不必在渲染的同时再和页面上的其他元素进行交互。

这里是一个例子，展示如何在你的应用中使用`React.lazy`和`React Router`这类的第三方库，来配置基于路由的代码分割。
```javascript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
      </Switch>
    </Suspense>
  </Router>
);
```

## 命名导出
<font color=#DD1144>React.lazy目前只支持默认导出（default exports）</font>。如果你想被引入的模块使用命名导出`（named exports）`，你可以创建一个中间模块，来重新导出为默认模块。这能保证`tree shaking`不会出错，并且不必引入不需要的组件。

```javascript
// ManyComponents.js
export const MyComponent = /* ... */;
export const MyUnusedComponent = /* ... */;

// MyComponent.js
export { MyComponent as default } from "./ManyComponents.js";

// MyApp.js
import React, { lazy } from 'react';
const MyComponent = lazy(() => import("./MyComponent.js"));
```

<font color=#1E90FF>就组件来讲，我们一般很少会在一个文件当中导出多个组件，所以这个问题我们了解就好，重点的是中间模块的{ MyComponent as default } 这种写法我们要会</font>
