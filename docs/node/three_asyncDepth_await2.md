# async-await最佳实践

## 错误处理
### 1. try-catch
因为当我们使用`async-await`的时候我们的代码是同步的写法，同步的错误处理理所应当会先想到的就是`try-catch`，所以对于`async-await`的处理我们可以采用`try-catch`:
```javascript
(async () => {
  const fetchData = () => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              reject('fetch data is me')
          }, 1000)
      })
  }

  try {
    let result = await fetchData()
    console.log(result)
  } catch (error) {
    console.log(error) //fetch data is me
  }
})()
```
实际通过上述的代码可以看到：<font color=#CC99CD>try-catch的方法在对于错误类型单一的情况是简洁又明了的</font>，但是如果是不同的类型错误类型如果我们还采用`try-catch`的方法也不是不行，只能在错误处理的代码上就要分类处理，还不一定能准确知道到底是哪部分出了问题，所以使用`try-catch`在多类型错误的分类和定位上是吃亏的：
```javascript
  try {
    let result = await fsData()        // 读取文件
    let result = await requestData()   // 网络请求
    let result = await readDb()        // 读取数据库
  } catch (error) {
    // 不同的错误进行分类
  }
```

### 2. .then方法
针对`try-catch`的问题我们希望就是<font color=#CC99CD>在有不同类型错误可能出现的情况下我们还是能准确并分别对不同的类型做处理</font>。而`async/await`本质就是`promise`的语法糖，既然是`promise`那么就可以使用`then`函数了
```javascript
(async () => {
  const fetchData = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
          reject('fetch data is me')
      }, 1000)
    })
  }

  const data = await fetchData().then(data => data ).catch(err => console.log(err))
})()
```
当存在不同类型的错误的时候，我们就能分别在对应的不同的`Promise`的链的末尾的`catch`当中书写不同的处理函数
```javascript
const data = await fsData().then(data => data ).catch(err => // 文件读取错误的处理)
const data = await requestData().then(data => data ).catch(err => // 网络请求错误的处理)
const data = await readDb().then(data => data ).catch(err => // 数据库读写错误的处理)
```

### 3. 更优雅的方式
针对上述`then-catch`的方法，如果我们真正拿到实际项目当中去使用的时候，你就发现了真正项目当中的正确结果的处理代码和错误结果的处理代码都可能是一大堆，全部写在链当中会臃肿不堪，所以我们要想方法把处理代码抽离出来：
```javascript
function handleError(err) {
  if(err !== null)
  // 具体处理错误
}
function handleData(data) {
  if(data !== null)
  // 具体处理结果
}
const [err, data] = await fetchData().then(data => [null, data] ).catch(err => [err, null])
handleError(err)
handleData(data)
```

当然了甚至我们都能把`then-catch`单独抽离处来，不同在每一行都写相同的链式代码。这样代码好像会更简单一些,每一行的代码会更短，
```javascript
// 抽离成公共方法
const awaitWrap = (promise) => {
  return promise
    .then(data => [null, data])
    .catch(err => [err, null])
}

const [err1, data1] = await awaitWrap(fsData())
handleFsError(err1)
handleFsData(data1)
const [err2, data2] = await awaitWrap(requestData())
handleHttpError(err2)
handleHttpData(data2)
const [err3, data3] = await awaitWrap(readDb())
handleDbError(err3)
handleDbData(data3)
```
## await并行黑锅
在`async-await`出现后，有一些人仿佛自以为看到了解脱的曙光，开始只使用`async-await`，而和`Promise`相关的`.then`、`.catch`、`.all`、`.race`方法再也没有用过，所以导致了这样一种结果，这些人会在代码运行的时候发现代码运行好像变慢了，有些人还自以为是的解释：“哎呀，async-await本身就是同步写法，会造成线程阻塞，变慢不很正常么？”

面对这些言论，作者必须要在这里为`async-await`正名：<font color=#1E90FF>这种黑锅我不接</font>

因为通过我们前面所有对`async-await`的学习来看，它只是`Promise.resolve`或者`Promise.reject` 和`Promise.then`方法的语法糖，语法糖是什么？简单的说就是不改变本质的情况下改变外表，所以并不能使用`async-await`去代替`Promise`的其他方法，尤其是我们需要并行处理请求代码的时候，很多人在`async-await`没有出现以前是这样写并行代码的：
```javascript
function requestAsync(){
  let start = Date.now()
  let p1 = rp('http://www.baidu.com');
  let p2 = rp('http://www.baidu.com')
  let p3 = rp('http://www.baidu.com')
  let p4 = rp('http://www.baidu.com')
  let p5 = rp('http://www.baidu.com')
  let p6 = rp('http://www.baidu.com')
  let p7 = rp('http://www.baidu.com')
  let p8 = rp('http://www.baidu.com')
  let p9 = rp('http://www.baidu.com')

 Promise.all([p1,p2,p3,p4,p5,p6,p7,p8,p9]).then(res=> {  // 此处可以使用async-await代替
   console.log(res)
 }).catch(err=>{
   console.log(err)
 })
  console.log(Date.now() -start)
}
console.log(before async task)
requestAsync()
console.log(after async task)
```
上述这种并行的代码不但是正确的，而且到今天为止，这种写法也是唯一的，唯一能使用`async-await`能修改上述代码的地方我们也已经标注出来了，只能替换成下面这样，这也是我们最推荐的一种方式
```javascript
try {
  let res = await Promise.all([p1,p2,p3,p4,p5,p6,p7,p8,p9])
  console.log(res)
} catch (error) {
  console.log(error)
}
```
但是那些对`async-await`不求甚解的人是这样改代码的：
```javascript
async function requestAsync(){
  let start = Date.now()
  let p1 = await rp('http://www.baidu.com');
  let p2 = await rp('http://www.baidu.com')
  let p3 = await rp('http://www.baidu.com')
  let p4 = await rp('http://www.baidu.com')
  let p5 = await rp('http://www.baidu.com')
  let p6 = await rp('http://www.baidu.com')
  let p7 = await rp('http://www.baidu.com')
  let p8 = await rp('http://www.baidu.com')
  let p9 = await rp('http://www.baidu.com')
}
console.log(before async task)
requestAsync()
console.log(after async task)
```
这种改法就是彻彻底底把并行代码改成了串行代码，本来并行应该是所有请求是同时开始的，但是返回时间是不确定的。而经过上述的改法后就成串行了，也就是每个请求都必须在上一个请求结果返回后才开始，或者说每个请求都被写在了上一个`Promise`的`then`方法中，那程序怎么可能不慢，所以这里我想说的就是：
+ <font color=#1E90FF>await本身没有错，错的是那些滥用await的人</font>（或者说武功本身没有错，错的是习武之人）

## 循环中的使用
关于循环当中使用`async-await`，这里就不做介绍了，因为感觉很简单，参考[如何在 JS 循环中正确使用 async 与 await](https://juejin.im/post/5cf7042df265da1ba647d9d1)这篇文章即可，但是实际上你看完就会发现也没有什么注意的东西，只是在这里我们都要很注意一个东西就是：
+ <font color=#CC99CD>无论什么情况，当你想用async-await代替promise的时候，都要考虑是否会影响并行和串行的本质</font> 

**参考资料**
1. [深入理解 ES7 的 async/await](https://juejin.im/entry/58523b908e450a006c4d0c5b)
2. [深入理解async / await](https://juejin.im/post/5b99cbe35188255c930dc74c)
3. [图与例解读Async/Await](https://juejin.im/entry/5a45f3586fb9a0452b498df7)
4. [async/await 优雅的错误处理方法](https://juejin.im/post/5c49eb28f265da613a545a4b)
5. [如何在 JS 循环中正确使用 async 与 await](https://juejin.im/post/5cf7042df265da1ba647d9d1)