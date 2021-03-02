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
+ 功能性：压缩/解压，下载，远程