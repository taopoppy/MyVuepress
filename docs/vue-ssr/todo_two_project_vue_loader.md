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
