# 歌单组件

## 组件创建和引用
我们要创建面向用户的，独立的，可复用的组件我们就要在`miniprogram/components`目录点击`新建目录`，创建一个`playlist`的文件夹，然后在`miniprogram/components/playlist`目录下面点击`新建Components`，然后就会在出现四个文件`playlist.js`,`playlist.json`,`playlist.wxss`,`playlist.wxml`。这样实际上我们就已经创建好了一个组件。

那我们怎么引入组件呢？说白了在页面上使用组件就好比使用标签，我们在`miniprogram/pages/playlist/playlist.json`当中去配置即可：
```json
{
  "usingComponents": {
    "T-playlist": "/components/playlist/playlist"
  }
}
```
上述代码就相当于我们从`components/playlist`当中引入了那个组件，然后起了一个名字`T-playlist`,这个名字就能个标签一样在页面当中使用了

## 组件参数的传递和接收
首先我们去定义几个固定的数据，先在`miniprogram/pages/playlist/playlist.js`当中定义`playlist`这个数组，数组的内容可以从固定的地方取到，我们列出地址，将地址中的六个对象粘贴过来即可：
+ [https://github.com/xiecheng328/miniprogram/blob/master/assets/3-3_playlist.json](https://github.com/xiecheng328/miniprogram/blob/master/assets/3-3_playlist.json)

我们在页面`miniprogram/pages/playlist/playlist.wxml`和`miniprogram/pages/playlist/playlist.wxss`写如下代码：
```html
<!--miniprogram/pages/playlist/playlist.wxml -->
<view class="playlist-container">
  <block wx:for="{{playlist}}" wx:key="{{index}}">
    <T-playlist playlist="{{item}}"></T-playlist>
  </block>
</view>
```
```css
.playlist-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 10rpx;
  flex-direction: row;
}
```
关于上述当中`css`代码当中的有关的问题，我们可以到[flex布局相关问题]()查看
这样就将我们的参数传递给了`T-playlist`这个组件，那么我们要回到`miniprogram/components/playlist/playlist.ja`当中接收父元素传来的参数：
```javascript
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: {
      type: Object
    }
  },
})
```
这里就要很注意了，因为这里是组件的`js`文件，所以里面只有`properties`,`data`,`methods`三个属性，我们从外部接收到的数据也写在`properties`，组件内部的数据要定义在`data`当中，方法要定义在`methods`当中。

## 编写前端代码
组件有了数据我们就要让它显示在界面上，我们到`miniprogram/components/playlist/playlist.wxml`当中写代码：
```html
<view class="playlist-container">
  <image src="{{playlist.picUrl}}" class="playlist-img"></image>
  <text class="playlist-playcount">{{playlist.playCount}}</text>
  <view class="playlist-name">{{playlist.name}}</view>
</view>
```
然后给出相对应的样式代码，在`miniprogram/components/playlist/playlist.wxss`当中：
```css
.playlist-container {
  width: 220rpx;
  position: relative;
  padding-bottom: 20rpx;
}
.playlist-img {
  width: 100%;
  height: 220rpx;
  border-radius: 6rpx;
}
.playlist-playcount {
  font-size: 24rpx;
  color: #fff;
  text-shadow: 1px 0 0 rgba(0, 0, 0, 0.15);
  position: absolute;
  right: 10rpx;
  top: 4rpx;
  padding-left: 26rpx;
  background: url(//背景图的base64的代码) no-repeat 0 8rpx/22rpx 20rpx;
}

.playlist-name {
  font-size: 26rpx;
  line-height: 1.2;
  padding: 2px 0 0 6px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

```
其中在`.playlist-playcount`当中的背景我们要强调一样： <font color=#3eaf7c>小程序当中的背景不能是网络图片，必须是本地图片或者base64的代码</font>，关于文字换行和缩略的问题我们可以到[文字换行和省略]()当中查看，然后背景图片在下面网址当中可以找到，找到之后转化成为`base64`代码（网上有很多能将图片转化成base64的网站）放在`url`当中,:
+ [https://github.com/xiecheng328/miniprogram/blob/master/assets/3-3_headset.svg](https://github.com/xiecheng328/miniprogram/blob/master/assets/3-3_headset.svg)

## 播放细节处理
我们之前说过在播放列表的最上面的播放数量我们要做一下处理，对播放数量要做格式化处理，这个叫做 <font color=#3eaf7c>数据监听器</font>,我们在`miniprogram/components/playlist/playlist.js`当中写如下代码：
```javascript
// components/playlist/playlist.js
Component({
  properties: {
    playlist: {
      type: Object
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    // 如果是监听的对象可以直接写playlist(val){}
    ['playlist.playCount'](count) {
      this.setData({
        _count: this._tranNumber(count, 2)
      })
    }
  },
  data: {
    _count: 0
  },

  methods: {
    _tranNumber(num,point) {
      let numStr = num.toString().split('.')[0]
      if(numStr.length < 6) { 
        // 十万之内的数字不做处理
        return numStr
      } else if(numStr.length >=6 && numStr.length <=8 ){
        // 百万之内的数字做处理
        let deciml = numStr.substring(numStr.length - 4, numStr.length - 4 + point)
        return parseFloat(parseInt(numStr / 10000) + '.' + deciml) + '万'
      } else if(numStr.length > 8) {
        // 亿之内的数字做处理
        let deciml = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
        return parseFloat(parseInt(numStr / 100000000) + '.' + deciml) + '亿'
      }
    }
  }
})

```
上述代码是这样的意思，从外部传来的`playlist.playCount`，我们要将他转化成为数字和汉字的结合版，比如`625222.01`要转化成为`62.52万`这样的格式，我们就要使用监听器监听`playlist.playCount`的变化，然后使用`_tranNumber`这样的函数将其转化，然后赋值给`_count`，最后在前端修改：
```html
<!--修改前-->
 <text class="playlist-playcount">{{playlist.playCount}</text>
<!--修改后-->
<text class="playlist-playcount">{{_count}}</text>

```
我们在整个代码当中注意两个点：
+ 关于监听的写法很有多种，我们可以去[官网](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/observer.html)上查看很多的写法
+ 第二我们不能在监听当中去修改自己的值，这样会造成无线循环：比如下面的这样写法：
  ```javascript
   ['playlist.playCount'](count) {
      this.setData({
        playlist.playCount: this._tranNumber(count, 2)
      })
    }
  ```
  因为你监听的它，还要修改它，就又会造成它的修改，触发监听事件，这就会处于死循环当中。所以这就是我们为什么在`data`重新设置一个`_count`来保存修改后值的原因
  
## wx:for
我们在前端代码写`wx:for`我们注意这里要写一个独一无二的标识，那为什么我们在有的地方可以写`wx:for={{index}}`呢？因为在有些组件当中渲染对应的数据是静态的，所以不会发生改变，该数据在数组当中的位置和数据本身不会发生变化。

我们在小程序当中有个写法是这样：
```html
<view wx:for="{{arr}}" wx:key="*this"></view>
```
这种写法就代表了数据本身，这种写法一般都会出现在数据本身是纯数字的这种情况。

不过我们还是更推荐下面这样的写法，因为一般数据可能是一个对象，比如从数据库中取出来的对象一般会对应一个独一无二的`id`,我们最好使用这个`id`，如果没有`id`，我们也尽量选择在对象当中能唯一代表这个对象的属性名称。比如一个对象的结构是：`{ _id: xxx, name:yyy }`,而且所有的对象当中的`id`都是不同的值，那么我们的写法就很简单了，如下：
```html
<view wx:for="{{arr}}" wx:key="_id"></view>
```
特别注意：
+ <font color=#3eaf7c>首先wx:for后面的值直接写，不加双括号</font>
+ <font color=#3eaf7c>再者wx:for后面的值必须是对象当中能唯一代表这个对象的属性名称，两者要一一对应</font>