# 脚手架分析
<font color=#DD1144>所谓的脚手架就是一段node的程序，可以帮助我们生成一个项目，包含项目的目录和相关的依赖</font>

## CreateReateApp
通过`CreateReateApp`脚手架来生成一个项目：
```javascript
npx create-react-app my-app
```
使用脚手架生成的项目会有默认的`webpack`的很多配置，但是你打开项目并不能直接看到存在有`webpack`相关的配置文件，所以你会很迷惑，因为脚手架的目的是为了让开发更简单，而`webpack`实际上从零配置很复杂，所以脚手架将这样配置文件隐藏了起来，但是你可以从`package.json`文件中看到有一个`eject`的命令，我们可以通过跑这个命令来展示隐藏的这些配置文件：
```javascript
npm run eject
```
然后会多出两个文件件，<font color=#1E90FF>config</font>和<font color=#1E90FF>scripts</font>,其中`config`包含了`webpack`的相关配置和部分文件，`scripts`中包含了一些启动的文件，此时此刻你在看`package.json`中的内容，就有很多的新增加的依赖，同时启动命令也变成了：
```javascript
// package.json
{
	"scripts": {
    "start": "node scripts/start.js",
    "build": "node scripts/build.js",
  },
}
```
很明显的就说明了问题，通过启动`scripts/start.js`文件来执行启动整个程序，通过`scripts/build.js`文件来执行打包整个项目。而对于`config`文件夹中的几个文件，最重要的就是这么几个：
+ <font color=#3eaf7c>webpack.config.js</font>；最核心的webpack配置文件
+ <font color=#3eaf7c>webpackDevServer.config.js</font>：生产环境下`webpackDevServer`的核心配置
+ <font color=#3eaf7c>path.js</font>：保存了所有打包路径和目录相关的变量和配置
+ <font color=#3eaf7c>env.js</font>：初始化全局变量的文件

所以其实对于`create-react-app`这个脚手架，我们学习它要做三个事情  
<font color=#1E90FF>**① 搞清关系**</font>

搞清楚配置文件之间的关系，帮助我们理解脚手架的配置，当我们自己从零开始做配置的时候也可以参照脚手架中的配置文件的设计和使用，`create-react-app`脚手架的配置文件如下：

<img :src="$withBase('/webpac_five_react_webpack.png')" alt="create-react-app脚手架webpack配置">	

<font color=#1E90FF>**② 参考配置**</font>

如果有不懂的配置和配置项，包括插件和`loader`的使用都可以借鉴`create-react-app`当中的配置,看看它使用了那些插件和`loader`,这些我们使用这些插件和`loader`会更保险。

<font color=#1E90FF>**③ 学习配置**</font>

详细过一遍`webpack.config.js`和`webpackDevServer.config.js`的配置，学习一些没有见过的配置，和明白它书写的配置的含义，加深对`webpack`的理解。如果后续有时间，我会将它的配置加以注释，在这里列举出来

## VUE-Cli
安装脚手架工具，我们可以通过下面的命令去安装，然后去通过教授架创建一个项目
```javascript
// 安装脚手架
npm install -g @vue/cli
// 创建项目
vue create my-app 
```
基本上项目的结构和通过`create-react-app`脚手架生成的项目是一样的，都会隐藏关于`webpack`的配置，这都是对小白很好的对待，不会`webpack`我就不会将配置暴露给你，<font color=#DD1144>但是vue的脚手架并没有能暴露webpack配置的命令，它给了一个vue.config.js的文件配置来让你间接配置webpack</font>

所以你如果是通过`vue-cli`创建的项目，基本上要通过自己创建`vue.config.js`来做一些配置。好在这些配置参数和说明在[官网](https://cli.vuejs.org/zh/config/#vue-config-js)都有很清晰的中文说明。<font color=#1E90FF>虽然表面上vue的脚手架工具提供一套新的打包配置，但是实际上都被转化成为底层webpack的配置</font>，从这些也能侧面反映出`vue`和`react`的一些区别，<font color=#DD1144>react更灵活，vue更简单，无论从本质或者使用来看都是如此</font>。

到这里基本上，我们还要说一个更重要的东西，就是<font color=#1E90FF>怎么使用webpack才是正确的</font>。而这个问题只有一个正确的解答，就是<font color=#DD1144>熟读官网</font>，因为配置参数你永远不能全部记住，配置设计也永远在随着版本的更新在变化，只有多读官网，才能用好`webpack`，而且因为官网书写有很多类似的套路，明白这些套路，对于新的配置和说明我们也很快能明白它说的是什么意思。我们下面就要说怎么查官网：
+ <font color=#3eaf7c>指南</font>：比如代码分割或者过滤你忘记了查这个模块
+ <font color=#3eaf7c>配置</font>：看到别人用的一些配置自己不知道，可以查阅配置去看
+ <font color=#3eaf7c>概念</font>：这个是要永远记住的
+ <font color=#3eaf7c>插件</font>：要用插件的时候在这里查
+ <font color=#3eaf7c>loader</font>：要用`loader`的时候在这里查
+ <font color=#3eaf7c>API</font>：提供你要自己编写插件或者`loader`以及一些`webpack`内部配置的时候可以在这里查阅
