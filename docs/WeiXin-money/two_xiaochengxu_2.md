# 授权登录

## 小程序授权登录
小程序授权登录的几个步骤如下：
+ <font color=#1E90FF>根据userId/openId判断当前用户是否登录</font>
+ <font color=#1E90FF>调用wx.login获取到code</font>
+ <font color=#1E90FF>调用服务端根据code换取openid</font>
+ <font color=#1E90FF>通过用户授权登录获取用户信息，存入后台数据库</font>

关于小程序当中获取用户信息，初始化的小程序源码给了我们这样两段程序，我们可以参照一下：
```html
<view class="container">
  <view class="userinfo">
    <block wx:if="{{canIUseOpenData}}" calss="userinfo-opendata">
      <view class="userinfo-avatar" bindtap="bindViewTap">
        <open-data type="userAvatarUrl"></open-data>
      </view>
      <open-data type="userNickName"></open-data>
    </block>
    <!--进入后没有用户信息，需要手动获取的-->
    <block wx:elif="{{!hasUserInfo}}">
      <button wx:if="{{canIUseGetUserProfile}}" bindtap="getUserProfile"> 手动获取头像昵称 </button>
      <button wx:elif="{{canIUse}}" open-type="getUserInfo" bindgetuserinfo="getUserInfo"> 获取头像昵称 </button>
      <view wx:else> 请使用1.4.4及以上版本基础库 </view>
    </block>
    <!--获取到用户信息，展示头像-->
    <block wx:else>
      <image bindtap="bindViewTap" class="userinfo-avatar" src="{{userInfo.avatarUrl}}" mode="cover"></image>
      <text class="userinfo-nickname">{{userInfo.nickName}}</text>
    </block>
  </view>
  <view class="usermotto">
    <text class="user-motto">{{motto}}</text>
  </view>
</view>
```
```javascript
// pages/index/index.js
// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {}, // 用户信息
    hasUserInfo: false, // 是否有用户信息
    canIUse: wx.canIUse('button.open-type.getUserInfo'), // 是否可以使用wx.getUserInfo
    canIUseGetUserProfile: false, // 是否可以使用wx.getUserProfile
    canIUseOpenData: false // wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
      this.getUserProfile()
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  // getUserInfo(e) {
  //   // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
  //   console.log(e)
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   })
  // }
})
```
上面这个最新的获取用户信息的开放能力的写法，我们参照上面的这个写法，来写我们自己的逻辑
```html
<!--pages/index/index.wxml-->
<view class="index">
  <image src="/assets/images/header.png" class="header" />
  <view class="btn-group">
    <button class="btn" wx:if="{{!userId}}" bindtap="getUserProfile">微信登录</button>
    <button class="btn" wx:if="{{userId}}">分享</button>
    <button class="btn btn-primary" wx:if="{{userId}}">充值</button>
    <button class="btn" wx:if="{{userId}}">活动详情</button>
  </view>
</view>
```
```javascript
// pages/index/index.js
// 获取应用实例
const app = getApp()
let Api = app.Api
let store = require('../../utils/store.js')

Page({
  data:{
    userId: store.getItem('userId')
  },
  onLoad:function() {
    // 判断用户是否登录
    if(!this.data.userId) {
      // 没有登录就去登录，获取code，再获取openid
      this.getSession()
    }
  },
  // 根据code去获取session
  getSession() {
    wx.login({
      success: res => {
        console.log("登录成功",res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if(res.code) {
          // 请求node后端，node后端再请求微信服务器获取到openid
          app.get(Api.getSession, {
            code:res.code
          }).then((res)=> {
            // 拿到openid，小程序端保存
            store.setItem('openId',res.openid)
          }).catch((res)=> {
            console.log('error:'+ res.message)
          })
        }
      }
    })
  },
  // 获取用户信息并请求后端Node登录接口
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log('用户信息',res)
        let userInfo = res.userInfo
        userInfo.openid = store.getItem("openId")
        // 请求Node后端登录接口
        app.get(Api.login,{userInfo}).then((res)=> {
          store.setItem("userId", res.userId)
          this.setData({
            userId:res.userId
          })
        })
      }
    })
  },
})
```

下面我们来详细说明一下整个流程，整个小程序的授权登录流程要比H5方便很多，因为小程序提供的API和开发能力很好
<img :src="$withBase('/weixin_zhifu_18.png')" alt="">
+ <font color=#1E90FF>第一步进入小程序后，要去登录，使用wx.login这个API会自动返回code</font>

+ <font color=#1E90FF>拿到code，去请求Node后端接口，Node拿着code请求微信服务器，微信服务器返回openid，Node后端把openid返回给小程序</font>

+ <font color=#1E90FF>小程序通过wx.getUserProfile这个API可以直接拿到用户的基础信息，结合openid组成完成的用户信息userInfo，请求Node后端/login接口</font>

+ <font color=#1E90FF>Node后端就可以判断一下是新用户还是旧用户，总之返回userId给小程序</font>

+ <font color=#1E90FF>小程序拿到userId，进行保存即可</font>

## Node对接

## 小程序分享