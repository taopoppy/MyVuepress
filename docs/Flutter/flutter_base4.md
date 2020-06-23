# 流式和层叠布局
我们把超出屏幕显示范围会自动折行的布局称为流式布局。`Flutter`中通过`Wrap`和`Flow`来支持流式布局，将上例中的`Row`换成`Wrap`后溢出部分则会自动折行，下面我们分别介绍`Wrap`和`Flow`。

## 流式-Wrap
首先是`Wrap`的定义：
```dart
Wrap({
  ...
  this.direction = Axis.horizontal,
  this.alignment = WrapAlignment.start,
  this.spacing = 0.0,
  this.runAlignment = WrapAlignment.start,
  this.runSpacing = 0.0,
  this.crossAxisAlignment = WrapCrossAlignment.start,
  this.textDirection,
  this.verticalDirection = VerticalDirection.down,
  List<Widget> children = const <Widget>[],
})
```
来看一个简单的例子
```dart
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class FlutterLayoutPage extends StatefulWidget {
  @override
  _FlutterLayoutPageState createState() => _FlutterLayoutPageState();
}

class _FlutterLayoutPageState extends State<FlutterLayoutPage> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter布局开发',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
      ),
      home:Scaffold(
        appBar: AppBar(
          title: Text('Flutter布局开发'),
        ),
        body: Wrap(
          direction: Axis.vertical, // 换行方向

          textDirection: TextDirection.ltr, // 表示水平方向子组件的布局顺序，从左到右，从右到左
          alignment: WrapAlignment.center, // 换行后的主轴布局方式

          runAlignment: WrapAlignment.start, // 换行后的纵轴布局方式
          verticalDirection: VerticalDirection.down, // 表示纵向方向子组件的布局顺序。从上到下，从下到上
          crossAxisAlignment: WrapCrossAlignment.start, // 纵轴的对齐方式

          spacing: 200.0, // 主轴(水平)方向间距
          runSpacing: 15.0, // 纵轴（垂直）方向间距

          children: <Widget>[
            new Chip(
              avatar: new CircleAvatar(backgroundColor: Colors.blue, child: Text('A')),
              label: new Text('Hamiltontao'),
            ),
            new Chip(
              avatar: new CircleAvatar(backgroundColor: Colors.blue, child: Text('M')),
              label: new Text('Lafayette'),
            ),
            new Chip(
              avatar: new CircleAvatar(backgroundColor: Colors.blue, child: Text('H')),
              label: new Text('Mulligan'),
            ),
            new Chip(
              avatar: new CircleAvatar(backgroundColor: Colors.blue, child: Text('J')),
              label: new Text('Laurens'),
            ),
          ],
        )
      ),
    );
  }
}
```
<img :src="$withBase('/flutter_wrap.png')" alt="wrap布局方式">

## 流式-Flow
我们一般很少会使用`Flow`，因为其过于复杂，需要自己实现子`widget`的位置转换，在很多场景下首先要考虑的是`Wrap`是否满足需求，所以我们这里不打算讲解它，如果后续有时间或者你有兴趣，我们再来补充。

你可以先参考[Flutter实战：4.4.2Flow](https://book.flutterchina.club/chapter4/wrap_and_flow.html)

## 层叠-Stack
层叠布局和`Web`中的绝对定位、`Android`中的`Frame`布局是相似的，子组件可以根据距父容器四个角的位置来确定自身的位置。绝对定位允许子组件堆叠起来（按照代码中声明的顺序）。`Flutter`中使用`Stack`和`Positioned`这两个组件来配合实现绝对定位。`Stack`允许子组件堆叠，而`Positioned`用于根据`Stack`的四个角来确定子组件的位置。

我们首先来看`Stack`的定义：
```dart
Stack({
  this.alignment = AlignmentDirectional.topStart,
  this.textDirection,
  this.fit = StackFit.loose,
  this.overflow = Overflow.clip,
  List<Widget> children = const <Widget>[],
})
```
+ <font color=#9400D3>alignment</font>：此参数决定如何去对齐没有定位（没有使用`Positioned`）或部分定位的子组件。所谓部分定位，在这里特指没有在某一个轴上定位：`left`、`right`为横轴，`top`、`bottom`为纵轴，只要包含某个轴上的一个定位属性就算在该轴上有定位。

+ <font color=#9400D3>textDirection</font>：和`Row`、`Wrap`的`textDirection`功能一样，都用于确定`alignment`对齐的参考系，即：`textDirection`的值为`TextDirection.ltr`，则`alignment`的`start`代表左，`end`代表右，即从左往右的顺序；`textDirection`的值为`TextDirection.rtl`，则`alignment`的`start`代表右，`end`代表左，即从右往左的顺序。

+ <font color=#9400D3>fit</font>：此参数用于确定没有定位的子组件如何去适应	`Stack`的大小。`StackFit.loose`表示使用子组件的大小，`StackFit.expand`表示扩伸到`Stack`的大小。

+ <font color=#9400D3>overflow</font>：此属性决定如何显示超出`Stack`显示空间的子组件；值为`Overflow.clip`时，超出部分会被剪裁（隐藏），值为`Overflow.visible`时则不会

## 层叠-Positioned
`Positioned`的定义：
```dart
const Positioned({
  Key key,
  this.left, 
  this.top,
  this.right,
  this.bottom,
  this.width,
  this.height,
  @required Widget child,
})
```
+ `left`、`top` 、`right`、 `bottom`分别代表离`Stack`左、上、右、底四边的距离。

+ `width`和`height`用于指定需要定位元素的宽度和高度。注意，`Positioned`的`width`、`height` 和其它地方的意义稍微有点区别，此处用于配合`left`、`top` 、`right`、 `bottom`来定位组件，举个例子，在水平方向时，你只能指定`left`、`right`、`width`三个属性中的两个，如指定`left`和`width`后，`right`会自动算出(`left`+`width`)，如果同时指定三个属性则会报错，垂直方向同理。

```dart
import 'dart:ui'; // 引入window
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class FlutterLayoutPage extends StatefulWidget {
  @override
  _FlutterLayoutPageState createState() => _FlutterLayoutPageState();
}

class _FlutterLayoutPageState extends State<FlutterLayoutPage> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter布局开发',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
      ),
      home:Scaffold(
        appBar: AppBar(
          title: Text('Flutter布局开发'),
        ),
        body: Container(
          height: window.physicalSize.height, // 获取屏幕的高度
          width: window.physicalSize.width, // 获取屏幕的宽度
          decoration: BoxDecoration(color: Colors.yellowAccent),
          child: Stack(
            alignment: Alignment.center, // 无定位子组件的的对齐方式
            textDirection: TextDirection.ltr,
            fit: StackFit.loose,
            overflow: Overflow.clip,
            children: <Widget>[
              Container(
                child: Text('Hello',style: TextStyle(color: Colors.redAccent),), // 属于无定位组件，按照alignment定义的方式去定位
              ),
              Positioned(
                left: 10.0,
                child: Container(
                  height: 50,
                  width: 50,
                  decoration: BoxDecoration(color: Colors.deepPurple),
                ),
              ),
              Positioned(
                bottom: 10.0,
                child: Container(
                  height: 50,
                  width: 50,
                  decoration: BoxDecoration(color: Colors.green),
                ),
              )
            ],
          ),
        )
      ),
    );
  }
}

```
<img :src="$withBase('/flutter_stack_positioned1.png')" alt="层叠布局">

我们再来看第二个例子：
```dart
Stack(
  alignment:Alignment.center ,
  fit: StackFit.expand, //未定位widget占满Stack整个空间
  children: <Widget>[
    Positioned(
      left: 18.0,
      child: Text("I am Jack"),
    ),
    Container(child: Text("Hello world",style: TextStyle(color: Colors.white)),
      color: Colors.red,
    ),
    Positioned(
      top: 18.0,
      child: Text("Your friend"),
    )
  ],
),
```
可以看到，由于第二个子文本组件没有定位，所以`fit`属性会对它起作用，就会占满`Stack`。由于`Stack`子元素是堆叠的，所以第一个子文本组件被第二个遮住了，而第三个在最上层，所以可以正常显示。

<img :src="$withBase('/flutter_stack_positioned2.png')" alt="层叠布局">

这里有个比较重要的问题就是：<font color=#DD1144>Stack和Align有什么区别？</font>
+ <font color=#9400D3>定位参考系统不同；Stack/Positioned定位的的参考系可以是父容器矩形的四个顶点；而Align则需要先通过alignment 参数来确定坐标原点，不同的alignment会对应不同原点，最终的偏移是需要通过alignment的转换公式来计算出。</font>
+ <font color=#9400D3>Stack可以有多个子元素，并且子元素可以堆叠，而Align只能有一个子元素，不存在堆叠。</font>