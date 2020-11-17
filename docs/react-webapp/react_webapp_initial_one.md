# 初始化项目

## create-react-app 脚手架初始
首先保证全局有最新的`create-react-app`：
```javascript
npm install create-react-app
```
在命令行中输入以下命令:
```javascript
create-react-app cloud-music
```

完成后，根据提示：
```javascript
cd cloud-music
```

启动项目:
```javascript
npm start
```

## 修改项目目录
```javascript
├─api                   // 网路请求代码、工具类函数和相关配置
├─application           // 项目核心功能
├─assets                // 字体配置及全局样式
├─baseUI                // 基础 UI 轮子
├─components            // 可复用的 UI 组件
├─routes                // 路由配置文件
└─store                 // redux 相关文件
  App.js                // 根组件
  index.js              // 入口文件
  serviceWorker.js      // PWA 离线应用配置
  style.js              // 默认样式
```
其余其他无用的文件和代码删掉即可

## 默认样式和字体准备
项目的样式采用`styled-components`来进行开发，也就是利用`css in js`的方式，因为`React`推荐的是<font color=#9400D3>all in js</font>的设计理念。关于`styled-components`可以参照这篇[文章](https://juejin.im/post/6844903878580764686)进行了解

### 1. 安装styled-components
```javascript
npm install styled-components --save
```
为了让我们通过`styled-components`书写的`css`能够在`vscode`上显示的更好，我们可以在`vscode`上安装插件`vscode-styled-components`

### 2. 全局样式
在`src/style.js`当中添加下面的全局样式代码：
```javascript
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
	html, body, div, span, applet, object, iframe,
	h1, h2, h3, h4, h5, h6, p, blockquote, pre,
	a, abbr, acronym, address, big, cite, code,
	del, dfn, em, img, ins, kbd, q, s, samp,
	small, strike, strong, sub, sup, tt, var,
	b, u, i, center,
	dl, dt, dd, ol, ul, li,
	fieldset, form, label, legend,
	table, caption, tbody, tfoot, thead, tr, th, td,
	article, aside, canvas, details, embed,
	figure, figcaption, footer, header, hgroup,
	menu, nav, output, ruby, section, summary,
	time, mark, audio, video {
		margin: 0;
		padding: 0;
		border: 0;
		font-size: 100%;
		font: inherit;
		vertical-align: baseline;
	}
	/* HTML5 display-role reset for older browsers */
	article, aside, details, figcaption, figure,
	footer, header, hgroup, menu, nav, section {
		display: block;
	}
	body {
		line-height: 1;
	}
	html, body{
		background: #f2f3f4;;
	}
	ol, ul {
		list-style: none;
	}
	blockquote, q {
		quotes: none;
	}
	blockquote:before, blockquote:after,
	q:before, q:after {
		content: '';
		content: none;
	}
	table {
		border-collapse: collapse;
		border-spacing: 0;
	}
	a{
		text-decoration: none;
		color: #fff;
	}
`;
```

然后在`src/App.js`当中进行引入：
```javascript
// src/App.js
import { GlobalStyle } from './style.js'
```

### 3. 字体图标
在`assets`目录下新建一个名为`iconfont`的文件夹，将`.css, .eot, .svg, .ttf, .woff`为后缀的文件放到这个文件夹中。 然后将这个`css`文件做一些手脚，需要改成`js`代码。

所以现在的`iconfont.css`需要改成`iconfont.js`:
```javascript
// src/assets/iconfont/iconfont.js
import {createGlobalStyle} from'styled-components';

export const IconStyle = createGlobalStyle`
@font-face {font-family: "iconfont";
  src: url ('iconfont.eot?t=1565320061289'); /* IE9 */
  src: url ('iconfont.eot?t=1565320061289#iefix' ... 省略 base64 长字符) format ('embedded-opentype'), /* IE6-IE8 */
  url ('data:application/x-font-woff2;charset=utf-8) format ('woff2'),
  url ('iconfont.woff?t=1565320061289') format ('woff'),
  url ('iconfont.ttf?t=1565320061289') format ('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
  url ('iconfont.svg?t=1565320061289#iconfont') format ('svg'); /* iOS 4.1- */
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
...
`
```
上述的具体代码请到[我的仓库](https://github.com/taopoppy/cloud-music)查看具体的代码。


接下来, 把字体引入`App.js`中。
```javascript
//src/App.js
import React from 'react';
import { IconStyle } from './assets/iconfont/iconfont';
import { GlobalStyle } from './style';

function App () {
  return (
    <div className="App">
      <GlobalStyle></GlobalStyle>
      <IconStyle></IconStyle>
      <i className="iconfont">&#xe62b;</i>
    </div>
  );
}

export default App
```
字体的引入实际上就是给`i`标签添加`className`,然后显示`unicode`编码即可，这个码是在下载字体图标的时候就能看见的。每个字体图标下面有。
