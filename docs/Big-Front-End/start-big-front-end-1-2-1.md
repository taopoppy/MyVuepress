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
+ 怎么去修改`ssh`监听的端口呢，在`ubuntu`上直接`vi /etc/ssh/sshd_config`，然后找到`#Port 22`那一行，修改为`Port 10022`，保存即可将`ssh`监听端口修改为10022，然后执行`service sshd restart`重启即可。
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

<font color=#1E90FF>**① 删除旧的版本**</font>

(可选)如果你在之前有安装过`docker`，首先要将其删除，删除的命令如下：
```shell
# sudo yum remove docker \
> docker-client \
> docker-client-latest \
> docker-common \
> docker-latest \
> docker-latest-logrotate \
> docker-logrotate \
> docker-engine
```

<font color=#1E90FF>**② 安装必要的依赖**</font>

然后安装一些必须的依赖:
```shell
# sudo yum install -y yum-utils \
> device-mapper-persistent-data \
> lvm2
```

添加`stable`的`Docker-ce`的源：
```shell
# sudo yum-config-manager \
> --add-repo \
> https://download.docker.com/linux/centos/docker-ce.repo
```
因为这个地址是中央仓库，经常下载东西下载不下来，所以我们准备使用阿里的`docker-ce`源，所以，我们到官网[阿里云官方镜像站](https://developer.aliyun.com/mirror/),在镜像当中去选择容器，可以看到`docker-ce`，点击进入，就有`centos`的下载地址为`https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo`，我们按照官网给的提示去执行更行下载源：
```shell
# Step 2: 添加软件源信息
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# Step 3: 更换源文件
sudo sed -i 's+download.docker.com+mirrors.aliyun.com/docker-ce+' /etc/yum.repos.d/docker-ce.repo
```

<font color=#1E90FF>**③ 安装docker-ce**</font>

```shell
# sudo yum install docker-ce docker-ce-cli containerd.io
```

安装好之后，我们再来修改个东西，我们知道`docker`是要去下载镜像的，我们需要修改一下镜像地址为国内的`docker`镜像，也可以使用阿里云的镜像加速地址，这里给出怎么获取阿里云的镜像加速地址的[文章](https://blog.csdn.net/weixin_43569697/article/details/89279225)，我最终获取到的是`https://syayd8aw.mirror.aliyuncs.com`，去修改`/etc/docker/daemon.json`文件如下：
```json
{
  "registry-mirrors": [
    "https://syayd8aw.mirror.aliyuncs.com",
    "https://registry.docker-cn.com"
  ]
}
```
整个过程的命令如下（来自阿里云镜像加速器提供）：
```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://syayd8aw.mirror.aliyuncs.com","https://registry.docker-cn.com"]
}
EOF
sudo systemctl daemon-reload (可选，我是第一次没有启动就改了镜像地址，所以不需要)
sudo systemctl restart docker 
```

接着就启动`docker`：
```shell
systemctl start docker
systemctl status docker
```

我们可以执行这个命令：`docker run hello-world`，`docker`会告诉你，本地没有这个镜像，所以就通过`docker-deamon`连接`Docker hub`去拉去这个镜像，然后运行，可以通过`docker ps -a`查看所有的容器，包括未运行的，就会看到刚刚运行的`hello-word`

删除容器们可以使用`docker rm [NAMES]`或者`docker rm [CONTAINER ID]`，其中`NAMES`和`CONTAINER ID`可以在`docker ps -a`的结果中看到容器对应的属性。前提是不能删除正在运行的容器，必须先`docker stop`。


## docker-compose
<font color=#DD1144>docker-compose是可以帮助我们通过一条命令去管理多个镜像的，也可以使用一条命令去查看多个镜像的状态。它本质上是一个docker集合命令的工具</font>

`docker-compose`是通过`docker-compose up`去启动多个镜像，可以在`docker-compose.yml`当中去配置多个镜像的启动参数，官方给出的示例如下：
```yml
version: "3.9"  # optional since v1.27.0
services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/code
      - logvolume01:/var/log
    links:
      - redis
  redis:
    image: redis
volumes:
  logvolume01: {}
```

<font color=#1E90FF>**① 安装docker-compose**</font>

官网给出了下载命令，根据自己的需求修改版本号即可
```shell
sudo curl -L "https://github.com/docker/compose/releases/download/1.28.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

当然了，既然是官网，估计就下载不下来，我们给[Docker急速下载](https://get.daocloud.io/#install-compose)上看看，我们这里使用的是下面的命令：
```shell
sudo curl -L https://get.daocloud.io/docker/compose/releases/download/1.28.5/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```



<font color=#1E90FF>**② 给予权限**</font>

给`docker-compose`的下载文件权限：
```shell
sudo chmod +x /usr/local/bin/docker-compose
```
然后使用`docker-compose --version`去检查一下版本即可


<font color=#1E90FF>**③ 测试用例**</font>

我们在`cd /home/`之后，`vi docker-compose.yml`,内容如下：
```yml
version '3'
services:
  mysql:
    image:mysql      # 使用mysql镜像
    environment:     # 配置向mysql镜像当中传入的环境变量
    - MYSQL_ROOT_PASSWORD=123456
    ports:           # 将mysql镜像的3306的端口映射到宿主机上28002端口上
    - 28002:3306

    mysql2:
    image:mysql
    environment:
    - MYSQL_ROOT_PASSWORD=123456
    ports: 
    - 28003:3306
```
+ 这样我们使用<font color=#DD1144>docker-compose up -d</font>就可以看到同时启动了两个`mysql`
+ 使用<font color=#DD1144>docker-compose stop</font>可以同时关闭`docker-compose`启动的多个镜像
+ 使用<font color=#DD1144>docker-compose rm</font>可以同时删除`docker-compose`设置的多个镜像

## Docker hub
`Docker hub`为官网的`docker`仓库，地址为[https://hub.docker.com](https://hub.docker.com)，就类似于`npm`一样，可以从上面拉取别人写好的库，也可以上传自己的，

前提是首先得有一个`Docker hub`的账号，然后在虚拟机的命令行通过`docker login`登录到`Docker hub`，然后通过下面的命令进行推送：
```shell
docker commit [CONTAINER ID] taopoppy/mysql:1.0
```
其中`CONTAINER ID`是镜像保存在`docker`中的`id`，可以通过`docker ps`查看，然后`taopoppy/mysql:1.0`实际上我们想推送到`Docker hub`我们自己账号的一个镜像仓库的名称

提交到本地之后，我们可以通过`docker images`查看一下

最后通过下面的命令进行提交：
```shell
docker push taopoppy/mysql:1.0
```
那么别人也可以在其他机器上使用`docker`通过线上地址来拉取你提交的镜像
```shell
docker pull taopoppy/mysql:1.0
```

## nvm
我们可以使用`nvm`去在同一台机器上去管理和切换多个版本的`nodejs`，[github](https://github.com/nvm-sh/nvm)提供了下载方法：

先下载
```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
```
然后添加环境变量：
```shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

但是呢，`https://raw.githubusercontent.com`是翻墙才能访问的，所以我们可以按照下面这个步骤来安装：
+ 使用`gitee`镜像下载：
  ```shell
  git clone https://gitee.com/mirrors/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`
  ```
+ 设置环境变量
  ```shell
  vi ~/.bash_profile
  ```
+ 然后去[github](https://github.com/nvm-sh/nvm#install--update-script)上找到设置环境变量的的内容，如下所示，粘贴到`~/.bash_profile`当中，保存退出。
  ```shell
  export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
  ```
+ 设置环境变量生效：
  ```shell
  source ~/.bash_profile
  ```
+ 查看版本
  ```shell
  nvm --version
  ```

下面我们来学习一下使用`nvm`的一些命令
+ <font color=#1E90FF>nvm list</font>：查看当前本地中所有的`node`版本
+ <font color=#1E90FF>nvm ls-remote</font>：查看远程的所有`node`版本
+ <font color=#1E90FF>nvm install v14.16.0</font>：使用`nvm`下载`nodejs`
+ <font color=#1E90FF>nvm use v13.14.0</font>：切换到新的版本上去
+ <font color=#1E90FF>nvm alias default v14.16.0</font>：设置默认的版本
