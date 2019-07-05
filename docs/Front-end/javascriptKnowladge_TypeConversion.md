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

## 拆箱转换

## 运算符和语句

## 总结

**参考资料**

1. [你真的掌握变量和类型了吗](https://juejin.im/post/5cec1bcff265da1b8f1aa08f#heading-22)
2. [Javascript类型转换](https://www.qinshenxue.com/article/javascript-type-conversion.html)
3. [你可能忽略的js类型转换](https://juejin.im/post/5b076c006fb9a07aa43c9fda)
4. [JavaScript核心概念(1):类型转换](https://juejin.im/post/5b6906b46fb9a04fcb5b8771)
5. [深入理解JavaScript的类型转换](https://juejin.im/post/5d1587f4e51d4510664d1715#heading-2)
6. [一道面试题引发的对javascript类型转换的思考](https://www.cnblogs.com/coco1s/p/6509141.html)
7. [透彻研究Javascript类型转换](https://blog.csdn.net/Faremax/article/details/76714294)