# Prometheus(普罗米修斯监控系统)

为项目添加一个全面的`Prometheus`系统，为项目的监控，报警做系统化的处理

## 普罗米修斯监控概述
`Prometheus`(由Go语言开发)是一套开源的监控&报警&时间序列数据库的组合，适合监控`docker`容器，因为`kubernetes`(俗称`k8s`)的流行带动了`Prometheus`的发展。

### 1. 时间序列数据
<font color=#DD1144>时间序列数据（TimeSeries Data）</font>：按照时间顺序记录系统，设备状态变化的数据被称为时序数据，应用场景广泛。基于时间序列的数据有下面两个特点：
+ <font color=#1E90FF>性能好</font>：关系型数据库对于大规模数据的处理性能糟糕，`NoSQL`可以比价好的处理大规模数据，但依然比不上时间序列数据库
+ <font color=#1E90FF>存储成本低</font>；高校的压缩算法，节省存储空间，有效降低IO,每个采样数据仅仅占用3.5byte左右的空间，上百万条时间序列，30秒间隔保留60天，大概花费200多G。

### 2. 原理架构图
<img :src="$withBase('/prometheus_introduce_one.png')" alt="原理结构图">

它的服务过程是这样的Prometheus daemon负责定时去目标上抓取metrics(指标) 数据，每个抓取目标需要暴露一个http服务的接口给它定时抓取。
+ <font color=#DD1144>Prometheus</font>：支持通过配置文件、文本文件、`zookeeper`、`Consul`、`DNS`、`SRV`、`lookup`等方式指定抓取目标。支持很多方式的图表可视化，例如十分精美的`Grafana`，自带的`Promdash`，以及自身提供的模版引擎等等，还提供`HTTP API`的查询方式，自定义所需要的输出。
+ <font color=#DD1144>Alertmanager</font>：是独立于`Prometheus`的一个组件，可以支持`Prometheus`的查询语句，提供十分灵活的报警方式。
+ <font color=#DD1144>PushGateway</font>：这个组件是支持`Client`主动推送`metrics`到`PushGateway`，而`Prometheus`只是定时去`Gateway`上抓取数据。

大多数Prometheus组件都是用Go编写的，它们可以轻松地构建和部署为静态二进制文件。访问prometheus.io以获取完整的文档，示例和指南。

### 3. Prometheus的数据模型

`Prometheus`从根本上所有的存储都是按时间序列去实现的，相同的`metrics`(指标名称) 和`label`(一个或多个标签) 组成一条时间序列，不同的`label`表示不同的时间序列。为了支持一些查询，有时还会临时产生一些时间序列存储。

<font color=#1E90FF>**① metrics name&label指标名称和标签**</font>

每条时间序列是由唯一的”指标名称”和一组”标签（key=value）”的形式组成。

+ <font color=#1E90FF>指标名称</font>：一般是给监测对像起一名字，例如`http_requests_total`这样，它有一些命名规则，可以包字母数字_之类的的。通常是以应用名称开头_监测对像_数值类型_单位这样。例如：`push_total`、`userlogin_mysql_duration_seconds`、`app_memory_usage_bytes`。

+ <font color=#1E90FF>标签</font>：就是对一条时间序列不同维度的识别了，例如一个`http`请求用的是`POST`还是`GET`，它的`endpoint`是什么，这时候就要用标签去标记了。最终形成的标识便是这样了：`http_requests_total{method=”POST”,endpoint=”/api/tracks”}`。

记住，针对http_requests_total这个metrics name无论是增加标签还是删除标签都会形成一条新的时间序列。查询语句就可以跟据上面标签的组合来查询聚合结果了。如果以传统数据库的理解来看这条语句，则可以考虑`http_requests_total`是表名，标签是字段，而`timestamp`是主键，还有一个`float64`字段是值了。（`Prometheus`里面所有值都是按`float64`存储）。

### 4.  Prometheus四种数据类型
<font color=#1E90FF>**① Counter**</font>

+ `Counter`用于累计值，例如记录请求次数、任务完成数、错误发生次数。一直增加，不会减少。重启进程后，会被重置。

+ 例如：`http_response_total{method=”GET”,endpoint=”/api/tracks”} 100`，10秒后抓取`http_response_total{method=”GET”,endpoint=”/api/tracks”} 100`。

<font color=#1E90FF>**② Gauge**</font>

+ `Gauge`常规数值，例如 温度变化、内存使用变化。可变大，可变小。重启进程后，会被重置。

+ 例如： `memory_usage_bytes{host=”master-01″} 100 < 抓取值`、`memory_usage_bytes{host=”master-01″} 30`、`memory_usage_bytes{host=”master-01″} 50`、`memory_usage_bytes{host=”master-01″} 80 < 抓取值`。

<font color=#1E90FF>**③ Histogram**</font>

+ `Histogram`（直方图）可以理解为柱状图的意思，常用于跟踪事件发生的规模，例如：请求耗时、响应大小。它特别之处是可以对记录的内容进行分组，提供`count`和`sum`全部值的功能。

+ 例如：{小于10=5次，小于20=1次，小于30=2次}，count=7次，sum=7次的求和值。

<font color=#1E90FF>**④ Summary**</font>

+ `Summary`和`Histogram`十分相似，常用于跟踪事件发生的规模，例如：请求耗时、响应大小。同样提供`count`和`sum`全部值的功能。

+ 例如：count=7次，sum=7次的值求值。它提供一个`quantiles`的功能，可以按%比划分跟踪的结果。例如：`quantile`取值0.95，表示取采样值里面的95%数据。

### 5. Prometheus特征和特点

+ <font color=#1E90FF>多维度数据模型</font>
+ <font color=#1E90FF>灵活的查询语言</font>
+ <font color=#1E90FF>不依赖分布式存储，单个服务器节点是自主的</font>
+ <font color=#1E90FF>以`HTTP`方式，通过`pull`模型拉取时间序列数据</font>
+ <font color=#1E90FF>也可以通过中间网关支持`push`模型</font>
+ <font color=#1E90FF>通过服务发现或者静态配置，来发现目标服务对象</font>
+ <font color=#1E90FF>支持多种多样的图表和界面显示</font>

## Prometheus的安装和使用
### 1. 时间同步

由于这个软件是基于时间序列来进行数据的处理，所以<font color=#DD1144>时间同步</font>就显得很重要，如果我们是在不同的机器上进行操作，我们需要在不同的机器上都进行时间的同步,我们将机器的所有时间都和`cn.ntp.org.cn`这个`ip`上的时间保持同步：
```go
// centOS 
# yum install ntpdate -y
# ntpdate cn.ntp.org.cn

// ubuntu
# sudo apt-get install ntp
# ps -aux | grep ntp
# sudo ntpdate cn.ntp.org.cn
```

### 2. 下载和启动
我们到`Promdash`的[官网](https://prometheus.io/download/)上下载对应版本的安装包，我们这里下载的是：`prometheus-2.5.0.linux-amd64.tar.gz`

因为这个是二进制软件，实际上不用安装，直接解压到指定的目录下面，然后启动即可:
```go
// 解压到 /usr/local/ 目录下
# tar xf  prometheus-2.5.0.linux-amd64.tar.gz -C /usr/local/
// 重命名一下文件名称
# mv /usr/local/prometheus-2.5.0.linux-amd64/ /usr/local/prometheus

// 进入prometheus文件查看文件
# cd /usr/local/prometheus
# ls
```
所以我们能看到在整个文件夹中有下满这些文件：<font color=#1E90FF>console_libraries</font> <font color=#1E90FF>consoles</font>  LICENSE  NOTICE  <font color=#3eaf7c>prometheus</font>  prometheus.yml  <font color=#3eaf7c>promtool</font>

其中`prometheus.yml`是配置文件，因为外国人喜欢用`yml`类型的文件作为配置文件，中国人一般使用`conf`,然后<font color=#3eaf7c>prometheus</font>这个绿色的文件就是可执行文件，我们如果直接使用`prometheus.yml`中的默认配置启动，我们就直接在`/usr/local/prometheus`目录下面执行下面的命令：
```go
// 在/usr/local/prometheus 目录下
# cd /usr/local/prometheus
# ./prometheus --config.file="/usr/local/prometheus/prometheus.yml" &

// 或者可以在任意目录下执行下面的命令
# /usr/local/prometheus/prometheus --config.file="/usr/local/prometheus/prometheus.yml" &
```
启动的结果我们可以在下面看到：
```go
[root@imooc prometheus]# ./prometheus --config.file="/usr/local/prometheus/prometheus.yml" &
[1] 15479
[root@imooc prometheus]# level=info ts=2020-02-26T07:41:42.971681777Z caller=main.go:244 msg="Starting Prometheus" version="(version=2.5.0, branch=HEAD, revision=67dc912ac8b24f94a1fc478f352d25179c94ab9b)"
level=info ts=2020-02-26T07:41:42.97175587Z caller=main.go:245 build_context="(go=go1.11.1, user=root@578ab108d0b9, date=20181106-11:40:44)"
level=info ts=2020-02-26T07:41:42.971773977Z caller=main.go:246 host_details="(Linux 3.10.0-1062.el7.x86_64 #1 SMP Wed Aug 7 18:08:02 UTC 2019 x86_64 imooc (none))"
level=info ts=2020-02-26T07:41:42.971790006Z caller=main.go:247 fd_limits="(soft=1024, hard=4096)"
level=info ts=2020-02-26T07:41:42.971803104Z caller=main.go:248 vm_limits="(soft=unlimited, hard=unlimited)"
level=info ts=2020-02-26T07:41:42.972414608Z caller=main.go:562 msg="Starting TSDB ..."
level=info ts=2020-02-26T07:41:43.016935546Z caller=web.go:399 component=web msg="Start listening for connections" address=0.0.0.0:9090
level=info ts=2020-02-26T07:41:43.034948534Z caller=main.go:572 msg="TSDB started"
level=info ts=2020-02-26T07:41:43.034996598Z caller=main.go:632 msg="Loading configuration file" filename=/usr/local/prometheus/prometheus.yml
level=info ts=2020-02-26T07:41:43.036625265Z caller=main.go:658 msg="Completed loading of configuration file" filename=/usr/local/prometheus/prometheus.yml
level=info ts=2020-02-26T07:41:43.03664733Z caller=main.go:531 msg="Server is ready to receive web requests."
```

特别注意：<font color=#DD1144>&连接符代表后台运行，不占用终端窗口</font>，如果这样启动了程序，我们还是需要确认一下这个端口是否被真正启动：
```go
// 可能需要下载一下lsof
# lsof -i:9090

// 或者使用下面的命令：
# ss -naltp | grep 9090
```
其中：<font color=#1E90FF>lsof命令用于查看你进程开打的文件，打开文件的进程，进程打开的端口(TCP、UDP)。</font>，我们检查结果如下：
```go
[root@imooc prometheus]# ss -naltp | grep 9090
LISTEN     0      128       [::]:9090                  [::]:*                   users:(("prometheus",pid=15479,fd=6))
```
经过上面的一系列启动之后，`prometheus`这个就能通过访问`web`的方式来访问普罗米修斯的界面了，通过访问`http://服务器IP:9090`就能访问到`prometheus`的主界面了，我这里自己的虚拟机的地址是:`http://192.168.11.86:9090/graph`,然后如果我们点击`stauts/Targets`，我们就会到下面这个界面：

<img :src="$withBase('/prometheus_introduce_two.png')" alt="prometheus界面">

可以看到，在默认情况下，它只会监听自己服务器上9090端口的数据，其中列表中每一行中的`State`为`UP`的时候表示对方服务是开启的，如果是`DOWN`表示监控的对方服务已经关闭。<font color=#1E90FF>那实际上图片中的http://localhost:9090/metrics指的就是http://192.168.11.86:9090/metrics这个地址，这个地址是一个web接口，prometheus是通过发送get请求从这个地址上拿到一系列的数据</font>

当然我们还能通过首页的查询来查看各个组件的运行状态，只要我们在首页最上面的输入框输入我们要查的东西，点击蓝色按钮<font color=#1E90FF>Execute</font>就能在`Graph`和`Console`两个`tab`栏中分别看到图像和打印的信息，如下所示：

<img :src="$withBase('/prometheus_introduce_three.png')" alt="首页操作">

**参考资料**

1. [3小时搞定prometheus普罗米修斯监控系统](https://www.bilibili.com/video/av77812341?p=3)