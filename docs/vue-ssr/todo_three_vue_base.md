# Vue实例的完全解析

## 准备工作
我们在整个`vue`核心知识的学习这一大章都和项目没有多大关系，所以我们首先要在项目当中的`build`目录下单独创建一个关于`webpack`的配置文件，来打包我们的关于`vue`核心知识的`demo`，所以我们先创建`build/webpack.config.practice.js`和`build/template.html`
```javascript
// webpack.config.practice.js
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const baseConfig = require('./webpack.config.base')
const merge = require('webpack-merge')

const defaultPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"development"'
    }
  }),
  new HTMLPlugin({
    template: path.join(__dirname, 'template.html') // 采用同级目录下的template.html作为模板
  })
]

const devServer = {
  port: 8090,          // 开启一个新的端口
  host: '0.0.0.0',
  overlay: {
    errors: true
  },
  hot: true
}
let config

config = merge(baseConfig, {
  entry: path.join(__dirname, '../practice/index.js'),
  devtool: '#cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.styl/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          'stylus-loader'
        ]
      }
    ]
  },
  devServer,
  resolve: {
    alias: {
			'vue': path.join(__dirname, '../node_modules/vue/dist/vue.esm.js')
			// 这里的配置因为如果有runtime-only的话我们是不能在vue当中写template的
			// 而且在node_modules中的vue底下有很多版本的vue文件来支持不同的环境
			// 默认情况下我们都import的vue.runtime.xxx.js
			// 所以这里我们使用没有runtime的版本，便于我们写template
    }
  },
  plugins: defaultPlugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ])
})

module.exports = config
```
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

然后我们在`eslint`中配置可以使用`new`：
```javascript
// .eslint
{
  "rules": {
    "no-new": "off"
  }
}
```
并在`package.json`当中配置启动命令：
```json
{
	"script":{
		"practice": "cross-env NODE_ENV=development webpack-dev-server --config build/webpack.config.practice.js",
	}
}
```

最后我们在项目目录下创建一个`practice\index.js`的目录，然后我们后面的代码都会用这个文件来写`Demo`

## Vue实例
### 1. Vue实例的创建和作用
实例顾名思义就是一个类的具体对象，在`vue`中也不例外，是要通过`new`关键字来实例化一个`vue`的具体对象，之前我们在工程中有这样一段代码：
```javascript
new Vue({
  render: (h) => h(App)
}).$mount(root)
```
上述就是一个`vue`的实例，它表达的意思就是<font color=#1E90FF>通过render方法将APP页面的内容挂载到html当中的root节点当中</font>，所以你在`App.vue`中书写的东西就会被显示到页面上，而我们通常在学习或者在官网看到有这样的代码：
```javascript
new Vue({
  el: '#root',
  template: '<div>this is content</div>'
})
```
两段代码有相似之处：
+ 第一个相似的地方就是<font color=#3eaf7c>render方法和template</font>之间的关系，实际上<font color=#DD1144>通过在template当中书写的内容通过vue全部会被编译成为render方法，render方法返回的就是真实要在html当中显示的内容</font>，所以你会发现在`App.vue`中书写`template`会更方便一些，因为`.vue`中书写`template`的方式更像写`html`,后面我们在说`component`的时候会详细的去说明`render`方法能做哪些事情
+ 第二个相似的地方就是<font color=#3eaf7c>el和$mount</font>之间的关系，实际上`el`我们通常会理解为接管的意思，而`$mount`我们通常会理解为挂载的意思，实际上他们都是同一个意思：<font color=#DD1144>通过render方法返回的真实html的内容会将root节点的div完全替换</font>，这里一点记住是替换，而不是填充，因为你在真实的`dom`根本看不到`div`上有`root`这个`class`属性，所以是替换。

<img :src="$withBase('/vuessr_vue_template_mount.png')" alt="tempalte和render方法">

### 2. Vue实例的属性
通过拿到这个实例，我们就能通过打印的方法去一个一个的看实例上的属性都有哪些：
```javascript
const app = new Vue({...})
console.log(app.$data)
```
通过上面的这种代码，我们可以通过`app.$xxx`的方式去访问我们实例上的属性和方法，关于`vue`实例上的属性，在官网有很详细的说明：[https://cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B%E5%B1%9E%E6%80%A7](https://cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B%E5%B1%9E%E6%80%A7),不过呢，我们在这里还是要详细的列出所有的属性，部分属性我们需要在后面更详细的介绍：
+ <font color=#9400D3>app.$data</font>：`Vue`实例观察的数据对象,<font color=#1E90FF>Vue实例代理了对其data对象属性的访问</font>。也就是说通过`app.$data.xxx`可以直接通过`app.xxx`访问。

+ <font color=#9400D3>app.$props</font>：当前组件接收到的`props`对象。`Vue`实例代理了对其`props`对象属性的访问。

+ <font color=#9400D3>app.$el</font>：`Vue`实例使用的根`DOM`元素，这里根元素从头到尾指的都是自己的根元素。并不是使用`$mount`或者`el`属性描述的那个接管的`id`为`root`的`div`

+ <font color=#9400D3>app.$options</font>：<font color=#1E90FF>用于当前`Vue`实例的初始化选项。需要在选项中包含自定义属性时会有用处</font>,初始化选项说白了就是实例化对象的时候传进去的一整个对象和默认的一些属性合并后的东西。但是特别要注意两个点：
  + <font color=#1E90FF>app.$options.data和app.$data是不等价的</font>
  + <font color=#1E90FF>app.$options.render方法是有效果的</font>
+ <font color=#9400D3>app.$root</font>：当前组件树的根`Vue`实例。如果当前实例没有父实例，此实例将会是其自己。
+ <font color=#9400D3>app.$refs</font>：一个对象，持有注册过`ref`特性的所有`DOM`元素和组件实例,<font color=#1E90FF>这个属性的作用是能快速帮我们定位到模板中的某个节点或者某个组件</font>
+ <font color=#9400D3>app.$isServer</font>：当前`Vue`实例是否运行于服务器，<font color=#1E90FF>这个属性在服务端渲染的时候很有作用，因为有些代码只能运行到服务端，有些代码只能运行在浏览器中，可以通过这个值来判断</font>
+ <font color=#9400D3>app.$attrs</font>和<font color=#3eaf7c>app.$listeners</font>：我们后续在讲解高级组件的时候会详细介绍
+ 、<font color=#3eaf7c>app.$children</font>、<font color=#3eaf7c>app.$parent</font>、<font color=#3eaf7c>app.$slots</font>和<font color=#3eaf7c>app.$scopedSlots</font>：我们后续在讲解组件的时候会详细介绍。

### 3. Vue实例的方法
实例的方式是极其有作用的，我们需要来完整的列举一下

<font color=#1E90FF>**① .$watch && .$set && .$delete（数据相关）**</font>

+ <font color=#3eaf7c>用法</font>：
  + `app.$watch`是用来观察`Vue`实例变化的一个表达式或计算属性函数。回调函数得到的参数为新值和旧值。表达式只接受监督的键路径。对于更复杂的表达式，用一个函数取代。
  + `app.$set`是用来向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。<font color=#1E90FF>它必须用于向响应式对象上添加新属性,而不能是vue实例或者vue实例的根数据对象</font>。
  + `app.$delete`是用来删除对象的属性。如果对象是响应式的，确保删除这个属性的响应式。<font color=#1E90FF>因为你如果是普通的删除这个对象的属性，它的响应式还在，会造成内存溢出</font>，这个方法主要用于避开`Vue`不能检测到属性被删除的限制，但是你应该很少会使用它。
+ <font color=#3eaf7c>实例</font>：
  ```javascript
  // 外部写法(添加watch)
  const unWatch = app.$watch('text', (newText, oldText) => {
    console.log(`${newText} : ${oldText}`)
  })
  // 外部写法(销毁watch)
  unWatch()

  // 内部写法
  const app = new Vue({
    watch: {
      text (newText, oldText) {
        console.log(`${newText} : ${oldText}`)
      }
    }
  })
  ```
  ```javascript
  const app = new Vue({
    el: '#root',
    template: '<div>{{text}} {{obj.a}}</div>',
    data: {
      text: 0,
      obj: {}
    }
  })

  setInterval(() => {
    app.$data.text += 1
    if (app.$data.text === 3) {
      app.$set(app.obj, 'a', 3)
    }
    if(app.$data.text === 6) {
      app.$delete(app.obj, 'a')
    }
  }, 1000)
  ```
+ <font color=#3eaf7c>注意</font>:
  值的注意的就是外部的写法`app.$watch`方法会返回销毁这个监听器的方法，需要我们在某个不需要监听的时刻销毁它，而内部的写法是不需要手动销毁，会在组件卸载的时候自动销毁，所以这也是内部写法的一个省事的地方。

<font color=#1E90FF>**② .$on && .$emit && .$once && .$off（事件相关）**</font>

+ <font color=#3eaf7c>用法</font>：
  + `app.$on`监听当前实例上的自定义事件。
  + `app.$emit`可以触发事件。`app.$on`或者`app.$once`中的回调函数会接收`app.$emit`中所有传入事件触发函数的额外参数。
  + `app.$once`监听一个自定义事件，但是只触发一次。一旦触发之后，监听器就会被移除。
  + `app.$off`移除自定义事件监听器
+ <font color=#3eaf7c>实例</font>：
  ```javascript
  // 无限次可以触发
  app.$on('text', function (params) {
    console.log(params)
  })
  app.$emit('text', 'taopoppy')

  // 只能触发一次
  app.$on('once', function (params) {
    console.log(params)
  })
  app.$emit('once', 'taopoppy')
  ```
+ <font color=#3eaf7c>注意</font>：
  在父子组件的通信当中，使用`.$on`在父组件进行事件的监听并在子组件当中使用`.$emit`去触发事件来实现父子组件的通信。

<font color=#1E90FF>**③ .$forceUpdate && .$nextTick（生命周期相关）**</font>

+ <font color=#3eaf7c>用法</font>：
  + `app.$forceUpdate`迫使`Vue`实例重新渲染。<font color=#1E90FF>注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件</font>。<font color=#DD1144>一般不建议使用这个方法的，因为万一用不好，很大程度的会影响性能</font>
  + `app.$nextTick`是用来将回调延迟到下次`DOM`更新循环之后执行。在修改数据之后立即使用它，然后等待`DOM`更新。它跟全局方法`Vue.nextTick`一样，不同的是回调的`this`自动绑定到调用它的实例上。<font color=#DD1144>这里为什么要讲这个方法，因为vue中数据的修改影响视图的更新是异步更新视图的，也就是说数据修改并不会立刻修改视图，我们想要在数据异步的更新了视图后再做一些事情就要用这个方法</font>
+ <font color=#3eaf7c>实例</font>：
  ```javascript
  new Vue({
    methods: {
      example: function () {
        // 修改数据
        this.message = 'changed'
        // DOM 还没有更新
        this.$nextTick(function () {
          // DOM 现在更新了
          // `this` 绑定到当前实例
          // doSomethingElse的执行一定在视图渲染后
          this.doSomethingElse()
        })
      }
    }
  })
  ```
  当我们在`this.$nextTick`中调用了`doSomethingElse`就确保了在整个异步的过程，程序执行的顺序是<font color=#3eaf7c>数据修改</font> -> <font color=#3eaf7c>视图更新</font> -> <font color=#3eaf7c>doSomethingElse</font>
+ <font color=#3eaf7c>注意</font>：
  我们在上面介绍的所有实例的方法和属性在外部都是通过`app.$xxx`执行的，在内部通过`this.$xxx`执行的，因为在实例内部`this`指代的就是`app`实例本身。这个你应该非常了解了。

