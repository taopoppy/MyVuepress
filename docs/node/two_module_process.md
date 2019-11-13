# 核心模块 - process

## 进程和线程
### 1. 进程和线程
<font color=#DD1144>进程（Process）是计算机中的程序关于某数据集合上的一次运行活动，是系统进行资源分配和调度的基本单位，是操作系统结构的基础，</font>

进程是线程的容器（来自百科）。我们启动一个服务、运行一个实例，就是开一个服务进程，例如`Java`里的`JVM`本身就是一个进程，`Node.js`里通过`node app.js`开启一个服务进程，<font color=#1E90FF>多进程就是进程的复制（fork），fork出来的每个进程都拥有自己的独立空间地址、数据栈，一个进程无法访问另外一个进程里定义的变量、数据结构，只有建立了IPC通信，进程之间才可数据共享。</font>

<font color=#DD1144>线程是操作系统能够进行运算调度的最小单位，首先我们要清楚线程是隶属于进程的，被包含于进程之中。一个线程只能隶属于一个进程，但是一个进程是可以拥有多个线程的。</font>

同一块代码，可以根据系统CPU核心数启动多个进程，每个进程都有属于自己的独立运行空间，进程之间是不相互影响的。<font color=#1E90FF>同一进程中的多条线程将共享该进程中的全部系统资源，如虚拟地址空间，文件描述符和信号处理等。但同一进程中的多个线程有各自的调用栈（call stack），自己的寄存器环境（register context），自己的线程本地存储（thread-local storage)</font>

线程又有单线程和多线程之分，具有代表性的JavaScript、Java 语言。

### 2. 单线程和多线程
<font color=#DD1144>单线程就是一个进程只开一个线程，想象一下一个痴情的少年，对一个妹子一心一意用情专一。</font>

Javascript 就是属于单线程，程序顺序执行，可以想象一下队列，前面一个执行完之后，后面才可以执行，当你在使用单线程语言编码时切勿有过多耗时的同步操作，否则线程会造成阻塞，导致后续响应无法处理。你如果采用 Javascript 进行编码时候，请尽可能的使用异步操作。

<font color=#DD1144>多线程就是没有一个进程只开一个线程的限制，好比一个风流少年除了爱慕自己班的某个妹子，还在想着隔壁班的漂亮妹子。Java 就是多线程编程语言的一种，可以有效避免代码阻塞导致的后续请求无法处理。</font>

## Node中线程和进程
<font color=#1E90FF>**① 概述**</font>

`Node.js`是`Javascript`在服务端的运行环境，构建在`chrome`的`V8`引擎之上，基于事件驱动、非阻塞I/O模型，充分利用操作系统提供的异步 I/O 进行多任务的执行，适合于 I/O 密集型的应用场景，因为异步，程序无需阻塞等待结果返回，而是基于回调通知的机制，原本同步模式等待的时间，则可以用来处理其它任务，在 Web 服务器方面，著名的 `Nginx`也是采用此模式（事件驱动），Nginx 采用 C 语言进行编写，主要用来做高性能的 Web 服务器，不适合做业务。Web业务开发中，如果你有高并发应用场景那么`Node.js` 会是你不错的选择。

在单核`CPU`系统之上我们采用<font color=#1E90FF>单进程+单线程</font>的模式来开发。在多核CPU系统之上，可以通过`child_process.fork`开启多个进程（Node.js 在 v0.8 版本之后新增了Cluster来实现多进程架构） ，即<font color=#DD1144>多进程+单线程</font>模式。注意：<font color=#1E90FF>开启多进程不是为了解决高并发，主要是解决了单进程模式下 Node.js CPU 利用率不足的情况，充分利用多核 CPU 的性能。</font>

<font color=#1E90FF>**② process**</font>

`Node.js`中的进程`Process`是一个全局对象，无需`require`直接使用，给我们提供了当前进程中的相关信息。
+ <font color=#3eaf7c> process.env</font>：环境变量，例如通过 `process.env.NODE_ENV`获取不同环境项目配置信息
+ <font color=#3eaf7c>process.nextTick</font> ：这个在谈及 Event Loop 时经常为会提到
+	<font color=#3eaf7c>process.pid</font>：获取当前进程id
+ <font color=#3eaf7c>process.ppid</font>：当前进程对应的父进程
+ <font color=#3eaf7c>process.cwd()</font>：获取当前进程工作目录
+ <font color=#3eaf7c>process.platform</font>：获取当前进程运行的操作系统平台
+ <font color=#3eaf7c>process.uptime()</font>：当前进程已运行时间，例如：`pm2` 守护进程的`uptime`值
+ <font color=#3eaf7c>进程事件</font> ：
	+ `process.on('uncaughtException', cb)`:捕获异常信息
	+ `process.on('exit', cb`:进程推出监听
+ <font color=#3eaf7c>三个标准流</font>：
	+ `process.stdout`: 标准输出
	+ `process.stdin`: 标准输入
	+ `process.stderr`: 标准错误输出

<font color=#1E90FF>**③ 总结**</font>

关于 Node.js 进程的几点总结：
+ `Javascript`是单线程，但是做为宿主环境的`Node.js`并非是单线程的。
+ 由于单线程原故，一些复杂的、消耗`CPU`资源的任务建议不要交给`Node.js`来处理，当你的业务需要一些大量计算、视频编码解码等`CPU`密集型的任务，可以采用`C`语言。
+ `Node.js`和`Nginx`均采用事件驱动方式，避免了多线程的线程创建、线程上下文切换的开销。如果你的业务大多是基于`I/O`操作，那么你可以选择`Node.js`来开发。

## Node.js创建进程
`Node.js`提供了`childprocess`内置模块,可以用来创建子进程，有下面四种方式：
+ <font color=#DD1144> child_process.spawn()</font>：适用于返回大量数据，例如图像处理，二进制数据处理。
+ <font color=#DD1144>child_process.exec()</font> ：适用于小量数据，`maxBuffer`默认值为 200 * 1024 超出这个默认值将会导致程序崩溃，数据量过大可采用`spawn`。
+ <font color=#DD1144>child_process.execFile()</font>：类似`child_process.exec()`，区别是不能通过`shell`来执行，不支持像I/O重定向和文件查找这样的行为

+ <font color=#DD1144> child_process.fork()</font>：衍生新的进程，并调用一个指定的模块，该模块已建立了 IPC 通信通道，允许在父进程与子进程之间发送消息。进程之间是相互独立的，每个进程都有自己的V8实例、内存，系统资源是有限的，不建议衍生太多的子进程出来，通长根据系统`CPU`核心数设置。。

### 1. child_process.spawn

### 2. child_process.fork

### 3. child_process.exec

### 4. child_process.execFile

**参考资料**

1. [Node.js process 模块解读](https://juejin.im/post/5b0e97bef265da0914072515)
2. [node的process以及child_process](https://juejin.im/post/5a996a87f265da239d48bebc)
3. [Nodejs进阶：如何玩转子进程（child_process）](https://juejin.im/post/5848ee3c8e450a006aad306b)
4. [Node.js child_process模块解读](https://juejin.im/post/5b10a814f265da6e2a08a6f7)
5. [深入理解Node.js 中的进程与线程](https://juejin.im/post/5d43017be51d4561f40adcf9)
6. [你觉得Node.js是单线程这个结论对吗？](https://juejin.im/post/5d468e056fb9a06b17779927)
7. [进程和线程](https://www.nodejs.red/#/nodejs/process-threads)
8. [Node.js进阶之进程与线程](https://mp.weixin.qq.com/s/m0flEyU1zG2uTxuZNfMJFQ)
9. [分享 10 道 Nodejs 进程相关面试题](https://mp.weixin.qq.com/s/dKN95zcRI7qkwGYKhPXrcg)