# 实战技术预研 - 异步

## 非阻塞I/O

1. <font color=#DD1144>I/O即Input/Output，一个系统的输入和输出</font> 
2. <font color=#DD1144>阻塞I/O和非阻塞I/O的区别就在于系统接收输入再到输出期间，能不能接收其他输入</font>

基本上最重要的概念已经列举出来，我们现在要举例子来说明：  

<font color=#1E90FF>**① 排队打饭VS餐厅点菜**</font>

对于我们点菜人员：
+ <font color=#CC99CD>系统</font> = <font color=#CC99CD>食堂阿姨/服务生</font>，<font color=#CC99CD>输入</font> = <font color=#CC99CD>（客人）点菜</font>、<font color=#CC99CD>输出</font> = <font color=#CC99CD>端到菜</font>

+ 排队打饭是阻塞I/O：食堂阿姨在每个学生点菜到端到菜走后这个期间是不能给别的同学打饭的，或者说对于学生来讲，在前面的人没有端到菜之前，你是不能叫阿姨给你打饭的
+ 餐厅点菜是非阻塞I/O：服务生点完菜就可以服务其他人，对于客人来讲，在点菜和菜端上来的期间，服务生可以接受其他客人的点菜

那实际上理解非阻塞I/O的要点就在于：
+ <font color=#DD1144>确定一个进行Input/Output的系统</font>
+ <font color=#DD1144>思考在I/O的过程中，能不能进行其他I/O</font>

好比上面的这个吃饭的例子，如果你不能清楚的把食堂阿姨和服务生看成I/O系统，而把整个饭店或者厨师看成系统，你就会走入误区，觉得无论怎样对于吃饭的人都要等待，好像没有什么区别。<font color=#1E90FF>所以在真正的Node程序当中我们去理解非阻塞I/O的关键就是划分出一个边界，这个边界就是一个Node.js单线程,如下图，整个绿色边框中的东西，包括applicaiton、v8、还有libuv当中的事件循环都在一个node单线程当中，可以看成是食堂阿姨或者服务生</font>，<font color=#CC99CD>而橘色中包裹的其他C++线程就好比是很多的厨师</font>
<img :src="$withBase('/node_shijianxunhuanjizhi1.png')" alt="node事件循环"> 

## 异步编程 - callback
```javascript
try {
  interview(function() {
    console.log('smile')
  })
} catch (error) {
  console.log('cry',error)
}

function interview(callback) {
  setTimeout(()=> {
    if(Math.random() < 0.5) {
      callback('success')
    } else {
      throw new Error('fail')
    }
  },500)
}
```
上述代码的重点完全不在`callback`上面，而是在我们虽然使用了`try-catch`去包裹了`interview`函数，但是依旧抛出的错误不会被`catch`捕获到，而是抛到了全局。我们来解释一下：
+ <font color=#DD1144>在调用栈当中抛出的错误会按照栈底方面走下去，被栈底方向的try-catch捕获</font>
+ <font color=#DD1144>每一次事件循环都会开启一个全新的调用栈</font>
<img :src="$withBase('/node_howtoknowtrycatch.png')" alt="trycatch和调用栈">   

所以`setTimeout`的回调函数在新的调用栈当中，而且在栈底，本次的调用栈中没有`try-catch`包裹也就没有办法捕获到抛出的错误，所以我们要改进一下写法：
```javascript
interview(function(err,res) {
  if(res) {
    return console.log('cry')
  }
  console.log('smile')
})

function interview(callback) {
  setTimeout(()=> {
    if(Math.random() < 0.5) {
      callback(null, 'success')
    } else {
      callback(new Error('fail'))
    }
  },500)
}
```

通过上面的简单`callback`事例我们能很清楚的看到回调函数格式规范叫做：<font color=#1E90FF>error-first callback</font>，或者<font color=#1E90FF>Node-style callback</font>,通俗的叫做<font color=#DD1144>错误优先的写法</font>。

## 异步编程 - promise
`promise`的理解有两个方面：
+ <font color=#1E90FF>当前事件循环达不到的结果，但未来的事件循环会给到你结果</font> 
+ <font color=#1E90FF>是一个状态机（pending、fulfilled/resolved、rejected）</font> 

```javascript
(function() {
  var promise = new Promise(function(resolve,reject) {
    setTimeout(()=> {
      resolve()
    },500)
  }).then((res)=> {
    console.log(res)
  }).catch((error)=>{
    console.log(error)
  })

  console.log(promise)

  setTimeout(()=> {
    console.log(promise)
  },500)
})()
```
一般我们这样的写法在`node`环境下是看不出`promise`的状态的，我们可以把代码粘贴到`Chrome`当中去运行，结果如下：
```javascript
Promise {<pending>}
Promise {<resolved>: undefined}
```

所以我们总结一下`promise`当中`then`和`catch`方法：
+ <font color=#DD1144>resolved状态的Promise会回调后面的第一个then方法 </font>
+ <font color=#DD1144>rejected状态的Promise会回调后面的第一个catch方法</font>
+ <font color=#DD1144>任何一个rejected状态且会后面没有.catch的Promise,都会造成浏览器/node环境的全局错误</font>
+ <font color=#DD1144>执行then和catch会返回一个新的Promise，该Promise的最终状态根据then和catch的回调函数的执行结果决定：</font>
  + <font color=#DD1144>如果回调函数最终是throw,该Promise是rejected状态</font>
  + <font color=#DD1144>如果回调函数最终是return,该Promise是resolve状态</font>
  + <font color=#DD1144>如果回调函数最终return了一个Promise,该Promise会和回调函数return的Promise状态保持一致</font>

## 异步编程 - async
```javascript
console.log(async function(){
  return 4
}())

console.log(function() {
  return new Promise(resolve => {
    resolve(4)
  })
}())
```

如上代码所示，两个结果一模一样，都是`Promise <resolved 4>`,所以我们就知道了`async`这个东西表面上很神奇，其实它的本质如下：
+ <font color=#DD1144>async是Promise的语法糖封装，准确的说是 new Promise.resolve()方法的封装</font>

然后我们再来看看`await`,这个能让`async`变成同步写法的东西：
```javascript

(function(){
  const result = async function() {
    try {
      var content = await new Promise((resolve,reject)=> {
        setTimeout(()=> {
          reject(new Error('8'))
        },500)
      })
    } catch (e) {
      console.log('error',e.message)
    }

    console.log(content)
    return 4
  }()

  setTimeout(() => {
    console.log(result)
  },800)
})()
```
上面代码非常关键的一点就是：<font color=#DD1144>最开始我们说的下次事件循环的调用栈中的错误是捕获不到，通过await修饰后，就能变的可以捕获到错误</font>，所以这个时候我们来说一下`await`用法的关键所在：
+ <font color=#DD1144>await关键字可以暂停 async function 的执行</font>
+ <font color=#DD1144>await关键字可以以同步的写法获取Promise的执行结果</font>
+ <font color=#DD1144>try-catch可以捕获到await所得到的错误</font>
