# 异步流程初探
`javascript`的异步发展史是十分有趣且坎坷的，其中出现了很多的解决方案，但是我们这里只会讲最重要最实用的两种方案：<font color=#CC99CD>Promise</font>和<font color=#CC99CD>Async-Await</font>

## 回调地狱
由于`Node.js`采用了错误优先的回调写法，所以导致SDK导出的都是回调函数，如果我们组合调用这些函数，经常会出现回调里嵌套回调的问题，这种写法让程序层级和顺序显得很不自然，所以大家都很讨厌这样的写法，如下所示：
```javascript
fs.readFile(A, 'utf-8', function(err, data) {
    fs.readFile(B, 'utf-8', function(err, data) {
        fs.readFile(C, 'utf-8', function(err, data) {
            fs.readFile(D, 'utf-8', function(err, data) {
                //....
            });
        });
    });
});
```

## Promise
`Promise`可以说是对回调地狱的思考和解决方案，可以说是在`Async-Await`出现之前唯一普遍的通用规范，即使到现在，它也是`javascript`异步的基石，其中<font color=#3eaf7c> Promise/A+规范</font> 是业内推行的规范，ES6也采用的这种规范。

`Promise`的要点如下：
+ 递归：每个异步操作返回的都是`Promise`对象
+ 状态机： 三种状态转移，只在`Promise`对象内部可以控制，不能在外部改变状态
+ 全局异常处理

### 1. Promise/A+规范
**1. Promise的定义和使用**

`Promise`的定义几乎都一样，在构造函数里面传入一个匿名函数，参数是`resolve`和`reject`，如果成功执行了`resolve`,那么就会将`resolve`的值传给最近的`then`函数，如果出错执行了`reject`那么就交给`catch`来捕获异常，如下代码：
```javascript
// 定义
var promise = new Promise(function(resolve, reject){
  if(/*everything turned out fine*/) {
    resolve("Stuff worked")
  }else {
    reject(Error("It broke"))
  }
})

// 使用
promise.then(function(res){
  console.log(res)
  return Promise.reject(new Error("故意抛出错误"))
}).catch(function(err) {
  console.log(err)
})
```

**2. Promise的核心**

因为`Promise`是为了解决回调地狱而出现的解决方案，那么我们下面来举例说明`Promise`究竟做了什么，解决了回调地狱中的什么问题：
```javascript
// 回调写法
fs.readFile('./package.json',(err, data)=> {
  if(err) throw err           
  console.log(data.toString())
})

// Promise写法
function hello(file) {
  return new Promise((resolve, reject)=> {
    fs.readFile('./package.json',(err, data)=> {
      if(err) {
        reject(err)
      }else {
        resolve(data.toString())
      }
    })
  })
}

hello('./package.json').then(data=> {
  console.log(data)
}).catch(err=> {
  console.log(err)
})
```
通过上述相同功能代码，我们使用了回调和`Promise`写法，虽然代码好像复杂了很多，但是确实解决了实际问题，<font color=#3eaf7c>因为回调的写法是将异步结果的处理的函数作为了异步执行的参数，所以导致异步结果的处理在异步执行的函数当中，导致两者处于同一层级</font>，这才是为什么如果异步结果处理当中如果还有异步调用就会产生回调地狱，因为始终没有从最外层的异步执行函数跳出来。

而`Promise`是在异步调用外层包了两层，一层`Promise`，一层函数，然后把异步调用的结果包裹在`Promise`的状态中，然后把`Promise`作为函数返回结果，那么异步调用的代码在函数的定义当中，异步结果的处理放在了函数外面的`then`函数当中，从写法上确实根本性的让两者分离。所以`Promise`的核心就是：<font color=#CC99CD>将回调函数中的结果延时到then函数里处理或者交给catch全局异常处理</font>

当然`Promise`还在回调地狱基础上改进一个大的方面就是：<font color=#CC99CD>不让回调里的return和throw变成摆设</font>，如下代码：
```javascript
try {
  fs.readFile('./package.json',function(err,fileContent) {
    if(!!err) { throw Error(err) }
    return fileContent
  })
}catch(e){
  // do something with you error
}
```
首先异步调用的回调函数当中写`return`是没有用的，因为没有人能接受到，其次`try-catch`是捕获同步代码的错误的，你在异步代码的回调当中抛出错误，是`try-catch`捕获不到的，因为错误会被抛到主线程当中，然后程序就挂掉了。

**3. 链式和状态**

如果我们约定每个函数的返回值都是`Promise`对象，那么函数的链式调用就是一种递归的变种思想的应用，只要是`Promise`对象，就可以控制状态并支持`then`方法，将无限个`Promise`对象链接在一起。

为什么能够这样呢？因为每个`Promise`对象都有`then`方法，而`then`方法时定义在原型对象`Promise.prototype`上面的，它的作用就是：<font color=#3eaf7c>为Promise实例添加状态改变时的回调函数</font>，如下所示：
```javascript
Promise.prototype.then = function(sucess,fail) {
  this.done(sucess)
  this.fail(fail)
  return this
}
```
如上所示，其实`then`方法有两个参数：
+ success：<font color=#3eaf7c>fulfiled状态的回调函数</font>
+ fail: <font color=#3eaf7c>rejected状态的回调函数</font>
但是通常我们只会传一个回调函数，不传错误的回调函数，因为使用`catch`来捕获异常比通过`fail`函数进行处理更加可控。而且从上述代码看到了：`then`返回值是`this`对象，这就是为什么可以链式调用的原因，每个方法返回的都是`this`对象，那么久能继续调用`this`对象上的函数并形成链式写法了

关于`Promise`的状态我们也要说明一下，一个`Promise`对象必须处于<font color=#3eaf7c>pending</font>、<font color=#3eaf7c>fulfilled</font>、<font color=#3eaf7c>rejected</font>三者状态之一，切遵循这样一种原则：<font color=#CC99CD>从pending状态可以转化到fulfilled或者rejected状态，但这属于不可逆状态切换，且fulfilled和rejected状态之间不能切换</font>,虽然已经知道这三种状态，但是没有公开的`API`来查询内部的状态

<img :src="$withBase('/promise_status.png')" alt="promise状态">

<font color=#1C86EE>思考问题：then函数不是返回的this么，promise状态已经由pending变化到了fulfilled状态，怎么在then返回的this又是pending状态，到底是在then中return的this是个新的promise，还是说原本的promise的状态又从fulfilled状态变回到了pending状态</font>

<font color=#CC99CD>回答问题：根据当前个人理解，then函数会返回新的Promise，并且包裹住你在then函数当中书写的返回值</font>

### 2. reject和resolve重塑流程
因为`Promise`有了`then`方法，`Promise`得以实现递归写法，但是如何在连续的操作步骤当中完成流程重塑？这个是异步流程当中最核心的问题。

实际上，对于异步流程的重塑我们需要记住一句话：<font color=#3eaf7c>每个独立的操作抽象成独立函数，然后函数的返回值是Promise对象</font>，如下方式：
```javascript
var step1 = function(data) {
  return new Promise((resolve,reject) =>{...})
}
var step2 = function(data) {
  return new Promise((resolve,reject) =>{...})
}

hello().then(step1).then(step2).catch(err=> { console.log(err) })
```
所以这种流程架构写好之后，抽像函数的位置就能变换和交换，这样就能真正在流程链当中随意进行组织了。至于`step1`和`step2`究竟是本文件中的函数还是其他文件的模块，取决于实际情况。

当然在重塑流程中，我们也不能忘记错误处理：<font color=#CC99CD>错误依旧采用全局处理方式，即所有的异步操作都由一个catch来处理</font>

### 3. Promise扩展
虽然我们在上面没有讲`Promise`相关的`API`使用方法，但是其规范和用法很简单，就只包含一个构造函数和六个方法，分别是`reject`,`resolve`,`then`,`catch`,`all`,`race`,这里要特别注意的两个方法：<font color=#3eaf7c> Promise.all </font>和<font color=#3eaf7c> Promise.race </font>,因为这个两个方法处理多个异步调用的时候是并行的，而在`Async`函数当中是无法并行处理的，所以即便在当前`Async-Await`风靡的时候，依旧不得不用`Promise`这两个方法来提高效率。

当然，虽然在过去的`Node`版本当中对`Promise`做的不太好，但是现在已经没有这个问题了，那么有关`Promise`的扩展类库比如<font color=#3eaf7c> q模块 </font>和<font color=#3eaf7c> BlueBird </font>，尤其是后者，应该是`Node.js`世界中性能最好的`Promise/A+`规范的实现，是除了原生`Promise`之外的不二选择。

## Async-Await
我们这里也不会去讲解用法，因为用法也很简单，而且官网会有更详细的用法说明，我们下面只是来讲解一下要点：
+ `async`函数进行异常处理采用的是`try-catch`和`Promise`的错误处理方式，非常强大
+ `await`结合`Promise.race`和`Promise.all`可以很好的处理异步调用的并行处理
+ 虽然`async`是未来的趋势，但是`Promise`是必须要会的，推荐使用`async + Promise`的写法来处理异步流程。