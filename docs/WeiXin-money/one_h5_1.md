# 项目和架构设计

## 环境概述
我们使用的`node>8.9`，`vue2.6.6`,`@vue/cli3.0`，使用下面的命令去下载脚手架工具，检查脚手架工具，使用脚手架工具创建项目：
```javascript
npm install -g @vue/cli
vue --version
vue create imooc_pay_share
```

## Vue架构设计
架构设计包含很多东西，有<font color=#1E90FF>目录结构定义</font>、<font color=#1E90FF>公共函数编写</font>、<font color=#1E90FF>开发规范定义</font>、<font color=#1E90FF>环境设置</font>、<font color=#1E90FF>统一请求处理</font>、<font color=#1E90FF>错误机制</font>、<font color=#1E90FF>Loading机制</font>、<font color=#1E90FF>组件封装</font>等等，我们先来整一个简单的目录结构

<img :src="$withBase('/weixin_zhifu_2.png')" alt="">

具体的代码我们会在后续进行展示，我们这里展示环境变量的代码和工具的一些代码：
```javascript
// src/env/index.js
const envList = {
	env: {
		baseUrl: ''
	},
	test: {
		baseUrl: ''
	},
	prod: {
		domain: 'http://m.51purse.com',
		baseUrl: ''
	},
}

// 每次手工修改项目的环境变量
let currentEnv = 'prod'

// 根据当前浏览器环境动态设置环境变量
let params = {
	'dev-m.51purse.com': 'dev',
	'test-m.51purse.com': 'test',
	'm.51purse.com': 'prod',
}

// 根据浏览器当前域名选择环境变量
currentEnv = params[location.hostname]

export default envList[currentEnv]
```
```javascript
// src/util/index.js
/**
 * @author taopoppy
 * @description 公共函数定义
 */
export default {
	// 访问localhost:3000?a=1&b=2 getUrlParam('a')=1 getUrlParam('b')=2
	getUrlParam(name) {
		let reg = new RegExp('(^|&)' + name + '=([^&]*)')
		let r = window.location.search.substr(1).match(reg)
		if(r!=null){
			return decodeURIComponent(r[2])
		}
	}
}
```
```javascript
// main.js
/**
 * @author taopoppy
 * @description 项目入口执行文件
 */
import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios' // 帮助将axios挂载到vue上，每个页面通过this.axios请求
Vue.config.productionTip = false

// 请求拦截
axios.interceptors.request.use(function(){
  // 请求地址的处理（修改替换），请求loading的处理都可以在这里进行
})


// 响应拦截
axios.interceptors.response.use(
  function(response){// 请求响应的处理,请求成功了，但是请求结果出错
    let res = response.data
    if(res.code != 0) {
      // 统一处理
      alert(res.message)
    }
  },
  function(error){ // 网络请求发生错误,这样可以通过catch捕获到组件通过this.axios请求的异常
    return Promise.reject(error)
  }
)

Vue.use(VueAxios, axios)
new Vue({
  render: h => h(App),
}).$mount('#app')

```
架构设计还有很多，我们需要根据不同的项目的需求去做不同的配置。要随机应变。我们下面还会继续进行一些架构上的设计和开发。