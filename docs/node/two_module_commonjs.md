# CommonJS规范
<font color=#CC99CD>CommonJS是一种规范，通过简单的API声明服务器的模块，目标是让JavaScript可以运行在浏览器之外的所有地方，例如在服务器或者本地桌面应用服务程序上</font>

## 简介
`CommonJS`原本是一个项目，由牛人云集的`CommonJS`社区指定，其中`Moudules1/0规范如下：`
+ 规定模块的标识应该遵循的规则（手写规则）
+ 定义全局函数`require`,通过传入模块标识来引入其他模块，执行结果即其他模块暴露出来的`API`
+ 如果被`require`函数引入的模块中也包含依赖，则依次加载这些依赖
+ 如果引入模块失败，那么`require`函数应该抛出异常
+ 模块通过变量`exports`来向外暴露`API`,`exports`只能是一个对象，暴露的`API`必须作为此对象的属性

<font color=#1E90FF>**① CommonJS和Node.js的关系**</font>

`Node.js`借鉴`CommonJS`模块规范实现了一套非常易用的模块系统，`npm`对模块规范的完美支持，也使得`Node.js`应用开发事半功倍，但是经常有人会说<font color=#3eaf7c>Node是基于CommmonJS规范的</font>，那其实这里有两个误区：
+ <font color=#CC99CD>并不是先有的规范再有的Node</font>：虽然`CommonJS`在`Node`之后产生，但是它对`Node`后续发展影响甚大，所以说`Node`基于`CommonJS`只是强调了`CommonJS`的重要性，而不是时间上的具体区分
+ <font color=#CC99CD>Node并不支持所有CommonJS规范</font>：`CommonJS`是一个很大的项目，里面制定了一系列的规范，`Node`并没有在所有方面都依赖`CommonJS`，只是在模块方面遵循了`CommonJS`当中的模块规范

<font color=#1E90FF>**② CommonJS和Node.js的区别**</font>

`CommonJS`和`Node.js`的区别主要体现在`module.exports`对象的具体实现上
+ 原生`Node.js`当中，`module.exports`是真正的特殊对象，也是真正的对外暴露接口，在`CommonJS`没有出现以前，也没有`exports`这种东西
+ 在`CommonJS`规范当中,规定`exports`对象是暴露接口的对象，所以`Node`为了遵循规定但是又不修改自身`module.exports`的基础上，额外增加了将`exports`关键字绑定到了`module.exports`对象上的默认操作，说白了就`exports`默认指向了`module.exports`导出的对象。这就是为什么`Node`在包装模块的时候将`exports`作为参数的原因，默认将规范添加了进来。
+ 两者同时存在时，以`module.exports`为准，因为`module.exports`的实际含义是一个完全预先构造的对象，但是`exports`可以手动被我们篡改指向，这就是很多讲师在给`Node`初学者解释两者区别最常用的一句话：<font color=#CC99CD>exports在没有改变指向的时候是module.exports的代替品</font> ，这句话是没有错的，但是我想你听了我上面的解释，你一定会有更深刻的理解。

## 核心
`Node.js`对模块定义的非常简单，主要分为<font color=#CC99CD>模块引用</font>、<font color=#CC99CD>模块定义</font>、<font color=#CC99CD>模块标识</font>，其中最常用的模块处理命令就有两个：<font color=#CC99CD>require</font>和<font color=#CC99CD>exports</font>

### 1. 模块的导入和导出
<font color=#CC99CD>模块可以理解为将能够完成实现一个独立功能的代码封装到一个代码单元当中</font>，在`Node`中创建一个模块可以理解为把全部和此功能关联的函数放在一个文件当中。

我们之前就说<font color=#CC99CD>exports默认情况下是module.exports的引用</font>，所以使用方面只有更方便的说法，没有对错和性能方面的区分
+ 当我们编写对外暴露对个`API`的工具我们可以使用`exports`更方便：
  ```javascript
  // exports的写法
  exports.add = async() => { }
  exports.sub = async() => { }
  // 外部引用和使用
  const add = require('./xxx.js')
  let result = add()

  // module.exports的写法
  async function add() { }
  async function sub() { }
  module.exports = { add, sub }
  // 外部引用和使用
  const obj = require('./xxx.js')
  let result = obj.add()
  ```
  这种情况下使用`exports`更方便，因为代码少，好理解，更重要的是外部调用很方便

+ 当我们编写同一个对象的时候使用`module.exports`更方便：
  ```javascript
  class Student {
    constructor(name) {
      this.name = name
    }
    study: function () => {
      return 'I have finished my homework' 
    }
  }

  module.exports = new Student('小明')
  ```
  这种情况下不得不依赖`module.exports`，因为是输出一个整体的对象。

### 2. 模块间的循环引用
不管在`Node`当中还是别的地方，模块之间都会相互引用，官网称之为`module cycles`，翻译成为模块间的循环引用

而在`CommonJS Moudules1.0`当中有说明，<font color=#CC99CD>在这种情况下，require返回的对象必须至少包含此外部模块在调用require函数之前就已经准备完毕的输出</font>，这种解决模块间的循环引用的策略称为<font color=#CC99CD>模块缓存策略</font>

上述策略的意图也很简单，就是说`a.js`引用的其他模块`b.js`和`c.js`，这两者就相当于包含在`a.js`的外部模块，那么`require('a.js')`的时候一定会先运行`b.js`和`c.js`，光运行也不行，在`b.js`和`c.js`当中的`module.exports`上面必须存在有效的输出，才叫做准备完毕的输出。

我们还要避免的一种写法就是：<font color=#3eaf7c>A模块引用了B模块，B模块也引用了A模块</font>，这种循环引用遵循的规则是这样：<font color=#CC99CD>一旦出现某个模块被循环加载，就只输出已经执行的部分，还未执行的部分不会输出</font>。

## 拓展
实际上，无论什么时候我们在`Node`当中讲任何知识点都会和前端联系起来，也并不是因为`Node`本身就是前端的一部分，而是前端在发展的过程当中越来越依赖`Node`模块。所有由`CommonJS`规范我们就会拓展前端模块化的东西。我们会简单介绍一下`AMD`和`CMD`,重点放在`ES6`模块以及它和`CommonJS`规范的对比。

### 1. AMD和require.js
`commonJS`用同步的方式加载模块。在服务端，模块文件都存在本地磁盘，读取非常快，所以这样做不会有问题。但是在浏览器端，限于网络原因，更合理的方案是使用异步加载。

`AMD`规范采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。这里介绍用`require.js`实现`AMD`规范的模块化：用`require.config()`指定引用路径等，用`define()`定义模块，用`require()`加载模块。

### 2. CMD和sea.js
`CMD`是另一种`js`模块化方案，它与`AMD`很类似，不同点在于：`AMD`推崇依赖前置、提前执行，`CMD`推崇依赖就近、延迟执行。此规范其实是在`sea.js`推广过程中产生的。

### 3. ES6 Module
`ES6`在语言标准的层面上，实现了模块功能，而且实现得相当简单，旨在成为浏览器和服务器通用的模块解决方案。其模块功能主要由两个命令构成：`export`和`import`。`export`命令用于规定模块的对外接口，`import`命令用于输入其他模块提供的功能。`ES`模块的目标是创建一个同时兼容`CommonJS`和`AMD`的格式，使语法更加紧凑，通过编译时加载，在编译的时候就能确认模块之间的关系，比`CommonJS`模块的加载效率更高。而在异步加载方面和配置模块加载方面，则借鉴`AMD`规范，执行效率，灵活度都比`CommonJS`好的多。
```javascript
/** 定义模块 math.js **/
var basicNum = 0;
var add = function (a, b) {
    return a + b;
};
export { basicNum, add };

/** 引用模块 **/
import { basicNum, add } from './math';
function test(ele) {
    ele.textContent = add(99 + basicNum);
}
```
如上例所示，使用`import`命令的时候，用户需要知道所要加载的变量名或函数名。其实`ES6`还提供了`export default`命令，为模块指定默认输出，对应的`import`语句不需要使用大括号。这也更趋近于`ADM`的引用写法。

```javascript
/** export default **/
//定义输出
export default { basicNum, add };
//引入
import math from './math';
function test(ele) {
    ele.textContent = math.add(99 + math.basicNum);
}
```
`ES6`的模块不是对象，`import`命令会被`JavaScript`引擎静态分析，在编译时就引入模块代码，而不是在代码运行时加载，所以无法实现条件加载。也正因为这个，使得静态分析成为可能。

### 4. ES6 模块与 CommonJS 模块的差异
<font color=#1E90FF>**① CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。**</font>

+ `CommonJS`模块输出的是值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。
+ `ES6`模块的运行机制与`CommonJS`不一样。`JS`引擎对脚本静态分析的时候，遇到模块加载命令`import`，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。换句话说，`ES6`的`import`有点像`Unix`系统的“符号连接”，原始值变了，`import`加载的值也会跟着变。因此，`ES6` 模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。

<font color=#1E90FF>**② CommonJS模块是运行时加载，ES6模块是编译时输出接口**</font>

+ 运行时加载: `CommonJS`模块就是对象；即在输入时是先加载整个模块，生成一个对象，然后再从这个对象上面读取方法，这种加载称为“运行时加载”。
+ 编译时加载: `ES6`模块不是对象，而是通过`export`命令显式指定输出的代码，`import`时采用静态命令的形式。即在`import`时可以指定加载某个输出值，而不是加载整个模块，这种加载称为“编译时加载”。

上述说了这么多，我们还是要真正来总结一下整个流程:
+ `CommonJS`加载的是一个对象（即module.exports属性），该对象只有在脚本运行完才会生成,流程如下：
  + <font color=#1E90FF>本部模块（简称a）在运行时加载外部模块（简称b）</font>（<font color=#CC99CD>重点</font>）
  + <font color=#1E90FF>外部模块（b）整体被运行，通过exports生成最终对象，同时还被缓存</font>（<font color=#b14>Node通过require函数加载外部模块的过程我们会在下一小节详细说明</font>）
  + <font color=#1E90FF>本部模块（a）加载完毕外部模块（b）后拷贝外部模块（b）生成的最终对象</font>（<font color=#CC99CD>重点</font>）
  + <font color=#1E90FF>导致本部模块（a）中的require函数执行完最终获得的是一个值拷贝</font>
  + <font color=#1E90FF>这个值拷贝表现在栈中就是一个变量的值是一个值类型</font>
  + <font color=#1E90FF>而这个值类型也要分普通值类型和引用值类型，下面给出不同类型时的表现</font>
  ```javascript
  /*************** a.js**********************/
  let count = 0          // count是个普通值
  exports.count = count; // 输出值（值得类型时普通值）的拷贝
  exports.add = ()=>{
      count++;           //这里改变count值，并不会将module.exports对象的count属性值改变
  }

  /*************** b.js**********************/
  const { count, add } = require('./a.js')
  console.log(count)     // 0
  add();
  console.log(count)     // 0

  /*************** c.js**********************/
  const obj = require('./a.js')
  console.log(obj.count)     // 0
  obj.add();
  console.log(obj.count)     // 1
  ```
  有些小伙伴会疑惑为啥不同的引用写法会造成不同，`c.js`很好理解，因为`obj`这个变量存的和`a.js`导出对象一样的堆中地址，所以操作是相互影响的，但是`b.js`这种解构写法类似于下面这样：
  ```javascript
  const obj = require('./a.js')
  const count = obj.count
  const add = obj.add
  console.log(obj.count)     // 0
  console.log(count)         // 0
  add();
  console.log(obj.count)     // 1
  console.log(count)         // 0
  ```
  显然这里`count`虽然和`obj.count`的值一样，但是`add`操作的是`obj`里面的`count`,外面的`count`是不会受影响的。那我们再来看一个例子：
  ```javascript
  /*************** a.js**********************/
  let count = { num: 0 } // count是个引用值类型
  exports.count = count  // 输出值（值得类型是引用值）的拷贝
  exports.add = ()=>{
      count.num++;       // 这里改变count中属性值，会将module.exports对象的count属性改变
      count = {}         // 这里改变了引用也不会改变已经导出出的那个count的引用值
  }

  /*************** b.js**********************/
  const { count, add } = require('./a.js')
  console.log(count)     //{ num: 0 }
  add();
  console.log(count)     //{ num: 1 }
  ```
  + 上述第二种情况可能会让你感到疑惑，你不是说值得拷贝么，一旦输出一个值，模块内部的变化就影响不到这个值么？怎么代码表现出来是会影响呢？我们来看一张图就明白了
  <img :src="$withBase('/node_commonjs_esmodule.png')" alt="CommonJS规范">
  + 虽然`count`是一个引用，但是`0x005`这地址本身就是个普通值，所以拷贝到`b.js`当中依旧是`0x005`这个普通值，只不过两个`0x005`指向堆中相同的内存，就好比两把钥匙能开同一扇们一样,所以<font color=#CC99CD>值得拷贝</font>这句话没有错
  + 外部模块`a.js`中的`count = {}`表示外部模块当中的变化，由`0x005`变成了`0x006`，但是也没有影响到在`b.js`当中缓存值`count`的指向，这个缓存值依旧是`0x005`,所以 <font color=#CC99CD>一旦输出一个值，模块内部的变化就影响不到这个值</font> 这句话也没有问题。

+ 而`ES6`模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。
  + <font color=#1E90FF>本部模块（简称a）在编译的时候加载外部模块（简称b）</font> （<font color=#CC99CD>重点</font>）
  + <font color=#1E90FF>外部模块（b）被加载的时候只会对exports后面的代码整个生成一个只读引用</font>
  + <font color=#1E90FF>本部模块（a）加载完毕外部模块（b）后，import获得就是一个引用</font>（<font color=#CC99CD>重点</font>）
  + <font color=#1E90FF>这个引用在栈中就是一个变量的值是一个堆中的某个地址</font>
  + <font color=#1E90FF>本部模块（a）在运行的时候就会根据这个引用去堆中找值</font>
  + <font color=#1E90FF>所以本部模块（a）import加载的变量会受到外部模块（b）的影响</font>
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
    <h1>你好ES6</h1>
    <script src="vender/b.js" type="module"></script>
  </body>
  </html>
  ```
  ```javascript
  /*************** a.js**********************/
  export let count = 0;//输出的是值的引用，指向同一块内存
  export const add = ()=>{
      count++;//此时引用指向的内存值发生改变
  }


  /*************** b.js**********************/
  import { count, add } from './a.js'
  console.log(count) //0
  add();
  console.log(count)//1
  ```
  上述的例子必须要通过建立服务器来测试，我们可以全局下载`http-server`然后来启动`index.html`，同时注意：<font color=#3eaf7c>在script标签中必须使用 type="module"才能使用ES6模块语法</font>，然后通过`http-server index.html`来进行测试

**参考文章**
+ [前端模块化：CommonJS,AMD,CMD,ES6](https://juejin.im/post/5aaa37c8f265da23945f365c#heading-5)
+ [CommonJs 和 ESModule 的 区别整理](https://juejin.im/post/5ae04fba6fb9a07acb3c8ac5)
+ [ES6系列之模块加载规范](https://github.com/mqyqingfeng/Blog/issues/108)