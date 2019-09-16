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


### 2. Promise的API方法

### 3，node当中的Promise

## Async-Await