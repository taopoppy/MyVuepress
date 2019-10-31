# 实战技术预研 - rpc

## RPC调用概述
`RPC`调用的全称叫做<font color=#DD1144>远程过程调用（Remote Procedure Call）</font>

这个东西实际上是后端技术之一，从前端的角度我们需要找一个类比的东西来帮助我们理解，这个东西就是<font color=#1E90FF>Ajax</font>。

`RPC`和`Ajax`之间两者相同点如下：
+ <font color=#1E90FF>都是两个计算机之间的网络通信</font>
  + `Ajax`表示的是客户端和服务端之间的通信技术
  + `RPC`表示的服务端和服务端之间的通信技术
+ <font color=#1E90FF>需要双方约定一个数据格式</font>

`RPC`和`Ajax`之间的不同点在于：
+ <font color=#1E90FF>不一定使用DNS作为寻址服务</font>
  + `Ajax`一般访问域名要通过`DNS`来寻找真正访问服务的`IP`
  + `RPC`一般是在内网中互相通信，所以使用`DNS`是划不来的，它会使用特有服务进行寻址
+ <font color=#1E90FF>RPC一般不会使用HTTP协议，采用基于二进制的协议TCP或者UDP</font>
  + `Ajax`采用的`HTTP`协议是一种文本协议，要么是`html`要么是`json`
  + 而`RPC`采用的二进制协议就是一个有很多位数的0和1的数据，比如`RPC [00100011000111]`, <font color=#DD1144>所以二进制协议有更小的数据包的体积和更快的编码速率</font>，因为计算机存储资源就是二进制。

当`RPC`采用`TCP`通信的时候，方式也有如下三种
+ <font color=#DD1144>单工通信</font>：在`TCP`链接的过程中永远只能有一方给另外一方发送数据
+ <font color=#DD1144>半双工通信</font>：在同一时间内，只能由一方给另外一方发送数据，可以理解为轮番单工通信
+ <font color=#DD1144>全双工通信</font>：在同一时间内，双方都能向对方发送数据
<img :src="$withBase('/node_rpctongixn.png')" alt="PRC三种调用方式"> 

## Buffer编解码二进制数据包
### 1. Buffer的基本使用
<font color=#1E90FF>**① Buffer的创建**</font>

在此之前我们需要去简单的学习依一下`Buffer`的两个`API`
+ <font color=#1E90FF>Buffer.from()</font>: 根据现有的数据结构去创建`buffer`数据
+ <font color=#1E90FF>Buffer.alloc()</font>: 指定`buffer`数据的长度来创建`buffer`数据
```javascript
const buffer1 = Buffer.from('geekbang')
const buffer2 = Buffer.from([1,2,3,4])

const buffer3 = Buffer.alloc(20)

console.log(buffer1) // <Buffer 67 65 65 6b 62 61 6e 67>
console.log(buffer2) // <Buffer 01 02 03 04>
console.log(buffer3) // <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00>
```

<font color=#1E90FF>**② Buffer的读写**</font>

关于`Buffer`的数据读取在官网上有很多方法：如下
```javascript
buf.readBigInt64BE([offset])
buf.readBigInt64LE([offset])
buf.readBigUInt64BE([offset])
buf.readBigUInt64LE([offset])
buf.readDoubleBE([offset])
buf.readDoubleLE([offset])
buf.readFloatBE([offset])
buf.readFloatLE([offset])
buf.readInt8([offset])
buf.readInt16BE([offset])
buf.readInt16LE([offset])
buf.readInt32BE([offset])
buf.readInt32LE([offset])
buf.readIntBE(offset, byteLength)
buf.readIntLE(offset, byteLength)
buf.readUInt8([offset])
buf.readUInt16BE([offset])
buf.readUInt16LE([offset])
buf.readUInt32BE([offset])
buf.readUInt32LE([offset])
buf.readUIntBE(offset, byteLength)
buf.readUIntLE(offset, byteLength)
```
细心的同学会发现这些方法名称有`BE`和`LE`的区别，这个大段和小段的意思，说白了就是方向的问题，而`Int8`是没有`BE`和`LE`的区别的，我们用代码来演示一下
```javascript
buffer2.writeInt8(12,1) // 在buffer2的第二位写入一个int8 的数字12
console.log(buffer2) // <Buffer 01 0c 03 04>

buffer2.writeInt16BE(512,2) // 在buffer2的第三位开始写一个 int16的数字 512
console.log(buffer2) // <Buffer 01 0c 02 00>

buffer2.writeInt16LE(512,2) // 在buffer2的第三位开始写一个 int16的数字 512
console.log(buffer2) // <Buffer 01 0c 00 02>
```
所以你看到了，因为`int8`类型的数字只占一位，所以不存在方向不方向的问题，而`int16`类型的数字要占两位，比如512用16进制表示就是 [02 00],所以使用`BE`表示正方向，而`LE`表示反方向。具体使用什么样的表示方法要和被人协商议定。

### 2. 编解码二进制数据包

之前我们在讲`json`是`http`文本协议的一种格式，而二进制是`TCP`二进制协议的格式，我们现在要将`{ id: 1, name: 'taopoppy', school: '电子科技大学'}` 这样一个`JS`对象通过两种协议发送，过程如下:

<img :src="$withBase('/node_tcp_rpc_buffer_encode_decode.png')" alt="数据传输过程">

所以你就知道了：<font color=#DD1144>二进制协议中的不同的字段实际是塞在一个二进制数据包中的不同位置而已</font>，比如上述的
+ `id: 1`对应的二进制的一段位置就是`08 01`  
+ `name: 'taopoppy'`对应的二进制的一段位置就是`12 08 74 61 6f 70 6f 70 70 79`
+ `school: '电子科技大学'`对应的二进制的一段位置就是`1a 12 e7 94 b5 e5 ad 90 e7 a7 91 e6 8a 80 e5 a4 a7 e5 ad a6`   


在走`http`路线的时候我们可以通过`JSON.stringify`和`JSON.parse`两个方法实现对文本数据的编码和解码，在`TCP`路线当中我们可以借用第三方包的方法来实现编码和解码,第三方包的使用方法我们可以参考[官网](https://www.npmjs.com/package/protocol-buffers)
```javascript
// test.proto
message Student {
  required int32 id = 1;
  required string name = 2;
  required string school = 3;
}
```
```javascript
// index
const protobuf = require('protocol-buffers')
const fs = require('fs')

const schame = protobuf(fs.readFileSync(__dirname + '/test.proto'))
let buf = schame.Student.encode({
  id: 1,
  name: 'taopoppy',
  school: '电子科技大学'
})

console.log(buf) // <Buffer 08 01 12 08 74 61 6f 70 6f 70 70 79 1a 12 e7 94 b5 e5 ad 90 e7 a7 91 e6 8a 80 e5 a4 a7 e5 ad a6>

let obj = schame.Student.decode(buf)
console.log(obj) // { id: 1, name: 'taopoppy', school: '电子科技大学' }

```

## net模块搭建多路复用的RPC通道
### 1. net模块的基本使用
<font color=#1E90FF>**① 单工通信**</font>

`node`当中的`net`模块和`http`模块非常的相似，既然是`RPC`通道，就会有两个头，一个是请求发送的一方，一个是请求接收的一方，我们简称`client`和`server`:
```javascript
// server.js
const net = require('net')

const server = net.createServer((socket) => {
  socket.on('data',function(buffer){
    console.log(buffer,buffer.toString())
  })
})

server.listen(4000)
```
```javascript
// client.js
const net = require('net')

const socket = new net.Socket({})

socket.connect({
  host: '127.0.0.1',
  port: '4000'
})

socket.write('good morning geekbang')
```
然后我们先启动服务端的程序，然后再启动客户端的程序，就实现了一个最简单的<font color=#3eaf7c>单工通信</font>，上面两个代码要注意的就是：`socket`在计算机网络编程里面代表的是：<font color=#DD1144>网络通路的写入和取出的代理对象</font>

<font color=#1E90FF>**② 半双工通信**</font>

前面我们实现了一个简单的单工通信的案例，现在我们需要写一个正儿八经的数据请求和返回的半双工通信
```javascript
// server.js
const net = require('net')

const server = net.createServer((socket) => {
  socket.on('data',function(buffer){
    // 拿到buffer数据并读取出来
    const lessonid = buffer.readInt32BE()
    console.log(lessonid)
    // 然后把对应的数据取出来包装成为buffer返回
    setTimeout(()=> {
      socket.write(
        Buffer.from(data[lessonid])
      )
    },500)
  })
})

server.listen(4000)

const data = {
  136797: "01 | 课程介绍",136798: "02 | 内容综述",136799: "03 | Node.js是什么？",136800: "04 | Node.js可以用来做什么？",136801: "05 | 课程实战项目介绍",
  136803: "06 | 什么是技术预研？",136804: "07 | Node.js开发环境安装",136806: "08 | 第一个Node.js程序：石头剪刀布游戏",136807: "09 | 模块：CommonJS规范",
  136808: "10 | 模块：使用模块规范改造石头剪刀布游戏",136809: "11 | 模块：npm",141994: "12 | 模块：Node.js内置模块",143517: "13 | 异步：非阻塞I/O",
  143557: "14 | 异步：异步编程之callback",143564: "15 | 异步：事件循环",143644: "16 | 异步：异步编程之Promise",146470: "17 | 异步：异步编程之async/await",
  146569: "18 | HTTP：什么是HTTP服务器？",146582: "19 | HTTP：简单实现一个HTTP服务器"
}
```
```javascript
// client.js
const net = require('net')

const socket = new net.Socket({})

socket.connect({
  host: '127.0.0.1',
  port: '4000'
})
const lessonids = [
  "136797","136798","136799","136800","136801","136803","136804","136806","136807","136808",
  "136809","141994","143517","143557","143564","143644","146470","146569","146582"
]

let id = Math.floor(Math.random() * lessonids.length)

socket.write(encode(id))

socket.on('data',(buffer) => {
  // 接收到返回数据打印出来
  console.log(buffer.toString())
  // 再随机发送一个数据
  id = Math.floor(Math.random() * lessonids.length)
  socket.write(encode(id))
})

function encode(index) {
  let buffer = Buffer.alloc(4)
  buffer.writeInt32BE(
    lessonids[index]
  )
  return buffer
}
```

### 2. 搭建多路复用的RPC通道
<font color=#DD1144>多路复用就是在一个通信通路（tcp连接）上多次进行通信，减少建立连接的消耗。所以最好要求通信通路支持全双工通信</font>。那我们接下来要介绍的就是全双工通信，那么在半双工通信的基础上我们要想两个问题：
+ 假如同时有很多数据发送到服务端，服务端返回的顺序和发送的顺序不一样，我们需要给数据库包添加序列号
+ `TCP`底层存在黏包现象，我们需要在服务端去处理这个问题

<font color=#1E90FF>**① 全双工通信 - 包序列号**</font>

```javascript
// server.js
const net = require('net')

const server = net.createServer((socket) => {
  socket.on('data',function(buffer){
    // 拿到buffer数据并读取出来
    const seqBuffer = buffer.slice(0,2)
    const lessonid = buffer.readInt32BE(2)
    console.log(lessonid)
    // 然后把对应的数据取出来包装成为buffer返回
    setTimeout(()=> {
      const returnBuffer = Buffer.concat([
        seqBuffer,
        Buffer.from(data[lessonid])
      ])
      socket.write(
        returnBuffer
      )
    },10+ Math.random()*1000)
  })
})

server.listen(4000)

const data = {
  136797: "01 | 课程介绍",136798: "02 | 内容综述",136799: "03 | Node.js是什么？",136800: "04 | Node.js可以用来做什么？",136801: "05 | 课程实战项目介绍",
  136803: "06 | 什么是技术预研？",136804: "07 | Node.js开发环境安装",136806: "08 | 第一个Node.js程序：石头剪刀布游戏",136807: "09 | 模块：CommonJS规范",
  136808: "10 | 模块：使用模块规范改造石头剪刀布游戏",136809: "11 | 模块：npm",141994: "12 | 模块：Node.js内置模块",143517: "13 | 异步：非阻塞I/O",
  143557: "14 | 异步：异步编程之callback",143564: "15 | 异步：事件循环",143644: "16 | 异步：异步编程之Promise",146470: "17 | 异步：异步编程之async/await",
  146569: "18 | HTTP：什么是HTTP服务器？",146582: "19 | HTTP：简单实现一个HTTP服务器"
}
```
```javascript
// client.js
const net = require('net')
let seq = 0
const socket = new net.Socket({})

socket.connect({
  host: '127.0.0.1',
  port: '4000'
})
const lessonids = [
  "136797","136798","136799","136800","136801","136803","136804","136806","136807","136808",
  "136809","141994","143517","143557","143564","143644","146470","146569","146582"
]

let id = Math.floor(Math.random() * lessonids.length)

socket.write(encode(id))

socket.on('data',(buffer) => {
  // 接收到返回数据打印出来
  const seqBuffer = buffer.slice(0,2)
  const titleBuffer = buffer.slice(2)
  console.log('接收的内容',seqBuffer.readInt16BE(), titleBuffer.toString())
})

function encode(index) {
  let buffer = Buffer.alloc(6)
  buffer.writeInt16BE(seq)
  buffer.writeInt32BE(
    lessonids[index],2
  )
  console.log('发送的内容',seq, lessonids[index])
  seq++
  return buffer
}

// 模拟全双工通信的随机性
setInterval(() => {
  id = Math.floor(Math.random() * lessonids.length)
  socket.write(encode(id))
}, 50);
```

<font color=#1E90FF>**② 黏包解决**</font>

关于黏包的问题我们会在[node入门-核心模块net](https://www.taopoppy.cn/node/two_module_net.html)中讲解通用状况，下面列出的是上面示例的黏包解决方案：
```javascript
// server.js
const net = require('net');
const server = net.createServer((socket) => {
    let oldBuffer = null;
    socket.on('data', function (buffer) {
        // 把上一次data事件使用残余的buffer接上来
        if (oldBuffer) {
            buffer = Buffer.concat([oldBuffer, buffer]);
        }

        let packageLength = 0;
        // 只要还存在可以解成完整包的包长
        while (packageLength = checkComplete(buffer)) {
            const package = buffer.slice(0, packageLength);
            buffer = buffer.slice(packageLength);

            // 把这个包解成数据和seq
            const result = decode(package);

            // 计算得到要返回的结果，并write返回
            socket.write(
                encode(LESSON_DATA[result.data], result.seq)
            );
        }

        // 把残余的buffer记下来
        oldBuffer = buffer;
    })

});

server.listen(4000);

/**
 * 二进制包编码函数
 * 在一段rpc调用里，服务端需要经常编码rpc调用时，业务数据的返回包
 */
function encode(data, seq) {
    // 正常情况下，这里应该是使用 protobuf 来encode一段代表业务数据的数据包
    // 为了不要混淆重点，这个例子比较简单，就直接把课程标题转buffer返回
    const body = Buffer.from(data)

    // 一般来说，一个rpc调用的数据包会分为定长的包头和不定长的包体两部分
    // 包头的作用就是用来记载包的序号和包的长度，以实现全双工通信
    const header = Buffer.alloc(6);
    header.writeInt16BE(seq)
    header.writeInt32BE(body.length, 2);

    const buffer = Buffer.concat([header, body])

    return buffer;
}

/**
 * 二进制包解码函数
 * 在一段rpc调用里，服务端需要经常解码rpc调用时，业务数据的请求包
 */
function decode(buffer) {
    const header = buffer.slice(0, 6);
    const seq = header.readInt16BE();

    // 正常情况下，这里应该是使用 protobuf 来decode一段代表业务数据的数据包
    // 为了不要混淆重点，这个例子比较简单，就直接读一个Int32即可
    const body = buffer.slice(6).readInt32BE()

    // 这里把seq和数据返回出去
    return {
        seq,
        data: body
    }
}

/**
 * 检查一段buffer是不是一个完整的数据包。
 * 具体逻辑是：判断header的bodyLength字段，看看这段buffer是不是长于header和body的总长
 * 如果是，则返回这个包长，意味着这个请求包是完整的。
 * 如果不是，则返回0，意味着包还没接收完
 * @param {} buffer 
 */
function checkComplete(buffer) {
    if (buffer.length < 6) {
        return 0;
    }
    const bodyLength = buffer.readInt32BE(2);
    return 6 + bodyLength
}

// 假数据
const LESSON_DATA = {
    136797: "01 | 课程介绍",136798: "02 | 内容综述",136799: "03 | Node.js是什么？",136800: "04 | Node.js可以用来做什么？",136801: "05 | 课程实战项目介绍",
    136803: "06 | 什么是技术预研？",136804: "07 | Node.js开发环境安装",136806: "08 | 第一个Node.js程序：石头剪刀布游戏",136807: "09 | 模块：CommonJS规范",
    136808: "10 | 模块：使用模块规范改造石头剪刀布游戏",136809: "11 | 模块：npm",141994: "12 | 模块：Node.js内置模块",143517: "13 | 异步：非阻塞I/O",
    143557: "14 | 异步：异步编程之callback",143564: "15 | 异步：事件循环",143644: "16 | 异步：异步编程之Promise",146470: "17 | 异步：异步编程之async/await",
    146569: "18 | HTTP：什么是HTTP服务器？",146582: "19 | HTTP：简单实现一个HTTP服务器"
}
```
```javascript
const net = require('net');

const socket = new net.Socket({});

socket.connect({
    host: '127.0.0.1',
    port: 4000
});

let id = Math.floor(Math.random() * LESSON_IDS.length);

let oldBuffer = null;
socket.on('data', (buffer) => {
    // 把上一次data事件使用残余的buffer接上来
    if (oldBuffer) {
        buffer = Buffer.concat([oldBuffer, buffer]);
    }
    let completeLength = 0;

    // 只要还存在可以解成完整包的包长
    while (completeLength = checkComplete(buffer)) {
        const package = buffer.slice(0, completeLength);
        buffer = buffer.slice(completeLength);

        // 把这个包解成数据和seq
        const result = decode(package);
        console.log(`包${result.seq}，返回值是${result.data}`);
    }

    // 把残余的buffer记下来
    oldBuffer = buffer;
})


let seq = 0;
/**
 * 二进制包编码函数
 * 在一段rpc调用里，客户端需要经常编码rpc调用时，业务数据的请求包
 */
function encode(data) {
    // 正常情况下，这里应该是使用 protobuf 来encode一段代表业务数据的数据包
    // 为了不要混淆重点，这个例子比较简单，就直接把课程id转buffer发送
    const body = Buffer.alloc(4);
    body.writeInt32BE(LESSON_IDS[data.id]);

    // 一般来说，一个rpc调用的数据包会分为定长的包头和不定长的包体两部分
    // 包头的作用就是用来记载包的序号和包的长度，以实现全双工通信
    const header = Buffer.alloc(6);
    header.writeInt16BE(seq)
    header.writeInt32BE(body.length, 2);

    // 包头和包体拼起来发送
    const buffer = Buffer.concat([header, body])

    console.log(`包${seq}传输的课程id为${LESSON_IDS[data.id]}`);
    seq++;
    return buffer;
}

/**
 * 二进制包解码函数
 * 在一段rpc调用里，客户端需要经常解码rpc调用时，业务数据的返回包
 */
function decode(buffer) {
    const header = buffer.slice(0, 6);
    const seq = header.readInt16BE();

    const body = buffer.slice(6)

    return {
        seq,
        data: body.toString()
    }
}

/**
 * 检查一段buffer是不是一个完整的数据包。
 * 具体逻辑是：判断header的bodyLength字段，看看这段buffer是不是长于header和body的总长
 * 如果是，则返回这个包长，意味着这个请求包是完整的。
 * 如果不是，则返回0，意味着包还没接收完
 * @param {} buffer 
 */
function checkComplete(buffer) {
    if (buffer.length < 6) {
        return 0;
    }
    const bodyLength = buffer.readInt32BE(2);
    return 6 + bodyLength
}


for (let k = 0; k < 100; k++) {
    id = Math.floor(Math.random() * LESSON_IDS.length);
    socket.write(encode({ id }));
}


const LESSON_IDS = [
    "136797","136798","136799","136800","136801","136803","136804","136806","136807","136808","136809",
    "141994","143517","143557","143564","143644","146470","146569","146582"
]
```
