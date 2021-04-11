# Koa框架

## Koa概述
我们在学习之前，先来看看本章都要学习哪些东西：

<img :src="$withBase('/bigfrontend-devop-15.png')" alt="">

<font color=#1E90FF>Koa利用async函数丢弃回调函数，并增强错误处理，Koa没有任何预置的中间件，可快速而愉快的编写服务端应用程序，它最核心的地方就是做了一些http协议的处理，对于它里面的核心概念context上下文，requset请求和response响应之间的关系如下，</font>

<img :src="$withBase('/bigfrontend-devop-16.png')" alt="">