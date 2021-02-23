# 前端全栈痛点解析

## DevOps流程
在前端很多问题都是没有下面这些东西造成的：<font color=#9400D3>自动化</font>、<font color=#9400D3>规范化</font>、<font color=#9400D3>文档化</font>，那么对于企业来讲，我们有下面这些解决方案
+ <font color=#1E90FF>对组织人员培训，转变思维想自动化/规范化转变</font>
+ <font color=#1E90FF>配合效率工具（自动化）对流程进行简化/标准化</font>
+ <font color=#1E90FF>全员参与并且实践</font>

什么是<font color=#9400D3>DevOps流程</font>，`Dev`指的是`devlopment`，`Ops`指的是`operation`，用一句非常简单的话来形容就是：<font color=#DD1144>是一种通过一系列自动化工具的沟通合作来高效的完成整个软件生命周期的流程</font>

<img :src="$withBase('/bigfrontend-devops-2.png')" alt="">

+ <font color=#1E90FF>plan</font>：计划
+ <font color=#1E90FF>code</font>：编码
+ <font color=#1E90FF>build</font>：编译构建打包
+ <font color=#1E90FF>test</font>：测试
+ <font color=#1E90FF>release</font>：发布
+ <font color=#1E90FF>deploy</font>：部署
+ <font color=#1E90FF>operate</font>：运维维护
+ <font color=#1E90FF>monitor</font>：监控

那么我们在一般的项目当中怎么取实现`DevOps`呢？


+ 当我们拟定了一个项目就会使用版本控制就管理这个项目（git-gitflow）
+ 本地开发人员使用`IDE`(vscode)和一些虚拟的环境(比如`Docker`)
+ 开发完一个功能后，会将流程流转到缺陷控制的平台上(JIRA)
+ 将修改的功能和文档通过文档的形式进行反馈
+ 测试人员开始测试，将测试结果反馈到缺陷控制的平台上
+ 缺陷控制的平台的结果和信息反向就会影响本地开发

<img :src="$withBase('/bigfrontend-devops-1.png')" alt="">

自动化表现在什么地方呢？ <font color=#1E90FF>提交代码之后，会经过自动化工具，比如jenkins，帮助我们自动打包，并且在虚拟的开发、测试，生产环境当中运行。比如rancher还能管理一个集群化的节点或者服务，可以部署到云平台上去</font>

具体点说：<font color=#DD1144>我们开发项目的时候完成了一个功能，然后提交到远程的分支上去，进行完毕分支合并后就发给Jenkins，Jenkins就会做一个简单的打包，合成到一个镜像当中，推送到远程的镜像平台，发布在对应的开发或者测试环境，运行起来。整个过程你只需要关注开发，关于发布测试和部署都不需要担心，大大提高了开发效率，降低了运维风险</font>

## 什么是前端全栈
前端全栈不是什么都会，前端全栈的概念如下：
+ <font color=#DD1144>能不断的适应变化</font>
+ <font color=#DD1144>认识项目开发全流程，不能查漏补缺</font>


就好比我们经常说‘多读书’，其实‘多’这个词并非量词，而是程度副词，因为读书是为了明理，一本书读3遍最终明白了这本书要说的道理，并且融会贯通，成为自己思想的一部分，这就是读书最好的结果。但是如果读了很多书，每本书都是草草读完，走了个过程，实际上并没有什么用。

