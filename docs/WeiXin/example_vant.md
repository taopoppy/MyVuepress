# 电影列表

## 组件库的下载和引用

### 1. 组件库的下载
+ 首先我们先在项目右键`miniprogram`-> 选择`在终端打开` ->`npm init` -> `npm i vant-weapp -S --production`
+ 在小程序开发界面最上端点击`工具` -> 点击`构建npm`
+ 在小程序开发界面的最右边点击`详情` -> 点击`本地设置` -> 选中`使用npm模块`

### 2. 组件库的引用
你如果要引入组件库中的组件，只要到官网去查找到这个组件，然后按照对应的说明引入使用即可，比如一个`button`按钮我们只需要两步：
+ 在`page.json`当中引入组件：
  ```json
  {
    "usingComponents": {
      "van-button": "/vant-weapp/button/index"
    }
  }
  ```
+ 在`page.wxml`中直接使用这个组件即可：
  ```html
  <van-button type="danger">危险按钮</van-button>
  ```
上述这些代码在官网实例当中都有，有些稍微做一下修改就能用

## 电影列表

### 1. 发送请求
发送请求有两种途径，第一种是在小程序端，第二种是使用云函数，然后我们来对比一下：
|           |小程序端    |云函数   | 
|:---------:|:---------:|:-------:|
|发送方法    |wx.request |第三方库（request,got）|
|协议支持    |只支持https|第三方库决定|
|是否备案    |经过ICP备案|可以不备案|
|域名个数限制 |20个      |无限制|


### 2. 使用request
我们这里使用第三发库中的`request`当中的`promise`方法，我们可以到官网去看一下说明[https://github.com/request/request-promise](https://github.com/request/request-promise),我们在云函数使用第三方包的步骤如下：
+ 创建云函数`movielist`
+ 右键点击云函数 -> 选择`在终端打开`
+ 运行命令`npm install --save request`
+ 再运行命令`npm install --save request-promise`

### 3. 编写云函数
因为我们要分页，所以我们使用模板字符串的方式去写下我们的请求`url`:
```javascript
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
var rp = require('request-promise');
// 云函数入口函数
exports.main = async (event, context) => {
  return rp(`http://api.douban.com/v2/movie/in_theaters?apikey=0df993c66c0c636e29ecbb5344252a4a&start=${event.start}&count=${event.count}`)
    .then(function (res) {
      console.log(res)
      return res
    })
    .catch(function (err) {
      console.error(err)
    });
}
```
特别要注意的就是：
+ <font color=#3eaf7c>只要修改了云函数，就必须要上传部署</font>
+ <font color=#3eaf7c>我们在云函数当中打印的东西只能在云函数控制台中的云函数日志记录中</font>

### 4. 调用云函数
当云函数编写完我们需要在小程序端来使用云函数：
```javascript
  /**
   * 页面的初始数据
   */
  data: {
    movielist:[]
  },
  /**
   *  获取电影列表 
   */
  getMovieList: function () {
    wx.showLoading({
      title: '加载中',          // 显示加载的一个动画框
    })
    wx.cloud.callFunction({
      name: 'movielist',
      data: {
        start: this.data.movielist.length,
        count: 10
      }
    }).then(res => {
      console.log(res)
      this.setData({
        movielist: this.data.movielist.concat(JSON.parse(res.result).subjects)
      })
      wx.hideLoading()          // 加载完毕后关闭动画框
    }).catch(err => {
      console.error(err)
      wx.hideLoading()
    })
  },
    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMovieList()
  },
```
我们特别要注意有两个点，我们每次取数据的开头是和当前客户端已经有的数组`movielist`的长度保持一致，另外每次请求到的数据我们都将拼接到现有的`movielist`当中

### 5. 页面循环显示
我们把页面的部分，也就是`movie/movie.wxml`和`movie/movie.wxss`中的代码展示出来：
```html
<!--movie.wxml-->
<view class="movie" wx:for="{{movielist}}" wx:key="{{index}}">
  <image class="movie-image" src="{{item.images.small}}"></image>
  <view class="movie-info">
    <view class="movie-title">{{item.title}}</view>
    <view>观众评分： <text class="movie-score">{{item.rating.average}}分</text></view>
    <view>主演： 
      <text wx:for="{{item.casts}}" wx:key="{{index}}">{{item.name}} </text>
    </view>
    <view>年份：{{item.year}}</view>
  </view>
  <button bindtap="gotoComment" data-movied="{{item.id}}" class="movie-comment" >评价</button>
</view>
```
```css
// movie.wxss
.movie {
  height: 300rpx;
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}
.movie-image {
  width: 200rpx;
  height: 100%; 
  margin-right: 20rpx;
}
.movie-info {
  flex: 1;
}
.movie-title {
  color: #666;
  font-size: 40rpx;
  font-weight: bolder;
}
.movie-score {
  color: #faaf00;
}
.movie-comment {
  height: 60rpx;
  background: #E54847;
  color: #fff;
  font-size: 26rpx;
  margin-top: 120rpx;
}
```

### 6. 下拉触底事件
实际上下拉到底我们就继续请求电影列表即可，所以我们直接在下拉触底的事件函数中执行请求电影列表即可：
```javascript
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getMovieList()
  },
```
