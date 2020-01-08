# Go的通道

## channel概述
### 1. channel
在`goroutine`中我们讲了`goroutine`之间存在双向的通道，这个通道就是`channel`，负责数据和控制权的交换。
```go
func worker(id int, c chan int) {
	for {
		n := <-c
		fmt.Printf("Worker %d received %d\n", id, n)
	}
}

func chanDemo() {
	c := make(chan int) // 创建一个channel
	go worker(0, c)     // goroutine接受了c这个channel
	c <- 1              // 向channel传送数据
	c <- 2
	time.Sleep(time.Millisecond)
}

func main() {
	chanDemo()  
	// Worker 0 received 1
	// Worker 0 received 2
}
```
上面就是一个最简单的`channel`的语法：

<img :src="$withBase('/go_one_channel_introduce.png')" alt="并发流程">

+ 创建一个`channel`我们使用`make`方法，<font color=#DD1144>chan int</font>也是一种数据类型，表示的是传递`int`类型值的`channel`通道，创建一个`goroutine`,和`main`函数并发执行。
+ <font color=#1E90FF>创建一个channel，给channel发数据就必须有goroutine来接收数据，否则程序就会死掉</font>
+ <font color=#1E90FF>所以实际上虽然对于给channel发数据1和2和worker死循环接收数据的代码是并发的，但是数据的发送和接收有先后顺序，所以我们需要延迟一毫秒让worker打印出来，不然main刚把1和2发出去程序就结束了</font>。

我们来将这个例子改复杂一些：
```go
// 创建一个只能接受数据的channel
func createWorker(id int) chan<- int {
	c := make(chan int)
	// 创建一个goroutine，channel负责将数据发给goroutine
	go func() {
		for {
			n := <-c
			fmt.Printf("Worker %d received %c\n", id, n)
		}
	}()
	return c
}

func chanDemo() {
	var channels [10]chan<- int 
	for i := 0; i < 10; i++ {
		channels[i] = createWorker(i)
	}
	for i := 0; i < 10; i++ {
		channels[i] <- 'a' + i
	}
	for i := 0; i < 10; i++ {
		channels[i] <- 'A' + i
	}
	time.Sleep(time.Millisecond)
}
func main() {
	chanDemo()
	//Worker 1 received b
	//Worker 3 received d
	//Worker 9 received j
	//Worker 4 received e
	//Worker 6 received g
	//Worker 7 received h
	//Worker 0 received a
	//Worker 0 received A
	//Worker 5 received f
	//Worker 2 received c
	//Worker 2 received C
	//Worker 1 received B
	//Worker 8 received i
	//Worker 8 received I
	//Worker 5 received F
}
```
通过上面这个例子，我们要注意几点：
+ <font color=#1E90FF>通过chan<- 或者<-chan 可以定义只接受或者只发送的channel</font>
+ <font color=#1E90FF>可以看到对于每个goroutine来说，实际上是同时接收到相同的大小写字母的，但是在goroutine当中有fmt这种io操作，所以调度器会切换协程，所以顺序是乱的。每次可能顺序都不一样</font>

### 2. bufferedChannel
我们再来介绍一个<font color=#DD1144>bufferedChannel</font>：
```go
func bufferedChannel() {
	c := make(chan int, 3) // 创建了长度为3的缓存区
	go worker(0, c)
	c <- 'a'
	c <- 'b'
	c <- 'c'
	c <- 'd'
	time.Sleep(time.Millisecond)
}
```
这个缓存区有两个作用：
+ <font color=#1E90FF>当我们的channel接收3个以内的数据，没有接收不会报错</font>
+ <font color=#1E90FF>对性能的提升有很大的好处，别的地方和普通的channel没有多大区别</font>

### 3. closeChannel
虽然我们上面的代码并没有太大的错误，但是对于发送方和接收方，我们都希望有个明确的表示数据发送完毕的代号或者标识，我们依旧用上面的代码来演示：
```go
// 接收方
func worker(id int, c chan int) {
	for {
		n, ok := <-c  // 通过ok来判断chanenl发过来的是否还有值
		if !ok {
			break       // 没有值说明channel数据传输完毕，跳出死循环
		}
		fmt.Printf("Worker %d received %d\n", id, n)
	}
}
// 发送方
func bufferedChannel() {
	c := make(chan int, 3)
	go worker(0, c)
	c <- 'a'
	c <- 'b'
	close(c) // 发送方使用明确的close函数来关闭channel
	time.Sleep(time.Millisecond)
}
```
当然对于接收方还有更简单的写法：<font color=#1E90FF>range这种写法更简单，但是不会主动停止，数据的接收和发送的终与始都主要依靠发送方的开始和结束</font>，如下所示：
```go
func worker(id int, c chan int) {
	for n := range c {
		fmt.Printf("Worker %d received %d\n", id, n)
	}
}
```
所以至于为什么`Go`语言的并发是这样，可以参考一篇论文叫做：<font color=#1E90FF>Communication Sequential Process</font>，也是我们俗称的<font color=#DD1144>CSP模型</font>，而且和`CSP`模型相关的一句话是：<font color=#DD1144>通过通信来共享内存，不要通过共享内存来通信</font>，我们下面会用实际的例子来演示这句话的意思。

## 等待多任务结束
### 1. 使用Channel等待多任务结束
之前我们说很多语言都是通过共享内存来通信的，比如创造一个变量，一方把这个变量从`true`变为`false`，然后另一方看到这个变量变化了，就收到了某种讯息，这就是共享一个变量的内存来实现通信。

但是`Go`语言不是这样，比如两个`goroutine`之间通过`channel`通信，必须通过发送某个标识来明确表示发送数据结束，或者通信结束。那我们来写一个比较复杂的例子：
```go
func doWork(id int, c chan int, done chan bool) {
	for n := range c {
		fmt.Printf("Worker %d received %c\n", id, n)
		go func() { done <- true }() 
		// 这里如果直接写done<-true，则在chanDemo中就立马要接收
	}
}

type worker struct {
	in   chan int
	done chan bool
}

func createWorker(id int) worker {
	w := worker{
		in:   make(chan int),
		done: make(chan bool),
	}
	go doWork(id, w.in, w.done)
	return w
}

func chanDemo() {
	var workers [10]worker
	for i := 0; i < 10; i++ {
		workers[i] = createWorker(i)
	}
	// 下面都是和doWork并行的代码
	for i, worker := range workers {
		worker.in <- 'a' + i
	}
	// 假如doWork中写的是：done <- true，则需要立马在发完字母后在这里接收
	// for _, worker := range workers { <-worker.done}
	for i, worker := range workers {
		worker.in <- 'A' + i
	}

	for _, worker := range workers {
		<-worker.done
		<-worker.done  // 因为每个worker都发送了两个字母，所以main中需要接收两次
	}
}

func main() {
	chanDemo()
}
```
上面这个例子稍微的难了一些，我们下面画个图来解释一下整个个流程：

<img :src="$withBase('/go_one_chanDemo.png')" alt="流程控制">

根据图中所示，我们在上面代码中也注释了一个比较重要的问题，就是当`doWork`代码中写的是`done<-true`而不是`go func() { done <- true }()`，则在`chanDemo`中循环发完字母后立刻要接收，因为: <font color=#1E90FF>向channel都是阻塞式的，也就是向channel发数据，另外一端必须有人来收这个数据</font>，所以你向`done`里面发送了一个`true`,在`<-worker.done`之前又给`in`发了大写字母，导致之前的`true`没来得及收，又来了一个`true`的数据，导致了循环等待。

### 2. 使用WaitGroup等待多任务结束
但是上面这种`	go func() { done <- true }()`这种写法不太好，<font color=#1E90FF>对于等待多人完成任务的事情，go语言库有提供帮助的方法</font>：
```go
func doWork(id int, c chan int, wg *sync.WaitGroup) {
	for n := range c {
		fmt.Printf("Worker %d received %c\n", id, n)
		wg.Done() // 任务完成
	}
}

type worker struct {
	in chan int
	wg *sync.WaitGroup
}

func createWorker(id int, wg *sync.WaitGroup) worker {
	w := worker{
		in: make(chan int),
		wg: wg,
	}
	go doWork(id, w.in, wg)
	return w
}

func chanDemo() {
	var workers [10]worker
	var wg sync.WaitGroup   // 创建系统库提供的变量
	for i := 0; i < 10; i++ {
		workers[i] = createWorker(i, &wg)
	}
	wg.Add(20)              // 添加20个任务（前提是我们已经知道就是20个任务）
	for i, worker := range workers {
		worker.in <- 'a' + i
		// wg.Add(1) // 如果在不知道有20个任务的时候我们需要每次给wg添加一个任务
	}
	for i, worker := range workers {
		worker.in <- 'A' + i
		// wg.Add(1)
	}
	wg.Wait()               // 等待所有的任务结束
}

func main() {
	chanDemo()
}
```
## 使用Channel进行树的遍历

## 使用select进行调度
当我们对于多个`channel`同时进行接收，而且采用非阻塞的方式进行接收，就是谁先到谁显示，但是都会接收到：
```go
func genenrator() chan int {
	out := make(chan int)
	go func() {
		i := 0
		for {
			time.Sleep(time.Duration(rand.Intn(1500)) * time.Millisecond)
			out <- i
			i++
		}
	}()
	return out
}

func main() {
	var c1, c2 = genenrator(), genenrator()
	// 对于两个channal同时收，谁来的快收谁,非阻塞式
	for {
		select {
		case n := <-c1:
			fmt.Println("Received from c1:", n)
		case n := <-c2:
			fmt.Println("Received from c2:", n)
		}
	}
}
```
上述程序使用`select`对两个`goroutine`发来的数据同时进行处理，这种处理是非阻塞式的，实际上就是同时处理，只不过两个`goroutine`发来数据的快慢不同，`main`函数中`select`接收的节点不一样，所以会有先后顺序处理的不同。我们下面来把这个例子复杂化一点：
```go
func genenrator() chan int {
	out := make(chan int)
	go func() {
		i := 0
		for {
			time.Sleep(time.Duration(rand.Intn(1500)) * time.Millisecond)
			out <- i
			i++
		}
	}()
	return out
}

func createWorker(id int) chan<- int {
	c := make(chan int)
	go worker(id, c)
	return c
}

func worker(id int, c chan int) {
	for n := range c {
		fmt.Printf("Worker %d received %d\n", id, n)
	}
}

func main() {
	var c1, c2 = genenrator(), genenrator()
	// 对于两个channal同时收，谁来的快收谁,非阻塞式
	var worker = createWorker(0)
	n := 0
	hasValue := false
	for {
		var activeWorker chan<- int
		if hasValue {
			activeWorker = worker
		}
		select {
		case n = <-c1:
			hasValue = true
		case n = <-c2:
			hasValue = true
		case activeWorker <- n:
			hasValue = false
		}
	}
}
//Worker 0 received 0
// Worker 0 received 0
// Worker 0 received 1
// Worker 0 received 1
// Worker 0 received 2
// Worker 0 received 2
// Worker 0 received 3
// Worker 0 received 3
// Worker 0 received 4
// Worker 0 received 5
// Worker 0 received 4
// Worker 0 received 5
// Worker 0 received 6
// Worker 0 received 6
// Worker 0 received 7
// Worker 0 received 7
```
可以看到我们在`main`函数中做了两件事情，<font color=#1E90FF>第一件就是使用select同时接收了不同`goroutine`传来的值</font>，<font color=#1E90FF>第二件就是使用select同时将接收到的值通过worker中channel发送给了worker中的goroutine</font>，所以现在你应该明白了两个问题：
+ <font color=#3eaf7c>select的作用很大</font>
+ <font color=#3eaf7c>现在对于main函数有多个genenrator函数生产出来的创造数据的生产端，还有通过createWorker函数生产出来的消耗数据的消耗端</font>

现在就有个很大的问题，因为生产端和消耗端处理数据都需要时间，假如我们生产端的产生数据的速度比消耗端的速度要快，那么生产端在消耗端消耗数据期间生产出来的数据都被覆盖了，<font color=#1E90FF>所以我们需要将接收到的数据都保存起来，保存到一个队列当中，消耗端就能先进先出式的处理所有的数据</font>
```go
func main() {
	var c1, c2 = genenrator(), genenrator()
	var worker = createWorker(0)

	var values []int                   // 创造一个队列，从生产端传来的数据都进入队列
	tm := time.After(10 * time.Second) // 计时器（返回一个channel）
	tick := time.Tick(time.Second)     // 定时器（每秒返回一个tick）
	for {
		var activeWorker chan<- int
		var activeValue int
		if len(values) > 0 {
			activeWorker = worker   // 队列中有数据，我们就用activeWorker去消耗
			activeValue = values[0] // 消耗队列中的第一个数据
		}
		select {
		case n := <-c1:
			values = append(values, n)
		case n := <-c2:
			values = append(values, n)
		case activeWorker <- activeValue:
			values = values[1:] // 消耗完第一个数据，就把第一个数据去掉
		case <-time.After(800 * time.Millisecond):
			fmt.Println("timeout") // 生产端如果每两个数据的生产间隔超过800毫秒就算超时
		case <-tick:
			fmt.Println("queue len=", len(values)) // 每秒都来查看一下队列的长度
		case <-tm:
			fmt.Println("bye")
			return // 10秒后程序结束
		}
	}
}
```
上述代码我们就比较完整的解决了生产端和消耗端处理数据快慢不一致的问题，当然如果两端的处理速度差距过大，上述程序也不管用，因为队列中的数据会越来越多，在上述的程序我们还展示了几个定时器的使用，整个程序的流程如下：

<img :src="$withBase('/go_one_selelcted.png')" alt="selected">

## 传统同步机制
通过上面的程序我们可以看到`Go`语言的`CSP`模型很有用，也没有用到什么锁之类的，当然`Go`语言也有传统的同步机制的，但是传统的同步机制我们尽量要在`CSP`模型下面少用，但是也不是完全不能用，之前`WaitGroup`实际上也是用`channel`来做的，只不过写法像同步机制，当然<font color=#DD1144>Mutex（互斥量）</font>和<font color=#DD1144>Cond</font>是有的，我们来看一下怎么使用：
```go
type atomicInt int

func (a *atomicInt) increment() {
	*a++ // 写
}

func (a *atomicInt) get() int {
	return int(*a)
}

func main() {
	var a atomicInt
	a.increment()
	go func() {
		a.increment()
	}()
	time.Sleep(time.Millisecond)
	fmt.Println(a) // 读
}
```
首先你可以看到在`main`函数中的匿名函数是一个`goroutine`它和`main`函数之后的代码都在并发的执行，`goroutine`中调用`a.increment`函数对`a`本身执行写的动作，而`main`函数后面的`fmt.Println(a)`函数对`a`本身执行读的动作，两者并发会产生冲突，所以我们使用常用的锁（这里叫做互斥量）来修改一下上面的代码：
```go
type atomicInt struct {
	value int
	lock  sync.Mutex // 创建互斥量
}

func (a *atomicInt) increment() {
	a.lock.Lock()             // 锁住
	defer a.lock.Unlock()     // 写操作后解锁
	a.value++ // 写
}

func (a *atomicInt) get() int {
	a.lock.Lock()
	defer a.lock.Unlock()
	return a.value
}

func main() {
	var a atomicInt
	a.increment()
	go func() {
		a.increment()
	}()
	time.Sleep(time.Millisecond)
	fmt.Println(a.get()) // 读
}
```
这样使用了互斥量后，读写操作都会在一个安全的环境当中进行，<font color=#1E90FF>不过对于这些同步操作，系统有专门的库函数进行，我们还是不建议像上面一样重写一遍</font>。

<font color=#DD1144>Go语言中的这些传统的同步机制其实很少会用到，一般我们都尽量使用channel来进行通信，因为传统的同步机制都是用共享内存通信，因为使用的共享内存，所以需要Mutex和Cond来保护单方面的操作</font>