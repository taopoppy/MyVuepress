# 线性和弹性布局

线性布局，即指沿水平或垂直方向排布子组件。`Flutter`中通过`Row`和`Column`来实现线性布局，类似于`Android`中的`LinearLayout`控件。`Row`和`Column`都继承自`Flex`，我们将在弹性布局一节中详细介绍`Flex`。

线性布局，有主轴和纵轴之分，如果布局是沿水平方向，那么主轴就是指水平方向，而纵轴即垂直方向；如果布局沿垂直方向，那么主轴就是指垂直方向，而纵轴就是水平方向。在线性布局中，有两个定义对齐方式的枚举类`MainAxisAlignment`和`CrossAxisAlignment`，分别代表主轴对齐和纵轴对齐。

## 线性-Row
<font color=#1E90FF>Row可以在水平方向排列其子widget</font>。定义如下：

```dart
Row({
  ...
  TextDirection textDirection,
  MainAxisSize mainAxisSize = MainAxisSize.max,
  MainAxisAlignment mainAxisAlignment = MainAxisAlignment.start,
  VerticalDirection verticalDirection = VerticalDirection.down,
  CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.center,
  List<Widget> children = const <Widget>[],
})
```
+ <font color=#9400D3>textDirection</font>：表示水平方向子组件的布局顺序(是从左往右还是从右往左)，默认为系统当前`Locale`环境的文本方向(如中文、英语都是从左往右，而阿拉伯语是从右往左)。

+ <font color=#9400D3>mainAxisSize</font>：表示`Row`在主轴(水平)方向占用的空间，默认是`MainAxisSize.max`，表示尽可能多的占用水平方向的空间，此时无论子`widgets`实际占用多少水平空间，`Row`的宽度始终等于水平方向的最大宽度；而`MainAxisSize.min`表示尽可能少的占用水平空间，当子组件没有占满水平剩余空间，则Row的实际宽度等于所有子组件占用的的水平空间；

+ <font color=#9400D3>mainAxisAlignment</font>：表示子组件在Row所占用的水平空间内对齐方式，如果`mainAxisSize`值为`MainAxisSize.min`，则此属性无意义，因为子组件的宽度等于Row的宽度。只有当`mainAxisSize`的值为`MainAxisSize.max`时，此属性才有意义:
	+ <font color=#1E90FF>当textDirection取值为TextDirection.ltr时，则MainAxisAlignment.start表示左对齐，MainAxisAlignment.end表示右对齐</font>
	+ <font color=#1E90FF>当textDirection取值为TextDirection.rtl时，则MainAxisAlignment.start表示右对齐，MainAxisAlignment.end表示左对齐</font>
	+ <font color=#DD1144>MainAxisAlignment.center表示居中对齐。读者可以这么理解：textDirection是mainAxisAlignment的参考系。</font>

+ <font color=#9400D3>verticalDirection</font>：表示`Row`纵轴（垂直）的对齐方向，默认是`VerticalDirection.down`，表示从上到下。

+ <font color=#9400D3>crossAxisAlignment</font>:表示子组件在纵轴方向的对齐方式，`Row`的高度等于子组件中最高的子元素高度，它的取值和`MainAxisAlignment`一样(包含`start`、`end`、 `center`三个值)，不同的是`crossAxisAlignment`的参考系是`verticalDirection`
	+ <font color=#1E90FF>当verticalDirection值为VerticalDirection.down时crossAxisAlignment.start指顶部对齐</font>
	+ <font color=#1E90FF>当verticalDirection值为VerticalDirection.up时，crossAxisAlignment.start指底部对齐</font>
	+ <font color=#1E90FF>crossAxisAlignment.center指沿横轴对齐</font>

```dart
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
        body: Row(
          textDirection: TextDirection.rtl, // 从右向左
          mainAxisAlignment: MainAxisAlignment.center, // 横轴居中
          verticalDirection: VerticalDirection.down, // 从上到下
          crossAxisAlignment: CrossAxisAlignment.center, // 纵轴居中
          children: <Widget>[
            Container(
              height: 30,
              decoration: BoxDecoration(color: Colors.yellow),
              child: Text('one'),
            ),
            Container(
              height: 100,
              decoration: BoxDecoration(color: Colors.greenAccent),
              child: Text('two'),
            ),
            Container(
              height: 60,
              decoration: BoxDecoration(color: Colors.redAccent),
              child: Text('three'),
            ),
          ],
        )
      ),
    );
  }
}
```
<img :src="$withBase('/flutter_row.png')" alt="Row实例">


## 线性-Column
`Column`可以在垂直方向排列其子组件。参数和`Row`一样，不同的是布局方向为垂直，主轴纵轴正好相反，所以我们这里要说一个特别重要的问题，<font color=#DD1144>无论是Row或者Column，textDirection和verticalDirection都是两个重要的参考点，不同的是在Row中，mainAxisAlignment是以textDirection为参考点的，crossAxisAlignment 是以verticalDirection为参考点的，而在Column是相反的，因为主轴变成的纵向，所以mainAxisAlignment是以verticalDirection为参考点的，crossAxisAlignment是以textDirection为参考点的</font>

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
        body: Column(
          textDirection: TextDirection.ltr,
          crossAxisAlignment: CrossAxisAlignment.center, // 设定与textDirection有关
          verticalDirection: VerticalDirection.down,
          mainAxisAlignment: MainAxisAlignment.center, // 设定与verticalDirection有关
          children: <Widget>[
            Container(
              height: 30,
              width: 80,
              margin: EdgeInsets.only(top:20),
              decoration: BoxDecoration(color: Colors.yellow),
              child: Center(
                child: Text('one'),
              )
            ),
            Container(
              height: 100,
              width: 150,
              margin: EdgeInsets.only(top:20),
              decoration: BoxDecoration(color: Colors.greenAccent),
              child: Center(
                child: Text('two'),
              )
            ),
            Container(
              height: 60,
              width: 70,
              margin: EdgeInsets.only(top:20),
              decoration: BoxDecoration(color: Colors.redAccent),
              child:Center(
                child:  Text('three'),
              )
            ),
          ],
        )
      ),
    );
  }
}

```
<img :src="$withBase('/flutter_column.png')" alt="column布局">

## 弹性-Flex
`flex`组件可以沿着水平或垂直方向排列子组件，如果你知道主轴方向，使用`Row`或`Column`会方便一些，因为`Row`和`Column`都继承自`Flex`，参数基本相同，所以能使用`Flex`的地方基本上都可以使用`Row`或`Column`。`Flex`本身功能是很强大的，它也可以和`Expanded`组件配合实现弹性布局。接下来我们只讨论`Flex`和弹性布局相关的属性(其它属性已经在介绍`Row`和`Column`时介绍过了)
```dart
Flex({
  ...
  @required this.direction, //弹性布局的方向, Row默认为水平方向，Column默认为垂直方向
  List<Widget> children = const <Widget>[],
})
```
`Flex`继承自`MultiChildRenderObjectWidget`，对应的`RenderObject`为`RenderFlex`，`RenderFlex`中实现了其布局算法。


## 弹性-Expanded
`Expanded`可以按比例“扩伸” `Row`、`Column`和`Flex`子组件所占用的空间。

`flex`参数为弹性系数，如果为0或null，则`child`是没有弹性的，即不会被扩伸占用的空间。如果大于0，所有的`Expanded`按照其flex的比例来分割主轴的全部空闲空间
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
        body: Container(
          height: 100,
          child: Flex(
            direction: Axis.horizontal, // 水平方向
            children: <Widget>[
              Expanded(
                flex: 1,// 占1/2
                child: Container(
                  decoration: BoxDecoration(color: Colors.redAccent),
                ),
              ),
              Expanded(
                flex: 1, // 占1/2
                child: Container(
                  child: Flex(
                    direction: Axis.vertical, // 垂直方向
                    children: <Widget>[
                      Expanded(
                        flex: 2, // 占2/3
                        child: Container(
                          decoration: BoxDecoration(color: Colors.deepPurple),
                        ),
                      ),
                      Expanded(
                        flex: 1, // 占1/3
                        child: Container(
                          decoration: BoxDecoration(color: Colors.greenAccent),
                        ),
                      )
                    ],
                  ),
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
<img :src="$withBase('/flutter_flex.png')" alt="flex算法">

**参考文章**

+ [4.2 线性布局（Row和Column）](https://book.flutterchina.club/chapter4/row_and_column.html)