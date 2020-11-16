# 静态类型检查

官网给出了三个静态类型检查的方法：<font color=#9400D3>Flow</font>、<font color=#9400D3>TypeScript</font>和<font color=#9400D3>PropsTypes</font>，`Flow`在这里我们不会介绍，有兴趣的可以到[官网](https://zh-hans.reactjs.org/docs/static-type-checking.html#flow)上去看看。我们这里会介绍一下`TypeScript`和`PropsTypes`的用法。

## TypeScript
`TypeScript`是一种由微软开发的编程语言。它是`JavaScript`的一个类型超集，包含独立的编译器。作为一种类型语言，`TypeScript`可以在构建时发现`bug`和错误，这样程序运行时就可以避免此类错误。

完成以下步骤，便可开始使用`TypeScript`：
+ <font color=#1E90FF>将 TypeScript 添加到你的项目依赖中</font>。
+ <font color=#1E90FF>配置 TypeScript 编译选项</font>
+ <font color=#1E90FF>使用正确的文件扩展名</font>
+ <font color=#1E90FF>为你使用的库添加定义</font>

### 1. 脚手架内置
在`Create React App`中使用`TypeScript`是很简单的，因为`Create React App`内置了对`TypeScript`的支持。

需要创建一个使用`TypeScript`的新项目，在终端运行：
```javascript
npx create-react-app my-app --template typescript
```
如需将`TypeScript`添加到现有的`Create React App`项目中，请参考此[文档](https://create-react-app.dev/docs/adding-typescript/).


### 2. 自定义
<font color=#1E90FF>**① 添加到TypeScript到现有项目中**</font>

如果是从头自己搭建工程，需要从执行一条命令开始：
```javascript
// Yarn
yarn add --dev typescript

// npm
npm install --save-dev typescript
```
恭喜！你已将最新版本的`TypeScript`安装到项目中。安装`TypeScript`后我们就可以使用`tsc`命令。在配置编译器之前，让我们将`tsc`添加到`package.json`中的`“scripts”`部分：
```javascript
{
  // ...
  "scripts": {
    "build": "tsc",
    // ...
  },
  // ...
}
```

<font color=#1E90FF>**② 配置 TypeScript 编译器**</font>

没有配置项，编译器提供不了任何帮助。在`TypeScript`里，这些配置项都在一个名为`tsconfig.json`的特殊文件中定义。可以通过执行以下命令生成该文件：
```javascript
// yarn
yarn run tsc --init

// npm
npx tsc --init
```

`tsconfig.json`文件中，有许多配置项用于配置编译器。查看所有配置项的的详细说明，请参考此文档。

我们来看一下`rootDir`和`outDir`这两个配置项。编译器将从项目中找到`TypeScript`文件并编译成相对应`JavaScript`文件。但我们不想混淆源文件和编译后的输出文件。

为了解决该问题，我们将执行以下两个步骤：

首先，让我们重新整理下项目目录，把所有的源代码放入`src`目录中。
```javascript
├── package.json
├── src
│   └── index.ts
└── tsconfig.json
```

其次，我们将通过配置项告诉编译器源码和输出的位置。
```javascript
// tsconfig.json

{
  "compilerOptions": {
    // ...
    "rootDir": "src",
    "outDir": "build"
    // ...
  },
}
```
很好！现在，当我们运行构建脚本时，编译器会将生成的`javascript`输出到`build`文件夹。`TypeScript React Starter`提供了一套默认的`tsconfig.json`帮助你快速上手。

通常情况下，你不希望将编译后生成的`JavaScript`文件保留在版本控制内。因此，应该把构建文件夹添加到`.gitignore`中。

<font color=#1E90FF>**③ 文件扩展名**</font>

在`React`中，你的组件文件大多数使用`.js`作为扩展名。在`TypeScript`中，提供两种文件扩展名：

`.ts`是默认的文件扩展名，而`.tsx`是一个用于包含`JSX`代码的特殊扩展名。

<font color=#1E90FF>**④ 运行TypeScript**</font>

如果你按照上面的说明操作，现在应该能运行`TypeScript`了。
```javascript
// yarn
yarn build

// npm
npm run build
```
如果你没有看到输出信息，这意味着它编译成功了。

<font color=#1E90FF>**⑤ 类型定义**</font>

为了能够显示来自其他包的错误和提示，编译器依赖于声明文件。声明文件提供有关库的所有类型信息。这样，我们的项目就可以用上像`npm`这样的平台提供的三方`JavaScript`库。

获取一个库的声明文件有两种方式：

+ <font color=#DD1144>Bundled</font>：该库包含了自己的声明文件。这样很好，因为我们只需要安装这个库，就可以立即使用它了。要知道一个库是否包含类型，看库中是否有`index.d.ts`文件。有些库会在`package.json`文件的`typings`或`types`属性中指定类型文件。

+ <font color=#DD1144>DefinitelyTyped</font>：`DefinitelyTyped`是一个庞大的声明仓库，为没有声明文件的`JavaScript`库提供类型定义。这些类型定义通过众包的方式完成，并由微软和开源贡献者一起管理。例如，`React`库并没有自己的声明文件。但我们可以从 `DefinitelyTyped`获取它的声明文件。只要执行以下命令。

```javascript
// yarn
yarn add --dev @types/react

// npm
npm i --save-dev @types/react
```

+ <font color=#DD1144>局部声明</font>：有时，你要使用的包里没有声明文件，在`DefinitelyTyped`上也没有。在这种情况下，我们可以创建一个本地的定义文件。因此，在项目的根目录中创建一个`declarations.d.ts`文件。一个简单的声明可能是这样的：
```javascript
declare module 'querystring' {
  export function stringify(val: object): string
  export function parse(val: string): object
}
```

## PropsTypes
::: warning
注意：

自 React v15.5 起，React.PropTypes 已移入另一个包中。请使用 prop-types 库 代替。
我们提供了一个 codemod 脚本来做自动转换。
:::

随着你的应用程序不断增长，你可以通过类型检查捕获大量错误。对于某些应用程序来说，你可以使用`Flow`或`TypeScript`等`JavaScript`扩展来对整个应用程序做类型检查。但即使你不使用这些扩展，`React`也内置了一些类型检查的功能。要在组件的`props`上进行类型检查，你只需配置特定的`propTypes`属性：

```javascript
import PropTypes from 'prop-types';

class Greeting extends React.Component {
  render() {
    return (
      <h1>Hello, {this.props.name}</h1>
    );
  }
}

Greeting.propTypes = {
  name: PropTypes.string
};
```
<font color=#9400D3>PropsTypes同样的功能也不仅能用于class类组件可用于函数组件，或者是由 React.memo/React.forwardRef 创建的组件。出于性能方面的考虑，propTypes 仅在开发模式下进行检查。</font>

### 1. PropsTypes
以下提供了使用不同验证器的例子：
```javascript
import PropTypes from 'prop-types';

MyComponent.propTypes = {
  // 你可以将属性声明为 JS 原生类型，默认情况下
  // 这些属性都是可选的。
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,

  // 任何可被渲染的元素（包括数字、字符串、元素或数组）
  // (或 Fragment) 也包含这些类型。
  optionalNode: PropTypes.node,

  // 一个 React 元素。
  optionalElement: PropTypes.element,

  // 一个 React 元素类型（即，MyComponent）。
  optionalElementType: PropTypes.elementType,

  // 你也可以声明 prop 为类的实例，这里使用
  // JS 的 instanceof 操作符。
  optionalMessage: PropTypes.instanceOf(Message),

  // 你可以让你的 prop 只能是特定的值，指定它为
  // 枚举类型。
  optionalEnum: PropTypes.oneOf(['News', 'Photos']),

  // 一个对象可以是几种类型中的任意一个类型
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Message)
  ]),

  // 可以指定一个数组由某一类型的元素组成
  optionalArrayOf: PropTypes.arrayOf(PropTypes.number),

  // 可以指定一个对象由某一类型的值组成
  optionalObjectOf: PropTypes.objectOf(PropTypes.number),

  // 可以指定一个对象由特定的类型值组成
  optionalObjectWithShape: PropTypes.shape({
    color: PropTypes.string,
    fontSize: PropTypes.number
  }),

  // An object with warnings on extra properties
  optionalObjectWithStrictShape: PropTypes.exact({
    name: PropTypes.string,
    quantity: PropTypes.number
  }),

  // 你可以在任何 PropTypes 属性后面加上 `isRequired` ，确保
  // 这个 prop 没有被提供时，会打印警告信息。
  requiredFunc: PropTypes.func.isRequired,

  // 任意类型的数据
  requiredAny: PropTypes.any.isRequired,

  // 你可以指定一个自定义验证器。它在验证失败时应返回一个 Error 对象。
  // 请不要使用 `console.warn` 或抛出异常，因为这在 `onOfType` 中不会起作用。
  customProp: function(props, propName, componentName) {
    if (!/matchme/.test(props[propName])) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  },

  // 你也可以提供一个自定义的 `arrayOf` 或 `objectOf` 验证器。
  // 它应该在验证失败时返回一个 Error 对象。
  // 验证器将验证数组或对象中的每个值。验证器的前两个参数
  // 第一个是数组或对象本身
  // 第二个是他们当前的键。
  customArrayProp: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
    if (!/matchme/.test(propValue[key])) {
      return new Error(
        'Invalid prop `' + propFullName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  })
};
```

### 2. 限制单个元素
你可以通过`PropTypes.element`来确保传递给组件的`children`中只包含一个元素：
```javascript
import PropTypes from 'prop-types';

class MyComponent extends React.Component {
  render() {
    // 这必须只有一个元素，否则控制台会打印警告。
    const children = this.props.children;
    return (
      <div>
        {children}
      </div>
    );
  }
}

MyComponent.propTypes = {
  children: PropTypes.element.isRequired
};
```

### 3. 默认Prop值
您可以通过配置特定的`defaultProps`属性来定义`props`的默认值：
```javascript
class Greeting extends React.Component {
  render() {
    return (
      <h1>Hello, {this.props.name}</h1>
    );
  }
}

// 指定 props 的默认值：
Greeting.defaultProps = {
  name: 'Stranger'
};

// 渲染出 "Hello, Stranger"：
ReactDOM.render(
  <Greeting />,
  document.getElementById('example')
);
```
