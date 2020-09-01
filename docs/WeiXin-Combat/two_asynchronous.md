# 异步解决方案

## promise
我们在`ES6`当中正式有了异步的`promise`写法，这个`promise`存在三个状态：
+ <font color=#3eaf7c>pending</font>：初始状态
+ <font color=#3eaf7c>fulfilled</font>：成功的状态
+ <font color=#3eaf7c>rejected</font>：失败的状态
这三个状态之间存在很特殊的关系，首先是<font color=#3eaf7c>状态不可逆</font>，就是说一旦`promise`从`pending`到了`fulfilled`或者`rejected`的状态，就不可能再回到过去。也不可能由`fulfilled`变成`rejected`,也不可能再从`rejected`变成`fulfilled`。

我们在`promise`当中有两个很重要的方法: <font color=#3eaf7c>Promise.all</font>和<font color=#3eaf7c>Promise.race</font>：

### 1. promise.all
这个方法实际上是等待所有参数当中的`Promise`都完成之后才会执行下面的操作，我们下面来写一下代码来展现一下：
```javascript
let promiseArr = []
for(let i = 0; i < 5; i++) {
  let time = i * 1000
  promiseArr.push(new Promise((resolve, reject)=> {
    setTimeout(()=> {
      console.log(i)
      i % 2 === 0? resolve(i): reject(i)
    }, time)
  }))
}

Promise.all(promiseArr).then(res => {
  console.log('全部执行完毕')
  console.log(res)
}).catch(err => {
  console.log('失败')
  console.log('err信息',err)
})
```
我们来看一下使用`Promise.all()`成功和失败的结果：
+ 当我们的所有`promise`都正确执行后，就会按照`.then`的方式走程序，打印在控制台的就是`全部执行完毕`和`[0,1,2,3,4]`,因为`res`就是个数组，每个元素都是每个`promise`正确`resolve`的结果。
+ 但是如果在`promiseArr`有一个`promise`执行了`reject`的错误结果，立马`Promise.all()`就走到`catch`这个线路，打印出`失败`还有错误的信息，但是特别要注意，这并不影响后面的`promise`执行，也就是说上述代码最终打印出的结果是：`0 1 失败 err信息 1 2 3 4`

<font color=#3eaf7c>用法场景</font>：
比如我们在小程序中上传9张图片，上传必须等待9个图片都成功返回了`fileId`,我们才能正确将`fileId`保存到数据库当中，但是上传云存储是个异步的过程，我们不知道什么时候会执行完毕，所以我们要使用`promise.all`让9张图片都上传完毕后再执行后面的代码。

### 2. promise.race
`race`这个单词本身的含义是`竞赛`的意思，就是说在多个`promise`同时执行的时候，只有有一个正确返回了，`promise.race`就可以正确执行后面`then`的代码了，如果所有的`promise`都没有正确的返回才会走`promise.race`后面的`catch`路线，我们来举例：
```javascript
let promiseArr = []
for(let i = 0; i < 5; i++) {
  let time = i * 1000
  promiseArr.push(new Promise((resolve, reject)=> {
    setTimeout(()=> {
      console.log(i)
      i % 2 === 0? resolve(i): reject(i)
    }, time)
  }))
}

Promise.race(promiseArr).then(res => {
  console.log('全部执行完毕')
  console.log(res)
}).catch(err => {
  console.log('失败')
  console.log('err信息',err)
})
```
上述代码的执行结果是：`0 全部执行完毕 0 1 2 3 4`,因为第一个`promise`就执行成功了，所以走了`promise.race`后面的`then`的路线，但是这样也并没有影响后面的`promise`执行

<font color=#3eaf7c>用法场景</font>：
我们经常要判断一个请求是否超时可以用到`promise.race`,将请求的`promise`和定时器的`promise`放一起，如果请求先执行了说明没有超时，如果定时器先执行了说明请求已经超时了。

## async和await
<font color=#3eaf7c>es7当中的async和await可以直接在云函数当中使用，但是在小程序端不能直接使用</font>，因为云函数天然是`node`版本为`8.0`以上，所以支持，而小程序端不行，如果要使用必须引入文件。但是这个`bug`好像已经在微信的新版本当中修正了。但是关于`async`和`await`的用法很简单，我们这里举个最简单的例子：
```javascript

  async foo() {
    let res = await this.timeout()
    console.log(res)
  },
  timeout: function () {
    return new Promise ((resolve, reject)=> {
      setTimeout(()=> {
        console.log('我是定时器')
        resolve(1)
      },2000)
    })
  },
```
这种写法十分简洁，好用，而且虽然单词已经不再是`promise`，但是实际上在`JS`异步的知识当中，他们都是和`promise`密不可分的，或者说都是`promise`的语法糖。