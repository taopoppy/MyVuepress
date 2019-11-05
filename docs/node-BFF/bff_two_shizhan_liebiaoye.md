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

## 列表页面的虚拟后台开发

**参考资料**

1. [前端同构渲染的思考与实践](https://juejin.im/post/5c821dc45188257e1f2915b1)