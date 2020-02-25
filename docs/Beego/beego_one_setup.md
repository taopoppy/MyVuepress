# Beego入门案例（二-4）

## 独立部署
### 1. 设置环境参数
首先到当前项目的目录下面关注两个环境变量：<font color=#DD1144>GOOS</font>和<font color=#DD1144>GOARCH</font>
+ `GOOS`表示当前打包的项目要执行在什么操作系统中，有三个值，分别是：<font color=#1E90FF>darwin（MAC系统）</font>、<font color=#1E90FF>linux（Linux系统）</font>、<font color=#1E90FF>windows（Windows操作系统）</font>
+ `GOARCH`表示的`cpu`参数，也就是项目运行在什么`cpu`的架构之下，我们现在一般的都是`amd64`，如果这个参数你不确定，可以通过在目标服务器上安装好`Go`环境之后，使用`go env`来查看
```go
set GOOS=linux
set GOARCH=amd64
```

### 2. 打包项目
我们其实可以使用`go build`来打包项目，这样在项目中直接会包含一个可执行文件，但是在`Beego`中有它自己的一个打包方式：
```go
bee pack
```
使用上面的命令后，我们的项目总目录是`xcms`,会给我们生成一个`xcms.tar.gz`在项目文件中，这个文件的背后实际上做了很多额外的事情：
+ 首先也会像`go build`一样创建一个可执行文件
+ 然后将项目当中的静态文件和配置文件全部打包到一起

### 3. 执行项目
我们刚才打包出了一个`xcms.tar.gz`的压缩包，现在我们将其解压:
```go
tar -xzvf xcms.tar.gz
```
然后我们会得到一些文件：
+ <font color=#1E90FF>README.md</font>：说明文件
+ <font color=#1E90FF>static</font>：静态资源目录
+ <font color=#1E90FF>xcms</font>：可执行文件
+ <font color=#1E90FF>views</font>：视图文件的目录
+ <font color=#1E90FF>conf</font>：配置文件的目录

这里要说明的就是：<font color=#DD1144>解压后的xcms这个可执行文件它的执行已经不依赖我们开发时候的那些在GOPATH/src中的文件和代码了，它只依赖于我们解压的这些文件</font>，所以比如我们在`windows`下面开发这些项目，打包好后直接上传到`linux`服务器的某个目录下，然后解压后在解压后的文件夹下执行下面的命令：
```go
nohup ./xcms &
```

然后在项目文件中会生成一个`nohup.out`,把之前在命令行输出的内容都放在了这个里面，我们可以使用下面的命令来查看：
```go
tail nohup.out
```
此时我们的项目就已经启动起来了。

## Nginx+双机服务
### 1. Nginx的好处
<img :src="$withBase('/beego_one_nginxgo.png')" alt="双机服务">

使用`Nginx`和双机部署有两个好处：
+ <font color=#1E90FF>用户请求量大的时候，瓶颈又在服务端，`Nginx`可以分发请求，从而起到一个分流的作用</font>
+ <font color=#1E90FF>另外Nginx是负责负载均衡的，在多台机器可用的时候控制负载均衡，同时当发现其中有机器故障的时候还会自动将这个机器踢出去，起到保护的作用</font>

### 2. 单台服务Nginx配置
说道代理呢，实际上我们知道有两种代理：<font color=#1E90FF>普通代理</font> 和 <font color=#1E90FF>反向代理</font>
+ <font color=#3eaf7c>普通代理</font>：它的中间代理是在用户客户端这里配置的，也就是客户知道无论是自己发还是代理发，目标服务都是那个我们知道的源服务。这个一般在翻墙中运用广泛。
+ <font color=#3eaf7c>反向代理</font>：反向代理的中间代理是在服务端这里配置的，那就是说用户是不知道自己请求的到底是真正的源服务还是中间代理

在安装好`nginx`以后使用`nginx -t`命令来查询配置文件的地址，然后打开配置文件所在的目录，你会发现有很多文件，有<font color=#1E90FF>nginx.conf</font>，还有<font color=#1E90FF>servers</font>这个文件夹，`servers`文件夹下面所有以`.conf`结尾的文件中配置都会被包含在`nginx.conf`的主配置文件中，以为在`nginx.conf`中的最后一行有这样的代码：
```go
include servers/*;
```

所以我们直接在`servers`文件目录下面使用下面的命令：
```go
vi xcms.conf
```
新创建一个`xcms.conf`的配置文件来开启一个新的代理服务，文件内容如下：
```go
server {
  listen 8090; // 端口
  server_name localhost;  // 域名
  location / {
    try_files / _not_existes_ @backend;
  }
  location @backend{
    proxy_pass http://127.0.0.1:8091;
  }
}
```
然后使用`nginx -t`检查一下是否语法正确，然后使用`nginx`命令启动反向代理，然后我们将项目启动到8091端口（修改`conf/app.conf`文件），因为我们在`nginx`中配置的是8090代理8091，也就是你实际访问的是`nginx`的8090，它帮你访问跑在8091的`go`服务。

### 3. 多台服务Nginx配置
我们在上面的那个单台服务的`Nginx`配置稍微做一下改动即可，修改`xcms.conf`文件如下：
```go
upstream mysrv {
  ip_hash;
  server 127.0.0.1:8091;  
  server 127.0.0.1:8092; // 实际的配置是这些都是不同的ip地址
}

server {
  listen 8090;
  server_name localhost;
  location / {
    try_files / _not_existes_ @backend;
  }
  location @backend{
    proxy_pass http://mysrv;
  }
}
```
然后我们重启一下`nginx`:`nginx -s reload`,我们特别要在`upstream mysrv`中的`ip_hash`的配置。以为负载均衡的原则是将当前请求分发到最少请求数量的服务器，比如我们登陆，我们会先访问到8091来显示我们的登陆页面，输入用户名和密码登陆的请求会因为`nginx`的负载均衡分发到8092，所以我们当前的用户的只保存在了8092的`session`，而下一个重定向的请求又发回了8091，而8091的`session`中没有保存当前用户，所以就会产生登陆不上去的现象。

配置了`ip_hash`后，给每个用户的请求都标识一个哈希，这样同一个用户的所有请求都会分发到同一台机器，这样就解决了这个问题。