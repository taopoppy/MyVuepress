# 音乐播放

## 音乐API介绍
新版的小程序使用的`BackgroundAudioManager`这个背景音乐的`API`，我们现在就来书写一下

我们先来看一下`post-detail.wxml`：
```html
<view class="container">
	<image class="head-image" src="{{postData.headImgSrc}}"></image>
	<image wx:if="{{!isPlaying}}" bind:tap="onMusicStart" class="audio" src="/images/music/music-start.png" />
	<image bind:tap="onMusicStop" wx:else class="audio" src="/images/music/music-stop.png" />
	...
</view>
```
可以看到，播放和暂停对应的不同的图片，播放对应的`onMusicStart`，暂停对应的是`onMusicStop`，具体显示哪个根据后台音乐是否在播放的标记`isPlaying`来判断。


```javascript
// pages/post-detail/post-detail.js
import {postList} from '../../data/data.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    postData:{},
    collected:false,
    isPlaying:false, // 是否在播放音乐
    _pid:null,
    _postsCollected:{},
    _mgr:null // 音乐对象
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const postData = postList[options.pid]
    this.data._pid = options.pid
    const postsCollected = wx.getStorageSync('posts_collected')
    console.log(postsCollected)

    if(postsCollected){
      this.data._postsCollected = postsCollected
    }

    let collected = postsCollected[this.data._pid]

    if(collected === undefined){
      collected = false
    }

    this.setData({
      postData,
      collected,
      isPlaying: this.currentMusicIsPlaying() // 判断小程序后台播放的音乐是否与当前页面要播放的音乐一致
    })

    const mgr = wx.getBackgroundAudioManager() // 创建音乐对象
    this.data._mgr = mgr // 记录到this.data当中
    mgr.onPlay(this.onMusicStart) // 监听音乐播放事件
    mgr.onPause(this.onMusicStop) // 监听音乐暂停事件
  },
	/**
   * 小程序后台播放的音乐是否与当前页面要播放的音乐一致
   */
  currentMusicIsPlaying(){
    if(app.gIsPlayingMusic && app.gIsPlayingPostId === this.data._pid ){
      return true
    }
    return false
  },

  /**
   * 音乐播放
   */
  onMusicStart(event){
    const mgr = this.data._mgr
    const music = postList[this.data._pid].music // 拿到音乐数据

    mgr.src = music.url // 给音乐对象赋值音乐url，设置了src之后会自动播放（必须）
    mgr.title = music.title // 给音乐对象赋值音乐标题（必选）
    mgr.coverImgUrl = music.coverImg // 给音乐对象赋值音乐图片

    app.gIsPlayingMusic = true // 正在播放音乐记录到全局变量中
    app.gIsPlayingPostId = this.data._pid // 正在播放的音乐的id也记录在全局变量中

    this.setData({
      isPlaying:true // 修改isPlaying
    })
  },

  /**
   * 音乐停止
   */
  onMusicStop(event){
    const mgr = this.data._mgr // 拿到音乐对象
    mgr.pause() // 暂停
    app.gIsPlayingMusic = false // 修改全局变量
    app.gIsPlayingPostId = -1   // 修改全局变量
    this.setData({
      isPlaying:false  // 修改isPlaying
    })
  },
})
```
值得一提的是为什么我们要在`onLoad`当中去监听音乐的播放和暂停，因为音乐播放的面板不在小城上，而在后台，如果你点击后台的暂停按钮，不会执行我们编写的`onMusicStop`，所以为了保持一致，让我们小程序自定义的点击按钮和背景音乐的点击按钮保持执行相同的函数。

```javascript
// app.js
App({
  onLaunch(){
    console.log("小程序启动")
  },
  gIsPlayingMusic:false,  // 小程序背景音乐是否在播放
  gIsPlayingPostId:-1, // 小程序背景音乐播放的音乐id
  gBaseUrl:"http://t.talelin.com/v2/movie/"
})
```

最后提一句，<font color=#1E90FF>如果要小程序在退到后台继续播放音频，要在app.json当中去配置requireBackgroundModes</font>，具体的配置去官网去查即可。