# 实战页面 - 详情页

## 页面架构分析

<img :src="$withBase('/node_bff_xiangqingye_jiagoutu.png')" alt="详情页架构图">

+ 首先浏览器和`Node-BFF`层建立TCP链接，然后发送详情页的`http`请求包
+ 路由拿到这个详情页的请求，会将`http`请求数据包转发到详情页的逻辑处理单元中，但是要注意：<font color=#1E90FF>每个详情页的请求会在url带有课程的id</font>，这个id在`Node-BFF`层取出来
+ 然后详情页拿到这个`id`,就把`id`发送到后台服务去，后台服务就根据这个`id`把课程的详情、目录、推荐等等数据返回给`Node-BFF`层
+ 然后详情页的处理逻辑拿到这个返回数据，就插入到模板引擎当中，然后形成了一个真正的带有数据的`html`页面，返回给浏览器（<font color=#DD1144>以上四个步骤在图中红色线条表示出来</font>）

+ 然后浏览器拿到这个页面，页面渲染才刚刚开始
+ 在静态页面当中有很多`css`或者`javascript`标签标注的文件，那么这些都属于一个个`http`链接
+ 比如某个`css`文件在当前域名下面某个文件中，那么浏览器依旧要请求到`Node-BFF`层中
+ 那么详情页的逻辑单元拿到这个请求发现这个是个静态资源的请求，那么会转发到另外一个专门处理`css`和`js`脚本的处理逻辑单元
+ 这个专门处理`css`和`js`的逻辑单元把静态文件返回给详情页的处理逻辑单元，再返回给路由，再返回给浏览器
+ 浏览器拿到这些静态`css`文件和`js`脚本文件才开始渲染（<font color=#3eaf7c>以上六步在上图由绿色直线标注</font>）

## 页面实现技术介绍
<font color=#1E90FF>**① RPC调用**</font>  

这个东西我们在前面技术预研的时候就很详细的讲解过了，这里不做过多的解释  

<font color=#1E90FF>**② 模板渲染**</font>   

+ <font color=#DD1144>include子模块</font>: 用来切分程序逻辑的一种方式，比如说中间件是用来切分`Node`程序的东西，把大的程序切分到不同的小文件去，更好的维护和实现细节功能
+ <font color=#DD1144>xss过滤、模板helper函数</font>

## ES6+vm实现模板引擎
### 1. 实现原理
首先我们举个最简单的例子：
```javascript
const vm = require('vm');
const user = {
  name: 'haha'
}

console.log(vm.runInNewContext('`<h2>${user.name}</h2>`', { user } )) // <h2>haha</h2>
```
上述例子的原理是这样的：
+ 首先`vm.runInNewContext`会把第一个参数放在一个新的沙箱中去运行，运行的实际代码是\``<h2>${user.name}</h2>`\`这样一个`JS`模板字符串，所以通过`JS`的编译和运行后，就是\``<h2>haha</h2>`\`这样一个字符串
+ 而`vm.runInNewContext`的返回结果又是第一个参数`code`中最后一条语句的返回结果，而\``<h2>haha</h2>`\`既是第一条语句也是最后一条语句，所以就会作为整个`vm.runInNewContext`的返回结果

### 2. 增加xss功能
```javascript
const vm = require('vm');
const user = {
  name: '<scipt>恶意执行代码</script>'
}
console.log(vm.runInNewContext('`<h2>${user.name}</h2>`', { user } )) // <h2><scipt>恶意执行代码</script></h2>
```
上面的代码就给我们展示了一个`xss`攻击的案例，因为我们的模板字符串没有过滤的功能，所以面对`<script/>`这样的标签会原封不动的返回，那放在真正的`html`网页中就会作为脚本执行。所以我们要做的事情就是：<font color=#DD1144>给当前沙箱环境添加一个过滤函数,将相关的字符进行转义</font>
```javascript
const vm = require('vm');
const user = {
  name: '<scipt>恶意执行代码</script>'
}

console.log(vm.runInNewContext('`<h2>${_(user.name)}</h2>`', { 
  user,
  _: function(markup) {
    if(!markup) return '';
    return String(markup)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
  } 
})) // <h2>&lt;scipt&gt;恶意执行代码&lt;/script&gt;</h2>
```
这种方式就能对这种恶意的代码进行转义，另外这种通过`ES6`的方式已经类似的实现了模板当中的`helper`函数了，所以`helper`函数我们这里也不再赘述。

### 3. include子模板
```javascript
const vm = require('vm');
const templateMap = {
  templateA: '`<h1>${include("templateB")}</h1>`',
  templateB: '`<p>hahaha</p>`'
}
// 沙箱环境
const context = {
  include: function(name) {
    return templateMap[name]()
  },
  _: function(markup) {
    if(!markup) return '';
    return String(markup)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
  } 
}
// 将字符串模板变成一个函数
Object.keys(templateMap).forEach(key => {
  const temp = templateMap[key]

  templateMap[key] = vm.runInNewContext(`
    (function() {
      return ${temp}
    })
  `,context)
})

console.log(templateMap["templateA"]()) // <h1><p>hahaha</p></h1>
```

## 详情页面的BFF层开发
虽然只有一个页面，但是流程略显复杂，为了能让同学看清楚每个文件的具体功能，先列出一张流程图，在清晰的知道流程框架再细细研究里面的代码:

<img :src="$withBase('/node_bff_xiangqingye_wenjian.png')" alt="代码流程图">

```javascript
// index.js
const mount = require('koa-mount');
const static = require('koa-static')
const app = new (require('koa'));
const rpcClient = require('./client');
const template = require('./template');

const detailTemplate = template(__dirname + '/template/index.html');

app.use(mount('/static', static(`${__dirname}/source/static/`)))

app.use(async (ctx) => {
    if (!ctx.query.columnid) {
        ctx.status = 400;
        ctx.body = 'invalid columnid，place input url like detail/?columnid=25';
        return 
    }

    const result = await new Promise((resolve, reject) => {

        rpcClient.write({
            columnid: ctx.query.columnid
        }, function (err, data) {
            err ? reject(err) : resolve(data)
        })
    })

    ctx.status = 200;
    
    ctx.body = detailTemplate(result);
})

app.listen(3000)
```
```javascript
//client.js
const EasySock = require('easy_sock');

const protobuf = require('protocol-buffers')
const fs = require('fs');
const schemas = protobuf(fs.readFileSync(`${__dirname}/detail.proto`));

const easySock = new EasySock({ 
    ip: '127.0.0.1',
    port: 4000,
    timeout: 500,  // 超时时间
    keepAlive: true // 确定为全双工通信
})

// 给服务端发送信息时候通过encode编码
easySock.encode = function(data, seq) {
    const body = schemas.ColumnRequest.encode(data);

    const head = Buffer.alloc(8);  // 8位的头
    head.writeInt32BE(seq);        // 4位的序列号
    head.writeInt32BE(body.length, 4); // 4位的body.length

    return Buffer.concat([head, body])
}

// 拿到服务端的消息要要通过decode来解码
easySock.decode = function(buffer) {
    const seq = buffer.readInt32BE(); // 前4位是序列号
    const body = schemas.ColumnResponse.decode(buffer.slice(8));
    
    return {
        result: body,
        seq
    }
}

// 用来确定一个包是不是完整的包
easySock.isReceiveComplete = function(buffer) {
    if (buffer.length < 8) {
        return 0
    }
    const bodyLength = buffer.readInt32BE(4);

    if (buffer.length >= bodyLength + 8) {
        return bodyLength + 8
        
    } else {
        return 0
    }
}

module.exports = easySock;
```
```javascript
// detail.proto
message Column {
    required int32 id = 1;
    required string column_cover = 2;
    required string column_title = 3;
    required string column_subtitle = 4;
    required string author_name = 5;
    required string author_intro = 6;
    required string column_intro = 7;
    required string column_unit = 8;
    required uint32 sub_count = 9;
    required string update_frequency = 10;
    required uint32 column_price = 11;
    optional uint32 column_price_market = 12;
    repeated Article articles = 13;
}
message Article {
    required uint32 id = 1;
    required bool is_video_preview = 2;
    required string article_title = 3;
}

message ColumnResponse {
    required Column column = 1;
    repeated Column recommendColumns = 2;
}
message ColumnRequest {
    required int32 columnid = 1;
}
```
```javascript
// template/index.js
const fs = require('fs');
const vm = require('vm');

const templateCache = {};

// 创建一个沙盒（包含沙盒功能）
const templateContext = vm.createContext({
    include: function (name, data) {
        const template = templateCache[name] || createTemplate(name)
        return template(data);
    }
});

// 返回一个能返回最终html的函数
function createTemplate(templatePath) {

    templateCache[templatePath] = vm.runInContext(
        `(function (data) {
            with (data) {
                return \`${fs.readFileSync(templatePath, 'utf-8')}\`
            }
        })`,
        templateContext
    );

    return templateCache[templatePath]
}

module.exports = createTemplate
```

## 详情页面的虚拟后台开发
```javascript
// detail.js
const fs = require('fs')
const protobuf = require('protocol-buffers');
const schemas = protobuf(
    fs.readFileSync(`${__dirname}/../2.detail/detail.proto`)
);

// 假数据
const columnData = require('./mockdata/column')

/**
 * 服务端的编解包逻辑
 */
const server = require('./lib/geeknode-rpc-server')(schemas.ColumnRequest, schemas.ColumnResponse);

server.createServer((request, response) => {
        // 因为都是假数据，这里就没有使用栏目id。真实项目会拿这个columnid去请求数据库
        const columnid = request.body;

        // 直接返回假数据
        response.end({
            column: columnData[0],
            recommendColumns: [columnData[1], columnData[2]]
        });
    })
    .listen(4000, ()=> {
        console.log('rpc server listened: 4000')
    });
```
```javascript
// geeknode-rpc-server.js
const RPC = require('./rpc-server');

/**
 * 因为所有服务用的包头格式都一样，不一样的只有protobuf协议，所以这里可以将这段逻辑封成一个模块
 * 
 * 日常做项目的时候一定要注意把重复代码做封装
 */
module.exports = function (protobufRequestSchema, protobufResponseSchema) {
    return new RPC({
        // 解码请求包
        decodeRequest(buffer) {
            const seq = buffer.readUInt32BE();

            return {
                seq: seq,
                result: protobufRequestSchema.decode(buffer.slice(8))
            }
        },
        // 判断请求包是不是接收完成
        isCompleteRequest(buffer) {
            const bodyLength = buffer.readUInt32BE(4);

            return 8 + bodyLength
        },
        // 编码返回包
        encodeResponse(data, seq) {
            const body = protobufResponseSchema.encode(data);

            const head = Buffer.alloc(8);
            head.writeUInt32BE(seq);
            head.writeUInt32BE(body.length, 4);

            return Buffer.concat([head, body]);
        }
    })
}
```
```javascript
// rpc-server.js
// 'use strict';
// const debug = require("debug")('easysock-server');
const net = require("net");

module.exports = class RPC {
    constructor({ encodeResponse, decodeRequest, isCompleteRequest }) {
        this.encodeResponse = encodeResponse;
        this.decodeRequest = decodeRequest;
        this.isCompleteRequest = isCompleteRequest;
    }

    createServer(callback) {
        let buffer = null;

        const tcpServer = net.createServer((socket) => {

            socket.on('data', (data) => {
                buffer = (buffer && buffer.length > 0) ?
                    Buffer.concat([buffer, data]) : // 有遗留数据才做拼接操作
                    data;

                let checkLength = null;
                while (buffer && (checkLength = this.isCompleteRequest(buffer))) {
                    let requestBuffer = null;
                    if (checkLength == buffer.length) {
                        requestBuffer = buffer;
                        buffer = null;

                    } else {
                        requestBuffer = buffer.slice(0, checkLength);
                        buffer = buffer.slice(checkLength);
                    }

                    const request = this.decodeRequest(requestBuffer);
                    callback(
                        { // request
                            body: request.result,
                            socket
                        },
                        { // response
                            end: (data) => {
                                const buffer = this.encodeResponse(data, request.seq)
                                socket.write(buffer);
                            }
                        }
                    );
                }
            })
        });

        return {
            listen() {
                tcpServer.listen.apply(tcpServer, arguments)
            }
        }
    }
}
```
