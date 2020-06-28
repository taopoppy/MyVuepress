# 资源和自定义

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
