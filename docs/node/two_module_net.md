# 核心模块 - net
## 网络模型和TCP协议
这里我们会简单的介绍一下网络模型和TCP协议的内容，因为网络协议这个东西是一个更大的学问，我们本节是要讲述`node`中的`net`模块，所以我们将会在[传输和协议](https://www.taopoppy.cn/node/)当中细致的讲解协议的各项内容。

### 1. 网络模型
大多数同学对于`HTTP`、`HTTPS`会很熟悉，通常用于浏览器与服务端交互，或者服务端与服务端的交互，另外两个`Net`与`Dgram`也许会相对陌生，这两个是基于网络模型的传输层来实现的，分别对应于 `TCP`、`UDP`协议，下面一图看明白`OSI`七层模型与`TCP/IP`五层模型之间的关系，中间使用虚线标注了传输层，对于上层应用层（HTTP/HTTPS等）也都是基于这一层的`TCP`协议来实现的，所以想使用 `Node.js`做服务端开发，`Net`模块也是你必须要掌握的，这也是我们本篇要讲解的重点。

<img :src="$withBase('/node_osi_tcp_relationship.jpg')" alt="OSI和TCP的关系">

### 2. 初始TCP协议
`TCP`是<font color=#DD1144>传输控制协议</font>，大多数情况下我们都会使用这个协议，因为它是一个更可靠的数据传输协议，具有如下三个特点：
+ <font color=#DD1144>面向链接</font>: 需要对方主机在线，并建立链接。
+ <font color=#DD1144>面向字节流</font>: 你给我一堆字节流的数据，我给你发送出去，但是每次发送多少是我说了算，每次选出一段字节发送的时候，都会带上一个序号，这个序号就是发送的这段字节中编号最小的字节的编号。
+ <font color=#DD1144>可靠</font>: 保证数据有序的到达对方主机，每发送一个数据就会期待收到对方的回复，如果在指定时间内收到了对方的回复，就确认为数据到达，如果超过一定时间没收到对方回复，就认为对方没收到，在重新发送一遍。

上面三个特点说到`TCP`是面向链接和可靠的，其一个显著特征是在传输之前会有一个3次握手，实现过程如下所示：
<img :src="$withBase('/node_net_tcp_module.jpg')" alt="">

在一次`TCP`三次握手的过程中，客户端与服务端会分别提供一个套接字来形成一个链接。之后客户端与服务端通过这个链接来互相发送数据。

## 使用net创建TCP链接
+ <font color=#3eaf7c>TCP 服务器事件</font> 
  + <font color=#CC99CD>listening</font>: 也就是`server.listen()`;
  + <font color=#CC99CD>connection</font>: 新链接建立时触发，也就是每次收到客户端回调，参数`socket`为`net.createServer`实例，也可以写在`net.createServer(function(socket) {}) 方法里
  + <font color=#CC99CD>close</font>：当`server`关闭的时候触发（server.close()）。如果有连接存在，直到所有的连接结束才会触发这个事件
  + <font color=#CC99CD>error</font>：捕获错误，例如监听一个已经存在的端口就会报`Error: listen EADDRINUSE`错误

+ <font color=#3eaf7c>TCP 链接事件方法</font> 
  + <font color=#CC99CD>data</font>: 一端调用`write()`方法发送数据时，另一端会通过 `socket.on('data')`事件接收到，可以理解为读取数据
  + <font color=#CC99CD>end</font>: 每次 socket 链接会出现一次，例如客户端发送消息之后执行 `Ctrl + C`终端，就会收到
  + <font color=#CC99CD>error</font>: 监听 socket 的错误信息
  + <font color=#CC99CD>write</font>：`write`是一个方法（socket.write()）上面的`data`事件是读数据，`write`方法在这里就为写数据到另一端，

### 1. 服务端代码实现
```javascript
const net = require('net')
const HOST = '127.0.0.1'
const PORT = '4000'

// 创建一个TCP服务实例
const server = net.createServer()
// 监听端口
server.listen(PORT, HOST)

// 当我们使用server.listen就会产生listening事件
server.on('listening', ()=> {
  console.log(`服务已经开启在${HOST}:${PORT}`)
})

// 当服务端接收到数据就会产生connection事件
server.on('connection',socket => {
  socket.on('data',buffer => {
    const msg = buffer.toString()
    console.log(`我已经接收到你的数据为：${msg}`)

    // 使用wirte方法向客户端返回信息
    socket.write(Buffer.from(`${msg} - alreadyget`))
  })
})

// 当服务端主动执行server.close或者所有链接结束会产生close事件
server.on('close',()=> {
  console.log('服务已经关闭')
})

// 当服务端发生异常的时候会触发error事件的发生
server.on('error',err => {
  if(err.code = 'EADDRINUSE') {
    console.log('地址正在被使用，1秒后重新连接中...')
    setTimeout(()=> {
      server.close()
      server.listen(PORT,HOST)
    },1000)
  } else {
    console.log(`服务端异常，异常信息如下: ${err}`)
  }
})

```

### 2. 客户端代码实现
```javascript
const net = require('net')

const client = net.createConnection({
  host: '127.0.0.1',
  port: '4000'
})

// 当使用了net.creatConnection成功建立连接后会触发connect事件
client.on('connect',()=>{
  console.log('链接成功，开始发送数据')
  setTimeout(() => {
    client.write('Javascript ')
    client.write('Node 技术栈 ')
    client.write('Typescript ')
    client.write('Python ')
    client.write('Java ')
    client.write('C ')
    client.write('Php ')
  },1000)
})

// 客户端收到信息就会触发data的事件 
client.on('data', buffer => {
  console.log(`我收到服务器返回的数据为: ${buffer.toString()}`)
})

client.on('error',err => {
  console.log('客户端异常',err)
})

client.on('close',(err) => {
  console.log('客户端连接断开',err)
}) 

```

## 黏包问题
我们上述代码在第一个`client.write`数据包发送会正确返回结果，后面的`client.write`发送的数据包内容全部连在了一起发送给了服务端。这个由于`TCP`底层的优化导致。

<font color=#DD1144>客户端（发送的一端）在发送之前会将短时间有多个发送的数据块缓冲到一起（发送端缓冲区），形成一个大的数据块一并发送，同样接收端也有一个接收端缓冲区，收到的数据先存放接收端缓冲区，然后程序从这里读取部分数据进行消费，这样做也是为了减少 I/O 消耗达到性能优化。</font>

当然在上述这种情况我们是不希望有黏包的问题出现的，那么我们说一下常见的解决方法：

### 1. 延迟发送
一种最简单的方案是设置延迟发送，`sleep`休眠一段时间的方式，但是这个方案虽然简单，同时缺点也显而易见，传输效率大大降低，对于交互频繁的场景显然是不适用的，第一次改造如下：
```javascript
client.on('connect',()=>{
  console.log('链接成功，开始发送数据')
  for (let i=0; i<arr.length; i++) {
    setTimeout(() => {
        client.write(arr[i]);
    }, 1000 * (i+1))
  }
})
```
### 2. 关闭Nagle算法
`Nagle`算法是一种改善网络传输效率的算法，避免网络中充斥着大量小的数据块，它所期望的是尽可能发送大的数据块，因此在每次请求一个数据块给`TCP`发送时，TCP 并不会立即执行发送，而是等待一小段时间进行发送。

当网络中充斥着大量小数据块时，`Nagle`算法能将小的数据块集合起来一起发送减少了网络拥堵，这个还是很有帮助的，但也并不是所有场景都需要这样，例如，`REPL`终端交互，当用户输入单个字符以获取响应，所以在`Node.js`中可以设置`socket.setNoDelay()`方法来关闭 Nagle 算法。
```javascript
// client.js
client.on('connect',()=>{
  client.setNoDelay(true)
  ...
})
```
```javascript
// server.js
server.on('connection',socket => {
  socket.setNoDelay(true);
  ...
})
```

关闭`Nagle`算法并不总是有效的，因为其是在服务端完成合并，`TCP`接收到数据会先存放于自己的缓冲区中，然后通知应用接收，应用层因为网络或其它的原因若不能及时从`TCP`缓冲区中取出数据，也会造成 `TCP`缓冲区中存放多段数据块，就又会形成粘包。

### 3. 封包/拆包
<font color=#DD1144>封包/拆包，是目前业界用的比较多的，这里使用长度编码的方式，通信双方约定好格式，将消息分为定长的消息头（Header）和不定长的消息体（Body），在解析时读取消息头获取到内容占用的长度，之后读取到的消息体内容字节数等于字节头的字节数时，我们认为它是一个完整的包。</font>
| 消息头序号（Header） | 消息体长度（Header）   | 消息体  |
| :-----------------: |:---------------------:| :-----:|
| SerialNumber        | bodyLength            |body    |
| 2（字节）            | 2（字节）             |N（字节）|

但是在正式编码开始之前，我们要知道这样的解决方案是要涉及到二进制的读写的，那么关于`Buffer`的内容你就不得不去了解一下了，建议看一下[核心模块 - buffer](https://www.taopoppy.cn/node/two_module_buffer.html),我们下面列举一些使用方法，帮助你快速理解`Buffer`相关API的用法：
+ <font color=#CC99CD>Buffer.alloc(size[, fill[, encoding]])</font>：初始化一个 size 大小的 Buffer 空间，默认填充 0，也可以指定 fill 进行自定义填充
+ <font color=#CC99CD>buf.writeInt16BE(value[, offset])</font>：value 为要写入的 Buffer 值，offset 为偏移量从哪个位置开始写入
+ <font color=#CC99CD>buf.writeInt32BE(value[, offset])</font>：参数同 writeInt16BE，不同的是 writeInt16BE 表示高位优先写入一个 16 位整型，而 writeInt32BE 表示高位优先写入一个 32 位整型
+ <font color=#CC99CD>buf.readInt16BE([offset])</font>：高位优先读取 16 位整型，offset 为读取之前要跳过的字节数
+ <font color=#CC99CD>buf.readInt32BE([offset])</font>：高位优先读取 32 位整型，offset 为读取之前要跳过的字节数

接下来我会详细给大家讲解一下怎么封包和拆包：
```javascript
// transcoder.js
class Transcoder {
  constructor() {
    this.packageHeaderLen = 4; // 包头长度
    this.serialNumer = 0; // 包的序列号（从0开始）
    this.packageSerialNumebrLen = 2; // 包序列号所占用的字节
  }

  /**
   * 编码
   * @param {Object} data 原始的Buffer数据对象 
   * @param {Number} serialNumer 包序号，客户端自动生成，服务端解码后在编码需要传入，这样客户端能根据序列号将请求的和收到的包一一对应
   */
  encode(data, serialNumer) {
    const body = Buffer.from(data)   // 将原始数据编码成为Buffer对象

    const header = Buffer.alloc(this.packageHeaderLen)    // 约定好整个头占4位
    header.writeInt16BE(serialNumer || this.serialNumer)  // 包序号占前两位
    header.writeInt16BE(body.length,this.packageSerialNumebrLen) // 数据长度占后两位

    if(serialNumer === undefined) {
      this.serialNumer ++ 
    }
    return Buffer.concat([header, body])
  }

  /**
   * 解码（前提是参数buffer是一个完整的数据包，包含header和body）
   * @param {Object} buffer 要解码的buffer对象
   */
  decode(buffer) {
    const header = buffer.slice(0,this.packageHeaderLen) // 获取包头
    const body = buffer.slice(this.packageHeaderLen)   // 获取头部以后的数据

    return {
      serialNumer: header.readInt16BE(),
      bodyLength: header.readInt16BE(this.packageSerialNumebrLen),
      body: body.toString()
    }
  }

  /**
   * 获取当前buffer对象中包含的第一个完整的buffer数据包长度：
   * 1. 如果当前 buffer 长度数据小于包头，肯定不是一个完整的数据包，因此直接返回 0 不做处理（可能数据还未接收完等等）
   * 2. 否则返回这个完整的数据包长度
   * @param {Object}} buffer buffer对象
   */
  getPackageLength(buffer) {
    if(buffer.length < this.packageHeaderLen) {
      return 0
    }

    return this.packageHeaderLen + buffer.readInt16BE(this.packageSerialNumebrLen) // 包的长度 = 4 + 整个buffer从2到3读出来的数据
  }
}

module.exports = Transcoder
```
说实话，首先展现给大家的是一个工具类，这个类有编码`encode`函数和解码`decode`函数，还有从当前buffer中获取一个完整包的函数`getPackageLength`，我们用图示给大家解释一下三个函数的作用
<img :src="$withBase('/node_net_module_nianbao.png')" alt="黏包工具类">

通过上面的图示我觉的已经很清楚的表示了三个函数的作用：
+ <font color=#DD1144>encode</font> :通过在原始`buffer`拼接序列号的`buffer`和表示原始`buffer`长度的`buffer`，组成了新的`buffer`
+ <font color=#DD1144>decode</font> :把包含序列号和长度的`buffer`解码出来，和`encode`函数作用恰好相反
+ <font color=#DD1144>getPackageLength</font>：从一个不规则的`buffer`中取出一个完整`buffer`数据

```javascript
// client.js
const net = require('net')
const Transcoder = require('./transcoder')
const transcoder = new Transcoder()
const client = net.createConnection({
  host: '127.0.0.1',
  port: '4000'
})

const arr = [
  'JavaScript ','TypeScript ','Python ','Java ','C ','PHP ','ASP.NET '
]

let overageBuffer = null  // 上一次收到的不完整的buffer数据

// 客户端收到信息就会触发data的事件 
client.on('data', buffer => {
  if(overageBuffer) {
    buffer = Buffer.concat([overageBuffer, buffer])
  }

  let packageLength = 0
  
  while(packageLength = transcoder.getPackageLength(buffer)){
    const package = buffer.slice(0,packageLength) // 取出一个完整的包
    buffer = buffer.slice(packageLength) // 再截取掉一个完整包后，把剩下的部分保存

    const result = transcoder.decode(package) // 对完整的包解码
    console.log('客户端接收到一个完整的包：',result)
  }
  overageBuffer = buffer // 假如transcoder.getPackageLength(buffer)为0,说明获得的data至少不是一个完整的数据包，则记录下来
}).on('error',err => {
  console.log('客户端异常',err)
}).on('close',(err) => {
  console.log('客户端连接断开',err)
}) 

client.write(transcoder.encode('0 NODE.JS技术栈 '))

setTimeout(() => {
  for (let i = 0; i < arr.length; i++) {
    client.write(transcoder.encode(arr[i]))
  }
}, 1000);
```
```javascript
// server.js
const net = require('net')
const Transcoder = require('./transcoder')
const transcoder = new Transcoder()
const HOST = '127.0.0.1'
const PORT = '4000'

let overageBuffer = null  // 上一次buffer的剩余量

// 创建一个TCP服务实例
const server = net.createServer()
// 监听端口
server.listen(PORT, HOST)

// 当我们使用server.listen就会产生listening事件
server.on('listening', ()=> {
  console.log(`服务已经开启在${HOST}:${PORT}`)
})

// 当服务端接收到数据就会产生connection事件
server.on('connection',socket => {
  socket.on('data',buffer => {
    if(overageBuffer) {
      buffer = Buffer.concat([overageBuffer, buffer])
    }

    let packageLength = 0

    while(packageLength = transcoder.getPackageLength(buffer)){
      const package = buffer.slice(0, packageLength) // 取出最前面一个完整的包
      buffer = buffer.slice(packageLength)  // 截取出剩下的所有数据

      const result = transcoder.decode(package) // 对一个完整的包解码
      console.log('服务端收到出的一个完整的包',result)

      socket.write(transcoder.encode(`${result.body}-resolve`,result.serialNumber)) // 这里要给客户端返回的时候要把序列号也包含进去
    }

    overageBuffer = buffer // 如果不是一个完整的包就保存下来留着后面用
  })
}).on('close',()=> {
  console.log('服务已经关闭')
}).on('error',err => {
  if(err.code = 'EADDRINUSE') {
    console.log('地址正在被使用，1秒后重新连接中...')
    setTimeout(()=> {
      server.close()
      server.listen(PORT,HOST)
    },1000)
  } else {
    console.log(`服务端异常，异常信息如下: ${err}`)
  }
})

```
然后我们启动客户端和服务端，我们可以看到数据会逐个正确的显示出来：
<img :src="$withBase('/node_net_nainbao_show.png')" alt="">




**参考资料**

1. [TCP、HTTP和Node.js的那些事](https://juejin.im/post/5adeaac6f265da0b7025895d)
2. [net简单实用](https://github.com/chyingp/nodejs-learning-guide/blob/master/%E6%A8%A1%E5%9D%97/net.md)
3. [入门 Node.js Net 模块构建 TCP 网络服务](https://mp.weixin.qq.com/s/fJB3T6g3yFf4yn_HYEZGPg)