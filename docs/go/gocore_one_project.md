# GO的工程文件

## 工作区和GOPATH
在下载安装包之后，安装成功`GO`语言的时候，我们需要来配置三个环境变量：
+ <font color=#3eaf7c>GOROOT</font>:`Go`语言安装根目录的路径，也就是`Go`语言的安装路径
+ <font color=#3eaf7c>GOPATH</font>:若干工作区目录的路径，就是我们自己定义的工作空间
+ <font color=#3eaf7c>GOBIN</font>:`GO`程序生成可执行文件的路径

现在我们就有一个非常重要的面试问题：<font color=#DD1144>设置GOPATH有什么意义</font>？

答：<font color=#1E90FF>可以简单的将GOPATH理解成GO语言的工作目录，它的值是一个目录的路径，也可以是多个目录的路径，每个目录都代表GO语言的一个工作区</font>

我们需要利用这些工作区，去放置`Go`语言的<font color=#DD1144>源码文件</font>（source file），以及安装后的<font color=#DD1144>归档文件</font>（archive file，即以`.a`为扩展名的文件）和<font color=#DD1144>可执行文件</font>（executable file），关于`GOPATH`和工作区,我们需要知道下面三个知识点:

### 1. GO源码的组成方式
+ `Go`语言的源码也是以代码包为基本组织单位的。在文件系统中，这些代码包其实是与目录一一对应的。由于目录可以有子目录，所以代码包也可以有子包。

+ 一个代码包中可以包含任意个以`.go`为扩展名的源码文件，这些源码文件都需要被声明属于同一个代码包。代码包的名称一般会与源码文件所在的目录同名。如果不同名，那么在构建、安装的过程中会以代码包名称为准.

+ 每个代码包都会有导入路径。代码包的导入路径是其他代码在使用该包中的程序实体时，需要引入的路径。在实际使用程序实体之前，我们必须使用`import`先导入其所在的代码包.

+ <font color=#DD1144>在工作区中，一个代码包的导入路径实际上就是从src子目录，到该包的实际存储位置的相对路径。（参照第二小节（源码安装后的结果）中的那张图）</font>

### 2. 源码安装后的结果
+ 我们都知道，源码文件通常会被放在某个工作区的`src`子目录下。那么在安装后如果产生了归档文件（以`.a`为扩展名的文件），就会放进该工作区的 `pkg`子目录；如果产生了可执行文件，就可能会放进该工作区的`bin`子目录。

+ 比如一个代码包的源码是放在：`GOPATH/工作区1/src/github.com/labstack/echo`中，则它安装的时候产生的归档文件的路径就是：`GOPATH/工作区1/pkg/linux_adm64/github.com/labstack/echo.a`

+ 归档文件的相对目录与`pkg`目录之间还有一级目录，叫做平台相关目录。平台相关目录的名称是由`build`（也称“构建”）的目标操作系统、下划线和目标计算架构的代号组成的。比如，构建某个代码包时的目标操作系统是`Linux`，目标计算架构是64位的，那么对应的平台相关目录就是   `linux_amd64`。

<img :src="$withBase('/gocore_one_gopath.png')" alt="工作区和GOPATH">

### 3. 构建和安装的过程
构建使用命令`go build`，安装使用命令`go install`。构建和安装代码包的时候都会执行编译、打包等操作，并且，这些操作生成的任何文件都会先被保存到某个临时的目录中。

+ 如果构建（`go build`）的是库源码文件，那么操作后产生的结果文件只会存在于临时目录中。这里的构建的主要意义在于检查和验证（或者说对第三方的包代码进行校验）。

+ 安装（`go install`）操作会先执行构建，然后还会进行链接操作，并且把结果文件搬运到指定目录。
  + 进一步说，如果安装的是库源码文件，那么结果文件（实际上就是归档文件）会被搬运到它所在工作区的`pkg `目录下的某个子目录中。
  + 如果安装的是命令源码文件，那么结果文件会被搬运到它所在工作区的 `bin`目录中，或者环境变量GOBIN指向的目录中。

## 命令源码文件
如果说到<font color=#DD1144>命令源码文件</font>，你可能会一脸蒙蔽，不知道是什么东西，但是说到`main`函数，你大概不会陌生，实际上命令源码文件的定义如下：
+ <font color=#1E90FF>命令源码文件是程序的运行入口，是每个可独立运行的程序必须拥有的。我们可以通过构建或安装，生成与其对应的可执行文件，后者一般会与该命令源码文件的直接父目录同名。</font>
+ <font color=#DD1144>如果一个源码文件声明属于main包，并且包含一个无参数声明且无结果声明的main函数，那么它就是命令源码文件</font>

### 1. 命令源码接受参数
我们直接上一个比较完整的例子，来演示如何拿到启动文件时传来的参数并使用
```go
// hello.go文件
package main

import (
	"flag"
	"fmt"
)

var name string

func init() {
	flag.StringVar(&name, "name", "everyone", "The greeting object")
}

func main() {
	flag.Parse()
	fmt.Printf("hello, %s\n", name)
}
```
按照上面的写法，我们就直接使用下面的命令启动，就能看到程序执行的结果是：`hello,taopoppy`
```go
go run hello.go -name="taopoppy"
```
+ <font color=#1E90FF>flag包是专门用于接收和解析命令参数的代码包</font>
+ <font color=#1E90FF>函数flag.StringVar接受4个参数</font>：
  + 第一个参数用户存储该命令参数值的地址，具体到代码中就是`va name string`当中的`name`变量
  + 第二个参数是指定该命令参数的名称，具体到代码中实际上是命令行中`-name="taopopy"`的`name`参数
  + 第三个参数指定在未追加该命令参数的默认值，也就是命令行不带`-name="taopoppy"`，程序会自动给代码中的`name`变量赋默认值`everyone`
  + 第四个参数，是命令参数的简短说明
+ <font color=#1E90FF>flag.Parse()是用于真正解析命令参数，并将值赋给相应变量的方法。也就是说flag.StringVar()函数其实是一种申明，flag.Parse()才是那个真正干活的人</font>
+ <font color=#1E90FF>flag.StringVar()函数的调用必须在所有命令参数存储载体的声明和设置之后，和在读取命令行参数值之前。说白了就是要在var name string和flag.StringVar()之后，在调用name变量之前</font>
+ <font color=#1E90FF>和flag.StringVar类似的函数flag.String，两者的区别是齁着会直接返回一个分配好的变量地址，我们可以修改上面代码为下</font>：
  ```go
  package main

  import (
    "flag"
    "fmt"
  )
  var name = flag.String("name", "everyone", "The greeting object") // name中保存的是地址

  func main() {
    flag.Parse()
    fmt.Printf("hello, %s\n", *name)
  }
  ```
  
### 2. 自定义参数说明
```go
// hello.go文件
package main

import (
	"flag"
	"fmt"
	"os"
)

var name string
var sex int

func init() {
	flag.StringVar(&name, "name", "everyone", "include your name")
	flag.IntVar(&sex, "sex", 1, "include your sex")
}

func main() {
	flag.Parse()
	fmt.Printf("hello, %s\n", name)
	fmt.Printf("hello, %d\n", sex)
}
```
比如说我们现在要启动一个文件，我们知道后面可以跟很多命令参数，但是现在我们不清楚有哪些可以写的参数，这些参数的含义又是什么，我们可以直接使用`go run xxx.go -help`,只要我们像上面的代码一样正确使用了`flag`这包中的函数，它就会在命令行中显示这样一种格式的参数说明：
```go
Usage of C:\Users\ADMINI~1\AppData\Local\Temp\go-build544414910\b001\exe\hello.exe:  // 地址
  -name string  // name的参数说明
        include your name (default "everyone")
  -sex int      // sex的参数说明
        include your sex (default 1)
exit status 2
```
但是有时候我们想自定义一些我们想用的格式，此时我们需要在代码中做一件事情：<font color=#DD1144>对变量flag.Usage重新赋值</font>。首先，<font color=#1E90FF>我们必须要在flag.Parse()函数执行前完成flag.Usage的赋值</font>：
```go
func main() {
  flag.Usage = func() {
    fmt.Fprintf(os.Stderr, "Usage of %s:\n", "question")
    flag.PrintDefaults()
	}
	flag.Parse()
	fmt.Printf("hello, %s\n", name)
	fmt.Printf("hello, %d\n", sex)
}
```
然后我们重新启动：然后就会按照我们在`flag.Usage`自定义函数中规定的格式显示参数说明。

不过我们最后还要提醒一下：<font color=#DD1144>我们在flag包中的一些函数（StringVar，Parse等等）,实际上都是在调用flag.CommandLine变量的对应方法</font>

## 库源码文件
库源码文件是不能被直接运行的源码文件，它仅用于存放程序实体，这些程序实体可以被其他代码使用，关于源码文件的注意点我们总结如下：
+ <font color=#1E90FF>同目录下的源码文件的代码包声明语句都要一致，它们同属于一个代码包</font>
+ <font color=#1E90FF>源码文件声明的代码包的名称可以与其所以在的目录名称不同</font>
  + <font color=#1E90FF>构建生成的结果文件的主名称与其父目录名称一致</font>
  + <font color=#1E90FF>外部使用import引入该包的时候路径和父目录路径一致</font>
  + <font color=#1E90FF>外部在代码中真正调用库源码的时候要以库源码内部规定的包声明一致</font>

`Go`语言中对于程序实体访问权限的规则如下：<font color=#DD1144>名称的首字母为答谢的程序实体才可以被当前包外的代码引用，否则就只能被当前包内的其他代码引用</font>

## 程序实体
### 1. 类型推断
<font color=#1E90FF>Go语言是静态类型的，一旦在初始化变量的时候确定了它的类型，之后就不可能再改变</font>，但是我们可以在声明变量的时候不指定类型，这样它可以被赋予任何类型的值，这样的原因就是：<font color=#DD1144>Go语言中变量类型的确定在编译器完成的</font>

`Go`语言支持两种变量定义的方式：
+ <font color=#3eaf7c>var完整式</font>：可以在变量后面跟类型，跟的话变量在书写代码的时候就确定了类型，不写的话，变量只有在编译的时候自动对变量值进行类型推断。
+ <font color=#3eaf7c>:= 短变量定义</font>：<font color=#1E90FF>重声明值可以在短变量定义中出现，并且是在多个变量声明中出现（给新变量赋值，给就变量赋新值）</font>

### 2. 作用域相关
<font color=#1E90FF>一个程序实体的作用域总是会被限制在某个代码块中，而这个作用域最大的用处，就是对程序实体的访问权限的控制</font>，我们来思考一下：如果一个变量与其外层代码块中的变量重名会出现什么状况？比如下面的代码：

```go
package main

import "fmt"
var block = "package"

func main() {
  block :="function"
  {
    block :="inner"
    fmt.Printf("The block is  %s\n",block) // inner
  }
  fmt.Printf("The block is  %s\n",block)// function
}
```
实际上对于变量查找的过程，任何程序实体都大概是下面这三个步骤：
+ 首先，代码引用变量的时候总会最优先查找当前代码块中的那个变量，注意，这里的`当前代码块`仅仅是引用变量的代码所在的那个代码块，并不包含任何子代码块。
+ 其次，如果当前代码块中没有生命以此为名的变量，程序会沿着代码块的嵌套关系，从直接包含当前代码块的那个代码块开始，一层层的查找
+ 一般情况下，程序会一直查到当前代码包代表的代码块，找不到，编译就会出问题（<font color=#1E90FF>特殊情况是，如果我们将代码包导入语句写成了import . XXxX，比如import . fmt，那么在当前源码文件中引用fmt.Printf函数的时候直接用Printf就可以了。这种特殊情况下，程序在查找当前源码文件后会先去查用这种方式导入的那些代码包</font>）

### 3. 变量重声明
我们这里有一个特别关键的问题：<font color=#DD1144>不同代码块中的重名变量与变量重声明中的变量区别到底在哪儿？</font>，我们将前者称为: <font color=#1E90FF>可重名变量</font>
+ <font color=#DD1144>变量重声明中的变量一定是在某一个代码块内的。注意，这里的“某一个代码块内”并不包含它的任何子代码块，否则就变成了“多个代码块之间”。而可重名变量指的正是在多个代码块之间由相同的标识符代表的变量。</font>
+ <font color=#1E90FF>变量重声明是对同一个变量的多次声明，这里的变量只有一个。而可重名变量中涉及的变量肯定是有多个的。</font>
+ <font color=#1E90FF>不论对变量重声明多少次，其类型必须始终一致，具体遵从它第一次被声明时给定的类型。而可重名变量之间不存在类似的限制，它们的类型可以是任意的。</font>
+ <font color=#1E90FF>如果可重名变量所在的代码块之间，存在直接或间接的嵌套关系，那么它们之间一定会存在“屏蔽”的现象。但是这种现象绝对不会在变量重声明的场景下出现。</font>
<img :src="$withBase('/go_one_kechongmingbianliang.png')" alt="可重名变量和变量重声明">

### 4. 类型断言
判断一个变量的类型如何判断，我们的答案是：<font color=#DD1144>通过类型断言表达式来判断变量类型</font>：
```go
var container = []string{"zero", "one", "two"}

func main() {
	container := map[int]string{0: "tao", 1: "bi", 2: "wang"}
	value, ok := interface{}(container).([]string) // 类型断言表达式
	if ok == true {
		fmt.Printf("The element is %q.\n", value[1])
	} else {
		fmt.Print("contrainer is not type of []string")
	}
}
```
关于上述代码中的类型断言表达式的解释如下：
+ <font color=#1E90FF>它包括了用来把container变量的值转换为空接口值的interface{}(container)。</font>
  + <font color=#3eaf7c>正式说明一下，类型断言表达式的语法形式是x.(T)。其中的x代表要被判断类型的值。这个值当下的类型必须是接口类型的，不过具体是哪个接口类型其实是无所谓的。所以，当这里的container变量类型不是任何的接口类型时，我们就需要先把它转成某个接口类型的值。如果container是某个接口类型的，那么这个类型断言表达式就可以是container.([]string)。</font>
  + <font color=#3eaf7c>在 Go 语言中，interface{}代表空接口，任何类型都是它的实现类型。现在你只要知道，任何类型的值都可以很方便地被转换成空接口的值就行了。</font>
+ <font color=#1E90FF>以及一个用于判断前者的类型是否为切片类型 []string 的 .([]string)。</font>
+ <font color=#1E90FF>这个表达式的结果可以被赋给两个变量，在这里由value和ok代表。变量ok是布尔（bool）类型的，它将代表类型判断的结果，true或false。如果是true，那么被判断的值将会被自动转换为[]string类型的值，并赋给变量value，否则value将被赋予nil（即“空”）</font>
<img :src="$withBase('/go_one_interface_change.png')" alt="类型断言">

### 5. 类型转换
类型转换表达式的基本写法是<font color=#DD1144>T(x)</font>：
+ 其中x可以是一个变量，可以是一个代表值的字面量（比如1.23和struct{}）
+ x被叫做源值，它的类型叫做源类型，T代表的类型就是目标类型

关于类型转换我们知道在`Go`语言中只有强制类型转换，转换的规则可以参见[语言规范](https://golang.google.cn/ref/spec#Conversions),如果你还不太了解关于编码的知识，我建议你先到本文的最后去看一下符合和编码的知识，再来看这里的类型转换，我们这里讲三个关键的转换的问题；

<font color=#1E90FF>**① 整数类型值、整数常量之间的类型转换**</font>

原则上只要源值在目标类型的可表示范围内就是合法的，但是我们要深入计算机对整数的运算过程，我们来看下面这个例子：
```go
var srcInt = int16(-255)
dstInt := int8(srcInt) // 1
```
+ <font color=#DD1144>整数在 Go 语言以及计算机中都是以补码的形式存储的。这主要是为了简化计算机对整数的运算过程。补码其实就是原码各位求反再加 1。</font>
+ <font color=#DD1144>比如，int16类型的值-255的补码是1111111100000001。如果我们把该值转换为int8类型的值，那么 Go 语言会把在较高位置（或者说最左边位置）上的 8 位二进制数直接截掉，从而得到00000001。</font>
+ <font color=#DD1144>又由于其最左边一位是0，表示它是个正整数，以及正整数的补码就等于其原码，所以dstInt的值就是1。</font>
+ <font color=#1E90FF>一定要记住，当整数值的类型的有效范围由宽变窄时，只需在补码形式下截掉一定数量的高位二进制数即可。类似的快刀斩乱麻规则还有：当把一个浮点数类型的值转换为整数类型值时，前者的小数部分会被全部截掉。</font>
<img :src="$withBase('/go_one_zhuanghuan.png')" alt="整数之间的转换">

<font color=#1E90FF>**② string和切片类型之间的互换**</font>
+ <font color=#DD1144>一个值从string类型向[]byte类型转换时代表以UTF-8编码的字符串会被拆分成零散，独立的字节，byte实际是uint8类型的别名</font>
+ <font color=#DD1144>一个值从string类型向[]rune类型转换时会代表着字符串会被拆分成为一个个Unicode字符，rune实际上是int32类型的别名</font>

如果你能理解上面的两句话的意思，那么我相信你也理解了我们之前所讲的[字符和字符串处理](https://www.taopoppy.cn/go/go_one_container.html#_3-%E5%AD%97%E7%AC%A6%E5%92%8C%E5%AD%97%E7%AC%A6%E4%B8%B2%E5%A4%84%E7%90%86),即使如此，我们下面还会用代码继续演示一遍，帮助大家记忆和理解的更牢固：

```go
package main

import "fmt"

func main() {
	s := "我叫james"

	bytes := []byte(s) // 转换成为utf8单个字节的源码，单个字节默认以十进制表示
	fmt.Println(bytes) // [230 136 145 229 143 171 106 97 109 101 115]

	for i, ch := range bytes {
		fmt.Printf("[%d %d],", i, ch) // utf8-10进制 [0 230],[1 136],[2 145],[3 229],[4 143],[5 171],[6 106],[7 97],[8 109],[9 101],[10 115]
		fmt.Printf("[%d %X],", i, ch) // utf8-16进制 [0 E6],[1 88],[2 91],[3 E5],[4 8F],[5 AB],[6 6A],[7 61],[8 6D],[9 65],[10 73]
		fmt.Printf("[%d %b],", i, ch) // utf8-2进制 [0 11100110],[1 10001000],[2 10010001],[3 11100101],[4 10001111],[5 10101011],[6 1101010],[7 1100001],[8 1101101],[9 1100101],[10 1110011]
	}

	unicodes := []rune(s) // 默认也是以十进制表示单个字符在Unicode字符集中对应的二进制
	fmt.Println(unicodes) // [25105 21483 106 97 109 101 115]

	for i, ch := range s {
		fmt.Printf("[%d %d],", i, ch) // Unicode-10进制 [0 25105],[3 21483],[6 106],[7 97],[8 109],[9 101],[10 115]
		fmt.Printf("[%d %X],", i, ch) // Unicode-16进制 [0 6211],[3 53EB],[6 6A],[7 61],[8 6D],[9 65],[10 73]
		fmt.Printf("[%d %b],", i, ch) // Unicode-2进制 [0 110001000010001],[3 101001111101011],[6 1101010],[7 1100001],[8 1101101],[9 1100101],[10 1110011]
		fmt.Printf("[%d %c],", i, ch) // Unicode-原始字符 [0 我],[3 叫],[6 j],[7 a],[8 m],[9 e],[10 s]
	}

	for i, ch := range unicodes {
		fmt.Printf("[%d %d],", i, ch) // Unicode-10进制 [0 25105],[3 21483],[6 106],[7 97],[8 109],[9 101],[10 115]
		fmt.Printf("[%d %X],", i, ch) // Unicode-16进制 [0 6211],[3 53EB],[6 6A],[7 61],[8 6D],[9 65],[10 73]
		fmt.Printf("[%d %b],", i, ch) // Unicode-2进制 [0 110001000010001],[3 101001111101011],[6 1101010],[7 1100001],[8 1101101],[9 1100101],[10 1110011]
		fmt.Printf("[%d %c],", i, ch) // Unicode-原始字符 [0 我],[3 叫],[6 j],[7 a],[8 m],[9 e],[10 s]
	}
}
```

## 符号和编码
### 1. ASCII
+ 我们知道，计算机内部，所有信息最终都是一个二进制值。每一个二进制位（bit）有0和1两种状态，<font color=#1E90FF>因此八个二进制位就可以组合出256种状态，这被称为一个字节（byte）</font>。也就是说，一个字节一共可以用来表示256种不同的状态，每一个状态对应一个符号，就是256个符号，从00000000到11111111。
上个世纪60年代，美国制定了一套字符编码，对英语字符与二进制位之间的关系，做了统一规定。这被称为`ASCII`码，一直沿用至今。

+ `ASCII`码一共规定了128个字符的编码，比如空格`SPACE`是32（二进制00100000），大写的字母`A`是65（二进制01000001）。这128个符号（包括32个不能打印出来的控制符号），只占用了一个字节的后面7位，最前面的一位统一规定为0。

+ 英语用128个符号编码就够了，但是用来表示其他语言，128个符号是不够的。比如，在法语中，字母上方有注音符号，它就无法用 ASCII 码表示。于是，一些欧洲国家就决定，利用字节中闲置的最高位编入新的符号。比如，法语中的é的编码为130（二进制10000010）。这样一来，这些欧洲国家使用的编码体系，可以表示最多256个符号。

+ 但是，这里又出现了新的问题。不同的国家有不同的字母，因此，哪怕它们都使用256个符号的编码方式，代表的字母却不一样。比如，130在法语编码中代表了`é`，在希伯来语编码中却代表了字母`Gimel (ג)`，在俄语编码中又会代表另一个符号。但是不管怎样，所有这些编码方式中，0--127表示的符号是一样的，不一样的只是128--255的这一段。

+ 至于亚洲国家的文字，使用的符号就更多了，汉字就多达10万左右。一个字节只能表示256种符号，肯定是不够的，就必须使用多个字节表达一个符号。比如，简体中文常见的编码方式是 GB2312，使用两个字节表示一个汉字，所以理论上最多可以表示 256 x 256 = 65536 个符号

### 2. Unicode
+ 正如上一节所说，世界上存在着多种编码方式，同一个二进制数字可以被解释成不同的符号。因此，要想打开一个文本文件，就必须知道它的编码方式，否则用错误的编码方式解读，就会出现乱码。为什么电子邮件常常出现乱码？就是因为发信人和收信人使用的编码方式不一样。

+ <font color=#DD1144>可以想象，如果有一种编码，将世界上所有的符号都纳入其中。每一个符号都给予一个独一无二的编码，那么乱码问题就会消失。这就是 Unicode</font>.就像它的名字都表示的，这是一种所有符号的编码。

+ `Unicode`当然是一个很大的集合，现在的规模可以容纳100多万个符号。每个符号的编码都不一样，比如，U+0639表示阿拉伯字母Ain，U+0041表示英语的大写字母A，U+4E25表示汉字严。具体的符号对应表，可以查询[unicode.org](http://www.unicode.org/)，或者专门的[汉字对应表](http://www.chi2ko.com/tool/CJK.htm)。

+ 需要注意的是，<font color=#DD1144>Unicode 只是一个符号集，它只规定了符号的二进制代码，却没有规定这个二进制代码应该如何存储</font>。

+ 比如，汉字严的`Unicode`是十六进制数4E25，转换成二进制数足足有15位（100111000100101），也就是说，这个符号的表示至少需要2个字节。表示其他更大的符号，可能需要3个字节或者4个字节，甚至更多。

+ 这里就有两个严重的问题:
  + 第一个问题是:<font color=#1E90FF>如何才能区别 Unicode 和 ASCII ？计算机怎么知道三个字节表示一个符号，而不是分别表示三个符号呢</font>？
  + 第二个问题是:<font color=#1E90FF>我们已经知道，英文字母只用一个字节表示就够了，如果 Unicode 统一规定，每个符号用三个或四个字节表示，那么每个英文字母前都必然有二到三个字节是0，这对于存储来说是极大的浪费，文本文件的大小会因此大出二三倍，这是无法接受的</font>

+ 它们造成的结果是：
  + 出现了`Unicode`的多种存储方式，也就是说有许多种不同的二进制格式，可以用来表示`Unicode`。
  + `Unicode`在很长一段时间内无法推广，直到互联网的出现。

### 3. UTF-8
+ 互联网的普及，强烈要求出现一种统一的编码方式。<font color=#DD1144>UTF-8 就是在互联网上使用最广的一种 Unicode 的实现方式</font>。其他实现方式还包括`UTF-16`（字符用两个字节或四个字节表示）和`UTF-32`（字符用四个字节表示），不过在互联网上基本不用。重复一遍，这里的关系是:<font color=#1E90FF>UTF-8 是 Unicode 的实现方式之一</font>。

+ `UTF-8`最大的一个特点，就是它是一种变长的编码方式。它可以使用1~4个字节表示一个符号，根据不同的符号而变化字节长度。`UTF-8`的编码规则很简单，只有二条：
  + 1）对于单字节的符号，字节的第一位设为0，后面7位为这个符号的`Unicode`码。因此对于英语字母，`UTF-8`编码和`ASCII`码是相同的。
  + 2）对于n字节的符号（n > 1），第一个字节的前n位都设为1，第n + 1位设为0，后面字节的前两位一律设为10。剩下的没有提及的二进制位，全部为这个符号的`Unicode`码。

下表总结了<font color=#DD1144>编码规则表</font>，字母x表示可用编码的位:
<img :src="$withBase('/gocore_one_jinzhishu.png')" alt="Unicode和UTF-8">

+ <font color=#1E90FF>计算机解读UTF-8编码非常简单。如果一个字节的第一位是0，则这个字节单独就是一个字符</font>。
+ <font color=#1E90FF>如果第一位是1，则连续有n个1，就表示当前字符占用n个字节，计算机就知道这n个字节应该共同表示的是一个字符</font>。

### 4. 总结实践
我们这里要总结一下`ASCII`、`Unicode`和`UTF-8`三者之间的关系，并且通过一个实际的转换案例来巩固：
<img :src="$withBase('/gocore_one_utf_unicode.png')" alt="utf8和unicode关系">

下面我们来举个案例：
<img :src="$withBase('/gocore_one_yanzi.png')" alt="严字的转换过程">

<font color=#1E90FF>“严”字的 Unicode 是4E25（100111000100101），根据前面的编码规则表，可以发现4E25处在第三行的范围内（0000 0800 - 0000 FFFF），因此严的 UTF-8 编码需要三个字节，即格式是1110xxxx 10xxxxxx 10xxxxxx。然后，从严的最后一个二进制位开始，依次从后向前填入格式中的x，多出的位补0。这样就得到了，严的 UTF-8 编码是11100100 10111000 10100101，转换成十六进制就是E4B8A5</font>

**参考资料**

1. [Go语言核心36讲](https://time.geekbang.org/column/intro/112)
2. [Go模块简明教程(Go语言依赖包管理工具)](https://segmentfault.com/a/1190000016146377)
3. [ASCII，Unicode和UTF-8终于找到一个能完全搞清楚的文章了](https://blog.csdn.net/Deft_MKJing/article/details/79460485?depth_1-utm_source=distribute.pc_relevant.none-task&utm_source=distribute.pc_relevant.none-task)
