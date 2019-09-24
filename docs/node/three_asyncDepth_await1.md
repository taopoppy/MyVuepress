# async-await知识点详解

## Promise和async
### 1. Promise的问题

我们之前已经深入了解了`Promise`，但是当你在项目当中真正使用`Promise`的时候你会很敏感的发现：只使用一个单次的`promise`非常简单。然而如果我们需要编写一个非常复杂了异步逻辑，我们可能需要将若干个`promise`组合起来。写许多的`then`语句以及匿名函数很容易失控。比如，我们需要实现以下逻辑：
+ 发起一个HTTP请求，等待结果并将其输出
+ 再发起两个并发的HTTP请求
+ 当两个请求都完成时，一起输出他们

下面的代码演示如何达到这个要求：
```javascript
// 创建第一个请求回调
const call1Promise = rp('http://example.com/');

call1Promise.then(result1 => {
    // 在第一个请求完成后执行下面语句
    console.log(result1);
    const call2Promise = rp('http://example.com/');
    const call3Promise = rp('http://example.com/');
    return Promise.all([call2Promise, call3Promise]);
}).then(arr => {
    // 当上述两个并行的请求都完成后执行下面的代码
    console.log(arr[0]);
    console.log(arr[1]);
})
```
我们为了更好的演示上述代码的执行过程，我们用一幅图来表示如下：

<img :src="$withBase('/node_async_promise.jpg')" alt="promise执行过程">

其实不难发现，虽然在代码的阅读顺序上好像是和同步类似，但是只有`then`和`Promise`等关键字出现，我们的思维依旧是在异步的世界当中，那么上述为了一个简单的例子，我们最终写了两个`then`回调以及一个`Promise.all`来同步两个并发promise。如果我们还想再多做几个异步操作或者添加一些错误处理会怎样？这种实现方案最终很容变为纠缠成一坨的`then`、`Promise.all`以及回调匿名函数，我相信即使你真的对`Promise`足够了解你也不太愿意看到全是这种结构的代码。

而`async-await`因用而生。

### 2. async-await的出现
而实际上在`Promise`和`async-await`中间还出现了过渡产品`Generator-co`，但是我们这里就不会讲解这种过渡产品。`async/await`可以说是`co`模块和生成器函数的语法糖。用更加清晰的语义解决js异步代码。

熟悉`co`模块的同学应该都知道，co模块是TJ大神写的一个使用生成器函数来解决异步流程的模块，可以看做是生成器函数的执行器。而`async/await`则是对`co`模块的升级，内置生成器函数的执行器，不再依赖`co`模块。同时，`async`返回的是`Promise`。

从上面来看，不管是`co`模块还是`async/await`，都是将`Promise`作为最基础的单元，对`Promise`不很了解的同学还是应该回到上一章节搞清楚`Promise`的知识，<font color=#CC99CD>毕竟没有扎实的底层基础，上层建筑是不牢靠的</font>。 

## async-await详解
### 1. Async
<font color=#1E90FF>**① 语法糖**</font>

`async`关键词是添加在函数定义之前的，一个`async`函数是定义会返回`promise`的函数的简便写法。比如，以下两个定义是等效的：
```javascript
function f() {
    return Promise.resolve('TEST');
}

// asyncF is equivalent to f!
async function asyncF() {
    return 'TEST';
}
```
相似地，会抛出错误的`async`函数等效于返回将失败的`promise`的函数：
```javascript
function f() {
    return Promise.reject('Error');
}
// asyncF is equivalent to f!
async function asyncF() {
    throw 'Error';
}
```
<font color=#1E90FF>**② async函数的返回值**</font>

其实`async`返回值有下面这4种情况：

+ <font color=#8A2BE2>（1）返回值是Promise对象</font>

  这种情况是最常见的，也是符合`async`定义的
  ```javascript
  const request = require('request');
  async function f1() {
      return new Promise(function(resolve, reject) {
          request('http://www.baidu.com',function(err, res, body) {
              resolve(body)
          })
      })
  }
  (async function() {
      console.log(f1());
  })()
  ```
+ <font color=#8A2BE2>（2）返回值是普通值</font>

  如果`return`出来一个普通值，会被包装成一个`promise`对象。该`promise`状态为`fullfilled`, 该`promise`的值为该简单值。可以使用`.then()`方法取到该`promise`对象的值（该值就是`async`声明的函数返回来的简单值）
  ```javascript
  async function f1 () {
      return 10;
  }

  console.log(f1());     // Promise {<resolved>: 10}
  fn1().then(function (x) {
    console.log(x);      // 10
  })
  ```
+ <font color=#8A2BE2>（3）返回值是Error类型</font>

  如果`return`出来是一个`Error`类型，则同样会被包装成一个`promise`对象，该`promise`对象的状态是`reject`, 值是`Error`的信息，想取出来该`promise`的报错信息，可以通过`.then`的第二个参数，或者通过`.catch`方法
  ```javascript
  async function f1() {
	throw new Error('ssss');
  }
  f1().catch(function(e){
    console.log(e)
  })
  ```
+ <font color=#8A2BE2>（4）没有返回值</font>

  如果没有`return`任何东西，则同样会返回一个`promise`对象。该`promise`对象的状态为`fullfilled`，该`promsie`的值为`undefined`.
  ```javascript
  const rp = require('request-promise');
  async function f1() {
      await rp('http://www.beibei.com');
  }

  (async () => {
      console.log(await f1());          // undefined
  })()
  ```
  
### 2. Await
`await`关键字，它只能在`async`函数内使用，让我们可以等待一个`promise`。如果在`async`函数外使用`promise`，我们依然需要使用`then`和回调函数，所以，目前取出`promise`对象中的值的方法有两种：<font color=#CC99CD>.then</font> 和 <font color=#CC99CD>await</font>

<font color=#1E90FF>**① 最大的作用**</font>

<font color=#CC99CD>await最大的作用就是代替.then方法,让整个代码成为同步的写法，更容易理解</font> 

+ <font color=#8A2BE2>（1）串行异步</font>

  当串联异步的操作时，`await`要比`.then`方法更加简洁
  ```javascript
  // 使用 .then 进行串联操作
  function asyncFunc() {
    otherAsyncFunc1()
    .then(function(x){
      return otherAsyncFunc2();
    })
    .then(function(x) {
      console.log(x)
    })
  }

  // 使用await关键字
  async function asyncFunc() {
      const result1 = await otherAsyncFunc1();
      const result2 = await otherAsyncFunc2();
  }
  ```
+ <font color=#8A2BE2>（2）并行异步</font>

  虽然并行异步的代码还是离不开`Promise.all`或者`Promise.race`方法，但是用来处理最终的并行结果的代码也是很简洁的
  ```javascript
  // 使用 .then 方法
  function fn1() {
      let p1 = rp('http://www.baidu.com');
      let p2 = rp('http://www.baidu.com');
      Promise.all([p1, p2]).then(function([res1, res2]) {
          console.log(res1,res2)
      })
  }

  // 使用await 关键字
  async function fn1() {
      let p1 = rp('http://www.baidu.com');
      let p2 = rp('http://www.baidu.com');
      let [res1, res2] = await Promise.all([p1, p2]);
      console.log(res1,res2)
  }
  ```
  
<font color=#1E90FF>**② await本质**</font>

从上面我们列出的这么多代码来看，`await`的本质就是`.then`方法的语法糖，事实上，`async/await`其实会翻译成`promise`与`then`回调。每次我们使用`await`，解释器会创建一个`promise`然后把`async`函数中的后续代码（也就是书写在`await`后面的代码）放到`then`回调里，并被计划在`promise`完成之后执行。所以下面两段代码是等价的：
```javascript
// await写法
await foo();         
console.log("hello");

// .then写法
foo().then(() => {
    console.log("hello");
});
```

所以`await`关键字给我们的感觉是会让代码执行到`await`这一行的时候，“暂停执行”，等到异步的操作有了结果，再继续往下执行。那么，问题来了，`await`关键字会阻塞线程吗？不会，因为还是我们上面说的那句话：<font color=#CC99CD>await本质是.then的语法糖</font>, `await`并没有改变`node`的单线程的本质，没有改变`event_loop`的模型，只是方便我们写代码，更快捷，更清晰,如下所示：
```javascript
let p1 = new Promise((resolve,reject)=> {
  console.log(1)
  setTimeout(()=> {
    resolve(6)
  },1000)
})

async function multipleRequestAsync() {
  console.log(3)
  let result = await p1
  console.log(result)
  console.log(7)
}

console.log(2)
multipleRequestAsync()
console.log(4)
console.log(5)
// 1 2 3 4 5 6 7
```
所以，通过上面这一段代码我们就能明白：

<font color=#1E90FF>await关键字不会阻塞node的event_loop的线程。当代码执行到async函数遇到await关键词时，不会继续往下执行,而是会发起异步调用，推入异步任务队列，等待异步的结果，但是此时node线程并不会闲到无所事事，而是继续执行async函数被调用的那一行下面的代码。等到异步操作的结果发生了变化时，将异步结果推入任务队列，event_loop从队列中取出事件，推入到执行栈中。</font> 

## 总结
关于<font color=#3eaf7c>async</font>和<font color=#3eaf7c>await</font>的声明和调用我们总结如下：
+ 如果一个函数通过`async`来声明，则一定可以通过`await`关键字来取到该函数的返回值。
+ 如果一个函数通过`async`来声明，则一定也可以通过`.then()`方法来取到该函数返回的`promise`中的值(因为`return`出来的结果一定是`promise`对象)
+ 如果一个函数没有通过`async`来声明，但只要`return`出现的是`promise`对象 ，则也可以通过`await`来拿到`promise`里面的取值。
+ 如果一个函数没有通过`async`来声明，但只要`return`出来一个`promise`，也可以通过`.then()`拿到`promise`里面值（在没有`async/await`的年代就是这样做的）
+ 如果一个函数通过`async`声明，则在该函数内部可以使用`await`，也可以使用`.then()`
+ 如何一个函数没有通过`async`声明，则在该函数内部不可以使用`await`，但是可以使用`.then()`

上述总结我个人认为你过一遍即可，压根没有必要去记，因为只要你深刻理解的上面的内容，这些总结在你眼里可能就和废话差不多。


**参考资料**
1. [深入理解 ES7 的 async/await](https://juejin.im/entry/58523b908e450a006c4d0c5b)
2. [深入理解async / await](https://juejin.im/post/5b99cbe35188255c930dc74c)
3. [图与例解读Async/Await](https://juejin.im/entry/5a45f3586fb9a0452b498df7)
4. [async/await 优雅的错误处理方法](https://juejin.im/post/5c49eb28f265da613a545a4b)
5. [如何在 JS 循环中正确使用 async 与 await](https://juejin.im/post/5cf7042df265da1ba647d9d1)