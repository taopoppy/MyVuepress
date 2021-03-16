# 路由函数和事件冒泡

## NavigateTo和RedirectTo的区别
首先在跳转的`url`设置当中，我们可以设置绝对路径也可以设置相对路径，绝对路径是以`/`开头的，代表根目录。<font color=#1E90FF>一般路由跳转都使用的是绝对路径</font>

+ <font color=#1E90FF>NavigateTo</font>的本质是打开一个新的页面，但同时保留了旧的页面，也就是说旧的页面进入了`onHide`状态，同时进入了<font color=#1E90FF>页面栈</font>当中，值得一提的就是<font color=#DD1144>页面栈中最多只能有10个页面</font>。表现在小程序UI上的情况就是，通过`NavigateTo`跳转后的页面左上角有返回上一页的返回按钮。

+ <font color=#1E90FF>RedirectTo</font>的本质是重定向到一个页面，旧的页面就卸载了，也就是说旧的页面进入了`onUnload`状态。表现在小程序UI上的情况就是，通过`RedirectTo`跳转后的页面左上角只有一个返回首页的按钮，而不是返回上一页。

对于路由方面的文档，[官网文档](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/route.html)书写的还是很清楚的。

## Catch与Bind事件
我们俗称`Bind`为<font color=#1E90FF>冒泡事件</font>、`Catch`为<font color=#1E90FF>非冒泡事件</font>

冒泡事件的本质就是<font color=#1E90FF>触发节点本身的事件后，事件还会冒泡到父节点，父节点的事件也会被触发</font>
```html
<view catch:tap="onTap1">
	<view catch:tap="onTap2">
		<view bind:tap="onTap3">Click</view>
	</view>
</view>
```
比如说点击`Click`按钮，会触发`onTap3`事件，同时会向上冒泡，触发`onTap2`，但是由于`onTap2`是被`catch`住了，所以没有继续向上冒泡，故`onTap1`并不会被触发。

## 模块的导入导出
关于模块的导入导出，首先想到的就是`require`和`import`，小程序里面默认使用的是`require`和`module.exports`的方式，类似于`nodejs`中的模块写法。这也是老版小程序的写法。
```javascript
// 导出
module.exports = {
	playlist
}

// 导入
const { playlist } = require('../../data/data.js') // require只能使用相对路径
```

还有新的一种导入导出的就是`ES6`模块，使用`import`和`export`的方法：
```javascript
// 导出
export {
	playlist
}

// 导入
import { playlist } from '../../data/data.js'
```

## 自定义属性data
在组件节点中可以附加一些自定义数据。这样，在事件中可以获取这些自定义的节点数据，用于事件的逻辑处理。

在`WXML`中，这些自定义数据以`data-`开头，多个单词由连字符`-`连接。这种写法中，连字符写法会转换成驼峰写法，而大写字符会自动转成小写字符。如：
+ `data-element-type`，最终会呈现为`event.currentTarget.dataset.elementType`；
+ `data-elementType` ，最终会呈现为`event.currentTarget.dataset.elementtype`。
示例：
```javascript
<view data-alpha-beta="1" data-alphaBeta="2" bindtap="bindViewTap"> DataSet Test </view>
Page({
  bindViewTap:function(event){
    event.currentTarget.dataset.alphaBeta === 1 // "-"会转为驼峰写法
    event.currentTarget.dataset.alphabeta === 2 // 大写会转为小写
  }
})
```
这种写法和我们之前在`react`和`vue`当中不太一样，`react`当中是可以将参数写在事件函数当中额，比如：
```javascript
<div onClick={() => onClick(params)}></div>
```

## onLoad获取查询参数
一些商品的详情页需求根据传入的不同的商品id去获取不同的商品进行展示，<font color=#1E90FF>详情页需要在onLoad生命周期函数当中去获取参数</font>

```javascript
// 路由跳转
const pid = 3
wx.NavigateTo({
	url: `/pages/post-detail/post-detail?pid=${pid}`
})

// 跳转后的页面获取参数
onLoad: function(options) {
	console.log(options) // {pid: 3} 通过options.pid可以拿到pid
}
```