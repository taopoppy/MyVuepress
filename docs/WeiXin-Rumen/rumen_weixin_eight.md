# 自定义组件

## tabBar选项卡
小程序里面的选项卡是不需要自己编写的，有现有的组件供我们使用，[官网](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html#tabBar)有明确的说明。我们这里给出`app.json`的关于`tabBar`的代码：
```json
{
	"tabBar": {
    "borderStyle": "white",
    "selectedColor": "#333333",
    "position": "bottom",
    "color": "#999999",
    "list": [
      {
        "text": "阅读",
        "pagePath": "pages/posts/posts",
        "iconPath": "/images/tab/post.png",
        "selectedIconPath": "/images/tab/post@highlight.png"
      },
      {
        "text": "电影",
        "pagePath": "pages/movies/movies",
        "iconPath": "/images/tab/movie.png",
        "selectedIconPath": "/images/tab/movie@highlight.png"
      }
    ]
  },
}
```
上面每一个选项配置在官网都有详细的说明，要强调的一点就是：<font color=#DD1144>现在文章页面已经是属于tabBar中的页面之一，所以我们从首页跳转的话就不能再使用wx.redirectTo这个方法，这个方法不能跳转到属于tab类型的页面的，我们需要使用wx.switchTab()</font>
```javascript
wx.switchTab({
	url:"/pages/posts/posts" // 跳转到tabBar中的posts这个tab
})
```

## 自定义组件
### 1. 创建自定义组件
我们首先在项目的根目录下面创建`components`文件夹，作为所有自定义组件的存放地点，然后我们创建`components/post`文件夹，特别要注意：<font color=#1E90FF>此时我们要右键post，选择新建Component，输入index，敲回车</font>

这个是我们约定俗成的一种方式，因为是组件，所以我们统一都叫`index`，和我们之前新建页面有区别，大家要注意。<font color=#1E90FF>而且新建Component后生成的文件内容和新建Page后生成的文件内容有所不同</font>。

引入自定义组件是比较简单的，和我们之前只用`npm`下载的组件是一样的使用方法：
```json
{
  "usingComponents": {
      "l-icon":"/miniprogram_npm/lin-ui/icon/index",
      "post":"/components/post/index" // 使用方法
  },
}
```
### 2. 自定义组件的属性
在父组件当中使用自定义组件的时候，同样可以传递一些值过去，类似于`React`当中的`props`，和`React`一样的地方就是自定义组件的`properties`和`data`中的数据都可以做数据绑定。
```html
<post res="{{item}}"/>
```
那么在子组件当中可以拿到这个属性：
```javascript
// components/post/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
		// res的完整版写法
    res:{
			type: Object,
			value: { name: 'taopoppy' }
		}

		// res的简化版写法
		res: Object
  },
})
```
拿到之后就可以直接在`wxml`当中去显示即可：
```html
<text>{{res.name}}</text>
```
自定义组件属性还可以进行简化定义，和上面对比，这种简写形式是没有办法给自定义组件的`properties`赋予自定义的默认值的。默认值跟随类型，比如`Number`的默认值就是0，`String`的默认是就是空字符串。`Boolean`的默认值是`false`

### 3. 自定义组件的事件
父组件使用自定义组件，那么自定义组件触发的事件需要父组件监听到并且进行处理，我们来看：
```html
<view bind:tap="onTap" class="post-container">
</view>
```
子组件触发了点击事件`onTap`，然后到`js`当中去处理：

```javascript
// components/post/index.js
Component({
  /**
   * 自定义事件
   */
  methods: {
    onTap(event){
      const pid = this.properties.res.postId
      this.triggerEvent('posttap',{
        pid
      })
    },
  }
})
```
自定义组件通过`this.triggerEvent`向父组件触发`posttap`事件，并携带参数`{pid}`。

在父组件当中，首先要监听到`posttap`事件，然后使用自定义函数`onGoToDetail`去处理：
```html
<block>
	<post bind:posttap = "onGoToDetail" res="{{item}}"/>
</block>
```
在自定义函数`onGoToDetail`当中可以通过`detail`对象拿到自定义组件触发事件时候传递的参数。
```javascript
onGoToDetail(event){
    const pid = event.detail.pid
},
```

整个过程就是组件和组件通信的过程，在官网的[组件间通信与事件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/events.html#%E8%A7%A6%E5%8F%91%E4%BA%8B%E4%BB%B6)当中说的很清楚了。
