# （类型）类型拓展
当我们全面细致的了解个7个类型后，我们还需要去了解的其他的，比如怎么去判断类型，类型转化的复杂性，以及当我们从内存的角度去看这些类型时，它们有哪些特点

## 两大类型的不同

### 1. 可变性
我们首先要明确，<font color=#3eaf7c>6个基本类型是具有不可变性的，而1个引用类型是具有可变性的</font>

+ **基本类型的不可变性**

如果你刚开始听到这个概念你也许会迷惑，因为在开发过程中，基本类型有时候是不变的，有时候会变，比如我们在使用字符串的各种方法都会返回新的字符串，并没有改变值，但是我们如果直接改变字符串，字符串又是可变的，如下：
```javascript
var str = 'ConardLi';
str.slice(1);
str.substr(1);
str.trim(1);
str.toLowerCase(1);
str[0] = 1;
console.log(str);  // ConardLi  没有变化
str += '6'
console.log(str);  // ConardLi6 变化了
```
尽管你看的现象是这样的，但在内存中发生的变化并非你看到的这样，内存空间中的栈内存具有以下特点:
- 存储的值大小固定
- 空间较小
- 可以直接操作其保存的变量，运行效率高
- 由系统自动分配存储空间

<font color=#3eaf7c>Javascript中的原始类型的值被直接存储在栈中，在变量定义时，栈就为其分配好了内存空间,由于栈中的内存空间的大小是固定的，那么注定了存储在栈中的变量就是不可变的,这就是基本类型的不可变性的概念</font>
<img :src="$withBase('/stack1.png')" alt="stack1">

在上面的代码中，我们执行了str += '6'的操作，实际上是在栈中又开辟了一块内存空间用于存储新的基本类型值'ConardLi6'，然后将变量str指向这块空间，所以这并不违背不可变性的特点。所以我们从代码的角度感觉变量名没有变，变量的值变化了，但是实际上是变量名在动态的指向新的内存空间。

<img :src="$withBase('/stack2.png')" alt="stack2">
总结：<font color=#3eaf7c>基本类型的不可变性指已分配好的内存空间中的基本类型的值不会发生突变，因为变量名会动态的指向新的内存空间，所以会造成基本类型的值会在原来的基础上发生变化的错觉</font>

+ **引用类型的可变性**

相对于上面具有不可变性的原始类型，我习惯把对象称为引用类型，引用类型的值实际存储在堆内存中，堆内存有以下特点：
+ 存储的值大小不定，可动态调整
+ 空间较大，运行效率低
+ 无法直接操作其内部存储，使用引用地址读取
+ 通过代码进行分配空间


引用类型在栈中只存储了一个固定长度的地址，这个地址指向堆内存中的值。我们写一个简短的Demo，来看看内存中的情况
```javascript
var obj1 = {name:"ConardLi"}
var obj2 = {age:18}
var obj3 = function(){...}
var obj4 = [1,2,3,4,5,6,7,8,9]
```
<img :src="$withBase('/heap.png')" alt="heap">

由于内存是有限的，这些变量不可能一直在内存中占用资源，我们在[JS中的垃圾回收和内存泄漏](https://www.taopoppy.cn/Front-end/javascriptKnowladge_GarbageCollection.html)中会讲述`JavaScript`是如何进行垃圾回收以及可能会发生内存泄漏的一些场景。

### 3. 复制

当我们把一个变量的值复制到另一个变量上时，原始类型和引用类型的表现是不一样的，下面我们分别来看看两者的不同:

+ **基本类型的复制**
```javascript
var name = 'ConardLi';
var name2 = name;
name2 = 'code秘密花园';
console.log(name); // ConardLi;
```
<img :src="$withBase('/copy1.png')" alt="copy">

内存中有一个变量`name`，值为`ConardLi`。我们从变量`name`复制出一个变量`name2`，此时在内存中创建了一个块新的空间用于存储`ConardLi`，虽然两者值是相同的，但是两者指向的内存空间完全不同，这两个变量参与任何操作都互不影响。

+ **引用类型的复制**
```javascript
var obj = {name:'ConardLi'};
var obj2 = obj;
obj2.name = 'code秘密花园';
console.log(obj.name); // code秘密花园
```
<img :src="$withBase('/copy2.png')" alt="copy">

当我们<font color=#3eaf7c>复制引用类型的变量时，实际上复制的是栈中存储的地址</font>，所以复制出来的obj2实际上和obj指向的堆中同一个对象。因此，我们改变其中任何一个变量的值，另一个变量都会受到影响，这就是为什么会有深拷贝和浅拷贝的原因。可以查看[JS中的深拷贝和浅拷贝](https://www.taopoppy.cn/Front-end/javascriptKnowladge_DeepCopyAndShallowCopy.html)去了解深拷贝和浅拷贝更多的东西

### 4. 比较
当我们在对两个变量进行比较时，不同类型的变量的表现是不同的：
```javascript
var name = 'ConardLi';
var name2 = 'ConardLi';
console.log(name === name2); // true
var obj = {name:'ConardLi'};
var obj2 = {name:'ConardLi'};
console.log(obj === obj2); // false
```
<img :src="$withBase('/compare.png')" alt="compare">

对于<font color=#3eaf7c>原始类型</font>，比较时会直接比较它们的值，如果值相等，即返回true。

对于<font color=#3eaf7c>引用类型</font>，比较时会比较它们的引用地址，虽然两个变量在堆中存储的对象具有的属性值都是相等的，但是它们被存储在了不同的存储空间，因此比较值为false

### 5. 传递
基本类型和引用类型都能作为函数参数去传递，但是它们遵循同一个原则就是: <font color=#3eaf7c>ECMAScript中所有的函数的参数都是按值传递的</font>

+ **基本类型的传递**
```javascript
let name1 = 'ConardLi';
function changeValue(name){
  name = 'code秘密花园';
}
changeValue(name1);
console.log(name1);  // ConardLi
```
基本类型的传递和基本类型的复制有关，因为函数参数也是存在函数中的变量，所以函数参数的传递无非就是函数外部的变量复制给函数内部的变量，表现在上述代码中就是函数`changeValue`外的变量`name1`复制给函数内的变量`name`,简单的说就是在函数内部先执行了`name = name1`,但是函数内部的`name`和函数外部的`name1`存储的内存空间不同，所以`name`的任何操作不会影响`name1`

+ **引用类型的传递**
```javascript
let obj1 = {};
function changeValue(obj){
  obj.name = 'ConardLi'; 
  obj = {name:'code秘密花园'};  //obj指向了堆的新的地址，它的任何修改和obj1再也无关
}
changeValue(obj1);
console.log(obj1.name); // ConardLi
```
引用类型的参数传递并不是引用传递，而依旧是值传递，因为传递的只是在堆内存的地址。所以在上述代码中函数`changeValue`中的局部变量`obj`一开始和外部的`obj1`是指向堆中同一段内存，所以`obj`的任何改变都会影响`obj1`,但是`obj = {name:'code秘密花园'}`了以后，`obj`指向了堆中另一个新的内存，此时内部的`obj`和外部的`obj1`不再指向相同的地址，任何操作都互不影响。

**总结**: <font color=#3eaf7c>函数参数传递的并不是变量的引用，而是变量拷贝的副本，当变量是原始类型时，这个副本就是值本身，当变量是引用类型时，这个副本是指向堆内存的地址</font>

## 类型转换
关于`Javascript`的类型转化，我们专门开设了一个专题，请到[JS中的类型转换](https://www.taopoppy.cn/Front-end/javascriptKnowladge_TypeConversion.html)专题中查看

## 类型判断
关于`Javascript`的类型判断，我们专门开设了一个专题，请到[JS中的类型判断](https://www.taopoppy.cn/Front-end/javascriptKnowladge_TypeJudgement.html)专题中查看




**参考资料**

1. [你真的掌握变量和类型了吗](https://juejin.im/post/5cec1bcff265da1b8f1aa08f#heading-2)