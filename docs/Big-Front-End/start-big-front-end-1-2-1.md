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