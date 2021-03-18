# 缓存机制与异步API的async和await

## app.js
关于`app.js`的详细说明在[官网](https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html)

<font color=#1E90FF>每个小程序都需要在app.js中调用App方法注册小程序实例，绑定生命周期回调函数、错误监听和页面不存在监听函数等。</font>

<font color=#DD1144>整个小程序只有一个App实例，是全部页面共享的。开发者可以通过getApp方法获取到全局唯一的App实例，获取App上的数据或调用开发者注册在App上的函数。</font>

所以在`app.js`当中可以保存全局的变量，但是这种全局变量在每一次小程序启动的时候都是被重置的，所以不能被当成永久性的，永久性的还是要考虑保存在服务器。
```javascript
// app.js
App({
  onLaunch (options) {
    // Do something initial when launch.
  },
  globalData: 'I am global data'
})

// xxx.js
const appInstance = getApp()
console.log(appInstance.globalData) // I am global data
```

## 缓存的增删改查
小程序当中的缓存和`web`当中的`localstorage`是非常相似的，可以使用下面的方法对小程序缓存进行增删改查
+ <font color=#1E90FF>wx.setStorageSync(string key, any data)</font>：向缓存中增加内容，更新内容也用这个方法，会用新数据覆盖旧数据
+ <font color=#1E90FF>wx.removeStorageSync(string key)</font>：删除缓存
+ <font color=#1E90FF>wx.getStorageSync(string key)</font>：查看某个缓存
+ <font color=#1E90FF>wx.clearStorageSync()</font>：清空缓存

小程序里面的缓存有点像<font color=#9400D3>前端数据库</font>，实质是作为微信存储中的一部分存在的。

## 异步方案
关于`Promise`和`async`的用法都不用说太多，我们要说的就是，什么时候该用`Promise`的写法，什么时候用`async`的写法：

+ <font color=#DD1144>在异步操作响应较为缓慢，而且后续无重要操作的，建议使用Promise异步的写法</font>
+ <font color=#DD1144>在异步操作响应快捷，并且后续还有操作的，建议使用async同步的写法</font>


## 弹框
### 1. showToast
微信小程序提供了一个很好的消息提示的接口：<font color=#9400D3>wx.showToast(Object object)</font>

具体的用法在[官网](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showToast.html)，最简单的用法如下：
```javascript
wx.showToast({
  title: '成功', // 文字信息
  icon: 'success', // 图标信息
  duration: 2000 // 持续时间
})
```

### 2. showModal
微信小程序还提供了一个模态提示框，包含取消和确认的按钮，<font color=#9400D3>wx.showModal(Object object)</font>

具体的用法在[官网](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showModal.html)，最简单的用法如下：
```javascript
wx.showModal({
  title: '提示',
  content: '这是一个模态弹窗',
  success (res) {
    if (res.confirm) {
      console.log('用户点击确定')
    } else if (res.cancel) {
      console.log('用户点击取消')
    }
  }
})
```

不过再新版的写法我们更推荐`Promise`的写法：
```javascript
const result = await wx.showModal({
  title: '提示',
  content: '这是一个模态弹窗',
})
console.log(result) //{ cancel: true, confirm: false }
if(result.cancel) {
	console.log('用户点击了取消')
}
if(result.confirm) {
	console.log('用户点击了确认')
}

```

### 3. showActionSheet
微信小程序还提供了菜单选项，<font color=#9400D3>wx.showActionSheet(Object object)</font>

具体的用法在[官网](https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showActionSheet.html)，最简单的用法如下：
```javascript
wx.showActionSheet({
  itemList: ['A', 'B', 'C'],
  success (res) {
    console.log(res.tapIndex) // 通过tapIndex知道你选了哪个选项
  },
  fail (res) {
    console.log(res.errMsg)
  }
})
```

