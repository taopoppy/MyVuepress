# 电影详情

## 详情页跳转
### 1. 跳转事件函数

我们在`app.json`当中我们新添加一个页面`pages/comment/comment`,然后在目录`pages`下面就会有页面`comment`,我们在上一章节说到要在电影列表页面点击评价然后进入到详情页，这里首先涉及到页面跳转的问题，我们在`movie.js`当中应该书写一个跳转到详情页的方法，然后携带电影的唯一标识符`id`,然后在进入到详情页，根据这个`id`再在详情页当中请求具体电影详情的信息，我们先要在`movie.js`当中编写跳转方法：
```javascript
  /**
   * 跳转评价页面
   */
  gotoComment: function (event) {
    wx.navigateTo({
      url: `../comment/comment?movieid=${event.target.dataset.movieid}`,
    })
  },
```

### 2. 编写云函数

然后我们要在`comment.js`当中拿到这个页面查询字符串当中的`movieid`，不过在此之前我们要创建一个可以获取详情的云函数`getDetail`,和之前一样，因为要请求豆瓣的`API`,所以我们先在云函数中运行`npm install --save request`,再运行命令`npm install --save request-promise`,接着开始编写云函数：
```javascript
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
var rp = require('request-promise');
// 云函数入口函数
exports.main = async (event, context) => {
  return rp(`http://api.douban.com/v2/movie/subject/${event.movieid}?apikey=0df993c66c0c636e29ecbb5344252a4a`)
    .then(function (res) {
      console.log(res)
      return res
    })
    .catch(function (err) {
      console.error(err)
    });
}
```

### 3. 获取详情信息

接着我们就能在详情页面当中去在页面加载的时候根据传来的`movieid`请求电影的详情：在页面加载函数中`option`就是我们从上个页面传递到这个页面的参数
```javascript
  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    content: '', // 评价的内容
    score: 5, // 评价的分数
    images: [],// 上传的图片
    fileid: [],// 所有图片上传到云存储后的fileid的集合
    movieid: -1 // 当前电影的id
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      movieid: options.movieid
    })
    wx.cloud.callFunction({
      name:'getDetail',
      data: {
        movieid: options.movieid
      }
    }).then(res=>{
      console.log(res)
      this.setData({
        detail: JSON.parse(res.result)
      })
    }).catch(err=> {
      console.error(err)
    })
  },
```

## 前端页面展示
我们这里直接将前端的`comment.wxml`和`comment.wxss`展示在这里：当然我们先引入`vant`组件
```html
<view class=''>
  <view class='detail-container' style='background: url({{detail.images.large}}) no-repeat  top/cover'></view>
  <view class='detail-mask'></view>
  <view class='detail-info'>
    <image src="{{detail.images.large}}" class='detail-img'></image>
    <view class='detail'>
      <view class='detail-nm'>{{detail.title}}</view>
      <view>{{detail.original_title}}</view>
      <view class='detail.sc'>{{detail.rating.average}}分</view>
      <view>{{detail.countries[0]}}</view>
      <view>导演：{{detail.directors[0].name}}</view>
    </view>
  </view>
  <view class='desc'>{{detail.summary}}</view>
  <!-- 评价 -->
  <view class="comment-container">
    <van-field value="{{ content }}" placeholder="写一些评价吧" bind:change="onContentChange" />
    <van-rate value="{{ score }}" bind:change="onScoreChange" />
    <van-button type="warning" bindtap="uploadImg">上传图片</van-button>
    <view>
      <image class="comment-img" src="{{item}}" wx:for="{{images}}" wx:key="{{index}}"></image>
    </view>
    <van-button size="large" type="danger" bindtap="submit">提交评价</van-button>
  </view>

</view>
```
```css
.detail-container {
  height: 400rpx;
  filter: blur(40rpx);
  opacity: 0.4;
}

.detail-mask {
  position: absolute;
  width: 100%;
  height: 400rpx;
  background-color: #333;
  top: 0;
  left: 0;
  z-index: -1;
}

.detail-img {
  width: 280rpx;
  height: 90%;
  margin-right: 24rpx;
}

.detail-info {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400rpx;
  padding: 20rpx;
}

.detail {
  flex-grow: 1;
  line-height: 60rpx;
}

.detail view {
  color: #fff;
  font-size: 24rpx;
}

.detail .detail-nm {
  font-size: 40rpx;
  font-weight: 700;
}

.detail .sc {
  color: #fc0;
  font-size: 36rpx;
  font-weight: 700;
}

.desc {
  padding: 20rpx;
  color: #555;
  font-size: 24rpx;
}

.comment-container {
  padding: 0 20rpx;
}

.comment {
  padding: 10rpx;
}

.comment-content {
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
  font-size: 32rpx;
  border-radius: 8rpx;
  padding: 20rpx;
}

.comment-image image {
  width: 200rpx;
  height: 200rpx;
  margin: 10rpx;
}

.comment-img {
  width: 200rpx;
  height: 200rpx;
  margin: 20rpx 20rpx 0 0;
}

```

## 电影评价

### 1.输入评价内容
输入评价内容我们在前端代码绑定的是`onContentChange`处理函数。所以我们在`comment.js`当中编写：
```javascript
  /**
   * 输入评价的内容
   */
  onContentChange: function (event) {
    this.setData({
      content: event.detail
    })
  },
```

### 2.输入评分内容
输入评分我们是通过点击星星的数量来获取评分，前端绑定的事件是`onScoreChange`,所以我们在`comment.js`当中编写：
```javascript
  /**
   * 输入评价的分数
   */
  onScoreChange: function (event) {
    this.setData({
      score: event.detail
    })
  },
```

### 3.上传图片
上传图片我们还是通过和之前一样，通过`wx.chooseImage`的方式，所以我们在`comment.js`当中编写：
```javascript
  /**
   * 上传图片的按钮
   */
  uploadImg: function () {
    // 1. 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success:res => {
        // tempFilePath可以作为img标签的src属性显示图片，这里是个数组
        const tempFilePaths = res.tempFilePaths
        // 2. 显示上传的图片
        this.setData({
          images: this.data.images.concat(tempFilePaths)
        })
      }
    })
  },
```

### 4. 提交评价
我们首先要想想，就是我们现在图片是选择了，但是图片是不是应该先上传到云存储，然后把`fileid`返回之后我们再把图片的`fileid`和其他的评论和分数一起提交到云数据库当中呢？所以下面的代码是本章的重点，不过在此之前我们需要先到云开发控制台中的数据库当中先创建一个`comment`的集合
```javascript
  /**
   * 提交评价
   */
  submit: function () {
    wx.showLoading({
      title: '正在保存评论',
    })
    // 1. 循环上传图片
    let promiseArr = [];
    for(let i = 0;i < this.data.images.length;i++) {
      promiseArr.push(new Promise((resolve,reject)=> {
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item)[0]; // 正则表达式，返回文件的扩展名
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix, // 上传至云端的路径
          filePath: item, // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            console.log(res.fileID)
            this.setData({
              fileid: this.data.fileid.concat(res.fileID)  // 把云存储返回的fileid全部保存在data.fileid当中
            })
            resolve()
          },
          fail: console.error
        })
      }))
    }

    // 2. 等待所有图片上传到云存储完毕后,向云数据库中添加评论数据
    Promise.all(promiseArr).then(res=> {
      db.collection('comment').add({
        data: {
          content: this.data.contetn,
          score: this.data.score,
          movieid: this.data.movieid,
          fileIds: this.data.fileid
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
        })
        console.log(res)
      }).catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '保存失败',
        })
        console.error(err)
      })
    })
  },
```

## 用户信息

### 1. 开放能力
我们在开发当中直接可以通过`open-data`这样的组件去获取用户信息，在`type`属性当中填写不同地值就能获取用户不同地信息，比如`userAvatarUrl`表示用户头像，`userNickName`表示用户的昵称等等，这些可以在下面列出的官网地址中查到：
+ [https://developers.weixin.qq.com/miniprogram/dev/component/open-data.html](https://developers.weixin.qq.com/miniprogram/dev/component/open-data.html)
```html
<view class='profile'>
  <view class="profile-img">
    <open-data type="userAvatarUrl"></open-data>
  </view>
  <open-data type="userNickName" class="profile-name"></open-data>
</view>
```

### 2. 点击获取用户信息
我们可以在前端通过修改`button`组件中的`open-type`来修改按钮的作用：
```html
<button open-type="getUserInfo" bindgetuserinfo="onGotUserInfo">获取用户信息</button>
```
然后我们可以在`.js`文件中通过`onGotUserInfo`函数中的`event`拿到用户的所有信息

## 上线和总结
因为我们使用的是小程序的云开发，我们不需要购买服务器，如果上线的话我们要走下面的流程

+ 点击小程序开发工具的右上角有个<font color=#3eaf7c>上传按钮</font>
+ 提示`在后台将本此提交设置为体验版`
+ 然后填写<font color=#3eaf7c>版本号</font>和<font color=#3eaf7c>项目备注</font>
+ 提示有一些包文件没有上传，点击确定
+ 到微信公众平台的`管理`界面-> `版本管理`
+ 在最下面的`开发版本`的界面会看到提交版本
+ 第一次的话我们需要点击最右边的按钮选择了`设置为体验版`
+ 点击`提交审核`
+ 点击`同意并了解相关规则`
+ 来到`提交审核页面`，进行部分配置
+ 点击提交后，回到微信公众平台的`管理界面`，就会在`审核版本`的地方出现我们提交的项目
+ 等待人工审核完整我们就能点击`审核版本`界面最右面的`提交上线`，上传到线上