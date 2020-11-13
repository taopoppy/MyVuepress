# Render Props

## 什么是RenderProps
<font color=#9400D3>术语 “render prop” 是指一种在React组件之间使用一个值为函数的prop共享代码的简单技术</font>

```javascript
<DataProvider render={data => (
  <h1>Hello {data.target}</h1>
)}/>
```

## 实现RenderProps
现在有一个组件可以跟踪`Web`应用程序中的鼠标位置：
```javascript
class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
        <h1>移动鼠标!</h1>
        <p>当前的鼠标位置是 ({this.state.x}, {this.state.y})</p>
      </div>
    );
  }
}
```
现在的问题是：我们如何在另一个组件中复用这个行为？换个说法，若另一个组件需要知道鼠标位置，我们能否封装这一行为，以便轻松地与其他组件共享它？？

### 1. HOC先行
我们首先就想到了`HOC`：
```javascript
import React from "react";
class Cat extends React.Component {
  render() {
    const mouse = this.props.mouse;
    return (
      <img
        src="https://gitclone.com/img/title.ico"
        style={{ position: "absolute", left: mouse.x, top: mouse.y }}
        alt="图片"
      />
    );
  }
}

// 高阶组件withMouse
function withMouse(Component) {
  class Mouse extends React.Component {
    constructor(props) {
      super(props);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.state = { x: 0, y: 0 };
    }

    handleMouseMove(event) {
      this.setState({
        x: event.clientX,
        y: event.clientY
      });
    }

    render() {
      return (
        <div style={{ height: "100vh" }} onMouseMove={this.handleMouseMove}>
          <Component {...this.props} mouse={this.state} />
        </div>
      );
    }
  }

  return Mouse;
}

class App extends React.Component {
  render() {
		const WithCat = withMouse(Cat); // Cat组件可以通过props拿到高阶组件的跟踪鼠标的状态

    return (
      <div>
        <h1>移动鼠标!</h1>
        <WithCat />
      </div>
    );
  }
}

export default App;
```

### 2. Render Props降临
我们现在可以为`Mouse`提供一个函数`prop`来动态的确定要渲染什么 —— 一个`render prop`。
```javascript
import React from "react";
class Cat extends React.Component {
  render() {
    const mouse = this.props.mouse;
    return (
      <img
        src="https://gitclone.com/img/title.ico"
        style={{ position: "absolute", left: mouse.x, top: mouse.y }}
        alt="图片"
      />
    );
  }
}
// render props
class Mouse extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: "100vh" }} onMouseMove={this.handleMouseMove}>
        {/*使用 `render`prop 动态决定要渲染的内容，而不是给出一个 <Mouse> 渲染结果的静态表示*/}
        {this.props.render(this.state)}
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>移动鼠标!</h1>
        <Mouse render={(mouse) => <Cat mouse={mouse} />} />
      </div>
    );
  }
}

export default App;
```
现在，我们提供了一个`render`方法 让`Mouse`能够动态决定什么需要渲染，而不是克隆`Mouse`组件然后硬编码来解决特定的用例。

这项技术使我们共享行为非常容易。要获得这个行为，只要渲染一个带有`render prop`的 `Mouse`组件就能够告诉它当前鼠标坐标 (x, y) 要渲染什么。

::: tip
<font color=#3eaf7c>render prop是一个用于告知组件需要渲染什么内容的函数prop。</font>
:::

### 3. 两者结合
虽然`HOC`和`Render Props`都能实现同样的功能，但是在不同的场景可能不同的写法会更容易理解一下，甚至我们可以使用<font color=#1E90FF>RenderProps本质+HOC皮囊</font>的写法，这种是官网提供的一种混合写法：
```javascript
// 如果你出于某种原因真的想要 HOC，那么你可以轻松实现
// 使用具有 render prop 的普通组件创建一个！
function withMouse(Component) {
  return class extends React.Component {
    render() {
      return (
        <Mouse render={mouse => (
          <Component {...this.props} mouse={mouse} />
        )}/>
      );
    }
  }
}
```

这种写法我只能理解为：<font color=#1E90FF>如果一个组件有多个共享逻辑状态要嵌入，HOC多层调用写法比RenderProps的多层调用写法更简单，否则我是不会这样写的</font>

## 注意事项
### 1. 使用Props而非render
<font color=#DD1144>重要的是要记住，render prop 是因为模式才被称为 render prop ，你不一定要用名为 render 的 prop 来使用这种模式。事实上， 任何被用于告知组件需要渲染什么内容的函数 prop 在技术上都可以被称为 “render prop”.重要的是要记住，render prop 是因为模式才被称为 render prop ，你不一定要用名为 render 的 prop 来使用这种模式。事实上，任何被用于告知组件需要渲染什么内容的函数 prop 在技术上都可以被称为 “render prop”.</font>

所以甚至我们上面的`Render Props`使用`render props`来传递函数完全可以换成使用`children props`，这样函数的位置可以不用写在闭合标签当中，可以写在标签外面，这是`props.children`独有的特征。
```javascript
class Mouse extends React.Component {
  ...
  render() {
    return (
      <div style={{ height: "100vh" }} onMouseMove={this.handleMouseMove}>
        {this.props.children(this.state)} {/* 2. 写法和this.props.render一样*/}
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>移动鼠标!</h1>
				<Mouse>
					{(mouse) => <Cat mouse={mouse} />} {/* 1. 整个函数写在Mouse标签外部*/}
				</Mouse>
      </div>
    );
  }
}
```
由于这一技术的特殊性，当你在设计一个类似的`API`时，你或许会要直接地在你的`propTypes`里声明`children`的类型应为一个函数。
```javascript
Mouse.propTypes = {
  children: PropTypes.func.isRequired
};
```
<font color=#DD1144>关于上述children的写法了解就好，只是为了让你明白render props的本质，这种children的写法还是不要出现在正规的项目当中</font>

### 2. React.PureComponent作用抵消
<font color=#9400D3>如果你在render方法里创建函数，那么使用render prop会抵消使用 React.PureComponent 带来的优势。因为在render方法里创建函数，这是一种内敛函数的写法，之前我们在Context陷阱中就说过，内敛函数的写法会造成在每次渲染的时候都会被认为是新的值，所以PureComponent当中的浅比较props的时候总会得到false，所以PureComponent的作用就消失了</font>

```javascript
class MouseTracker extends React.Component {
  render() {
    return (
      <div>
        <h1>Move the mouse around!</h1>
        {/*这是不好的！每个渲染的 `render` prop的值将会是不同的。*/}
        <Mouse render={mouse => (
          <Cat mouse={mouse} />
        )}/>
      </div>
    );
  }
}
```

为了绕过这一问题，有时你可以定义一个`prop`作为实例方法，类似这样：
```javascript
class MouseTracker extends React.Component {
  // 定义为实例方法，`this.renderTheCat`始终
  // 当我们在渲染中使用它时，它指的是相同的函数
  renderTheCat(mouse) {
    return <Cat mouse={mouse} />;
  }

  render() {
    return (
      <div>
        <h1>Move the mouse around!</h1>
        <Mouse render={this.renderTheCat} />
      </div>
    );
  }
}
```
这种情况在函数组件当中使用`useCallBack`优化会显的更容易理解
