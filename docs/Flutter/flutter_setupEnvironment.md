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

另外`PUB_HOSTED_URL`和`FLUTTER_STORAGE_BASE_URL是google`可以配也可以不配，本主压根没有管。

## 安装Android Studio

### 1. 官网说明
要为`Android`开发`Flutter`应用，您可以使用`Mac`，`Windows`或`Linux（64位）`机器.

`Flutter`需要安装和配置`Android Studio`:

下载并安装 (`Android Studio`)[https://developer.android.com/studio/index.html].

启动`Android Studio`，然后执行`“Android Studio安装向导”`。这将安装最新的`Android SDK`，`Android SDK`平台工具和`Android SDK`构建工具，这是`Flutter`为`Android`开发时所必需的

### 2. 实际问题
下载`Android Studio`依旧需要翻墙，因为给的地址的服务器在国外，当然你可以查看一下`google`给中国开发者留的[镜像](https://developer.android.google.cn/studio)，从这上面下载也可以, 另外关于`Android Studio`的说明文档也可以从[说明文档](https://developer.android.google.cn/studio/intro)上查看

现在是2019年7月10，本主下载的版本时3.4，3.4和3.2内置了`java`环境,我们自己是不用配置额外`java`环境。你可能在别的博客上看到要自己从`Oricle`官网上下`jdk`，然后配置`java`环境，下载了新版本的`android studio`，这些步骤直接省略了

下载时候会提示你下载`Android SDK`, `Android SDK Platform-Tools`,` Android SDK Build-Tools`,你都要打上对勾，然后下载

但是官网好像没有配置环境的问题，这里我要详细说一下：

+ 下载完毕后，我们到要新加一个环境变量`ANDROID_HOME`,路径就是你下载`Android SDK`时填的路径
+ 然后再`Path`中新建3个环境，分别是`%ANDROID_HOME\emulator%`,`%ANDROID_HOME\platform-tools``%ANDROID_HOME\tools`
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

关于插件的下载真的坑，因为按照官网的说法压根下载不了，不知道是网的问题还是要翻墙，但是好的是如果你下载失败它会提示插件下载的网址，你就去给的网址直接下载压缩包，然后在android stuido中有个`download from disk`的选项，我们点击，分别选择下载好的`dart`和`flutter`插件压缩包，即可

## 安装模拟器

### 1. 官网说明
要准备在Android模拟器上运行并测试您的Flutter应用，请按照以下步骤操作：

+ 在您的机器上启用 VM acceleration .
+ 启动 Android Studio>Tools>Android>AVD Manager 并选择 Create Virtual Device.
+ 选择一个设备并选择 Next。
+ 为要模拟的Android版本选择一个或多个系统映像，然后选择 Next. 建议使用 x86 或 x86_64 image .
+ 在 Emulated Performance下, 选择 Hardware - GLES 2.0 以启用 硬件加速.
+ 验证AVD配置是否正确，然后选择 Finish。
有关上述步骤的详细信息，请参阅 Managing AVDs.

+ 在 Android Virtual Device Manager中, 点击工具栏的 Run。模拟器启动并显示所选操作系统版本或设备的启动画面.
+ 运行 flutter run 启动您的设备. 连接的设备名是 Android SDK built for <platform>,其中 platform 是芯片系列, 如 x86.

### 2. 实际问题
如果你是严格按照官网的流程的话，应该是没有问题，但是本主是直接去创建了新的模拟器，然后启动的时候发现启动不了，提示我忘记了，但是有两个关键字，一个是`Haxm`,还有一个是`vt-x`,解决的步骤有两个

+ 在`android studio`的`SDK tools`查看`Haxm`是否下载，没有下载就下载
+ 重启计算机，一开始的时候就点击`F2`进入`BIOS`界面，进入`Configuration`，将`Inter Virtual Technology`修改为`[Enabled]`,然后退出

这样我们的模拟器就能启动了，注意的是第一次启动的时候很慢，需要几分钟

## 检测
我们通过在命令行中输入`flutter doctor`，会检测4条内容，`协议`，`android-sdk`，`两个插件`，`模拟器的链接`
后面三个我们都解决了，第一个是检测协议的，它会提示你run一个命令，然后你就根据提示即可

当检测全部通过后，我们就可以正式来创建flutter的项目了