# 性能指标和优化目标

我们以淘宝网站作为例子，通过清除缓存重新刷新，然后我们可以看到各种加载的过程展现在开发者工具当中：

<img :src="$withBase('/font_end_optimization_1.png')" alt="开发者工具截图">

## 网络性能
### 1. 瀑布图
在每个资源加载的最后有一个<font color=#9400D3>瀑布图</font>，通过各种颜色模块来模拟不同时间段花费的时间，我们鼠标移动到这个上面，可以看到下面的信息：

<img :src="$withBase('/font_end_optimization_2.png')" alt="过程图">

实际上在资源下载之前，是要经历很多的步骤的

<font color=#1E90FF>**① 横向研究**</font>

+ <font color=#9400D3>Resource Scheduling</font>：排队，浏览器会对资源的请求进行优先级的安排，高优先级的进行请求
+ <font color=#9400D3>Connection Start</font>:连接开始
	+ <font color=#1E90FF>Stalled</font>：停滞时间
	+ <font color=#1E90FF>DNS Lookup</font>：DNS查找
	+ <font color=#1E90FF>Initial connection</font>：建立连接（TCP）
	+ <font color=#1E90FF>SSL</font>：`https`网站会进行`SSL`协商
+ <font color=#9400D3>Request/Response</font>：请求和响应
	+ <font color=#1E90FF>Request sent</font>：发送出去所需的时间
	+ <font color=#1E90FF>Waiting(TTFB)</font>：等待响应时间
	+ <font color=#1E90FF>Content Download</font>：内容下载时间

实际上上述这些指标当中最重要的就是<font color=#DD1144>TTFB</font>，因为这个是最直观显示网站快慢的因素，这个指标当中又反应了两个重要的问题，就是：<font color=#DD1144>服务器处理速度</font>和<font color=#DD1144>网络延迟问题</font>

<font color=#1E90FF>**② 纵向研究**</font>

纵向研究的话，可以看出：<font color=#1E90FF>资源和资源的关系</font>，有些资源之间是串行的关系，也就是前者加载下载完毕，后者才开始。有些资源之间的关系是并行的关系，就是同时执行加载和下载的过程。<font color=#1E90FF>这也提示我们了一个优化的点就是可以并行的加载资源</font>


其次在瀑布图当中有两个重要的时间点，就是前面我们在图中标识的<font color=#9400D3>DOM节点加载完成的时间</font>和<font color=#9400D3>页面其他资源加载完的时间</font>

::: tip
<font color=#3eaf7c>如果我们想把分析结果保存下来，可以在开发者工具的空白处点击右键，然后选择Save all as HAR with content。这种HAR文件也可以导入到其他性能分析工具当中</font>
:::


### 2. Lighthouse分析图
`lighthouse`是一款内置在`chrome`当中的性能分析工具，有两种使用方式
+ <font color=#1E90FF>直接打开开发者工具，然后找到tab为Audits，这部分是被Lighthouse监管的</font>
+ <font color=#1E90FF>下载lighthouse浏览器插件，国内需要翻墙</font>

这里我们不对其做具体的使用分析，后面还会仔细说明，我们这里只说明几个比较重要的测试指标：

<img :src="$withBase('/font_end_optimization_3.png')" alt="lighthouse">

+ <font color=#1E90FF>First Contentful Paint</font>：第一个有绘制的东西出现的时间
+ <font color=#1E90FF>Speed index</font>：速度指数，小于4秒为优，这个只是个指导性的指标，像电商网站无论怎么做都不会比百度这些官网优秀，因为内容不一样，复杂度会更高


## 交互性能
### 1. 交互速度
交互速度体现在一些交互按钮或者输入框的反应速度，比如二级菜单的展示快慢，输入框关键字的搜索响应等等。

### 2. 流畅度
人眼能接受的内容是在60帧就会流畅，低于这个值就会觉的卡，那对于帧数我们怎么去看呢，打开开发者工具，在`Performance`当中点击`control+shift+p`搜索`frame`，在结果当中搜索<font color=#9400D3>Show frames per seconds（FPS）meter</font>，在浏览器的左上角就会出现一个检测器，检测当前帧数的变化。

这个检测器如果能在网页当中的动画或者效果高速运转的情况下达到60帧，就是高度流畅了。

### 3. 异步请求
<font color=#DD1144>异步请求业界的标准是1秒</font>，1秒能把数据返回回来就是高效的异步请求。我们极度推荐前端在页面请求的时候添加加载效果动画或者加载图，不然就显的贼low。