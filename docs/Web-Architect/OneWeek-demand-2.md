# 技术架构分析

## 划分范围
划分范围是很重要的一步，因为复杂的产品是不太可能一个项目就可以搞的定的，<font color=#1E90FF>我们需要划分项目范围和功能服务</font>，至于功能服务是使用第三方的，还是自研的，还是放弃，那是技术评审时候的事情

+ <font color=#1E90FF>B端和编辑器，做前后端分离</font>
	+ <font color=#DD1144>biz-editor-fe</font>
	+	<font color=#DD1144>biz-editor-server</font>

+ <font color=#1E90FF>H5适合做SSR，因为要考虑到性能</font>
	+ <font color=#DD1144>H5-server</font>

+ <font color=#1E90FF>管理后台</font>
	+ <font color=#DD1144>admin-fe</font>
	+ <font color=#DD1144>admin-server</font>

+ <font color=#1E90FF>业务组件库</font>（文字，图片和图形）

要注意的就是：<font color=#1E90FF>服务端渲染一般不适用B端，适用于C端，给用户看的东西需要提高性能和速率，同时不能为了设计而设计</font>

因为在编辑器和H5发布的时候，文字图片等所有的东西都要保持一致，所以有必要将其抽离出来做成一个<font color=#9400D3>业务组件库</font>这样一个单独的项目，然后它会被引入到编辑器项目和H5项目当中去做组件的显示和渲染，相当于就是一个`npm`包，<font color=#1E90FF>这里也体现了复用的场景</font>

所以我们先大概分析上述这些项目之间的关系，它们都是利用的是同一个存储内容：

<img :src="$withBase('/web-projects_constract.png')" alt="">

## 自研统计服务
首先简单说一下<font color=#1E90FF>作品渠道统计</font>的这个需求的必要性，它是满足架构师闭环分析需求中的重要一步，所以不能砍掉这个需求。

如何实现？只能<font color=#DD1144>自定义事件统计</font>，<font color=#1E90FF>因为普通的pv/uv只能满足对域名级别的网址进行统计</font>，不能统计访问参数级别的渠道。第三方服务，比如友盟，百度统计，`arms`，要么不支持，要么收费很贵。

我们先简单的分析一下这个统计服务的流程；

<img :src="$withBase('/web_statistics_server.png')" alt="">

企业用户在通过B端编辑器完成作品的制作和发布后，作品URL会投放到不同的平台，不同的平台上面的作品URL是不同的，会在`Query`参数当中携带不同的值，所以当平台用户点击URL就会触发<font color=#1E90FF>埋点统计</font>，就会自动发送一些请求数据（包括`channal`，`time`等等）到统计服务，统计服务会提供<font color=#1E90FF>OpenAPI</font>，那么原来的企业用户在通过B端发布作品后，隔段时间就会通过统计服务提供的`OpenAPI`拿到统计数据，类似于你在`bilibili`发布一个视频，隔段时间就能看到自己有多少个赞，播放量，甚至B站每周会自动给你推送周统计，俗称周报。

至于上图中的`OpenAPI`实际就是普通的后端接口而已，之所以叫的这么高大上就是因为这个接口要给很多平台使用，B端的后台管理，还有`CMS`的后台管理，所以它比较开放，就叫做`OpenAPI`

所以综上所述，我们自研的这个自定义事件统计服务包括：
+ <font color=#9400D3>日志收集</font>
+ <font color=#9400D3>日志分析</font>
+ <font color=#9400D3>OpenAPI</font>

到目前为止，我们的在增加了统计服务之后，外加上我们后面要加进来的脚手架，我们各个项目之间的关系如下：

<img :src="$withBase('/web_project_contect_all.png')" alt="">

## 数据结构设计
按照编辑器的原型图，我们思考下面三个问题：
+ 在点击保存的时候，往数据端传递的数据结构是什么样子的？
+ 怎么保证画布和属性面板是同步更新的？
+ 在扩展一个图层面板，数据结构怎么设计？

<font color=#1E90FF>**① 我的答案**</font>

+ 我的第一个问题的答案是这样：既然是一个作品，首先是一个对象，包括id，作者，内容，时间等，然后内容因为是要渲染的，我认为应该是一个对象，每个属性都是不同的元素数组，数组是对应固定元素的对象，比如文字对象，有内容，字体大小，颜色，字体风格，定位等等，图片元素就有图片地址，大小，定位等等：
	```javascript
	project = {
		id: 'xx',
		user: 'yy',
		time: 'zz',
		content: {
			texts: [
				{ content: '11', size: '12px', color: 'red', style: 'songti', positon: { x: 12, y: 12 } },
				{ content: '12', size: '14px', color: 'green', style: 'songti', positon: { x: 72, y: 30 } }
			],
			images: [
				{ path: 'xxx/rrrr', size: { width: '33px', height: '30px' }, positon: { x: 65, y: 43} }
				{ path: 'xxx/rrrr', size: { width: '33px', height: '30px' }, positon: { x: 65, y: 43} }
			]
		}

	}
	```
+ 第二个问题画布和属性同步更新，应该要使用`vuex`进行保存状态，然后再变动的同时，刷新画布和属性面板
+ 第三个问题没有想出答案

<font color=#1E90FF>**② 讲师答案**</font>

+ <font color=#DD1144>node结构可以使用业界规范的vnode形式，巧用数组，数组可以排序</font>
+ <font color=#DD1144>画布和属性面板同步的关键是在选中画布里的元素的时候，同时也能用vuex表示当前选中的组件</font>
+ <font color=#DD1144>图层，应该是computed计算出来的索引，而不是具体的数据</font>

所以我们首先来看作品的数据结构：
```javascript
{
	work: {
		title: '作品标题',
		setting: { /* 一些可能的配置项，用不到先预留，体现出了扩展性*/},
		props: {/*页面body的一些设置，如背景色*/},
		components: [
			// components 使用数组，有序结构
			// 单个node要符合常见的vnode格式
			{
				id: "xxx",
				name: "文本1",
				tag: "text", // 元素的类型
				attrs: { fontsize: '20px'},
				children: [
					'文本1'// 文本内容，有时候放在children，有时候放在attrs或者props，没有标准，看实际情况确定
				]
			},
			{
				id: 'yyy',
				name: '图片1',
				tag: 'image',
				attrs: { src: 'xxx.png', width: '100px'},
				children: null
			}
		],
		activeComponentId: 'xxx'// 画布当前选中组件,通过这个属性可以选中当前组件，然后让选中组件属性和属性面板中的数据保持同步
	}
}
```
再来`vuex getter`：
```javascript
{
	layers() => {
		store.work.components.map(c=> {
			return {
				id: c.id,
				name: c.name
			}
		})
	}
}
```

## 数据流转关系
核心要点：B端，C端，管理后台，公用一个数据库
+ <font color=#1E90FF>创建作品</font>：<font color=#3eaf7c>初始化一个json数据</font>
+ <font color=#1E90FF>保存作品</font>：<font color=#3eaf7c>修改JSON数据</font>
+ <font color=#1E90FF>发布作品</font>：<font color=#3eaf7c>修改一个标记，仅此而已，比如published为true或者false</font>
+ <font color=#1E90FF>C端浏览作品</font>：<font color=#3eaf7c>获取JSON数据，SSR渲染页面</font>
+ <font color=#1E90FF>屏蔽作品</font>：<font color=#3eaf7c>修改一个标记，C端来判断，比如shield为true或者false</font>
+ <font color=#1E90FF>C端缓存</font>：<font color=#3eaf7c>防止频繁访问数据库</font>

<font color=#DD1144>注意：千万不要抠细节，做技术方案设计，为的就是寻找一个方向，论证它的可行性，扩展性，复杂度的高低</font>