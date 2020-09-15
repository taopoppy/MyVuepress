# 前端架构设计

## 概念与案例分析
### 1. 架构的概念
什么是软件架构，包含三个层次：<font color=#9400D3>抽象</font>、<font color=#9400D3>解耦</font>、<font color=#9400D3>组合</font>

<font color=#DD1144>我们需要将来源于正式业务场景的需求进行抽象，然后需要对整个系统进行解耦，也就是将其模块化，然后根据业务场景的功能，将各个模块按照接口规范组合到一起，这样就有了不同的业务功能的体现。所以这三者就一般意义的构成了我们的架构。</font>

<font color=#1E90FF>架构是最高层次的抽象，先有架构然后再去选取不同的框架和设计模式来实现架构，最后使用具体的代码来实现框架和设计模式</font>

### 2. 前端架构
前端架构有比较大的特殊性
+ 因为前端不是一个独立的子系统，但是整个系统当中每个子系统中都会包含前端，所以前端又横跨整个系统

+ 前端在整个架构中具有<font color=#9400D3>分散性</font>的特点，所以需要前端工程化来解决这类问题，前端工程化需要我们做到下面这些事情
	+ <font color=#DD1144>可控</font>：脚手架，开发规范等
	+ <font color=#DD1144>高效</font>：框架，组件库，Mock平台，构建部署工具等

+ 前端的架构更多的是<font color=#9400D3>页面</font>的抽象，解耦和组合
	+ <font color=#1E90FF>抽象</font>
		+ <font color=#1E90FF>页面UI抽象</font> -> <font color=#1E90FF>组件</font>
		+ <font color=#1E90FF>通用逻辑抽象</font> -> <font color=#1E90FF>状态模块，网络请求，异常处理等</font>

<img :src="$withBase('/react_redux_jiagou_shizhan_jiagoutu.png')" alt="架构图">

所以像我们在一个复杂的页面当中进行分析，解耦出通用组件的过程，我们就是在做前端架构的事情，还有对通用的网络请求抽离封装，这也是前端架构的事情，<font color=#DD1144>所以如何进行架构设计呢？理解和梳理业务是架构的第一步，通常会根据需求文档和原型图来进行梳理，当然了没有这些你只能根据功能点来分析</font>
+ 展示：首页-> 详情页
+ 搜索：搜索页 -> 结果页
+ 购买：登录 -> 下单 -> 我的订单 -> 注销

## 工程化准备
### 1. 技术选型和项目脚手架
技术选型考虑的三要素
+ <font color=#1E90FF>业务满足程度</font>
+ <font color=#1E90FF>技术栈的成熟度(使用人数，周边生态，仓库维护等)</font>
+ <font color=#1E90FF>团队的熟悉度</font>

我们的技术选型基本都是最成熟和最常用的
+ <font color=#1E90FF>脚手架</font>：`create-react-app`
+ <font color=#1E90FF>UI层</font>：`React`
+ <font color=#1E90FF>路由</font>：`React Router`
+ <font color=#1E90FF>状态管理</font>：`Redux`

### 2. 基本规范
使用脚手架创建完项目，有了初始化的所有东西，我们就应该来考虑三个东西：<font color=#9400D3>目录结构</font>、<font color=#9400D3>构建体系</font>、<font color=#9400D3>Mock数据</font>

<font color=#1E90FF>**① 目录结构**</font>

+ <font color=#1E90FF>node_modules/</font>
+ <font color=#1E90FF>public/</font>
	+ <font color=#1E90FF>mock/</font>（Mock文件）
		+ <font color=#1E90FF>products/</font>（和产品相关的Mock数据）
			+ <font color=#9400D3>likes.json</font>
+ <font color=#1E90FF>src/</font>
	+ <font color=#1E90FF>utils/</font>（工具类文件夹）
	+ <font color=#1E90FF>images/</font>（图片文件夹）
	+ <font color=#1E90FF>redux/</font>
		+ <font color=#1E90FF>middleware/</font>（redux中间件文件夹）
		+ <font color=#1E90FF>modules/</font>（redux模块文件夹）
	+ <font color=#1E90FF>components/</font>（全局通用性展示型组件文件夹）
		+ <font color=#1E90FF>Header/</font>
			+ <font color=#9400D3>index.js</font>（Header通用组件的js代码文件）
			+ <font color=#9400D3>style.css</font>（Header通用组件的css代码文件）
	+ <font color=#1E90FF>containers/</font>（全局通用性容器型组件文件夹）
		+ <font color=#1E90FF>App/</font>
			+ <font color=#9400D3>index.js</font>
			+ <font color=#9400D3>style.css</font>
		+ <font color=#1E90FF>Home/</font>
			+ <font color=#1E90FF>components/</font>（Home容器型组件中用到的私有展示型组件文件夹）
			+ <font color=#9400D3>index.js</font>
			+ <font color=#9400D3>style.css</font>
+ <font color=#9400D3>.gitignore</font>
+ <font color=#9400D3>package.json</font>
+ <font color=#9400D3>README.md</font>

基本上这个目录结构是一个比较好的结构了。关于最终的目录我们会在最后进行展示。

<font color=#1E90FF>**② 构建体系**</font>

关于构建，其实使用到的命令就两个`npm start`和`npm build`，因为脚手架已经封装了`webpack`的配置，我们通常直接用即可。

<font color=#1E90FF>**③ Mock数据**</font>

之前我们说的两个`Mock`的方法，我们这里直接采用第二种比较方便的方法，如果你想使用第一种，也可以参考我们前面讲的内容。

## 状态模块定义
### 1. Redux模块两层化概念
我们知道<font color=#DD1144>状态是决定整个前端应用的展示以及前端数据流正常工作的核心</font>，我们前面已经说过前端架构的抽象大多是页面的抽象，页面UI的抽象就是组件，这是不需要我们抽象的，使用`react`本身就是组件化的抽象，那我们通用逻辑的抽象就有下面这些：
+ <font color=#DD1144>领域实体</font>：商品，店铺，订单，评论等信息
+ <font color=#DD1144>各个页面的UI状态（普通的UI状态）</font>：多选框，输入框的内容等
+ <font color=#DD1144>前端基础状态（特殊的UI状态）</font>：登录态，全局异常信息，各个页面共享的UI状态，俗称通用前端状态

对于上面这三个状态，我们在`redux`状态设计的时候又可以将领域实体单独分一层，然后普通的UI状态和特殊的UI状态合并一层，统称UI状态层，这就是我们俗称的<font color=#9400D3>Redux模块两层化</font>

<img :src="$withBase('/react_redux_jiagou_state.png')" alt="">

+ <font color=#1E90FF>容器组件可以根据页面状态和通用的前端状态获取到需要的状态信息，而页面状态又可以根据领域状态获取到领域信息，所以容器型组件只需要和第一层（页面状态和通用前端状态）交互即可</font>

+ <font color=#DD1144>容器型组件需要的领域状态的信息就通过页面状态去获取即可，这样领域状态可以在各个页面之间进行复用，并且在页面状态调用领域状态的时候可以对领域状态进行一些预处理，比如说数据结构的转化等，获得符合容器组件显示规范的领域状态</font>

### 2. Redux模块两层化实现
下面我们使用代码来实现`Redux`模块两层化:

## 网络请求层封装

## 通用错误处理
