# 性能工具 - 实际代码优化

## 优化分析
```javascript
app.use(
  mount('/', async (ctx) => {
      ctx.body = fs.readFileSync(__dirname + '/source/index.html', 'utf-8')
  })
);
```

针对我们原来的代码，我们进行`localhost:3000/download/`进行测试，结果如下

<img :src="$withBase('/node_bff_youhua_reasult1.png')" alt="分析结果">

<img :src="$withBase('/node_bff_youhua_result2.png')" alt="分析结果">

从上面的`cpu`结果看，我们原有的代码有两个大的问题，
+ 第一所有用户进来都要重新读取`html`文件，因为这里是下载页，无论谁来访问都是这个页面，所以其实我们可以把读取的结果拉到外面去，让它在程序启动的时候就读取出来，每个用户进来只需要拿结果，不需要每个人访问都要重新读取
+ 第二就是关于`buffer`的操作很频繁，我们来思考一下，因为`Node`底层是`C++`，所以即使你给`http`的`body`赋值了一个字符串，在`Node`运行的时候还是要转化成为`Buffer`才能输出出去，因为要转化成为`C++`认识的结构。所以我们通过文件读取出来的是字符串，字符串还要转化成为`buffer`，我们直接读取`buffer`不就完事了，而且`fs.readFile`读取的本身就是`Buffer`，所以我们原有的代码就是多此一举。

所以我们修改代码如下：
```javascript
const buffer = fs.readFileSync(__dirname + '/source/index.html')
app.use(
  mount('/', async(ctx) => {
    ctx.status = 200
    ctx.type = 'html'
    ctx.body = buffer
  })
)
```
我们这里做的就是把读取同一个文件的操作拿了出去，然后主动告诉`ctx.type`的返回类型，因为`koa`识别到我们返回的是`buffer`可能会执行下载操作。所以这样优化之后我们的`qps`还有吞吐量都会上去，因为每个用户不用去执行读取文件的操作，只需要拿结果就好。

##  内存管理优化
这里我们先简单介绍一下垃圾回收，因为`GC`和`V8`的联系紧密，如果想深度了解垃圾回收和`V8`的机制，建议到[核心模块 - v8](https://www.taopoppy.cn/node/two_module_v8.html)去研究一下。

`js`引擎会记录所有我们创建的`javascript`对象，隔一段时间就会去定时清理没有再被使用的`javascript`对象。每一个`javascript`引擎的垃圾回收机制都是不一样的，我们这里就以`V8`为例，它会把堆内存分为<font color=#DD1144>新生代</font>和<font color=#DD1144>老生代</font>，新创建的`javascript`变量都会先分配到新生代当中，等新生代快要满的时候就会执行快速的垃圾回收，腾出空间给新的`javascript`对象使用，如果经过几轮的快速的垃圾回收，有些`javascript`变量都没有被清理，它就会进入老生代区域，老生代的内存更大，垃圾清理的频率会更低。整个这个过程就是简单的`V8`垃圾回收机制。

那么对我们优化来说有什么作用呢，其实不管新生代还是老生代，都满足一个规律就是：<font color=#1E90FF>放在里面的内存越少，垃圾回收的速度就越快</font>，所以我们要注意减少内存的使用，另外内存泄漏也是关键的地方，<font color=#1E90FF>因为内存一旦泄露，就会长期处于老生代，然后老生代的垃圾回收每次都要遍历这段泄露的大内存，导致垃圾回收的速度减慢。</font>,我们下面来研究一个内存泄漏的情况：
```javascript
const buffer = fs.readFileSync(__dirname + '/source/index.htm')
app.use(
  mount('/', async(ctx) => {
    ctx.status = 200
    ctx.type = 'html'
    ctx.body = buffer
    leak.push(buffer.toString())
  })
)
const leak = []
```
上述代码，我们看到用户的每次请求的字符串都被保存在一个`leak`的数组当中，然后我们来用`ab`测试一下，采用上一小节的那个内存检测的方法来进行检测，我们快照了程序运行中的内存和程序结束后的内存，然后进行比较

<img :src="$withBase('/node_bff_ab_memory.png')" alt="内存检测">

可以看到在`Profiles`当中，快照1是程序运行时的内存检测为208M，而到了程序结束就有1282M,这个显然有内存没有释放,接着看到在整个的`Constructor`当中，`(string)`的`Size Delta`相对于其他特别大，打开一看全是`html`文件的字符串，点击任意其中一个，看到在`Object`当中能够看到这些字符串的持有者为<font color=#DD1144>leak</font>,所以你到程序中一看，原来是`leak`数组没有被释放，这下你就知道内存的问题了


## 多进程优化


## 优化总结
<font color=#1E90FF>**① 计算**</font>  

+ <font color=#DD1144>减少不必要的计算</font>
  + 比如前端优化我们会把小图合成大图，减少`http`页面总请求数量，减少`TCP`断链，`http`编解包和图片编解码的消耗
  + 空间换时间（重复计算的结果进行缓存，直接使用计算结果）
  （<font color=#1E90FF>多以对于这条准则我们需要仔细的在整个http请求的过程中思考这个计算是不是必要，能不能拿到别的地方去计算</font>）
+ <font color=#DD1144>提前计算</font>
  + <font color=#1E90FF>尽量将服务阶段的计算拿到启动阶段，避免在运行中间件中进行计算</font>

<font color=#1E90FF>**② 内存**</font>

+ <font color=#DD1144>减少内存的使用</font>
  +<font color=#1E90FF></font>
+ <font color=#DD1144>必须要检查内存是否存在泄露</font>

<font color=#1E90FF>**③ 进程**</font>



**参考资料**

1. [苏宁Nodejs性能优化实战](https://blog.csdn.net/weixin_34417635/article/details/89121296)
2. [打造高性能Node服务器](http://www.imooc.com/article/292954)
3. [记一次Node项目的优化](https://www.imooc.com/article/34378)
4. [(阿里国际UED)唯快不破，让nodejs再快一点](https://juejin.im/entry/5a56d1db6fb9a01cc1223c6d)