# CSS 进阶篇

## 重绘回流

### 1. 回流
<font color=#9400D3>回流</font>又名<font color=#DD1144>重排</font>，<font color=#1E90FF>指几何属性需改变的渲染</font>。

可理解成，将整个网页填白，对内容重新渲染一次。只不过以人眼的感官速度去看浏览器回流是不会有任何变化的，若你拥有闪电侠的感官速度去看浏览器回流(实质是将时间调慢)，就会发现 <font color=#DD1144>每次回流都会将页面清空，再从左上角第一个像素点从左到右从上到下这样一点一点渲染，直至右下角最后一个像素点</font>。每次回流都会呈现该过程，只是感受不到而已。

渲染树的节点发生改变，影响了该节点的几何属性，导致该节点位置发生变化，此时就会触发浏览器回流并重新生成渲染树。回流意味着节点的几何属性改变，需重新计算并生成渲染树，导致渲染树的全部或部分发生变化。

### 2. 重绘
<font color=#9400D3>重绘</font>指更改外观属性而不影响几何属性的渲染。相比回流，重绘在两者中会温和一些，后续谈到的`CSS`性能优化就会基于该特点展开。

渲染树的节点发生改变，但是不影响该节点的几何属性。由此可见，<font color=#DD1144>回流对浏览器性能的消耗是高于重绘的，而且回流一定会伴随重绘，重绘却不一定伴随回流。</font>

为何回流一定会伴随重绘呢？整个节点的位置都变了，肯定要重新渲染它的外观属性啊！

<font color=#1E90FF>这里最好理解回流和重绘的例子就是回流是盖房子，重绘是装修房子，盖房子肯定消耗高于装修，而且盖完房子必定会装修，没有人会住毛坯房，但是装修不一定要盖房子，除非你装修坏了，无法弥补，然后你家有钱，把房子拆了又盖了一遍再重新装修。</font>

### 3. 性能优化
回流重绘在操作节点样式时频繁出现，同时也存在很大程度上的性能问题。这就就是我们不推荐经常操作`DOM`的理由，也是像`React`和`Vue`这种框架中虚拟`DOM`解决的问题之一。

回流成本比重绘成本高得多，一个节点的回流很有可能导致子节点、兄弟节点或祖先节点的回流。在一些高性能电脑上也许没有什么影响，但是回流发生在手机上(明摆说某些安卓手机)，就会减缓加载速度和增加电量消耗。

回流重绘其实与浏览器的事件循环有关，以下源自对HTML文档的理解。
+ 浏览器刷新频率为60Hz，即每16.6ms更新一次
+ 事件循环执行完成微任务
+ 判断`document`是否需更新
+ 判断`resize/scroll`事件是否存在，存在则触发事件
+ 判断`Media Query`是否触发
+ 更新动作并发送事件
+ 判断`document.isFullScreen`是否为`true`(全屏)
+ 执行`requestAnimationFrame`回调
+ 执行`IntersectionObserver`回调
+ 更新界面

上述就是浏览器每一帧中可能会做到的事情，若在一帧中有空闲时间，就会执行`requestIdleCallback`回调。


以下是对一些常用的几何属性和外观属性的分类：
+ <font color=#9400D3>几何属性</font>：包括布局、尺寸等可用数学几何衡量的属性
	+ <font color=#3eaf7c>布局</font>：display、float、position、list、table、flex、columns、grid
	+ <font color=#3eaf7c>尺寸</font>：margin、padding、border、width、height
+ <font color=#9400D3>外观属性</font>：包括界面、文字等可用状态向量描述的属性
	+ <font color=#3eaf7c>界面</font>：appearance、outline、background、mask、box-shadow、box-reflect、filter、opacity、clip
	+ <font color=#3eaf7c>文字</font>：text、font、word


以下是一些经常会引发性能问题的情况：
+ 改变窗口大小
+ 修改盒模型
+ 增删样式
+ 重构布局
+ 重设尺寸
+ 改变字体
+ 改动文字

我们针对上面这些情况，我们要做的有两点：<font color=#DD1144>尽量避免大量出现这些情况</font>和<font color=#DD1144>在不得不出现这些情况的时候采用一些性能优化的方法尽量减少性能损耗</font>,下面我们就列举一下优化方法：

<font color=#1E90FF>**① 使用transform代替top**</font>

`top`是几何属性，操作`top`会改变节点位置从而引发回流，使用`transform:translate3d(x,0,0)`代替`top`，只会引发图层重绘，还会间接启动GPU加速，该情况在之后会详细讲解。

<font color=#1E90FF>**② 使用visibility:hidden替换display:none**</font>

<font color=#1E90FF>**③ 避免使用Table布局**</font>

通常可用`ul`、`li`和`span`等标签取代`table`系列标签生成表格。

<font color=#1E90FF>**④ 避免样式节点层级过多**</font>

浏览器的`CSS`解析器解析`css`文件时，对CSS规则是从右到左匹配查找，样式层级过多会影响回流重绘效率，建议保持`CSS`规则在3层左右。

<font color=#1E90FF>**⑤ 将频繁回流或重绘的节点设置为图层**</font>

回流重绘生成的图层逐张合并并显示在屏幕上。可将其理解成`Photoshop`的图层，若不对图层添加关联，图层间是不会互相影响的。同理，在浏览器中设置频繁回流或重绘的节点为一张新图层，那么新图层就能够阻止节点的渲染行为影响别的节点，这张图层里怎样变化都无法影响到其他图层。

设置新图层有两种方法，将节点设置为`video`或`iframe`，为节点添加`will-change`。`will-change`是一个很叼的属性，后面再仔细讲。

<font color=#1E90FF>**⑥ 动态改变类名而不改变样式**</font>

要尝试每次操作`DOM`去改变节点样式，这样会频繁触发回流。

更好的方法是使用新的类名预定义节点样式，在执行逻辑操作时收集并确认最终更换的类名集合，在适合时机一次性动态替换原来的类名集合。有点像vue的依赖收集机制，不知这样描述会不会更容易理解。

这里举个例子：
```javascript
// 改变样式（不推荐）
document.getElementById("div").style.top = 100

// 改变类名
document.getElementById("div").classList.remove("show") // 移除ui这个类
document.getElementById("div").classList.add("hide")
```

<font color=#1E90FF>**⑦ 避免节点属性值放在循环里当成循环变量**</font>

<font color=#DD1144>每次循环操作DOM都会发生回流，应该在循环外使用变量保存一些不会变化的DOM映射值，你可能会疑惑像document.getElementById().style.top这种获取属性的代码也会操作回流，因为它属于操作DOM，而且为了获取精确结果，会在获取的时候回流一次再求结果</font>

```javascript
// 不推荐
for (let i = 0; i < 10000; i++) {
    const top = document.getElementById("css").style.top;
    console.log(top);
}

// 推荐
const top = document.getElementById("css").style.top;
for (let i = 0; i < 10000; i++) {
    console.log(top);
}
```

<font color=#1E90FF>**⑧ 使用requestAnimationFrame作为动画速度帧**</font>

动画速度越快，回流次数越多，上述有提到浏览器刷新频率为60Hz，即每16.6ms更新一次，而`requestAnimationFrame()`正是以16.6ms的速度更新一次。所以可用`requestAnimationFrame()`代替`setInterval()`。


### 4. 属性顺序
关于`css`属性书写的顺序实际上会多多少少影响到`css`性能，这里我们也不多啰嗦怎么自己注意写顺序，我们只会告诉你怎么<font color=#9400D3>一键自动排序</font>，<font color=#1E90FF>配置完成后，次保存时会自动格式化CSS代码</font>

在`VSCODE`当中下载好`Csscomb`插件之后，我们打开`文件 -> 首选项 -> 设置 -> 右上角的某个按钮（打开设置(json)）-> settings.json`，在这个`json`文件当中添加这个[网站](https://github.com/JowayYoung/idea-css/blob/master/vscode/settings.json)中的内容即可。


## 布局方式

## 函数计算

## 变量计算
