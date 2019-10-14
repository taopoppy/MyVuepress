# node中的模块概述

## 深入理解模块
### 1. 模块的执行和本质
有了前面`CommonJS`的一些基础概念，我们就能探索一下模块在被引用之前到底`Node`执行了什么操作？
+ <font color=#1E90FF>其实每个模块在被引用的时候都被头尾包装，将其包裹在一个函数当中，代码执行完毕后将exports对象作为该函数的返回值返回给引用方</font>
  ```javascript
  function (exports,require,module,__firename,__dirname) {
    //模块中你自己书写的代码
  }
  ```
+ 所以你会看到，所以我们平时理解的这些全局对象，其中上述的<font color=#CC99CD>exports</font>、<font color=#CC99CD>require</font>、<font color=#CC99CD>module</font>、<font color=#CC99CD>__firename</font>、<font color=#CC99CD>__dirname</font>这个五个对象是通过作为函数参数的方式传入进入模块内部的。
+ 如果你能够深入到源码当中你就能看到模块被执行的时候`Node.js`的源码做了两件事。<font color=#1E90FF> 保证顶层的变量只在模块内部起作用(变量的作用域限制在本地而不会暴露到全局) </font>和<font color=#1E90FF>帮助提供一些全局查找的变量（上述那5个）</font>

其实在源码当中的这种包裹非常简单：
```javascript
NativeModule.wrapper = [
  '(function (exports,require,module,__firename,__dirname) {',
  '\n })'
]

NativeModule.warp = function (script) {
  return NativeModule.wrapper[0] + script + NativeModule.wrapper[1]  // 拼接字符串的操作
}

NativeModule.prototype.compile = function (){
  var source = NativeModule.getSource(this.id)       // 这里的id指的就是模块的名称，同时也是文件的地址
  source = NativeModule.warp(source)
  this.loading = true

  try {
    var fn = runInThisContext(source, {    // 具体执行代码的方法是runInThisContext
      fileName: this.fileName,
      lineOffset: 0,
      disPlayErrors: true
    })
    fn(this.exports,NativeModule.require,this,this.fileName)
    this.loaded = true
  } finally (error) {
    this.loading = false
  }
}
```

### 2. 模块的引用和缓存
<font color=#1E90FF>**① 模块当中到底有什么**</font>

我们创建一个`a.js`文件然后里面的内容如下:
```javascript
console.log(module)
```
执行结果如下：
```javascript
Module {
  id: '.',
  exports: {},
  parent: null,
  filename: 'C:\\Users\\Administrator\\Desktop\\fsDemo\\a.js',
  loaded: false,
  children: [],
  paths:
   [ 'C:\\Users\\Administrator\\Desktop\\fsDemo\\node_modules',
     'C:\\Users\\Administrator\\Desktop\\node_modules',
     'C:\\Users\\Administrator\\node_modules',
     'C:\\Users\\node_modules',
     'C:\\node_modules' ] }
```
然后我们继续创建一个`b.js`文件，然后里面的内容如下：
```javascript
require('./a.js')
```
执行结果如下：
```javascript
Module {
  id: 'C:\\Users\\Administrator\\Desktop\\fsDemo\\a.js',
  exports: {},
  parent:
   Module {
     id: '.',
     exports: {},
     parent: null,
     filename: 'C:\\Users\\Administrator\\Desktop\\fsDemo\\b.js',
     loaded: false,
     children: [ [Circular] ],
     paths:
      [ 'C:\\Users\\Administrator\\Desktop\\fsDemo\\node_modules',
        'C:\\Users\\Administrator\\Desktop\\node_modules',
        'C:\\Users\\Administrator\\node_modules',
        'C:\\Users\\node_modules',
        'C:\\node_modules' ] },
  filename: 'C:\\Users\\Administrator\\Desktop\\fsDemo\\a.js',
  loaded: false,
  children: [],
  paths:
   [ 'C:\\Users\\Administrator\\Desktop\\fsDemo\\node_modules',
     'C:\\Users\\Administrator\\Desktop\\node_modules',
     'C:\\Users\\Administrator\\node_modules',
     'C:\\Users\\node_modules',
     'C:\\node_modules' ] }
```
通过上面的执行结果我们就知道一个模块当中包含的啥东西了，模块里面只有这些属性，<font color=#3eaf7c>搜索一个模块也是按照paths属性当中的数组一层层的遍历寻找，同时一个模块当中的代码编译时通过NativeModule.getSource(this.id)来获得的，通过本节最上面的NativeModule.prototype.compile编译的方法中的代码就能看到</font>

所以通过定义来查看模块的定义就是下面这样  
<font color=#CC99CD>function Module(id,parent){</font>  
<font color=#CC99CD>&nbsp;&nbsp;&nbsp;&nbsp;this.id = id</font>  
<font color=#CC99CD>&nbsp;&nbsp;&nbsp;&nbsp;this.exports = {}</font>  
<font color=#CC99CD>&nbsp;&nbsp;&nbsp;&nbsp;this.parent = parent</font>  
<font color=#CC99CD>&nbsp;&nbsp;&nbsp;&nbsp;updateChileren(parent,this,false)</font>  
<font color=#CC99CD>&nbsp;&nbsp;&nbsp;&nbsp;this.fileName = null</font>  
<font color=#CC99CD>&nbsp;&nbsp;&nbsp;&nbsp;this.loaded = false</font>  
<font color=#CC99CD>&nbsp;&nbsp;&nbsp;&nbsp;this.children = []</font>  
<font color=#CC99CD>}</font> 

<font color=#b14>所以模块在被包装的时候所传递的module参数就是模块本身，而模块本身不包含你在这个文件所写的代码的，模块执行的时候是根据模块id来读取的你编写的代码的，然后拼接好成为字符串，依靠V8底层的C++代码来识别和执行整个字符串的</font>

<font color=#1E90FF>**② 模块的加载和缓存机制**</font>

`Node`当中的模块有两种类型，<font color=#CC99CD>核心模块</font> 和 <font color=#CC99CD>文件模块</font>，通过`require`方法能引用的就是这两种模块，只不过参数的类型还是比较丰富：
+ `http`,`fs`,`path`等`Node`内置的<font color=#CC99CD>核心模块</font>
+ `/.mod`或者`../mod`等这种相对路径的<font color=#CC99CD>文件模块</font>
+ `/pathtomodule/mod`等这种绝对路径的<font color=#CC99CD>文件模块</font>
+ `mod`等非原生模块的<font color=#CC99CD>文件模块</font>
当然核心模块的优先级最高，在有命名冲突的情况下优先加载核心模块，文件模块只能按照相对路径和绝对路径的方式去加载

还有一种情况就是`require`遇到了一个既不是核心模块又不是以路径表示的文件模块，通常我们说的就是第三方依赖包，这种查找的机制是这样：
+ <font color=#1E90FF>首先在当前目录下的node_module目录下面查找是否包含这样一个模块，如果没有找到，就要在当前目录的上一层node_module目录中继续查找，反复执行直到根目录为止</font>

由于`Node.js`中存在4类模块（原生模块和3种文件模块），尽管`require`方法极其简单，但是内部的加载却是十分复杂的，其加载优先级也各自不同。如下图所示：
<img :src="$withBase('/node_module_search.png')" alt="node模块查找">

<font color=#3eaf7c>阶段1：粗查阶段</font> 

+ 如果是node核心模块，就直接返回模块名称
+ 如果是引入的第三方npm模块，会返回父级所在文件夹下的node_modules，父父级所在文件夹下的node_modules，依次递归，一直到/node_modules和用户名下的.node_modules以及全局环境变量配置的全局安装的模块文件夹组成的数组
+ 如果是相对路径引入的模块，会将相对路径和父级路径之间进行一个path.resolve()，然后返回

<font color=#3eaf7c>阶段2：精确查找，获取文件绝对路径</font>

以require('express')为例

+ 先尝试加载node_modules/express，这种没有扩展名的文件是否存在
+ 尝试按照扩展名规则查找，依次判断node_modules文件夹下.js .json .node结尾的文件名为express的文件是否存在，返回文件的绝对路径
+ 判断node_modules/express文件夹下的package.json是否存在，如果存在，返回main字段指定的文件的绝对路径
+ 判断node_modules/express/index.js是否存在，存在返回对应文件绝对路径

我个人觉得上述的这个图你可以看一下，阶段1和2的分析没有必要记住：因为<font color=#CC99CD>缓存机制是模块加载当中的一个小步骤而已，表现在源码当中就是一个判断语句</font> ，那我们可以从源码`Module._load`来看一下：
```javascript
Module._load = function(request, parent, isMain) {
  if(parent) {
    debug('Module._load REQUEST %s parent: %s',request,parent.id)
  }
  //获取文件路径
  var filename = Module._resolveFilename(request, parent, isMain);
  // 尝试从缓存中读取模块
  var cachedModule = Module._cache[filename];
  if (cachedModule) {
    updateChildren(parent, cachedModule, true);
    return cachedModule.exports;
  }
    // 如果是原生模块返回
  if (NativeModule.nonInternalExists(filename)) {
    debug('load native module %s', request);
    return NativeModule.require(filename);
  }
  // 第三方模块创建模块对象
  var module = new Module(filename, parent);

  if (isMain) {
    process.mainModule = module;
    module.id = '.';
  }
 
 // 缓存模块
  Module._cache[filename] = module;
    
 // 加载模块
  tryModuleLoad(module, filename);

 // 返回模块的exports
  return module.exports;
};
```
上面这个源码是`Node`加载模块直接会调用的函数，但是在里面很多其他的函数我们需要单独拿出来理解，但是单独拿出来讲会让你理解的思路不清晰，所以我们这里给出一幅图，让你清楚的看到每个函数到底在干什么：<font color=#d14>加载模块是从require函数开始的，require函数当中返回的是Module._load函数结果，所以我们从Module._load入手看看整个加载过程是怎么样的</font>
<img :src="$withBase('/node_how_module_load.png')" alt="node模块加载机制">

而图中最后一步关于`NativeModule.prototype.compile`源码我们在本节最开始就已经说明，整个关于`Node`加载模块的机制和流程大致就是如此

## 模块扩展
关于模块扩展的内容涉及到`C++`的知识，我们在这里就不做过多的介绍，小编也没有到精通`C++`地步，所以关于这方面的知识我们后续如果有机会再回头补充。

**参考资料**
+ [node的模块机制](https://juejin.im/post/5cde5ad76fb9a07ee565ecd9)
+ [node模块加载机制](https://juejin.im/post/5d84456851882556f33d5fb0)
+ [浅谈node的模块机制的实现](https://juejin.im/post/5b952c4ae51d450e91628785)
+ [Node.js 中的模块机制](https://juejin.im/entry/5b4b5081e51d451984696cb7)
+ [结合源码分析 Node.js 模块加载与运行原理](https://juejin.im/entry/5ac83dff5188255c4c1084fd)