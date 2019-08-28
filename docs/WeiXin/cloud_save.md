# 云存储
在免费的基础版当中，有5GB的内存供我们使用，并且我们可以通过相应的`API`去实现存储的功能
+ <font color=#3eaf7c>wx.cloud.uploadFile</font>：上传文件
+ <font color=#3eaf7c>wx.cloud.downloadFile</font>：下载文件
+ <font color=#3eaf7c>wx.cloud.deleteFile</font>：删除文件
+ <font color=#3eaf7c>wx.cloud.getTempFileURL</font>:获取临时链接

## 文件上传
我们先用一张图来搞清楚微信上传文件的流程，然后我们用代码来演示：

<img :src="$withBase('/weixin_uploadFile.png')" alt="微信文件上传">

+ 首先我们选择图片或者拍照（用户-用户小程序）
+ 通过小程序上传所选的图片到云存储（用户小程序-云存储）
+ 云存储存好后把`fileId`返回给小程序（云存储-用户小程序）
+ 小程序拿着这`fileId`存储到云数据库当中（用户小程序-云数据库）

下面我们用代码来演示一下图片上传的步骤：
```javascript
/**
   * 上传图片
   */
  uploadFile: function () {
    // 1. 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths // 拿到临时路径
        console.log(tempFilePaths)
        // 2. 上传图片 
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + '.png', // 上传至云端的路径
          filePath: tempFilePaths[0], // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            console.log(res.fileID)
            // 3. 将fileID存储到云数据库当中
            db.collection('image').add({
              data: {
                fileID: res.fileID
              }
            }).then(res => {
              console.log(res)
            }).catch(err => {
              console.error(err)
            })
          },
          fail: console.error
        })
      }
    })
  },
```
关于文件上传的代码，实际上都是从下面两个官网中拷贝来并做修改的，我们可以参考下面给出的官网地址：
+ [https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.chooseImage.html](https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.chooseImage.html)
+ [https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/api.html](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/api.html)

## 获取文件
我们前面已经将这个图片保存在了云存储，然后相关的`fileID`放在了云数据库当中，只要我们拿到这个`fileID`就能展示在小程序当中。我们直接亮出代码：
```javascript
  /**
   * 获取图片
   */
  getFile: function () {
    // 1.登录
    wx.cloud.callFunction({
      name: 'login'
    }).then(res =>{
      console.log(res)
      // 2. 获取图片
      db.collection('image').where({
        _openid: res.result.openid
      }).get().then(res2=> {
        console.log(res2)
        this.setData({
          images:res2.data
        })
      }).catch(err2=> {
        console.error(err2)
      })
    }).catch(err => {
      console.error(err)
    })
  },
```

## 文件下载
首先我们先来看看文件下载的流程，然后我们使用代码去展示：

<img :src="$withBase('/weixin_downloadFile.png')" alt="微信文件上传">

+ 首先小程序要到云存储上面去获取文件的`fileID`（用户小程序-云存储）
+ 用户点击下载（用户-用户小程序）
+ 小程序给云数据库发送文件下载请求 （用户小程序-云数据库）
+ 云数据库给小程序返回文件信息 （云数据库-用户小程序）
+ 小程序将文件保存在手机相册（用户小程序-手机相册）

我们下面给出实例代码，先给出我们前端的代码，前端在渲染图片列表的时候是拿到了`fileID`的，所以我们这里直接可以拿到，我们先看前端代码：
```html
<block wx:for="{{images}}" wx:key="{{index}}">
  <image src="{{item.fileID}}"></image>
  <button size="mini" data-fileid="{{item.fileID}}" bindtap="downloadFile">文件下载</button>
</block>
```
我们下面给出后端代码：
```javascript
  /**
   * 下载图片
   */
  downloadFile: function (event) {
    // 1.给云数据库发送下载请求
    wx.cloud.downloadFile({
      fileID: event.target.dataset.fileid, // 文件 ID
      success: res => {
        // 返回临时文件路径
        console.log(res.tempFilePath)
        // 2. 保存到系统相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title:'保存成功'
            })
          },
          fail: console.error
        })
      },
      fail: console.error
    })
  },
```
相关的方法我们都能在官网找到，我们这里给出官网下载文件和保存到系统相册两个方法的查询地址： 
+ [https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.saveImageToPhotosAlbum.html](https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.saveImageToPhotosAlbum.html)
+ [https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/api.html](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/api.html)