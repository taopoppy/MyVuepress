# 渲染和setData数据绑定

## 数据绑定
数据绑定基本上和前端框架一下，在`page.js`文件当中定义的`data`，可以在页面`page.wxml`当中直接使用：
```javascript
// page.js
Page({
	// 页面的初始数据
	data: {
		title: "2020DOTA2国际邀请赛"
	}
})
```
```html
<!--page.wxml-->
<text class="post-image">{{title}}</text>
```
这种写法基本就是数据绑定的方式，和传统的`React`和`Vue`如出一辙，我们在这里就不多说明，具体的原理应该去学习`React`的数据绑定或者`Vue`的双向绑定。

小程序大多使用的都是<font color=#1E90FF>单向数据绑定</font>，但是小程序也实现了<font color=#1E90FF>简易的双向数据绑定</font>，之所以是简易的，就是因为没有`Vue`那种响应式对象的双向绑定那么复杂。

小程序当中也可以像`React`或者`Vue`当中使用`Dom`节点相关的`API`,但是基本上是用不到，小程序作为本身业务不复杂的项目来说，基本用不到这种高级的操作。

## page.data&&this.setData
<font color=#DD1144>page.data只是定义了页面的初始数据，在通过this.setData设置的js对象，会将js对象全部加入到page.data当中，所以重复的属性会进行覆盖，新的属性会进行添加到page.data当中</font>

```javascript
// page.js
Page({
	// 页面的初始数据
	data: {
		title: "2020DOTA2国际邀请赛"
	},
	onLoad:function (options) {
		// 通过this.setData的改变后，data.title会变成新值，time属性也会添加到data对象中，成为data.time
		this.setData({
			title: "2022DOTA2国际邀请赛",
			time: 2020
		})
	}
})
```
```html
<!--page.wxml-->
<text class="post-image">{{title}}</text>
<text class="post-image">{{time}}</text>
```

<font color=#DD1144>我们建议所有应该出现在data中的属性都应该在data对象当中进行预先的定义，使用this.setData只用来更来data中的数据</font>

但是这里有例外的情况，<font color=#DD1144>我们在this.data当中定义的所有数据并非全要显示在UI中，简单的说并非UI里会用到所有this.data中的字段，只会用到一部分要和前端UI做数据绑定的字段。有些this.data中的字段是只在js文件中使用的，对于这些字段我们有两点注意</font>
+ <font color=#1E90FF>使用_下划线开头，表示只用于逻辑的数据字段</font>
+ <font color=#1E90FF>修改的时候可以直接赋值，可以不使用this.setData()方法</font>


最后再来提一句：小程序的数据绑定和`React`还不太一样，我们都知道在`React`当中的`this.setStatus`是异步的，而小程序是这样的：<font color=#DD1144>setData在逻辑层的操作是同步，因此this.data中的相关数据会立即更新；setData在视图层的操作是异步，因此页面渲染可能并不会立即发生</font>，所以要记住这个不同。

## 生命周期与回调
生命周期无论是在`React`或者`Vue`当中都是很常见的东西，我们下面来学习一下小程序当中的生命周期，首先来看下面这个图：

<img :src="$withBase('/weixinxiaochengxu_luojixiaochengtu.png')" alt="">

有下面这些，按照顺序为：
+ <font color=#1E90FF>onLoad</font>：监听页面加载（通常在这里请求服务端数据）
+ <font color=#1E90FF>onShow</font>：监听页面显示
+ <font color=#1E90FF>onReady</font>：监听页面初次渲染完成
+ <font color=#1E90FF>onHide</font>：监听页面隐藏（在模拟器当中可以通过点击`切后台`按钮来触发`onHide`生命周期函数）
+ <font color=#1E90FF>onUnload</font>：监听页面卸载（路由跳转有可能触发页面的卸载）

<font color=#1E90FF>所以生命周期函数就是小程序在整个生命周期阶段进行完毕后小程序会主动调用的函数</font>

## Mustache语法解析
我们都知道在`wxml`当中通过`{{}}`的方式在里面书写`js`表达式的，注意我们这里说的是表达式，表达式是一定有返回值。这个就是`Mustache`，即双大括号。

## 条件渲染&&列表渲染
```html
<text wx:if="{{isShow}}" class="style1">{{data1}}</text>
<text wx:else class="style2">{{data2}}</text>
```
使用`wx:if`和`wx:else`来作为是否渲染的判断依据。

列表渲染，我们通常使用`block`包裹要循环的内容，其中<font color=#1E90FF>默认数组的当前项的下标变量名默认为 index，数组当前项的变量名默认为 item</font>
```html
<block wx:for="{{array}}" >
	{{index}}: {{item.message}}
</block>
```
如果你认为，默认的`index`和`item`会和自己书写的变量有冲突，或者你想更加语义化一点你可以自己设置：<font color=#1E90FF>使用wx:for-item 可以指定数组当前元素的变量名，使用 wx:for-index 可以指定数组当前下标的变量名：</font>
```html
<block wx:for="{{array}}" wx:for-index="idx" wx:for-item="itemName">
  {{idx}}: {{itemName.message}}
</block>
```

## 事件与绑定
什么是事件呢：
+ <font color=#1E90FF>事件是视图层到逻辑层的通讯方式</font>。
+ <font color=#1E90FF>事件可以将用户的行为反馈到逻辑层进行处理</font>。
+ <font color=#1E90FF>事件可以绑定在组件上，当达到触发事件，就会执行逻辑层中对应的事件处理函数</font>。
+ <font color=#1E90FF>事件对象可以携带额外信息，如 id, dataset, touches</font>。

怎么使用呢？我们举一个点击的例子：如`bindtap`，当用户点击该组件的时候会在该页面对应的`Page`中找到相应的事件处理函数:
```html
<view id="tapTest" data-hi="Weixin" bind:tap="tapName">Click me</view>
```
在对应的`Page`当中书写相应的事件处理函数，参数是`event`
```javascript
Page({
  tapName: function(event) {
    console.log(event)
  }
})
```
然后打印出来的信息如下，这个很重要，有关于数据信息和坐标位置信息，都在这里：
```javascript
{
  "type":"tap",
  "timeStamp":895,
  "target": {
    "id": "tapTest",
    "dataset":  {
      "hi":"Weixin"
    }
  },
  "currentTarget":  {
    "id": "tapTest",
    "dataset": {
      "hi":"Weixin"
    }
  },
  "detail": {
    "x":53,
    "y":14
  },
  "touches":[{
    "identifier":0,
    "pageX":53,
    "pageY":14,
    "clientX":53,
    "clientY":14
  }],
  "changedTouches":[{
    "identifier":0,
    "pageX":53,
    "pageY":14,
    "clientX":53,
    "clientY":14
  }]
}
```

