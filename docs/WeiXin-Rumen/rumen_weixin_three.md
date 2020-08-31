# setData数据绑定

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