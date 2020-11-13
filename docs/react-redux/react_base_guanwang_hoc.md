# 高阶组件(HOC)

## HOC概述
### 1. 什么是高阶组件
<font color=#9400D3>高阶组件（HOC）是React中用于复用组件逻辑的一种高级技巧。HOC自身不是React API 的一部分，它是一种基于React的组合特性而形成的设计模式。</font>

::: tip
<font color=#3eaf7c>我们这里说的高阶组件和高阶函数是不一样的，React-Redux这个库当中的connect函数是高阶函数，但不是高阶组件，因为connect是一个可以返回高阶组件的高阶函数</font>
:::

### 2. 高阶组件的本质
具体而言：<font color=#1E90FF>高阶组件就是函数，参数是组件，返回值是新的组件</font>

```javascript
const NewComponent = higherOrderComponent(Component);
```

::: tip
<font color=#3eaf7c>组件和高阶组件本质都是函数，组件以props作为参数，返回值为JSX，是一个props转换UI的过程。而高阶组件是一个将组件转换为另一个组件的过程，并且高阶组件是个纯函数，没有副作用</font>
:::


### 3. 高阶组件解决的问题
按照官网的说法：<font color=#1E90FF>我们需要一个抽象，允许我们在一个地方定义这个逻辑，并在许多组件之间共享它。这正是高阶组件擅长的地方。</font>，但是，通俗的来讲，就是解决<font color=#DD1144>组件之间共享状态逻辑的问题</font>

## 创建HOC
我们根据[官网](https://zh-hans.reactjs.org/docs/higher-order-components.html#use-hocs-for-crossing-cutting-concerns)的例子进行拓展一下：

```javascript
// BlogPost.js
import React from "react";
import DataSource from "./data";

class BlogPost extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      blogPost: DataSource.getBlogPost(props.id)
    };
  }

  componentDidMount() {
    DataSource.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    DataSource.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState({
      blogPost: DataSource.getBlogPost(this.props.id)
    });
  }

  render() {
    const { id, content, time, authorName } = this.state.blogPost;
    return (
      <>
        <div id={id}>
          <p>
            authorName: {authorName} Time: {time}
          </p>
          <p>Content: {content}</p>
        </div>
      </>
    );
  }
}

export default BlogPost;
```
```javascript
// CommentList.js
import React from "react";
import DataSource from "./data";

class CommentList extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      // 假设 "DataSource" 是个全局范围内的数据源变量
      comments: DataSource.getComments()
    };
  }

  componentDidMount() {
    // 订阅更改
    DataSource.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    // 清除订阅
    DataSource.removeChangeListener(this.handleChange);
  }

  handleChange() {
    // 当数据源更新时，更新组件状态
    this.setState({
      comments: DataSource.getComments()
    });
  }

  render() {
    return (
      <div>
        {this.state.comments.map((comment) => (
          <p style={{ border: "1px solid red" }} key={comment.id}>
            {comment.content}
          </p>
        ))}
      </div>
    );
  }
}

export default CommentList;
```
```javascript
// App.js
import React from "react";
import BlogPost from "./BlogPost";
import CommentList from "./CommentList";

function App() {
  return (
    <>
      <BlogPost id={1} />
      <CommentList />
    </>
  );
}

export default App;
```
`CommentList`和`BlogPost`不同 - 它们在`DataSource`上调用不同的方法，且渲染不同的结果。但它们的大部分实现都是一样的：
+ 在挂载时，向`DataSource`添加一个更改侦听器。
+ 在侦听器内部，当数据源发生变化时，调用`setState`。
+ 在卸载时，删除侦听

然后我们来进行书写高阶组件`withSubscription`:
```javascript
// withSubscription.js
import React from "react";
import DataSource from "./data";

function withSubscription(WrappedComponent, selectData) {
  // ...并返回另一个组件...
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.state = {
        data: selectData(DataSource, props)
      };
    }

    componentDidMount() {
      // ...负责订阅相关的操作...
      DataSource.addChangeListener(this.handleChange);
    }

    componentWillUnmount() {
      DataSource.removeChangeListener(this.handleChange);
    }

    handleChange() {
      this.setState({
        data: selectData(DataSource, this.props)
      });
    }

    render() {
      // ... 并使用新数据渲染被包装的组件!
      // 请注意，我们可能还会传递其他属性
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };
}
export default withSubscription;
```
我们将组件当中的相同的逻辑写在高阶组件当中，然后根据传入的不同获取数据的方法`selectData`获取到数据，将数据以`props`的方式传递给子组件。那么在`CommentList`和`BlogPost`当中写法就会变得更加简洁：
```javascript
// BlogPost.js
import React from "react";
import withSubscription from "./withSubscription";

class BlogPost extends React.Component {
  render() {
    const { id, content, time, authorName } = this.props.data;
    return (
      <>
        <div id={id}>
          <p>
            authorName: {authorName} Time: {time}
          </p>
          <p>Content: {content}</p>
        </div>
      </>
    );
  }
}

// withSubscription高阶组件
export default withSubscription(BlogPost, (DataSource, props) =>
  DataSource.getBlogPost(props.id)
);
```
```javascript
// CommentList.js
import React from "react";
import withSubscription from "./withSubscription";

class CommentList extends React.Component {
  render() {
    return (
      <div>
        {this.props.data.map((comment) => (
          <p style={{ border: "1px solid red" }} key={comment.id}>
            {comment.content}
          </p>
        ))}
      </div>
    );
  }
}
// withSubscription高阶组件
export default withSubscription(CommentList, (DataSource) =>
  DataSource.getComments()
);
```
请注意，`HOC`不会修改传入的组件，也不会使用继承来复制其行为。相反，`HOC`通过将组件包装在容器组件中来组成新组件。<font color=#1E90FF>HOC 是纯函数，没有副作用</font>。

被包装组件接收来自容器组件的所有`prop`，同时也接收一个新的用于`render`的`data prop`。`HOC`不需要关心数据的使用方式或原因，而被包装组件也不需要关心数据是怎么来的。

因为`withSubscription`是一个普通函数，你可以根据需要对参数进行增添或者删除。例如，您可能希望使`data prop`的名称可配置，以进一步将`HOC`与包装组件隔离开来。或者你可以接受一个配置`shouldComponentUpdate`的参数，或者一个配置数据源的参数。因为`HOC`可以控制组件的定义方式，这一切都变得有可能。

与组件一样，`withSubscription`和包装组件之间的契约完全基于之间传递的`props`。这种依赖方式使得替换`HOC`变得容易，只要它们为包装的组件提供相同的`prop`即可。例如你需要改用其他库来获取数据的时候，这一点就很有用。

## 注意事项
官网给出了很多注意事项，但是这些注意事项好像不是太重要，个人觉得除了<font color=#9400D3>复制静态方法</font>和<font color=#9400D3>Refs不会传递</font>之外的只需要通读一遍即可：

### 1. 务必复制静态方法
将`HOC`应用于组件时，原始组件将使用容器组件进行包装。这意味着新组件没有原始组件的任何静态方法。<font color=#1E90FF>可以使用 hoist-non-react-statics 自动拷贝所有非React静态方法，而不是手动的一个个添加</font>

```javascript
import hoistNonReactStatic from 'hoist-non-react-statics';
// 高阶组件
function enhance(WrappedComponent) {
	class Enhance extends React.Component {/*...*/}
	// 拷贝子组件的所有静态方法
  hoistNonReactStatic(Enhance, WrappedComponent);
  return Enhance;
}
```

### 2. Refs不会被传递
虽然高阶组件的约定是将所有`props`传递给被包装组件，但这对于`refs`并不适用。那是因为`ref`实际上并不是一个`prop` - 就像`key`一样，<font color=#1E90FF>它是由React专门处理的</font>。如果将`ref`添加到`HOC`的返回组件中，则`ref`引用指向容器组件(HOC)，而不是被包装组件。

这个问题我们在前面的[在高阶组件中转发refs](https://www.taopoppy.cn/react-redux/react_base_guanwang_refs.html#_3-%E5%9C%A8%E9%AB%98%E9%98%B6%E7%BB%84%E4%BB%B6%E4%B8%AD%E8%BD%AC%E5%8F%91refs)当中已经说明的非常详细了，请移步阅读。

### 3. 其他

+ [不要改变原始组件。使用组合](https://zh-hans.reactjs.org/docs/higher-order-components.html#dont-mutate-the-original-component-use-composition)
+ [约定：将不相关的 props 传递给被包裹的组件](https://zh-hans.reactjs.org/docs/higher-order-components.html#convention-pass-unrelated-props-through-to-wrapped-component)
+ [约定：最大化可组合性](https://zh-hans.reactjs.org/docs/higher-order-components.html#convention-maximizing-composability)
+ [约定：包装显示名称以便轻松调试](https://zh-hans.reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging)
+ [不要在 render 方法中使用 HOC](https://zh-hans.reactjs.org/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method)