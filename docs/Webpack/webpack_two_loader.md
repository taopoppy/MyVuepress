# Loader

## Loader是什么
当我们在项目中去引入一个图片，然后打包就会错误，因为：<font color=#1E90FF>webpack默认只会去打包js文件，或者说它自己只认的js这种类型的文件</font>，好在我们可以告诉`webpack`怎么打包除`js`以外类型的模块文件。比如我们现在在文件中引入了一个图片文件：
```javascript
// index.js
// ES Module
import avatar from './avatar.jpg'

var img = new Image()
img.src = avatar

var root = document.getElementById('root')
root.append(img)
```
但是`webpack`本身是不知道怎么打包图片文件的，所以我们需要在配置文件告诉它怎么去解决：
```javascript
// webpack.config.js
const path = require('path')
module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js'
  },
  module: {
    rules: [{
        test: /\.jpg$/,
        use: { loader: 'file-loader' }
      }]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}
```
通过在`webpack.config.js`配置文件当中配置当遇见`.jpg`类型的图片文件，我们就用`file-loader`去打包这个图片文件。`file-loader`当遇见这样的图片文件，会把图片文件复制移动到`dist`目录下，然后生成一个随机的名称，将这个名称或者复制文件的地址进行返回。这个大概就是`file-loader`的原理，当然我们后面还会继续说。

所以这样说来：<font color=#DD1144>Loader就是一个打包某个特定类型文件的解决方案</font>

## Loader打包静态资源 - 图片
### 1. file-loader
```javascript
module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash].[ext]', // name：原来文件一样的名称；hash：哈希值；ext：后缀名
            outputPath: 'images/'
          }
        }
      }
    ]
  },
```
基本上这样就是一个最简单的打包方式，我们可以来解释一下：
+ <font color=#3eaf7c>test</font>：当遇见`png`、`jpg`、`gif`等类型的文件，使用`file-loader`来打包
+ <font color=#3eaf7c>name</font>: 打包后的文件名称按照配置的占位符来命名
+ <font color=#3eaf7c>outputPath</font>: 打包后的文件处于`dist/images/`这个目录下面

更关键的一点我们打包后文件名称和路径都变了，但是`html`文件依旧能正确的引入，为什么？
```javascript
import avatar from './avatar.jpg'
console.log(avatar); // images/avatar_53e9591c427e8695482472a51685a528.jpg
console.log(typeof avatar) // string
var img = new Image()
img.src = avatar

var root = document.getElementById('root')
root.append(img)
```
<img :src="$withBase('/webpack_two_file_loader.png')" alt="file_loader打包图片">

+	<font color=#3eaf7c>webpack看到png文件，使用file_loader打包成dist目录下的images/avatar_5r8s5c8e556g4h.jpg文件，然后返回这个路径字符串，保存在avatar变量中</font>
+ <font color=#1E90FF>webpack打包js文件结束，生成bundle文件，此时图片文件在js文件中的路径就是images/avatar_5r8s5c8e556g4h.jpg</font>
+ <font color=#DD1144>打包后的js文件给html使用，html使用的就是正确的dist目录下的jpg文件路径</font>
	
可以看到，经过上述打包流程后，`avatar`这个变量就变成`avatar.jgp`在打包的`dist`目录下的路径，所以在`html`文件中才能正确使用。

### 2. url_loader
```javascript
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name]_[hash].[ext]',
            outputPath: 'images/'
          }
        }
      }
    ]
  },
```
打包后的`dist`目录下面并没有这样一个`jpg`文件，于此同时我们会发现`bundle.js`的体积大了很多，这是为什么？

<img :src="$withBase('/webpack_two_url_loader.png')" alt="url-loader打包">

通过上图我们就能了解到`url-loader`的打包原理：<font color=#DD1144>url-loader会将要打包的文件转化成为一个base64的字符串，然后直接将这个字符串返回，并且保存在了打包的bundle.js文件当中</font>

所以这样的做法会导致如果是很大的文件，虽然会减少一次`http`请求，但是同时会加大`js`文件的体积，所以我们最佳实践是： <font color=#1E90FF>需要正确的使用url-loader来打包一些小的文件，提高效率，同时大文件依旧使用file-loader打包的方式来打包，只不过url-loader可以完全做和file-loader相同的事，所以我们不必额外再使用file-loader</font> 
```javascript
  module: {rules: [{
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name]_[hash].[ext]',
            outputPath: 'images/',
            limit: 2048       // 文件大小在2048字节以下的生成base64字符串返回
          }
        }
      }
  ]},
```

## Loader打包静态资源 - 样式
### 1. style-loader

我们给上面的图片添加样式，我们在`src`目录下面创建`index.css`、`avatar.css`，然后在`index.js`当中引入，并在`webpack.config.js`当中进行配置：
```css
/*avatar.css */
.avatar {
	width: 150px;
	height: 150px;
}

/*index.css*/
@import './avatar.css'
```
```javascript
// index.js
import avatar from './avatar.jpg'
import './index.css'

var img = new Image()
img.src = avatar
img.classList.add('avatar') //给图片添加样式

var root = document.getElementById('root')
root.append(img)
```
```javascript
// webpack.config.js
  {
    test: /\.css$/,
    use: ['style-loader','css-loader']
  }
```
我们现在来分析两个`loader`的作用：
+ <font color=#1E90FF>css-loader</font>: 分析各个`css`文件之间的关系，然后合并成为一段`css`
+ <font color=#3eaf7c>style-loader</font>：将`css-loader`合并的最终`css`挂载到页面的`head`的`style`标签当中

<font color=#DD1144>特别注意的是，如果我们对某种类型的文件需要使用多个loader，一定要注意loader的加载顺序是从下到上</font>，所以比如我们使用`scss`来书写样式，我们的`webpack.config.js`中应该这样配置：

```javascript
// webpack.config.js
{
  test: /\.scss$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    { loader: 'sass-loader', options: {} },  // 需要npm i sass-loader node-sass -D
    { loader: 'postcss-loader', options: {} } // 需要npm i postcss-loader -D
  ]
}
```
```javascript
// postcss.config.js
module.exports = {
	plugins: [
		require('autoprefixer') // 需要npm i autoprefixer -D
	]
}
```
我们遇到`scss`文件后，会按照<font color=#1E90FF>postcss-loader</font> -> <font color=#1E90FF>sass-loader</font> -> <font color=#1E90FF>css-loader</font> -> <font color=#1E90FF>style-loader</font>的顺序分别执行，通过在使用`postcss-loader`的时候会通过`postcss.config.js`当中的插件配置去给样式文件中的部分属性添加厂商前缀。

### 2. css-loader
通过上面的讲解，基本上关于样式的打包配置大概就是这样，不过关于`css-loader`还有几个重要的配置需要我们来仔细说明
```javascript
// webpack.config.js
{ 
  loader: 'css-loader',
  options: {
    importLoaders: 2,
    modules: true
  } 
},
```
   

<font color=#1E90FF>**① importLoaders**</font>

```scss
/*index.scss*/
@import './avatar.scss';

body {
	.avatar {
		width: 150px;
		height: 150px;
		transform: translate(100px,100px);
	}
}
```
比如我们在`index.scss`文件当中引入了其他的`scss`文件：那么按照我们之前的配置，对于`index.scss`文件按照前面的配置，按照`postcss-loader`、`sass-loader`、`css-loader`、`style-loader`顺序执行，但是里面引入了别的`scss`文件，打包就有可能对于`avatar.scss`文件直接从`css-loader`开始，不会经过前面两个`postcss-loader`和`sass-loader`，所以<font color=#1E90FF>importLoaders</font>这个参数就是说：<font color=#DD1144>无论文件之间是什么关系，所有的scss文件都必须走完整的流程，因为css-loader前面有两个要执行的loader，所以importLoaders的值为2</font>

<font color=#1E90FF>**② modules**</font>

<font color=#DD1144>启动样式文件的模块化，在文件当中引入的样式文件可以只作用在当前文件</font>，不过这样配置后我们的写法也有所改变：

```javascript
// modules: false 之前的写法
import './index.scss'
...
img.classList.add('avatar') //给图片添加样式

// modules: true 之后的写法
import style from './index.scss'
...
img.classList.add(style.avatar)
```
## Loader打包静态资源 - 字体
字体文件通常我们会去阿里矢量图的[官网](https://www.iconfont.cn/)去下载，下载下来其实是一个包，解压之后我们有用的文件有这几种<font color=#1E90FF>iconfont.eot</font>、<font color=#1E90FF>iconfont.svg</font>、<font color=#1E90FF>iconfont.ttf</font>、<font color=#1E90FF>iconfont.woff</font>、<font color=#1E90FF>iconfont.woff2</font>、<font color=#1E90FF>iconfont.css</font>。前面5个都是字体文件，最后一个css文件我们来看里面的内容
```scss
/* iconfont.scss */
@font-face {font-family: "iconfont";
  src: url('./font/iconfont.eot?t=1573780149114'); /* IE9 */
  src: url('./font/iconfont.eot?t=1573780149114#iefix') format('embedded-opentype'), /* IE6-IE8 */
  url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAUcAAsAAAAACcAAAATNAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCDBgqHIIVmATYCJAMMCwgABCAFhG0HPhs0CMgOJTUFkYgODwBA8DzafX9uksFmVv4AUMEoAXQud6vn7oOY/j3rVQswSyOFJ80B6t4izcI+qzgQn/fHveO/zj/Y6lmW05jD9rSxARMMaIyNXZRoAWKiDdNLGMjP5yGApTTOEDrGJmcDBQyOQmDOTAatAiiUjJgeUvA1bstap46cBA6+2kgsArbH35fX1BcFUDgaZ27fyTHVIPyZ+2yc3v1/BSNDM7i6nh1gm0ADNQEYkNGtzqGQ0nBNSFhDSe5PdTEIai3f//8QC021e9IfngJxcZTJkKgaUfDM9bkQeDbOiIKYnuwCKSDVATIPENl9NDb/kBaZbAs9uUHvGffqcYlmsb5MVtAmzg4/qN0sy9scNmiSbYpG7b55695BnYY2GwxX3ovpj/Q5YF2GTUO6TW3zR63Pi5uLho2McPwY1tKiN4yoPSI9Uf+zZ60Hx+wbmppwHAOsyGkc1FmUxh4/b9s/a4yPGLf06I8MOGC4/jFMf6BDTzQMF+gcFWcfOKvbZBixFsGvbbDYYeiG4ZREJ4+Q17DfreWW08iE/guYLCyqpQTeTpfFhuBg7rEm+9XT9gvnYjJBCkierirnz1Mm2k3jRoSWCYGKODyQwuOjBqDpnHJAJDIoZUFmLt8u3WwpwVRKh8xPmWyvS7fNSFok1ybxUV3wAFHefIogK9eVrESjg5NnxTn98pSxf+c1iSm5VZw2kpAVLRx172r+ubwCRGVWdn/dtbD5UD1btGVTTqUNeYFx+doR7f46q5TSZAqIH65fNdzwHmXuE6cvXj/Hw2o0xzrLyUb7w70mb8DqlkmR+4vD8/UeEOfW9aETNqhTZuU2LZi8PG2eEO1fwKxbAZYmqVvdYCUaGZxUL5Eu935VyA2M8slpaegR69lYTrmxwgk1HBZYdsk0yKXJVqnLlMr60zAlQs+jQ2Hp3VoBW5dE9ycK3QgbbYgxyktbA0xecgpqIsP1Tb3eWqp+T2zorCXyi3fKdC1OiiCoZRXdm7vEUurzgajrh1V5cfOScMrCGAjZOjDAJMDgu3da/sPMeQFsYk0NcSZiUqHySyJEdiGbGPChbVt1k7RgPvncvMGvB2+dB9TbtP0+/8n8D1FpqOU/hOjdOX0t32fbgcFpvwzqj/eYpyo1w2YOzIM5oBwA/O+pv6rQfye63KshrfjXxpFe7IWWqQd/9YPvz5f4UuJazB+H9XSD/yZcAn+W3RP+d6zedlMDVhmtoFdoxzT3se+ND/ncw38cbyZP56tyVheGcr8kYqDwKAUan4qIIWqCQ0BDcPFpA5YaxG0OyAKBhJgkoDoHAAjpTIAilVugSecGYogn4JDLF3BJFxJYBov2ngGVhaEUhcAVKFwNVW6BGFU8LtWzoEpJbiZM28CuQIqSmMqFEQHDB3m4uldjcTAXRtZYINhI80RRKkRFeBwoFlwGs9k8iI/wmHAV6kpHUX6gmxu17UWuVTwOUKIDCDAVoMBUA1HJFiAYVMGDCzXsjqJU+3wmMDQ2wKYCpKeiwZsLDIIARu8QHrjiPgKJU3JHVTzLYAEboeEJCgoVT6KCwIMDRCy0w7DdMA8IfvsoJjBVoLhCnxHkE4gb6kQdq3TdX825vmouYhXnCi1KtBj86YwKroAOcxUThwcAAAAA') format('woff2'),
  url('./font/iconfont.woff?t=1573780149114') format('woff'),
  url('./font/iconfont.ttf?t=1573780149114') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
  url('./font/iconfont.svg?t=1573780149114#iconfont') format('svg'); /* iOS 4.1- */
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.iconjianshen:before {
  content: "\e606";
}

.iconjianshen1:before {
  content: "\e661";
}
```
可以清楚的看到在这个`css`文件（修改为`scss`文件也是一样的）当中，`@font-face`当中是对我们前5个字体的引用，这里要注意路径写对，然后`iconjianshen`和`iconjianshen1`就是我们可以使用在样式当中的选择器了，那么我们在`index.js`就能直接引用这个文件，并且使用这个字体选择器。
```javascript
// index.js
// 第一种写法：非css模块化
import './iconfont.scss'
var root = document.getElementById('root')
root.innerHTML = '<div class="iconfont iconjianshen1"></div>'

// 第二种写法：css模块化
import style from './index.scss'

var root = document.getElementById('root')
root.innerHTML = `<div class='${style.iconfont} ${style.iconjianshen1}'></div>`

```
但是`webpack`依旧是对这些字体文件是不识别的，我们需要在`webpack.config.js`当中配置：对于字体文件的处理，我们的做法就是：<font color=#DD1144>使用file-loader将这些字体文件复制到dist目录下即可，当然也可以使用outputPath来复制到一个文件夹fonts下面</font>
```javascript
// webpack.config.js
{
  test: /\.(woff|woff2|eot|ttf|svg|otf)$/,
  use: {
    loader: 'file-loader',
    options: {
      outputPath: 'fonts/'
    }
  }
},
```



**参考文档**

1. [https://www.webpackjs.com/loaders/file-loader/](https://www.webpackjs.com/loaders/file-loader/)
2. [https://www.webpackjs.com/loaders/url-loader/](https://www.webpackjs.com/loaders/url-loader/)
3. [https://www.webpackjs.com/loaders/style-loader/](https://www.webpackjs.com/loaders/style-loader/)
4. [https://www.webpackjs.com/loaders/css-loader/](https://www.webpackjs.com/loaders/css-loader/)
5. [https://www.webpackjs.com/loaders/sass-loader/](https://www.webpackjs.com/loaders/sass-loader/)
6. [https://www.webpackjs.com/loaders/postcss-loader/](https://www.webpackjs.com/loaders/postcss-loader/)
7. [https://www.webpackjs.com/guides/asset-management/](https://www.webpackjs.com/guides/asset-management/)