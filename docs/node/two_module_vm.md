# 核心模块 - vm

## vm概述
我们到`node`官网上能看到对`vm`核心模块的介绍如下：
+ <font color=#1E90FF>vm模块提供了在 V8 虚拟机上下文中编译和运行代码的一系列API。vm 模块不是一个安全的虚拟机。不要用它来运行不受信任的代码。在这些文档中 "sanbox" 这个术语仅仅是为了表示一个单独的上下文，并不提供任何安全保障。JavaScript 代码可以被编译并立即运行，也可以编译、保存，以后再运行。一个常见的场景是在沙盒中运行代码。沙盒中的代码使用不同的 V8 上下文，这意味着它具有与其余代码不同的全局对象。可以通过上下文隔离化一个沙箱对象来提供上下文。沙盒代码将沙盒中的任何属性视为全局对象。由沙盒代码引起的任何全局变量的更改都将反映到沙盒对象中。</font>

那么上面的描述当中的<font color=#DD1144>上下文隔离化</font>又是什么东西，我们也能从官网找到答案：
+ <font color=#1E90FF>所有用 Node.js 所运行的 JavaScript 代码都是在一个“上下文”的作用域中被执行的。根据 V8 嵌入式指南：在V8中，一个上下文是一个执行环境，它允许分离的，无关的JavaScript应用在一个V8的单例中被运行。 必须明确地指定用于运行所有 JavaScript 代码的上下文。当调用 vm.createContext() 时，传入的 sandbox 对象（或者新建的一个 sandbox 对象，若原 sandbox 为 undefined）在底层会和一个新的V8上下文实例联系上。 这个 V8 上下文在一个隔离的全局环境中，使用 vm 模块的方法运行code。 创建V8上下文和使之联系上 sandbox 的过程在此文档中被称作为"上下文隔离化" sandbox。</font>

我们通过官网的一段代码来说明：
```javascript
const vm = require('vm')
let x = 1
const sanbox = {
  x: 1
}
vm.createContext(sanbox) // 上下文隔离化一个沙盒

const code = `
  x += 40;
  var y = 17;
`
vm.runInContext(code,sanbox) 

console.log(sanbox.x) // 41
console.log(sanbox.y) // 17

console.log(x) // 1
x += sanbox.x
console.log(x) // 42

sanbox.x += x
console.log(sanbox.x) // 83
```

## 相关API
### 1. vm.createContext
+ <font color=#3eaf7c>全称</font>：`vm.createContext([sandbox[, options]])`

+ <font color=#3eaf7c>概念</font>：给定一个`sandbox`对象，`vm.createContext()`会设置此沙盒，从而让它具备在`vm.runInContext()`或者`script.runInContext()`中被使用的能力。 对于此二方法中所调用的脚本，<font color=#CC99CD>他们的全局对象不仅拥有我们提供的sandbox 对象的所有属性，同时还有任何全局对象所拥有的属性。 对于这些脚本之外的所有代码，他们的全局变量将保持不变</font> 。

+ <font color=#3eaf7c>返回值</font>：上下文隔离化的沙盒。

+ <font color=#3eaf7c>用法</font>：
  ```javascript
  const util = require('util');
  const vm = require('vm');

  global.globalVar = 3;
  const sandbox = { globalVar: 1 };
  vm.createContext(sandbox);
  vm.runInContext('globalVar *= 2;', sandbox);
  console.log(util.inspect(sandbox)); // { globalVar: 2 }
  console.log(util.inspect(globalVar)); // 3
  ```

### 2. vm.isContext
+ <font color=#3eaf7c>全称</font>：`vm.isContext(sandbox)`

+ <font color=#3eaf7c>概念</font>：当给定的`sandbox`对象已经被`vm.createContext()`上下文隔离化，则返回`true`。

+ <font color=#3eaf7c>用法</font>：
  ```javascript
  const vm = require('vm')
  const general = { x: 1 }
  const sanbox = { x: 1 }
  vm.createContext(sanbox) // 上下文隔离化一个沙盒

  console.log(vm.isContext(sanbox)) // true
  console.log(vm.isContext(general)) // false 
  ```
  
### 3. vm.runInContext
+ <font color=#3eaf7c>全称</font>：`vm.runInContext(code, contextifiedSandbox[, options])`

+ <font color=#3eaf7c>概念</font>：`vm.runInContext()`方法会编译`code`，然后在指定的 `contextifiedSandbox`的上下文里执行它并返回其结果。 被执行的代码无法获取本地作用域。 `contextifiedSandbox`必须是事先被`vm.createContext()`方法上下文隔离化过的对象。

+ <font color=#3eaf7c>返回值</font>：脚本中执行的最后一个语句的结果（<font color=#DD1144>注意不能在最后一个语句之前加return</font> ）

+ <font color=#3eaf7c>用法</font>：
  ```javascript
  const vm = require('vm')
  const util = require('util')
  const sandbox = { globalVar : 1 }

  vm.createContext(sandbox) // 必须手动申明为一个Context
  for (let i = 0; i < 10; i++) {
    vm.runInContext(`
    globalVar *= 2
    `, sandbox)
  }
  console.log(util.inspect(sandbox)) // { globalVar: 1024 }
  ```

### 4. vm.runInNewContext
+ <font color=#3eaf7c>全称</font>： vm.runInNewContext(code[, sandbox[, options]])

+ <font color=#3eaf7c>概念</font>：`vm.runInNewContext()`首先给指定的`sandbox`（若为 `undefined`，则会新建一个`sandbox`）提供一个隔离的上下文, 再在此上下文中执行编译的`code`，最后返回结果。 运行中的代码无法获取本地作用域。

+ <font color=#3eaf7c>返回值</font>：脚本中执行的最后一个语句的结果（<font color=#DD1144>注意不能在最后一个语句之前加return</font> ）

+ <font color=#3eaf7c>用法</font>:
  ```javascript
  const util = require('util');
  const vm = require('vm');

  const sandbox = {
    animal: 'cat',
    count: 2
  };
  vm.runInNewContext('count += 1; name = "kitty"', sandbox);
  console.log(util.inspect(sandbox));// { animal: 'cat', count: 3, name: 'kitty' }
  ```
 
### 5. vm.runInThisContext
+ <font color=#3eaf7c>全称</font>：vm.runInThisContext(code[, options])

+ <font color=#3eaf7c>概念</font>：`vm.runInThisContext()`在当前的`global`对象的上下文中编译并执行`code`，最后返回结果。运行中的代码无法获取本地作用域，但可以获取当前的`global`对象。

+ <font color=#3eaf7c>返回值</font>：脚本中执行的最后一个语句的结果（<font color=#DD1144>注意不能在最后一个语句之前加return</font> ）

+ <font color=#3eaf7c>用法</font>：
  ```javascript
  const vm = require('vm');
  let localVar = 'initial value';

  console.log(global.localVar)  // undefined
  const vmResult = vm.runInThisContext('localVar = "vm";');
  console.log('vmResult:', vmResult); // vmResult: 'vm', 
  console.log('localVar:', localVar); // localVar: 'initial value'
  console.log(global.localVar) // vm


  const evalResult = eval('localVar = "eval";');
  console.log('evalResult:', evalResult); // evalResult: 'eval'
  console.log('localVar:', localVar);   // localVar: 'eval'
  console.log(global.localVar) // vm
  ```
  这里就要特别注意：<font color=#DD1144>无法获取本地的作用域的含义就是：操作相同的变量名，但是操作的是堆中不同的地址</font>。因此`vm.runInThisContext()`相当于从本地作用域复制了一些东西到新的上下文中来做操作，复制的新东西和原来的东西互不影响。 相反，`eval()`确实能获取本地作用域，所以`localVar`的值被改变了。 如此看来，`vm.runInThisContext()`更像是间接的执行`eval()`, 就像 `(0,eval)('code')`

### 6. 总结
+ <font color=#DD1144>runInContext在传入context参数上与runInNewContext有所区别runInContext传入的context对象不为空而且必须是经vm.createContext()处理过的，否则会报错。runInNewContext的context参数是非必须的，而且无需经过vm.createContext处理。runInNewContext和runInContext因为有指定context，所以不会像runInThisContext那样产生全局污染</font> 

+ 当需要一个沙箱环境执行多个脚本片段的时候，可以通过多次调用`runInContext`方法但是传入同一个`vm.createContext()`返回值实现。

## 安全问题
`vm`相对于`eval`来说更安全一些，因为它隔离了当前的上下文环境了，但是尽管如此依然可以访问标准的`JS API`和全局的`NodeJS`环境，因此`vm`并不安全，这个在官方文档里就提到了

针对原生`vm`存在的这个问题，有人开发了`vm2`包，可以避免上述问题，但是也不能说`vm2`就一定是安全的

`vm`提供了一种隔离的方式来执行不可信代码，但是并不是非常彻底，针对不可信代码最好的执行方式还是“物理隔离”，比如`docker`容器。

## 使用场景
1. <font color=#3eaf7c>环境隔离</font>：   
  因为`node`的`js`代码是单线程，在并发的场景下，需要考虑上下文的竞争和互相影响，直接使用`vm`，可以最小成本的解决这个问题。`vue ssr`在2.3.0以前，就是用`vm`来做隔离的渲染的，但是也带来了性能的问题，具体可以查看[文档](https://ssr.vuejs.org/api/#runinnewcontext)的介绍。

2. <font color=#3eaf7c>动态执行字符串代码</font>：   
  这在某些需求场景下只能使用`vm`，比如我们要自己做一个模板引擎的时候，我们可以在[node-Bff](https://www.taopoppy.cn/node-BFF/)这个实战课程的详情页的实战中看到如何使用`vm`和`ES6`模板字符串造一个模板引擎。


**参考资料**

1. [Node.js 沙箱环境](https://juejin.im/post/5af95fdf6fb9a07ac23adcfa)
2. [为 Node.js 应用建立一个更安全的沙箱环境](https://segmentfault.com/a/1190000014533283)
3. [node核心模块-vm](https://segmentfault.com/a/1190000017210397)
4. [node中文网](http://nodejs.cn/api/vm.html#vm_what_does_it_mean_to_contextify_an_object)