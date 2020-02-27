# 监控服务

## node_exporter
### 1. node_exporter安装和使用

我们如果要监控一个服务器的运行状态，我们可以在那个主机上面下载`node_exporter`这个组件，<font color=#1E90FF>这个组件就是收集本机的一些cpu、网络、内存等数据信息</font>， 我们这里使用的二级制安装包是：`node_exporter-0.16.0.linux-amd64.tar.gz`,如果你需要其他的版本，你可以到[https://prometheus.io/download/](https://prometheus.io/download/)这个网址下载：
```go
// 加压文件
# tar xf node_exporter-0.16.0.linux-amd64.tar.gz -C /usr/local/

// 重命名
# mv /usr/local/node_exporter-0.16.0.linux-amd64/ /usr/ local/node_exporter

// 进入node_exporter查看文件
# cd /usr/local/node_exporter
# ls
```
所以我们能看到整个文件夹中有下面这些文件：LICENSE  <font color=#3eaf7c>node_exporter</font>	  NOTICE

其中绿色的文件<font color=#3eaf7c>node_exporter</font>就是一个启动命令，可以直接使用这个命令启动：
```go
// 使用nohup启动命令
# nohup /usr/local/node_exporter/node_exporter &
```
启动的结果我们在下面可以看到：
```go
[root@imooc node_exporter]# nohup /usr/local/node_exporter/node_exporter &
[1] 16113
[root@imooc node_exporter]# nohup: ignoring input and appending output to ‘nohup.out’
```
特别注意：
+ 如果启动异常，你可以到`nohup.out`重查看详情。
+ <font color=#DD1144>如果把启动node_exporter的终端给关闭，那么进程也会随之关闭，nohup就是帮助你解决这个问题，它能让当前命令启动的主程序永久执行</font>。

当然为了确认启动的正确性，我们还是要查询一起端口的启动启动状态：
```go
// 查看端口
# lsof -i:9100

// 或者下面的命令
# ss -naltp | grep 9100
```
我们的检查结果如下：
```go
[root@imooc node_exporter]# ss -naltp | grep 9100
LISTEN     0      128       [::]:9100                  [::]:*                   users:(("node_exporter",pid=16113,fd=3))
```
这样之后，我们就能使用`http://被监控端IP:9100/metrics`来查看到`node_exporter`组件对自己所在的服务器收集到的当前本机的一些运行信息；

<img :src="$withBase('/prometheus_introduce_four.png')" alt="node_exporter访问信息">

### 2. prometheus配置监控
现在在被监控的服务器主机上有了`node_exporter`组件，但是这个时候还和`prometheus`没有任何关系，<font color=#1E90FF>我们需要让普罗米修斯监控可以拉取到node_exporter收集到的其所在主机的信息</font>，首先我们要到`prometheus`文件下打开文件：
```go
# vim /usr/local/prometheus/prometheus.yml
```
然后我们在最后三行添加`node_exporter`组件所在的主机信息，端口等等：
```go
# my global config
global:
  scrape_interval:     15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
  - static_configs:
    - targets:
      # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'prometheus'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
    - targets: ['localhost:9090']
  # 在这里添加新的节点
  - job_name: 'agent'
    static_configs:
    - targets: ['192.168.11.86:9100']
```
当然上面这种配置是`node_exporter`所在服务器和`prometheus`服务所在机器不是同一个机器，如果是同一个机器，可以直接在`job_name`为`prometheus`的配置项`targets`的数组当中添加新的即可，比如：<font color=#1E90FF>- targets: ['localhost:9090','localhost:9100']</font>，修改好`prometheus`的配置文件，我们必须要重新启动整个`prometheus`的服务：
```go
// 强制杀掉进程
# pkill prometheus
// 检查是否真的杀掉
# ss -naltp | grep 9090
// 启动prometheus
# /usr/local/prometheus/prometheus --config.file="/usr/local/prometheus/prometheus.yml" &
// 再次检查端口
# ss -naltp | grep 9090
```
整个操作过程如下：
```go
[root@imooc prometheus]# pkill prometheus
[root@imooc prometheus]# level=warn ts=2020-02-27T02:13:12.023292322Z caller=main.go:406 msg="Received SIGTERM, exiting gracefully..."
level=info ts=2020-02-27T02:13:12.02334747Z caller=main.go:431 msg="Stopping scrape discovery manager..."
level=info ts=2020-02-27T02:13:12.023360128Z caller=main.go:445 msg="Stopping notify discovery manager..."
level=info ts=2020-02-27T02:13:12.023368503Z caller=main.go:467 msg="Stopping scrape manager..."
level=info ts=2020-02-27T02:13:12.02339315Z caller=main.go:427 msg="Scrape discovery manager stopped"
level=info ts=2020-02-27T02:13:12.023408176Z caller=main.go:441 msg="Notify discovery manager stopped"
level=info ts=2020-02-27T02:13:12.023430124Z caller=manager.go:657 component="rule manager" msg="Stopping rule manager..."
level=info ts=2020-02-27T02:13:12.02344093Z caller=manager.go:663 component="rule manager" msg="Rule manager stopped"
level=info ts=2020-02-27T02:13:12.023490909Z caller=main.go:461 msg="Scrape manager stopped"
level=info ts=2020-02-27T02:13:12.052257928Z caller=notifier.go:512 component=notifier msg="Stopping notification manager..."
level=info ts=2020-02-27T02:13:12.052314238Z caller=main.go:616 msg="Notifier manager stopped"
level=info ts=2020-02-27T02:13:12.052558492Z caller=main.go:628 msg="See you next time!"
[root@imooc prometheus]# ss -naltp | grep 9090
[root@imooc prometheus]# /usr/local/prometheus/prometheus --config.file="/usr/local/prometheus/prometheus.yml" &
[2] 16178
[root@imooc prometheus]# level=info ts=2020-02-27T02:08:01.651668652Z caller=main.go:244 msg="Starting Prometheus" version="(version=2.5.0, branch=HEAD, revision=67dc912ac8b24f94a1fc478f352d25179c94ab9b)"
level=info ts=2020-02-27T02:08:01.651825552Z caller=main.go:245 build_context="(go=go1.11.1, user=root@578ab108d0b9, date=20181106-11:40:44)"
level=info ts=2020-02-27T02:08:01.651857609Z caller=main.go:246 host_details="(Linux 3.10.0-1062.el7.x86_64 #1 SMP Wed Aug 7 18:08:02 UTC 2019 x86_64 imooc (none))"
level=info ts=2020-02-27T02:08:01.651886856Z caller=main.go:247 fd_limits="(soft=1024, hard=4096)"
level=info ts=2020-02-27T02:08:01.651905497Z caller=main.go:248 vm_limits="(soft=unlimited, hard=unlimited)"
level=info ts=2020-02-27T02:08:01.653446253Z caller=main.go:562 msg="Starting TSDB ..."
level=info ts=2020-02-27T02:08:01.654307905Z caller=repair.go:35 component=tsdb msg="found healthy block" mint=1582740000000 maxt=1582747200000 ulid=01E21MSD58CA85TTZ91HWDXSM9
level=info ts=2020-02-27T02:08:01.654411038Z caller=repair.go:35 component=tsdb msg="found healthy block" mint=1582747200000 maxt=1582754400000 ulid=01E21VN4D5EY4R1AVSSGQ0DXDE
level=info ts=2020-02-27T02:08:01.654547065Z caller=repair.go:35 component=tsdb msg="found healthy block" mint=1582696800000 maxt=1582740000000 ulid=01E21VN4F02FTRNHE2RMY3QDRX
level=info ts=2020-02-27T02:08:01.654599182Z caller=repair.go:35 component=tsdb msg="found healthy block" mint=1582754400000 maxt=1582761600000 ulid=01E222GVN6AJ2RGEDE0PVRBDK2
level=info ts=2020-02-27T02:08:01.673746419Z caller=web.go:399 component=web msg="Start listening for connections" address=0.0.0.0:9090
level=info ts=2020-02-27T02:08:02.579805123Z caller=main.go:572 msg="TSDB started"
level=info ts=2020-02-27T02:08:02.580031313Z caller=main.go:632 msg="Loading configuration file" filename=/usr/local/prometheus/prometheus.yml
level=info ts=2020-02-27T02:08:02.705625351Z caller=main.go:658 msg="Completed loading of configuration file" filename=/usr/local/prometheus/prometheus.yml
level=info ts=2020-02-27T02:08:02.705664376Z caller=main.go:531 msg="Server is ready to receive web requests."

[root@imooc prometheus]# ss -naltp | grep 9090
LISTEN     0      128       [::]:9090                  [::]:*                   users:(("prometheus",pid=16178,fd=5))
```
此时我们再次去`prometheus`服务的`web`端口查看是否监控到`node_exporter`组价收集的数据：

<img :src="$withBase('/prometheus_introduce_five.png')" alt="prometheus监控到node_exporter的数据">

## mysqld_exporter监控mysql
### 1. mysqld_exporter的安装和使用
<font color=#1E90FF>**① 下载和安装mysqld_exporter**</font>

除了主机的一些信息，我们还想监控一些重点的服务，比如`mysql`，我们就需要在有`mysql`服务的主机上安装一个`mysqld_exporter`的组件收集`mysql`的运行信息。我们这里使用的二进制文件是：`mysqld_exporter-0.11.0.linux-amd64.tar.gz`:
```go
// 加压文件
# tar xf mysqld_exporter-0.11.0.linux-amd64.tar.gz -C /usr/local/

// 重命名
# mv /usr/local/mysqld_exporter-0.11.0.linux-amd64/ /usr/local/mysqld_exporter

// 进入mysqld_exporter查看文件
# cd /usr/local/mysqld_exporter/
# ls
```
所以我们能看到整个文件夹中有下面这些文件：LICENSE <font color=#3eaf7c>mysqld_exporter</font> NOTICE

<font color=#1E90FF>**② 配置mysql权限**</font>

然后我们登陆`mysql`，然后给`mysqld_exporter`给予查询和复制的权限：
```go
// 创建用户：
mysql> create user 'mysql_monitor'@'localhost' identified by '123456';
// 赋予权限：
mysql> grant select,replication client,process on *.* to 'mysql_monitor'@'localhost';
// 权限生效
mysql> flush privileges;
// 退出
mysql> exit;
```
关于数据库的知识我们将两点：
+ <font color=#1E90FF>如果是比较新一点的版本的mysql，创建用户和赋予权限是要分开的，旧一点的数据库可以不分开的</font>，你可以直接使用下面的`sql`:
	```go
	grant select,replication client,process ON *.* to 'mysql_monitor'@'localhost' identified by '123456';
	```
+ <font color=#1E90FF>经常你会看到在赋予权限的后面会有with grant option,这个是在修改权限的时候要加上，我们这里是初次赋予权限，就不用添加这个几个单词</font>。

然后我们要特别注意一个问题：<font color=#DD1144>prometheus服务器找mysqld_exporter，mysqld_exporter再去找mysql服务，所在在赋予权限中的语句中localhost指的是mysqld_exporter的IP</font>

<font color=#1E90FF>**③ 配置mysqld_exporter**</font>

最后我们要在`mysqld_exporter`组件中配置`mysql`信息，我们需要在`/usr/local/mysqld_exporter`文件夹下创建一个`.my.cnf`的文件，写入下面的内容，表示`mysqld_exporter`要通过这个用户和密码去`mysql`中获取信息：
```go
[client]
user=mysql_monitor
password=123456
```
我们可以直接使用下面的命令来创建并且编辑：
```go
# vim /usr/local/mysqld_exporter/.my.cnf
```

<font color=#1E90FF>**④ 启动mysqld_exporter**</font>

配置好了文件之后，我们就可以直接启动`mysqld_exporter`组件了：
```go
// 启动mysqld_exporter
# nohup /usr/local/mysqld_exporter/mysqld_exporter --config.my-cnf=/usr/local/mysqld_exporter/.my.cnf &
// 检查端口
# ss -naltp |grep 9104
```
具体操作如下：
```go
[root@imooc mysqld_exporter]# nohup /usr/local/mysqld_exporter/mysqld_exporter --config.my-cnf=/usr/local/mysqld_exporter/.my.cnf &
[3] 17348
[root@imooc mysqld_exporter]# nohup: ignoring input and appending output to ‘nohup.out’

[root@imooc mysqld_exporter]# ss -naltp | grep 9104
LISTEN     0      128       [::]:9104                  [::]:*                   users:(("mysqld_exporter",pid=17348,fd=3))
```
### 2. prometheus配置监控
和之前一样，我们需要配置一下信息，然后重启`prometheus`服务：
```go
// 编辑prometheus.yml配置文件
# vim /usr/local/prometheus/prometheus.yml
```
修改的`prometheus.yml`文件内容如下：
```go
# my global config
global:
  scrape_interval:     15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
  - static_configs:
    - targets:
      # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'prometheus'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
    - targets: ['localhost:9090','localhost:9100','localhost:9104']
```

修改完配置之后，我们重启服务：
```go
# pkill prometheus
// 检查是否真的杀掉
# ss -naltp | grep 9090
// 启动prometheus
# /usr/local/prometheus/prometheus --config.file="/usr/local/prometheus/prometheus.yml" &
// 再次检查端口
# ss -naltp | grep 9090
```
然后我们重新回到`prometheus`服务的`web`端口看一下是否通过`mysqld_exporter`的9104端口拿到了`mysqld_exporter`收集的关于`mysql`运行的一些信息：

<img :src="$withBase('/prometheus_introduce_six.png')" alt="prometheus服务">

**参考资料**

1. [安装node_exporter组件监控Linux主机](https://www.bilibili.com/video/av77812341?p=8)
2. [安装mysqld_exporter组件监控Mysql服务](https://www.bilibili.com/video/av77812341?p=7)