# JS中的类型转换
 关于JS类型转换有非常多的规则，如果你自己还没有对类型转换做研究你可以先看看本专题最下面的参考资料，你会发现内容很多，你会很苦恼，这么多东西怎么记忆。但是我们要明确，不是任何知识我们都要去记忆，比如数组`[1,2,3]`和数字`1`相加,会发生隐式的类型转化，但是这种规则我个人觉得没有必要去记，因为在写代码的过程中基本见不到，这种就仅仅是为了让数组和数字相加创建的规则，实际上没有啥用。包括在后面我们还会遇到类似的很多东西，所以我们始终要记住: 在精髓和糟粕共存的`js`当中，什么是应该去记忆的东西。

## 规则综述
因为JS是弱类型语言，所以类型转换发生非常频繁，不管是强制类型转换还是隐式类型转换，都遵守相同的规则，好在大部分转换规则都很简单，如下图

<img :src="$withBase('/conversion.jpg')" alt="conversion">

较为复杂的部分是Number和String之间的转换，以及对象跟基本类型之间的转换。我们分别来看一看这几种转换的规则

## StringToNumber
`String`类型转化成为`Number`有三种方法，`Number()`,`parseInt()`,`parseFloat()`.

### 1. Number()函数
+ 对字符串的处理遵循数字常量的相关规定/语法：<font color=#3eaf7c>只要这个字符串是正确的十进制、二进制、八进制和十六进制表达方式，以及正确的正负号科学计数法，都能被正确的转化成数字</font>。如果处理失败时返回`NaN`。
  ```javascript
  Number('30')      // 十进制30
  Number('0b111')   // 二级制7
  Number('0o13')    // 八进制11
  Number('0xFF')    // 十六进制255

  Number('1e3')     // 科学计数法
  Number('-1e-2')   // 科学计数法
  Number('1s1')     // NaN
  ```

### 2. parseInt()函数
+ `parseInt()`将输入值转化为整数,在没有第二个参数时默认以十进制转换数值，有第二个参数时，以第二个参数为基数转换数值，如果基数有误返回`NaN`：
  ```javascript
  console.log(parseInt("13"));          //13
  console.log(parseInt("11",2));        //3
  console.log(parseInt("17",8));        //15
  console.log(parseInt("1f",16));       //31
  ```

### 3. parseFloat()函数
+ `parseFloat()`将输入的是小数字符串(或具有可转换小数的字符串)转换为小数，如果输入是个整数字符串依然返回整数
  ```javascript
  console.log(parseInt('.21'));        //NaN
  console.log(parseFloat('.21'));      //0.21
  console.log(parseFloat('.0d'));      //0
  ```

**总结**

特别要注意，关于`Number()`,`parseInt()`,`parseFloat()`这三个方法还有很多坑，但这些坑很难遇到，一旦遇到，可以在[这里](https://blog.csdn.net/Faremax/article/details/76714294)去仔细查阅

## NumberToString
`Number`类型转化成为`String`实际上比任何转化都要简单，分为两种情况: 绝对值较大和绝对值较小,绝对值较小的`Number`类型转化成为`String`类型就是直觉的十进制表示，两边加个单引号或者双引号即可,绝对值较大的`Number`类型转化成为`String`类型是以科学计数法表示的
```javascript
console.log(String(11))   // '11'
const a = 1.07*1000*1000*1000*1000*1000*1000*1000;
console.log(String(a));//'1.07e+21'
```
`Number`类型转化成为`String`同样也有两种方法`.toString()`和`String()`

### 1. .toString()函数
+ `toString()`方法其实适用任何类型向`String`类型转化,该方法不会影响到原变量，它会将转换的结果返回。采用`Number`类型的`.toString()`方法的基模式，可以用不同的基输出数字，例如二进制的基是`2`，八进制的基是`8，十六进制的基是`16`
  ```javascript
  var iNum = 10;
  alert(iNum.toString(2));        //输出 "1010"
  alert(iNum.toString(8));        //输出 "12"
  alert(iNum.toString(16));       //输出 "A"
  ```

### 2. String()函数
+ 使用`String()`函数做强制类型转换时，对于`Number`和`Boolean`实际上就是调用的`.toString()`方法,但是对于`null`和`undefined`，就不会调用`.toString()`方法,应为调用他们的方法，会报错,它会将`null`直接转换为`"null"`,将`undefined`直接转换为`"undefined"`
  ```javascript
  (123).toString()    //"123"
  null.toString()     //"报错"
  undefined.toString()//"报错"
  ```

## 装箱转换
每一种基本类型`Numeber`,`String`,`Boolean`,`Symbol`在对象中都有对应的类，所谓装箱转换，正是把基本类型转换为对应的对象，就是我们常说的基本包装类型。另外，`Undefined和`和`Null`类型是报错的。

### 1. 装箱的本质
+ 当我们使用基本类型的方法或者属性的时候，我们经常不会去思考，其实对于基本类型的数值是没有方法和属性的，那么为什么又能使用呢？答案是这样：<font color=#3eaf7c>使用基本类型的方法或者属性的时候，本质是发生了装箱转换，使用对应的构造函数临时将基本类型转换成为了基本包装类型，使用完毕即销毁</font>。比如下面这段代码:
  ```javascript
  var a = 1;
  a.x = 2;
  console.log(a);// 1  
  console.log(a.x);// undefined 
  ```
  背后发生的装箱转换过程如下：
  ```javascript
  var a = 1;
  var temp1 = new Number(a);
  temp1.x = 2;
  temp1 = null;
  console.log(a);// 1  
  var temp2 = new Number(a);
  console.log(temp2.x);// undefined  
  temp2 = null;
  ```

### 2. Symbol类型的装箱
+ 全局的`Symbol`函数无法使用`new`来调用，但是我们仍然可以利用装箱机制来得到一个`Symbol`对象:
  ```javascript
  var symbolObject = (function(){return this;}).call(Symbol("a"))

  console.log(typeof symbolObject);                            // object
  console.log(symbolObject instanceof Symbol)                  // true 
  console.log(symbolObject.constructor === Symbol)             // true
  console.log(Object.prototype.toString.call(symbolObject))    // [object Symbol]
  ```
+ 使用内置的`Object`函数，我们可以在`javascript`代码中显示调用装箱能力
  ```javascript
  var symbolObject = Object(Symbol("a"))

  console.log(typeof symbolObject);                            // object
  console.log(symbolObject instanceof Symbol)                  // true 
  console.log(symbolObject.constructor === Symbol)             // true
  console.log(Object.prototype.toString.call(symbolObject))    // [object Symbol]
  ```
+ 特别要注意就是`call`本身会产生装箱操作，所以要配合`typeof`来区分基本类型还是对象类型
+ 装箱机制会频繁的产生临时对象，在对一些性能要求较高的场景下，我们应该避免对基本类型的装箱装换

## 拆箱转换

### 1. ToPrimitive
+ 对象类型到`String`和`Number`的装换都遵循<font color=#3eaf7c>先拆箱在转换</font>的规则，通过拆箱将对象变成基本类型，在从基本类型转换成对应的`String`或者`Number`

+ 在浏览器内部是调用了`ToObject`操作来实现装箱操作，相应的也规定了`ToPrimitive`来实现拆箱转换，即对象类型到基本类型的转换。`ToPrimitive`是一种抽象操作，是`javascript`内部才会用的操作，我们不会显示的调用。当需要将对象转换为相应的基本类型值时，`ToPrimitive`就会调用对象的内部方法`[[DefaultValue]]`来完成。

+ `ToPrimitive`操作接收两个参数，一个是`input`需要转换的值，第二个是可选参数`hint`代表期望的转换类型。并且在调用`[[DefaultValue]]`的时候`hint`会传递过去


+ 拆箱转换会尝试调用`valueOf`和`toString`来获得拆箱后的基本类型。如果`valueOf`和 `toString`都不存在，或者没有返回基本类型，则会产生类型错误`TypeError`。但是请注意：`valueOf()`和`toString()`的调用逻辑顺序并不是固定的取决于`hint`参数


### 2. ObjectToString
+ `hint`是`String`时，`toString()`的调用顺序在`valueOf()`之前，并且这两个方法如果都没有返回一个基本类型值，则抛出异常；如果返回了基本类型值`primValue`（拆箱过程），则返回`String(primValue)`（转换过程）,

<img :src="$withBase('/ObjectToString.png')" alt="ObjectToString">

+ 下面我们来举两个例子：
  例一：
  ```javascript
  var a = {};
  console.log(String(a));
  ```
  首先，按照我们之前学的,`a`是一个普通对象，`String(a)`是要调用`a`对象的`toString()`方法，这个方法是继承了`Object.prototype`原型上的`toString()`,这方法是返回`[[Class]]`属性的，所以对于普通对象，结果就是`[object Object]`

  更深入的理解是这样：`a`对象转换为`String`基本类型，`javascript`执行抽象操作`ToPrimitive`，调用对象的内部方法`[[DefaultValue]]`,一个参数`input`就是`a`对象，第二个参数`hint`就是`String`，所以优先调用了`a`继承了`Object.prototype`原型上的`toString()`方法，返回的`[object Object]`为基本类型，就返回了，此时拆箱完成。最后一步，再将基本类型`[object Object]`转换，返回`String('[object Object]')`

  到这里你也会有疑问，拆箱完毕后不就返回了基本类型么，为什么还有做最后一步转换，我只能先告诉你，`toString`和`valueOf`方法是可以被重写的，别重写的方法就不一定返回基本类型，还有可能返回对象，甚至啥都不返回。

  例二：
  ```javascript
  var a = Object.create(null);
  var b = Object.create(null);

  a.toString = function() { return 'hello';};
  a.valueOf = function() { return true; };

  b.toString = function() { return {};}; // 或是直接去掉这个方法，a.toString = undefined;
  b.valueOf = function() { return true; };

  console.log(String(a)); // "hello"
  console.log(String(b)); // "true"
  ```
  首先创造了没有原型的对象`a`和`b`,它们并没有继承任何`toString()`和`valueOf()`方法，我们就自己定义了，对于`a`来讲，因为`toString()`直接返回了基本类型，所以最终结果就是`String('hello')`。对于`b`，虽然`toString()`返回了基本类型，但是是`Boolean`类型`true`，所以最终还是要经过`String()`方法转换为字符串`"true"`

### 3. ObjectToNumber
+ `hint`是`Number`时，顺序是反过来的，优先调用`valueOf`，如果其返回值不是基本类型，再调用`toString`。另外，除了日期对象外，如果没传`hint`的话，其默认值是`Number`，因此`JS`中类型转化时，更偏爱`Number`

<img :src="$withBase('/ObjectToNumber.png')" alt="ObjectToNumber">

+ 下面我们依旧来举个例子：
  ```javascript
  var a = Object.create(null);
  var b = Object.create(null);

  a.toString = function() { return 'hello';};
  a.valueOf = function() { return true; };

  b.toString = function() { return "1e3";}; 
  b.valueOf = function() { return {}; };

  console.log(Number(a)); //1
  console.log(Number(b)); //1000
  ```
  `a`对象转换为`Number`基本类型，`javascript`执行抽象操作`ToPrimitive`，调用对象的内部方法`[[DefaultValue]]`,一个参数`input`就是`a`对象，第二个参数`hint`就是`Number`，所以优先调用了`a`的`valueOf()`方法，返回的`true`为基本类型，就返回了，此时拆箱完成。最后一步，再将基本类型`true`转换，返回`Number(true)`，所以最终结果是1。对于`b`对象来说，`valueOf()`方法返回的是不是基本类型，所以就使用了`toString()`方法，返回的是`String`类型,最后`Nnumber("1e3")`，显然这是我们之前讲的`NumberToString`的转换过程。

+ 实际上到这里类型转换的大多数情况我们都学过了，强制类型转换我们上面都展示了，而隐式类型转换大多存在于运算符合条件语句中，我们下面会介绍


## 运算符和语句
未完待续...

## 总结

**参考资料**

1. [你真的掌握变量和类型了吗](https://juejin.im/post/5cec1bcff265da1b8f1aa08f#heading-22)
2. [Javascript类型转换](https://www.qinshenxue.com/article/javascript-type-conversion.html)
3. [你可能忽略的js类型转换](https://juejin.im/post/5b076c006fb9a07aa43c9fda)
4. [JavaScript核心概念(1):类型转换](https://juejin.im/post/5b6906b46fb9a04fcb5b8771)
5. [深入理解JavaScript的类型转换](https://juejin.im/post/5d1587f4e51d4510664d1715#heading-2)
6. [一道面试题引发的对javascript类型转换的思考](https://www.cnblogs.com/coco1s/p/6509141.html)
7. [透彻研究Javascript类型转换](https://blog.csdn.net/Faremax/article/details/76714294)
8. [【JS迷你书】类型转换之装箱操作](https://juejin.im/post/5cbaf130518825325050fb0a)
9. [掌握 Javascript 类型转换：从规则开始](https://juejin.im/post/5d01b73de51d455a2f220248)