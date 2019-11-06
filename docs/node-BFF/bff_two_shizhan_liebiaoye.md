# 实战页面 - 列表页

## 页面架构分析

<img :src="$withBase('/node_bff_liebiaoye_jiagoutu.png')" alt="播放页架构图">

这里我们首先要讲解一个重要的概念：<font color=#DD1144>前后端同构</font>

比如在一个页面当中，有很多不同的`tab`，然后每个`tab`下面都是一个列表，那么我们除了在首个`tab`的展示列表当中使用服务端渲染，进入前端后，我们点击其他的`tab`也要列表的渲染，所以前端后端要使用同一个模板来进行渲染。所以我们总结一下前后端同构中两者的职责所在：
+ <font color=#DD1144>后端需要渲染列表</font> 
  + <font color=#1E90FF>首屏加速</font>
  + <font color=#1E90FF>SEO</font>
+ <font color=#DD1144>前端也需要渲染列表</font>
  + <font color=#1E90FF>无刷新过滤</font>
+ <font color=#DD1144>前后端同构</font>
  + <font color=#1E90FF>同一个模板/组件，可以浏览器渲染，也可以在Node.js中渲染</font>

## 前后端同构(概念)
### 1. SPA的问题
我们所知的传统型`SPA`，单页面应用，贴近用户端越近，交互越复杂，它的弊端就越明显，在我们享受`JavaScirpt`给我们带来的无刷新体验和组件化带来的开发效率的同时，<font color=#DD1144>白屏</font>这个随着 SPA 各种优点随之而来的缺点被遗忘，我们拥有菊花方案在`JavaScript`没有将`DOM`构建好之前蒙层，拥有白屏监控方案将真实用户数据上报改进，但并没有触碰到白屏问题的本质，那就是<font color=#DD1144>DOM 的构建者是 JavaScript，而非原生的浏览器</font>。
```html
<html>
  <head><title /></head>
  <body>
  	<div id="root"></div>
    <script src="render.js"></script>
  </body>
</html>
```
复制代码如上代码，在`SPA`架构中，服务器端直接给出形如这样的`HTML`，浏览器在渲染`body#root`这个节点完成之后，页面的绘制区域其实还是空的，直到`render.js`构建好真实的`DOM`结构之后再`append`到`#root`上去。此时，首屏展示出来时，必然是`render.js`通过网络请求完毕，然后加上 `JavaScript`执行完成之后的。

### 2. 问题的解决
在直出的服务器渲染中，浏览器直接拿到最终的`HTML`，浏览器通过解析`HTML`之后将`DOM`元素生成而进行渲染。所以相比于`SPA`，服务器端渲染从直观上看：
+ <font color=#CC99CD>转化 HTML 到 DOM，浏览器原生会比 JavaScript 生成 DOM 的时间短</font> 
+ <font color=#CC99CD>省去了 SPA 中 JavaScript 的请求与编译时间</font>

<font color=#1E90FF>**① 思路的诞生**</font>

那么思路就来了：<font color=#DD1144>设想一种方案，它拥有 SPA 的大部分优点，却解决了它大部分的缺点，那就是服务器端输出 HTML，然后由客户端复用该 HTML，继续 SPA 模式，这样岂不是既解决了白屏和 SEO 问题，又继承了无刷新的用户体验和开发的组件化嘛。</font>

<font color=#1E90FF>**② 思路的初探**</font>

<font color=#1E90FF>如果这样的话，就会有个一致性的问题。我们必须在浏览器端复用服务器端输出的 HTML 才能避免多套代码的适配，而传统的模板渲染是可行的，只要选择一套同时支持浏览器和 Node.js 的模板引擎就能搞定。我们写好模板， 在 Node.js 准备好数据，然后将数据灌入模板产出 HTML，输出到浏览器之后由客户端 JavaScript 承载交互，搞定</font>

<font color=#1E90FF>**② 思路的践行**</font>

思路到了这里，我们就会发现， <font color=#DD1144>模板</font>其实是一种抽象层，虽然底层的`HTML`只能跑在浏览器端，但是顶层的模板却能通过模板引擎同时跑在浏览器和服务器端，此为垂直方向，在水平方向上，模板将数据和结构解耦，将数据灌入结构，这种灌入，实际是一锤子买卖，管生不管养。

随着时间的推进，组件化的大潮来了，其核心概念`Virtual DOM`依其声明式和高性能让前端开发者大呼爽爽爽，但究其本质，就是为了解决频繁操作 DOM 而在 HTML 之上做的一层抽象，与模板不同的是，它将数据与结构产生交互，有代表的要数`Facebook` 方使用的单项数据流和`Vue`方使用的`MVVM`数据流，大道至简，我们观察函数`UI = F(data)`, 其中`UI`为最终产出前端界面，`data`为数据，`F` 则为模板结构或者`Virtual DOM`，模板的方式是`F`只执行一遍，而组件方式则为每次`data`改变都会再执行一遍。

所以理论上，无论是模板方式还是组件方式，前后端同构的方案都呼之欲出，<font color=#DD1144>我们在Node.js端获取数据 ，执行F函数，得到HTML输出给浏览器，浏览器JavaScript复用HTML，继续执行F函数，等到数据变化，继续执行F函数，交互也得到解决</font>，完美~~~

## 前后端同构(实践)
+ <font color=#1E90FF>ReactDomServer.renderToString()</font>
+ <font color=#1E90FF>VueServerRenderer.renderToString()</font>

```javascript
// index.js
require('@babel/register')({
  presets: ['@babel/preset-react']
})
const ReactDOMServer = require('react-dom/server');

const result = ReactDOMServer.renderToString(
  require('./index.jsx')
)

console.log(result) // <p data-reactroot="">hello world</p>
```
```javascript
// index.jsx
const React = require('react')

class App extends React.Component {
  render(){
    return (
      <p>hello world</p>
    )
  }
}
module.exports = <App />
```
那么通过这样简单的演示，我们就能明白，只要在`koa`项目当中把`ReactDOMServer.renderToString`返回的字符串作为`ctx.body`的值返回给客户端，那么服务端渲染就算完成了，但是在实际项目当中，我们都知道，单纯的`SPA`的项目关于数据的问题会数据放在`Rudex`或者`Vue-store`当中，因为页面存在大量复杂的交互和有状态的数据，并且数据和页面之间有很强的关联的时候，我们就会用到`react`或者`Vue`这样的库。

但是对于服务端，也会用到类似于`Rudex`或者`Vue-store`这样的功能，因为服务端需要数据的其中一种状态，就是初始状态。只需要渲染初始状态即可。但是如果你在服务端使用`Rudex`或者`Vue-store`执行了一下只能在前端使用的代码，或者只有浏览器才能识别的代码，就有问题了。

所以<font color=#DD1144>React/Vue同构的最大难题其实是数据部分</font>

解决问题现在也有了成熟的方法，比如`React`的服务端渲染框架`Next`还有`Vue`的服务端渲染的框架

当然我们还是要注意：无论我们使用框架也好，自己写也好，处理前后端同构的最大的关键点就是<font color=#DD1144>注重职责的分离</font>，你要很请清楚的知道你写的代码到底哪些是用来<font color=#DD1144>处理数据的</font>，哪些是用来<font color=#DD1144>处理环境的</font>，<font color=#DD1144>必须要将这两种代码做好分割</font>

## 列表页面的BFF层开发
按照惯例我们还是要把代码的流程图展示一下，搞清楚请求的整个流程走向，就能搞清楚设计和架构的思路
<img :src="$withBase('/node_bff_liebiaoye_liuchengtu.png')" alt="列表页流程图">

+ 当我们请求`localhost:3000`，按照红色的路线一直到后台拿到数据，然后通过`node/app.jsx`这个文件抽离出同构模板，然后特别注意，这个文件中只给了同构模板首屏渲染的初始数据，并没有给任何交互方法，然后通过`react`的`ReactDOMServer.renderToString`方法把这个有数据的同构模板转化为字符串放在`index.html`文件中
+ 因为前端拿到页面会有各种点击交互事件，所以在同时将各种交互方法的函数传入同构模板中，然后打包成为`main.js`放在`index.html`的最后。
+ 最重要的部分来了：<font color=#DD1144>浏览器拿到html文件开始渲染，渲染到${reactString}的时候，是有东西的，因为这部分实体的DOM是同构后端请求数据，生成字符串，在这里拼接好的</font>
+ <font color=#DD1144>但是渲染到&lt;script src="main.js"&gt;&lt;/script&gt;的时候，这个js文件将${reactString}那部分重新换了一遍，或者重新渲染了一遍，这个时候${reactSting}这里就是可以交互的DOM,因为是main.js将交互方法渲染了进去</font>，所以这里${reactSting}实际上经历了两次变换，这样是为了让用户更快的看到内容，否则如果这里的页面复杂，都通过js来渲染，那么用户会看到白屏而且很有可能要等待很长时间。
+ 在点击交互按钮后，沿着<font color=#3eaf7c>绿线</font>向后台请求`json`，然后`main.json`拿到`json`又重新将${reactSting}那里的东西重新渲染。

```javascript
// node/index.js
const app = new (require('koa'));
const mount = require('koa-mount');
const static = require('koa-static');
const getData = require('./get-data')
const ReactDOMServer = require('react-dom/server');
require('babel-register')({
    presets: ['react']
});
const App = require('./app.jsx')
// react通常只会渲染一个div，html文本当中不可能所有的东西都用它来做
const template = require('./template')(__dirname + '/index.htm')
app.use(mount('/static', static(__dirname + '/source')))

app.use(mount('/data', async (ctx) => {
    ctx.body = await getData(+(ctx.query.sort || 0), +(ctx.query.filt || 0));
}));
app.use(async (ctx) => {
    ctx.status = 200;
    const filtType = +(ctx.query.filt || 0)
    const sortType = +(ctx.query.sort || 0);
    const reactData = await getData(sortType, filtType);
    // console.log(ReactDOMServer.renderToString(ReactRoot)); 
    ctx.body = template({
        reactString: ReactDOMServer.renderToString(
            App(reactData)
        ),
        reactData,
        filtType,
        sortType
    })
})
// app.listen(3000)
module.exports = app;
```
```javascript
// get-data.js
const listClient = require('./list-client');
module.exports = async function (sortType = 0, filtType = 0) {
    // 使用微服务拉取数据
    const data = await new Promise((resolve, reject) => {
        listClient.write({
            sortType,
            filtType

        }, function (err, res) {
            err ? reject(err) : resolve(res.columns);
        })
    });
    return data
}
```
```javascript
// node/app.jsx
const React = require('react')
const Container = require('../component/container')

// filt和sort是给前端使用的，所有就传空,因为是后端渲染出来的无交互页面，所以传空
module.exports = function (reactData) {
    return <Container
        columns={reactData}
        filt={() => { }}
        sort={() => { }}
    />
}
```
```javascript
// component/container.jsx
const React = require('react');
const ColumnItem = require('./column_item.jsx')

module.exports = class Container extends React.Component {

    render() {
        return (
            <div className="_2lx4a-CP_0">
                <div className="_3KjZQbwk_0">
                    <div className="kcMABq6U_0">
                        <span>课程：</span>
                        <a className="_2TWCBjxa_0" onClick={this.props.filt.bind(this, 0)}>全部</a>
                        <a className="_2TWCBjxa_0" onClick={this.props.filt.bind(this, 1)}>专栏</a>
                        <a className="_2TWCBjxa_0" onClick={this.props.filt.bind(this, 2)}>视频课程</a>
                        <a className="_2TWCBjxa_0" onClick={this.props.filt.bind(this, 3)}>微课</a>
                    </div>
                </div>
                <div className="_3hVBef3W_0">
                    <div className="_3S9KmBtG_0">
                        <div className="_1o6EOwiF_0">
                            <div className="_3HUryTHs_0">
                                <a className="_1kRLIDSR_0" onClick={this.props.sort.bind(this, 1)}>上新</a>
                                <a className="_1kRLIDSR_0" onClick={this.props.sort.bind(this, 2)}>订阅数</a>
                                <a className="_1kRLIDSR_0" onClick={this.props.sort.bind(this, 3)}>价格
                                    <span className="_1Yk9PA11_0">
                                        <i className="iconfont _2jewjGCJ_0"></i> <i className="iconfont _38FM8KCt_0"></i>
                                    </span>
                                </a>
                            </div>
                            <span className="JfgzzksA_0">{this.props.columns.length}个课程</span>
                        </div>
                        <div>
                            {this.props.columns.map(column => {
                                return (
                                    <ColumnItem column={column} key={column.id} />
                                )
                            })}
                        </div>
                        <div className="OjL5wNoM_0"><span>— 没有更多了 —</span></div>
                    </div>
                </div>
            </div>
        )
    }
}

```
```javascript
// browser/index.jsx
const Container = require('../component/container.jsx');
const React = require('react');
const ReactDOM = require('react-dom');

class App extends React.Component {

    constructor() {
        super();
        this.state = {
            columns: reactInitData,
            filtType: reactInitFiltType,
            sortType: reactInitSortType
        }
    }

    render() {
        return (
            <Container
                columns={this.state.columns}
                filt={(filtType) => {
                    fetch(`./data?sort=${this.state.sortType}&filt=${filtType}`)
                        .then(res => res.json())
                        .then(json => {
                            this.setState({
                                columns: json,
                                filtType: filtType
                            })
                        })
                }}
                sort={(sortType) => {
                    fetch(`./data?sort=${sortType}&filt=${this.state.filtType}`)
                        .then(res => res.json())
                        .then(json => {
                            this.setState({
                                columns: json,
                                sortType: sortType
                            })
                        })
                }}
            />
        )
    }
}
ReactDOM.render(
    <App />,
    document.getElementById('reactapp')
)

```
## 列表页面的虚拟后台开发
```javascript
const fs = require('fs')
const protobuf = require('protocol-buffers');
const schemas = protobuf(
    fs.readFileSync(`${__dirname}/../4.list/node/list.proto`)
);
// 假数据
const columnData = require('./mockdata/column')
/**
 * 服务端的编解包逻辑
 */
const server = require('./lib/geeknode-rpc-server')(schemas.ListRequest, schemas.ListResponse);

server
    .createServer((request, response) => {
        const { sortType, filtType } = request.body;
        // 直接返回假数据
        response.end({
            columns: columnData
                .sort((a, b) => {
                    if (sortType == 1) {
                        return a.id - b.id
                    } else if (sortType == 2) {
                        return a.sub_count - b.sub_count
                    } else if (sortType == 3) {
                        return a.column_price - b.column_price
                    }
                })
                .filter((item) => {
                    if (filtType == 0) {
                        return item
                    } else {
                        return item.type == filtType
                    }
                })
        });
    })
    .listen(4003, () => {
        console.log('rpc server listened: 4003')
    });
```


**参考资料**

1. [前端同构渲染的思考与实践](https://juejin.im/post/5c821dc45188257e1f2915b1)