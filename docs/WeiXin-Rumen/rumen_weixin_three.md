# 组件和flex布局

## 第三方包
### 1. 下载
关于第三方包的下载，在小程序都是统一的方法，大概就是几个比较简单的步骤：
+ <font color=#1E90FF>打开小程序的项目根目录，执行下面的命令（如果使用了云开发，需要进入miniprogram文件夹下执行下面的命令）。</font>
  ```javascript
  npm init
  ```
+ <font color=#1E90FF>接着，继续执行下载第三方包的命令，我们以lin-ui为例，执行成功后，会在根目录里生成项目依赖文件夹 node_modules/lin-ui</font>
  ```javascript
  npm install lin-ui
  ```
+ <font color=#DD1144>最后一步是最关键的，和web开发不同，我们需要用小程序官方IDE打开我们的小程序项目，找到 工具 选项，点击下拉选中 构建npm ，等待构建完成即可。</font>

可以看到小程序`IDE`工具的目录结构里多出了一个文件夹 `miniprogram_npm`（之后所有通过`npm`引入的组件和`js`库都会出现在这里），打开后可以看到`lin-ui`文件夹，也就是我们所需要的组件。

关于第三方组件库的使用，建议去看官网，比如`Lin UI`这个第三组件的组件引入和使用就可以参考它的[官网-组件上手](https://doc.mini.talelin.com/start/component.html)，<font color=#1E90FF>因为本身它就是自定义的组件库，所以我们从官网研读它的引入也会对自定义的组件的引入和使用有大概的了解</font>

### 2. 使用
我们现在举个例子，我们要在我们之前的`welcome`的页面上使用`Lin UI`中的`avatar`自定义组件来替换我们原生的`image`组件，我们第一步就是要在`welcome.json`中去配置我们要在该页面使用的自定义组件：
```json
// pages/welcome/welcome.json
{
  "usingComponents": {
    "l-avatar": "/miniprogram_npm/lin-ui/avatar/index"
  }
}
```
可以看到，`l-avatar`是我们给自定义组件起的名字，可以随便起，<font color=#1E90FF>但是业界有统一的方式就是小程序当中的自定义组件需要前缀，在web中一般是首字母大写</font>，`/miniprogram_npm/lin-ui/avatar/index`是自定义组件的绝对路径。

配置之后就可以使用了，我们在页面中直接引用即可，当然自定义组件可以传很多属性，至于有哪些属性以及怎么使用，需要参照官方文档：
```html
<!--pages/welcome/welcome.wxml-->

<view class="container">
  <!-- 使用自定义组件 -->
  <l-avatar
    class="l-avatar"
    size="200"
    open-data="{{['userAvatarUrl','userNickName']}}" 
    placement="bottom"
  />
  <view class="journey-container">
    <text class="journey">开启小程序之旅</text>
  </view>
</view>
```

## 文章阅读界面
### 1. 新的编译模式
当我们开发比较多的页面的时候，有些页面并不是首页，我们希望在开发模式的时候针对某个页面进行具体的编译和显示，这个时候通常新手会在`app.json`当中把该页面对应的路径调整到`pages`数组的第一项，这样这个页面就成为了小程序的首页，编译和开发都比较方便，稍微开发久一点的人会在`app.json`当中通过设置`entryPagePath`来把当前开发页面设置为首页。

<font color=#DD1144>现在其实可以通过添加新的编译模式来默认编译你当前开发的页面，在开发者工具的上面，编译按钮的左边有个下拉菜单，其中普通编译就是以app.json当中pages数组的第一项为首页，但是下面还有添加新的编译模式，点击之后会自动列出你当前所以开发的页面，供你选择，默认的编译名称和编译页面的路径都是你当前开发页面的路径</font>

这样我们就很方便的通过添加新的编译模式来提高我们开发当前页面的效率。

### 2. swiper和swiper-item
关于`swiper`组件我们要说几个比较重要的点：

<font color=#1E90FF>**① 轮播图的大小设置**</font>

<font color=#DD1144>轮播图的大小设置主要是在swiper和image上，因为swiper是一个容器，而swiper-item实际上是和swiper保持一致大小的，所以我们需要将swiper和image设置成一样大小的，这样就能保证图片在容器当中正常的轮播</font>，比如下面代码所示：

```html
<!--pages/posts/posts.wxml-->
<view>
  <swiper>
    <swiper-item>
      <image src="/images/post/bl.png"></image>
    </swiper-item>
  </swiper>
</view>
```
```css
/* pages/posts/posts.wxss */
swiper { width: 100%; height: 460rpx; }

swiper image { width: 100%; height: 460rpx; }
```

<font color=#1E90FF>**② 属性设置（字符串和JS表达式的区别）**</font>

我们首先记住两条重要的规则：
+ <font color=#9400D3>属性设置当中字符串就是用双引号引起来的，比如`next-margin="10px"`，但是js表达式是双引号当中再使用双中括号包裹的，比如<code>auto-play="</code><code>{{</code><code>false</code><code>}}</code><code>"</code></font>
+ <font color=#9400D3>属性设置当中凡是以字符串类型给非字符值类型属性赋值的，都会发生隐式类型转换</font>

在组件当中的关于数字属性的设置好多人会发现这样一个问题：<font color=#1E90FF>`time="1000"`和`time="`<code>{{</code>`1000`<code>}}</code>`"`两者效果一样</font>：这就是因为第二条规则，字符串`"1000"`会默认转换成为数字类型的`1000`，所以两者效果都是一样的。

在组件当中的关于布尔属性的设置好多人会发现这样一个问题，<font color=#1E90FF>比如轮播图的自动播放的属性，设置成为auto-play="true"是有效的，设置成为auto-play="false"是无效的</font>，就是因为`"true"`依旧是字符串，只不过是非空的字符串，在隐士类型转换当中会变成布尔类型的`true`，而`"false"`也是非空的字符串，也会被转换成为布尔类型的`true`，所以这样设置无效。

```html
<!--pages/posts/posts.wxml-->
<swiper
  indicator-dots="{{false}}"
  autoplay="{{true}}"
/>
```
所以如果组件的属性是`boolean`类型的话，尽量按照我们上面代码的这样设置，无论是语义还是逻辑都不会出错。当然了也有的人喜欢偷懒，喜欢像下面这样的方式去设置布尔值，也可以，不过从规范的角度还是推荐上面的写法：
```html
<!--pages/posts/posts.wxml-->
<swiper
  indicator-dots=""
  autoplay
/>
```

### 3. flex布局思路
现在我们开发列表当中的一项的时候，我们使用`flex`布局的第一个重点：<font color=#DD1144>就是先考虑方向</font>，比如各部分在整体是垂直分布的，那实际上我们关注的重点就应该是每一行。

我们开发的时候，前端页面代码的书写顺序应该是<font color=#9400D3>骨架</font> -> <font color=#9400D3>元素</font> -> <font color=#9400D3>属性</font> -> <font color=#9400D3>数据</font> -> <font color=#9400D3>样式</font>

比如我们写列表的某一项的时候，因为是垂直布局，应该先这样写：
```html
  <view>
    <!-- 第一行元素 -->
    <view>
      <image src="/images/post/crab.png"></image>
      <text>Nov 18 2020</text>
    </view>
    <!-- 第二行元素 -->
    <text>2020LPL夏季季后赛观赛指南</text>
    <!-- 第三行元素 -->
    <image src="/images/post/sls.jpg"></image>
    <!-- 第四行元素 -->
    <text>老干爹获得了感觉</text>
    <!-- 第五行元素 -->
    <view>
      <image src="/images/icon/share-anti.png"></image>
      <text>92</text>
      <image src="/images/icon/chat.png"></image>
      <text>102</text>
    </view>
  </view>
```

<font color=#1E90FF>实际上，如果你按照这样方式去书写前端代码，你会发现你有了大局观的思维，代码写起来十分的顺畅和简单，<font color=#DD1144>真的没有必要一个个组件从0到1的挨个写，那样会很累，改变一下自己的写法会让自己进步很多</font></font>

然后我们细化代码：
```javascript
<view bind:tap="onTap" class="post-container">
  <view class="post-author-date">
    <image catch:tap="onMaxImage" class="post-author" src="{{res.avatar}}"></image>
    <text class="post-date">{{res.date}}</text>
  </view>
  <!-- {{item.postId}} -->

  <text class="post-title">{{res.title}}</text>

  <image class="post-image" src="{{res.imgSrc}}"></image>

  <text class="post-content">{{res.content}}</text>

  <view class="post-like">
    <!-- <image class="post-like-image" src="/images/icon/chat.png"></image> -->
    <l-icon class="post-like-image" color="#666" size="28" name="favor" />
    <text class="post-like-font">{{item.collection}}</text>
    <!-- <image class="post-like-image" src="/images/icon/view.png"></image> -->
    <l-icon class="post-like-image" color="#666" size="32" name="eye" />
    <text class="post-like-font">{{item.reading}}</text>

  </view>
</view>
```
最后将样式亮出：
```css
.post-container{
  display: flex;
  flex-direction: column;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
  background-color: #fff;
  border-top:1px solid #ededed;
  border-bottom:1px solid #ededed;
  padding-bottom: 10rpx;
}

.post-author-date{
  /* margin-top:10rpx;
  margin-bottom: 20rpx;
  margin-left: 10rpx; */
  margin: 10rpx 0 20rpx 10rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.post-author{
  width:60rpx;
  height:60rpx;
  /* vertical-align: middle; */
}

.post-date{
  margin-left:20rpx;
  font-size: 26rpx;
  /* vertical-align: middle; */
}

.post-title{
  font-size: 34rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  margin-left: 20rpx;
  color:#333;
}

.post-image{
  width: 100%;
  height:340rpx;
  margin-bottom: 30rpx;
}

.post-content{
  color: #666;
  font-size:28rpx;
  margin-bottom: 20rpx;
  margin-left:20rpx;
  line-height: 40rpx;
  letter-spacing: 2rpx;
}

.post-like{
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left:20rpx;
}

.post-like-image{
  /* height:32rpx;
  width:32rpx; */
  margin-right:16rpx;
}
/* html */
.post-like-font{
  margin-right: 40rpx;
  font-size:26rpx;
}
```
