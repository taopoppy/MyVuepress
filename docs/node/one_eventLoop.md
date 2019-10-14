# node事件循环

再详细的介绍`Event Loop`之前我们先来说明一下通常的一个概念混淆：<font color=#3eaf7c>事件循环</font>和<font color=#3eaf7c>事件驱动</font>，经常有刚开始的小伙伴会混淆这两个概念，我们上一节已经说过，`libuv`这个库提供两个最重要的东西是事件循环和线程池，两者共同构建了异步非阻塞I/O模型，而事件驱动只是在整个非阻塞I/O模型当中线程池通知事件循环它已经完成I/O操作的这样一种机制而已。

## 六个阶段
`Node.js`启动的时候会初始化由`libuv`提供的事件循环，每次的事件循环都包含6个阶段，这6个阶段会在每一次的事件循环当中按照下图当中的顺序反复执行，如下图：
<img :src="$withBase('/node_eventLoop_six.png')" alt="node事件循环六个阶段">

+ <font color=#CC99CD>timers 阶段</font>：这个阶段执行timer（setTimeout、setInterval）的回调
+ <font color=#CC99CD>I/O callbacks 阶段</font> ：处理一些上一轮循环中的少数未执行的 I/O 回调
+ <font color=#CC99CD>idle, prepare 阶段</font> ：仅node内部使用
+ <font color=#CC99CD>poll 阶段</font> ：获取新的I/O事件, 适当的条件下node将阻塞在这里
+ <font color=#CC99CD>check 阶段</font> ：执行 setImmediate() 的回调
+ <font color=#CC99CD> close callbacks 阶段</font>：执行 socket 的 close 事件回调


<font color=#3eaf7c> 每个阶段都有一个先入先出的（FIFO）的用于执行回调的队列，事件循环运行到每个阶段，都会从对应的回调队列中取出回调函数去执行，直到队列当中的内容耗尽，或者执行的回调数量达到了最大。然后事件循环就会进入下一个阶段，然后又从下一个阶段对应的队列中取出回调函数执行，这样反复直到事件循环的最后一个阶段。而事件循环也会一个一个按照循环执行，直到进程结束。</font>

注意：<font color=#3eaf7c>上面六个阶段都不包括 process.nextTick()</font> (下文会介绍)

接下去我们详细介绍`timers`、`poll`、`check`这3个阶段，因为日常开发中的绝大部分异步任务都是在这3个阶段处理的。

<font color=#3eaf7c>1. timer</font>

`timers`阶段会执行`setTimeout`和`setInterval`回调，并且是由`poll`阶段控制的。
同样，在`Node`中定时器指定的时间也不是准确时间，只能是尽快执行。

<font color=#3eaf7c>2. poll</font>

`poll`是一个至关重要的阶段，这一阶段中，系统会做两件事情
+ 回到`timer`阶段执行回调
+ 执行`I/O`回调
并且在进入该阶段时如果没有设定了`timer`的话，会发生以下两件事情

+ 如果`poll`队列不为空，会遍历回调队列并同步执行，直到队列为空或者达到系统限制
+ 如果`poll`队列为空时，会有两件事发生
  + 如果有`setImmediate`回调需要执行，`poll`阶段会停止并且进入到`check`阶段执行回调
  + 如果没有`setImmediate`回调需要执行，会等待回调被加入到队列中并立即执行回调，这里同样会有个超时时间设置防止一直等待下去

当然设定了`timer`的话且`poll`队列为空，则会判断是否有`timer`超时，如果有的话会回到 timer 阶段执行回调。

<font color=#CC99CD>3. check</font>

`setImmediate`的回调会被加入`check`队列中，从`event loop`的阶段图可以知道，`check`阶段的执行顺序在`poll`阶段之后。

可以看到我们在有关`setImmediate`的知识点很复杂，而且一般在生产环境我们是不推荐使用`setImmediate`的，所以不要死记硬背上面这些东西

## Micro-Task 与 Macro-Task
Node端事件循环中的异步队列也是这两种：`macro`（宏任务）队列和 `micro`（微任务）队列。
+ <font color=#3eaf7c>常见的macro-task</font>：`setTimeout`、`setInterval`、 `setImmediate`、`script（整体代码）`、 `I/O`操作等。
+ <font color=#3eaf7c>常见的micro-task</font>：`process.nextTick`、`new Promise().then`(回调)等。

但是我们要注意有一个很容易混淆的点，就是
+ <font color=#d14>宏任务队列和微任务队列都只是概念，在node当中没有说哪个具体队列名字就叫做宏任务队列，正确的认知应该是前面我们说的事件循环当中的6个阶段对应的6个基本的队列都属于宏队列</font>
+ 比如`timer`阶段对应的是`timer宏队列`，`I/O callback`阶段对应的就是`I/O callback宏队列`,依次类推。

所以事件循环当中的6个宏队列和微队列的关系如下：<font color=#d14>微队列（microtask）在事件循环的各个阶段之间执行，或者说在事件循环的各个阶段对应的宏队列（macrotask）之间执行</font> 
<img :src="$withBase('/node_event_macrotaskandmicrotask.png')" alt="node队列">

但是这里又有一个特别容易混淆的版本改变：
+ <font color=#d14>如果是node10及其之前版本</font>：宏队列当中的有几个宏任务，是要等到宏队列当中的所有宏任务全部执行完毕才会去执行微队列当中的微任务
+ <font color=#d14>如果是node11版本</font>：一旦执行一个阶段里对应宏队列当中的一个宏任务(setTimeout,setInterval和setImmediate三者其中之一，不包括I/O)就立刻执行微任务队列，执行完微队列当中的所有微任务再回到刚才的宏队列执行下一个宏任务。这就跟浏览器端运行一致了

所以下面我们给出的所有实例我们都会给出不同版本`node`执行的结果。

## process.nextTick
这个函数其实是独立于`Event Loop`之外的，它有一个自己的队列，当每个阶段完成后，如果存在`nextTick`队列，就会清空队列中的所有回调函数，并且优先于其他`microtask`执行。

+ <font color=#bl4>执行机制</font>：`process.nextTick`是用于在事件循环的下一次循环中调用回调函数的，将一个函数推迟到代码执行的下一个同步方法执行完毕，或异步事件回调函数开始执行时再执行
+ <font color=#bl4>执行原理</font>：`Node`每一次循环都是一个`tick`，每次`tick`，`Chrome V8`都会从时间队列当中取所有事件依次处理。遇到`nextTick`事件，将其加入事件队尾，等待下一次`tick`到来的时候执行
  <img :src="$withBase('/node_process_nextTick.png')" alt="process_nextTick的执行原理">

我们来演示一下：
```javascript
console.log(1)
Promise.resolve().then(() => {
  console.log('promise one'))
})
process.nextTick(() => {
  console.log('nextTick one')
})

setTimeout(() => {
  process.nextTick(() => {
    console.log('nextTick two')
  })
  console.log(3)
  Promise.resolve().then(()=> {
    console.log('promise two')
  })
  console.log(4)
}, 3);
```
执行结果是：
```javascript
1
nextTick one
promise one
3
4
nextTick two
promise two
```
如果你不知道为什么结果是这样，先不用着急，看完后面的内容然后再回头看这个程序的执行结果，你就会一目了然。

## Node与浏览器的Event Loop差异
<img :src="$withBase('/node_brower_eventLoop.png')" alt="node队列">

+ <font color=#3eaf7c>浏览器环境下，microtask的任务队列是每个macrotask执行完之后执行。</font>
+ <font color=#3eaf7c>而在Node.js中，microtask会在事件循环的各个阶段之间执行，也就是一个阶段执行完毕，就会去执行microtask队列的任务。 </font>

我们通过一个例子来搞清楚事件循环在`Node`和浏览器当中的差异:
```javascript
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)
setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
```
### 1.浏览器的运行过程
在浏览器的运算结果是：<font color=#CC99CD>timer1 => promise1 => timer2 => promise2</font>
<img :src="$withBase('/brower_event_process.gif')" alt="浏览器的执行过程">

### 2. Node的运行过程
Node端运行结果分两种情况：
如果是`node11`版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行微任务队列，这就跟浏览器端运行一致，最后的结果为: <font color=#CC99CD>timer1 => promise1 => timer2 => promise2</font>

如果是`node10`及其之前版本：要看第一个定时器执行完，第二个定时器是否在完成队列中:
如果是第二个定时器还未在完成队列中，最后的结果为: <font color=#CC99CD>timer1 => promise1 => timer2 => promise2</font>

如果是第二个定时器已经在完成队列中，则最后的结果为:
+ <font color=#CC99CD>timer1 => timer2 => promise1 => promise2</font>(下文过程解释基于这种情况下)

<img :src="$withBase('/node_event_process.gif')" alt="Node的执行过程">

+ 全局脚本（main()）执行，将2个`timer`依次放入`timer`队列，main()执行完毕，调用栈空闲，任务队列开始执行；
+ 首先进入`timers`阶段，执行`timer1`的回调函数，打印`timer1`，并将`promise1.then`回调放入`microtask`队列
+ 同样的步骤执行`timer2`，执行`timer2`的回调函数，打印`timer2`，并将`promise2.then`回调放入`microtask`队列
+ 至此，`timer`阶段执行结束，`event loop`进入下一个阶段之前，执行`microtask`队列的所有任务，依次打印`promise1`、`promise2`
+ 进入下一个阶段，但是上述代码过于简单，`timer`后面的5个阶段压根啥都没有，导致本次事件循环基本结束

### 3. 总结
<font color=#d14>对于新版本node11及以后，在只执行浏览器和Node共有的宏任务的时候虽然过程不一样，但结果一样</font>


## 综合实例
我们下面给出一个特别复杂的案例，其中包含`I/O`，我们试着来解读一下
```javascript
const fs = require('fs')
console.log('start')

fs.writeFile('text.txt', '我写的数据', (err) => {
  if (err) throw err;
  console.log('text1');
});

setTimeout(() => {
  console.log('setTimeout 1')
  Promise.resolve()
  .then(()=> {
    console.log('promise 3')
  })
})

setTimeout(() => {
  console.log('setTimeout 2')
  Promise.resolve()
  .then(()=> {
    console.log('promise 4')
    Promise.resolve()
    .then(()=> {
      console.log('promise 5')
    })
  })
  .then(()=> {
    console.log('promise 6')
  })
  .then(()=> {
    fs.writeFile('text1.txt', '我写的数据', (err) => {
      if (err) throw err;
      console.log('text2');
    });
    setTimeout(()=>{
      console.log('setTimeout 3')
      Promise.resolve()
      .then(()=> {
        console.log('promise 7')
      })
      .then(()=> {
        console.log('promise 8')
      })
    }, 1000)
  })
}, 0);


Promise.resolve()
.then(()=> {
  console.log('promise 1')
})
.then(()=> {
  console.log('promise 2')
})
console.log('end')
```
<font color=#CC99CD>**1. 第一次事件循环**</font>

开始将整个程序作为宏任务开始执行，先打印出`start`，然后将`setTimeout 1`和`setTimeout 2`放入`timer Queue`,将`text1`放入`I/O callback Queue`当中，将`promise 1`和`promise 2`放入`microtask Queue`当中，然后打印出`end`

打印出的结果如下：
+ `start`
+ `end`

此时各个队列情况如下：
+ <font color=#3eaf7c>microtask Queue</font>: `promise 1`、`promise 2`
+ <font color=#3eaf7c>timer macrotask Queue</font>: `setTimeout 1`、`setTimeout 2`
+ <font color=#3eaf7c>I/O callback macrotask Queue</font>：`text1`

<font color=#CC99CD>**2. 第二次事件循环**</font>

+ 先清空`microtask Queue`,打印出`promise 1`和`promise 2`
+ 进入`timer`阶段：执行上一次循环当中`timer macrotask Queue`当中的`setTimeout 1`的回调函数，打印出`setTimeout 1`,同时将`promise 3`放入到了`microtask Queue`,因为`node11`版本变化的原因，因为我们在`timer`阶段执行了`setTimeout 1`,属于<font color=#3eaf7c>setTimeout</font>宏任务，所以立马执行了`microtask Queue`中的`promise 3`，打印出`promise 3`
+ 然后回到`timer`阶段执行后面的宏任务`setTimeout 2`，执行它的回调函数，先打印`setTimeout 2`，然后将`promise 4`，`promise 5`,`promise 6`放入`microtask Queue`,然后将`text2`放入了`I/O callback macrotask Queue`当中，特别要注意为什么`setTimeout 3`没有立刻放在`timer macrotask Queue`当中，因为它是延迟一秒的
+ 刚才执行了`setTimeout 2`,它也属于<font color=#3eaf7c>setTimeout</font>宏任务，所以立刻执行了`microtask Queue`中的所有任务，打印出`promise 4`，`promise 5`,`promise 6`
+ 然后进入`I/O callback`阶段，因为当前`I/O callback macrotask Queue`有两个任务，所以分别执行他们的回调函数，打印出`text1`和`text2`
+ 然后跳过`idle prepare`阶段，因为没有这个阶段干的事，进入`poll`阶段就很复杂了，因为此时会回到`timer`阶段，但是我们当前不能完全确定`setTimeout 3`是否在`timer Queue`当中，如果经过前面的`timer`和`I/O callback`阶段后，一秒早过去了，那么此时`setTimeout 3`就在`timer Queue`当中，如果还没有到一秒，好了，直接到下一个事件循环当中

打印出的结果如下：
+ `promise 1`
+ `promise 2`
+ `setTimeout 1`
+ `promise 3`
+ `setTimeout 2`
+ `promise 4`
+ `promise 5`
+ `promise 6`
+ `text1`
+ `text2`

此时各个队列情况如下：
+ <font color=#3eaf7c>microtask Queue</font>: 空
+ <font color=#3eaf7c>timer macrotask Queue</font>: `setTimeout 3`（应该有了）
+ <font color=#3eaf7c>I/O callback macrotask Queue</font>：空

<font color=#CC99CD>**3. 第三次事件循环**</font>

+ 先清空上一次循环遗留的`microtask Queue`,因为没有，所以跳过。
+ 进入`timer`阶段，执行`setTimeout 3`的回调，打印出`setTimeout 3`,然后将`promise 7`和`promise 8`放入了`microtask Queue`当中
+ 因为`setTimeout 3`也属于<font color=#3eaf7c>setTimeout</font>宏任务，所以立刻执行了`microtask Queue`当中的`promise 7`和`promise 8`,打印出`promise 7`和`promise 8`

打印出的结果如下：
+ `setTimeout 3`
+ `promise 7`
+ `promise 8`



**参考资料**
+ [浏览器与Node的事件循环(Event Loop)有何区别?](https://juejin.im/post/5c337ae06fb9a049bc4cd218#heading-13)
+ [狼叔：更了不起的node]()
+ [深入理解js事件循环机制（Node.js篇）](http://lynnelv.github.io/js-event-loop-nodejs)
+ [浏览器和Node不同的事件循环（Event Loop）](https://juejin.im/post/5aa5dcabf265da239c7afe1e#heading-10)
+ [从一道执行题，了解Node中JS执行机制](https://juejin.im/post/5b16a388f265da6e113f7a3d)