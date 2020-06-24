# 对齐和相对定位

## 定位_Align
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

## 定位_Alignment
`Alignment`继承自`AlignmentGeometry`，表示矩形内的一个点，他有两个属性`x`、`y`，分别表示在水平和垂直方向的偏移，`Alignment`定义如下：
```dart
Alignment(this.x, this.y)
```
`Alignment`会以矩形的中心点作为坐标原点，即`Alignment(0.0, 0.0)` 。`x`、`y`的值从-1到1分别代表矩形左边到右边的距离和顶部到底边的距离，因此2个水平（或垂直）单位则等于矩形的宽（或高），如`Alignment(-1.0, -1.0)` 代表矩形的左侧顶点，而`Alignment(1.0, 1.0)`代表右侧底部终点，而`Alignment(1.0, -1.0)` 则正是右侧顶点，即`Alignment.topRight`。为了使用方便，矩形的原点、四个顶点，以及四条边的终点在`Alignment`类中都已经定义为了静态常量。

## 定位_FractionalOffset
`FractionalOffset`继承自`Alignment`，它和`Alignment`唯一的区别就是坐标原点不同！`FractionalOffset` 的坐标原点为矩形的左侧顶点，这和布局系统的一致，所以理解起来会比较容易。

## 定位_Center
我们在前面章节的例子中已经使用过`Center`组件来居中子元素了，现在我们正式来介绍一下它。通过查找`SDK`源码，我们看到`Center`组件定义如下:
```dart
class Center extends Align {
  const Center({ Key key, double widthFactor, double heightFactor, Widget child })
    : super(key: key, widthFactor: widthFactor, heightFactor: heightFactor, child: child);
}
```

<font color=#DD1144>可以看到Center继承自Align，它比Align只少了一个alignment 参数；由于Align的构造函数中alignment 值为Alignment.center，所以，我们可以认为Center组件其实是对齐方式确定（Alignment.center）了的Align。</font>