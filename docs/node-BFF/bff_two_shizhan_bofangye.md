# 实战页面 - 播放页

## 页面架构分析

<img :src="$withBase('/node_bff_bofangye_jiagoutu.png')" alt="播放页架构图"> 

+ 首先浏览器和`Node-BFF`层建立TCP链接，然后发送播放页的`http`请求包
+ 路由拿到这个播放页的请求，会将`http`请求数据包转发到播放页的逻辑处理单元中，
+ 然后播放页拿到这个`id`,就把`id`发送到后台服务去，后台服务就根据这个`id`把课程的目录、评论等等数据返回给`Node-BFF`层
+ 然后播放页的处理逻辑拿到这个返回数据，就插入到模板引擎当中，然后形成了一个真正的带有数据的`html`页面，返回给浏览器（<font color=#DD1144>以上四个步骤在图中红色线条表示出来</font>）

+ 然后浏览器拿到这个页面，页面渲染才刚刚开始
+ 在静态页面当中有很多`css`或者`javascript`标签标注的文件，那么这些都属于一个个`http`链接
+ 比如某个`css`文件在当前域名下面某个文件中，那么浏览器依旧要请求到`Node-BFF`层中
+ 那么详情页的逻辑单元拿到这个请求发现这个是个静态资源的请求，那么会转发到另外一个专门处理`css`和`js`脚本的处理逻辑单元
+ 这个专门处理`css`和`js`的逻辑单元把静态文件返回给详情页的处理逻辑单元，再返回给路由，再返回给浏览器
+ 浏览器拿到这些静态`css`文件和`js`脚本文件才开始渲染（<font color=#3eaf7c>以上六步在上图由绿色直线标注</font>）

+ 其中点赞的功能是浏览器在页面上点击按钮，然后给`node-bff`层发送一个`ajax`请求，然后我们要做的就是写一个在`node-bff`层提供一个`http api`（<font color=#6A5ACD>这个步骤在上图由紫色直线标注</font>）

现在书写`api`有两种方法，一种是`rest`，一种是`graphQL`,那么我们来分析一下两者

## rest和graphQL
### 1.RESTful

构建`RESTful`风格的API的基本逻辑就是通过请求的`url`和`method`的不同，表示请求不同的资源，然后服务端通过不同的路由分发到不同的处理逻辑单元当中。它有以下特点：
+ <font color=#CC99CD>简单易懂</font>
+ <font color=#CC99CD>可以快速搭建</font>
+ <font color=#CC99CD>在数据的聚合方面有很大的劣势</font>

我们现在讨论一下为什么`RESTful`风格的API在数据聚合方面劣势很大，
+ 比如要收集一些资源然后做一些整合，对于`RESTful`来说基本上每个资源对应的就是一个`http`请求，那就要发起很多的`http`请求，很麻烦
+ 另外我们想获取某个具体的日期信息，这个日期信息是包含在某个接口返回的一大堆数据中的，对于这一大堆的数据其他的信息就没有用，这就造成很多的<font color=#DD1144>带宽浪费和服务器的成本</font>

### 2. graphQL
关于`graphQL`口号就是想要什么数据就能得到什么数据，不会产生冗余，我们通常把`RESTful`比喻成只能点套餐的餐厅，套餐中有很多菜，但并不是每个菜都是你所想吃的，而`graphQL`就是一个正常的餐厅，点什么才就来什么菜，不会造成浪费。

当然，`graphQL`最大的卖点就是：<font color=#DD1144>让前端有’自定义查询‘数据的能力</font>
```javascript
// index.js
var { graphql, buildSchema } = require('graphql');
// 定义数据结构。类似于protobuffer，相当于数据协议
var schema = buildSchema(`  
  type Query {
    hello: String
  }
`);

var root = { hello: () => 'Hello world!' };

// 在schema这个协议当中，我要查询query这个字段，查询数据源为root
module.exports = function (query) {
  graphql(schema, query, root).then((response) => {
    return response
  });
}
```
```javascript
// request.js
const query = require('./index')

query('{ hello }').then(res => {
  console.log(res)
})
```
上面这两段代码是对官网给出的入门的代码的一种改造，因为这样比较好理解，能清晰的看出前端和后端分别做的事情，前端就是在请求的时候发送`'{ hello }'`这样的请求参数，`node_bff`层持有`schema`和`root`,然后将查询的结果返回给前端即可。既然这么简单，社区肯定有了现成的第三包来提供我们使用：
```javascript
// index.js
const Koa = require('koa');
const mount = require('koa-mount');
const graphqlHTTP = require('koa-graphql');
const schema = require('./schema')

const app = new Koa()

app.use(
  graphqlHTTP({
    schema
  })
)

app.listen(3000)
```
```javascript
// schema.js
var { graphql, buildSchema } = require('graphql');

// Comment就是一个评论的数据结构，Query就相当于protobuffer中的请求包，请求comment这个字段就能拿到一系列的评论消息
const schema = buildSchema(`
  type Comment {
    id: Int
    avatar: String
    name: String
    isTop: Boolean
    content: String
    publishDate: String
    commentNum: Int
    praiseNum: Int
  }
  type Query {
    comment: [Comment]
  }
`)
// 查询的方法
schema.getQueryType().getFields().comment.resolve = () =>{
  // 真正的项目当中的data是从数据库中取出来的
  const data = [{
      id: 1,
      avatar: 'https://static001.geekbang.org/account/avatar/00/0f/52/62/1b3ebed5.jpg',
      name: '僵尸浩',
      isTop: true,
      content: '哈哈哈哈',
      publishDate: '今天',
      commentNum: 10,
      praiseNum: 5
  },
  {
      id: 2,
      avatar: 'https://static001.geekbang.org/account/avatar/00/0f/52/62/1b3ebed5.jpg',
      name: '极客主编',
      isTop: true,
      content: '我来送大礼了！！',
      publishDate: '上周',
      commentNum: 10,
      praiseNum: 2
  },
  {
      id: 3,
      avatar: 'https://static001.geekbang.org/account/avatar/00/0f/52/62/1b3ebed5.jpg',
      name: '极客老板',
      isTop: true,
      content: '我来发股票了！！！',
      publishDate: '十年前',
      commentNum: 10,
      praiseNum: 0
  }]
  return data
}

module.exports = schema
```
然后我们启动3000端口，请求`http://localhost:3000/?query={comment{name,content}}`，返回的数据如下，基本上实现了数据挑选和过滤的功能
```javascript
{
  "data":{
    "comment":[{
        "name":"僵尸浩",
        "content":"哈哈哈哈"
      },{
        "name":"极客主编",
        "content":"我来送大礼了！！"
      },{
        "name":"极客老板",
        "content":"我来发股票了！！！"
      }
    ]
  }
}
```

## 播放页面的BFF层开发
和之前一样，为了虽然只有一个页面，但是实现的功能和流程很复杂，我们还是来画一个流程图来方便大家理解：

<img :src="$withBase('/node_bff_bofangye_liucheng.png')" alt="播放页流程图">

```javascript
// index.js
const fs = require('fs');
const app = new (require('koa'));
const mount = require('koa-mount');
const static = require('koa-static');
const graphqlHTTP = require('koa-graphql');

// 给koa-graphql传一个graphql的协议文件，就会自动帮你生成graphql-api
app.use(mount('/api', graphqlHTTP({
    schema: require('./schema')
  }))
)
app.use(mount('/static', static(`${__dirname}/source/static`)))

app.use(mount('/', async (ctx) => {
    ctx.status = 200;
    ctx.body = fs.readFileSync(`${__dirname}/source/index.htm`, 'utf-8'
}))

module.exports = app;
```
```javascript
// schema.js
/**
 * graphql协议
 */
const { buildSchema } = require('graphql');
const fs = require('fs');

/**
 * 使用 buildSchema 方法，把一个文本格式的 graphql 协议转换成GraphqlSchema 实例,很像 protocol-buffers 编译.proto文件的过程
 */
const schema = buildSchema(fs.readFileSync(__dirname + '/schema/comment.gql', 'utf-8'));
/**
 * 一个后台服务（可以理解为微服务）使用一个端口，所以对应前端也需要一个服务一个rpcclient
 */
const commentClient = require('./rpc-client/comment-client');
const praiseClient = require('./rpc-client/praise-client');

/**
 * 定义这个 graphql 协议获取数据的过程
 * 
 * 在视频课程中，这里用的是同步获取的假数据。
 * 现在这里换成 RPC调用 换回来的数据了
 */
schema.getQueryType().getFields().comment.resolve = () => {
    return new Promise((resolve, reject) => {
        commentClient.write({
            columnid: 0
        }, function (err, res) {
            err ? reject(err) : resolve(res.comments)
        })
    })
}
schema.getMutationType().getFields().praise.resolve = (args0, { id }) => {
    return new Promise((resolve, reject) => {
        praiseClient.write({
            commentid: id
        }, function (err, res) {
            err ? reject(err) : resolve(res.praiseNum)
        })
    })
}

module.exports = schema
```
```javascript
// comment-client.js
const EasySock = require('easy_sock');

const protobuf = require('protocol-buffers')
const fs = require('fs');
const schemas = protobuf(fs.readFileSync(`${__dirname}/../schema/comment.proto`));

const easySock = new EasySock({ 
    ip: '127.0.0.1',
    port: 4001,
    timeout: 500,
    keepAlive: true
})

easySock.encode = function(data, seq) {
    const body = schemas.CommentListRequest.encode(data);
    const head = Buffer.alloc(8);
    head.writeInt32BE(seq);
    head.writeInt32BE(body.length, 4);
    return Buffer.concat([head, body])
}
easySock.decode = function(buffer) {
    const seq = buffer.readInt32BE();
    const body = schemas.CommentListResponse.decode(buffer.slice(8));
    return {
        result: body,
        seq
    }
}
easySock.isReceiveComplete = function(buffer) {
    if (buffer.length < 8) { return 0}
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
// praise-client.js
const EasySock = require('easy_sock');

const protobuf = require('protocol-buffers')
const fs = require('fs');
const schemas = protobuf(fs.readFileSync(`${__dirname}/../schema/comment.proto`));

const easySock = new EasySock({ 
    ip: '127.0.0.1',
    port: 4002,
    timeout: 500,
    keepAlive: true
})

easySock.encode = function(data, seq) {
    const body = schemas.PraiseRequest.encode(data);
    const head = Buffer.alloc(8);
    head.writeInt32BE(seq);
    head.writeInt32BE(body.length, 4);
    return Buffer.concat([head, body])
}
easySock.decode = function(buffer) {
    const seq = buffer.readInt32BE();
    const body = schemas.PraiseResponse.decode(buffer.slice(8));
    return {
        result: body,
        seq
    }
}
easySock.isReceiveComplete = function(buffer) {
    if (buffer.length < 8) { return 0 }
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
// schema/comment.gql
type Comment {
    id: Int
    avatar: String
    name: String
    isTop: Boolean
    content: String
    publishDate: String
    commentNum: Int
    praiseNum: Int
}

type Query {
    comment: [Comment]
}

type Mutation {
    praise(id: Int): Int
}
```
```javascript
// schema/comment.proto
message Comment {
    required int32 id = 1;
    required string avatar = 2;
    required string name = 3;
    required bool isTop = 4;
    required string content = 5;
    required string publishDate = 6;
    required int32 commentNum = 7;
    required int32 praiseNum = 8;
}

message CommentListResponse {
    repeated Comment comments = 1;
}
message CommentListRequest {
    repeated int32 columnid = 1;
}

message PraiseRequest {
    required int32 commentid = 1;
}
message PraiseResponse {
    required int32 commentid = 1;
    required int32 praiseNum = 2;
}
```

## 播放页面的虚拟后台开发
```javascript
// comment-list.js
const fs = require('fs')
const protobuf = require('protocol-buffers');
const commentSchemas = protobuf(
    fs.readFileSync(`${__dirname}/../3.play/schema/comment.proto`)
);

// 假数据
const commentData = require('./mockdata/comment');

/**
 * 服务端的编解包逻辑
 */
const server = require('./lib/geeknode-rpc-server')(commentSchemas.CommentListRequest, commentSchemas.CommentListResponse);

server.createServer((request, response) => {
  response.end({ comments: commentData });
})
.listen(4001, ()=> {
  console.log('rpc server listened: 4001')
});
```
```javascript
// comment-praise.js
const fs = require('fs')
const protobuf = require('protocol-buffers');
const commentSchemas = protobuf(
    fs.readFileSync(`${__dirname}/../3.play/schema/comment.proto`)
);

// 假数据
const commentData = require('./mockdata/comment');

/**
 * 服务端的编解包逻辑
 */
const server = require('./lib/geeknode-rpc-server')(commentSchemas.PraiseRequest, commentSchemas.PraiseResponse);

server.createServer((request, response) => {
  const commentid = request.body.commentid;
  const comment = commentData.filter(comment => comment.id == commentid)[0];
  let praiseNum = 0;

  if (comment) {
      comment.praiseNum++;
      praiseNum = comment.praiseNum;
  }
  response.end({
      commentid,
      praiseNum
  });
})
.listen(4002, ()=> {
    console.log('rpc server listened: 4002')
});
```
关于`rpc-server.js`和`geeknode-rpc-server.js`我们已经在前面一节的代码中演示