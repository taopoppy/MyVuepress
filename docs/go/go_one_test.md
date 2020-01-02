# Go测试和性能调优

## 测试概述
在`Go`语言中，我们有非常有名的一句话就是：<font color=#DD1144>Debugging Sucks！，Testing Rocks</font>，就是说在`Go`语言中我们希望多做测试，而不要去堆程序调试。所以在测试程序这一方面`Go`语言还是有自己独到的见解的。

虽然是这样，但是有时候按照程序员编程的习惯和必要，还是要用到调试的，但是调试基本上和别的语言没有啥区别，在`vscode`，直接`F5`就完事了，打断点调试即可，我们下面来说测试。

### 1. 传统测试
```java
@Test public void testAdd() {
	assertEquals(3, add(1, 2));
	assertEquals(2, add(0, 2));
	assertEquals(0, add(0, 0));
	assertEquals(0, add(-1, 1));
	assertEquals(3, add(Integer.MIN_VALUE, add(1,Integer.MAX_VALUE));
}
```
+ <font color=#1E90FF>测试数据和测试逻辑混合在一起</font>
+ <font color=#1E90FF>出错信息不明确</font>
+ <font color=#1E90FF>一旦一个数据出错测试全部测试</font>

### 2. 表格驱动测试
```go
tests := []struct {
		a, b, c int32
	}{
		{1, 2, 3},
		{0, 2, 2},
		{0, 0, 0},
		{-1, 1, 0},
		{math.MaxInt32, 1, math.MinInt32},
	}

	for i, test := range tests {
		if actual := add(test.a, test.b); actual != test.c {
			fmt.Printf("第 %v个数据出错了", i)
		}
	}
```
+ <font color=#DD1144>分离的测试数据和测试逻辑</font>
+ <font color=#DD1144>明确的出错信息</font>
+ <font color=#DD1144>可以部分失败</font>
+ <font color=#DD1144>go语言的写法非常易于实践表格驱动测试</font>

## 测试和性能实战
### 1. 代码测试和性能测试
首先我们比如要对一个`strings\strings.go`的文件测试和性能的测试，这个文件如下：
```go
package main
import "fmt"

func lengthOfNonRepeatingSubStr(s string) int {
	lastOccurred := make(map[rune]int)
	start := 0
	maxLength := 0
	for i, ch := range []rune(s) {
		if lastI, ok := lastOccurred[ch]; ok && lastI >= start {
			start = lastI + 1
		}
		if i-start+1 > maxLength {
			maxLength = i - start + 1
		}
		lastOccurred[ch] = i
	}
	return maxLength
}
func main() {
	fmt.Println(lengthOfNonRepeatingSubStr("地方撒打发辅导费阿达恩爱大额奥拉夫了")) // 4
}
```
我们要对其中的`lengthOfNonRepeatingSubStr`进行测试，所以我们需要先这样做：<font color=#DD1144>在同级的目录下创建一个strings_test.go文件，这是测试文件的规范写法</font>，然后书写下面的代码：
```go
package main

import (
	"testing"
)
// 代码测试函数
func TestSubstr(t *testing.T) {
	tests := []struct {
		s   string
		ans int
	}{
		// Normal cases
		{"abcabcbb", 3},
		{"pwwkew", 3},

		// Edge cases
		{"", 0},
		{"b", 1},
		{"bbbbbbb", 1},
		{"abcabcabcd", 4},

		// chinese cases
		{"这里是慕课网", 6},
		{"一二三二一", 2},
		{"地方撒打发辅导费阿达恩爱大额奥拉夫了奥", 1},
	}

	for _, tt := range tests {

		actual := lengthOfNonRepeatingSubStr(tt.s)
		if actual != tt.ans {
			t.Errorf("got %d for input %s;"+"expected %d", actual, tt.s, tt.ans)
		}
	}
}

// 性能测试函数
func BenchmarkSubstr(b *testing.B) {
	s, ans := "地方撒打发辅导费阿达恩爱大额奥拉夫了奥", 18
	for i := 0; i < 13; i++ {
		s = s + s
	}

	// 从这里开始测试性能
	b.ResetTimer()
	// 循环多少次无需你担心，它会自动去处理
	for i := 0; i < b.N; i++ {
		actual := lengthOfNonRepeatingSubStr(s)
		if actual != ans {
			b.Errorf("got %d for input %s;"+"expected %d", actual, s, ans)
		}
	}
}
```
+ <font color=#DD1144>测试的函数名称必须是Test打头的名称，函数参数必须是t *testing.T</font>
+ <font color=#DD1144>测试的启动需要进入到测试文件的上层目录下，然后使用下面这个命令</font>
	```go
	go test .
	```
+ <font color=#DD1144>性能测试的函数名称必须是Benchmark打头的名称，函数参数必须是b *testing.B</font>
+ <font color=#DD1144>性能测试的启动需要进入测试文件的上层目录下，然后使用下面这个命令</font>
	```go
	go test -bench .
	```
+ <font color=#1E90FF>性能测试会显示：BenchmarkSubstr-4 169 7047740 ns/op,意思就是大概执行了169万次，每次的执行时间大概是7047740ns秒</font>

### 2. pprof性能调优
通过上面的测试我们已经能够获取到文件执行的时间，现在我们要优化它，想让它的执行时间变短，这个可以帮助我们在算法的求解中来优化算法：

在执行命令之前，我们需要先下载`svg`的一个工具，叫做<font color=#1E90FF>Graphviz</font>,我们直接去官网[www.graphviz.org](www.graphviz.org)直接下载就行了。下载后需要向`PATH`中添加`Graphviz/bin`的环境变量。
```go
go test -bench . -cpuprofile cpu.out  // 生成cpu.out二进制文件

go tool pprof cpu.out // 进入到pprof命令行操作cpu.out文件

(pprof) web // 进入浏览器，图形化展示二进制文件
```
然后就会在浏览器中展现这样的一个`svg`的图像,其中方框越大的线条越粗的表示耗费的时间越大，我们可以根据图形中的内容来判断程序中的哪个部分耗时过长，并且根据具体情况进行优化   
<img :src="$withBase('/go_one_websvg.png')" alt="">

从图中可以看到基本上看到两个最耗时的操作，就`strings\strings.go`中的将`utf8`的字符串转换成为`[]rune()`的操作和`map[rune]int`这个数据结构操作比较耗时，前者我们无法优化，必须要转换，后者我们可以通过考虑其他的数据结构来替换`map`以此达到优化的效果：

### 3. 代码覆盖率
代码覆盖率是指在文件运行的时候有多少代码被执行到了，我们在`GoLand`和`Idea`中有专门的图像化工具，在`vscode`中我们需要使用下面两个命令：
```go
go test -coverprofile=c.out   // 在当面文件夹下生成一个c.out的文件，包含当前文件下文件代码覆盖率的信息
go tool cover -html=c.out     // 打开一个网页，显示当前代码覆盖率的信息
```

## 测试http服务器
上面说了那么多测试，我们现在就来写个真实的测试，我们之前写了一个`http`的服务，那里我们做了很多错误处理，<font color=#1E90FF>我们对http的测试并不是测试它的控制逻辑，而是测试错误处理</font>

关于`http`的测试有两种方法：一种是类似于单元测试，测试错误处理的函数，另外一种是通过这个错误处理的函数启动一个真正的服务器来测试，我们首先来看之前书写的那个错误处理函数：
```go
func errWrapper(handler appHandler) func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		// 第一种情况：panic
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Panic: %v", r)
				http.Error(writer,
					http.StatusText(http.StatusInternalServerError),
					http.StatusInternalServerError,
				)
			}
		}()

		err := handler(writer, request)
		if err != nil {
			log.Printf("Error handling request: %s", err.Error())

			// 第二种情况：处理userError
			if userErr, ok := err.(userError); ok {
				http.Error(writer, userErr.Message(), http.StatusBadRequest)
				return
			}
			// 第三种情况：处理systemError
			code := http.StatusOK
			// 打开文件的错误有很多，比如文件不存在，或者文件没有权限等等
			switch {
			case os.IsNotExist(err): // 如果是文件不存在的错误
				code = http.StatusNotFound
			case os.IsPermission(err): // 如果是没有权限的错误
				code = http.StatusForbidden
			default: // 如果是啥都不知道的错误
				code = http.StatusInternalServerError
			}
			// func Error(w ResponseWriter, error string, code int)
			http.Error(writer, http.StatusText(code), code)
		}
	}
}
```
可以看到错误处理处理了三种不同的情况，分别是<font color=#1E90FF>panic</font>、<font color=#1E90FF>userError</font>和<font color=#1E90FF>systemError</font>，所以我们需要用测试函数的方式来测试`errWrapper`，测试之前我们要写一个测试对象和很多模拟不同类型错误的控制器：
```go
var tests = []struct {
	h       appHandler
	code    int
	message string
}{
	{errPanic, 500, "Internal Server Error"},
	{errUserError, 400, "User error"},
	{errNotFound, 404, "Not Found"},
	{errNoPermission, 403, "Forbidden"},
	{errUnknown, 500, "Internal Server Error"},
	{noError, 200, ""},
}

// 模仿的panic的控制器
func errPanic(writer http.ResponseWriter, request *http.Request) error {
	panic(123)
}

// 模仿的用户错误的控制器
type testingUserError string

func (e testingUserError) Error() string {
	return e.Message()
}

func (e testingUserError) Message() string {
	return string(e)
}
func errUserError(writer http.ResponseWriter, request *http.Request) error {
	return testingUserError("User error")
}

// 模仿文件不存在的错误的控制器
func errNotFound(writer http.ResponseWriter, request *http.Request) error {
	return os.ErrNotExist
}

// 模仿文件没有权限的错误的控制器
func errNoPermission(writer http.ResponseWriter, request *http.Request) error {
	return os.ErrPermission
}

// 模仿未知错误的控制器
func errUnknown(writer http.ResponseWriter, request *http.Request) error {
	return errors.New("unknown error")
}

// 模仿错误为nil的控制器
func noError(writer http.ResponseWriter, request *http.Request) error {
	return nil
}
```
### 1. 函数式测试
然后根据上述的测试对象和很多模拟不同类型错误的控制器，来用第一种方法来测试`errWrapper`函数：
```go
func TestErrWrapper(t *testing.T) {
	for _, tt := range tests {
		f := errWrapper(tt.h)              // 拿到模拟的控制器
		response := httptest.NewRecorder() // 假的response
		request := httptest.NewRequest(
			http.MethodGet,
			"http://www.imooc.com", nil)     // 假的request
		f(response, request)               // 用模拟的控制器控制错误的发生
		// 判断发生的错误的Code和message是否满足我们的预期
		b, _ := ioutil.ReadAll(response.Body)
		body := strings.Trim(string(b), "\n")
		if response.Code != tt.code || body != tt.message {
			t.Errorf("expect (%d,%s);"+"got (%d,%s)", tt.code, tt.message, response.Code, body)
		}
	}
}
```
### 2. 服务器测试
第二种就是开启一个真实的服务器进行测试：
```go
func TestErrWrapperInServer(t *testing.T) {
	for _, tt := range tests {
		f := errWrapper(tt.h)
		// 启动一个真的http服务
		server := httptest.NewServer(http.HandlerFunc(f)) // 
		resp, _ := http.Get(server.URL)
		// 判断发生的错误的Code和message是否满足我们的预期
		b, _ := ioutil.ReadAll(resp.Body)
		body := strings.Trim(string(b), "\n")
		if resp.StatusCode != tt.code || body != tt.message {
			t.Errorf("expect (%d,%s);"+"got (%d,%s)", tt.code, tt.message, resp.StatusCode, body)
		}
	}
}
```
基本上这两种方法我们就展示完了，两种方式有所区别：
+ <font color=#3eaf7c>第一种</font>：<font color=#1E90FF>通过使用假的Request/Response,测试更细，范围有限</font>
+ <font color=#3eaf7c>第二种</font>：<font color=#1E90FF>通过起服务器，测试范围大，速度更慢</font>

## 生成文档和实例代码
开启文档说明只需要先下载`godoc`，因为<font color=#DD1144>go doc</font>这个命令是查看文档的，`godoc`是生成文档的。但是新版本的`godoc`已经不再内置了，需要下载：
```go
go get golang.org/x/tools/cmd/godoc
go install golang.org/x/tools/cmd/godoc
```
然后启动命令：
```go
godoc -http :6060
```
然后就在`localhost:6060`开启一个文档说明的服务器

我们要说明的是，给一个文档如何写实例：
```go
// Queue/queue.go
package queue

// An FIFO queue
type Queue []int
// Pushes the element into the queue.
func (q *Queue) Push(v int) {
	*q = append(*q, v)
}
```
下面给上面的的代码写示例
```go
// Queue/queue_test.go
package queue
import "fmt"
// 示例代码必须起这样格式的名字
func ExampleQueue_Pop() {
	q := Queue{1}
	q.Push(2)
	q.Pop()
	fmt.Println(q)

	// Output:
	// 1
}
```
这样我们重新执行`godoc -http :6060`在`Queue`文档中就有示例说明了。
