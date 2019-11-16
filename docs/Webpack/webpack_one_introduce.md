# Webpack是什么

## Webpack的出现
以前我们写一个网页，是最简单的一个`html`文件中加载一个`js`文件，后来随着业务的复杂和页面的逻辑复杂，我们将一个`js`文件拆分，按照面向对象的写法进行改造，如下：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>这是最原始的网页开发</title>
</head>
<body>
  <p>这是我们的网页内容</p>
  <div id='root'></div>
  <script src="./header.js"></script>
  <script src="./sidebar.js"></script>
  <script src="./content.js"></script>
  <script src="./index.js"></script>
</body>
</html>
```
```javascript
// index.js
var dom = document.getElementById('root')

new Header()
new Sidebar()
new Content()
```
```javascript
// header.js
function Header() {
  var header = document.createElement('div')
  header.innerText = 'header'
  dom.append(header)
}
```
```javascript
// content.js
function Content() {
  var content = document.createElement('div')
  content.innerText = 'content'
  dom.append(content)
}
```
```javascript
// sidebar.js
function Sidebar() {
  var sidebar = document.createElement('div')
  sidebar.innerText = 'sidebar'
  dom.append(sidebar)
}
```
可是这样写代码有几个问题：
+ <font color=#1E90FF>html文件中引入多个js文件会导致产生多个http请求，性能下降</font>
+ <font color=#1E90FF>从index.js中无法找出不同类和相应文件的对应关系</font>
+ <font color=#1E90FF>错误难以排查，比如js文件引入顺序的错误，导致项目难以维护</font>

所以我们希望依旧在`index.html`当中只引入一个`index.js`文件，但是`index.js`我们希望这样来书写：
```javascript
// ES Module
import Header from './header.js'
import Sidebar from './sidebar.js'
import Content from './content.js'

var dom = document.getElementById('root')
new Header()
new Sidebar()
new Content()
```
现在的问题是，虽然我们使用了`ES6`的模块导出导入方式，但是浏览器并不认识这种语句和写法，我们希望有一个工具能够识别这样的方式，这样我们的代码就不会存在上述的问题了，此时此刻，`Webpack`才正式出场。

我们首先来改动一下代码，然后通过`Webpack`来打包我们的`index.js`，然后在`index.html`当中引入打包后的js文件，就可以达到我们的目的：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>这是最原始的网页开发</title>
</head>
<body>
  <p>这是我们的网页内容</p>
  <div id='root'></div>
  <script src="./dist/main.js"></script>
</body>
</html>
```
```javascript
// index.js
import Header from './header.js'
import Sidebar from './sidebar.js'
import Content from './content.js'

new Header()
new Sidebar()
new Content()

```
```javascript
// content.js
function Content() {
  var dom = document.getElementById('root')
  var content = document.createElement('div')
  content.innerText = 'content'
  dom.append(content)
}

export default Content
```
```javascript
// header.js
function Header() {
  var dom = document.getElementById('root')
  var header = document.createElement('div')
  header.innerText = 'header'
  dom.append(header)
}

export default Header
```
```javascript
// sidebar.js
function Sidebar() {
  var dom = document.getElementById('root')
  var sidebar = document.createElement('div')
  sidebar.innerText = 'sidebar'
  dom.append(sidebar)
}

export default Sidebar
```
然后在目录下面执行下面的命令：
+ <font color=#3eaf7c>npm init -y</font>
+ <font color=#3eaf7c>npm install webpack-cli --save-dev</font>
+ <font color=#3eaf7c>npm install webpack --save</font>
+ <font color=#3eaf7c>npx webpack index.js</font>

然后就会打包`index.js`到`dist/main.js`文件当中，通过浏览器打开`index.html`就能看到正常的效果了。所以这里我们就先可以理解到：<font color=#DD1144>Webpack就像是一个js的翻译器</font>

## 模块打包工具
<font color=#1E90FF>**① 模块规范**</font>

虽然经过上面的初探我们可能觉的`webpack`就是个`js`翻译器，但是实际上`webpack`是一个：<font color=#DD1144>模块打包工具</font>,<font color=#1E90FF>不仅如此，而且webpack对于其他的模块规范一样适用，例如CommonJS、AMD.CMD等等</font>

<font color=#1E90FF>**② 打包对象**</font>

在过去呢，`webpack`只是一个`javascript`打包工具，发展到现在，<font color=#DD1144>webpack已经能打包任何模块的文件</font>，包含`css`,各种类型的图片。

**参考资料**

1. [https://webpack.js.org/concepts/modules/](https://webpack.js.org/concepts/modules/)
2. [https://webpack.js.org/api/module-methods/](https://webpack.js.org/api/module-methods/)
3. [https://webpack.js.org/api/module-variables/](https://webpack.js.org/api/module-variables/)

