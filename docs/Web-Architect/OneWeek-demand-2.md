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

## 项目间关系