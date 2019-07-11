# Dart基础知识
因为`Dart`和`javascript`以及`java`非常相似，所以有这两门语言基础的小伙伴可能极容易上手，我们废话不多数，开始学习

## 程序入口
`javascript`没有预定义的入口函数，但是在`Dart`中，每个`app`都必须有一个顶级的`main()`函数作为应用程序的入口点
我们下面将会在`DartPad`上面去做一下演示，你也可以来[DartPad](https://dartpad.dartlang.org/)实际操作一下

## 控制台输出
在`javascript`中使用`console.log()`,在`Dart`中我们使用`print`方法
```dart
void main(){
  for(int i = 0; i < 6; i++){
    print('${i}');
  }
}
```

## 变量
<font color=#3eaf7c>`Dart`是类型安全的，它使用静态类型检查和运行时的组合，检查以确保变量的值始终与变量的静态值匹配类型，尽管类型是必须的，但某些类型注释是可选的，因为`Dart`会执行类型推断</font>，也就是说在`Dart`中定义变量可以去指定类型也可以不指定

### 创建和分配变量
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
### 默认值
+ 在`javascript`中，未初始化的变量是`undefined`，但是在`Dart`中，未初始化的变量值为`null`
+ 注意：<font color=#3eaf7c>数字在`Dart`中也被当做对象，所以带有数字类型的未初始化变量的值都是`null`</font>
```dart
void main() {
  int a;
  print(a); // null
}
```
## 检查null或0
### 与JS的区别
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
### Dart中null最佳实践
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

## Functions
`Dart`和`Javascript`函数类似，主要区别在声明，`Dart`是不需要`Function`关键字来声明的：
```dart
fn() {  return true; }

bool fn1() { return false; }
```

## 异步编程
### Futures
+ 与`javascript`一样，`Dart`支持单线程执行，在`Javascript`中，`Promise`对象表示异步操作的最终完成（或失败）及其结果值，`Dart`使用`Future`来表示异步操作：
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
### async和await
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

## 声明式UI

### 什么是声明式UI
+ 从`web`到`android`再到`ios`，我们通常使用的是<font color=#3eaf7c>命令式的UI编程风格</font>,就是手动去构建一个全功能的UI实体（如`UIView`或者等效实体），然后在UI更改的时候使用方法对其进行更改。

+ 而<font color=#3eaf7c>声明式UI</font>是让开发人员去描述UI状态，并且不需要关心它怎么过渡到框架

### 如何在声明性框架中更改UI
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