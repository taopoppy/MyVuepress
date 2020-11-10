# Context

## 什么是Context
<font color=#9400D3>Context提供了一个无需为每层组件手动添加props，就能在组件树间进行数据传递的方法。</font>

## 何时使用Context
<font color=#DD1144>Context 设计目的是为了共享那些对于一个组件树而言是“全局”的数据，例如当前认证的用户、主题或首选语言</font>

<font color=#1E90FF>Context 主要应用场景在于很多不同层级的组件需要访问同样一些的数据。请谨慎使用，因为这会使得组件的复用性变差。所以我们当考虑使用Context，与之一起要考虑的就是component composition，也就是组件组合，这个在[官网](https://zh-hans.reactjs.org/docs/composition-vs-inheritance.html)有详细的说明</font>

那既然要将`Context`和`Composition`放在一起考虑，我们就要仔细分析两者的优缺点；
+ <font color=#9400D3>Context</font>
	+ <font color=#3eaf7c>优点</font>：提供了一种在组件之间共享此类值的方式，而不必显式地通过组件树的逐层传递`props`。
	+ <font color=#DD1144>缺点</font>：组件之间的属性传递会会变得复杂和冗余，复用性变差。
```javascript
const ThemeContext = React.createContext('light');
class App extends React.Component {
  render() {
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}
function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class ThemedButton extends React.Component {
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;
  }
}
```

+ <font color=#9400D3>Composition</font>
	+ <font color=#3eaf7c>优点</font>：减少了在你的应用中要传递的`props`数量，这在很多场景下会使得你的代码更加干净，使你对根组件有更多的把控
	+ <font color=#DD1144>缺点</font>：这种将逻辑提升到组件树的更高层次来处理，会使得这些高层组件变得更复杂，并且会强行将低层组件适应这样的形式
```javascript
function Page(props) {
  const user = props.user;
  const content = <Feed user={user} />;
  const topBar = (
    <NavigationBar>
      <Link href={user.permalink}>
        <Avatar user={user} size={props.avatarSize} />
      </Link>
    </NavigationBar>
  );
  return (
    <PageLayout
      topBar={topBar}
      content={content}
    />
  );
}
```

## API讲解
### 1. React.createContext
```javascript
const MyContext = React.createContext(defaultValue);
```
创建一个`Context`对象。当`React`渲染一个订阅了这个`Context`对象的组件，这个组件会从组件树中离自身最近的那个匹配的`Provider`中读取到当前的`context`值。

只有当组件所处的树中没有匹配到`Provider`时，其`defaultValue`参数才会生效。这有助于在不使用`Provider`包装组件的情况下对组件进行测试。注意：将`undefined`传递给`Provider`的`value`时，消费组件的`defaultValue`不会生效。

### 2.Context.Provider
```javascript
<MyContext.Provider value={/* 某个值 */}>
```
每个`Context`对象都会返回一个`Provider React`组件，它允许消费组件订阅`context`的变化。

`Provider`接收一个`value`属性，传递给消费组件。一个`Provider`可以和多个消费组件有对应关系。多个`Provider`也可以嵌套使用，里层的会覆盖外层的数据。

<font color=#DD1144>当Provider的value值发生变化时，它内部的所有消费组件都会重新渲染。Provider及其内部consumer组件都不受制于shouldComponentUpdate函数，因此当 consumer组件在其祖先组件退出更新的情况下也能更新。</font>

通过新旧值检测来确定变化，使用了与`Object.is`相同的算法。<font color=#DD1144>所以value如果给予一个对象值，通过修改对象当中的某个属性值来让consumer组件更新是不靠谱的，因为Object.is()方法是浅对比，应该让对象完全变成另外一个对象才可以。这个问题我们会在[Context陷阱](taopoppy.cn/react-redux/react_base_guanwang_context.html#Context陷阱)中仔细说明</font>，关于这个问题，[官网](https://zh-hans.reactjs.org/docs/context.html#dynamic-context)给出了一个动态`Context`的改变主题的例子，可以参照一下。


### 3. Class.contextType
```javascript
// 写法1
class MyClass extends React.Component {
  componentDidMount() {
    let value = this.context;
    /* 在组件挂载完成后，使用 MyContext 组件的值来执行一些有副作用的操作 */
  }
  componentDidUpdate() {
    let value = this.context; /* 任何生命周期当中使用 */
  }
  componentWillUnmount() {
    let value = this.context; /* 任何生命周期当中使用 */
  }
  render() {
    let value = this.context; /* 基于 MyContext 组件的值进行渲染 */
  }
}
MyClass.contextType = MyContext; /* 给类组件挂载contextType属性*/

// 写法2
class MyClass extends React.Component {
  static contextType = MyContext; /* static 这个类属性来初始化你的 contextType*/
  render() {
    let value = this.context; /* 基于这个值进行渲染工作 */
  }
}
```

挂载在`class`上的`contextType`属性会被重赋值为一个由`React.createContext()`创建的`Context`对象。这能让你使用`this.context`来消费最近`Context`上的那个值。你可以在任何生命周期中访问到它，包括`render`函数中。

### 4. Context.Consumer
```javascript
<MyContext.Consumer>
  {value => /* 基于 context 值进行渲染*/}
</MyContext.Consumer>
```
一个`React`组件可以订阅`context`的变更，这让你在函数式组件中可以订阅`context`。

这种方法需要一个函数作为子元素（function as a child）。这个函数接收当前的`context`值，并返回一个`React`节点。传递给函数的`value`值等价于组件树上方离这个`context`最近的`Provider`提供的`value`值。如果没有对应的`Provider`，`value`参数等同于传递给 `createContext()`的`defaultValue`。

::: warning
注意
想要了解更多关于 “函数作为子元素（function as a child）” 模式，详见[render props](https://zh-hans.reactjs.org/docs/render-props.html)。
:::

### 5. Context.displayName
<font color=#1E90FF>context对象接受一个名为displayName的property，类型为字符串。React DevTools使用该字符串来确定context要显示的内容</font>。

示例，下述组件在`DevTools`中将显示为`MyDisplayName`：
```javascript
const MyContext = React.createContext(/* some value */);
MyContext.displayName = 'MyDisplayName';

<MyContext.Provider> // "MyDisplayName.Provider" 在 DevTools 中
<MyContext.Consumer> // "MyDisplayName.Consumer" 在 DevTools 中
```

## 使用多个Context
使用多个`Context`，我们先来总结一下：
+ <font color=#1E90FF>类组件使用单个Context</font>；`Context.Provider + Context.Consumer`; `Context.Provider + Class.contextType`
+ <font color=#1E90FF>类组件使用多个Context</font>：`Context.Provider + Context.Consumer`
+ <font color=#1E90FF>函数组件使用单个或者多个Context</font>：`Context.Provider + useContext`

我们下面来看个例子：
```javascript
const ThemeContext = React.createContext(90);
const OnlineContext = React.createContext();

// 1. 类组件当中使用多个Context的写法
class ThemedButton extends React.Component {
  render() {
    return (
      <button>
        <ThemeContext.Consumer>
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

// 2. 函数组件当中使用多个Context的写法
function ThemedButton(props) {
  const value = useContext(ThemeContext);
  const online = useContext(OnlineContext);
  return (
    <button>
      <p>
        Value：{value}, Online: {String(online)}
      </p>
    </button>
  );
}
```
通过上面的比对，我们也可以发现，`React Hooks`的写法要更加简单容易理解，这也是为什么我们特别推荐使用它的原因，但是使用`React Hook`的前提是你必须深刻了解类组件当中的知识。

## Context陷阱
<font color=#9400D3>我们之前说，Context的Provider和Consumer之间有强制性</font>

+ <font color=#1E90FF>类组件</font>：`当Provider的value值发生变化时，它内部的所有消费组件都会重新渲染。Provider及其内部consumer组件都不受制于shouldComponentUpdate函数，因此当consumer组件在其祖先组件退出更新的情况下也能更新`

+ <font color=#1E90FF>函数组件</font>：`当组件上层最近的MyContext.Provider更新时，该Hook会触发重渲染，并使用最新传递给MyContext provider的context value值。即使祖先使用React.memo或 shouldComponentUpdate，也会在组件本身使用useContext时重新渲染。`

<font color=#1E90FF>由于这种强制性的问题存在，如果你在给Provider的value传递不适当的值，就可能会造成consumer的子组件或者useContext返回值每次重新更新或者渲染</font>，我们来举个例子：

```javascript
// 第一种情况：临时对象
class App extends React.Component {
  render() {
    return (
      <MyContext.Provider value={{something: 'something'}}>
        <Toolbar />
        <MyContext.Consumer>
          {value => <p>{value.something}</p>}
        </MyContext.Consumer>
      </MyContext.Provider>
    );
  }
}

// 第二种情况：内联函数
function App(props){
	return (
		<MyContext.Provider value={() => console.log("yes")}>
			<Toolbar />
      <MyContext.Consumer>
          {value => <p>{value.something}</p>}
      </MyContext.Consumer>
		</MyContext.Provider>
	);
}
```

<font color=#DD1144>无论是类组件或者函数组件，组件在每次更新的时候，会重新执行render函数（类组件）或者重新生成闭包（函数组件），所以类似于上述的临时对象和内联函数的写法，在组件每次更新的时候，这个Provider.value值就是新生成的东西，所以组件每次更新就会强制性的去更新包括Provider在内的子组件和consumer的子组件或者useContext的返回值（表现在上述代码中的就是Toobar和MyContext.Consumer都要重新渲染），造成性能损耗，我们正确的做法就是让Provider.value变成一个不可变值，不可变值的意思就是我们如果不通过this.setState（类组件）或者setState（函数组件）这些方法去刻意改变它的时候，在组件变化更新过程中，都是唯一的值。所以我们为了防止这种情况，应该将value状态提升到父节点的state里</font>

```javascript
// 类组件
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: {something: 'something'}, // 提升到父节点的state当中
    };
  }

  render() {
    return (
      <Provider value={this.state.value}>
        <Toolbar />
      </Provider>
    );
  }
}

// 函数组件
function App(props){
	const [value, setValue] = useState({something: 'something'}) // 提升到父节点的state当中
	return (
		<MyContext.Provider value={value}>
			<Toolbar />
		</MyContext.Provider>
	);
}
```

## Context优化
### 1. children和memo
我们之前说`Provider`当中`value`值在变化的时候会强制性的更新包括`Provider`在内的子组件，我们现在来举个特别典型的例子：
```javascript
import React, { useContext, useState } from "react";

const ThemeContext = React.createContext();

export function ChildNonTheme() {
  console.log("不关心皮肤的子组件渲染了");
  return <div>我不关心皮肤，皮肤改变的时候别让我重新渲染！</div>;
}

export function ChildWithTheme() {
  const theme = useContext(ThemeContext);
  return <div>我是有皮肤的哦~ {theme}</div>;
}

export default function App() {
  const [theme, setTheme] = useState("light");
  const onChangeTheme = () => setTheme(theme === "light" ? "dark" : "light");
  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={onChangeTheme}>改变皮肤</button>
      <ChildWithTheme />
      <ChildNonTheme />
      <ChildNonTheme />
    </ThemeContext.Provider>
  );
}
```
`ChildWithTheme`是需要根据主题变化的子组件，`ChildNonTheme`是和主题变化无关的子组件，但是你会发现，但我们的点击切换主题皮肤的按钮后`ChildNonTheme`也会随之重新渲染，这个就是没有必要的渲染，我们的解决方法有：<font color=#9400D3>children</font>和<font color=#9400D3>memo</font>

<font color=#1E90FF>**① children**</font>

```javascript
function ThemeApp({ children }) {
  const [theme, setTheme] = useState("light");
  const onChangeTheme = () => setTheme(theme === "light" ? "dark" : "light");
  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={onChangeTheme}>改变皮肤</button>
      {children}
    </ThemeContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeApp>
      <ChildWithTheme />
      <ChildNonTheme />
      <ChildNonTheme />
    </ThemeApp>
  );
}
```
为什么这种方式可以防止`ChildNonTheme`重新渲染，我们要想了解本质，就要先去知道为什么没有使用`children`的时候会渲染`ChildNonTheme`:

<font color=#DD1144>本质上是由于React是自上而下递归更新，<ChildNonTheme /> 这样的代码会被babel翻译成React.createElement(ChildNonTheme) 这样的函数调用，React官方经常强调props是immutable的，所以在每次调用函数式组件的时候，都会生成一份新的 props 引用</font>。来看下`createElement`的返回结构：
```javascript
const childNonThemeElement = {
  type: 'ChildNonTheme',
  props: {} // <- 这个引用更新了
}
```
正是由于这个新的`props`引用，导致`ChildNonTheme`这个组件也重新渲染了。

而使用了`children`之后，<font color=#DD1144>ThemeApp内部的更新完全不会触发外部的 React.createElement，所以会直接复用之前的element结果，本质就是ChildNonTheme和ThemeContext.Provider由包含关系变成了平行关系</font>

<font color=#1E90FF>**② memo**</font>

首先，一说到`memo`就有人开始反对，不是之前在`Context`陷阱那一章说的是：`当组件上层最近的MyContext.Provider更新时，该Hook会触发重渲染，并使用最新传递给MyContext provider的context value值。即使祖先使用React.memo或 shouldComponentUpdate，也会在组件本身使用useContext时重新渲染`。那为什么这里又说`memo`可以用来优化呢？

我想说的是：<font color=#9400D3>这里使用memo优化的对象和上面强制性渲染的对象，不是相同的，使用memo可以优化的部分是Provider的子组件，但并非Consumer或者使用useContext的子组件。强制性渲染的是Provider子组件中Consumer或者使用useContext的子组件</font>

<img :src="$withBase('/react_redux_guanwang_context_provider.png')" alt="">

::: tip
<font color=#9400D3>我们针对Provider的所有子组件，分为Consumer(或useContext)和其他子组件，针对Consumer子组件我们只要避免陷入Context陷阱正常渲染即可，而其他子组件我们要使用children和memo保证他们不要做无必要或者多余的渲染</font>
:::

所以我们来看怎么对其他子组件进行`memo`优化
```javascript
import React, { useContext, useState, memo } from "react";
const ThemeContext = React.createContext();
// memo包裹
export const ChildNonTheme = memo(function ChildNonTheme() {
  console.log("不关心皮肤的子组件渲染了");
  return <div>我不关心皮肤，皮肤改变的时候别让我重新渲染！</div>;
});
// memo包裹
export const ChildWithTheme = memo(function ChildWithTheme() {
  const theme = useContext(ThemeContext);
  return <div>我是有皮肤的哦~ {theme}</div>;
});

export default function App() {
  const [theme, setTheme] = useState("light");
  const onChangeTheme = () => setTheme(theme === "light" ? "dark" : "light");
  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={onChangeTheme}>改变皮肤</button>
      <ChildWithTheme />
      <ChildNonTheme />
      <ChildNonTheme />
    </ThemeContext.Provider>
  );
}
```
所以`memo`看起来其实更方便一点。

### 2. 用法优化
用法优化有很多，我们通常会用到的就是：<font color=#9400D3>对象分离</font>、<font color=#9400D3>自定义封装</font>、<font color=#9400D3>回调地狱封装</font>

<font color=#1E90FF>对象分离说的就是当Provider的value是对象的时候，其中对象的不同属性被引用到不同的组件当中时，最好拆分为不同的Context，否则某个属性被引用的组件的更新会影响其他属性被引用的组件的更新</font>

```javascript
import React, { useContext, useState } from "react";
import "./styles.css";

const LogContext = React.createContext();

function LogProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const addLog = (log) => setLogs((prevLogs) => [...prevLogs, log]);
  return (
    <LogContext.Provider value={{ logs, addLog }}>
      {children}
    </LogContext.Provider>
  );
}

function Logger1() {
  const { addLog } = useContext(LogContext);
  console.log('Logger1 render')
  return (
    <><p>一个能发日志的组件1</p><button onClick={() => addLog("logger1")}>发日志</button>
    </>
  );
}

function LogsPanel() {
  const { logs } = useContext(LogContext);
  return logs.map((log, index) => <p key={index}>{log}</p>);
}

export default function App() {
  return (
    <LogProvider>
      {/* 写日志 */}
      <Logger1 />
      {/* 读日志 */}
      <LogsPanel />
    </LogProvider>
  );
}
```

可以看到: `LogContext`的`value`是个对象，两个属性`logs`和`addLog`分别被引入到了`Logger1`和`LogsPanel`组件当中，任意一个属性的变化都会让`Logger1`和`LogsPanel`组件都重新渲染，我们希望的是：`logs`属性变化只会让`LogsPanel`组件更新，<font color=#1E90FF>所以我们最好是将对象的属性拆分到不同的Context中去，同时利用Context优化方式和React Hooks优化方式避免互相影响</font>

```javascript
import React, { useContext, useState, useCallback } from "react";
import "./styles.css";

const LogDispatchContext = React.createContext();
const logShowContext = React.createContext();

function LogProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const addLog = useCallback(
    // useCallback优化
    (log) => setLogs((prevLogs) => [...prevLogs, log]),
    []
  );
  return (
    // logs和addLog拆分到不同的Context当中去
    <LogDispatchContext.Provider value={addLog}>
      <logShowContext.Provider value={logs}>{children}</logShowContext.Provider>
    </LogDispatchContext.Provider>
  );
}

function Logger1() {
  const addLog = useContext(LogDispatchContext);
  console.log("Logger1 render");
  return (
    <>
      <p>一个能发日志的组件1</p>
      <button onClick={() => addLog("logger1")}>发日志</button>
    </>
  );
}

function LogsPanel() {
  const logs = useContext(logShowContext);
  return logs.map((log, index) => <p key={index}>{log}</p>);
}

export default function App() {
  return (
    <LogProvider>
      {/* 写日志 */}
      <Logger1 />
      {/* 读日志 */}
      <LogsPanel />
    </LogProvider>
  );
}

```

后面的<font color=#9400D3>自定义封装</font>和<font color=#9400D3>回调地狱封装</font>都是代码层面的优化，能使代码更简单和健壮，这里就不做详细介绍了，有兴趣的参照[Context代码组织](https://juejin.im/post/6889247428797530126#heading-3)和[组合 Providers](https://juejin.im/post/6889247428797530126#heading-4)

**参考资料**


+ [我在大厂写React，学到了什么？性能优化篇](https://juejin.im/post/6889247428797530126)