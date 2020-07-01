# Flutter的资源和自定义

## 导入和使用资源
我们首先导入一部分的图片资源到项目当中的`images`文件夹当中，接着要想在项目当中使用这些资源图片，我们需要先到`pubspec.yaml`当中去配置一下：
```yaml
flutter:
  assets:
   - images/type_channelgroup.png
   - images/type_channelgs.png
   - images/type_channelplane.png
   - images/type_channeltrain.png
   - images/type_cruise.png
   - images/type_district.png
   - images/type_food.png
   - images/type_hotel.png
   - images/type_huodong.png
   - images/type_shop.png
   - images/type_sight.png
   - images/type_ticket.png
   - images/type_travelgroup.png
```
然后我们使用的时候就可以这样使用；
```dart
Image(
	width: 100,
	height: 100,
	image:  AssetImage('images/type_channelgroup.png'), // 本地资源文件直接使用AssetImage
),
```
## 修改应用主题
```dart
// main.dart
import 'package:flutter/material.dart';

void main() {
  runApp(DynamicThemeState());
}

// 需要有状态的StatefulWidget组件
class DynamicThemeState extends StatefulWidget {
  @override
  _DynamicThemeStateState createState() => _DynamicThemeStateState();
}

class _DynamicThemeStateState extends State<DynamicThemeState> {
  // 定义默认的主题模式
  Brightness _brightness = Brightness.light; // 白天
  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      title: 'Flutter App',
      theme: new ThemeData(
        brightness: _brightness, // 主题设置成为变量
        primarySwatch: Colors.deepPurple
      ),
      home: Scaffold(
        appBar: AppBar(title: Text('路由的创建和导航'),),
        body: Column(
          children: <Widget>[
            RaisedButton(   // 切换主题的按钮
              onPressed: () {
                setState(() {
                  if(_brightness == Brightness.dark) {
                    _brightness = Brightness.light;
                  } else {
                    _brightness = Brightness.dark;
                  }
                });
              },
              child: Text('change Theme'),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 自定义字体
<font color=#1E90FF>**① 下载字体**</font>

首先我们可以到[https://fonts.google.com/](https://fonts.google.com/)这个网站上去找一些字体，然后下载下来，下载下来的是个`zip`文件，解压之后是个`.ttf`文件，然后我们将其保存在项目的`fonts`文件夹中，路径为：`flutter-project\flutter_base\fonts\MuseoModerno-VariableFont_wght.ttf`

<font color=#1E90FF>**② 配置文件**</font>

到`pubspec.yaml`当中去配置字体的文件：
```yaml
fonts:
  - family: MuseoModerno
    fonts:
      - asset: fonts/MuseoModerno-VariableFont_wght.ttf
```
这样就完成了字体的注册。

<font color=#1E90FF>**③ 字体的应用**</font>



字体的应用有两种，一种是整个`App`都用这种字体，第二种是局部用到特殊字体。整体`APP`都要用到这个字体直接在`main.dart`中修改：
```dart
class _DynamicThemeStateState extends State<DynamicThemeState> {
  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      title: 'Flutter App',
      theme: new ThemeData(
        fontFamily: 'MuseoModerno', // 添加字体的名称即可
        brightness: _brightness,
        primarySwatch: Colors.deepPurple
      ),
    );
  }
}
```
然后回到`pubspec.yaml`，点击上面的`Pub get`来添加字体到项目，然后重启即可。

局部使用自定义字体就比较简单了，如下所示：
```dart
// fontFamily的值设置成为自定义字体的名称即可
Text('change Theme',style: TextStyle(fontFamily: 'MuseoModerno'),)
```


## 第三方App
如何在`flutter`打开第三方`App`呢？我们需要<font color=#DD1144>url_launcher</font>这样一个`flutter`插件来帮助我们，我们到官网去看看用法，地址为[https://pub.dev/packages/url_launcher#-installing-tab-](https://pub.dev/packages/url_launcher#-installing-tab-)
```dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(Scaffold(
    body: Center(
      child: Column(
        children: <Widget>[
          RaisedButton(
            onPressed: _launchURL,
            child: Text('打开浏览器'),
          ),
          RaisedButton(
            onPressed: _launchMap,
            child: Text('打开地图'),
          ),
        ]
      )
    ),
  ));
}
_launchMap() async {
  // Android
  const url = 'geo:52.32.4.917'; // App提供者提供的schema
  if(await canLaunch(url)) {
    await launch(url);
  } else {
    // IOS
    const url = 'http://maps.apple.com/?ll=52.32.4.917';
    if(await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not lanch $url'
    }
  }
}
_launchURL() async {
  const url = 'https://flutter.dev';
  if (await canLaunch(url)) {
    await launch(url);
  } else {
    throw 'Could not launch $url';
  }
}
```

## 生命周期
### 1. Widget生命周期

`Fluter Widget`的生命周期重点讲解`StatefulWidget`的生命周期，因为`StatelessWidget`无状态组件只有`createElement`和`build`两个生命周期方法，但是`StatefulWidget`的生命周期方法按照时期的不同可以分为三组：
+ <font color=#9400D3>初始化时期</font>：`createState`，`initState`
+ <font color=#9400D3>更新时期</font>：`didChangeDependencies`，`build`，`didUpdateWidget`
+ <font color=#9400D3>销毁期</font>：`deactivate`，`dispose`

```dart
import 'package:flutter/material.dart';

class WidgetLifecycle extends StatefulWidget {
  // 当我们构建一个新的StatefulWidget时候，会立即调用这个createState
  // 而且这个方法必须被覆盖，或者说必须重写
  @override
  _WidgetLifecycleState createState() => _WidgetLifecycleState();
}

class _WidgetLifecycleState extends State<WidgetLifecycle> {
  // 创建一个变量
  int _count = 0;



  // initState方法是创建widget时调用的除构造方法外的第一个方法
  // 类似于android中的onCreate() 和 IOS当中的viewDIdiLoad()
  // 在这个方法中通常会做一些初始化的工作，比如channel的初始化，监听器的初始化
  @override
  void initState() {
    print('----initState----');
    super.initState();
  }

  // 当依赖的State对象改变时会调用
  // a. 在第一次构建widget时，在initState()之后立即调用此方法
  // b. 如果StatefulWidget依赖于InheritedWidget，那么当前Stata所依赖InheritedWidget中的变量改变时会再次调用它
  // InheritedWidget可以高效的将数据在Widget树中向下传递，共享
  @override
  void didChangeDependencies() {
    print('----didChangeDependencies----');
    super.didChangeDependencies();
  }

  // 这个是一个必须实现的方法，在这里实现你要呈现的页面内容
  // 它会在didChangeDependencies()方法之后立即调用
  // 另外当调用setState之后也会再次调用该方法
  @override
  Widget build(BuildContext context) {
    print('----build----');
    return Scaffold(
      appBar: AppBar(
        title: Text('flutter widget lifecycle'),
        leading: GestureDetector(
          onTap: (){
            Navigator.pop(context);
          },
          child: Icon(Icons.arrow_back,color: Colors.white,),
        ),
      ),
      body: Center(
        child: Column(
          children: <Widget>[
            RaisedButton(
              onPressed: (){
                setState(() {
                  _count +=1;
                });
              },
              child: Text('click',style: TextStyle(color: Colors.deepPurple,fontSize: 26),),
            ),
            Text(_count.toString())
          ],
        ),
      ),
    );
  }

  // 这个方法不常用到，当父组件需要重绘的时候才会调用到
  // 该方法中会携带一个oldWidget参数，可以将其与当前的widget进行对比以便执行一些额外的逻辑，比如
  // if(oldWidget.xxx != widget.xxx)
  @override
  void didUpdateWidget(WidgetLifecycle oldWidget) {
    print('----didUpdateWidget----');
    super.didUpdateWidget(oldWidget);
  }

  // 这个方法也不常用，在组件被移除时调用，在dispose之前调用
  @override
  void deactivate() {
    print('----deactivate----');
    super.deactivate();
  }

  // 这个方法比较常用，在组件被销毁的时候调用
  // 通常在该方法中执行一些资源的释放工作，比如监听器的卸载，channel的销毁等等
  @override
  void dispose() {
    print('----dispose----');
    super.dispose();
  }
}
```
可以看到，我们进入页面点击按钮到点击返回按钮退出页面的整个过程中，生命周期的执行顺序如下：
+ <font color=#1E90FF>----initState----</font>：进入页面即调用
+ <font color=#1E90FF>----didChangeDependencies----</font>：进入页面即调用
+ <font color=#1E90FF>----build----</font>：进入页面即调用
+ <font color=#1E90FF>----build----</font>：点击按钮重新调用
+ <font color=#1E90FF>----deactivate----</font>：退出页面即调用
+ <font color=#1E90FF>----dispose----</font>：退出页面即调用

### 2. Application的生命周期
```dart
import 'package:flutter/material.dart';

// 如何获取Flutter应用维度的生命周期
// WidgetBindingObserver；是一个Widgets绑定观察器，通过它我们可以监听应用的生命周期，语言的变化-
class AppLifecycle extends StatefulWidget {
  @override
  _AppLifecycleState createState() => _AppLifecycleState();
}

// 1.with来复用WidgetsBindingObserver这个类中已有的特性
class _AppLifecycleState extends State<AppLifecycle> with WidgetsBindingObserver {
  // 2. 将此类加入监听器当中
  @override
  void initState() {
    WidgetsBinding.instance.addObserver(this);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Application lifecycle'),
        leading: GestureDetector(
          onTap: (){
            Navigator.pop(context);
          },
          child: Icon(Icons.arrow_back,color: Colors.white,),
        ),
      ),
      body: Container(
        child: Text('Application lifecycle'),
      ),
    );
  }

  // 3.重写这个方法，当App的生命周期发生变化，会回调这个方法
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    print('state=$state');
    if(state == AppLifecycleState.paused) {
      print('App进入后台');
    } else if (state == AppLifecycleState.resumed) {
      print('App进入前台');
    } else if(state == AppLifecycleState.inactive) {
      // 不常用，应用程序处于非活动状态，并且未接受用户输入时调用，比如：来了个电话
    }
  }

  // 4. 组件销毁的时候移除观察器
  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}
```
