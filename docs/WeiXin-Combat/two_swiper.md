# 轮播图和组件

## 轮播图功能
首先我们要知道，其实轮播图的内容是图片，我们亮出`url`的地址，如下所以：
+ [https://github.com/xiecheng328/miniprogram/blob/master/assets/3-1_swiperImgUrls.json](https://github.com/xiecheng328/miniprogram/blob/master/assets/3-1_swiperImgUrls.json)

我们把地址放在`pages/playlist.js`当中的`data`当中：
```javascript
 data: {
    swiperImgUrls: [
      { url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg', },
      { url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg', },
      { url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg', }
    ],
  }
```


然后我们开始写轮播图的前端代码,我们在`playlist.wxml`和`playlist.wxss`中写下面的代码：
```html
<!--playlist.wxml-->
<swiper indicator-color="true" autoplay="true" interval="2000" duration="1000" >
  <block wx:for="{{swiperImgUrls}}">
    <swiper-item>
      <image src="{{item.url}}" mode="widthFix" class="img"></image>
    </swiper-item>
  </block>
</swiper>
```
```css
// playlist.wxss
.img {
  height: 100%;
  width: 100%;
}
```
其中我们要注意的三个点：
+ <font color=#3eaf7c>一般对于循环的组件我们在外层会使用block包装，然后把wx:for的代码写在block当中</font>
+ 关于图片`image`的`mode`属性很重要，一点要去官网看看。
+ 我们使用`mode`为`widthFix`和`image`宽高百分百填充`swiper-item`,这样能使图片在宽度充满的条件下自动补充高度，并保持宽高比

我们使用的`swiper`和`image`组件是在小程序官网上可以找到的，我们在这里给出`swiper`和`image`组件官网地址：
+ [https://developers.weixin.qq.com/miniprogram/dev/component/swiper.html](https://developers.weixin.qq.com/miniprogram/dev/component/swiper.html)
+ [https://developers.weixin.qq.com/miniprogram/dev/component/image.html](https://developers.weixin.qq.com/miniprogram/dev/component/image.html)

## 组件化开发
### 1. 组件化开发的定义
其实组件化并不是前端独有的，凡是涉及到`UI`层面的我们都会有组件开发这个思想，那么我们来给组件化开发一个明确的定义：
+ <font color=#3eaf7c>在用户界面开发领域，我们对面向用户的，独立的，可复用的交互元素进行封装</font>

### 2. 组件的结构
+ <font color=#3eaf7c>结构</font>： 在小程序中对应的就是`wxml`
+ <font color=#3eaf7c>样式</font>： 在小程序中对应的就是`wxss`
+ <font color=#3eaf7c>逻辑</font>： 在小程序中对应的就是`js`

### 3. 组件开发的意义
+ 组件化是对实现的分层，是更有效的代码组合方式
+ 组件化是对资源的重组和优化，从而使项目资源管理更合理
+ 组件化有利于单元测试
+ 组件对重构比较友好

### 4. 组件的设计原则
+ <font color=#3eaf7c>高内聚</font>： 组件设计中，可以归为一个单元的一段代码封装到一起，尽量满足一段代码主要解决一个需求
+ <font color=#3eaf7c>低耦合</font>： 组件和组件之间相对独立，不存在太多依赖关系
+ <font color=#3eaf7c>单一职责</font>： 组件尽量满足一个单一的功能
+ <font color=#3eaf7c>避免过多参数</font>：太多的参数会让开发者觉的比较麻烦和难用，而且如果不设置默认参数就会导致很多使用的问题