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

**null 是表示缺少的标识，指示变量未指向任何对象。把 null 作为尚未创建的对象，也许更好理解。**

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