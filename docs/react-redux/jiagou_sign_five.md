# React架构设计基础思想

## 项目结构设计
`React`+`Redux`作为业务最为流行和最常用的技术栈，有多种项目结构组织方式，我们来看看：
+ <font color=#9400D3>按照类型</font>
+ <font color=#9400D3>按照功能模块</font>
+ <font color=#9400D3>Ducks</font>

### 1. 按照类型
<font color=#DD1144>类型指的是该文件在项目中充当的角色类型</font>

基本上就是我们之前使用的`TodoList`项目结构，`action`相关的文件全部写在`action`文件夹下，容器性组件全部写在`containers`文件夹的当中，如下所示：
+ src
	+ actions
		+ actions1.js
		+ actions2.js
	+ components
		+ Component1.js
		+ Component2.js
	+ containers
		+ Container1.js
		+ Container2.js
	+ reducers
		+ index.js
		+ reducer1.js
		+ reducer2.js
	+ index.js

<font color=#1E90FF>按照类型的这种项目结构的创建方式，开发一个功能需要在不同的文件下进行操作修改，在大型项目当中和多人合作的时候，这种方式不推荐，即不利于功能的开发也不利于多人合作</font>

### 2. 按照功能模块
<font color=#DD1144>按照功能模块定义文件结构基本上是一个功能一个文件夹</font>

和这个功能模块相关的`reducer`、`components`、`container`、`action`都会放在这个功能模块的文件夹当中：
+ src
	+ feature1
		+ components/
		+ Comtainer.js
		+ action.js
		+ reducer.js
	+ feature1
		+ components/
		+ Comtainer.js
		+ action.js
		+ reducer.js

<font color=#1E90FF>这种模式基本是利于功能的开发和拓展，很多github上的项目都是这样，但是这样的方式也有问题，不同的功能模块之间会出现状态耦合的情况，项目越大，这种情况就越明显</font>

### 3. Ducks
这种项目的组织方式最开始来源于：[https://github.com/erikras/ducks-modular-redux](https://github.com/erikras/ducks-modular-redux)

<font color=#DD1144>这种方式提议将相关的reducer，action，actionTypes写在一个文件当中，本质上是以应用的状态作为模块的划分依据，而不是界面功能，这样管理相同的依赖都在一个文件当中，不管哪个容器性组件需要这部分状态，只需要在组件中引入这个状态对应的文件即可</font>

+ src
	+ components/ （放置整个应用级别的通用组件）
	+ containers 	（按照页面的功能模块进行划分，每一个功能模块对应一个文件夹）
		+ feature1
			+ components/ （存放该功能模块专用的组件）
			+ index.js    （容器型组件，对外暴露的接口）
		+ feature2
	+ redux
		+ index.js
		+ module1.js（一个模块当中包含actionTypes，reducer，actionCreators）
		+ module2.js
	+ index.js

我们来看看`src/redux/modules1.js`:
```javascript
// Actions （ActionTypes）
const LOAD   = 'widget/LOAD';
const CREATE = 'widget/CREATE';
const UPDATE = 'widget/UPDATE';
const REMOVE = 'widget/REMOVE';

const initialState = {
  widget: null,
  isLoading: false,
}

// Reducer
export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD: 
      //...
    case CREATE:
      //...
    case UPDATE:
      //...
    case REMOVE:
      //...
    default: return state;
  }
}

// Action Creators
export const actions = {
  loadWidget: function loadWidget() {
    return { type: LOAD };
  },
  createWidget: function createWidget(widget) {
    return { type: CREATE, widget };
  },
  updateWidget: function updateWidget(widget) {
    return { type: UPDATE, widget };
  },
  removeWidget: function removeWidget(widget) {
    return { type: REMOVE, widget };
  }
}

```
<font color=#1E90FF>这种Duck的方式会根据应用的状态进行模块的划分，围绕某个应用状态，相对应的reducer和action都会定义在同一个文件当中，这种方式就将该项目的开发人员分为了两个部分，一部分只负责UI层，一部分负责状态层</font>

## redux-state设计
之前我们讲过`React`当中的`state`的设计，但是在`Redux`当中，`State`是全局唯一的，需要将所有组件的状态组合成为一个大的状态对象，<font color=#1E90FF>所以对于Redux中的State的设计，我们需要做更多的抽象和组件之间不同状态关联关系的梳理工作</font>

### 1. 常见错误
我们通常在设计`Redux`当中的`State`有两个常见的错误：
+ <font color=#9400D3>以API为设计State的依据</font>
+ <font color=#9400D3>以页面UI为设计State的依据</font>

这两种错误呢，<font color=#1E90FF>通常第一个犯的人比较多，第二个呢一般人不会犯</font>，因为比较极端。

<font color=#1E90FF>**① API为依据**</font>

什么是以`API`为设计`State`的依据？简单的说就是`API`是啥结构，我们`Redux`中的`State`就是啥结构，这属于比较极端的一种做法。

为什么说以`API`为设计`State`的依旧是不好的，就是因为`API`的设计是基于后端设计的，而不是前端，如果直接按照后端`API`数据接口来定义我们的`Redux`的`State`，你会发现好多状态都是数组类型，并且不同状态之间存在太多重复性的数据。

<font color=#1E90FF>**② UI为依据**</font>

什么是以页面`UI`为设计`State`的依据？比如我们之前的`TodoList`那个小项目，列表是根据筛选条件的不同显示不同的内容的，所以如果根据`UI`为依据，我们就会设置`all`为一个`State`，里面是包含所有数据的列表，还会设置一个`completed`为一个`State`，里面是包含所有已经完成的待办事项的列表，最后设置一个`active`的`State`，里面是包含未完成的待办事项的列表。

以页面UI为设计`State`的也不太好，按照我们举的`TodoList`的例子，很容易看出`all`、`completed`以及`active`三者之间包含大量重复的数据，而且如果新增一个待办事项，`all`都和`active`要同时修改，存在数据不一致的风险。

### 2. 设计原则
<font color=#DD1144>对于Redux当中State的设计，我们要像设计数据库一样去设计State</font>，这里你会疑惑，那设计数据库的基本原则是啥？

+ <font color=#1E90FF>数据按照领域(Domain)分类，存储在不同的表中，不同的表中存储的列数据不能重复</font>
+ <font color=#1E90FF>表中每一列的数据都依赖于这张表的主键</font>
+ <font color=#1E90FF>表中除了主键以外的其他列，相互之间不能有直接依赖的关系</font>

虽然可能设计数据库的原则你不太懂，但下面我们将翻译成为设计`Redux`当中的`State`的原则。
+ <font color=#9400D3>数据按照领域把整个应用的状态按照领域(Domain)分成若干子State，子State之间不能保存重复的数据</font>
+ <font color=#9400D3>State以键值对的结构存储数据，以记录的key/Id作为记录的索引，记录中的其他字段都依赖于索引</font>
+ <font color=#9400D3>State中不能保存可以通过已有数据计算而来的数据，即State中的字段不互相依赖</font>

### 3. 案例讲解
现在我们就从下面提供的这三个`API`来具体根据设计原则设计一下`State`：
```javascript
// 获取博客列表： /posts
[
  {
    "id": 1,
    "title": "Blog Title",
    "create_time": "2017-01-10T23:07:43.248Z",
    "author": {
      "id": 81,
      "name": "Mr Shelby"
    }
  }
  ...
]

// 获取博客详情：/posts/{id}
{
    "id": 1,
    "title": "Blog Title",
    "create_time": "2017-01-10T23:07:43.248Z",
    "author": {
      "id": 81,
      "name": "Mr Shelby"
    },
    "content": "Some really short blog content. "
}

// 获取博客的评论：/posts/{id}/comments
[
  {
    "id": 41,
    "author": "Jack",
    "create_time": "2017-01-11T23:07:43.248Z",
    "content": "Good article!"
  }
  ...
]
```
下面的分析过程，希望大家详读：

<font color=#DD1144>按照第一条规则，按照领域划分成不同领域，子State不能有重复的数据，那么获取博客列表和获取博客详情就有重复的数据，因为后者是前者列表中的一条数据而已，所以很清楚的就能想到在数据库中每个博客就一个领域，因为博客的title，content，created_at，author，comments都和博客的主键有依赖关系，另外你会发现author字段中还有id和name，而name是依赖于author当中的id的，很明显在数据库中肯定也有author这个单独的表，所以author应该是一个单独的领域，最后的评论comment那自然也是一个领域了，因为author，create_time以及content都依赖comments当中的id，所以按照这三个领域我们redux当中state基本上根据API能分出三个posts，authors，comments，另外因为第二条原则，我们需要将给State当中的每个状态添加一个key，而且如果你需要有序的posts，你可以定义postIds，如下所示</font>

```javascript
{
  "posts": {
    "1": {
      "id": 1,
      "title": "Blog Title",
      "content": "Some really short blog content.",
      "created_at": "2016-01-11T23:07:43.248Z",
      "author": 81,
      "comments": [
        352
      ]
    }
    ...
  },
  "postIds": [1, ...],
  "comments": {
    "352": {
      "id": 352,
      "content": "Good article!",
      "author": 41
    },
    ...
  },
  "authors": {
    "41": {
      "id": 41,
      "name": "Jack"
    },
    "81": {
      "id": 81,
      "name": "Mr Shelby"
    },
    ...
  }
}
```

到这里我们也只是根据`API`定制了一部分的`Redux`当中的`State`，但是我们UI上面还需要根据许多`State`来渲染不同的内容，这部分属于`UI`，或者应用状态级别的`State`，这些`State`有一种特点，很分散，我们可以将其统一起来，与之前的定义好的三个`State`合并，而且之前说的`postIds`也可以合并到`posts`当中，如下所示：
```javascript
{
  "app":{
    "isFetching": false,
  	"error": "",
  },
  "posts":{
    "byId": {
      "1": {
        ...
      },
      ...
    },
    "allIds": [1, ...],
  }
  "comments": {
    ...
  },
  "authors": {
    ...
  }
}
```
所以整个设计过程我们已经讲完，按照这样设计`State`，结合我们前面的项目设计，很容易想到这四个`State`，会成为`reducer`中不同的模块存在于`redux`文件夹当中：

+ src
	+ components
	+ containers
	+ redux
		+ index.js
		+ <font color=#1E90FF>app.js</font> （<font color=#1E90FF>对应于app这个State</font>）
		+ <font color=#1E90FF>posts.js</font> （<font color=#1E90FF>对应于posts这个State</font>）
		+ <font color=#1E90FF>comments.js</font> （<font color=#1E90FF>对应于comments这个State</font>）
		+ <font color=#1E90FF>authors.js</font> （<font color=#1E90FF>对应于authors这个State</font>）
		+ ...
	+ index.js
