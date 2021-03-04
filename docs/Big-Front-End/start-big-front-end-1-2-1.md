# 开发环境的搭建

关于开发环境的搭建，我们将按照下面这个图示来一个个讲解和介绍：

<img :src="$withBase('/devtools-environment.png')" alt="">

## 开发环境概述
开发的时候，我们要采用的三个环境：
+ <font color=#1E90FF>本地环境</font>：`Node.js`、`IDE`、`Vue-Cli`
+ <font color=#1E90FF>测试环境</font>：虚拟机自建环境、购买云服务（>1C+2G）、安装`Docker`
+ <font color=#1E90FF>数据库服务</font>：`MongoDB`

<font color=#1E90FF>**① 本地环境**</font>

+ `Nodejs`自己到官网上安装，我们下面说一下`nvm`
+ `IDE`：`WebStorm`、`Vscode`、`Atom`
+ `Vue-cli`:
  + 安装命令：`npm install -g @vue/cli`
  + 快速原型开发：`npm install -g @vue/cli-service-global`

<font color=#1E90FF>**② 测试环境**</font>

+ 虚拟机自建环境（`Parallels`/`Vmware`/`Hyperv`）或者购买云服务
+ 安装`Docker`，推荐使用安装脚本[docker-install](https://github.com/docker/docker-install)
+ 安装和执行脚本：然后就可以使用`Docker`命令了
  ```shell
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  ```
+ 然后下载`docker-compose`：
  ```shell
  sudo curl -L "https://github.com/docker/compose/releases/download/1.28.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  ```
+ 添加脚本权限：然后就能再`linux`上面使用`docker-compose`命令了
  ```shell
  sudo chmod +x /usr/local/bin/docker-compose
  ```
  
<font color=#1E90FF>**③ 数据库服务**</font>

+ 打开[dockerhub](https://hub.docker.com)，搜索`mongo`
+ 然后在`linux`上使用下面的命令去下载指定版本的`mongo`,那么保存在`docker`中的镜像就是`mongo:4`
  ```shell
  docker pull mongo:4
  ```
+ 如果遇到网络的问题，在`/etc/docker/daemon.json`当中配置下面的网址：,使用`vi /etc/docker/daemon.json`命令：
  ```shell
  {
    "registry-mirrors":["https://registry.docker-cn.com"]
  }
  ```
  使用`:wq`来保存我们的配置。
+ 重启`docker`：`service docker restart`
+ 运行`docker`中的`mongo`服务：`docker run -d --name some-mongo -p 10050:27017 mongo:4`
+ 可以使用`docker images`去查看里面有哪些镜像
+ 可以使用`docker ps`查看后台正在运行哪些服务
+ 然后可以看到我们`docker`容器内270017端口跑的是`mongo`，但是我们要将宿主机的10050放行出去，这样外部访问的是宿主机的10050，实际上映射的是`docker`中的27017，简单的说，访问宿主机的10050，相当于访问的是宿主机内的`docker`中的27017`mongo`服务。
+ 放行宿主机端口有两种方法
  + 关闭防火墙：
    + `Ubuntu`命令：`service ufw stop`
    + `Centos`命令：`service firewalld stop`
  + 添加放行规则
    + `Ubuntu`命令：`ufw allow Port 10050`
    + `Centos`命令：`firewall-cmd --zone=public --add-port=10050/tcp --permanent` + `firewall-cmd --reload`
  
+ 最后使用`Robo 3T`这个`MongoDB`的图形化工具去连接远程`mongo`服务

## 虚拟化软件
<font color=#1E90FF>**① 添加Hyper-V**</font>

在`windows`的控制面板 > 程序 > 启用或关闭Window功能中选择`Hyper-v`，点击确定即可，这样`Hyper-V`就添加到`windows`程序当中了。如果需要重启就重启。

注意有的电脑无法下载`Hyper-V`监控程序，需要在电脑的`BIOS`当中先开启虚拟化，这个不同的主板有不同的设置，百度即可。

<font color=#1E90FF>**② 新建虚拟网络交换机**</font>

+ 打开搜索，搜索`Hyper-V管理器`，然后点击右边的<font color=#1E90FF>虚拟交换机管理器</font>，接着选择<font color=#1E90FF>创建虚拟交换机</font>
  <img :src="$withBase('/bigfrontend-environment-1.png')" alt="">

+ 接着按照下面选择<font color=#1E90FF>外部网路</font>和<font color=#1E90FF>允许管理器操作系统共享此网络适配器</font>，最后点击确定

  <img :src="$withBase('/bigfrontend-environment-2.png')" alt="">

<font color=#1E90FF>**③ 新建虚拟机**</font>

在`Hyper-V`右侧选择新建 > 虚拟机，然后进入下面的几个步骤：
+ 指定名称和位置：自己看情况修改
+ 指定代数：默认
+ 分配内存：启动内存修改为2048
+ 配置网路：前面新配置的虚拟网络交换机的的网络（我这里先用默认的Default Switch）
+ 连接虚拟硬盘：默认
+ 安装选项：选择`从可启动的CD/DVD-ROM安装操作系统`中的`映像文件`，选择自己下载镜像文件
+ 最后完成后，就在`HyperV`管理器界面的中间看到有我们创建的这个虚拟机，右键进入设置，设置虚拟机处理器的数量为4，内存要设置大一点，我这里设置的是2048M，然后连接

<font color=#1E90FF>**④ 连接虚拟机**</font>

+ 首先先启动虚拟机（`Hyper-V`管理器右侧），然后再连接，选择`install Centos 7`开始安装
+ 进入`语言选择界面`，选择中文->简体中文
+ 进入`安装信息摘要`:
  + 本地化：
    + `时间`选择中国
    + `键盘`默认
    + `语言支持`选择中国
  + 软件
    + `安装源`选择默认
    + `软件选择`进去选择最小虚拟化主机，然后第二栏所有的都勾选
  + 系统
    + `安装位置`点击去选择完成即可
    + `网络和主机名`进入把右上角的关闭改为打开
+ 点击开始安装，在下载的界面有`ROOT密码设置`和`创建用户`，我只设置root密码，我这里设置的是`taopoppy`
+ 安装完成后，有重启按钮，点击开始重启
+ 登录的时候，用户名是`root`，密码就是你自己设置的那个，我的是`taopoppy`

## Linux介绍和常见命令
+ 查看当前路径的目录：`ls`
+ 格式化查看目录，权限，磁盘占用率：`ls -la`
+ 查看当前所有进程的命令：`top`，进程的数量，占据`cpu`，还有占据内存的数据都有显示，点击`m`可以查看当前所有内存和已用内存的占比
+ 目录介绍：
  + <font color=#1E90FF>home</font>：自己的目录，可以存自己的东西，比如下载的东西
  + <font color=#1E90FF>etc</font>：软件的配置文件 
  + <font color=#1E90FF>sys</font>：系统目录
  + <font color=#1E90FF>var</font>：存放的是日志文件
  + <font color=#1E90FF>usr</font>：系统可执行的文件
    + <font color=#1E90FF>sbin</font>：存放着超级管理员的东西

下面讲介绍一下`linux`常见的命令
+ 文档型：（`touch`、`cat`、`echo`、`rm`、`vi`、`cd`）
  + <font color=#1E90FF>mkdir</font>：创建目录
  + <font color=#1E90FF>touch</font>：创建文件
  + <font color=#1E90FF>vi</font>：编辑文件
  + <font color=#1E90FF>i</font>：进入文件开始编辑状态
  + <font color=#1E90FF>esc按键</font>：退出编辑状态
  + <font color=#1E90FF>:wq</font>：保存编辑
  + <font color=#1E90FF>:q!</font>：不进行保存
  + <font color=#1E90FF>cat</font>：查看文件的内容
  + <font color=#1E90FF>echo >></font>：向文件当中添加内容，`echo '123123' >> test.txt`
  + <font color=#1E90FF>echo ></font>：覆盖文件中的内容，`echo 'hello word' > test.txt`
  + <font color=#1E90FF>rm</font>：删除文件，`rm test.txt`
  + <font color=#1E90FF>rm -r</font>: 删除目录，`rm -r testdir/`
  + <font color=#1E90FF>rm -rf</font>：强制删除
+ 硬件型：（查看：硬盘/进程/服务/网络）
  + <font color=#1E90FF>ps -ef | grep </font>，查看进程，`ps -ef | grep docker`
  + <font color=#1E90FF>kill -9</font>: 杀死进程，`kill -9 pid`
  + <font color=#1E90FF>service xxx status</font>：查看服务状态，`xxx`为服务名称
  + <font color=#1E90FF>service xxx stop</font>：关闭服务
  + <font color=#1E90FF>service xxx restart</font>：重启服务
  + <font color=#1E90FF>systemctl status firewalld.service</font>：查看防火墙的状态
+ 功能性：压缩/解压，下载，远程
  + <font color=#1E90FF>wget</font>：下载资源，`wget http://xxxxx.tar.gz`
  + <font color=#1E90FF>tar zxvf</font>：解压资源，`tar zxvf xxxx.tar.gz`
    + <font color=#1E90FF>z</font>：代表解压的文件是以`gz`结尾的
    + <font color=#1E90FF>x</font>：代表解压
    + <font color=#1E90FF>v</font>：代表显示解压的过程
    + <font color=#1E90FF>f</font>：表示使用规格的名字，解压的文件是什么名字，解压出来就是什么名字，比如`xxx.tar.gz`解压出来就是`xxx`
  + <font color=#1E90FF>tar zcvf</font>：压缩资源，`tar zcvf xxx.tar.gz xxx`，将`xxx`压缩到`xxx.tar.gz`文件中
    + <font color=#1E90FF>c</font>：代表压缩的过程

## SSH密钥连接
常用的连接方式就是<font color=#DD1144>ssh 用户名@ip地址</font>：比如`ssh root@47.105.212.161`

一般使用的默认端口22，如果使用的其他端口，可以使用`-p 23`这种，例如`ssh -p 23 root@47.105.212.161`

一般进入之后，命令行比如显示的是这样`[root@admin ~]#`，`root`代表的用户名，`admin`代表主机的名字。主机的名字可以在`/etc/hostname`中配置

+ 首先通过`service sshd status`或者`systemctl status sshd.service`检查服务器的`ssh`的服务状态(`ubuntu`系统的是`ssh`，`Centos`系统的是`sshd`)
+ 然后使用`netstat -anlp | grep sshd`或者`cat /etc/ssh/sshd_config`查看`ssh`服务监听的端口，一般显示的就是`0.0.0.0.0:22`
+ 怎么去修改`ssh`监听的端口呢，在`ubuntu`上直接`vi /etc/ssh/sshd_config`，然后找到`#Port 22`那一行，修改为`Port 10022`，保存即可将`ssh`监听端口修改为10022，然后执行`service ssh restart`重启即可。
+ 但是在`Centos`上面除了上面的操作，由于集成了`selinux`，你还必须要执行`semanage port -a -t ssh_port_t -p tcp 10022`，最后进行`service ssh restart`
+ 但是系统会提示你`semanage`不存在，所以你还要去下载有这个命令的包，我们完整的`Centos`下修改`ssh`监听端口号操作流程如下：
  + 执行`vi /etc/ssh/sshd_config`，修改`#Port 22`为`Port 10022`，记得`:wq`保存
  + 执行`semanage port -a -t ssh_port_t -p tcp 10022`，发现`semanage`命令不存在
  + 执行`yum whatprovides semanage`进行反查，发现在`policycoreutils-python`当中存在
  + 执行`yum install -y policycoreutils-python`
  + 重新执行`semanage port -a -t ssh_port_t -p tcp 10022`
  + 确认是否添加：`semanage port -l | grep ssh`，然后就会显示当前有`10022`和`22`两个端口
  + (可选)删除22端口，`semanage port -d -t ssh_port_t -p tcp 22`
  + 最后执行`service sshd restart`

怎么在`windows`的`powerShell`当中去连接虚拟机中的`Centos`系统？
+ <font color=#DD1144>在虚拟机上的centos系统中执行ifconfig -a 命令查看ip</font>
  <img :src="$withBase('/bigfrontend-environment-4.png')" alt="">
+ <font color=#DD1144>关闭虚拟机的centos系统中的防火墙：service firewalld stop</font>
+ <font color=#DD1144>在本地的命令行中连接：ssh -p 10022  root@172.17.72.171</font>
  <img :src="$withBase('/bigfrontend-environment-5.png')" alt="">

## docker入门
<img :src="$withBase('/bigfrontend-environment-6.png')" alt="">

我们首先来看左边
+ <font color=#1E90FF>基础设施</font>代表了物理机，比如硬件资源，`cpu`资源等等
+ <font color=#1E90FF>操作系统</font>有`windows`、`Mac`系统和`Linux`系统
+ <font color=#1E90FF>Docker</font>：容器化技术，该进程当中可以跑很多应用，各应用之间相互独立，但是公用一个`docker`进程

二右边，虚拟化平台`Hyper-V`或者`VM`都是建立在物理机上的，会占用物理机的一部分资源，然后虚拟机里包含操作系统，操作系统中包含应用。

下面我们来说一下`Docker`的主要特性：
+ <font color=#1E90FF>文件，资源，网络隔离</font>
+ <font color=#DD1144>变更管理（有点类型与git）</font>、<font color=#1E90FF>日志记录</font>
+ <font color=#DD1144>写时复制（所以启动很快，并非切分资源）</font>

## docker安装
+ 苹果电脑就去官网下载`Docker.dmg`，进行双击，输入管理员密码即可，使用`docker version`来查看版本。苹果系统下载的会自动集成`docker-compose`
+ `windows`必须是`windows 10`才能下载使用

下面我们着重来演示`Linux`下的`Docker`安装：
