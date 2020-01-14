# 环境的搭建

## 准备虚拟服务器
### 1. 下载VirtualBox
首先我们要去下载`VirtualBox`和`CentOS`的`iso`镜像文件，下载地址在这里：
+ [https://www.virtualbox.org/wiki/Downloads(最新版)](https://www.virtualbox.org/wiki/Downloads)
+ [https://download.virtualbox.org/virtualbox/5.2.22/VirtualBox-5.2.22-126460-Win.exe(5.2.22版)](https://download.virtualbox.org/virtualbox/5.2.22/VirtualBox-5.2.22-126460-Win.exe)
+ [http://isoredirect.centos.org/centos/7/isos/x86_64/centos-7-x86_64-dvd-1810.iso(已不可用)](http://isoredirect.centos.org/centos/7/isos/x86_64/centos-7-x86_64-dvd-1810.iso)
+ [http://mirrors.aliyun.com/centos/7/isos/x86_64/(可用)](http://mirrors.aliyun.com/centos/7/isos/x86_64/)
+ [http://isoredirect.centos.org/centos/8/isos/x86_64/CentOS-8-x86_64-1905-dvd1.iso(最新版CentOS8)](http://isoredirect.centos.org/centos/8/isos/x86_64/CentOS-8-x86_64-1905-dvd1.iso)

然后点击`Windows hosts`就会下载`VirtualBox-6.1.0-135406-Win.exe`的文件，下载好之后双击安装，安装好打开就是这样的界面：

<img :src="$withBase('/mysql_virtualbox_download.png')" alt="">

但是我们选择的是`5.2.22`版本，然后有个问题，就是无论是新版的或者是旧版本的`virtualbox`在选择`linux`的版本都没有`64bit`的问题，所以我们需要打开电脑的`BIOS`中去修改`cpu`的虚拟功能，可以参考这篇文章[64位的电脑装VirtualBox新建虚拟电脑都是32位的系统](https://blog.csdn.net/cherrycheng_/article/details/45719719)

### 2. 创建虚拟服务器
下载好了并且打开了上述界面就点击新建，新建一个虚拟服务器：

<img :src="$withBase('/mysql_virtualbox_condition.png')" alt="创建虚拟服务配置">

然后为了能让它安装系统，我们还要对这个虚拟服务器进行一些设置；
+ <font color=#3eaf7c>网络</font>：选择<font color=#1E90FF>桥接网卡</font>，这样才能使用内网IP来使用我们的虚拟机
+ <font color=#3eaf7c>存储</font>：在控制器下面选择之前我们下载好的`CentOS`的镜像文件

点击`OK`我们就完成了虚拟机安装的准备工作，然后点击启动，就能进行虚拟系统的安装了

## 安装CentOS系统
### 1. 下载CentOS系统
选择我们已经创建的虚拟服务器，然后点击<font color=#3eaf7c>启动按钮</font>：
+ 选择<font color=#1E90FF>Test this media & install CentOS Linux？</font>,开始检测镜像文件的完整性和下载系统（这里在虚拟机中的鼠标是拉不出来的，需要使用键盘右侧的Ctrl进行切换鼠标）
+ 选择英语语言，然后在下一个页面自检完成后（`SYSTEM`栏中的第一个选项变红后点击，然后直接点击左上角的`Done`按钮），然后点击<font color=#1E90FF>Begin install</font>开始下载
+ 在下载的时候可以设置密码，在最上面左侧是设置密码，右侧是添加用户。等待安装后选择<font color=#1E90FF>Reboot</font>进行重启，大概一分钟后选择第一选项进入系统：<font color=#1E90FF>CentOS Linux(Core)</font>，然后填写用户为`root`密码填写你刚才设置的密码。

### 2. 配置CentOS系统
然后下面我们进行配置`CentOS`系统，配置的原因是想让其他的服务器也能连接到这个虚拟机中来，首先我们要来配置这虚拟机的网络：
```bash
cd /etc/sysconfig/
cd network-scripts/
```
在这个目录下面有一些配置文件，我们需要根据我们计算机本身的网卡来进行配置，我们首先要配置<font color=#1E90FF>ifcfg-enp0s3</font>这个文件，这就是网卡配置文件：
```bash
ip addr  // 看一下网卡信息
vi ifcfg-enp0s3 // 编辑网卡配置文件
```
修改网卡文件如下:

<img :src="$withBase('/mysql_virtualbox_geteway.png')" alt="CentOS网卡设置">

+ 首先`BOOTPROTO`修改`dhcp`为`static`，我们使用静态的`ip`
+ 然后`IPV6INIT`修改为`no`，因为用不到
+ 接着`ONBOOT`修改为`yes`，开机的时候启动网卡设置
+ 最后`NETMASK`子网掩码和`GATEWAY`网关要和本机中的设置要一致
	+ `IPADDR`是虚拟机的`ip`，我们要修改成为和本机的`ip`在一个时段内，比如我们的本机是`11.75`,我这里在虚拟机就能设置为`11.xx`（我设置的`11.86`,如上图）
	+ `DNS1`设置为`8.8.8.8`，这个是谷歌的一个`DNS`，如果你用本机的那个首选`DNS`服务器可能会有`ping baidu.com`无法连接的状态。

然后我们使用<font color=#DD1144>service network restart</font>重新启动网络设置，然后测试一下：
+ 使用`ip addr`来检测虚拟机上的`ip`是否修改成为`192.168.11.86`
+ 然后在虚拟机上我们使用`ping 192.168.11.75`来连接本机，在本机使用`ping 192.168.11.86`来连接虚拟机。
+ 最后在虚拟机上使用`ping baidu.com`来连接百度

如果上面的连接不成功，要么是设置有问题，要么是防火墙没有关，我们可以使用下面的命令来关闭防火墙，然后再重新`ping`一遍上面的测试：
```bash
systemctl stop firewalld.service #停止firewall
systemctl disable firewalld.service #禁止firewall开机启动
```

另外我们去修改主机名，修改`/etc/hostname`文件中的内容为自己想要的主机名（我修改为了imooc）
```bash
vi /etc/hostname
```
最后我们直接重启：
```bash
reboot
```
<font color=#1E90FF>重启后我们可以在virtualbox上面来操作我们的虚拟机，也可以通过ssh连接工具（比如说XShell）来连接到虚拟机进行操作了</font>。   
<font color=#DD1144>提示</font>：关于桥接网卡的概念和操作，可以参照[https://www.cnblogs.com/gne-hwz/p/8320361.html](https://www.cnblogs.com/gne-hwz/p/8320361.html)

## 部署Mysql数据库