# 实战概述

## 小程序的概述
我们传统的小程序开发至少需要三个部分，<font color=#3eaf7c>前端</font>、<font color=#3eaf7c>后端</font>、<font color=#3eaf7c>运维（服务器，域名，备案，网络防护，负载均衡，监控警告）</font>，所以在服务端和运维费方面是个极其头疼的事情

<font color=#3eaf7c>小程序云开发为开发者提供了完整的云端的支持</font>，完全弱化掉后端和运维的概念，我们不需要搭建服务器，只需要调用原生的接口就能实现小程序对云数据库、云函数和云存储的操作。云开发赋予开发者安全的、稳定的读取数据和上传文件以及控制权限的能力，同时运维的问题在云端内部统统帮助我们解决掉。

关于<font color=#3eaf7c>Serverless</font>服务的概念，我们在入门环节就说的很明白，同时还有个很重要的概念：<font color=#3eaf7c>函数即服务</font>，我们在小程序后端服务开发只需要调用函数即可，整个后端的服务在前端看来就是一个个函数。而且前后端的逻辑我们只需要在一个工具下面就能完成。<font color=#3eaf7c>所以小程序的云开发这种模式真正把前端推广到了全栈</font>

## 项目整体架构
<img :src="$withBase('/weixin_cloudjiagou.png')" alt="项目整体架构">

五大基础能力：
+ <font color=#3eaf7c>云函数</font>：在云端运行的代码，并且具有天然的鉴权机制
+ <font color=#3eaf7c>云数据库</font>：既可以在小程序端也可以在云函数当中操作的非关系型`json`数据库
+ <font color=#3eaf7c>云调用</font>：通过云调用可以很方便的对接腾讯提供的服务
+ <font color=#3eaf7c>HTTP API</font>：可以让第三方的服务直接对接云开发中的资源
+ <font color=#3eaf7c>云存储</font>：项目当中的文件可以放在云存储当中

云开发周边：
+ 云函数以<font color=#3eaf7c>定时触发</font>的方式去第三发服务器取数据，数据保存在云数据库
+ 通过云调用调用<font color=#3eaf7c>腾讯云服务</font>，实现<font color=#3eaf7c>模板消息推送</font>和<font color=#3eaf7c>小程序码的生成</font>
+ 后台管理系统（`koa`+ `vue`）通过`HTTP API`访问云开发中资源，实现与云开发当中的互联互通

## 项目收获
+ 前端部分：组件化开发 -> <font color=#3eaf7c>独立造轮子</font>
+ 后端部分：云开发打造 -> <font color=#3eaf7c>云开发必备技能</font>
+ 后台管理系统，对接云开发 -> <font color=#3eaf7c>后台开发部不求人</font>