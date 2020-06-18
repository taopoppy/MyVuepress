# flutter组件和布局

## Flutter包和插件
`Flutter`提供了一个网址为[https://pub.dartlang.org](https://pub.dartlang.org),我们可以在其中搜索我们需要的插件，比如我们现在要下载和使用一个插件叫做：`flutter_color_plugin`,要在项目当中使用我们只需要下面三步：
+ <font color=#1E90FF>在包管理文件pubspec.yaml中添加下面代码</font>：
	```dart
	flutter_color_plugin: ^0.0.2
	```
+ <font color=#1E90FF>使用下面的命令进行安装，在amdroid studio当中可以直接点击<font color=#DD1144>Pub get</font>按钮来下载包</font>
	```dart
	flutter pub get
	```
	然后等到在命令行中显示下面的字样表示下载完毕可以使用：
	```dart
	Running "flutter pub get" in flutter_app...                         3.2s
	Process finished with exit code 0
	```
+ <font color=#1E90FF>最后在文件中引入下面代码即可使用包</font>：
	```dart
	import 'package:flutter_color_plugin/flutter_color_plugin.dart';
	```

至于插件和包怎么用，在每个插件的详情页都有详细的说明

## StatelessWidget无状态组件
由`StatefulWidget`组件衍生出的一系列组件有
+ <font color=#9400D3>Container</font>：容器组件
+ <font color=#9400D3>Text</font>：文本组件
+ <font color=#9400D3>lcon</font>：图标组件
+ <font color=#9400D3>CloseButton</font>：关闭按钮组件
+ <font color=#9400D3>BackButton</font>：返回按钮组件
+ <font color=#9400D3>Chip</font>：芯片组件
+ <font color=#9400D3>Divider</font>：分割线组件
+ <font color=#9400D3>Card</font>：卡片组件
+ <font color=#9400D3>AlertDialog</font>：弹框组件

`StatelessWidget`的中文翻译就是<font color=#1E90FF>无状态的小部件</font>，什么是无状态呢？<font color=#DD1144>组件不需要根据自己内部的状态来重新渲染自己</font>，我们现在来写一个简单的`demo`来简单的展示一下上述这些常用的`StatefulWidget`组件：
```dart
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class LessGroupPage extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    TextStyle textStyle = TextStyle(fontSize: 20);
    // 定义关闭按钮点击事件
    closeOnPress() {
      print('this is closeButton');
    }

    // 定义返回按钮点击事件
    clickOnPress() {
      print('this is clickButton');
    }

    return MaterialApp(
      title: 'StatelessWidget与基础组件',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: Scaffold(
        appBar: AppBar(title: Text('StatelessWidget和基础组件'),
        ),
        body: Container( // 容器组件
          decoration: BoxDecoration(color:Colors.yellow),
          alignment: Alignment.center,
          child: Column(
            children: <Widget>[
              Text('Im text',style: textStyle), // Text文件组件
              Icon(Icons.android,size: 50,color:Colors.deepOrange), // 图标组件
              CloseButton(color: Colors.deepPurpleAccent,onPressed: closeOnPress), // 关闭按钮组件
              BackButton(color:Colors.green,onPressed: clickOnPress), // 返回按钮组件
              Chip(
                avatar: Icon(Icons.android,color:Colors.deepPurple),
                label: Text('taopoppy')
              ),
              Divider(
                  height: 10, // 容器高度
                  indent: 20, // 左侧间距
                  endIndent: 20,// 右侧间距
                  color:Colors.greenAccent
              ),
              Card(
                color: Colors.blue,
                elevation: 5,
                margin:EdgeInsets.all(10),
                child: Container(
                  padding: EdgeInsets.all(10),
                  child: Text('Im card',style: textStyle,)
                )
              ),
              AlertDialog(
                title:Text('盘他'),
                content:Text('你个糟老头子坏的很')
              )//芯片组件
            ],
          ),
        ),
      )
    );
  }
}
```
<img :src="$withBase('/flutter_statelesswidget.png')" alt="statelessWidget">

每个无状态的组件都有自己可以设置的一些属性，你可以通过选中组件，然后按`F4`来查看这些组件的所有属性，至于每个组件，我们在后面有机会都会详细介绍

## StatefulWidget组件
说完无状态组件，我们来说一下有状态组件`StatefulWidget`，它衍生出的一系列组件有：
+ <font color=#9400D3>MaterialApp</font>：根节点组件
+ <font color=#9400D3>Scaffold</font>：封装好的导航页面组件
+ <font color=#9400D3>AppBar</font>：顶部导航栏组件
+ <font color=#9400D3>BottomNavigationBar</font>：底部导航栏组件
+ <font color=#9400D3>RefreshIndicator</font>：刷新指示器组件
+ <font color=#9400D3>Image</font>：图片组件
+ <font color=#9400D3>TextField</font>：输入框组件
+ <font color=#9400D3>PageView</font>：轮播图组件

我们来写一个页面，覆盖我们上述的这些组件：
```dart
import 'package:flutter/material.dart';

class StateFulGroup extends StatefulWidget {
  @override
  _StateFulGroupState createState() => _StateFulGroupState();
}

class _StateFulGroupState extends State<StateFulGroup> {
  int _currentIndex = 0; // 定义当前底部导航栏选中下标
  int _refreshTime = 0; // 定义下拉刷新次数

  // 悬浮按钮点就事件
  _floatButtonClick() {
    print('floatingActionButton page ${this._currentIndex}');
    print('this is refresh ${this._refreshTime} time');
  }

  // 下拉刷新事件
  Future<Null> _handleRefresh() async {
    this._refreshTime ++;
    await Future.delayed(Duration(milliseconds:200));
    return null;
  }

  // 定义轮播图每个页面返回内容
  _item(String title,Color color) {
    return Container(
      alignment: Alignment.center,
      decoration: BoxDecoration(color:color),
      child: Text(title,style: TextStyle(fontSize: 22,color: Colors.white))
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp( //  根组件
      title: 'MaterialApp组件',
      theme: ThemeData(
        primaryColor: Colors.deepPurple,
      ),
      home: Scaffold( // 一个被封装好的页面组件，有顶部和底部导航
        floatingActionButton: FloatingActionButton( // 悬浮组件
          onPressed: _floatButtonClick,
          child: Icon(Icons.android),
        ),
        bottomNavigationBar: BottomNavigationBar( // 底部导航
          currentIndex:_currentIndex, // 根据_currentIndex的值选中当中下标
          onTap: (index){
            setState(()=> _currentIndex = index); // 点击选中
          },
          items:[
            BottomNavigationBarItem(
              title: Text('home'),
              icon:Icon(Icons.home,color:Colors.grey),
              activeIcon: Icon(Icons.home,color:Colors.deepPurple)
            ),
            BottomNavigationBarItem(
              title:Text('list'),
              icon:Icon(Icons.list,color:Colors.grey),
              activeIcon: Icon(Icons.list,color:Colors.deepPurple)
            )
          ]
        ),
        appBar:AppBar( // 顶部导航
          title:Text('AppBar'),
        ),
        body: this._currentIndex == 0?
          Container(// home页面
            decoration: BoxDecoration(color: Colors.yellow),
            alignment: Alignment.center,
            child: Column(
              children: <Widget>[
                Text('this is home page')
              ],
            ),
          ):
          RefreshIndicator( // 刷新组件一定要结合列表使用
            onRefresh: _handleRefresh,
            child: ListView(
              children: <Widget>[
                Container(
                  child: Column(
                    children: <Widget>[
                      Text('this is list page'),
                      Image.network( // 图盘组件
                        'http://www.devio.org/img/avatar.png',
                        width: 100,
                        height: 100,
                      ),
                      TextField( // 输入框组件
                        decoration: InputDecoration(
                          contentPadding: EdgeInsets.fromLTRB(5, 0, 0, 0),
                          hintText: '请输入',
                          hintStyle: TextStyle(fontSize: 15,color: Colors.deepPurple)
                        ),
                      ),
                      Container(
                        height: 100,
                        margin: EdgeInsets.only(top:10),
                        decoration: BoxDecoration(color: Colors.lightBlueAccent),
                        child: PageView( // 轮播图，需要被Container包裹来限制大小
                          children: <Widget>[
                            _item('Page',Colors.deepPurple), // 轮播图第一页
                            _item('Page',Colors.green), // 轮播图第二页
                            _item('Page',Colors.redAccent), // 轮播第三页
                          ],
                        )
                      )
                    ],
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

## Flutter的布局