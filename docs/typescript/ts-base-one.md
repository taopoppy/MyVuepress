# TS 环境搭建

## TS 的定义和优势

### 1. TS 的定义

在[www.typescriptlang.org](www.typescriptlang.org)官网上有这样对`typescript`语言的一种描述：

<font color=#9400D3>typescript is a typed superset of JavaScript that compiles to plain JavaScript.Any browser.Any host. Any OS .Open source</font>

上面这个解释有下面几个要点：

- <font color=#DD1144>TS 是 JS 的超集</font>：TS 除了包含所有的 JS 语法特性，还拥有自己独特的语法特性，所以我们学习 TS,实际上只是在学习 TS 中剔除 JS 语法外的新语法特定
- <font color=#DD1144>静态的代码类型</font>：JS 代码中的类型都是动态类型，也就是在变量当中保存的值的类型可以随时变化，<font color=#DD1144>但是 TS 当中一旦变量存储的数据的类型确定，就不能在更改，并且这个变量上就拥有了该类型所有的属性和方法（请牢记）</font>
- <font color=#DD1144>TS 无法直接运行</font>：TS 代码需要通过自己的编译器成为 JS 代码才能在浏览器或者 Node 当中去使用，你可以在[https://www.typescriptlang.org/play](https://www.typescriptlang.org/play)这个网址左侧写任何 TS 代码，右侧就会翻译成为 JS 代码

### 2. TS 的优势

- <font color=#1E90FF>在开发过程中就能发现潜在问题</font>
- <font color=#1E90FF>更友好的编辑器自动提示</font>
- <font color=#1E90FF>代码语义更加清晰，易懂</font>

## 环境搭建和运行

### 1. 基础环境搭建

1. <font color=#DD1144>安装 Node</font>
2. <font color=#1E90FF>在 VSCode 当中，设置中将 quote 中的[TypeScript › Preferences: Quote Style]设置为 single，即为单引号</font>（非必选）
3. <font color=#1E90FF>下载插件：Prettier-Code formatter，帮助我们在保存文件的时候自动格式化，需要在设置中将 save 中的[Editor: Format On Save]打上对勾</font>（非必选）
4. <font color=#DD1144>全局下载 TS：npm install typescript -g</font>

### 2. 代码运行

前面说过，TS 代码是无法直接运行，必须先通过`tsc`编译器将 TS 代码编译成为 JS 代码，然后再运行 JS 代码才可以。所以需要两个步骤：

```javascript
tsc demo.ts // 使用tsc编译器将demo.ts编译成为demo.js
node demo.js // node运行demo.js文件
```

当然了，如果每次都要自己手动去编译会很麻烦，我们可以全局下载一个工具：<font color=#9400D3>ts-node</font>来帮助我们直接运行 TS 文件：

```javascript
npm install ts-node -g
```

然后我们就可以使用<font color=#1E90FF>ts-node</font>命令来运行 TS 文件了：

```javascript
ts-node demo.ts // 直接运行demo.ts文件
```
