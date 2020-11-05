# Hooks概述

## 动机

### 1. 在组件之间复用状态逻辑很难
我们首先来看看官网怎么说的：

`React 没有提供将可复用性行为“附加”到组件的途径（例如，把组件连接到 store）。如果你使用过 React 一段时间，你也许会熟悉一些解决此类问题的方案，比如 render props 和 高阶组件。但是这类方案需要重新组织你的组件结构，这可能会很麻烦，使你的代码难以理解。如果你在 React DevTools 中观察过 React 应用，你会发现由 providers，consumers，高阶组件，render props 等其他抽象层组成的组件会形成“嵌套地狱”。尽管我们可以在 DevTools 过滤掉它们，但这说明了一个更深层次的问题：React 需要为共享状态逻辑提供更好的原生途径。你可以使用 Hook 从组件中提取状态逻辑，使得这些逻辑可以单独测试并复用。Hook 使你在无需修改组件结构的情况下复用状态逻辑。 这使得在组件间或社区内共享 Hook 变得更便捷。`

<font color=#1E90FF>这段话虽然有点难懂，可以回想一下，我们之前使用react-redux的时候是通过在总的App组件上强制添加Provider属性的，这个是让所有组件复用redux当中的状态的一种方法。但是涉及到嵌套地狱最典型的还是HOC高阶组件，为了给某个组件强制添加它需要的属性，需要使用HOC方式将组件放在高阶组件当中，然后通过添加属性的方式让组件可以拥有某个状态，但是这种方式可以回想一下，使用react-redux的时候是这样，使用自定义HOC也是这样，所以最终我们看到一个组件的时候，实际它表现出来的状态可能不仅仅是组件本身代码中体现出来的状态，还有各种高阶组件添加到其中的状态，这样继续添加继续嵌套，<font color=#9400D3>组件本身的状态结构就发生了变化，而且通过HOC进入组件的状态之间的关系不清楚，复用状态逻辑在各个不同的组件之间就很难做</font></font>

总结：<font color=#DD1144>无论是render props还是高阶组件都相当于在组件之上增加了无渲染效果的组件层次，在层次体验和性能方面都有问题</font>

### 2. 复杂组件变得难以理解
我们首先来看看官网怎么说的：

`我们经常维护一些组件，组件起初很简单，但是逐渐会被状态逻辑和副作用充斥。每个生命周期常常包含一些不相关的逻辑。例如，组件常常在 componentDidMount 和 componentDidUpdate 中获取数据。但是，同一个 componentDidMount 中可能也包含很多其它的逻辑，如设置事件监听，而之后需在 componentWillUnmount 中清除。相互关联且需要对照修改的代码被进行了拆分，而完全不相关的代码却在同一个方法中组合在一起。如此很容易产生 bug，并且导致逻辑不一致。在多数情况下，不可能将组件拆分为更小的粒度，因为状态逻辑无处不在。这也给测试带来了一定挑战。同时，这也是很多人将 React 与状态管理库结合使用的原因之一。但是，这往往会引入了很多抽象概念，需要你在不同的文件之间来回切换，使得复用变得更加困难。为了解决这个问题，Hook 将组件中相互关联的部分拆分成更小的函数（比如设置订阅或请求数据），而并非强制按照生命周期划分。你还可以使用 reducer 来管理组件的内部状态，使其更加可预测。`

<font color=#1E90FF>简单的说，如果一个组件里面有10个功能，每个功能相关的代码都要书写在不同的生命周期当中，这就使得代码阅读性变差，你阅读其中某个功能，可能要读完所有生命周期函数，以及其中和这个功能无关的代码</font>

<font color=#1E90FF>这里有个特别重要的概念，叫做<font color=#9400D3>代码解耦</font>，最初接触的这个概念的就应该是我们ReactUI层和状态层的解耦问题，两者通过Redux实现逻辑的解耦，通过React-Redux实现代码的解耦，所以Hook也可能是为了做同一组件中不同功能之间代码解耦而生的</font>

当我阅读完`Effect Hook`之后，才明白为什么复杂组件会变的难以理解，难以理解的地方有两点
+ <font color=#9400D3>某一功能相关的代码会分散到不同的生命周期当中，造成关注点的分离</font>
+ <font color=#9400D3>组件的性能优化需要做很多判断和使用额外的生命周期函数</font>

而`Hook`的写法能让这些和<font color=#1E90FF>生命周期</font>和<font color=#1E90FF>状态</font>相关的复杂的问题统统简化。

### 3. 难以理解的Class
我们首先来看看官网是怎么说的：

`除了代码复用和代码管理会遇到困难外，我们还发现 class 是学习 React 的一大屏障。你必须去理解 JavaScript 中 this 的工作方式，这与其他语言存在巨大差异。还不能忘记绑定事件处理器。没有稳定的语法提案，这些代码非常冗余。大家可以很好地理解 props，state 和自顶向下的数据流，但对 class 却一筹莫展。即便在有经验的 React 开发者之间，对于函数组件与 class 组件的差异也存在分歧，甚至还要区分两种组件的使用场景。另外，React 已经发布五年了，我们希望它能在下一个五年也与时俱进。就像 Svelte，Angular，Glimmer等其它的库展示的那样，组件预编译会带来巨大的潜力。尤其是在它不局限于模板的时候。最近，我们一直在使用 Prepack 来试验 component folding，也取得了初步成效。但是我们发现使用 class 组件会无意中鼓励开发者使用一些让优化措施无效的方案。class 也给目前的工具带来了一些问题。例如，class 不能很好的压缩，并且会使热重载出现不稳定的情况。因此，我们想提供一个使代码更易于优化的 API。为了解决这些问题，Hook 使你在非 class 的情况下可以使用更多的 React 特性。 从概念上讲，React 组件一直更像是函数。而 Hook 则拥抱了函数，同时也没有牺牲 React 的精神原则。Hook 提供了问题的解决方案，无需学习复杂的函数式或响应式编程技术。`

<font color=#1E90FF>这段话的意思就是Class本身不作为Javascript一种适合的开发方式会给开发者带来很多问题，而React组件本质就是函数，所以class的方式显得有点另类</font>

<font color=#DD1144>但实质上还是this的问题，因为this会引发不同的函数写法导致不同的效果，比如内敛函数过渡创建新的句柄，类成员函数不能保证this等等。带给开发者的就是踩坑问题和使用门槛</font>

## Hook的概念
官网是这样介绍`Hook`的：

`Hook 是一些可以让你在函数组件里“钩入” React state 及生命周期等特性的函数。Hook 不能在 class 组件中使用 —— 这使得你不使用 class 也能使用 React。`

我的理解是：<font color=#DD1144>Hook是一类特殊函数的统称，这些函数可以帮助你在函数组件当中实现和类组件当中一样的功能</font>

而原本类组件当中，可以实现多种多样的功能，定义状态，修改DOM等等，为了在函数组件当中也能实现这些多种多样的功能，就必须存在多种多样的函数来帮助开发者实现，所以这些多种多样的函数统一叫做<font color=#9400D3>Hook函数</font>，其中各个函数根据其能实现的不同的功能又分类成不同的`Hook`函数，比如`useState`、`useEffect`等。

因为`Hook`有不同的类型，我们下面就逐个简答的说一说：

### 1. State Hook
官网是这样描述的：

`通过在函数组件里调用它来给组件添加一些内部 state。React 会在重复渲染时保留这个 state。useState 会返回一对值：当前状态和一个让你更新它的函数，你可以在事件处理函数中或其他一些地方调用这个函数。它类似 class 组件的 this.setState，但是它不会把新的 state 和旧的 state 进行合并。`

简单总结一句话：<font color=#DD1144>State Hook是能帮助我们在函数组件当中定义和修改状态的一系列函数</font>


### 2. Effect Hook
官网是这样描述的：

`你之前可能已经在 React 组件中执行过数据获取、订阅或者手动修改过 DOM。我们统一把这些操作称为“副作用”，或者简称为“作用”。useEffect 就是一个 Effect Hook，给函数组件增加了操作副作用的能力。它跟 class 组件中的 componentDidMount、componentDidUpdate 和 componentWillUnmount 具有相同的用途，只不过被合并成了一个 API。`

简单的总结一句话：<font color=#DD1144>Effect Hook是能帮助我们在函数组件当中实现生命周期效果的一系列函数</font>

### 3. customize Hook
官网是这样描述<font color=#9400D3>自定义Hook</font>的：

`有时候我们会想要在组件之间重用一些状态逻辑。目前为止，有两种主流方案来解决这个问题：高阶组件和 render props。自定义 Hook 可以让你在不增加组件的情况下达到同样的目的。`

简单总结一句话：<font color=#DD1144>自定义Hook能帮助我们在函数组件当中实现现有Hook实现不了的功能（听起来像废话）</font>


## Hook使用规则
官网是这样介绍规则的，有两条规则和一个插件推荐，我们就记住就可以了：
+ <font color=#DD1144>只能在函数最外层调用 Hook。不要在循环、条件判断或者子函数中调用</font>
+ <font color=#DD1144>只能在React的函数或者自定义Hook中调用Hook。不要在其他普通JavaScript函数中调用。</font>

为此需要说明的就是：<font color=#9400D3>React靠的是Hook调用的顺序来知道state与useState之间的对应关系，所以我们需要保证每次渲染的Hook的调用次数和调用顺序和我们代码书写的一致，所以如果我们在条件语句或者判断循环语句中使用Hook，那么每次hook的调用次数和顺序必然不一样</font>

<font color=#1E90FF>所以我们应该尽量的将这些判断循环语句写在hook里，而不是把hook写在判断循环语句中</font>，如下：

```javascript
// 🔴 在条件语句中使用 Hook 违反第一条规则
if (name !== '') {
	useEffect(function persistForm() {
		localStorage.setItem('formData', name);
	});
}

useEffect(function persistForm() {
	// 👍 将条件判断放置在 effect 中
	if (name !== '') {
		localStorage.setItem('formData', name);
	}
});
```

推荐的一个插件就是[linter 插件](https://www.npmjs.com/package/eslint-plugin-react-hooks),使用起来十分简单：

首先我们要下载插件：
```javascript
# npm
npm install eslint-plugin-react-hooks --save-dev

# yarn
yarn add eslint-plugin-react-hooks --dev
```

然后我们在`package.json`当中配置即可：
```javascript
"eslintConfig"{
  "plugins": [
    // ...
    "react-hooks"
  ],
  "rules": {
    // ...
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## TodoList
我们这里给出一个`TodoList`的`demo`，使用`react hooks`编写的，希望你在学习完毕后能回头来仔细看看这个例子，可以直接运行这个例子，如果你会根据`react DevTools`观察渲染过程，可以通过操作这个例子看看组件的更新和渲染流程，以及渲染性能的优化，如果你不会，最简单的就是根据打印台中的信息观察组件的渲染流程。
```javascript
import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import "./styles.css";

let idSeq = Date.now();

function App() {
  console.log("App");
  const [todos, setTodos] = useState([]);

  // 添加列表项
  const addTodo = useCallback((todo) => {
    setTodos((todos) => [todo, ...todos]);
  }, []);
  // 删除列表项
  const removeTodo = useCallback((id) => {
    setTodos((todos) =>
      todos.filter((todo) => {
        return todo.id !== id;
      })
    );
  }, []);

  // 修改列表项状态
  const toggleTodo = useCallback((id) => {
    setTodos((todos) =>
      todos.map((todo) => {
        return todo.id === id ? { ...todo, complete: !todo.complete } : todo;
      })
    );
  }, []);

  // 从localStorage中读取信息
  useEffect(() => {
    const todosStr = localStorage.getItem("_$_todos_") || "[]";
    setTodos(JSON.parse(todosStr));
  }, []);

  // todo发生改变的时候去写入localStorage
  useEffect(() => {
    localStorage.setItem("_$_todos_", JSON.stringify(todos));
  }, [todos]);

  return (
    <div className="todo-list">
      <Control addTodo={addTodo} />
      <Todos removeTodo={removeTodo} toggleTodo={toggleTodo} todos={todos} />
    </div>
  );
}

const Control = memo(function Control(props) {
  console.log("Control");
  const { addTodo } = props;
  const inputRef = useRef();

  // 没有向任何子组件传递，不需要使用useCallback
  const onSubmit = (e) => {
    e.preventDefault();
    const newText = inputRef.current.value.trim();

    if (newText.length === 0) {
      return;
    }
    addTodo({
      id: ++idSeq,
      text: newText,
      complete: false
    });

    inputRef.current.value = "";
  };

  return (
    <div className="control">
      <h1>todos</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          ref={inputRef}
          className="new-todo"
          placeholder="what needs to be done"
        />
      </form>
    </div>
  );
});

const TodoItem = memo(function TodoItem(props) {
  console.log("TodoItem");
  const {
    todo: { id, text, complete },
    toggleTodo,
    removeTodo
  } = props;

  const onChange = () => {
    toggleTodo(id);
  };

  const onRemove = () => {
    removeTodo(id);
  };

  return (
    <li className="todo-item">
      <input type="checkbox" onChange={onChange} checked={complete} />
      <label className={complete ? "complete" : ""}>{text}</label>
      <button onClick={onRemove}>&#xd7;</button>
    </li>
  );
});

const Todos = memo(function Todos(props) {
  console.log("Todos");
  const { todos, toggleTodo, removeTodo } = props;

  return (
    <ul>
      {todos.map((todo) => {
        return (
          <TodoItem
            key={todo.id}
            todo={todo}
            toggleTodo={toggleTodo}
            removeTodo={removeTodo}
          />
        );
      })}
    </ul>
  );
});

export default App;

```
