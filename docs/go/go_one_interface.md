# Go面向接口

## 接口的概念
```go
type Traversal interface {
	Traverse()
}

func main() {
	traversal := getTraversal()
	traversal.Traverse()
}
```
通常的在每次讲解新的知识之前，我都会先列出一个最直观的知识的简单代码，让你有个印象，那对于接口的概念，实际上是个抽象的概念，如果你之前是干`C++`，或者`Java`也许不会陌生，但是如果你干的是`javascript`这种弱语言类型，可能你都没有接触过接口这个概念。

但是无论怎么样，之前我们就说:<font color=#1E90FF>学习go语言重要的不是语言，而是三观</font>，在接下来的知识呢都是高级的知识，对于高级一点的知识，我们就不能用对待基础知识的态度来面对了。<font color=#1E90FF>基础知识有鲜明的对错之分，而高级知识更多的是利弊的选择</font>

我们现在来看一个例子：
```go
// infro/urlretriever.go
package infra
import (
	"io/ioutil"
	"net/http"
)

type Retriever struct{}

func (Retriever) Get(url string) string {
	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	bytes, _ := ioutil.ReadAll(resp.Body)
	return string(bytes)
}
```
```go
// test.Restrever.go
package testing

type Retriever struct{}

func (Retriever) Get(url string) string {
	return "fake content"
}
```
上面比如说是两个团队写的`Restrever`的`Get`方法，然后我们现在有这样的一段代码：
```go
// download.go
package main

import (
	"fmt"
	"learngo/infra"
)
// 书写一个方法与main进行解耦
func getRetriever() infra.Retriever {
	return infra.Retriever{}
}
// func getRetriever() testing.Retriever {
// 	return testing.Retriever{}
// }

func main() {
	var retriever infra.Retriever = getRetriever()
	// var retriever testing.Retriever = getRetriever()
	fmt.Println(retriever.Get("https://www.imooc.com"))
}
```
现在因为我们要测试功能，所以我们需要将`retriever`换成`testing.Restrever`类型的，那么我们就需要按照上面的注释方式去改，那可以看到这样的改法很麻烦，`infra.Retriever`和`testing.Retriever`实际功能类似，可以换起来就要改这么多地方，麻烦的关键原因就是因为：<font color=#DD1144>go语言是强类型系统，如果是弱类型系统或者动态绑定的系统，变量在书写的时候是不知道类型的，只有运行的时候才知道类型，所以对于弱类型的语言来说，解耦很简单，但是对于go这种静态语言来说要实现解耦就必须在书写代码的时候就知道类型</font>

那么怎么取解决这个问题呢?解决问题的关键在于：<font color=#1E90FF>我们要明白不论是testing.Retriever还是infra.Retriever都要调用Get方法，所以我们只需要去找个东西来描述retriever可以调用Get方法即可，无所谓是什么具体的类型</font>

所以解决问题的关键就是：<font color=#DD1144>定义一个可以调用Get方法的东西</font>，这个东西用编程语言怎么描述呢？就是<font color=#DD1144>接口</font>：
```go
func getRetriever() retriever {
	// return infra.Retriever{}
	return testing.Retriever{}
}
// 定义一个可以调用Get方法的东西类型
type retriever interface {
	Get(string) string
}

func main() {
	var r retriever = getRetriever()
	fmt.Println(r.Get("https://www.imooc.com"))
}
```
这样定义之后，我们对于`r`的真实类型的确定就只会从`getRetriever`看到，所以修改的时候也只需要将`getRetriever`方法中的返回值由`infra.Retriever{}`改为`testing.Retriever{}`即可。

通过上面的例子，我们应该对`interface`有了一些感觉，接口到底是什么？实际上它是一个抽象的概念，<font color=#DD1144>任何的类型只要满足接口定义的条件，就能作为接口使用的实际类型出现在代码中</font>。但是如果你之前学习过`C++`或者`Java`你会疑惑，对接口的实现不是应该申明去实现接口么，`Go`当中都没有具体的代码说`testing.Retriever`或者`infra.Retriever`实现了`retriever`这个接口，那这就是`Go`先进的地方，它的好处在哪里？我们来看后面的鸭子类型。

## duck typeing的概念
鸭子类型是什么类型呢?我们有一句话来侧面描述一下鸭子类型：<font color=#1E90FF>像鸭子走路，像鸭子叫，那么就是鸭子</font>，这句话很有意思，按照这样的说法，人也可以是鸭子，只要人去模仿，所以鸭子类型的本质就是：
+ <font color=#DD1144>描述事物的外部行为而非内部结构</font>
+ <font color=#DD1144>严格说go属于结构化类型系统，类似duck typing</font>

我们来看看`python`中的`duck typing`
```python
def download(retriever): 
	return retriever.get("www.imooc.com")
```
+ 运行时才知道传入的`retriever`有没有`get`
+ 需要注释来说明接口

我们来看看`C++`中`duck typing`
```c
template <class R>
string download(const R& retriever) {
	return retriever.get("www.imooc.com")
}
```
+ 编译时才知道传入的`retriever`有没有`get`
+ 需要注释来说明接口

我们来看看`Java`中的类似代码，因为`java`没有`duck typing`
```java
<R extends Retriever>
String download(R r) {
	return r.get("wwww.imooc.com")
}
```
+ 传入的参数必须实现`Retriever`接口
+ 不是`duck typing`

`Go`语言中的`duck typing`吸取了`python`和`C++`的灵活性，又可以实现像`java`中的类型检查。

## 接口的定义和实现
在传统的面向对象中，<font color=#1E90FF>接口是由实现者定义的</font>，比尔说有个人写了一个`file`,然后关于`file`的可读可写都以接口的方式公布出来，任何人通过这个实现者实现的接口可以使用`file`可读可写的功能。但是，<font color=#DD1144>Go语言中接口是由使用者定义的</font>，就好比之前的鸭子类型中我们举的例子，小孩认为一个鸭子玩具是个鸭子，而一个厨师认为鸭子玩具并不是鸭子，因为不能吃，所以，是不是鸭子并不是由鸭子模型自己决定，而是由我们使用者定义的。
```go
// retriever/main.go

// 接口的定义
type Retriever interface {
	Get(url string) string
}

func download(r Retriever) string {
	return r.Get("https://www.imooc.com")
}

func main() {
	var r Retriever = mock.Retriever{Contents: "this is a fake imooc.com"}
	r = &real.Retriever{}
	fmt.Println(download(r))
}
```
```go
// retriever/mock/mockretriever.go
package mock
// 这里本来是MockRetriever，但是Go认为没必要起这样的名字，因为本来就在mock这个包下面
type Retriever struct {
	Contents string
}

// 使用者定义接口中的具体内容
func (r Retriever) Get(url string) string {
	return r.Contents
}
```
```go
// retriever/real/realretriever.go
package real
// 这里本来是RealRetriever，但是Go认为没必要起这样的名字，因为本来就在real这个包下面
type Retriever struct {
	UserAgent string
	TimeOut   time.Duration
}

// 使用者定义接口中的具体内容
func (r *Retriever) Get(url string) string {
	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}
	result, err := httputil.DumpResponse(resp, true)
	resp.Body.Close()
	if err != nil {
		panic(err)
	}
	return string(result)
}
```
从上面三段代码可以看出，我们刚才说的<font color=#DD1144>Go语言中的接口的定义是需要使用者定义的</font>这句话的本质是：<font color=#1E90FF>接口中规定的方法的具体内容需要使用者自己书写，比如第一段代码中的Retriever这个接口只告诉我们实现我这个接口需要实现Get方法，所以实现者们在无需显示的申明我实现了这个接口，只需要默默的实现一个Get方法即可，就相当于实现了接口</font>，所以：
+ <font color=#DD1144>接口的实现是隐式的</font>
+ <font color=#DD1144>只要实现接口里的方法即可</font>

## 接口的值类型
按照上面的接口的定义和实现，我们在`main`函数中执行下面这样的代码：
```go
func main() {
	var r Retriever
	r = mock.Retriever{Contents: "this is a fake imooccom"}
	fmt.Printf("%T %v\n", r, r)  // mock.Retriever {this is a fake imooccom}
	r = &real.Retriever{}
	fmt.Printf("%T %v\n", r, r)  // mock.Retriever {this is a fake imooccom}
}
```
通过上面的打印，我们可以知道：<font color=#1E90FF>接口类型的变量中实际上肚子中包含两个值，一个是类型，一个是值，值可以是普通的值，也可以是指针</font>，<font color=#DD1144>但是千万不要去使用接口变量的地址，因为这个变量里本身就可以包含实现者的地址</font>

<img :src="$withBase('/go_one_interface_var.png')" alt="接口变量">

+ <font color=#DD1144>接口变量自带指针</font>
+ <font color=#DD1144>接口变量同样采用值传递，几乎不需要使用接口的指针</font> 
+ <font color=#DD1144>指针接受者实现只能以指针方式使用，值接受者都可以</font>


那我们怎么知道这个接口变量的类型呢？有几种方法：

<font color=#1E90FF>**① Switch**</font>

通过`switch`方法的场景是一般我们不知道这个接口类型的变量到底是什么类型，所以需要逐个去判断，然后执行不同的操作。
```go
func inspect(r Retriever) {
	fmt.Printf("%T %v\n", r, r)
	switch v := r.(type) { // 注意这种特殊的写法
	case mock.Retriever:
		fmt.Println("Contents:", v.Contents)
	case *real.Retriever:
		fmt.Println("UserAgent:", v.UserAgent)
	}
}
```

<font color=#1E90FF>**② Type assertion**</font>

`Type assertion`是断言的意思，就是我们确信知道这个接口类型的变量具体是什么类型了，然后我们要拿到这个变量中的值，我们需要这样下面的断言方式，不能直接去拿，系统不能自动识别，但是方法是接口中定义的，可以直接拿到：
```go
func main() {
	var r Retriever
	r = mock.Retriever{Contents: "this is a fake imooccom"}
	// type assertion
	// 害怕断言出错就书写个判断，因为断言错误会直接panic
	if mockRetriever, ok := r.(mock.Retriever); ok {
		fmt.Println(mockRetriever.Contents)
	} else {
		fmt.Println("not a mock retriever")
	}

	// 如果非常自信就可以直接断言
	r = &real.Retriever{}
	realRetriever := r.(*real.Retriever)
	fmt.Println(realRetriever.UserAgent)
}
```
关于类型我们还要说一下，<font color=#DD1144>Go语言中的interface{} 可以用来代表任何类型</font>。


## 接口的组合
对于使用者来说，可以去老老实实定义一些接口，也可以将现有的接口进行组合，实现者只管实现组合中每个接口中定义的方法即可：
```go
// 接口Retriever的定义
type Retriever interface {
	Get(url string) string
}

// 接口Poster的定义
type Poster interface {
	Post(url string, form map[string]string) string
}

// 接口RetrieverPoster的定义（是接口Retriever和接口Poster的组合）
type RetrieverPoster interface {
	Retriever
	Poster
	// 还能定义其他的方法,比如Connect(host string) string
}
```
这种组合在标准库中很常见，所以你会在有些方法中经常会见到，参数类型是接口的类型，这样的话，凡是实现这个接口的类型都能做为参数传入进来。