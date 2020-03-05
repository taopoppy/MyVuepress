# Grafana可视化图形工具

## Grafana工具的下载和安装
关于`Grafana`,<font color=#1E90FF>它是一个开源的度量分析和可视化工具，可以通过将采集的数据分析，查询，然后进行可视化的展示并能实现报警</font>，我们可以到它的[官网](https://grafana.com/)上去下载它，我们这里使用的`rpm`软件包是：<font color=#1E90FF>grafana-5.3.4-1.x86_64.rpm</font>，一般的`rpm`包我们都能直接通过下面的这种命令安装：
```go
[root@imooc ~]# rpm -ivh grafana-5.3.4-1.x86_64.rpm
warning: grafana-5.3.4-1.x86_64.rpm: Header V4 RSA/SHA1 Signature, key ID 24098cb6: NOKEY
error: Failed dependencies:
	fontconfig is needed by grafana-5.3.4-1.x86_64
	urw-fonts is needed by grafana-5.3.4-1.x86_64

```
但是你会发现它提示你缺少依赖，所以有的不能通过这样的形式下载，它会提示你缺少依赖，所以为了解决依赖的问题，我们可以直接使用`yum`命令来解决缺少依赖的问题：
```go
# yum install grafana-5.3.4-1.x86_64.rpm -y
```
<font color=#DD1144>所以这种rpm文件不一定非要使用rpm命令去安装，使用yum也可以，因为yum底层也是rpm的安装方式，而且顺带会解决依赖的问题</font>，然后我们启动`grafana`:
```go
// 启动grafana
# systemctl start grafana-server
// 设置开机启动
# systemctl enable grafana-server
// 检查端口
# ss -naltp |grep 3000
```
具体操作如下：
```go
[root@imooc ~]# systemctl start grafana-server
[root@imooc ~]# systemctl enable grafana-server
Created symlink from /etc/systemd/system/multi-user.target.wants/grafana-server.service to /usr/lib/systemd/system/grafana-server.service.
[root@imooc ~]# ss -naltp | grep 3000
LISTEN     0      128       [::]:3000                  [::]:*                   users:(("grafana-server",pid=17614,fd=6))
```
这样的话我们`grafana`安装的服务器的`ip`是<font color=#1E90FF>192.168.11.86</font>，那我们通过在浏览器当中输入`192.168.11.86:3000`就能看到`grafana`的登录界面，初始用户和密码都是`admin`，然后会提示你需要修改密码，之后的首页如下图所示：

<img :src="$withBase('/prometheus_introduce_seven.png')" alt="grafana">

## 连接prometheus
### 1. 添加prometheus数据源

当我们进入首页之后点击中间绿色发光的<font color=#3eaf7c>add data source</font>按钮，给`grafana`添加一个`prometheus`的数据源，然后根绝提示选择设置：

<img :src="$withBase('/grafana_config.png')" alt="添加设置选项">

然后保存之后，我们点击左侧图标栏中的齿轮按钮，选择`Data Sources`，就能看到我们刚才保存的`prometheus`数据源。

### 2. 为添加好的数据源做图形显示
+ 点击左侧的图标栏中的加号图标
+ 再点击`Dashboard`选项
+ 点击`Graph`增加一个图形
+ 点击最上面的`Panel Title`，展开下拉框，选择`Edit`
+ 然后按照下面的提示选择数据源，选择查看的查询条件，比如负载情况等等：
	<img :src="$withBase('/grafana_graph_config.png')" alt="监控参数选择">

在书写上述查询条件时我们可以有多种筛选条件的写法：
+ <font color=#1E90FF>node_load1{instance="localhost:9100"}</font>：表示查询`localhost:9100`这个实例的每一分钟的负载情况
+ <font color=#1E90FF>node_load5{job="prometheus"}</font>：表示在`prometheus.yml`中`job`选项为`prometheus`的机器的每5分钟记录的负载均衡

## Grafana图形展示Mysql监控数据
### 1. Grafana修改配置安装模板
在`Grafana`修改配置文件，并且下载安装`mysql`监控的<font color=#1E90FF>dashboard</font>,这个`dash`文件实际上就是定义好的图形图像的模板，包含了`json`文件，这些`json`文件可以看做开发人员开发的一个监控模板。

所以我们需要先去修改`grafana`的配置文件，添加模板文件的存放路径：
```go
# vim /etc/grafana/grafana.ini
```
然后将下面的三行添加到最后：
```go
[dashboards.json]
enabled = true
path = /var/lib/grafana/dashboards
```
然后我们就可以安装`dashboard`然后对`grafana`重新启动：
```go
# cd /var/lib/grafana/
# git clone https://github.com/percona/grafana-dashboards.git
// 把戈隆下来项目中的模板全部放在我们定义的模板文件中
# cp -r grafana-dashboards/dashboards/ /var/lib/grafana/
# systemctl restart grafana-server
```
实际上上面的操作步骤就是将`https://github.com/percona/grafana-dashboards`这个项目中`dashboards`文件中的所有`json`文件全部放在`/var/lib/grafana/dashboards`当中，我们可以直接将项目下载到`windows`本地，然后上传到`/var/lib/grafana/dashboards`中，这样好像还快一点，而且等会上传`json`文件好像也要从本地上传。

### 2. Grafana导入json文件
重启了之后我们需要登录到之前的那个`Grafana`的`web`页面：
+ 点击左侧图标栏中的加号按钮，选择`import`
+ 选择<font color=#3eaf7c>Upload .json File</font>绿色的按钮
+ 上传`MySQL_Overview.json`,默认的名称就是`MySQL_Overview`,点击`Import`按钮保存。
+ 通常情况下，保存之后图形模板就能和数据库结合生成可视化的图像，但是之前我们设置的数据源的名称是`prometheus_data`
+ 将之前的`prometheus_data`数据源的名称修改为`Prometheus`,首字母要大写，重新保存。
+ 回到`dashboards`(点击左侧加号图标栏，选择DashBoards),选择`MySQL_Overview`的图形界面就能看到模板和数据正确结合的可视化界面了。

要注意的是，可视化界面中显示的各种各样的信息就是我们在上传的`MySQL_Overview`这个`json`文件中定义的各种信息，都是别人已经定义好的，我们只需要拿来直接用即可