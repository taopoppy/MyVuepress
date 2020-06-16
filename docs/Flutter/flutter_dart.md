# Dart快速入门
因为`Dart`和`javascript`以及`java`非常相似，所以有这两门语言基础的小伙伴可能极容易上手，我们废话不多数，开始学习

## 程序入口和输出
`javascript`没有预定义的入口函数，但是在`Dart`中，每个`app`都必须有一个顶级的`main()`函数作为应用程序的入口点
我们下面将会在`DartPad`上面去做一下演示，你也可以来[DartPad](https://dartpad.dartlang.org/)实际操作一下

在`javascript`中使用`console.log()`,在`Dart`中我们使用`print`方法
```dart
void main(){
  for(int i = 0; i < 6; i++){
    print('${i}');
  }
}
```

## 变量声明
<font color=#3eaf7c>Dart 是类型安全的，它使用静态类型检查和运行时的组合，检查以确保变量的值始终与变量的静态值匹配类型，尽管类型是必须的，但某些类型注释是可选的，因为 Dart 会执行类型推断</font>，也就是说在`Dart`中定义变量可以去指定类型也可以不指定

+ <font color=#1E90FF>在javascript中，未初始化的变量是undefined，但是在Dart中，未初始化的变量值为null</font>
+ <font color=#1E90FF>注意：数字在Dart中也被当做对象，所以带有数字类型的未初始化变量的值都是null</font>
```dart
void main() {
  int a;
  print(a); // null
}
```

### 1. var
在`javascript`我们是无法去定义变量类型的，在`Dart`中，变量必须是明确的类型或者能够解析的类型
```dart
void main() {
  int a = 123;
  String name = "taopoppy"; // 明确指明类型
  var b = 234;              // 运行时推测类型
  print(a);
  print(b);
}
```
前端开发者需要注意一下，<font color=#1E90FF>之所以有此差异是因为Dart本身是一个强类型语言，任何变量都是有确定类型的，<font color=#DD1144>在Dart中，当用var声明一个变量后，Dart在编译时会根据第一次赋值数据的类型来推断其类型，编译结束后其类型就已经被确定</font> ，而JavaScript是纯粹的弱类型脚本语言，var只是变量的声明方式而已。</font>

### 2. dynamic和Object
<font color=#DD1144>Object 是Dart所有对象的根基类，也就是说所有类型都是Object的子类(包括Function和Null)</font>, 所以任何类型的数据都可以赋值给`Object`声明的对象. `dynamic`与`var`一样都是关键词,声明的变量可以赋值任意对象。

<font color=#1E90FF>**① dynamic和Object的相同之处**</font>

<font color=#9400D3>dynamic与Object相同之处在于,他们声明的变量可以在后期改变赋值类型。</font>

```dart
dynamic t;
Object x;
t = "taopoppy";
x = "hello world";
// 下面的代码没有问题
t = 1000
x = 2000
```

<font color=#1E90FF>**① dynamic和Object的不同之处**</font>

<font color=#9400D3>dynamic与Object不同的是,dynamic声明的对象编译器会提供所有可能的组合, 而Object声明的对象只能使用Object的属性与方法, 否则编译器会报错。</font>

```dart
dynamic a;
Object b;
void main() {
  a = "";
  b = "";
  print(a.length); // 正常运行
  print(b.length); // 直接报错
}
```
所以可以看到两个关键字的局限性
+ <font color=#1E90FF>dynamic关键词使用的时候比较容易引入一个运行时错误</font>
+ <font color=#1E90FF>Object关键字虽然让变量的类型范围变的广泛，但是相关属性和方法被限制</font>

### 3. final和const

如果您从未打算更改一个变量，那么使用`final`或`const`，被`final`或者`const`修饰的变量，变量类型可以省略两者的区别在于：<font color=#1E90FF>const 变量是一个编译时常量，final 变量在第一次使用时被初始化</font>


## 检查null或0
### 1. 与JS的区别
+ 在`javascript`中`1`或者`非null`对象的值都被视为`true`
```javascript
var myNull = null
if(!myNull){
  console.log('null is treated as false')
}
var zero = 0
if(!zero) {
  console.log('0 is treated as false')
}
```

+ <font color=#3eaf7c>在`Dart`中，只有布尔值`true`被视为`true`</font>
```dart
void main() {
 var myNull = null;
 if(myNull == null){
   print('!myNull is not true');
 }
 var zero = 0;
 if(zero == 0){
   print('0 is not treated as false');
 }
}
```
### 2. Dart中null最佳实践
从`Dart1.12`开始,`null-aware`运算符可帮助我们做`null`的检查：
```dart
bool isConnected(a,b){
  bool outConn = outgoing[a]?.contains(b)?? false;
  bool inConn = inComing[a]?.contains(b)?? false;
  return outConn || inConn
}
```
<font color=#3eaf7c>`?.`运算符会在左边为`null`的情况下阻断右边的调用，而`??`运算符主要作用在左边表达式为`null`的时候设置默认值</font>
```dart
void main() {
  print(null ?? false);    // false, 因为??左边的值为null，所以设置了默认值false
  print(false ?? 11);      // false, 因为??左边的值为false，不是null，所以没有设置默认值11
  print(true ?? false);    // true, 因为??左边的值为true，不是null，所以没有设置默认值false
}
```
>> **技巧**: <font color=#3eaf7c>获取一个对象数组的长度: `searchModel?.data?.length ?? 0` </font>

## 函数
### 1. 函数的声明
`Dart`和`Javascript`函数类似，主要区别在声明，`Dart`是不需要`Function`关键字来声明的，而且，<font color=#1E90FF>Dart是一种真正的面向对象的语言，所以即使是函数也是对象，并且有一个类型Function。这意味着函数可以赋值给变量或作为参数传递给其他函数，这是函数式编程的典型特征。</font>
```dart
fn() {  return true; }  // 无显式声明返回值类型

bool fn1() { return false; } // 显式声明返回值类型
```
<font color=#DD1144>Dart函数声明如果没有显式声明返回值类型时会默认当做dynamic处理，注意，函数返回值没有类型推断，所以无显式声明返回值类型的函数的返回值不能作为确定类型进行传参</font>

```dart
typedef String CALLBACK(); // 定义了一个返回值必须是String类型的函数类型
void main() {
  test(fn);  // 这里就会报错，因为fn返回值类型是dynamic Funciton，而test需要String Function
}

test(CALLBACK cb) {
  print(cb());
}

fn() {
  return "taopoppy";
}
```

### 2. 函数的使用
```dart
// 函数作为变量
var say = (str){
  print(str);
};
say("hi world");

// 函数作为参数传递
void execute(var callback) {
    callback();
}
execute(() => print("xxx"))
```

### 3. 可选参数
<font color=#1E90FF>**① 可选位置参数**</font>

包装一组函数参数，用`[]`标记为可选的位置参数，并放在参数列表的最后面：
```dart
String say(String from, String msg, [String device]) {
  var result = '$from says $msg';
  if (device != null) {
    result = '$result with a $device';
  }
  return result;
}
say('Bob', 'Howdy'); //结果是： Bob says Howdy
say('Bob', 'Howdy', 'smoke signal'); //结果是：Bob says Howdy with a smoke signal
```

<font color=#1E90FF>**② 可选的命名参数**</font>

```dart
void main() {
  // 调用函数的时候，不需要按照顺序传入参数，只需要按照给定的命名赋值即可
  var result = fn("1",params3:true,params1:false,params2:true);
  print(result);
}

// 定义函数参数的时候可以给参数命名
fn(String str, {bool params1 , bool params2 ,bool params3}) {
  return "taopoppy";
}
```

### 4. 箭头函数
`Dart`当中实际上没有箭头函数，<font color=#1E90FF>只不过对于只包含一个表达式的函数，可以使用箭头的简写语法</font>:
```dart
bool isNoble (int atomicNumber)=> _nobleGases [ atomicNumber ] ！= null ;
```


## 异步编程
### 1. Future
+ 与`javascript`一样，`Dart`支持单线程执行，在`Javascript`中，`Promise`对象表示异步操作的最终完成（或失败）及其结果值，`Dart`使用`Future`来表示异步操作，异步处理成功了就执行成功的操作，异步处理失败了就捕获错误或者停止后续操作。一个Future只会对应一个结果，要么成功，要么失败。
+ 可以使用`then()`来在`future`完成的时候执行其他代码。例如`HttpRequest.getString()`返回一个`Future`，由于 `HTTP` 请求是一个耗时操作。使用`then()`可以在`Future` 完成的时候执行其他代码 来解析返回的数据：
```dart
import 'dart:convert';
import 'dart:html';
void main() {
  _getIPAddress() {
    final url = 'https://httpbin.org/ip';
    Future<HttpRequest> request = HttpRequest.request(url);
    request.then((value){
      print(json.decode(value.responseText)['origin']);
    }).catchError((error) => print(error));
  }
  _getIPAddress();
}
```

<font color=#1E90FF>Future本身功能较多，这里我们只介绍其常用的API及特性。还有，请记住，Future 的所有API的返回值仍然是一个Future对象，所以可以很方便的进行链式调用</font>

<font color=#9400D3>**① Future.then**</font>

```dart
void main() {
  Future.delayed(new Duration(seconds: 2),(){
    return "taopoppy";
  })
  .then((value)=>print(value));
}

```

<font color=#9400D3>**② Future.catchError**</font>

如果异步任务发生错误，我们可以在`catchError`中捕获错误，我们将上面示例改为:
```dart
void main() {
  Future.delayed(new Duration(seconds: 2),(){
    throw AssertionError("Error");
  })
  .then((value)=>print(value))
  .catchError((e) => print(e)); // 失败走到这里
}
```

但是，并不是只有`catchError`回调才能捕获错误，`then`方法还有一个可选参数`onError`，我们也可以它来捕获异常：
```dart
void main() {
  Future.delayed(new Duration(seconds: 2),(){
    throw AssertionError("Error");
  }).then((value){
    print(value);
  },onError:(e){ // 给第二个参数onError赋值处理函数
    print(e);
  });
}
```

<font color=#9400D3>**③ Future.whenComplete**</font>

有些时候，我们会遇到无论异步任务执行成功或失败都需要做一些事的场景:
```dart
void main() {
  Future.delayed(new Duration(seconds: 2),(){
    throw AssertionError("Error");
  })
  .then((value)=>print(value))
  .catchError((e) => print(e))
  .whenComplete(() => print("成功或者失败都要执行这里的代码"));
}
```
这个写法你应该看着很眼熟，这个和`javascript`当中的`try,catch,finally`写法特别相似。

<font color=#9400D3>**④ Future.wait**</font>

有些时候，我们需要等待多个异步任务都执行结束后才进行一些操作，比如我们有一个界面，需要先分别从两个网络接口获取数据，获取成功后，我们需要将两个接口数据进行特定的处理后再显示到UI界面上，应该怎么做？答案是<font color=#DD1144>Future.wait</font>，它接受一个`Future`数组参数，只有数组中所有`Future`都执行成功后，才会触发`then`的成功回调，只要有一个`Future`执行失败，就会触发错误回调
```dart
void main() {
  // 2秒后返回结果
  var future1 = Future.delayed(new Duration(seconds: 2), () {
    return "hello";
  });

  // 4秒后返回结果
  var future2 = Future.delayed(new Duration(seconds: 4), () {
    return " world";
  });

  Future.wait([future1,future2]).then((results){
    print(results[0]+results[1]); // 全部执行成功
  }).catchError((e){
    print(e); // 有一个执行失败
  });
}

```

### 2. async和await
<font color=#9400D3>Dart中的async/await 和JavaScript中的async/await功能和用法是一模一样的，如果你已经了解JavaScript中的async/await的用法，可以直接跳过本节。</font>

+ 在`javascript`中，`async`函数声明定义了一个异步函数，返回一个`Promise`。`await`是用来等待`Promise`的
  ```javascript
  async function _getIPAddress() {
    const url = "https://httpbin.org/ip"
    const response = await fetch(url)
    const json = await response.json()
    const data = await json.origin
    console.log(data)
  }
  ```

+ 其实同理，在`Dart`当中，`async`函数返回一个`Future`，函数的主体是稍后执行，`await`运算符用于等待`Future`
  ```dart
  import 'dart:convert';
  import 'dart:html';
  void main() {
    _getIPAddress() async {
      final url = 'https://httpbin.org/ip';
      var request = await HttpRequest.request(url);
      String ip = json.decode(request.responseText)['origin'];
      print(ip);
    }
    _getIPAddress();
  }
  ```

### 3. Stream
`Stream`也是用于接收异步事件数据，和`Future`不同的是，它可以接收多个异步操作的结果（成功或失败）。 也就是说，在执行异步任务时，可以通过多次触发成功或失败事件来传递结果数据或错误异常。 `Stream` 常用于会多次读取数据的异步任务场景，如网络内容下载、文件读写等。举个例子
```dart
Stream.fromFutures([
  // 1秒后返回结果
  Future.delayed(new Duration(seconds: 1), () {
    return "hello 1";
  }),
  // 抛出一个异常
  Future.delayed(new Duration(seconds: 2),(){
    throw AssertionError("Error");
  }),
  // 3秒后返回结果
  Future.delayed(new Duration(seconds: 3), () {
    return "hello 3";
  })
]).listen((data){
   print(data);
}, onError: (e){
   print(e.message);
},onDone: (){

});
```
上述代码依次输出：
```bash
I/flutter (17666): hello 1
I/flutter (17666): Error
I/flutter (17666): hello 3
```

## 声明式UI

### 1. 什么是声明式UI
+ 从`web`到`android`再到`ios`，我们通常使用的是<font color=#3eaf7c>命令式的UI编程风格</font>,就是手动去构建一个全功能的UI实体（如`UIView`或者等效实体），然后在UI更改的时候使用方法对其进行更改。

+ 而<font color=#3eaf7c>声明式UI</font>是让开发人员去描述UI状态，并且不需要关心它怎么过渡到框架

### 2. 如何在声明性框架中更改UI
<img :src="$withBase('/FlutterUI.png')" alt="FlutterUI">

在命令式风格中，你通常需要使用选择器`findViewById`或类似函数获取到`ViewB`的实例`b`和所有权，并调用相关的修改的方法（并隐式的使其失效）。例如：
```javascript
// Imperative style
b.setColor(red)
b.clearChildren()
ViewC c3 = new ViewC(...)
b.add(c3)
```
由于`UI`真实的来源可能比实例`b`本身的存活周期更长，你可能还需要在`ViewB`的构造函数中复制此配置。

在声明式风格中，视图配置（如`Flutter`的`Widget`）是不可变的，它只是轻量的“蓝图”。要改变`UI`，`Widget` 会在自身上触发重建（在`Flutter`中最常见的方法是在 `StatefulWidgets`组件上调用`setState()`）并构造一个新的 Widget 子树。
```javascript
// Declarative style
return ViewB(
  color: red,
  child: ViewC(...),
)
```
在这里，当用户界面发生变化时， `Flutter`不会修改旧的实例`b` ，而是构造新的`Widget`实例。框架使用`RenderObjects`管理传统`UI`对象的职责（比如维护布局的状态）。`RenderObjects`在帧之间保持不变，`Flutter`的轻量级`Widget` 通知框架在状态之间修改`RenderObjects`。 `Flutter`框架则处理其余部分。