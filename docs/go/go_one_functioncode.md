# Go函数式编程

## 函数与闭包
`Go`语言中的函数是一个比较重要的概念，因为<font color=#1E90FF>函数是一等公民：参数，变量，返回值都可以是函数</font>，所以函数有更高级的用法，比如<font color=#DD1144>高阶函数</font>和<font color=#DD1144>函数闭包</font>

那么正统的函数式编程有哪些特点？
+ <font color=#3eaf7c>不可变性</font>：<font color=#1E90FF>不能有状态，只有常量和函数</font>
+ <font color=#1E90FF>函数只能有一个参数</font>

那么`Go`语言是一个通用性的语言，使用特别正统的函数式编程可能用起来这个可读性非常差，那么`Go`语言实际上不会在函数式编程上做太大的文章，所以使用`Go`语言来讲函数式编程我们不会太死搬教条，当然完全遵循函数式编程，用`Go`也能实现。

我们先来讲一下什么是<font color=#DD1144>闭包</font>：  
<font color=#1E90FF>闭包呢首先在一个函数当中存在局部变量和自由变量，局部变量是函数体内部申明的局部变量，而自由变量是引用外部的变量，编译器知道它本身不属于改函数体内部，于是会连接一条线去找它定义的出处，这个自由变量可能是个变量，也可能是个结构，结构呢编译器又会连接一条线去寻找它的出处，这样一直连接下去，形成一棵树，<font color=#DD1144>所以闭包就是这样一种包含一套自由变量连接关系的一个函数体</font></font>：

<img :src="$withBase('/go_one_bibao.png')" alt="闭包的概念">

我们下面具体举个例子来看看闭包的表现：
```go
func adder() func(v int) int {
	sum := 0
	return func(v int) int {   // 闭包
		sum += v
		return sum
	}
}

func main() {
	a := adder()
	for i := 0; i < 10; i++ {
		fmt.Println(a(i))
	}
}
```
首先我们要看懂`adder`函数的写法，`adder`的返回值是个函数类型`func(v int) int`,也就是返回值是一个`int`参数类型和返回值也是`int`类型的函数，所以对于`adder`返回值，就是那个匿名函数就是我们俗称的闭包，在上述代码中也已经标注了出来，为什么它是闭包呢？<font color=#1E90FF>首先它包含了v这样的局部变量，函数参数都是函数内部的局部变量，但是sum是外部的东西，而且准确的说是adder函数中的局部变量，所以由sum这个自由变量会连接一条线到adder中去</font>，所以从内存的角度来讲：<font color=#DD1144>在main函数中执行adder函数后，adder函数中的局部变量sum并不会马上释放内存，因为闭包有一个条线连接到了它，adder函数就知道sum在外部还有人用，直到循环结束，闭包不再用了，闭包内存释放的时候，通过那条线告诉adder，我已经不用sum了，此时sum才被释放</font>，这也是我们`javascritp`中说的闭包的概念：闭包是能使用外部函数当中变量的函数。

上述实际上就是一个使用`Go`来实现函数式编程的例子，但是正统的函数式编程是不能有变量的，那我们强行来实现一下：
```go
// 递归的定义
type iAdder func(int) (int, iAdder)

func adder2(base int) iAdder {
	return func(v int) (int, iAdder) {
		return base + v, adder2(base + v)
	}
}

func main() {
	a := adder2(0)
	for i := 0; i < 10; i++ {
		var s int
		s, a = a(i)
		fmt.Println(s)
	}
}
```
上面就是一个函数式编程的例子，虽然比较难懂，但是你仔细阅读一下还是能理解

## 斐波那契数列

## 为函数实现接口

## 使用函数来遍历二叉树