# Go面向结构

## 结构体和方法
### 1. struct的概述
+ <font color=#1E90FF>go语言仅仅支持封装，不支持继承和多态</font>，这个其实是个好消息，因为继承和多态本身内容很多，而且使用起来规则规范也很烦人，所以`go`的设计者就弃用了这些功能，但是虽然没有继承和多态，但是后面还有接口的功能可以实现类似于继承和多态的功能，我们在后面<font color=#1E90FF>面向接口</font>的一章再去仔细研究。
+ <font color=#DD1144>go语言没有class，只有struct</font>

### 2. struct的定义
<font color=#1E90FF>**① struct的定义**</font>

我们首先来定义一个树的结构，或者按照你以前学习的语言理解为一个对象，并且创建一个空值的`struct`：
```go

// 结构的定义
type treeNode struct {
	value       int
	left, right *treeNode
}

func main() {
	// 结构的创建（空值）
	// 第一种方法
	var root treeNode

	// 第二种方法
	root1 := treeNode{}

	// 第三种方法（特殊）
	root2 := *new(treeNode) 

	fmt.Println(root)          // {0 <nil> <nil> }
	fmt.Println(root1)         // {0 <nil> <nil> }
	fmt.Println(root2)         // {0 <nil> <nil> }
	fmt.Println(new(treeNode)) // &{0 <nil> <nil> }

```
关于空值结构（或者空对象）的创建第三种方法比较特殊，<font color=#1E90FF>因为通过new(treeNode)出来的是个存放空treeNode的地址，我们需要通过这个地址拿到其中的struct</font>，所以你看到上面打印`new(treeNode)`的结果是`&{0 <nil> <nil> }`,`*new(treeNode)`的结果才是`{0 <nil> <nil> }`

我们再来看一个稍微完整的例子：
```go
// 结构的定义
type treeNode struct {
	value       int
	left, right *treeNode
}

func main() {
	root := treeNode{}
	fmt.Println(root) // {0 <nil> <nil> }

	root = treeNode{value: 3}
	root.left = &treeNode{}
	root.right = &treeNode{5, nil, nil}
	root.right.left = new(treeNode)

	nodes := []treeNode{
		{value: 3},
		{},
		{6, nil, &root},
	}
	fmt.Println(nodes)
	// [{3 <nil> <nil>} {0 <nil> <nil>} {6 <nil> 0xc0000044a0}]
}
```
通过上面这个小例子我们能看到这么几个注意的点：
+ <font color=#DD1144>go语言中使用指针并不像C++一样需要写成 root->left,没必要，无论指针还是普通的对象中的属性（Field），一律采用点（.）来访问成员</font>
+ <font color=#1E90FF>go语言中没有构造函数，毕竟定义struct的方法我们都已经讲了三种，但是我们可以通过工厂函数来控制struct的构造</font>

<font color=#1E90FF>**② 工厂和构造**</font>

之前说构造函数是不存在的，通过工厂函数我们可以实现类似构造的功能，来看下面的例子:
```go
// 结构的定义
type treeNode struct {
	value       int
	left, right *treeNode
}
// 工厂函数
func createNode(value int) *treeNode {
	return &treeNode{value: value}
}

func main() {
	root := treeNode{}
	fmt.Println(root) // {0 <nil> <nil> }

	root = treeNode{value: 3}
	root.left = &treeNode{}
	root.right = &treeNode{5, nil, nil}
	root.right.left = new(treeNode)
	root.right.right = createNode(2)
}
```
我们创建了一个工厂函数`createNode`，然后返回一个新创建的`struct`,但是有两个问题要特别关注：
+ <font color=#DD1144>我们在createNode创建的对象，然后返回的是一个局部变量的地址</font>，这个情况在`C++`中是一个典型的错误，但是`go`语言中局部变量的地址也可以返回。
+ <font color=#DD1144>既然能返回局部变量的地址，那这个局部变量的struct放在堆上还是栈上？</font>，在`C++`当中局部变量都是放在栈上的，函数执行完毕会自动释放，如果要放在堆中分配，必须手动的释放。其他的比如在`java`中基本都是在堆当中的，存在比较好的垃圾回收机制，<font color=#DD1144>对于go语言，系统认为你不需要知道，因为存在垃圾回收，也并没有很准确的分配规则</font>，比如一个函数返回的不是地址，可能就是在栈中，返回地址大概就是在堆中

### 3. struct的方法
给`struct`定义方法比较奇怪，<font color=#1E90FF>第一要定义在外面，第二写法很独特</font>
```go
// 结构的定义
type treeNode struct {
	value       int
	left, right *treeNode
}
// 定义了struct的一个方法printValue
func (node treeNode) printValue() {
	fmt.Println(node.value)
}
// 定义了struct的一个方法setValue
func (node *treeNode) setValue(value int) {
	if(node == nil) {
		fmt.Println("setting calue to nil node,Ignored")
		return 
	}
	node.value = value
}

func createNode(value int) *treeNode {
	return &treeNode{value: value}
}

func main() {
	root := treeNode{}
	fmt.Println(root) // {0 <nil> <nil> }

	root = treeNode{value: 3}
	root.left = &treeNode{}
	root.right = &treeNode{5, nil, nil}
	root.right.left = new(treeNode)
	root.right.right = createNode(2)

	root.printValue()
	root.setValue(10)
	root.right.left.setValue(4)
	root.right.left.printValue()
}
```
通过上面的这个例子，可以很有趣的看到`go`语言定义结构方法的过程极其有意思
+ <font color=#1E90FF>按照一般语言定义对象函数一定是在类中定义，并且对于实体调用都用的是 this </font>，<font color=#DD1144>但是在 go 语言中可以清晰的看到，结构 struct 的方法是定义在 struct 的外部，其次在方法名之前会有一个接受者的写法（node treeNode），意思就是调用该方法的 struct 必须要是 treeNode 类型的 struct，其次在函数内部可以通过 node 来作为调用改对象的实体对象使用，相当于 this 的功能</font>
+ <font color=#1E90FF>这种结构方法的定义虽然奇怪，但是实际上却是很好理解的，因为方法的定义顺序和方法的使用顺序是一致的，定义是 (node treeNode) printValue(param),调用的时候也是 root.printValue(param),这样想一下就不奇怪了</font>
+ <font color=#DD1144>还有对于接受者很重要的一点就是无论是 (node treeNode) 还是 (node *treeNode) 都是值传递，而且你会发现 root 作为 treeNode 类型也可以调用接受者为 *treeNode类型的 setValue 方法，因为接受者很智能，能自动从对象身上拿到指向它的指针</font>
+ 所以对于值接受者和指针接受者我们来做一下区分：
	+ <font color=#1E90FF>要改变内容必须使用指针接受者</font>
	+ <font color=#1E90FF>结构过大也考虑指针接受者</font>
	+ <font color=#1E90FF>一致性：如有指针接受者，最好都是指针接受者</font>
	+ <font color=#DD1144>最后注意一下，值接受者才是go语言特有的东西</font>

通过`struct`方法的定义和使用，你就发现了`go`语言的使用是非常零灵灵活的。灵活之处还不仅仅表现在这里，<font color=#DD1144>go语言中的nil指针也是很安全并且可以调用方法的</font>,比如我们在下面来写一个遍历方法：
```go
func (node *treeNode) traverse() {
	if node == nil {
		return
	}
	node.left.traverse()
	node.printValue()
	node.right.traverse()
}
```
基本上对于`node.left`和`node.right`都没有进行空指针的判断，因为空指针也能用，这种写法只在`Go`语言中有，如果在`C++`中就会报错。

## 包和封装
上述我们定义完方法后，我们要来学习封装，因为有些方法我们是希望可见的，有些是我们希望它不可见的，<font color=#1E90FF>go语言是通过命名的方式来做的</font>，<font color=#DD1144>go语言封装方法名字一般使用CamlCase（各个单词首字母大写的方式），如果是首字母大写，方法就是public，首字母小写，方法就是private</font>

我们知道在`public`和`private`在其他语言都是针对于对象实例本身来说的，但是在`go`语言中：<font color=#DD1144>public和private是针对包来说的</font>：
+ <font color=#1E90FF>每个目录一个包，包名和目录名不一定一样</font>
+ <font color=#1E90FF>main包比较特殊，包含了一个可执行的入口</font>
+ <font color=#DD1144>为结构定义的方法必须放在同一个包内，但可以是不同的文件</font>

然后我们修改前面的一些关于`treeNode`的例子：
```go
// tree/entry/entry.go
package main

import (
	"fmt"
	"learngo/tree"
)

func main() {
	root := tree.Node{Value: 3}
	fmt.Println(root) // {3 <nil> <nil> }
	root.Left = &tree.Node{}
	root.Right = &tree.Node{Value: 5}
	root.Right.Left = new(tree.Node)
	root.Left.Right = tree.CreateNode(2)
	root.Right.Left.SetValue(4)
	fmt.Println()
	root.Traverse()
}
```
```go
// tree/node.go
package tree
import "fmt"

type Node struct {
	Value       int
	Left, Right *Node
}
func (node Node) PrintValue() {
	fmt.Println(node.Value)
}
func (node *Node) SetValue(value int) {
	node.Value = value
}
func CreateNode(value int) *Node {
	return &Node{Value: value}
}
```
```go
// tree/trans.go
package tree

func (node *Node) Traverse() {
	if node == nil {
		return
	}
	node.Left.Traverse()
	node.PrintValue()
	node.Right.Traverse()
}
```
+ 可以看到对于`package main`，我们将其放在一个单独的目录下`tree/entry/entry.go`，因为一个目录下只能有一个包名，对于其他使用`tree`包的文件直接放在`tree`目录下即可
+ 利用`CamlCase`和首字母大小写的方式对定义共有和私有方法，可以供别的地方使用
+ 对于同一个`tree`包，结构`Node`的方法可以分别写在不同的文件中
+ <font color=#DD1144>在VsCode中，对于go-lint有一些我们不需要的代码规范，我们希望通过在文件/首选项/设置中设置Go:Lint Tool为golangci-lint</font>

## 扩展已有类型
如何扩充系统类型或者别人的类型：
+ <font color=#DD1144>使用别名</font>：最简单
+ <font color=#DD1144>使用组合</font>：最常用（因为在组合和别名之间一般无法做到无缝转化，所以组合更容易修改和维护）
+ <font color=#DD1144>使用内嵌</font>：最省事（对写代码和读代码的人要求较高，一般在它能帮我们节省一大批一大批代码的时候我们最适合使用）

### 1. 使用组合
```go
// tree/myTreeNode.go
package tree
// 定义一个扩展类型
type MyTreeNode struct {
	Node *Node
}
// 定义扩展类型的方法
func (myNode *MyTreeNode) PostOrder() {
	if myNode == nil || myNode.Node == nil {
		return
	}
	left := MyTreeNode{myNode.Node.Left}
	left.PostOrder()
	right := MyTreeNode{myNode.Node.Right}
	right.PostOrder()
	myNode.Node.PrintValue()
}
```
```go
// tree/entry/entry.go
package main
import (
	"fmt"
	"learngo/tree"
)

func main() {
	...
	myRoot := tree.MyTreeNode{Node: &root}
	myRoot.PostOrder()
}
```
从上面你可以看到，我们给`Node`这个结构定义一个扩展的方法，可以先定义一个扩展的类型`MyTreeNode`，然后给这个扩展的类型定义方法，特别要注意其中有个写法：<font color=#DD1144>MyTreeNode{myNode.Node.Left}</font>：<font color=#1E90FF>因为myNode.Node.Left的类型是Node，Node结构上是没有PostOrder方法的，所以我们要将其包装成为一个MyTreeNode类型，通过MyTreeNode类型就能调用PostOrder方法了，所以要明白这个写法</font>

### 2. 使用别名

```go
// Queue/queue/.go
package queue
type Queue []int

// 给切片定义一个push方法
func (q *Queue) Push(v int) {
	*q = append(*q, v)
}
// 给切片定义一个pop方法
func (q *Queue) Pop() int {
	head := (*q)[0]
	*q = (*q)[1:]
	return head
}
// 给切片定义一个判断为空的方法
func (q *Queue) IsEmpty() bool {
	return len(*q) == 0
}
```
```go
// Queue/entry/main.js
package main

import (
	"fmt"
	queue "learngo/Queue"
)
func main() {
	q := queue.Queue{1}
	q.Push(2) // [1 2]
	q.Push(3) // [1 2 3]
	fmt.Println(q)
	q.Pop() // [2 3]
	fmt.Println(q)
		fmt.Println(q.IsEmpty()) // false
}
```
+ 可以看到在我们通过使用别名的方法给切片`Slice`添加了三个方法，在`main`函数中`q`就是一个切片，只不过我们给他起了一个别名叫做`Queue`,通过起别名就能让`q`使用`Push`,`Pop`,`IsEmpty`方法。
+ 说白了就是：<font color=#1E90FF>定义一个新的类型Queue，相当于对系统的[]int进行了扩展</font>

### 3. 使用内嵌
使用内嵌的这种方式和使用组合的方式有这比较紧密的关系，我们来看看如何在<font color=#1E90FF>组合的基础上修改成为内嵌的方式</font>：
```go
type MyTreeNode struct {
	*Node // 之前组合的写法：Node *Node（最重要的第一步）
}

func (myNode *MyTreeNode) PostOrder() {
	if myNode == nil || myNode.Node == nil {
		return
	}
	left := MyTreeNode{myNode.Left} // 之前组合的写法：myNode.Node.Left
	left.PostOrder()
	right := MyTreeNode{myNode.Right} // 之前组合的写法：myNode.Node.Right
	right.PostOrder()
	myNode.PrintValue() // 之前组合的写法：myNode.Node.PrintValue()
}
```
可以很清楚的看到：<font color=#1E90FF>修改组合成为内嵌方式最重要的一步就是第一步，<font color=#DD1144>省略MyTreeNode中的Node的Fileds的名称</font>，之前我们是Node *Node，现在直接是 *Node</font>，这样做的好处有两个：
+ <font color=#1E90FF>就是写法简单，类似于ES6中属性和属性值如果名称相同，可以简写，Node *Node简写成为 *Node, *Node这个值对应的属性名还是Node，和值的名称保持一致</font>
+ <font color=#DD1144>通过第一步的缩写，所以在定义方法中的myNode.Node相关的属性和方法全部提了一层，提到了myNode身上，通俗的说，之前所有要通过myNode.Node调用的属性和方法现在直接通过myNode就能调用，这就是内嵌</font>

可是内嵌的好处还不仅如此，我们在之前的`main`函数中按照<font color=#DD1144>组合</font>的方式去写是这样：
```go
func main() {
	root := tree.MyTreeNode{&tree.Node{Value: 3}}
	root.Node.Left = &tree.Node{}
	root.Node.Right = &tree.Node{Value: 5}
	root.Node.Right.Left = new(tree.Node)
	root.Node.Left.Right = tree.CreateNode(2)
	root.Node.Right.Left.SetValue(4)
	fmt.Println()
	root.Node.Traverse()
	fmt.Println()
	root.PostOrder()
}
```
你会发现虽然定义`root`为`MyTreeNode`类型，但是你使用`Right`、`Left`、`Traverse()`这些本就在`Node`这个结构中的方法和属性，你就必须通过`root.Node`去调用，但是如果`MyTreeNode`是使用内嵌方式去写的话，凡是`root.Node`能调用的方法和属性都能通过`root`直接调用：
```go
func main() {
	root := tree.MyTreeNode{&tree.Node{Value: 3}}
	root.Left = &tree.Node{}
	root.Right = &tree.Node{Value: 5}
	root.Right.Left = new(tree.Node)
	root.Left.Right = tree.CreateNode(2)
	root.Right.Left.SetValue(4)
	fmt.Println()
	root.Traverse()
	fmt.Println()
	root.PostOrder()
}
```
所以我们一定要理解内嵌的含义：<font color=#DD1144>本质就是自己定义个有方法有属性的外壳，将已有的类型内嵌到其中，以达到扩展的效果</font>:

<img :src="$withBase('/go_one_neiqian.png')" alt="内嵌的本质">

