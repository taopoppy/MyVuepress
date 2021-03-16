# 技术架构分析

## 划分范围
划分范围是很重要的一步，因为复杂的产品是不太可能一个项目就可以搞的定的，<font color=#1E90FF>我们需要划分项目范围和功能服务</font>，至于功能服务是使用第三方的，还是自研的，还是放弃，那是技术评审时候的事情

+ <font color=#1E90FF>B端和编辑器，做前后端分离</font>
	+ <font color=#DD1144>biz-editor-fe</font>
	+	<font color=#DD1144>biz-editor-server</font>

+ <font color=#1E90FF>H5适合做SSR，因为要考虑到性能</font>
	+ <font color=#DD1144>H5-server</font>

+ <font color=#1E90FF>管理后台</font>
	+ <font color=#DD1144>admin-fe</font>
	+ <font color=#DD1144>admin-server</font>

+ <font color=#1E90FF>业务组件库</font>（文字，图片和图形）

要注意的就是：<font color=#1E90FF>服务端渲染一般不适用B端，适用于C端，给用户看的东西需要提高性能和速率，同时不能为了设计而设计</font>

因为在编辑器和H5发布的时候，文字图片等所有的东西都要保持一致，所以有必要将其抽离出来做成一个<font color=#9400D3>业务组件库</font>这样一个单独的项目，然后它会被引入到编辑器项目和H5项目当中去做组件的显示和渲染，相当于就是一个`npm`包，<font color=#1E90FF>这里也体现了复用的场景</font>

所以我们先大概分析上述这些项目之间的关系，它们都是利用的是同一个存储内容：

<img :src="$withBase('/web-projects_constract.png')" alt="">

## 自研统计服务
首先简单说一下<font color=#1E90FF>作品渠道统计</font>的这个需求的必要性，它是满足架构师闭环分析需求中的重要一步，所以不能砍掉这个需求。

如何实现？只能<font color=#DD1144>自定义事件统计</font>，<font color=#1E90FF>因为普通的pv/uv只能满足对域名级别的网址进行统计</font>，不能统计访问参数级别的渠道。第三方服务，比如友盟，百度统计，`arms`，要么不支持，要么收费很贵。

我们先简单的分析一下这个统计服务的流程；

<img :src="$withBase('/web_statistics_server.png')" alt="">

企业用户在通过B端编辑器完成作品的制作和发布后，作品URL会投放到不同的平台，不同的平台上面的作品URL是不同的，会在`Query`参数当中携带不同的值，所以当平台用户点击URL就会触发<font color=#1E90FF>埋点统计</font>，就会自动发送一些请求数据（包括`channal`，`time`等等）到统计服务，统计服务会提供<font color=#1E90FF>OpenAPI</font>，那么原来的企业用户在通过B端发布作品后，隔段时间就会通过统计服务提供的`OpenAPI`拿到统计数据，类似于你在`bilibili`发布一个视频，隔段时间就能看到自己有多少个赞，播放量，甚至B站每周会自动给你推送周统计，俗称周报。

至于上图中的`OpenAPI`实际就是普通的后端接口而已，之所以叫的这么高大上就是因为这个接口要给很多平台使用，B端的后台管理，还有`CMS`的后台管理，所以它比较开放，就叫做`OpenAPI`

所以综上所述，我们自研的这个自定义事件统计服务包括：
+ <font color=#9400D3>日志收集</font>
+ <font color=#9400D3>日志分析</font>
+ <font color=#9400D3>OpenAPI</font>

到目前为止，我们的在增加了统计服务之后，外加上我们后面要加进来的脚手架，我们各个项目之间的关系如下：

<img :src="$withBase('/web_project_contect_all.png')" alt="">

## 数据结构设计

## 数据流转关系