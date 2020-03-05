# Go的容器部分

## 数组和切片
### 1. 数组和切片的不同
对于字典和切片，我们首先要知道他们最重要的不同就是：
+ <font color=#1E90FF>数组类型的值的长度是固定的，而切片类型的值是可变长的</font>。
+ <font color=#1E90FF>Go语言的切片类型属于引用类型，同属引用类型的还有字典类型、通道类型、函数类型等；而Go语言的数组类型则属于值类型，同属值类型的有基础数据类型以及结构体类型</font>。

那既然说到`Go`语言当中的值类型和引用类型，我们还是要给一个确切的定义：
+ <font color=#3eaf7c>值类型</font>：这种类型的变量存储的就是存在于栈内存当中的值
+	<font color=#3eaf7c>引用类型</font>：这种类型的变量存储的是保存在堆内存当中某个内存的地址

### 2. 数组和切片的关系
但是实际上对于字典和切片，理解他们之间的关系才是最重要的:<font color=#DD1144>我们其实可以把切片看做是对数组的一层简单的封装，因为在每个切片的底层数据结构中，一定会包含一个数组。数组可以被叫做切片的底层数组，而切片也可以被看作是对数组的某个连续片段的引用。</font>

<font color=#DD1144>确切地说，一个切片的底层数组永远不会被替换。为什么？虽然在扩容的时候 Go 语言一定会生成新的底层数组，但是它也同时生成了新的切片。它只是把新的切片作为了新底层数组的窗口，而没有对原切片，及其底层数组做任何改动。</font>

关于使用`append`函数对切片进行操作的时候是有两种情况：
+ <font color=#1E90FF>在无需扩容时，append函数返回的是指向原底层数组的新切片</font>
+ <font color=#1E90FF>而在需要扩容时，append函数返回的是指向新底层数组的新切片。</font>


顺便说一下，<font color=#DD1144>只要新长度不会超过切片的原容量，那么使用append函数对其追加元素的时候就不会引起扩容。这只会使紧邻切片窗口右边的（底层数组中的）元素被新的元素替换掉</font>。如下代码所示：
```go
func main() {
	arr := []int{0, 1, 2, 3, 4, 5, 6, 7}
	fmt.Println(arr, len(arr), cap(arr)) // [0 1 2 3 4 5 6 7] 8 8

	s1 := arr[3:7]
	fmt.Println(s1, len(s1), cap(s1)) //[3 4 5 6] 4 5
	s1 = append(s1, 90)
	fmt.Println(s1, len(s1), cap(s1))    //[3 4 5 6 90] 5 5
	fmt.Println(arr, len(arr), cap(arr)) //[0 1 2 3 4 5 6 90] 8 8  // 最后一个元素被替换了
}
```
## 链表
`Go`语言的标准包`container`中包含了常用的容器类型，包括`container/list`,`container/heap`等等，其中<font color=#1E90FF>container/list</font>实现了一个双向链表，使用起来和其他语言的动态列表非常相似，包中导出了三个东西，<font color=#1E90FF>表示列表的List类型</font>、<font color=#1E90FF>表示列表元素的Element类型</font>和<font color=#1E90FF>创建List的New函数</font>。

`Element`是个结构体，但是其中的属性是任何类型，也就是说：<font color=#1E90FF>Element可以存储任何值</font>：
```go
type Element struct {
    Value interface{}  // 存储在该元素中的值
}
```

### 1. 开箱即用
<font color=#1E90FF>**① 就是为什么列表可以做到开箱即用**</font>

+ <font color=#3eaf7c>List和Element都是结构体类型。结构体类型有一个特点，那就是它们的零值都会是拥有特定结构，但是没有任何定制化内容的值，相当于一个空壳。值中的字段也都会被分别赋予各自类型的零值。</font>

<font color=#1E90FF>**② var l list.List声明的链表能用么**</font>

+ <font color=#3eaf7c>经过语句var a [2]int声明的变量a的值，将会是一个包含了两个0的整数数组。又比如，经过语句var s []int声明的变量s的值将会是一个[]int类型的、值为nil的切片。经过语句var l list.List声明的变量l的值将会是一个长度为0的链表。这个链表持有的根元素也将会是一个空壳，其中只会包含缺省的内容</font>。

+ <font color=#DD1144>那这样的链表我们可以直接拿来使用吗？答案是，可以的。这被称为“开箱即用（通过类型声明的变量，而不是链表包中New方法返回的变量）”。Go 语言标准库中很多结构体类型的程序实体都做到了开箱即用。这也是在编写可供别人使用的代码包（或者说程序库）时，我们推荐遵循的最佳实践之一。</font>

<font color=#1E90FF>**③ 开箱即用的原理是什么**</font>

+ <font color=#DD1144>关键在于它的“延迟初始化”机制</font>：<font color=#3eaf7c>所谓的延迟初始化，你可以理解为把初始化操作延后，仅在实际需要的时候才进行</font>。

<font color=#1E90FF>**④ 延迟初始化的优缺点，和Go语言是怎么平衡的**</font>

+ 延迟初始化的优点在于“延后”，它可以分散初始化操作带来的计算量和存储空间消耗。
+ 延迟初始化的缺点恰恰也在于“延后”。在调用链表的每个方法的时候，它们都需要先去判断链表是否已经被初始化，那这也会是一个计算量上的浪费。
+ <font color=#DD1144>而在Go语言中List和Element在结构上的特点，使得并不是所有的方法都要去先判断列表的存在，可以通过长度是否为0，以及指针是否相同等多样的方法作为链表方法使用的先决条件。这样巧妙的平衡了延迟初始化的优缺点，开箱即用，在性能上最优</font>


### 2. 链表的操作
<font color=#1E90FF>**① 添加元素的6个方法**</font>

```go
// 追加新元素到末尾，返回该元素指针
func (l *List) PushBack(v interface{}) *Element
// 追加另一个列表到末尾
func (l *List) PushBackList(other *List)
// 添加新元素到开头，返回该元素指针
func (l *List) PushFront(v interface{}) *Element
// 添加另一个列表到开头
func (l *List) PushFrontList(other *List)
// 在mark后面插入新元素，返回新元素指针
func (l *List) InsertAfter(v interface{}, mark *Element) *Element
// 在mark前插入新元素，返回新元素指针
func (l *List) InsertBefore(v interface{}, mark *Element) *Element
```
可以把自己生成的Element类型值传给链表吗？答案是<font color=#DD1144>不会接受，这些方法将不会对链表做出任何改动。因为我们自己生成的Element值并不在链表中，所以也就谈不上“在链表中移动元素”。更何况链表不允许我们把自己生成的Element值插入其中</font>

<font color=#1E90FF>**② 移动元素的4个方法**</font>

```go
// 移动e到mark之后
func (l *List) MoveAfter(e, mark *Element)
// 移动e到mark之前
func (l *List) MoveBefore(e, mark *Element)
// 移动e到末尾
func (l *List) MoveToBack(e *Element)
// 移动e到开头
func (l *List) MoveToFront(e *Element)
```

<font color=#1E90FF>**③ 访问元素和长度**</font>

```go
// 返回结尾元素
func (l *List) Back() *Element
// 返回开头元素
func (l *List) Front() *Element
// 获取列表长度
func (l *List) Len() int
```

<font color=#1E90FF>**④ 移除元素和清空**</font>

```go
// 移除e，返回e的值
func (l *List) Remove(e *Element) interface{}
// 清空列表
func (l *List) Init() *List
```

## 字典
`Go`语言的字典类型其实是一个哈希表（`hash table`）的特定实现,在这个实现中，键和元素的最大不同在于，键的类型是受限的，而元素却可以是任意类型的。

### 1. 哈希表的查找过程
我们要在哈希表中查找与某个键值对应的那个元素值：
+ 那么我们需要先<font color=#1E90FF>把键值作为参数传给这个哈希表</font>。
+ <font color=#1E90FF>哈希表会先用哈希函数（hash function）把键值转换为哈希值</font>。哈希值通常是一个无符号的整数。一个哈希表会持有一定数量的桶（bucket），我们也可以叫它哈希桶，这些哈希桶会均匀地储存其所属哈希表收纳的键 - 元素对。
+ <font color=#1E90FF>哈希表会先用这个键哈希值的低几位去定位到一个哈希桶</font>
+ 然后再去这个哈希桶中，<font color=#1E90FF>用被查找键的哈希值与这些哈希值逐个对比，看看是否有相等的</font>。
+ <font color=#DD1144>如果有相等的，那就再用键值本身去对比一次，键的哈希值和键值都相等，就说明查找到了匹配的键-元素对</font>

### 2. 字典的键类型的约束
我们在最前面基础概念讲`map`的时候，关于它的键我们说过一个特点：<font color=#1E90FF>字典的键类型受到这样的约束：除了slice，map，function的内建类型都可以作为key</font>，那么通过对上面的哈希表的查找过程了解了之后我们就能彻底回到这个问题：

+ <font color=#DD1144>在哈希桶中逐个对比哈希值，对比有相同的后，还要用键值本身对比，因为不同值的哈希值的是有可能相同的，术语叫做哈希碰撞，所以哈希值一样，键值也不一定一样，映射过程也无法进行，所以必须要对键类型之间对比</font>
+ <font color=#DD1144>而恰好在Go语言中，slice，map，function这个三个类型并不支持做判等操作，所以这样的约束是防止哈希表中存在你需要的键值对，但是是查不出来的情况发生</font>

通过上面的准确回答，你现在就明白了为什么字典的键类型有这样的约束，如果没有这样的约束，即使字典中存在你要查找的键值对，由于键值无法比较，就有可能会造成查不出来的结果。

所以针对上面的分析，应该优先考虑哪些类型作为字典的键类型？我们记得一个结论：<font color=#9400D3>优先选用数值类型和指针类型，通常情况下类型的宽度越小越好。如果非要选择字符串类型的话，最好对键值的长度进行额外的约束</font>。如果你想对这个问题有深入的研究，可以参考这个[网址](https://time.geekbang.org/column/intro/112)


**参考资料**

1. [Go语言List的使用与数据结构的选择](https://blog.csdn.net/weixin_42117918/article/details/81836625?depth_1-utm_source=distribute.pc_relevant.none-task&utm_source=distribute.pc_relevant.none-task)
2. [Go标准容器之List](https://blog.csdn.net/u011304970/article/details/72782412?depth_1-utm_source=distribute.pc_relevant.none-task&utm_source=distribute.pc_relevant.none-task)