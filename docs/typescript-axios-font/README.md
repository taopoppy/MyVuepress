# TS重构axios前置知识学习

如果你已经学习了上一个专题[TypeScript入门](https://www.taopoppy.cn/typescript/),恭喜你，但是如果想使用`TypeScript`去重构`axios`，还远远不够，我们还要学习下面这些东西:

+ 首先需要对`ajax技术`或者`XMLHttpRequest`对象进行学习了解，还需要了解`http`和`跨域`的相关知识,这个是`axios`的核心
+ 因为我们使用`promise`去封装`axios`，所以我们需要对`JS Asynchronous`，`promise`等知识进行详细的学习
+ 另外我们会参照官网`axios`的项目功能和结构去重构，所以我们在此之前也应该对`axios`源码去解析

诚然，实现一个作品是简单的，实现一个好的作品是难的，我们可能会花大量时间去学习前置的知识，但相信自己，这些前置知识并不仅仅作用在这一个项目，将来还会影响你更多