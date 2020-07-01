# Flutter的手势和点击

## 点击事件
```dart
import 'package:flutter/material.dart';

class GesturePage extends StatefulWidget {
  @override
  _GesturePageState createState() => _GesturePageState();
}

class _GesturePageState extends State<GesturePage> {
  String printString = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('user gesture and click event'),
        leading: GestureDetector(
          onTap: () {
            Navigator.pop(context);
          },
          child: Icon(Icons.arrow_back,color: Colors.white,),
        ),
      ),
      body: FractionallySizedBox(
        widthFactor: 1,
        child: Stack(
          children: <Widget>[
            Column(
              children: <Widget>[
                GestureDetector(
                  onTap: ()=> _printMsg('点击'), // 一个点击事件的顺序是：onTapDown，onTapUp，onTap
                  onDoubleTap: ()=> _printMsg('双击'), // 一个双击事件的顺序是：onDoubleTap
                  onLongPress: ()=> _printMsg('长按'), // 一个长按事件的顺序是：onTapDown，onTapCancel，onLongPress
                  onTapCancel: ()=> _printMsg('取消'),
                  onTapUp: (e)=> _printMsg('松开'),
                  onTapDown: (e)=> _printMsg('按下'),
                  child: Container(
                    padding: EdgeInsets.all(50),
                    decoration: BoxDecoration(color: Colors.redAccent),
                  ),
                ),
                Text(printString),
              ],
            )
          ],
        ),
      ),
    );
  }

  _printMsg(String msg) {
    setState(() {
      printString += ', ${msg}';
    });
  }
}
```
要处理一个区域中的点击事件，需要使用`GestureDetector`组件来进行包裹，然后在内部进行一些不同点击的处理，首先要说的就是三个基础的事件：
+ <font color=#9400D3>onTapDown（按下）</font>：手指按下
+ <font color=#9400D3>onTapUp（松开）</font>：手指松开
+ <font color=#9400D3>onTapCancel（取消）</font>：取消，一般点击后，手指滑动到区域之外再松开会触发取消事件

接着，点击双击长按都是又上面的三个事件作为基础合成的：
+ <font color=#9400D3>onTap（点击）</font>：一个点击事件的顺序是：`onTapDown`（按下），`onTapUp`（松开），`onTap`（点击）
+ <font color=#9400D3>onDoubleTap（双击）</font>：一个双击事件的顺序是：`onDoubleTap`(双击)
+ <font color=#9400D3>onLongPress（长按）</font>：一个长按事件的顺序是：`onTapDown`（按下），`onTapCancel`（取消），`onLongPress`（长按）


## 手势处理
```dart
import 'package:flutter/material.dart';

class GesturePage extends StatefulWidget {
  @override
  _GesturePageState createState() => _GesturePageState();
}

class _GesturePageState extends State<GesturePage> {
  double moveX = 0,moveY = 0; // 小球的初始定位为（0，0）

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('user gesture and click event'),
        leading: GestureDetector(
          onTap: () {
            Navigator.pop(context);
          },
          child: Icon(Icons.arrow_back,color: Colors.white,),
        ),
      ),
      body: FractionallySizedBox(
        widthFactor: 1,
        child: Stack(
          children: <Widget>[
            Positioned(
              left: moveX,
              top: moveY,
              child: GestureDetector(
                onPanUpdate: (e) => doMove(e),
                onPanStart: (e)=> print('onPanStart'), // 手势开始触发的事件
                onPanDown: (e)=> print('onPanDown'), // 手势开始触发的事件
                onPanEnd: (e)=> endMove(e), // 手势结束触发的事件
                onPanCancel: () => print('onPanCancel'),
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(color:Colors.amber,borderRadius: BorderRadius.circular(36)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 手势变换的时候触发事件
  doMove(DragUpdateDetails e) {
    setState(() {
      moveY+= e.delta.dy; // 当前位置 = 旧的位置 + 变换的位置
      moveX+= e.delta.dx; // 当前位置 = 旧的位置 + 变换的位置
    });
  }
  // 手势结束后触发的事件
  endMove(DragEndDetails e) {
    setState(() {
      moveY = 0; // 回归原位
      moveX = 0; // 回归原位
      print('onPanEnd');
    });
  }
}

```
我们上面这个案例实现了一个可以拖动的小球，在拖动完毕后会自动回归原位。要注意的就是，从你手指按下，然后到做完手势，最后松开手指的整个过程，`GestureDetector`当中的几个事件是按照下面的顺序依次执行的：<font color=#9400D3>onPanDown</font> -> <font color=#9400D3>onPanStart</font> -> <font color=#9400D3>onPanUpdate</font> -> <font color=#9400D3>onPanEnd</font>。其中`onPanUpdate`事件的执行次数和手势的时间有关，会连续触发多次，其他事件都只在一次完整的手势中执行一次。

## 拍照App
拍照的功能需要借助插件`image_picker`来帮助实现，可以到官网[https://pub.dev/packages/image_picker#-readme-tab-](https://pub.dev/packages/image_picker#-readme-tab-)去查看它的下载和说明。

这里要注意的就是在使用插件的时候，由于是跨平台，在`Android`和`IOS`上同一个插件会有不同的配置，如何配置会有详细的说明，<font color=#1E90FF>而且一般比较好的插件会在github上中有配置案例，可以直接上github去找具体文件当中的配置</font>
```dart
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class PhotoApp extends StatefulWidget {
  @override
  _PhotoAppState createState() => _PhotoAppState();
}

class _PhotoAppState extends State<PhotoApp> {
  List<File> _images = []; // 设置默认的图片列表

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('take photos'),
        leading: GestureDetector(
          onTap: (){
            Navigator.pop(context);
          },
          child: Icon(Icons.arrow_back,color: Colors.white,),
        ),
      ),
      body: Center(
        child: Wrap(
          spacing: 5,
          runSpacing: 5,
          children: _genImages(),
        )
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _pickImage,
        tooltip: '选择图片',
        child: Icon(Icons.add_a_photo),
      ),
    );
  }
  _pickImage() {
    // 底部向上弹出一个对话框
    showModalBottomSheet(context: context, builder: (context)=>Container(
      height: 160,
      child: Column(
        children: <Widget>[
          _item('拍照',true),
          _item('从相册选择',false),
        ],
      ),
    ));
  }

  _item(String title, bool isTakePhoto) {
    return GestureDetector(
      child: ListTile(
        leading: Icon(isTakePhoto?Icons.camera_alt:Icons.photo_library),
        title:Text(title),
        onTap: () => getImage(isTakePhoto),
      )
    );
  }

  // 拍照和相册的操作
  Future getImage(bool isTakePhoto) async {
    Navigator.pop(context); // 关闭底部弹出的弹框
    // 拍照=》ImagePicker.pickImage(source:ImageSource.camera)
    // 相册=》ImagePicker.pickImage(source:ImageSource.gallery)
    final image = await ImagePicker.pickImage(source: isTakePhoto?ImageSource.camera:ImageSource.gallery);

    setState(() {
      _images.add(image);
    });
  }

  // 返回选择的图片列表
  _genImages() {
    return _images.map((file){
      return Stack(
        // 层叠布局，下面是图片，右上角是×号按钮
        children: <Widget>[
          ClipRRect(
            // 圆角效果
            borderRadius: BorderRadius.circular(5),
            child: Image.file(file,width: 120,height: 90,fit: BoxFit.fill,),
          ),
          Positioned(
            right: 5,
            top: 5,
            child: GestureDetector(
              onTap: (){
                setState(() {
                  _images.remove(file);// 点击后，从列表中删除自己
                });
              },
              child: ClipOval(
                // 圆角删除按钮
                child: Container(
                  padding: EdgeInsets.all(3),
                  decoration: BoxDecoration(color: Colors.black54),
                  child: Icon(Icons.close,size:18,color:Colors.white),
                ),
              )
            ),
          )
        ],
      );
    }).toList();
  }
}
```
