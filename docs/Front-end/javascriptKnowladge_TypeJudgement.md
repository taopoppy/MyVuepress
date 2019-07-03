# JS中的类型判断

在JS当中用来做数据类型判断的方法有4个:`typeof`, `instanceof`, `constructor`, `Object.prototype.toString.call()`, 每个方法我们都会去介绍它的用法、注意事项和适用场景
## typeof

### 1. 用法

typeof可以用来判断基础类型和引用类型，返回一个表示数据类型的字符串，返回结果包括:`number`、`boolean`、`string`、`symbol`、`object`、`undefined`、`function`,但是typeof的运算结果和运行时类型的规定有很多不一致，如下图：
<img :src="$withBase('/typeof.png')" alt="typeof">

### 2. 注意事项

typeof结果有两个特例，一个是`typeof null`结果为`object`,另一个就是`typeof (function(){})`结果为`funciton`

### 3. 适用场景

因为`typeof`返回结果和运行时类型的不一致，所以我们只有在准确知道变量在`number`、`boolean`、`string`、`symbol`、`undefined`、`function`这些类型范围内我们才能用`typeof`准确判断数据的类型

另外`typeof`只能从整体判断数据类型为引用类型，并不适用于进一步判断是引用类型中的哪种类型

## instanceof

### 1. 用法

+ `instanceof`操作符可以帮助我们判断引用类型具体是什么类型的对象。例如`A instanceof B`会返回`boolean`值,表示`A`是否是`B`类型
  ```javascript
  [] instanceof Array; // true
  {} instanceof Object;// true
  new Date() instanceof Date;//true
  new RegExp() instanceof RegExp//true
  ```
+ 我们来分析一下 [ ]、Array、Object 三者之间的关系：

  从`instanceof`能够判断出 `[ ].__proto__`指向`Array.prototype`，而 `Array.prototype.__proto__` 又指向了`Object.prototype`，最终 `Object.prototype.__proto__` 指向了`null`，标志着原型链的结束。因此，`[]`、`Array`、`Object`就在内部形成了一条原型链：
  <img :src="$withBase('/instanceof.png')" alt="instanceof">
  从原型链可以看出，`[]` 的` __proto__`  直接指向`Array.prototype`，间接指向`Object.prototype`，所以按照`instanceof`的判断规则,`[]`就是`Object`的实例。依次类推，类似的`new Date()`、`new Person()` 也会形成一条对应的原型链 。因此，<font color=#3eaf7c>`instanceof`只能用来判断两个对象是否属于实例关系， 而不能判断一个对象实例具体属于哪种类型</font>。

### 2. 注意事项

+ `instanceof`不能用来检测基本数据类型,将会有两种结果: `基本类型的值 instanceof 基本类型`直接报错，`基本类型的值 instanceof 引用类型`返回`false`,包括`null`和`undefiend`也是这样
  ```javascript
  55 instanceof number             // 报错
  55 instanceof Number             // false
  new Number(55) instanceof Number // true

  null instanceof Null            // 报错
  null instanceof Object          // false
  ```
+ 之前说`A instanceof B`的意思是`A`是否是`B`类型，但是`instanceof`检查的是原型，所以更正确的方法应该是:

  <font color=#3eaf7c>左操作数对象的原型链上是否有右边这个构造函数的prototype属性</font>,

  或者更通俗的说:
  
  <font color=#3eaf7c>左边的对象时候是右边构造函数的实例</font>
+ 由于`instanceof`操作符在对象的整个原型上都是有效的，因此同一个实例对象，可能对多个构造函数都返回`true`,所以在类的原型继承中，我们最后检测出来的结果未必准确。
  ```javascript
  [] instanceof Array  // true
  [] instanceof Object // true

  (function(){}) instanceof Function  // true
  (function(){}) instanceof Object    // true
  ```
+ 尽量避免使用`instanceof`去判断`Array`类型
  
  因为`instanceof`操作符的问题在于，它假定只有一个全局执行环境。如果网页中包含多个框架，那实际上就存在两个以上不同的全局执行环境，从而存在两个以上不同版本的构造函数。如果你从一个框架向另一个框架传入一个数组，那么传入的数组与在第二个框架中原生创建的数组分别具有各自不同的构造函数。
  ```javascript
  var iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  xArray = window.frames[0].Array;
  var arr = new xArray(1,2,3); // [1,2,3]
  arr instanceof Array; // false
  ```
  针对数组的这个问题，`ES5`提供了`Array.isArray()`方法 。该方法用以确认某个对象本身是否为`Array`类型，而不区分该对象在哪个环境中创建。
  ```javascript
  if (Array.isArray(value)){
    //对数组执行某些操作
  }
  ```
  `Array.isArray()`本质上检测的是对象的`[[Class]]`值，这个原理是和下面[Object.prototype.toString.call()](https://www.taopoppy.cn/Front-end/javascript_extend.html#_4-object-prototype-tostring-call)一样的

### 3. 适用场景

`instanceof`只能用来判断是不是我们认为的那种类型，不能在不知道数据类型的条件下去判断是哪种数据类型。

总上所述：`instanceof`在基本类型的判断上无作为，在引用类型上的判断的方式无法满足我们对类型直接性的判断，所以整体上讲`instanceof`不是类型判断好的选择。
如果你对`instanceof`类型判断的原理还不理解，可以在看完原型专题后来重新理解`instanceof`的原理,或者提前参考一下[原型链](https://gitee.com/taopoppy/JsMaster/blob/master/JM_inherit_prototypechain/study.txt)的资料。

## constructor

### 1. 用法

+ `constructor`作用和`instanceof`非常相似。但是它和`instanceof`在类型判断原理上的区别是：<font color=#3eaf7c>`constructor`判断的是该对象上的`constructor`属性是否为该对象的构造函数</font>，听起来有点绕，这部分知识也是和[对象原型](https://gitee.com/taopoppy/JsMaster/blob/master/JM_object_prototype/study.txt)知识相关，请自行查阅
  ```javascript
  // 引用类型
  var aa=[1,2];
  aa.constructor === Array               // true
  aa.constructor === RegExp              // false

  // 基本类型
  (1).constructor === Number;            // true
  'str'.constructor === String           // true
  ```
+ 上述代码中，使用`constructor`还可以处理基本数据类型的检测。这也是它和`instanceof`区别之一。基本数据类型上能够调用`constructor`的原因我们已经在[包装类型](https://www.taopoppy.cn/Front-end/javascript_objectType.html)中详细的说明了原因。

### 2. 注意事项
+ `constructor`的弊端之一就是：无法用来检测`null`和`undefined`,因为`null`和`undefined`上没有`constructor`属性.
+ `constructor`是不安全的，因为<font color=#3eaf7c>类的原型一但被重新，则原型上的`constructor`就会指向别的类型的构造函数，导致类型判断结果不准确</font>，如下：
  ```javascript
  function Fn(){}
  let f1 = new Fn()
  f1.constructor === Fn     // true  此时f1对象的原型(Fn.prototype)上的constructor属性指向f1的构造函数Fn
  Fn.prototype = new Array()
  let f2 = new Fn()
  f2.constructor === Fn     // false 此时f2对象上原型(Array类型的对象)上的上的constructor属性指向Array
  console.log(f2.constructor)//Array
  ```

### 3. 适用场景
由于`constructor`的缺陷和不安全，作者目前为止极少见到使用`constructor`去做类型判断的，如果将来找到了会在这里进行补充

## Object.prototype.toString.call()

### 1. 用法

`Object.prototype.toString.call()`是最准确最常用的方式。首先获取`Object`原型上的`toString`方法，让方法执行，让`toString`方法中的this指向第一个参数的值,<font color=#3eaf7c>默认返回当前对象的`[[Class]]` 。这是一个字符串类型的内部属性，其格式为`[object Xxx]`，其中`Xxx`就是对象的类型</font>。
```javascript
Object.prototype.toString.call({"name":"taopoppy"})  //"[object Object]"
Object.prototype.toString.call('')                   // [object String]
Object.prototype.toString.call(1)                    // [object Number]
Object.prototype.toString.call(true)                 // [object Boolean]
Object.prototype.toString.call(undefined)            // [object Undefined]
Object.prototype.toString.call(null)                 // [object Null]
Object.prototype.toString.call(new Function())       // [object Function]
Object.prototype.toString.call(new Date())           // [object Date]
Object.prototype.toString.call([])                   // [object Array]
Object.prototype.toString.call(new RegExp())         // [object RegExp]
Object.prototype.toString.call(new Error())          // [object Error]
Object.prototype.toString.call(document)             // [object HTMLDocument]
Object.prototype.toString.call(window)               //[object global] window是全局对象global的引用
```

### 2. 注意事项

  关于`toString`重要补充说明：本意是转换为字符串，但是某些`toString`方法不仅仅是转换为字符串
  + 对于`Number`、`String`，`Boolean`，`Array`，`RegExp`、`Date`、`Function`原型上的`toString`方法都是把当前的数据类型转换为字符串的类型（它们的作用仅仅是用来转换为字符串的）
  + `Object`上的`toString`并不是用来转换为字符串的。它的作用是返回当前方法执行的主体（方法中的`this`）所属类的详细信息即`"[object Object]"`,其中第一个`object`代表当前实例是对象数据类型的(这个是固定死的)，第二个`Object`代表的是`this`所属的类是`Object`。但是`Array`、`Date`、`RegExp`等都重写了`toString`方法,所以直接调用`Object`原型上未被覆盖的`toString()`方法，使用`call`来改变`this`指向来达到我们想要的效果。如下代码:
    ```javascript
    let obj = {}
    obj.toString()                       // "[object Object]"

    let arr = [1,2,3]
    arr.toString()                       // "1,2,3"  Array.toString()被重写
    Object.prototype.toString.call(arr)  //"[object Array]"   
    ```

### 3. 适用场景
`Object.prototype.toString.call()`适用于任何你想要真正进行数据类型判断的场景，只不过对于返回字符串结果你需要做一下截取处理

## 总结
当然我们还是要去使用我们的图形去帮助我们记忆，记忆的结果是帮助我们更好的去用
<mermaid>
graph LR
  A["类型"] --> B["基本类型"]
  A --> C["引用类型"]
  B --> D["其他5种"]
  B --> E["null(===)"]
  subgraph 核心
  D --> F["typeof"]
  E --> G["toString<解决一切>"]
  D --> G
  C --> G
  C --> H["instanceof"]
  end
  style G fill:#f9f,stroke:#333,stroke-width:4px
</mermaid>
记忆方法如下: 
+ 首先`Object.prototype.toString.call()`是万金油，任何时候使用它都没有错，只是方不方便的问题
+ 除了`null`,其他5中类型都可以使用`typeof`去判断类型
+ `null`类型我们一般使用`Object.prototype.toString.call()`或者`===`去判断
+ 引用类型我们使用`instanceof`去判断

另外我们介绍两个点：
+ 准确判断一个对象为普通对象我们只有`Object.prototype.toString.call()`
+ 准确判断数组类型我们只推荐`Array.isArray()`




**参考资料**

1. [JS 数据类型，数据类型的判断，类型转换](https://juejin.im/post/5cff51b15188251260273f84#heading-14)
2. [Javascript中的数据类型判断](https://juejin.im/post/59c7535a6fb9a00a600f77b4)
3. [js判断数据类型](https://segmentfault.com/a/1190000015264821)
4. [在JavaScript中，如何判断数据类型(类型检测)](https://segmentfault.com/a/1190000015580514)
5. [JavaScript数据类型判断](https://segmentfault.com/a/1190000011419984)
6. [JavaScript的数据类型及其检测](https://github.com/ljianshu/Blog/issues/4)
7. [JS中的数据类型及判断](https://github.com/muwenzi/Program-Blog/issues/17)
8. [Javascript判断变量类型的陷阱与正确的处理方式](https://juejin.im/entry/5964a1c15188250d8b65ef5f)
9. [判断js数据类型的四种方法](https://www.cnblogs.com/onepixel/p/5126046.html)