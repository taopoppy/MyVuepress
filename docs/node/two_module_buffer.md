# 核心模块 - buffer

## 核心概念
在引入`TypedArray`之前，`JavaScript`语言没有用于读取或操作二进制数据流的机制。官网上有一段关于`Buffer`的描述：
+ <font color=#DD1144>Buffer类是作为Node.js API 的一部分引入的，用于在 TCP 流、文件系统操作、以及其他上下文中与八位字节流进行交互</font>

虽然比较晦涩难懂，但是有两点值得注意：
+ `Buffer`是类，或者是一种特殊的数据结构，和常见的核心模块`fs`、`http`等等这种对象还一样
+ `Node.js`可以用来处理二进制流数据或者与之进行交互,可见`Buffer`和二进制有很密切的关系。

<font color=#CC99CD>Buffer用于读取或操作二进制数据流，做为Node.js API的一部分使用时无需require，用于操作网络协议、数据库、图片和文件 I/O 等一些需要大量二进制数据的场景。Buffer在创建时大小已经被确定且是无法调整的，在内存分配这块 Buffer 是由 C++ 层面提供而不是 V8 具体后面会讲解</font>

在这里不知道你是否认为这是很简单的？但是上面提到的一些关键词二进制、流（Stream）、缓冲区（Buffer），这些又都是什么呢？下面尝试做一些简单的介绍。

### 1. 二进制
二进制数据使用`0`和`1`两个数码来表示的数据，为了存储或展示一些数据，计算机需要先将这些数据转换为二进制来表示。例如，我想存储`66`这个数字，计算机会先将数字`66`转化为二进制`01000010表示

上面用数字举了一个示例，我们知道数字只是数据类型之一，其它的还有字符串、图像、文件等。例如我们对一个英文字母`L`操作，在`JavaScript`里通过`'L'.charCodeAt()`取到对应的ASCII码之后（通过以上的步骤）会转为二进制表示，<font color=#DD1144>所以对于这种字母L，计算机会先将其转化成为数字76，再将数字转化成为二进制数据</font>

可是问题又来了，计算机将字母转化成为数字的规则是什么？

### 2. 字符集
<font color=#DD1144>字符集已经定义好的表示每个字符的确切数字的规则</font>。

我们对这些规则有不同的定义，最流行的包括`Unicode`和`ASCII`。`JavaScript`可以很好地处理`Unicode`字符集。所以，浏览器中的`Unicode规`定76应该表示L。

### 3. 字符编码
正如有一些字符集规则定义数字应该怎么样表示字符一样，也有一些规则定义了数字应该如何在二进制文件中表示。

<font color=#DD1144>具体来说，就是用多少位来表示数字。这叫做字符编码</font>。

字符编码的一个规则是`UTF-8`。UTF-8声明字符应该以`bytes`编码。一个byte是8位（bit）的集合 —— 8个1和0。因此，<font color=#DD1144>UTF-8规定应该使用8个1和0来表示二进制中任何字符</font>。

之前的例子提到，数字12用二进制表示为 1100，但是用`UTF-8`表示应该是8位才对。所以`UTF-8`规定，计算机需要在不满8位的二进制数字左边添加更多的位，以使其成为一个字节。所以12应该存储为00001100。
因此 76 在UTF-8规则下存储表示为：01001100

这就是计算机在二进制文件中存储字符串或字符的方式。同样，计算机也规定了图片和视频应该如何转换、编码和存储在二进制文件中的规则。计算机将所有数据类型存储在二进制文件中。

通过使用字符编码，可实现`Buffer`实例与`JavaScript`字符串之间的相互转换，目前所支持的字符编码如下所示：
+ <font color=#3eaf7c>ascii</font> - 仅适用于 7 位 `ASCII`数据。此编码速度很快，如果设置则会剥离高位。
+ <font color=#3eaf7c>utf8</font> - 多字节编码的`Unicode`字符。许多网页和其他文档格式都使用 `UTF-8`。
+ <font color=#3eaf7c>utf16le</font> - 2 或 4 个字节，小端序编码的 Unicode 字符。支持代理对（U+10000 至 U+10FFFF）。
+ <font color=#3eaf7c>ucs2</font> - `utf16le` 的别名。
+ <font color=#3eaf7c>base64</font> - `Base64`编码。当从字符串创建`Buffer`时，此编码也会正确地接受 RFC 4648 第 5 节中指定的 “URL 和文件名安全字母”。
+ <font color=#3eaf7c>latin1</font>  - 一种将`Buffer`编码成单字节编码字符串的方法（由 RFC 1345 中的 IANA 定义，第 63 页，作为`Latin-1`的补充块和 C0/C1 控制码）。
+ <font color=#3eaf7c>binary</font> - `latin1` 的别名。
+ <font color=#3eaf7c>hex</font> - 将每个字节编码成两个十六进制的字符。
```javascript
const buf = Buffer.from('hello world', 'ascii');
console.log(buf.toString('hex')); // 68656c6c6f20776f726c64

const buf = Buffer.from('LLLLLLLL');
console.log(buf.toString('hex'))  // 4c4c4c4c4c4c4c4c
```
现在我们了解了什么是二进制数据，接下来我们介绍一下什么是二进制数据流。

### 3. Stream
流，英文`Stream`是对输入输出设备的抽象，这里的设备可以是文件、网络、内存等, <font color=#DD1144>而JavaScript中的Stream只是表示随着时间的推移从一个点移动到另一个点的数据序列</font>。

流是有方向性的，当程序从某个数据源读入数据，会开启一个输入流，这里的数据源可以是文件或者网络等，例如我们从`a.txt`文件读入数据。相反的当我们的程序需要写出数据到指定数据源（文件、网络等）时，则开启一个输出流。当有一些大文件操作时，我们就需要`Stream`像管道一样，一点一点的将数据流出。

我们现在有一大罐水需要浇一片菜地，如果我们将水罐的水一下全部倒入菜地，首先得需要有多么大的力气（这里的力气好比计算机中的硬件性能）才可搬得动。如果，我们拿来了水管将水一点一点流入我们的菜地，这个时候不要这么大力气就可完成。

关于`Stream`其实是一个更大的核心模块，但是它的基础却是`Buffer`，所以两者无法相互脱离，我们这里只是先简单介绍一下`Stream`的概念，后面一节我们会在理解`Buffer`的基础上详细讲解`Stream`


### 4. Buffer
通过以上`Stream`的讲解，我们已经看到数据是从一端流向另一端，那么他们是如何流动的呢？

通常，数据的移动是为了处理或者读取它，并根据它进行决策。伴随着时间的推移，每一个过程都会有一个最小或最大数据量。<font color=#CC99CD>如果数据到达的速度比进程消耗的速度快，那么少数早到达的数据会处于等待区等候被处理。反之，如果数据到达的速度比进程消耗的数据慢，那么早先到达的数据需要等待一定量的数据到达之后才能被处理。</font>

这里的等待区就指的缓冲区（Buffer），它是计算机中的一个小物理单位，通常位于计算机的`RAM`中。

无论什么情况，总有一个等待的地方。这就是`Node.js`的`Buffer`! `js`不能控制数据到达的速度或时间，也不能控制流的速度。它只能决定何时发送数据。如果还没有到时间，`Node.js`将把它们放在`buffer`中，即`RAM`中的一个小位置，直到将它们发送出去进行处理为止。

<font color=#1E90FF>**① 公交车案例**</font>

举一个公共汽车站乘车的例子，通常公共汽车会每隔几十分钟一趟，在这个时间到达之前就算乘客已经满了，车辆也不会提前发车，早到的乘客就需要先在车站进行等待。假设到达的乘客过多，后到的一部分则需要在公共汽车站等待下一趟车驶来。

在上面例子中的等待区公共汽车站，对应到我们的`Node.js`中也就是缓冲区（Buffer），另外乘客到达的速度是我们不能控制的，我们能控制的也只有何时发车，对应到我们的程序中就是我们无法控制数据流到达的时间，可以做的是能决定何时发送数据。

<font color=#1E90FF>**② 观看电影缓冲案例**</font>

我们在观看电影的时候，有一种情况是在线观看，如果你的网速很快，说明缓存的速度比播放的速度快，比如一秒能缓存5秒的视频量，那么基本上不存在卡顿的现象，因为你观看一秒，后面4秒的视频量已经在你观看的这一秒内同时传送过来了。如果5秒加载1秒的视频量，从一开始你就要等5秒，一次卡顿就是卡5秒，观影体验是极差的。

通过上面的概念介绍，我们来举一个字母`L`从输入到存储到计算机的表现形式和最终用`Buffer`表现的图示，来清楚的表达这样一个概念：<font color=#1E90FF>Buffer是一个类似于数组，默认以十六进制来保存资源在计算机当中的二进制形式</font>
<img :src="$withBase('/node_buffer_knowledge.png')" alt="Buffer和其他概念的关系">

通过上图我们也能清晰的看到数据在整个过程中的表现形式，图中在字符集和字符编码上分别使用的是`Unicode`和`utf8`，当然如果你问我为什么`Buffer`使用的是十六进制，我只能给你抛出两个结构：
+ Buffer< 4c 4c 4c 4c 4c 4c 4c 4c >
+ Buffer< 1001100 1001100 1001100 1001100 1001100 1001100 1001100 1001100 >  
肉眼可见的肯定是十六进制表达简单又容易理解，第二种二进制看的头都大了

## Buffer的基本使用
### 1. 创建Buffer
在引入`TypedArray`之前，`JavaScript`语言没有用于读取或操作二进制数据流的机制。 `Buffer`类是作为`Node.js API`的一部分引入的，用于在`TCP`流、文件系统操作、以及其他上下文中与八位字节流进行交互。

现在可以使用`TypedArray`， `Buffer`类以更优化和更适合`Node.js`的方式实现了`Uint8Array API`。

`Buffer`类的实例类似于从 0 到 255 之间的整数数组（其他整数会通过 ＆ 255 操作强制转换到此范围），但对应于 V8 堆外部的固定大小的原始内存分配。 `Buffer`的大小在创建时确定，且无法更改。

`Buffer`类在全局作用域中，因此无需使用`require('buffer').Buffer`。我们下面来看几个创建的例子
```javascript
// 创建一个长度为 10、且用零填充的 Buffer。
const buf1 = Buffer.alloc(10);  // <Buffer 00 00 00 00 00 00 00 00 00 00>

// 创建一个长度为 10、且用 0x1 填充的 Buffer。 
const buf2 = Buffer.alloc(10, 1);  // <Buffer 01 01 01 01 01 01 01 01 01 01>

// 创建一个长度为 10、且未初始化的 Buffer。
// 这个方法比调用 Buffer.alloc() 更快，
// 但返回的 Buffer 实例可能包含旧数据，
// 因此需要使用 fill() 或 write() 重写。
const buf3 = Buffer.allocUnsafe(10);

// 创建一个包含 [0x1, 0x2, 0x3] 的 Buffer。
const buf4 = Buffer.from([1, 2, 3]);  // <Buffer 01 02 03>

// 创建一个包含 UTF-8 字节 [0x74, 0xc3, 0xa9, 0x73, 0x74] 的 Buffer。
const buf5 = Buffer.from('tést');  // <Buffer 74 c3 a9 73 74>

// 创建一个包含 Latin-1 字节 [0x74, 0xe9, 0x73, 0x74] 的 Buffer。
const buf6 = Buffer.from('tést', 'latin1'); // <Buffer 74 e9 73 74>

```

### 2. Buffer常用属性
<font color=#1E90FF>**① Buffer.byteLength**</font>

这个表示整个`buffer`实际所占的字节数，因为不同的语言可能有不同的问题，比如<font color=#3eaf7c>英文字母在表达的时候一个字母就是一个字节，而中文稍微复杂，使用一个字节可能无法表达一个汉字，所以就用三个字节来表达汉字</font>：
```javascript
console.log(Buffer.byteLength('test'))  // 4
console.log(Buffer.byteLength('测试'))  // 6

console.log(Buffer.from('test').length) // 4
console.log(Buffer.from('测试').length) // 6

```

<font color=#1E90FF>**② Buffer.isBuffer**</font>

测试一个对象是不是`Buffer`
```javascript
console.log(Buffer.isBuffer({}))                     // false
console.log(Buffer.isBuffer(Buffer.from('test')))    // true
console.log(Buffer.isBuffer(Buffer.from([1,2,3])))   // true
```

<font color=#1E90FF>**③ Buffer.concat**</font>

拼接`Buffer`，注意的是里面不是传入多个`Buffer`对象，而是一个`Buffer`的数组
```javascript
const buf1 = Buffer.from('This ')
const buf2 = Buffer.from('is ')
const buf3 = Buffer.from('buffer ')
const buf4 = Buffer.from('test ')
const buf5 = Buffer.from('demo ')

const bufConcat = Buffer.concat([buf1,buf2,buf3,buf4,buf5])
console.log(bufConcat.toString()) // This is buffer test demo
```

<font color=#1E90FF>**④ 实例属性**</font>

+ <font color=#3eaf7c>buf.length</font>:返回内存中分配给`buf`的字节数。 不一定反映`buf`中可用数据的字节量。
+ <font color=#3eaf7c>buf.toString</font>:根据`encoding`指定的字符编码将`buf`解码成字符串
+ <font color=#3eaf7c>buf.fill</font>:用指定的`value`填充`buf`。 如果没有指定`offset`与 `end`，则填充整个`buf`
+ <font color=#3eaf7c>buf.equals</font>:如果`buf`与参数具有完全相同的字节，则返回`true`，否则返回`false`
+ <font color=#3eaf7c>buf.indexOf</font>:是否包含参数，包含则返回所在下标，不包含返回-1

### 3. 乱码的处理
在`Buffer`和字符串之间相互转化的时候经常会出现这个乱码，我们来看一下：
```javascript
const buf1 = Buffer.from('我正在学习')
console.log(buf1)  // <Buffer e6 88 91 e6 ad a3 e5 9c a8 e5 ad a6 e4 b9 a0>
for (let i = 0; i < buf1.length; i+=5) {
  const buf2 = Buffer.allocUnsafe(5)
  buf1.copy(buf2, 0, i)
  console.log(buf2)
  console.log(buf2.toString())

}
// <Buffer e6 88 91 e6 ad a3 e5 9c a8 e5 ad a6 e4 b9 a0>
// <Buffer e6 88 91 e6 ad>
// 我�
//<Buffer a3 e5 9c a8 e5>
// �在�
// <Buffer ad a6 e4 b9 a0>
// ��习
```
乱码的出现因为是汉字是三个字节的，现在11个字节不是三个倍数，没有办法正确按照每3个字节解析汉字，我们的解决方法是：<font color=#CC99CD>使用内置的string_decoder（字符串解码器）来解析Buffer</font>
```javascript
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8')

const buf1 = Buffer.from('我正在学习')
console.log(buf1)  // <Buffer e6 88 91 e6 ad a3 e5 9c a8 e5 ad a6 e4 b9 a0>
for (let i = 0; i < buf1.length; i+=5) {
  const buf2 = Buffer.allocUnsafe(5)
  buf1.copy(buf2, 0, i)
  console.log(decoder.write(buf2))
}
// <Buffer e6 88 91 e6 ad a3 e5 9c a8 e5 ad a6 e4 b9 a0>
//我
//正在
//学习

```
简单的说一下`string_decoder`的官网介绍：
+  <font color=#CC99CD>本质</font>：`string_decoder`模块提供了一个`API`，用于以保留编码的多字节 `UTF-8`和`UTF-16`字符的方式将`Buffer`对象解码为字符串
+ <font color=#CC99CD>原理</font>：将`Buffer`实例写入`StringDecoder`实例时，将使用内部缓冲区来确保已解码的字符串不包含任何不完整的多字节字符。 它们保存在缓冲区中，直到下一次调用 `stringDecoder.write()`或调用`stringDecoder.end()`为止

## Buffer的内存机制
## Buffer的应用场景
## Buffer拓展
**参考资料**

1. [Node.js 中的缓冲区（Buffer）究竟是什么？](https://juejin.im/post/5d3a3b8ff265da1b8d166323)
2. [彻底理解Node.js中的Buffer](https://juejin.im/post/5cbdc9006fb9a0324f17900f)
3. [Node JS Buffer使用理解](https://juejin.im/post/5b76e6a86fb9a019fe684018)
4. [深入浅出Node.js](https://max.book118.com/html/2015/1101/28282096.shtm)