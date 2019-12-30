# Go资源管理和出错处理

## defer调用
对于资源管理我们是用`defer`来解决的，主要的目的是：<font color=#DD1144>确保调用在函数结束时发生</font>
```go
func tryDefer() {
	defer fmt.Println(1)
	defer fmt.Println(2)
	fmt.Println(3)
	return // 在return之前会去执行defer的语句
	fmt.Println(4)
}

func paramDefer() {
	for i := 0; i < 5; i++ {
		defer fmt.Println(i)  // 程序执行到这里i是多少，就是多少
		if i == 30 {
			panic("printed too many")
		}
	}
}

func main() {
	tryDefer() // 3 2 1（注意执行顺序，栈结构）
	paramDefer() // 4 3 2 1 0
}
```
`defer`有哪些注意的地方呢：
+ <font color=#1E90FF>defer的意思就是先不执行，过一会执行，至于它啥时候执行呢，在函数结束之前或者return之前执行</font>
+ <font color=#DD1144>defer底层实际上是有一个先进后出的栈，所以先写的defer实际上后执行，因为它在栈底</font>
+ <font color=#1E90FF>有了defer,就不怕中间有return和panic了，defer依旧会在return和panic之前去执行</font>
+ <font color=#DD1144>参数在defer语句后计算,比如defer fmt.Println(i)，会将这条语句连同实时的i都推进栈中，所以打印出来的是4 3 2 1 0，而不是4 4 4 4 4</font>

何时正确的使用`defer`呢？
```go
func writeFile(filename string) {
	file, err := os.Create(filename)
	if err != nil {
		panic(err)
	}
	defer file.Close() // 创建文件后关闭，使用defer

	writer := bufio.NewWriter(file)
	defer writer.Flush() // 创建一个buffer后要flush，使用defer

	f := fib.Fibonacci()
	for i := 0; i < 20; i++ {
		fmt.Fprintln(writer, f())
	}
}
```
<font color=#1E90FF>defer的使用不用太在意顺序，只要在正确的操作后面写上defer就会按照正确的栈顺序执行</font>，那么何时使用`defer`调用呢：
+ <font color=#3eaf7c>Open -> defer Close</font>
+ <font color=#3eaf7c>Lock -> defer Unlock</font>
+ <font color=#3eaf7c>PrintHeader -> defer PrintFooter</font>

## 错误处理
`Go`语言中的错误处理比较简单，因为一般的函数我们都可以通过第二个参数拿到`err`,<font color=#1E90FF>err无非也是值而已，我们只需要拿到这个值处理我们已知的错误类型，未知的错误类型我们做提示或者panic都可以</font>
```go
file, err := os.Open("abc.txt") // os.Open只会产生*os.PathError的错误类型
if err != nil {
	if pathError, ok := err.(*os.PathError); ok {
		fmt.Println(pathError.Err) // 对已知错误类型进行处理
	} else {
		fmt.Println("Unkown error", err)
		// panic("Unkown error")   // 对未知错误类型进行处理
	}
}
defer file.Close()
```
## panic和recover
`panic`首先不是什么好东西，你它代表的意思是无法处理，直接退出，所以你书写程序不能在代码中写那么多的`panic`,那意味着你程序中的很多问题没有解决，那么`panic`的具体作用有下面这些：
+ <font color=#1E90FF>停止当前函数执行</font>
+ <font color=#1E90FF>一直向上返回，执行每一层的defer</font>
+ <font color=#1E90FF>如果没有遇见recover，程序退出</font>

与之对应的就是`recover`,`recover`有哪些注意的地方呢：
+ <font color=#1E90FF>仅在defer调用中使用，程序中途是不能使用recover的</font>
+ <font color=#1E90FF>获取panic的值</font>
+ <font color=#DD1144>如果无法处理，可以重新panic</font>

```go

func tyRecover() {
	defer func() {
		r := recover()
		if err, ok := r.(error); ok {
			// r可以是任意类型interface{}，如果是错误类型我们才这样处理
			fmt.Println("Error occurred:", err)
		} else {
			// 如果不是错误类型，那我只能继续panic了
			panic(fmt.Sprintf("I don't know what to do:%v", r))
		}
	}() // 这里是立即执行函数

	// 1. recover可以处理panic
	panic(errors.New("this is an error"))

	// 2. recover也可以处理运行时错误
	var b int = 0
	a := 5 / b
	fmt.Println(a)
}
```
通过上面的例子可以看到，如果`panic`的是`error`类型，我们就可以继续处理，运行时错误也是`error`的类型，所以都能处理，不会直接挂掉

## 服务器统一出错处理
<font color=#1E90FF>**① 普通情况**</font>

在讲服务器统一出错处理之前，我们先来讲一下最简单的`http`服务：
```go
func main() {
	http.HandleFunc("/test/", func(writer http.ResponseWriter, request *http.Request) {
		if _, err := writer.Write([]byte(request.URL.Path[len("/test/"):])); err != nil {
			http.Error(writer, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}
	})
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		panic(err)
	}
}
```
+ `http.HandleFunc`相当于一个判断路由的功能，第二个参数就是控制器
+ 控制器`func(writer http.ResponseWriter, request *http.Request)`第一个参数是返回值，或者说`http`响应值`response`，第二个参数是请求值`request`，就是我们请求这个`url`相关方法，参数和路径等一系列对象的集合
+ `http.Error(w ResponseWriter, error string, code int)`是服务器错误返回的一种处理方法，第一个参数是书写响应的对象，第二个参数是错误信息，第三个参数是错误码

然后我们来写一个最简单的输入`localhost:8888/list/c.txt`，就能将`c.txt`文件中的内容读出来的功能
```go
// filelistiingserver/web.go
package main
import (
	"fmt"
	"learngo/errorhanding/filelistingserver/filelisting"
	"net/http"
	"os"
)
// 定义控制器的类型
type appHandler func(writer http.ResponseWriter, request *http.Request) error

// 统一的错误处理
func errWrapper(handler appHandler) func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		err := handler(writer, request)
		if err != nil {
			code := http.StatusOK
			fmt.Printf("Error handling request: %s", err.Error())
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
// main函数
func main() {
	http.HandleFunc("/list/", errWrapper(filelisting.HandleFileList))
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		panic(err)
	}
}
```
```go
// filelistiingserver/filelisting/handler.go
package filelisting
import (
	"io/ioutil"
	"net/http"
	"os"
)
// 处理localhost:8888/list/xxx.xxx的控制器
func HandleFileList(writer http.ResponseWriter, request *http.Request) error {
	path := request.URL.Path[len("/list/"):] // 拿到list后面的东西
	file, errOpen := os.Open(path)           // 打开文件
	if errOpen != nil {
		return errOpen
	}
	defer file.Close() // 记得关闭

	all, errReadAll := ioutil.ReadAll(file) // 读文件
	if errReadAll != nil {
		return errReadAll
	}

	_, errWrite := writer.Write(all) // 将从文件中读出的东西写给客户端
	if errWrite != nil {
		return errWrite
	}
	return nil
}
```
上面的代码虽然有点复杂，但是我相信你一定能看的懂，因为注释写的太详细了。

<font color=#1E90FF>**② 详细情况**</font>

经过上面对`defer`的学习，我们就会联想到，在控制器中虽然有些错误我们将其返回，但是还有一些我们发现不了的错误，和一些运行时错误，这些错误直接就相当于`panic`了，我们需要使用`defer`中的`recover`来解决，还有就是错误的信息分为两种，<font color=#1E90FF>想给用户直接看的信息</font>和<font color=#1E90FF>不想直接给用户看的信息</font>，那么不想给用户直接看的信息，我们通过检查类型，返回`http.StatusText`，但是想给用户直接看的信息我们不能统一的使用`http.StatusInternalServerError`，我们需要显示给用户。

所以我们下面接着上面那个案例，综合使用<font color=#1E90FF>defer + panic + recover</font>、<font color=#1E90FF>Type Assertion</font>、<font color=#1E90FF>函数式编程的应用</font>，来完整的解决一个错误处理的方案：

<img :src="$withBase('/go_one_errorcontrol.png')" alt="完整的错误处理">

```go
// filelistiingserver/web.go
package main
import (
	"learngo/errorhanding/filelistingserver/filelisting"
	"log"
	"net/http"
	"os"
)
type appHandler func(writer http.ResponseWriter, request *http.Request) error

func errWrapper(handler appHandler) func(http.ResponseWriter, *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		// 使用recover来出来控制器可能存在的panic
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Panic: %v", r) // 我们自己能看到具体的错误
				http.Error(writer,
					http.StatusText(http.StatusInternalServerError),
					http.StatusInternalServerError,
				) // 用户看到的就是未知错误
			}
		}()

		err := handler(writer, request)
		if err != nil {
			log.Printf("Error handling request: %s", err.Error())

			// 处理userError，如果错误是想直接给用户看的就走这一步
			if userErr, ok := err.(userError); ok {
				http.Error(writer, userErr.Message(), http.StatusBadRequest)
				return
			}

			code := http.StatusOK
			switch {
			case os.IsNotExist(err):
				code = http.StatusNotFound
			case os.IsPermission(err):
				code = http.StatusForbidden
			default: 
				code = http.StatusInternalServerError
			}
			http.Error(writer, http.StatusText(code), code)
		}
	}
}

type userError interface {
	error            // 给系统看的错误
	Message() string // 给用户看的错误
}

func main() {
	http.HandleFunc("/", errWrapper(filelisting.HandleFileList))
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		panic(err)
	}
}
```
```go
// filelistiingserver/filelisting/handler.go
package filelisting
import (
	"io/ioutil"
	"net/http"
	"os"
	"strings"
)

const prefix = "/list/"

// 定义错误类型
type userError string

func (e userError) Error() string {
	return e.Message()
}

func (e userError) Message() string {
	return string(e)
}

func HandleFileList(writer http.ResponseWriter, request *http.Request) error {
	if strings.Index(request.URL.Path, prefix) != 0 {
		return userError("path must start" + " with " + prefix) // 抛出一个可以给用户看的错误
	}
	path := request.URL.Path[len(prefix):]
	file, errOpen := os.Open(path)
	if errOpen != nil {
		return errOpen // 内部错误用户不可看
	}
	defer file.Close()

	all, errReadAll := ioutil.ReadAll(file)
	if errReadAll != nil {
		return errReadAll // 内部错误用户不可看
	}

	_, errWrite := writer.Write(all)
	if errWrite != nil {
		return errWrite // 内部错误用户不可看
	}
	return nil
}
```
所以我们来总结一下`error`和`panic`:
+ <font color=#3eaf7c>意料之中的</font>：<font color=#DD1144>使用error，如文件打不开</font>
+ <font color=#3eaf7c>意料之外的</font>：<font color=#DD1144>使用pacic，如数组越界</font>
