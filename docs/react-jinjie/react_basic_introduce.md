# React的组件和JSX

## 历史背景和特性介绍
传统页面的问题：
+ <font color=#DD1144>传统UI操作关注太多细节</font>
  + 因为如果一个复杂的页面，你需要知道很多细节才能去修改状态和更新UI
  + 传统`dom`存在太多`API`的方法，如果页面复杂，会用到很多不同的`API`，不同的`API`势必会涉及到很多`DOM`的细节
+ <font color=#DD1144>应用程序状态分散在各处，难以追踪和维护</font>

<font color=#1E90FF>**① react如何解决UI细节问题**</font>

那么`React`提出了一个全新的思想：<font color=#1E90FF>始终整体“刷新”页面，无需关注细节</font>。基本上这样的思路就从<font color=#3eaf7c>局部刷新</font>转化到了<font color=#3eaf7c>整体刷新</font>，你只需要关注<font color=#3eaf7c>状态</font>和<font color=#3eaf7c>最终UI</font>长什么样子即可。举个例子：
```javascript
{ text : 'message1' },                                         <ul>
{ text : 'message2' },                  局部刷新                   <li>message1</li>
----------------------       ->  Append <li>message3</li>         <li>message2</li>
{ text : 'message3' },                                         </ul>
```
```javascript
{ text : 'message1' },                                         <ul>
{ text : 'message2' },               react整体刷新                   <li>message1</li>
{ text : 'message3' },                     ->                       <li>message2</li>
                                                                    <li>message3</li>
                                                               </ul>
```
+ 传统数据变更的时候，我们需要只通过`DOM`操作数据添加到`UI`中去，你必须要知道原有的`DOM`结构和要使用的`DOM`方法，设计到细节太多
+ `react`的开发模式是你只需要知道当前的数据结构和最终数据展现在`UI`的样子就可以了


所以这样看起来`react`其实很简单，体现在4个方面：
+ <font color=#DD1144>引入1个新概念</font>：用组件来描述`UI`
+ <font color=#DD1144>4个必须API</font>：上手简单，因为引入的API少
+ <font color=#DD1144>单项数据流</font>：后面会具体介绍
+ <font color=#DD1144>完善的错误提示</font>：错误提示和定位都很清晰好用

<font color=#1E90FF>**② react如何解决数据模型**</font>

<img :src="$withBase('/react_shizhan_shujumoxing.png')" alt="react数据模型">

传统`MVC`是难以扩展和维护的，如上图左边所示，因为存在了太多了`Model`和`View`，而不同的`Model`和`View`之间关系错综复杂，而且是双向绑定的，导致出了错就不知道哪边的错误。

而`react`提出的<font color=#DD1144>Flux架构</font>并不是一套具体的技术实现，而是一套设计模式，核心思想就是：<font color=#DD1144>单项数据流</font>。<font color=#1E90FF>所以Flux是建立在react始终以状态来展示UI的</font>，所以`Flux`架构也衍生出了很多项目，比如`Redux`和`Mobx`。

## 以组建方式考虑UI的构建
<font color=#1E90FF>**① UI的组成**</font>

理解`React`组件我们有一个特别好理解的共公式就是：
+ <font color=#1E90FF>props</font> + <font color=#1E90FF>state</font> = <font color=#1E90FF>View</font>

上面这个公式也很好理解，<font color=#DD1144>由属性和状态最终得到一个View</font>，我们可以这样去理解：
+ <font color=#3eaf7c>React组件可以理解为一个纯函数</font>：通过外部参数的传入，会得到一个确定的结果
+ <font color=#3eaf7c>React组件一般不提供方法，而是某种状态机</font>：外部传入的数据会成为组件的状态，状态确定页面
+ <font color=#3eaf7c>单项数据流</font>：外面传递数据一定通过props传入的

<font color=#1E90FF>**② 创建UI**</font>

如何创建一个组件？创建组件我们也需要考虑下面的三点：
+ <font color=#3eaf7c>创建静态的UI</font>：静态UI一般由原声的html的tag构建
+ <font color=#3eaf7c>考虑组件的状态组成</font>：它的状态需要外部传入还是内部进行维护
+ <font color=#3eaf7c>考虑组件交互的方式</font>：内部进行的操作如何暴露给外部的人使用

何时创建组件：<font color=#DD1144>单一职责原则</font>
+ <font color=#3eaf7c>每个组件只做一件事情</font>
+ <font color=#3eaf7c>如果组件变的复杂，那么应该拆分小组件</font>
  + 降低复杂度到各个小的组件当中
  + 性能提升，太大的组件中一个状态的更新会导致整个大的组件刷新，而小的组件状态没有改变就不会刷新

<font color=#1E90FF>**③ 数据状态管理**</font>

数据状态管理有一个比较重要的原则：<font color=#1E90FF>DRY原则</font>
+ <font color=#3eaf7c>组件尽量无状态，所需数据通过props获取</font>
+ <font color=#3eaf7c>能计算得到的状态就不要单独存储</font>：
  + 这个需要说一个简单的例子，比如在开始一个页面的时候会提供载入UI，这个是否显示这个载入UI并不需要你在组件当中去定义一个`state: isLoad`，然后根据`isLoad`的`true`和`false`去判断，直接根据页面当前是否已经通过`ajax`得到了返回数据去判断，返回数据会保存在`state:data`,你就可以这样写：
  ```javascript
  {this.state.data ? <Loading/>: <ShowData/>}
  ```
+ 通过减少内部状态的定义来提高组件的可用性和复用性

## JSX
### 1. JSX的本质
<font color=#DD1144>JSX并不是一种模板语言，而是一种语法糖</font>

因为`JSX`的目的是通过用更方面的表达来帮助你创建组件，比如下面两种写法是一样的，如果是你，你会怎么选择？
```javascript
// 第一种写法
const name = 'taopoppy'
const element = <h1>hello, { name }</h1>

// 第二种写法
const name = 'taopoppy'
const element = React.createElement('h1', null, 'Hello,', name)
```
我们来看一个更复杂的例子帮助你理解`JSX`的本质,因为我们普通来写`UI`的方法就是使用模板语言，然后传入一些变量进去，但是对于`JSX`来讲：<font color=#1E90FF>JSX就是纯的javascript</font>，所以`JSX`的本质就是：<font color=#DD1144>用原生JS动态的创建组件的语法糖</font>
```javascript
// 第一种写法
class ComponentBox extends React.Component {
  render() {
    return {
      <div className="comments">
        <h1>Comments ({ this.state.items.length })</h1>
        <ComponentList data = {this.state.items}/>
        <ComponentForm />
      </div>
    }
  }
}
ReactDOM.render(<ComponentBox topicId="1"/>, mountNode)

// 第二种写法
class ComponentBox extends React.Component {
  render() {
    return React.createElement(
      "div",
      { className: "comments" },
      React.createElement(
        "h1",
        null,
        "Comments (",
        this.state.items.length,
        ")"
      ),
      React.createElement(ComponentList, { data: this.state.items }),
      React.createElement(ComponentForm, null)
    )
  }
}
ReactDOM.render(
  React.createElement(ComponentBox, { topicId : "1"}),
  mountNode
)
```

### 2. 在JSX中使用表达式
那么如何在`JSX`当中使用`javascript`的一些特性呢？
<font color=#1E90FF>**① 使用表达式**</font>

+ <font color=#3eaf7c>JSX本身也是表达式</font>
  ```javascript
  const element = <h1>Hello, World</h1>
  ```
+ <font color=#3eaf7c>在属性中使用表达式</font>
  ```javascript
  <MyComponent foo={ 1+2+3+4} />
  ```
+ <font color=#3eaf7c>延展属性（ES6解构写法）</font>
  ```javascript
  const props = { firstName: 'Ben', lastName: 'Hector' }
  const greeting = <Greeting {...props} />
  ```
+ <font color=#3eaf7c>表达式作为子元素</font>
  ```javascript
  const element = <li>{ props.message }</li> // 作为子元素，这里的表达式必须是一个可以被render的节点Node
  ```
  
### 3. JSX的优点和约定
<font color=#1E90FF>**① React的优点**</font>

+ <font color=#3eaf7c>声明式创建界面的直观</font>
+ <font color=#3eaf7c>代码动态穿件界面的灵活</font>
+ <font color=#3eaf7c>无需学习新的模板语言</font>

<font color=#1E90FF>**② React的约定**</font>

+ <font color=#3eaf7c>自定义组件以大写字母开头，区分小写原生DOM节点</font>
+ <font color=#3eaf7c>JSX标记可以直接使用属性语法，例如<menu,Item /></font>