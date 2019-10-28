# 实战技术预研 - 模块

## 技术预研
我们这个项目就是一个`BFF`层，就是浏览器和后台服务中间的一个中间渲染层，负责组装后台返回的各个微服务返回的数据，并且组装成为前端所需要的数据，然后返回到浏览器。这种中间渲染层就是一个为前端服务的后台服务。

<img :src="$withBase('/node_combat_bff.png')" alt="Node中间渲染层">

说白了整个`BFF`层提供的两个功能，或者说职责有两个：
+ <font color=#1E90FF>对用户侧提供HTTP服务</font>
+ <font color=#1E90FF>使用后端的RPC服务</font>


## Node.js内置模块

### 1. 数据从node应用开始调用
基本上，当我们使用`node`内置模块的时候，大部分情况是数据开始从`node`应用开始调用的，如下图也就是左半部分的流程：<font color=#DD1144>Application</font> ⇄ <font color=#DD1144>V8</font> ⇄ <font color=#DD1144>OS 操作系统</font>

<img :src="$withBase('/node_shijianxunhuanjizhi.png')"  alt="node内置模块">  

我们这里举个例子：当你使用`os.cpus`方法的时候，整个调用流程是这样：
+ <font color=#CC99CD>node源码中的lib文件夹/os.js</font>: 
  ```javascript
  const {
    getCPUs,
    ...
  } = internalBinding('os')

  function cpus() {
    ...
    const data = getCPUs() || []
    ...

    return data
  }
  ```
  可以看到在`node`内置模块`os.cpus`源码当中使用到了`getCPUs`整个方法，而这个方法是从`internalBinding('os')`当中取出来的，<font color=#DD1144>internalBinding这个是node.js V8层面的一些方法</font>
  

+ <font color=#CC99CD>node源码中的src文件夹/node_os.cc</font>
  ```C
  using v8::Array;
  using v8::ArrayBuffer
  ....

  void Initialize(Local<object> target, Local<value> unused, Local<Context> context,void* priv) {
    ...

    env->SetMethod(target,'getCPUs',GetCPUInfo);
  }

  static void GetCPUInfo(const functionCallbackInfo<Value>& args) {
    // 取出js语言传递来的擦参数通过args
    ....

    uv_free_cpu_info(cpu_infos,count) // 该方法是一个C++底层获取cpu信息的方法
    args.GetReturenValue().Set(Array::New(isolate,result.data(),result.size()))
  }
  ```
  可以看到首先在`C++`调用了很多V8库，然后通过`Initialize`这个方法导出了再`js`文件中可以使用的`getCPUs`的方法，实际上在`js`当中调用了`getCPUs`方法就是在调用`C++`当中的`GetCPUInfo`方法，所以`Initialize`实际上就在`js`和`C++`两种不同语言中间做转换的函数。

  而在`GetCPUInfo`这个具体的`C++`方法中，`uv_free_cpu_info`是`C++`底层获取`cpu`信息的方法，而`GetReturenValue`方法是v8当中的方法，能将`C++`变量和`JS`变量之间做转化。
  
我们最后通过`os.cpus`来总结一下内置模块的运行顺序：
<img :src="$withBase('/node_neizhimokuai_tuxinfenxi.png')" alt="内置模块总结">

### 2. 数据从操作系统开始调用
调用内置模块除了上面最典型的这种模式外，还有一种情况就是：<font color=#1E90FF>数据从操作系统传递给node应用</font>，我们来举例：
```javascript
process.stdin.on('data',(buffer) => {
  const action = buffer.toString().trim()
})
```
这种就是操作系统会将终端的数据传递到`Node`应用中来，这里就用到另外一个`node`的核心内置模块`EventEmitter`

<font color=#1E90FF>EventEmitter是node当中的事件模块,实际上和我们在浏览器当中使用的那些鼠标点击事件差不多，都属于观察者模式，那我们的process全局对象也是继承自EventEmitter，它就具备了向上抛事件的能力</font>。

这种模式是一般用于什么场景呢，比如我们在一个手机`app`上面学习编程，那么这个`app`上一旦有新的课程上线就会给我们发送通知，我们就能接受到，比如：
```javascript
// lib.js
const EventEmitter = require('events').EventEmitter

class Geektime extends EventEmitter {
  constructor(){
    super()
    setInterval(()=> {
      this.emit('newlesson', { price: Math.random() * 100 })
    },3000)
  }
}

const geektime = new Geektime

module.exports = geektime
```
```javascript
// index.js
const geektime = require('./lib')

geektime.addListener('newlesson', (res) => {
  if(res.price < 80) {
    console.log('buy!',res.price)
  }
})
```
这样的观者着模式就能封装底层的代码，我们可以无限添加人数，只要有新课程向上抛出，就能被所有人监听到。所以`EventEmitter`就是使用了一种使用了观察者模式的核心模块。

特别要注意：<font color=#DD1144>观察者模式是用来解决两个对象之间通信的问题的</font>，而两个对象之间通信可以直接使用函数调用，也能够是用观察者模式，具体什么时候使用观察者模式我们可以注意下面两点：
+ <font color=#CC99CD>关键在于'不知道被通知者的存在'</font>
+ <font color=#CC99CD>以及'没有人听还能继续下去'</font>