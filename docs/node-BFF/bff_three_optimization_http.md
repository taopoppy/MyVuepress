# 性能工具 - 性能检测

## http宏观性能检测

### 1. 压力测试工具
+ <font color=#DD1144>ab(Apache bench)</font>
+ <font color=#DD1144>webbench</font>

那我们这里使用的就是`ab`，我们要先到官网上去下载这个工具，这个工具的下载地址在[https://www.apachehaus.com/cgi-bin/download.plx](https://www.apachehaus.com/cgi-bin/download.plx),然后，你根据你自己的电脑的情况安装，我们这里是windowx64，我就点击下面那个下载压缩包

<img :src="$withBase('/node_bff_ab_download.png')" alt="ab下载工具">

然后在解压后的`bin`目录打开命令行，输入测试命令就能开始测试了

### 2. 压力测试过程
当我们启动我们的服务器在`127.0.0.1:3000`端口后我们在前面下载好的`ab`文件夹的`bin`目录下面打开命令行窗口，执行下面的压测命令
```javascript
ab -c200 -n1600 http://127.0.0.1:3000/download/
```
+ <font color=#DD1144>-c</font>: 即concurrency，用于指定压力测试的并发数,模拟当前共有多少个客户端在进行同时请求
+ <font color=#DD1144>-n</font>：即requests，用于指定压力测试总共的执行次数。

测试结果如下：
```bash
This is ApacheBench, Version 2.3 <$Revision: 1843412 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 160 requests
Completed 320 requests
Completed 480 requests
Completed 640 requests
Completed 800 requests
Completed 960 requests
Completed 1120 requests
Completed 1280 requests
Completed 1440 requests
Completed 1600 requests
Finished 1600 requests


Server Software:
Server Hostname:        127.0.0.1
Server Port:            3000

Document Path:          /download/                 // 访问包的路径
Document Length:        264785 bytes               // 访问包的大小（大概是259kb，你在浏览器上打开network面板看到Doc当中的siza也是259k）

Concurrency Level:      200                        // 你自己输入压测命令时的并发数
Time taken for tests:   13.137 seconds             // 压测一共花的时间
Complete requests:      1600                       // 成功完成的压测请求数（根据http返回码判断）
Failed requests:        0                          // 压测请求失败的数量
Total transferred:      423993600 bytes            // 1600次一共传输的总数据量
HTML transferred:       423656000 bytes            // 1600次html一共传输的总数据量
Requests per second:    121.80 [#/sec] (mean)      // (最重要qps) 平均每秒的请求数，也就是服务器能最大承受的每秒并发量
Time per request:       1642.094 [ms] (mean)       // （重要）200个用户每次请求所花平均时间 
Time per request:       8.210 [ms] (mean, across all concurrent requests) （最重要）单个用户请求一次的平均时间
Transfer rate:          31518.92 [Kbytes/sec] received // (最重要) 传输速率，或者吞吐量（有多少数据量的交互）

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    1   4.5      1      62
Processing:   408 1595 181.5   1599    2006
Waiting:       35  114  34.3    106     214
Total:        409 1596 181.1   1600    2007

Percentage of the requests served within a certain time (ms)
  50%   1600
  66%   1640
  75%   1658
  80%   1680
  90%   1823
  95%   1878
  98%   1992
  99%   2002
 100%   2007 (longest request)
```

### 3. http服务的性能瓶颈猜测

通过上述的这种报告，我们基本能看到关于服务器性能最重要的四个参数：<font color=#1E90FF>Requests per second</font>，<font color=#1E90FF>Time per request</font>，<font color=#1E90FF>Time per request</font>，<font color=#1E90FF>Transfer rate</font>

服务器的性能当然有瓶颈的存在，一般瓶颈会被<font color=#DD1144>cpu</font>、<font color=#DD1144>硬盘</font>、<font color=#DD1144>网卡</font>这些硬件部分所限制，比如你的服务器的吞吐量大概就是你网卡的带宽（注意单位换算），那么基本上就是网卡限制了你的服务器的性能。

那基本上我们在`linux`测试性能，都会现在`linux`服务器上跑一些命令，然后在外部进行压测
+ <font color=#DD1144>top</font>: 通过跑`top`命令来监控`cpu`和内存使用情况的，在外部压测的同时，可以通过监控的`cpu`占比和内存占比看到底是哪里限制了服务器
+ <font color=#DD1144>iostat</font>：检测各个I/O设备的带宽，比如硬盘I/O在压测的情况下已经到了极限，那就说明服务器可以处理的过来，但是硬盘已经跟不上了，这就是I/O瓶颈

但是基本上在服务器确定的情况下，我们大部分问题其实都是我们自己书写的`Node-BFF`层，而且就在<font color=#DD1144>node-bff层中的cpu运算上</font>，比说大面积的字符串拼接等js运算，就体现在程序运行的时候`cpu`的占用率是`100%`

当然还有负载，在负载到达极限的时候，如果是我们`node`计算性能到达了瓶颈，基本上表现在程序当中就是<font color=#DD1144>某一段代码写的不好，导致了大面积出现了问题</font>

## Node微观性能检测
为了检测具体的`Node`运行信息，我们现在的压测用具的命令稍做改动：
```javascript
ab -c50 -t15 http://localhost:3000/download/
```
### 1. profile工具
+ `node --prof entry.js` -> 生成`isolate-00000000003E4090-v8.log`文件（空文件）
+ 执行压测15秒的命令 -> 在`isolate-00000000003E4090-v8.log`文件中生成了好多内容
+ `node --prof-process isolate-00000000003E4090-v8.log > profile.txt`-> 将log文件中的东西进行分析，分析到`profile.txt`文件当中

总之呢，这种工具实在是很难看懂，有没有更加简单的工具呢？

### 2. Chrome devtool
<font color=#1E90FF>**① cpu检测**</font>

+ `node --inspect-brk entry.js` -> 启动程序的时候就一开始就暂停，进去后再开始
+ 打开`chrome://inspect`,点击最下面的`Target`进入调试，点击开始按钮即可
+ 上面有两个`Tab`，一个是`Memory`,一个是`Profiler`，分别表示的内存和`cpu`的检测
+ 我们在`Profiler`当中点击`Start CPU profiling`按钮
+ 然后开始15秒的压测，`ab -c50 -t15 http://localhost:3000/download/`
+ 然后回到`Profiler`的当中点击`stop`的按钮，就能根据从上到下的耗时去优化

<font color=#1E90FF>**② 内存检测**</font>

+ `node --inspect-brk entry.js` -> 启动程序的时候就一开始就暂停，进去后再开始
+ 打开`chrome://inspect`,点击最下面的`Target`进入调试，点击开始按钮即可
+ 上面有两个`Tab`，一个是`Memory`,一个是`Profiler`，分别表示的内存和`cpu`的检测
+ 然后开始15秒的压测，`ab -c50 -t15 http://localhost:3000/download/`
+ 在压测的过程中，在`Memory`当中点击`Take heap snaphot`,生成内存快照
+ 等待压测结束，在`Memory`当中再次点击`Take heap snaphot`，生成内存快照
+ 然后点击`Comparison`来对比两次快照的变化，通过观察`Alloc.Size`和`Freed.Size`的差值看到`Size Delta`，观察内存是否存在泄露
+ 一般在`snaphot1`和`snaphot2`之前大小比较十分悬殊的情况下，是一定存在内存泄漏的。

### 3. clinic
针对比较大的项目，我们可以使用`clinic`，具体的用法建议你到npm上去学习和使用，这里就不具体解释了