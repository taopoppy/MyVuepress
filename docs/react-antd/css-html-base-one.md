# CSS 基础篇
在学习之前，我们来在`VSCODE`当中安装几个插件，帮助我们更好的书写`CSS`
+ <font color=#DD1144>Caniuse</font>: 查看CSS兼容性
+ <font color=#DD1144>CSScomb</font>: 排序CSS属性

## 浏览器
世界五大浏览器：`Chrome`、`Safari`、`Firefox`、`Opera`、`IExplorer/Edge`

### 1. 渲染引擎
<font color=#9400D3>渲染引擎</font>: 又名<font color=#DD1144>浏览器内核</font>，指负责对网页语法解析并渲染成一张可视化页面的解析器。它是浏览器最核心最重要的部位，不同内核对网页语法的解析也有不同，因此同一网页语法在不同内核的浏览器中的渲染效果也可能不同，这就是常说的浏览器差异性。

上述提到的世界五大浏览器，在自身的发展过程中都使用了一种或多种浏览器内核作为自身的渲染引擎。
+ `Google Chrome`：`Webkit`(前期)、`Blink`(后期)
+ `Apple Safari`：`Webkit`
+ `Mozilla Firefox`：`Gecko`
+ `ASA Opera`：`Presto`(前期)、`Blink`(后期)
+ `Microsoft IExplorer`：`Trident`
+ `Microsoft Edge`：`Trident`(前期)、`Blink`(后期)

### 2. 渲染过程
<font color=#1E90FF>要了解浏览器页面的渲染过程，首先得知道关键渲染路径。关键渲染路径指浏览器从最初接收请求得到HTML、CSS、JS等资源，然后解析、构建、渲染、布局、绘制、合成，到最后呈现在用户眼前界面的整个过程。</font>

页面的渲染过程分为以下几部分。

+ <font color=#DD1144>解析文件</font>
	+ <font color=#3eaf7c>HTML解析器将html文件转换为<font color=#9400D3>DOM树</font></font>
	+ <font color=#3eaf7c>CSS解析器将css文件转换为<font color=#9400D3>CSSOM树</font></font>
	+ <font color=#3eaf7c>渲染引擎将DOM树和CSSOM树合并生成<font color=#9400D3>渲染树</font></font>
+ <font color=#DD1144>绘制图层</font>
	+ <font color=#3eaf7c>根据渲染树布局(<font color=#9400D3>回流</font>)</font>
	+ <font color=#3eaf7c>根据布局绘制(<font color=#9400D3>重绘</font>)</font>
+ <font color=#DD1144>合成图层</font>：
	+ <font color=#3eaf7c>合成图层显示在屏幕上</font>

下面我们具体讲解上面这几个过程

<font color=#1E90FF>**① 解析文件**</font>

`HTML`文档描述一个页面的结构，浏览器通过<font color=#1E90FF>HTML解析器</font>将`HTML`解析成`DOM`树结构。`HTML`文档中所有内容皆为节点，各节点间拥有层级关系，彼此相连，构成`DOM`树。构建`DOM`树的过程：读取`HTML`文档的字节(Bytes)，将字节转换成字符(Chars)，依据字符确定标签(Tokens)，将标签转换成节点(Nodes)，以节点为基准构建`DOM`树。简述为：<font color=#1E90FF>字节 -> 字符 -> 标签 -> 节点 -> DOM树</font>

`CSS`文档描述一个页面的表现，浏览器通过<font color=#1E90FF>CSS解析器</font>将`CSS`解析成`CSSOM`树结构，与`DOM`树结构比较像。`CSS`文档中所有内容皆为节点，与`HTML`文档中的节点一一对应，各节点间拥有层级关系，彼此相连，构成`CSSOM`树。构建`CSSOM`树的过程：读取`CSS`文档的字节(Bytes)，将字节转换成字符(Chars)，依据字符确定标签(Tokens)，将标签转换成节点(Nodes)，以节点为基准构建`CSSOM`树。与`DOM`树的构建过程完全一致。

在构建`DOM`树的过程中，当`HTML`解析器遇到`script`时会立即阻塞`DOM`树的构建，将控制权移交给浏览器的`JS`引擎，等到`JS`引擎运行完毕，浏览器才会从中断的地方恢复`DOM`树的构建。`script`的脚本加载完成后，`JS`引擎通过`DOM API`和`CSSOM API`操作`DOM`树和`CSSOM`树。为何会产生渲染阻塞呢？<font color=#DD1144>其根本原因在于：JS操作DOM后，浏览器无法预测未来DOM的具体内容，为了防止无效操作和节省资源，只能阻塞DOM树的构建</font>。

<img :src="$withBase('/react_antd_css_browser.png')" alt="">

<font color=#1E90FF>浏览器的渲染引擎将DOM树和CSSOM树合并生成渲染树，只渲染需显示的节点及其样式。DOM树、CSSOM树和渲染树三者的构建并无先后条件和先后顺序，并非完全独立而是会有交叉并行构建的情况。因此会形成一边加载，一边解析，一边渲染的工作现象。</font>

<font color=#1E90FF>**② 绘制图层**</font>

现在我们要搞清一个特别重要的问题，就是什么是重绘回流：

<font color=#DD1144>进入绘制阶段，遍历渲染树，调用渲染器的paint()在屏幕上绘制内容。根据渲染树布局计算样式，即每个节点在页面中的布局、尺寸等几何属性。HTML默认是流式布局，CSS和JS会打破这种布局，改变DOM的几何属性和外观属性。在绘制过程中，根据渲染树布局，再根据布局绘制，这就是常听常说的回流重绘。</font>

在此涉及到两个核心概念：回流、重绘。笔者用两句精简的话分别概括它们。
+ <font color=#9400D3>回流</font>：<font color=#DD1144>几何属性需改变的渲染</font>
+ <font color=#9400D3>重绘</font>：<font color=#DD1144>更改外观属性而不影响几何属性的渲染</font>

<font color=#1E90FF>当生成渲染树后，至少会渲染一次。在后续交互过程中，还会不断地重新渲染。这时只会回流重绘或只有重绘。因此引出一个定向法则：回流必定引发重绘，重绘不一定引发回流</font>。

<font color=#1E90FF>**③ 合成图层**</font>

将回流重绘生成的图层逐张合并并显示在屏幕上。<font color=#DD1144>上述几个步骤并不是一次性顺序完成的，若DOM或CSSOM被修改，上述过程会被重复执行</font>。实际上，`CSS`和`JS`往往会多次修改`DOM`或`CSSOM`，简单来说就是<font color=#DD1144>用户的交互操作引发了网页的重渲染</font>。

### 3.兼容性
兼容性又名网站兼容性或网页兼容性，指网页在各种浏览器上的显示效果可能不同而产生浏览器和网页间的兼容问题。

说到兼容性，就不得不推荐一个专门为前端开发者定制可查询`CSS/JS`特性在各种浏览器中兼容性的网站`Caniuse`，它可很好地保障网页在不同浏览器间的兼容性。有了这个工具可快速地了解使用到的代码在各个浏览器中的效果。所以后续使用`VScode`编码的过程中都会顺带使用`Caniuse`查看`CSS`属性以及选择器的兼容性。

以下聊聊处理`CSS`兼容性的三种方法，相对处理`JS`兼容性来说简单到不得了，这也是普遍前端开发者认为`CSS`简单的原因之一。

<font color=#1E90FF>**① 磨平浏览器默认样式**</font>

<font color=#1E90FF>每个浏览器的CSS默认样式不尽相同，所以最简单最有效的方法就是对其默认样式初始化。以下推荐两种磨平浏览器默认样式的方法，在接入其他css文件前将其导入，天下太平</font>

+ <font color=#DD1144>normalize.css</font>: 有官网，可以上去查看
+ <font color=#DD1144>reset.css</font>：开发者自定义的默认样式

<font color=#1E90FF>**② 插入浏览器私有属性**</font>

在使用`Webpack`打包项目代码的过程中，可接入<font color=#9400D3>postcss-loader</font>和<font color=#9400D3>postcss-preset-env</font>，`postcss-preset-env`内置了`autoprefixer`，它会依据`Caniuse`所提供的数据对代码里的`CSS3`属性批量添加私有属性

<font color=#1E90FF>如果你经常使用脚手架去开发项目，很多脚手架已经内置了这些配置，所以使用自动化工具的好处就是解决这些没有啥技术含量的问题</font>

<font color=#1E90FF>**③ CSS hack**</font>

不重要，也用不到，已经过时。

## 盒模型

## 样式计算
