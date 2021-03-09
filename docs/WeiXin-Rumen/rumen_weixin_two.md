# rpx响应式单位

## 创建项目准备
小程序创建页面有两个步骤：
+ <font color=#1E90FF>在pages当中创建一个页面名称的文件夹，比如index</font>
+ <font color=#1E90FF>右击index文件夹，然后选择<font color=#9400D3>新建Page</font>，然后再次输入index，则会自动帮你创建4种类型的文件，然后并自动在app.json的page属性中添加上页面路径</font>

当然小程序默认的第一个页面是`app.json`当中`pages`数组中的第一项，后续新创建的页面的路劲都默认添加到`pages`数组的最后一项，当然了这些很人性化的小程序自动操作都要在你的程序代码没有写错的前提下才会自动进行，而且小程序中的`app.json`中的`pages`数组只会自动添加，不会自动删除，如果删除掉某个页面，要自己去`app.json`的`pages`数组中删除对应的一项。


在学习之前我们还要将一个绝对路径和相对路径的问题，<font color=#9400D3>在小程序中一般绝对路径是以/开头的，因为/就代表根路径。相对路径是以./或者../开头的，因为路径是相对于你书写代码的这个文件为主的</font>，至于到底用相对路径还是绝对路径，建议哪个简单选哪个。

## rpx响应式单位的特点
<font color=#DD1144>rpx是小程序专门定制的一个可以响应当前机型屏幕分辨率和大小的自适应的像素单位，所以在小程序中自适应优先选择rpx</font>

那么很多小伙伴就会想知道`rpx`和`px`是什么关系，这里首先说一下一个比较重要的技巧，<font color=#1E90FF>在inpone6机型下，px和rpx是两倍的关系，即<font color=#DD1144>1px=2rpx</font>,其他机型px和rpx之间并不是两倍的关系，也就是说在不同的机型中，px和rpx的关系比例是不同的，这才能响应式和自适应的说法得以实现。所以通常设计师在设计图稿的时候以iphone6为机型会让程序员换算起来很方便</font>

### 1. 移动设备的分辨率
我们首先要来解决一个问题就是：<font color=#1E90FF>小程序在iphone6上只有375的像素，但是设计师通常给的都是750的设计稿</font>

我们先看移动设备的分辨率的表格：

<img :src="$withBase('/react_ssr_github_xiangsu.png')" alt="像素">

+ <font color=#9400D3>屏幕尺寸</font>：现实长度单位
+ <font color=#9400D3>分辨率(pt)</font>: 逻辑长度单位（逻辑分辨率），或者称视觉单位，和屏幕尺寸有关
+ <font color=#9400D3>分辨率(px)</font>：物理长度单位（物理分辨率），简称有多少个像素点，和屏幕尺寸无关
+ <font color=#9400D3>PPI</font>：表示每存有多少个像素点

<font color=#DD1144>比如一个图片是由很多的像素点组成的，但是像素点是不能说长度的，不能说一个点有多宽，多长，但是可以说在一段距离内有多少个像素点，这就是pt和px之间的关系，pt * reader = px，同样的3GS和4s,相同的大小，但是后者在相同的长度内包含的像素点更多，所以就显得更清楚，但是Reader越高，图片就越清楚么? 理论是这样，但是人眼的视网膜分辨率最多就是*2,所以从人眼的角度来看，图片不会变得更清楚</font>


这个时候我们就可以回答上面的问题：为什么小程序在iphone6上只有375的像素，但是设计师通常给的都是750的设计稿

<font color=#1E90FF>就是因为小程序给的是iphone6的逻辑分辨率，也就是pt，即350pt，350pt在iphone6上的reader是@2，换算成px也就是750px，所以设计师通常给的是物理分辨率，所以他要给750px的设计稿</font>

### 2. rpx精讲
但是在小程序当中，你会发现，如果你给一个图片设置750px的宽度，图片只能显示一半，这是因为<font color=#DD1144>小程序和web还不太一样，小程序当中的px都按pt算了，所以你写的750px相当于写的是750pt，而iphone才是375pt的宽，所以只显示了一半</font>

但是呢，无论是`pt`是是`px`，实际上在小程序当中都算作是定长，定长在不同的机型显示大小都一样，就做不到自适应的效果，所以此时`rpx`才出场。

使用`rpx`的好处就是，设计师给的750px设计稿，你在小程序使用`px`（实际在使用`pt`）,就要除以2，而`px`（实际上是`pt`）换算成`rpx`又要乘2，一来一回相当于没有变，所以可以得到结论：<font color=#9400D3>在iphone6之下，设计师给多大px，在小程序就写多大rpx，比例为1:1</font>

<font color=#1E90FF>使用rpx也并不是万能的，比如有些字的大写就不需要自适应，在机型小的上面字就特别小，在机型大的屏幕上字就特别大，这个就很奇怪</font>


## 起始页
<font color=#1E90FF>flex称为容器布局，它最大的特点就是通过在容器上编写css可以控制容器内部组件的布局方式</font>

文字居中有两种方式:
+ <font color=#DD1144>第一种就是文字的容器使用text-align：center使容器中的文字水平居中，文字本身使用line-height，值和容器高度保持一致，使文字在容器的水平居中</font>  
+ <font color=#DD1144>直接给文字的容器使用flex布局，display:flex;align-items: center;justify-content: center;</font>

最后要说的就是小程序内置的`button`极其不好用，建议自己编写`view`来自己实现，样式和点击事件都很好控制。

<font color=#DD1144>给小程序当前的页面添加背景色，需要给隐藏的page标签添加背景色，这个一点比较重要</font>

有了上面的知识，我们来写一个简单的起始页：
```html
<!-- welcome.wxml -->
<view class="container">
  <image class="avatar" src="/images/avatar/1.png" />
  <text class="motto">hello,taopopy</text>
  <view class="journey-container">
    <text class="journey">开启小程序之旅</text>
  </view>
</view>
```
```css
/* pages/welcome/welcome.wxss */

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 200rpx;
  height: 200rpx;
  margin-top: 160rpx;
}

.motto {
  margin-top: 100rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.journey-container {
  border: 1px solid #405f80; /* 一般边框不要写rpx */
  width: 200rpx;
  height: 80rpx;
  border-radius: 5px;
  text-align: center; /* 容器中的文字水平居中*/
  font-weight: bold;
  margin-top: 200rpx;
}

.journey {
  font-size: 22rpx;
  color: #405f80;
  line-height: 80rpx;/* 字体的行高设置和容器一样。则文字垂直居中*/
}

page {
  background-color: #b3d4db; /* 给整个页面添加背景色*/
}
```
