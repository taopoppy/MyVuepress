# 小程序的语言

## WXML
`WXML`的全称是`WeiXin Markup Language`，是小程序框架设计的一套标签语言，结合小程序的基础组件，事件系统，可以构建出页面的结构，充当的就是类似`HTML`的角色。在微信当中有自己的一套组件库，我们可以在下面列出的官网地址去查看组件用法和属性信息：
+ [https://developers.weixin.qq.com/miniprogram/dev/component/view.html](https://developers.weixin.qq.com/miniprogram/dev/component/view.html)

### 1. 数据绑定
+ 小程序中的数据一般情况下需要动态的从服务端获取，然后再渲染输出到视图中显示。
+ `WXML`中的动态数据均来自对应的`Page`的`data`
+ 数据绑定使用`Mustache`语法（双大括号）将变量包起来

### 2. 条件渲染
+ 使用下面这种方式来判断是否需要渲染改代码块，也可以用`wx:elif`和`wx:else`来添加一个`else`块
  ```javascript
  wx:if = "{{ condition }}"
  ```
+ 使用`hidden`来控制组件的显示与否
+ `wx:if`和`hidden`的区别就是前者条件为真就会显示到`wxml`当中，条件为否就不会出现在`wxml`当中，后者是无论条件为真或者为假都会显示到`wxml`当中，只是通过`hidden`控制页面的显示与否，这个和`Vue`中的`v-if`,`v-else`,`v-show`的区别差不多
+ 所以我们如果会频繁的变更显示与否应该使用`hidden`,否则使用`wx:if`

## WXSS
`WXSS`全称是`WeiXin Styles Sheets`，是一套用于小程序的样式语言，用于描述WXML的组件样式，也是视觉上的效果。它有两个要注意的点，如下：
+ 尺寸单位：<font color=#3eaf7c>rpx</font>可以根据屏幕宽度进行自适应，适配不同宽度的屏幕
+ 引入外部`wxss`: <font color=#3eaf7c>`@import './test_0.wxss'`</font>

### 1. 尺寸单位
我们首先要说的是官网上关于`rpx`的一段解释：
`rpx（responsive pixel）: 可以根据屏幕宽度进行自适应。规定屏幕宽为750rpx。如在 iPhone6 上，屏幕宽度为375px，共有750个物理像素，则750rpx = 375px = 750物理像素，1rpx = 0.5px = 1物理像素`

上面这段解释简单的就是说: <font color=#3eaf7c>使用rpx就表示无论什么宽度的屏幕都分为750rpx，也就是分为750份</font>，而且通常我们都是建议按照iphone6去做像素稿单位，因为iphone的像素是`375`，这样和`750`好换算，非常方便。

### 2. 引入样式
基本上我们都会在项目的`Styles`目录下面去写一些公共的样式，所以我们假如页面中需要，就在`.wxss`文件中使用`@import '../../style/common.wxss'`这种方式去引入样式，但是特别要注意的是这个路径是<font color=#3eaf7c>相对路径</font>，相对路径指的就是相对自己当前文件，引入的文件的路径地址。

除此之外我们通常会引入第三方的样式库，我们下面列举一下比较好的样式库：
+ <font color=#3eaf7c>WeUI</font>: 同微信原生视觉效果体验一致的基础样式库
+ <font color=#3eaf7c>iView</font>: 除了有微信的组件库还有PC端的组件库，还有后端管理系统
+ <font color=#3eaf7c>Vant</font>： 除了有微信的组件库还有PC端的组件库，轻量可靠

## JS
首先事件处理我们可以在下面列出的官网地址去学习一下：简单的说和Vue当中的差不多，通过在组件上绑定相应事件的处理函数，然后在`js`文件中写处理函数即可
+ [https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html)

### 1. 事件机制
比如在`.wxml`文件中有一端这样的函数：
```html
<button size="mini" bindtap="onTapHandlerAdd">点我+1</button>
<button size="mini" bindtap="onTapHandlerSub">点我-1</button>
<view>{{count}}</view>
```
然后我们在`.js`文件中添加两个处理函数: <font color=#3eaf7c>特别要注意修改数据要通过this.setData</font>，这一点和`React`是十分相似的
```javascript
  /**
   * 计数器点击+1事件
   */
  onTapHandlerAdd: function () {
    this.setData({
      count: this.data.count + 1
    })
  },
  /**
 * 计数器点击-1事件
 */
  onTapHandlerSub: function () {
    this.setData({
      count: this.data.count -1
    })
  }
```

### 2. bind VS catch
首先我们知道<font color=#3eaf7c>事件是对用户的交互操作行为的响应</font>，事件绑定我们在上面只说了`bind`,还有一种`catch`,我们在前端开发之中学到过<font color=#3eaf7c>事件冒泡</font>，最简单的例子就是子元素触发了点击事件，事件会冒泡到父元素，也就是父元素的点击事件也会被触发，那么我们在前端可以通过`e.stopPropagation()`阻止事件冒泡，但是在小程序当中很简单，<font color=#3eaf7c>我们可以通过catch阻止事件冒泡</font>，如下
```javascript
// 事件冒泡
<view class="box" bindtap="boxTap">
  <view class="childbox" bindtap="childrenboxTap"></view>
</view>

// 阻止事件冒泡
<view class="box" catchtap="boxTap">
  <view class="childbox" catchtap="childrenboxTap"></view>
</view>
```

### 3. 事件对象
总的来说：<font color=#3eaf7c>事件对象就是事件的状态</font>，当组件绑定的事件被触发后，就会传递这样一个事件对象到事件触发处理函数当中，我们在处理函数当中可以打印出事件对象有哪些属性：
```javascript
changedTouches: [{…}]
currentTarget: {id: "", offsetLeft: 0, offsetTop: 510, dataset: {…}}  // 当前组件属性集合
detail: {x: 149, y: 545}
target: {id: "", offsetLeft: 0, offsetTop: 510, dataset: {…}} // 触发事件的组件的属性的集合
timeStamp: 2479  // 事件戳
touches: [{…}]
type: "tap"    // 事件类型
_requireActive: true
__proto__: Object
```

然后比如我们要自定义一个属性在组件当中，比如`data-id="1234"`，我们在触发事件的处理函数中，这个自定义属性的值我们能在`target/dataset/id`当中找到`"1234"`这个值，如下：在`.wxml`中设置自定义属性`data-id`
```html
<view catchtap="boxTap" data-id="1234">
</view>
```
然后在`.js`文件的`boxTap`事件触发处理函数当中通过`event`对象可以拿到自定义属性的值：
```javascript
  boxTap: function (event) {
    console.log(event.target.dataset.id) // 1234
  },
```

