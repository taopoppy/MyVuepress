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
### 1. 安装Mysql数据库
在我们的虚拟机可以连接到网络后我们在`CentOS`系统上还没有`wget`这个命令，我们需要通过下面的命令去安装：
```bash
yum install wget -y
```
下面好了之后我们可以下载这个`mysql`的安装包了：
```bash
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-8.0.15-linux-glibc2.12-x86_64.tar.xz
```
当然了，因为有些网络慢的原因，我们希望下载好安装包然后上传到`linux`系统中，这个时候我们需要：
```bash
yum -y install lrzsz
```
然后通过`rz`来上传文件，然后使用`sz`来下载文件。首先下载好的`mysql-8.0.15-linux-glibc2.12-x86_64.tar.xz`是个`xz`文件，我们需要解压成为`tar`文件，然后将`tar`文件解压成为`mysql-8.0.15-linux-glibc2.12-x86_64`这个文件夹,并且移动到`/usr/local/mysql`目录下：
```bash
xz -d mysql-8.0.15-linux-glibc2.12-x86_64.tar.xz
tar xf mysql-8.0.15-linux-glibc2.12-x86_64.tar
mv mysql-8.0.15-linux-glibc2.12-x86_64 /usr/local/mysql
cd /usr/local/mysql
```
然后我们来看如何启动`mysql`

### 2. 配置Mysql数据库服务
<font color=#1E90FF>**① 添加mysql系统用户**</font>

一般来说呢，我们是不能直接使用`root`用户来启动某个服务的，这样是不安全的，<font color=#1E90FF>所以我们需要单独的建立一个系统账号来是启动某个服务</font>：
```bash
adduser mysql  // 添加一个mysql的用户来启动mysql服务
```

<font color=#1E90FF>**② 修改mysql配置文件**</font>

添加好`mysql`名称的系统用户后我们来看看`mysql`的配置文件，一般都在`/etc/my.cnf`下面：
```bash
[client]
port   = 3306
socket = /usr/local/mysql/data/mysql.sock

[mysqld]
# skip #
skip_name_resolve      = 1
skip_external_locking  = 1
skip_symbolic_links    = 1

# GENERAL #
user = mysql
default_storage_engine = InnoDB
character-set-server = utf8
socket = /usr/local/mysql/data/mysql.sock
pid_file = /usr/local/mysql/data/mysqld.pid
basedir = /usr/local/mysql
port = 3306
bind-address = 0.0.0.0
explicit_defaults_for_timestamp = off
sql_mode = NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES
#read_only=on

# MyISAM#
key_buffer_size = 32M
#myisam_recover = FORCE,BACKUP

# undo log #
innodb_undo_directory   = /usr/local/mysql/undo
innodb_undo_tablespaces = 8

# SAFETY #
max_allowed_packet = 100M
max_connect_errors = 1000000
sysdate_is_now = 1
#innodb = FORCE
#innodb_strict_node = 1
secure-file-priv = '/tmp'
default_authentication_plugin = 'mysql_native_password'

# Replice #
server-id = 1001
relay_log = mysqld-relay-bin
gtid_mode = on
enforce-gtid-consistency
log-slave-updates = on
master_info_repository = TABLE
relay_log_info_repository = TABLE

# DATA STORAGE#
datadir = /usr/local/mysql/data/
tmpdir = /tmp

# BINARY LOGGING#
log_bin = /usr/local/mysql/sql_log/mysql-bin
max_binlog_size = 1000M
binlog_format = row
binlog_expire_logs_seconds = 86400
#sync_binlog = 1

# CACHES AND LIMITS #
tmp_table_size             = 32M
max_heap_table_size        = 32M
max_connections            = 4000
thread_cache_size          = 2048
open_files_limit           = 65535
table_definition_cache     = 4096
table_open_cache           = 4096
sort_buffer_size           = 2M
read_buffer_size           = 2M
read_rnd_buffer_size       = 2M
# thread_concurrency        = 24
join_buffer_size           = 1M
# table_cache               = 32768
thread_stack               = 512k
max_length_for_sort_data   = 16k

# INNODB #
innodb_flush_method            = O_DIRECT
innodb_log_buffer_size         = 16M
innodb_flush_log_at_trx_commit = 2
innodb_file_per_table          = 1
innodb_buffer_pool_size        = 256M
#innodb_buffer_pool_instances   = 8
innodb_stats_on_metadata       = off
innodb_open_files              = 8192
innodb_read_io_threads         = 16
innodb_write_io_threads        = 16
innodb_io_capacity             = 20000
innodb_thread_concurrency      = 0
innodb_lock_wait_timeout       = 60
innodb_old_blocks_time         = 1000
innodb_use_native_aio          = 1
innodb_purge_threads           = 1
innodb_change_buffering        = all
innodb_log_file_size           = 64M
innodb_log_files_in_group      = 2
innodb_data_file_path          = ibdata1:256M:autoextend
innodb_rollback_on_timeout     = on

# LOGGING #
log_error = /usr/local/mysql/sql_log/mysql-error.log
# log_queries_not_using_indexes   = 1
# slow_query_lo                  =1
slow_query_log_file = /usr/local/mysql/sql_log/slowlog.log
```
关于`my.cnf`的配置参数的含义和选型，可以到这两个博客上详细的查询：[mysql配置文件my.cnf详解](https://www.cnblogs.com/L-H-R-X-hehe/p/4110702.html)、[my.cnf部分详解](https://www.cnblogs.com/toby/articles/2198697.html)

<font color=#1E90FF>**③ 添加文件并且修改权限**</font>

然后我们在`/usr/local/mysql`目录下面创建几个文件，因为在配置中需要用到：
```bash
mkdir data sql_log undo
```
然后之前我们添加一个`mysql`的系统用户，当前在`/usr/local/mysql`下的文件读写的权限都只有`root`用户，我们需要让`mysql`系统用户也拥有刚创建的三个文件的有写权限：
```bash
[root@imooc mysql]# chown mysql:mysql -R data/ sql_log/ undo/
[root@imooc mysql]# ls -lh
```
使用`ls -lh`检查一下`data`、`sql_log`、`undo`三个文件的属主，<font color=#1E90FF>然后我们使用mysql系统用户启动mysql服务的时候，就能对这几个文件进行读写操作了</font>

<font color=#1E90FF>**④ 修改环境变量**</font>

我们在`/etc/profile`这文件的最后添加`mysql`可执行文件的路径,这样在任何目录下都能使用`mysql`服务的命令了：
```bash
vi /etc/profile
# 文件最后一行添加下面的语句
export PATH=$PATH:/usr/local/mysql/bin

# 应用环境变量
source /etc/profile
```

### 3. 初始化Mysql数据库服务
<font color=#1E90FF>**① 初始化mysql服务**</font>

我们要初始化`mysql`的一些系统的数据库和它的系统表：
```bash
mysqld --initialize --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data
```
接着我们进入到`/usr/local/mysql/support-files/`目录下面，将`mysql.server`拷贝到`/etc/init.d/mysqld`:
```bash
cd support-files/
cp mysql.server /etc/init.d/mysqld
```

<font color=#1E90FF>**② 启动mysql服务**</font>

然后我们就可以进入到`/etc/init.d/mysqld`来启动`mysql`的服务了：
```bash
/etc/init.d/mysqld start

# 检查是否启动成功
ps -ef | grep mysql
```

<font color=#1E90FF>**③ 修改密码**</font>

新版本中，我们的临时密码存储在`/usr/local/mysql/sql_log/mysql-error.log`文件中，我们先查询一下：
```bash
grep password mysql-error.log
```
复制一下结果中最后的一小段复杂的字符串，那个就是临时的密码。然后使用`mysql`客户端命令进入`mysql`:
```bash
mysql -uroot -p
# 接着输入刚才记录的复制的字符串
```
进入到`mysql`中我们就来修改一下密码：
```bash
mysql> alter user user() identified by '123456';

mysql> exit;
```
然后重新使用新的密码登录。到这里我们就基本完成了`mysql`的全部安装和部署。当然这里我们还没有将`mysql`设置成为每次开机自启动服务，你可以参考这里的文章自己设置：[设置MySQL开机自动启动的方法](https://blog.csdn.net/gxw19874/article/details/51982873)
