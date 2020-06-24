# 布局和路由

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

## 路由和导航创建

路由跳转有两种方法，分别是
+ <font color=#DD1144>注册路由名，通过路由名直接跳转</font>
+ <font color=#DD1144>直接通过组件名称跳转</font>
，我们来举个例子说明一下：
```dart
import 'package:flutter/material.dart';
import 'package:flutter_base/flutter_layout_page.dart';
import 'package:flutter_base/less_group_page.dart';
import 'package:flutter_base/stateful_group_page.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      title: 'Flutter App',
      theme: new ThemeData(
        primarySwatch: Colors.deepPurple
      ),
      routes: <String, WidgetBuilder>{ // 注册路由
        'less':(BuildContext context)=> LessGroupPage(),  // 起路由名
        'ful':(BuildContext context)=> StateFulGroup(),
        'lay':(BuildContext context)=> FlutterLayoutPage()
      },
      home: Scaffold(
        appBar: AppBar(title: Text('路由的创建和导航'),),
        body: RouteNavigator(),
      ),
    );
  }
}

class RouteNavigator extends StatefulWidget {
  @override
  _RouteNavigator createState() => _RouteNavigator();
}

class _RouteNavigator extends State<RouteNavigator> {
  bool byName = false;
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: <Widget>[
          SwitchListTile(
            title: Text('${byName? '':'不'}通过路由名跳转'),
            value:byName,
            onChanged: (value){
              setState(() {
                byName = value;
              });
            }),
          _item('Statelesswidget与基础组件', LessGroupPage(),'less'),
          _item('Statefulwidget与基础组件', StateFulGroup(),'ful'),
          _item('layout布局', FlutterLayoutPage(),'lay'),
        ],
      ),
    );
  }

  _item(String title, page, String routeName) {
    return Container(
      child: RaisedButton(
        onPressed: () {
          if(byName) {
            Navigator.pushNamed(context, routeName); // 路由名跳转
          } else {
            Navigator.push(context, MaterialPageRoute(builder: (context)=> page)); // 组件直接跳转
          }
        },
        child: Text(title),
      ),
    );
  }
}
```

同时我们还可以在别的组件当中去书写返回按钮：
```dart
Scaffold(
	appBar: AppBar(
		title: Text('StatelessWidget和基础组件'),
		leading: GestureDetector( // 手势组件
			onTap: () {
				Navigator.pop(context); // 返回前一个组件
			},
			child: Icon(Icons.arrow_back), // 返回箭头icon
		),
	),
)
```
