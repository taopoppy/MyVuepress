# Promise知识点详解

## 六大方法
### 1. Promise.resolve
静态方法`Promise.resolve(value)`可以认为是`new Promise()`方法的快捷方式,比如`Promise.resolve(42)`可以认为是以下代码的语法糖:
```javascript
new Promise(function(resolve){
  resolve(42)
})
```
这个静态方法会让`Promise`对象立即进入确定（即resolved）状态，并将42传递给后面`then`里所指定的`onFulfilled`函数。作为`new Promise()`的快捷方式，在进行`Promise`对象的初始化或者编写测试代码的时候都非常方便。

简单总结一下`Promise.resolve`方法的话，<font color=#CC99CD>它的作用就是将传递给它的参数填充（Fulfilled）到promise对象后并返回这个promise对象</font>。


### 2. Promise.reject
`Promise.reject(error)`是和`Promise.resolve(value)`类似的静态方法，是`new Promise()`方法的快捷方式。比如`Promise.reject(new Error("出错了"))`就是下面代码的语法糖形式:
```javascript
new Promise(function(resolve,reject){
    reject(new Error("出错了"));
});
```
简单总结一下`Promise.reject`方法的话：<font color=#CC99CD>它的功能是调用该promise对象通过then指定的onRejected函数，并将错误（Error）对象传递给这个onRejected函数</font>

### 3. Promise.then
<font color=#1E90FF>**① 回调函数异步执行**</font>

我们先来看一段代码：
```javascript
var promise = new Promise(function (resolve){
    console.log("inner promise"); // 1
    resolve(42);
});
promise.then(function(value){
    console.log(value); // 3
});
console.log("outer promise"); // 2
```
按照我们之前对`Promise`的理解，当我们看到`Promise`对象立刻进入`resolve`状态，是不是就会触发`Promise.then`中方法执行呢？答案是肯定的，但是要注意：<font color=#CC99CD>.then中指定的方法调用是异步执行的</font>，换句话说状态的改变是异步的触发`Promise.then`当中的函数执行的。这个并不是什么新鲜的知识点，你可以回去看，我们当初是把`Promise.then`方法归类到了微任务，而不是`Promise`本身或者`Promise`的其他方法。

至于为什么`Promise`在异步回调函数当中统一采用异步调用的原因，其实是来自实践的结果，在过去大量的实践中发现如果是同步调用，代码书写的位置和顺序会和预期不符，还会导致栈溢出或者异常处理错乱等问题，所以在`Promise/A+`统一规定：<font color=#CC99CD>Promise只能使用异步调用方式</font>

<font color=#1E90FF>**② 返回值**</font>

不管你在回调函数`onFulfilled`中会返回一个什么样的值,或者不返回值，该值都会由`Promise.resolve(return的返回值)`进行相应的包装处理，因此，<font color=#CC99CD>最终then的结果都是返回一个新创建的promise对象</font> 

也就是说，<font color=#3eaf7c>Promise.then不仅仅是注册一个回调函数那么简单，它还会将回调函数的返回值进行变换，创建并返回一个promise对象</font>。正是`then`函数中有了这样返回值的机制，才能使得在整个`Promise`链式结构当中，每个`then`方法都能给下一个`then`方法传递参数。现在我们怎么知道返回的`Promise`是之前的还是新的？另外该`Promise`的状态又是如何？
```javascript
var aPromise = new Promise(function (resolve) {
  resolve(100);
});
var thenPromise = aPromise.then(function (value) {
  console.log(value);
});
var catchPromise = thenPromise.catch(function (error) {
  console.error(error);
});
console.log(aPromise !== thenPromise); // => true
console.log(thenPromise !== catchPromise);// => true
console.log(aPromise, thenPromise, catchPromise) // Promise { 100 } Promise { <pending> } Promise { <pending> }
```
从上面的结果来看，<font color=#CC99CD>实际上不管是then还是catch方法调用，都返回了一个新的promise对象。</font>

<font color=#1E90FF>**③ promise穿透**</font>

我们先来举个例子：
```javascript
Promise.resolve('foo').then(Promise.resolve('bar')).then(function (result) {
  console.log(result);
});
```
如果你认为输出的是 bar，那么你就错了。实际上它输出的是 foo！

产生这样的输出是因为你给`then`方法传递了一个非函数（比如`promise`对象）的值，代码会这样理解：`then(null)`，因此导致前一个`promise`的结果产生了坠落的效果,也就是和下面的代码是一样的，代码直接穿透了`then(null)`进入了下一层链：
```javascript
Promise.resolve('foo').then(null).then(function (result) {
  console.log(result);
});
```
随便添加任意多个`then(null)`，结果都是不变的

### 4. Promise.catch
<font color=#1E90FF>**① 语法糖的本质**</font>

这里我们再说一遍，实际上`Promise.catch`只是`promise.then(undefined, onRejected)`方法的一个别名而已。 也就是说，这个方法用来注册当`Promise`对象状态变为`Rejected`时的回调函数。可以看下面代码，两者写法是等价的，但是很明显`Promise.catch`会让人第一眼看上去不会眼花缭乱：
```javascript
// 第一种写法
Promise.resolve()
.then( (data) => console.log( data ) )
.then( undefined, (err) => console.log( err ))

// 第二种写法
Promise.resolve()
.then( (data) => console.log( data ) )
.catch( (err) => console.log( err ) ) 
```
那么现在我们来说说为啥推荐使用第二种写法而不是第一种：
+ 使用`promise.then(onFulfilled, onRejected)`的话,在`onFulfilled`中发生异常的话，`onRejected`中是捕获不到这个异常的。而且如果链很长的情况，每一条链上都要这样写。
+ 在`promise.then(onFulfilled).catch(onRejected)`的情况下`then`中产生的异常能在`.catch`中捕获。`.then`和`.catch`在本质上是没有区别的，需要分场合使用。

<font color=#1E90FF>**② 只有一个主人**</font>

我们上面已经说过了，在书写很长的`Promise`链式，从代码清晰度和简易程度来讲，在最后添加`catch`是远远比在每一层链上写`onRejected`回调函数是要好的，因为`catch`函数可以捕获`Promise`链中每一层节点中的错误，这句话本身没有错，但从这句话延伸出一种错误的理解：`catch`同时监控着所有节点。实际上<font color=#CC99CD>catch函数在同一个时间点只属于某一个Promise，因为它的主人是随着程序的执行而不断变化的</font>，我们来举个例子：
```javascript
let p1 = new Promise((resolve,reject)=> {
  // 第一层具体执行逻辑
  resolve(1)           // Promise(1)
}).then(res=>{
  // 第二层具体执行逻辑
  return 2             // Promise(2)
}).then(res =>{
  // 第三层具体执行逻辑
  return 3             // Promise(3)
}).catch(err=>{
  console.log(err)
})
```
在上述例子中，如果整个程序是每一步都正确执行，那么会顺序产生3个`Promise`对象，分别是`Promise(1)`，`Promise(2)`，`Promise(3)`：
+ 可是如果在第一层具体执行逻辑出错了后，那实际上后面的两个`then`中的回调函数压根不会被异步触发执行，所以直接会异步触发`catch`中的回调函数执行，所以这种情况下`catch`是`Promise(1)`对象的`catch`。
+ 如果第一层具体执行逻辑正确执行，就会异步触发第二个`then`中的回调函数执行，那么同理，在第二层具体执行逻辑抛错，会导致`Promise(2)`的状态变化，异步触发`catch`中的回调函数执行，所以这种情况下`catch`是`Promise(2)`对象的`catch`。
+ 同理`Promise(3)`也是如此。

总结下来就是： <font color=#3eaf7c>整个Promise链中，catch只属于异步触发它当中回调函数执行的那个Promise，并不属于所有Promise</font>

### 5. Promise.all
`Promise.all`接收一个`promise`对象的数组作为参数，当这个数组里的所有`promise`对象全部变为`resolve`或`reject`状态的时候，它才会去调用`.then`方法。

传递给`Promise.all`的`promise`并不是一个个的顺序执行的，而是同时开始、并行执行的,我们可以举个例子:
```javascript
let arr = [1000, 3000, 5000, 7000]
let promiseArr = []

for(let i = 0; i < arr.length; i++ ) {
  let newPromise = new Promise((resolve, reject) => {
    setTimeout(()=> {
      console.log(arr[i])
      resolve(arr[i])
    }, arr[i])
  })
  promiseArr.push(newPromise)
}

Promise.all(promiseArr).then(res => {
  console.log(res)
}).catch(err =>{
  console.log(err)
})
```
为什么从这个例子能看出数组当中的`Promise`是并行的？因为所有`Promise`执行完只用了7秒，如果4个`Promise`是按顺序执行的，那么应该是16秒，或者在7-16之间，因为4个`Promise`并不是同时执行的，同时执行的话总时间就是那个花费时间最长的`Promise`

当然还有一个很重要的点，就是如果所有的`Promise`中只有一个执行错误，那么整个`Promise.all`不会走`Promise.all().then()`这个流程了，而是走`Promise.all().catch()`这个流程，但是要注意的是<font color=#3eaf7c>虽然走到了Promise.all().catch()这个流程，但是不影响其他Promise的正常执行</font>

### 6. Promise.race
`Promise.race`的使用方法和`Promise.all`一样，接收一个`promise`对象数组为参数。`Promise.race` 只要有一个promise对象进入`FulFilled`或者`Rejected`状态的话，就会继续进行后面的处理。这里依旧有两个点要注意：
+ 和`Promise.all`一样是所有数组当中的`Promise`是同时并行的
+ `Promise.race`在第一个`promise`对象变为`Fulfilled`之后，并不会取消其他`promise`对象的执行
下面我们来举个例子：
```javascript
let arr = [1000, 3000, 5000, 7000]
let promiseArr = []

for(let i = 0; i < arr.length; i++ ) {
  let newPromise = new Promise((resolve, reject) => {
    if(i === 0) { 
      reject(new Error('第二个错误')) 
    } else {
      setTimeout(()=> {
        console.log(arr[i])
        resolve(arr[i])
      }, arr[i])
    }
  })
  promiseArr.push(newPromise)
}

Promise.race(promiseArr).then(res => {
  console.log(res)
}).catch(err =>{
  console.log(err)
})
// 控制台报错
// 3000
// 5000
// 7000
```
这里我们再复习一下`Node`当中事件循环的知识：
+ 第一层循环：i为0的时候异步触发了`Promise.race().catch()`，这里面的回调代码被放在了微队列当中，后面的3个`setTimeout`宏任务的回调函数代码被放在了`timer`阶段中的队列当中（其实并不是这样，因为3个定时器都有延迟，都是在后面的事件循环中添加进来的）
+ 第二层循环：清空微任务队列，所以控制台打印出了错误，然后清空宏任务，分别打印出3000，5000，7000

## 错误捕获

### 1. 使用reject而不是throw
在最开始我们先来一句比较重要的话：<font color=#CC99CD>Promise的构造函数，以及被then调用执行的函数基本上都可以认为是在 try...catch 代码块中执行的，所以在这些代码中即使使用throw ，程序本身也不会因为异常而终止。</font>

所以其实如果在`Promise`中使用`throw`语句的话，会被`try...catch`住，最终`promise`对象也变为`Rejected`状态。但是我们为什么还是推荐使用`Promise.reject`呢？有下面俩个原因：
+ <font color=#1E90FF>我们很难区分throw 是我们主动抛出来的，还是因为真正的其它异常导致的</font>
+ <font color=#1E90FF>Promise构造函数当中通过throw抛出的错误未必会被Promise.catch捕获到</font>

我们下面就说说什么时候通过throw抛出的错误未必会被Promise.catch捕获到：
```javascript
var p1 = new Promise(function(resolve, reject) {
  setTimeout(() => {
      throw Error('async error')   
  })
})
.then(res => {
  console.log(res)
  console.log('程序正常执行了')
})
.catch(err => {
  console.log(err)
  console.log('捕获到错误了')
})
// 直接报错
```

这个例子非常典型，想知道为什么错误没有被catch住，我们要倒推出原因：
+ 首先我们要明确的是，<font color=#3eaf7c>不论是then还是catch中注册的回调函数，都是由Promise状态的变化触发的</font>，现在也就说`Promise`状态始终在`pending`状态
+ 其次，前面不是说`reject`和`throw`都能最终让`Promise`进入`onReject`状态么，这里的`throw`为什么没有改变`Promise`的状态
+ 原因还是要从事件循环来说，我们好好想想，这段代码在第一轮的事件循环当中`setTimeout`的回调函数被放在了`timer`阶段的队列当中，但是它没有执行啊，所以第一轮`Promise`状态一直处于`pending`，所以`then`和`catch`部分的代码全部没有被触发，也就在第一轮事件循环当中跳过了。然后在第二轮循环当中才执行了`throw`语句，把错误直接抛到了全局，就直接报错。所以上面的代码和下面的效果一样，`catch`怎么可能捕获到在它后面执行的代码呢？
```javascript
var p1 = new Promise(function(resolve, reject) {
})
.then(res => {
})
.catch(err => {
})
throw Error('async error')   
```

### 2. 在then中进行reject
如果我们想在`then`当中使用`reject`,首先我们要懂两个知识点：
+ `then`中的回调函数中，`return`的返回值类型不光是简单的字面值，还可以是复杂的对象类型，比如`promise`对象等
+ 只要修改这个返回的`Promise`的状态，在下一个`then`中注册的回调函数中的`onFulfilled`和`onRejected`的哪一个会被调用也是能确定的

所以我们可以这样写代码就能在`then`当中使用`reject`：
```javascript
var onRejected = console.error.bind(console);
var promise = Promise.resolve();
promise.then(function () {
    var retPromise = new Promise(function (resolve, reject) {
       reject(new Error("this promise is rejected"));
    });
    return retPromise;
}).catch(onRejected);
```
当然还能更简洁一些：
```javascript
promise.then(function () {
    return Promise.reject(new Error("this promise is rejected"));
}).catch(err=>{
  console.log(err)
});
```

## 返回值
关于返回值的知识其实我们在前面都已经讲过，这里总结一下并举个例子巩固一下：
+ <font color=#3eaf7c>Promise会将最后的值存储起来，如果在下次使用promise方法的时候回直接返回该值的promise。</font>
+ <font color=#3eaf7c>Promise能够链式调用的原因是它的每一个方法都返回新的promise，哪怕是finally方法，特殊的是finlly会返回上一个promise的值包装成的新promise，并且finally也不接收参数，因为无论Promise是reject还是fulfill它都会被调用。</font>

下面我们举个例子：
```javascript
var p1 = new Promise(function(resolve, reject) {
  reject(1)
}).catch(err => {
  console.log(err)
  return 2
})

setTimeout(() => {
  p1.then(res => console.log(res))
}, 1000)
// 先打印出1
// 一秒之后打印出2
```
这个例子也很经典，即使你已经搞清楚了上面的知识点，面对这个例子也还是会蒙掉，我们来说一下：
+ 首先通过构造函数创建了一个`Promise`,我们这里称之为`Promise_1`,通过`reject`进入`catch`函数，然后注意，`catch`的回调函数返回了一个2，实际上这里是返回了一个新的`Promise`,我们这里称`Promise_2`，它的状态是`fulfilled`。
+ 所以这里很迷惑人的一点就是`p1`最开始是指向`Promise_1`的，当`Promise_2`返回的时候，它又指向了`Promise_2`
+ 最后定时器经过一秒打印出2，因为`Promise_2`在被返回的时候就是`fulfilled`状态，`then`函数当中的回调函数自然而然的被异步触发。


**参考资料**
1. [JS 异步工具之 --Promise ](https://juejin.im/entry/58650a7a128fe1006d132b80)
2. [JavaScript Promise迷你书（中文版）](http://liubin.org/promises-book/)
3. [面试官眼中的Promise](https://juejin.im/post/5c233a8ee51d450d5a01b712)
4. [谈谈使用 promise 时候的一些反模式](https://efe.baidu.com/blog/promises-anti-pattern/)
5. [深入理解 Promise (上)](https://juejin.im/entry/5844c8e461ff4b006b9e2ebd)
6. [从手写一个符合Promise/A+规范Promise来深入学习Promise](https://juejin.im/post/5b854f22e51d4538e567b7de)
7. [Promise深度学习---我のPromise/A+实现](https://juejin.im/post/5a59e78ff265da3e3e33ba6e)
8. [深入 Promise(一)——Promise 实现详解 ](https://juejin.im/entry/58a10aa61b69e60059d1d2af)

