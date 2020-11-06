# 错误处理

## React中的错误处理
<img :src="$withBase('/react_guanwang_error.png')" alt="React错误处理指南">

### 1. ErrorBoundary
::: tip
<font color=#3eaf7c>因为使用了React.lazy和Suspense懒加载的组件，当渲染到这个组件的时候就会去发送http请求，请求webpack打包这个组件后的一个js文件，比如OtherComponent.chunk.js，此时如果JS文件加载失败（如网络问题），它会触发一个错误，那么这个组件就无法渲染。此时可以通过异常捕获边界（Error boundaries）技术来处理这些情况，以显示良好的用户体验并管理恢复事宜。</font>
:::

<font color=#1E90FF>错误边界是一种React组件，这种组件可以捕获并打印发生在其子组件树任何位置的JavaScript错误，并且，它会渲染出备用UI，而不是渲染那些崩溃了的子组件树。错误边界在渲染期间、生命周期方法和整个组件树的构造函数中捕获错误。</font>

::: warning
注意

错误边界无法捕获以下场景中产生的错误：

+ 事件处理（了解更多）
+ 异步代码（例如 setTimeout 或 requestAnimationFrame 回调函数）
+ 服务端渲染
+ 它自身抛出来的错误（并非它的子组件）
:::

如果一个`class`组件中：<font color=#9400D3>定义了static getDerivedStateFromError() 或 componentDidCatch() 这两个生命周期方法中的任意一个（或两个）时，那么它就变成一个错误边界</font>。当抛出错误后：
+ 请使用`static getDerivedStateFromError()`渲染备用`UI`
+ 使用`componentDidCatch()`打印错误信息。

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

然后你可以将它作为一个常规组件去使用：<font color=#1E90FF>错误边界的工作方式类似于JavaScript的 catch {}，不同的地方在于错误边界只针对React组件。只有 class 组件才可以成为错误边界组件</font>。大多数情况下, 你只需要声明一次错误边界组件, 并在整个应用中使用它。
```javascript
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```
::: tip
我个人认为关于`ErrorBoundary`的最佳实践是：
+ 类组件：根据备用UI的种类选择是否提取ErrorBoundary为单独的全局组件，如果备份UI的种类都一样，可以提取出来，如果不同的组件的备用UI不一样，最好的做法就是直接在不同的组件之内添加`componentDidCatch`或者`getDerivedStateFromError`，让组件本身变为错误边界

+ 函数组件：ErrorBoundary只能是类组件，无法直接在Hooks使用，但是我们可以曲线救国，一个组件无法变成错误边界，就用一个错误边界包裹，然后将备份UI组件通过属性的方式传递给错误边界，这样错误边界就变成了通用的模板，如下代码
:::

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.backupChildren  // 使用备份UI

    return this.props.children;
  }
}
```
```javascript
// 备份UI组件以属性的方式传递给错误边界ErrorBoundary
<ErrorBoundary backupChildren={<BackupMyWidget>}>
  <MyWidget />
</ErrorBoundary>
```

### 2. try-catch
`React`不需要错误边界来捕获事件处理器中的错误。与`render`方法和生命周期方法不同，事件处理器不会在渲染期间触发。因此，如果它们抛出异常，`React`仍然能够知道需要在屏幕上显示什么。

如果你需要在事件处理器内部捕获错误，使用普通的`JavaScript try / catch`语句：

```javascript
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    try {
      // 执行操作，如有错误则会抛出
    } catch (error) {
			// 在这里捕获操作
      this.setState({ error });
    }
  }

  render() {
    if (this.state.error) {
      return <h1>Caught an error.</h1>
    }
    return <button onClick={this.handleClick}>Click Me</button>
  }
}
```

### 3. 装饰器
装饰器是比较高级的部分，这里我们不仔细讲，本作者也没有看，如果你有兴趣，参考本章最后列举的参考资料。

不过这里要提醒的是：<font color=#DD1144>解决事件处理的异常我们一开始提出的是使用try-catch，但是有些人觉得大量的使用try-catch不好，所以衍生出了window.onerror，而window.onerror的问题是错误细节不好分析，所以有衍生出了装饰器</font>

::: tip
<font color=#9400D3>但是实际上在事件处理器内部会发生关于JS各种各样的问题，我们必须要搞清楚所有JS所有会发生的异常和错误类型，然后根据可能会发生的错误类型去使用不同的错误处理方法，而不是找出一个固化的最佳实践去一劳永逸，所以请仔细阅读下面的Javascript的错误处理</font>
:::

## Javascipt的错误处理



**参考资料**

+ [捕获 React 异常](https://juejin.im/post/6844904047313420295)
+ [React中如何优雅的捕捉事件错误](https://www.cnblogs.com/cloud-/p/9366234.html)
+ [如何优雅处理前端异常？](http://jartto.wang/2018/11/20/js-exception-handling/)
+ [嘿，不要给 async 函数写那么多 try/catch 了](https://mp.weixin.qq.com/s/-GIIs1VseDhojexI2HQ-tA)
+ [Javascript错误处理大全（重点）](https://mp.weixin.qq.com/s/K5nzTWSMgDPq0gO2SIa4Uw)
+ [你不知道的前端异常处理（万字长文，建议收藏）（重点）](https://mp.weixin.qq.com/s/wyfcSjGvgDU-iuPm8k7exQ)
+ [JavaScript错误处理完全指南（重点）](https://www.infoq.cn/article/glS9HjuSGhQMLL1zowwN)