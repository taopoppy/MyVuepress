# PWA&&Typescript

## PWA
我们在之前的配置基础下直接打包`npm run build`,然后在`dist`目录下会生成一堆文件，我们希望来演示一下这个`pwa`的效果，我们就先安装`http-server`:
```javascript
npm install http-server -D
```
然后我们在`package.json`当中配置启动命令，可以让`http-server`来跑`dist`目录下的文件
```javascript
// package.json
{
	"script":{
		"start": "http-server dist"
	}
}
```
但是我们上面这样配置之后，<font color=#1E90FF>没有使用pwa的时候关闭服务器，那么我们重新刷新浏览器页面就不会显示了，或者显示无法访问此网站</font>，<font color=#DD1144>而pwa是这样的一种技术，在本地缓存最后一次访问的页面，即使服务器挂掉，也能利用缓存来显示之前的页面</font>，所以在`webpack`中实现这样的技术只需要3个步骤
+ 下载一个插件
+ 配置一下`webpack.prod.js`（因为只需要在生产环境中去使用pwa）
+ 写一小段业务代码

```javascript
npm install workbox-webpack-plugin --save-dev
```
```javascript
// webpack.prod.js
const WorkboxPlugin = require('workbox-webpack-plugin')

const prodConfig = {
  plugins: [
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助 ServiceWorkers 快速启用
      // 不允许遗留任何“旧的” ServiceWorkers
      clientsClaim: true,
      skipWaiting: true
    })
  ],
}
```
当然了，插件下载好了并且配置在了生产环境的`webpack.prod.js`的文件中后，我们还需要在业务代码中书写这样的一段逻辑：
```javascript
// index.js
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js').then(registration => {
			console.log('SW registered: ', registration);
		}).catch(registrationError => {
			console.log('SW registration failed: ', registrationError);
		});
	});
}
```
上面这个逻辑就是当你的浏览器是支持`pwa`的时候就会缓存，你的浏览器如果不支持`pwa`，在`webpack.prod.js`当中的配置实际上都不起作用。

然后我们重新打包`npm run build`,会在`dist`目录下面发现两个帮助我们缓存的文件：<font color=#DD1144>service-worker.js</font>和<font color=#DD1144>precache-manifest.16c1ad3dde6d30fdf20637e16a751baf.js</font>，然后我们启动服务器`npm run start`,访问页面的时候，相关的文件会被`workbox`这个插件缓存，即使我们将服务器关掉，重新刷新页面，也同样能访问缓存成功。

如果你想取消注册一些网站的内容,或者删除pwa在浏览器中的缓存，可以在浏览器当中打开开发者工具，然后在Application/Service Workers中去点击Unregister取消注册。

## Typescript
### 1. 基础配置
首先先下载解析`ts`的`loader`:
```javascript
npm install --save-dev typescript ts-loader
```
然后在`webpack.common.js`中配置:
```javascript
// webpack.common.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/ // 排除node_modules这个文件夹
      }
    ]
  },
  resolve: {
		extensions: [ '.tsx', '.ts', '.js' ] 
		// 自动解析确定的扩展，按照tsx ts js的顺序去解析，哪个正确就用哪个扩展，可配可不配
		// 一般在完全使用ts的项目中建议使用
  },
};
```
当然了这样直接打包是不行的，它会告诉你缺少`tsconfig.json`文件,我们需要在项目点额根路径下创建这样的文件然后做一些对`ts`的配置：
```json
// tsconfig.json
{
  "compilerOptions": {
    "outDir": "./dist/", // 这里写不写无所谓，因为在webpack中已经配置
    "noImplicitAny": true, // （可选）
    "module": "es6",     // 使用ES module的导出导入方法
    "target": "es5",     // 最终语法转化为es5
    "jsx": "react",			 // （可选）
    "allowJs": true      // 允许在ts当中引入js模块
  }
}
```
这样就能正确的使用`typescript`,不过关于`typescript`配置参数有许多，如果你感兴趣，可以到`typescript`[官网](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)上去研究更多的配置。

### 2. 第三方包
当从`npm`安装第三方库时，一定要牢记同时安装这个库的类型声明文件。你可以从[TypeSearch](https://microsoft.github.io/TypeSearch/)中找到并安装这些第三方库的类型声明文件。

举个例子，如果想安装`lodash`这个库的类型声明文件，我们可以运行下面的命令：
```javascript
npm install --save-dev @types/lodash
```

### 3. sourMap
要启用`source map`，我们必须配置`TypeScript`，以将内联的`source map`输出到编译过的`JavaScript`文件。必须在`TypeScript`配置中添加下面这行：
```json
// tsconfig.json
{
	"compilerOptions": {
		"sourceMap": true,
	}
}
```
现在，我们需要告诉`webpack`提取这些`source map`，并内联到最终的 `bundle`中。
```javascript
// webpack.prod.js
module.exports = {
	devtool: 'inline-source-map',
}
```

**参考资料**

1. [https://www.webpackjs.com/guides/typescript/](https://www.webpackjs.com/guides/typescript/)
2. [https://www.webpackjs.com/guides/progressive-web-application/](https://www.webpackjs.com/guides/progressive-web-application/)