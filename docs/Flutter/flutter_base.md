# flutter基础

## Flutter包和插件
`Flutter`提供了一个网址为[https://pub.dartlang.org](https://pub.dartlang.org),我们可以在其中搜索我们需要的插件，比如我们现在要下载和使用一个插件叫做：`flutter_color_plugin`,要在项目当中使用我们只需要下面三步：
+ <font color=#DD1144>在包管理文件pubspec.yaml中添加下面代码</font>：
	```dart
	flutter_color_plugin: ^0.0.2
	```
+ <font color=#1E90FF>使用下面的命令进行安装</font>，在`amdroid studio`当中可以直接点击<font color=#DD1144>Pub get</font>按钮来下载包
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
