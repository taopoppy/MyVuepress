# 环境配置

## 项目创建
过去我们都需要先全局下载`create-react-app`，然后使用`create-react-app`去创建项目，如下所示：
```javascript
npm install -g create-react-app // 全局安装
create-react-app my-app  // 创建项目
```
但是新版的`node`也就是14版本（npm>=5.2）以上的，支持我们使用<font color=#9400D3>npx</font>来直接创建项目, <font color=#DD1144>npx就是npm命令的加强版，在不需要全局安装工具集的情况下直接使用这些工具</font>，所以直接创建项目：
```javascript
npx create-react-app my-app // 使用npx直接创建项目
```

## 核心包说明
创建完毕项目，你会发现在`package.json`当中有这么几个重要的依赖：
+ <font color=#9400D3>react</font>：`React`当中只包含了`Web`和`Mobile`通用的核心部分
+ <font color=#9400D3>react-dom</font>：负责`Dom`操作的分到`ReactDOM`中,负责`Mobile`的包含在`ReactNative`中
+ <font color=#9400D3>react-scripts</font>: <font color=#1E90FF>这个包是create-react-app的核心部分，帮助我们自动构建，打包项目，同时能自动加载babel这样的工具</font>
+ <font color=#9400D3>web-vitals</font>：一个可以帮助我们对性能进行量化的包，这个在浏览器当中也有同样的插件。

## tsconfig.json
`TypeScript`无疑是优秀前端工程师的未来，但是`TypeScript`的学习曲线十分陡峭，我们在前面就要好好先学习，但是学习完并不代表就会了，因为将`TypeScript`使用到`React`或者`Vue`当中是比较难的事情，下面我们就来学习如果创建和配置一个`React-TypeScript`的项目：
```javascript
npx create-react-app my-app-ts --template typescript // 使用ts模块创建项目
```
创建好的项目只是比原来多了一个`tsconfig.json`的配置文件，但是本质上来说，语言，编译环境都完全不相同，因为和`es6`一样，`ts`也无法被主流浏览器直接读取，所以将其转换成原生JS的这个过程就是<font color=#9400D3>TS编译</font>

`ts`编译器有很多：<font color=#9400D3>ts-loader</font>、<font color=#9400D3>awesome-typescript-loader</font>、<font color=#9400D3>babel-loader</font>，在`create-react-app`这个脚手架工具当中使用的是`babel-loader`。

接下来我们来解读一下`tsconfig.json`，并且我们在自己修改的地方都做上相对应的注释:
```javascript
{
  "compilerOptions": {
    "noImplicitAny": false,               // （新添加）不需要显式的声明变量的类型any
    "target": "es5",                      // 编译后目标js的版本
    "lib": [                              // 编译期间所有需要包括进来的库文件
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,                      // 允许混合编译Javascript文件
    "skipLibCheck": true,
    "esModuleInterop": true,              // 允许我们使用commonjs的方式import默认文件，由import * as React from 'react'变为import React from 'react'
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",                   // 配置的是我们代码的模块系统（Nodejs的CommonJS，ES标准的esnext）
    "moduleResolution": "node",           // 决定我们编译器的工作方式，现在只有node，以前的classic被废弃了
    "resolveJsonModule": true,
    "isolatedModules": true,              // 编译器会将每个文件作为单独的模块来使用
    "noEmit": true,                       // 表示当发生错误的时候，编译器不要生成JS代码
    "jsx": "react-jsx"                    // 允许编译器支持编译react代码
  },
  "include": [
    "src"
  ]
}
```
关于更多的配置，我们在之前学习`typescript`也已经详细的说过了，如果有忘记或者查阅的请返回查看或者查阅官网。

## TS的编译流程
我们已经知道了`create-react-app`脚手架的核心`ts`编译器是`babel-loader`，我们现在深入了解一下`babel-loader`的工作流程，研究一下他到底如何读取`tsconfig.js`文件的

其实很简单，因为整个脚手架是基于`webpack`的，所以通过`npm run eject`弹出`webpack`的配置后，就会发现在`loader`当中对于`.ts`或者`.tsx`文件进行`babel-loader`进行编译转换，并且读取了我们在`tsconfig.json`当中的配置规则，按照这个规则进行了转换。

## JS升级TS
如何对现有的`React`项目升级为`TS`的版本呢，我们只需要这样做：
+ 下载解释性的包：
	```javascript
	npm install --save typescript @types/node @types/react @types/react-dom @types/jest
	```
+ 修改文件名称
	+ 将所有`.js`文件修改为`.tsx`的文件后缀即可，然后执行`npm start`就会自动生成`tsconfig.json`文件