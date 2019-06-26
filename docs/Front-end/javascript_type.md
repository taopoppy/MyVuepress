# javascript中的类型

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

**undefined是全局对象的一个属性。也就是说，它是全局作用域的一个变量，并非一个关键字。undefined的最初值就是原始数据类型undefined。自ECMAscript5标准以来undefined是一个不能被配置（non-configurable），不能被重写（non-writable），不能被列举（no-enumerable）的属性**

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
 
+ 变量被声明了，但没有赋值时，就等于undefined。
+ 调用函数时，应该提供的参数没有提供，该参数等于undefined。
+ 对象没有赋值的属性，该属性的值为undefined。
+ 函数没有返回值时(没有写return或者return后面没有东西)，默认返回undefined。

### 4. void 0 代替undefined

首先根据[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/void)所述: void 运算符 对给定的表达式进行求值，然后返回 undefined。

其次undefined我们之前就说了它是个变量，不是关键字，所以undefined(变量)的值有可能被篡改
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

**null 是表示缺少的标识，指示变量未指向任何对象。把 null 作为尚未创建的对象，也许更好理解。希望表示 一个对象被人为的重置为空对象，而非一个变量最原始的状态 。 在内存里的表示就是，栈中的变量没有指向堆中的内存对象**

### 3. null的用处

+ 作为函数的参数，表示该函数的参数不是对象。
+ 作为对象原型链的终点。
  ```javascript
  Object.getPrototypeOf(Object.prototype)  // null
  ```
+ 显式指定变量为无效(object= null)
+ 当一个引用不再是必需的。通过分配`null`值，有效地清除引用，并假设对象没有引用其他代码，指定垃圾收集，确保回收内存。

### 4. null和undefined的区别(重点)

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

## String类型

### 1. ECMA官网[定义](https://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types-string-type)
`The String type is the set of all ordered sequences of zero or more 16-bit unsigned integer values (“elements”) up to a maximum length of 253-1 elements. The String type is generally used to represent textual data in a running ECMAScript program, in which case each element in the String is treated as a UTF-16 code unit value. Each element is regarded as occupying a position within the sequence. These positions are indexed with nonnegative integers. The first element (if any) is at index 0, the next element (if any) at index 1, and so on. The length of a String is the number of elements (i.e., 16-bit values) within it. The empty String has length zero and therefore contains no elements.`

这句话的意思是: `String类型是零个或多个16位无符号整数值（“元素”）的所有有序序列的集合，最大长度为2^53-1个元素。 String类型通常用于表示正在运行的ECMAScript程序中的文本数据，在这种情况下，String中的每个元素都被视为UTF-16代码单元值。每个元素被视为占据序列内的位置。这些位置用非负整数索引。第一个元素（如果有）位于索引0，索引为1的下一个元素（如果有），依此类推。 String的长度是其中的元素数（即16位值）。空String的长度为零，因此不包含任何元素。`

### 2. Unicode与UTF

现行的字符集国际标准，字符是以`Unicode`的方式表示的，每一个`Unicode`的码点表示一个字符，理论上,`Unicode`的范围是无限的。`UTF`是`Unicode`的编码方式，规定了码点在计算机中的表示方法，常见的有`UTF16`和`UTF8`。 `Unicode`的码点通常用`U+???`来表示，其中`???`是十六进制的码点值。 0-65536（U+0000 - U+FFFF）的码点被称为基本字符区域（BMP）

### 3. 字符串有没有最大长度

`String`用于表示文本数据。`String`有最大长度是`2^53 - 1`，这在一般开发中都是够用的，但是有趣的是，这个所谓最大长度，并不完全是你理解中的字符数。

因为`String`的意义并非“字符串”，而是字符串的`UTF16`编码，我们字符串的操作`charAt`、`charCodeAt`、`length` 等方法针对的都是`UTF16`编码。所以，字符串的最大长度，实际上是受字符串的编码长度影响的。也就说在现在`javascript`使用`UTF16`编码方式，对应`String`最大长度是`2^53-1`，如果使用`UTF8`或者`UTF32`，对应的长度也会变化，不再是`2^53-1`。