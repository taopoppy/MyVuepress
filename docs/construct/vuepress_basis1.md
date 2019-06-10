# 本地构建

## 构建项目
1. 首先需要的是我们要去下载git和node (这两个直接百度，下载都是无脑一路next的)
2. E盘创建blog文件夹，进入blog，打开命令行，全局安装vuepress: 
```
npm install -g vuepress
```
下载完毕可以通过vuepress -V来查看下载的版本号
3. 在blog文件夹中创建docs文件夹: 
```
mkdir docs
```
4. 写一个hello world的README文件: 
```
echo '#Hello World' > docs/README.md
```
5. 启动项目: 
```
vuepress dev
```
然后打开浏览器，输入提示的url即可看到最简单的blog了

## 配置文件
1. docs文件夹下面创建.vuepress: 
```
mkdir .vuepress
```
然后进入.vuepress文件夹
2. 在.vuepress文件夹下面创建config.js文件:
```
touch config.js
```
3. 回到blog文件夹下面去创建一个package.json文件：
```
npm init -y
```
4. 在config.js配置下面的代码：
```javascript
module.exports = {
  title: 'Hello VuePress',
  description: 'Just playing around'
}
```
5. 然后启动项目:
```
vuepress dev docs
```

## 首页的配置和markdown
1. 首页的配置是在docs下面的README.md，我们添加下面的代码
```
---
home: true
heroImage: /hero.png
actionText: 快速上手 →
actionLink: /zh/guide/
features:
- title: 简洁至上
  details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- title: Vue驱动
  details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
- title: 高性能
  details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
footer: MIT Licensed | Copyright © 2018-present Evan You
---
```
2. 首页的图片和meta图标
+ 进入.vuepress文件夹，创建public文件夹，将图片放在这个地方，注意要先将项目停止
+ 首页的图片在.vuepress/README.md中的heroImage配置，meta图标在。vuepress/config.js中head属性中配置

3. 导航栏的配置和介绍
+ 导航栏的配置在.vuepress/config.js中配置themeConfig对象
```typescript
themeConfig: {
  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/' },
    { text: 'External', link: 'https://google.com' },
  ]
}
```
+ 更详细的配置请查看样例和[官网](https://vuepress.vuejs.org/zh/)

4. 侧边栏的配置和介绍
+ 多个侧边栏:如果你想为不同的页面组来显示不同的侧边栏，首先，将你的页面文件组织成下述的目录结构：
```
.
├─ README.md
├─ contact.md
├─ about.md
├─ foo/
│  ├─ README.md
│  ├─ one.md
│  └─ two.md
└─ bar/
  ├─ README.md
  ├─ three.md
  └─ four.md
```
+ 接着，遵循以下的侧边栏配置：
```typescript
// .vuepress/config.js
module.exports = {
  themeConfig: {
    sidebar: {
      '/foo/': [
        '',     /* /foo/ */
        'one',  /* /foo/one.html */
        'two'   /* /foo/two.html */
      ],

      '/bar/': [
        '',      /* /bar/ */
        'three', /* /bar/three.html */
        'four'   /* /bar/four.html */
      ],

      // fallback
      '/': [
        '',        /* / */
        'contact', /* /contact.html */
        'about'    /* /about.html */
      ]
    }
  }
}
```

## 升价vuepress的版本
1. 使用命令来升级
```
yarn add vuepress@next
```

## 安装back-to-top插件
1. yarn add -D @vuepress/plugin-back-to-top@next
2. 在config.js文件中添加下面的代码:
```typescript
module.exports = {
  plugins: ['@vuepress/back-to-top'] 
}
```