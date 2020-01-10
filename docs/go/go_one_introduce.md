# Go基础语法

## 变量的定义
+ <font color=#1E90FF>变量的定义使用var关键词，而且是变量在前，类型在后，可以赋初值，也可以不赋初值</font>
+ <font color=#1E90FF>不赋初值的变量会根据类型自动拥有一个默认的初始类型值，比如int是0，string为空字符串</font>
```go
func variableZeroValue() {
	var a int
	var s string
	fmt.Printf("%d %q\n", a, s)
}
```
+ <font color=#1E90FF>go语言可以自动根据你赋予的初值判断变量类型，而且不同类型的变量可以一起定义，只要一一对应即可</font>：

```go
func variableTypeDefuction() {
	var a, b, c, s = 3, 4, true, "def"
	fmt.Println(a, b, c, s)
}
```
+ <font color=#DD1144>go语言还有更简练的写法，函数内部首次定义变量可以使用 :=的方式进行简写</font>
+ <font color=#DD1144>这仅仅限制在函数内部第一次定义变量（函数外部不可以使用简写，函数内部第二次对变量赋值也不能使用:=）</font>
```go
func variableShorter() {
	a, b, c, s := 3, 4, true, "def"
	b = 5
	fmt.Println(a, b, c, s)
}
```
+ <font color=#DD1144>函数外部定义的变量不属于全局变量，因为go中不存在全局变量，变量最大的作用域在所属的包内</font>
+ <font color=#1E90FF>函数外定义的变量可以使用var()的形式来进行简写，注意不能使用:=</font>
```go
package main
// 定义的变量最大的作用域在main这个包之内
var (
	aa = 3
	bb = "kkk"
	ss = true
)
```

## 内建变量类型
+ <font color=#3eaf7c>bool</font>、<font color=#3eaf7c>string</font>
+ <font color=#3eaf7c>(u)int</font>、<font color=#3eaf7c>(u)int8</font>、<font color=#3eaf7c>(u)int16</font>、<font color=#3eaf7c>(u)int32</font>、<font color=#3eaf7c>(u)int64</font>、<font color=#3eaf7c>uintptr</font>
	+ 加u前缀的就<font color=#DD1144>无符号整数</font>，不加u的就是有符号整数，规定长度的按照使用长度的数字计算，不规定长度的根据操作系统是32还是64去计算。<font color=#DD1144>uintptr是指针的意思，后面会仔细讲</font>
+ <font color=#3eaf7c>byte</font>、<font color=#3eaf7c>rune</font>
	+ `rune`是字符型，因为`char`只有一个字节，用来处理不同国家的语言坑很多，`rune`的长度是32位，也就是4个字节，无论是一个字节的英文字母还是3个字节的汉字都能很好的支持
+ <font color=#3eaf7c>float32</font>、<font color=#3eaf7c>float64</font>、<font color=#3eaf7c>complex64</font>、<font color=#3eaf7c>complex128</font>
	+ `complex64`和`complex128`是复数，`go`语言直接将其作为了内建类型

在这么多的类型的设计下，<font color=#DD1144>go语言在类型转换中只有强制类型转换，没有隐式类型转换</font>,所以对于你要计算相关的类型误差都要手动的主动的去做类型转换：
```go
func triangle() {
	a, b := 3, 4
	var c int
	c = int(math.Sqrt(float64(a*a + b*b)))
	fmt.Println(c) // 5
}
```

## 常量与枚举
<font color=#1E90FF>**① 常量的定义和使用**</font>

+ <font color=#1E90FF>常量的定义使用const关键字，并且可以定义类型，也可以不定义类型</font>，特别要注意的就是：<font color=#DD1144>如果不定义类型，常量的类型的就不确定，可以作为各种类型使用，它的使用就好像一个文本替换的动作，使用的时候类型会随着它具体使用的时候具体变化</font>，如下代码所示：
+ <font color=#1E90FF>多个常量的定义也可以在const()进行定义，这是一种简写的形式</font>
```go
func consts() {
	const (
		filename string= "abc.txt"
		const a, b = 3, 4
	)
	var c int
	c = int(math.Sqrt(a*a + b*b)) // 此时a和b在math.Sqrt当中就是float64类型的，无需强制转换
	fmt.Println(filename, c)
}
```

<font color=#1E90FF>**② 枚举类型的定义和使用**</font>

+ <font color=#DD1144>枚举类型并没有特殊的关键字，而且通过iota关键字可以实现枚举的自增值</font>
+ <font color=#DD1144>iota实际上是个表达式，它还可以有更复杂的用法</font>
```go
func enums() {
	const (
		cpp = iota * 2
		java
		python
		golang
	)
	const (
		b = 1 << (10 * iota)
		kb
		mb
		gb
		tb
		pb
	)
	fmt.Println(b, kb, mb, gb, tb, pb) // 1 1024 1048576 1073741824 1099511627776 1125899906842624
	fmt.Println(cpp, java, python, golang) // 0 2 4 6
}
```

## 条件语句-if else
<font color=#1E90FF>**① 普通的if-else**</font>

```go
func main() {
	const filename = "abc.txt"
	contents, err := ioutil.ReadFile(filename)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("%s\n", contents)
	}
}
```
+ <font color=#DD1144>首先go语言中的函数可以返回两个值</font>，比如`ioutil.ReadFile`会返回`contents`和`err`两个值，函数正确或者错误执行都会有一个值为空(<font color=#DD1144>nil</font>)

<font color=#1E90FF>**② 特殊的if-else**</font>

```go
func main() {
	const filename = "abc.txt"
	if contents, err := ioutil.ReadFile(filename); err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("%s\n", contents)
	}
	fmt.Println(contents,err) // undefined: contents undefined: err
}
```
+ <font color=#DD1144>可以看到对于if条件语句中可以赋值,可以写普通的语句</font>
+ <font color=#DD1144>if的条件里赋值的变量，作用域就只在这个if语句中</font>，所以上述代码的最后一行，你打印`contents`和`err`都是不存在的，因为已经出了`if`语句的作用域

## 条件语句-switch
下面这就是一个最简单的`go`语言书写的`switch`的程序了，可以很清楚的看到它有下面这些特点：
+ <font color=#1E90FF>swith会自动break，除非使用fallthrough</font>
+ <font color=#1E90FF>panic是报错的意思，后面会仔细说明</font>
```go
func eval(a, b int, op string) int {
	var result int
	switch op {
	case "+":
		result = a + b
	case "-":
		result = a - b
	case "*":
		result = a * b
	case "/":
		result = a / b
	default:
		panic("unsupported opterator:" + op)
	}
	return result
}
```
+ <font color=#DD1144>switch后面也可以没有表达式，判断语句可以写在case后面</font>
```go
func grade(score int) string {
	switch {
	case score < 60:
		return "F"
	case score < 80:
		return "C"
	case score < 90:
		return "B"
	default:
		return "A"
	}
}
```
由此可以看出`GO`语言的语法非常简单而且十分好理解，我们下面接着来学习循环的写法

## 循环
我们下面展示的就是一个循环，书写循环也十分简单：
```go
func forFunc() int {
	sum := 0
	for i := 0; i <= 100; i++ {
		sum += i
	}
	return sum
}
```
+ <font color=#3eaf7c>for的条件里不需要括号</font>
+ <font color=#DD1144>go语言没有while关键字，因为while和for基本一样</font>
+ <font color=#DD1144>go语言中的死循环写法很简单，在并发编程中作用很大</font>
+ <font color=#DD1144>for的条件里可以省略初始条件，结束条件，递增表达式</font>,比如下面几个可以省略条件的场景：
```go
// 将数字转换成为二进制，然后用字符串表达出来
func converToBin(n int) string {
	result := ""
	for ; n > 0; n /= 2 {
		lsb := n % 2
		result = strconv.Itoa(lsb) + result
	}
	return result
}

// 逐行读取文件中的内容
func printFile(filename string)  {
	file,err := os.Open(filename)
	if err =nil{
		panic(err)
	}
	// 逐行读取文件的内容
	scanner := bufio.NewScanner(file) 
	// 用读取结束的条件，相当于while（go语言中没有while）
	for scanner.Scan() {
		fmt.Println(scanner.Text())	
	}
}

// 死循环
for {
	fmt.Println("abc")
} 
```

## 函数
### 1. 函数的定义和返回值
我们之前书写过一个最简单的函数，就是对两个数进行简单的操作运算，如下所示：
```go
func eval(a, b int, op string) int {
	switch op {
	case "+":
		return a + b
	case "-":
		return a - b
	case "*":
		return a * b
	case "/":
		return a / b
	default:
		panic("unsupported operation")
	}
}
```
+ <font color=#DD1144>实际上对于go语言的函数，还能返回多个值</font>
+ <font color=#1E90FF>多个返回值，可以在函数外部定义名称，也可以在函数使用是定义名称，写法很多遍，灵活</font>
+ <font color=#3eaf7c>给返回值起名字对于调用者没有啥区别，调用者可以使用随意的名称接受函数返回的所有参数，好处是如果你不知道给函数的返回值起名字，就可以按照函数内部定义的返回值名称来写，这样对应起来也比较方便</font>
```go
// 求余算法,返回最大除数和余数
func div(a, b int) (int, int) {
	return a / b, a % b
}

// 定义返回值的名称
func div(a, b int) (q int, r int) {
	q = a / b
	r = a % b
	return
}
```
+ <font color=#DD1144>函数多个返回值不要乱使用，第二个参数多半是用来返回错误的,可以很好的代替panic，因为panic会中断程序来提示错误</font>
+ <font color=#DD1144>函数的如果有多个返回值，我们如果不像使用，必须用下划线_表示我不使用，否则会提示变量存在但没有使用的错误</font>
```go
// 定义多个参数返回，需要(type,type,...)这种书写的方式
func eval(a, b int, op string) (int, error) {
	switch op {
	case "+":
		return a + b, nil
	case "-":
		return a - b, nil
	case "*":
		return a * b, nil
	case "/":
		q, _ := div(a, b) // 下划线表示我不使用第二个参数
		return q, nil
	default:
		// 返回错误信息可以使用fmt.Errorf()来定义新的错误信息
		return 0, fmt.Errorf("unsupported operation: %s", op)
	}
}
```
### 2. 函数是一等公民
```go
// 定义一个函数参数为函数，函数的参数类型和返回值类型都要书写清楚
func apply(op func(int, int) int, a, b int) int {
	p := reflect.ValueOf(op).Pointer()
	opName := runtime.FuncForPC(p).Name()
	fmt.Printf("Calling function %s with args"+"%d, %d\n", opName, a, b)
	return op(a, b)
}

func pow(a, b int) int {
	return int(math.Pow(float64(a), float64(b)))
}

func main() {
	fmt.Println(apply(pow, 3, 4)) // 81
}
```
函数作为`go`语言中的一等公民，可以作为函数的参数来使用，当然还有另一种写法叫做<font color=#DD1144>匿名函数</font>，<font color=#3eaf7c>可以在调用函数的时候临时定义</font>，如下所示：
```go
func main() {
	fmt.Println(apply(
		func(a int, b int) int {
			return int(math.Pow(float64(a), float64(b)))
		}, 3, 4))
}
```
<font color=#1E90FF>这实际上就是函数式编程了，函数的参数也可以是一个函数，调用的时候也可以随手书写一个匿名函数来调用</font>，<font color=#DD1144>函数式编程我们会在后面还会进行详细的介绍</font>。

### 3. 可变参数列表
`go`语言比较简单，没有什么<font color=#3eaf7c>默认参数</font>、<font color=#3eaf7c>函数重载</font>这些奇奇怪怪的概念，只有一个<font color=#DD1144>可变参数列表</font>
```go
// numbers ...int这样写法就是可以传入任意个int类型的值
func sum(numbers ...int) int {
	s := 0
	for i := range numbers {
		s += numbers[i]
	}
	return s
}
```
这里面还用到了<font color=#DD1144>range</font>,它的用法我们后面还会仔细讲，这里的作用基本上就是能拿到`numebrs`这个容器中的所有`int`类型的参数，这个就是简单的<font color=#DD1144>可变参数列表</font>。

## 指针
`go`语言中的指针是个很重要的概念，但是也同时是一个简单的概念，它和`C++`中的指针相比就没有那么复杂了，主要的一个原因就是<font color=#DD1144>go语言中的指针不能运算，指针可以指向一个新的值，但是不能在原本的指针上像C++一样做++或者--的运算</font>，我们来看一下最简单的例子：
```go
func main() {
	var a int = 2
	var pa *int = &a  // 定义一个指向a变量的指针
	*pa = 3           // 通过pa指针拿到指针指向的值*pa(也就是变量a的值)
	fmt.Println(a)
}
```
说到指针，结合上面我们已经说完的这个函数，这里就有了新的问题:<font color=#DD1144>在go语言当中，参数传递是值传递还是引用传递？</font>说起这个问题，我们要先了解一下，在`C`或者`C++`中既有值传递，又有引用传递，在`java`或者`python`中绝大多数都是引用传递。

我们还是先来复习一下什么是值传递和引用传递,先来看一段`C++`代码
```c
void pass_by_val(int a) {
	a++;
}
void pass_by_ref(int& a) {
	a++;
}
int main() {
	int a = 3;
	pass_by_val(a);
	printf("After pass_by_val: %d\n", a);  // 3
 
	pass_by_ref(a);
		printf("After pass_by_val: %d\n", a); // 4
}
```
所以通过上面的一段代码，我们可以看到`a`变量在经过`pass_by_val`后它的值没有变，而经过`pass_by_ref`它的值变了，所以我们就能简单的知道什么是<font color=#1E90FF>值传递</font>什么是<font color=#1E90FF>引用传递</font>：
+ <font color=#3eaf7c>值传递</font>：传递的是值的一份拷贝，值的拷贝和原本的值虽然长的一样，但在计算机的内存中同一个东西。所以上述代码中传入`pass_by_val`的`a`和`main`中定义的`a`不是同一个东西。
+ <font color=#3eaf7c>引用传递</font>：传递的是一个指针，指针有唯一的一个变量的指向，所以`main`中的`a`和`pass_by_ref`中操作的是同一个`a`。

那么`go`语言当中使用的是什么传递呢？<font color=#DD1144>Go语言只有值传递一种方式</font>，虽然听起来好像只有值传递，在参数的传递上面都要做拷贝，性能好像是很低，<font color=#1E90FF>但是Go有指针啊，我们下面就来看看Go语言中的指针和值传递是怎么配合的</font>

<img :src="$withBase('/go_ont_zhizhen.png')" alt="指针类型">

+ <font color=#3eaf7c>普通的值传递如最上面所示，函数外部的a传入函数内部，但是两个a不是同一个变量或者属于内存的同一块区域</font>
+ <font color=#1E90FF>值传递和指针结合如图中间所示，&a和pa属于同一个指针，共同指向计算机当中的a变量所在的内存块，所以函数外部的a通过指针的值传递是可以传递到函数内部进行修改的</font>
+ <font color=#DD1144>cache我们还没有说，这种对象的结构是本身包含一个paData的指针，所以直接传递给函数作为参数，实际上就是在传递指针，函数内外的指针都能共同操作相同指向的data变量所属的内存块</font>

所以说完指针我们来讲个有趣的例子，交换两个变量的值：
```go
func swap(a, b *int) {
	*b, *a = *a, *b
}

func main() {
	a, b := 3, 4
	swap(&a, &b)
	fmt.Println(a, b) // 4 3 
}
```
