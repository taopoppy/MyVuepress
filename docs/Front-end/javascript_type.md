# JS中的六个基本类型

JavaScript语言的每一个值都属于某一种数据类型。JavaScript语言规定了7种语言类型。语言类型广泛用于变量、函数参数、表达式、函数返回值等场合。根据最新的语言标准，这7种语言类型是：

- Undefined；
- Null；
- Boolean；
- String；
- Number；
- Symbol；
- Object

## Undefined 类型

### 1. ECMA官网[定义](https://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types-undefined-type)

`The Undefined type has exactly one value, called undefined. Any variable that has not been assigned a value has the value undefined.`

这句话的意思就是: `Undefined类型只有唯一的一个值，undefined，任何变量没有被定义(赋值)都有一个值undefined`

### 2. undefined的本质

<font color=#3eaf7c>**undefined是全局对象的一个属性。也就是说，它是全局作用域的一个变量，并非一个关键字。undefined的最初值就是原始数据类型undefined。自ECMAscript5标准以来undefined是一个不能被配置（non-configurable），不能被重写（non-writable），不能被列举（no-enumerable）的属性**</font>

首先undefined是全局对象的属性，也就是在浏览器中: `window.undefined(属性): undefined(值)`或者`undefined(变量): undefined(值)`,也就是说undefined这个单词既是window的属性，也是window.undefined这个属性的值，写一段代码来演示一下:
```javascript
let name = 'str'   // name(变量): 'str'(值)
let name1 = name   // name(变量)
console.log(name1) // 'str'(值)

let sex            // 相当于let sex = window.undefined(变量) 或者 let sex = undefined(变量)
console.log(sex)   // undefined(值)
```
所以你现在应该明白`name(变量): 'str'(值)`和`window.undefined(变量): undefined(值)`或者`undefined(变量): undefined(值)`其实是一样的，声明`sex`并不是没有赋值，而是将`window.undefined(或者undefined)`这个变量的值`undefined`赋值给了sex

### 3. undefined的用处

因为undefined 的字面意思就是：未定义的值 。这个值的语义是，希望表示一个变量最原始的状态，而非人为操作的结果，这种原始状态会在以下 5 种场景中出现：

+ 变量被声明了，但没有赋值时，就等于undefined。
+ 调用函数时，应该提供的参数没有提供，该参数等于undefined。
+ 对象没有赋值的属性，该属性的值为undefined。
+ 函数没有返回值时(没有写return或者return后面没有东西)，默认返回undefined。
+ 通过void对表达式求值

### 4. void 0 代替undefined

首先根据[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/void)所述: void 运算符 对给定的表达式进行求值，然后返回 undefined。

其次undefined我们之前就说了它是个变量，不是关键字，<font color=#3eaf7c>**所以void 0代替undefined的目的在于明确表示undefined在这里以值的身份出现，因为undefined以变量身份出现，值有可能被篡改为undefined以外的值**</font>
+ 因为 undefined 不是保留字（Reserved Word），它只是全局对象的一个属性，在低版本的IE浏览器中会被重写。
  ```javascript
  var undefined = 10;

  alert(undefined); 
  // undefined -- chrome 
  // 10 -- IE 8
  ```
+ 在局部作用域中 undefined 还是可以被重写
  ```javascript
  (function() {
    var undefined = 10;

    alert(undefined);// 10 -- chrome
  })();
  ```

## Null 类型

### 1. ECMA官网[定义](https://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types-undefined-type)

`The Null type has exactly one value, called null.`

这句话的意思就是: `Null类型只有唯一的一个值，null`

### 2. null的本质

null 是表示缺少的标识，指示变量未指向任何对象。把 null 作为尚未创建的对象，也许更好理解。希望表示 一个对象被人为的重置为空对象，而非一个变量最原始的状态 。<font color=#3eaf7c>**null在内存里的表示就是，栈中的变量没有指向堆中的内存对象**</font>

<img :src="$withBase('/null.png')" alt="null的内存状态">

所以当一个对象被赋值了null 以后，原来的对象在内存中就处于游离状态，GC 会择机回收该对象并释放内存。因此，如果需要释放某个对象，就将变量设置为 null，即表示该对象已经被清空，目前无效状态。

### 3. null的用处

+ 作为函数的参数，表示该函数的参数不是对象。
+ 作为对象原型链的终点。
  ```javascript
  Object.getPrototypeOf(Object.prototype)  // null
  ```
+ 显式指定变量为无效(object= null)
+ 当一个引用不再是必需的。通过分配`null`值，有效地清除引用，并假设对象没有引用其他代码，指定垃圾收集，确保回收内存。

### 4. typeof null 为 'object'

`null`有属于自己的类型`Null`，而不属于`Object`类型，`typeof`之所以会判定为`Object`类型，是因为`JavaScript`数据类型在底层都是以二进制的形式表示的，二进制的前三位为 0 会被`typeof`判断为对象类型，而`null`的二进制位恰好都是`0`，因此`null`被误判断为`Object`类型。

```javascript
000 - 对象，数据是对象的应用
1 - 整型，数据是31位带符号整数
010 - 双精度类型，数据是双精度数字
100 - 字符串，数据是字符串
110 - 布尔类型，数据是布尔值
```
### 5. null和undefined的区别(重点)

+ `null`表示`无值`,即该处不应该有值，也没有指向任何对象或者任何值，而`undefined`表示`缺少值`,表示应该有值，但是还没有定义，所以先指向全局变量`window.undefined`或者`undefined`来代替那个还没有定义的值
+ `null`和`undefined`还要注意: 两者的值相同，但是类型不同
  ```javascript
  let name           // name: undefined
  name == null       // true
  name === null      // false

  let sex = null     // sex:null
  sex == undefined   // true
  sex === undefined  // false
  ```
  所以你可以看到使用 `==`只判断值的时候，`null`和`undefined`是一样的，但是使用`===`的时候，需要做类型判断，`null`的类型为`Null`,`undefined`的类型为`Undefined`,两个类型判断如下
  ```javascript
  Object.prototype.toString.call(null); // [object Null]
  Object.prototype.toString.call(undefined); // [object Undefined]
  ```

## Boolean 类型

### 1. ECMA官网[定义](https://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types-boolean-type)

`The Boolean type represents a logical entity having two values, called true and false.`

这句话的意思是: `Boolean类型代表一个逻辑实体，它有两个值true和false`

### 2.false 与 true

+ 其值为 `0`、`-0`、`null`、`false`、`NaN`、`undefined`、或者空字符串`（""）`，则生成的`Boolean`对象的值为`false`。如果传入的参数是`DOM`对象`document.all`，也会生成值为`false`的`Boolean`对象

+ 任何其他的值，包括值为`"false"`的字符串和任何不是`undefined`和`null`的对象，包括值为`false`的`Boolean`对象，都会创建一个值为`true`的`Boolean`对象

+ 不要将基本类型中的布尔值`true`和`false`与值为`true`和`false`的`Boolean`对象弄混了。我们在条件当中判断的唯一条件就是通过Boolean(xxx)的结果是`true`还是`false`
  ```javascript
  let x = new Boolean(false)
  let a = new Boolean(null)
  let b = new Boolean(undefined)
  Boolean(x)   // true
  Boolean(a)   // true
  Boolean(b)   // true
  if(x){ // 这里的代码会被执行,因为x虽然值为false，但是整体上是一个不为null或者undefiend的对象,同理a和b }

  let c = null
  let d = undefined
  Boolean(c)  // false
  Boolean(d)  // false
  ```

+ 将任何类型转化成为true或者false这样的boolean值，我只推荐使用Boolean()转换函数
  ```javascript
  var x = Boolean(expression);     // 推荐
  var x = new Boolean(expression); // 不太好
  ```

### 3. 总结

其实就记住一句话，判读一个变量通过Boolean()转化函数得到的结果到底是`true`还是`false`,只需要看**这个变量到底是值还是对象，是对象永远是`true`，管你是`new Boolean(false)`、`new Boolean(null)`还是`new Boolean(undefined)`。是值的话，属于`0`、`-0`、`null`、`false`、`NaN`、`undefined`、`（""）`其中任何一个结果就是`false`**

<mermaid>
graph LR
  A["Boolean(x)"] --> B{X}
  B --> C["X是对象"]
  B --> D["X是值"]
  C --> E["Boolean(x):true"]
  D --> F["0、-0、null、false、NaN、undefined、"""]
  D --> G["其他值"]
  F --> H["Boolean(x):false"]
  G --> I["Boolean(x):true"]
</mermaid>

## String 类型

### 1. ECMA官网[定义](https://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types-string-type)
`The String type is the set of all ordered sequences of zero or more 16-bit unsigned integer values (“elements”) up to a maximum length of 253-1 elements. The String type is generally used to represent textual data in a running ECMAScript program, in which case each element in the String is treated as a UTF-16 code unit value. Each element is regarded as occupying a position within the sequence. These positions are indexed with nonnegative integers. The first element (if any) is at index 0, the next element (if any) at index 1, and so on. The length of a String is the number of elements (i.e., 16-bit values) within it. The empty String has length zero and therefore contains no elements.`

这句话的意思是: `String类型是零个或多个16位无符号整数值（“元素”）的所有有序序列的集合，最大长度为2^53-1个元素。 String类型通常用于表示正在运行的ECMAScript程序中的文本数据，在这种情况下，String中的每个元素都被视为UTF-16代码单元值。每个元素被视为占据序列内的位置。这些位置用非负整数索引。第一个元素（如果有）位于索引0，索引为1的下一个元素（如果有），依此类推。 String的长度是其中的元素数（即16位值）。空String的长度为零，因此不包含任何元素。`

### 2. Unicode与UTF

现行的字符集国际标准，字符是以`Unicode`的方式表示的，每一个`Unicode`的码点表示一个字符，理论上,`Unicode`的范围是无限的。`UTF`是`Unicode`的编码方式，规定了码点在计算机中的表示方法，常见的有`UTF16`和`UTF8`。 `Unicode`的码点通常用`U+???`来表示，其中`???`是十六进制的码点值。 0-65536（U+0000 - U+FFFF）的码点被称为基本字符区域（BMP）

### 3. 字符串有没有最大长度

`String`用于表示文本数据。`String`有最大长度是`2^53 - 1`，这在一般开发中都是够用的，但是有趣的是，这个所谓最大长度，并不完全是你理解中的字符数。

因为`String`的意义并非“字符串”，而是字符串的`UTF16`编码，我们字符串的操作`charAt`、`charCodeAt`、`length` 等方法针对的都是`UTF16`编码。所以，字符串的最大长度，实际上是受字符串的编码长度影响的。也就说在现在`javascript`使用`UTF16`编码方式，对应`String`最大长度是`2^53-1`，如果使用`UTF8`或者`UTF32`，对应的长度也会变化，不再是`2^53-1`。

## Number 类型

### 1. ECMA官网[定义](https://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types-number-type)

`The Number type has exactly 18437736874454810627 (that is, 264-253+3) values, representing the double-precision 64-bit format IEEE 754-2008 values as specified in the IEEE Standard for Binary Floating-Point Arithmetic, except that the 9007199254740990 (that is, 253-2) distinct “Not-a-Number” values of the IEEE Standard are represented in ECMAScript as a single special NaN value. (Note that the NaN value is produced by the program expression NaN.) In some implementations, external code might be able to detect a difference between various Not-a-Number values, but such behaviour is implementation-dependent; to ECMAScript code, all NaN values are indistinguishable from each other.`

这句话意思大概是: `Number类型具有18437736874454810627（即2^64-2^53 + 3）值，表示IEEE标准二进制浮点运算中指定的双精度64位格式IEEE 754-2008值，但9007199254740990（也就是说，IEEE标准的2^53-2）不同的“非数字”值在ECMAScript中表示为单个特殊的NaN值。 （注意，NaN值是由程序表达式NaN产生的。）在某些实现中，外部代码可能能够检测各种Not-a-Number值之间的差异，但这种行为依赖于实现;对于ECMAScript代码，所有NaN值都无法区分。`

### 2. Number的基础描述
JavaScript中的Number类型有 18437736874454810627(即2^64-2^53+3) 个值。

JavaScript 中的 Number 类型基本符合 IEEE 754-2008 规定的双精度浮点数规则，但是JavaScript为了表达几个额外的语言场景（比如不让除以0出错，而引入了无穷大的概念），规定了几个例外情况：

+ NaN，占用了 9007199254740990，这原本是符合IEEE规则的数字；
+ Infinity，无穷大；
+ -Infinity，负无穷大。
另外，值得注意的是，JavaScript中有 +0 和 -0，在加法类运算中它们没有区别，但是除法的场合则需要特别留意区分，“忘记检测除以-0，而得到负无穷大”的情况经常会导致错误，而区分 +0 和 -0 的方式，正是检测 1/x 是 Infinity 还是 -Infinity。

根据双精度浮点数的定义，Number类型中有效的整数范围是-0x1fffffffffffff至0x1fffffffffffff，所以Number无法精确表示此范围外的整数。

### 3. 储存结构

在 IEEE754 中，双精度浮点数采用 64 位存储，即 8 个字节表示一个浮点数 。其存储结构如下图所示：(下面的图你能看的懂就看，看不懂就忽略，因为我也看不懂)

<img :src="$withBase('/number.png')" alt="number">

### 4. 数值范围
从存储结构中可以看出， 指数部分的长度是11个二进制，即指数部分能表示的最大值是 2047（2^11-1），取中间值进行偏移，用来表示负指数，也就是说指数的范围是 [-1023,1024] 。因此，这种存储结构能够表示的数值范围为 2^1024 到 2^-1023 ，超出这个范围的数无法表示 。2^1024  和 2^-1023  转换为科学计数法如下所示：
```javascript
Number.MAX_VALUE; // 1.7976931348623157e+308
Number.MIN_VALUE; // 5e-324
```
如果数字超过最大值或最小值，JavaScript 将返回一个不正确的值，这称为 “正向溢出(overflow)” 或 “负向溢出(underflow)” 。 

### 4. 特殊数值
JavaScript 提供了几个特殊数值，用于判断数字的边界和其他特性 。如下所示：

- Number.MAX_VALUE：JavaScript 中的最大值
- Number.MIN_VALUE：JavaScript 中的最小值
- Number.MAX_SAFE_INTEGER：最大安全整数，为 253-1
- Number.MIN_SAFE_INTEGER：最小安全整数，为 -(253-1)
- Number.POSITIVE_INFINITY：对应 Infinity，代表正无穷
- Number.NEGATIVE_INFINITY：对应 -Infinity，代表负无穷
- Number.EPSILON：是一个极小的值，用于检测计算结果是否在误差范围内
- Number.NaN：表示非数字，NaN与任何值都不相等，包括NaN本身
- Infinity：表示无穷大，分 正无穷 Infinity 和 负无穷 -Infinity

### 5. 精度丢失的原因和解决

计算机中的数字都是以二进制存储的，如果要计算 0.1 + 0.2 的结果，<font color=#3eaf7c>**计算机会先把 0.1 和 0.2 分别转化成二进制，然后相加，最后再把相加得到的结果转为十进制**</font> 。
所以0.1+0.2在的计算过程如下:
1. 先将0.1和0.2转化为二进制，但有一些浮点数在转化为二进制时，会出现无限循环 。比如， 十进制的 0.1 转化为二进制，会得到如下结果：
  ```javascript
  0.0001 1001 1001 1001 1001 1001 1001 1001 …（1001无限循环）
  ```
  而存储结构中的尾数部分最多只能表示`53`位。为了能表示 0.1，只能模仿十进制进行四舍五入了，但二进制只有 0 和 1 ， 于是变为 0 舍 1 入 。 因此，0.1 在计算机里的二进制表示形式如下：
  ```javascript
  0.0001100110011001100110011001100110011001100110011001101
  ```

2. 将十进制的0.1和0.2相加，在计算浮点数相加时，需要先进行 “对位”，将较小的指数化为较大的指数，并将小数部分相应右移：

<img :src="$withBase('/add.png')" alt="0.1+0.2">

3. 最后使用`JS`将二进制结果使用十进制表示
  ```javascript
  (-1)**0 * 2**-2 * (0b10011001100110011001100110011001100110011001100110100 * 2**-52); //0.30000000000000004
  console.log(0.1 + 0.2) ; // 0.30000000000000004
  ```
这是一个典型的精度丢失案例，从上面的计算过程可以看出，0.1 和 0.2 在转换为二进制时就发生了一次精度丢失，而对于计算后的二进制又有一次精度丢失 。因此，得到的结果是不准确的。

<font color=#3eaf7c>**总结：非整数的Number类型无法用`==`（`===`也不行） 来比较，因为有可能会发生精度丢失**。</font>

<font color=#3eaf7c>**精度丢失解决：正确的比较浮点数的方法是，检查等式左右两边差的绝对值是否小于最小精度**</font>
```javascript
console.log( Math.abs(0.1 + 0.2 - 0.3) <= Number.EPSILON);  // true
```

## Symbol 类型

### 1. ECMA官网[定义](https://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types-symbol-type)
`The Symbol type is the set of all non-String values that may be used as the key of an Object property (6.1.7).Each possible Symbol value is unique and immutable.Each Symbol value immutably holds an associated value called [[Description]] that is either undefined or a String value.`

这句话的意思是: `Symbol类型是可用作Object属性的键的所有非String值的集合。每个可能的Symbol值都是唯一且不可变的。每个Symbol值都不可变地保存一个名为[[Description]]的关联值，该值是undefined的或String值。`

### 2. Symbol类型描述和创建

`symbol`是`ES6`新增的一种基本数据类型，它和`number`、`string`、`boolean`、`undefined`和`null`是同类型的,它用来表示独一无二的值，通过`Symbol`函数生成。在 ES6 之前，对象的属性名只能是字符串，这样会导致一个问题，当通过 mixin 模式为对象注入新属性的时候，就可能会和原来的属性名产生冲突 。而在 ES6 中，Symbol 类型也可以作为对象属性名，凡是属性名是 Symbol 类型的，就都是独一无二的，可以保证不会与其他属性名产生冲突。  

我们使用Symbol函数生成一个symbol类型的值，注意，Symbol前面不能加关键字，直接调用即可，关于Symbol函数参数注意下面几点
+ 参数只是表示对当前 Symbol 值的描述，有无都可以，并不影响symbol类型值的唯一性
+ 参数类型无所谓，因为最终会转化为字符串
```javascript
const s1 = Symbol("lison");
const s2 = Symbol("lison");
console.log(s1 === s2); // false
```

### 作为属性名
用`Symbol`作为对象的属性名时，不能直接通过点的方式访问属性和设置属性值。

+ 原因是：因为正常情况下，引擎会把点后面的属性名解析成字符串。但是ES6当中，对象的属性名支持表达式，可以使用一个变量作为属性名，属性名必须方括号[]内
+ 可利用: 由于symbol值的独一无二性，当它作为属性名，不会和其他属性名重复，所以ES6中类会利用这个特性实现私有属性和私有方法

...未完待续




PS:到目前为止，我们讲述了关于javascript中关于变量和类型的知识，这些知识都是进阶的知识，可能在写代码的时候很多东西都用不到，或者你感觉不到，但是这些知识是真正能让你更加了解JS的必经之路，也会让你在书写JS代码的时候更清楚的知道自己在写什么，获得安全感

## 参考资料: 

1. [ECMA官网文档](https://www.ecma-international.org)
2. [MDN官网文档](https://developer.mozilla.org)
3. [细说JavaScript七种数据类型](https://www.cnblogs.com/onepixel/p/5140944.html)
4. [你真的掌握变量和类型了么](https://juejin.im/post/5cec1bcff265da1b8f1aa08f#heading-29)
5. [零基础学透typescript](https://www.imooc.com/read/35/article/343)