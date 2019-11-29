# webpack开发再配置

## vue-loader
因为`vue-loader`实际上有很多的配置内容，我们一个个来说：

<font color=#1E90FF>**① 热加载**</font>

`vue`本身是没有热加载功能的，我们必须去下载插件：
```javascript
npm install vue-style-loader@3.0.3 -D --registry=https://registry.npm.taobao.org
```
然后将`webpack.config.client.js`当中的所有`style-loader`改为`vue-style-loader`即可，这样，无论`css`还是`stylus`都能通过`vue-style-loader`进行热加载。

<font color=#1E90FF>**② 删除dist目录**</font>

我们先去安装一个插件：
```javascript
npm install rimraf@2.6.2 -D --registry=https://registry.npm.taobao.org
```
然后修改我们的`package.json`当中的命令：
```json
// package.json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build:client": "cross-env NODE_ENV=production webpack --config build/webpack.config.client.js",
    "build": "npm run clean && npm run build:client",
    "clean": "rimraf dist",
    "dev": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.client.js"
  },
}
```
然后我们每次启动`npm run build`就会先去删除当前`dist`的目录，然后执行生产环境下的打包。

<font color=#1E90FF>**③ 配置vue-loader**</font>

我们在`build`目录下面创建一个`vue-loader.config.js`,然后这样书写：
```javascript
// vue-loader.config.js
module.exports = (isDev) => {
	return {
		preserveWhitepace: true, // 防止template当中的空格对渲染产生影响
		extractCSS: !isDev, // vue默认是将.vue文件当中的样式打包到js当中的，那样效率更快，但是如果你希望把.vue文件中的样式在首屏加载的时候就全部加载，这里设置true就可以
		cssModules: {},
	}
}
```
上述主要就是讲了一个`extractCSS`的配置，这个就是我们之前说的，<font color=#1E90FF>对于你写在.vue当中的css样式，vue默认是通过js打包到这个组件当中的，但是你也可以将这些样式分离出来，上述这个配置的意思就是我们开发的时候不分离.vue中的样式，生产环境做分离（其实怎么样配置随你）</font>，
然后我们就把这个`vue-loader`的配置加到`webpack.config.base.js`中的`vue-loader`的`options`当中：
```javascript
// webpack.config.base.js
const createVueLoaderOptions = require('./vue-loader.config.js')

const isDev = process.env.NODE_ENV === 'development'
const config = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: createVueLoaderOptions(isDev)
      }
		]
	}
}
```
## css-module
上面的`vue-loader.config.js`文件中还有一个配置是`cssModules`，这部分我们单独来讲。在讲之前呢，我们知道`css`局部化其实有几种方法，我们下面会讲3种方法，并在第二种方法种讲解关于`vue-loader.config.js`的`cssModules`配置项的用法。<font color=#1E90FF>值得注意的是下面三种方法可以同时使用，也可以单独使用，怎么用都取决你自己</font>

### 1. scoped
```javascript
// header.vue
<template>
  <header class="main-header">
    <h1>JTodo</h1>
  </header>
</template>

<style lang="stylus" scoped>
.main-header{
  text-align center
  h1{
    font-size 100px
    color: rgba(175, 47, 47, 0.4)
    font-weight 100
    margin 20px
  }
}
</style>
```
我们可以看到第一种局域化`css`的方法就是：<font color=#DD1144>scoped</font>，它的原理是这样：<font color=#1E90FF>对于当前css的样式添加独特的标志符，组件中的html标签中携带独有的标志符以此实现css模块化</font>

我们在前面已经通过在`vue-loader.config.js`中设置`extractCSS: !isDev`实现在生产环境下的`vue`组件样式的分离，所以我们现在执行`npm run build`打包项目。然后打包后我们在`dist`目录下找到`style`开头的`css`文件，里面包含所有`vue`组件中的样式，我们会找到这样一段代码：
```css
main-header[data-v-e81ce288]{text-align:center}.main-header h1[data-v-06ebb29e]{font-size:100px;color:rgba(175,47,47,.4);font-weight:100;margin:20px}
```
你可以很清晰的看到两个标志符：<font color=#1E90FF>data-v-e81ce288</font>和<font color=#1E90FF>data-v-06ebb29e</font>，两个有什么作用，我们打开浏览器查看元素：

<img :src="$withBase('/vuessr_vue_loader_css_scoped.png')" alt="">

你可以很清楚的看到，有了这些标志符，把不同组件当中的样式全部分离到一个文件当中，也能根据不同的标志符来区分哪个组件中的`dom`用了哪个标志符的`css`样式。

### 2. module
我们在`vue-loader.config.js`当中去这样配置：
```javascript
// vue-loader.config.js
module.exports = (isDev) => {
	return {
		preserveWhitepace: true, 
		extractCSS: !isDev, 
		cssModules: {
			localIdentName: isDev?'[path]-[name]-[hash:base64:5]':'[hash:base64:5]',
			camelCase: true
		},
	}
}
```
+ <font color=#3eaf7c>localIdentName</font>: 给`css`生成组件内独有的对象，并且以这样的方式命名
+ <font color=#3eaf7c>camelCase</font>：将以横杠`-`连接的这种`css`样式转化为`js`能识别的驼峰命名。

这个东西配置好了我们怎么用？我们打开之前的`Header.vue`:
```javascript
// Header.vue
<template>
  <header :class="$style.mainHeader"> <!-- 独特的写法 -->
    <h1>JTodo</h1>
  </header>
</template>

<style lang="stylus" module> <!-- 使用module代替scoped-->
.main-header{
  text-align center
  h1{
    font-size 100px
    color: rgba(175, 47, 47, 0.4)
    font-weight 100
    margin 20px
  }
}
</style>
```
然后重新打包，并且启动`npm run dev`,然后到浏览器上去检查元素：

<img :src="$withBase('/vuessr_vue_loader_vue_module.png')" alt="">

你可以很清楚的看到`header`节点的`class`的命名就是按照我们在`vue-loader.config.js`当中配置的`localIdentName: '[path]-[name]-[hash:base64:5]'`一样，所以我们现在就明白了这种`css`局部化的原理：<font color=#1E90FF>通过module代替scoped编译样式后，实际上在这个组件内部生成了一个对象$style,这个对象里面又有css名称对应驼峰命名的属性mainHeader，这个属性的值就是我们在localIndentName配置方案生成的名称</font>，如下所示：
```javascript
<template>
  <header :class="$style.mainHeader"></header>
</template>

<script>
export default {
	computed: {
		$style(){
			return {
				mainHeader: 'client-layout--header-2AE8s_0' // main-Header经过编译变成了$style中的一个属性，属性的值为按照配置方案生成的名称
			}
		}
	}
}
</script>

<style lang="stylus" module>
.main-header{
}
</style>
```
<img :src="$withBase('/vuessr_vue_loader_vue_module_liucheng.png')" alt="module原理图">

这样的好处有下面几种：
+ <font color=#1E90FF>能生成组件内部独有的css样式名称，按照localIdentName: '[path]-[name]-[hash:base64:5]'的配置是不可能产生命名冲突的</font>
+ <font color=#1E90FF>在开发环境下我们还能直接根据这个名字定位我们的样式在那个文件下的哪个组件当中</font>
+ <font color=#1E90FF>在生产环境只按照哈希码生成名称别人看不懂，有很好的保密性</font>

### 3. css-module
第三种方法和`vue-loader.config.js`就没有关系了，它是一个广泛的`css`模块化方案，在`jsx`和原生当中使用的比较多，我们需要去配置`webpack`当中的`css-loader`:
```javascript
// webpack.config.client.js
module.exports = {
	module: {
		rules: [
			{
				test: /.\styl$/,
				use: [
					'vue-style-loader',
					{
						loader: 'css-loader',
						options: {
							module:true,
							localIdentName: isDev? '[path]-[name]-[hash:base64:5]':'[hash:base64:5]'
						}
					}
				]
			}
		]
	}
}
```
然后我们引入样式的写法就有所改变：
```javascript
// 原来的写法
import './footer.styl'
export default {
	render(){
		return(
			<div id="footer"></div>
		)
	}
}

// 现在的写法
import className from'./footer.styl'
export default {
	render(){
		return(
			<div id={className.footer}"></div>
		)
	}
}
```

## eslint&editorconfig
首先下载一系列的插件：
```javascript
npm i eslint@4.16.0 eslint-config-standard@11.0.0-beta.0 eslint-plugin-import@2.8.0 eslint-plugin-node@5.2.1 eslint-plugin-promise@3.6.0 eslint-plugin-standard@3.0.1 -D --registry=https://registry.npm.taobao.org
```
因为我们的`eslint`不能直接识别`.vue`文件中的`javascript`，所以我们必须要下载其他的插件来帮助我们识别：
```javascript
npm install eslint-plugin-html@4.0.1 -D --registry=https://registry.npm.taobao.org
```
然后我们创建一个文件`.eslintrc`,配置相应的内容：
```javascript
// .eslintrc
{
	"extends": "standard",
	"plugins": [
		"html"
	]
}
```
上面的配置：
+ 其中`"extends": "standard"`的意思就是我们`eslint`检查语法的规范是根据之前下载的那个包文件`eslint-config-standard`，而这个规则第三方包又依赖了`eslint-plugin-import`、`eslint-plugin-node`、`eslint-plugin-promise`、`eslint-plugin-standard`这四个包
+ 而`"plugins": ["html"]`是配置了`eslint-plugin-html`这个包，可以帮助我们识别`.vue`当中的`javascript`语法。

然后我们现在就能使用`eslint`来检查了,只不过我们要去`package.json`添加两个命令：
```javascript
// package.json
{
	"script": {
		"lint": "eslint --ext .js --ext .jsx --ext .vue client/",
		"lint-fix": "eslint --fix --ext .js --ext .jsx --ext .vue client/"
	}
}
```
+ <font color=#3eaf7c>lint</font>: 这个命令是我们检查`client`文件下面所有以`js`、`jsx`、`vue`为后缀的文件
+ <font color=#3eaf7c>lint-fix</font>: 这个命令是帮助我们修复通过`npm run lint`检查出来的问题，我们可以通过`npm run lint-fix`这个命令去修复。

### 1. 立即修复
但是通过上面的这种方法我们觉得比较麻烦，我们希望能在上面的基础上在边写代码的时候就能提示我们，这样能够快速定位，毕竟是我们刚写的代码。我们首先去下载插件：
```javascript
npm i eslint-loader@1.9.0 babel-eslint@8.2.1 -D --registry=https://registry.npm.taobao.org
```
然后我们修改`.eslintrc`中的配置：
```javascript
// .eslintrc
{
	"parser": "babel-eslint"
}
```
这个是因为我们在`webpack`开发中有的会通过`babel`进行转义，而转义后的代码就不太符合`eslint`的规则，所以我们需要这个配置来解决这个问题。然后我们到`webpack.config.base.js`当中配置一个`loader`:
```javascript
// webpack.config.base.js
module.exports = {
	module: {
		rules: [
			{
				test: /\.(vue|js|jsx)$/,
				loader: 'eslint-loader',
				exclude: /node_modules/,
				enforce: 'pre'
			},
		]
	}
}
```
<font color=#1E90FF>这样配置的意思就是说当我们在用不同的loader去打包不同的文件之前，先用eslint-loader去这些文件进行检测，检测通过，再用不同的真正的loader去打包，所以enforce这个配置就是这个功能，如果你不配置这个属性就会有冲突，比如对于vue你又用了eslint-loader又用了vue-loader，webpack就不知道先后顺序了</font>

这样配置之后，我们启动`npm run dev`,在每次修改并保存的时候，`eslint`都能立即帮我们查找错误，我们也可以快速在边写代码的时候边规范代码，也是对自己书写代码的规范性上有了显著的提高。

### 2. 统一编辑规则
我们下面要来配置<font color=#DD1144>editorconfig</font>：<font color=#1E90FF>editorconfig的作用是规范不同编辑器的规范，因为不同的编辑器默认有不同的设置，比如vscode中默认的tab是4，webstorm默认tab是2，那么同一个项目在不同编辑器打开就是不同的样式，而且比如说eslint默认tab是2,你在webstorm中打开eslint就不会报错，而在vscode中打开就全是错误，因为vscode的tab和eslint的tab设置不同</font>

如果我们使用的`vscode`,我们需要在`vscode`中安装一下`editorconfig for vscode`,然后我们在项目中创建一个`.editorconfig`配置文件
```javascript
// .editorconfig
root = true  

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

```
+ <font color=#3eaf7c>root</font>: 检查目录到此设置为顶级
+ <font color=#3eaf7c>charset</font>：编码方式
+ <font color=#3eaf7c>end_of_line</font>：每行以`lf`结尾，`windows`默认`clf`结尾的，而`Mac`和`linux`是以`lf`结尾的，需要统一
+ <font color=#3eaf7c>indent_size</font>: `tab`的空格数量
+ <font color=#3eaf7c>indent_style</font>: 间距以空格为单位
+ <font color=#3eaf7c>insert_final_newline</font>: 文件的最后自动添加一行
+ <font color=#3eaf7c>trim_trailing_whitespace</font>：去除每行最后多余的空格

配置这个对开发效率有提高么，有的。<font color=#1E90FF>之前不是说边写代码边修改代码规范性么，现在有了editorconfig，会自动帮我们去做一些符合代码规范的操作，我们的注意力就能全部集中在代码的逻辑了，而不用在代码的规范了</font>，<font color=#DD1144>因为将代码规范的操作交给了editorconfig,代码规范的检查交给了eslint，整个流程就是：</font>
```javascript
 程序员      editorconfig        eslint
   ↓     ->       ↓        ->      ↓
编写code       规范code          检查code
```

### 3. precommit
在真实的开发当中，我们是需要提交代码到`git`的，我们需要在`git commit`这个命令执行的时候先去执行校验代码规范的操作，如果不通过，就没有办法向远程提交，所以我们必须先将项目目录进行`git init`的操作，然后再执行下面的操作，顺序不能错。

然后我们安装插件：
```javascript
npm install husky@0.14.3
```
然后到`package.json`中配置这个`precommit`,有两种配置方法。第一种如下
```javascript
// package.json
"precommit":"npm run lint"
```
这种就是在`git commit`提交的时候去检查错误，一旦检查出错误，就不提交。

第二种如下：
```javascript
// package.json
"precommit":"npm run lint-fix"
```
这种是在`git commit`提交之前先去修复错误，然后提交。<font color=#1E90FF>我个人还是推荐第一种，保险起见</font>