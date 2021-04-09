# 小程序公共机制

## 注册和介绍
小程序的注册有两种方式
+ <font color=#1E90FF>官网通过邮箱注册</font>
+ <font color=#1E90FF>通过公众号进行快速注册</font>

两种方式都可以，但是后者可以复用公众号的资质，尤其是可以省去在小程序进行认证的300元手续费。


## 公共机制
公共机制听起来很高大上，其实就是抛出业务后，给整个项目搭一个架子，无论是请求方式，还是目录结构，在小程序当中，我们关注的模块就是<font color=#9400D3>资源	</font>、<font color=#9400D3>环境变量</font>、<font color=#9400D3>网络请求</font>、<font color=#9400D3>工具</font>、<font color=#9400D3>路由</font>、<font color=#9400D3>存储</font>等等，所以我们首先的主要文件夹和文件的目录结构如下：
```javascript
+ assets // 资源模块
	+ images
	+ wxss
+ env    // 环境变量
	+ index.js
+ http   // 网络请求
	+ api.js
	+ request.js
+ pages // 小程序页面
+ utils
	+ routes.js // 路由模块
	+ store.js  // 存储模块
	+ util.js   // 工具模块
```
下面我们来展示一下这些主要模块文件当中的内容，以后的小程序也都可以按照这样的方式去开发：
```javascript
// env/index.js
module.exports = {
  // 开发环境
  Dev: {
    baseApi: "http://localhost:3000"
  },
  // 测试环境
  Test: {
    baseApi: "http://test-node.abcd.com"
  },
  // 预发布环境
  Slave: {
    baseApi: "http://slave-node.abcd.com"
  },
  // 线上环境
  Prod: {
    baseApi: "http://m.abcd.com/api"
  },
}
```
```javascript
// http/request.js
// 公共请求方法

let store = require('../utils/store.js')
let systemInfo = store.getSystemInfo()
const clientInfo = {
  "clientType": "mp",         // 客户端类型
  "appName": "imoocpay",      // app名称
  "model": systemInfo.model,  // 系统型号
  "os": systemInfo.system,    // 操作系统和版本
  "screen": systemInfo.screenWidth + "*" + systemInfo.screenHeight, // 屏幕的尺寸信息
  "version": App.version,     // 开发版本 
  "channel": "miniprogram"    // 通道信息
}

const errMsg = "服务异常，请稍后重试"

module.exports = {
  // 可以选择是否显示请求过程loading 和 请求成功和失败的提示toast
  // get方法：get('/index',{a:1},{loading:false,toast:true})
  fetch: (url, data={}, option={}) => {
    let { loading=true, toast=true, method='get'} = option
    return new Promise((resolve, reject) => {
      if(loading) {
        wx.showLoading({
          title: 'loading...',
          mask: true
        })
      }
      let baseUrl = App.config.baseApi
      wx.request({
        url: baseUrl + url,
        data,
        method,
        header: {
          clientInfo: JSON.stringify(clientInfo)
        },
        success: function(result){
          let res = result.data // {code: 0, data: message: xxx}
          if(res.code === 0) {
            if(loading) {
              wx.hideLoading()
            }
            resolve(res.data)
          } else {
            if(toast) {
              // 需要给用户报错的时候我们才报错
              // showToast显示的时候会自动关闭前一个loading，所以这里我们不需要先wx.hideLoading
              wx.showToast({
                title: res.message,
                icon: 'none',
                mask: true
              })
            } else {
              wx.hideLoading()
            }
            reject(res)
          }
        } ,
        fail:function(e={code:-1,msg:errMsg, errMsg}) {
          let msg = e.errMsg
          if(msg = 'request:fail timeout') {
            msg = "服务请求超时，请稍后处理"
          }
          wx.showToast({
            title: msg,
            icon: 'none'
          })
          reject(e)
        }
      })
    })
  }
}
```
关于请求模块的封装，我觉得还是很有必要的，尤其是在传入`loading`和`toast`参数是比较人性化的，比如一个页面在进入的时候，需要在`onload`当中发送请求，这个情况是不需要显示`toast`的，但是像加载一些列表数据的时候，可以显示`loading`。比如在用户操作，提交请求的时候，这个时候`loading`和`toast`都是有必要显示的，因为这个是处于交互的层面。

```javascript
//utils/route.js
const { parse } = require("path")

// 路由集中管理
const routePath = {
  "index": "/pages/index/index",
  "pay":"/pages/pay/index",
  "activity":"/pages/activity/index",
}

module.exports = {
  // 页面跳转
  // 使用方式
  push(path, option={}) {
    if(typeof path === 'string') {
      option.path = path
    } else {
      option = path
    }
    let url = routePath[option.path]
    let { query={}, openType, duration } = option
    let params = this.parse(query)
    if(params) {
      url += "?" + params
    }
    duration
    ? setTimeout(()=> { this.to(openType, url)}, duration)
    : this.to(openType, url)
  },
  // 页面跳转辅助函数to
  to(openType, url) {
    let obj = { url }
    if(openType === "redirect") {
      wx.redirectTo(obj)
    } else if(openType === 'reLaunch'){
      wx.reLaunch(obj)
    } else if(openType === 'back') {
      wx.navigateBack({delta: 1,})
    } else {
      wx.navigateTo(obj)
    }

  },
  // 页面跳转辅助函数parse
  parse(data) {
    let arr =[]
    for(let key in data) {
      arr.push(key + '=' + data[key])
    }
    return arr.join('&')
  }
}
```
路由模块我个人认为这样封装完全没有必要，没有必要按照`vue`路由跳转的习惯去封装小程序。

```javascript
// utils/store.js
// 小程序没有cookie，通过storage来进行存储管理
const STORAGE_KEY = "imooc-pay"
module.exports = {
  // 设置存储
  setItem(key, value, module_name) {
    if(module_name) {
      // 模块存储，比如 userinfo : { username: 'taopopy', userage: 25}
      let module_name_info = this.getItem(module_name)
      module_name_info[key] = value
      wx.setStorageSync(module_name, module_name_info)
    } else {
      // 非模块存储，比如 name : 'taopopy'
      wx.setStorageSync(key, value)
    }
  },
  // 获取存储
  getItem(key, module_name) {
    if(module_name) {
      let val = this.getItem(module_name)
      if(val) {
        return val[key]
      }
      return ''
    } else {
      return wx.getStorageSync(key)
    }
  },
  // 删除存储
  delelte(key,module_name) {
    if(module_name) {
      let module_name_info = this.getItem(module_name)
      if(module_name_info[key]) {
        delete module_name_info[key]
        wx.setStorageSync(module_name, module_name_info)
      }
    } else {
      wx.removeStorageSync(key)
    }
  },
  // 清空存储
  clear(key) {
    key? wx.removeStorageSync(key): wx.clearStorageSync()
  },
  // 获取系统信息
  getSystemInfo() {
    return wx.getSystemInfoSync
  }
}
```
存储模块的封装是非常有必要的，首先是因为没有`cookie`，其次是应该加入木块存储的概念，如果所有存储的东西都要以`key:value`的形式，那存储会很繁杂和难以维护。

```javascript
// app.js
// app.js
import Api from './http/api.js';
import request from './http/request.js';
import config from './env/index.js';
const env = 'Dev'                    // 可选的值有 Dev、Test、Slave、Prod

// 注意，只有页面才能通过const app = wx.getApp()的方式拿到App
// 所以普通的js文件要想获取只能通过全局变量App，所以这些信息直接通过App.xxx的方式挂载即可
App.version = "1.0.0",             // 定义开发版本
App.config = config[env]           // 根据不同的环境获取不同的配置
App.config.env = env               // 配置当中也加入环境的名称

App({
  config: config[env],             // 挂载不同环境的配置 
  Api:Api,                         // api信息全部挂载到app对象上
  get: request.fetch,              // get方法
  post: (url, data,option) => {    // post方法
    option.method = "post"
    return request.fetch(url, data,option)
  },
  onLaunch() {
    // 登录
    wx.login({
      success: res => {
        console.log("登录成功",res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
```
```javascript
// app.wxss
@import '/assets/wxss/common.wxss'
```

