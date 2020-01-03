# Go的协程

## goroutine
### 1. goroutine概述
`goroutine`实际上是一种协程或者和协程类似的东西，在其他编程当中有个东西叫做<font color=#DD1144>Coroutine</font>,翻译过来叫做协程，当然也并不是所有的语言都是支持协程，在`Go`语言中原生的支持。

<font color=#1E90FF>goroutine是一种轻量级的“线程”，作用和线程差不多，都是用来并发执行一些任务的，但是它的特点是<font color=#DD1144>轻量级</font>，随手开1000个线程可能开不出来，但是1000个协程确实十分容易</font>

<font color=#DD1144>goroutine是一种非抢占式多任务处理，由协程主动交出控制权</font>，那么什么是抢占式? <font color=#1E90FF>比如线程可以随时被操作系统切换，线程就是抢占式多任务处理，自身没有控制权，语句可能执行到一半都会被操作系统掐掉，俗称被抢，像这种最坏的情况执行到一半被抢，就需要上下文存更多东西</font>，但是对于协程来说，只需要处理其中切换的几个点就可以了，这样对资源的消耗就会小一点。

协程做到轻量级的根本原因是：<font color=#DD1144>它实际上是编译器/解释器/虚拟机层面的多任务。并非操作系统上的多任务，因为操作系统上只有线程</font>，所以编译器会将`go`当中的一个`func`解释成为一个协程，具体执行呢，<font color=#1E90FF>是由调度器来调度我们的协程，这个调度器是go语言自己的调度器，操作系统也有自己的调度器，两者要区分不能混淆</font>。所以<font color=#DD1144>多个协程可能在一个或者多个线程上运行，这个是由调度器来决定的</font>

我们来看个例子：
```go
func main() {
	var a [10]int
	for i := 0; i < 10; i++ {
		go func(i int) {
			for {
				a[i]++      // [0 0 13817147 0 13978346 14245768 0 0 0 0]
				// runtime.Gosched() // [626 782 616 765 403 476 554 561 577 607]
			}
		}(i)
	}
	time.Sleep(time.Millisecond)
	fmt.Println(a)
}
```
这个程序表面上会这样执行，按照我们想象的会在一毫秒内，并发的所有数组的元素同时执行`++`的操作，但是实际上：<font color=#1E90FF>整个程序会被第一个协程卡死，因为协程中a[i]++不会自己主动交出控制权，一直都不会退出。而且main函数实际上也是个goroutine，虽然它里面制造了很多goroutine，但是它本身也是，它想执行time.Sleep，但是由于a[i]++不会交出主动权，所以它永远没有机会去执行time.Sleep</font>。

但是当我们每个`goroutine`都能主动交出控制权给调度器，调度器在这些`goroutine`中平衡分配控制权，虽然前后顺序不一定，但是平均下来，所有`goroutine`都有机会去执行到，这样就能实现所有的`goroutine`并发执行。如下图所示：  

<img :src="$withBase('/go_one_godiaoduqi.png')" alt="">

怎么交出控制权呢？<font color=#1E90FF>必须存在协程的切换（主动交出控制权）或者说io操作使得协程进行切换</font>，有下面两种方式:
+ <font color=#3eaf7c>runtime.Gosched</font>：协程自己能够交出控制权，让别人也有机会能执行，大家都相互让一让，调度器总会平衡到所有的协程<font color=#1E90FF>但是一般我们很少用，因为一般我们都有其他机会进行切换，无需让协程自己主动</font>
+ <font color=#3eaf7c>io操作</font>：一般io操作会使得协程之间的切换。

### 2. 闭包和数据冲突
我们将上面的代码修改一下，在并发的匿名函数中不写参数：
```go
// goroutine.go
func main() {
	var a [10]int
	for i := 0; i < 10; i++ {
		go func() {
			for {
				a[i]++   // 引用的是外部的main函数中的i
				runtime.Gosched()
			}
		}()
	}
	time.Sleep(time.Millisecond)
	fmt.Println(a)
}
```
我们使用`go run goroutine.go`来启动程序，会发现报`panic: runtime error: index out of range [10] with length 10`的错误，为什么？<font color=#1E90FF>因为匿名函数中使用的i是外部的，相当于一个闭包，所以闭包中的i和外部的i是相同的i，所以i在main函数中的for循环最终变成了10，而a[10]这个元素就不存在，超出了a数组的范围</font>

然后我们使用特别重要命令查看程序中是否还有数据冲突：<font color=#DD1144>go run -race goroutine.go</font>，即使还原到原来的程序，没有使用闭包，还会有数据冲突:
```go
==================
WARNING: DATA RACE
Read at 0x00c0000580f0 by main goroutine:
  main.main()
      D:/learngo/goroutine/goroutine.go:20 +0x102

Previous write at 0x00c0000580f0 by goroutine 7:
  main.main.func1()
      D:/learngo/goroutine/goroutine.go:14 +0x6f

Goroutine 7 (running) created at:
  main.main()
      D:/learngo/goroutine/goroutine.go:12 +0xca
==================
```
这个错误的意思就是我们在12行创建的`goroutine`在20行被读了，又在14行被写了，说白了就是同时对数据执行了读和写的同时操作，实际上就是`fmt.Println(a)`在`main`这个`goroutine`中读数据的时候，同时还有其他的`goroutine`在并发的写着数据，产生了数据冲突，这个问题我们后面会使用`channel`来解决，这里我们先不做赘述。

## 调度器
### 1. 函数和协程
关于协程我们还有一句非常重要的话：<font color=#DD1144>子程序是协程的一个特例</font>，子程序就是我们通常写的函数调用，这里明确了协程是比普通的函数更宽泛的概念。两者到底区别在哪里，我们用图示来说明

<img :src="$withBase('/go_one_goroutine.png')" alt="协程和普通函数的区别">

+ <font color=#1E90FF>普通函数就运行在一个线程内，main函数和doWork函数相对对立，在main中执行doWork，控制权就给了doWork，等doWork执行完了控制权才能回到main</font>
+ <font color=#DD1144>协程就不一样了，main和doWork之间有个通道，数据和控制权都可以双向的流通，相当于两个并发的线程，虽然各做各事情，但可以通过中间管道随时通信，控制权相互交换。main和doWork可能运行在一个线程中，也可能是多个线程，这是由调度器自己随机应变的事情</font>，<font color=#DD1144>一般来说，调度器会最大开和系统核数一样的线程数。比如4核的处理器，1000个协程一共会映射到4个线程上，怎么分配那是调度器的事情</font> 如下所示：  
<img :src="$withBase('/go_one_goroutine_thread.png')" alt="">

### 2. goroutine的定义
+ <font color=#3eaf7c>任何函数只需要加上go就能送给调度器运行</font>
+ <font color=#3eaf7c>不需要在定义的时候区分异步函数</font>
+ <font color=#3eaf7c>使用-race来检测数据访问冲突</font>
+ <font color=#3eaf7c>调度器会在合适的点进行切换，切换点不需要显式手动的写出来，可能的切换点如下：</font>
	+ <font color=#1E90FF>I/O, select</font>
	+ <font color=#1E90FF>channel</font>
	+ <font color=#1E90FF>等待锁</font>
	+ <font color=#3eaf7c>函数调用（有时）</font>
	+ <font color=#3eaf7c>runtime.Gosched()</font>

