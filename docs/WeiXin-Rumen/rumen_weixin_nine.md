# 电影页面

## 字数省略技巧
字数省略的写法我们实际上不用记，就去网上去查一下即可，但是最关键的是：<font color=#1E90FF>保证字体标签所在的容器的宽度是固定的</font>
```css
.container{
  width: 200rpx; // 父节点宽度是固定的
}
/* 字数超越省略，前提是其所在的容器宽度要固定*/
.title{
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
}
```

## 外部样式类
外部样式类，我们这里用在<font color=#1E90FF>父组件给子组件传递样式</font>，因为有时候在父组件直接给自定义组件设置样式属性是不起效果的，所以比如将样式属性传递给自定义组件本身使用：
```css
/* movies.wxss */
.movie-list{
  margin-bottom: 30rpx;
	background-color: green !important;
}
```
```html
<!-- movies.wxml -->
<view>
	<movie-list f-class="movie-list" />  <!--将movie-list这个class通过f-class这个属性传递给movie-list这个自定义组件 -->
</view>
```
然后再来看自定义组件怎么接收和使用：
```javascript
// components/movie-list/index.js
Component({
  externalClasses:['f-class'], // 通过externalClasses这属性接收
})
```
```html
<!--movie-list.wxml-->
<view class="container f-class"> <!--直接在wxml文件中使用即可-->
</view>
```

<font color=#DD1144>外部样式类最重要的用途就是自己在书写自定义组件的时候，部分样式的定义要交给使用者来定义，这个时候就需要使用到外部样式类来接收使用者传递的样式</font>

<font color=#1E90FF>其次是如果有时候外部样式类的部分css属性和自定义组件已经定义过的css属性有重复，有时候未必会有效，需要使用!important来强制生效</font>

## 服务端数据请求
使用`wx.request`这个`API`，然后我们可以去[官网](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)看一下使用方式，说的很清楚。
```javascript
// pages/movies/movies.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    inTheaters:[], // 正在热映
    comingSoon:[], // 即将上映
    top250:[], // 豆瓣前250
    searchResult:false,
    searchData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		// 请求正在热映电影数据
    wx.request({
      url: app.gBaseUrl + 'in_theaters',
      data:{
        start:0,
        count:3
      },
      success:(res)=>{
        this.setData({
          inTheaters:res.data.subjects
        })
      }
    })
		// 请求即将上映电影数据
    wx.request({
      url: app.gBaseUrl + 'coming_soon',
      data:{
        start:0,
        count:3
      },
      success:(res)=>{
        this.setData({
          comingSoon:res.data.subjects
        })
      }
    })
		// 请求豆瓣前250电影数据
    wx.request({
      url: app.gBaseUrl + 'top250',
      data:{
        start:0,
        count:3
      },
      success:(res)=>{
        this.setData({
          top250:res.data.subjects
        })
      }
    })
  },
})
```
<font color=#DD1144>特别要主要我们在success回调函数当中，使用的是箭头函数，因为在箭头函数当中使用this，this会自动向外部绑定，否则使用正常的回调函数是在this上面拿不到setData，因为此时的this和当前页面Page的this无关，属于回调函数这个内部环境的this</font>

## 下拉刷新和上拉加载更多
我们在更多电影的`Page`当中有顶部下拉刷新和上拉加载更多两个功能，在小程序当中，其实这两个函数都是有的，所以可以直接在里面书写逻辑：
```javascript
// pages/more-movie/more-movie.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movies:[],
    _type:''
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("用户正在下拉")
    wx.request({
      url: app.gBaseUrl + this.data._type,
      data:{
        start:0,
        count:12,
      },
      success:(res)=>{
        this.setData({
          movies:res.data.subjects
        })
        wx.stopPullDownRefresh() // 下拉刷新结束
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    wx.showNavigationBarLoading() // 显示加载
    wx.request({
      url: app.gBaseUrl + this.data._type,
      data:{
        start: this.data.movies.length,
        count:12
      },
      success:(res)=>{
        console.log(res)
        this.setData({
          movies:this.data.movies.concat(res.data.subjects)
        })
        wx.hideNavigationBarLoading() // 隐藏加载
      }
    })
  },
})
```
