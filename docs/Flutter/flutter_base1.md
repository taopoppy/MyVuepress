# flutter的组件

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
    setState(() {
      _refreshTime++;
    });
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
                      Text('this is list page, you had refresh $_refreshTime times'),
                      Image.network( // 图片组件
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

## 计数器
通过`Android Studio`或`VS Code`创建一个新的`Flutter`工程，命名为`"first_flutter_app"`。创建好后，就会得到一个计数器应用的`Demo`,有了上面关于`widget`的基础我们就能看的懂这个计数器的例子了：
```dart
import 'package:flutter/material.dart';

void main() => runApp(new MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      title: 'Flutter Demo',
      theme: new ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: new MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);
  final String title;

  @override
  _MyHomePageState createState() => new _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      appBar: new AppBar(
        title: new Text(widget.title),
      ),
      body: new Center(
        child: new Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            new Text(
              'You have pushed the button this many times:',
            ),
            new Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: new FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: new Icon(Icons.add),
      ),
    );
  }
}
```

<font color=#1E90FF>**① 导入包**</font>

```dart
import 'package:flutter/material.dart';
```
此行代码作用是导入了`Material UI`组件库。`Material`是一种标准的移动端和`web`端的视觉设计语言， `Flutter`默认提供了一套丰富的`Material`风格的UI组件。

<font color=#1E90FF>**② 应用结构**</font>

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      //应用名称
      title: 'Flutter Demo',
      theme: new ThemeData(
        //蓝色主题
        primarySwatch: Colors.blue,
      ),
      //应用首页路由
      home: new MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}
```
+ `MyApp`类代表`Flutter`应用，它继承了`StatelessWidget`类，这也就意味着应用本身也是一个`widget`。

+ <font color=#1E90FF>在Flutter中，大多数东西都是widget（后同“组件”或“部件”），包括对齐(alignment)、填充(padding)和布局(layout)等，它们都是以widget的形式提供。</font>

+ <font color=#DD1144>Flutter在构建页面时，会调用组件的build方法，widget的主要工作是提供一个build()方法来描述如何构建UI界面（通常是通过组合、拼装其它基础widget）。</font>

+ <font color=#DD1144>MaterialApp 是Material库中提供的Flutter APP框架，通过它可以设置应用的名称、主题、语言、首页及路由列表等。MaterialApp也是一个widget。</font>

+ <font color=#1E90FF>home 为Flutter应用的首页，它也是一个widget。</font>

<font color=#1E90FF>**③ 首页**</font>

```dart
class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);
  final String title;
  @override
  _MyHomePageState createState() => new _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
...
}
```
+ `MyHomePage`是`Flutter应`用的首页，它继承自`StatefulWidget`类，表示它是一个有状态的组件（`Stateful widget`）,现在我们只需简单认为有状态的组件（`Stateful widget`） 和无状态的组件（`Stateless widget`）有两点不同：

+ <font color=#DD1144>Stateful widget可以拥有状态，这些状态在widget生命周期中是可以变的，而Stateless widget是不可变的</font>。

+ `Stateful widget`至少由两个类组成：一个StatefulWidget类，一个 State类。

+ `StatefulWidget`类本身是不变的，但是`State`类中持有的状态在`widget`生命周期中可能会发生变化。`_MyHomePageState类`是`MyHomePage`类对应的状态类。看到这里，读者可能已经发现：和`MyApp`类不同， `MyHomePage`类中并没有`build`方法，取而代之的是，`build`方法被挪到了`_MyHomePageState`方法中，至于为什么这么做，这主要是为了提高开发的灵活性。如果将`build()`方法放在`StatefulWidget`中则会有两个问题：
  + 状态访问不便
  + 继承`StatefulWidget`不便

  至于为什么会产生这两个问题，有兴趣可以参考[Flutter:2.1 计数器应用示例](https://book.flutterchina.club/chapter2/first_flutter_app.html),这里我们就不做赘述


<font color=#1E90FF>**④ State类**</font>

接下来，我们看看`_MyHomePageState`中都包含哪些东西：

该组件的状态。由于我们只需要维护一个点击次数计数器，所以定义一个`_counter`状态：

```dart
int _counter = 0; //用于记录按钮点击的总次数
```
`_counter`为保存屏幕右下角带`“+”`号按钮点击次数的状态。设置状态的自增函数。
```dart
void _incrementCounter() {
  setState(() {
     _counter++;
  });
}
```
当按钮点击时，会调用此函数，该函数的作用是先自增`_counter`，然后调用`setState`方法。`setState`方法的作用是通知`Flutter`框架，<font color=#DD1144>有状态发生了改变，Flutter框架收到通知后，会执行build方法来根据新的状态重新构建界面， Flutter 对此方法做了优化，使重新执行变的很快，所以你可以重新构建任何需要更新的东西，而无需分别去修改各个widget。</font>

<font color=#1E90FF>**⑤ UI界面**</font>

构建`UI`界面的逻辑在`build`方法中，当`MyHomePage`第一次创建时，`_MyHomePageState`类会被创建，当初始化完成后，`Flutter`框架会调用`Widget`的`build`方法来构建`widget`树，最终将`widget`树渲染到设备屏幕上。所以，我们看看`_MyHomePageState`的`build`方法中都干了什么事：
```dart
Widget build(BuildContext context) {
    return new Scaffold(
      appBar: new AppBar(
        title: new Text(widget.title),
      ),
      body: new Center(
        child: new Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            new Text(
              'You have pushed the button this many times:',
            ),
            new Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: new FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: new Icon(Icons.add),
      ),
    );
  }
```
+ `Scaffold`是`Material`库中提供的页面脚手架，它提供了默认的导航栏、标题和包含主屏幕`widget`树（后同“组件树”或“部件树”）的`body`属性，组件树可以很复杂。

+ <font color=#1E90FF>body的组件树中包含了一个Center 组件，Center可以将其子组件树对齐到屏幕中心。此例中， Center子组件是一个Column组件，Column的作用是将其所有子组件沿屏幕垂直方向依次排列；此例中Column子组件是两个Text，第一个Text显示固定文本 “You have pushed the button this many times:”，第二个Text 显示_counter状态的数值</font>。

+ `floatingActionButton`是页面右下角的带`“+”`的悬浮按钮，它的`onPressed`属性接受一个回调函数，代表它被点击后的处理器，本例中直接将`_incrementCounter`方法作为其处理函数。

<font color=#9400D3>现在，我们将整个计数器执行流程串起来：当右下角的floatingActionButton按钮被点击之后，会调用_incrementCounter方法。在_incrementCounter方法中，首先会自增_counter计数器（状态），然后setState会通知Flutter框架状态发生变化，接着，Flutter框架会调用build方法以新的状态重新构建UI，最终显示在设备屏幕上。</font>

**参考资料**

+ [Flutter实战](https://book.flutterchina.club/)
+ [Flutter从入门到进阶 实战携程网App](https://coding.imooc.com/class/321.html)