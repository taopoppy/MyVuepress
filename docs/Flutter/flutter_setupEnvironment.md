# Flutter环境的搭建
环境的搭建去看官网是最合适不过的，但是环境搭建过程中必然会遇到这样那样的问题，这篇文章就是帮你解决这些问题的，下面环境搭建的步骤我们每个步骤就会将官网说明列出，然后说实际过程中的一些问题

## 系统要求

### 1. 官网说明
要安装并运行`Flutter`，您的开发环境必须满足以下最低要求:

+ 操作系统: `Windows 7 `或更高版本 (64-bit)
+ 磁盘空间: 400 MB (不包括`Android Studio`的磁盘空间).
+ 工具: `Flutter` 依赖下面这些命令行工具.
+ `Git for Windows` (Git命令行工具)

如果已安装`Git for Windows`，请确保命令提示符或`PowerShell`中运行 `git` 命令，不然在后面运行`flutter doctor`时将出现`Unable to find git in your PATH`错误, 此时需要手动添加`C:\Program Files\Git\bin`至`Path`系统环境变量中。

### 2. 实际问题
本主搭建环境的时候使用的`window10`,因为`window10`内置了`Windows PowerShell 5.0`,所以如果是`window7`的话`PowerShell`和`Git`一个都不能少

## 获取Flutter SDK

### 1. 官网说明
去`flutter`官网下载其最新可用的安装包，[点击下载](https://flutter.dev/docs/development/tools/sdk/releases#windows) ；

注意，`Flutter`的渠道版本会不停变动，请以`Flutter`官网为准。另外，在中国大陆地区，要想正常获取安装包列表或下载安装包，可能需要翻墙，读者也可以去`Flutter github`项目下去下载安装包 。

将安装包`zip`解压到你想安装`Flutter SDK`的路径（如：`C:\src\flutter`；注意，不要将`flutter`安装到需要一些高权限的路径如`C:\Program Files\`）。

在`Flutter`安装目录的`flutter`文件下找到`flutter_console.bat`，双击运行并启动`flutter`命令行，接下来，你就可以在`Flutter`命令行运行`flutter`命令了。

注意： 由于一些`flutter`命令需要联网获取数据，如果您是在国内访问，由于众所周知的原因，直接访问很可能不会成功。 上面的`PUB_HOSTED_URL`和`FLUTTER_STORAGE_BASE_URL是google`为国内开发者搭建的临时镜像。详情请参考 `Using Flutter in China`

上述命令为当前终端窗口临时设置`PATH`变量。要将`Flutter`永久添加到路径中，请参阅更新路径。

要更新现有版本的`Flutter`，请参阅升级`Flutter`。

更新环境变量
要在终端运行`flutter`命令， 你需要添加以下环境变量到系统`PATH`：

+ 转到 “控制面板>用户帐户>用户帐户>更改我的环境变量”
+ 在“用户变量”下检查是否有名为`“Path”`的条目:
+ 如果该条目存在, 追加 `flutter\bin`的全路径，使用 ; 作为分隔符.
+ 如果条目不存在, 创建一个新用户变量 `Path` ，然后将 `flutter\bin`的全路径作为它的值.
+ 在“用户变量”下检查是否有名为`”PUB_HOSTED_URL”`和`”FLUTTER_STORAGE_BASE_URL”`的条目，如果没有，也添加它们。
+ 重启Windows以应用此更改

### 2. 实际问题
官网可能说的优点详细，也有点臃肿，总之一句话，下载`flutter-sdk`的压缩包，将解压文件中的`bin`文件路径添加到`Path`中。

这里没有什么大问题，如果你翻不了墙就从官网给的镜像地址下载即可，但是注意`zip`包要从给的地址中的`stable channel`下载稳定版，不要从`Beta channel`下载最新版

另外`PUB_HOSTED_URL`和`FLUTTER_STORAGE_BASE_URL是google`可以配也可以不配，本主搭建环境的时候压根没有管，但是后面创建项目的时候卡的一批，所以推荐配置一下，不同的系统配置参考[配置 Flutter 中国镜像](https://www.jianshu.com/p/897a78aec874)。

不过参考当中写的是在用户环境添加新的变量，而作者我在系统变量和用户变量中都添加了才有效果。而且使用下面这个地址：
```javascript
FLUTTER_STORAGE_BASE_URL: https://mirrors.sjtug.sjtu.edu.cn
PUB_HOSTED_URL: https://dart-pub.mirrors.sjtug.sjtu.edu.cn
```
使用上面这网址在下载`flutter`插件和包的保湿会报502的错误，所以最好去官网查一下：
```javascript
FLUTTER_STORAGE_BASE_URL: https://storage.flutter-io.cn
PUB_HOSTED_URL: https://pub.flutter-io.cn
```


最后一定注意要在用户变量下的`path`条目下添加`flutter\bin`的全路径，这个很容易被忽略。


## 安装Android Studio

### 1. 官网说明
要为`Android`开发`Flutter`应用，您可以使用`Mac`，`Windows`或`Linux（64位）`机器.

`Flutter`需要安装和配置`Android Studio`:

下载并安装 (Android Studio)[https://developer.android.com/studio/index.html](https://developer.android.com/studio/index.html).

启动`Android Studio`，然后执行`“Android Studio安装向导”`。这将安装最新的`Android SDK`，`Android SDK`平台工具和`Android SDK`构建工具，这是`Flutter`为`Android`开发时所必需的

### 2. 实际问题
下载`Android Studio`依旧需要翻墙，因为给的地址的服务器在国外，当然你可以查看一下`google`给中国开发者留的[镜像](https://developer.android.google.cn/studio)，从这上面下载也可以, 另外关于`Android Studio`的说明文档也可以从[说明文档](https://developer.android.google.cn/studio/intro)上查看

现在是2019年7月10，本主下载的版本时3.4，`Android Studio`3.4和3.2内置了`java`环境,我们自己是不用配置额外`java`环境。你可能在别的博客上看到要自己从`Oricle`官网上下`jdk`，然后配置`java`环境，下载了新版本的`android studio`，这些步骤直接省略了

下载`Android Studio`的过程中会提示你下载`Android SDK`, `Android SDK Platform-Tools`,` Android SDK Build-Tools`,你都要打上对勾，然后下载

但是官网好像没有配置环境的问题，这里我要详细说一下：

+ 下载完毕后，我们到要新加一个环境变量`ANDROID_HOME`,路径就是你下载`Android SDK`时填的路径，默认的`Android SDK`环境在`C:\Users\Administrator\AppData\Local\Android\Sdk`
+ 然后再`Path`中新建3个环境，分别是`%ANDROID_HOME%\emulator`,`%ANDROID_HOME%\platform-tools`,`%ANDROID_HOME%\tools`
+ 然后重启电脑

然后我们在`cmd`上输入`adb`检查android的环境变量是否设置正确，然后在输入`flutter`来检测`flutter`的环境变量是否生效,但是有的时候输入`adb`的时候会提示`adb不是系统内部或者外部的命令`，通常网上给的答案是`adb.exe`以前是在`sdk`文件的`tools`目录下,现在版本的是在`platform-tools`目录下，所以要将`platform-tools`也添加在`Path`中，这个方法显然不可取，因为我们上面的步骤就已经添加了，我的方法是：

+ 进入你的`android-sdk`目录，在进入`platform-tools`目录,找到`adb.exe`,`AdbWinApi.dll`,`AdbWinUsbApi.dll`三个文件，复制
+ 进入`C：\用户\ Administrator`目录下，将上面的三个文件粘贴到这里

然后我们再去执行`adb`,就正常了
(PS:上述问题还可能存在的原因是在下载android-sdk的时候，我修改了默认目录，默认目录是在C盘，如果你没有修改默认目录我猜不会出现这个问题)

## 安装插件

### 1. 官网说明

需要安装两个插件:
+ `Flutter`插件： 支持`Flutter`开发工作流 (运行、调试、热重载等).
+ `Dart`插件： 提供代码分析 (输入代码时进行验证、代码补全等).
要安装这些:

+ 启动`Android Studio`.
+ 打开插件首选项 `(Preferences>Plugins on macOS, File>Settings>Plugins on Windows & Linux)`.
+ 选择` Browse repositories…`, 选择 `Flutter `插件并点击 `install`.
+ 重启`Android Studio`后插件生效.

### 2. 实际问题

关于插件的下载真的坑，因为按照官网的说法压根下载不了总会提示你下载失败，不知道是网的问题还是要翻墙。但是好的是如果你下载失败它会提示`dart form www.xxxxx.com rquire failed`，你就去给的这个网址上直接下载压缩包，不用解压。

然后在`android stuido`插件下载面板的右上角的工具通标中有个`download from disk`的选项，这个就是从本地选择插件文件，我们点击它，分别选择下载好的`dart`和`flutter`插件压缩包，即可

## 安装模拟器

### 1. 官网说明
要准备在Android模拟器上运行并测试您的Flutter应用，请按照以下步骤操作：

+ 在您的机器上启用 `VM acceleration` .
+ 启动 `Android Studio>Tools>Android>AVD Manager` 并选择 `Create Virtual Device`.
+ 选择一个设备并选择 `Next`。
+ 为要模拟的`Android`版本选择一个或多个系统映像，然后选择 `Next`. 建议使用 `x86` 或 `x86_64 image` .
+ 在 `Emulated Performance`下, 选择 `Hardware - GLES 2.0` 以启用 硬件加速.
+ 验证`AVD`配置是否正确，然后选择 `Finish`。
有关上述步骤的详细信息，请参阅 `Managing AVDs`.

+ 在 `Android Virtual Device Manager`中, 点击工具栏的 `Run`。模拟器启动并显示所选操作系统版本或设备的启动画面.
+ 运行 `flutter run` 启动您的设备. 连接的设备名是 `Android SDK built for <platform>`,其中 `platform` 是芯片系列, 如 `x86`.

### 2. 实际问题
如果你是严格按照官网的流程的话，应该是没有问题，但是本主是直接去创建了新的模拟器，然后启动的时候发现启动不了，提示我忘记了，但是有两个关键字，一个是`Haxm`,还有一个是`vt-x`,解决的步骤有两个

+ 在`android studio`的`SDK tools`查看`Haxm`是否下载，没有下载就下载
+ 重启计算机，一开始的时候就点击`F2`进入`BIOS`界面，进入`Configuration`，将`Inter Virtual Technology`修改为`[Enabled]`,然后点`F10`退出(退出这一步你要看自己的计算机最下面的提示，我的是`F10`,`save and exit`)

这样我们的模拟器就能启动了，注意的是第一次启动的时候很慢，需要几分钟

还有一个问题就是下载模拟器默认的安装地址是`C:\Users\Administrator.android\avd`，模拟器一下就是8，9个G，下载到C盘真的不是一个很好的选择，C盘是系统盘，如果下载到C盘运行起来你自己体会有多卡吧，所以我们要修改默认的avd的安装地址，步骤非常简单，我们参考下面这个博客中的方法即可：
+ [Android Studio修改AVD默认存储位置](https://blog.csdn.net/qq_40783957/article/details/84957339?utm_medium=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase)

## 调试和检测
+ 在你的设备上启用<font color=#DD1144>开发人员选项</font>和<font color=#DD1144>USB调试</font>
+ 使用USB将手机插入电脑，如果有授权提示需要同意授权
+ 在终端中，运行<font color=#DD1144>flutter devices</font> 命令以验证`Flutter`是否是被你连接的`Android`设备
+ 通过<font color=#DD1144>flutter run</font>运行启动项目

我们通过在命令行中输入`flutter doctor`，会检测4条内容，`协议`，`android-sdk`，`两个插件`，`模拟器的链接`
后面三个我们在前面的步骤中都解决了，第一个是检测协议的，它会提示你run一个命令，然后你就根据提示去`run`它提示的命令。这个命令是帮助你同意协议的，需要同意大概4-5条。总之你就根据提示同意即可

当检测全部通过后，我们就可以正式来创建flutter的项目了

## 创建项目
### 1. android studio
<font color=#1E90FF>File</font> -> <font color=#1E90FF>New</font> -> <font color=#1E90FF>new Flutter Project</font>

在弹出的面板中选择<font color=#1E90FF>Flutter Application</font> -> <font color=#1E90FF>Next</font> -> <font color=#1E90FF>填写Project name和Project location</font> -> <font color=#1E90FF>Next</font> -> <font color=#1E90FF>Finish</font>

然后在`android studio`当中就可以直接点击上面的绿色的启动按钮来启动项目，当然前提是必须已经有一个启动起来的安卓模拟器或者连接到电脑上的可用安卓设备


### 2. Flutter脚手架
因为配置了`flutter`的环境变量，所以可以到某个目录下，执行下面的命令：
```bash
> flutter create my_app
> cd my_app
> flutter run
```
执行`flutter run`这个命令必须保证在当前已经有一个启动起来的安卓模拟器或者连接到电脑上的可用安卓设备

### 3. VSCode
<font color=#1E90FF>**① 安装flutter插件**</font>

+ 启动`VS Code`。
+ 调用`View` > `Command Palette…`。
+ 输入`install`, 然后选择`Extensions: Install Extension action`。
+ 在搜索框输入`flutter` ，在搜索结果列表中选择 `Flutter`, 然后点击`Install`。
+ 选择 `OK` 重新启动 `VS Code`。

<font color=#1E90FF>**② 验证配置**</font>

+ 调用`View` > `Command Palette…`
+ 输入 `doctor`, 然后选择 `Flutter: Run Flutter Doctor` action。
+ 查看`OUTPUT`窗口中的输出是否有问题

<font color=#1E90FF>**③ 创建Flutter应用**</font>

+ 启动 `VS Code`
+ 调用 `View` > `Command Palette…`
+ 输入 `flutter`, 然后选择 `Flutter: New Project` action
+ 输入 `Project` 名称 (如`myapp`), 然后按回车键
+ 指定放置项目的位置，然后按蓝色的确定按钮
+ 等待项目创建继续，并显示`main.dart`文件

## 运行项目
我在运行项目的时候会遇到两个问题分别是<font color=#DD1144>启动时卡在gradle task assembleDebug</font>和 <font color=#DD1144>FAILURE: Build failed with an exception.（无法连接到https://storage.googleapis.com/download.flutter.io这个地址）</font>

两个问题都是同一个地方产生的,就是项目启动下载和连接的地址是外网的地址，我们需要替换成为国内镜像，我们给出两个参考地址：
+ [Android Studio 运行flutter卡在: Running Gradle task 'assembleDebug'...](https://juejin.im/post/5ea6dcc3f265da7bcb65e0bb)
+ [Flutter运行app失败 running gradle task assembleDebug](http://element-ui.cn/news/show-353525.aspx)

按照上面两个一起改，就能成功。或者才考我下面的改法（其实就是对上面的总结）：

修改本地`flutter`安装目录中的`flutter.gradle`文件（参考我的文件路径：`D:\flutter\packages\flutter_tools\gradle\flutter.gradle`
```javascript
buildscript {
    repositories {
        // 这里做了修改，使用国内阿里的代理
        // google()
        // jcenter()
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
        maven { url 'http://maven.aliyun.com/nexus/content/groups/public' }
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:3.5.0'
    }
}
android {
    compileOptions {
        sourceCompatibility 1.8
        targetCompatibility 1.8
    }
}

apply plugin: FlutterPlugin

class FlutterPlugin implements Plugin<Project> {
		// 这里做了修改，使用国内flutter的代理
    // private static final String MAVEN_REPO      = "https://storage.googleapis.com/download.flutter.io";
    private static final String MAVEN_REPO      = "https://storage.flutter-io.cn/download.flutter.io";
}
```

同时会修改`flutter`项目中的`android/build.gradle`文件：
```javascript
buildscript {
  ext.kotlin\_version = '1.3.50'
  repositories {
  // 这里做了修改，使用国内阿里的代理
  // google()
 // jcenter()  maven { url 'https://maven.aliyun.com/repository/google' }
  maven { url 'https://maven.aliyun.com/repository/jcenter' }
  maven { url 'http://maven.aliyun.com/nexus/content/groups/public' }
 }
  dependencies {
  classpath 'com.android.tools.build:gradle:3.5.0'
  classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin\_version"
  }
}

allprojects {
  repositories {
  //修改的地方
  //google()
 //jcenter()  maven { url 'https://maven.aliyun.com/repository/google' }
  maven { url 'https://maven.aliyun.com/repository/jcenter' }
  maven { url 'http://maven.aliyun.com/nexus/content/groups/public' }
 }}
```
