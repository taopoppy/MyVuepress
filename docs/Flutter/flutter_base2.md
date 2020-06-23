# 布局和定位概述

## 布局概述

关于布局问题始终都是前端的一个大的知识点，我们来看一下`flutter`的布局组件都有哪些？
<img :src="$withBase('/flutter_bujuwidget.png')" alt="flutter布局">

+ <font color=#9400D3>RenderObjectWidget</font>：它提供了一系列的配置，配置主要用于如何去约束里面布局的一些配置。
	+ <font color=#9400D3>SingChildRenderObjectWidget</font>：单节点的布局组件
		+ <font color=#9400D3>Opacity</font>：改变透明度的组件
		+ <font color=#9400D3>ClipOval</font>：子组件为正方形时剪裁为内贴圆形，为矩形时，剪裁为内贴椭圆
		+ <font color=#9400D3>ClipRRect</font>：将子组件剪裁为圆角矩形
		+ <font color=#9400D3>PhysicalModel</font>：显示不同形状的布局组件
		+ <font color=#9400D3>Center</font>：居中的布局组件
		+ <font color=#9400D3>Padding</font>：内边距的布局组件
		+ <font color=#9400D3>SizeBox</font>：约束布局大小的布局组件
		+ <font color=#9400D3>FractionallySizeBox</font>：水平方向伸展的布局组件
	+ <font color=#9400D3>MultiChildRenderObjectWidget</font>：多节点的布局组件
		+ <font color=#9400D3>Stack</font>：重叠的布局组件
		+ <font color=#9400D3>Flex</font>：弹性布局组件
			+ <font color=#9400D3>Column</font>：Y轴的布局组件
			+ <font color=#9400D3>Row</font>：X轴的布局组件
		+ <font color=#9400D3>Wrap</font>：水平换行布局组件
		+ <font color=#9400D3>Flow</font>：流式布局组件

+ <font color=#9400D3>ParentDataWidget</font>
	+ <font color=#9400D3>Positioned</font>：固定位置组件，层叠布局组件
	+ <font color=#9400D3>Expanded</font>：垂直方向伸展的布局组件

```dart
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class FlutterLayoutPage extends StatefulWidget {
  @override
  _FlutterLayoutPageState createState() => _FlutterLayoutPageState();
}

class _FlutterLayoutPageState extends State<FlutterLayoutPage> {
  _item(String title,Color color) {
    return Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(color:color),
        child: Text(title,style: TextStyle(fontSize: 22,color: Colors.white))
    );
  }

  _chip(String label) {
    return Chip( // 小部件
      avatar: Icon(Icons.android,color: Colors.deepOrange,),
      label: Text(label.substring(0,1),style: TextStyle(fontSize: 10),),
    );
  }

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
          decoration: BoxDecoration(
            color: Colors.white,
          ),
          alignment: Alignment.center,
          child: Column( // 垂直布局
            children: <Widget>[
              Row( // 水平布局
                children: <Widget>[
                  ClipOval( // 圆形布局组件
                    child: Image.network('http://www.devio.org/img/avatar.png',width: 100,height: 100,),
                  ),
                  Padding(
                    padding: EdgeInsets.all(10),
                    child: ClipRRect( // 不同裁剪方式的布局组件
                      borderRadius: BorderRadius.all(Radius.circular(10)), // 裁圆角
                      clipBehavior: Clip.antiAlias, // 抗锯齿
                      child: Opacity(
                        opacity: 0.6,
                        child: Image.network('http://www.devio.org/img/avatar.png',width: 100,height: 100,),
                      ),
                    ),
                  ),
                ],
              ),
              Container(
                margin: EdgeInsets.all(10),
                height: 150,
                child: PhysicalModel( // 也是裁剪布局
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(30),
                    clipBehavior: Clip.antiAlias,
                    child: PageView(
                      children: <Widget>[
                        _item('Page1', Colors.deepPurple),
                        _item('Page2',Colors.green),
                        _item('Page3',Colors.redAccent),
                      ],
                    ),
                )
              ),
              Column(
                children: <Widget>[
                  FractionallySizedBox(
                    widthFactor: 0.5,
                    child: Container(
                      decoration: BoxDecoration(color: Colors.green),
                      child: Text('宽度撑满'),
                    ),
                  )
                ],
              ),
              Stack( // 重叠组件
                children: <Widget>[
                  Image.network('http://www.devio.org/img/avatar.png',height: 100,width:100,),
                  Positioned( // 定义上层的图片在下层图片的左下方
                    left: 0,
                    bottom: 0,
                    child: Image.network('http://www.devio.org/img/avatar.png',height: 36,width:36,),
                  )
                ],
              ),
              Wrap(
                spacing: 8, // 水平边距
                runSpacing: 10, // 垂直边距
                children: <Widget>[
                  _chip('Flutter'), _chip('进阶'), _chip('学习'), _chip('赶紧'), _chip('速度'),
                  _chip('Flutter'), _chip('进阶'), _chip('学习'), _chip('赶紧'), _chip('速度'),
                ],
              ),
              Column(
                children: <Widget>[
                  Text('this is Expanded'),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(color: Colors.greenAccent),
                      child: Text('拉伸填满度'),
                    ),
                  )
                ],
              )
            ],
          ),
        ),
      )
    );
  }
}

```

所谓线性布局，即指沿水平或垂直方向排布子组件。`Flutter`中通过`Row`和`Column`来实现线性布局，类似于`Android`中的`LinearLayout`控件。`Row`和`Column`都继承自`Flex`，我们将在弹性布局一节中详细介绍`Flex`

## 对齐和相对定位

### 1. Align
`Align` 组件可以调整子组件的位置，并且可以根据子组件的宽高来确定自身的的宽高，定义如下：
```dart
Align({
  Key key,
  this.alignment = Alignment.center,
  this.widthFactor,
  this.heightFactor,
  Widget child,
})
```
+ <font color=#9400D3>alignment</font> : 需要一个`AlignmentGeometry`类型的值，表示子组件在父组件中的起始位置。`AlignmentGeometry` 是一个抽象类，它有两个常用的子类：`Alignment`和 `FractionalOffset`，我们将在下面的示例中详细介绍。

+ <font color=#9400D3>widthFactor</font>和<font color=#9400D3>heightFactor</font>:是用于确定`Align` 组件本身宽高的属性；它们是两个缩放因子，会分别乘以子元素的宽、高，最终的结果就是`Align` 组件的宽高。如果值为`null`，则组件的宽高将会占用尽可能多的空间。
```dart
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
          decoration: BoxDecoration(color: Colors.yellowAccent),
          child: Align(
            alignment: Alignment.topRight, // 右上角
            heightFactor: 2, // 高为子组件的两倍
            widthFactor: 3, // 宽为子组件的三倍
            child: FlutterLogo(size: 60,),
          ),
        )
      ),
    );
  }
}
```
<img :src="$withBase('/flutter_align.png')" alt="Align布局">

可以看到`FlutterLogo`是一个60的正方形，`Align`的`heightFactor`为2，`widthFactor`为3,所以最终`Align`的宽高分别是：60*3和60*2。

另外，我们通过`Alignment.topRight`将`FlutterLogo`定位在`Container`的右上角。那`Alignment.topRight`是什么呢？通过源码我们可以看到其定义如下：
```dart
//右上角
static const Alignment topRight = Alignment(1.0, -1.0);
```
可以看到它只是`Alignment`的一个实例，下面我们介绍一下`Alignment`。

### 2. Alignment
`Alignment`继承自`AlignmentGeometry`，表示矩形内的一个点，他有两个属性`x`、`y`，分别表示在水平和垂直方向的偏移，`Alignment`定义如下：
```dart
Alignment(this.x, this.y)
```
`Alignment`会以矩形的中心点作为坐标原点，即`Alignment(0.0, 0.0)` 。`x`、`y`的值从-1到1分别代表矩形左边到右边的距离和顶部到底边的距离，因此2个水平（或垂直）单位则等于矩形的宽（或高），如`Alignment(-1.0, -1.0)` 代表矩形的左侧顶点，而`Alignment(1.0, 1.0)`代表右侧底部终点，而`Alignment(1.0, -1.0)` 则正是右侧顶点，即`Alignment.topRight`。为了使用方便，矩形的原点、四个顶点，以及四条边的终点在`Alignment`类中都已经定义为了静态常量。

### 3. FractionalOffset
`FractionalOffset`继承自`Alignment`，它和`Alignment`唯一的区别就是坐标原点不同！`FractionalOffset` 的坐标原点为矩形的左侧顶点，这和布局系统的一致，所以理解起来会比较容易。

### 4. Center
我们在前面章节的例子中已经使用过`Center`组件来居中子元素了，现在我们正式来介绍一下它。通过查找`SDK`源码，我们看到`Center`组件定义如下:
```dart
class Center extends Align {
  const Center({ Key key, double widthFactor, double heightFactor, Widget child })
    : super(key: key, widthFactor: widthFactor, heightFactor: heightFactor, child: child);
}
```

<font color=#DD1144>可以看到Center继承自Align，它比Align只少了一个alignment 参数；由于Align的构造函数中alignment 值为Alignment.center，所以，我们可以认为Center组件其实是对齐方式确定（Alignment.center）了的Align。</font>